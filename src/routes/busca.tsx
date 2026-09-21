import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search, BookOpen, HeartHandshake, Sparkles, Tag, ArrowRight } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { AdSlotTop, AdSlotContent } from "@/components/Ads";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { searchQuery } from "@/lib/bible-queries";
import { BIBLE_BOOKS, getBookByName } from "@/lib/bible-books";
import { BIBLE_TOPICS } from "@/lib/topics";
import { DEVOTIONALS, PRAYERS, STUDIES } from "@/lib/content";
import { url } from "@/lib/site";

export const Route = createFileRoute("/busca")({
  validateSearch: (search: Record<string, unknown> = {}): { q?: string } => ({
    q: typeof search?.["q"] === "string" ? search["q"] : "",
  }),
  head: () => ({
    meta: [
      { title: "Buscar na Bíblia — versículos, temas, estudos e orações | Bíblia Online" },
      {
        name: "description",
        content:
          "Pesquise passagens bíblicas por referência ou palavra-chave, e descubra temas, estudos e orações no portal Bíblia Online.",
      },
      { property: "og:title", content: "Buscar na Bíblia — Bíblia Online" },
      { property: "og:description", content: "Pesquise versículos, temas, livros e conteúdos bíblicos." },
      { property: "og:url", content: url("/busca") },
      { name: "robots", content: "noindex,nofollow" },
    ],
    links: [{ rel: "canonical", href: url("/busca") }],
  }),
  component: SearchPage,
});

function normalize(s: string) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

const SEARCH_SUGGESTIONS = [
  "João 3:16",
  "Salmos 23",
  "Filipenses 4:13",
  "oração para dormir",
  "ansiedade",
  "amor",
  "fé",
  "paz",
  "perdão",
  "esperança",
];

function findBookSlug(rawBookName: string): string {
  const normalized = normalize(rawBookName.trim());
  const found = BIBLE_BOOKS.find((b) => normalize(b.name) === normalized || normalize(b.slug) === normalized);
  return found ? found.slug : rawBookName.toLowerCase().replace(/\s+/g, "-");
}

