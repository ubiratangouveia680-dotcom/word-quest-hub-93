import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { AdBanner } from "@/components/Ads";
import { STUDIES, STUDY_CATEGORIES } from "@/lib/content";
import { url } from "@/lib/site";

export const Route = createFileRoute("/estudos/categoria/$slug")({
  loader: ({ params }) => {
    const category = STUDY_CATEGORIES.find((c) => c.slug === params.slug);
    if (!category) throw notFound();
    return { category, studies: STUDIES.filter((s) => s.categorySlug === params.slug) };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Categoria não encontrada" }, { name: "robots", content: "noindex" }] };
    }
    const title = `Estudos bíblicos sobre ${loaderData.category.name} | Bíblia Online`;
    const description = `Estudos, versículos e reflexões sobre ${loaderData.category.name.toLowerCase()} na Bíblia.`;
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
  const { category, studies } = Route.useLoaderData();

  return (
    <SiteLayout>
      <div className="mx-auto w-full max-w-4xl px-4 py-8">
        <nav className="text-sm text-muted-foreground">
          <Link to="/estudos" className="hover:text-foreground">Estudos</Link>
          <span className="mx-1">/</span>
          <span className="text-foreground">{category.name}</span>
        </nav>
        <h1 className="mt-3 font-display text-3xl font-semibold">
          Estudos sobre {category.name}
        </h1>
        <AdBanner className="mt-6" />
        {studies.length === 0 ? (
          <p className="mt-8 text-muted-foreground">
            Ainda não publicamos estudos nesta categoria. Veja{" "}
            <Link to="/estudos" className="underline">todos os estudos</Link>.
          </p>
        ) : (
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {studies.map((s) => (
              <Link
                key={s.slug}
                to="/estudos/$slug"
                params={{ slug: s.slug }}
                className="surface p-4 transition-colors hover:bg-accent/40"
              >
                <h2 className="font-display text-lg font-semibold">{s.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{s.excerpt}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
