import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { VerseActions } from "@/components/VerseActions";
import { getBibleTopic } from "@/lib/topics";
import { url } from "@/lib/site";

export const Route = createFileRoute("/versiculos-por-tema/$slug")({
  loader: ({ params }) => { const topic = getBibleTopic(params.slug); if (!topic) throw notFound(); return { topic }; },
  head: ({ params, loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Conteúdo não encontrado" }, { name: "robots", content: "noindex" }] };
    const title = `Versículos sobre ${loaderData.topic.name.toLowerCase()} — Bíblia Online`;
    const description = `${loaderData.topic.description} Leia passagens selecionadas com reflexão e aplicação prática.`;
    const path = `/versiculos-por-tema/${params.slug}`;
    return { meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }, { property: "og:type", content: "article" }, { property: "og:url", content: url(path) }, { name: "twitter:card", content: "summary" }], links: [{ rel: "canonical", href: url(path) }] };
  },
  component: VerseTopicPage,
});

function VerseTopicPage() {
  const { topic } = Route.useLoaderData();
  return <SiteLayout><article className="mx-auto w-full max-w-3xl px-4 py-8"><nav aria-label="Navegação estrutural" className="text-sm text-muted-foreground"><Link to="/">Início</Link><span className="mx-1">/</span><Link to="/versiculos-por-tema">Versículos por tema</Link><span className="mx-1">/</span><span>{topic.name}</span></nav><h1 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">Versículos sobre {topic.name.toLowerCase()}</h1><p className="mt-3 reading-text">{topic.description}</p><div className="mt-8 space-y-4">{topic.verses.map((verse) => { const href = `/biblia/${verse.book}/${verse.chapter}/${verse.verse}`; return <section key={verse.ref} className="surface p-5"><blockquote className="reading-text italic">{verse.text}</blockquote><Link to="/biblia/$book/$chapter/$verse" params={{ book: verse.book, chapter: String(verse.chapter), verse: String(verse.verse) }} className="mt-2 inline-block text-sm font-semibold text-gold">{verse.ref}</Link><div className="mt-3"><VerseActions id={`topic:${topic.slug}:${verse.ref}`} kind="verse" title={verse.ref} text={verse.text} href={href} /></div></section>; })}</div><section className="mt-8"><h2 className="font-display text-2xl font-semibold">Reflexão</h2><p className="mt-3 reading-text">{topic.reflection}</p></section><section className="mt-8"><h2 className="font-display text-2xl font-semibold">Como aplicar</h2><p className="mt-3 reading-text">{topic.application}</p></section><p className="mt-8"><Link to="/temas/$slug" params={{ slug: topic.slug }} className="font-medium text-primary underline">Aprofundar este tema</Link></p></article></SiteLayout>;
}