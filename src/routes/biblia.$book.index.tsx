import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { AdBanner } from "@/components/Ads";
import { getBookBySlug } from "@/lib/bible-books";
import { url } from "@/lib/site";

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
    const title = `${book.name} — Bíblia Online | Todos os capítulos`;
    const description = `${book.description} Leia ${book.name} online, capítulo por capítulo, em português.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url(`/biblia/${params.book}`) },
      ],
      links: [{ rel: "canonical", href: url(`/biblia/${params.book}`) }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Bíblia", item: url("/biblia") },
              { "@type": "ListItem", position: 2, name: book.name, item: url(`/biblia/${params.book}`) },
            ],
          }),
        },
      ],
    };
  },
  component: BookPage,
});

function BookPage() {
  const { book } = Route.useLoaderData();

  return (
    <SiteLayout>
      <div className="mx-auto w-full max-w-4xl px-4 py-8">
        <nav className="text-sm text-muted-foreground">
          <Link to="/biblia" className="hover:text-foreground">Bíblia</Link>
          <span className="mx-1">/</span>
          <span className="text-foreground">{book.name}</span>
        </nav>

        <h1 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">{book.name}</h1>
        <p className="mt-2 text-muted-foreground">{book.description}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {book.testament === "AT" ? "Antigo Testamento" : "Novo Testamento"} · {book.chapters}{" "}
          capítulos
        </p>

        <div className="mt-6">
          <AdBanner />
        </div>

        <h2 className="mt-8 font-display text-xl font-semibold">Capítulos</h2>
        <div className="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-8 md:grid-cols-10">
          {Array.from({ length: book.chapters }, (_, i) => i + 1).map((c) => (
            <Link
              key={c}
              to="/biblia/$book/$chapter"
              params={{ book: book.slug, chapter: String(c) }}
              className="surface flex h-11 items-center justify-center text-sm transition-colors hover:bg-accent"
            >
              {c}
            </Link>
          ))}
        </div>
      </div>
    </SiteLayout>
  );
}
