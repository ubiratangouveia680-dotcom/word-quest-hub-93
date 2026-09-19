import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { AdInArticle } from "@/components/Ads";
import { getBibleTopic, BIBLE_TOPICS } from "@/lib/topics";
import { url } from "@/lib/site";

export const Route = createFileRoute("/temas/$slug")({
  loader: ({ params }) => {
    const topic = getBibleTopic(params.slug);
    if (!topic) throw notFound();
    return { topic };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Tema não encontrado" }, { name: "robots", content: "noindex" }] };
    const title = `${loaderData.topic.name} na Bíblia — versículos e reflexão`;
    const path = `/temas/${params.slug}`;
    return {
      meta: [
        { title }, { name: "description", content: loaderData.topic.description },
        { property: "og:title", content: title }, { property: "og:description", content: loaderData.topic.description },
        { property: "og:type", content: "article" }, { property: "og:url", content: url(path) },
        { name: "twitter:card", content: "summary" },
      ],
      links: [{ rel: "canonical", href: url(path) }],
    };
  },
  component: TopicPage,
});

function TopicPage() {
  const { topic } = Route.useLoaderData();
  const related = BIBLE_TOPICS.filter((item) => item.slug !== topic.slug).slice(0, 3);
  return (
    <SiteLayout>
      <article className="mx-auto w-full max-w-3xl px-4 py-8">
        <nav aria-label="Navegação estrutural" className="text-sm text-muted-foreground">
          <Link to="/">Início</Link><span className="mx-1">/</span><Link to="/temas">Temas</Link><span className="mx-1">/</span><span>{topic.name}</span>
        </nav>
        <h1 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">{topic.name} na Bíblia</h1>
        <p className="mt-3 reading-text">{topic.description}</p>
        <section className="mt-8">
          <h2 className="font-display text-2xl font-semibold">Versículos sobre {topic.name.toLowerCase()}</h2>
          <div className="mt-4 space-y-3">
            {topic.verses.map((verse) => (
              <blockquote key={verse.ref} className="warm-panel p-4">
                <p className="reading-text italic">{verse.text}</p>
                <Link to="/biblia/$book/$chapter/$verse" params={{ book: verse.book, chapter: String(verse.chapter), verse: String(verse.verse) }} className="mt-2 inline-block text-sm font-medium text-gold">{verse.ref}</Link>
              </blockquote>
            ))}
          </div>
        </section>
        <AdInArticle className="mt-8" />
        <section className="mt-8"><h2 className="font-display text-2xl font-semibold">Reflexão</h2><p className="mt-3 reading-text">{topic.reflection}</p></section>
        <section className="mt-8"><h2 className="font-display text-2xl font-semibold">Aplicação prática</h2><p className="mt-3 reading-text">{topic.application}</p></section>
        <section className="mt-10"><h2 className="font-display text-xl font-semibold">Você também pode gostar</h2><div className="mt-3 grid gap-3 sm:grid-cols-3">{related.map((item) => <Link key={item.slug} to="/temas/$slug" params={{ slug: item.slug }} className="surface p-3 text-sm">{item.name}</Link>)}</div></section>
      </article>
    </SiteLayout>
  );
}