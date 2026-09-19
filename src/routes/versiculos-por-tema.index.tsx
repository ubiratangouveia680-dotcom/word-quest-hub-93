import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { BIBLE_TOPICS } from "@/lib/topics";
import { url } from "@/lib/site";

export const Route = createFileRoute("/versiculos-por-tema/")({
  head: () => ({ meta: [
    { title: "Versículos por tema — encontre passagens bíblicas | Bíblia Online" },
    { name: "description", content: "Versículos bíblicos organizados por amor, fé, esperança, proteção, força, família, oração e outros temas." },
    { property: "og:title", content: "Versículos por tema — Bíblia Online" },
    { property: "og:description", content: "Encontre passagens bíblicas para diferentes momentos da vida." },
    { property: "og:type", content: "website" }, { property: "og:url", content: url("/versiculos-por-tema") },
    { name: "twitter:card", content: "summary" },
  ], links: [{ rel: "canonical", href: url("/versiculos-por-tema") }] }),
  component: VerseTopicsIndex,
});

function VerseTopicsIndex() {
  return <SiteLayout><main className="mx-auto w-full max-w-6xl px-4 py-8"><h1 className="font-display text-3xl font-semibold sm:text-4xl">Versículos por tema</h1><p className="mt-2 text-muted-foreground">Escolha um assunto para ler passagens, refletir e aplicar a Palavra.</p><div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">{BIBLE_TOPICS.map((item) => <Link key={item.slug} to="/versiculos-por-tema/$slug" params={{ slug: item.slug }} className="surface flex min-h-20 items-center justify-center p-3 text-center font-medium">{item.name}</Link>)}</div></main></SiteLayout>;
}