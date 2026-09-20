import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { HeartHandshake, BookOpen, Sparkles, ArrowRight, Share2, HelpCircle } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { AdBanner, AdDesktop, AdInArticle } from "@/components/Ads";
import { VerseActions } from "@/components/VerseActions";
import { getPrayer, PRAYERS } from "@/lib/content";
import { url } from "@/lib/site";

export const Route = createFileRoute("/oracoes/$slug")({
  loader: ({ params }) => {
    const prayer = getPrayer(params.slug);
    if (!prayer) throw notFound();
    return { prayer };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Oração não encontrada" }, { name: "robots", content: "noindex" }] };
    }
    const { prayer } = loaderData;
    const title = `${prayer.title} | Oração Bíblica — Bíblia Online`;
    const description = prayer.intro;
    const canonical = url(`/oracoes/${params.slug}`);

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
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: prayer.title,
            description: prayer.intro,
            articleSection: prayer.category,
            inLanguage: "pt-BR",
            url: canonical,
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Início", item: url("/") },
              { "@type": "ListItem", position: 2, name: "Orações", item: url("/oracoes") },
              { "@type": "ListItem", position: 3, name: prayer.title, item: canonical },
            ],
          }),
        },
      ],
    };
  },
  component: PrayerDetailPage,
});

function PrayerDetailPage() {
  const { prayer } = Route.useLoaderData();
  const otherPrayers = PRAYERS.filter((p) => p.slug !== prayer.slug).slice(0, 4);

  return (
    <SiteLayout>
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        <nav aria-label="Navegação estrutural" className="text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Início</Link>
          <span className="mx-1">/</span>
          <Link to="/oracoes" className="hover:text-foreground">Orações</Link>
          <span className="mx-1">/</span>
          <span className="text-foreground">{prayer.category}</span>
        </nav>

        <article className="mt-4 grid gap-8 lg:grid-cols-[1fr_300px]">
          <div>
            <header>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-gold/10 px-3 py-1 text-xs font-medium text-gold mb-2">
                <HeartHandshake className="size-3.5" /> {prayer.category}
              </div>
              <h1 className="font-display text-3xl font-semibold sm:text-4xl text-foreground">
                {prayer.title}
              </h1>
              <p className="mt-3 text-base text-muted-foreground leading-relaxed sm:text-lg">
                {prayer.intro}
              </p>
            </header>

            <div className="mt-6">
              <AdBanner />
            </div>

            {/* Oração Principal */}
            <section className="mt-8 rounded-2xl border-2 border-gold/30 bg-card p-6 shadow-xs sm:p-8">
              <div className="flex items-center justify-between pb-4 border-b border-border/60">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gold">
                  <Sparkles className="size-3.5" /> Texto da Oração
                </span>
                <VerseActions
                  id={`prayer:${prayer.slug}`}
                  kind="prayer"
                  title={prayer.title}
                  text={prayer.text}
                  href={`/oracoes/${prayer.slug}`}
                />
              </div>
              <p className="font-serif text-lg leading-relaxed text-foreground whitespace-pre-line pt-6 italic sm:text-xl">
                "{prayer.text}"
              </p>
            </section>

            <div className="my-8">
              <AdInArticle />
            </div>

            {/* Versículos de Fundamentação */}
            {prayer.verses && prayer.verses.length > 0 && (
              <section className="mt-8">
                <h2 className="font-display text-2xl font-semibold mb-4">
                  Versículos de Fundamentação Bíblica
                </h2>
                <div className="space-y-3">
                  {prayer.verses.map((v) => (
                    <blockquote
                      key={v.ref}
                      className="surface rounded-xl border border-border/70 p-4 transition-colors hover:border-gold/40"
                    >
                      <p className="font-serif text-base italic text-foreground">"{v.text}"</p>
                      <div className="mt-2 flex items-center justify-between pt-2 border-t border-border/40">
                        <a
                          href={v.link}
                          className="text-xs font-medium text-gold hover:underline inline-flex items-center gap-1"
                        >
                          <BookOpen className="size-3" /> {v.ref}
                        </a>
                        <VerseActions
                          id={`prayer-verse:${prayer.slug}:${v.ref}`}
                          kind="verse"
                          title={v.ref}
                          text={v.text}
                          href={v.link || `/oracoes/${prayer.slug}`}
                        />
                      </div>
                    </blockquote>
                  ))}
                </div>
              </section>
            )}

            {/* Reflexão Espiritual */}
            <section className="mt-8 rounded-xl border border-border/60 bg-muted/20 p-6 space-y-2">
              <h2 className="font-display text-xl font-semibold text-foreground">
                Reflexão Espiritual
              </h2>
              <p className="reading-text leading-relaxed text-foreground/90">
                {prayer.reflection}
              </p>
            </section>

            {/* Aplicação Prática */}
            <section className="mt-6 rounded-xl border border-border/60 bg-muted/20 p-6 space-y-2">
              <h2 className="font-display text-xl font-semibold text-foreground">
                Aplicação Prática no Dia a Dia
              </h2>
              <p className="reading-text leading-relaxed text-foreground/90">
                {prayer.application}
              </p>
            </section>

            {/* Links Relacionados (Estudo / Devocional) */}
            <section className="mt-8 flex flex-wrap gap-3">
              {prayer.relatedStudySlug && (
                <Link
                  to="/estudos/$slug"
                  params={{ slug: prayer.relatedStudySlug }}
                  className="surface inline-flex items-center gap-2 rounded-xl p-3 text-sm font-medium hover:border-gold/50"
                >
                  <BookOpen className="size-4 text-gold" />
                  <span>Ler estudo bíblico relacionado &rarr;</span>
                </Link>
              )}
              {prayer.relatedDevotionalSlug && (
                <Link
                  to="/devocionais/$slug"
                  params={{ slug: prayer.relatedDevotionalSlug }}
                  className="surface inline-flex items-center gap-2 rounded-xl p-3 text-sm font-medium hover:border-gold/50"
                >
                  <Sparkles className="size-4 text-gold" />
                  <span>Ver devocional diário relacionado &rarr;</span>
                </Link>
              )}
            </section>

            {/* Outras Orações */}
            <section className="mt-12 pt-8 border-t border-border">
              <h3 className="font-display text-xl font-semibold mb-4">
                Veja outras orações bíblicas
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {otherPrayers.map((op) => (
                  <Link
                    key={op.slug}
                    to="/oracoes/$slug"
                    params={{ slug: op.slug }}
                    className="surface group flex items-center justify-between p-3.5 hover:border-gold/50"
                  >
                    <div>
                      <h4 className="font-medium text-sm group-hover:text-gold transition-colors">
                        {op.title}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-1">{op.intro}</p>
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
        </article>
      </div>
    </SiteLayout>
  );
}