function SearchPage() {
  const search = Route.useSearch();
  const q = search?.q || "";
  const navigate = useNavigate();
  const [term, setTerm] = useState(q);
  const [activeTab, setActiveTab] = useState<"todos" | "biblia" | "versiculos" | "temas" | "oracoes" | "estudos" | "devocionais">("todos");
  const { data, isFetching } = useQuery(searchQuery(q));

  const nq = normalize(q.trim());
  const books = nq ? BIBLE_BOOKS.filter((b) => normalize(b.name).includes(nq)).slice(0, 12) : [];
  const exactBook = nq ? BIBLE_BOOKS.find((b) => normalize(b.name) === nq) : undefined;

  const topics = nq
    ? BIBLE_TOPICS.filter((t) => normalize(t.name + " " + t.description + " " + t.slug).includes(nq))
    : [];

  const studies = nq
    ? STUDIES.filter((s) => normalize(s.title + " " + s.excerpt + " " + s.category).includes(nq))
    : [];

  const devos = nq
    ? DEVOTIONALS.filter((d) => normalize(d.title + " " + d.reflection + " " + d.verseRef).includes(nq))
    : [];

  const prayers = nq
    ? PRAYERS.filter((p) => normalize(p.title + " " + p.text + " " + p.category + " " + p.intro).includes(nq))
    : [];

  const verses = data?.verses ?? [];

  const totalResults =
    (exactBook ? 1 : books.length) +
    verses.length +
    topics.length +
    prayers.length +
    studies.length +
    devos.length;

  const hasNoResults = q.trim().length > 0 && !isFetching && totalResults === 0;

  return (
    <SiteLayout>
      <div className="mx-auto w-full max-w-4xl px-4 py-8">
        <header>
          <h1 className="font-display text-3xl font-semibold sm:text-4xl">Buscar na Bíblia</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Encontre livros, versículos, temas da vida cristã, estudos bíblicos, devocionais e orações.
          </p>
        </header>

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
            placeholder="Ex.: João 3:16, Salmos 23, oração para dormir, ansiedade, amor..."
            className="h-12 bg-background shadow-xs"
            aria-label="Termo de busca"
          />
          <Button type="submit" className="h-12 px-6">
            <Search className="mr-1.5 size-4" /> Pesquisar
          </Button>
        </form>

        <div className="mt-6">
          <AdSlotTop />
        </div>

        {!q && (
          <div className="surface mt-8 rounded-xl p-6 text-center">
            <p className="font-medium text-foreground">O que você gostaria de encontrar hoje?</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Experimente pesquisar uma passagem direta, um tema ou um momento de oração:
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {SEARCH_SUGGESTIONS.map((item) => (
                <Link
                  key={item}
                  to="/busca"
                  search={{ q: item }}
                  className="rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-gold hover:text-foreground"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>
        )}

        {q && (
          <div className="mt-8 space-y-6">
            {/* Abas de filtro categorizadas */}
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
              {books.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab("biblia")}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    activeTab === "biblia"
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-background text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Bíblia ({books.length})
                </button>
              )}
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
              {topics.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab("temas")}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    activeTab === "temas"
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-background text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Temas ({topics.length})
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
            </div>

            {/* Estado sem resultados */}
            {hasNoResults && (
              <div className="surface rounded-2xl border border-border p-8 text-center">
                <p className="font-display text-xl font-semibold text-foreground">
                  Não encontramos resultados para sua busca.
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Tente pesquisar por outro termo.
                </p>
                <div className="mt-4 pt-4 border-t border-border/60">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gold mb-3">
                    Sugestões recomendadas:
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {SEARCH_SUGGESTIONS.map((item) => (
                      <Link
                        key={item}
                        to="/busca"
                        search={{ q: item }}
                        className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground hover:border-gold hover:text-foreground transition-colors"
                      >
                        {item}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Categoria: BÍBLIA (Livros) */}
            {(activeTab === "todos" || activeTab === "biblia") && books.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <span className="rounded-md bg-gold/10 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-gold">
                    BÍBLIA
                  </span>
                  <h2 className="font-display text-lg font-semibold">Livros Encontrados</h2>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {books.map((b) => (
                    <Link
                      key={b.slug}
                      to="/biblia/$book"
                      params={{ book: b.slug }}
                      className="surface group flex flex-col justify-between rounded-xl border border-border/70 p-4 hover:border-gold/50 transition-colors"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <h3 className="font-display font-medium text-base group-hover:text-gold transition-colors">
                            {b.name}
                          </h3>
                          <span className="text-xs text-muted-foreground">{b.chapters} capítulos</span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{b.description}</p>
                      </div>
                      <span className="mt-3 text-xs font-medium text-gold inline-flex items-center gap-1">
                        Ver capítulos &rarr;
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Categoria: VERSÍCULOS */}
            {(activeTab === "todos" || activeTab === "versiculos") && (
              <section>
                {(activeTab === "versiculos" || verses.length > 0) && (
                  <div className="flex items-center gap-2 mb-3">
                    <span className="rounded-md bg-gold/10 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-gold">
                      VERSÍCULOS
                    </span>
                    <h2 className="font-display text-lg font-semibold">Passagens Bíblicas</h2>
                  </div>
                )}
                {isFetching ? (
                  <Skeleton className="h-24 w-full" />
                ) : verses.length > 0 ? (
                  <div className="space-y-3">
                    {verses.slice(0, 25).map((v) => {
                      const bookSlug = findBookSlug(v.book);
                      const verseUrl = `/biblia/${bookSlug}/${v.chapter}/${v.verse}`;
                      return (
                        <div
                          key={`${v.book}-${v.chapter}-${v.verse}`}
                          className="surface rounded-xl border border-border/70 p-4 transition-colors hover:border-gold/40"
                        >
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <Link
                              to="/biblia/$book/$chapter/$verse"
                              params={{ book: bookSlug, chapter: String(v.chapter), verse: String(v.verse) }}
                              className="font-semibold text-gold text-sm hover:underline"
                            >
                              {v.book} {v.chapter}:{v.verse}
                            </Link>
                            <span className="text-[10px] uppercase tracking-wider rounded bg-accent px-1.5 py-0.5 text-muted-foreground">
                              Versículo
                            </span>
                          </div>
                          <p className="font-serif italic text-foreground text-sm leading-relaxed">
                            "{v.text}"
                          </p>
                          <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-border/40 text-xs">
                            <Link
                              to="/biblia/$book/$chapter"
                              params={{ book: bookSlug, chapter: String(v.chapter) }}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              Ver capítulo {v.chapter} completo
                            </Link>
                            <Link
                              to="/biblia/$book/$chapter/$verse"
                              params={{ book: bookSlug, chapter: String(v.chapter), verse: String(v.verse) }}
                              className="text-gold font-medium inline-flex items-center gap-1"
                            >
                              Página do versículo <ArrowRight className="size-3" />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : activeTab === "versiculos" ? (
                  <p className="text-sm text-muted-foreground">Nenhum versículo encontrado para este termo.</p>
                ) : null}
              </section>
            )}

            {/* Categoria: TEMAS */}
            {(activeTab === "todos" || activeTab === "temas") && topics.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <span className="rounded-md bg-gold/10 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-gold">
                    TEMAS
                  </span>
                  <h2 className="font-display text-lg font-semibold">Temas Bíblicos</h2>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {topics.map((t) => (
                    <Link
                      key={t.slug}
                      to="/versiculos/$slug"
                      params={{ slug: t.slug }}
                      className="surface group flex flex-col justify-between rounded-xl border border-border/70 p-4 hover:border-gold/50 transition-colors"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <h3 className="font-display font-medium text-base group-hover:text-gold transition-colors">
                            Versículos sobre {t.name}
                          </h3>
                          <Tag className="size-3.5 text-gold" />
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{t.description}</p>
                      </div>
                      <span className="mt-3 text-xs font-medium text-gold inline-flex items-center gap-1">
                        Ler versículos selecionados &rarr;
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            <div className="my-6">
              <AdSlotContent />
            </div>

            {/* Categoria: ORAÇÕES */}
            {(activeTab === "todos" || activeTab === "oracoes") && prayers.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <span className="rounded-md bg-gold/10 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-gold">
                    ORAÇÕES
                  </span>
                  <h2 className="font-display text-lg font-semibold">Orações com Base Bíblica</h2>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {prayers.map((p) => (
                    <Link
                      key={p.slug}
                      to="/oracoes/$slug"
                      params={{ slug: p.slug }}
                      className="surface group flex flex-col justify-between rounded-xl border border-border/70 p-4 hover:border-gold/50 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-gold mb-1">
                          <HeartHandshake className="size-3" /> {p.category}
                        </div>
                        <h3 className="font-display font-medium text-base group-hover:text-gold transition-colors">
                          {p.title}
                        </h3>
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{p.intro}</p>
                      </div>
                      <span className="mt-3 text-xs font-medium text-gold inline-flex items-center gap-1">
                        Ler oração completa &rarr;
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Categoria: ESTUDOS */}
            {(activeTab === "todos" || activeTab === "estudos") && studies.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <span className="rounded-md bg-gold/10 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-gold">
                    ESTUDOS
                  </span>
                  <h2 className="font-display text-lg font-semibold">Estudos Bíblicos</h2>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {studies.map((s) => (
                    <Link
                      key={s.slug}
                      to="/estudos/$slug"
                      params={{ slug: s.slug }}
                      className="surface group flex flex-col justify-between rounded-xl border border-border/70 p-4 hover:border-gold/50 transition-colors"
                    >
                      <div>
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-gold">{s.category}</span>
                        <h3 className="mt-1 font-display font-medium text-base group-hover:text-gold transition-colors">
                          {s.title}
                        </h3>
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{s.excerpt}</p>
                      </div>
                      <span className="mt-3 text-xs font-medium text-gold inline-flex items-center gap-1">
                        Ler estudo &rarr;
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Categoria: DEVOCIONAIS */}
            {(activeTab === "todos" || activeTab === "devocionais") && devos.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <span className="rounded-md bg-gold/10 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-gold">
                    DEVOCIONAIS
                  </span>
                  <h2 className="font-display text-lg font-semibold">Devocionais Diários</h2>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {devos.map((d) => (
                    <Link
                      key={d.slug}
                      to="/devocionais/$slug"
                      params={{ slug: d.slug }}
                      className="surface group flex flex-col justify-between rounded-xl border border-border/70 p-4 hover:border-gold/50 transition-colors"
                    >
                      <div>
                        <span className="text-[11px] font-semibold text-gold">{d.verseRef}</span>
                        <h3 className="mt-1 font-display font-medium text-base group-hover:text-gold transition-colors">
                          {d.title}
                        </h3>
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{d.reflection}</p>
                      </div>
                      <span className="mt-3 text-xs font-medium text-gold inline-flex items-center gap-1">
                        Ler reflexão &rarr;
                      </span>
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
