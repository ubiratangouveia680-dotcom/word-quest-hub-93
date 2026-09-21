import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { AdDesktop, AdInArticle } from "@/components/Ads";
import { VerseActions } from "@/components/VerseActions";
import { fetchMaterialBySlug, fetchAllMaterials } from "@/lib/studies-service";
import { url } from "@/lib/site";
import {
  GraduationCap,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Printer,
  Share2,
  ArrowLeft,
  ArrowRight,
  Calendar,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/estudos/escola-dominical/$slug")({
  loader: async ({ params }) => {
    const lesson = await fetchMaterialBySlug(params.slug);
    if (!lesson || lesson.type !== "escola-dominical") {
      throw notFound();
    }
    const all = await fetchAllMaterials(false);
    // Lições da mesma série
    const seriesLessons = all
      .filter((m) => m.type === "escola-dominical" && m.series === lesson.series)
      .sort((a, b) => (a.lessonNumber || 0) - (b.lessonNumber || 0));

    const currentIndex = seriesLessons.findIndex((l) => l.slug === lesson.slug);
    const prevLesson = currentIndex > 0 ? seriesLessons[currentIndex - 1] : null;
    const nextLesson =
      currentIndex >= 0 && currentIndex < seriesLessons.length - 1
        ? seriesLessons[currentIndex + 1]
        : null;

    return { lesson, prevLesson, nextLesson, seriesLessons };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Lição não encontrada" }, { name: "robots", content: "noindex" }],
      };
    }
    const { lesson } = loaderData;
    const path = `/estudos/escola-dominical/${params.slug}`;
    const fullTitle = `${lesson.title} | Escola Dominical — Bíblia Online`;

    return {
      meta: [
        { title: fullTitle },
        { name: "description", content: lesson.excerpt },
        { property: "og:title", content: fullTitle },
        { property: "og:description", content: lesson.excerpt },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url(path) },
      ],
      links: [{ rel: "canonical", href: url(path) }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: lesson.title,
            description: lesson.excerpt,
            articleSection: "Escola Dominical",
            inLanguage: "pt-BR",
            author: {
              "@type": "Organization",
              name: lesson.author,
            },
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Início",
                item: url("/"),
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Escola Dominical",
                item: url("/estudos/escola-dominical"),
              },
              {
                "@type": "ListItem",
                position: 3,
                name: lesson.title,
                item: url(path),
              },
            ],
          }),
        },
      ],
    };
  },
  component: SundaySchoolLessonPage,
});

