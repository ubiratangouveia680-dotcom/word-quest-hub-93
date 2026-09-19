import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  BookMarked,
  BookOpen,
  Calendar,
  Compass,
  Heart,
  HelpCircle,
  MessageSquare,
  Search,
  Sparkles,
} from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { AdBanner, AdDesktop, AdMobile } from "@/components/Ads";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DailyVerseCard } from "@/components/DailyVerseCard";
import { ContinueReading } from "@/components/ContinueReading";
import { STUDIES, DEVOTIONALS, PRAYERS } from "@/lib/content";
import { NEW_TESTAMENT, OLD_TESTAMENT } from "@/lib/bible-books";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bíblia Online — Leia a Bíblia Sagrada em português" },
      {
        name: "description",
        content:
          "Leia a Bíblia online gratuitamente: livros, capítulos e versículos em português, versículo do dia, estudos bíblicos, devocionais e orações.",
      },
      { property: "og:title", content: "Bíblia Online — Leia a Bíblia Sagrada em português" },
      {
        property: "og:description",
        content: "Encontre livros, capítulos e versículos em poucos segundos.",
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
  { label: "Orações", to: "/oracoes", icon: Heart, desc: "Para todos os momentos" },
  { label: "Estudos", to: "/estudos", icon: Compass, desc: "Aprofunde a leitura" },
  { label: "Devocionais", to: "/devocionais", icon: Sparkles, desc: "Edificação contínua" },
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
      {/* 2. Apresentação da Bíblia Online */}
      <section className="warm-panel mx-4 mt-4 px-5 py-10 sm:px-8 lg:mx-auto lg:max-w-6xl lg:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3.5 py-1 text-xs text-muted-foreground">
            <Sparkles className="size-3.5 text-gold" /> Leia, compreenda e compartilhe a Palavra
          </span>
          <h1 className="mt-4 font-display text-4xl font-semibold sm:text-5xl lg:text-6xl tracking-tight">
            Leia a Bíblia Online
          </h1>
          <p className="mt-3 text-base text-muted-foreground sm:text-lg">
            Acesso livre, rápido e confortável às Sagradas Escrituras em português.
          </p>

          {/* Botão principal de ação */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="h-12 px-6 font-medium shadow-sm">
              <Link to="/biblia">
                <BookOpen className="mr-2 size-5" /> Começar a leitura
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-5">
              <Link to="/versiculo-do-dia">
                <Calendar className="mr-2 size-4 text-gold" /> Versículo do Dia
              </Link>
            </Button>
          </div>

          {/* Barra de Pesquisa */}
          <form
            className="mt-8 flex flex-col gap-2 sm:flex-row max-w-2xl mx-auto"
            onSubmit={(e) => {
              e.preventDefault();
              navigate({ to: "/busca", search: { q } });
            }}
          >
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Pesquise por livro, capítulo, versículo ou palavra (ex: João 3:16, amor)..."
              className="h-12 bg-background shadow-xs"
              aria-label="Pesquisar na Bíblia"
            />
            <Button type="submit" size="lg" className="h-12 px-6">
              <Search className="mr-1.5 size-4" /> Pesquisar
            </Button>
          </form>

          {/* Acesso rápido aos 5 pilares principais */}
          <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-5">
            {QUICK_LINKS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="surface group flex flex-col items-center justify-center rounded-xl p-3 text-center transition-all hover:border-gold/50 hover:bg-accent/40"
              >
                <item.icon className="size-5 text-gold transition-transform group-hover:scale-110" />
                <span className="mt-1.5 text-xs font-semibold text-foreground">{item.label}</span>
                <span className="text-[10px] text-muted-foreground">{item.desc}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 11. Área reservada para publicidade (superior) */}
      <div className="mx-auto mt-6 w-full max-w-6xl px-4">
        <AdBanner />
      </div>

      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[1fr_300px]">
        <div className="space-y-12">
          {/* Histórico do leitor */}
          <ContinueReading />

          {/* 3. Versículo do Dia */}
          <section>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-gold">Inspiração Diária</span>
                <h2 className="font-display text-2xl font-semibold">Versículo do Dia</h2>
              </div>
              <Link to="/versiculo-do-dia" className="text-xs font-medium text-primary hover:underline">
                Página completa com reflexão →
              </Link>
            </div>
            <div className="mt-4">
              <DailyVerseCard />
            </div>
          </section>

          {/* 4. Acesso rápido à Bíblia */}
          <section>
            <SectionHeader
              title="Acesso rápido à Bíblia"
              href="/biblia"
              linkLabel="Ver todos os 66 livros"
            />
            <p className="mt-1 text-sm text-muted-foreground">
              Navegue pelos livros do Novo e do Antigo Testamento:
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {NEW_TESTAMENT.slice(0, 8).map((b) => (
                <Link
                  key={b.slug}
                  to="/biblia/$book"
                  params={{ book: b.slug }}
                  className="surface flex items-center gap-2.5 px-3.5 py-3 text-sm transition-all hover:bg-accent hover:border-gold/40"
                >
                  <BookOpen className="size-4 text-gold shrink-0" />
                  <span className="truncate">{b.name}</span>
                </Link>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {OLD_TESTAMENT.slice(0, 4).map((b) => (
                <Link
                  key={b.slug}
                  to="/biblia/$book"
                  params={{ book: b.slug }}
                  className="surface flex items-center gap-2.5 px-3.5 py-2.5 text-xs text-muted-foreground transition-all hover:bg-accent hover:text-foreground"
                >
                  <BookMarked className="size-3.5 text-gold shrink-0" />
                  <span className="truncate">{b.name}</span>
                </Link>
              ))}
            </div>
          </section>

          <AdMobile />

          {/* 5. Orações */}
          <section>
            <SectionHeader title="Orações Bíblicas" href="/oracoes" linkLabel="Ver todas as orações" />
            <p className="mt-1 text-sm text-muted-foreground">
              Textos originais para orar pela manhã, à noite, pela família, saúde e proteção:
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

          {/* 6. Estudos Bíblicos */}
          <section>
            <SectionHeader title="Estudos Bíblicos" href="/estudos" linkLabel="Ver todos os estudos" />
            <p className="mt-1 text-sm text-muted-foreground">
              Compreenda temas centrais da fé com fundamentação bíblica e reflexão prática:
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {STUDIES.slice(0, 4).map((s) => (
                <Link
                  key={s.slug}
                  to="/estudos/$slug"
                  params={{ slug: s.slug }}
                  className="surface p-4 transition-all hover:border-gold/40 hover:bg-accent/40"
                >
                  <span className="text-xs font-semibold uppercase tracking-wider text-gold">{s.category}</span>
                  <h3 className="mt-1 font-display text-base font-semibold">{s.title}</h3>
                  <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">{s.excerpt}</p>
                </Link>
              ))}
            </div>
          </section>

          {/* 7. Devocionais */}
          <section>
            <SectionHeader title="Devocionais Diários" href="/devocionais" linkLabel="Ver devocionais" />
            <p className="mt-1 text-sm text-muted-foreground">
              Pequenas meditações para nutrir o coração e orientar as atitudes do dia:
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {DEVOTIONALS.slice(0, 3).map((d) => (
                <Link
                  key={d.slug}
                  to="/devocionais/$slug"
                  params={{ slug: d.slug }}
                  className="surface p-4 transition-all hover:border-gold/40 hover:bg-accent/40"
                >
                  <span className="text-[11px] font-semibold text-gold">{d.verseRef}</span>
                  <h3 className="mt-1 font-display text-sm font-semibold">{d.title}</h3>
                  <p className="mt-2 line-clamp-3 text-xs text-muted-foreground">{d.reflection}</p>
                </Link>
              ))}
            </div>
          </section>

          {/* 8. Conteúdos Populares */}
          <section>
            <h2 className="font-display text-2xl font-semibold">Versículos mais buscados</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Passagens bíblicas mais acessadas por leitores para consolo, fortalecimento e louvor:
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
                  className="surface flex items-center justify-between p-3 text-sm hover:border-gold/40 transition-colors"
                >
                  <span className="font-medium text-foreground">{pv.ref}</span>
                  <span className="text-xs text-muted-foreground italic truncate max-w-[55%]">{pv.text}</span>
                </Link>
              ))}
            </div>
          </section>

          {/* 9. Pergunte à Bíblia & 10. Conteúdo Relacionado */}
          <section className="warm-panel p-6 sm:p-7">
            <div className="flex items-center gap-2">
              <HelpCircle className="size-5 text-gold" />
              <h2 className="font-display text-xl font-semibold">Pergunte à Bíblia</h2>
            </div>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Tire dúvidas sobre passagens, termos históricos e ensinamentos bíblicos com respostas orientadas pelo texto das Escrituras.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                "Como fortalecer minha fé?",
                "O que a Bíblia ensina sobre perdão?",
                "Como lidar com momentos difíceis?",
                "Quais versículos falam sobre esperança?",
              ].map((query) => (
                <Link
                  key={query}
                  to="/pergunte"
                  search={{ q: query }}
                  className="rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground hover:border-gold hover:text-foreground transition-colors"
                >
                  {query}
                </Link>
              ))}
            </div>
            <div className="mt-5">
              <Button asChild size="sm" variant="outline">
                <Link to="/pergunte" search={{ q: "" }}>
                  <MessageSquare className="mr-1.5 size-4 text-gold" /> Abrir assistente de perguntas
                </Link>
              </Button>
            </div>
          </section>
        </div>

        {/* Barra lateral em desktop */}
        <aside className="space-y-6">
          <AdDesktop />
          <div className="surface p-5">
            <h3 className="font-display text-base font-semibold">Sobre a Bíblia Online</h3>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              Portal dedicado a oferecer uma leitura digna, rápida e acessível da Palavra de Deus em língua portuguesa.
            </p>
            <div className="mt-4 space-y-2 text-xs">
              <Link to="/sobre" className="block text-primary hover:underline">
                → Conheça nossa missão e padrões
              </Link>
              <Link to="/contato" className="block text-primary hover:underline">
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
      <h2 className="font-display text-2xl font-semibold">{title}</h2>
      <Link to={href} className="text-xs font-medium text-primary hover:underline">
        {linkLabel} →
      </Link>
    </div>
  );
}

