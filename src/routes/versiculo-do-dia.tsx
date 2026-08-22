import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { DailyVerseCard } from "@/components/DailyVerseCard";
import { AdBanner, AdDesktop } from "@/components/Ads";
import { DAILY_REFS } from "@/lib/daily-verse";
import { url } from "@/lib/site";

export const Route = createFileRoute("/versiculo-do-dia")({
  head: () => ({
    meta: [
      { title: "Versículo do Dia — Bíblia Online" },
      {
        name: "description",
        content:
          "Confira o versículo do dia de hoje, com texto completo, contexto e opção de favoritar e compartilhar.",
      },
      { property: "og:title", content: "Versículo do Dia — Bíblia Online" },
      { property: "og:description", content: "O versículo de hoje para meditar e compartilhar." },
      { property: "og:url", content: url("/versiculo-do-dia") },
    ],
    links: [{ rel: "canonical", href: url("/versiculo-do-dia") }],
  }),
  component: DailyPage,
});

function DailyPage() {
  return (
    <SiteLayout>
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[1fr_300px]">
        <div>
          <h1 className="font-display text-3xl font-semibold sm:text-4xl">Versículo do Dia</h1>
          <p className="mt-2 text-muted-foreground">
            Um versículo selecionado a cada dia para leitura e meditação.
          </p>
          <div className="mt-6">
            <DailyVerseCard />
          </div>
          <AdBanner className="mt-8" />

          <section className="mt-10">
            <h2 className="font-display text-2xl font-semibold">Versículos mais buscados</h2>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {DAILY_REFS.map((r) => (
                <Link
                  key={`${r.bookSlug}-${r.chapter}-${r.verse}`}
                  to="/biblia/$book/$chapter/$verse"
                  params={{
                    book: r.bookSlug,
                    chapter: String(r.chapter),
                    verse: String(r.verse),
                  }}
                  className="surface px-3 py-2.5 text-sm transition-colors hover:bg-accent"
                >
                  {r.bookName} {r.chapter}:{r.verse}
                </Link>
              ))}
            </div>
          </section>
        </div>
        <aside>
          <AdDesktop />
        </aside>
      </div>
    </SiteLayout>
  );
}
