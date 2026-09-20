import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface JourneyActivity {
  id: "bible" | "prayer" | "devotional" | "verse";
  title: string;
  iconText: string;
  description: string;
  link: string;
}

export const JOURNEY_ACTIVITIES: JourneyActivity[] = [
  {
    id: "bible",
    title: "Ler a Bíblia",
    iconText: "📖",
    description: "Leia ao menos um capítulo da Palavra de Deus",
    link: "/biblia",
  },
  {
    id: "prayer",
    title: "Fazer uma oração",
    iconText: "🙏",
    description: "Um momento de conversa sincera e gratidão ao Senhor",
    link: "/oracoes",
  },
  {
    id: "devotional",
    title: "Ler o devocional",
    iconText: "🌅",
    description: "Uma reflexão diária para inspirar suas atitudes",
    link: "/devocionais",
  },
  {
    id: "verse",
    title: "Versículo do Dia",
    iconText: "✨",
    description: "Medite na mensagem bíblica reservada para hoje",
    link: "/versiculo-do-dia",
  },
];

export function getTodayKey(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

const STORAGE_PREFIX = "bo:daily_journey_";

export function readLocalJourney(dateKey: string): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${dateKey}`);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveLocalJourney(dateKey: string, data: Record<string, boolean>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${dateKey}`, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent("bo:journey_updated", { detail: { dateKey, data } }));
  } catch {}
}

export function useDailyJourney(userId?: string) {
  const today = getTodayKey();
  const [completed, setCompleted] = useState<Record<string, boolean>>(() => readLocalJourney(today));

  // Sincroniza estado com localStorage e eventos
  useEffect(() => {
    const local = readLocalJourney(today);
    setCompleted(local);

    const handleUpdate = (e: Event) => {
      const custom = e as CustomEvent<{ dateKey: string; data: Record<string, boolean> }>;
      if (custom.detail && custom.detail.dateKey === today) {
        setCompleted(custom.detail.data);
      }
    };

    window.addEventListener("bo:journey_updated", handleUpdate);
    return () => window.removeEventListener("bo:journey_updated", handleUpdate);
  }, [today]);

  // Carrega progresso do Supabase para usuário autenticado
  useEffect(() => {
    if (!userId) return;

    let active = true;
    const fetchRemote = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        const journeyMeta = data?.user?.user_metadata?.daily_journeys?.[today];
        if (journeyMeta && active) {
          const local = readLocalJourney(today);
          const merged = { ...local, ...journeyMeta };
          setCompleted(merged);
          saveLocalJourney(today, merged);
        }
      } catch {}
    };

    fetchRemote();
    return () => {
      active = false;
    };
  }, [userId, today]);

  const toggleActivity = useCallback(
    async (id: JourneyActivity["id"]) => {
      const next = { ...completed, [id]: !completed[id] };
      setCompleted(next);
      saveLocalJourney(today, next);

      if (userId) {
        try {
          const { data } = await supabase.auth.getUser();
          const existing = data?.user?.user_metadata?.daily_journeys || {};
          await supabase.auth.updateUser({
            data: {
              daily_journeys: {
                ...existing,
                [today]: next,
              },
            },
          });
        } catch {}
      }
    },
    [completed, today, userId]
  );

  const markCompleted = useCallback(
    async (id: JourneyActivity["id"]) => {
      if (completed[id]) return;
      const next = { ...completed, [id]: true };
      setCompleted(next);
      saveLocalJourney(today, next);

      if (userId) {
        try {
          const { data } = await supabase.auth.getUser();
          const existing = data?.user?.user_metadata?.daily_journeys || {};
          await supabase.auth.updateUser({
            data: {
              daily_journeys: {
                ...existing,
                [today]: next,
              },
            },
          });
        } catch {}
      }
    },
    [completed, today, userId]
  );

  const completedCount = JOURNEY_ACTIVITIES.filter((a) => completed[a.id]).length;
  const isCompleted = completedCount === 4;

  return {
    today,
    completed,
    completedCount,
    totalActivities: 4,
    isCompleted,
    toggleActivity,
    markCompleted,
  };
}
