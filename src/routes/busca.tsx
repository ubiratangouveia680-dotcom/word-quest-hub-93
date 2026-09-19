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
  const [activeTab, setActiveTab] = useState<"todos" | "versiculos" | "livros" | "estudos" | "devocionais" | "oracoes">("todos");
  const { data, isFetching } = useQuery(searchQuery(q));

  const nq = normalize(q.trim());
  const books = nq ? BIBLE_BOOKS.filter((b) => normalize(b.name).includes(nq)).slice(0, 12) : [];
  const exactBook = nq ? BIBLE_BOOKS.find((b) => normalize(b.name) === nq) : undefined;
  const studies = nq
    ? STUDIES.filter((s) => normalize(s.title + s.excerpt + s.category).includes(nq))
    : [];
  const devos = nq ? DEVOTIONALS.filter((d) => normalize(d.title + d.reflection).includes(nq)) : [];
  const prayers = nq ? PRAYERS.filter((p) => normalize(p.title + p.text + p.category).includes(nq)) : [];
  const verses = data?.verses ?? [];

  const totalResults = (exactBook ? 1 : books.length) + studies.length + devos.length + prayers.length + verses.length;
  const hasNoResults = q.trim().length > 0 && !isFetching && totalResults === 0;

  return (
    <SiteLayout>
      <div className="mx-auto w-full max-w-4xl px-4 py-8">
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">Buscar na Bíblia</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Encontre versículos por referência, livros, capítulos, estudos temáticos, devocionais e orações.
        </p>

        <form
          className="mt-6 flex flex-col gap-2 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            navigate({ to: "/busca", search: { q: term } });
          }}
        >
          <Input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Ex.: João 3:16, Salmos 23, perdão, esperança..."
            className="h-12 bg-background"
            aria-label="Termo de busca"
          />
          <Button type="submit" className="h-12 px-6">
            <Search className="mr-1.5 size-4" /> Pesquisar
          </Button>
        </form>

        <AdBanner className="mt-6" />

        {!q && (
          <div className="surface mt-8 rounded-xl p-6 text-center">
            <p className="font-medium text-foreground">O que você gostaria de encontrar hoje?</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Experimente pesquisar uma referência direta ou um tema de interesse:
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {["João 3:16", "Salmos 23", "Filipenses 4:13", "amor", "paz", "ansiedade", "perdão", "família"].map((item) => (
                <Link
                  key={item}
                  to="/busca"
                  search={{ q: item }}
                  className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-gold hover:text-foreground"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>
        )}

        {q && (
          <div className="mt-8 space-y-6">
            {/* Abas de filtro por tipo de conteúdo */}
            <div className="flex flex-wrap gap-2 border-b border-border pb-3">
              <button
                type="button"
                onClick={() => setActiveTab("todos")}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  activeTab === "todos"
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                Todos ({totalResults})
              </button>
              {verses.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab("versiculos")}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    activeTab === "versiculos"
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-background text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Versículos ({verses.length})
                </button>
              )}
              {books.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab("livros")}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    activeTab === "livros"
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-background text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Livros ({books.length})
                </button>
              )}
              {studies.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab("estudos")}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    activeTab === "estudos"
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-background text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Estudos ({studies.length})
                </button>
              )}
              {devos.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab("devocionais")}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    activeTab === "devocionais"
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-background text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Devocionais ({devos.length})
                </button>
              )}
              {prayers.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab("oracoes")}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    activeTab === "oracoes"
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-background text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Orações ({prayers.length})
                </button>
              )}
            </div>

            {/* Mensagem amigável de nenhum resultado */}
            {hasNoResults && (
              <div className="surface rounded-xl p-8 text-center">
                <p className="font-display text-lg font-semibold text-foreground">Nenhum resultado encontrado para “{q}”</p>
                <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                  Tente verificar a ortografia, buscar por termos bíblicos mais amplos (como fé, esperança, oração) ou consulte diretamente os livros da Bíblia.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link to="/biblia">Ver todos os 66 livros da Bíblia</Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/estudos">Explorar Estudos Bíblicos</Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/oracoes">Ver Orações</Link>
                  </Button>
                </div>
              </div>
            )}

            {/* Seção de Versículos */}
            {(activeTab === "todos" || activeTab === "versiculos") && !exactBook && (
              <section>
                <h2 className="font-display text-xl font-semibold">Versículos Bíblicos</h2>
                {isFetching ? (
                  <Skeleton className="mt-3 h-24 w-full" />
                ) : verses.length > 0 ? (
                  <div className="mt-3 space-y-2">
                    {verses.slice(0, 30).map((v) => (
                      <div key={`${v.book}-${v.chapter}-${v.verse}`} className="surface rounded-lg p-3.5 reading-text">
                        <span className="mr-2 font-semibold text-gold">
                          {v.book} {v.chapter}:{v.verse}
                        </span>
                        {v.text}
                      </div>
                    ))}
                  </div>
                ) : activeTab === "versiculos" ? (
                  <p className="mt-3 text-sm text-muted-foreground">
                    Nenhum versículo específico encontrado para esta referência.
                  </p>
                ) : null}
              </section>
            )}

            {/* Seção de Livro Exato e Capítulos */}
            {(activeTab === "todos" || activeTab === "livros") && exactBook && (
              <section className="surface rounded-xl p-6">
                <h2 className="font-display text-2xl font-semibold">{exactBook.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">Escolha um capítulo para iniciar a leitura:</p>
                <div className="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-8 md:grid-cols-10">
                  {Array.from({ length: exactBook.chapters }, (_, index) => index + 1).map((chapter) => (
                    <Link
                      key={chapter}
                      to="/biblia/$book/$chapter"
                      params={{ book: exactBook.slug, chapter: String(chapter) }}
                      className="surface flex h-11 items-center justify-center text-sm font-medium transition-colors hover:bg-accent"
                    >
                      {chapter}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Seção de Livros relacionados */}
            {(activeTab === "todos" || activeTab === "livros") && !exactBook && books.length > 0 && (
              <section>
                <h2 className="font-display text-xl font-semibold">Livros da Bíblia</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {books.map((b) => (
                    <Link
                      key={b.slug}
                      to="/biblia/$book"
                      params={{ book: b.slug }}
                      className="surface rounded-lg px-3.5 py-2 text-sm font-medium hover:bg-accent transition-colors"
                    >
                      {b.name} ({b.chapters} cap.)
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Seção de Estudos */}
            {(activeTab === "todos" || activeTab === "estudos") && studies.length > 0 && (
              <section>
                <h2 className="font-display text-xl font-semibold">Estudos Bíblicos</h2>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {studies.map((s) => (
                    <Link
                      key={s.slug}
                      to="/estudos/$slug"
                      params={{ slug: s.slug }}
                      className="surface rounded-lg p-4 transition-all hover:bg-accent/40 hover:border-gold/40"
                    >
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-gold">{s.category}</span>
                      <h3 className="mt-1 font-display text-base font-semibold">{s.title}</h3>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{s.excerpt}</p>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Seção de Devocionais */}
            {(activeTab === "todos" || activeTab === "devocionais") && devos.length > 0 && (
              <section>
                <h2 className="font-display text-xl font-semibold">Devocionais</h2>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {devos.map((d) => (
                    <Link
                      key={d.slug}
                      to="/devocionais/$slug"
                      params={{ slug: d.slug }}
                      className="surface rounded-lg p-4 transition-all hover:bg-accent/40 hover:border-gold/40"
                    >
                      <span className="text-[11px] font-semibold text-gold">{d.verseRef}</span>
                      <h3 className="mt-1 font-display text-base font-semibold">{d.title}</h3>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{d.reflection}</p>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Seção de Orações */}
            {(activeTab === "todos" || activeTab === "oracoes") && prayers.length > 0 && (
              <section>
                <h2 className="font-display text-xl font-semibold">Orações</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {prayers.map((p) => (
                    <Link
                      key={p.slug}
                      to="/oracoes"
                      hash={p.slug}
                      className="surface rounded-lg px-3.5 py-2 text-sm hover:border-gold/40 transition-colors"
                    >
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

