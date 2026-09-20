import { Copy, Heart, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useFavorites, type FavoriteKind } from "@/lib/storage";

interface Props {
  id: string;
  kind: FavoriteKind;
  title: string;
  text: string;
  href: string;
  compact?: boolean;
}

export async function shareContent(title: string, text: string, href: string) {
  const url = typeof window !== "undefined" ? window.location.origin + href : href;
  const payload = { title, text: `${text}\n\n${title}`, url };
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share(payload);
      return;
    } catch {
      return;
    }
  }
  await navigator.clipboard.writeText(`${text}\n\n${title}\n${url}`);
  toast.success("Link copiado para a área de transferência");
}

export function VerseActions({ id, kind, title, text, href, compact }: Props) {
  const { toggle, isFavorite, userId } = useFavorites();
  const fav = isFavorite(id);
  const size = compact ? "size-3.5" : "size-4";

  return (
    <div className="flex items-center gap-0.5">
      <Button
        variant="ghost"
        size="icon"
        className={compact ? "size-7" : ""}
        aria-label={fav ? "Remover dos favoritos" : "Favoritar"}
        onClick={async () => {
          const added = await toggle({ id, kind, title, text, href });
          if (!userId) {
            toast.success(
              added ? "Versículo salvo nos favoritos do navegador!" : "Removido dos favoritos",
              {
                description: "Crie uma conta para sincronizar seus favoritos em todos os seus dispositivos.",
                action: {
                  label: "Entrar",
                  onClick: () => {
                    window.location.href = `/auth?mode=signin&next=${encodeURIComponent(
                      window.location.pathname + window.location.hash
                    )}`;
                  },
                },
              }
            );
            return;
          }
          toast.success(added ? "Adicionado aos favoritos" : "Removido dos favoritos");
        }}
      >
        <Heart className={`${size} ${fav ? "fill-destructive text-destructive" : ""}`} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={compact ? "size-7" : ""}
        aria-label="Copiar"
        onClick={async () => {
          await navigator.clipboard.writeText(`${text}\n\n${title}`);
          toast.success("Texto copiado");
        }}
      >
        <Copy className={size} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={compact ? "size-7" : ""}
        aria-label="Compartilhar"
        onClick={() => shareContent(title, text, href)}
      >
        <Share2 className={size} />
      </Button>
    </div>
  );
}
