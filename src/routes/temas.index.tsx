import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { AdBanner } from "@/components/Ads";
import { BIBLE_TOPICS } from "@/lib/topics";
import { url } from "@/lib/site";

export const Route = createFileRoute("/temas/")({
  head: () => ({
    meta: [
      { title: "Temas Bíblicos — reflexões e versículos | Bíblia Online" },
      { name: "description", content: "Explore temas bíblicos como fé, amor, esperança, família, oração, perdão e sabedoria." },
      { property: "og:title", content: "Temas Bíblicos — Bíblia Online" },
      { property: "og:description", content: "Reflexões, aplicações e versículos organizados por tema." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: url("/temas") },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: url("/temas") }],
  }),
  component: TopicsIndex,
});

function TopicsIndex() {
  return (
    <SiteLayout>
      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">Temas Bíblicos</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">Encontre orientação bíblica para diferentes áreas da vida.</p>
        <AdBanner className="mt-6" />
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {BIBLE_TOPICS.map((item) => (
            <Link key={item.slug} to="/temas/$slug" params={{ slug: item.slug }} className="surface p-4 transition-colors hover:bg-accent/40">
              <h2 className="font-display text-xl font-semibold">{item.name}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
            </Link>
          ))}
        </div>
      </main>
    </SiteLayout>
  );
}