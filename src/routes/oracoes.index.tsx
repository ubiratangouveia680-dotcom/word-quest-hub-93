import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, BookOpen, HeartHandshake, Sparkles } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { AdBanner, AdDesktop, AdInArticle } from "@/components/Ads";
import { VerseActions } from "@/components/VerseActions";
import { Button } from "@/components/ui/button";
import { PRAYERS } from "@/lib/content";
import { url } from "@/lib/site";

export const Route = createFileRoute("/oracoes/")({
  head: () => ({
    meta: [
      { title: "Orações para todos os momentos — manhã, noite, família, cura e proteção | Bíblia Online" },
      {
        name: "description",
        content:
          "Coleção completa de orações bíblicas com reflexão, aplicação prática e versículos de apoio: oração da manhã, da noite, pela família, pelos filhos, proteção, saúde, trabalho, portas abertas, sabedoria e agradecimento.",
      },
      { property: "og:title", content: "Orações Diárias e Momentos Especiais — Bíblia Online" },
      {
        property: "og:description",
        content: "Encontre orações com fundamentação bíblica, reflexão espiritual e palavras sinceras para falar com Deus.",
      },
      { property: "og:url", content: url("/oracoes") },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: url("/oracoes") }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Orações Bíblicas",
          description: "Orações com fundamentação bíblica para todas as circunstâncias da vida.",
          url: url("/oracoes"),
        }),
      },
    ],
  }),
  component: PrayersPage,
});

