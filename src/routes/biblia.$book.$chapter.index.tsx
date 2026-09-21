import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Suspense } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { AdDesktop } from "@/components/Ads";
import { ChapterReader } from "@/components/ChapterReader";
import { Skeleton } from "@/components/ui/skeleton";
import { getBookBySlug } from "@/lib/bible-books";
import { chapterQuery } from "@/lib/bible-queries";
import { url } from "@/lib/site";

export const Route = createFileRoute("/biblia/$book/$chapter/")({
  loader: async ({ params, context }) => {
    const book = getBookBySlug(params.book);
    const chapter = Number(params.chapter);
    if (!book || !Number.isInteger(chapter) || chapter < 1 || chapter > book.chapters) {
      throw notFound();
    }
    await context.queryClient.ensureQueryData(chapterQuery(book.id, chapter));
    return { book, chapter };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Capítulo não encontrado" }, { name: "robots", content: "noindex" }] };
    }
    const { book, chapter } = loaderData;
    const title = `${book.name} ${chapter} — Bíblia Online`;
    const description = `Leia ${book.name} capítulo ${chapter} completo, versículo por versículo, em português.`;
    const path = `/biblia/${params.book}/${params.chapter}`;
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
                name: "Bíblia",
                item: url("/biblia"),
              },
              {
                "@type": "ListItem",
                position: 3,
                name: book.name,
                item: url(`/biblia/${book.slug}`),
              },
              {
                "@type": "ListItem",
                position: 4,
                name: `Capítulo ${chapter}`,
                item: url(path),
              },
            ],
          }),
        },
      ],
    };
  },
  component: ChapterPage,
});

function ChapterPage() {
  const { book, chapter } = Route.useLoaderData();

  return (
    <SiteLayout>
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[1fr_300px]">
        <div>
          <nav className="mb-3 text-sm text-muted-foreground">
            <Link to="/biblia" className="hover:text-foreground">Bíblia</Link>
            <span className="mx-1">/</span>
            <Link to="/biblia/$book" params={{ book: book.slug }} className="hover:text-foreground">
              {book.name}
            </Link>
            <span className="mx-1">/</span>
            <span className="text-foreground">{chapter}</span>
          </nav>
          <Suspense fallback={<Skeleton className="h-96 w-full" />}>
            <ChapterReader book={book} chapter={chapter} />
          </Suspense>
        </div>
        <aside>
          <AdDesktop />
        </aside>
      </div>
    </SiteLayout>
  );
}
