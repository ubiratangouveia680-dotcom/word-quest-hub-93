import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, BookOpen, HeartHandshake, Sparkles, Share2, Copy } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { AdSlotTop, AdSlotContent, AdSlotBottom, AdDesktop } from "@/components/Ads";
import { VerseActions } from "@/components/VerseActions";
import { Button } from "@/components/ui/button";
import { getBookBySlug } from "@/lib/bible-books";
import { chapterQuery } from "@/lib/bible-queries";
import { BIBLE_TOPICS } from "@/lib/topics";
import { PRAYERS, STUDIES, DEVOTIONALS } from "@/lib/content";
import { url } from "@/lib/site";

export const Route = createFileRoute("/biblia/$book/$chapter/$verse")({
  loader: async ({ params, context }) => {
    const book = getBookBySlug(params.book);
    const chapter = Number(params.chapter);
    const verse = Number(params.verse);
    if (!book || !Number.isInteger(chapter) || chapter < 1 || chapter > book.chapters) {
      throw notFound();
    }
    const data = await context.queryClient.ensureQueryData(chapterQuery(book.id, chapter));
    const current = data.verses.find((v) => v.verse === verse);
    if (!current) throw notFound();

    const idx = data.verses.indexOf(current);
    const totalVerses = data.verses.length;
    const prevVerse = verse > 1 ? verse - 1 : null;
    const nextVerse = verse < totalVerses ? verse + 1 : null;

    // Temas relacionados
    const matchedTopics = BIBLE_TOPICS.filter((t) =>
      t.verses.some((v) => v.book === book.slug && v.chapter === chapter) ||
      t.description.toLowerCase().includes(book.name.toLowerCase())
    );
    const relatedTopics = (matchedTopics.length > 0 ? matchedTopics : BIBLE_TOPICS.slice(0, 4)).slice(0, 4);

    // Orações relacionadas
    const matchedPrayers = PRAYERS.filter((p) =>
      p.verses.some((v) => v.link.includes(`/biblia/${book.slug}`))
    );
    const relatedPrayers = (matchedPrayers.length > 0 ? matchedPrayers : PRAYERS.slice(0, 3)).slice(0, 3);

    // Estudos e Devocionais relacionados
    const matchedStudies = STUDIES.filter((s) =>
      s.verses.some((v) => v.link.includes(`/biblia/${book.slug}`))
    );
    const relatedStudies = (matchedStudies.length > 0 ? matchedStudies : STUDIES.slice(0, 2)).slice(0, 2);

    const matchedDevos = DEVOTIONALS.filter((d) =>
      d.verseLink.includes(`/biblia/${book.slug}`)
    );
    const relatedDevotionals = (matchedDevos.length > 0 ? matchedDevos : DEVOTIONALS.slice(0, 2)).slice(0, 2);

    return {
      book,
      chapter,
      verse,
      totalVerses,
      prevVerse,
      nextVerse,
      text: current.text,
      contextVerses: data.verses.slice(Math.max(0, idx - 2), Math.min(totalVerses, idx + 3)),
      relatedTopics,
      relatedPrayers,
      relatedStudies,
      relatedDevotionals,
    };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Versículo não encontrado" }, { name: "robots", content: "noindex" }] };
    }
    const { book, chapter, verse, text } = loaderData;
    const ref = `${book.name} ${chapter}:${verse}`;
    const title = `${ref} — Bíblia Online`;
    const cleanText = text.replace(/"/g, "'").slice(0, 140);
    const description = `Leia ${ref} na Bíblia Online: "${cleanText}...". Explore o contexto no capítulo ${chapter} de ${book.name}, temas bíblicos, orações e estudos relacionados.`;
    const canonical = url(`/biblia/${params.book}/${params.chapter}/${params.verse}`);

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
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Início", item: url("/") },
              { "@type": "ListItem", position: 2, name: "Bíblia", item: url("/biblia") },
              { "@type": "ListItem", position: 3, name: book.name, item: url(`/biblia/${params.book}`) },
              { "@type": "ListItem", position: 4, name: `Capítulo ${chapter}`, item: url(`/biblia/${params.book}/${params.chapter}`) },
              { "@type": "ListItem", position: 5, name: `Versículo ${verse}`, item: canonical },
            ],
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Quotation",
            text,
            citation: ref,
            isPartOf: {
              "@type": "Book",
              name: `Bíblia Sagrada — ${book.name}`,
            },
            inLanguage: "pt-BR",
          }),
        },
      ],
    };
  },
  component: VerseIndividualPage,
});

