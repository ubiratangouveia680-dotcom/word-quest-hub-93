import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  fetchCategories,
  fetchQuestions,
  createQuestion,
  useOnlineMembersCount,
  useUnreadNotificationsCount,
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  toggleQuestionLike,
  formatRelativeDate,
  INLINE_EMOJIS,
  type Category,
  type Question,
  type NotificationItem,
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Search,
  Plus,
  Bell,
  Heart,
  MessageSquare,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  Clock,
  Sparkles,
  Flame,
  Filter,
  ShieldCheck,
  Eye,
} from "lucide-react";

export const Route = createFileRoute("/comunidade/")({
  component: ComunidadeFeedPage,
});

function ComunidadeFeedPage() {
  const { user, isAuthenticated } = useAuth();
  const onlineCount = useOnlineMembersCount(user?.id);
  const unreadNotificationsCount = useUnreadNotificationsCount(user?.id);

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("todas");
  const [selectedFilter, setSelectedFilter] = useState<
    "recent" | "popular" | "most_answered" | "most_liked" | "answered" | "unanswered"
  >("recent");
  const [searchQuery, setSearchQuery] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Ask question modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newVerse, setNewVerse] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Notifications modal / popover
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Load categories
  useEffect(() => {
    fetchCategories().then((cats) => {
      setCategories(cats);
      if (cats.length > 0 && !newCategory) {
        setNewCategory(cats[0].id);
      }
    });
  }, []);

  // Load questions
  const loadQuestions = async () => {
    setIsLoading(true);
    try {
      const data = await fetchQuestions({
        category_id: selectedCategory,
        filter: selectedFilter,
        search: searchQuery,
        currentUserId: user?.id,
      });
      setQuestions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, [selectedCategory, selectedFilter, user?.id]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadQuestions();
  };

  // Handle Notifications load
  const loadUserNotifications = async () => {
    if (!user?.id) return;
    const notifs = await fetchNotifications(user.id);
    setNotifications(notifs);
  };

  useEffect(() => {
    if (isNotificationsOpen && user?.id) {
      loadUserNotifications();
    }
  }, [isNotificationsOpen, user?.id]);

  const handleMarkAllRead = async () => {
    if (!user?.id) return;
    await markAllNotificationsAsRead(user.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Submit new question
  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !user) return;
    if (!newTitle.trim()) {
      setSubmitError("Informe o título da sua pergunta.");
      return;
    }
    if (!newCategory) {
      setSubmitError("Selecione uma categoria.");
      return;
    }
    if (!newBody.trim()) {
      setSubmitError("Escreva a sua dúvida ou reflexão.");
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError("");
      await createQuestion({
        userId: user.id,
        categoryId: newCategory,
        title: newTitle,
        body: newBody,
        verseReference: newVerse,
      });

      setNewTitle("");
      setNewBody("");
      setNewVerse("");
      setIsModalOpen(false);
      loadQuestions();
    } catch (err: any) {
      console.error(err);
      setSubmitError("Não foi possível publicar. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Question Like directly from feed card
  const handleToggleLike = async (e: React.MouseEvent, q: Question) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated || !user) {
      alert("Faça login para curtir perguntas e respostas na comunidade.");
      return;
    }

    // Optimistic update
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
      // Revert on error
      loadQuestions();
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-primary/10 via-background to-gold/10 p-6 md:p-8 mb-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-3">
              <Sparkles className="size-3.5" />
              Comunidade Cristã Edificante
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Comunidade Word Quest
            </h1>
            <p className="mt-2 text-sm text-muted-foreground md:text-base max-w-xl">
              Tire dúvidas bíblicas, compartilhe testemunhos, peça oração e edifique a fé em Cristo Jesus com irmãos de todo o Brasil.
            </p>
            <div className="mt-4 flex items-center gap-3 text-xs font-medium text-muted-foreground">
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                {onlineCount} {onlineCount === 1 ? "membro online" : "membros online"}
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="size-3.5 text-primary" /> Moderação Fraterna
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Notifications */}
            {isAuthenticated && (
              <Popover open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon" className="relative shrink-0 border-border" aria-label="Notificações">
                    <Bell className="size-4" />
                    {unreadNotificationsCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground animate-bounce">
                        {unreadNotificationsCount > 9 ? "9+" : unreadNotificationsCount}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-80 p-0 shadow-lg border-border">
                  <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Bell className="size-3.5 text-primary" /> Notificações
                    </span>
                    {unreadNotificationsCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] text-primary hover:underline font-medium"
                      >
                        Marcar lidas
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-border/50 text-xs">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground">
                        Nenhuma notificação por enquanto.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <Link
                          key={n.id}
                          to="/comunidade/$id"
                          params={{ id: n.question_id }}
                          onClick={() => {
                            markNotificationAsRead(n.id);
                            setIsNotificationsOpen(false);
                          }}
                          className={`block p-3 transition-colors hover:bg-accent ${
                            !n.read ? "bg-primary/5 font-medium" : ""
                          }`}
                        >
                          <p className="text-foreground leading-snug">
                            <span className="font-semibold">{n.actor?.name || "Irmão(ã)"}</span>{" "}
                            {n.message}
                          </p>
                          <span className="mt-1 block text-[10px] text-muted-foreground">
                            {formatRelativeDate(n.created_at)}
                          </span>
                        </Link>
                      ))
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            )}

            {/* Ask Question Dialog */}
            {isAuthenticated ? (
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full md:w-auto gap-2 shadow-sm font-semibold">
                    <Plus className="size-4" />
                    Fazer uma Pergunta
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="font-display text-xl">Fazer uma Pergunta na Comunidade</DialogTitle>
                    <DialogDescription>
                      Compartilhe sua dúvida ou reflexão bíblica com amor e respeito cristão.
                    </DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleCreateQuestion} className="space-y-4 pt-2">
                    {submitError && (
                      <div className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive">
                        {submitError}
                      </div>
                    )}

                    <div>
                      <label className="text-xs font-semibold text-foreground mb-1 block">
                        Título da Pergunta *
                      </label>
                      <Input
                        placeholder="Ex: Qual o significado de João 3:16 no contexto histórico?"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        maxLength={150}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-foreground mb-1 block">
                          Categoria *
                        </label>
                        <select
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          required
                        >
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.icon} {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-foreground mb-1 block">
                          Passagem / Versículo (opcional)
                        </label>
                        <Input
                          placeholder="Ex: Romanos 8:28"
                          value={newVerse}
                          onChange={(e) => setNewVerse(e.target.value)}
                          maxLength={60}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-foreground">
                          Conteúdo detalhado *
                        </label>
                        {/* Inline Emoji helper */}
                        <div className="flex items-center gap-1 text-xs">
                          {INLINE_EMOJIS.slice(0, 6).map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => setNewBody((prev) => prev + emoji)}
                              className="hover:scale-125 transition-transform"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                      <Textarea
                        placeholder="Descreva o contexto, suas dúvidas ou ideias bíblicas..."
                        value={newBody}
                        onChange={(e) => setNewBody(e.target.value)}
                        rows={5}
                        required
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsModalOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Publicando..." : "Publicar Pergunta"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            ) : (
              <Button asChild className="w-full md:w-auto gap-2">
                <Link to="/auth" search={{ mode: "signin" }}>
                  <Plus className="size-4" /> Entrar para Perguntar
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Input
            placeholder="Pesquisar perguntas ou temas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-3 h-10"
          />
          <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
        </form>

        {/* Filters buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 text-xs no-scrollbar">
          <Button
            size="sm"
            variant={selectedFilter === "recent" ? "default" : "outline"}
            onClick={() => setSelectedFilter("recent")}
            className="gap-1 text-xs h-8"
          >
            <Clock className="size-3.5" /> Recentes
          </Button>
          <Button
            size="sm"
            variant={selectedFilter === "popular" ? "default" : "outline"}
            onClick={() => setSelectedFilter("popular")}
            className="gap-1 text-xs h-8"
          >
            <Flame className="size-3.5 text-orange-500" /> Populares
          </Button>
          <Button
            size="sm"
            variant={selectedFilter === "most_answered" ? "default" : "outline"}
            onClick={() => setSelectedFilter("most_answered")}
            className="gap-1 text-xs h-8"
          >
            <MessageSquare className="size-3.5" /> Mais respondidas
          </Button>
          <Button
            size="sm"
            variant={selectedFilter === "answered" ? "default" : "outline"}
            onClick={() => setSelectedFilter("answered")}
            className="gap-1 text-xs h-8"
          >
            <CheckCircle2 className="size-3.5 text-emerald-500" /> Respondidas
          </Button>
          <Button
            size="sm"
            variant={selectedFilter === "unanswered" ? "default" : "outline"}
            onClick={() => setSelectedFilter("unanswered")}
            className="gap-1 text-xs h-8"
          >
            <HelpCircle className="size-3.5 text-amber-500" /> Sem resposta
          </Button>
        </div>
      </div>

      {/* Categories Horizontal Carousel */}
      <div className="mb-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          <button
            onClick={() => setSelectedCategory("todas")}
            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === "todas"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-accent/70 hover:bg-accent text-foreground"
            }`}
          >
            🌟 Todas as Categorias
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-accent/70 hover:bg-accent text-foreground"
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Feed Questions List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="py-16 text-center text-muted-foreground">
            <div className="inline-block size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="mt-3 text-sm">Carregando perguntas da comunidade...</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center">
            <HelpCircle className="mx-auto size-10 text-muted-foreground/60 mb-3" />
            <h3 className="font-display text-lg font-semibold text-foreground">
              Nenhuma pergunta encontrada
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
              Seja o primeiro a iniciar uma conversa edificante nesta categoria!
            </p>
            {isAuthenticated ? (
              <Button onClick={() => setIsModalOpen(true)} className="gap-2">
                <Plus className="size-4" /> Fazer uma Pergunta
              </Button>
            ) : (
              <Button asChild>
                <Link to="/auth" search={{ mode: "signin" }}>
                  Entrar para Perguntar
                </Link>
              </Button>
            )}
          </div>
        ) : (
          questions.map((q) => (
            <Link
              key={q.id}
              to="/comunidade/$id"
              params={{ id: q.id }}
              className="block group rounded-xl border border-border/80 bg-card p-5 transition-all hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 flex-1 min-w-0">
                  {/* Category and verse badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    {q.category && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-medium text-foreground">
                        <span>{q.category.icon}</span>
                        <span>{q.category.name}</span>
                      </span>
                    )}
                    {q.verse_reference && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gold/10 border border-gold/20 px-2.5 py-0.5 text-[11px] font-medium text-gold">
                        📖 {q.verse_reference}
                      </span>
                    )}
                    {q.is_answered && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="size-3" /> Respondida
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h2 className="font-display text-base font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {q.title}
                  </h2>

                  {/* Body Snippet */}
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {q.body}
                  </p>
                </div>
              </div>

              {/* Card Footer: Author + Counters */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/50 pt-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px]">
                    {q.author?.name ? q.author.name.charAt(0).toUpperCase() : "I"}
                  </div>
                  <span className="font-medium text-foreground">
                    {q.author?.name || "Irmão(ã) em Cristo"}
                  </span>
                  <span>•</span>
                  <span>{formatRelativeDate(q.created_at)}</span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Reactions preview */}
                  {q.reactions_summary && Object.keys(q.reactions_summary).length > 0 && (
                    <div className="hidden sm:flex items-center gap-1 rounded-full bg-accent/60 px-2 py-0.5 text-[11px]">
                      {Object.entries(q.reactions_summary).slice(0, 3).map(([emoji, count]) => (
                        <span key={emoji} className="flex items-center gap-0.5">
                          {emoji} <span className="text-[10px]">{count}</span>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Likes counter */}
                  <button
                    type="button"
                    onClick={(e) => handleToggleLike(e, q)}
                    className={`flex items-center gap-1 transition-colors hover:text-red-500 ${
                      q.user_has_liked ? "text-red-500 font-semibold" : ""
                    }`}
                  >
                    <Heart className={`size-3.5 ${q.user_has_liked ? "fill-current" : ""}`} />
                    <span>{q.likes_count}</span>
                  </button>

                  {/* Answers counter */}
                  <div className="flex items-center gap-1">
                    <MessageSquare className="size-3.5 text-primary" />
                    <span className="font-semibold text-foreground">{q.answers_count}</span>
                  </div>

                  {/* Views counter */}
                  <div className="hidden sm:flex items-center gap-1 text-[11px]">
                    <Eye className="size-3.5 text-muted-foreground" />
                    <span>{q.views_count}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
