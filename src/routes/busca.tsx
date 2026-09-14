import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { AdBanner } from "@/components/Ads";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { searchQuery } from "@/lib/bible-queries";
import { BIBLE_BOOKS } from "@/lib/bible-books";
import { DEVOTIONALS, PRAYERS, STUDIES } from "@/lib/content";
import { url } from "@/lib/site";

export const Route = createFileRoute("/busca")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search["q"] === "string" ? search["q"] : "",
  }),
  head: () => ({
    meta: [
      { title: "Buscar na Bíblia — versículos, livros e conteúdos | Bíblia Online" },
      {
        name: "description",
        content:
          "Pesquise versículos por referência ou palavra, e encontre estudos, devocionais e orações no portal Bíblia Online.",
      },
      { property: "og:title", content: "Buscar na Bíblia — Bíblia Online" },
      { property: "og:description", content: "Pesquise versículos, livros e conteúdos bíblicos." },
      { property: "og:url", content: url("/busca") },
      { name: "robots", content: "noindex,follow" },
    ],
    links: [{ rel: "canonical", href: url("/busca") }],
  }),
  component: SearchPage,
});

function normalize(s: string) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function SearchPage() {
  const { q } = Route.useSearch();
  const navigate = useNavigate();
  const [term, setTerm] = useState(q);
  const { data, isFetching } = useQuery(searchQuery(q));

  const nq = normalize(q.trim());
  const books = nq ? BIBLE_BOOKS.filter((b) => normalize(b.name).includes(nq)).slice(0, 8) : [];
  const exactBook = nq ? BIBLE_BOOKS.find((b) => normalize(b.name) === nq) : undefined;
  const studies = nq
    ? STUDIES.filter((s) => normalize(s.title + s.excerpt + s.category).includes(nq))
    : [];
  const devos = nq ? DEVOTIONALS.filter((d) => normalize(d.title + d.reflection).includes(nq)) : [];
  const prayers = nq ? PRAYERS.filter((p) => normalize(p.title + p.text).includes(nq)) : [];

  return (
    <SiteLayout>
      <div className="mx-auto w-full max-w-4xl px-4 py-8">
        <h1 className="font-display text-3xl font-semibold">Buscar</h1>
        <form
          className="mt-4 flex flex-col gap-2 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            navigate({ to: "/busca", search: { q: term } });
          }}
        >
          <Input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Ex.: João 3:16, Salmos 23, amor, esperança..."
            className="h-12"
            aria-label="Termo de busca"
          />
          <Button type="submit" className="h-12">
            <Search className="mr-1 size-4" /> Pesquisar
          </Button>
        </form>

        <AdBanner className="mt-6" />

        {!q && (
          <p className="mt-8 text-muted-foreground">
            Digite uma referência (ex.: <em>João 3:16</em>) ou uma palavra para começar.
          </p>
        )}

        {q && (
          <div className="mt-8 space-y-8">
            {!exactBook && (
              <section>
                <h2 className="font-display text-xl font-semibold">Versículos</h2>
                {isFetching ? (
                  <Skeleton className="mt-3 h-24 w-full" />
                ) : data && data.verses.length > 0 ? (
                  <div className="mt-3 space-y-2">
                    {data.verses.slice(0, 30).map((v) => (
                      <p key={`${v.book}-${v.chapter}-${v.verse}`} className="surface p-3 reading-text">
                        <span className="mr-2 text-sm font-semibold text-gold">
                          {v.book} {v.chapter}:{v.verse}
                        </span>
                        {v.text}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-muted-foreground">
                    Nenhum versículo encontrado por referência. Tente algo como “João 3:16” ou
                    “Salmos 23”.
                  </p>
                )}
              </section>
            )}

            {exactBook && (
              <section>
                <h2 className="font-display text-xl font-semibold">{exactBook.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">Escolha um capítulo</p>
                <div className="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-8 md:grid-cols-10">
                  {Array.from({ length: exactBook.chapters }, (_, index) => index + 1).map(
                    (chapter) => (
                      <Link
                        key={chapter}
                        to="/biblia/$book/$chapter"
                        params={{ book: exactBook.slug, chapter: String(chapter) }}
                        className="surface flex h-11 items-center justify-center text-sm transition-colors hover:bg-accent"
                      >
                        {chapter}
                      </Link>
                    ),
                  )}
                </div>
              </section>
            )}

            {!exactBook && books.length > 0 && (
              <section>
                <h2 className="font-display text-xl font-semibold">Livros</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {books.map((b) => (
                    <Link
                      key={b.slug}
                      to="/biblia/$book"
                      params={{ book: b.slug }}
                      className="surface px-3 py-2 text-sm hover:bg-accent"
                    >
                      {b.name}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {studies.length > 0 && (
              <section>
                <h2 className="font-display text-xl font-semibold">Estudos</h2>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {studies.map((s) => (
                    <Link
                      key={s.slug}
                      to="/estudos/$slug"
                      params={{ slug: s.slug }}
                      className="surface p-3 text-sm hover:bg-accent/40"
                    >
                      {s.title}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {devos.length > 0 && (
              <section>
                <h2 className="font-display text-xl font-semibold">Devocionais</h2>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {devos.map((d) => (
                    <Link
                      key={d.slug}
                      to="/devocionais/$slug"
                      params={{ slug: d.slug }}
                      className="surface p-3 text-sm hover:bg-accent/40"
                    >
                      {d.title}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {prayers.length > 0 && (
              <section>
                <h2 className="font-display text-xl font-semibold">Orações</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {prayers.map((p) => (
                    <Link key={p.slug} to="/oracoes" hash={p.slug} className="surface px-3 py-2 text-sm hover:bg-accent">
                      {p.title}
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