function PrayersPage() {
  const [activeCategory, setActiveCategory] = useState<string>("todas");

  const filteredPrayers =
    activeCategory === "todas"
      ? PRAYERS
      : PRAYERS.filter((p) => p.categorySlug === activeCategory);

  return (
    <SiteLayout>
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[1fr_300px]">
        <div>
          <h1 className="font-display text-3xl font-semibold sm:text-4xl">Orações</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground leading-relaxed">
            Orações sinceras fundamentadas nas Sagradas Escrituras para acompanhar seus momentos diários de
            devoção, intercessão pela família, busca por sabedoria e consolo nas aflições.
          </p>

          {/* Filtros por categoria */}
          <div className="mt-6 flex flex-wrap gap-2">
            <Button
              variant={activeCategory === "todas" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory("todas")}
              className="text-xs"
            >
              Todas ({PRAYERS.length})
            </Button>
            {Array.from(new Set(PRAYERS.map((p) => JSON.stringify({ slug: p.categorySlug, name: p.category })))).map(
              (raw) => {
                const cat = JSON.parse(raw);
                return (
                  <Button
                    key={cat.slug}
                    variant={activeCategory === cat.slug ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveCategory(cat.slug)}
                    className="text-xs"
                  >
                    {cat.name}
                  </Button>
                );
              }
            )}
          </div>

          <div className="mt-6">
            <AdBanner />
          </div>

          {/* Lista detalhada das orações */}
          <div className="mt-8 space-y-8">
            {filteredPrayers.map((p, i) => (
              <div key={p.slug}>
                <article
                  id={p.slug}
                  className="surface scroll-mt-20 overflow-hidden rounded-xl border border-border/70 p-6 sm:p-7"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="rounded-full bg-gold/15 px-2.5 py-0.5 text-xs font-semibold text-gold-dark dark:text-gold">
                      {p.category}
                    </span>
                    <div className="flex items-center gap-2">
                      <Link
                        to="/oracoes/$slug"
                        params={{ slug: p.slug }}
                        className="text-xs text-gold hover:underline inline-flex items-center gap-1 font-medium"
                      >
                        Página individual <ArrowRight className="size-3" />
                      </Link>
                      <VerseActions
                        id={`prayer:${p.slug}`}
                        kind="prayer"
                        title={p.title}
                        text={p.text}
                        href={`/oracoes/${p.slug}`}
                        compact
                      />
                    </div>
                  </div>

                  <h2 className="mt-3 font-display text-2xl font-semibold">
                    <Link to="/oracoes/$slug" params={{ slug: p.slug }} className="hover:text-gold transition-colors">
                      {p.title}
                    </Link>
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{p.intro}</p>

                  {/* Texto da oração */}
                  <div className="warm-panel my-5 border-l-4 border-gold p-5">
                    <p className="font-serif text-base italic leading-relaxed text-foreground sm:text-lg">
                      “{p.text}”
                    </p>
                  </div>

                  {/* Versículos relacionados */}
                  {p.verses && p.verses.length > 0 && (
                    <div className="mt-4 rounded-lg bg-background/60 p-4 border border-border/50">
                      <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gold">
                        <BookOpen className="size-3.5" /> Versículos de Apoio
                      </h3>
                      <div className="mt-2.5 space-y-2">
                        {p.verses.map((v) => (
                          <div key={v.ref} className="text-xs text-muted-foreground">
                            <span className="font-semibold text-foreground">{v.ref}:</span>{" "}
                            <span className="italic">“{v.text}”</span>{" "}
                            <a href={v.link} className="ml-1 text-gold hover:underline">
                              (ler no contexto)
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Reflexão e Aplicação */}
                  <div className="mt-5 grid gap-4 sm:grid-cols-2 text-xs">
                    <div className="rounded-lg bg-card/60 p-3.5 border border-border/40">
                      <strong className="block text-foreground font-semibold mb-1">
                        Reflexão Espiritual
                      </strong>
                      <p className="text-muted-foreground leading-relaxed">{p.reflection}</p>
                    </div>
                    <div className="rounded-lg bg-card/60 p-3.5 border border-border/40">
                      <strong className="block text-foreground font-semibold mb-1">
                        Aplicação Prática
                      </strong>
                      <p className="text-muted-foreground leading-relaxed">{p.application}</p>
                    </div>
                  </div>

                  {/* Links internos para Estudos e Devocionais */}
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border/50 text-xs">
                    <div className="flex flex-wrap gap-2">
                      {p.relatedStudySlug && (
                        <Link
                          to="/estudos/$slug"
                          params={{ slug: p.relatedStudySlug }}
                          className="inline-flex items-center gap-1 text-gold hover:underline"
                        >
                          <BookOpen className="size-3" />
                          Estudo relacionado
                        </Link>
                      )}
                      {p.relatedDevotionalSlug && (
                        <Link
                          to="/devocionais/$slug"
                          params={{ slug: p.relatedDevotionalSlug }}
                          className="inline-flex items-center gap-1 text-gold hover:underline"
                        >
                          <Sparkles className="size-3" />
                          Devocional do dia
                        </Link>
                      )}
                    </div>
                    <Link
                      to="/oracoes/$slug"
                      params={{ slug: p.slug }}
                      className="inline-flex items-center gap-1 font-medium text-foreground hover:text-gold"
                    >
                      Ler com foco de leitura <ArrowRight className="size-3.5" />
                    </Link>
                  </div>
                </article>

                {/* Bloco de anúncio entre itens */}
                {i === 2 && (
                  <div className="my-8">
                    <AdInArticle />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="surface rounded-xl border border-border/70 p-5">
            <h2 className="font-display font-semibold text-lg flex items-center gap-2">
              <HeartHandshake className="size-4 text-gold" /> Por que orar com a Bíblia?
            </h2>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              As orações inspiradas na Palavra de Deus nos ajudam a colocar em palavras aquilo que o
              coração sente, alinhando nossas intenções à santa vontade divina e fortalecendo nossa fé
              nas promessas eternas.
            </p>
            <div className="mt-4 pt-3 border-t border-border/50">
              <Link
                to="/pergunte"
                className="text-xs font-semibold text-gold hover:underline inline-flex items-center gap-1"
              >
                Dúvidas sobre oração? Pergunte à Bíblia &rarr;
              </Link>
            </div>
          </div>

          <AdDesktop />
        </aside>
      </div>
    </SiteLayout>
  );
}
