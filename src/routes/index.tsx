import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, BookOpen, Search, Sparkles } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { AdBanner, AdDesktop, AdMobile } from "@/components/Ads";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DailyVerseCard } from "@/components/DailyVerseCard";
import { ContinueReading } from "@/components/ContinueReading";
import { STUDIES, DEVOTIONALS, PRAYERS } from "@/lib/content";
import { NEW_TESTAMENT } from "@/lib/bible-books";

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

function Index() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  return (
    <SiteLayout>
      <section className="warm-panel mx-4 mt-4 px-5 py-12 sm:px-8 lg:mx-auto lg:max-w-6xl lg:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="size-3.5 text-gold" /> Leia, compreenda e compartilhe a Palavra
          </span>
          <h1 className="mt-5 font-display text-4xl font-semibold sm:text-5xl">
            Leia a Bíblia Online
          </h1>
          <p className="mt-4 text-base text-muted-foreground">
            Encontre livros, capítulos e versículos em poucos segundos.
          </p>
          <form
            className="mt-7 flex flex-col gap-2 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              navigate({ to: "/busca", search: { q } });
            }}
          >
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Pesquise por livro, capítulo, versículo ou palavra..."
              className="h-12 bg-background"
              aria-label="Pesquisar na Bíblia"
            />
            <Button type="submit" size="lg" className="h-12">
              <Search className="mr-1 size-4" /> Pesquisar
            </Button>
          </form>
          <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm">
            {["João 3:16", "Salmos 23", "Provérbios 3", "amor"].map((s) => (
              <Link
                key={s}
                to="/busca"
                search={{ q: s }}
                className="rounded-full border border-border bg-background px-3 py-1 text-muted-foreground hover:text-foreground"
              >
                {s}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto mt-6 w-full max-w-6xl px-4">
        <AdBanner />
      </div>

      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1fr_300px]">
        <div className="space-y-10">
          <ContinueReading />
          <DailyVerseCard />

          <section>
            <SectionHeader title="Comece a leitura" href="/biblia" linkLabel="Ver todos os livros" />
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {NEW_TESTAMENT.slice(0, 8).map((b) => (
                <Link
                  key={b.slug}
                  to="/biblia/$book"
                  params={{ book: b.slug }}
                  className="surface flex items-center gap-2 px-3 py-3 text-sm transition-colors hover:bg-accent"
                >
                  <BookOpen className="size-4 text-gold" />
                  {b.name}
                </Link>
              ))}
            </div>
          </section>

          <AdMobile />

          <section>
            <SectionHeader title="Estudos bíblicos" href="/estudos" linkLabel="Ver estudos" />
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {STUDIES.slice(0, 4).map((s) => (
                <Link
                  key={s.slug}
                  to="/estudos/$slug"
                  params={{ slug: s.slug }}
                  className="surface p-4 transition-colors hover:bg-accent/40"
                >
                  <span className="text-xs uppercase tracking-wide text-gold">{s.category}</span>
                  <h3 className="mt-1 font-display text-lg font-semibold">{s.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{s.excerpt}</p>
                </Link>
              ))}
            </div>
          </section>

          <section>
            <SectionHeader title="Devocionais" href="/devocionais" linkLabel="Ver devocionais" />
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {DEVOTIONALS.map((d) => (
                <Link
                  key={d.slug}
                  to="/devocionais/$slug"
                  params={{ slug: d.slug }}
                  className="surface p-4 transition-colors hover:bg-accent/40"
                >
                  <h3 className="font-display text-base font-semibold">{d.title}</h3>
                  <p className="mt-1 text-xs text-gold">{d.verseRef}</p>
                  <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{d.reflection}</p>
                </Link>
              ))}
            </div>
          </section>

          <section>
            <SectionHeader title="Orações" href="/oracoes" linkLabel="Ver orações" />
            <div className="mt-4 flex flex-wrap gap-2">
              {PRAYERS.map((p) => (
                <Link
                  key={p.slug}
                  to="/oracoes"
                  hash={p.slug}
                  className="rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                  {p.category}
                </Link>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <AdDesktop />
          <div className="surface p-4">
            <h2 className="font-display text-base font-semibold">Pergunte sobre a Bíblia</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Tire dúvidas sobre passagens, contextos e temas bíblicos.
            </p>
            <Button asChild variant="outline" size="sm" className="mt-3 w-full">
              <Link to="/pergunte" search={{ q: "" }}>
                Abrir <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
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
      <Link to={href} className="text-sm text-muted-foreground hover:text-foreground">
        {linkLabel} →
      </Link>
    </div>
  );
}
