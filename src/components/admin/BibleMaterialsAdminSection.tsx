import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchAllMaterials,
  createBibleMaterial,
  updateBibleMaterial,
  deleteBibleMaterial,
} from "@/lib/studies-service";
import { BibleMaterial, MaterialType, MaterialAudience, MaterialLevel, MaterialStatus } from "@/lib/studies-types";
import { STUDY_THEMES } from "@/lib/studies-seed";
import {
  BookOpen,
  GraduationCap,
  FileText,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  Clock,
  ExternalLink,
  Search,
  Filter,
  Eye,
  X,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@tanstack/react-router";

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
}

export function BibleMaterialsAdminSection() {
  const queryClient = useQueryClient();
  const [filterType, setFilterType] = useState<string>("todos");
  const [filterStatus, setFilterStatus] = useState<string>("todos");
  const [search, setSearch] = useState<string>("");
  const [editingMaterial, setEditingMaterial] = useState<Partial<BibleMaterial> | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Consulta todos incluindo rascunhos
  const { data: materials = [], isLoading } = useQuery({
    queryKey: ["admin-bible-materials"],
    queryFn: () => fetchAllMaterials(true),
  });

  const filteredMaterials = useMemo(() => {
    return materials.filter((m) => {
      if (filterType !== "todos" && m.type !== filterType) return false;
      if (filterStatus !== "todos" && m.status !== filterStatus) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          m.title.toLowerCase().includes(q) ||
          m.category.toLowerCase().includes(q) ||
          (m.series && m.series.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [materials, filterType, filterStatus, search]);

  const saveMutation = useMutation({
    mutationFn: async (item: Partial<BibleMaterial>) => {
      if (item.id && !item.id.startsWith("mat-")) {
        return await updateBibleMaterial(item.id, item);
      } else {
        return await createBibleMaterial(item);
      }
    },
    onSuccess: () => {
      toast.success("Material salvo com sucesso no banco de dados!");
      queryClient.invalidateQueries({ queryKey: ["admin-bible-materials"] });
      queryClient.invalidateQueries({ queryKey: ["bible-materials-all"] });
      setIsFormOpen(false);
      setEditingMaterial(null);
    },
    onError: (err: any) => {
      toast.error(err.message || "Erro ao salvar material.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (id.startsWith("mat-")) {
        // Material padrão de seed
        toast.info("Materiais demonstrativos iniciais são preservados como modelos padrão.");
        return;
      }
      await deleteBibleMaterial(id);
    },
    onSuccess: () => {
      toast.success("Material removido com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["admin-bible-materials"] });
      queryClient.invalidateQueries({ queryKey: ["bible-materials-all"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Erro ao excluir material.");
    },
  });

  const handleCreateNew = (type: MaterialType = "estudo") => {
    setEditingMaterial({
      type,
      title: "",
      slug: "",
      category: "Vida Cristã",
      categorySlug: "vida-crista",
      audience: "geral",
      level: "basico",
      author: "Equipe Bíblia Online",
      excerpt: "",
      mainVerse: "",
      mainVerseRef: "",
      content: "",
      objectives: [],
      topics: [],
      questions: [],
      practicalApplication: "",
      conclusion: "",
      status: "published",
      isDownloadable: true,
    });
    setIsFormOpen(true);
  };

  const handleEdit = (material: BibleMaterial) => {
    setEditingMaterial({ ...material });
    setIsFormOpen(true);
  };

  const handleDelete = (material: BibleMaterial) => {
    if (confirm(`Tem certeza de que deseja excluir o material "${material.title}"?`)) {
      deleteMutation.mutate(material.id);
    }
  };

  return (
    <section className="surface mt-6 rounded-xl border border-border p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="size-5 text-primary" />
            <h2 className="font-display text-xl font-bold text-foreground">
              Gestão de Estudos Bíblicos, Escola Dominical e Apostilas
            </h2>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Crie novos conteúdos, lições de EBD, apostilas com impressão e controle publicações ou rascunhos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => handleCreateNew("estudo")}
            className="gap-1.5 text-xs"
          >
            <Plus className="size-3.5" />
            Novo Estudo
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleCreateNew("escola-dominical")}
            className="gap-1.5 text-xs border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
          >
            <GraduationCap className="size-3.5" />
            Nova Lição EBD
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleCreateNew("apostila")}
            className="gap-1.5 text-xs border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
          >
            <FileText className="size-3.5" />
            Nova Apostila
          </Button>
        </div>
      </div>

      {/* FORMULÁRIO DE CRIAÇÃO / EDIÇÃO */}
      {isFormOpen && editingMaterial && (
        <div className="mt-5 rounded-xl border border-primary/40 bg-card p-5 shadow-lg">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
              <Pencil className="size-4 text-primary" />
              {editingMaterial.id ? "Editar Material" : "Cadastrar Novo Material"}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsFormOpen(false);
                setEditingMaterial(null);
              }}
              className="size-8 p-0"
            >
              <X className="size-4" />
            </Button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!editingMaterial.title || !editingMaterial.excerpt || !editingMaterial.content) {
                toast.error("Preencha título, resumo e conteúdo completo.");
                return;
              }
              const finalSlug = editingMaterial.slug || slugify(editingMaterial.title);
              saveMutation.mutate({
                ...editingMaterial,
                slug: finalSlug,
              });
            }}
            className="mt-4 space-y-4 text-xs"
          >
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="mat-type">Tipo de Material</Label>
                <select
                  id="mat-type"
                  value={editingMaterial.type}
                  onChange={(e) =>
                    setEditingMaterial({
                      ...editingMaterial,
                      type: e.target.value as MaterialType,
                    })
                  }
                  className="mt-1 h-9 w-full rounded-md border border-border bg-background px-2 text-xs"
                >
                  <option value="estudo">Estudo Bíblico</option>
                  <option value="escola-dominical">Escola Dominical (EBD)</option>
                  <option value="apostila">Apostila Completa</option>
                  <option value="curso">Curso Bíblico</option>
                </select>
              </div>

              <div>
                <Label htmlFor="mat-audience">Público / Classe</Label>
                <select
                  id="mat-audience"
                  value={editingMaterial.audience}
                  onChange={(e) =>
                    setEditingMaterial({
                      ...editingMaterial,
                      audience: e.target.value as MaterialAudience,
                    })
                  }
                  className="mt-1 h-9 w-full rounded-md border border-border bg-background px-2 text-xs"
                >
                  <option value="geral">Geral / Todos</option>
                  <option value="adultos">Adultos</option>
                  <option value="jovens">Jovens</option>
                  <option value="infantil">Infantil / Crianças</option>
                  <option value="familia">Família / Casais</option>
                </select>
              </div>

              <div>
                <Label htmlFor="mat-level">Nível de Aprofundamento</Label>
                <select
                  id="mat-level"
                  value={editingMaterial.level}
                  onChange={(e) =>
                    setEditingMaterial({
                      ...editingMaterial,
                      level: e.target.value as MaterialLevel,
                    })
                  }
                  className="mt-1 h-9 w-full rounded-md border border-border bg-background px-2 text-xs"
                >
                  <option value="basico">Básico</option>
                  <option value="intermediario">Intermediário</option>
                  <option value="avancado">Avançado</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="mat-title">Título do Material</Label>
                <Input
                  id="mat-title"
                  value={editingMaterial.title || ""}
                  onChange={(e) => {
                    const title = e.target.value;
                    setEditingMaterial({
                      ...editingMaterial,
                      title,
                      slug: editingMaterial.id ? (editingMaterial.slug ?? "") : slugify(title),
                    });
                  }}
                  placeholder="Ex: A Armadura de Deus: Firmeza Espiritual"
                  className="mt-1 h-9 text-xs"
                  required
                />
              </div>

              <div>
                <Label htmlFor="mat-slug">Slug (URL amigável)</Label>
                <Input
                  id="mat-slug"
                  value={editingMaterial.slug || ""}
                  onChange={(e) =>
                    setEditingMaterial({
                      ...editingMaterial,
                      slug: slugify(e.target.value),
                    })
                  }
                  placeholder="ex: armadura-de-deus-efesios-6"
                  className="mt-1 h-9 font-mono text-xs"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="mat-category">Categoria / Tema</Label>
                <select
                  id="mat-category"
                  value={editingMaterial.categorySlug}
                  onChange={(e) => {
                    const sel = STUDY_THEMES.find((t) => t.slug === e.target.value);
                    setEditingMaterial({
                      ...editingMaterial,
                      categorySlug: e.target.value,
                      category: sel ? sel.name : "Vida Cristã",
                    });
                  }}
                  className="mt-1 h-9 w-full rounded-md border border-border bg-background px-2 text-xs"
                >
                  {STUDY_THEMES.filter((t) => t.slug !== "todos").map((t) => (
                    <option key={t.slug} value={t.slug}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="mat-series">Série / Trimestre (Opcional)</Label>
                <Input
                  id="mat-series"
                  value={editingMaterial.series || ""}
                  onChange={(e) =>
                    setEditingMaterial({
                      ...editingMaterial,
                      series: e.target.value,
                    })
                  }
                  placeholder="Ex: O Fruto do Espírito na Prática"
                  className="mt-1 h-9 text-xs"
                />
              </div>

              <div>
                <Label htmlFor="mat-lesson">Nº da Lição (para EBD)</Label>
                <Input
                  id="mat-lesson"
                  type="number"
                  value={editingMaterial.lessonNumber ?? ""}
                  onChange={(e) =>
                    setEditingMaterial({
                      ...editingMaterial,
                      lessonNumber: e.target.value ? parseInt(e.target.value, 10) : null,
                    })
                  }
                  placeholder="Ex: 1"
                  className="mt-1 h-9 text-xs"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="mat-main-ref">Referência do Texto Principal</Label>
                <Input
                  id="mat-main-ref"
                  value={editingMaterial.mainVerseRef || ""}
                  onChange={(e) =>
                    setEditingMaterial({
                      ...editingMaterial,
                      mainVerseRef: e.target.value,
                    })
                  }
                  placeholder="Ex: Efésios 6:11 ou Gálatas 5:22"
                  className="mt-1 h-9 text-xs"
                />
              </div>

              <div>
                <Label htmlFor="mat-cover">URL da Imagem de Capa (Opcional)</Label>
                <Input
                  id="mat-cover"
                  value={editingMaterial.coverUrl || ""}
                  onChange={(e) =>
                    setEditingMaterial({
                      ...editingMaterial,
                      coverUrl: e.target.value,
                    })
                  }
                  placeholder="https://..."
                  className="mt-1 h-9 text-xs"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="mat-main-verse">Texto do Versículo Principal</Label>
              <Input
                id="mat-main-verse"
                value={editingMaterial.mainVerse || ""}
                onChange={(e) =>
                  setEditingMaterial({
                    ...editingMaterial,
                    mainVerse: e.target.value,
                  })
                }
                placeholder="Texto integral do versículo chave..."
                className="mt-1 h-9 text-xs"
              />
            </div>

            <div>
              <Label htmlFor="mat-excerpt">Resumo / Excerpt (SEO e Listagens)</Label>
              <Textarea
                id="mat-excerpt"
                rows={2}
                value={editingMaterial.excerpt || ""}
                onChange={(e) =>
                  setEditingMaterial({
                    ...editingMaterial,
                    excerpt: e.target.value,
                  })
                }
                placeholder="Breve descrição do conteúdo..."
                className="mt-1 text-xs"
                required
              />
            </div>

            <div>
              <Label htmlFor="mat-content">Conteúdo Completo (Markdown / Texto)</Label>
              <Textarea
                id="mat-content"
                rows={8}
                value={editingMaterial.content || ""}
                onChange={(e) =>
                  setEditingMaterial({
                    ...editingMaterial,
                    content: e.target.value,
                  })
                }
                placeholder="Escreva a introdução, desenvolvimento e tópicos do estudo..."
                className="mt-1 font-mono text-xs"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="mat-app">Aplicação Prática</Label>
                <Textarea
                  id="mat-app"
                  rows={2}
                  value={editingMaterial.practicalApplication || ""}
                  onChange={(e) =>
                    setEditingMaterial({
                      ...editingMaterial,
                      practicalApplication: e.target.value,
                    })
                  }
                  placeholder="Como o leitor deve aplicar este estudo nesta semana..."
                  className="mt-1 text-xs"
                />
              </div>

              <div>
                <Label htmlFor="mat-conclusion">Conclusão</Label>
                <Textarea
                  id="mat-conclusion"
                  rows={2}
                  value={editingMaterial.conclusion || ""}
                  onChange={(e) =>
                    setEditingMaterial({
                      ...editingMaterial,
                      conclusion: e.target.value,
                    })
                  }
                  placeholder="Palavra de fechamento..."
                  className="mt-1 text-xs"
                />
              </div>
            </div>

            {/* STATUS E AÇÕES */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/80 pt-4">
              <div className="flex items-center gap-3">
                <Label htmlFor="mat-status">Status:</Label>
                <select
                  id="mat-status"
                  value={editingMaterial.status}
                  onChange={(e) =>
                    setEditingMaterial({
                      ...editingMaterial,
                      status: e.target.value as MaterialStatus,
                    })
                  }
                  className="h-8 rounded-md border border-border bg-background px-2 text-xs"
                >
                  <option value="published">Publicado (Visível a todos)</option>
                  <option value="draft">Rascunho (Privado)</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingMaterial(null);
                  }}
                  className="text-xs"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={saveMutation.isPending}
                  className="gap-1.5 text-xs"
                >
                  <Save className="size-3.5" />
                  {saveMutation.isPending ? "Salvando..." : "Salvar Material"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* FILTROS E PESQUISA NA LISTA DE MATERIAIS */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-muted-foreground">Tipo:</span>
          {["todos", "estudo", "escola-dominical", "apostila"].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                filterType === t
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "todos" ? "Todos" : t}
            </button>
          ))}

          <span className="ml-2 font-semibold text-muted-foreground">Status:</span>
          {["todos", "published", "draft"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                filterStatus === s
                  ? "bg-muted text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s === "todos" ? "Todos" : s === "published" ? "Publicados" : "Rascunhos"}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Filtrar por título..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 text-xs"
          />
        </div>
      </div>

      {/* TABELA DE MATERIAIS */}
      <div className="mt-4 overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-border bg-muted/40 font-semibold text-muted-foreground">
            <tr>
              <th className="p-3">Título / Slug</th>
              <th className="p-3">Tipo</th>
              <th className="p-3">Categoria</th>
              <th className="p-3">Público</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-muted-foreground">
                  Carregando acervo de estudos...
                </td>
              </tr>
            ) : filteredMaterials.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-muted-foreground">
                  Nenhum material cadastrado para os filtros selecionados.
                </td>
              </tr>
            ) : (
              filteredMaterials.map((item) => (
                <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-3">
                    <span className="font-semibold text-foreground block line-clamp-1">
                      {item.title}
                    </span>
                    <span className="text-[11px] font-mono text-muted-foreground">
                      /{item.type === "escola-dominical" ? "escola-dominical/" : item.type === "apostila" ? "apostilas/" : ""}{item.slug}
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                        item.type === "escola-dominical"
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          : item.type === "apostila"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                      }`}
                    >
                      {item.type}
                    </span>
                  </td>
                  <td className="p-3">{item.category}</td>
                  <td className="p-3 capitalize">{item.audience}</td>
                  <td className="p-3">
                    {item.status === "published" ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="size-3" /> Publicado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-500">
                        <Clock className="size-3" /> Rascunho
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="size-7 p-0 text-muted-foreground hover:text-foreground"
                      >
                        <Link
                          to={
                            item.type === "escola-dominical"
                              ? "/estudos/escola-dominical/$slug"
                              : item.type === "apostila"
                              ? "/estudos/apostilas/$slug"
                              : "/estudos/$slug"
                          }
                          params={{ slug: item.slug }}
                          target="_blank"
                          title="Visualizar no site"
                        >
                          <Eye className="size-3.5" />
                        </Link>
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(item)}
                        className="size-7 p-0 text-muted-foreground hover:text-primary"
                        title="Editar"
                      >
                        <Pencil className="size-3.5" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(item)}
                        className="size-7 p-0 text-muted-foreground hover:text-destructive"
                        title="Excluir"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
