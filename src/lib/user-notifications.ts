import { supabase } from "@/integrations/supabase/client";
import { notifyNewPrayerRequest } from "@/lib/push.functions";

export interface UserNotification {
  id: string;
  user_id: string;
  actor_id?: string;
  type: string;
  title: string;
  message: string;
  question_id?: string;
  reference_id: string | null;
  read: boolean;
  created_at: string;
  actor_name?: string;
}

/**
 * Busca a lista de notificações do usuário autenticado no banco de dados Supabase (tabela notifications).
 */
export async function fetchUserNotifications(
  userId: string,
  limit = 40
): Promise<UserNotification[]> {
  if (!userId) return [];

  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.warn("Erro ao buscar notificações do usuário:", error);
      return [];
    }

    if (!data || data.length === 0) return [];

    // Busca nomes dos autores (actor_id) nos perfis
    const actorIds = Array.from(new Set(data.map((n: any) => n.actor_id).filter(Boolean)));
    const authorNamesMap = new Map<string, string>();

    if (actorIds.length > 0) {
      try {
        const { data: profs } = await supabase
          .from("profiles")
          .select("user_id, name")
          .in("user_id", actorIds);

        (profs || []).forEach((p: any) => {
          if (p.user_id && p.name) {
            authorNamesMap.set(p.user_id, p.name);
          }
        });
      } catch {}
    }

    return data.map((n: any) => {
      const actorName = authorNamesMap.get(n.actor_id) || "Irmão(ã) da comunidade";
      let title = "🙏 Notificação de Oração";
      if (n.message && n.message.includes("publicou um novo pedido")) {
        title = "🙏 Novo pedido de oração";
      } else if (n.message && n.message.includes("começou a orar")) {
        title = "🙏 Irmão em oração";
      }

      return {
        id: n.id,
        user_id: n.user_id,
        actor_id: n.actor_id,
        type: n.type || "reaction",
        title,
        message: n.message || "Você tem uma nova notificação.",
        question_id: n.question_id || null,
        reference_id: n.question_id || null,
        read: Boolean(n.read),
        created_at: n.created_at,
        actor_name: actorName,
      };
    });
  } catch (err) {
    console.error("fetchUserNotifications falhou:", err);
    return [];
  }
}

/**
 * Retorna o número de notificações não lidas para o indicador visual (badge) do sininho.
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  if (!userId) return 0;

  try {
    const { count, error } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("read", false);

    if (error) {
      console.warn("Erro ao contar notificações não lidas:", error);
      return 0;
    }

    return count || 0;
  } catch {
    return 0;
  }
}

/**
 * Marca uma notificação individual como lida.
 */
export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  if (!notificationId) return false;

  try {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", notificationId);

    return !error;
  } catch (err) {
    console.error("markNotificationAsRead falhou:", err);
    return false;
  }
}

/**
 * Marca todas as notificações não lidas do usuário como lidas.
 */
export async function markAllNotificationsAsRead(userId: string): Promise<boolean> {
  if (!userId) return false;

  try {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", userId)
      .eq("read", false);

    return !error;
  } catch (err) {
    console.error("markAllNotificationsAsRead falhou:", err);
    return false;
  }
}

/**
 * Remove uma notificação do usuário.
 */
export async function deleteNotification(notificationId: string): Promise<boolean> {
  if (!notificationId) return false;

  try {
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", notificationId);

    return !error;
  } catch (err) {
    console.error("deleteNotification falhou:", err);
    return false;
  }
}

/**
 * Inscreve no Supabase Realtime para receber notificações em tempo real no Sininho.
 */
export function subscribeToUserNotifications(
  userId: string,
  onNotificationChange: (payload: any) => void
) {
  if (!userId) return { unsubscribe: () => {} };

  console.log("[NOTIFICATION REALTIME] iniciando");
  console.log(`[NOTIFICATION REALTIME] usuário: ${userId.slice(0, 8)}...`);

  const channelName = `bell_notifications_${userId}`;

  // Se já existe um canal com esse nome, remove para evitar ouvintes duplicados
  try {
    const existingChannels = supabase.getChannels();
    const duplicate = existingChannels.find((c) => c.topic === `realtime:${channelName}`);
    if (duplicate) {
      supabase.removeChannel(duplicate);
    }
  } catch {}

  const channel = supabase
    .channel(channelName)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        if (payload.eventType === "INSERT") {
          console.log(`[NOTIFICATION REALTIME] INSERT recebido: ${payload.new?.["id"] || "desconhecido"}`);
        }
        onNotificationChange(payload);
      }
    )
    .subscribe((status, err) => {
      if (status === "SUBSCRIBED") {
        console.log("[NOTIFICATION REALTIME] conectado");
      } else if (status === "CHANNEL_ERROR") {
        console.warn("[NOTIFICATION REALTIME] canal apresentou erro:", err?.message || err);
      } else if (status === "TIMED_OUT") {
        console.warn("[NOTIFICATION REALTIME] timeout na conexão com canal");
      }
    });

  return {
    unsubscribe: () => {
      console.log("[NOTIFICATION REALTIME] subscription encerrada");
      try {
        supabase.removeChannel(channel);
      } catch (err) {
        console.warn("[NOTIFICATION REALTIME] erro ao remover canal:", err);
      }
    },
  };
}

/**
 * Cria notificações internas para todos os outros membros cadastrados quando um novo pedido de oração é criado.
 * Processado com segurança no servidor através da server function notifyNewPrayerRequest.
 */
export async function dispatchPrayerNotificationFallback(
  prayerId: string,
  authorId: string,
  authorName?: string,
  prayerContent?: string
): Promise<void> {
  if (!prayerId || !authorId) return;

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;

    await notifyNewPrayerRequest({
      data: {
        authorId,
        prayerRequestId: prayerId,
        content: prayerContent || "",
        ...(authorName ? { authorName } : {}),
        ...(token ? { accessToken: token } : {}),
      },
    });
  } catch (err) {
    console.warn("[NOTIFICATION] Falha ao despachar notificações no backend:", err);
  }
}