function VerseIndividualPage() {
  const {
    book,
    chapter,
    verse,
    text,
    prevVerse,
    nextVerse,
    contextVerses,
    relatedTopics,
    relatedPrayers,
    relatedStudies,
    relatedDevotionals,
  } = Route.useLoaderData();

  const ref = `${book.name} ${chapter}:${verse}`;
  const href = `/biblia/${book.slug}/${chapter}/${verse}`;

  return (
    <SiteLayout>
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        {/* Breadcrumbs hierárquicos completos */}
        <nav aria-label="Navegação estrutural" className="text-sm text-muted-foreground flex flex-wrap items-center gap-1">
          <Link to="/" className="hover:text-foreground">Início</Link>
          <span>&gt;</span>
          <Link to="/biblia" className="hover:text-foreground">Bíblia</Link>
          <span>&gt;</span>
          <Link to="/biblia/$book" params={{ book: book.slug }} className="hover:text-foreground">
            {book.name}
          </Link>
          <span>&gt;</span>
          <Link
            to="/biblia/$book/$chapter"
            params={{ book: book.slug, chapter: String(chapter) }}
            className="hover:text-foreground"
          >
            Capítulo {chapter}
          </Link>
          <span>&gt;</span>
          <span className="text-foreground font-medium">Versículo {verse}</span>
        </nav>

        <div className="mt-4">
          <AdSlotTop />
        </div>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_300px]">
          <article>
            <header>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-gold/10 px-3 py-1 text-xs font-medium text-gold mb-2">
                <BookOpen className="size-3.5" /> {book.name} &bull; Capítulo {chapter}, Versículo {verse}
              </div>
              <h1 className="font-display text-3xl font-semibold sm:text-4xl">
                {ref}
              </h1>
            </header>

            {/* Caixa em destaque do Versículo */}
            <div className="mt-6 rounded-2xl border-2 border-gold/30 bg-card p-6 sm:p-8 shadow-xs">
              <blockquote className="font-serif text-xl sm:text-2xl leading-relaxed text-foreground italic">
                "{text}"
              </blockquote>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border/60">
                <span className="text-xs text-muted-foreground">
                  Texto bíblico disponibilizado através da Bible API.
                </span>
                <VerseActions
                  id={`verse:${book.slug}:${chapter}:${verse}`}
                  kind="verse"
                  title={ref}
                  text={text}
                  href={href}
                  bookSlug={book.slug}
                  chapter={chapter}
                  verseNumber={verse}
                />
              </div>
            </div>

            {/* Navegação entre versículos e capítulo completo */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 bg-muted/20 p-4">
              {prevVerse ? (
                <Link
                  to="/biblia/$book/$chapter/$verse"
                  params={{ book: book.slug, chapter: String(chapter), verse: String(prevVerse) }}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-gold transition-colors"
                >
                  <ArrowLeft className="size-4" />
                  <span>Versículo {prevVerse}</span>
                </Link>
              ) : (
                <div />
              )}

              <Button asChild variant="outline" size="sm">
                <Link
                  to="/biblia/$book/$chapter"
                  params={{ book: book.slug, chapter: String(chapter) }}
                  className="font-medium"
                >
                  Ler Capítulo {chapter} Completo &rarr;
                </Link>
              </Button>

              {nextVerse ? (
                <Link
                  to="/biblia/$book/$chapter/$verse"
                  params={{ book: book.slug, chapter: String(chapter), verse: String(nextVerse) }}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-gold transition-colors"
                >
                  <span>Versículo {nextVerse}</span>
                  <ArrowRight className="size-4" />
                </Link>
              ) : (
                <div />
              )}
            </div>

            <div className="my-8">
              <AdSlotContent />
            </div>

            {/* Versículos no Contexto */}
            <section className="mt-8 rounded-xl border border-border/70 bg-card p-6">
              <h2 className="font-display text-xl font-semibold text-foreground">
                Versículos no Contexto ({book.name} {chapter})
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Compreenda a mensagem completa acompanhando os versículos vizinhos.
              </p>
              <div className="mt-4 space-y-2">
                {contextVerses.map((v) => {
                  const isCurrent = v.verse === verse;
                  return (
                    <div
                      key={v.verse}
                      className={`rounded-lg p-3 text-sm transition-colors ${
                        isCurrent
                          ? "bg-gold/15 border-l-4 border-gold font-medium text-foreground"
                          : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                      }`}
                    >
                      <Link
                        to="/biblia/$book/$chapter/$verse"
                        params={{ book: book.slug, chapter: String(chapter), verse: String(v.verse) }}
                        className="inline-flex items-baseline gap-2"
                      >
                        <span className="font-bold text-gold text-xs">{v.verse}</span>
                        <span className={isCurrent ? "text-foreground" : ""}>{v.text}</span>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Temas Bíblicos Relacionados */}
            <section className="mt-8">
              <h2 className="font-display text-xl font-semibold mb-3">
                Temas Relacionados
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {relatedTopics.map((t) => (
                  <Link
                    key={t.slug}
                    to="/versiculos/$slug"
                    params={{ slug: t.slug }}
                    className="surface group flex flex-col justify-between p-3.5 hover:border-gold/50"
                  >
                    <div>
                      <h3 className="font-medium text-sm text-foreground group-hover:text-gold transition-colors">
                        Versículos sobre {t.name}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{t.description}</p>
                    </div>
                    <span className="mt-2 text-xs font-medium text-gold inline-flex items-center gap-1">
                      Ver tema &rarr;
                    </span>
                  </Link>
                ))}
              </div>
            </section>

            {/* Orações Relacionadas */}
            {relatedPrayers.length > 0 && (
              <section className="mt-8">
                <h2 className="font-display text-xl font-semibold mb-3">
                  Orações Relacionadas
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {relatedPrayers.map((p) => (
                    <Link
                      key={p.slug}
                      to="/oracoes/$slug"
                      params={{ slug: p.slug }}
                      className="surface group flex flex-col justify-between p-3.5 hover:border-gold/50"
                    >
                      <div>
                        <div className="flex items-center gap-1 text-xs text-gold font-medium mb-1">
                          <HeartHandshake className="size-3" /> {p.category}
                        </div>
                        <h3 className="font-medium text-sm text-foreground group-hover:text-gold transition-colors">
                          {p.title}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{p.intro}</p>
                      </div>
                      <span className="mt-2 text-xs font-medium text-gold inline-flex items-center gap-1">
                        Fazer esta oração &rarr;
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Estudos e Devocionais Recomendados */}
            {(relatedStudies.length > 0 || relatedDevotionals.length > 0) && (
              <section className="mt-8 rounded-xl border border-border/60 bg-muted/20 p-6">
                <h2 className="font-display text-xl font-semibold mb-3">
                  Leia Também: Estudos e Devocionais
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {relatedStudies.map((s) => (
                    <Link
                      key={s.slug}
                      to="/estudos/$slug"
                      params={{ slug: s.slug }}
                      className="surface p-3.5 hover:border-gold/50"
                    >
                      <div className="flex items-center gap-1 text-xs text-gold font-medium mb-1">
                        <BookOpen className="size-3" /> Estudo Bíblico
                      </div>
                      <h3 className="font-medium text-sm">{s.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{s.excerpt}</p>
                    </Link>
                  ))}
                  {relatedDevotionals.map((d) => (
                    <Link
                      key={d.slug}
                      to="/devocionais/$slug"
                      params={{ slug: d.slug }}
                      className="surface p-3.5 hover:border-gold/50"
                    >
                      <div className="flex items-center gap-1 text-xs text-gold font-medium mb-1">
                        <Sparkles className="size-3" /> Devocional
                      </div>
                      <h3 className="font-medium text-sm">{d.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{d.reflection}</p>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            <div className="mt-8">
              <AdSlotBottom />
            </div>
          </article>

          <aside className="space-y-6">
            <div className="surface rounded-xl border border-border/70 p-5">
              <h3 className="font-display font-semibold text-lg flex items-center gap-2">
                <BookOpen className="size-4 text-gold" /> Sobre o Livro de {book.name}
              </h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                {book.description}
              </p>
              <div className="mt-4 pt-3 border-t border-border/50 flex flex-col gap-2">
                <Link
                  to="/biblia/$book"
                  params={{ book: book.slug }}
                  className="text-xs font-semibold text-gold hover:underline"
                >
                  Ver todos os {book.chapters} capítulos de {book.name} &rarr;
                </Link>
                <Link
                  to="/pergunte-a-biblia"
                  search={{ q: `O que significa ${ref}?` }}
                  className="text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  Perguntar sobre este versículo à Bíblia &rarr;
                </Link>
              </div>
            </div>

            <AdDesktop />
          </aside>
        </div>
      </div>
    </SiteLayout>
  );
}
