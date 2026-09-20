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

export function normalizeTime(timeStr?: string, defaultTime = "08:00"): string {
  if (!timeStr) return defaultTime;
  const clean = String(timeStr).trim();
  const parts = clean.split(":");
  if (parts.length >= 2) {
    const h = (parts[0] ?? "00").padStart(2, "0");
    const m = (parts[1] ?? "00").padStart(2, "0");
    return `${h}:${m}`;
  }
  return defaultTime;
}

export function resetDispatchedCacheForNewSettings() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(DISPATCHED_KEY);
  } catch {}
}

// ----------------------------------------------------
// Local & Cloud Settings Storage
// ----------------------------------------------------
export function getLocalNotificationSettings(): VerseNotificationSettings {
  if (typeof window === "undefined") return DEFAULT_NOTIFICATION_SETTINGS;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return DEFAULT_NOTIFICATION_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_NOTIFICATION_SETTINGS,
      ...parsed,
      morning_time: normalizeTime(parsed.morning_time, DEFAULT_NOTIFICATION_SETTINGS.morning_time),
      afternoon_time: normalizeTime(parsed.afternoon_time, DEFAULT_NOTIFICATION_SETTINGS.afternoon_time),
      evening_time: normalizeTime(parsed.evening_time, DEFAULT_NOTIFICATION_SETTINGS.evening_time),
    };
  } catch {
    return DEFAULT_NOTIFICATION_SETTINGS;
  }
}

export function saveLocalNotificationSettings(settings: VerseNotificationSettings) {
  if (typeof window === "undefined") return;
  try {
    const normalized: VerseNotificationSettings = {
      ...settings,
      morning_time: normalizeTime(settings.morning_time, "08:00"),
      afternoon_time: normalizeTime(settings.afternoon_time, "12:00"),
      evening_time: normalizeTime(settings.evening_time, "20:00"),
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(normalized));
    window.dispatchEvent(new CustomEvent("bo:notification_settings", { detail: normalized }));
  } catch {}
}

export async function fetchNotificationSettings(userId?: string): Promise<VerseNotificationSettings> {
  const local = getLocalNotificationSettings();
  if (!userId) return local;

  try {
    // 1. Try Supabase Auth metadata first (reliable for logged-in user without requiring extra tables)
    const { data: authData } = await supabase.auth.getUser();
    const meta = authData?.user?.user_metadata?.["verse_notification_settings"];
    if (meta) {
      const merged: VerseNotificationSettings = {
        verse_notifications_enabled: meta.verse_notifications_enabled ?? local.verse_notifications_enabled,
        morning_enabled: meta.morning_enabled ?? local.morning_enabled,
        morning_time: normalizeTime(meta.morning_time, local.morning_time),
        afternoon_enabled: meta.afternoon_enabled ?? local.afternoon_enabled,
        afternoon_time: normalizeTime(meta.afternoon_time, local.afternoon_time),
        evening_enabled: meta.evening_enabled ?? local.evening_enabled,
        evening_time: normalizeTime(meta.evening_time, local.evening_time),
        timezone: meta.timezone || local.timezone,
      };
      saveLocalNotificationSettings(merged);
      return merged;
    }

    // 2. Try table if it exists
    const { data, error } = await supabase
      .from("user_notification_settings")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (!error && data) {
      const cloud: VerseNotificationSettings = {
        verse_notifications_enabled: data.verse_notifications_enabled,
        morning_enabled: data.morning_enabled,
        morning_time: normalizeTime(data.morning_time, "08:00"),
        afternoon_enabled: data.afternoon_enabled,
        afternoon_time: normalizeTime(data.afternoon_time, "12:00"),
        evening_enabled: data.evening_enabled,
        evening_time: normalizeTime(data.evening_time, "20:00"),
        timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Sao_Paulo",
      };
      saveLocalNotificationSettings(cloud);
      return cloud;
    }

    return local;
  } catch {
    return local;
  }
}

export async function saveNotificationSettings(
  settings: VerseNotificationSettings,
  userId?: string
): Promise<boolean> {
  const normalized: VerseNotificationSettings = {
    ...settings,
    morning_time: normalizeTime(settings.morning_time, "08:00"),
    afternoon_time: normalizeTime(settings.afternoon_time, "12:00"),
    evening_time: normalizeTime(settings.evening_time, "20:00"),
    timezone: settings.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Sao_Paulo",
  };

  // Always save locally immediately
  saveLocalNotificationSettings(normalized);

  // Reset idempotency cache so new scheduled times will trigger today
  resetDispatchedCacheForNewSettings();

  if (!userId) return true;

  try {
    // 1. Save to Supabase Auth user_metadata
    await supabase.auth.updateUser({
      data: {
        verse_notification_settings: normalized,
      },
    }).catch(() => {});

    // 2. Also try table in case it exists, but don't fail if table is not in schema
    try {
      await supabase
        .from("user_notification_settings")
        .upsert({
          user_id: userId,
          verse_notifications_enabled: normalized.verse_notifications_enabled,
          morning_enabled: normalized.morning_enabled,
          morning_time: normalized.morning_time,
          afternoon_enabled: normalized.afternoon_enabled,
          afternoon_time: normalized.afternoon_time,
          evening_enabled: normalized.evening_enabled,
          evening_time: normalized.evening_time,
          timezone: normalized.timezone,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });
    } catch {}

    return true;
  } catch {
    return true; // Local storage already saved successfully
  }
}

