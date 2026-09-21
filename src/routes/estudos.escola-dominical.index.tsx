import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/SiteLayout";
import { AdBanner, AdDesktop } from "@/components/Ads";
import { fetchAllMaterials } from "@/lib/studies-service";
import { url } from "@/lib/site";
import {
  GraduationCap,
  Calendar,
  Layers,
  Users,
  Search,
  BookOpen,
  ArrowRight,
  Filter,
  CheckCircle2,
  Sparkles,
  Baby,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/estudos/escola-dominical/")({
  head: () => ({
    meta: [
      { title: "Escola Dominical (EBD) — Lições Bíblicas, Séries e Subsídios | Bíblia Online" },
      {
        name: "description",
        content:
          "Lições completas de Escola Bíblica Dominical (EBD) organizadas por classe, idade e série. Subsídios pedagógicos com objetivos, tópicos, perguntas e aplicação prática.",
      },
      { property: "og:title", content: "Escola Dominical (EBD) — Bíblia Online" },
      {
        property: "og:description",
        content: "Subsídios e lições bíblicas completas para professores e alunos de Escola Dominical.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: url("/estudos/escola-dominical") },
    ],
    links: [{ rel: "canonical", href: url("/estudos/escola-dominical") }],
  }),
  component: SundaySchoolIndexPage,
});

