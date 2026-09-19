import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { AdDesktop, AdInArticle } from "@/components/Ads";
import { VerseActions } from "@/components/VerseActions";
import { DEVOTIONALS, getDevotional } from "@/lib/content";
import { url } from "@/lib/site";

export const Route = createFileRoute("/devocionais/$slug")({
  loader: ({ params }) => {
    const devotional = getDevotional(params.slug);
    if (!devotional) throw notFound();
    return { devotional };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Devocional não encontrado" }, { name: "robots", content: "noindex" }] };
    }
    const { devotional } = loaderData;
    const path = `/devocionais/${params.slug}`;
    const description = devotional.reflection.slice(0, 155);
    return {
      meta: [
        { title: `${devotional.title} — Devocional | Bíblia Online` },
        { name: "description", content: description },
        { property: "og:title", content: devotional.title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url(path) },
      ],
      links: [{ rel: "canonical", href: url(path) }],
    };
  },
  component: DevotionalPage,
});

function DevotionalPage() {
  const { devotional } = Route.useLoaderData();
  const others = DEVOTIONALS.filter((d) => d.slug !== devotional.slug);

  return (
    <SiteLayout>
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[1fr_300px]">
        <article>
          <nav className="text-sm text-muted-foreground">
            <Link to="/devocionais" className="hover:text-foreground">Devocionais</Link>
          </nav>
          <h1 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">{devotional.title}</h1>
          <div className="mt-3">
            <VerseActions
              id={`devotional:${devotional.slug}`}
              kind="devotional"
              title={devotional.title}
              text={devotional.verseText}
              href={`/devocionais/${devotional.slug}`}
            />
          </div>

          <blockquote className="warm-panel mt-5 p-5">
            <p className="reading-text italic">{devotional.verseText}</p>
            <a href={devotional.verseLink} className="mt-2 inline-block text-sm text-gold hover:underline">
              {devotional.verseRef}
            </a>
          </blockquote>

          <section className="mt-8">
            <h2 className="font-display text-2xl font-semibold">Reflexão</h2>
            <p className="mt-3 reading-text">{devotional.reflection}</p>
          </section>

          <AdInArticle className="mt-8" />

          <section className="mt-8">
            <h2 className="font-display text-2xl font-semibold">Aplicação prática</h2>
            <p className="mt-3 reading-text">{devotional.application}</p>
          </section>

          <section className="mt-8">
            <h2 className="font-display text-2xl font-semibold">Oração</h2>
            <p className="mt-3 reading-text italic">{devotional.prayer}</p>
          </section>

          <section className="mt-10">
            <h2 className="font-display text-xl font-semibold">Outros devocionais</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {others.map((d) => (
                <Link
                  key={d.slug}
                  to="/devocionais/$slug"
                  params={{ slug: d.slug }}
                  className="surface p-3 text-sm transition-colors hover:bg-accent/40"
                >
                  {d.title}
                </Link>
              ))}
            </div>
          </section>

          <section className="mt-8 rounded-xl border border-border/70 bg-card p-5">
            <h3 className="font-display text-base font-semibold">Fortaleça sua comunhão diária</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Continue sua caminhada diária com nossos estudos e orações bíblicas:
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <Link to="/estudos" className="rounded-full border border-border px-3 py-1 text-primary hover:bg-accent">
                → Explorar Estudos Bíblicos
              </Link>
              <Link to="/oracoes" className="rounded-full border border-border px-3 py-1 text-primary hover:bg-accent">
                → Orações da Manhã e Noite
              </Link>
              <Link to="/versiculo-do-dia" className="rounded-full border border-border px-3 py-1 text-primary hover:bg-accent">
                → Versículo do Dia
              </Link>
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
