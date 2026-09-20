import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  BookMarked,
  BookOpen,
  Calendar,
  Compass,
  Heart,
  HeartHandshake,
  HelpCircle,
  MessageSquare,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { AdBanner, AdDesktop, AdMobile } from "@/components/Ads";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DailyVerseCard } from "@/components/DailyVerseCard";
import { ContinueReading } from "@/components/ContinueReading";
import { DailyJourney } from "@/components/DailyJourney";
import { STUDIES, DEVOTIONALS, PRAYERS } from "@/lib/content";
import { NEW_TESTAMENT, OLD_TESTAMENT } from "@/lib/bible-books";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bíblia Online — Leia a Bíblia Sagrada em português" },
      {
        name: "description",
        content:
          "Leia a Bíblia online gratuitamente: livros, capítulos e versículos em português, versículo do dia, estudos bíblicos, devocionais e orações. Leia, compreenda e compartilhe a Palavra de Deus.",
      },
      { property: "og:title", content: "Bíblia Online — Leia a Bíblia Sagrada em português" },
      {
        property: "og:description",
        content: "Encontre livros, capítulos e versículos em poucos segundos. Leia, compreenda e compartilhe a Palavra de Deus.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

const QUICK_LINKS = [
  { label: "Bíblia", to: "/biblia", icon: BookOpen, desc: "66 livros sagrados" },
  { label: "Versículo do Dia", to: "/versiculo-do-dia", icon: Calendar, desc: "Reflexão diária" },
  { label: "Orações", to: "/oracoes", icon: HeartHandshake, desc: "Para todos os momentos" },
  { label: "Estudos", to: "/estudos", icon: Compass, desc: "Aprofunde a leitura" },
  { label: "Devocionais", to: "/devocionais", icon: Sparkles, desc: "Edificação contínua" },
  { label: "Pergunte à Bíblia", to: "/pergunte-a-biblia", icon: HelpCircle, desc: "Tire suas dúvidas" },
] as const;

const POPULAR_VERSES = [
  { ref: "João 3:16", book: "joao", chapter: 3, verse: 16, text: "Porque Deus amou o mundo de tal maneira..." },
  { ref: "Salmos 23:1", book: "salmos", chapter: 23, verse: 1, text: "O Senhor é o meu pastor; nada me faltará." },
  { ref: "Filipenses 4:13", book: "filipenses", chapter: 4, verse: 13, text: "Posso todas as coisas naquele que me fortalece." },
  { ref: "Salmos 91:1", book: "salmos", chapter: 91, verse: 1, text: "Aquele que habita no esconderijo do Altíssimo..." },
  { ref: "Isaías 41:10", book: "isaias", chapter: 41, verse: 10, text: "Não temas, porque eu sou contigo..." },
  { ref: "Romanos 8:28", book: "romanos", chapter: 8, verse: 28, text: "Todas as coisas cooperam para o bem..." },
];

function Index() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  return (
    <SiteLayout>
      {/* 2. ÁREA PRINCIPAL "BÍBLIA ONLINE" (HERO) */}
      <section className="warm-panel mx-4 mt-4 px-5 py-10 sm:px-8 lg:mx-auto lg:max-w-6xl lg:py-14">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3.5 py-1 text-xs font-semibold text-muted-foreground">
            <Sparkles className="size-3.5 text-gold" /> Leia, compreenda e compartilhe a Palavra de Deus
          </span>
          <h1 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-foreground">
            Leia a Bíblia Online
          </h1>
          <p className="mt-3.5 text-sm sm:text-base text-muted-foreground leading-relaxed">
            Acesso rápido a todos os livros, capítulos e versículos da Palavra de Deus em português,
            com estudos explicativos, devocionais diários, orações e respostas para suas dúvidas de fé.
          </p>

          {/* 3. BUSCA DA BÍBLIA */}
          <form
            className="mt-7 flex flex-col gap-2.5 sm:flex-row max-w-2xl mx-auto"
            onSubmit={(e) => {
              e.preventDefault();
              navigate({ to: "/busca", search: { q } });
            }}
          >
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Pesquise por livro, capítulo, versículo ou palavra (ex: João 3:16, amor, paz)..."
                className="h-12 pl-10 bg-background shadow-xs text-sm"
                aria-label="Pesquisar na Bíblia"
              />
            </div>
            <Button type="submit" size="lg" className="h-12 px-6 text-sm font-semibold shrink-0">
              Pesquisar
            </Button>
          </form>

          {/* Atalhos rápidos de busca popular */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <span className="font-medium">Buscas frequentes:</span>
            {["Salmo 23", "João 3:16", "Salmo 91", "Amor", "Fé", "Perdão"].map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => navigate({ to: "/busca", search: { q: term } })}
                className="rounded-full bg-accent/60 px-2.5 py-0.5 hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Publicidade superior suave */}
      <div className="mx-auto mt-6 w-full max-w-6xl px-4">
        <AdBanner />
      </div>

      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[1fr_300px]">
        <div className="space-y-10">
          {/* 4. VERSÍCULO DO DIA */}
          <section aria-labelledby="versiculo-do-dia-heading">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-gold">Inspiração Diária</span>
                <h2 id="versiculo-do-dia-heading" className="font-display text-2xl font-bold">
                  Versículo do Dia
                </h2>
              </div>
              <Link to="/versiculo-do-dia" className="text-xs font-semibold text-primary hover:underline">
                Página completa com reflexão →
              </Link>
            </div>
            <div className="mt-4">
              <DailyVerseCard />
            </div>
          </section>

          {/* 5. CONTINUE SUA LEITURA */}
          <section aria-labelledby="continue-leitura-heading">
            <h2 id="continue-leitura-heading" className="sr-only">Continue sua leitura</h2>
            <ContinueReading />
          </section>

          {/* 6. MINHA JORNADA DE HOJE */}
          <section aria-labelledby="jornada-heading">
            <DailyJourney />
          </section>

          {/* 7. ACESSO RÁPIDO */}
          <section aria-labelledby="acesso-rapido-heading" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-gold">Navegação Expressa</span>
                <h2 id="acesso-rapido-heading" className="font-display text-2xl font-bold">
                  Acesso Rápido
                </h2>
              </div>
              <Link to="/biblia" className="text-xs font-semibold text-primary hover:underline">
                Ver todos os 66 livros →
              </Link>
            </div>

            {/* Pilares Principais */}
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
              {QUICK_LINKS.map((item) => (
                <Link
                  key={item.to}
                  to={item.to as any}
                  className="surface group flex flex-col items-center justify-center rounded-xl p-3.5 text-center transition-all hover:border-gold/50 hover:bg-accent/40"
                >
                  <item.icon className="size-5 text-gold transition-transform group-hover:scale-110" />
                  <span className="mt-1.5 text-xs font-bold text-foreground">{item.label}</span>
                  <span className="text-[10px] text-muted-foreground">{item.desc}</span>
                </Link>
              ))}
            </div>

            {/* Livros em Destaque */}
            <div className="pt-2">
              <p className="text-xs font-medium text-muted-foreground mb-2">Novo Testamento:</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {NEW_TESTAMENT.slice(0, 4).map((b) => (
                  <Link
                    key={b.slug}
                    to="/biblia/$book"
                    params={{ book: b.slug }}
                    className="surface flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium transition-all hover:bg-accent hover:border-gold/40"
                  >
                    <BookOpen className="size-3.5 text-gold shrink-0" />
                    <span className="truncate">{b.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          <AdMobile />

          {/* 8. ORAÇÕES BÍBLICAS */}
          <section aria-labelledby="oracoes-heading">
            <SectionHeader title="Orações Bíblicas" href="/oracoes" linkLabel="Ver todas as orações" />
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Textos originais para orar pela manhã, à noite, pela família, saúde, libertação e proteção:
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {PRAYERS.map((p) => (
                <Link
                  key={p.slug}
                  to="/oracoes"
                  hash={p.slug}
                  className="rounded-full border border-border bg-background px-3.5 py-1.5 text-xs font-medium text-muted-foreground hover:border-gold hover:text-foreground transition-colors"
                >
                  {p.category}
                </Link>
              ))}
            </div>
          </section>

          {/* 9. ESTUDOS BÍBLICOS */}
          <section aria-labelledby="estudos-heading">
            <SectionHeader title="Estudos Bíblicos" href="/estudos" linkLabel="Ver todos os estudos" />
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Compreenda temas centrais da fé com fundamentação bíblica, teologia sadia e reflexão prática:
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {STUDIES.slice(0, 4).map((s) => (
                <Link
                  key={s.slug}
                  to="/estudos/$slug"
                  params={{ slug: s.slug }}
                  className="surface p-4 transition-all hover:border-gold/40 hover:bg-accent/40 rounded-xl"
                >
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-gold">{s.category}</span>
                  <h3 className="mt-1 font-display text-base font-bold text-foreground">{s.title}</h3>
                  <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">{s.excerpt}</p>
                </Link>
              ))}
            </div>
          </section>

          {/* 10. DEVOCIONAIS DIÁRIOS */}
          <section aria-labelledby="devocionais-heading">
            <SectionHeader title="Devocionais Diários" href="/devocionais" linkLabel="Ver devocionais" />
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Pequenas meditações para nutrir o coração e orientar as atitudes do seu dia com a Palavra:
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {DEVOTIONALS.slice(0, 3).map((d) => (
                <Link
                  key={d.slug}
                  to="/devocionais/$slug"
                  params={{ slug: d.slug }}
                  className="surface p-4 transition-all hover:border-gold/40 hover:bg-accent/40 rounded-xl flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[11px] font-semibold text-gold">{d.verseRef}</span>
                    <h3 className="mt-1 font-display text-sm font-bold text-foreground">{d.title}</h3>
                    <p className="mt-2 line-clamp-3 text-xs text-muted-foreground leading-relaxed">{d.reflection}</p>
                  </div>
                  <span className="mt-3 text-[11px] font-medium text-primary flex items-center">
                    Ler devocional <ArrowRight className="size-3 ml-1" />
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {/* 11. COMUNIDADE */}
          <section aria-labelledby="comunidade-heading" className="rounded-2xl border border-border/80 bg-card p-6 sm:p-7 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Users className="size-6" />
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                    Comunhão Cristã Online
                  </span>
                  <h2 id="comunidade-heading" className="font-display text-2xl font-bold text-foreground mt-0.5">
                    Comunidade Palavra Viva
                  </h2>
                  <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl">
                    Conecte-se com irmãos na fé em todo o Brasil. Compartilhe pedidos de oração, reflexões de versículos, tire dúvidas e edifique vidas com o Evangelho.
                  </p>
                </div>
              </div>
              <Button asChild className="shrink-0 h-10 px-5 text-xs font-semibold">
                <Link to="/comunidade">
                  Participar da Comunidade <ArrowRight className="ml-1.5 size-4" />
                </Link>
              </Button>
            </div>
          </section>

          {/* 12. VERSÍCULOS POPULARES */}
          <section aria-labelledby="versiculos-populares-heading">
            <h2 id="versiculos-populares-heading" className="font-display text-2xl font-bold">
              Versículos mais buscados
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Passagens bíblicas mais acessadas por leitores para consolo, fortalecimento, esperança e louvor:
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
                  className="surface flex items-center justify-between p-3.5 text-sm hover:border-gold/40 transition-colors rounded-xl"
                >
                  <span className="font-bold text-foreground text-xs sm:text-sm">{pv.ref}</span>
                  <span className="text-xs text-muted-foreground italic truncate max-w-[55%]">{pv.text}</span>
                </Link>
              ))}
            </div>
          </section>

          {/* 13. PERGUNTE À BÍBLIA */}
          <section aria-labelledby="pergunte-heading" className="warm-panel p-6 sm:p-7 rounded-2xl border border-gold/30">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-gold/15 text-gold">
                <HelpCircle className="size-5" />
              </div>
              <div>
                <h2 id="pergunte-heading" className="font-display text-xl font-bold text-foreground">
                  Pergunte à Bíblia
                </h2>
                <p className="text-xs text-muted-foreground">
                  Estudo bíblico e esclarecimento de dúvidas
                </p>
              </div>
            </div>
            <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Tire dúvidas sobre passagens, contexto histórico, ensinamentos de Jesus e temas bíblicos com respostas orientadas fielmente pelas Sagradas Escrituras.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                "O que a Bíblia diz sobre ansiedade?",
                "Como vencer o medo segundo a Bíblia?",
                "O que a Bíblia ensina sobre perdão?",
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
              <Button asChild size="sm" variant="outline" className="h-9 px-4 text-xs font-semibold">
                <Link to="/pergunte-a-biblia">
                  <MessageSquare className="mr-1.5 size-4 text-gold" /> Abrir Pergunte à Bíblia
                </Link>
              </Button>
            </div>
          </section>
        </div>

        {/* Barra lateral em desktop */}
        <aside className="space-y-6">
          <AdDesktop />

          <div className="surface p-5 rounded-xl border border-border/80">
            <h3 className="font-display text-base font-bold text-foreground">Sobre a Bíblia Online</h3>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              Portal dedicado a oferecer uma leitura digna, rápida e acessível da Palavra de Deus em língua portuguesa.
            </p>
            <p className="mt-2 text-xs text-gold font-medium italic">
              "Lâmpada para os meus pés é tua palavra e luz, para o meu caminho." — Salmos 119:105
            </p>
            <div className="mt-4 space-y-2 text-xs border-t border-border/50 pt-3">
              <Link to="/sobre" className="block text-primary hover:underline font-medium">
                → Conheça nossa missão e padrões
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

function SectionHeader({
  title,
  href,
  linkLabel,
}: {
  title: string;
  href: "/biblia" | "/estudos" | "/devocionais" | "/oracoes";
  linkLabel: string;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <h2 className="font-display text-2xl font-bold text-foreground">{title}</h2>
      <Link to={href} className="text-xs font-semibold text-primary hover:underline shrink-0">
        {linkLabel} →
      </Link>
    </div>
  );
}
