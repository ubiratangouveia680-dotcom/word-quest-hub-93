import { registerDevicePushSubscription, savePrayerNotificationPreferences, sendTestPushToDevice } from "@/lib/push.functions";

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

export const isPushNotificationSupported = isWebPushSupported;
export const getNotificationPermission = getPushPermission;

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
 * Inscreve o dispositivo atual para receber notificações Web Push de Pedidos de Oração
 */
export async function subscribeToPrayerPush(userId?: string): Promise<{ success: boolean; message: string }> {
  if (!isWebPushSupported()) {
    return { success: false, message: "Este navegador ou dispositivo não possui suporte a Web Push Notifications." };
  }

  try {
    // 1. Solicita permissão se ainda não foi decidida
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
    if (!subJson.endpoint || !subJson.keys?.p256dh || !subJson.keys?.auth) {
      return { success: false, message: "Falha ao gerar credenciais da inscrição Push." };
    }

    // 4. Identifica o dispositivo
    const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "";
    let deviceName = "Navegador Web";
    if (/Android/i.test(userAgent)) deviceName = "Dispositivo Android";
    else if (/Windows/i.test(userAgent)) deviceName = "PC Windows";
    else if (/Macintosh|Mac OS/i.test(userAgent)) deviceName = "Computador Mac";
    else if (/iPhone|iPad/i.test(userAgent)) deviceName = "Dispositivo Apple";

    // 5. Salva a inscrição no backend (multi-dispositivo)
    const effectiveUserId = userId || localStorage.getItem("bo:guest_device_id") || "guest_" + Math.random().toString(36).slice(2, 10);
    if (!userId && typeof window !== "undefined") {
      localStorage.setItem("bo:guest_device_id", effectiveUserId);
    }

    await registerDevicePushSubscription({
      data: {
        userId: effectiveUserId,
        endpoint: subJson.endpoint,
        p256dh: subJson.keys.p256dh,
        auth: subJson.keys.auth,
        deviceName,
        userAgent,
      },
    });

    // 6. Salva preferência ativa
    await savePrayerNotificationPreferences({
      data: {
        userId: effectiveUserId,
        preferences: {
          prayer_requests_enabled: true,
          prayer_support_enabled: true,
          community_enabled: true,
        },
      },
    });

    if (typeof window !== "undefined") {
      localStorage.setItem("bo:prayer_push_enabled", "true");
    }

    return {
      success: true,
      message: "Dispositivo registrado com sucesso! Você receberá notificações push quando surgirem novos pedidos de oração.",
    };
  } catch (err: any) {
    console.error("subscribeToPrayerPush error:", err);
    return {
      success: false,
      message: err?.message || "Erro inesperado ao registrar para notificações push.",
    };
  }
}

/**
 * Desativa notificações de pedidos de oração para este dispositivo
 */
export async function unsubscribeFromPrayerPush(userId?: string): Promise<{ success: boolean; message: string }> {
  try {
    const effectiveUserId = userId || (typeof window !== "undefined" ? localStorage.getItem("bo:guest_device_id") : null);

    if (effectiveUserId) {
      await savePrayerNotificationPreferences({
        data: {
          userId: effectiveUserId,
          preferences: {
            prayer_requests_enabled: false,
            prayer_support_enabled: false,
            community_enabled: false,
          },
        },
      });
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("bo:prayer_push_enabled", "false");
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
 * Dispara uma notificação de teste diretamente para o dispositivo atual via Web Push real
 */
export async function testPrayerPush(userId?: string): Promise<{ success: boolean; message: string }> {
  if (!isWebPushSupported()) {
    return { success: false, message: "Web Push não suportado neste navegador." };
  }

  try {
    const sub = await getActivePushSubscription();
    if (!sub) {
      // Se ainda não tem inscrição, tenta inscrever primeiro
      const subRes = await subscribeToPrayerPush(userId);
      if (!subRes.success) return subRes;
    }

    const currentSub = await getActivePushSubscription();
    const subJson = currentSub?.toJSON();

    if (!subJson?.endpoint || !subJson?.keys?.p256dh || !subJson?.keys?.auth) {
      return { success: false, message: "Inscrição de push não encontrada para teste." };
    }

    const res = await sendTestPushToDevice({
      data: {
        endpoint: subJson.endpoint,
        p256dh: subJson.keys.p256dh,
        auth: subJson.keys.auth,
      },
    });

    return res;
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || "Erro ao enviar notificação de teste.",
    };
  }
}
