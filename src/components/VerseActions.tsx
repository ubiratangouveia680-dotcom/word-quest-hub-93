import { useState } from "react";
import { Copy, Heart, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useFavorites, type FavoriteKind } from "@/lib/storage";
import { AuthPromptModal } from "@/components/AuthPromptModal";

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
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <div className="flex items-center gap-0.5">
      <Button
        variant="ghost"
        size="icon"
        className={compact ? "size-7" : ""}
        aria-label={fav ? "Remover dos favoritos" : "Favoritar"}
        onClick={async () => {
          if (!userId) {
            setAuthModalOpen(true);
            return;
          }
          const added = await toggle({ id, kind, title, text, href });
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

      <AuthPromptModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        title="Salve seus versículos favoritos"
        description="Para salvar versículos e acessar sua lista personalizada em qualquer celular ou computador, crie sua conta gratuita."
        nextUrl={typeof window !== "undefined" ? window.location.pathname + window.location.hash : href}
        icon="❤️"
      />
    </div>
  );
}