function SundaySchoolIndexPage() {
  const [selectedAudience, setSelectedAudience] = useState<string>("todos");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: allMaterials = [], isLoading } = useQuery({
    queryKey: ["bible-materials-all"],
    queryFn: () => fetchAllMaterials(false),
  });

  // Filtra apenas lições de EBD
  const ebdLessons = useMemo(() => {
    return allMaterials.filter((m) => m.type === "escola-dominical");
  }, [allMaterials]);

  // Aplica filtros de classe/idade e busca
  const filteredLessons = useMemo(() => {
    return ebdLessons.filter((item) => {
      if (selectedAudience !== "todos" && item.audience !== selectedAudience) {
        return false;
      }
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchSeries = item.series?.toLowerCase().includes(q) || false;
        const matchBook = item.bibleBook?.toLowerCase().includes(q) || false;
        const matchExcerpt = item.excerpt.toLowerCase().includes(q);
        if (!matchTitle && !matchSeries && !matchBook && !matchExcerpt) {
          return false;
        }
      }
      return true;
    });
  }, [ebdLessons, selectedAudience, searchQuery]);

  // Agrupamento por série
  const seriesGroups = useMemo(() => {
    const map = new Map<string, typeof filteredLessons>();
    filteredLessons.forEach((l) => {
      const s = l.series || "Lições Gerais";
      if (!map.has(s)) {
        map.set(s, []);
      }
      map.get(s)!.push(l);
    });
    // Ordena as lições pelo número da lição dentro de cada série
    map.forEach((list) => {
      list.sort((a, b) => (a.lessonNumber || 0) - (b.lessonNumber || 0));
    });
    return Array.from(map.entries());
  }, [filteredLessons]);

  return (
    <SiteLayout>
      {/* CABEÇALHO HERO */}
      <section className="border-b border-border/80 bg-gradient-to-b from-amber-500/10 via-card to-background px-4 py-10 sm:py-14">
        <div className="mx-auto max-w-6xl">
          <nav className="text-xs text-muted-foreground">
            <Link to="/estudos" className="hover:text-foreground">
              Estudos
            </Link>
            <span className="mx-1.5">/</span>
            <span className="text-foreground font-medium">Escola Dominical</span>
          </nav>

          <div className="mt-4 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
              <GraduationCap className="size-3.5" />
              Ensino Bíblico Didático e Metodológico
            </span>
            <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
              Escola Bíblica Dominical (EBD)
            </h1>
            <p className="mt-3 text-base text-muted-foreground sm:text-lg leading-relaxed">
              Materiais completos e originais para professores e alunos. Lições organizadas por classe,
              idade e trimestre, com objetivos claros, roteiro de desenvolvimento, perguntas e aplicação prática.
            </p>
          </div>

          {/* BUSCA DA EBD */}
          <div className="mt-6 max-w-xl">
            <div className="relative flex items-center">
              <Search className="pointer-events-none absolute left-3.5 size-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar lição por tema, título ou livro bíblico..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 rounded-xl pl-10 text-sm shadow-sm"
              />
            </div>
          </div>

          {/* FILTRO POR CLASSE / FAIXA ETÁRIA */}
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground mr-1">Filtrar por classe:</span>
            {[
              { id: "todos", label: "Todas as Classes" },
              { id: "adultos", label: "Adultos" },
              { id: "jovens", label: "Jovens" },
              { id: "infantil", label: "Crianças / Infantil" },
              { id: "familia", label: "Casais / Família" },
            ].map((cls) => {
              const active = selectedAudience === cls.id;
              return (
                <button
                  key={cls.id}
                  onClick={() => setSelectedAudience(cls.id)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    active
                      ? "bg-amber-500 text-white font-semibold shadow-sm"
                      : "border border-border bg-card text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cls.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[1fr_300px]">
        <div>
          <AdBanner className="mb-6" />

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 animate-pulse rounded-xl bg-card border border-border" />
              ))}
            </div>
          ) : filteredLessons.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center">
              <GraduationCap className="mx-auto size-10 text-muted-foreground/60" />
              <h2 className="mt-3 font-display text-base font-semibold">
                Nenhuma lição encontrada para os filtros selecionados
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Tente selecionar outra classe ou limpar a pesquisa.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedAudience("todos");
                  setSearchQuery("");
                }}
                className="mt-4"
              >
                Limpar filtros
              </Button>
            </div>
          ) : (
            <div className="space-y-8">
              {seriesGroups.map(([seriesTitle, lessons]) => (
                <section key={seriesTitle} className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-border/80 pb-2">
                    <Layers className="size-5 text-amber-500" />
                    <h2 className="font-display text-xl font-bold text-foreground">
                      {seriesTitle}
                    </h2>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {lessons.length} lição(ões)
                    </span>
                  </div>

                  <div className="grid gap-4">
                    {lessons.map((lesson) => (
                      <Link
                        key={lesson.id}
                        to="/estudos/escola-dominical/$slug"
                        params={{ slug: lesson.slug }}
                        className="group flex flex-col justify-between rounded-xl border border-border bg-card p-5 transition-all hover:border-amber-500/50 hover:shadow-md"
                      >
                        <div>
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            {lesson.lessonNumber && (
                              <span className="rounded-md bg-amber-500/10 px-2 py-0.5 font-bold text-amber-600 dark:text-amber-400">
                                Lição {lesson.lessonNumber}
                              </span>
                            )}
                            <span className="rounded-md border border-border px-2 py-0.5 font-medium text-muted-foreground capitalize">
                              Classe: {lesson.audience}
                            </span>
                            {lesson.bibleBook && (
                              <span className="text-muted-foreground">
                                Livro: {lesson.bibleBook}
                              </span>
                            )}
                          </div>

                          <h3 className="mt-2.5 font-display text-lg font-bold text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                            {lesson.title}
                          </h3>

                          <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                            {lesson.excerpt}
                          </p>

                          {lesson.mainVerseRef && (
                            <div className="mt-3 rounded-lg bg-muted/40 p-2.5 text-xs text-muted-foreground">
                              <span className="font-semibold text-foreground">Texto Principal: </span>
                              <span className="italic">{lesson.mainVerseRef}</span>
                              {lesson.mainVerse && (
                                <p className="mt-1 text-xs italic text-foreground/80 line-clamp-1">
                                  "{lesson.mainVerse}"
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
                          <span>{lesson.topics.length} tópicos desenvolvidos</span>
                          <span className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400 group-hover:translate-x-0.5 transition-transform">
                            Abrir lição completa <ArrowRight className="size-3.5" />
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}

          <AdBanner className="mt-8" />
        </div>

        {/* SIDEBAR COM INFORMAÇÕES PEDAGÓGICAS */}
        <aside className="space-y-6">
          <AdDesktop />

          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-display font-semibold text-foreground text-sm flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-500" />
              Estrutura Padrão de Cada Lição
            </h3>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              Todas as lições da nossa Escola Dominical são elaboradas seguindo uma metodologia didática comprovada:
            </p>
            <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
              <li className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-amber-500" />
                Texto bíblico e leitura diária
              </li>
              <li className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-amber-500" />
                Objetivos de aprendizagem claros
              </li>
              <li className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-amber-500" />
                Tópicos exegéticos aprofundados
              </li>
              <li className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-amber-500" />
                Perguntas de debate para a classe
              </li>
              <li className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-amber-500" />
                Aplicação prática para o cotidiano
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </SiteLayout>
  );
}
