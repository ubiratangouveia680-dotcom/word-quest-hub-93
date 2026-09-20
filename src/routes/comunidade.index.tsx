import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useTransition } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/SiteLayout";
import { useAuth } from "@/lib/auth-context";
import {
  COMMUNITY_CATEGORIES,
  getCategoryMeta,
  REPORT_REASONS,
  checkSpamCooldown,
  recordPostTimestamp,
  sanitizeText,
  fetchQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  toggleQuestionLike,
  togglePrayer,
  fetchPublicProfile,
  reportContent,
  useOnlineMembersCount,
  formatRelativeDate,
  type Question,
  type PublicProfileData,
  type ReportReason,
} from "@/lib/community";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sparkles,
  Plus,
  Search,
  Heart,
  MessageSquare,
  ShieldCheck,
  MoreVertical,
  Flag,
  Trash2,
  Pencil,
  Share2,
  Check,
  User as UserIcon,
  Clock,
  BookOpen,
  X,
  Loader2,
  Calendar,
  Layers,
  ArrowRight,
  Lock,
} from "lucide-react";
import { url } from "@/lib/site";

interface SearchParams {
  shareVerse?: string;
  ref?: string;
  text?: string;
}

export const Route = createFileRoute("/comunidade/")({
  validateSearch: (search: Record<string, unknown> = {}): SearchParams => ({
    shareVerse: search.shareVerse ? String(search.shareVerse) : undefined,
    ref: search.ref ? String(search.ref) : undefined,
    text: search.text ? String(search.text) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Comunidade Palavra Viva — Compartilhe sua Fé e Oração | Bíblia Online" },
      {
        name: "description",
        content: "Compartilhe sua fé, reflexões, pedidos de oração e experiências com outras pessoas na Comunidade Palavra Viva.",
      },
      { property: "og:title", content: "Comunidade Palavra Viva — Bíblia Online" },
      {
        property: "og:description",
        content: "Compartilhe sua fé, reflexões, pedidos de oração e experiências com outras pessoas.",
      },
      { property: "og:url", content: url("/comunidade") },
    ],
    links: [{ rel: "canonical", href: url("/comunidade") }],
  }),
  component: ComunidadeFeedPage,
});

const PAGE_SIZE = 15;

