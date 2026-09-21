import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { AdDesktop, AdInArticle } from "@/components/Ads";
import { VerseActions } from "@/components/VerseActions";
import { fetchMaterialBySlug, fetchAllMaterials } from "@/lib/studies-service";
import { url } from "@/lib/site";
import {
  FileText,
  Printer,
  Share2,
  BookOpen,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  List,
  Sparkles,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/estudos/apostilas/$slug")({
  loader: async ({ params }) => {
    const booklet = await fetchMaterialBySlug(params.slug);
    if (!booklet || booklet.type !== "apostila") {
      throw notFound();
    }
    const all = await fetchAllMaterials(false);
    const relatedBooklets = all
      .filter((m) => m.type === "apostila" && m.slug !== booklet.slug)
      .slice(0, 3);

    return { booklet, relatedBooklets };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Apostila não encontrada" }, { name: "robots", content: "noindex" }],
      };
    }
    const { booklet } = loaderData;
    const path = `/estudos/apostilas/${params.slug}`;
    const fullTitle = `${booklet.title} | Apostila Bíblica — Bíblia Online`;

    return {
      meta: [
        { title: fullTitle },
        { name: "description", content: booklet.excerpt },
        { property: "og:title", content: fullTitle },
        { property: "og:description", content: booklet.excerpt },
        { property: "og:type", content: "book" },
        { property: "og:url", content: url(path) },
        ...(booklet.coverUrl ? [{ property: "og:image", content: booklet.coverUrl }] : []),
      ],
      links: [{ rel: "canonical", href: url(path) }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Course",
            name: booklet.title,
            description: booklet.excerpt,
            provider: {
              "@type": "Organization",
              name: booklet.author,
            },
          }),
        },
      ],
    };
  },
  component: BookletReaderPage,
});

