import { useEffect, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export interface PresenceStats {
  totalOnline: number;
  authenticatedOnline: number;
  visitorsOnline: number;
  isConnected: boolean;
}

type PresenceListener = (stats: PresenceStats) => void;
type PresenceEntry = { userType?: "authenticated" | "visitor" };

const INACTIVITY_TIMEOUT_MS = 2 * 60 * 1000;
const VISITOR_STORAGE_KEY = "bo:presence_device_session_id";
const CHANNEL_NAME = "global_online_presence";

let sharedChannel: RealtimeChannel | null = null;
let channelInitialization: Promise<void> | null = null;
let inactivityTimer: ReturnType<typeof setTimeout> | null = null;
let isTracking = false;
let isTabActive = true;
let activityListenersInstalled = false;
let currentUserId: string | undefined;
let currentStats: PresenceStats = {
  totalOnline: 1,
  authenticatedOnline: 0,
  visitorsOnline: 1,
  isConnected: false,
};

const subscribers = new Map<symbol, { userId?: string; listener: PresenceListener }>();

function getVisitorDeviceId(): string {
  try {
    let id = localStorage.getItem(VISITOR_STORAGE_KEY);
    if (!id) {
      id = `vis_${crypto.randomUUID()}`;
      localStorage.setItem(VISITOR_STORAGE_KEY, id);
    }
    return id;
  } catch {
    return `vis_${crypto.randomUUID()}`;
  }
}

function publish(stats: PresenceStats) {
  currentStats = stats;
  subscribers.forEach(({ listener }) => listener(stats));
}

function updateStatsFromPresence() {
  if (!sharedChannel) return;

  let authenticatedOnline = 0;
  let visitorsOnline = 0;

  Object.values(sharedChannel.presenceState()).forEach((entries) => {
    if (!entries?.length) return;
    const latestEntry = entries.at(-1) as PresenceEntry | undefined;
    if (latestEntry?.userType === "authenticated") authenticatedOnline += 1;
    else visitorsOnline += 1;
  });

  publish({
    totalOnline: Math.max(1, authenticatedOnline + visitorsOnline),
    authenticatedOnline,
    visitorsOnline,
    isConnected: true,
  });
}

async function trackPresence() {
  if (!sharedChannel || !isTabActive) return;

  try {
    await sharedChannel.track({
      userType: currentUserId ? "authenticated" : "visitor",
      onlineAt: new Date().toISOString(),
    });
    isTracking = true;
  } catch (error) {
    console.warn("Erro ao registrar presença:", error);
  }
}

async function untrackPresence() {
  if (!sharedChannel || !isTracking) return;

  try {
    await sharedChannel.untrack();
    isTracking = false;
  } catch (error) {
    console.warn("Erro ao suspender presença:", error);
  }
}

function resetInactivityTimer() {
  if (inactivityTimer) clearTimeout(inactivityTimer);
  if (!isTracking && isTabActive) void trackPresence();
  inactivityTimer = setTimeout(() => void untrackPresence(), INACTIVITY_TIMEOUT_MS);
}

function handleVisibilityChange() {
  isTabActive = !document.hidden;
  if (!isTabActive) {
    void untrackPresence();
    return;
  }
  void trackPresence();
  resetInactivityTimer();
}

function installActivityListeners() {
  if (activityListenersInstalled) return;
  activityListenersInstalled = true;
  ["mousemove", "keydown", "touchstart", "scroll", "click"].forEach((event) => {
    window.addEventListener(event, resetInactivityTimer, { passive: true });
  });
  document.addEventListener("visibilitychange", handleVisibilityChange);
}

function syncIdentity() {
  const nextUserId = Array.from(subscribers.values()).find(({ userId }) => userId)?.userId;
  if (nextUserId === currentUserId) return;
  currentUserId = nextUserId;
  if (isTracking) void trackPresence();
}

function ensureSharedChannel() {
  if (sharedChannel || channelInitialization) return;

  channelInitialization = (async () => {
    // Vite can preserve the client across a hot update while resetting this
    // module. Remove that stale subscribed channel before adding callbacks.
    const staleChannel = supabase
      .getChannels()
      .find((candidate) => candidate.topic === `realtime:${CHANNEL_NAME}`);
    if (staleChannel) await supabase.removeChannel(staleChannel);

    const channel = supabase.channel(CHANNEL_NAME, {
      config: { presence: { key: getVisitorDeviceId() } },
    });

    // Presence callbacks must all be registered before subscribe().
    channel
      .on("presence", { event: "sync" }, updateStatsFromPresence)
      .on("presence", { event: "join" }, updateStatsFromPresence)
      .on("presence", { event: "leave" }, updateStatsFromPresence);

    sharedChannel = channel;
    installActivityListeners();

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        void trackPresence();
        resetInactivityTimer();
      } else if (status === "CLOSED" || status === "CHANNEL_ERROR") {
        isTracking = false;
        publish({ ...currentStats, isConnected: false });
      }
    });
  })().catch((error) => {
    channelInitialization = null;
    console.warn("Erro ao iniciar presença:", error);
    publish({ ...currentStats, isConnected: false });
  });
}

function subscribeToPresence(userId: string | undefined, listener: PresenceListener) {
  const subscriptionId = Symbol("presence-subscriber");
  subscribers.set(subscriptionId, { userId, listener });
  syncIdentity();
  ensureSharedChannel();
  listener(currentStats);

  return () => {
    subscribers.delete(subscriptionId);
    syncIdentity();
  };
}

/**
 * Compartilha uma única conexão de presença entre todos os contadores da tela.
 * Isso evita registrar callbacks em um canal que outra instância já assinou.
 */
export function useGlobalOnlinePresence(userId?: string): PresenceStats {
  const [stats, setStats] = useState<PresenceStats>(currentStats);

  useEffect(() => subscribeToPresence(userId, setStats), [userId]);

  return stats;
}
