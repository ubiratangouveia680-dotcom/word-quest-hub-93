import { createFileRoute, redirect } from "@tanstack/react-router";
import { url } from "@/lib/site";

export const Route = createFileRoute("/versiculos-por-tema/")({
  beforeLoad: () => {
    throw redirect({
      to: "/versiculos",
      statusCode: 301,
    });
  },
  head: () => ({
    meta: [
      { name: "robots", content: "noindex,follow" },
    ],
    links: [{ rel: "canonical", href: url("/versiculos") }],
  }),
  component: () => null,
});

function VerseTopicsIndex() {
  return <SiteLayout><main className="mx-auto w-full max-w-6xl px-4 py-8"><h1 className="font-display text-3xl font-semibold sm:text-4xl">Versículos por tema</h1><p className="mt-2 text-muted-foreground">Escolha um assunto para ler passagens, refletir e aplicar a Palavra.</p><div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">{BIBLE_TOPICS.map((item) => <Link key={item.slug} to="/versiculos-por-tema/$slug" params={{ slug: item.slug }} className="surface flex min-h-20 items-center justify-center p-3 text-center font-medium">{item.name}</Link>)}</div></main></SiteLayout>;
}