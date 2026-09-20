import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/SiteLayout";
import { useAuth } from "@/lib/auth-context";
import {
  fetchQuestionById,
  fetchAnswers,
  createAnswer,
  deleteAnswer,
  deleteQuestion,
  updateQuestion,
  COMMUNITY_CATEGORIES,
  toggleQuestionLike,
  toggleAnswerLike,
  togglePrayer,
  fetchPublicProfile,
  reportContent,
  formatRelativeDate,
  getCategoryMeta,
  REPORT_REASONS,
  checkSpamCooldown,
  recordPostTimestamp,
  sanitizeText,
  type Question,
  type Answer,
  type PublicProfileData,
  type ReportReason,
} from "@/lib/community";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Heart,
  MessageSquare,
  MoreVertical,
  Flag,
  Trash2,
  Pencil,
  Share2,
  BookOpen,
  User as UserIcon,
  Calendar,
  Layers,
  Loader2,
  Clock,
  Lock,
} from "lucide-react";
import { url } from "@/lib/site";

export const Route = createFileRoute("/comunidade/$id")({
  head: () => ({
    meta: [
      { title: "Publicação — Comunidade Palavra Viva | Bíblia Online" },
      {
        name: "description",
        content: "Leia, comente e participe das reflexões e orações da Comunidade Palavra Viva.",
      },
      { property: "og:title", content: "Comunidade Palavra Viva — Bíblia Online" },
      { property: "og:url", content: url("/comunidade") },
    ],
  }),
  component: QuestionDetailsPage,
});

