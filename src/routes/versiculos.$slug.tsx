import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { BookOpen, HeartHandshake, ArrowRight, Share2, HelpCircle } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { AdBanner, AdDesktop, AdInArticle } from "@/components/Ads";
import { VerseActions } from "@/components/VerseActions";
import { getBibleTopic, BIBLE_TOPICS } from "@/lib/topics";
import { url } from "@/lib/site";

export const Route = createFileRoute("/versiculos/$slug")({
  loader: ({ params }) => {
    const topic = getBibleTopic(params.slug);
    if (!topic) throw notFound();
    return { topic };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Tema não encontrado" }, { name: "robots", content: "noindex" }] };
    }
    const { topic } = loaderData;
    const title = `Versículos sobre ${topic.name} — O que a Bíblia diz | Bíblia Online`;
    const description = `Leia os principais versículos sobre ${topic.name.toLowerCase()} na Bíblia Sagrada com reflexão contextual, aplicação para o seu dia a dia e respostas para dúvidas frequentes.`;
    const canonical = url(`/versiculos/${params.slug}`);

    const scripts: Array<{ type: string; children: string }> = [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Início", item: url("/") },
            { "@type": "ListItem", position: 2, name: "Versículos", item: url("/versiculos") },
            { "@type": "ListItem", position: 3, name: topic.name, item: canonical },
          ],
        }),
      },
    ];

    if (topic.faq && topic.faq.length > 0) {
      scripts.push({
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: topic.faq.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.a,
            },
          })),
        }),
      });
    }

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: canonical },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: canonical }],
      scripts,
    };
  },
  component: VersiculosDetailPage,
});

function VersiculosDetailPage() {
  const { topic } = Route.useLoaderData();
  const relatedTopics = BIBLE_TOPICS.filter((t) => t.slug !== topic.slug).slice(0, 4);

  return (
    <SiteLayout>
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        <nav aria-label="Navegação estrutural" className="text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Início</Link>
          <span className="mx-1">/</span>
          <Link to="/versiculos" className="hover:text-foreground">Versículos</Link>
          <span className="mx-1">/</span>
          <span className="text-foreground">{topic.name}</span>
        </nav>

        <header className="mt-4">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-gold/10 px-3 py-1 text-xs font-medium text-gold mb-2">
            <BookOpen className="size-3.5" /> Versículos Selecionados
          </div>
          <h1 className="font-display text-3xl font-semibold sm:text-4xl">
            Versículos sobre {topic.name} na Bíblia
          </h1>
          <p className="mt-3 max-w-3xl text-base text-muted-foreground leading-relaxed sm:text-lg">
            {topic.description}
          </p>
        </header>

        <div className="mt-6">
          <AdBanner />
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_300px]">
          <div>
            <section aria-labelledby="versiculos-lista">
              <h2 id="versiculos-lista" className="font-display text-2xl font-semibold">
                Passagens bíblicas sobre {topic.name.toLowerCase()}
              </h2>
              <div className="mt-4 space-y-4">
                {topic.verses.map((verse) => {
                  const shareText = `"${verse.text}" — ${verse.ref}`;
                  return (
                    <blockquote
                      key={verse.ref}
                      className="surface relative rounded-xl border border-border/70 p-5 transition-colors hover:border-gold/40"
                    >
                      <p className="font-serif text-lg leading-relaxed text-foreground italic">
                        "{verse.text}"
                      </p>
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/40">
                        <Link
                          to="/biblia/$book/$chapter/$verse"
                          params={{
                            book: verse.book,
                            chapter: String(verse.chapter),
                            verse: String(verse.verse),
                          }}
                          className="font-medium text-sm text-gold hover:underline"
                        >
                          {verse.ref} &rarr;
                        </Link>
                        <VerseActions
                          text={shareText}
                          reference={verse.ref}
                          bookSlug={verse.book}
                          chapter={verse.chapter}
                          verseNumber={verse.verse}
                        />
                      </div>
                    </blockquote>
                  );
                })}
              </div>
            </section>

            <div className="my-8">
              <AdInArticle />
            </div>

            <section className="rounded-xl border border-border/60 bg-muted/20 p-6 space-y-3">
              <h2 className="font-display text-xl font-semibold text-foreground">
                Reflexão bíblica sobre {topic.name.toLowerCase()}
              </h2>
              <p className="reading-text leading-relaxed text-foreground/90">
                {topic.reflection}
              </p>
            </section>

            <section className="mt-6 rounded-xl border border-border/60 bg-muted/20 p-6 space-y-3">
              <h2 className="font-display text-xl font-semibold text-foreground">
                Aplicação prática para a sua vida
              </h2>
              <p className="reading-text leading-relaxed text-foreground/90">
                {topic.application}
              </p>
            </section>

            {topic.relatedChapters && topic.relatedChapters.length > 0 && (
              <section className="mt-8">
                <h3 className="font-display text-lg font-semibold mb-3">
                  Capítulos bíblicos recomendados
                </h3>
                <div className="flex flex-wrap gap-2">
                  {topic.relatedChapters.map((cap) => (
                    <a
                      key={cap.name}
                      href={cap.link}
                      className="surface inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-foreground hover:border-gold/50"
                    >
                      <BookOpen className="size-3.5 text-gold" />
                      {cap.name}
                    </a>
                  ))}
                </div>
              </section>
            )}

            {topic.relatedPrayers && topic.relatedPrayers.length > 0 && (
              <section className="mt-6">
                <h3 className="font-display text-lg font-semibold mb-3">
                  Oração relacionada
                </h3>
                <div className="flex flex-wrap gap-2">
                  {topic.relatedPrayers.map((pray) => (
                    <a
                      key={pray.name}
                      href={pray.link}
                      className="surface inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-foreground hover:border-gold/50"
                    >
                      <HeartHandshake className="size-3.5 text-gold" />
                      {pray.name}
                    </a>
                  ))}
                </div>
              </section>
            )}

            {topic.faq && topic.faq.length > 0 && (
              <section className="mt-10">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gold mb-2">
                  <HelpCircle className="size-3.5" /> Perguntas Frequentes
                </div>
                <h2 className="font-display text-2xl font-semibold mb-4">
                  Dúvidas sobre {topic.name.toLowerCase()} na Bíblia
                </h2>
                <div className="space-y-3">
                  {topic.faq.map((item, idx) => (
                    <div key={idx} className="surface rounded-xl p-4">
                      <h3 className="font-medium text-sm text-foreground">{item.q}</h3>
                      <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{item.a}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="mt-12 pt-8 border-t border-border">
              <h3 className="font-display text-xl font-semibold mb-4">
                Veja outros temas bíblicos
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {relatedTopics.map((rel) => (
                  <Link
                    key={rel.slug}
                    to="/versiculos/$slug"
                    params={{ slug: rel.slug }}
                    className="surface group flex items-center justify-between p-3.5 hover:border-gold/50"
                  >
                    <div>
                      <h4 className="font-medium text-sm group-hover:text-gold transition-colors">
                        Versículos sobre {rel.name}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-1">{rel.description}</p>
                    </div>
                    <ArrowRight className="size-4 text-muted-foreground group-hover:text-gold transition-transform group-hover:translate-x-1" />
                  </Link>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <AdDesktop />
          </aside>
        </div>
      </div>
    </SiteLayout>
  );
}
