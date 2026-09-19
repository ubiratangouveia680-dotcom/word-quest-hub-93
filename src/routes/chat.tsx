import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef, useCallback } from "react";
import {
  ArrowLeft,
  Check,
  CheckCheck,
  MessageCircle,
  MoreVertical,
  Plus,
  Search,
  Send,
  ShieldAlert,
  Trash2,
  User,
  UserX,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth-context";
import {
  type ChatMessage,
  type ConversationItem,
  type ChatProfile,
  fetchMessages,
  sendMessage,
  deleteMessage,
  markConversationAsRead,
  searchProfiles,
  getOrCreateConversation,
  blockUser,
  unblockUser,
  checkBlockStatus,
  reportUser,
  useChatPresence,
} from "@/lib/chat";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Mensagens & Chat — Bíblia Online" },
      { name: "description", content: "Converse privadamente em tempo real com outros leitores e membros." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: ChatPage,
});

function formatMessageTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

function formatConversationDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) {
      return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    }
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  } catch {
    return "";
  }
}

function ChatPage() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { isUserOnline } = useChatPresence(user?.id);

  // Estados principais
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [activeOtherUser, setActiveOtherUser] = useState<ChatProfile | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);

  // Modais
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ChatProfile[]>([]);
  const [searchingUsers, setSearchingUsers] = useState(false);

  // Ações de moderação
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockedByMe, setBlockedByMe] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Rolagem suave para o fim das mensagens
  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
  }, []);

  // 1. Carregar lista de conversas
  const loadConversations = useCallback(async () => {
    if (!user) return;
    try {
      // 1. Participações
      const { data: participations, error: pError } = await supabase
        .from("conversation_participants")
        .select("conversation_id, last_read_at")
        .eq("user_id", user.id);

      if (pError || !participations) {
        setConversations([]);
        return;
      }

      const convList: ConversationItem[] = [];

      for (const part of participations) {
        // Busca o outro participante
        const { data: otherPart } = await supabase
          .from("conversation_participants")
          .select("user_id")
          .eq("conversation_id", part.conversation_id)
          .neq("user_id", user.id)
          .maybeSingle();

        if (!otherPart) continue;

        // Dados do perfil do outro usuário
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, user_id, name, email, last_seen_at")
          .eq("user_id", otherPart.user_id)
          .maybeSingle();

        const otherUserObj: ChatProfile = profile || {
          id: otherPart.user_id,
          user_id: otherPart.user_id,
          name: "Membro",
          email: null,
          last_seen_at: null,
        };

        // Última mensagem
        const { data: lastMsg } = await supabase
          .from("messages")
          .select("*")
          .eq("conversation_id", part.conversation_id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        // Contagem de não lidas
        const lastRead = part.last_read_at || "1970-01-01";
        const { count: unread } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("conversation_id", part.conversation_id)
          .neq("sender_id", user.id)
          .is("deleted_at", null)
          .gt("created_at", lastRead);

        convList.push({
          id: part.conversation_id,
          otherUser: otherUserObj,
          lastMessage: (lastMsg as ChatMessage) || null,
          unreadCount: unread || 0,
          updatedAt: lastMsg?.created_at || new Date().toISOString(),
        });
      }

      convList.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      setConversations(convList);
    } catch (err) {
      console.error("Erro ao listar conversas:", err);
    } finally {
      setLoadingConversations(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user, loadConversations]);

  // 2. Carregar mensagens da conversa ativa
  const selectConversation = useCallback(
    async (convId: string, otherUser: ChatProfile) => {
      setActiveConvId(convId);
      setActiveOtherUser(otherUser);
      setLoadingMessages(true);
      setShowOptionsMenu(false);

      if (user) {
        // Verifica status de bloqueio mútuo
        const blockInfo = await checkBlockStatus(user.id, otherUser.user_id);
        setIsBlocked(blockInfo.isBlocked);
        setBlockedByMe(blockInfo.blockedByMe);

        // Marca como lida
        await markConversationAsRead(convId, user.id);
        // Atualiza contadores locais
        setConversations((prev) =>
          prev.map((c) => (c.id === convId ? { ...c, unreadCount: 0 } : c))
        );
      }

      const msgs = await fetchMessages(convId);
      setMessages(msgs);
      setLoadingMessages(false);
      setTimeout(() => scrollToBottom(false), 50);
    },
    [user, scrollToBottom]
  );

  // 3. Inscrição Realtime para a conversa ativa
  useEffect(() => {
    if (!activeConvId) return;

    const channel = supabase
      .channel(`chat-conversation-${activeConvId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${activeConvId}`,
        },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          setTimeout(() => scrollToBottom(true), 50);

          if (user && newMsg.sender_id !== user.id) {
            markConversationAsRead(activeConvId, user.id);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${activeConvId}`,
        },
        (payload) => {
          const updatedMsg = payload.new as ChatMessage;
          setMessages((prev) =>
            prev.map((m) => (m.id === updatedMsg.id ? updatedMsg : m))
          );
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [activeConvId, user, scrollToBottom]);

  // 4. Inscrição global para novas mensagens de qualquer conversa (atualiza lista)
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`user-chat-inbox-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        () => {
          loadConversations();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user, loadConversations]);

  // 5. Enviar mensagem
  async function handleSend(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!user || !activeConvId || !inputText.trim() || sending || isBlocked) return;

    const content = inputText.trim();
    setInputText("");
    setSending(true);

    const sent = await sendMessage(activeConvId, user.id, content);
    setSending(false);

    if (sent) {
      setMessages((prev) => (prev.some((m) => m.id === sent.id) ? prev : [...prev, sent]));
      setTimeout(() => scrollToBottom(true), 50);
      loadConversations();
    } else {
      toast.error("Não foi possível enviar a mensagem. Verifique sua conexão.");
    }
  }

  // 6. Tratar tecla Enter (desktop: Enter envia, Shift+Enter pula linha)
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      if (window.innerWidth >= 768) {
        e.preventDefault();
        handleSend();
      }
    }
  }

  // 7. Apagar mensagem
  async function handleDeleteMessage(msgId: string) {
    if (!user) return;
    const ok = await deleteMessage(msgId, user.id);
    if (ok) {
      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, deleted_at: new Date().toISOString() } : m))
      );
      toast.success("Mensagem apagada.");
    } else {
      toast.error("Não foi possível apagar a mensagem.");
    }
  }

  // 8. Buscar usuários para novo chat
  async function handleSearchUsers(q: string) {
    setSearchQuery(q);
    if (!user || q.trim().length < 1) {
      setSearchResults([]);
      return;
    }
    setSearchingUsers(true);
    const results = await searchProfiles(q, user.id);
    setSearchResults(results);
    setSearchingUsers(false);
  }

  // 9. Iniciar conversa com usuário selecionado
  async function handleStartChat(targetUser: ChatProfile) {
    if (!user) return;
    setShowNewChatModal(false);
    setSearchQuery("");
    setSearchResults([]);

    const convId = await getOrCreateConversation(user.id, targetUser.user_id);
    if (convId) {
      await loadConversations();
      selectConversation(convId, targetUser);
    } else {
      toast.error("Não foi possível iniciar a conversa.");
    }
  }

  // 10. Bloquear / Desbloquear usuário
  async function handleToggleBlock() {
    if (!user || !activeOtherUser) return;
    if (blockedByMe) {
      const ok = await unblockUser(user.id, activeOtherUser.user_id);
      if (ok) {
        setIsBlocked(false);
        setBlockedByMe(false);
        toast.success(`Usuário ${activeOtherUser.name || "desbloqueado"}.`);
      }
    } else {
      const ok = await blockUser(user.id, activeOtherUser.user_id);
      if (ok) {
        setIsBlocked(true);
        setBlockedByMe(true);
        toast.info("Usuário bloqueado. Você não receberá nem poderá enviar mensagens.");
      }
    }
    setShowOptionsMenu(false);
  }

  // 11. Enviar Denúncia
  async function handleSubmitReport(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !activeOtherUser || !reportReason.trim()) return;

    setSubmittingReport(true);
    const ok = await reportUser({
      reporterId: user.id,
      reportedUserId: activeOtherUser.user_id,
      conversationId: activeConvId || undefined,
      reason: reportReason.trim(),
    });
    setSubmittingReport(false);

    if (ok) {
      toast.success("Denúncia registrada. Nossa moderação analisará o caso.");
      setShowReportModal(false);
      setReportReason("");
    } else {
      toast.error("Não foi possível enviar a denúncia. Tente novamente.");
    }
  }

  // SE NÃO ESTIVER AUTENTICADO
  if (!isAuthLoading && !isAuthenticated) {
    return (
      <SiteLayout>
        <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 py-12 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-gold/15 text-gold">
            <MessageCircle className="size-7" />
          </div>
          <h1 className="mt-4 font-display text-2xl font-semibold sm:text-3xl">
            Mensagens Privadas
          </h1>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Faça login ou crie sua conta para conversar privadamente em tempo real com outros leitores, compartilhar edificações e estudos bíblicos.
          </p>
          <div className="mt-6 flex w-full flex-col gap-2.5 sm:flex-row sm:justify-center">
            <Button asChild className="h-11 px-6 font-medium">
              <Link to="/auth" search={{ mode: "signin", next: "/chat" }}>
                Entrar na minha conta
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-11 px-6 font-medium">
              <Link to="/auth" search={{ mode: "signup", next: "/chat" }}>
                Criar conta gratuita
              </Link>
            </Button>
          </div>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="mx-auto w-full max-w-6xl px-2 py-3 sm:px-4 sm:py-6">
        {/* Container Geral do Chat */}
        <div className="surface flex h-[calc(100dvh-7.5rem)] sm:h-[750px] w-full overflow-hidden rounded-xl border border-border shadow-sm">
          {/* =========================================================================
              COLUNA ESQUERDA: LISTA DE CONVERSAS (Oculta no mobile se chat estiver ativo)
              ========================================================================= */}
          <aside
            className={`flex flex-col border-r border-border bg-card/60 transition-all duration-200 ${
              activeConvId ? "hidden md:flex md:w-80 lg:w-96" : "w-full md:w-80 lg:w-96"
            }`}
          >
            {/* Cabeçalho da Lista */}
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4">
              <div className="flex items-center gap-2">
                <MessageCircle className="size-5 text-gold" />
                <h1 className="font-display text-lg font-semibold">Mensagens</h1>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="h-8 gap-1 text-xs font-medium"
                onClick={() => setShowNewChatModal(true)}
              >
                <Plus className="size-3.5" /> Nova conversa
              </Button>
            </div>

            {/* Lista com Rolagem */}
            <div className="flex-1 overflow-y-auto divide-y divide-border/40">
              {loadingConversations ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  Carregando conversas…
                </div>
              ) : conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center text-sm text-muted-foreground">
                  <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                    <User className="size-5 text-muted-foreground" />
                  </div>
                  <p className="mt-3 font-medium text-foreground">Nenhuma conversa ainda</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Inicie uma conversa privada com qualquer outro leitor.
                  </p>
                  <Button
                    size="sm"
                    className="mt-4"
                    onClick={() => setShowNewChatModal(true)}
                  >
                    Buscar usuário
                  </Button>
                </div>
              ) : (
                conversations.map((conv) => {
                  const isOnline = isUserOnline(conv.otherUser.user_id);
                  const isSelected = activeConvId === conv.id;
                  const name = conv.otherUser.name || conv.otherUser.email?.split("@")[0] || "Membro";

                  return (
                    <button
                      key={conv.id}
                      type="button"
                      onClick={() => selectConversation(conv.id, conv.otherUser)}
                      className={`flex w-full items-center gap-3 p-3.5 text-left transition-colors hover:bg-accent/50 ${
                        isSelected ? "bg-accent/80" : ""
                      }`}
                    >
                      {/* Avatar com status online */}
                      <div className="relative shrink-0">
                        <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                          {name.substring(0, 2).toUpperCase()}
                        </div>
                        {isOnline && (
                          <span
                            className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-background bg-emerald-500"
                            title="Online"
                          />
                        )}
                      </div>

                      {/* Dados da conversa */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="truncate text-sm font-medium text-foreground">{name}</p>
                          <span className="shrink-0 text-[11px] text-muted-foreground">
                            {formatConversationDate(conv.updatedAt)}
                          </span>
                        </div>
                        <div className="mt-0.5 flex items-center justify-between">
                          <p className="truncate text-xs text-muted-foreground">
                            {conv.lastMessage?.deleted_at ? (
                              <span className="italic">Mensagem apagada</span>
                            ) : (
                              conv.lastMessage?.content || "Iniciou uma conversa"
                            )}
                          </p>
                          {conv.unreadCount > 0 && (
                            <span className="ml-2 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          {/* =========================================================================
              COLUNA DIREITA: JANELA DO CHAT (Oculta no mobile se nenhuma conversa selecionada)
              ========================================================================= */}
          <main
            className={`flex flex-1 flex-col bg-background transition-all duration-200 ${
              !activeConvId ? "hidden md:flex" : "flex"
            }`}
          >
            {activeConvId && activeOtherUser ? (
              <>
                {/* Cabeçalho da conversa */}
                <div className="relative flex h-16 shrink-0 items-center justify-between border-b border-border bg-card/40 px-3 sm:px-4">
                  <div className="flex items-center gap-2.5">
                    {/* Botão voltar no mobile */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 md:hidden"
                      onClick={() => setActiveConvId(null)}
                      aria-label="Voltar para lista de conversas"
                    >
                      <ArrowLeft className="size-4" />
                    </Button>

                    {/* Avatar do Interlocutor */}
                    <div className="relative shrink-0">
                      <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-xs">
                        {(activeOtherUser.name || "U").substring(0, 2).toUpperCase()}
                      </div>
                      {isUserOnline(activeOtherUser.user_id) && (
                        <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-background bg-emerald-500" />
                      )}
                    </div>

                    {/* Nome e Status */}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold leading-tight">
                        {activeOtherUser.name || activeOtherUser.email?.split("@")[0] || "Membro"}
                      </p>
                      <p className="text-[11px] text-muted-foreground leading-tight">
                        {isUserOnline(activeOtherUser.user_id) ? (
                          <span className="font-medium text-emerald-600 dark:text-emerald-400">Online agora</span>
                        ) : activeOtherUser.last_seen_at ? (
                          `Visto por último às ${formatMessageTime(activeOtherUser.last_seen_at)}`
                        ) : (
                          "Offline"
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Menu de Opções (Bloquear / Denunciar) */}
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                      aria-label="Opções da conversa"
                    >
                      <MoreVertical className="size-4" />
                    </Button>

                    {showOptionsMenu && (
                      <div className="surface absolute right-0 top-10 z-50 w-48 rounded-lg border border-border p-1.5 shadow-lg">
                        <button
                          type="button"
                          onClick={handleToggleBlock}
                          className="flex w-full items-center gap-2 rounded px-2.5 py-2 text-left text-xs font-medium text-foreground hover:bg-accent"
                        >
                          <UserX className="size-3.5 text-destructive" />
                          {blockedByMe ? "Desbloquear usuário" : "Bloquear usuário"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowOptionsMenu(false);
                            setShowReportModal(true);
                          }}
                          className="flex w-full items-center gap-2 rounded px-2.5 py-2 text-left text-xs font-medium text-foreground hover:bg-accent"
                        >
                          <ShieldAlert className="size-3.5 text-amber-500" />
                          Denunciar usuário
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Banner de Usuário Bloqueado */}
                {isBlocked && (
                  <div className="bg-destructive/10 px-4 py-2 text-center text-xs text-destructive border-b border-destructive/20">
                    {blockedByMe
                      ? "Você bloqueou este usuário. Desbloqueie-o no menu superior para voltar a conversar."
                      : "Esta conversa foi bloqueada por um dos participantes."}
                  </div>
                )}

                {/* Área das Mensagens (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
                  {loadingMessages ? (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                      Carregando histórico…
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center text-center text-sm text-muted-foreground p-6">
                      <MessageCircle className="size-8 text-gold/60" />
                      <p className="mt-2 font-medium text-foreground">Início da conversa</p>
                      <p className="mt-1 text-xs text-muted-foreground max-w-xs leading-relaxed">
                        Envie uma mensagem de paz, estudo bíblico ou saudação para iniciar este diálogo.
                      </p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.sender_id === user?.id;
                      const isDeleted = Boolean(msg.deleted_at);

                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isMe ? "justify-end" : "justify-start"} group`}
                        >
                          <div
                            className={`relative max-w-[85%] sm:max-w-[70%] rounded-2xl px-3.5 py-2 text-sm shadow-xs ${
                              isMe
                                ? "bg-primary text-primary-foreground rounded-br-xs"
                                : "bg-muted/70 text-foreground border border-border/50 rounded-bl-xs"
                            }`}
                          >
                            {isDeleted ? (
                              <p className="italic text-xs opacity-70">Esta mensagem foi apagada</p>
                            ) : (
                              <p className="whitespace-pre-wrap break-words leading-relaxed">
                                {msg.content}
                              </p>
                            )}

                            <div className="mt-1 flex items-center justify-end gap-1 text-[10px] opacity-70">
                              <span>{formatMessageTime(msg.created_at)}</span>
                              {isMe && !isDeleted && (
                                <span title="Entregue">
                                  <CheckCheck className="size-3" />
                                </span>
                              )}
                            </div>

                            {/* Botão para apagar própria mensagem */}
                            {isMe && !isDeleted && (
                              <button
                                type="button"
                                onClick={() => handleDeleteMessage(msg.id)}
                                title="Apagar mensagem"
                                className="absolute -top-2 -left-2 hidden group-hover:flex size-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-xs"
                              >
                                <Trash2 className="size-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Campo de Digitação e Envio (Fixo na parte inferior) */}
                <div className="border-t border-border bg-card/50 p-2 sm:p-3">
                  <form onSubmit={handleSend} className="flex items-end gap-2">
                    <Textarea
                      ref={textareaRef}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      disabled={isBlocked || sending}
                      placeholder={
                        isBlocked
                          ? "Não é possível enviar mensagens para um usuário bloqueado."
                          : "Escreva sua mensagem… (Enter envia no desktop)"
                      }
                      rows={1}
                      maxLength={3000}
                      className="min-h-10 max-h-32 resize-none text-sm py-2 px-3 leading-tight"
                    />
                    <Button
                      type="submit"
                      disabled={!inputText.trim() || sending || isBlocked}
                      size="icon"
                      className="size-10 shrink-0 font-medium"
                      aria-label="Enviar mensagem"
                    >
                      <Send className="size-4" />
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              /* Nenhuma conversa selecionada no desktop */
              <div className="flex h-full flex-col items-center justify-center text-center p-8 text-muted-foreground">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-gold/10 text-gold">
                  <MessageCircle className="size-8" />
                </div>
                <h2 className="mt-4 font-display text-xl font-semibold text-foreground">
                  Suas Mensagens Privadas
                </h2>
                <p className="mt-1.5 max-w-sm text-xs leading-relaxed">
                  Selecione uma conversa ao lado para visualizar o histórico em tempo real ou clique em “Nova conversa” para pesquisar um leitor.
                </p>
                <Button
                  className="mt-5"
                  onClick={() => setShowNewChatModal(true)}
                >
                  <Plus className="mr-1.5 size-4" /> Iniciar nova conversa
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* =========================================================================
          MODAL: NOVA CONVERSA (Busca de Usuários)
          ========================================================================= */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="surface w-full max-w-md rounded-2xl border border-border p-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-display text-lg font-semibold">Nova Conversa</h3>
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={() => setShowNewChatModal(false)}
              >
                <X className="size-4" />
              </Button>
            </div>

            <div className="mt-4">
              <div className="relative">
                <Input
                  value={searchQuery}
                  onChange={(e) => handleSearchUsers(e.target.value)}
                  placeholder="Pesquisar por nome ou e-mail…"
                  className="pl-9 text-sm"
                  autoFocus
                />
                <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              </div>

              <div className="mt-3 max-h-64 overflow-y-auto divide-y divide-border/50">
                {searchingUsers ? (
                  <p className="py-4 text-center text-xs text-muted-foreground">Pesquisando…</p>
                ) : searchResults.length > 0 ? (
                  searchResults.map((u) => {
                    const displayName = u.name || u.email?.split("@")[0] || "Membro";
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => handleStartChat(u)}
                        className="flex w-full items-center gap-3 p-2.5 text-left transition-colors hover:bg-accent rounded-lg"
                      >
                        <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-xs shrink-0">
                          {displayName.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{displayName}</p>
                          <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </button>
                    );
                  })
                ) : searchQuery.trim() ? (
                  <p className="py-4 text-center text-xs text-muted-foreground">
                    Nenhum usuário encontrado com esse termo.
                  </p>
                ) : (
                  <p className="py-4 text-center text-xs text-muted-foreground">
                    Digite o nome ou e-mail de um membro para conversar.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: DENUNCIAR USUÁRIO
          ========================================================================= */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="surface w-full max-w-md rounded-2xl border border-border p-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-display text-lg font-semibold text-destructive flex items-center gap-2">
                <ShieldAlert className="size-5" /> Denunciar Usuário
              </h3>
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={() => setShowReportModal(false)}
              >
                <X className="size-4" />
              </Button>
            </div>

            <form onSubmit={handleSubmitReport} className="mt-4 space-y-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Nossa equipe preza pela edificação e respeito mútuo. Descreva o motivo da sua denúncia para que a moderação possa analisar.
              </p>
              <Textarea
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Explique o ocorrido (ex: ofensas, spam, conteúdo impróprio)..."
                rows={4}
                required
                className="text-sm resize-none"
              />
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReportModal(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  size="sm"
                  disabled={submittingReport || !reportReason.trim()}
                >
                  {submittingReport ? "Enviando…" : "Enviar denúncia"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </SiteLayout>
  );
}
