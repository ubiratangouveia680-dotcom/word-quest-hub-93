import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/SiteLayout";
import { AuthPromptModal } from "@/components/AuthPromptModal";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import {
  fetchPrayerRequests,
  createPrayerRequest,
  deletePrayerRequest,
  togglePrayerSupport,
  reportPrayerRequest,
  formatRelativeDate,
  checkPrayerCooldown,
  checkPrayerDailyQuota,
  PRAYER_REPORT_REASONS,
  type PrayerRequest,
  type PrayerReportReason,
} from "@/lib/prayer-wall";
import {
  isPushNotificationSupported,
  getNotificationPermission,
  subscribeToPrayerPush,
} from "@/lib/push-client";
import {
  registerDevicePushSubscription,
  notifyPrayerSupportInteraction,
} from "@/lib/push.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  MoreVertical,
  Flag,
  Trash2,
  BookOpen,
  Loader2,
  ShieldCheck,
  Bell,
  CheckCircle2,
  ArrowLeft,
  Calendar,
  Lock,
} from "lucide-react";
import { url } from "@/lib/site";

export const Route = createFileRoute("/comunidade/pedidos-de-oracao")({
  head: () => ({
    meta: [
      { title: "🙏 Mural de Pedidos de Oração — Compartilhe e Ore | Bíblia Online" },
      {
        name: "description",
        content: "Compartilhe seu pedido de oração com nossa comunidade cristã. Publique com seu nome ou de forma anônima e receba o apoio de irmãos em oração.",
      },
      { property: "og:title", content: "Mural de Pedidos de Oração — Bíblia Online" },
      {
        property: "og:description",
        content: "Compartilhe sua oração e interceda pelos irmãos da comunidade Palavra Viva.",
      },
      { property: "og:url", content: url("/comunidade/pedidos-de-oracao") },
    ],
    links: [{ rel: "canonical", href: url("/comunidade/pedidos-de-oracao") }],
  }),
  component: PrayerWallPage,
});

const PAGE_SIZE = 20;
const MAX_CHARS = 1000;

