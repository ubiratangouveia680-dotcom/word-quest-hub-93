import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { AdDesktop, AdInArticle } from "@/components/Ads";
import { VerseActions } from "@/components/VerseActions";
import { getStudy, STUDIES } from "@/lib/content";
import { url } from "@/lib/site";

export const Route = createFileRoute("/estudos/$slug")({
  loader: ({ params }) => {
    const study = getStudy(params.slug);
    if (!study) throw notFound();
    return { study };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Estudo não encontrado" }, { name: "robots", content: "noindex" }] };
    }
    const { study } = loaderData;
    const path = `/estudos/${params.slug}`;
    return {
      meta: [
        { title: `${study.title} | Estudo bíblico — Bíblia Online` },
        { name: "description", content: study.excerpt },
        { property: "og:title", content: study.title },
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
          }),
        },
      ],
    };
  },
  component: StudyPage,
});

function StudyPage() {
  const { study } = Route.useLoaderData();
  const related = STUDIES.filter((s) => s.slug !== study.slug).slice(0, 3);

  return (
    <SiteLayout>
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[1fr_300px]">
        <article>
          <nav className="text-sm text-muted-foreground">
            <Link to="/estudos" className="hover:text-foreground">Estudos</Link>
            <span className="mx-1">/</span>
            <Link
              to="/estudos/categoria/$slug"
              params={{ slug: study.categorySlug }}
              className="hover:text-foreground"
            >
              {study.category}
            </Link>
          </nav>
          <h1 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">{study.title}</h1>
          <div className="mt-3">
            <VerseActions
              id={`study:${study.slug}`}
              kind="study"
              title={study.title}
              text={study.excerpt}
              href={`/estudos/${study.slug}`}
            />
          </div>

          <p className="mt-5 reading-text">{study.intro}</p>

          <section className="mt-8">
            <h2 className="font-display text-2xl font-semibold">Versículos relacionados</h2>
            <div className="mt-3 space-y-3">
              {study.verses.map((v) => (
                <blockquote key={v.ref} className="warm-panel p-4">
                  <p className="reading-text italic">{v.text}</p>
                  <a href={v.link} className="mt-2 inline-block text-sm text-gold hover:underline">
                    {v.ref}
                  </a>
                </blockquote>
              ))}
            </div>
          </section>

          <AdInArticle className="mt-8" />

          <section className="mt-8">
            <h2 className="font-display text-2xl font-semibold">Explicação</h2>
            {study.explanation.map((p, i) => (
              <p key={i} className="mt-3 reading-text">{p}</p>
            ))}
          </section>

          <section className="mt-8">
            <h2 className="font-display text-2xl font-semibold">Conclusão</h2>
            <p className="mt-3 reading-text">{study.conclusion}</p>
          </section>

          <AdInArticle className="mt-8" />

          <section className="mt-8">
            <h2 className="font-display text-2xl font-semibold">Perguntas para reflexão</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-muted-foreground">
              {study.questions.map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ol>
          </section>

          <section className="mt-10">
            <h2 className="font-display text-xl font-semibold">Leia também</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {related.map((s) => (
                <Link
                  key={s.slug}
                  to="/estudos/$slug"
                  params={{ slug: s.slug }}
                  className="surface p-3 text-sm transition-colors hover:bg-accent/40"
                >
                  {s.title}
                </Link>
              ))}
            </div>
          </section>
        </article>
        <aside>
          <AdDesktop />
        </aside>
      </div>
    </SiteLayout>
  );
}
