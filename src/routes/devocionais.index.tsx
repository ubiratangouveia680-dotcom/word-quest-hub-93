import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { AdBanner, AdDesktop } from "@/components/Ads";
import { DEVOTIONALS } from "@/lib/content";
import { url } from "@/lib/site";

export const Route = createFileRoute("/devocionais/")({
  head: () => ({
    meta: [
      { title: "Devocionais diários — reflexão, aplicação e oração | Bíblia Online" },
      {
        name: "description",
        content:
          "Devocionais com versículo, reflexão, aplicação prática e oração para fortalecer sua caminhada diária.",
      },
      { property: "og:title", content: "Devocionais diários — Bíblia Online" },
      { property: "og:description", content: "Versículo, reflexão, aplicação e oração." },
      { property: "og:url", content: url("/devocionais") },
    ],
    links: [{ rel: "canonical", href: url("/devocionais") }],
  }),
  component: DevotionalsIndex,
});

function DevotionalsIndex() {
  return (
    <SiteLayout>
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[1fr_300px]">
        <div>
          <h1 className="font-display text-3xl font-semibold sm:text-4xl">Devocionais</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Reflexões curtas para começar ou encerrar o dia com a Palavra.
          </p>
          <AdBanner className="mt-6" />
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {DEVOTIONALS.map((d) => (
              <Link
                key={d.slug}
                to="/devocionais/$slug"
                params={{ slug: d.slug }}
                className="surface p-4 transition-colors hover:bg-accent/40"
              >
                <h2 className="font-display text-lg font-semibold">{d.title}</h2>
                <p className="mt-1 text-xs text-gold">{d.verseRef}</p>
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{d.reflection}</p>
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
