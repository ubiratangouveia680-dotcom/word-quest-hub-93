import {
  registerDevicePushSubscription,
  getDeviceNotificationStatus,
  updateDevicePushPreferences,
  savePrayerNotificationPreferences,
  sendTestPushToDevice,
  sendTestVersePushToDevice,
} from "@/lib/push.functions";
import { supabase } from "@/integrations/supabase/client";

export const DEFAULT_VAPID_PUBLIC_KEY =
  "BKQkj46iitINvDwByjEQKRru75VRlsgjLM9E-NXRVIVRmxBawgKpy2AocERQJoOaJlcPubdRHEj3c4pFSZbDPsM";

export function getVapidPublicKey(): string {
  if (typeof window !== "undefined") {
    return (
      (import.meta as any).env?.VITE_VAPID_PUBLIC_KEY ||
      (import.meta as any).env?.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
      DEFAULT_VAPID_PUBLIC_KEY
    );
  }
  return DEFAULT_VAPID_PUBLIC_KEY;
}

/**
 * Retorna um identificador estável para este navegador/dispositivo
 */
export function getDeviceId(): string {
  if (typeof window === "undefined") return "server_device";
  try {
    let id = localStorage.getItem("bo:device_id");
    if (!id) {
      id = "dev_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now().toString(36);
      localStorage.setItem("bo:device_id", id);
    }
    return id;
  } catch {
    return "dev_fallback";
  }
}

/**
 * Converte chave pública VAPID base64url para Uint8Array exigida pelo PushManager
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function isWebPushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof navigator !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export function getPushPermission(): NotificationPermission | "unsupported" {
  if (!isWebPushSupported()) return "unsupported";
  try {
    return Notification.permission;
  } catch {
    return "unsupported";
  }
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isWebPushSupported()) return "denied";
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted" && "serviceWorker" in navigator) {
      await navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});
    }
    return permission;
  } catch {
    return "denied";
  }
}

export const isPushNotificationSupported = isWebPushSupported;
export const getNotificationPermission = getPushPermission;

// ---------------------------------------------------------------------------
// Armazenamento Local Instantâneo para UI (Sem flickering no reload)
// ---------------------------------------------------------------------------
export function getStoredPrayerPushState(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const val = localStorage.getItem("bo:prayer_push_enabled");
    if (val === null) return true; // Default ativado
    return val === "true";
  } catch {
    return true;
  }
}

export function setStoredPrayerPushState(enabled: boolean): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("bo:prayer_push_enabled", enabled ? "true" : "false");
  } catch {}
}

export function getStoredVersePushState(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const val = localStorage.getItem("bo:verse_push_enabled");
    if (val === null) return true; // Default ativado
    return val === "true";
  } catch {
    return true;
  }
}

export function setStoredVersePushState(enabled: boolean): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("bo:verse_push_enabled", enabled ? "true" : "false");
  } catch {}
}

/**
 * Obtém a inscrição push ativa no navegador atual
 */
export async function getActivePushSubscription(): Promise<PushSubscription | null> {
  if (!isWebPushSupported()) return null;
  try {
    const reg = await navigator.serviceWorker.ready;
    return await reg.pushManager.getSubscription();
  } catch (err) {
    console.warn("Erro ao buscar PushSubscription ativa:", err);
    return null;
  }
}

/**
 * Garante uma sessão de autenticação válida para salvar dados no Supabase com RLS.
 * Se o usuário já estiver autenticado na conta, usa a sessão dele.
 * Se for um visitante, utiliza ou cria uma conta de participante autenticada no Supabase.
 */
