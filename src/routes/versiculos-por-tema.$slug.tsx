import { createFileRoute, redirect } from "@tanstack/react-router";
import { url } from "@/lib/site";

export const Route = createFileRoute("/versiculos-por-tema/$slug")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/versiculos/$slug",
      params: { slug: params.slug },
      statusCode: 301,
    });
  },
  head: ({ params }) => {
    const canonical = url(`/versiculos/${params.slug}`);
    return {
      meta: [
        { name: "robots", content: "noindex,follow" },
      ],
      links: [{ rel: "canonical", href: canonical }],
    };
  },
  component: () => null,
});

function VerseTopicPage() {
  const { topic } = Route.useLoaderData();
  return <SiteLayout><article className="mx-auto w-full max-w-3xl px-4 py-8"><nav aria-label="Navegação estrutural" className="text-sm text-muted-foreground"><Link to="/">Início</Link><span className="mx-1">/</span><Link to="/versiculos-por-tema">Versículos por tema</Link><span className="mx-1">/</span><span>{topic.name}</span></nav><h1 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">Versículos sobre {topic.name.toLowerCase()}</h1><p className="mt-3 reading-text">{topic.description}</p><div className="mt-8 space-y-4">{topic.verses.map((verse) => { const href = `/biblia/${verse.book}/${verse.chapter}/${verse.verse}`; return <section key={verse.ref} className="surface p-5"><blockquote className="reading-text italic">{verse.text}</blockquote><Link to="/biblia/$book/$chapter/$verse" params={{ book: verse.book, chapter: String(verse.chapter), verse: String(verse.verse) }} className="mt-2 inline-block text-sm font-semibold text-gold">{verse.ref}</Link><div className="mt-3"><VerseActions id={`topic:${topic.slug}:${verse.ref}`} kind="verse" title={verse.ref} text={verse.text} href={href} /></div></section>; })}</div><section className="mt-8"><h2 className="font-display text-2xl font-semibold">Reflexão</h2><p className="mt-3 reading-text">{topic.reflection}</p></section><section className="mt-8"><h2 className="font-display text-2xl font-semibold">Como aplicar</h2><p className="mt-3 reading-text">{topic.application}</p></section><p className="mt-8"><Link to="/temas/$slug" params={{ slug: topic.slug }} className="font-medium text-primary underline">Aprofundar este tema</Link></p></article></SiteLayout>;
}