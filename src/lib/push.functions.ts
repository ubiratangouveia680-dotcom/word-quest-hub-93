import { createServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { createClient } from "@supabase/supabase-js";
import webPush from "web-push";
import { getDailyRef } from "@/lib/daily-verse";

export interface PushSubscriptionData {
  userId?: string | null;
  deviceId?: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  deviceName?: string;
  userAgent?: string;
  prayerNotificationsEnabled?: boolean;
  dailyVerseNotificationsEnabled?: boolean;
}

export interface PrayerPushPreferences {
  prayer_requests_enabled: boolean;
  prayer_support_enabled: boolean;
  community_enabled: boolean;
  enabled: boolean; // Alias conveniente para compatibilidade
}

export const DEFAULT_PRAYER_PUSH_PREFS: PrayerPushPreferences = {
  prayer_requests_enabled: true,
  prayer_support_enabled: true,
  community_enabled: true,
  enabled: true,
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
    if (!data.endpoint || !data.p256dh || !data.auth) {
      throw new Error("Dados de inscrição Push inválidos.");
    }
    return data;
  })
  .handler(async ({ data }): Promise<{ success: boolean; message: string }> => {
    const now = new Date().toISOString();
    const prayerEnabled = data.prayerNotificationsEnabled ?? true;
    const verseEnabled = data.dailyVerseNotificationsEnabled ?? true;
    const deviceId = data.deviceId || "dev_" + data.endpoint.slice(-16);

    // 1. Tenta gravar na tabela dedicada push_subscriptions (se existir)
    try {
      const { error } = await supabase.from("push_subscriptions").upsert(
        {
          user_id: data.userId || null,
          endpoint: data.endpoint,
          p256dh: data.p256dh,
          auth: data.auth,
          device_name: data.deviceName || null,
          user_agent: data.userAgent || null,
          updated_at: now,
          last_seen_at: now,
        },
        { onConflict: "endpoint" }
      );

      if (!error) {
        return { success: true, message: "Dispositivo registrado para notificações push." };
      }
    } catch {}

    // 2. Fallback resiliente no banco Supabase (tabela questions com title: [SYSTEM_PUSH] ...)
    try {
      const endpointHash = data.endpoint.slice(-32);
      const title = `[SYSTEM_PUSH] ${endpointHash}`;

      // Procura se já existe registro com este endpoint para preservar preferências
      const { data: existingRows } = await supabase
        .from("questions")
        .select("id, body")
        .eq("title", title)
        .limit(1);

      let existingPayload: any = {};
      if (existingRows && existingRows.length > 0) {
        try {
          existingPayload = JSON.parse(existingRows[0].body);
        } catch {}
      }

      const payload = {
        userId: data.userId || existingPayload.userId || null,
        deviceId: deviceId || existingPayload.deviceId,
        endpoint: data.endpoint,
        p256dh: data.p256dh,
        auth: data.auth,
        deviceName: data.deviceName || existingPayload.deviceName || "Navegador Web",
        userAgent: data.userAgent || existingPayload.userAgent || null,
        prayerNotificationsEnabled:
          data.prayerNotificationsEnabled !== undefined
            ? data.prayerNotificationsEnabled
            : existingPayload.prayerNotificationsEnabled !== undefined
            ? existingPayload.prayerNotificationsEnabled
            : prayerEnabled,
        dailyVerseNotificationsEnabled:
          data.dailyVerseNotificationsEnabled !== undefined
            ? data.dailyVerseNotificationsEnabled
            : existingPayload.dailyVerseNotificationsEnabled !== undefined
            ? existingPayload.dailyVerseNotificationsEnabled
            : verseEnabled,
        enabled: true,
        updatedAt: now,
      };

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
          user_id: (data.userId && data.userId.includes("-")) ? data.userId : "1e481484-0dec-45d9-ae8f-c97549615b99",
          category_id: "geral",
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
// 2. Fetch Device & User Notification Status
// ---------------------------------------------------------------------------
export const getDeviceNotificationStatus = createServerFn({ method: "GET" })
  .validator((input: { endpoint?: string; deviceId?: string; userId?: string }) => input || {})
  .handler(async ({ data }): Promise<{
    hasSubscription: boolean;
    prayerNotificationsEnabled: boolean;
    dailyVerseNotificationsEnabled: boolean;
  }> => {
    let prayerEnabled = true;
    let verseEnabled = true;
    let found = false;

    // 1. Consulta por endpoint se fornecido
    if (data.endpoint) {
      try {
        const endpointHash = data.endpoint.slice(-32);
        const title = `[SYSTEM_PUSH] ${endpointHash}`;

        const { data: rows } = await supabase
          .from("questions")
          .select("body")
          .eq("title", title)
          .limit(1);

        if (rows && rows.length > 0) {
          const parsed = JSON.parse(rows[0].body);
          found = true;
          if (parsed.prayerNotificationsEnabled !== undefined) {
            prayerEnabled = Boolean(parsed.prayerNotificationsEnabled);
          } else if (parsed.prayer_requests_enabled !== undefined) {
            prayerEnabled = Boolean(parsed.prayer_requests_enabled);
          }
          if (parsed.dailyVerseNotificationsEnabled !== undefined) {
            verseEnabled = Boolean(parsed.dailyVerseNotificationsEnabled);
          }
        }
      } catch {}
    }

    // 2. Se não achou por endpoint, tenta por deviceId ou userId
    if (!found && (data.deviceId || data.userId)) {
      try {
        let query = supabase.from("questions").select("body").like("title", "[SYSTEM_PUSH]%");
        if (data.deviceId) {
          query = query.ilike("body", `%"deviceId":"${data.deviceId}"%`);
        } else if (data.userId) {
          query = query.ilike("body", `%"userId":"${data.userId}"%`);
        }

        const { data: rows } = await query.limit(1);
        if (rows && rows.length > 0) {
          const parsed = JSON.parse(rows[0].body);
          found = true;
          if (parsed.prayerNotificationsEnabled !== undefined) {
            prayerEnabled = Boolean(parsed.prayerNotificationsEnabled);
          }
          if (parsed.dailyVerseNotificationsEnabled !== undefined) {
            verseEnabled = Boolean(parsed.dailyVerseNotificationsEnabled);
          }
        }
      } catch {}
    }

    return {
      hasSubscription: found,
      prayerNotificationsEnabled: prayerEnabled,
      dailyVerseNotificationsEnabled: verseEnabled,
    };
  });

// ---------------------------------------------------------------------------
// 3. Update Device Notification Preferences
// ---------------------------------------------------------------------------
export const updateDevicePushPreferences = createServerFn({ method: "POST" })
  .validator((payload: {
    endpoint?: string;
    deviceId?: string;
    userId?: string;
    prayerEnabled?: boolean;
    verseEnabled?: boolean;
  }) => payload)
  .handler(async ({ data }): Promise<{ success: boolean }> => {
    const now = new Date().toISOString();

    try {
      let rowsToUpdate: { id: string; body: string }[] = [];

      if (data.endpoint) {
        const endpointHash = data.endpoint.slice(-32);
        const { data: rows } = await supabase
          .from("questions")
          .select("id, body")
          .eq("title", `[SYSTEM_PUSH] ${endpointHash}`);
        if (rows) rowsToUpdate = rows;
      } else if (data.deviceId) {
        const { data: rows } = await supabase
          .from("questions")
          .select("id, body")
          .like("title", "[SYSTEM_PUSH]%")
          .ilike("body", `%"deviceId":"${data.deviceId}"%`);
        if (rows) rowsToUpdate = rows;
      } else if (data.userId) {
        const { data: rows } = await supabase
          .from("questions")
          .select("id, body")
          .like("title", "[SYSTEM_PUSH]%")
          .ilike("body", `%"userId":"${data.userId}"%`);
        if (rows) rowsToUpdate = rows;
      }

      for (const r of rowsToUpdate) {
        try {
          const parsed = JSON.parse(r.body);
          if (data.prayerEnabled !== undefined) {
            parsed.prayerNotificationsEnabled = data.prayerEnabled;
            parsed.prayer_requests_enabled = data.prayerEnabled;
          }
          if (data.verseEnabled !== undefined) {
            parsed.dailyVerseNotificationsEnabled = data.verseEnabled;
          }
          if (data.userId) {
            parsed.userId = data.userId;
          }
          parsed.updatedAt = now;

          await supabase
            .from("questions")
            .update({ body: JSON.stringify(parsed), updated_at: now })
            .eq("id", r.id);
        } catch {}
      }

      return { success: true };
    } catch (err) {
      console.warn("updateDevicePushPreferences error:", err);
      return { success: false };
    }
  });

// ---------------------------------------------------------------------------
// 4. Fetch Prayer Notification Preferences (Legacy & Auth Support)
// ---------------------------------------------------------------------------
export const getPrayerNotificationPreferences = createServerFn({ method: "GET" })
  .validator((input: any) => {
    const userId = typeof input === "string" ? input : input?.userId || input?.data?.userId;
    return userId || "";
  })
  .handler(async ({ data: userId }): Promise<PrayerPushPreferences> => {
    if (!userId) return DEFAULT_PRAYER_PUSH_PREFS;

    try {
      const { data: rows } = await supabase
        .from("questions")
        .select("body")
        .like("title", "[SYSTEM_PUSH]%")
        .ilike("body", `%"userId":"${userId}"%`)
        .limit(1);

      if (rows && rows.length > 0) {
        const parsed = JSON.parse(rows[0].body);
        const isEnabled =
          parsed.prayerNotificationsEnabled !== undefined
            ? parsed.prayerNotificationsEnabled
            : parsed.prayer_requests_enabled !== undefined
            ? parsed.prayer_requests_enabled
            : true;

        return {
          prayer_requests_enabled: isEnabled,
          prayer_support_enabled: true,
          community_enabled: true,
          enabled: isEnabled,
        };
      }
    } catch {}

    return DEFAULT_PRAYER_PUSH_PREFS;
  });

// ---------------------------------------------------------------------------
// 5. Save Prayer Notification Preferences
// ---------------------------------------------------------------------------
export const savePrayerNotificationPreferences = createServerFn({ method: "POST" })
  .validator((payload: any) => {
    const userId = payload?.userId || payload?.data?.userId;
    const isEnabled =
      payload?.preferences?.prayer_requests_enabled ??
      payload?.enabled ??
      payload?.data?.enabled ??
      payload?.data?.preferences?.prayer_requests_enabled ??
      true;
    return { userId, enabled: isEnabled };
  })
  .handler(async ({ data }): Promise<{ success: boolean }> => {
    if (!data.userId) return { success: true };

    try {
      const { data: rows } = await supabase
        .from("questions")
        .select("id, body")
        .like("title", "[SYSTEM_PUSH]%")
        .ilike("body", `%"userId":"${data.userId}"%`);

      if (rows && rows.length > 0) {
        for (const r of rows) {
          try {
            const parsed = JSON.parse(r.body);
            parsed.prayerNotificationsEnabled = data.enabled;
            parsed.prayer_requests_enabled = data.enabled;
            parsed.enabled = data.enabled;
            parsed.updatedAt = new Date().toISOString();
            await supabase.from("questions").update({ body: JSON.stringify(parsed) }).eq("id", r.id);
          } catch {}
        }
      }
    } catch {}

    return { success: true };
  });

// ---------------------------------------------------------------------------
// 6. Remove Invalid/Expired Subscription (HTTP 410 / 404)
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
      .eq("title", `[SYSTEM_PUSH] ${endpointHash}`);
  } catch {}
}

// ---------------------------------------------------------------------------
// 7. Send Direct Test Web Push for Prayer Requests
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
          tag: "test-prayer-push-" + Date.now(),
          icon: "/icon-192.png",
          badge: "/favicon.png",
        })
      );
      return { success: true, message: "Notificação de teste enviada com sucesso ao seu aparelho!" };
    } catch (err: any) {
      console.warn("sendTestPushToDevice failed:", err);
      if (err.statusCode === 410 || err.statusCode === 404) {
        await removeInvalidSubscription(data.endpoint);
      }
      return { success: false, message: "Falha ao emitir Web Push: " + (err.message || String(err)) };
    }
  });

