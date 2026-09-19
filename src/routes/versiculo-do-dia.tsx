import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Calendar, Compass, HeartHandshake, Sparkles } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { AdBanner, AdDesktop, AdInArticle } from "@/components/Ads";
import { VerseActions } from "@/components/VerseActions";
import { Button } from "@/components/ui/button";
import { DAILY_REFS, getDailyRef } from "@/lib/daily-verse";
import { getDevotional, getStudy } from "@/lib/content";
import { url } from "@/lib/site";

export const Route = createFileRoute("/versiculo-do-dia")({
  head: () => {
    const today = getDailyRef();
    const title = `Versículo do Dia: ${today.bookName} ${today.chapter}:${today.verse} — Bíblia Online`;
    const desc = `${today.text} — Reflexão, explicação contextualizada, aplicação prática e oração para hoje.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: url("/versiculo-do-dia") },
        { property: "og:type", content: "article" },
      ],
      links: [{ rel: "canonical", href: url("/versiculo-do-dia") }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: `${today.bookName} ${today.chapter}:${today.verse} — Versículo do Dia`,
            description: desc,
            articleBody: `${today.text} ${today.explanation} ${today.reflection} ${today.application}`,
            inLanguage: "pt-BR",
          }),
        },
      ],
    };
  },
  component: DailyPage,
});

function DailyPage() {
  const current = getDailyRef();
  const dateFormatted = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
  const capitalizedDate = dateFormatted.charAt(0).toUpperCase() + dateFormatted.slice(1);

  const relatedStudy = current.relatedStudySlug ? getStudy(current.relatedStudySlug) : null;
  const relatedDevotional = current.relatedDevotionalSlug ? getDevotional(current.relatedDevotionalSlug) : null;
  const verseRefTitle = `${current.bookName} ${current.chapter}:${current.verse}`;
  const verseHref = `/biblia/${current.bookSlug}/${current.chapter}/${current.verse}`;

  return (
    <SiteLayout>
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[1fr_300px]">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-0.5 font-medium text-foreground">
              <Calendar className="size-3.5 text-gold" /> {capitalizedDate}
            </span>
            <span className="rounded-full bg-gold/15 px-2.5 py-0.5 font-medium text-gold-dark dark:text-gold">
              {current.theme}
            </span>
          </div>

          <h1 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
            Versículo do Dia: {verseRefTitle}
          </h1>
          <p className="mt-2 text-muted-foreground">
            Alimento diário para a sua fé com explicação do texto bíblico, meditação e aplicação prática.
          </p>

          {/* Destaque principal do versículo */}
          <section className="warm-panel mt-6 p-6 sm:p-8">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-semibold uppercase tracking-wider text-gold">Sagrada Escritura</span>
              <span>{verseRefTitle}</span>
            </div>
            <div className="gold-rule my-4" />
            <blockquote className="font-serif text-xl leading-relaxed text-foreground sm:text-2xl italic">
              “{current.text}”
            </blockquote>
            <p className="mt-3 text-sm font-medium text-gold">{verseRefTitle}</p>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
              <VerseActions
                id={`daily:${current.bookSlug}:${current.chapter}:${current.verse}`}
                kind="verse"
                title={verseRefTitle}
                text={current.text}
                href={verseHref}
              />
              <Button asChild variant="outline" size="sm">
                <Link to="/biblia/$book/$chapter" params={{ book: current.bookSlug, chapter: String(current.chapter) }}>
                  <BookOpen className="mr-1.5 size-4" /> Ler capítulo completo
                </Link>
              </Button>
            </div>
          </section>

          <AdBanner className="mt-8" />

          {/* Explicação contextual */}
          <section className="surface mt-8 p-6">
            <div className="flex items-center gap-2">
              <Compass className="size-5 text-gold" />
              <h2 className="font-display text-xl font-semibold">Contexto e Explicação Bíblica</h2>
            </div>
            <p className="mt-3 reading-text leading-relaxed text-muted-foreground">
              {current.explanation}
            </p>
          </section>

          {/* Reflexão espiritual */}
          <section className="surface mt-6 p-6">
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-gold" />
              <h2 className="font-display text-xl font-semibold">Reflexão para o seu dia</h2>
            </div>
            <p className="mt-3 reading-text leading-relaxed text-muted-foreground">
              {current.reflection}
            </p>
          </section>

          {/* Aplicação prática */}
          <section className="warm-panel mt-6 p-6">
            <div className="flex items-center gap-2">
              <HeartHandshake className="size-5 text-gold" />
              <h2 className="font-display text-xl font-semibold">Como aplicar hoje</h2>
            </div>
            <p className="mt-3 reading-text leading-relaxed">
              {current.application}
            </p>
          </section>

          {/* Oração relacionada */}
          <section className="surface mt-6 border-l-4 border-gold p-6">
            <h2 className="font-display text-xl font-semibold">Oração do Dia</h2>
            <p className="mt-3 font-serif italic leading-relaxed text-foreground">
              “{current.prayer}”
            </p>
          </section>

          <AdInArticle className="mt-8" />

          {/* Conteúdos relacionados para fortalecimento da malha interna */}
          {(relatedStudy || relatedDevotional) && (
            <section className="mt-10">
              <h2 className="font-display text-2xl font-semibold">Conteúdos Relacionados</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Aprofunde sua reflexão com nossos estudos bíblicos e devocionais temáticos.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {relatedStudy && (
                  <Link
                    to="/estudos/$slug"
                    params={{ slug: relatedStudy.slug }}
                    className="surface p-4 transition-all hover:border-gold/50 hover:bg-accent/40"
                  >
                    <span className="text-xs font-semibold uppercase tracking-wider text-gold">
                      Estudo Bíblico · {relatedStudy.category}
                    </span>
                    <h3 className="mt-1 font-display text-base font-semibold">{relatedStudy.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{relatedStudy.excerpt}</p>
                    <span className="mt-3 inline-flex items-center text-xs font-medium text-primary">
                      Ler estudo <ArrowRight className="ml-1 size-3" />
                    </span>
                  </Link>
                )}
                {relatedDevotional && (
                  <Link
                    to="/devocionais/$slug"
                    params={{ slug: relatedDevotional.slug }}
                    className="surface p-4 transition-all hover:border-gold/50 hover:bg-accent/40"
                  >
                    <span className="text-xs font-semibold uppercase tracking-wider text-gold">
                      Devocional · {relatedDevotional.verseRef}
                    </span>
                    <h3 className="mt-1 font-display text-base font-semibold">{relatedDevotional.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{relatedDevotional.reflection}</p>
                    <span className="mt-3 inline-flex items-center text-xs font-medium text-primary">
                      Ler devocional <ArrowRight className="ml-1 size-3" />
                    </span>
                  </Link>
                )}
              </div>
            </section>
          )}

          {/* Todos os versículos para reflexão */}
          <section className="mt-10">
            <h2 className="font-display text-2xl font-semibold">Versículos do Mês</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Navegue pelos versículos selecionados para cada dia de leitura e meditação.
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {DAILY_REFS.map((r, idx) => (
                <Link
                  key={`${r.bookSlug}-${r.chapter}-${r.verse}`}
                  to="/biblia/$book/$chapter/$verse"
                  params={{
                    book: r.bookSlug,
                    chapter: String(r.chapter),
                    verse: String(r.verse),
                  }}
                  className="surface flex items-center justify-between px-3 py-2.5 text-sm transition-colors hover:bg-accent"
                >
                  <span className="font-medium">
                    Dia {idx + 1}: {r.bookName} {r.chapter}:{r.verse}
                  </span>
                  <span className="text-xs text-muted-foreground">{r.theme}</span>
                </Link>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <AdDesktop />
          <div className="surface p-5">
            <h3 className="font-display text-base font-semibold">Receba paz diariamente</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Guarde este endereço nos seus favoritos e retorne a cada manhã para meditar em um novo versículo sagrado.
            </p>
            <Button asChild variant="outline" size="sm" className="mt-4 w-full">
              <Link to="/biblia">Explorar Livros da Bíblia</Link>
            </Button>
          </div>
        </aside>
      </div>
    </SiteLayout>
  );
}

