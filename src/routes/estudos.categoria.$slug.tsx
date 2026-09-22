import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { AdBanner, AdDesktop } from "@/components/Ads";
import { STUDIES, STUDY_CATEGORIES } from "@/lib/content";
import { STUDY_THEMES, INITIAL_MATERIALS } from "@/lib/studies-seed";
import { fetchAllMaterials } from "@/lib/studies-service";
import { url } from "@/lib/site";
import { ArrowRight, BookOpen } from "lucide-react";

export const Route = createFileRoute("/estudos/categoria/$slug")({
  loader: async ({ params }) => {
    // Procura na lista antiga ou na lista estendida de temas
    let category = STUDY_CATEGORIES.find((c) => c.slug === params.slug);
    if (!category) {
      const theme = STUDY_THEMES.find((t) => t.slug === params.slug);
      if (theme && theme.slug !== "todos") {
        category = { slug: theme.slug, name: theme.name };
      }
    }
    if (!category) throw notFound();

    // Busca materiais unificados dessa categoria
    const all = await fetchAllMaterials(false);
    const unified = all.filter((m) => m.categorySlug === category.slug);

    return { category, materials: unified };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Categoria não encontrada" }, { name: "robots", content: "noindex" }] };
    }
    const title = `Estudos bíblicos sobre ${loaderData.category.name} | Bíblia Online`;
    const description = `Estudos, versículos, apostilas e lições sobre ${loaderData.category.name.toLowerCase()} na Bíblia.`;
    const path = `/estudos/categoria/${params.slug}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url(path) },
      ],
      links: [{ rel: "canonical", href: url(path) }],
    };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { category, materials } = Route.useLoaderData();

  return (
    <SiteLayout>
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[1fr_300px]">
        <div>
          <nav className="text-xs text-muted-foreground">
            <Link to="/estudos" className="hover:text-foreground">
              Estudos
            </Link>
            <span className="mx-1.5">/</span>
            <span className="text-foreground font-medium">{category.name}</span>
          </nav>

          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Estudos sobre {category.name}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Artigos, lições bíblicas e subsídios doutrinários dedicados ao tema {category.name}.
          </p>

          <AdBanner className="mt-6" />

          {materials.length === 0 ? (
            <div className="mt-8 rounded-xl border border-dashed border-border p-8 text-center">
              <BookOpen className="mx-auto size-10 text-muted-foreground/60" />
              <p className="mt-3 text-muted-foreground text-sm">
                Ainda não publicamos estudos nesta categoria. Veja{" "}
                <Link to="/estudos" className="text-primary underline">
                  todos os estudos
                </Link>.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {materials.map((m) => (
                <Link
                  key={m.id || m.slug}
                  to={
                    m.type === "escola-dominical"
                      ? "/estudos/escola-dominical/$slug"
                      : m.type === "apostila"
                      ? "/estudos/apostilas/$slug"
                      : "/estudos/$slug"
                  }
                  params={{ slug: m.slug }}
                  className="group flex flex-col justify-between rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-md"
                >
                  <div>
                    <span className="rounded-md bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary uppercase">
                      {m.type === "escola-dominical"
                        ? "Escola Dominical"
                        : m.type === "apostila"
                        ? "Apostila"
                        : m.category}
                    </span>
                    <h2 className="mt-2 font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                      {m.title}
                    </h2>
                    <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">
                      {m.excerpt}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
                    <span className="capitalize">{m.audience}</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-primary group-hover:translate-x-0.5 transition-transform">
                      Acessar <ArrowRight className="size-3.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <AdBanner className="mt-8" />
        </div>

        <aside className="space-y-6">
          <AdDesktop />
        </aside>
      </div>
    </SiteLayout>
  );
}
