import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/SiteLayout";
import { AdBanner, AdDesktop } from "@/components/Ads";
import { fetchAllMaterials, filterMaterials } from "@/lib/studies-service";
import { STUDY_THEMES } from "@/lib/studies-seed";
import { MaterialAudience, MaterialLevel, MaterialType } from "@/lib/studies-types";
import { url } from "@/lib/site";
import {
  Search,
  BookOpen,
  GraduationCap,
  FileText,
  Users,
  Heart,
  Baby,
  Flame,
  Sparkles,
  Compass,
  ArrowRight,
  Filter,
  CheckCircle2,
  BookMarked,
  Layers,
  Clock,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/estudos/")({
  head: () => ({
    meta: [
      { title: "Estudos Bíblicos, Escola Dominical e Apostilas | Bíblia Online" },
      {
        name: "description",
        content:
          "Portal completo de estudos bíblicos profundos, lições de Escola Dominical (EBD), apostilas para impressão, cursos bíblicos, devocionais e estudos por temas e livros.",
      },
      { property: "og:title", content: "Estudos Bíblicos & Materiais de Estudo — Bíblia Online" },
      {
        property: "og:description",
        content:
          "Estudos bíblicos aprofundados, lições de Escola Dominical organizadas por classe e apostilas completas para leitura e impressão.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: url("/estudos") },
    ],
    links: [{ rel: "canonical", href: url("/estudos") }],
  }),
  component: StudiesIndexPage,
});

function StudiesIndexPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<MaterialType | "todos">("todos");
  const [selectedCategory, setSelectedCategory] = useState<string>("todos");
  const [selectedAudience, setSelectedAudience] = useState<MaterialAudience | "todos">("todos");
  const [selectedLevel, setSelectedLevel] = useState<MaterialLevel | "todos">("todos");

  // Consulta todos os materiais com cache
  const { data: materials = [], isLoading } = useQuery({
    queryKey: ["bible-materials-all"],
    queryFn: () => fetchAllMaterials(false),
  });

  // Filtra de forma reativa e instantânea
  const filtered = useMemo(() => {
    return filterMaterials(materials, {
      type: selectedType,
      category: selectedCategory,
      audience: selectedAudience,
      level: selectedLevel,
      searchQuery,
    });
  }, [materials, selectedType, selectedCategory, selectedAudience, selectedLevel, searchQuery]);

  const hasActiveFilters =
    searchQuery !== "" ||
    selectedType !== "todos" ||
    selectedCategory !== "todos" ||
    selectedAudience !== "todos" ||
    selectedLevel !== "todos";

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedType("todos");
    setSelectedCategory("todos");
    setSelectedAudience("todos");
    setSelectedLevel("todos");
  };

  // Contadores rápidos por tipo
  const counts = useMemo(() => {
    return {
      estudos: materials.filter((m) => m.type === "estudo").length,
      ebd: materials.filter((m) => m.type === "escola-dominical").length,
      apostilas: materials.filter((m) => m.type === "apostila").length,
      cursos: materials.filter((m) => m.type === "curso").length,
    };
  }, [materials]);

  // Função auxiliar para gerar o link correto
  const getItemHref = (item: (typeof materials)[0]) => {
    if (item.type === "escola-dominical") {
      return `/estudos/escola-dominical/${item.slug}`;
    }
    if (item.type === "apostila") {
      return `/estudos/apostilas/${item.slug}`;
    }
    return `/estudos/${item.slug}`;
  };

  return (
    <SiteLayout>
      {/* HERO SECTION */}
      <section className="border-b border-border/80 bg-gradient-to-b from-card to-background px-4 py-10 sm:py-14">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="size-3.5" />
              Central de Ensino e Formação Bíblica
            </span>
            <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
              Estudos Bíblicos, Escola Dominical & Apostilas
            </h1>
            <p className="mt-4 text-base text-muted-foreground sm:text-lg leading-relaxed">
              Mergulhe nas Escrituras com conteúdos completos, lições didáticas para classes de EBD,
              apostilas prontas para impressão e reflexões teológicas 100% fundamentadas na Palavra de Deus.
            </p>
          </div>

          {/* BUSCA GLOBAL INTERATIVA */}
          <div className="mt-8 max-w-2xl">
            <div className="relative flex items-center">
              <Search className="pointer-events-none absolute left-3.5 size-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Pesquisar por título, livro, tema ou palavra-chave..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 w-full rounded-xl pl-11 pr-10 text-base shadow-sm focus-visible:ring-primary"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 p-1 text-muted-foreground hover:text-foreground"
                  aria-label="Limpar pesquisa"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          </div>

          {/* 4 MÓDULOS PRINCIPAIS DE ACESSO RÁPIDO */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Link
              to="/estudos"
              onClick={() => {
                clearFilters();
                setSelectedType("estudo");
              }}
              className="group flex flex-col rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-md"
            >
              <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                <BookOpen className="size-5" />
              </div>
              <h2 className="mt-3 font-display font-semibold text-foreground group-hover:text-primary">
                Estudos Bíblicos
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {counts.estudos} estudos teológicos e temáticos
              </p>
            </Link>

            <Link
              to="/estudos/escola-dominical"
              className="group flex flex-col rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-md"
            >
              <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                <GraduationCap className="size-5" />
              </div>
              <h2 className="mt-3 font-display font-semibold text-foreground group-hover:text-primary">
                Escola Dominical
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {counts.ebd} lições completas com objetivos
              </p>
            </Link>

            <Link
              to="/estudos/apostilas"
              className="group flex flex-col rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-md"
            >
              <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                <FileText className="size-5" />
              </div>
              <h2 className="mt-3 font-display font-semibold text-foreground group-hover:text-primary">
                Apostilas
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {counts.apostilas} manuais para ler e imprimir
              </p>
            </Link>

            <Link
              to="/devocionais"
              className="group flex flex-col rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-md"
            >
              <div className="flex size-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
                <Flame className="size-5" />
              </div>
              <h2 className="mt-3 font-display font-semibold text-foreground group-hover:text-primary">
                Devocionais
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Meditações diárias com versículo e oração
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* ÁREA PRINCIPAL COM CONTEÚDO E BARRA LATERAL */}
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[1fr_300px]">
        <div>
          {/* BARRA DE FILTROS RÁPIDOS PARA CELULAR E DESKTOP */}
          <div className="space-y-3 rounded-xl border border-border bg-card/60 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Filter className="size-4 text-primary" />
                <span>Filtros rápidos</span>
              </div>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-7 text-xs text-muted-foreground hover:text-foreground"
                >
                  Limpar todos
                </Button>
              )}
            </div>

            {/* Chips de Categorias / Temas */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {STUDY_THEMES.map((theme) => {
                const active = selectedCategory === theme.slug;
                return (
                  <button
                    key={theme.slug}
                    onClick={() => setSelectedCategory(theme.slug)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      active
                        ? "bg-primary text-primary-foreground"
                        : "border border-border bg-card text-muted-foreground hover:border-border/80 hover:text-foreground"
                    }`}
                  >
                    {theme.name}
                  </button>
                );
              })}
            </div>

            {/* Filtros de Público e Nível */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/60">
              <span className="text-xs text-muted-foreground">Público:</span>
              {(["todos", "geral", "familia", "jovens", "infantil", "adultos"] as const).map(
                (aud) => (
                  <button
                    key={aud}
                    onClick={() => setSelectedAudience(aud)}
                    className={`rounded-md px-2 py-0.5 text-xs capitalize ${
                      selectedAudience === aud
                        ? "bg-muted font-semibold text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {aud === "todos" ? "Todos" : aud}
                  </button>
                )
              )}
            </div>
          </div>

          {/* ANÚNCIO DISCRETO BANNER */}
          <AdBanner className="my-6" />

          {/* LISTAGEM DE RESULTADOS */}
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold text-foreground">
                {selectedType === "todos"
                  ? "Materiais em Destaque"
                  : selectedType === "escola-dominical"
                  ? "Lições de Escola Dominical"
                  : selectedType === "apostila"
                  ? "Apostilas Bíblicas"
                  : "Estudos Bíblicos"}
              </h2>
              <span className="text-xs text-muted-foreground">
                {filtered.length} material(is) encontrado(s)
              </span>
            </div>

            {isLoading ? (
              <div className="mt-6 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-28 animate-pulse rounded-xl bg-card border border-border" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="mt-8 rounded-xl border border-dashed border-border p-8 text-center">
                <BookMarked className="mx-auto size-10 text-muted-foreground/60" />
                <h3 className="mt-3 font-display text-base font-semibold">
                  Nenhum estudo encontrado para estes filtros
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Tente buscar por outro termo ou remova os filtros ativos.
                </p>
                <Button variant="outline" size="sm" onClick={clearFilters} className="mt-4">
                  Redefinir filtros
                </Button>
              </div>
            ) : (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {filtered.map((item) => (
                  <Link
                    key={item.id}
                    to={getItemHref(item)}
                    className="group flex flex-col justify-between rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-md"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary uppercase tracking-wide">
                          {item.type === "escola-dominical"
                            ? "Escola Dominical"
                            : item.type === "apostila"
                            ? "Apostila"
                            : item.category}
                        </span>
                        {item.series && (
                          <span className="truncate text-[11px] text-muted-foreground">
                            {item.series}
                          </span>
                        )}
                      </div>

                      <h3 className="mt-2.5 font-display text-lg font-semibold leading-snug text-foreground group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>

                      <p className="mt-2 line-clamp-3 text-sm text-muted-foreground leading-relaxed">
                        {item.excerpt}
                      </p>

                      {item.mainVerseRef && (
                        <div className="mt-3 rounded-md bg-muted/50 px-2.5 py-1.5 text-xs text-muted-foreground">
                          <span className="font-semibold text-foreground">Texto-chave: </span>
                          {item.mainVerseRef}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
                      <span className="capitalize">{item.audience} • Nível {item.level}</span>
                      <span className="inline-flex items-center gap-1 font-medium text-primary group-hover:translate-x-0.5 transition-transform">
                        Acessar material <ArrowRight className="size-3.5" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* SEÇÃO INFORMATIVA SOBRE AS ÁREAS DE ESTUDO */}
          <section className="mt-12 rounded-2xl border border-border bg-card/40 p-6 sm:p-8">
            <h3 className="font-display text-xl font-bold text-foreground">
              Como aproveitar ao máximo a seção de Estudos
            </h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Desenvolvemos materiais bíblicos originais e estruturados pedagogicamente para apoiar
              sua igreja, família e estudo individual:
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="space-y-1">
                <span className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                  <GraduationCap className="size-4 text-amber-500" /> Escola Dominical
                </span>
                <p className="text-xs text-muted-foreground">
                  Lições com introdução, tópicos exegéticos, perguntas reflexivas e aplicação prática
                  para cada idade.
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                  <FileText className="size-4 text-emerald-500" /> Apostilas de Estudo
                </span>
                <p className="text-xs text-muted-foreground">
                  Apostilas completas com sumário, diagramação confortável e botão de impressão limpa
                  para aulas e discipulado.
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                  <Flame className="size-4 text-purple-500" /> Devocionais & Oração
                </span>
                <p className="text-xs text-muted-foreground">
                  Conecte seu estudo com versículos do dia e modelos de orações bíblicas fundamentadas.
                </p>
              </div>
            </div>
          </section>

          {/* ANÚNCIO DISCRETO BANNER NO FINAL */}
          <AdBanner className="mt-8" />
        </div>

        {/* BARRA LATERAL (DESKTOP) */}
        <aside className="space-y-6">
          <AdDesktop />

          {/* LINKS RÁPIDOS DE NAVEGAÇÃO BÍBLICA */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h4 className="font-display font-semibold text-foreground text-sm">
              Mais Recursos de Estudo
            </h4>
            <div className="mt-3 space-y-2 text-sm">
              <Link
                to="/biblia"
                className="flex items-center justify-between rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <span>Ler a Bíblia Online</span>
                <ArrowRight className="size-3.5" />
              </Link>
              <Link
                to="/pergunte-a-biblia"
                className="flex items-center justify-between rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <span>Pergunte à Bíblia</span>
                <ArrowRight className="size-3.5" />
              </Link>
              <Link
                to="/versiculo-do-dia"
                className="flex items-center justify-between rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <span>Versículo do Dia</span>
                <ArrowRight className="size-3.5" />
              </Link>
              <Link
                to="/oracoes"
                className="flex items-center justify-between rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <span>Orações com Base Bíblica</span>
                <ArrowRight className="size-3.5" />
              </Link>
              <Link
                to="/comunidade/pedidos-de-oracao"
                className="flex items-center justify-between rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <span>Mural de Oração</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </SiteLayout>
  );
}
