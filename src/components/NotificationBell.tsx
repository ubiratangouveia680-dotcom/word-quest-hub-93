import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Bell, Check, CheckCheck, Trash2, HeartHandshake } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  fetchUserNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  subscribeToUserNotifications,
  type UserNotification,
} from "@/lib/user-notifications";
import { formatRelativeDate } from "@/lib/community";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

interface NotificationBellProps {
  className?: string;
}

export function NotificationBell({ className }: NotificationBellProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasNewAlert, setHasNewAlert] = useState(false);

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    try {
      const [count, list] = await Promise.all([
        getUnreadNotificationCount(user.id),
        fetchUserNotifications(user.id, 25),
      ]);
      setUnreadCount(count);
      setNotifications(list);
    } catch (e) {
      console.warn("Falha ao carregar notificações:", e);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    loadData();

    // Inscrição Supabase Realtime
    const subscription = subscribeToUserNotifications(user.id, (payload) => {
      // Quando chegar nova notificação ou atualização
      loadData();
      if (payload.eventType === "INSERT") {
        setHasNewAlert(true);
        const refId = payload.new?.question_id || payload.new?.reference_id;
        const rawMsg = payload.new?.message || "Alguém publicou um novo pedido de oração. Ore por essa pessoa.";
        const cleanMsg = rawMsg.replace(/\s+/g, " ").trim();
        const shortDesc = cleanMsg.length > 90 ? cleanMsg.slice(0, 90) + "..." : cleanMsg;

        // Exibe toast com link direto para o pedido
        toast("🙏 Novo pedido de oração", {
          description: shortDesc,
          action: {
            label: "Ver pedido",
            onClick: () => {
              if (refId) {
                navigate({
                  to: "/comunidade/pedidos-de-oracao",
                  hash: `prayer-${refId}`,
                });
              } else {
                navigate({ to: "/comunidade/pedidos-de-oracao" });
              }
            },
          },
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id, loadData, navigate]);

  // Carrega ao abrir o popover
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setHasNewAlert(false);
      setIsLoading(true);
      loadData().finally(() => setIsLoading(false));
    }
  };

  const handleMarkAsRead = async (e: React.MouseEvent, item: UserNotification) => {
    e.stopPropagation();
    if (item.read) return;

    // Atualização otimista
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));

    await markNotificationAsRead(item.id);
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id || unreadCount === 0) return;

    // Atualização otimista
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);

    const ok = await markAllNotificationsAsRead(user.id);
    if (ok) {
      toast.success("Todas as notificações foram marcadas como lidas.");
    }
  };

  const handleDelete = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    const target = notifications.find((n) => n.id === notificationId);
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    if (target && !target.read) {
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    await deleteNotification(notificationId);
  };

  const handleNotificationClick = async (item: UserNotification) => {
    // 1. Marca como lida se ainda não estiver
    if (!item.read) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      markNotificationAsRead(item.id).catch(() => {});
    }

    // 2. Fecha popover
    setIsOpen(false);

    // 3. Navega diretamente ao pedido de oração correspondente
    if (item.reference_id) {
      navigate({
        to: "/comunidade/pedidos-de-oracao",
        hash: `prayer-${item.reference_id}`,
      });
    } else {
      navigate({ to: "/comunidade/pedidos-de-oracao" });
    }
  };

  if (!user) return null;

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`relative size-11 shrink-0 sm:size-9 rounded-full transition-colors cursor-pointer hover:bg-gold/10 ${className || ""}`}
          aria-label={
            unreadCount > 0
              ? `${unreadCount} notificações não lidas`
              : "Notificações"
          }
        >
          <Bell className="size-4.5 text-foreground transition-transform hover:rotate-12" />

          {/* Indicador de Não Lidas */}
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-background animate-in zoom-in-50 duration-200">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}

          {/* Efeito de pulso quando chega nova notificação */}
          {hasNewAlert && (
            <span className="absolute -top-0.5 -right-0.5 size-4 rounded-full bg-rose-500 animate-ping opacity-75 pointer-events-none" />
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[calc(100vw-32px)] sm:w-96 max-w-sm p-0 rounded-2xl border border-border/80 bg-card shadow-2xl overflow-hidden z-50"
      >
        {/* Cabeçalho do Popover */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-muted/30">
          <div className="flex items-center gap-2">
            <span className="text-base">🔔</span>
            <h3 className="text-sm font-bold text-foreground">Notificações</h3>
            {unreadCount > 0 && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gold/15 text-gold border border-gold/30">
                {unreadCount} nova{unreadCount > 1 ? "s" : ""}
              </span>
            )}
          </div>

          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground gap-1"
              title="Marcar todas como lidas"
            >
              <CheckCheck className="size-3.5" />
              <span className="hidden sm:inline">Marcar todas</span>
            </Button>
          )}
        </div>

        {/* Lista de Notificações */}
        <ScrollArea className="max-h-[380px] overflow-y-auto">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="size-8 rounded-full bg-muted shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 w-32 bg-muted rounded" />
                    <div className="h-3 w-full bg-muted/60 rounded" />
                    <div className="h-2.5 w-16 bg-muted/40 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center space-y-2.5">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted/50 text-2xl">
                🙏
              </div>
              <p className="text-xs font-semibold text-foreground">
                Nenhuma notificação por enquanto
              </p>
              <p className="text-[11px] text-muted-foreground max-w-[240px] mx-auto leading-relaxed">
                Quando outros irmãos publicarem novos pedidos de oração, você será avisado aqui para orar por eles.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {notifications.map((item) => {
                const isUnread = !item.read;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleNotificationClick(item)}
                    className={`group relative flex items-start gap-3 p-3.5 transition-colors cursor-pointer hover:bg-muted/50 ${
                      isUnread
                        ? "bg-gold/5 dark:bg-gold/10 font-medium"
                        : "bg-transparent"
                    }`}
                  >
                    {/* Ícone da Notificação */}
                    <div
                      className={`flex size-8 shrink-0 items-center justify-center rounded-full text-base ${
                        isUnread
                          ? "bg-gold/20 text-gold border border-gold/40 shadow-xs"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      🙏
                    </div>

                    {/* Conteúdo Textual */}
                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-foreground truncate">
                          {item.title}
                        </p>
                        {isUnread && (
                          <span className="size-2 rounded-full bg-rose-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5 leading-snug">
                        {item.message}
                      </p>
                      <p className="text-[10px] text-muted-foreground/70 mt-1">
                        {formatRelativeDate(item.created_at)}
                      </p>
                    </div>

                    {/* Ações de Hover / Tocar */}
                    <div className="absolute right-2 top-3 flex items-center gap-1 opacity-80 group-hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      {isUnread && (
                        <button
                          type="button"
                          onClick={(e) => handleMarkAsRead(e, item)}
                          className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-background/80 transition-colors"
                          title="Marcar como lida"
                          aria-label="Marcar como lida"
                        >
                          <Check className="size-3.5 text-gold" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => handleDelete(e, item.id)}
                        className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        title="Remover notificação"
                        aria-label="Remover notificação"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Rodapé do Popover */}
        <div className="p-2 border-t border-border/60 bg-muted/20 text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsOpen(false);
              navigate({ to: "/comunidade/pedidos-de-oracao" });
            }}
            className="w-full text-xs font-semibold text-gold hover:text-gold/90 hover:bg-gold/10 gap-1.5 h-8"
          >
            <HeartHandshake className="size-3.5" />
            <span>Ver Mural de Pedidos de Oração</span>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
