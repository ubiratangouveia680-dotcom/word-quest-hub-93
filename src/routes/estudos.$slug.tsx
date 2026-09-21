import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { AdDesktop, AdInArticle, AdBanner } from "@/components/Ads";
import { VerseActions } from "@/components/VerseActions";
import { getStudy, STUDIES } from "@/lib/content";
import { fetchMaterialBySlug, fetchAllMaterials } from "@/lib/studies-service";
import { url } from "@/lib/site";
import { Printer, Share2, ArrowRight, BookOpen, HelpCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/estudos/$slug")({
  loader: async ({ params }) => {
    let study = getStudy(params.slug);

    if (!study) {
      const dbMaterial = await fetchMaterialBySlug(params.slug);
      if (dbMaterial) {
        study = {
          slug: dbMaterial.slug,
          category: dbMaterial.category,
          categorySlug: dbMaterial.categorySlug,
          title: dbMaterial.title,
          excerpt: dbMaterial.excerpt,
          intro: dbMaterial.content.split("\n\n")[0] || dbMaterial.excerpt,
          verses:
            dbMaterial.referenceVerses.length > 0
              ? dbMaterial.referenceVerses
              : dbMaterial.mainVerse && dbMaterial.mainVerseRef
              ? [{ ref: dbMaterial.mainVerseRef, link: `/biblia/salmos/1`, text: dbMaterial.mainVerse }]
              : [],
          explanation: dbMaterial.topics.map((t) => `${t.title}: ${t.content}`),
          conclusion: dbMaterial.conclusion || "Aplique estes ensinamentos em sua caminhada cristã.",
          questions: dbMaterial.questions || [],
        };
      }
    }

    if (!study) throw notFound();

    // Busca materiais relacionados
    const all = await fetchAllMaterials(false);
    const related = all
      .filter((s) => s.slug !== study!.slug && (s.categorySlug === study!.categorySlug || s.type === "estudo"))
      .slice(0, 3);

    return { study, related };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Estudo não encontrado" }, { name: "robots", content: "noindex" }] };
    }
    const { study } = loaderData;
    const path = `/estudos/${params.slug}`;
    const fullTitle = `${study.title} | Estudo Bíblico — Bíblia Online`;

    return {
      meta: [
        { title: fullTitle },
        { name: "description", content: study.excerpt },
        { property: "og:title", content: fullTitle },
        { property: "og:description", content: study.excerpt },
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
            headline: study.title,
            description: study.excerpt,
            articleSection: study.category,
            inLanguage: "pt-BR",
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": url(path),
            },
            author: {
              "@type": "Organization",
              name: "Bíblia Online",
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
                name: "Estudos Bíblicos",
                item: url("/estudos"),
              },
              {
                "@type": "ListItem",
                position: 3,
                name: study.title,
                item: url(path),
              },
            ],
          }),
        },
      ],
    };
  },
  component: StudyPage,
});

