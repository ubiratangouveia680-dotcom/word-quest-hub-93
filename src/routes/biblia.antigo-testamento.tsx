import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { AdBanner, AdDesktop } from "@/components/Ads";
import { OLD_TESTAMENT } from "@/lib/bible-books";
import { url } from "@/lib/site";
import { BookOpen, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/biblia/antigo-testamento")({
  head: () => {
    const title = "Antigo Testamento — Bíblia Online";
    const description =
      "Leia todos os 39 livros do Antigo Testamento completo na Bíblia Online. Acesse capítulos, pesquise versículos e navegue gratuitamente pela Bíblia Sagrada.";
    const canonical = url("/biblia/antigo-testamento");

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: canonical },
        { property: "og:image", content: url("/icon-512.png") },
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
              { "@type": "ListItem", position: 3, name: "Antigo Testamento", item: canonical },
            ],
          }),
        },
      ],
    };
  },
  component: AntigoTestamentoPage,
});

function AntigoTestamentoPage() {
  return (
    <SiteLayout>
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        <nav aria-label="Navegação estrutural" className="text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Início</Link>
          <span className="mx-1">/</span>
          <Link to="/biblia" className="hover:text-foreground">Bíblia</Link>
          <span className="mx-1">/</span>
          <span className="text-foreground">Antigo Testamento</span>
        </nav>

        <header className="mt-4">
          <h1 className="font-display text-3xl font-semibold sm:text-4xl">
            Antigo Testamento
          </h1>
          <p className="mt-3 max-w-3xl text-muted-foreground leading-relaxed">
            O Antigo Testamento é composto por 39 livros sagrados que narram a criação do mundo, a formação
            do povo de Israel, a aliança de Deus no Sinai, os cânticos de louvor, a sabedoria prática e as
            profecias que anunciam a vinda do Redentor.
          </p>
        </header>

        <div className="mt-6">
          <AdBanner />
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_300px]">
          <div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {OLD_TESTAMENT.map((book) => (
                <Link
                  key={book.slug}
                  to="/biblia/$book"
                  params={{ book: book.slug }}
                  className="surface group flex flex-col justify-between p-4 transition-all hover:border-gold/50 hover:shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <h2 className="font-display font-medium text-lg text-foreground group-hover:text-gold transition-colors">
                        {book.name}
                      </h2>
                      <span className="rounded-full bg-accent px-2 py-0.5 text-xs text-muted-foreground">
                        {book.chapters} cap.
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                      {book.description}
                    </p>
                  </div>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-gold">
                    Ler livro <ArrowRight className="size-3" />
                  </span>
                </Link>
              ))}
            </div>

            <section className="mt-12 rounded-xl border border-border/60 bg-muted/20 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="font-display text-xl font-semibold">Continuar para o Novo Testamento</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Conheça a vida e os ensinamentos de Jesus Cristo, as cartas apostólicas e o Apocalipse.
                  </p>
                </div>
                <Link
                  to="/biblia/novo-testamento"
                  className="inline-flex items-center justify-center rounded-lg bg-gold px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow transition hover:opacity-90 whitespace-nowrap"
                >
                  <BookOpen className="mr-2 size-4" /> Ver Novo Testamento
                </Link>
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
