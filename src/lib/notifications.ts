import { supabase } from "@/integrations/supabase/client";
import { getDailyRef } from "@/lib/daily-verse";

export interface VerseNotificationSettings {
  verse_notifications_enabled: boolean;
  morning_enabled: boolean;
  morning_time: string;
  afternoon_enabled: boolean;
  afternoon_time: string;
  evening_enabled: boolean;
  evening_time: string;
  timezone: string;
}

export const DEFAULT_NOTIFICATION_SETTINGS: VerseNotificationSettings = {
  verse_notifications_enabled: true,
  morning_enabled: true,
  morning_time: "08:00",
  afternoon_enabled: true,
  afternoon_time: "12:00",
  evening_enabled: true,
  evening_time: "20:00",
  timezone: "America/Sao_Paulo",
};

const LOCAL_STORAGE_KEY = "bo:verse_notification_settings";
const PROMPT_DISMISSED_KEY = "bo:notification_prompt_dismissed";
const DISPATCHED_KEY = "bo:verse_dispatched_cache";

// ----------------------------------------------------
// Local & Cloud Settings Storage
// ----------------------------------------------------
export function getLocalNotificationSettings(): VerseNotificationSettings {
  if (typeof window === "undefined") return DEFAULT_NOTIFICATION_SETTINGS;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return DEFAULT_NOTIFICATION_SETTINGS;
    return { ...DEFAULT_NOTIFICATION_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_NOTIFICATION_SETTINGS;
  }
}

export function saveLocalNotificationSettings(settings: VerseNotificationSettings) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent("bo:notification_settings", { detail: settings }));
  } catch {}
}

export async function fetchNotificationSettings(userId?: string): Promise<VerseNotificationSettings> {
  const local = getLocalNotificationSettings();
  if (!userId) return local;

  try {
    const { data, error } = await supabase
      .from("user_notification_settings")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !data) return local;

    const cloud: VerseNotificationSettings = {
      verse_notifications_enabled: data.verse_notifications_enabled,
      morning_enabled: data.morning_enabled,
      morning_time: data.morning_time,
      afternoon_enabled: data.afternoon_enabled,
      afternoon_time: data.afternoon_time,
      evening_enabled: data.evening_enabled,
      evening_time: data.evening_time,
      timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Sao_Paulo",
    };

    saveLocalNotificationSettings(cloud);
    return cloud;
  } catch {
    return local;
  }
}

export async function saveNotificationSettings(
  settings: VerseNotificationSettings,
  userId?: string
): Promise<boolean> {
  saveLocalNotificationSettings(settings);

  if (!userId) return true;

  try {
    const { error } = await supabase
      .from("user_notification_settings")
      .upsert({
        user_id: userId,
        verse_notifications_enabled: settings.verse_notifications_enabled,
        morning_enabled: settings.morning_enabled,
        morning_time: settings.morning_time,
        afternoon_enabled: settings.afternoon_enabled,
        afternoon_time: settings.afternoon_time,
        evening_enabled: settings.evening_enabled,
        evening_time: settings.evening_time,
        timezone: settings.timezone,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });

    return !error;
  } catch {
    return false;
  }
}

// ----------------------------------------------------
// Permissions & Service Worker
// ----------------------------------------------------
export function isPushNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window && "serviceWorker" in navigator;
}

export function getNotificationPermission(): NotificationPermission | "unsupported" {
  if (!isPushNotificationSupported()) return "unsupported";
  return Notification.permission;
}

export function hasDismissedPrompt(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(PROMPT_DISMISSED_KEY) === "true";
}

export function dismissPrompt() {
  if (typeof window === "undefined") return;
  localStorage.setItem(PROMPT_DISMISSED_KEY, "true");
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isPushNotificationSupported()) return null;
  try {
    const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
    return reg;
  } catch (err) {
    console.warn("Falha ao registrar Service Worker:", err);
    return null;
  }
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isPushNotificationSupported()) return "denied";

  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      await registerServiceWorker();
    }
    return permission;
  } catch {
    return "denied";
  }
}

// ----------------------------------------------------
// Notification Formatting & Dispatching with Idempotency
// ----------------------------------------------------
export type NotificationPeriod = "morning_verse" | "afternoon_verse" | "evening_verse";