async function ensureAuthenticatedSession(): Promise<string | null> {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData?.session?.user?.id) {
      return sessionData.session.user.id;
    }

    let guestSeed = typeof window !== "undefined" ? localStorage.getItem("bo:guest_auth_seed") : null;
    if (!guestSeed) {
      guestSeed = Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
      if (typeof window !== "undefined") localStorage.setItem("bo:guest_auth_seed", guestSeed);
    }

    const guestEmail = `guest_${guestSeed}@bibliaonline.internal`;
    const guestPass = `PushPass123!${guestSeed}`;

    const signInRes = await supabase.auth.signInWithPassword({ email: guestEmail, password: guestPass });
    if (signInRes.data?.user?.id) {
      return signInRes.data.user.id;
    }

    const signUpRes = await supabase.auth.signUp({ email: guestEmail, password: guestPass });
    if (signUpRes.data?.user?.id) {
      return signUpRes.data.user.id;
    }
  } catch (err) {
    console.warn("[PUSH] Falha ao autenticar sessão local:", err);
  }
  return null;
}

/**
 * Inscreve o dispositivo atual e sincroniza preferências no backend (Pedidos de Oração e/ou Versículo do Dia)
 */
export async function subscribeToDevicePush(options?: {
  userId?: string;
  prayerEnabled?: boolean;
  verseEnabled?: boolean;
}): Promise<{ success: boolean; message: string }> {
  if (!isWebPushSupported()) {
    return { success: false, message: "Este navegador ou dispositivo não possui suporte a Web Push Notifications." };
  }

  try {
    // 1. Solicita permissão se ainda não foi concedida
    let permission = Notification.permission;
    if (permission !== "granted") {
      permission = await Notification.requestPermission();
    }

    if (permission !== "granted") {
      return {
        success: false,
        message: "Permissão de notificações não concedida. Por favor, habilite nas configurações do seu navegador.",
      };
    }

    // 2. Garante registro do Service Worker
    await navigator.serviceWorker.register("/sw.js", { scope: "/" });
    const reg = await navigator.serviceWorker.ready;

    // 3. Obtém ou cria a PushSubscription com a chave VAPID oficial
    const vapidKey = getVapidPublicKey();
    const convertedVapidKey = urlBase64ToUint8Array(vapidKey);

    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey as any,
      });
    }

    const subJson = sub.toJSON();
    if (!subJson.endpoint || !subJson.keys?.["p256dh"] || !subJson.keys?.["auth"]) {
      return { success: false, message: "Falha ao gerar credenciais da inscrição Push." };
    }

    // 4. Identifica o dispositivo
    const deviceId = getDeviceId();
    const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "";
    let deviceName = "Navegador Web";
    if (/Android/i.test(userAgent)) deviceName = "Dispositivo Android";
    else if (/Windows/i.test(userAgent)) deviceName = "PC Windows";
    else if (/Macintosh|Mac OS/i.test(userAgent)) deviceName = "Computador Mac";
    else if (/iPhone|iPad/i.test(userAgent)) deviceName = "Dispositivo Apple";

    const prayerVal = options?.prayerEnabled ?? getStoredPrayerPushState();
    const verseVal = options?.verseEnabled ?? getStoredVersePushState();

    // 5. Garante autenticação para gravar no Supabase com conformidade RLS (auth.uid() = user_id)
    const effectiveUserId = (await ensureAuthenticatedSession()) || options?.userId || null;
    const endpointHash = subJson.endpoint.slice(-32);
    const title = `[SYSTEM_PUSH] ${endpointHash}`;

    const payload = {
      userId: effectiveUserId,
      deviceId,
      endpoint: subJson.endpoint,
      p256dh: subJson.keys["p256dh"],
      auth: subJson.keys["auth"],
      deviceName,
      userAgent,
      prayerNotificationsEnabled: prayerVal,
      dailyVerseNotificationsEnabled: verseVal,
      enabled: true,
      updatedAt: new Date().toISOString(),
    };

    // 6. Gravação direta no Supabase com a sessão ativa
    try {
      const { data: existingRows } = await supabase
        .from("questions")
        .select("id")
        .eq("title", title)
        .limit(1);

      if (existingRows && existingRows.length > 0) {
        await supabase
          .from("questions")
          .update({
            body: JSON.stringify(payload),
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingRows[0]?.id ?? "");
        console.log("[PUSH] Subscrição atualizada no Supabase com sucesso:", title);
      } else if (effectiveUserId) {
        await supabase.from("questions").insert({
          user_id: effectiveUserId,
          category_id: "geral",
          title,
          body: JSON.stringify(payload),
        });
        console.log("[PUSH] Subscrição inserida no Supabase com sucesso:", title);
      }
    } catch (saveErr) {
      console.warn("[PUSH] Erro ao gravar subscrição no cliente:", saveErr);
    }

    // 7. Notifica também a server function
    await registerDevicePushSubscription({
      data: {
        userId: effectiveUserId,
        deviceId,
        endpoint: subJson.endpoint,
        p256dh: subJson.keys["p256dh"],
        auth: subJson.keys["auth"],
        deviceName,
        userAgent,
        prayerNotificationsEnabled: prayerVal,
        dailyVerseNotificationsEnabled: verseVal,
      },
    }).catch(() => {});

    // 8. Atualiza caches locais
    setStoredPrayerPushState(prayerVal);
    setStoredVersePushState(verseVal);

    return {
      success: true,
      message: "Dispositivo registrado com sucesso para receber notificações!",
    };
  } catch (err: any) {
    console.error("subscribeToDevicePush error:", err);
    return {
      success: false,
      message: err?.message || "Erro inesperado ao registrar para notificações push.",
    };
  }
}