// ---------------------------------------------------------------------------
// 8. Send Direct Test Web Push for Daily Verse
// ---------------------------------------------------------------------------
export const sendTestVersePushToDevice = createServerFn({ method: "POST" })
  .validator((data: { endpoint: string; p256dh: string; auth: string }) => data)
  .handler(async ({ data }): Promise<{ success: boolean; message: string }> => {
    initWebPush();
    try {
      const verse = getDailyRef();
      await webPush.sendNotification(
        {
          endpoint: data.endpoint,
          keys: { p256dh: data.p256dh, auth: data.auth },
        },
        JSON.stringify({
          title: "📖 Versículo do Dia",
          body: `"${verse.text}"\n\n— ${verse.bookName} ${verse.chapter}:${verse.verse}`,
          url: "/versiculo-do-dia",
          tag: "test-verse-push-" + Date.now(),
          icon: "/icon-192.png",
          badge: "/favicon.png",
        })
      );
      return { success: true, message: "Versículo do Dia de teste enviado com sucesso ao seu aparelho!" };
    } catch (err: any) {
      console.warn("sendTestVersePushToDevice failed:", err);
      if (err.statusCode === 410 || err.statusCode === 404) {
        await removeInvalidSubscription(data.endpoint);
      }
      return { success: false, message: "Falha ao emitir Web Push: " + (err.message || String(err)) };
    }
  });