export function formatVerseNotification(period: NotificationPeriod) {
  const daily = getDailyRef();

  let title = "🌅 Versículo da Manhã";
  if (period === "afternoon_verse") {
    title = "☀️ Versículo da Tarde";
  } else if (period === "evening_verse") {
    title = "🌙 Versículo da Noite";
  }

  // Beautiful, compact message with book reference
  const body = `"${daily.text}"\n📖 ${daily.bookName} ${daily.chapter}:${daily.verse}\nToque para ler o versículo completo no Word Quest Hub.`;

  return {
    title,
    body,
    reference: `${daily.bookName} ${daily.chapter}:${daily.verse}`,
    url: "/versiculo-do-dia",
    tag: `verse-${period}`,
  };
}

// Check if a period notification was already dispatched today (idempotency)
function getDispatchedKeys(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(DISPATCHED_KEY) || "[]");
  } catch {
    return [];
  }
}

function markDispatchedKey(key: string) {
  if (typeof window === "undefined") return;
  try {
    const list = getDispatchedKeys();
    if (!list.includes(key)) {
      list.push(key);
      // Keep only last 30 entries
      if (list.length > 30) list.shift();
      localStorage.setItem(DISPATCHED_KEY, JSON.stringify(list));
    }
  } catch {}
}

/**
 * Triggers the actual Web Push notification via the active Service Worker
 */
export async function showDailyVerseNotification(period: NotificationPeriod, userId?: string): Promise<boolean> {
  if (!isPushNotificationSupported() || Notification.permission !== "granted") {
    return false;
  }

  const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const userIdentifier = userId || "guest_device";
  const idempotencyKey = `${userIdentifier}_${todayStr}_${period}`;

  // Check local idempotency first
  if (getDispatchedKeys().includes(idempotencyKey)) {
    return false; // Already sent today
  }

  const content = formatVerseNotification(period);
  const reg = await registerServiceWorker();

  try {
    if (reg && reg.showNotification) {
      await reg.showNotification(content.title, {
        body: content.body,
        icon: "/icon-192.png",
        badge: "/favicon.png",
        tag: content.tag,
        data: { url: content.url },
        vibrate: [100, 50, 100],
      });
    } else {
      new Notification(content.title, {
        body: content.body,
        icon: "/icon-192.png",
        tag: content.tag,
      });
    }

    // Save to local idempotency cache
    markDispatchedKey(idempotencyKey);

    // Save to Supabase logs if user is authenticated
    if (userId) {
      await supabase.from("verse_notification_logs").insert({
        user_id: userId,
        notification_type: period,
        verse_reference: content.reference,
        verse_date: todayStr,
        status: "sent",
        idempotency_key: idempotencyKey,
      }).catch(() => {});
    }

    return true;
  } catch (err: any) {
    console.error("Erro ao exibir notificação:", err);
    if (userId) {
      await supabase.from("verse_notification_logs").insert({
        user_id: userId,
        notification_type: period,
        verse_reference: content.reference,
        verse_date: todayStr,
        status: "failed",
        error_message: err?.message || String(err),
        idempotency_key: idempotencyKey,
      }).catch(() => {});
    }
    return false;
  }
}

/**
 * Checks the current time against user settings and triggers the verse if time has arrived
 */
export async function checkAndDispatchDailyVerses(userId?: string) {
  if (!isPushNotificationSupported() || Notification.permission !== "granted") return;

  const settings = getLocalNotificationSettings();
  if (!settings.verse_notifications_enabled) return;

  const now = new Date();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTimeStr = `${String(currentHours).padStart(2, "0")}:${String(currentMinutes).padStart(2, "0")}`;

  // Helper to check if current time is within 30 minutes after scheduled time
  const isTimeFor = (targetTime: string) => {
    const [targetH, targetM] = targetTime.split(":").map((v) => parseInt(v, 10));
    const targetTotalMin = targetH * 60 + targetM;
    const currentTotalMin = currentHours * 60 + currentMinutes;
    const diff = currentTotalMin - targetTotalMin;
    return diff >= 0 && diff <= 45; // Within 45 min window
  };

  // Morning
  if (settings.morning_enabled && isTimeFor(settings.morning_time)) {
    await showDailyVerseNotification("morning_verse", userId);
  }

  // Afternoon
  if (settings.afternoon_enabled && isTimeFor(settings.afternoon_time)) {
    await showDailyVerseNotification("afternoon_verse", userId);
  }

  // Evening
  if (settings.evening_enabled && isTimeFor(settings.evening_time)) {
    await showDailyVerseNotification("evening_verse", userId);
  }
}