// ----------------------------------------------------
// Permissions & Service Worker
// ----------------------------------------------------
export function isPushNotificationSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof navigator !== "undefined" &&
    typeof Notification !== "undefined" &&
    "Notification" in window &&
    "serviceWorker" in navigator
  );
}

export function getNotificationPermission(): NotificationPermission | "unsupported" {
  if (!isPushNotificationSupported()) return "unsupported";
  try {
    return Notification.permission ?? "unsupported";
  } catch {
    return "unsupported";
  }
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
    await navigator.serviceWorker.ready;
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
  let tag = "versiculo-da-manha";
  if (period === "afternoon_verse") {
    title = "☀️ Versículo da Tarde";
    tag = "versiculo-da-tarde";
  } else if (period === "evening_verse") {
    title = "🌙 Versículo da Noite";
    tag = "versiculo-da-noite";
  }

  // Formatação limpa, profissional e com quebras duplas para visual nativo do Android e Chrome
  const body = `"${daily.text}"\n\n📖 ${daily.bookName} ${daily.chapter}:${daily.verse}\n\nToque para ler o versículo completo na Bíblia Online.`;

  return {
    title,
    body,
    reference: `${daily.bookName} ${daily.chapter}:${daily.verse}`,
    url: "/versiculo-do-dia",
    tag,
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
export async function showDailyVerseNotification(
  period: NotificationPeriod,
  userId?: string,
  options?: { force?: boolean }
): Promise<boolean> {
  if (!isPushNotificationSupported()) {
    return false;
  }

  try {
    let permission = typeof Notification !== "undefined" ? Notification.permission : "denied";
    if (permission !== "granted") {
      permission = await requestNotificationPermission();
      if (permission !== "granted") return false;
    }

    const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const userIdentifier = userId || "guest_device";
    const settings = getLocalNotificationSettings();

    let targetTime = "default";
    if (period === "morning_verse") targetTime = settings.morning_time;
    if (period === "afternoon_verse") targetTime = settings.afternoon_time;
    if (period === "evening_verse") targetTime = settings.evening_time;

    const idempotencyKey = `${userIdentifier}_${todayStr}_${period}_${targetTime}`;

    // Check local idempotency unless forced test
    if (!options?.force && getDispatchedKeys().includes(idempotencyKey)) {
      return false; // Already sent today for this scheduled time
    }

    const content = formatVerseNotification(period);
    const reg = await registerServiceWorker();

    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const iconUrl = `${origin}/icon-192.png`;
    const badgeUrl = `${origin}/favicon.png`;
    const targetUrl = `${origin}${content.url}`;

    if (reg && reg.showNotification) {
      await reg.showNotification(content.title, {
        body: content.body,
        icon: iconUrl,
        badge: badgeUrl,
        tag: content.tag,
        data: { url: targetUrl },
      });
    } else if (typeof Notification !== "undefined") {
      new Notification(content.title, {
        body: content.body,
        icon: iconUrl,
        tag: content.tag,
        data: { url: targetUrl },
      });
    }

    if (!options?.force) {
      markDispatchedKey(idempotencyKey);
    }

    // Try saving to Supabase logs if user is authenticated
    if (userId) {
      supabase.from("verse_notification_logs").insert({
        user_id: userId,
        notification_type: period,
        verse_reference: content.reference,
        verse_date: todayStr ?? new Date().toISOString().slice(0, 10),
        status: "sent",
        idempotency_key: idempotencyKey,
      }).then(() => undefined);
    }

    return true;
  } catch (err: any) {
    console.error("Erro ao exibir notificação:", err);
    return false;
  }
}

/**
 * Checks the current time against user settings and triggers the verse if time has arrived
 */
export async function checkAndDispatchDailyVerses(userId?: string) {
  try {
    if (!isPushNotificationSupported() || typeof Notification === "undefined" || Notification.permission !== "granted") return;

    const settings = getLocalNotificationSettings();
    if (!settings.verse_notifications_enabled) return;

    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();

  // Helper to check if current time matches scheduled time
  const isTimeFor = (targetTime: string) => {
    const normalized = normalizeTime(targetTime, "08:00");
    const [targetH, targetM] = normalized.split(":").map((v) => parseInt(v, 10));
    if (targetH === undefined || targetM === undefined || isNaN(targetH) || isNaN(targetM)) return false;

    const targetTotalMin = targetH * 60 + targetM;
    const currentTotalMin = currentHours * 60 + currentMinutes;
    const diff = currentTotalMin - targetTotalMin;
    // Dispatches if within 45 minutes of scheduled time
    return diff >= 0 && diff <= 45;
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
} catch (err) {
  console.warn("checkAndDispatchDailyVerses error:", err);
}
}

