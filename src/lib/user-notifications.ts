import { supabase } from "@/integrations/supabase/client";

export interface UserNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  reference_id: string | null;
  read: boolean;
  created_at: string;
}

/**
 * Busca a lista de notificações do usuário autenticado ordenadas por data.
 */
export async function fetchUserNotifications(
  userId: string,
  limit = 40
): Promise<UserNotification[]> {
  if (!userId) return [];

  try {
    const { data, error } = await supabase
      .from("user_notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.warn("Erro ao buscar notificações do usuário:", error);
      return [];
    }

    return (data as UserNotification[]) || [];
  } catch (err) {
    console.error("fetchUserNotifications falhou:", err);
    return [];
  }
}

/**
 * Retorna o número de notificações não lidas para o indicador (badge).
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  if (!userId) return 0;

  try {
    const { count, error } = await supabase
      .from("user_notifications")
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
      .from("user_notifications")
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
      .from("user_notifications")
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
 * Remove uma notificação.
 */
export async function deleteNotification(notificationId: string): Promise<boolean> {
  if (!notificationId) return false;

  try {
    const { error } = await supabase
      .from("user_notifications")
      .delete()
      .eq("id", notificationId);

    return !error;
  } catch (err) {
    console.error("deleteNotification falhou:", err);
    return false;
  }
}

/**
 * Inscreve no Supabase Realtime para receber notificações em tempo real.
 */
export function subscribeToUserNotifications(
  userId: string,
  onNotificationChange: (payload: any) => void
) {
  if (!userId) return { unsubscribe: () => {} };

  const channel = supabase
    .channel(`user_notifications_${userId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "user_notifications",
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        onNotificationChange(payload);
      }
    )
    .subscribe();

  return {
    unsubscribe: () => {
      supabase.removeChannel(channel);
    },
  };
}

/**
 * Fallback cliente seguro para criação de notificações para os outros usuários cadastrados
 * caso a migração / trigger no PostgreSQL ainda não tenha sido aplicada no servidor remoto.
 * Utiliza verificação anti-duplicação estrita.
 */
export async function dispatchPrayerNotificationFallback(
  prayerId: string,
  authorId: string
): Promise<void> {
  if (!prayerId || !authorId) return;

  try {
    // 1. Verifica se já existem notificações para este pedido de oração (geradas pelo Trigger do banco)
    const { count } = await supabase
      .from("user_notifications")
      .select("id", { count: "exact", head: true })
      .eq("reference_id", prayerId)
      .limit(1);

    if (count && count > 0) {
      // O trigger do banco já gerou as notificações
      return;
    }

    // 2. Busca os perfis de usuários cadastrados (exceto o próprio autor)
    const { data: profiles, error: profError } = await supabase
      .from("profiles")
      .select("user_id")
      .neq("user_id", authorId)
      .limit(500);

    if (profError || !profiles || profiles.length === 0) return;

    // 3. Monta o lote de notificações
    const rows = profiles.map((p) => ({
      user_id: p.user_id,
      type: "prayer_request",
      title: "🙏 Novo pedido de oração",
      message: "Alguém publicou um novo pedido de oração. Ore por essa pessoa.",
      reference_id: prayerId,
      read: false,
    }));

    // 4. Insere em lote ignorando duplicatas
    await supabase.from("user_notifications").upsert(rows, {
      onConflict: "user_id,reference_id,type",
      ignoreDuplicates: true,
    });
  } catch (err) {
    console.warn("dispatchPrayerNotificationFallback avisos:", err);
  }
}
