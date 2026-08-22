import { createFileRoute, Link } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/lib/storage";
import { url } from "@/lib/site";

export const Route = createFileRoute("/favoritos")({
  head: () => ({
    meta: [
      { title: "Meus Favoritos — versículos e conteúdos salvos | Bíblia Online" },
      {
        name: "description",
        content: "Acesse os versículos, estudos, devocionais e orações que você salvou.",
      },
      { property: "og:title", content: "Meus Favoritos — Bíblia Online" },
      { property: "og:description", content: "Seus versículos e conteúdos salvos." },
      { property: "og:url", content: url("/favoritos") },
      { name: "robots", content: "noindex,follow" },
    ],
    links: [{ rel: "canonical", href: url("/favoritos") }],
  }),
  component: FavoritesPage,
});

const LABEL: Record<string, string> = {
  verse: "Versículo",
  study: "Estudo",
  devotional: "Devocional",
  prayer: "Oração",
};

function FavoritesPage() {
  const { items, remove } = useFavorites();

  return (
    <SiteLayout>
      <div className="mx-auto w-full max-w-3xl px-4 py-8">
        <h1 className="font-display text-3xl font-semibold">Meus Favoritos</h1>
        <p className="mt-2 text-muted-foreground">
          Seus favoritos ficam salvos neste dispositivo.
        </p>

        {items.length === 0 ? (
          <div className="surface mt-8 p-8 text-center">
            <p className="text-muted-foreground">Você ainda não salvou nenhum conteúdo.</p>
            <Button asChild className="mt-4">
              <Link to="/biblia">Começar a ler</Link>
            </Button>
          </div>
        ) : (
          <ul className="mt-8 space-y-3">
            {items.map((item) => (
              <li key={item.id} className="surface flex items-start justify-between gap-3 p-4">
                <div>
                  <span className="text-xs uppercase tracking-wide text-gold">
                    {LABEL[item.kind] ?? item.kind}
                  </span>
                  <a href={item.href} className="mt-1 block font-display text-lg font-semibold hover:underline">
                    {item.title}
                  </a>
                  {item.text && (
                    <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{item.text}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Remover favorito"
                  onClick={() => remove(item.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </SiteLayout>
  );
}
