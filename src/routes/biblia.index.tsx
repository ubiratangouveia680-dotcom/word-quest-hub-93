import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { AdBanner, AdDesktop } from "@/components/Ads";
import { NEW_TESTAMENT, OLD_TESTAMENT, type BibleBook } from "@/lib/bible-books";
import { url } from "@/lib/site";

export const Route = createFileRoute("/biblia/")({
  head: () => ({
    meta: [
      { title: "Bíblia Online completa — Antigo e Novo Testamento" },
      {
        name: "description",
        content:
          "Todos os 66 livros da Bíblia em português: Antigo e Novo Testamento. Escolha um livro e leia capítulos e versículos gratuitamente.",
      },
      { property: "og:title", content: "Bíblia Online completa — Antigo e Novo Testamento" },
      { property: "og:description", content: "Todos os 66 livros da Bíblia em português." },
      { property: "og:url", content: url("/biblia") },
    ],
    links: [{ rel: "canonical", href: url("/biblia") }],
  }),
  component: BibliaIndex,
});

function BookGrid({ books }: { books: BibleBook[] }) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
      {books.map((b) => (
        <Link
          key={b.slug}
          to="/biblia/$book"
          params={{ book: b.slug }}
          className="surface flex items-center justify-between px-3 py-2.5 text-sm transition-colors hover:bg-accent"
        >
          <span>{b.name}</span>
          <span className="text-xs text-muted-foreground">{b.chapters}</span>
        </Link>
      ))}
    </div>
  );
}

function BibliaIndex() {
  return (
    <SiteLayout>
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">Bíblia Online</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Leia a Bíblia Sagrada em português na tradução João Ferreira de Almeida
          (domínio público). Escolha um livro para ver seus capítulos.
        </p>

        <div className="mt-6">
          <AdBanner />
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_300px]">
          <div>
            <section>
              <h2 className="font-display text-2xl font-semibold">Antigo Testamento</h2>
              <BookGrid books={OLD_TESTAMENT} />
            </section>
            <section className="mt-10">
              <h2 className="font-display text-2xl font-semibold">Novo Testamento</h2>
              <BookGrid books={NEW_TESTAMENT} />
            </section>
          </div>
          <aside>
            <AdDesktop />
          </aside>
        </div>
      </div>
    </SiteLayout>
  );
}
