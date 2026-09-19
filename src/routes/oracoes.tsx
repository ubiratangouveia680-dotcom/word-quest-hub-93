import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, BookOpen, HeartHandshake, Sparkles } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { AdBanner, AdDesktop, AdInArticle } from "@/components/Ads";
import { VerseActions } from "@/components/VerseActions";
import { Button } from "@/components/ui/button";
import { PRAYERS } from "@/lib/content";
import { url } from "@/lib/site";

export const Route = createFileRoute("/oracoes")({
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

          {/* Filtro rápido por categorias */}
          <div className="mt-6 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveCategory("todas")}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                activeCategory === "todas"
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-background text-muted-foreground hover:text-foreground"
              }`}
            >
              Todas as orações ({PRAYERS.length})
            </button>
            {PRAYERS.map((p) => (
              <button
                key={p.slug}
                type="button"
                onClick={() => setActiveCategory(p.categorySlug)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  activeCategory === p.categorySlug
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                {p.category}
              </button>
            ))}
          </div>

          <AdBanner className="mt-6" />

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
                    <VerseActions
                      id={`prayer:${p.slug}`}
                      kind="prayer"
                      title={p.title}
                      text={p.text}
                      href={`/oracoes#${p.slug}`}
                      compact
                    />
                  </div>

                  <h2 className="mt-3 font-display text-2xl font-semibold">{p.title}</h2>
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
                            <Link to={v.link as any} className="ml-1 text-gold hover:underline">
                              (ler no contexto)
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Reflexão e Aplicação */}
                  <div className="mt-5 grid gap-4 sm:grid-cols-2 text-xs">
                    <div className="rounded-lg border border-border/40 p-3.5 bg-muted/20">
                      <h4 className="flex items-center gap-1 font-semibold text-foreground">
                        <Sparkles className="size-3 text-gold" /> Reflexão Espiritual
                      </h4>
                      <p className="mt-1.5 text-muted-foreground leading-relaxed">{p.reflection}</p>
                    </div>
                    <div className="rounded-lg border border-border/40 p-3.5 bg-muted/20">
                      <h4 className="flex items-center gap-1 font-semibold text-foreground">
                        <HeartHandshake className="size-3 text-gold" /> Aplicação Prática
                      </h4>
                      <p className="mt-1.5 text-muted-foreground leading-relaxed">{p.application}</p>
                    </div>
                  </div>

                  {/* Links internos para estudo e devocional relacionados */}
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4 text-xs">
                    <div className="flex flex-wrap gap-3">
                      {p.relatedStudySlug && (
                        <Link
                          to="/estudos/$slug"
                          params={{ slug: p.relatedStudySlug }}
                          className="font-medium text-primary hover:underline inline-flex items-center"
                        >
                          Estudo bíblico relacionado <ArrowRight className="ml-1 size-3" />
                        </Link>
                      )}
                      {p.relatedDevotionalSlug && (
                        <Link
                          to="/devocionais/$slug"
                          params={{ slug: p.relatedDevotionalSlug }}
                          className="font-medium text-primary hover:underline inline-flex items-center"
                        >
                          Devocional do dia relacionado <ArrowRight className="ml-1 size-3" />
                        </Link>
                      )}
                    </div>
                    <Button asChild variant="ghost" size="sm" className="h-7 text-xs">
                      <Link to="/biblia">Ler na Bíblia</Link>
                    </Button>
                  </div>
                </article>

                {i === 2 && <AdInArticle className="mt-8" />}
                {i === 6 && <AdInArticle className="mt-8" />}
              </div>
            ))}
          </div>
        </div>

        <aside className="space-y-6">
          <AdDesktop />
          <div className="surface p-5">
            <h3 className="font-display text-base font-semibold">O poder da oração contínua</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Jesus nos ensinou a orar com perseverança e sinceridade, abrindo nosso coração diante do Pai que
              ouve até mesmo o silêncio da nossa alma.
            </p>
            <div className="mt-4 space-y-2 text-xs">
              <Link to="/estudos/$slug" params={{ slug: "como-orar-o-padrao-do-pai-nosso" }} className="block text-primary hover:underline">
                → Estudo: Como orar segundo o Pai Nosso
              </Link>
              <Link to="/versiculo-do-dia" className="block text-primary hover:underline">
                → Meditar no Versículo do Dia
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </SiteLayout>
  );
}