function SundaySchoolLessonPage() {
  const { lesson, prevLesson, nextLesson } = Route.useLoaderData();

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: lesson.title,
          text: lesson.excerpt,
          url: window.location.href,
        });
      } catch {
        // Ignora cancelamento pelo usuário
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copiado para a área de transferência!");
    }
  };

  return (
    <SiteLayout>
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[1fr_300px]">
        <article className="print:w-full">
          {/* NAVEGAÇÃO BREADCRUMB */}
          <nav className="text-xs text-muted-foreground print:hidden">
            <Link to="/estudos" className="hover:text-foreground">
              Estudos
            </Link>
            <span className="mx-1.5">/</span>
            <Link to="/estudos/escola-dominical" className="hover:text-foreground">
              Escola Dominical
            </Link>
            {lesson.series && (
              <>
                <span className="mx-1.5">/</span>
                <span className="truncate">{lesson.series}</span>
              </>
            )}
          </nav>

          {/* CABEÇALHO DA LIÇÃO */}
          <div className="mt-4">
            <div className="flex flex-wrap items-center gap-2">
              {lesson.lessonNumber && (
                <span className="rounded-md bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                  Lição nº {lesson.lessonNumber}
                </span>
              )}
              <span className="rounded-md border border-border bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground capitalize">
                Classe: {lesson.audience}
              </span>
              {lesson.bibleBook && (
                <span className="rounded-md border border-border bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground">
                  Livro: {lesson.bibleBook}
                </span>
              )}
            </div>

            <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {lesson.title}
            </h1>

            {/* BOTÕES DE AÇÃO (IMPRIMIR E COMPARTILHAR) */}
            <div className="mt-4 flex flex-wrap items-center gap-2 print:hidden">
              <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5 text-xs">
                <Printer className="size-3.5" />
                Imprimir Lição
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare} className="gap-1.5 text-xs">
                <Share2 className="size-3.5" />
                Compartilhar
              </Button>
              <div className="ml-auto">
                <VerseActions
                  id={`ebd:${lesson.slug}`}
                  kind="study"
                  title={lesson.title}
                  text={lesson.excerpt}
                  href={`/estudos/escola-dominical/${lesson.slug}`}
                />
              </div>
            </div>
          </div>

          {/* TEXTO BÍBLICO PRINCIPAL (DESTAQUE ÁUREO) */}
          {lesson.mainVerse && (
            <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/5 p-5">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                <BookOpen className="size-4" />
                Texto Bíblico Principal ({lesson.mainVerseRef})
              </div>
              <blockquote className="mt-2.5 text-base sm:text-lg italic text-foreground font-serif leading-relaxed">
                "{lesson.mainVerse}"
              </blockquote>
            </div>
          )}

          {/* OBJETIVOS PEDAGÓGICOS DA LIÇÃO */}
          {lesson.objectives && lesson.objectives.length > 0 && (
            <div className="mt-6 rounded-xl border border-border bg-card p-5">
              <h2 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-500" />
                Objetivos da Lição
              </h2>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {lesson.objectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-1 size-1.5 shrink-0 rounded-full bg-emerald-500" />
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* INTRODUÇÃO E DESENVOLVIMENTO */}
          <div className="mt-8 space-y-4">
            <h2 className="font-display text-2xl font-bold text-foreground">Introdução</h2>
            <div className="prose dark:prose-invert max-w-none text-base text-muted-foreground leading-relaxed whitespace-pre-line">
              {lesson.content}
            </div>
          </div>

          {/* ANÚNCIO NO ARTIGO */}
          <div className="print:hidden">
            <AdInArticle className="my-8" />
          </div>

          {/* TÓPICOS DA LIÇÃO DESENVOLVIDOS */}
          {lesson.topics && lesson.topics.length > 0 && (
            <section className="mt-8 space-y-6">
              <h2 className="font-display text-2xl font-bold text-foreground">
                Tópicos de Estudo
              </h2>
              <div className="space-y-5">
                {lesson.topics.map((t, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-border bg-card/70 p-5 transition-colors"
                  >
                    <h3 className="font-display text-lg font-bold text-foreground">
                      {t.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      {t.content}
                    </p>
                    {t.verseRef && (
                      <span className="mt-2 inline-block text-xs font-medium text-amber-600 dark:text-amber-400">
                        Referência: {t.verseRef}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* PERGUNTAS PARA REFLEXÃO E DEBATE NA CLASSE */}
          {lesson.questions && lesson.questions.length > 0 && (
            <section className="mt-8 rounded-xl border border-border bg-card p-5">
              <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                <HelpCircle className="size-5 text-amber-500" />
                Perguntas para a Classe / Reflexão Pessoal
              </h2>
              <ol className="mt-4 list-decimal space-y-2.5 pl-5 text-sm text-muted-foreground">
                {lesson.questions.map((q, i) => (
                  <li key={i} className="pl-1 leading-relaxed">
                    {q}
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* APLICAÇÃO PRÁTICA */}
          {lesson.practicalApplication && (
            <section className="mt-8 rounded-xl border border-primary/20 bg-primary/5 p-5">
              <h2 className="font-display text-lg font-bold text-primary flex items-center gap-2">
                <Sparkles className="size-4" />
                Aplicação Prática para a Semana
              </h2>
              <p className="mt-2 text-sm text-foreground/90 leading-relaxed">
                {lesson.practicalApplication}
              </p>
            </section>
          )}

          {/* CONCLUSÃO */}
          {lesson.conclusion && (
            <section className="mt-8">
              <h2 className="font-display text-xl font-bold text-foreground">Conclusão</h2>
              <p className="mt-2 text-base text-muted-foreground leading-relaxed">
                {lesson.conclusion}
              </p>
            </section>
          )}

          {/* REFERÊNCIAS BÍBLICAS ADICIONAIS */}
          {lesson.referenceVerses && lesson.referenceVerses.length > 0 && (
            <section className="mt-8 border-t border-border pt-6">
              <h3 className="font-display text-base font-bold text-foreground">
                Versículos de Apoio
              </h3>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {lesson.referenceVerses.map((ref, idx) => (
                  <div key={idx} className="rounded-lg bg-muted/40 p-3 text-xs">
                    <span className="font-semibold text-primary">{ref.ref}</span>
                    <p className="mt-1 italic text-muted-foreground">"{ref.text}"</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ANÚNCIO NO FINAL DA LIÇÃO */}
          <div className="print:hidden">
            <AdInArticle className="my-8" />
          </div>

          {/* NAVEGAÇÃO ANTERIOR / PRÓXIMA LIÇÃO */}
          <nav className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-border pt-6 print:hidden">
            {prevLesson ? (
              <Link
                to="/estudos/escola-dominical/$slug"
                params={{ slug: prevLesson.slug }}
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground group"
              >
                <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
                <div>
                  <span className="block text-[11px] uppercase tracking-wider text-muted-foreground/80">
                    Lição Anterior
                  </span>
                  <span className="font-semibold text-foreground">{prevLesson.title}</span>
                </div>
              </Link>
            ) : (
              <div />
            )}

            {nextLesson && (
              <Link
                to="/estudos/escola-dominical/$slug"
                params={{ slug: nextLesson.slug }}
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground group sm:text-right"
              >
                <div>
                  <span className="block text-[11px] uppercase tracking-wider text-muted-foreground/80">
                    Próxima Lição
                  </span>
                  <span className="font-semibold text-foreground">{nextLesson.title}</span>
                </div>
                <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
          </nav>
        </article>

        {/* SIDEBAR COM LINKS E ANÚNCIOS */}
        <aside className="space-y-6 print:hidden">
          <AdDesktop />

          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-display font-semibold text-foreground text-sm flex items-center gap-2">
              <Layers className="size-4 text-amber-500" />
              {lesson.series || "Escola Dominical"}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Materiais pedagógicos para enriquecer sua preparação para a aula.
            </p>
            <div className="mt-4">
              <Button asChild variant="outline" size="sm" className="w-full text-xs">
                <Link to="/estudos/escola-dominical">Ver todas as lições de EBD</Link>
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </SiteLayout>
  );
}