function ComunidadeFeedPage() {
  const { shareVerse, ref: initialRef, text: initialText } = Route.useSearch();
  const { user, isAuthenticated } = useAuth();
  const onlineCount = useOnlineMembersCount(user?.id);

  // Feed State
  const [selectedCategory, setSelectedCategory] = useState<string>("todas");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [, startTransition] = useTransition();

  // Create Publication Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [categoryId, setCategoryId] = useState<string>(COMMUNITY_CATEGORIES[0].id);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [verseReference, setVerseReference] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Edit Publication Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editCategoryId, setEditCategoryId] = useState<string>(COMMUNITY_CATEGORIES[0].id);
  const [editVerse, setEditVerse] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");

  // Auth / Visitor Prompt Modal State
  const [isVisitorModalOpen, setIsVisitorModalOpen] = useState(false);
  const [visitorModalMessage, setVisitorModalMessage] = useState(
    "Entre na sua conta para participar da comunidade."
  );

  // Public Profile Modal State (strictly LGPD compliant)
  const [selectedAuthorId, setSelectedAuthorId] = useState<string | null>(null);
  const [publicProfile, setPublicProfile] = useState<PublicProfileData | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // Report Modal State
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportTargetId, setReportTargetId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState<ReportReason>(REPORT_REASONS[0]);
  const [reportDetails, setReportDetails] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  // Verse share auto-open
  useEffect(() => {
    if (shareVerse === "1" || initialRef || initialText) {
      setCategoryId("biblia"); // "Versículo"
      if (initialRef) setVerseReference(initialRef);
      if (initialText) setBody(`"${initialText}"`);
      if (isAuthenticated) {
        setIsCreateModalOpen(true);
      } else {
        setVisitorModalMessage("Entre na sua conta para compartilhar versículos na comunidade.");
        setIsVisitorModalOpen(true);
      }
    }
  }, [shareVerse, initialRef, initialText, isAuthenticated]);

  // Load questions from DB
  const loadFeed = async (reset = false) => {
    if (reset) {
      setIsLoading(true);
      setLoadError(false);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const currentOffset = reset ? 0 : questions.length;
      const data = await fetchQuestions({
        category_id: selectedCategory,
        search: activeSearch,
        currentUserId: user?.id,
        limit: PAGE_SIZE,
        offset: currentOffset,
      });

      if (reset) {
        setQuestions(data);
        setHasMore(data.length === PAGE_SIZE);
      } else {
        setQuestions((prev) => [...prev, ...data]);
        setHasMore(data.length === PAGE_SIZE);
      }
    } catch (err) {
      console.error(err);
      setLoadError(true);
      toast.error("Não foi possível carregar as publicações.");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    loadFeed(true);
  }, [selectedCategory, activeSearch, user?.id]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchQuery.trim());
  };

  // Open Create Modal handler
  const handleOpenCreateModal = () => {
    if (!isAuthenticated || !user) {
      setVisitorModalMessage("Entre na sua conta para participar da comunidade.");
      setIsVisitorModalOpen(true);
      return;
    }
    setFormError("");
    setIsCreateModalOpen(true);
  };

  // Submit new publication
  const handleSubmitPublication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !user) {
      setIsVisitorModalOpen(true);
      return;
    }

    const cleanBody = sanitizeText(body.trim());
    if (!cleanBody || cleanBody.length < 5) {
      setFormError("Por favor, escreva uma mensagem com pelo menos 5 caracteres.");
      return;
    }

    // Anti-spam cooldown check (15s)
    const cooldown = checkSpamCooldown(user.id);
    if (cooldown.isLimited) {
      setFormError(
        `Por favor, aguarde ${cooldown.remainingSeconds} segundo(s) antes de publicar novamente.`
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError("");

      const created = await createQuestion({
        userId: user.id,
        categoryId,
        title: title.trim() || undefined,
        body: cleanBody,
        verseReference: verseReference.trim() || undefined,
      });

      if (created) {
        recordPostTimestamp(user.id);
        toast.success("Publicação criada com sucesso.");
        setTitle("");
        setBody("");
        setVerseReference("");
        setIsCreateModalOpen(false);
        loadFeed(true);
      }
    } catch (err: any) {
      console.error(err);
      setFormError("Não foi possível publicar. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit Modal handler
  const handleOpenEditModal = (q: Question) => {
    setEditingQuestion(q);
    setEditTitle(q.title || "");
    setEditBody(q.body);
    setEditCategoryId(q.category_id);
    setEditVerse(q.verse_reference || "");
    setEditError("");
    setIsEditModalOpen(true);
  };

  // Submit Edit publication
  const handleSaveEditPublication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion) return;

    const cleanBody = sanitizeText(editBody.trim());
    if (!cleanBody || cleanBody.length < 5) {
      setEditError("Por favor, escreva uma mensagem com pelo menos 5 caracteres.");
      return;
    }

    try {
      setIsSavingEdit(true);
      setEditError("");

      await updateQuestion(editingQuestion.id, {
        title: editTitle.trim() || undefined,
        body: cleanBody,
        categoryId: editCategoryId,
        verseReference: editVerse.trim() || undefined,
      });

      toast.success("Publicação atualizada com sucesso.");
      setQuestions((prev) =>
        prev.map((item) =>
          item.id === editingQuestion.id
            ? {
                ...item,
                title: editTitle.trim() || undefined,
                body: cleanBody,
                category_id: editCategoryId,
                verse_reference: editVerse.trim() || null,
              }
            : item
        )
      );
      setIsEditModalOpen(false);
      setEditingQuestion(null);
    } catch (err) {
      console.error(err);
      setEditError("Não foi possível atualizar a publicação. Tente novamente.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Handle Like Toggle
  const handleToggleLike = async (e: React.MouseEvent, q: Question) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated || !user) {
      setVisitorModalMessage("Entre para curtir esta publicação.");
      setIsVisitorModalOpen(true);
      return;
    }

    const willLike = !q.user_has_liked;
    setQuestions((prev) =>
      prev.map((item) =>
        item.id === q.id
          ? {
              ...item,
              user_has_liked: willLike,
              likes_count: willLike ? item.likes_count + 1 : Math.max(0, item.likes_count - 1),
            }
          : item
      )
    );

    try {
      await toggleQuestionLike(q.id, user.id, q.user_id);
    } catch {
      loadFeed(true);
    }
  };

  // Handle Prayer Intercession Toggle ("🙏 Orar por esta pessoa")
  const handleTogglePrayer = async (e: React.MouseEvent, q: Question) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated || !user) {
      setVisitorModalMessage("Entre para orar por esta pessoa e registrar sua intercessão.");
      setIsVisitorModalOpen(true);
      return;
    }

    const willPray = !q.user_has_prayed;
    setQuestions((prev) =>
      prev.map((item) =>
        item.id === q.id
          ? {
              ...item,
              user_has_prayed: willPray,
              prayed_count: willPray ? (item.prayed_count || 0) + 1 : Math.max(0, (item.prayed_count || 1) - 1),
            }
          : item
      )
    );

    try {
      const res = await togglePrayer(q.id, user.id, q.user_id);
      if (res.userHasPrayed) {
        toast.success("Você se uniu em oração por este irmão(ã)! 🙏");
      }
    } catch {
      loadFeed(true);
    }
  };

  // Handle Delete Publication (Author only)
  const handleDeletePost = async (questionId: string) => {
    if (!confirm("Tem certeza de que deseja excluir esta publicação?")) return;
    try {
      await deleteQuestion(questionId);
      toast.success("Publicação excluída com sucesso.");
      setQuestions((prev) => prev.filter((item) => item.id !== questionId));
    } catch {
      toast.error("Erro ao excluir publicação.");
    }
  };

  // Handle Copy Link
  const handleCopyLink = (questionId: string) => {
    const fullUrl = `${window.location.origin}/comunidade/${questionId}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(fullUrl);
      toast.success("Link da publicação copiado!");
    } else {
      toast.info(`Link: ${fullUrl}`);
    }
  };

  // Open Public Profile Modal (LGPD compliant)
  const handleOpenAuthorProfile = async (authorId: string) => {
    setSelectedAuthorId(authorId);
    setIsLoadingProfile(true);
    try {
      const profile = await fetchPublicProfile(authorId);
      setPublicProfile(profile);
    } catch {
      toast.error("Não foi possível carregar o perfil.");
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // Submit Report
  const handleSubmitReport = async () => {
    if (!user || !reportTargetId) return;
    try {
      setIsSubmittingReport(true);
      const fullReason = reportDetails.trim()
        ? `${reportReason}: ${sanitizeText(reportDetails.trim())}`
        : reportReason;

      await reportContent({
        targetType: "question",
        targetId: reportTargetId,
        reporterId: user.id,
        reason: fullReason,
      });

      toast.success("Denúncia enviada à moderação. Agradecemos por zelar pelo ambiente cristão.");
      setIsReportModalOpen(false);
      setReportTargetId(null);
      setReportDetails("");
    } catch {
      toast.error("Erro ao enviar denúncia. Tente novamente.");
    } finally {
      setIsSubmittingReport(false);
    }
  };

  return (
    <SiteLayout>
      <main className="mx-auto w-full max-w-4xl px-4 py-8">
        {/* Header Principal */}
        <section className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-primary/10 via-background to-gold/10 p-6 md:p-8 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <Sparkles className="size-3.5" />
                Comunhão & Edificação na Fé
              </div>
              <h1 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                Comunidade Palavra Viva
              </h1>
              <p className="text-sm md:text-base text-muted-foreground max-w-xl leading-relaxed">
                Compartilhe sua fé, reflexões, pedidos de oração e experiências com outras pessoas.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-medium text-muted-foreground">
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  {onlineCount} {onlineCount === 1 ? "pessoa online" : "pessoas online"}
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="size-4 text-primary" /> Moderação Fraterna Ativa
                </span>
              </div>
            </div>

            {/* Botão + Nova publicação */}
            <div className="w-full md:w-auto shrink-0">
              <Button
                onClick={handleOpenCreateModal}
                size="lg"
                className="w-full md:w-auto gap-2 font-bold shadow-sm"
              >
                <Plus className="size-5" />
                + Nova publicação
              </Button>
            </div>
          </div>
        </section>

        {/* Banner de Destaque: Mural de Pedidos de Oração */}
        <div className="mb-6 rounded-2xl border border-gold/40 bg-gradient-to-r from-gold/15 via-gold/5 to-transparent p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="size-11 rounded-2xl bg-gold/20 text-gold flex items-center justify-center text-xl shrink-0 shadow-inner">
              🙏
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-foreground">
                  Mural de Pedidos de Oração
                </h2>
                <span className="rounded-full bg-gold/20 text-gold text-[10px] font-bold px-2 py-0.5">
                  Novo
                </span>
              </div>
              <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
                Compartilhe seus pedidos de oração de forma pública ou anônima, e apoie os irmãos em oração com um clique.
              </p>
            </div>
          </div>
          <Button
            asChild
            size="sm"
            className="shrink-0 w-full sm:w-auto font-semibold text-xs h-9 bg-gold text-primary-foreground hover:bg-gold/90 shadow-xs cursor-pointer"
          >
            <Link to="/comunidade/pedidos-de-oracao">
              <span>Acessar Mural de Oração</span>
              <ArrowRight className="ml-1.5 size-3.5" />
            </Link>
          </Button>
        </div>

        {/* Barra de Pesquisa e Filtros */}
        <div className="space-y-4 mb-6">
          {/* Caixa de Pesquisa */}
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Input
              placeholder="Pesquisar publicações, pedidos de oração ou testemunhos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-24 h-11 text-sm bg-card border-border"
            />
            <Search className="absolute left-3.5 top-3.5 size-4 text-muted-foreground" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setActiveSearch("");
                }}
                className="absolute right-20 top-3 text-muted-foreground hover:text-foreground text-xs"
              >
                Limpar
              </button>
            )}
            <Button
              type="submit"
              size="sm"
              className="absolute right-1.5 top-1.5 h-8 text-xs font-semibold"
            >
              Buscar
            </Button>
          </form>

          {/* Categorias canônicas em pílulas com rolagem suave */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar scroll-smooth touch-pan-x -mx-4 px-4 sm:mx-0 sm:px-0">
            <button
              onClick={() => setSelectedCategory("todas")}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === "todas"
                  ? "bg-primary text-primary-foreground shadow-sm scale-105"
                  : "bg-muted/70 hover:bg-muted text-foreground border border-border/70"
              }`}
            >
              🌟 Todas
            </button>
            {COMMUNITY_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? "bg-primary text-primary-foreground shadow-sm scale-105"
                    : "bg-muted/70 hover:bg-muted text-foreground border border-border/70"
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* FEED DE PUBLICAÇÕES */}
        <section aria-label="Feed de publicações" className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-xl border border-border/70 bg-card p-5 animate-pulse space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-muted" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-4 w-32 bg-muted rounded" />
                      <div className="h-3 w-20 bg-muted/60 rounded" />
                    </div>
                  </div>
                  <div className="h-4 w-3/4 bg-muted rounded" />
                  <div className="h-12 w-full bg-muted/50 rounded" />
                </div>
              ))}
            </div>
          ) : loadError && questions.length === 0 ? (
            <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center">
              <p className="text-sm font-semibold text-foreground mb-1">
                Não foi possível carregar as publicações.
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Por favor, verifique sua conexão ou tente novamente.
              </p>
              <Button onClick={() => loadFeed(true)} variant="outline" size="sm" className="gap-1.5 font-medium">
                Tentar novamente
              </Button>
            </div>
          ) : questions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card/60 p-12 text-center">
              <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10 text-2xl">
                🕊️
              </div>
              <p className="text-base font-semibold text-foreground max-w-md mx-auto mb-6 leading-relaxed">
                Seja a primeira pessoa a compartilhar algo com a comunidade.
              </p>
              <Button onClick={handleOpenCreateModal} className="gap-2 font-semibold">
                <Plus className="size-4" /> Nova publicação
              </Button>
            </div>
          ) : (
            questions.map((q) => {
              const meta = getCategoryMeta(q.category_id);
              const isPrayerCategory = q.category_id === "oracao" || q.category_id === "pedido-de-oracao";
              const isAuthor = user?.id === q.user_id;
              const isAnon = Boolean(q.title?.startsWith("[ANÔNIMO]"));

              return (
                <article
                  key={q.id}
                  className="group rounded-xl border border-border/80 bg-card p-5 transition-all hover:border-primary/40 hover:shadow-sm"
                >
                  {/* Topo do Card: Autor + Categoria + Menu ⋮ */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Avatar do Autor */}
                      {isAnon ? (
                        <div
                          className="size-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-bold text-xs shrink-0"
                          title="Publicação anônima"
                        >
                          <Lock className="size-4 text-muted-foreground" />
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenAuthorProfile(q.user_id)}
                          className="size-10 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-sm shrink-0 hover:ring-2 hover:ring-primary/40 transition-all overflow-hidden"
                          title="Ver perfil público"
                        >
                          {q.author?.avatar_url ? (
                            <img
                              src={q.author.avatar_url}
                              alt={q.author.name || "Avatar"}
                              className="size-full object-cover"
                            />
                          ) : (
                            (q.author?.name || (isAuthor && user?.user_metadata?.name) || "U").charAt(0).toUpperCase()
                          )}
                        </button>
                      )}

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          {isAnon ? (
                            <span className="font-semibold text-sm text-muted-foreground">
                              {isAuthor ? "Você (anônimo)" : "Pedido anônimo"}
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenAuthorProfile(q.user_id)}
                              className="font-semibold text-sm text-foreground hover:text-primary transition-colors truncate text-left"
                            >
                              {q.author?.name || (isAuthor && user?.user_metadata?.name) || "Usuário"}
                            </button>
                          )}

                          {/* Selo da Categoria */}
                          <span className="inline-flex items-center gap-1 rounded-full bg-accent/80 px-2.5 py-0.5 text-[11px] font-medium text-foreground">
                            <span>{meta.emoji}</span>
                            <span>{meta.name}</span>
                          </span>
                        </div>

                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                          <Clock className="size-3" />
                          <span>{formatRelativeDate(q.created_at)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Menu ⋮ */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground hover:text-foreground shrink-0"
                          aria-label="Opções da publicação"
                        >
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => handleCopyLink(q.id)} className="gap-2">
                          <Share2 className="size-4" /> Copiar link
                        </DropdownMenuItem>
                        {isAuthor ? (
                          <>
                            <DropdownMenuItem
                              onClick={() => handleOpenEditModal(q)}
                              className="gap-2"
                            >
                              <Pencil className="size-4" /> Editar publicação
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeletePost(q.id)}
                              className="text-destructive gap-2 focus:text-destructive"
                            >
                              <Trash2 className="size-4" /> Excluir publicação
                            </DropdownMenuItem>
                          </>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => {
                              if (!isAuthenticated) {
                                setVisitorModalMessage("Entre na sua conta para participar da comunidade.");
                                setIsVisitorModalOpen(true);
                                return;
                              }
                              setReportTargetId(q.id);
                              setIsReportModalOpen(true);
                            }}
                            className="gap-2 text-muted-foreground focus:text-destructive"
                          >
                            <Flag className="size-4" /> Denunciar
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Título opcional */}
                  {q.title &&
                    !q.title.startsWith("[ANÔNIMO]") &&
                    q.title.trim() !== q.body.slice(0, 60).trim() && (
                    <h2 className="font-display text-base font-bold text-foreground mb-2 leading-snug">
                      <Link
                        to="/comunidade/$id"
                        params={{ id: q.id }}
                        className="hover:text-primary transition-colors"
                      >
                        {q.title}
                      </Link>
                    </h2>
                  )}

                  {/* Corpo da Publicação */}
                  <p className="text-sm text-foreground/90 whitespace-pre-line leading-relaxed mb-3">
                    {q.body}
                  </p>

                  {/* Referência bíblica opcional */}
                  {q.verse_reference && (
                    <div className="inline-flex items-center gap-1.5 rounded-lg bg-gold/10 border border-gold/25 px-2.5 py-1 text-xs font-semibold text-gold mb-3">
                      <BookOpen className="size-3.5 shrink-0" />
                      <span>{q.verse_reference}</span>
                    </div>
                  )}

                  {/* Rodapé de Ações do Card */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/60 text-xs">
                    <div className="flex items-center gap-2">
                      {/* Botão especial "🙏 Orar por esta pessoa" se for Pedido de Oração */}
                      {isPrayerCategory && (
                        <button
                          type="button"
                          onClick={(e) => handleTogglePrayer(e, q)}
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                            q.user_has_prayed
                              ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 scale-105"
                              : "bg-accent hover:bg-accent/80 text-foreground border border-border"
                          }`}
                          title="Orar por esta pessoa"
                        >
                          <span>🙏</span>
                          <span>{q.user_has_prayed ? "Você orou" : "Orar por esta pessoa"}</span>
                          {(q.prayed_count || 0) > 0 && (
                            <span className="ml-1 rounded-full bg-background/80 px-1.5 py-0.2 text-[10px] font-bold">
                              {q.prayed_count}
                            </span>
                          )}
                        </button>
                      )}

                      {/* Botão Curtir */}
                      <button
                        type="button"
                        onClick={(e) => handleToggleLike(e, q)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                          q.user_has_liked
                            ? "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30"
                            : "bg-accent hover:bg-accent/80 text-muted-foreground hover:text-foreground border border-border"
                        }`}
                      >
                        <Heart
                          className={`size-3.5 ${q.user_has_liked ? "fill-current text-red-500" : ""}`}
                        />
                        <span>{q.user_has_liked ? "Curtido" : "Curtir"}</span>
                        <span>({q.likes_count})</span>
                      </button>
                    </div>

                    {/* Link para Comentários / Detalhes */}
                    <Link
                      to="/comunidade/$id"
                      params={{ id: q.id }}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                    >
                      <MessageSquare className="size-3.5" />
                      <span>
                        {q.answers_count} {q.answers_count === 1 ? "comentário" : "comentários"}
                      </span>
                    </Link>
                  </div>
                </article>
              );
            })
          )}

          {/* Botão Carregar Mais */}
          {!isLoading && hasMore && (
            <div className="pt-4 text-center">
              <Button
                variant="outline"
                size="lg"
                onClick={() => loadFeed(false)}
                disabled={isLoadingMore}
                className="w-full sm:w-auto font-semibold gap-2 border-border"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Carregando...
                  </>
                ) : (
                  "Carregar mais publicações"
                )}
              </Button>
            </div>
          )}
        </section>

        {/* MODAL: + Nova Publicação */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="font-display text-xl font-bold flex items-center gap-2">
                <span>✨</span> Nova Publicação
              </DialogTitle>
              <DialogDescription>
                Compartilhe sua fé, reflexão, pedido de oração ou testemunho com os irmãos.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmitPublication} className="space-y-4 pt-2">
              {formError && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-3 text-xs text-destructive font-medium">
                  {formError}
                </div>
              )}

              {/* Seletor de Categoria */}
              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5 block">
                  Selecione a Categoria *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {COMMUNITY_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategoryId(cat.id)}
                      className={`flex items-center gap-2 rounded-lg border p-2.5 text-left text-xs font-medium transition-all ${
                        categoryId === cat.id
                          ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                          : "border-border bg-card hover:bg-accent text-foreground"
                      }`}
                    >
                      <span className="text-base">{cat.emoji}</span>
                      <span className="truncate">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Título opcional */}
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  Título da publicação (opcional)
                </label>
                <Input
                  placeholder="Ex: Peço orações pela restauração da minha saúde"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={120}
                />
              </div>

              {/* Referência bíblica opcional */}
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  Referência bíblica (opcional)
                </label>
                <Input
                  placeholder="Ex: Salmos 23:1 ou Filipenses 4:6-7"
                  value={verseReference}
                  onChange={(e) => setVerseReference(e.target.value)}
                  maxLength={60}
                />
              </div>

              {/* Texto / Conteúdo */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-foreground">
                    Mensagem / Conteúdo *
                  </label>
                  <span className="text-[11px] text-muted-foreground">
                    {body.length} caracteres
                  </span>
                </div>
                <Textarea
                  placeholder="Escreva sua mensagem, pedido de oração ou testemunho com sinceridade..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={5}
                  required
                  className="leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting} className="font-bold">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin mr-2" /> Publicando...
                    </>
                  ) : (
                    "Publicar"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* MODAL: Aviso de Visitante / Login Necessário */}
        <Dialog open={isVisitorModalOpen} onOpenChange={setIsVisitorModalOpen}>
          <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6 text-center">
            <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-primary/10 text-2xl">
              🕊️
            </div>
            <DialogHeader>
              <DialogTitle className="font-display text-xl text-center">
                Participe da Comunidade Palavra Viva
              </DialogTitle>
              <DialogDescription className="text-center text-sm">
                {visitorModalMessage}
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-4">
              <Button asChild className="w-full sm:w-auto font-bold">
                <Link to="/auth" search={{ mode: "signin" }}>
                  Entrar na conta
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full sm:w-auto">
                <Link to="/auth" search={{ mode: "signup" }}>
                  Criar conta gratuita
                </Link>
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* MODAL: Perfil Público do Autor (LGPD Compliant - ZERO Dados Privados) */}
        <Dialog
          open={!!selectedAuthorId}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedAuthorId(null);
              setPublicProfile(null);
            }
          }}
        >
          <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-md max-h-[85vh] overflow-y-auto p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="font-display text-lg flex items-center gap-2">
                <UserIcon className="size-4 text-primary" /> Perfil Público
              </DialogTitle>
            </DialogHeader>

            {isLoadingProfile ? (
              <div className="py-12 text-center text-muted-foreground">
                <Loader2 className="mx-auto size-6 animate-spin text-primary mb-2" />
                <p className="text-xs">Carregando informações do membro...</p>
              </div>
            ) : publicProfile ? (
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-3 pb-3 border-b border-border">
                  <div className="size-14 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-xl shrink-0 overflow-hidden">
                    {publicProfile.avatar_url ? (
                      <img
                        src={publicProfile.avatar_url}
                        alt={publicProfile.name}
                        className="size-full object-cover"
                      />
                    ) : (
                      publicProfile.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold text-foreground">
                      {publicProfile.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                      <Calendar className="size-3.5" />
                      <span>
                        Membro desde{" "}
                        {new Date(publicProfile.created_at).toLocaleDateString("pt-BR", {
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Layers className="size-3.5 text-primary" /> Publicações deste membro (
                    {publicProfile.questions.length})
                  </h4>

                  {publicProfile.questions.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-4 text-center">
                      Nenhuma publicação encontrada para este membro.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {publicProfile.questions.map((pq) => {
                        const meta = getCategoryMeta(pq.category_id);
                        return (
                          <Link
                            key={pq.id}
                            to="/comunidade/$id"
                            params={{ id: pq.id }}
                            onClick={() => {
                              setSelectedAuthorId(null);
                              setPublicProfile(null);
                            }}
                            className="block rounded-lg border border-border p-3 text-xs hover:border-primary/40 hover:bg-accent/40 transition-colors"
                          >
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="font-medium text-foreground truncate">
                                {meta.emoji} {meta.name}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                {formatRelativeDate(pq.created_at)}
                              </span>
                            </div>
                            <p className="text-muted-foreground line-clamp-2">{pq.body}</p>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>

        {/* MODAL: Denunciar Publicação */}
        <Dialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
          <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="font-display text-lg flex items-center gap-2">
                <Flag className="size-4 text-destructive" /> Denunciar Publicação
              </DialogTitle>
              <DialogDescription>
                Selecione o motivo da denúncia. Nossa moderação analisa cada caso para manter um
                ambiente cristão e edificante.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  Motivo *
                </label>
                <div className="space-y-1.5">
                  {REPORT_REASONS.map((r) => (
                    <label
                      key={r}
                      className={`flex items-center gap-2 rounded-lg border p-2.5 text-xs cursor-pointer transition-colors ${
                        reportReason === r
                          ? "border-primary bg-primary/10 font-bold text-foreground"
                          : "border-border bg-card hover:bg-accent text-muted-foreground"
                      }`}
                    >
                      <input
                        type="radio"
                        name="reportReason"
                        value={r}
                        checked={reportReason === r}
                        onChange={() => setReportReason(r)}
                        className="accent-primary"
                      />
                      <span>{r}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  Detalhes adicionais (opcional)
                </label>
                <Textarea
                  placeholder="Explique brevemente por que este conteúdo viola as diretrizes..."
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  rows={3}
                  maxLength={300}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsReportModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={isSubmittingReport}
                  onClick={handleSubmitReport}
                  className="font-semibold"
                >
                  {isSubmittingReport ? "Enviando..." : "Enviar Denúncia"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* MODAL: Editar Publicação */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="font-display text-xl flex items-center gap-2">
                <Pencil className="size-5 text-primary" /> Editar Publicação
              </DialogTitle>
              <DialogDescription>
                Atualize o conteúdo de sua publicação na Comunidade Palavra Viva.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSaveEditPublication} className="space-y-4 pt-2">
              {editError && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-3 text-xs text-destructive font-medium">
                  {editError}
                </div>
              )}

              {/* Categoria */}
              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5 block">
                  Categoria *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {COMMUNITY_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setEditCategoryId(cat.id)}
                      className={`flex items-center gap-2 rounded-lg border p-2 text-xs font-medium transition-all text-left ${
                        editCategoryId === cat.id
                          ? "border-primary bg-primary/10 text-foreground font-semibold shadow-xs"
                          : "border-border bg-card hover:bg-accent text-muted-foreground"
                      }`}
                    >
                      <span className="text-sm">{cat.emoji}</span>
                      <span className="truncate">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Título opcional */}
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  Título (opcional)
                </label>
                <Input
                  placeholder="Ex: Reflexão sobre a graça salvadora"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  maxLength={120}
                />
              </div>

              {/* Versículo / Referência */}
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  Referência Bíblica (opcional)
                </label>
                <Input
                  placeholder="Ex: João 3:16 ou Filipenses 4:13"
                  value={editVerse}
                  onChange={(e) => setEditVerse(e.target.value)}
                  maxLength={80}
                />
              </div>

              {/* Texto / Conteúdo */}
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  Mensagem / Texto *
                </label>
                <Textarea
                  placeholder="Escreva sua reflexão, oração ou testemunho..."
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  rows={5}
                  required
                  className="leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSavingEdit}
                  className="font-semibold"
                >
                  {isSavingEdit ? (
                    <>
                      <Loader2 className="size-4 animate-spin mr-2" /> Salvando...
                    </>
                  ) : (
                    "Salvar Alterações"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </SiteLayout>
  );
}
