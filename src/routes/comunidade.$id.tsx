import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  fetchQuestionById,
  fetchAnswers,
  createAnswer,
  updateAnswer,
  deleteAnswer,
  deleteQuestion,
  toggleQuestionLike,
  toggleAnswerLike,
  toggleReaction,
  markAcceptedAnswer,
  reportContent,
  formatRelativeDate,
  CHRISTIAN_REACTIONS,
  INLINE_EMOJIS,
  type Question,
  type Answer,
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
  CheckCircle2,
  MoreVertical,
  Flag,
  Trash2,
  CornerDownRight,
  Sparkles,
  Share2,
  Check,
  BookOpen,
} from "lucide-react";

export const Route = createFileRoute("/comunidade/$id")({
  head: () => ({
    meta: [
      { title: "Pergunta — Comunidade Palavra Viva | Bíblia Online" },
      {
        name: "description",
        content: "Um espaço para perguntar, aprender, compartilhar e crescer no conhecimento da Palavra.",
      },
      { property: "og:title", content: "Comunidade Palavra Viva" },
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

  // New Answer State
  const [answerBody, setAnswerBody] = useState("");
  const [answerVerse, setAnswerVerse] = useState("");
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);

  // Threaded Reply State (replying to a specific answer)
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Report Modal State
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ type: "question" | "answer"; id: string } | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [reportSuccess, setReportSuccess] = useState(false);

  // Share copied toast
  const [copiedShare, setCopiedShare] = useState(false);

  // Load question and answers
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [qData, aData] = await Promise.all([
        fetchQuestionById(id, user?.id),
        fetchAnswers(id, user?.id),
      ]);
      setQuestion(qData);
      setAnswers(aData);
    } catch (err) {
      console.error(err);
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
      alert("Faça login para curtir.");
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

  // Handle Christian Reaction on Question
  const handleReactQuestion = async (emoji: string, reactionName: string) => {
    if (!isAuthenticated || !user || !question) {
      alert("Faça login para reagir.");
      return;
    }

    const currentReactions = question.user_reactions || [];
    const hasReacted = currentReactions.includes(emoji);
    const newReactions = hasReacted
      ? currentReactions.filter((e) => e !== emoji)
      : [...currentReactions, emoji];

    const currentSummary = { ...(question.reactions_summary || {}) };
    if (hasReacted) {
      currentSummary[emoji] = Math.max(0, (currentSummary[emoji] || 1) - 1);
      if (currentSummary[emoji] === 0) delete currentSummary[emoji];
    } else {
      currentSummary[emoji] = (currentSummary[emoji] || 0) + 1;
    }

    setQuestion((prev) =>
      prev
        ? {
            ...prev,
            user_reactions: newReactions,
            reactions_summary: currentSummary,
          }
        : null
    );

    try {
      await toggleReaction({
        targetType: "question",
        targetId: question.id,
        userId: user.id,
        emoji,
        reactionName,
        targetAuthorId: question.user_id,
        questionId: question.id,
      });
    } catch {
      loadData();
    }
  };

  // Handle Submit Answer
  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !user || !question) return;
    if (!answerBody.trim()) return;

    try {
      setIsSubmittingAnswer(true);
      await createAnswer({
        questionId: question.id,
        userId: user.id,
        body: answerBody,
        verseReference: answerVerse,
        questionAuthorId: question.user_id,
      });

      setAnswerBody("");
      setAnswerVerse("");
      loadData();
    } catch (err) {
      console.error(err);
      alert("Não foi possível enviar a resposta. Tente novamente.");
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  // Handle Submit Threaded Reply
  const handleSubmitReply = async (parentAnswer: Answer) => {
    if (!isAuthenticated || !user || !question) return;
    if (!replyBody.trim()) return;

    try {
      setIsSubmittingReply(true);
      await createAnswer({
        questionId: question.id,
        userId: user.id,
        parentId: parentAnswer.id,
        body: replyBody,
        parentAnswerAuthorId: parentAnswer.user_id,
      });

      setReplyBody("");
      setReplyingToId(null);
      loadData();
    } catch (err) {
      console.error(err);
      alert("Não foi possível enviar o comentário.");
    } finally {
      setIsSubmittingReply(false);
    }
  };

  // Handle Like Answer
  const handleLikeAnswer = async (answer: Answer) => {
    if (!isAuthenticated || !user || !question) {
      alert("Faça login para curtir.");
      return;
    }

    const willLike = !answer.user_has_liked;

    // Helper to update answers recursively
    const updateLikesInList = (list: Answer[]): Answer[] =>
      list.map((a) => {
        if (a.id === answer.id) {
          return {
            ...a,
            user_has_liked: willLike,
            likes_count: willLike ? a.likes_count + 1 : Math.max(0, a.likes_count - 1),
          };
        }
        if (a.replies && a.replies.length > 0) {
          return { ...a, replies: updateLikesInList(a.replies) };
        }
        return a;
      });

    setAnswers((prev) => updateLikesInList(prev));

    try {
      await toggleAnswerLike(answer.id, question.id, user.id, answer.user_id);
    } catch {
      loadData();
    }
  };

  // Handle Christian Reaction on Answer
  const handleReactAnswer = async (answer: Answer, emoji: string, reactionName: string) => {
    if (!isAuthenticated || !user || !question) {
      alert("Faça login para reagir.");
      return;
    }

    const currentReactions = answer.user_reactions || [];
    const hasReacted = currentReactions.includes(emoji);
    const newReactions = hasReacted
      ? currentReactions.filter((e) => e !== emoji)
      : [...currentReactions, emoji];

    const currentSummary = { ...(answer.reactions_summary || {}) };
    if (hasReacted) {
      currentSummary[emoji] = Math.max(0, (currentSummary[emoji] || 1) - 1);
      if (currentSummary[emoji] === 0) delete currentSummary[emoji];
    } else {
      currentSummary[emoji] = (currentSummary[emoji] || 0) + 1;
    }

    const updateReactionsInList = (list: Answer[]): Answer[] =>
      list.map((a) => {
        if (a.id === answer.id) {
          return {
            ...a,
            user_reactions: newReactions,
            reactions_summary: currentSummary,
          };
        }
        if (a.replies && a.replies.length > 0) {
          return { ...a, replies: updateReactionsInList(a.replies) };
        }
        return a;
      });

    setAnswers((prev) => updateReactionsInList(prev));

    try {
      await toggleReaction({
        targetType: "answer",
        targetId: answer.id,
        userId: user.id,
        emoji,
        reactionName,
        targetAuthorId: answer.user_id,
        questionId: question.id,
      });
    } catch {
      loadData();
    }
  };

  // Accept Answer as best answer (Question author only)
  const handleMarkAccepted = async (answer: Answer) => {
    if (!user || !question || question.user_id !== user.id) return;

    try {
      await markAcceptedAnswer(question.id, answer.id, answer.user_id, user.id);
      loadData();
    } catch (err) {
      console.error(err);
      alert("Não foi possível atualizar a resposta aceita.");
    }
  };

  // Delete question
  const handleDeleteQuestion = async () => {
    if (!confirm("Tem certeza que deseja excluir esta pergunta?")) return;
    try {
      await deleteQuestion(id);
      navigate({ to: "/comunidade" });
    } catch (err) {
      console.error(err);
      alert("Erro ao excluir pergunta.");
    }
  };

  // Delete answer
  const handleDeleteAnswer = async (answerId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta resposta?")) return;
    try {
      await deleteAnswer(answerId, id);
      loadData();
    } catch (err) {
      console.error(err);
      alert("Erro ao excluir resposta.");
    }
  };

  // Submit Report
  const handleSubmitReport = async () => {
    if (!user || !reportTarget || !reportReason.trim()) return;
    try {
      await reportContent({
        targetType: reportTarget.type,
        targetId: reportTarget.id,
        reporterId: user.id,
        reason: reportReason,
      });
      setReportSuccess(true);
      setTimeout(() => {
        setIsReportOpen(false);
        setReportSuccess(false);
        setReportReason("");
      }, 1500);
    } catch {
      alert("Não foi possível enviar a denúncia.");
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: question?.title ? `${question.title} — Comunidade Palavra Viva` : "Comunidade Palavra Viva",
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center text-muted-foreground">
        <div className="inline-block size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="mt-3 text-sm">Carregando discussão...</p>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h2 className="text-xl font-bold">Pergunta não encontrada</h2>
        <p className="text-sm text-muted-foreground mt-2 mb-4">Esta publicação pode ter sido removida.</p>
        <Button asChild>
          <Link to="/comunidade">Voltar à Comunidade Palavra Viva</Link>
        </Button>
      </div>
    );
  }

  const isQuestionAuthor = user?.id === question.user_id;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      {/* Navigation breadcrumb */}
      <div className="mb-6 flex items-center justify-between">
        <Button asChild variant="ghost" size="sm" className="gap-1.5 -ml-2 text-muted-foreground">
          <Link to="/comunidade">
            <ArrowLeft className="size-4" /> 📖 Comunidade Palavra Viva
          </Link>
        </Button>

        <Button variant="outline" size="sm" onClick={handleShare} className="gap-1.5 text-xs">
          {copiedShare ? <Check className="size-3.5 text-emerald-500" /> : <Share2 className="size-3.5" />}
          {copiedShare ? "Link Copiado!" : "Compartilhar"}
        </Button>
      </div>

      {/* Main Question Card */}
      <article className="rounded-2xl border border-border/80 bg-card p-6 md:p-8 shadow-sm mb-8">
        {/* Category & Verse reference */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            {question.category && (
              <span className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-foreground">
                <span>{question.category.icon}</span>
                <span>{question.category.name}</span>
              </span>
            )}
            {question.verse_reference && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/10 border border-gold/20 px-3 py-1 text-xs font-semibold text-gold">
                <BookOpen className="size-3.5" /> {question.verse_reference}
              </span>
            )}
            {question.is_answered && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-3.5" /> Respondida
              </span>
            )}
          </div>

          {/* Action menu (Edit / Delete / Report) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8 text-muted-foreground">
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isQuestionAuthor ? (
                <DropdownMenuItem onClick={handleDeleteQuestion} className="text-destructive gap-2">
                  <Trash2 className="size-4" /> Excluir Pergunta
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={() => {
                    setReportTarget({ type: "question", id: question.id });
                    setIsReportOpen(true);
                  }}
                  className="gap-2"
                >
                  <Flag className="size-4" /> Denunciar Publicação
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Question Title */}
        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-4">
          {question.title}
        </h1>

        {/* Author Info */}
        <div className="flex items-center gap-3 pb-6 border-b border-border/60">
          <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
            {question.author?.name ? question.author.name.charAt(0).toUpperCase() : "I"}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {question.author?.name || "Irmão(ã) em Cristo"}
            </p>
            <p className="text-xs text-muted-foreground">
              Publicado {formatRelativeDate(question.created_at)}
            </p>
          </div>
        </div>

        {/* Question Body */}
        <div className="py-6 text-foreground/90 leading-relaxed whitespace-pre-line text-sm md:text-base">
          {question.body}
        </div>

        {/* Reaction Bar & Like Button */}
        <div className="pt-4 border-t border-border/60 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Curated Christian Emoji Reactions */}
            <div className="flex flex-wrap items-center gap-1.5">
              {CHRISTIAN_REACTIONS.map((rec) => {
                const isSelected = question.user_reactions?.includes(rec.emoji);
                const count = question.reactions_summary?.[rec.emoji] || 0;
                return (
                  <button
                    key={rec.emoji}
                    onClick={() => handleReactQuestion(rec.emoji, rec.name)}
                    title={rec.name}
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs transition-all ${
                      isSelected
                        ? "bg-primary/20 border border-primary/40 font-bold scale-105"
                        : "bg-accent/60 hover:bg-accent border border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span>{rec.emoji}</span>
                    {count > 0 && <span className="text-[11px] font-semibold">{count}</span>}
                  </button>
                );
              })}
            </div>

            {/* Like Counter button */}
            <Button
              variant={question.user_has_liked ? "default" : "outline"}
              size="sm"
              onClick={handleLikeQuestion}
              className="gap-1.5 text-xs font-semibold"
            >
              <Heart className={`size-3.5 ${question.user_has_liked ? "fill-current" : ""}`} />
              <span>Curtir ({question.likes_count})</span>
            </Button>
          </div>
        </div>
      </article>

      {/* Answers Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold flex items-center gap-2">
            <MessageSquare className="size-5 text-primary" />
            {question.answers_count} {question.answers_count === 1 ? "Resposta" : "Respostas"}
          </h2>
        </div>

        {/* Submit Answer Box */}
        <div className="rounded-xl border border-border/80 bg-card p-5 shadow-sm">
          {isAuthenticated ? (
            <form onSubmit={handleSubmitAnswer} className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">
                  Escrever uma resposta edificante
                </span>
                {/* Inline emoji picker */}
                <div className="flex items-center gap-1 text-xs">
                  {INLINE_EMOJIS.slice(0, 8).map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setAnswerBody((prev) => prev + emoji)}
                      className="hover:scale-125 transition-transform"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <Textarea
                placeholder="Compartilhe seu entendimento bíblico ou palavra de conforto e oração..."
                value={answerBody}
                onChange={(e) => setAnswerBody(e.target.value)}
                rows={4}
                required
              />

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                <Input
                  placeholder="Referência bíblica (opcional, ex: Filipenses 4:6-7)"
                  value={answerVerse}
                  onChange={(e) => setAnswerVerse(e.target.value)}
                  className="sm:max-w-xs text-xs h-9"
                />

                <Button type="submit" disabled={isSubmittingAnswer} className="gap-1.5 font-semibold text-xs h-9">
                  <Sparkles className="size-3.5" />
                  {isSubmittingAnswer ? "Enviando..." : "Publicar Resposta"}
                </Button>
              </div>
            </form>
          ) : (
            <div className="py-4 text-center">
              <p className="text-xs text-muted-foreground mb-3">
                Entre na sua conta para responder e contribuir com a comunidade.
              </p>
              <Button asChild size="sm">
                <Link to="/auth" search={{ mode: "signin" }}>
                  Entrar ou Cadastrar
                </Link>
              </Button>
            </div>
          )}
        </div>

        {/* Answers List */}
        {answers.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground text-sm">
            Nenhuma resposta ainda. Seja o primeiro a responder e abençoar este irmão!
          </div>
        ) : (
          answers.map((ans) => {
            const isAnswerAuthor = user?.id === ans.user_id;

            return (
              <div
                key={ans.id}
                className={`rounded-xl border p-5 transition-all space-y-4 ${
                  ans.is_accepted
                    ? "border-emerald-500/40 bg-emerald-500/5 shadow-sm ring-1 ring-emerald-500/20"
                    : "border-border/80 bg-card"
                }`}
              >
                {/* Accepted Answer Banner if marked */}
                {ans.is_accepted && (
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="size-3.5" /> Resposta Aceita pelo Autor
                  </div>
                )}

                {/* Author row & Menu */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                      {ans.author?.name ? ans.author.name.charAt(0).toUpperCase() : "I"}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-foreground">
                          {ans.author?.name || "Irmão(ã) em Cristo"}
                        </span>
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

                  <div className="flex items-center gap-1">
                    {/* Mark as accepted button (question author only) */}
                    {isQuestionAuthor && (
                      <Button
                        variant={ans.is_accepted ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleMarkAccepted(ans)}
                        className={`text-xs h-7 gap-1 ${
                          ans.is_accepted ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""
                        }`}
                      >
                        <CheckCircle2 className="size-3.5" />
                        {ans.is_accepted ? "Aceita" : "Marcar como aceita"}
                      </Button>
                    )}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-7 text-muted-foreground">
                          <MoreVertical className="size-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {isAnswerAuthor ? (
                          <DropdownMenuItem onClick={() => handleDeleteAnswer(ans.id)} className="text-destructive gap-2">
                            <Trash2 className="size-4" /> Excluir Resposta
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => {
                              setReportTarget({ type: "answer", id: ans.id });
                              setIsReportOpen(true);
                            }}
                            className="gap-2"
                          >
                            <Flag className="size-4" /> Denunciar Resposta
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Verse quote if present */}
                {ans.verse_reference && (
                  <div className="rounded-lg bg-gold/10 border border-gold/20 p-2.5 text-xs text-gold font-medium flex items-center gap-1.5">
                    <BookOpen className="size-3.5 shrink-0" />
                    <span>Passagem bíblica citada: <strong>{ans.verse_reference}</strong></span>
                  </div>
                )}

                {/* Answer Content */}
                <p className="text-xs md:text-sm text-foreground/90 whitespace-pre-line leading-relaxed">
                  {ans.body}
                </p>

                {/* Answer Reaction Bar & Likes */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/50 text-xs">
                  <div className="flex flex-wrap items-center gap-1">
                    {CHRISTIAN_REACTIONS.slice(0, 5).map((rec) => {
                      const isSelected = ans.user_reactions?.includes(rec.emoji);
                      const count = ans.reactions_summary?.[rec.emoji] || 0;
                      return (
                        <button
                          key={rec.emoji}
                          onClick={() => handleReactAnswer(ans, rec.emoji, rec.name)}
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs transition-all ${
                            isSelected
                              ? "bg-primary/20 border border-primary/40 font-bold"
                              : "bg-accent/60 hover:bg-accent border border-transparent text-muted-foreground"
                          }`}
                        >
                          <span>{rec.emoji}</span>
                          {count > 0 && <span className="text-[10px] font-semibold">{count}</span>}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleLikeAnswer(ans)}
                      className={`flex items-center gap-1 transition-colors hover:text-red-500 ${
                        ans.user_has_liked ? "text-red-500 font-semibold" : "text-muted-foreground"
                      }`}
                    >
                      <Heart className={`size-3.5 ${ans.user_has_liked ? "fill-current" : ""}`} />
                      <span>{ans.likes_count}</span>
                    </button>

                    {isAuthenticated && (
                      <button
                        onClick={() => setReplyingToId(replyingToId === ans.id ? null : ans.id)}
                        className="text-primary hover:underline font-medium flex items-center gap-1"
                      >
                        <CornerDownRight className="size-3.5" /> Responder
                      </button>
                    )}
                  </div>
                </div>

                {/* Replying input box */}
                {replyingToId === ans.id && (
                  <div className="mt-3 rounded-lg border border-border bg-accent/30 p-3 space-y-2">
                    <span className="text-[11px] font-semibold text-foreground">
                      Respondendo a {ans.author?.name || "Irmão(ã)"}:
                    </span>
                    <Textarea
                      placeholder="Escreva seu comentário..."
                      value={replyBody}
                      onChange={(e) => setReplyBody(e.target.value)}
                      rows={2}
                      className="text-xs"
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setReplyingToId(null)}
                        className="h-7 text-xs"
                      >
                        Cancelar
                      </Button>
                      <Button
                        size="sm"
                        disabled={isSubmittingReply}
                        onClick={() => handleSubmitReply(ans)}
                        className="h-7 text-xs"
                      >
                        {isSubmittingReply ? "Enviando..." : "Enviar Resposta"}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Sub-replies (Threaded level 2) */}
                {ans.replies && ans.replies.length > 0 && (
                  <div className="mt-3 space-y-2.5 pl-4 border-l-2 border-border/70">
                    {ans.replies.map((reply) => (
                      <div key={reply.id} className="rounded-lg bg-accent/20 p-3 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">
                              {reply.author?.name || "Irmão(ã)"}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {formatRelativeDate(reply.created_at)}
                            </span>
                          </div>
                          {user?.id === reply.user_id && (
                            <button
                              onClick={() => handleDeleteAnswer(reply.id)}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="size-3" />
                            </button>
                          )}
                        </div>
                        <p className="text-foreground/90 whitespace-pre-line">{reply.body}</p>
                        <div className="flex items-center gap-3 pt-1 text-[11px]">
                          <button
                            onClick={() => handleLikeAnswer(reply)}
                            className={`flex items-center gap-1 hover:text-red-500 ${
                              reply.user_has_liked ? "text-red-500 font-semibold" : "text-muted-foreground"
                            }`}
                          >
                            <Heart className={`size-3 ${reply.user_has_liked ? "fill-current" : ""}`} />
                            <span>{reply.likes_count}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </section>

      {/* Report Content Dialog */}
      <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-lg">Denunciar Conteúdo</DialogTitle>
            <DialogDescription>
              Nossa comunidade é moderada para manter um ambiente cristão acolhedor e fraterno.
            </DialogDescription>
          </DialogHeader>

          {reportSuccess ? (
            <div className="rounded-lg bg-emerald-500/10 p-4 text-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              Obrigado! Sua denúncia foi enviada para a equipe de moderação.
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              <label className="text-xs font-semibold text-foreground block">
                Motivo da denúncia *
              </label>
              <Textarea
                placeholder="Descreva o motivo (ex: conteúdo ofensivo, spam, desrespeito doutrinário...)"
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                rows={4}
                required
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsReportOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSubmitReport} disabled={!reportReason.trim()}>
                  Enviar Denúncia
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
