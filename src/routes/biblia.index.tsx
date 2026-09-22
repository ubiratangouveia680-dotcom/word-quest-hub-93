import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { AdBanner, AdDesktop } from "@/components/Ads";
import { NEW_TESTAMENT, OLD_TESTAMENT, type BibleBook } from "@/lib/bible-books";
import { url } from "@/lib/site";

export const Route = createFileRoute("/biblia/")({
  head: () => ({
    meta: [
      { title: "Bíblia Online Oficial — Antigo e Novo Testamento Completo" },
      {
        name: "description",
        content:
          "Leia todos os 66 livros da Bíblia Sagrada na Bíblia Online Oficial. Navegue pelos livros do Antigo e Novo Testamento, consulte capítulos e versículos gratuitamente.",
      },
      { property: "og:title", content: "Bíblia Online Oficial — Antigo e Novo Testamento Completo" },
      {
        property: "og:description",
        content:
          "Leia todos os 66 livros da Bíblia Sagrada na Bíblia Online Oficial. Navegue pelos livros do Antigo e Novo Testamento gratuitamente.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: url("/biblia") },
      { property: "og:image", content: url("/icon-512.png") },
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
          className="surface flex items-center justify-between px-2.5 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm transition-colors hover:bg-accent rounded-xl min-h-[44px] touch-manipulation"
        >
          <span className="truncate mr-1 font-medium">{b.name}</span>
          <span className="text-[11px] sm:text-xs text-muted-foreground shrink-0">{b.chapters}</span>
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
        <p className="mt-2 max-w-2xl text-muted-foreground leading-relaxed">
          Leia a Bíblia Sagrada em português na edição Almeida (disponibilizada via bible-api.com). Escolha um livro para ver seus capítulos ou explore por testamento.
        </p>

        <div className="mt-6">
          <AdBanner />
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_300px]">
          <div>
            <section>
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl font-semibold">Antigo Testamento</h2>
                <Link to="/biblia/antigo-testamento" className="text-xs font-medium text-gold hover:underline">
                  Ver página detalhada &rarr;
                </Link>
              </div>
              <BookGrid books={OLD_TESTAMENT} />
            </section>
            <section className="mt-10">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl font-semibold">Novo Testamento</h2>
                <Link to="/biblia/novo-testamento" className="text-xs font-medium text-gold hover:underline">
                  Ver página detalhada &rarr;
                </Link>
              </div>
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
