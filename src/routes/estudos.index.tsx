import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { AdBanner, AdDesktop } from "@/components/Ads";
import { STUDIES, STUDY_CATEGORIES } from "@/lib/content";
import { url } from "@/lib/site";

export const Route = createFileRoute("/estudos/")({
  head: () => ({
    meta: [
      { title: "Estudos Bíblicos — temas, versículos e reflexões | Bíblia Online" },
      {
        name: "description",
        content:
          "Estudos bíblicos sobre fé, amor, família, oração, perdão, esperança, ansiedade e mais, com versículos e perguntas para reflexão.",
      },
      { property: "og:title", content: "Estudos Bíblicos — Bíblia Online" },
      { property: "og:description", content: "Estudos por tema, com versículos e reflexões." },
      { property: "og:url", content: url("/estudos") },
    ],
    links: [{ rel: "canonical", href: url("/estudos") }],
  }),
  component: StudiesIndex,
});

function StudiesIndex() {
  return (
    <SiteLayout>
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[1fr_300px]">
        <div>
          <h1 className="font-display text-3xl font-semibold sm:text-4xl">Estudos Bíblicos</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Conteúdos organizados por tema para aprofundar sua leitura da Bíblia.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {STUDY_CATEGORIES.map((c) => (
              <Link
                key={c.slug}
                to="/estudos/categoria/$slug"
                params={{ slug: c.slug }}
                className="rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
              >
                {c.name}
              </Link>
            ))}
          </div>

          <AdBanner className="mt-6" />

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {STUDIES.map((s) => (
              <Link
                key={s.slug}
                to="/estudos/$slug"
                params={{ slug: s.slug }}
                className="surface p-4 transition-colors hover:bg-accent/40"
              >
                <span className="text-xs uppercase tracking-wide text-gold">{s.category}</span>
                <h2 className="mt-1 font-display text-lg font-semibold">{s.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{s.excerpt}</p>
              </Link>
            ))}
          </div>
        </div>
        <aside>
          <AdDesktop />
        </aside>
      </div>
    </SiteLayout>
  );
}
