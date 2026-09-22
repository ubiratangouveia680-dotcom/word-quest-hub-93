import { createServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import webPush from "web-push";

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

const DEFAULT_VAPID_PUBLIC_KEY =
  "BKQkj46iitINvDwByjEQKRru75VRlsgjLM9E-NXRVIVRmxBawgKpy2AocERQJoOaJlcPubdRHEj3c4pFSZbDPsM";
const DEFAULT_VAPID_PRIVATE_KEY = "69oE36umZ9r725DeBqdxFqxrrIOvcF-heJOSKLDj9CA";
const VAPID_SUBJECT = "mailto:contato@bibliaonlineoficial.com.br";

function initWebPush() {
  const publicKey =
    process.env["VAPID_PUBLIC_KEY"] ||
    process.env["VITE_VAPID_PUBLIC_KEY"] ||
    DEFAULT_VAPID_PUBLIC_KEY;
  const privateKey =
    process.env["VAPID_PRIVATE_KEY"] || DEFAULT_VAPID_PRIVATE_KEY;
  try {
    webPush.setVapidDetails(VAPID_SUBJECT, publicKey, privateKey);
  } catch (e) {
    console.warn("Failed to set VAPID details:", e);
  }
}

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
    const now = new Date().toISOString();

    // 1. Tenta gravar na tabela dedicada push_subscriptions
    try {
      const { error } = await supabase.from("push_subscriptions").upsert(
        {
          user_id: data.userId,
          endpoint: data.endpoint,
          p256dh: data.p256dh,
          auth: data.auth,
          device_name: data.deviceName || null,
          user_agent: data.userAgent || null,
          updated_at: now,
          last_seen_at: now,
        },
        { onConflict: "user_id,endpoint" }
      );

      if (!error) {
        return { success: true, message: "Dispositivo registrado para notificações push." };
      }
    } catch {}

    // 2. Fallback resiliente no banco Supabase (tabela questions com category_id: system_push)
    try {
      const endpointHash = data.endpoint.slice(-32);
      const title = `[SYSTEM_PUSH] ${endpointHash}`;

      const payload = {
        userId: data.userId,
        endpoint: data.endpoint,
        p256dh: data.p256dh,
        auth: data.auth,
        deviceName: data.deviceName || "Navegador Web",
        userAgent: data.userAgent || null,
        enabled: true,
        updatedAt: now,
      };

      // Procura se já existe registro com este endpoint
      const { data: existingRows } = await supabase
        .from("questions")
        .select("id")
        .eq("category_id", "system_push")
        .eq("title", title)
        .limit(1);

      if (existingRows && existingRows.length > 0) {
        await supabase
          .from("questions")
          .update({
            body: JSON.stringify(payload),
            updated_at: now,
          })
          .eq("id", existingRows[0].id);
      } else {
        await supabase.from("questions").insert({
          user_id: data.userId.includes("-") ? data.userId : "1e481484-0dec-45d9-ae8f-c97549615b99",
          category_id: "system_push",
          title,
          body: JSON.stringify(payload),
        });
      }
    } catch (err) {
      console.warn("registerDevicePushSubscription fallback warning:", err);
    }

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

    // Fallback: busca preferência salva no payload de system_push
    try {
      const { data: rows } = await supabase
        .from("questions")
        .select("body")
        .eq("category_id", "system_push")
        .ilike("body", `%"userId":"${userId}"%`)
        .limit(1);

      if (rows && rows.length > 0) {
        const parsed = JSON.parse(rows[0].body);
        if (parsed.prayer_requests_enabled !== undefined) {
          return {
            prayer_requests_enabled: parsed.prayer_requests_enabled,
            prayer_support_enabled: true,
            community_enabled: true,
          };
        }
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

    // Fallback de preferência: atualiza nas inscrições do usuário
    try {
      const { data: rows } = await supabase
        .from("questions")
        .select("id, body")
        .eq("category_id", "system_push")
        .ilike("body", `%"userId":"${data.userId}"%`);

      if (rows && rows.length > 0) {
        for (const r of rows) {
          try {
            const parsed = JSON.parse(r.body);
            parsed.prayer_requests_enabled = data.preferences.prayer_requests_enabled;
            parsed.enabled = data.preferences.prayer_requests_enabled;
            await supabase.from("questions").update({ body: JSON.stringify(parsed) }).eq("id", r.id);
          } catch {}
        }
      }
    } catch {}

    return { success: true };
  });

// ---------------------------------------------------------------------------
// 4. Remove Invalid/Expired Subscription (HTTP 410 / 404)
// ---------------------------------------------------------------------------
async function removeInvalidSubscription(endpoint: string) {
  try {
    await supabase.from("push_subscriptions").delete().eq("endpoint", endpoint);
  } catch {}

  try {
    const endpointHash = endpoint.slice(-32);
    await supabase
      .from("questions")
      .delete()
      .eq("category_id", "system_push")
      .eq("title", `[SYSTEM_PUSH] ${endpointHash}`);
  } catch {}
}

// ---------------------------------------------------------------------------
// 5. Send Direct Test Web Push to Current Device
// ---------------------------------------------------------------------------
export const sendTestPushToDevice = createServerFn({ method: "POST" })
  .validator((data: { endpoint: string; p256dh: string; auth: string }) => data)
  .handler(async ({ data }): Promise<{ success: boolean; message: string }> => {
    initWebPush();
    try {
      await webPush.sendNotification(
        {
          endpoint: data.endpoint,
          keys: { p256dh: data.p256dh, auth: data.auth },
        },
        JSON.stringify({
          title: "🙏 Teste de Notificação Push",
          body: "Seu aparelho está pronto para receber avisos de novos pedidos de oração!",
          url: "/comunidade/pedidos-de-oracao",
          tag: "test-push-" + Date.now(),
        })
      );
      return { success: true, message: "Notificação de teste enviada com sucesso ao seu aparelho!" };
    } catch (err: any) {
      console.warn("sendTestPushToDevice failed:", err);
      return { success: false, message: "Falha ao emitir Web Push: " + (err.message || String(err)) };
    }
  });

// ---------------------------------------------------------------------------
// 6. Dispatch Web Push for New Prayer Request
// ---------------------------------------------------------------------------
export const notifyNewPrayerRequest = createServerFn({ method: "POST" })
  .validator(
    (payload: {
      authorId: string;
      authorName?: string;
      prayerRequestId: string;
      content: string;
    }) => payload
  )
  .handler(async ({ data }): Promise<{ success: boolean; pushedDevices: number }> => {
    initWebPush();

    const subscriptions: { endpoint: string; p256dh: string; auth: string; userId: string }[] = [];
    const seenEndpoints = new Set<string>();

    // 1. Coleta inscrições da tabela dedicada push_subscriptions
    try {
      const { data: subs, error: subError } = await supabase
        .from("push_subscriptions")
        .select("endpoint, p256dh, auth, user_id")
        .neq("user_id", data.authorId);

      if (!subError && subs && Array.isArray(subs)) {
        for (const s of subs) {
          if (!seenEndpoints.has(s.endpoint)) {
            seenEndpoints.add(s.endpoint);
            subscriptions.push({
              endpoint: s.endpoint,
              p256dh: s.p256dh,
              auth: s.auth,
              userId: s.user_id,
            });
          }
        }
      }
    } catch {}

    // 2. Coleta inscrições do fallback resiliente em questions (category: system_push)
    try {
      const { data: qRows, error: qError } = await supabase
        .from("questions")
        .select("id, body, user_id")
        .eq("category_id", "system_push")
        .neq("user_id", data.authorId);

      if (!qError && qRows && Array.isArray(qRows)) {
        for (const r of qRows) {
          try {
            const p = JSON.parse(r.body);
            if (p.userId === data.authorId) continue;
            if (p.enabled === false || p.prayer_requests_enabled === false) continue;
            if (p.endpoint && p.p256dh && p.auth && !seenEndpoints.has(p.endpoint)) {
              seenEndpoints.add(p.endpoint);
              subscriptions.push({
                endpoint: p.endpoint,
                p256dh: p.p256dh,
                auth: p.auth,
                userId: p.userId,
              });
            }
          } catch {}
        }
      }
    } catch {}

    if (subscriptions.length === 0) {
      return { success: true, pushedDevices: 0 };
    }

    // 3. Monta o payload respeitando a privacidade (prévia curta)
    const authorDisplayName = data.authorName && data.authorName.trim() ? data.authorName.trim() : "Alguém da comunidade";
    const cleanBody = data.content.replace(/\s+/g, " ").trim();
    const shortPreview = cleanBody.length > 75 ? cleanBody.slice(0, 75).trim() + "..." : cleanBody;

    const pushPayload = JSON.stringify({
      title: "🙏 Novo pedido de oração",
      body: `${authorDisplayName} publicou um novo pedido de oração:\n"${shortPreview}"`,
      url: `/comunidade/pedidos-de-oracao#prayer-${data.prayerRequestId}`,
      tag: `prayer-req-${data.prayerRequestId}`,
      icon: "/icon-192.png",
      badge: "/favicon.png",
    });

    let dispatchedCount = 0;

    // 4. Envia para cada dispositivo autorizado em paralelo
    await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await webPush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth },
            },
            pushPayload
          );
          dispatchedCount++;
        } catch (pushErr: any) {
          // Se a subscription expirou ou foi revogada (410 Gone ou 404 Not Found), remove automaticamente
          if (pushErr.statusCode === 410 || pushErr.statusCode === 404) {
            await removeInvalidSubscription(sub.endpoint);
          }
        }
      })
    );

    return { success: true, pushedDevices: dispatchedCount };
  });

