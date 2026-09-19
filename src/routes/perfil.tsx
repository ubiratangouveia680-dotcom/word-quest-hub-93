import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { FontSizeControls } from "@/components/ChapterReader";
import { ThemeToggle } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { useFavorites, useProgress } from "@/lib/storage";
import { url } from "@/lib/site";

export const Route = createFileRoute("/perfil")({
  head: () => ({
    meta: [
      { title: "Meu Perfil — histórico, progresso e configurações | Bíblia Online" },
      {
        name: "description",
        content: "Veja seu histórico de leitura, progresso, favoritos e ajuste suas preferências.",
      },
      { property: "og:title", content: "Meu Perfil — Bíblia Online" },
      { property: "og:description", content: "Histórico, progresso e configurações de leitura." },
      { property: "og:url", content: url("/perfil") },
      { name: "robots", content: "noindex,follow" },
    ],
    links: [{ rel: "canonical", href: url("/perfil") }],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { items } = useFavorites();
  const { history } = useProgress();

  return (
    <SiteLayout>
      <div className="mx-auto w-full max-w-3xl px-4 py-8">
        <h1 className="font-display text-3xl font-semibold">Meu Perfil</h1>
        <p className="mt-2 text-muted-foreground">
          Seus dados ficam salvos neste dispositivo. Ao criar uma conta, será possível
          sincronizá-los entre aparelhos.
        </p>

        <section className="surface mt-6 p-5">
          <h2 className="font-display text-xl font-semibold">Conta</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            O login ainda não está ativado neste portal. Quando estiver, favoritos, histórico,
            progresso e configurações serão sincronizados automaticamente.
          </p>
          <div className="mt-3 flex gap-2">
            <Button disabled>Entrar</Button>
            <Button variant="outline" disabled>Criar conta</Button>
          </div>
        </section>

        <section className="surface mt-5 p-5">
          <h2 className="font-display text-xl font-semibold">Configurações</h2>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm">Tema claro/escuro</span>
            <ThemeToggle />
          </div>
          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="text-sm">Tamanho da fonte</span>
            <FontSizeControls />
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm">Tradução</span>
            <span className="text-sm text-muted-foreground">Edição Almeida (Bible API)</span>
          </div>
        </section>

        <section className="surface mt-5 p-5">
          <h2 className="font-display text-xl font-semibold">Progresso de leitura</h2>
          {history.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">Nenhum capítulo lido ainda.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {history.slice(0, 10).map((h) => (
                <li key={`${h.bookSlug}-${h.chapter}-${h.at}`}>
                  <Link
                    to="/biblia/$book/$chapter"
                    params={{ book: h.bookSlug, chapter: String(h.chapter) }}
                    className="hover:underline"
                  >
                    {h.bookName} {h.chapter}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="surface mt-5 p-5">
          <h2 className="font-display text-xl font-semibold">Favoritos</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {items.length} item(ns) salvo(s).
          </p>
          <Button asChild variant="outline" size="sm" className="mt-3">
            <Link to="/favoritos">Ver favoritos</Link>
          </Button>
        </section>
      </div>
    </SiteLayout>
  );
}
