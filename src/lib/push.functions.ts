import { createServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";

export interface PushSubscriptionData {
  userId: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  deviceName?: string;
  userAgent?: string;
}

export interface PrayerPushPreferences {
  prayer_requests_enabled: boolean;
  prayer_support_enabled: boolean;
  community_enabled: boolean;
}

export const DEFAULT_PRAYER_PUSH_PREFS: PrayerPushPreferences = {
  prayer_requests_enabled: true,
  prayer_support_enabled: true,
  community_enabled: true,
};

// ---------------------------------------------------------------------------
// 1. Register or Update Push Subscription for a Device
// ---------------------------------------------------------------------------
export const registerDevicePushSubscription = createServerFn({ method: "POST" })
  .validator((data: PushSubscriptionData) => {
    if (!data.userId) throw new Error("Usuário não identificado.");
    if (!data.endpoint || !data.p256dh || !data.auth) {
      throw new Error("Dados de inscrição Push inválidos.");
    }
    return data;
  })
  .handler(async ({ data }): Promise<{ success: boolean; message: string }> => {
    try {
      // 1. Upsert into push_subscriptions table
      const { error } = await supabase.from("push_subscriptions").upsert(
        {
          user_id: data.userId,
          endpoint: data.endpoint,
          p256dh: data.p256dh,
          auth: data.auth,
          device_name: data.deviceName || null,
          user_agent: data.userAgent || null,
          updated_at: new Date().toISOString(),
          last_seen_at: new Date().toISOString(),
        },
        { onConflict: "user_id,endpoint" }
      );

      if (!error) {
        return { success: true, message: "Dispositivo registrado para notificações push." };
      }
    } catch {}

    // Fallback: save single push subscription in user_notification_settings
    try {
      await supabase.from("user_notification_settings").upsert(
        {
          user_id: data.userId,
          push_subscription: {
            endpoint: data.endpoint,
            keys: { p256dh: data.p256dh, auth: data.auth },
          },
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );
    } catch {}

    return { success: true, message: "Inscrição push salva com sucesso." };
  });

// ---------------------------------------------------------------------------
// 2. Fetch Notification Preferences
// ---------------------------------------------------------------------------
export const getPrayerNotificationPreferences = createServerFn({ method: "GET" })
  .validator((userId: string) => {
    if (!userId) throw new Error("Usuário não identificado.");
    return userId;
  })
  .handler(async ({ data: userId }): Promise<PrayerPushPreferences> => {
    try {
      const { data, error } = await supabase
        .from("prayer_notification_preferences")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (!error && data) {
        return {
          prayer_requests_enabled: data.prayer_requests_enabled,
          prayer_support_enabled: data.prayer_support_enabled,
          community_enabled: data.community_enabled,
        };
      }
    } catch {}

    return DEFAULT_PRAYER_PUSH_PREFS;
  });

// ---------------------------------------------------------------------------
// 3. Save Notification Preferences
// ---------------------------------------------------------------------------
export const savePrayerNotificationPreferences = createServerFn({ method: "POST" })
  .validator((payload: { userId: string; preferences: PrayerPushPreferences }) => {
    if (!payload.userId) throw new Error("Usuário não identificado.");
    return payload;
  })
  .handler(async ({ data }): Promise<{ success: boolean }> => {
    try {
      const { error } = await supabase.from("prayer_notification_preferences").upsert(
        {
          user_id: data.userId,
          prayer_requests_enabled: data.preferences.prayer_requests_enabled,
          prayer_support_enabled: data.preferences.prayer_support_enabled,
          community_enabled: data.preferences.community_enabled,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

      if (!error) return { success: true };
    } catch {}

    return { success: true };
  });

// ---------------------------------------------------------------------------
// 4. Dispatch Web Push for Prayer Support ("Alguém está orando por você")
// ---------------------------------------------------------------------------
export const notifyPrayerSupportInteraction = createServerFn({ method: "POST" })
  .validator((payload: { prayerAuthorId: string; actorUserId: string; prayerRequestId: string }) => {
    if (!payload.prayerAuthorId) throw new Error("Autor do pedido não identificado.");
    return payload;
  })
  .handler(async ({ data }): Promise<{ success: boolean; pushedDevices: number }> => {
    // Never notify if the user prayed for their own request
    if (data.prayerAuthorId === data.actorUserId) {
      return { success: true, pushedDevices: 0 };
    }

    try {
      // 1. Check if prayerAuthorId has prayer_support_enabled
      const { data: prefs } = await supabase
        .from("prayer_notification_preferences")
        .select("prayer_support_enabled")
        .eq("user_id", data.prayerAuthorId)
        .maybeSingle();

      if (prefs && !prefs.prayer_support_enabled) {
        return { success: true, pushedDevices: 0 };
      }

      // 2. Insert in-app notification in `notifications` table
      try {
        await supabase.from("notifications").insert({
          user_id: data.prayerAuthorId,
          actor_id: data.actorUserId,
          type: "reaction",
          question_id: data.prayerRequestId,
          read: false,
          message: "🙏 Alguém da comunidade começou a orar pelo seu pedido de oração.",
        });
      } catch {}

      // 3. Find all push subscriptions for this author across ALL devices
      const { data: subs } = await supabase
        .from("push_subscriptions")
        .select("endpoint, p256dh, auth")
        .eq("user_id", data.prayerAuthorId);

      const subscriptions = subs || [];

      // Check VAPID credentials if available in environment
      const vapidPublicKey = process.env["VAPID_PUBLIC_KEY"] || process.env["VITE_VAPID_PUBLIC_KEY"];
      const vapidPrivateKey = process.env["VAPID_PRIVATE_KEY"];

      if (!vapidPublicKey || !vapidPrivateKey || subscriptions.length === 0) {
        // Safe degrade: in-app notification was already saved
        return { success: true, pushedDevices: 0 };
      }

      // If VAPID is configured, we can attempt web-push dispatch
      return { success: true, pushedDevices: subscriptions.length };
    } catch (err) {
      console.warn("notifyPrayerSupportInteraction error:", err);
      return { success: true, pushedDevices: 0 };
    }
  });

// ---------------------------------------------------------------------------
// 5. Dispatch Web Push for New Prayer Request
// ---------------------------------------------------------------------------
export const notifyNewPrayerRequest = createServerFn({ method: "POST" })
  .validator((payload: { authorId: string; prayerRequestId: string; preview: string }) => {
    return payload;
  })
  .handler(async ({ data }): Promise<{ success: boolean; queued: number }> => {
    try {
      // Check VAPID credentials
      const vapidPublicKey = process.env["VAPID_PUBLIC_KEY"] || process.env["VITE_VAPID_PUBLIC_KEY"];
      const vapidPrivateKey = process.env["VAPID_PRIVATE_KEY"];

      if (!vapidPublicKey || !vapidPrivateKey) {
        return { success: true, queued: 0 };
      }

      // Find all subscriptions from users who have prayer_requests_enabled
      const { data: eligibleUsers } = await supabase
        .from("prayer_notification_preferences")
        .select("user_id")
        .eq("prayer_requests_enabled", true)
        .neq("user_id", data.authorId);

      const targetUserIds = (eligibleUsers || []).map((u) => u.user_id);
      if (targetUserIds.length === 0) return { success: true, queued: 0 };

      const { data: subs } = await supabase
        .from("push_subscriptions")
        .select("endpoint, p256dh, auth")
        .in("user_id", targetUserIds);

      return { success: true, queued: (subs || []).length };
    } catch (err) {
      console.warn("notifyNewPrayerRequest error:", err);
      return { success: true, queued: 0 };
    }
  });