function PrayerWallPage() {
  const { user, isAuthenticated } = useAuth();

  // Feed State
  const [filter, setFilter] = useState<"recent" | "most_prayed">("recent");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [prayers, setPrayers] = useState<PrayerRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Push Permission State
  const [hasPushSupport, setHasPushSupport] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<string>("default");
  const [isActivatingPush, setIsActivatingPush] = useState(false);

  // Modal: Create Prayer Request
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [content, setContent] = useState("");
  const [verseReference, setVerseReference] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Modal: Visitor Prompt (Login required)
  const [isVisitorModalOpen, setIsVisitorModalOpen] = useState(false);
  const [visitorModalMessage, setVisitorModalMessage] = useState("");

  // Modal: Delete Confirmation
  const [deletingPrayerId, setDeletingPrayerId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Modal: Report
  const [reportingPrayerId, setReportingPrayerId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState<PrayerReportReason>("Spam");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  // Destacar pedido de oração via link direto de notificação (#prayer-ID)
  const [highlightedPrayerId, setHighlightedPrayerId] = useState<string | null>(null);

  // Load push permission status on mount
  useEffect(() => {
    setHasPushSupport(isPushNotificationSupported());
    setPermissionStatus(getNotificationPermission());
  }, []);

  // Load prayer requests feed
  const loadPrayers = async (reset = false) => {
    if (reset) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const offset = reset ? 0 : prayers.length;
      const data = await fetchPrayerRequests({
        filter,
        search: activeSearch,
        currentUserId: user?.id || null,
        limit: PAGE_SIZE,
        offset,
      });

      if (reset) {
        setPrayers(data);
      } else {
        setPrayers((prev) => [...prev, ...data]);
      }

      setHasMore(data.length === PAGE_SIZE);
    } catch (err) {
      console.error("Erro ao carregar pedidos de oração:", err);
      toast.error("Não foi possível carregar os pedidos de oração.");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    loadPrayers(true);
  }, [filter, activeSearch, user?.id]);

  // Trata hash navigation (#prayer-ID) ou query param (?id=ID) para rolar até o pedido referenciado pela notificação
  useEffect(() => {
    const handleTargetPrayer = () => {
      const hash = window.location.hash;
      const urlParams = new URLSearchParams(window.location.search);
      const queryId = urlParams.get("id");
      let targetId: string | null = null;

      if (hash && hash.startsWith("#prayer-")) {
        targetId = hash.replace("#prayer-", "");
      } else if (queryId) {
        targetId = queryId;
      }

      if (targetId) {
        setHighlightedPrayerId(targetId);
        setTimeout(() => {
          const el = document.getElementById(`prayer-${targetId}`);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 200);
      }
    };

    if (!isLoading && prayers.length > 0) {
      handleTargetPrayer();
    }

    window.addEventListener("hashchange", handleTargetPrayer);
    return () => {
      window.removeEventListener("hashchange", handleTargetPrayer);
    };
  }, [isLoading, prayers]);

  // Recupera rascunho de pedido de oração após login
  useEffect(() => {
    if (isAuthenticated) {
      try {
        const saved = localStorage.getItem("bo:prayer_draft");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.content) setContent(parsed.content);
          if (parsed.verseReference) setVerseReference(parsed.verseReference);
          if (typeof parsed.isAnonymous === "boolean") setIsAnonymous(parsed.isAnonymous);
          setIsCreateModalOpen(true);
          localStorage.removeItem("bo:prayer_draft");
        }
      } catch {
        // Silently ignore
      }
    }
  }, [isAuthenticated]);

  // Handle Search Submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchQuery.trim());
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    if (!isAuthenticated || !user) {
      setVisitorModalMessage("Para publicar um pedido de oração e receber orações da comunidade, você precisa criar uma conta gratuita.");
      setIsVisitorModalOpen(true);
      return;
    }
    setFormError("");
    setIsCreateModalOpen(true);
  };

  // Submit Create Prayer Request
  const handleSubmitPrayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !user) {
      if (content.trim()) {
        try {
          localStorage.setItem(
            "bo:prayer_draft",
            JSON.stringify({ content, verseReference, isAnonymous })
          );
        } catch {
          // ignore
        }
      }
      setVisitorModalMessage("Para publicar um pedido de oração, você precisa criar uma conta gratuita.");
      setIsVisitorModalOpen(true);
      return;
    }

    const cleanContent = content.trim();
    if (!cleanContent || cleanContent.length < 5) {
      setFormError("Por favor, escreva um pedido de oração com no mínimo 5 caracteres.");
      return;
    }

    if (cleanContent.length > MAX_CHARS) {
      setFormError(`O pedido excede o limite máximo de ${MAX_CHARS} caracteres.`);
      return;
    }

    // Cooldown check
    const cooldown = checkPrayerCooldown(user.id);
    if (!cooldown.allowed) {
      setFormError(`Por favor, aguarde ${cooldown.remainingSeconds} segundo(s) antes de publicar novamente.`);
      return;
    }

    // 24h Quota check
    const quota = await checkPrayerDailyQuota(user.id);
    if (!quota.allowed) {
      setFormError("Você atingiu o limite de 5 pedidos de oração por dia.");
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError("");

      const authorName = isAnonymous
        ? "Pedido anônimo"
        : user.user_metadata?.["full_name"] ||
          user.user_metadata?.["name"] ||
          user.email?.split("@")[0] ||
          "Irmão(ã) em Cristo";

      const created = await createPrayerRequest({
        userId: user.id,
        authorName,
        content: cleanContent,
        verseReference: verseReference.trim() || undefined,
        isAnonymous,
      });

      if (created) {
        toast.success("Seu pedido de oração foi publicado com sucesso no mural!");
        setContent("");
        setVerseReference("");
        setIsAnonymous(false);
        setIsCreateModalOpen(false);
        loadPrayers(true);
      }
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || "Não foi possível publicar seu pedido. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Prayer Support ("🙏 Vou orar por você")
  const handleTogglePrayer = async (e: React.MouseEvent, prayer: PrayerRequest) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated || !user) {
      setVisitorModalMessage("Entre ou crie sua conta para apoiar este pedido em oração.");
      setIsVisitorModalOpen(true);
      return;
    }

    const previousStatus = Boolean(prayer.user_has_prayed);
    const willPray = !previousStatus;
    const newCount = willPray ? prayer.prayed_count + 1 : Math.max(0, prayer.prayed_count - 1);

    // Optimistic UI Update
    setPrayers((prev) =>
      prev.map((item) =>
        item.id === prayer.id
          ? {
              ...item,
              user_has_prayed: willPray,
              prayed_count: newCount,
            }
          : item
      )
    );

    if (willPray) {
      toast.success("Você está orando por este pedido. Que o Senhor ouça sua intercessão!");
    } else {
      toast.info("Apoio em oração atualizado.");
    }

    try {
      const result = await togglePrayerSupport(prayer.id, user.id, prayer.prayed_count, prayer.user_id);
      setPrayers((prev) =>
        prev.map((item) =>
          item.id === prayer.id
            ? {
                ...item,
                user_has_prayed: result.prayed,
                prayed_count: result.count,
              }
            : item
        )
      );

      // Trigger notification if newly praying
      if (willPray && prayer.user_id && prayer.user_id !== user.id) {
        const { data: sData } = await supabase.auth.getSession();
        notifyPrayerSupportInteraction({
          data: {
            prayerAuthorId: prayer.user_id,
            actorUserId: user.id,
            prayerRequestId: prayer.id,
            ...(sData?.session?.access_token
              ? { accessToken: sData.session.access_token }
              : {}),
          },
        }).catch(() => {});
      }
    } catch (err) {
      console.error("Erro ao registrar oração:", err);
      // Revert optimistic update
      setPrayers((prev) =>
        prev.map((item) =>
          item.id === prayer.id
            ? {
                ...item,
                user_has_prayed: previousStatus,
                prayed_count: prayer.prayed_count,
              }
            : item
        )
      );
      toast.error("Não foi possível registrar sua oração no momento.");
    }
  };

  // Delete Prayer Request
  const handleConfirmDelete = async () => {
    if (!deletingPrayerId || !user?.id) return;

    try {
      setIsDeleting(true);
      const success = await deletePrayerRequest(deletingPrayerId, user.id);
      if (success) {
        toast.success("Pedido de oração excluído com sucesso.");
        setPrayers((prev) => prev.filter((p) => p.id !== deletingPrayerId));
      } else {
        toast.error("Não foi possível excluir o pedido de oração.");
      }
    } catch {
      toast.error("Erro ao excluir o pedido.");
    } finally {
      setIsDeleting(false);
      setDeletingPrayerId(null);
    }
  };

  // Submit Report
  const handleSubmitReport = async () => {
    if (!reportingPrayerId || !user?.id) return;

    try {
      setIsSubmittingReport(true);
      const success = await reportPrayerRequest({
        prayerRequestId: reportingPrayerId,
        reporterUserId: user.id,
        reason: reportReason,
      });

      if (success) {
        toast.success("Denúncia enviada para a moderação. Agradecemos por manter nossa comunidade edificante.");
      } else {
        toast.error("Não foi possível registrar a denúncia.");
      }
    } catch {
      toast.error("Erro ao enviar denúncia.");
    } finally {
      setIsSubmittingReport(false);
      setReportingPrayerId(null);
    }
  };

  // Activate Push Notifications
  const handleActivatePush = async () => {
    if (!hasPushSupport) {
      toast.error("Notificações Push não são suportadas por este navegador.");
      return;
    }

    try {
      setIsActivatingPush(true);
      const success = await subscribeToPrayerPush(user?.id);
      const perm = getNotificationPermission();
      setPermissionStatus(perm);

      if (success) {
        toast.success("Notificações push ativadas com sucesso neste aparelho!");
      } else if (perm === "denied") {
        toast.error("Notificações bloqueadas no navegador. Para ativar, libere as permissões nas configurações do site no seu navegador.");
      } else {
        toast.info("Permissão não concedida ou serviço indisponível.");
      }
    } catch {
      toast.error("Não foi possível ativar as notificações.");
    } finally {
      setIsActivatingPush(false);
    }
  };

  return (
    <SiteLayout>
      <main className="mx-auto w-full max-w-4xl px-4 sm:px-6 py-6 sm:py-8">
        {/* Navegação e link de retorno para a Comunidade */}
        <div className="mb-4">
          <Link
            to="/comunidade"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            <span>Voltar para Comunidade</span>
          </Link>
        </div>

        {/* 1. TOPO: TÍTULO, SUBTÍTULO E AÇÕES */}
        <header className="mb-6 rounded-2xl border border-border/80 bg-gradient-to-b from-card to-card/60 p-5 sm:p-7 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 rounded-full bg-gold/10 border border-gold/20 px-3 py-1 text-xs font-bold text-gold">
                <span>🙏</span>
                <span>Intercessão & Comunhão</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground tracking-tight">
                Mural de Pedidos de Oração
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl">
                Compartilhe seu pedido de oração com nossa comunidade. Você pode publicar com seu nome ou permanecer anônimo.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
              {/* Botão de Notificações */}
              {hasPushSupport && permissionStatus !== "granted" && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleActivatePush}
                  disabled={isActivatingPush}
                  className="h-10 text-xs font-semibold gap-1.5 cursor-pointer"
                >
                  <Bell className="size-4 text-gold" />
                  <span>{isActivatingPush ? "Ativando..." : "🔔 Ativar notificações"}</span>
                </Button>
              )}

              {/* Botão Principal: Novo Pedido */}
              <Button
                type="button"
                onClick={handleOpenCreateModal}
                className="h-10 text-xs sm:text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 shadow-sm cursor-pointer"
              >
                <Plus className="size-4" />
                <span>+ Fazer pedido de oração</span>
              </Button>
            </div>
          </div>
        </header>

        {/* 2. BARRA DE PESQUISA E FILTROS */}
        <div className="mb-6 space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Abas de Ordenação */}
            <div className="inline-flex rounded-xl bg-muted/60 p-1 border border-border/60">
              <button
                type="button"
                onClick={() => setFilter("recent")}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  filter === "recent"
                    ? "bg-card text-foreground shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Mais recentes
              </button>
              <button
                type="button"
                onClick={() => setFilter("most_prayed")}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  filter === "most_prayed"
                    ? "bg-card text-foreground shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Mais apoiados em oração
              </button>
            </div>

            {/* Barra de Pesquisa */}
            <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
              <Input
                placeholder="Pesquisar pedidos de oração..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-14 h-9 text-xs bg-card border-border/80"
              />
              <Search className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setActiveSearch("");
                  }}
                  className="absolute right-2 top-2 text-[11px] text-muted-foreground hover:text-foreground"
                >
                  Limpar
                </button>
              )}
            </form>
          </div>
        </div>

        {/* 3. FEED DE PEDIDOS DE ORAÇÃO */}
        <section aria-label="Lista de pedidos de oração" className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-border/70 bg-card p-5 animate-pulse space-y-3"
                  style={{ height: "auto" }}
                >
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-muted" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-4 w-32 bg-muted rounded" />
                      <div className="h-3 w-20 bg-muted/60 rounded" />
                    </div>
                  </div>
                  <div className="h-16 w-full bg-muted/50 rounded-lg" />
                  <div className="h-8 w-40 bg-muted rounded" />
                </div>
              ))}
            </div>
          ) : prayers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card/60 p-10 sm:p-14 text-center space-y-3">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-gold/10 text-2xl">
                🙏
              </div>
              <h3 className="text-base font-bold text-foreground">
                Nenhum pedido de oração encontrado
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                {activeSearch
                  ? "Não encontramos pedidos para o termo pesquisado. Tente outra palavra-chave."
                  : "Seja a primeira pessoa a compartilhar um pedido de oração com a comunidade."}
              </p>
              <div className="pt-2">
                <Button onClick={handleOpenCreateModal} className="gap-1.5 font-semibold text-xs">
                  <Plus className="size-4" />
                  <span>Publicar pedido de oração</span>
                </Button>
              </div>
            </div>
          ) : (
            prayers.map((prayer) => {
              const isAuthor = user?.id === prayer.user_id;
              const isHighlighted = highlightedPrayerId === prayer.id;

              return (
                <article
                  key={prayer.id}
                  id={`prayer-${prayer.id}`}
                  className={`w-full rounded-2xl border bg-card p-4 sm:p-5 shadow-xs transition-all ${
                    isHighlighted
                      ? "border-gold ring-2 ring-gold/40 shadow-lg bg-gold/5 dark:bg-gold/10"
                      : "border-border/80 hover:border-gold/30 hover:shadow-sm"
                  }`}
                  style={{ height: "auto" }}
                >
                  {/* Cabeçalho do Card: Autor / Anônimo + Data + Menu ⋮ */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Avatar / Ícone de Anônimo */}
                      {prayer.is_anonymous ? (
                        <div
                          className="size-10 rounded-full bg-gold/15 text-gold flex items-center justify-center font-bold text-base shrink-0 shadow-inner"
                          title="Pedido anônimo"
                        >
                          <span>🙏</span>
                        </div>
                      ) : (
                        <div className="size-10 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden">
                          {prayer.author_avatar ? (
                            <img
                              src={prayer.author_avatar}
                              alt={prayer.author_name || "Avatar"}
                              className="size-full object-cover"
                            />
                          ) : (
                            (prayer.author_name || "U").charAt(0).toUpperCase()
                          )}
                        </div>
                      )}

                      {/* Nome e Data */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-foreground truncate">
                            {prayer.author_name}
                          </span>
                          {prayer.is_anonymous && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-muted/80 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                              <Lock className="size-2.5" />
                              Anônimo
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
                          <Calendar className="size-3" />
                          <span>{formatRelativeDate(prayer.created_at)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Menu de Ações (•••) */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors"
                          aria-label="Opções do pedido"
                        >
                          <MoreVertical className="size-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44 text-xs">
                        {isAuthor && (
                          <DropdownMenuItem
                            onClick={() => setDeletingPrayerId(prayer.id)}
                            className="gap-2 text-destructive focus:text-destructive cursor-pointer"
                          >
                            <Trash2 className="size-3.5" />
                            <span>Excluir pedido</span>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => {
                            if (!isAuthenticated || !user) {
                              setVisitorModalMessage("Entre na sua conta para denunciar uma publicação.");
                              setIsVisitorModalOpen(true);
                              return;
                            }
                            setReportingPrayerId(prayer.id);
                          }}
                          className="gap-2 text-muted-foreground focus:text-foreground cursor-pointer"
                        >
                          <Flag className="size-3.5" />
                          <span>Denunciar pedido</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Conteúdo do Pedido de Oração (Quebra automática sem truncamento) */}
                  <div className="text-sm text-foreground/95 whitespace-pre-line leading-relaxed mb-3 break-words">
                    {prayer.content}
                  </div>

                  {/* Referência bíblica opcional */}
                  {prayer.verse_reference && (
                    <div className="inline-flex items-center gap-1.5 rounded-md bg-gold/10 border border-gold/20 px-2.5 py-1 text-xs font-semibold text-gold mb-3">
                      <BookOpen className="size-3.5 shrink-0" />
                      <span>{prayer.verse_reference}</span>
                    </div>
                  )}

                  {/* Divisor */}
                  <hr className="my-3 border-border/60" />

                  {/* Rodapé: Botão "Vou orar por você" + Contador real */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                    {/* Botão de Intercessão */}
                    <Button
                      type="button"
                      variant={prayer.user_has_prayed ? "default" : "outline"}
                      size="sm"
                      onClick={(e) => handleTogglePrayer(e, prayer)}
                      className={`h-9 px-4 text-xs font-semibold gap-2 justify-center transition-all cursor-pointer ${
                        prayer.user_has_prayed
                          ? "bg-amber-600 hover:bg-amber-700 text-white shadow-xs font-bold"
                          : "border-border/80 hover:border-gold/40 hover:bg-gold/5"
                      }`}
                    >
                      <span className="text-sm">🙏</span>
                      <span>
                        {prayer.user_has_prayed ? "Estou orando por você" : "Vou orar por você"}
                      </span>
                    </Button>

                    {/* Contador Real de Intercessores */}
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground self-start sm:self-center">
                      <span className="inline-flex items-center gap-1 bg-muted/60 px-2.5 py-1 rounded-full">
                        <span className="font-bold text-foreground">{prayer.prayed_count}</span>
                        <span>
                          {prayer.prayed_count === 1
                            ? "pessoa está orando"
                            : "pessoas estão orando"}
                        </span>
                      </span>
                    </div>
                  </div>
                </article>
              );
            })
          )}

          {/* Botão "Carregar Mais" */}
          {hasMore && prayers.length > 0 && (
            <div className="pt-4 text-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => loadPrayers(false)}
                disabled={isLoadingMore}
                className="w-full sm:w-auto h-10 px-8 text-xs font-semibold gap-2"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Carregando mais pedidos...</span>
                  </>
                ) : (
                  <span>Carregar mais pedidos de oração</span>
                )}
              </Button>
            </div>
          )}
        </section>

        {/* 4. MODAL: FAZER PEDIDO DE ORAÇÃO */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="max-w-lg p-5 sm:p-6">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl font-display font-bold text-foreground flex items-center gap-2">
                <span>🙏</span>
                <span>Fazer Pedido de Oração</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Escreva seu pedido com sinceridade. A comunidade Palavra Viva estará intercedendo por você.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmitPrayer} className="space-y-4 pt-2">
              {formError && (
                <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive font-medium">
                  {formError}
                </div>
              )}

              {/* Textarea do Pedido */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <Label htmlFor="prayer-content" className="font-semibold text-foreground">
                    Seu pedido de oração *
                  </Label>
                  <span
                    className={`text-[11px] font-mono ${
                      content.length > MAX_CHARS
                        ? "text-destructive font-bold"
                        : "text-muted-foreground"
                    }`}
                  >
                    {content.length} / {MAX_CHARS}
                  </span>
                </div>
                <Textarea
                  id="prayer-content"
                  placeholder="Conte-nos pelo que gostaria que a comunidade orasse (família, saúde, trabalho, libertação, gratidão)..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  maxLength={MAX_CHARS}
                  rows={5}
                  required
                  className="resize-none text-sm leading-relaxed"
                />
              </div>

              {/* Referência Bíblica Opcional */}
              <div className="space-y-1.5">
                <Label htmlFor="prayer-verse" className="text-xs font-semibold text-foreground">
                  Passagem ou versículo bíblico (opcional)
                </Label>
                <Input
                  id="prayer-verse"
                  placeholder="Ex: Filipenses 4:6, Salmos 91, Mateus 6:33"
                  value={verseReference}
                  onChange={(e) => setVerseReference(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              {/* Toggle de Publicação Anônima */}
              <div className="rounded-xl border border-border/80 bg-accent/20 p-3.5 flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-foreground">
                    <Lock className="size-3.5 text-gold" />
                    <span>Publicar anonimamente</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Seu nome e foto não serão exibidos para os outros usuários. O pedido aparecerá publicamente como <strong>"Pedido anônimo"</strong>.
                  </p>
                </div>
                <Switch
                  checked={isAnonymous}
                  onCheckedChange={setIsAnonymous}
                  id="anonymous-toggle"
                  aria-label="Publicar anonimamente"
                />
              </div>

              {/* Aviso de Privacidade e LGPD */}
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-[11px] text-muted-foreground flex items-start gap-2">
                <ShieldCheck className="size-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Aviso de Privacidade:</strong> Evite publicar dados confidenciais ou sensíveis, como documentos, telefone pessoal, endereço completo ou relatórios médicos.
                </p>
              </div>

              {/* Ações do Formulário */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreateModalOpen(false)}
                  disabled={isSubmitting}
                  className="text-xs"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting || content.trim().length < 5 || content.length > MAX_CHARS}
                  className="text-xs font-semibold bg-primary gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      <span>Publicando...</span>
                    </>
                  ) : (
                    <span>Publicar Pedido</span>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* 5. MODAL: VISITANTE NÃO LOGADO */}
        <AuthPromptModal
          open={isVisitorModalOpen}
          onOpenChange={setIsVisitorModalOpen}
          title="Participe dos Pedidos de Oração"
          description={visitorModalMessage || "Para interceder, orar ou publicar um pedido de oração, você precisa criar uma conta gratuita."}
          nextUrl="/comunidade/pedidos-de-oracao"
          icon="🙏"
        />

        {/* 6. MODAL: EXCLUSÃO DE PEDIDO DE ORAÇÃO */}
        <AlertDialog open={Boolean(deletingPrayerId)} onOpenChange={(open) => !open && setDeletingPrayerId(null)}>
          <AlertDialogContent className="max-w-md p-5 sm:p-6">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-base font-bold text-foreground">
                Tem certeza que deseja excluir este pedido de oração?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
                Esta ação removerá o pedido do mural da comunidade permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="pt-2">
              <AlertDialogCancel disabled={isDeleting} className="text-xs">
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs font-semibold"
              >
                {isDeleting ? "Excluindo..." : "Sim, excluir"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* 7. MODAL: DENUNCIAR PEDIDO */}
        <Dialog open={Boolean(reportingPrayerId)} onOpenChange={(open) => !open && setReportingPrayerId(null)}>
          <DialogContent className="max-w-md p-5 sm:p-6">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <Flag className="size-4 text-destructive" />
                <span>Denunciar Pedido de Oração</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Selecione o motivo da denúncia. Nossa moderação analisará o conteúdo.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2.5 pt-2">
              {PRAYER_REPORT_REASONS.map((reason) => (
                <label
                  key={reason}
                  className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-colors ${
                    reportReason === reason
                      ? "border-primary bg-primary/5 text-foreground"
                      : "border-border/70 bg-card hover:bg-accent/40 text-muted-foreground"
                  }`}
                >
                  <span>{reason}</span>
                  <input
                    type="radio"
                    name="report-reason"
                    value={reason}
                    checked={reportReason === reason}
                    onChange={() => setReportReason(reason)}
                    className="size-4 accent-primary"
                  />
                </label>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setReportingPrayerId(null)}
                disabled={isSubmittingReport}
                className="text-xs"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSubmitReport}
                disabled={isSubmittingReport}
                className="text-xs font-semibold bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isSubmittingReport ? "Enviando..." : "Enviar Denúncia"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </SiteLayout>
  );
}