// ---------------------------------------------------------------------------
// 9. Dispatch Web Push for New Prayer Request
// ---------------------------------------------------------------------------
// 9. Dispatch Web Push for New Prayer Request
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

    console.log("[PRAYER] Novo pedido criado");
    console.log("[PRAYER] ID do pedido:", data.prayerRequestId);
    console.log("[PRAYER] Autor:", data.authorId);

    const subscriptions: { endpoint: string; p256dh: string; auth: string; userId?: string }[] = [];
    const seenEndpoints = new Set<string>();

    console.log("[PUSH] Procurando subscriptions...");

    // 1. Coleta inscrições da tabela dedicada push_subscriptions (se existir)
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

    // 2. Coleta inscrições do fallback resiliente em questions (title: [SYSTEM_PUSH] ...)
    try {
      const { data: qRows, error: qError } = await supabase
        .from("questions")
        .select("id, body, user_id")
        .like("title", "[SYSTEM_PUSH]%");

      if (!qError && qRows && Array.isArray(qRows)) {
        for (const r of qRows) {
          try {
            const p = JSON.parse(r.body);
            // Regra crucial: NUNCA notificar o próprio autor do pedido
            if (p.userId && p.userId === data.authorId) continue;
            // Verifica se as notificações de oração estão ativadas para este dispositivo
            if (p.prayerNotificationsEnabled === false || p.prayer_requests_enabled === false || p.enabled === false) {
              continue;
            }
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

    console.log("[PUSH] Subscriptions encontradas:", subscriptions.length);

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
          console.log("[PUSH] Enviando para usuário:", sub.userId || "dispositivo_web");
          console.log("[PUSH] Endpoint:", sub.endpoint.slice(0, 45) + "...");
          await webPush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth },
            },
            pushPayload
          );
          console.log("[PUSH] Resultado do envio: SUCCESS");
          dispatchedCount++;
        } catch (pushErr: any) {
          console.warn("[PUSH] ERRO:", pushErr.message || pushErr);
          if (pushErr.statusCode === 410 || pushErr.statusCode === 404) {
            await removeInvalidSubscription(sub.endpoint);
          }
        }
      })
    );

    return { success: true, pushedDevices: dispatchedCount };
  });