/**
 * Ativa notificações de pedidos de oração
 */
export async function subscribeToPrayerPush(userId?: string): Promise<{ success: boolean; message: string }> {
  setStoredPrayerPushState(true);
  return subscribeToDevicePush({ ...(userId ? { userId } : {}), prayerEnabled: true });
}

/**
 * Desativa notificações de pedidos de oração para este dispositivo
 */
export async function unsubscribeFromPrayerPush(userId?: string): Promise<{ success: boolean; message: string }> {
  try {
    setStoredPrayerPushState(false);
    const sub = await getActivePushSubscription();
    const deviceId = getDeviceId();

    if (sub?.endpoint) {
      const endpointHash = sub.endpoint.slice(-32);
      try {
        const { data: rows } = await supabase
          .from("questions")
          .select("id, body")
          .eq("title", `[SYSTEM_PUSH] ${endpointHash}`)
          .limit(1);

        if (rows && rows.length > 0) {
          const parsed = JSON.parse(rows[0]?.body ?? "{}");
          parsed.prayerNotificationsEnabled = false;
          parsed.updatedAt = new Date().toISOString();
          await supabase.from("questions").update({ body: JSON.stringify(parsed) }).eq("id", rows[0]?.id ?? "");
        }
      } catch {}
    }

    await updateDevicePushPreferences({
      data: {
        deviceId,
        ...(sub?.endpoint ? { endpoint: sub.endpoint } : {}),
        ...(userId ? { userId } : {}),
        prayerEnabled: false,
      },
    }).catch(() => {});

    if (userId) {
      await savePrayerNotificationPreferences({
        data: { userId, enabled: false },
      }).catch(() => {});
    }

    return {
      success: true,
      message: "Notificações de pedidos de oração desativadas para este aparelho.",
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || "Erro ao desativar notificações.",
    };
  }
}

/**
 * Ativa notificações do versículo do dia
 */
export async function subscribeToVersePush(userId?: string): Promise<{ success: boolean; message: string }> {
  setStoredVersePushState(true);
  return subscribeToDevicePush({ ...(userId ? { userId } : {}), verseEnabled: true });
}

/**
 * Desativa notificações do versículo do dia para este dispositivo
 */
