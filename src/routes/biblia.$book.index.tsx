import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { AdBanner } from "@/components/Ads";
import { BIBLE_BOOKS, getBookBySlug } from "@/lib/bible-books";
import { url } from "@/lib/site";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/biblia/$book/")({
  loader: ({ params }) => {
    const book = getBookBySlug(params.book);
    if (!book) throw notFound();
    return { book };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Livro não encontrado" }, { name: "robots", content: "noindex" }] };
    }
    const { book } = loaderData;
    const title = `Bíblia ${book.name} — Bíblia Online`;
    const description = `Leia o livro de ${book.name} completo na Bíblia Online. Acesse todos os ${book.chapters} capítulos, pesquise versículos e navegue gratuitamente pela Bíblia Sagrada.`;
    const path = `/biblia/${params.book}`;
    const testamentName = book.testament === "AT" ? "Antigo Testamento" : "Novo Testamento";
    const testamentPath = book.testament === "AT" ? "/biblia/antigo-testamento" : "/biblia/novo-testamento";

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url(path) },
        { property: "og:image", content: url("/icon-512.png") },
      ],
      links: [{ rel: "canonical", href: url(path) }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Início", item: url("/") },
              { "@type": "ListItem", position: 2, name: "Bíblia", item: url("/biblia") },
              { "@type": "ListItem", position: 3, name: testamentName, item: url(testamentPath) },
              { "@type": "ListItem", position: 4, name: book.name, item: url(path) },
            ],
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Book",
            name: `Livro de ${book.name}`,
            isPartOf: {
              "@type": "Book",
              name: "Bíblia Sagrada",
              url: url("/biblia"),
            },
            numberOfPages: book.chapters,
            inLanguage: "pt-BR",
            url: url(path),
          }),
        },
      ],
    };
  },
  component: BookPage,
});

function BookPage() {
  const { book } = Route.useLoaderData();
  const testamentName = book.testament === "AT" ? "Antigo Testamento" : "Novo Testamento";
  const testamentPath = book.testament === "AT" ? "/biblia/antigo-testamento" : "/biblia/novo-testamento";

  const bookIdx = BIBLE_BOOKS.findIndex((b) => b.slug === book.slug);
  const prevBook = bookIdx > 0 ? BIBLE_BOOKS[bookIdx - 1] : null;
  const nextBook = bookIdx < BIBLE_BOOKS.length - 1 ? BIBLE_BOOKS[bookIdx + 1] : null;

  return (
    <SiteLayout>
      <div className="mx-auto w-full max-w-4xl px-4 py-8">
        <nav aria-label="Navegação estrutural" className="text-sm text-muted-foreground flex flex-wrap items-center gap-1">
          <Link to="/" className="hover:text-foreground">Início</Link>
          <span className="mx-1">&gt;</span>
          <Link to="/biblia" className="hover:text-foreground">Bíblia</Link>
          <span className="mx-1">&gt;</span>
          <Link to={testamentPath} className="hover:text-foreground">
            {testamentName}
          </Link>
          <span className="mx-1">&gt;</span>
          <span className="text-foreground font-semibold">{book.name}</span>
        </nav>

        <h1 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">{book.name}</h1>
        <p className="mt-2 text-muted-foreground">{book.description}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          <Link to={testamentPath} className="text-gold hover:underline font-medium">
            {testamentName}
          </Link>{" "}
          · {book.chapters} capítulos
        </p>

        <div className="mt-6">
          <AdBanner />
        </div>

        <h2 className="mt-8 font-display text-xl font-semibold">Capítulos de {book.name}</h2>
        <div className="mt-4 grid grid-cols-5 xs:grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
          {Array.from({ length: book.chapters }, (_, i) => i + 1).map((c) => (
            <Link
              key={c}
              to="/biblia/$book/$chapter"
              params={{ book: book.slug, chapter: String(c) }}
              className="surface flex h-11 items-center justify-center text-sm font-semibold transition-all hover:bg-accent active:scale-95 rounded-xl touch-manipulation"
            >
              {c}
            </Link>
          ))}
        </div>

        <nav aria-label="Navegação entre livros" className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {prevBook ? (
            <Button asChild variant="outline" className="h-10 text-xs sm:text-sm">
              <Link to="/biblia/$book" params={{ book: prevBook.slug }}>
                <ChevronLeft className="mr-1 size-4" />
                <span>Livro anterior: {prevBook.name}</span>
              </Link>
            </Button>
          ) : (
            <span className="hidden sm:inline-block" />
          )}

          {nextBook ? (
            <Button asChild variant="outline" className="h-10 text-xs sm:text-sm ml-auto sm:ml-0">
              <Link to="/biblia/$book" params={{ book: nextBook.slug }}>
                <span>Próximo livro: {nextBook.name}</span>
                <ChevronRight className="ml-1 size-4" />
              </Link>
            </Button>
          ) : (
            <span className="hidden sm:inline-block" />
          )}
        </nav>
      </div>
    </SiteLayout>
  );
}
