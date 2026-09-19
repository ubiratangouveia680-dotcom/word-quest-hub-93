import { createFileRoute, Link } from "@tanstack/react-router";
import { Trash2, Heart, LogIn } from "lucide-react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/lib/storage";
import { useAuth } from "@/lib/auth-context";
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
  const { isAuthenticated } = useAuth();

  return (
    <SiteLayout>
      <div className="mx-auto w-full max-w-3xl px-4 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-semibold">Meus Favoritos</h1>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {isAuthenticated
                ? "Seus versículos favoritos estão sincronizados com sua conta na nuvem."
                : "Faça login ou crie uma conta para sincronizar seus favoritos em todos os seus dispositivos."}
            </p>
          </div>
          {!isAuthenticated && (
            <Button asChild size="sm" variant="outline" className="hidden sm:inline-flex">
              <Link to="/auth" search={{ mode: "signin", next: "/favoritos" }}>
                <LogIn className="mr-1.5 size-3.5" /> Entrar
              </Link>
            </Button>
          )}
        </div>

        {!isAuthenticated && (
          <div className="surface mt-4 p-4 rounded-xl border border-gold/30 bg-gold/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Heart className="size-5 text-gold shrink-0" />
              <p className="text-xs text-foreground leading-relaxed">
                Você não está conectado. Entre na sua conta para não perder seus versículos favoritos.
              </p>
            </div>
            <Button asChild size="sm" className="shrink-0">
              <Link to="/auth" search={{ mode: "signin", next: "/favoritos" }}>
                Entrar / Cadastrar
              </Link>
            </Button>
          </div>
        )}

        {items.length === 0 ? (
          <div className="surface mt-8 p-8 text-center rounded-xl border border-border">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Heart className="size-6" />
            </div>
            <h2 className="mt-3 font-display text-xl font-semibold">Nenhum favorito salvo ainda</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Durante a leitura bíblica, toque no coração ao lado de qualquer versículo para salvá-lo aqui.
            </p>
            <Button asChild className="mt-4">
              <Link to="/biblia">Começar a ler a Bíblia</Link>
            </Button>
          </div>
        ) : (
          <ul className="mt-6 space-y-3">
            {items.map((item) => (
              <li key={item.id} className="surface flex items-start justify-between gap-3 p-4 rounded-xl border border-border">
                <div>
                  <span className="text-xs uppercase tracking-wide text-gold font-medium">
                    {LABEL[item.kind] ?? item.kind}
                  </span>
                  <a href={item.href} className="mt-1 block font-display text-lg font-semibold hover:text-gold transition-colors">
                    {item.title}
                  </a>
                  {item.text && (
                    <p className="mt-1 line-clamp-3 text-sm text-muted-foreground font-serif leading-relaxed">
                      {item.text}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Remover favorito"
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={async () => {
                    await remove(item.id);
                    toast.success("Favorito removido");
                  }}
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
