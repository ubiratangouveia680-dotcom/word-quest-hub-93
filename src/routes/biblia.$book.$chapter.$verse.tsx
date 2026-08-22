import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { AdBanner, AdDesktop, AdInArticle } from "@/components/Ads";
import { VerseActions } from "@/components/VerseActions";
import { Button } from "@/components/ui/button";
import { getBookBySlug } from "@/lib/bible-books";
import { chapterQuery } from "@/lib/bible-queries";
import { url } from "@/lib/site";

export const Route = createFileRoute("/biblia/$book/$chapter/$verse")({
  loader: async ({ params, context }) => {
    const book = getBookBySlug(params.book);
    const chapter = Number(params.chapter);
    const verse = Number(params.verse);
    if (!book || !Number.isInteger(chapter) || chapter < 1 || chapter > book.chapters) throw notFound();
    const data = await context.queryClient.ensureQueryData(chapterQuery(book.id, chapter));
    const current = data.verses.find((v) => v.verse === verse);
    if (!current) throw notFound();
    const idx = data.verses.indexOf(current);
    return {
      book,
      chapter,
      verse,
      text: current.text,
      context: data.verses.slice(Math.max(0, idx - 2), idx + 3),
    };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Versículo não encontrado" }, { name: "robots", content: "noindex" }] };
    }
    const { book, chapter, verse, text } = loaderData;
    const ref = `${book.name} ${chapter}:${verse}`;
    const title = `${ref} — o que diz o versículo | Bíblia Online`;
    const description = `${text.slice(0, 150)}`;
    const path = `/biblia/${params.book}/${params.chapter}/${params.verse}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url(path) },
      ],
      links: [{ rel: "canonical", href: url(path) }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Quotation",
            spokenByCharacter: undefined,
            text,
            citation: ref,
            isPartOf: { "@type": "Book", name: `Bíblia — ${book.name}` },
          }),
        },
      ],
    };
  },
  component: VersePage,
});

function VersePage() {
  const { book, chapter, verse, text, context } = Route.useLoaderData();
  const ref = `${book.name} ${chapter}:${verse}`;
  const href = `/biblia/${book.slug}/${chapter}/${verse}`;

  return (
    <SiteLayout>
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[1fr_300px]">
        <article>
          <nav className="text-sm text-muted-foreground">
            <Link to="/biblia" className="hover:text-foreground">Bíblia</Link>
            <span className="mx-1">/</span>
            <Link to="/biblia/$book" params={{ book: book.slug }} className="hover:text-foreground">
              {book.name}
            </Link>
            <span className="mx-1">/</span>
            <Link
              to="/biblia/$book/$chapter"
              params={{ book: book.slug, chapter: String(chapter) }}
              className="hover:text-foreground"
            >
              {chapter}
            </Link>
            <span className="mx-1">/</span>
            <span className="text-foreground">{verse}</span>
          </nav>

          <h1 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">{ref}</h1>

          <blockquote className="warm-panel mt-5 p-5 reading-text italic">{text}</blockquote>
          <div className="mt-3">
            <VerseActions
              id={`verse:${book.slug}:${chapter}:${verse}`}
              kind="verse"
              title={ref}
              text={text}
              href={href}
            />
          </div>

          <AdBanner className="mt-8" />

          <section className="mt-8">
            <h2 className="font-display text-xl font-semibold">Contexto</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Versículos próximos em {book.name} {chapter}.
            </p>
            <div className="mt-3 space-y-2">
              {context.map((v) => (
                <p
                  key={v.verse}
                  className={`reading-text rounded-md px-2 py-1 ${
                    v.verse === verse ? "bg-gold-soft" : ""
                  }`}
                >
                  <span className="mr-1.5 align-super text-xs font-semibold text-gold">{v.verse}</span>
                  {v.text}
                </p>
              ))}
            </div>
          </section>

          <AdInArticle className="mt-8" />

          <section className="mt-8">
            <h2 className="font-display text-xl font-semibold">Sobre o livro de {book.name}</h2>
            <p className="mt-2 text-muted-foreground">{book.description}</p>
          </section>

          <div className="mt-8 flex flex-wrap gap-2">
            <Button asChild>
              <Link to="/biblia/$book/$chapter" params={{ book: book.slug, chapter: String(chapter) }}>
                Ler {book.name} {chapter}
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/pergunte" search={{ q: `Explique ${ref}` }}>Explicar com IA</Link>
            </Button>
          </div>
        </article>
        <aside>
          <AdDesktop />
        </aside>
      </div>
    </SiteLayout>
  );
}