export async function unsubscribeFromVersePush(userId?: string): Promise<{ success: boolean; message: string }> {
  try {
    setStoredVersePushState(false);
    const sub = await getActivePushSubscription();
    const deviceId = getDeviceId();

    if (sub?.endpoint) {
      const endpointHash = sub.endpoint.slice(-32);
      try {
        const { data: rows } = await supabase
          .from("questions")
          .select("id, body")
          .eq("title", `[SYSTEM_PUSH] ${endpointHash}`)
          .limit(1);

        if (rows && rows.length > 0) {
          const parsed = JSON.parse(rows[0]?.body ?? "{}");
          parsed.dailyVerseNotificationsEnabled = false;
          parsed.updatedAt = new Date().toISOString();
          await supabase.from("questions").update({ body: JSON.stringify(parsed) }).eq("id", rows[0]?.id ?? "");
        }
      } catch {}
    }

    await updateDevicePushPreferences({
      data: {
        deviceId,
        ...(sub?.endpoint ? { endpoint: sub.endpoint } : {}),
        ...(userId ? { userId } : {}),
        verseEnabled: false,
      },
    }).catch(() => {});

    return {
      success: true,
      message: "Notificações do Versículo do Dia desativadas para este aparelho.",
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || "Erro ao desativar notificações.",
    };
  }
}

/**
 * Consulta o status sincronizado das notificações (Pedidos e Versículo)
 */
export async function checkDeviceNotificationStatus(userId?: string): Promise<{
  hasSubscription: boolean;
  prayerNotificationsEnabled: boolean;
  dailyVerseNotificationsEnabled: boolean;
}> {
  try {
    const sub = await getActivePushSubscription();
    const deviceId = getDeviceId();

    const res = await getDeviceNotificationStatus({
      data: {
        deviceId,
        ...(sub?.endpoint ? { endpoint: sub.endpoint } : {}),
        ...(userId ? { userId } : {}),
      },
    });

    if (res.hasSubscription) {
      setStoredPrayerPushState(res.prayerNotificationsEnabled);
      setStoredVersePushState(res.dailyVerseNotificationsEnabled);
    }

    return res;
  } catch {
    return {
      hasSubscription: false,
      prayerNotificationsEnabled: getStoredPrayerPushState(),
      dailyVerseNotificationsEnabled: getStoredVersePushState(),
    };
  }
}

/**
 * Dispara notificação de teste de Pedidos de Oração
 */
export async function testPrayerPush(userId?: string): Promise<{ success: boolean; message: string }> {
  if (!isWebPushSupported()) {
    return { success: false, message: "Web Push não suportado neste navegador." };
  }

  try {
    let sub = await getActivePushSubscription();
    if (!sub) {
      const subRes = await subscribeToPrayerPush(userId);
      if (!subRes.success) return subRes;
      sub = await getActivePushSubscription();
    }

    const subJson = sub?.toJSON();
    if (!subJson?.endpoint || !subJson?.keys?.["p256dh"] || !subJson?.keys?.["auth"]) {
      return { success: false, message: "Inscrição de push não encontrada para teste." };
    }

    return await sendTestPushToDevice({
      data: {
        endpoint: subJson.endpoint,
        p256dh: subJson.keys["p256dh"],
        auth: subJson.keys["auth"],
      },
    });
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || "Erro ao enviar notificação de teste.",
    };
  }
}

/**
 * Dispara notificação de teste do Versículo do Dia via Web Push real
 */
export async function testDailyVersePush(userId?: string): Promise<{ success: boolean; message: string }> {
  if (!isWebPushSupported()) {
    return { success: false, message: "Web Push não suportado neste navegador." };
  }

  try {
    let sub = await getActivePushSubscription();
    if (!sub) {
      const subRes = await subscribeToVersePush(userId);
      if (!subRes.success) return subRes;
      sub = await getActivePushSubscription();
    }

    const subJson = sub?.toJSON();
    if (!subJson?.endpoint || !subJson?.keys?.["p256dh"] || !subJson?.keys?.["auth"]) {
      return { success: false, message: "Inscrição de push não encontrada para teste." };
    }

    return await sendTestVersePushToDevice({
      data: {
        endpoint: subJson.endpoint,
        p256dh: subJson.keys["p256dh"],
        auth: subJson.keys["auth"],
      },
    });
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || "Erro ao enviar Versículo do Dia de teste.",
    };
  }
}
