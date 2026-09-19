import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ChatProfile {
  id: string;
  user_id: string;
  name: string | null;
  email: string | null;
  last_seen_at?: string | null;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
  deleted_at: string | null;
}

export interface ConversationItem {
  id: string;
  otherUser: ChatProfile;
  lastMessage?: ChatMessage | null;
  unreadCount: number;
  updatedAt: string;
}

// 1. Pesquisa de usuários para iniciar nova conversa
export async function searchProfiles(query: string, currentUserId: string): Promise<ChatProfile[]> {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 1) return [];

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, user_id, name, email, last_seen_at")
      .neq("user_id", currentUserId)
      .or(`name.ilike.%${trimmed}%,email.ilike.%${trimmed}%`)
      .limit(15);

    if (error) {
      console.warn("Erro ao buscar usuários:", error.message);
      return [];
    }

    return (data || []) as ChatProfile[];
  } catch (err) {
    console.error("Falha ao buscar perfis:", err);
    return [];
  }
}

// 2. Obter conversa existente ou criar nova
export async function getOrCreateConversation(currentUserId: string, otherUserId: string): Promise<string | null> {
  if (!currentUserId || !otherUserId || currentUserId === otherUserId) return null;

  try {
    // Busca conversas do usuário atual
    const { data: myParticipations, error: myError } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", currentUserId);

    if (myError) throw myError;

    if (myParticipations && myParticipations.length > 0) {
      const convIds = myParticipations.map((p) => p.conversation_id);

      // Verifica se o outro usuário já participa de alguma dessas conversas
      const { data: common, error: commonError } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", otherUserId)
        .in("conversation_id", convIds)
        .maybeSingle();

      if (!commonError && common) {
        return common.conversation_id;
      }
    }

    // Se não existir, cria uma nova conversa
    const { data: newConv, error: createError } = await supabase
      .from("conversations")
      .insert({})
      .select("id")
      .single();

    if (createError || !newConv) throw createError;

    const convId = newConv.id;

    // Adiciona os dois participantes
    const { error: partError } = await supabase.from("conversation_participants").insert([
      { conversation_id: convId, user_id: currentUserId },
      { conversation_id: convId, user_id: otherUserId },
    ]);

    if (partError) throw partError;

    return convId;
  } catch (err) {
    console.error("Erro ao obter/criar conversa:", err);
    return null;
  }
}

// 3. Buscar mensagens de uma conversa
export async function fetchMessages(conversationId: string, limit = 60): Promise<ChatMessage[]> {
  try {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(limit);

    if (error) throw error;
    return (data || []) as ChatMessage[];
  } catch (err) {
    console.error("Erro ao carregar mensagens:", err);
    return [];
  }
}

// 4. Enviar mensagem
export async function sendMessage(conversationId: string, senderId: string, content: string): Promise<ChatMessage | null> {
  const trimmed = content.trim();
  if (!trimmed) return null;

  try {
    const { data, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content: trimmed,
      })
      .select("*")
      .single();

    if (error) throw error;

    // Atualiza timestamp da conversa
    await supabase
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversationId);

    return data as ChatMessage;
  } catch (err) {
    console.error("Erro ao enviar mensagem:", err);
    return null;
  }
}

// 5. Apagar mensagem própria (soft delete)
export async function deleteMessage(messageId: string, senderId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("messages")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", messageId)
      .eq("sender_id", senderId);

    return !error;
  } catch {
    return false;
  }
}

// 6. Marcar conversa como lida
export async function markConversationAsRead(conversationId: string, userId: string): Promise<void> {
  try {
    await supabase
      .from("conversation_participants")
      .update({ last_read_at: new Date().toISOString() })
      .eq("conversation_id", conversationId)
      .eq("user_id", userId);
  } catch (err) {
    console.error("Erro ao marcar lida:", err);
  }
}