// ---------------------------------------------------------------------------
// 7. Dispatch Web Push for Prayer Support ("Alguém está orando por você")
// ---------------------------------------------------------------------------
export const notifyPrayerSupportInteraction = createServerFn({ method: "POST" })
  .validator((payload: { prayerAuthorId: string; actorUserId: string; prayerRequestId: string }) => {
    if (!payload.prayerAuthorId) throw new Error("Autor do pedido não identificado.");
    return payload;
  })
  .handler(async ({ data }): Promise<{ success: boolean; pushedDevices: number }> => {
    if (data.prayerAuthorId === data.actorUserId) {
      return { success: true, pushedDevices: 0 };
    }

    initWebPush();

    try {
      // 1. Salva notificação in-app
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

      // 2. Busca inscrições do autor
      const subscriptions: { endpoint: string; p256dh: string; auth: string }[] = [];
      const seen = new Set<string>();

      try {
        const { data: subs } = await supabase
          .from("push_subscriptions")
          .select("endpoint, p256dh, auth")
          .eq("user_id", data.prayerAuthorId);

        (subs || []).forEach((s) => {
          if (!seen.has(s.endpoint)) {
            seen.add(s.endpoint);
            subscriptions.push(s);
          }
        });
      } catch {}

      try {
        const { data: qRows } = await supabase
          .from("questions")
          .select("body")
          .eq("category_id", "system_push")
          .ilike("body", `%"userId":"${data.prayerAuthorId}"%`);

        (qRows || []).forEach((r) => {
          try {
            const p = JSON.parse(r.body);
            if (p.endpoint && p.p256dh && p.auth && !seen.has(p.endpoint)) {
              seen.add(p.endpoint);
              subscriptions.push({ endpoint: p.endpoint, p256dh: p.p256dh, auth: p.auth });
            }
          } catch {}
        });
      } catch {}

      if (subscriptions.length === 0) {
        return { success: true, pushedDevices: 0 };
      }

      const pushPayload = JSON.stringify({
        title: "🙏 Irmão em oração",
        body: "Alguém da comunidade começou a orar pelo seu pedido neste momento.",
        url: `/comunidade/pedidos-de-oracao#prayer-${data.prayerRequestId}`,
        tag: `prayer-support-${data.prayerRequestId}`,
        icon: "/icon-192.png",
        badge: "/favicon.png",
      });

      let dispatched = 0;
      await Promise.allSettled(
        subscriptions.map(async (s) => {
          try {
            await webPush.sendNotification(
              {
                endpoint: s.endpoint,
                keys: { p256dh: s.p256dh, auth: s.auth },
              },
              pushPayload
            );
            dispatched++;
          } catch (err: any) {
            if (err.statusCode === 410 || err.statusCode === 404) {
              await removeInvalidSubscription(s.endpoint);
            }
          }
        })
      );

      return { success: true, pushedDevices: dispatched };
    } catch (err) {
      console.warn("notifyPrayerSupportInteraction error:", err);
      return { success: true, pushedDevices: 0 };
    }
  });