function BookletReaderPage() {
  const { booklet, relatedBooklets } = Route.useLoaderData();

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: booklet.title,
          text: booklet.excerpt,
          url: window.location.href,
        });
      } catch {
        // Ignora
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link da apostila copiado com sucesso!");
    }
  };

  return (
    <SiteLayout>
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[1fr_300px]">
        <article className="print:w-full">
          {/* BREADCRUMB */}
          <nav className="text-xs text-muted-foreground print:hidden">
            <Link to="/estudos" className="hover:text-foreground">
              Estudos
            </Link>
            <span className="mx-1.5">/</span>
            <Link to="/estudos/apostilas" className="hover:text-foreground">
              Apostilas
            </Link>
            <span className="mx-1.5">/</span>
            <span className="text-foreground font-medium truncate">{booklet.title}</span>
          </nav>

          {/* CABEÇALHO DA APOSTILA COM CAPA */}
          <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-center">
            {booklet.coverUrl && (
              <div className="h-44 w-32 shrink-0 overflow-hidden rounded-xl border border-border shadow-md print:hidden">
                <img
                  src={booklet.coverUrl}
                  alt={booklet.title}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 capitalize">
                  Nível {booklet.level}
                </span>
                <span className="rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground">
                  Público: {booklet.audience}
                </span>
                <span className="text-xs text-muted-foreground">
                  Autor: {booklet.author}
                </span>
              </div>

              <h1 className="mt-2.5 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {booklet.title}
              </h1>

              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {booklet.excerpt}
              </p>
            </div>
          </div>

          {/* BARRA DE AÇÕES (IMPRESSÃO / COMPARTILHAMENTO) */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-y border-border/80 py-3 print:hidden">
            <div className="flex items-center gap-2">
              <Button
                onClick={handlePrint}
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-xs"
              >
                <Printer className="size-3.5" />
                Imprimir Apostila Completa
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="gap-1.5 text-xs"
              >
                <Share2 className="size-3.5" />
                Compartilhar
              </Button>
            </div>

            <VerseActions
              id={`apostila:${booklet.slug}`}
              kind="study"
              title={booklet.title}
              text={booklet.excerpt}
              href={`/estudos/apostilas/${booklet.slug}`}
            />
          </div>

          {/* SUMÁRIO NAVEGÁVEL */}
          {booklet.tableOfContents && booklet.tableOfContents.length > 0 && (
            <div className="mt-6 rounded-xl border border-border bg-card p-5">
              <h2 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                <List className="size-4 text-emerald-500" />
                Sumário do Material
              </h2>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2 text-sm text-muted-foreground">
                {booklet.tableOfContents.map((item, idx) => (
                  <li key={idx} className="flex items-center justify-between border-b border-border/40 pb-1.5">
                    <span className="truncate">{item.title}</span>
                    {item.page && (
                      <span className="text-xs font-mono text-muted-foreground/60">
                        pág. {item.page}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* OBJETIVOS PEDAGÓGICOS */}
          {booklet.objectives && booklet.objectives.length > 0 && (
            <div className="mt-6 rounded-xl border border-border bg-card p-5">
              <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-500" />
                Objetivos de Aprendizagem
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {booklet.objectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-1 size-1.5 shrink-0 rounded-full bg-emerald-500" />
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ANÚNCIO NO TEXTO */}
          <div className="print:hidden">
            <AdInArticle className="my-8" />
          </div>

          {/* TEXTO COMPLETO DA APOSTILA */}
          <section className="mt-8 space-y-6">
            <div className="prose dark:prose-invert max-w-none text-base text-foreground/90 leading-relaxed whitespace-pre-line font-sans">
              {booklet.content}
            </div>
          </section>

          {/* TÓPICOS / MÓDULOS ESPECÍFICOS */}
          {booklet.topics && booklet.topics.length > 0 && (
            <section className="mt-10 space-y-4">
              <h2 className="font-display text-2xl font-bold text-foreground">
                Módulos do Curso
              </h2>
              <div className="space-y-4">
                {booklet.topics.map((t, idx) => (
                  <div key={idx} className="rounded-xl border border-border bg-card p-5">
                    <h3 className="font-display text-lg font-bold text-foreground">
                      {t.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      {t.content}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* PERGUNTAS DE FIXAÇÃO */}
          {booklet.questions && booklet.questions.length > 0 && (
            <section className="mt-8 rounded-xl border border-border bg-card p-5">
              <h3 className="font-display text-lg font-bold text-foreground">
                Questionário de Fixação e Avaliação
              </h3>
              <ol className="mt-4 list-decimal space-y-2.5 pl-5 text-sm text-muted-foreground">
                {booklet.questions.map((q, i) => (
                  <li key={i} className="pl-1 leading-relaxed">
                    {q}
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* APLICAÇÃO PRÁTICA */}
          {booklet.practicalApplication && (
            <section className="mt-8 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
              <h3 className="font-display text-base font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <Sparkles className="size-4" />
                Aplicação Prática e Discipulado
              </h3>
              <p className="mt-2 text-sm text-foreground/90 leading-relaxed">
                {booklet.practicalApplication}
              </p>
            </section>
          )}

          {/* CONCLUSÃO */}
          {booklet.conclusion && (
            <section className="mt-8">
              <h3 className="font-display text-xl font-bold text-foreground">Conclusão</h3>
              <p className="mt-2 text-base text-muted-foreground leading-relaxed">
                {booklet.conclusion}
              </p>
            </section>
          )}

          {/* ANÚNCIO FINAL */}
          <div className="print:hidden">
            <AdInArticle className="my-8" />
          </div>

          {/* VOCÊ TAMBÉM PODE GOSTAR (APOSTILAS RELACIONADAS) */}
          {relatedBooklets.length > 0 && (
            <section className="mt-12 border-t border-border pt-8 print:hidden">
              <h3 className="font-display text-xl font-bold text-foreground">
                Outras Apostilas Disponíveis
              </h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {relatedBooklets.map((rb) => (
                  <Link
                    key={rb.id}
                    to="/estudos/apostilas/$slug"
                    params={{ slug: rb.slug }}
                    className="group rounded-xl border border-border bg-card p-4 transition-all hover:border-emerald-500/50 hover:shadow-md"
                  >
                    <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 capitalize">
                      Nível {rb.level}
                    </span>
                    <h4 className="mt-2 font-display text-base font-bold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {rb.title}
                    </h4>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {rb.excerpt}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </article>

        {/* SIDEBAR */}
        <aside className="space-y-6 print:hidden">
          <AdDesktop />

          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-display font-semibold text-foreground text-sm flex items-center gap-2">
              <FileText className="size-4 text-emerald-500" />
              Recursos de Apoio
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Explore outras áreas do portal para aprofundar seus conhecimentos.
            </p>
            <div className="mt-4 space-y-2 text-xs">
              <Button asChild variant="outline" size="sm" className="w-full justify-start">
                <Link to="/estudos/escola-dominical">
                  → Acessar Escola Dominical
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="w-full justify-start">
                <Link to="/estudos">
                  → Todos os Estudos Bíblicos
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="w-full justify-start">
                <Link to="/biblia">
                  → Leitura da Bíblia
                </Link>
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </SiteLayout>
  );
}