function StudyPage() {
  const { study, related } = Route.useLoaderData();

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: study.title,
          text: study.excerpt,
          url: window.location.href,
        });
      } catch {
        // Ignora
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link do estudo copiado com sucesso!");
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
            <Link
              to="/estudos/categoria/$slug"
              params={{ slug: study.categorySlug }}
              className="hover:text-foreground"
            >
              {study.category}
            </Link>
          </nav>

          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
            {study.title}
          </h1>

          {/* BARRA DE AÇÕES (IMPRIMIR, COMPARTILHAR E SALVAR) */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-y border-border/80 py-3 print:hidden">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5 text-xs">
                <Printer className="size-3.5" />
                Imprimir
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare} className="gap-1.5 text-xs">
                <Share2 className="size-3.5" />
                Compartilhar
              </Button>
            </div>

            <VerseActions
              id={`study:${study.slug}`}
              kind="study"
              title={study.title}
              text={study.excerpt}
              href={`/estudos/${study.slug}`}
            />
          </div>

          <p className="mt-6 text-base text-foreground/90 sm:text-lg leading-relaxed">
            {study.intro}
          </p>

          {/* VERSÍCULOS RELACIONADOS */}
          {study.verses && study.verses.length > 0 && (
            <section className="mt-8">
              <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                <BookOpen className="size-5 text-primary" />
                Versículos Relacionados
              </h2>
              <div className="mt-3 space-y-3">
                {study.verses.map((v, idx) => (
                  <blockquote key={idx} className="rounded-xl border border-border bg-muted/40 p-4">
                    <p className="italic text-foreground/90 font-serif leading-relaxed">"{v.text}"</p>
                    <a href={v.link} className="mt-2 inline-block text-xs font-semibold text-primary hover:underline">
                      {v.ref}
                    </a>
                  </blockquote>
                ))}
              </div>
            </section>
          )}

          <div className="print:hidden">
            <AdInArticle className="my-8" />
          </div>

          {/* EXPLICAÇÃO E DESENVOLVIMENTO */}
          {study.explanation && study.explanation.length > 0 && (
            <section className="mt-8 space-y-4">
              <h2 className="font-display text-2xl font-bold text-foreground">
                Desenvolvimento e Explicação
              </h2>
              <div className="space-y-3 text-base text-muted-foreground leading-relaxed">
                {study.explanation.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </section>
          )}

          {/* CONCLUSÃO */}
          {study.conclusion && (
            <section className="mt-8 rounded-xl border border-border bg-card p-5">
              <h2 className="font-display text-xl font-bold text-foreground">Conclusão</h2>
              <p className="mt-2 text-base text-muted-foreground leading-relaxed">
                {study.conclusion}
              </p>
            </section>
          )}

          <div className="print:hidden">
            <AdInArticle className="my-8" />
          </div>

          {/* PERGUNTAS PARA REFLEXÃO */}
          {study.questions && study.questions.length > 0 && (
            <section className="mt-8 rounded-xl border border-border bg-card p-5">
              <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                <HelpCircle className="size-5 text-primary" />
                Perguntas para Reflexão Pessoal
              </h2>
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
                {study.questions.map((q, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {q}
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* VOCÊ TAMBÉM PODE GOSTAR */}
          {related.length > 0 && (
            <section className="mt-12 border-t border-border pt-8 print:hidden">
              <h2 className="font-display text-xl font-bold text-foreground">
                Você Também Pode Gostar
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Outros estudos e lições bíblicas recomendados para você:
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                {related.map((s) => (
                  <Link
                    key={s.id || s.slug}
                    to={
                      s.type === "escola-dominical"
                        ? `/estudos/escola-dominical/${s.slug}`
                        : s.type === "apostila"
                        ? `/estudos/apostilas/${s.slug}`
                        : `/estudos/${s.slug}`
                    }
                    className="group rounded-xl border border-border bg-card p-4 text-sm transition-all hover:border-primary/50 hover:shadow-sm"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                      {s.category}
                    </span>
                    <h3 className="mt-1.5 font-display font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {s.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {s.excerpt}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* APROFUNDE SUA EXPERIÊNCIA */}
          <section className="mt-8 rounded-xl border border-border/70 bg-card p-5 print:hidden">
            <h3 className="font-display text-base font-semibold text-foreground flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              Aprofunde sua experiência devocional
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Conecte este estudo bíblico com meditação e momentos de oração diários:
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <Link
                to="/versiculo-do-dia"
                className="rounded-full border border-border px-3 py-1.5 text-primary hover:bg-accent transition-colors"
              >
                → Versículo do Dia com reflexão
              </Link>
              <Link
                to="/oracoes"
                className="rounded-full border border-border px-3 py-1.5 text-primary hover:bg-accent transition-colors"
              >
                → Orações com fundamentação bíblica
              </Link>
              <Link
                to="/devocionais"
                className="rounded-full border border-border px-3 py-1.5 text-primary hover:bg-accent transition-colors"
              >
                → Devocionais diários
              </Link>
            </div>
          </section>
        </article>

        {/* ASIDE */}
        <aside className="space-y-6 print:hidden">
          <AdDesktop />
        </aside>
      </div>
    </SiteLayout>
  );
}