function QuestionDetailsPage() {
  const { id } = Route.useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  // Edit Question Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");
  const [editVerse, setEditVerse] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");

  // New Answer State
  const [answerBody, setAnswerBody] = useState("");
  const [answerVerse, setAnswerVerse] = useState("");
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [answerError, setAnswerError] = useState("");

  // Visitor prompt modal
  const [isVisitorModalOpen, setIsVisitorModalOpen] = useState(false);
  const [visitorModalMessage, setVisitorModalMessage] = useState(
    "Entre na sua conta para interagir na comunidade."
  );

  // Report Modal State
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ type: "question" | "answer"; id: string } | null>(null);
  const [reportReason, setReportReason] = useState<ReportReason>(REPORT_REASONS[0]);
  const [reportDetails, setReportDetails] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  // Public Profile Modal State (strictly LGPD compliant)
  const [selectedAuthorId, setSelectedAuthorId] = useState<string | null>(null);
  const [publicProfile, setPublicProfile] = useState<PublicProfileData | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // Load question and answers
  const loadData = async () => {
    setIsLoading(true);
    setLoadError(false);
    try {
      const [qData, aData] = await Promise.all([
        fetchQuestionById(id, user?.id),
        fetchAnswers(id, user?.id),
      ]);
      setQuestion(qData);
      setAnswers(aData);
    } catch (err) {
      console.error(err);
      setLoadError(true);
      toast.error("Não foi possível carregar a publicação.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id, user?.id]);

  // Handle Question Like
  const handleLikeQuestion = async () => {
    if (!isAuthenticated || !user || !question) {
      setVisitorModalMessage("Entre para curtir esta publicação.");
      setIsVisitorModalOpen(true);
      return;
    }

    const willLike = !question.user_has_liked;
    setQuestion((prev) =>
      prev
        ? {
            ...prev,
            user_has_liked: willLike,
            likes_count: willLike ? prev.likes_count + 1 : Math.max(0, prev.likes_count - 1),
          }
        : null
    );

    try {
      await toggleQuestionLike(question.id, user.id, question.user_id);
    } catch {
      loadData();
    }
  };

  // Handle Prayer Intercession on Question
  const handleTogglePrayer = async () => {
    if (!isAuthenticated || !user || !question) {
      setVisitorModalMessage("Entre para se unir em oração por este irmão(ã).");
      setIsVisitorModalOpen(true);
      return;
    }

    const willPray = !question.user_has_prayed;
    setQuestion((prev) =>
      prev
        ? {
            ...prev,
            user_has_prayed: willPray,
            prayed_count: willPray
              ? (prev.prayed_count || 0) + 1
              : Math.max(0, (prev.prayed_count || 1) - 1),
          }
        : null
    );

    try {
      const res = await togglePrayer(question.id, user.id, question.user_id);
      if (res.userHasPrayed) {
        toast.success("Você se uniu em oração por este irmão(ã)! 🙏");
      }
    } catch {
      loadData();
    }
  };

  // Submit Answer / Comment
  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !user || !question) {
      setVisitorModalMessage("Entre para comentar nesta publicação.");
      setIsVisitorModalOpen(true);
      return;
    }

    const cleanBody = sanitizeText(answerBody.trim());
    if (!cleanBody || cleanBody.length < 3) {
      setAnswerError("Escreva um comentário com pelo menos 3 caracteres.");
      return;
    }

    const cooldown = checkSpamCooldown(user.id);
    if (cooldown.isLimited) {
      setAnswerError(
        `Por favor, aguarde ${cooldown.remainingSeconds} segundo(s) antes de comentar novamente.`
      );
      return;
    }

    try {
      setIsSubmittingAnswer(true);
      setAnswerError("");

      await createAnswer({
        questionId: question.id,
        userId: user.id,
        body: cleanBody,
        verseReference: answerVerse.trim() || undefined,
        questionAuthorId: question.user_id,
      });

      recordPostTimestamp(user.id);
      setAnswerBody("");
      setAnswerVerse("");
      toast.success("Comentário adicionado com sucesso!");
      loadData();
    } catch (err) {
      console.error(err);
      setAnswerError("Não foi possível adicionar o comentário. Tente novamente.");
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  // Handle Like Answer
  const handleLikeAnswer = async (answer: Answer) => {
    if (!isAuthenticated || !user || !question) {
      setVisitorModalMessage("Entre na sua conta para curtir este comentário.");
      setIsVisitorModalOpen(true);
      return;
    }

    const willLike = !answer.user_has_liked;
    setAnswers((prev) =>
      prev.map((a) =>
        a.id === answer.id
          ? {
              ...a,
              user_has_liked: willLike,
              likes_count: willLike ? a.likes_count + 1 : Math.max(0, a.likes_count - 1),
            }
          : a
      )
    );

    try {
      await toggleAnswerLike(answer.id, question.id, user.id, answer.user_id);
    } catch {
      loadData();
    }
  };

  // Open Edit Modal
  const handleOpenEditModal = () => {
    if (!question) return;
    setEditTitle(question.title || "");
    setEditBody(question.body);
    setEditCategoryId(question.category_id);
    setEditVerse(question.verse_reference || "");
    setEditError("");
    setIsEditModalOpen(true);
  };

  // Save Edit Publication
  const handleSaveEditPublication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question) return;

    const cleanBody = sanitizeText(editBody.trim());
    if (!cleanBody || cleanBody.length < 5) {
      setEditError("Por favor, escreva uma mensagem com pelo menos 5 caracteres.");
      return;
    }

    try {
      setIsSavingEdit(true);
      setEditError("");

      await updateQuestion(question.id, {
        title: editTitle.trim() || undefined,
        body: cleanBody,
        categoryId: editCategoryId,
        verseReference: editVerse.trim() || undefined,
      });

      toast.success("Publicação atualizada com sucesso.");
      setQuestion((prev) =>
        prev
          ? {
              ...prev,
              title: editTitle.trim() || prev.title,
              body: cleanBody,
              category_id: editCategoryId,
              verse_reference: editVerse.trim() || null,
            }
          : null
      );
      setIsEditModalOpen(false);
    } catch (err) {
      console.error(err);
      setEditError("Não foi possível atualizar a publicação. Tente novamente.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Delete question
  const handleDeleteQuestion = async () => {
    if (!confirm("Tem certeza que deseja excluir esta publicação?")) return;
    try {
      await deleteQuestion(id);
      toast.success("Publicação excluída com sucesso.");
      navigate({ to: "/comunidade" });
    } catch (err) {
      console.error(err);
      toast.error("Não foi possível excluir a publicação. Tente novamente.");
    }
  };

  // Delete answer
  const handleDeleteAnswer = async (answerId: string) => {
    if (!confirm("Tem certeza que deseja excluir este comentário?")) return;
    try {
      await deleteAnswer(answerId, id);
      toast.success("Comentário excluído com sucesso.");
      setAnswers((prev) => prev.filter((a) => a.id !== answerId));
      setQuestion((prev) =>
        prev ? { ...prev, answers_count: Math.max(0, (prev.answers_count || 1) - 1) } : null
      );
    } catch (err) {
      console.error(err);
      toast.error("Não foi possível excluir o comentário. Tente novamente.");
    }
  };

  // Copy Link / Share
  const handleShare = () => {
    const pageUrl = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(pageUrl);
      toast.success("Link da publicação copiado!");
    } else {
      toast.info(`Link: ${pageUrl}`);
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
    if (!user || !reportTarget) return;
    try {
      setIsSubmittingReport(true);
      const fullReason = reportDetails.trim()
        ? `${reportReason}: ${sanitizeText(reportDetails.trim())}`
        : reportReason;

      await reportContent({
        targetType: reportTarget.type,
        targetId: reportTarget.id,
        reporterId: user.id,
        reason: fullReason,
      });

      toast.success("Denúncia enviada com sucesso à equipe de moderação.");
      setIsReportOpen(false);
      setReportTarget(null);
      setReportDetails("");
    } catch {
      toast.error("Não foi possível enviar a denúncia.");
    } finally {
      setIsSubmittingReport(false);
    }
  };

  if (isLoading) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-4xl px-4 py-20 text-center text-muted-foreground">
          <Loader2 className="mx-auto size-8 animate-spin text-primary mb-3" />
          <p className="text-sm font-medium">Carregando publicação...</p>
        </div>
      </SiteLayout>
    );
  }

  if (!question) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-4xl px-4 py-20 text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10 text-2xl">
            🕊️
          </div>
          <h2 className="text-xl font-bold font-display">Publicação não encontrada</h2>
          <p className="text-sm text-muted-foreground mt-2 mb-6">
            Esta publicação pode ter sido removida pelo autor ou não está mais disponível.
          </p>
          <Button asChild>
            <Link to="/comunidade">Voltar para a Comunidade Palavra Viva</Link>
          </Button>
        </div>
      </SiteLayout>
    );
  }

  const isQuestionAuthor = user?.id === question.user_id;
  const isAnon = Boolean(question.title?.startsWith("[ANÔNIMO]"));
  const meta = getCategoryMeta(question.category_id);
  const isPrayerCategory =
    question.category_id === "oracao" || question.category_id === "pedido-de-oracao";

  return (
    <SiteLayout>
      <main className="mx-auto w-full max-w-4xl px-4 py-8">
        {/* Barra superior de navegação */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <Link to="/comunidade">
              <ArrowLeft className="size-4" /> Voltar para Comunidade
            </Link>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="gap-1.5 text-xs border-border"
          >
            <Share2 className="size-3.5" /> Compartilhar
          </Button>
        </div>

        {/* Card Principal da Publicação */}
        <article className="rounded-2xl border border-border/80 bg-card p-6 md:p-8 shadow-sm mb-8">
          {/* Categoria + Menu ⋮ */}
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-foreground">
                <span>{meta.emoji}</span>
                <span>{meta.name}</span>
              </span>

              {question.verse_reference && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/10 border border-gold/25 px-3 py-1 text-xs font-semibold text-gold">
                  <BookOpen className="size-3.5" /> {question.verse_reference}
                </span>
              )}
            </div>

            {/* Menu ⋮ */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground hover:text-foreground"
                >
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleShare} className="gap-2">
                  <Share2 className="size-4" /> Copiar link
                </DropdownMenuItem>
                {isQuestionAuthor ? (
                  <>
                    <DropdownMenuItem
                      onClick={handleOpenEditModal}
                      className="gap-2"
                    >
                      <Pencil className="size-4" /> Editar Publicação
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleDeleteQuestion}
                      className="text-destructive gap-2 focus:text-destructive"
                    >
                      <Trash2 className="size-4" /> Excluir Publicação
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
                      setReportTarget({ type: "question", id: question.id });
                      setIsReportOpen(true);
                    }}
                    className="gap-2 text-muted-foreground focus:text-destructive"
                  >
                    <Flag className="size-4" /> Denunciar
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Autor */}
          <div className="flex items-center gap-3 pb-4 mb-4 border-b border-border/60">
            {isAnon ? (
              <div
                className="size-11 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-bold text-base shrink-0"
                title="Publicação anônima"
              >
                <Lock className="size-5 text-muted-foreground" />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => handleOpenAuthorProfile(question.user_id)}
                className="size-11 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-base shrink-0 hover:ring-2 hover:ring-primary/40 transition-all overflow-hidden"
                title="Ver perfil público"
              >
                {question.author?.avatar_url ? (
                  <img
                    src={question.author.avatar_url}
                    alt={question.author.name || "Avatar"}
                    className="size-full object-cover"
                  />
                ) : (
                  (question.author?.name || (isQuestionAuthor && user?.user_metadata?.["name"]) || "U").charAt(0).toUpperCase()
                )}
              </button>
            )}
            <div>
              {isAnon ? (
                <span className="font-semibold text-sm text-muted-foreground block">
                  {isQuestionAuthor ? "Você (publicado anonimamente)" : "Pedido anônimo"}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleOpenAuthorProfile(question.user_id)}
                  className="font-semibold text-sm text-foreground hover:text-primary transition-colors text-left block"
                >
                  {question.author?.name || (isQuestionAuthor && user?.user_metadata?.["name"]) || "Usuário"}
                </button>
              )}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                <Clock className="size-3" />
                <span>Publicado {formatRelativeDate(question.created_at)}</span>
              </div>
            </div>
          </div>

          {/* Título opcional */}
          {question.title &&
            !question.title.startsWith("[ANÔNIMO]") &&
            question.title.trim() !== question.body.slice(0, 60).trim() && (
            <h1 className="font-display text-xl md:text-2xl font-bold tracking-tight text-foreground mb-4">
              {question.title}
            </h1>
          )}

          {/* Texto / Conteúdo */}
          <div className="text-foreground/90 leading-relaxed whitespace-pre-line text-sm md:text-base mb-6">
            {question.body}
          </div>

          {/* Ações: Orar + Curtir */}
          <div className="pt-4 border-t border-border/60 flex flex-wrap items-center gap-3">
            {isPrayerCategory && (
              <button
                type="button"
                onClick={handleTogglePrayer}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                  question.user_has_prayed
                    ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 scale-105"
                    : "bg-accent hover:bg-accent/80 text-foreground border border-border"
                }`}
              >
                <span>🙏</span>
                <span>{question.user_has_prayed ? "Você orou" : "Orar por esta pessoa"}</span>
                {(question.prayed_count || 0) > 0 && (
                  <span className="ml-1 rounded-full bg-background/80 px-2 py-0.5 text-[10px] font-bold">
                    {question.prayed_count}
                  </span>
                )}
              </button>
            )}

            <Button
              variant={question.user_has_liked ? "default" : "outline"}
              size="sm"
              onClick={handleLikeQuestion}
              className="gap-1.5 text-xs font-semibold"
            >
              <Heart className={`size-3.5 ${question.user_has_liked ? "fill-current" : ""}`} />
              <span>{question.user_has_liked ? "Curtido" : "Curtir"}</span>
              <span>({question.likes_count})</span>
            </Button>
          </div>
        </article>

        {/* Seção de Comentários */}
        <section aria-label="Comentários" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg md:text-xl font-bold flex items-center gap-2">
              <MessageSquare className="size-5 text-primary" />
              {answers.length} {answers.length === 1 ? "Comentário" : "Comentários"}
            </h2>
          </div>

          {/* Formulário de Novo Comentário */}
          <div className="rounded-xl border border-border/80 bg-card p-5 shadow-sm">
            {isAuthenticated ? (
              <form onSubmit={handleSubmitAnswer} className="space-y-3">
                {answerError && (
                  <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-2.5 text-xs text-destructive font-medium">
                    {answerError}
                  </div>
                )}
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">
                    Escreva seu comentário ou palavra de apoio
                  </label>
                  <Textarea
                    placeholder="Compartilhe seu encorajamento, oração ou reflexão bíblica..."
                    value={answerBody}
                    onChange={(e) => setAnswerBody(e.target.value)}
                    rows={3}
                    required
                    className="leading-relaxed"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                  <Input
                    placeholder="Referência bíblica (opcional, ex: Salmos 46:1)"
                    value={answerVerse}
                    onChange={(e) => setAnswerVerse(e.target.value)}
                    className="sm:max-w-xs text-xs h-9"
                    maxLength={60}
                  />

                  <Button
                    type="submit"
                    disabled={isSubmittingAnswer}
                    className="font-semibold text-xs h-9"
                  >
                    {isSubmittingAnswer ? (
                      <>
                        <Loader2 className="size-3.5 animate-spin mr-1.5" /> Enviando...
                      </>
                    ) : (
                      "Publicar Comentário"
                    )}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="py-6 text-center">
                <p className="text-sm text-muted-foreground mb-3">
                  Entre na sua conta para deixar uma palavra de apoio ou oração.
                </p>
                <Button asChild size="sm">
                  <Link to="/auth" search={{ mode: "signin" }}>
                    Entrar para comentar
                  </Link>
                </Button>
              </div>
            )}
          </div>

          {/* Lista de Comentários */}
          {answers.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground text-sm">
              Nenhum comentário por enquanto. Seja a primeira pessoa a deixar uma palavra de fé e
              amor!
            </div>
          ) : (
            answers.map((ans) => {
              const isAnswerAuthor = user?.id === ans.user_id;

              return (
                <div
                  key={ans.id}
                  className="rounded-xl border border-border/80 bg-card p-5 transition-all space-y-3"
                >
                  {/* Linha do autor do comentário */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleOpenAuthorProfile(ans.user_id)}
                        className="size-8 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-xs shrink-0 hover:ring-2 hover:ring-primary/40 transition-all overflow-hidden"
                        title="Ver perfil público"
                      >
                        {ans.author?.avatar_url ? (
                          <img
                            src={ans.author.avatar_url}
                            alt={ans.author.name || "Avatar"}
                            className="size-full object-cover"
                          />
                        ) : (
                          (ans.author?.name || (ans.user_id === user?.id && user?.user_metadata?.["name"]) || "U").charAt(0).toUpperCase()
                        )}
                      </button>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenAuthorProfile(ans.user_id)}
                            className="text-xs font-semibold text-foreground hover:text-primary transition-colors text-left"
                          >
                            {ans.author?.name || (ans.user_id === user?.id && user?.user_metadata?.["name"]) || "Usuário"}
                          </button>
                          {ans.user_id === question.user_id && (
                            <span className="rounded bg-primary/15 px-1.5 py-0.2 text-[9px] font-bold text-primary">
                              Autor
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          {formatRelativeDate(ans.created_at)}
                        </span>
                      </div>
                    </div>

                    {/* Menu ⋮ do Comentário */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 text-muted-foreground hover:text-foreground"
                        >
                          <MoreVertical className="size-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        {isAnswerAuthor ? (
                          <DropdownMenuItem
                            onClick={() => handleDeleteAnswer(ans.id)}
                            className="text-destructive gap-2 focus:text-destructive"
                          >
                            <Trash2 className="size-4" /> Excluir
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => {
                              if (!isAuthenticated) {
                                setVisitorModalMessage("Entre para denunciar um comentário.");
                                setIsVisitorModalOpen(true);
                                return;
                              }
                              setReportTarget({ type: "answer", id: ans.id });
                              setIsReportOpen(true);
                            }}
                            className="gap-2 text-muted-foreground focus:text-destructive"
                          >
                            <Flag className="size-4" /> Denunciar
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Referência bíblica no comentário se houver */}
                  {ans.verse_reference && (
                    <div className="inline-flex items-center gap-1.5 rounded-md bg-gold/10 border border-gold/20 px-2 py-0.5 text-xs text-gold font-medium">
                      <BookOpen className="size-3 shrink-0" />
                      <span>{ans.verse_reference}</span>
                    </div>
                  )}

                  {/* Conteúdo do Comentário */}
                  <p className="text-xs md:text-sm text-foreground/90 whitespace-pre-line leading-relaxed">
                    {ans.body}
                  </p>

                  {/* Curtir Comentário */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
                    <button
                      type="button"
                      onClick={() => handleLikeAnswer(ans)}
                      className={`flex items-center gap-1 transition-colors hover:text-red-500 ${
                        ans.user_has_liked ? "text-red-500 font-semibold" : "text-muted-foreground"
                      }`}
                    >
                      <Heart className={`size-3.5 ${ans.user_has_liked ? "fill-current" : ""}`} />
                      <span>{ans.likes_count}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </section>

        {/* MODAL: Aviso de Visitante / Login Necessário */}
        <Dialog open={isVisitorModalOpen} onOpenChange={setIsVisitorModalOpen}>
          <DialogContent className="sm:max-w-md text-center">
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

        {/* MODAL: Perfil Público (LGPD Compliant) */}
        <Dialog
          open={!!selectedAuthorId}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedAuthorId(null);
              setPublicProfile(null);
            }
          }}
        >
          <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display text-lg flex items-center gap-2">
                <UserIcon className="size-4 text-primary" /> Perfil Público
              </DialogTitle>
            </DialogHeader>

            {isLoadingProfile ? (
              <div className="py-12 text-center text-muted-foreground">
                <Loader2 className="mx-auto size-6 animate-spin text-primary mb-2" />
                <p className="text-xs">Carregando informações...</p>
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
                        const qMeta = getCategoryMeta(pq.category_id);
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
                                {qMeta.emoji} {qMeta.name}
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

        {/* MODAL: Denunciar Conteúdo */}
        <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display text-lg flex items-center gap-2">
                <Flag className="size-4 text-destructive" /> Denunciar Conteúdo
              </DialogTitle>
              <DialogDescription>
                Nossa moderação zela para manter um ambiente cristão acolhedor e fraterno.
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
                  placeholder="Explique brevemente a violação..."
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  rows={3}
                  maxLength={300}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <Button variant="outline" onClick={() => setIsReportOpen(false)}>
                  Cancelar
                </Button>
                <Button
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
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
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
