import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SiteLayout } from "@/components/SiteLayout";
import { AdBanner, AdDesktop } from "@/components/Ads";
import { useAuth } from "@/lib/auth-context";
import {
  fetchQuizQuestions,
  submitQuizAttempt,
  fetchQuizRanking,
} from "@/lib/quiz-service";
import {
  QuizQuestionClient,
  QuizOptionLetter,
  UserQuizAnswer,
  QuizFinalResult,
} from "@/lib/quiz-types";
import { url } from "@/lib/site";
import {
  HelpCircle,
  Trophy,
  CheckCircle2,
  XCircle,
  Award,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  BookOpen,
  UserCheck,
  Medal,
  ShieldCheck,
  Flame,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

export const Route = createFileRoute("/estudos/prova-biblica")({
  head: () => ({
    meta: [
      { title: "Prova Bíblica Online — Teste seus conhecimentos da Bíblia | Bíblia Online" },
      {
        name: "description",
        content:
          "Faça a Prova Bíblica com 10 questões aleatórias de múltipla escolha. Teste seus conhecimentos sobre o Antigo e Novo Testamento, confira o gabarito comentado e participe do ranking.",
      },
      { property: "og:title", content: "Prova Bíblica & Quiz da Bíblia — Bíblia Online" },
      {
        property: "og:description",
        content:
          "Teste seus conhecimentos bíblicos com 10 questões interativas. Obtenha 5 ou mais acertos para ser aprovado e veja sua posição no ranking!",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: url("/estudos/prova-biblica") },
    ],
    links: [{ rel: "canonical", href: url("/estudos/prova-biblica") }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Quiz",
          name: "Prova Bíblica Online",
          description: "Teste bíblico de múltipla escolha com 10 questões sobre as Escrituras Sagradas.",
          educationalLevel: "Básico a Intermediário",
          inLanguage: "pt-BR",
        }),
      },
    ],
  }),
  component: BibleQuizPage,
});

type QuizStep = "idle" | "in_progress" | "submitting" | "finished";

