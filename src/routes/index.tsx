import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Compass,
  HeartHandshake,
  HelpCircle,
  MessageSquare,
  Search,
  Sparkles,
  Users,
  Church,
  MapPin,
  GraduationCap,
  FileText,
  Trophy,
} from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { AdBanner, AdDesktop, AdMobile } from "@/components/Ads";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DailyVerseCard } from "@/components/DailyVerseCard";
import { ContinueReading } from "@/components/ContinueReading";
import { DailyJourney } from "@/components/DailyJourney";
import { STUDIES, DEVOTIONALS } from "@/lib/content";
import { fetchQuestions, type Question } from "@/lib/community";
import { url } from "@/lib/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bíblia Online — Bíblia Sagrada, Estudos e Versículos" },
      {
        name: "description",
        content:
          "Leia a Bíblia Sagrada online completa em português com capítulos e versículos. Acesse estudos bíblicos profundos, lições da Escola Dominical, apostilas em PDF, devocionais diários, orações, mural de pedidos de oração e teste seus conhecimentos com o quiz bíblico.",
      },
      { property: "og:title", content: "Bíblia Online — Bíblia Sagrada, Estudos e Versículos" },
      {
        property: "og:description",
        content:
          "Leia a Bíblia Sagrada online completa em português com capítulos e versículos. Acesse estudos bíblicos profundos, lições da Escola Dominical, apostilas em PDF, devocionais diários, orações, mural de pedidos de oração e teste seus conhecimentos com o quiz bíblico.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: url("/") },
      { property: "og:image", content: url("/icon-512.png") },
    ],
    links: [{ rel: "canonical", href: url("/") }],
  }),
  component: Index,
});

// 2. ACESSOS RÁPIDOS ("Explore a Bíblia")
const QUICK_LINKS = [
  { label: "Bíblia", to: "/biblia", desc: "66 livros sagrados", icon: BookOpen },
  { label: "Estudos Bíblicos", to: "/estudos", desc: "Aprofunde na Palavra", icon: Compass },
  { label: "Escola Dominical", to: "/estudos/escola-dominical", desc: "Lições da EBD", icon: GraduationCap },
  { label: "Apostilas", to: "/estudos/apostilas", desc: "Materiais em PDF", icon: FileText },
  { label: "Orações", to: "/oracoes", desc: "Para todos os momentos", icon: HeartHandshake },
  { label: "Quiz Bíblico", to: "/estudos/prova-biblica", desc: "Teste seus conhecimentos", icon: Trophy },
  { label: "Pedidos de Oração", to: "/comunidade/pedidos-de-oracao", desc: "Intercessão mútua", icon: Sparkles },
  { label: "Versículo do Dia", to: "/versiculo-do-dia", desc: "Reflexão diária", icon: Calendar },
  { label: "Comunidade", to: "/comunidade", desc: "Comunhão na fé", icon: Users },
] as const;

// 6. CATEGORIAS DE ORAÇÃO
const PRAYER_CATEGORIES = [
  { label: "Oração da manhã", icon: "🙏", slug: "oracao-da-manha" },
  { label: "Oração da noite", icon: "🌙", slug: "oracao-da-noite" },
  { label: "Família", icon: "❤️", slug: "oracao-pela-familia" },
  { label: "Trabalho", icon: "💼", slug: "oracao-pelo-trabalho" },
  { label: "Momentos difíceis", icon: "😔", slug: "oracao-por-protecao" },
  { label: "Gratidão", icon: "🙏", slug: "oracao-da-manha" },
  { label: "Relacionamentos", icon: "❤️", slug: "oracao-pela-familia" },
  { label: "Paz", icon: "🕊️", slug: "oracao-antes-de-dormir" },
];

// 10. VERSÍCULOS POPULARES
const POPULAR_VERSES = [
  { ref: "João 3:16", book: "joao", chapter: 3, verse: 16, text: "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito..." },
  { ref: "Salmos 23:1", book: "salmos", chapter: 23, verse: 1, text: "O Senhor é o meu pastor; nada me faltará." },
  { ref: "Filipenses 4:13", book: "filipenses", chapter: 4, verse: 13, text: "Posso todas as coisas naquele que me fortalece." },
  { ref: "Salmos 91:1", book: "salmos", chapter: 91, verse: 1, text: "Aquele que habita no esconderijo do Altíssimo, à sombra do Onipotente descansará." },
  { ref: "Isaías 41:10", book: "isaias", chapter: 41, verse: 10, text: "Não temas, porque eu sou contigo; não te assombres, porque eu sou teu Deus..." },
  { ref: "Romanos 8:28", book: "romanos", chapter: 8, verse: 28, text: "E sabemos que todas as coisas cooperam para o bem daqueles que amam a Deus..." },
];

