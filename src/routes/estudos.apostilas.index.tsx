import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/SiteLayout";
import { AdBanner, AdDesktop } from "@/components/Ads";
import { fetchAllMaterials } from "@/lib/studies-service";
import { url } from "@/lib/site";
import {
  FileText,
  BookOpen,
  Printer,
  Download,
  Search,
  ArrowRight,
  Filter,
  CheckCircle2,
  Sparkles,
  Layers,
  GraduationCap,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/estudos/apostilas/")({
  head: () => ({
    meta: [
      { title: "Apostilas Bíblicas e Manuais de Teologia para Leitura e Impressão | Bíblia Online" },
      {
        name: "description",
        content:
          "Baixe e leia apostilas bíblicas completas e gratuitas: Fundamentos da Fé, Hermenêutica, Panorama Bíblico e manuais didáticos com opção de impressão.",
      },
      { property: "og:title", content: "Apostilas Bíblicas — Bíblia Online" },
      {
        property: "og:description",
        content:
          "Manuais de estudo e apostilas completas para líderes, novos convertidos e estudantes da Bíblia.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: url("/estudos/apostilas") },
    ],
    links: [{ rel: "canonical", href: url("/estudos/apostilas") }],
  }),
  component: BookletsIndexPage,
});

function BookletsIndexPage() {
  const [selectedLevel, setSelectedLevel] = useState<string>("todos");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: allMaterials = [], isLoading } = useQuery({
    queryKey: ["bible-materials-all"],
    queryFn: () => fetchAllMaterials(false),
  });

  // Filtra apenas apostilas
  const booklets = useMemo(() => {
    return allMaterials.filter((m) => m.type === "apostila");
  }, [allMaterials]);

  const filteredBooklets = useMemo(() => {
    return booklets.filter((item) => {
      if (selectedLevel !== "todos" && item.level !== selectedLevel) {
        return false;
      }
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchExcerpt = item.excerpt.toLowerCase().includes(q);
        const matchAuthor = item.author.toLowerCase().includes(q);
        if (!matchTitle && !matchExcerpt && !matchAuthor) {
          return false;
        }
      }
      return true;
    });
  }, [booklets, selectedLevel, searchQuery]);

  return (
    <SiteLayout>
      {/* HERO SECTION */}
      <section className="border-b border-border/80 bg-gradient-to-b from-emerald-500/10 via-card to-background px-4 py-10 sm:py-14">
        <div className="mx-auto max-w-6xl">
          <nav className="text-xs text-muted-foreground">
            <Link to="/estudos" className="hover:text-foreground">
              Estudos
            </Link>
            <span className="mx-1.5">/</span>
            <span className="text-foreground font-medium">Apostilas</span>
          </nav>

          <div className="mt-4 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <FileText className="size-3.5" />
              Manuais de Formação & Discipulado
            </span>
            <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
              Apostilas Bíblicas e Teológicas
            </h1>
            <p className="mt-3 text-base text-muted-foreground sm:text-lg leading-relaxed">
              Apostilas didáticas completas, estruturadas com sumário, capítulos detalhados e diagramação
              otimizada para leitura online e impressão para classes ou estudos em grupo.
            </p>
          </div>

          {/* BUSCA */}
          <div className="mt-6 max-w-xl">
            <div className="relative flex items-center">
              <Search className="pointer-events-none absolute left-3.5 size-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Pesquisar apostila por título ou autor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 rounded-xl pl-10 text-sm shadow-sm"
              />
            </div>
          </div>

          {/* FILTROS POR NÍVEL */}
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground mr-1">Filtrar por nível:</span>
            {[
              { id: "todos", label: "Todos os Níveis" },
              { id: "basico", label: "Básico / Novos Convertidos" },
              { id: "intermediario", label: "Intermediário" },
              { id: "avancado", label: "Avançado / Liderança" },
            ].map((lvl) => {
              const active = selectedLevel === lvl.id;
              return (
                <button
                  key={lvl.id}
                  onClick={() => setSelectedLevel(lvl.id)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    active
                      ? "bg-emerald-600 text-white font-semibold shadow-sm"
                      : "border border-border bg-card text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {lvl.label}
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
              {[1, 2].map((i) => (
                <div key={i} className="h-40 animate-pulse rounded-xl bg-card border border-border" />
              ))}
            </div>
          ) : filteredBooklets.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center">
              <FileText className="mx-auto size-10 text-muted-foreground/60" />
              <h2 className="mt-3 font-display text-base font-semibold">
                Nenhuma apostila encontrada para estes filtros
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Tente redefinir a busca ou o nível selecionado.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedLevel("todos");
                  setSearchQuery("");
                }}
                className="mt-4"
              >
                Limpar filtros
              </Button>
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredBooklets.map((booklet) => (
                <div
                  key={booklet.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card sm:flex-row transition-all hover:border-emerald-500/50 hover:shadow-lg"
                >
                  {/* CAPA DA APOSTILA */}
                  {booklet.coverUrl && (
                    <div className="relative h-48 w-full shrink-0 overflow-hidden sm:h-auto sm:w-56 bg-muted">
                      <img
                        src={booklet.coverUrl}
                        alt={booklet.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent sm:hidden" />
                      <div className="absolute bottom-2 left-2 rounded-md bg-black/70 px-2 py-0.5 text-[10px] font-bold text-white uppercase sm:hidden">
                        Nível {booklet.level}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-1 flex-col justify-between p-6">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 capitalize">
                          Nível {booklet.level}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {booklet.author}
                        </span>
                      </div>

                      <h2 className="mt-2.5 font-display text-xl font-bold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        <Link to="/estudos/apostilas/$slug" params={{ slug: booklet.slug }}>
                          {booklet.title}
                        </Link>
                      </h2>

                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                        {booklet.excerpt}
                      </p>

                      {booklet.tableOfContents && booklet.tableOfContents.length > 0 && (
                        <div className="mt-3">
                          <span className="text-xs font-semibold text-foreground">
                            Sumário do manual:
                          </span>
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            {booklet.tableOfContents.slice(0, 4).map((cap) => (
                              <span
                                key={cap.id}
                                className="rounded-md bg-muted/60 px-2 py-0.5 text-[11px] text-muted-foreground"
                              >
                                {cap.title}
                              </span>
                            ))}
                            {booklet.tableOfContents.length > 4 && (
                              <span className="rounded-md bg-muted/60 px-2 py-0.5 text-[11px] text-muted-foreground">
                                +{booklet.tableOfContents.length - 4} capítulos
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Printer className="size-3.5 text-muted-foreground" />
                        Pronta para impressão e leitura
                      </span>

                      <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5">
                        <Link to="/estudos/apostilas/$slug" params={{ slug: booklet.slug }}>
                          Acessar Apostila <ArrowRight className="size-3.5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <AdBanner className="mt-8" />
        </div>

        {/* SIDEBAR COM INFORMAÇÕES DE USO DAS APOSTILAS */}
        <aside className="space-y-6">
          <AdDesktop />

          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-display font-semibold text-foreground text-sm flex items-center gap-2">
              <Printer className="size-4 text-emerald-500" />
              Diretrizes de Impressão e Uso
            </h3>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              Todas as apostilas disponibilizadas pelo Bíblia Online foram elaboradas com conteúdo
              original ou em domínio público. Você tem permissão para:
            </p>
            <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="size-3.5 text-emerald-500 mt-0.5 shrink-0" />
                Imprimir para turmas de discipulado ou Escola Dominical.
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="size-3.5 text-emerald-500 mt-0.5 shrink-0" />
                Utilizar como guia de estudos bíblicos em pequenos grupos nos lares.
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="size-3.5 text-emerald-500 mt-0.5 shrink-0" />
                Compartilhar o link diretamente com membros da sua igreja.
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </SiteLayout>
  );
}