// 7. Bloquear / Desbloquear Usuário
export async function blockUser(blockerId: string, blockedId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("user_blocks")
      .insert({ blocker_id: blockerId, blocked_id: blockedId });
    return !error;
  } catch {
    return false;
  }
}

export async function unblockUser(blockerId: string, blockedId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("user_blocks")
      .delete()
      .eq("blocker_id", blockerId)
      .eq("blocked_id", blockedId);
    return !error;
  } catch {
    return false;
  }
}

export async function checkBlockStatus(userA: string, userB: string): Promise<{ isBlocked: boolean; blockedByMe: boolean }> {
  try {
    const { data } = await supabase
      .from("user_blocks")
      .select("blocker_id, blocked_id")
      .or(`and(blocker_id.eq.${userA},blocked_id.eq.${userB}),and(blocker_id.eq.${userB},blocked_id.eq.${userA})`);

    if (!data || data.length === 0) return { isBlocked: false, blockedByMe: false };

    const blockedByMe = data.some((b) => b.blocker_id === userA);
    return { isBlocked: true, blockedByMe };
  } catch {
    return { isBlocked: false, blockedByMe: false };
  }
}

// 8. Denunciar Usuário ou Mensagem
export async function reportUser(params: {
  reporterId: string;
  reportedUserId: string;
  conversationId?: string;
  messageId?: string;
  reason: string;
}): Promise<boolean> {
  try {
    const { error } = await supabase.from("reports").insert({
      reporter_id: params.reporterId,
      reported_user_id: params.reportedUserId,
      conversation_id: params.conversationId || null,
      message_id: params.messageId || null,
      reason: params.reason.trim(),
      status: "pending",
    });
    return !error;
  } catch {
    return false;
  }
}

// 9. Hook de Presença Realtime (Usuários Online)
export function useChatPresence(userId: string | undefined) {
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!userId) return;

    const channel = supabase.channel("online-chat-users", {
      config: { presence: { key: userId } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const ids = new Set<string>();
        Object.keys(state).forEach((key) => ids.add(key));
        setOnlineUserIds(ids);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            user_id: userId,
            online_at: new Date().toISOString(),
          });
        }
      });

    // Atualiza last_seen_at periodicamente
    const heartbeat = setInterval(() => {
      supabase
        .from("profiles")
        .update({ last_seen_at: new Date().toISOString() })
        .eq("user_id", userId)
        .then();
    }, 60000);

    return () => {
      clearInterval(heartbeat);
      channel.unsubscribe();
    };
  }, [userId]);

  const isUserOnline = useCallback((targetUserId: string) => onlineUserIds.has(targetUserId), [onlineUserIds]);

  return { onlineUserIds, isUserOnline };
}

// 10. Hook para contador global de mensagens não lidas
export function useUnreadChatCount(userId: string | undefined) {
  const [count, setCount] = useState(0);

  const refreshCount = useCallback(async () => {
    if (!userId) {
      setCount(0);
      return;
    }

    try {
      // Pega conversas e o last_read_at do usuário
      const { data: participations } = await supabase
        .from("conversation_participants")
        .select("conversation_id, last_read_at")
        .eq("user_id", userId);

      if (!participations || participations.length === 0) {
        setCount(0);
        return;
      }

      let totalUnread = 0;

      for (const p of participations) {
        const lastRead = p.last_read_at || "1970-01-01";
        const { count: unread } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("conversation_id", p.conversation_id)
          .neq("sender_id", userId)
          .is("deleted_at", null)
          .gt("created_at", lastRead);

        totalUnread += unread || 0;
      }

      setCount(totalUnread);
    } catch {
      // fallback silencioso
    }
  }, [userId]);

  useEffect(() => {
    refreshCount();

    if (!userId) return;

    // Escuta novas mensagens em tempo real
    const channel = supabase
      .channel(`global-unread-chat-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          if (payload.new && (payload.new as ChatMessage).sender_id !== userId) {
            refreshCount();
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [userId, refreshCount]);

  return count;
}
