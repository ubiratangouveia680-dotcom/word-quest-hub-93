import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { AdBanner, AdDesktop, AdInArticle } from "@/components/Ads";
import { VerseActions } from "@/components/VerseActions";
import { PRAYERS } from "@/lib/content";
import { url } from "@/lib/site";

export const Route = createFileRoute("/oracoes")({
  head: () => ({
    meta: [
      { title: "Orações para todos os momentos — manhã, noite, família e mais" },
      {
        name: "description",
        content:
          "Orações da manhã, da noite, pela família, por proteção, saúde, trabalho, paz e de agradecimento. Textos originais para orar hoje.",
      },
      { property: "og:title", content: "Orações — Bíblia Online" },
      { property: "og:description", content: "Orações para todos os momentos do dia." },
      { property: "og:url", content: url("/oracoes") },
    ],
    links: [{ rel: "canonical", href: url("/oracoes") }],
  }),
  component: PrayersPage,
});

function PrayersPage() {
  return (
    <SiteLayout>
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[1fr_300px]">
        <div>
          <h1 className="font-display text-3xl font-semibold sm:text-4xl">Orações</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Orações simples e sinceras para diferentes momentos da vida. Use-as como ponto de
            partida e fale com Deus com suas próprias palavras.
          </p>
          <AdBanner className="mt-6" />

          <div className="mt-8 space-y-5">
            {PRAYERS.map((p, i) => (
              <div key={p.slug}>
                <section id={p.slug} className="surface scroll-mt-20 p-5">
                  <h2 className="font-display text-xl font-semibold">{p.title}</h2>
                  <p className="mt-3 reading-text">{p.text}</p>
                  <div className="mt-3">
                    <VerseActions
                      id={`prayer:${p.slug}`}
                      kind="prayer"
                      title={p.title}
                      text={p.text}
                      href={`/oracoes#${p.slug}`}
                      compact
                    />
                  </div>
                </section>
                {i === 3 && <AdInArticle className="mt-5" />}
              </div>
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
