import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState, useRef } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";

export interface PresenceStats {
  totalOnline: number;
  authenticatedOnline: number;
  visitorsOnline: number;
  isConnected: boolean;
}

const INACTIVITY_TIMEOUT_MS = 2 * 60 * 1000; // 2 minutos de inatividade
const VISITOR_STORAGE_KEY = "bo:presence_device_session_id";

// Obtém ou cria um ID persistente por dispositivo/navegador para deduplicação de abas em visitantes
function getVisitorDeviceId(): string {
  if (typeof window === "undefined") return "guest_temp";
  try {
    let id = localStorage.getItem(VISITOR_STORAGE_KEY);
    if (!id) {
      id = "vis_" + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
      localStorage.setItem(VISITOR_STORAGE_KEY, id);
    }
    return id;
  } catch {
    return "vis_" + Math.random().toString(36).substring(2, 11);
  }
}

/**
 * Hook de presença global em tempo real via Supabase Realtime Presence.
 * - Deduplica abas abertas pelo mesmo usuário ou mesmo visitante.
 * - Suspende presença após 2 minutos de inatividade ou quando a aba está oculta.
 * - Atualiza instantaneamente (+1 ao entrar, -1 ao sair ou fechar a aba).
 * - Não expõe nenhum dado sensível (nome, e-mail, IP ou localização).
 */
export function useGlobalOnlinePresence(userId?: string): PresenceStats {
  const [stats, setStats] = useState<PresenceStats>({
    totalOnline: 1,
    authenticatedOnline: userId ? 1 : 0,
    visitorsOnline: userId ? 0 : 1,
    isConnected: false,
  });

  const channelRef = useRef<RealtimeChannel | null>(null);
  const isTrackingRef = useRef<boolean>(false);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isTabActiveRef = useRef<boolean>(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Define a chave de presença única (auth_USERID ou visitor_DEVICEID)
    const presenceKey = userId ? `auth_${userId}` : `visitor_${getVisitorDeviceId()}`;
    const userType: "authenticated" | "visitor" = userId ? "authenticated" : "visitor";

    const channel = supabase.channel("global_online_presence", {
      config: {
        presence: {
          key: presenceKey,
        },
      },
    });

    channelRef.current = channel;

    // Recalcula contadores a partir do estado de presença sincronizado
    const updateStatsFromPresence = () => {
      const presenceState = channel.presenceState();
      let authCount = 0;
      let visitorCount = 0;

      Object.entries(presenceState).forEach(([key, entries]) => {
        if (!entries || entries.length === 0) return;
        // Identifica o tipo a partir da chave única
        if (key.startsWith("auth_")) {
          authCount++;
        } else {
          visitorCount++;
        }
      });

      const total = Math.max(1, authCount + visitorCount);
      setStats({
        totalOnline: total,
        authenticatedOnline: authCount,
        visitorsOnline: visitorCount,
        isConnected: true,
      });
    };

    // Inicia o rastreamento da presença no canal
    const trackPresence = async () => {
      if (!isTrackingRef.current && channel) {
        try {
          await channel.track({
            userType,
            onlineAt: new Date().toISOString(),
          });
          isTrackingRef.current = true;
        } catch (e) {
          console.warn("Erro ao registrar presença:", e);
        }
      }
    };

    // Remove o rastreamento da presença (ex: inatividade ou aba oculta)
    const untrackPresence = async () => {
      if (isTrackingRef.current && channel) {
        try {
          await channel.untrack();
          isTrackingRef.current = false;
        } catch (e) {
          console.warn("Erro ao suspender presença:", e);
        }
      }
    };

    // Reinicia o timer de inatividade
    const resetInactivityTimer = () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }

      // Se estava inativo, reativa o tracking
      if (!isTrackingRef.current && isTabActiveRef.current) {
        trackPresence();
      }

      inactivityTimerRef.current = setTimeout(() => {
        // Passaram-se 2 minutos sem interação
        untrackPresence();
      }, INACTIVITY_TIMEOUT_MS);
    };

    // Listener de mudança de visibilidade da aba
    const handleVisibilityChange = () => {
      if (document.hidden) {
        isTabActiveRef.current = false;
        untrackPresence();
      } else {
        isTabActiveRef.current = true;
        trackPresence();
        resetInactivityTimer();
      }
    };

    // Registra listeners de atividade do usuário
    const activityEvents = ["mousemove", "keydown", "touchstart", "scroll", "click"];
    activityEvents.forEach((event) => {
      window.addEventListener(event, resetInactivityTimer, { passive: true });
    });
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Conexão com Supabase Realtime
    channel
      .on("presence", { event: "sync" }, updateStatsFromPresence)
      .on("presence", { event: "join" }, updateStatsFromPresence)
      .on("presence", { event: "leave" }, updateStatsFromPresence)
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await trackPresence();
          resetInactivityTimer();
        } else if (status === "CLOSED" || status === "CHANNEL_ERROR") {
          setStats((prev) => ({ ...prev, isConnected: false }));
        }
      });

    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetInactivityTimer);
      });
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      channel.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return stats;
}