function getAuthenticatedClient(accessToken?: string) {
  if (!accessToken) return supabase;
  const url = process.env["SUPABASE_URL"] || "https://nuhbvfbdvzgopoiyyivd.supabase.co";
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"] || "sb_publishable_Zgl_ywSofomOkLX7O1bv9g_OS_nT9Qm";
  return createClient(url, key, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}

// ---------------------------------------------------------------------------
// 9.1 Test Internal Notification Generator (Sininho 🔔)
// ---------------------------------------------------------------------------
export const createTestInternalNotification = createServerFn({ method: "POST" })
  .validator((payload: { userId: string; prayerRequestId?: string; accessToken?: string }) => payload)
  .handler(async ({ data }) => {
    if (!data.userId) throw new Error("Usuário não identificado.");

    try {
      console.log("[NOTIFICATION] Criando notificação interna de teste para:", data.userId);
      const client = getAuthenticatedClient(data.accessToken);
      const { error } = await client.from("notifications").insert({
        user_id: data.userId,
        actor_id: data.userId,
        type: "reaction",
        question_id: data.prayerRequestId || "461ab5b2-9c40-418d-9a05-52ac209e0b14",
        read: false,
        message: "🙏 Teste do Sininho: Uma nova oração foi compartilhada na comunidade da Bíblia Online.",
      });

      if (error) {
        console.warn("[NOTIFICATION] Erro ao criar notificação de teste:", error.message);
        return { success: false, message: error.message };
      }

      return { success: true, message: "Notificação interna de teste enviada para o sininho com sucesso!" };
    } catch (err: any) {
      console.warn("[NOTIFICATION] Falha ao emitir notificação de teste:", err);
      return { success: false, message: err.message || "Erro desconhecido" };
    }
  });

// ---------------------------------------------------------------------------
// 10. Dispatch Scheduled Web Push for Daily Verse
// ---------------------------------------------------------------------------
export const dispatchDailyVersePush = createServerFn({ method: "POST" })
  .validator((options?: { force?: boolean }) => options || {})
  .handler(async ({ data: options }): Promise<{ success: boolean; pushedDevices: number }> => {
    initWebPush();

    const subscriptions: { endpoint: string; p256dh: string; auth: string }[] = [];
    const seenEndpoints = new Set<string>();

    // 1. Coleta inscrições da tabela dedicada (se existir)
    try {
      const { data: subs } = await supabase.from("push_subscriptions").select("endpoint, p256dh, auth");
      if (subs && Array.isArray(subs)) {
        for (const s of subs) {
          if (!seenEndpoints.has(s.endpoint)) {
            seenEndpoints.add(s.endpoint);
            subscriptions.push(s);
          }
        }
      }
    } catch {}

    // 2. Coleta inscrições do fallback resiliente em questions (title: [SYSTEM_PUSH] ...)
    try {
      const { data: qRows } = await supabase
        .from("questions")
        .select("body")
        .like("title", "[SYSTEM_PUSH]%");

      if (qRows && Array.isArray(qRows)) {
        for (const r of qRows) {
          try {
            const p = JSON.parse(r.body);
            // Verifica se notificações de versículo estão ativadas
            if (p.dailyVerseNotificationsEnabled === false) continue;
            if (p.endpoint && p.p256dh && p.auth && !seenEndpoints.has(p.endpoint)) {
              seenEndpoints.add(p.endpoint);
              subscriptions.push({ endpoint: p.endpoint, p256dh: p.p256dh, auth: p.auth });
            }
          } catch {}
        }
      }
    } catch {}

    if (subscriptions.length === 0) {
      return { success: true, pushedDevices: 0 };
    }

    const verse = getDailyRef();
    const todayStr = new Date().toISOString().split("T")[0];

    const pushPayload = JSON.stringify({
      title: "📖 Versículo do Dia",
      body: `"${verse.text}"\n\n— ${verse.bookName} ${verse.chapter}:${verse.verse}`,
      url: "/versiculo-do-dia",
      tag: `daily-verse-${todayStr}`,
      icon: "/icon-192.png",
      badge: "/favicon.png",
    });

    let dispatchedCount = 0;

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
          if (pushErr.statusCode === 410 || pushErr.statusCode === 404) {
            await removeInvalidSubscription(sub.endpoint);
          }
        }
      })
    );

    return { success: true, pushedDevices: dispatchedCount };
  });

// ---------------------------------------------------------------------------
// 11. Dispatch Web Push for Prayer Support Interaction
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
          .like("title", "[SYSTEM_PUSH]%")
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