function Index() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [recentQuestions, setRecentQuestions] = useState<Question[]>([]);

  // Carrega perguntas reais da comunidade (sem inventar dados falsos)
  useEffect(() => {
    let active = true;
    fetchQuestions({ limit: 2 })
      .then((questions) => {
        if (active && Array.isArray(questions) && questions.length > 0) {
          setRecentQuestions(questions);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // Devocional de Hoje baseado deterministicamente no dia do ano
  const todayIndex = Math.abs(
    new Date().getFullYear() * 365 + (new Date().getMonth() + 1) * 31 + new Date().getDate()
  ) % DEVOTIONALS.length;
  const todayDevotional = DEVOTIONALS[todayIndex] ?? DEVOTIONALS[0]!;

  return (
    <SiteLayout>
      {/* 1. HERO PRINCIPAL & PESQUISA */}
      <section className="warm-panel mx-3 sm:mx-4 mt-3 sm:mt-4 px-3.5 py-6 sm:px-8 sm:py-12 lg:mx-auto lg:max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-display text-2xl xs:text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
            Bíblia Online
          </h1>
          <p className="mt-2 text-xs xs:text-sm sm:text-base text-muted-foreground font-medium">
            Leia, compreenda e compartilhe a Palavra de Deus.
          </p>

          {/* Caixa de pesquisa */}
          <form
            className="mt-5 sm:mt-6 flex flex-col gap-2 sm:flex-row max-w-2xl mx-auto"
            onSubmit={(e) => {
              e.preventDefault();
              navigate({ to: "/busca", search: { q: q.trim() } });
            }}
          >
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Pesquise na Bíblia por livro, capítulo, versículo ou palavra..."
                className="h-11 sm:h-12 pl-10 pr-3 bg-background shadow-xs text-sm"
                aria-label="Pesquise na Bíblia por livro, capítulo, versículo ou palavra"
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className="h-11 sm:h-12 px-6 text-sm font-semibold shrink-0 cursor-pointer w-full sm:w-auto"
            >
              Pesquisar
            </Button>
          </form>

          {/* Atalhos rápidos de sugestões bíblicas */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 text-xs text-muted-foreground px-1">
            <span className="font-medium">Sugestões:</span>
            {["Salmo 23", "João 3:16", "Salmo 91", "Amor", "Paz", "Esperança"].map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => navigate({ to: "/busca", search: { q: term } })}
                className="rounded-full bg-accent/70 px-2.5 py-0.5 hover:bg-accent hover:text-foreground transition-colors cursor-pointer text-xs"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. ACESSOS RÁPIDOS ("Explore a Bíblia") */}
      <section
        aria-labelledby="explore-biblia-heading"
        className="mx-auto mt-6 w-full max-w-6xl px-3 sm:px-4"
      >
        <div className="flex items-center justify-between mb-3">
          <h2 id="explore-biblia-heading" className="font-display text-xl sm:text-2xl font-bold text-foreground">
            Explore a Bíblia
          </h2>
          <Link to="/biblia" className="text-xs font-semibold text-primary hover:underline">
            Ver 66 livros →
          </Link>
        </div>

        {/* No celular: 2 cards por linha (3 a partir de telas pequenas), fáceis de tocar */}
        <div className="grid grid-cols-2 gap-2.5 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-6 sm:gap-3">
          {QUICK_LINKS.map((item) => (
            <Link
              key={item.to}
              to={item.to as any}
              className="surface group flex flex-col items-center justify-center rounded-2xl p-3 sm:p-4 text-center transition-all hover:border-gold/50 hover:bg-accent/40 min-h-[90px] sm:min-h-[96px] touch-manipulation active:scale-[0.98]"
            >
              <item.icon className="size-6 text-primary" aria-hidden="true" />
              <span className="mt-1.5 text-xs sm:text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                {item.label}
              </span>
              <span className="text-[11px] text-muted-foreground leading-tight mt-0.5 hidden xs:block">
                {item.desc}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Espaço de AdSense superior (preparado, desativado se não configurado) */}
      <div className="mx-auto mt-6 w-full max-w-6xl px-4">
        <AdBanner />
      </div>

      <div className="mx-auto grid w-full min-w-0 max-w-6xl gap-8 px-3 py-6 sm:px-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 space-y-8 sm:space-y-10">
          {/* 3. VERSÍCULO DO DIA */}
          <section aria-labelledby="versiculo-do-dia-heading">
            <h2 id="versiculo-do-dia-heading" className="font-display text-xl sm:text-2xl font-bold text-foreground mb-3">
              Versículo do Dia
            </h2>
            <DailyVerseCard />
          </section>

          {/* 4. CONTINUE SUA LEITURA */}
          <section aria-labelledby="continue-leitura-heading">
            <h2 id="continue-leitura-heading" className="sr-only">
              Continue sua leitura
            </h2>
            <ContinueReading />
          </section>

          {/* 5. MINHA JORNADA DE HOJE */}
          <section aria-labelledby="jornada-heading">
            <DailyJourney />
          </section>

          <AdMobile />

          {/* 6. ORAÇÕES ("Encontre uma oração") */}
          <section aria-labelledby="oracoes-heading">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2 mb-3">
              <div className="min-w-0">
                <h2 id="oracoes-heading" className="font-display text-xl sm:text-2xl font-bold text-foreground">
                  Encontre uma oração
                </h2>
                <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground">
                  Orações bíblicas para conforto, gratidão, família e momentos de decisão.
                </p>
              </div>
              <Button asChild size="sm" variant="ghost" className="h-11 px-2 text-xs font-semibold text-primary hover:underline shrink-0">
                <Link to="/oracoes">
                  <span className="hidden xs:inline">Ver todas as orações →</span>
                  <span className="xs:hidden">Ver todas →</span>
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 mt-4">
              {PRAYER_CATEGORIES.map((cat) => (
                <Link
                  key={cat.label}
                  to="/oracoes"
                  hash={cat.slug}
                  className="surface flex items-center gap-2.5 rounded-xl p-3 text-xs sm:text-sm font-medium transition-all hover:border-gold/50 hover:bg-accent/40 min-h-[48px]"
                >
                  <span className="text-lg select-none" aria-hidden="true">
                    {cat.icon}
                  </span>
                  <span className="truncate text-foreground">{cat.label}</span>
                </Link>
              ))}
            </div>

            <div className="mt-3 text-right">
              <Button asChild size="sm" variant="outline" className="text-xs font-semibold">
                <Link to="/oracoes">
                  Ver todas as orações <ArrowRight className="ml-1 size-3.5" />
                </Link>
              </Button>
            </div>
          </section>

          {/* 7. ESTUDOS BÍBLICOS */}
          <section aria-labelledby="estudos-heading">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2 mb-3">
              <div className="min-w-0">
                <h2 id="estudos-heading" className="font-display text-xl sm:text-2xl font-bold text-foreground">
                  Estudos Bíblicos
                </h2>
                <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground">
                  Textos fundamentados nas Escrituras para crescer no conhecimento da Palavra.
                </p>
              </div>
              <Button asChild size="sm" variant="ghost" className="h-11 px-2 text-xs font-semibold text-primary hover:underline shrink-0">
                <Link to="/estudos">
                  <span className="hidden xs:inline">Ver todos os estudos →</span>
                  <span className="xs:hidden">Ver todos →</span>
                </Link>
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 mt-4">
              {STUDIES.slice(0, 4).map((s) => (
                <article
                  key={s.slug}
                  className="surface rounded-2xl p-5 transition-all hover:border-gold/40 hover:bg-accent/30 flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-gold">
                      {s.category}
                    </span>
                    <h3 className="mt-1 font-display text-base sm:text-lg font-bold text-foreground">
                      {s.title}
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {s.excerpt}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-border/40">
                    <Button asChild size="sm" variant="outline" className="w-full text-xs font-semibold">
                      <Link to="/estudos/$slug" params={{ slug: s.slug }}>
                        Ler estudo <ArrowRight className="ml-1 size-3.5" />
                      </Link>
                    </Button>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-3 text-right">
              <Button asChild size="sm" variant="outline" className="text-xs font-semibold">
                <Link to="/estudos">
                  Ver todos os estudos <ArrowRight className="ml-1 size-3.5" />
                </Link>
              </Button>
            </div>
          </section>

          {/* 8. DEVOCIONAIS ("Devocional de Hoje") */}
          <section aria-labelledby="devocionais-heading">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2 mb-3">
              <div className="min-w-0">
                <h2 id="devocionais-heading" className="font-display text-xl sm:text-2xl font-bold text-foreground">
                  Devocional de Hoje
                </h2>
                <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground">
                  Uma reflexão diária para orientar seu coração na presença de Deus.
                </p>
              </div>
              <Button asChild size="sm" variant="ghost" className="h-11 px-2 text-xs font-semibold text-primary hover:underline shrink-0">
                <Link to="/devocionais">
                  <span className="hidden xs:inline">Ver todos os devocionais →</span>
                  <span className="xs:hidden">Ver todos →</span>
                </Link>
              </Button>
            </div>

            <article className="warm-panel rounded-2xl p-5 sm:p-7 border border-border/80 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-gold">
                  🌅 Reflexão de Hoje
                </span>
                <span className="text-xs sm:text-sm font-semibold text-muted-foreground">
                  {todayDevotional.verseRef}
                </span>
              </div>
              <h3 className="mt-4 font-display text-lg sm:text-xl font-bold text-foreground">
                {todayDevotional.title}
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {todayDevotional.reflection}
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/50">
                <Button asChild size="sm" className="h-9 px-4 text-xs font-semibold">
                  <Link to="/devocionais/$slug" params={{ slug: todayDevotional.slug }}>
                    Ler devocional <ArrowRight className="ml-1.5 size-3.5" />
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="sm" className="text-xs font-semibold text-primary">
                  <Link to="/devocionais">
                    Ver todos os devocionais →
                  </Link>
                </Button>
              </div>
            </article>
          </section>

          {/* 9. COMUNIDADE ("Comunidade Palavra Viva") */}
          <section aria-labelledby="comunidade-heading" className="space-y-4">
            <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-7 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Users className="size-6" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                      Comunhão Cristã Online
                    </span>
                    <h2 id="comunidade-heading" className="font-display text-xl sm:text-2xl font-bold text-foreground mt-0.5">
                      Comunidade Palavra Viva
                    </h2>
                    <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl">
                      Compartilhe sua fé, reflexões, pedidos de oração e experiências com outras pessoas.
                    </p>
                  </div>
                </div>
                <Button asChild className="shrink-0 h-10 px-5 text-xs font-semibold">
                  <Link to="/comunidade">
                    Entrar na comunidade <ArrowRight className="ml-1.5 size-4" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Mostra apenas postagens reais se existirem; nunca cria dados falsos */}
            {recentQuestions.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-2">
                {recentQuestions.map((question) => (
                  <Link
                    key={question.id}
                    to="/comunidade/$id"
                    params={{ id: question.id }}
                    className="surface p-4 rounded-xl hover:border-gold/50 transition-colors block"
                  >
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">{question.author?.name || "Irmão na fé"}</span>
                      <span>•</span>
                      <span>{question.answers_count} respostas</span>
                    </div>
                    <h3 className="mt-1.5 text-sm font-semibold text-foreground line-clamp-1">
                      {question.title}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                      {question.body}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* 10. ENCONTRE UMA IGREJA PERTO DE VOCÊ */}
          <section aria-labelledby="igrejas-heading" className="rounded-2xl border border-border/80 bg-gradient-to-br from-amber-500/10 via-card to-card p-6 sm:p-7 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gold/15 text-gold">
                  <Church className="size-6" />
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-gold">
                    Comunhão Local
                  </span>
                  <h2 id="igrejas-heading" className="font-display text-xl sm:text-2xl font-bold text-foreground mt-0.5">
                    Encontre uma igreja perto de você
                  </h2>
                  <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl">
                    Descubra comunidades cristãs, locais de oração e cultos próximos à sua localização atual ou por cidade.
                  </p>
                </div>
              </div>
              <Button asChild className="shrink-0 h-10 px-5 text-xs font-semibold bg-gold text-primary-foreground hover:bg-gold/90 shadow-xs cursor-pointer">
                <Link to="/igrejas">
                  <MapPin className="mr-1.5 size-4" /> Encontrar igreja
                </Link>
              </Button>
            </div>
          </section>

          {/* 11. VERSÍCULOS POPULARES */}
          <section aria-labelledby="versiculos-populares-heading">
            <h2 id="versiculos-populares-heading" className="font-display text-xl sm:text-2xl font-bold text-foreground">
              Versículos populares
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Passagens bíblicas para reflexão, consolo, fortalecimento e meditação diária:
            </p>
            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {POPULAR_VERSES.map((pv) => (
                <Link
                  key={pv.ref}
                  to="/biblia/$book/$chapter/$verse"
                  params={{
                    book: pv.book,
                    chapter: String(pv.chapter),
                    verse: String(pv.verse),
                  }}
                  className="surface flex min-w-0 w-full items-center justify-between overflow-hidden p-3.5 text-sm hover:border-gold/40 transition-colors rounded-xl min-h-[52px]"
                >
                  <span className="font-bold text-foreground text-xs sm:text-sm shrink-0 mr-2">
                    {pv.ref}
                  </span>
                  <span className="min-w-0 text-xs text-muted-foreground italic truncate">
                    {pv.text}
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {/* 11. PERGUNTE À BÍBLIA ("Tem uma dúvida sobre a Bíblia?") */}
          <section aria-labelledby="pergunte-heading" className="warm-panel p-6 sm:p-7 rounded-2xl border border-gold/30">
            <div className="flex items-center gap-2.5">
              <div className="flex size-10 items-center justify-center rounded-xl bg-gold/15 text-gold shrink-0">
                <HelpCircle className="size-5" />
              </div>
              <div>
                <h2 id="pergunte-heading" className="font-display text-lg sm:text-xl font-bold text-foreground">
                  Tem uma dúvida sobre a Bíblia?
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Faça uma pergunta e encontre referências bíblicas relacionadas ao tema.
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {[
                "O que a Bíblia diz sobre ansiedade?",
                "Como vencer o medo segundo a Bíblia?",
                "O que a Bíblia ensina sobre o perdão?",
                "Quais versículos falam sobre esperança?",
              ].map((query) => (
                <Link
                  key={query}
                  to="/pergunte-a-biblia"
                  search={{ q: query }}
                  className="rounded-full border border-border bg-background px-3.5 py-1.5 text-xs text-muted-foreground hover:border-gold hover:text-foreground transition-colors"
                >
                  💬 {query}
                </Link>
              ))}
            </div>

            <div className="mt-5">
              <Button asChild size="sm" className="h-9 px-4 text-xs font-semibold">
                <Link to="/pergunte-a-biblia">
                  <MessageSquare className="mr-1.5 size-4" /> Perguntar
                </Link>
              </Button>
            </div>
          </section>

          {/* SEÇÃO EDITORIAL E SEO: SOBRE O PORTAL BÍBLIA ONLINE */}
          <section aria-labelledby="sobre-portal-heading" className="surface p-6 sm:p-8 rounded-2xl border border-border/80 space-y-5">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-gold">
                Guia Completo da Plataforma
              </span>
              <h2 id="sobre-portal-heading" className="font-display text-xl sm:text-2xl font-bold text-foreground mt-1">
                Bíblia Online — Sua Plataforma de Leitura Sagrada, Estudos e Oração
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              O portal <strong className="text-foreground">Bíblia Online</strong> foi desenvolvido com o propósito de aproximar você da Palavra de Deus em qualquer lugar e a qualquer hora. Nossa plataforma reúne as Sagradas Escrituras em língua portuguesa com navegação rápida e moderna, proporcionando uma experiência rica e acessível tanto para quem está começando seus primeiros passos na fé quanto para líderes, professores e estudantes da teologia bíblica.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="rounded-xl border border-border/70 p-4 bg-card/50 space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-foreground">
                  <BookOpen className="size-4 text-gold" />
                  <h3 className="font-semibold">Leitura da Bíblia Sagrada</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Acesse gratuitamente todos os 66 livros da Bíblia, organizados entre o <Link to="/biblia/antigo-testamento" className="text-gold hover:underline font-medium">Antigo Testamento</Link> e o <Link to="/biblia/novo-testamento" className="text-gold hover:underline font-medium">Novo Testamento</Link>, com leitura versículo por versículo, referências cruzadas e busca inteligente de passagens.
                </p>
                <Link to="/biblia" className="inline-flex items-center text-xs font-semibold text-primary hover:underline gap-1">
                  Explorar os 66 livros <ArrowRight className="size-3" />
                </Link>
              </div>

              <div className="rounded-xl border border-border/70 p-4 bg-card/50 space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-foreground">
                  <Compass className="size-4 text-gold" />
                  <h3 className="font-semibold">Estudos Bíblicos Profundos</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Conteúdos temáticos originais abordando temas essenciais como fé, oração, família, perdão, esperança e vida cristã prática, com embasamento teológico e aplicação para o seu dia a dia.
                </p>
                <Link to="/estudos" className="inline-flex items-center text-xs font-semibold text-primary hover:underline gap-1">
                  Ler estudos bíblicos <ArrowRight className="size-3" />
                </Link>
              </div>

              <div className="rounded-xl border border-border/70 p-4 bg-card/50 space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-foreground">
                  <GraduationCap className="size-4 text-gold" />
                  <h3 className="font-semibold">Escola Dominical (EBD)</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Lições bíblicas estruturadas com leitura bíblica em classe, objetivos pedagógicos, esboço expositivo, aplicações práticas e subsídios para professores e alunos da Escola Bíblica Dominical.
                </p>
                <Link to="/estudos/escola-dominical" className="inline-flex items-center text-xs font-semibold text-primary hover:underline gap-1">
                  Ver lições da EBD <ArrowRight className="size-3" />
                </Link>
              </div>

              <div className="rounded-xl border border-border/70 p-4 bg-card/50 space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-foreground">
                  <FileText className="size-4 text-gold" />
                  <h3 className="font-semibold">Apostilas Teológicas</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Manuais completos de teologia, discipulado bíblico, história da Igreja e hermenêutica disponíveis para estudo online e download em formato digital, sem custos.
                </p>
                <Link to="/estudos/apostilas" className="inline-flex items-center text-xs font-semibold text-primary hover:underline gap-1">
                  Acessar apostilas <ArrowRight className="size-3" />
                </Link>
              </div>

              <div className="rounded-xl border border-border/70 p-4 bg-card/50 space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-foreground">
                  <Sparkles className="size-4 text-gold" />
                  <h3 className="font-semibold">Mural de Pedidos de Oração</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Espaço dedicado de intercessão mútua onde irmãos na fé compartilham seus clamores, agradecimentos e petições, recebendo orações e notificações em tempo real.
                </p>
                <Link to="/comunidade/pedidos-de-oracao" className="inline-flex items-center text-xs font-semibold text-primary hover:underline gap-1">
                  Mural de orações <ArrowRight className="size-3" />
                </Link>
              </div>

              <div className="rounded-xl border border-border/70 p-4 bg-card/50 space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-foreground">
                  <Trophy className="size-4 text-gold" />
                  <h3 className="font-semibold">Quiz Bíblico (Prova Bíblica)</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Avalie seus conhecimentos bíblicos com 10 questões interativas por teste, receba nota com gabarito comentado fundamentado nas Escrituras e participe do ranking de participantes.
                </p>
                <Link to="/estudos/prova-biblica" className="inline-flex items-center text-xs font-semibold text-primary hover:underline gap-1">
                  Fazer o teste bíblico <ArrowRight className="size-3" />
                </Link>
              </div>
            </div>
          </section>
        </div>

        {/* Barra lateral desktop */}
        <aside className="min-w-0 space-y-6">
          <AdDesktop />

          <div className="surface p-5 rounded-2xl border border-border/80">
            <h3 className="font-display text-base font-bold text-foreground">Bíblia Online</h3>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              Plataforma dedicada a proporcionar leitura digna, rápida e acessível das Sagradas Escrituras em língua portuguesa.
            </p>
            <p className="mt-3 text-xs text-gold font-medium italic">
              "Lâmpada para os meus pés é tua palavra e luz, para o meu caminho." — Salmos 119:105
            </p>
            <div className="mt-4 space-y-2 text-xs border-t border-border/50 pt-3">
              <Link to="/sobre" className="block text-primary hover:underline font-medium">
                → Conheça nossa missão e diretrizes
              </Link>
              <Link to="/contato" className="block text-primary hover:underline font-medium">
                → Fale com a equipe
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </SiteLayout>
  );
}