function BibleQuizPage() {
  const { user, profile, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<"prova" | "ranking">("prova");
  const [step, setStep] = useState<QuizStep>("idle");

  // Perguntas ativas da prova atual
  const [questions, setQuestions] = useState<QuizQuestionClient[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Armazena as respostas selecionadas pelo usuário (chave: id da pergunta)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, { letter: QuizOptionLetter; originalLetter: QuizOptionLetter }>>({});

  // Histórico de IDs respondidos para evitar repetições imediatas
  const [previousQuestionIds, setPreviousQuestionIds] = useState<string[]>([]);

  // Resultado final retornado pelo servidor
  const [finalResult, setFinalResult] = useState<QuizFinalResult | null>(null);

  // Consulta do Ranking
  const { data: rankings = [], isLoading: isLoadingRanking } = useQuery({
    queryKey: ["quiz-rankings"],
    queryFn: () => fetchQuizRanking(50),
    enabled: activeTab === "ranking",
  });

  // Mutação para iniciar nova prova (busca 10 questões)
  const startQuizMutation = useMutation({
    mutationFn: async () => {
      const q = await fetchQuizQuestions(user?.id, previousQuestionIds);
      return q;
    },
    onSuccess: (data) => {
      if (data.length < 10) {
        toast.error("Não foi possível carregar as 10 questões. Tente novamente.");
        return;
      }
      setQuestions(data);
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setFinalResult(null);
      setStep("in_progress");
      // Atualiza lista de IDs para a próxima tentativa
      setPreviousQuestionIds(data.map((item) => item.id));
    },
    onError: () => {
      toast.error("Erro ao gerar a prova bíblica. Verifique sua conexão.");
    },
  });

  // Modal para solicitar nome do visitante antes de salvar no ranking
  const [guestNameModalOpen, setGuestNameModalOpen] = useState(false);
  const [guestName, setGuestName] = useState("");

  // Mutação para submeter a prova
  const submitQuizMutation = useMutation({
    mutationFn: async (overrideName?: string) => {
      const answersArray: UserQuizAnswer[] = questions.map((q) => {
        const sel = selectedAnswers[q.id];
        return {
          questionId: q.id,
          selectedLetter: sel.letter,
          selectedOriginalLetter: sel.originalLetter,
        };
      });

      const nameToUse = overrideName || profile?.name || profile?.username || undefined;

      return await submitQuizAttempt(
        answersArray,
        user?.id,
        nameToUse,
        profile?.avatar_url
      );
    },
    onSuccess: (result) => {
      setFinalResult(result);
      setStep("finished");
      queryClient.invalidateQueries({ queryKey: ["quiz-rankings"] });
      queryClient.invalidateQueries({ queryKey: ["user-quiz-stats"] });
    },
    onError: () => {
      toast.error("Erro ao validar o resultado da prova.");
      setStep("in_progress");
    },
  });

  const currentQuestion = questions[currentQuestionIndex];
  const currentSelected = currentQuestion ? selectedAnswers[currentQuestion.id] : null;

  const handleSelectOption = (letter: QuizOptionLetter, originalLetter: QuizOptionLetter) => {
    if (!currentQuestion) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: { letter, originalLetter },
    }));
  };

  const handleNext = () => {
    if (!currentSelected) {
      toast.warning("Por favor, selecione uma alternativa para prosseguir.");
      return;
    }
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handleSubmit = () => {
    if (!currentSelected) {
      toast.warning("Por favor, selecione a resposta da última questão.");
      return;
    }

    // Valida que todas as 10 questões foram respondidas
    const answeredCount = Object.keys(selectedAnswers).length;
    if (answeredCount < 10) {
      toast.warning("Você precisa responder todas as 10 questões antes de finalizar.");
      return;
    }

    // Se estiver logado, salva diretamente com a conta do usuário
    if (isAuthenticated) {
      setStep("submitting");
      submitQuizMutation.mutate();
    } else {
      // Se não estiver logado, solicita o nome antes de finalizar
      setGuestNameModalOpen(true);
    }
  };

  const handleConfirmGuestName = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = guestName.trim();
    if (!trimmed) {
      toast.warning("Por favor, digite seu nome para registrar sua pontuação no ranking.");
      return;
    }
    setGuestNameModalOpen(false);
    setStep("submitting");
    submitQuizMutation.mutate(trimmed);
  };

  const handleRestart = () => {
    startQuizMutation.mutate();
  };

  return (
    <SiteLayout>
      {/* HERO SECTION */}
      <section className="border-b border-border/80 bg-gradient-to-b from-primary/10 via-card to-background px-4 py-8 sm:py-12">
        <div className="mx-auto max-w-4xl text-center">
          <nav className="text-xs text-muted-foreground mb-4">
            <Link to="/estudos" className="hover:text-foreground">
              Estudos
            </Link>
            <span className="mx-1.5">/</span>
            <span className="text-foreground font-medium">Prova Bíblica</span>
          </nav>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Trophy className="size-3.5" />
            Desafio Bíblico Interativo
          </span>

          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            PROVA BÍBLICA
          </h1>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground">
            Teste seus conhecimentos sobre a Bíblia.
          </p>
          <p className="mt-1 text-xs font-semibold text-primary">
            10 questões • 5 acertos para aprovação
          </p>

          {/* ABAS SUPERIORES */}
          <div className="mt-6 flex justify-center">
            <div className="inline-flex rounded-xl border border-border bg-card p-1 text-xs">
              <button
                onClick={() => setActiveTab("prova")}
                className={`rounded-lg px-4 py-1.5 font-medium transition-colors ${
                  activeTab === "prova"
                    ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Fazer Prova
              </button>
              <button
                onClick={() => setActiveTab("ranking")}
                className={`rounded-lg px-4 py-1.5 font-medium transition-colors flex items-center gap-1.5 ${
                  activeTab === "ranking"
                    ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Medal className="size-3.5" />
                Ranking Bíblico
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ÁREA DE CONTEÚDO */}
      <div className="mx-auto max-w-4xl px-4 py-8">
        {activeTab === "prova" && (
          <div>
            {/* ETAPA 1: TELA INICIAL */}
            {step === "idle" && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 text-center">
                  <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <BookOpen className="size-8" />
                  </div>

                  <h2 className="mt-4 font-display text-2xl font-bold text-foreground">
                    Pronto para testar seus conhecimentos?
                  </h2>
                  <p className="mt-2 max-w-xl mx-auto text-sm text-muted-foreground leading-relaxed">
                    Você responderá a <strong>10 questões de múltipla escolha</strong> sorteadas
                    aleatoriamente do nosso banco bíblico. Cada questão possui 4 alternativas e apenas uma correta.
                  </p>

                  <div className="mt-6 max-w-md mx-auto rounded-xl bg-muted/50 p-4 text-xs text-muted-foreground space-y-2 text-left">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                      <span><strong>Aprovação:</strong> Obtenha 5 ou mais acertos (50%+).</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                      <span><strong>Gabarito Completo:</strong> Veja as explicações bíblicas após finalizar.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                      <span><strong>Questões Variadas:</strong> A cada nova tentativa, novas perguntas são sorteadas.</span>
                    </div>
                  </div>

                  {!isAuthenticated && (
                    <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-800 dark:text-amber-300">
                      Você pode realizar a prova gratuitamente como visitante!{" "}
                      <Link to="/auth" className="font-semibold underline">
                        Entre ou crie uma conta
                      </Link>{" "}
                      para registrar seus pontos no Ranking Bíblico.
                    </div>
                  )}

                  <div className="mt-6">
                    <Button
                      size="lg"
                      onClick={() => startQuizMutation.mutate()}
                      disabled={startQuizMutation.isPending}
                      className="h-12 px-8 text-base font-bold shadow-md"
                    >
                      {startQuizMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 size-4 animate-spin" />
                          Sorteando questões...
                        </>
                      ) : (
                        <>
                          Iniciar Prova Bíblica <ArrowRight className="ml-2 size-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <AdBanner className="my-6" />
              </div>
            )}

            {/* ETAPA 2: PROVA EM ANDAMENTO */}
            {step === "in_progress" && currentQuestion && (
              <div className="space-y-6">
                {/* CABEÇALHO DO PROGRESSO */}
                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                    <span>
                      Questão {currentQuestionIndex + 1} de {questions.length}
                    </span>
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-primary">
                      {currentQuestion.category}
                    </span>
                  </div>

                  <Progress
                    value={((currentQuestionIndex + 1) / questions.length) * 100}
                    className="mt-3 h-2"
                  />
                </div>

                {/* PERGUNTA E ALTERNATIVAS */}
                <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Pergunta nº {currentQuestionIndex + 1}
                  </span>
                  <h2 className="mt-2 font-display text-xl sm:text-2xl font-bold text-foreground leading-snug">
                    {currentQuestion.question}
                  </h2>

                  {/* 4 ALTERNATIVAS COM TOQUE CONFORTÁVEL */}
                  <div className="mt-6 space-y-3">
                    {currentQuestion.options.map((opt) => {
                      const isSelected = currentSelected?.letter === opt.letter;
                      return (
                        <button
                          key={opt.letter}
                          type="button"
                          onClick={() => handleSelectOption(opt.letter, opt.originalLetter)}
                          className={`w-full text-left flex items-center gap-3.5 rounded-xl border p-4 text-sm sm:text-base font-medium transition-all ${
                            isSelected
                              ? "border-primary bg-primary/10 text-foreground ring-2 ring-primary/20 shadow-sm"
                              : "border-border bg-card hover:border-primary/40 hover:bg-muted/30 text-foreground"
                          }`}
                        >
                          <span
                            className={`flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                              isSelected
                                ? "bg-primary text-primary-foreground"
                                : "border border-border bg-muted text-muted-foreground"
                            }`}
                          >
                            {opt.letter}
                          </span>
                          <span className="leading-relaxed">{opt.text}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* BOTÕES DE NAVEGAÇÃO */}
                  <div className="mt-8 flex items-center justify-between border-t border-border/80 pt-5">
                    {currentQuestionIndex > 0 ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                        className="text-xs gap-1"
                      >
                        <ArrowLeft className="size-3.5" /> Anterior
                      </Button>
                    ) : (
                      <div />
                    )}

                    {currentQuestionIndex < questions.length - 1 ? (
                      <Button
                        type="button"
                        onClick={handleNext}
                        disabled={!currentSelected}
                        className="gap-1 text-xs font-semibold px-5"
                      >
                        Próxima questão <ArrowRight className="size-3.5" />
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!currentSelected}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-xs font-bold px-6 shadow-sm"
                      >
                        <Check className="size-4" /> Finalizar Prova
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ETAPA 3: PROCESSANDO RESULTADO */}
            {step === "submitting" && (
              <div className="rounded-2xl border border-border bg-card p-12 text-center">
                <Loader2 className="mx-auto size-10 animate-spin text-primary" />
                <h3 className="mt-4 font-display text-xl font-bold text-foreground">
                  Validando suas respostas...
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Calculando nota e gerando gabarito comentado com referências bíblicas.
                </p>
              </div>
            )}

            {/* ETAPA 4: RESULTADO FINAL E GABARITO COMENTADO */}
            {step === "finished" && finalResult && (
              <div className="space-y-8">
                {/* CARD PRINCIPAL DO RESULTADO */}
                <div
                  className={`rounded-2xl border p-6 sm:p-8 text-center shadow-md ${
                    finalResult.passed
                      ? "border-emerald-500/40 bg-gradient-to-b from-emerald-500/10 via-card to-background"
                      : "border-amber-500/40 bg-gradient-to-b from-amber-500/10 via-card to-background"
                  }`}
                >
                  <div
                    className={`mx-auto flex size-16 items-center justify-center rounded-2xl ${
                      finalResult.passed
                        ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                        : "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {finalResult.passed ? (
                      <Trophy className="size-8" />
                    ) : (
                      <BookOpen className="size-8" />
                    )}
                  </div>

                  <h2 className="mt-4 font-display text-2xl sm:text-3xl font-bold text-foreground">
                    {finalResult.passed ? "🎉 PARABÉNS, VOCÊ FOI APROVADO!" : "CONTINUE ESTUDANDO!"}
                  </h2>

                  <p className="mt-2 text-base text-muted-foreground">
                    {finalResult.passed
                      ? "Excelente desempenho! Você demonstrou sólido conhecimento das Escrituras."
                      : "Não desanime! A leitura constante da Palavra de Deus fortalece a memória e a fé."}
                  </p>

                  {/* CARDS DE ESTATÍSTICA DO RESULTADO */}
                  <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 max-w-xl mx-auto">
                    <div className="rounded-xl border border-border bg-card p-3">
                      <span className="block text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        {finalResult.score}
                      </span>
                      <span className="text-xs text-muted-foreground">Acertos</span>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-3">
                      <span className="block text-2xl font-bold text-rose-500">
                        {finalResult.wrongCount}
                      </span>
                      <span className="text-xs text-muted-foreground">Erros</span>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-3">
                      <span className="block text-2xl font-bold text-primary">
                        {finalResult.percentage}%
                      </span>
                      <span className="text-xs text-muted-foreground">Aproveitamento</span>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-3">
                      <span
                        className={`block text-xs font-bold uppercase mt-2 ${
                          finalResult.passed
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {finalResult.passed ? "Aprovado" : "Reprovado"}
                      </span>
                      <span className="text-[11px] text-muted-foreground">Resultado</span>
                    </div>
                  </div>

                  {/* BOTÕES DE AÇÃO */}
                  <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                    <Button
                      onClick={handleRestart}
                      disabled={startQuizMutation.isPending}
                      className="gap-1.5 font-bold"
                    >
                      <RotateCcw className="size-4" />
                      Fazer Nova Prova
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab("ranking")}
                      className="gap-1.5"
                    >
                      <Medal className="size-4" />
                      Ver Ranking Bíblico
                    </Button>
                  </div>
                </div>

                {/* GABARITO COMENTADO (REVISÃO DAS 10 QUESTÕES) */}
                <section className="space-y-4">
                  <div className="border-b border-border/80 pb-2">
                    <h3 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                      <CheckCircle2 className="size-5 text-primary" />
                      Gabarito Comentado da Prova
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Confira a correção detalhada de cada uma das 10 questões:
                    </p>
                  </div>

                  <div className="space-y-4">
                    {finalResult.questions.map((q, idx) => (
                      <div
                        key={q.questionId}
                        className={`rounded-xl border p-5 transition-colors ${
                          q.isCorrect
                            ? "border-emerald-500/30 bg-emerald-500/5"
                            : "border-rose-500/30 bg-rose-500/5"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-muted-foreground">
                            Questão {idx + 1}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                              q.isCorrect
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                            }`}
                          >
                            {q.isCorrect ? (
                              <>
                                <Check className="size-3" /> Acertou
                              </>
                            ) : (
                              <>
                                <X className="size-3" /> Errou
                              </>
                            )}
                          </span>
                        </div>

                        <h4 className="mt-2 font-display text-base font-bold text-foreground">
                          {q.question}
                        </h4>

                        <div className="mt-3 space-y-1.5 text-xs">
                          <div className="flex items-start gap-2">
                            <span className="font-semibold text-muted-foreground">
                              Sua resposta:
                            </span>
                            <span
                              className={`font-medium ${
                                q.isCorrect
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-rose-600 dark:text-rose-400"
                              }`}
                            >
                              ({q.userAnswerLetter}) {q.userAnswerText}
                            </span>
                          </div>

                          {!q.isCorrect && (
                            <div className="flex items-start gap-2">
                              <span className="font-semibold text-muted-foreground">
                                Resposta correta:
                              </span>
                              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                ({q.correctAnswerLetter}) {q.correctAnswerText}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* EXPLICAÇÃO DIDÁTICA E REFERÊNCIA */}
                        <div className="mt-3 rounded-lg bg-card border border-border/70 p-3 text-xs text-muted-foreground leading-relaxed">
                          <span className="font-semibold text-foreground block mb-1">
                            Explicação Bíblica:
                          </span>
                          {q.explanation}
                          {q.biblicalReference && (
                            <span className="mt-1.5 block font-semibold text-primary">
                              Referência: {q.biblicalReference}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <AdBanner className="my-6" />
              </div>
            )}
          </div>
        )}

        {/* ABA 2: RANKING BÍBLICO */}
        {activeTab === "ranking" && (
          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                    <Trophy className="size-5 text-amber-500" />
                    Quadro de Honra — Ranking Bíblico
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Classificação oficial dos participantes pelo número máximo de acertos e aproveitamento.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    setActiveTab("prova");
                    if (step === "idle") {
                      startQuizMutation.mutate();
                    }
                  }}
                  className="text-xs font-bold"
                >
                  Fazer Prova Agora
                </Button>
              </div>

              {/* TABELA DO RANKING */}
              <div className="mt-6 overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border bg-muted/40 font-semibold text-muted-foreground">
                    <tr>
                      <th className="p-3 w-12 text-center">Pos.</th>
                      <th className="p-3">Participante</th>
                      <th className="p-3 text-center">Maior Pontuação</th>
                      <th className="p-3 text-center">Provas Feitas</th>
                      <th className="p-3 text-center">Aprovações</th>
                      <th className="p-3 text-right">Aproveitamento</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {isLoadingRanking ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-muted-foreground">
                          <Loader2 className="mx-auto size-6 animate-spin text-primary" />
                          <span className="mt-2 block">Carregando ranking oficial...</span>
                        </td>
                      </tr>
                    ) : rankings.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-12 text-center text-muted-foreground">
                          <div className="flex flex-col items-center justify-center space-y-2">
                            <Trophy className="size-10 text-muted-foreground/30 stroke-1" />
                            <p className="font-semibold text-foreground text-sm">
                              Ainda não há participantes no ranking
                            </p>
                            <p className="text-xs text-muted-foreground max-w-sm">
                              Seja o primeiro a realizar a prova bíblica, testar seus conhecimentos e garantir o 1º lugar no quadro de honra!
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      rankings.map((r, index) => {
                        const position = index + 1;
                        const isTop1 = position === 1;
                        const isTop2 = position === 2;
                        const isTop3 = position === 3;

                        return (
                          <tr key={r.userId} className="hover:bg-muted/30 transition-colors">
                            <td className="p-3 text-center font-bold">
                              {isTop1 ? (
                                <span className="inline-flex size-6 items-center justify-center rounded-full bg-amber-500 text-white text-[11px] shadow-sm">
                                  1º
                                </span>
                              ) : isTop2 ? (
                                <span className="inline-flex size-6 items-center justify-center rounded-full bg-slate-400 text-white text-[11px]">
                                  2º
                                </span>
                              ) : isTop3 ? (
                                <span className="inline-flex size-6 items-center justify-center rounded-full bg-amber-700 text-white text-[11px]">
                                  3º
                                </span>
                              ) : (
                                <span className="text-muted-foreground">{position}º</span>
                              )}
                            </td>

                            <td className="p-3 font-semibold text-foreground">
                              <div className="flex items-center gap-2">
                                <div className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                                  {r.displayName.charAt(0).toUpperCase()}
                                </div>
                                <span className="truncate">{r.displayName}</span>
                              </div>
                            </td>

                            <td className="p-3 text-center font-bold text-emerald-600 dark:text-emerald-400">
                              {r.bestScore} / 10
                            </td>

                            <td className="p-3 text-center text-muted-foreground">
                              {r.totalAttempts}
                            </td>

                            <td className="p-3 text-center text-muted-foreground">
                              {r.passedAttempts}
                            </td>

                            <td className="p-3 text-right font-bold text-primary">
                              {r.winRate}%
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <AdBanner className="my-6" />
          </div>
        )}
      </div>

      {/* MODAL PARA USUÁRIO NÃO LOGADO INFORMAR O NOME PARA O RANKING */}
      <Dialog open={guestNameModalOpen} onOpenChange={setGuestNameModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-2">
              <Trophy className="size-6 text-amber-500" />
            </div>
            <DialogTitle className="text-center font-display text-xl font-bold">
              Registrar no Ranking Bíblico
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-muted-foreground">
              Parabéns por responder as 10 questões! Digite seu nome para salvar sua pontuação no quadro de honra oficial.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleConfirmGuestName} className="space-y-4 pt-2">
            <div>
              <label htmlFor="guest-name" className="text-xs font-semibold text-foreground block mb-1.5">
                Seu Nome ou Apelido
              </label>
              <Input
                id="guest-name"
                placeholder="Ex: Carlos Eduardo, Maria Silva..."
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                autoFocus
                maxLength={40}
                className="h-10 text-sm"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Sua pontuação e taxa de acertos serão salvas e exibidas no ranking com esse nome.
              </p>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setGuestNameModalOpen(false);
                  setStep("submitting");
                  submitQuizMutation.mutate("Participante");
                }}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Continuar como anônimo
              </Button>
              <Button
                type="submit"
                disabled={!guestName.trim()}
                className="font-bold text-xs h-10 px-6 gap-1.5"
              >
                <Check className="size-4" /> Salvar e Ver Resultado
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </SiteLayout>
  );
}
