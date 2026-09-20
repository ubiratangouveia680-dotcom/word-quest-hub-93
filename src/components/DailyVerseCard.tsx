import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Heart, Share2 } from "lucide-react";
import { toast } from "sonner";
import { chapterQuery } from "@/lib/bible-queries";
import { getDailyRef } from "@/lib/daily-verse";
import { useFavorites } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function DailyVerseCard() {
  const ref = getDailyRef();
  const { data, isLoading } = useQuery(chapterQuery(ref.bookId, ref.chapter));
  const verse = data?.verses.find((v) => v.verse === ref.verse);
  const title = `${ref.bookName} ${ref.chapter}:${ref.verse}`;
  const href = `/biblia/${ref.bookSlug}/${ref.chapter}/${ref.verse}`;
  const chapterHref = `/biblia/${ref.bookSlug}/${ref.chapter}`;

  const { toggle, isFavorite, userId } = useFavorites();
  const favId = `verse:${ref.bookSlug}:${ref.chapter}:${ref.verse}`;
  const fav = isFavorite(favId);

  const handleFavorite = async () => {
    const added = await toggle({
      id: favId,
      kind: "verse",
      title,
      text: verse?.text ?? "",
      href,
    });
    if (added) {
      toast.success(userId ? "Versículo adicionado aos favoritos!" : "Versículo salvo nos favoritos do navegador!");
    } else {
      toast.info("Versículo removido dos favoritos.");
    }
  };

  const handleShare = async () => {
    const text = verse?.text ?? "";
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const shareUrl = `${origin}${href}`;
    const payload = {
      title: `Versículo do Dia — ${title}`,
      text: `"${text}" — ${title}\n\nLeia na Bíblia Online:\n${shareUrl}`,
      url: shareUrl,
    };

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(payload);
        return;
      } catch {
        // Ignora se o usuário cancelou o compartilhamento nativo
        return;
      }
    }

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(`"${text}" — ${title}\n\n${shareUrl}`);
        toast.success("Versículo copiado para a área de transferência!");
      } catch {
        toast.error("Não foi possível copiar o versículo.");
      }
    }
  };

  return (
    <article className="warm-panel rounded-2xl p-4 sm:p-7 border border-gold/30 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3.5">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-gold">
          ✨ Versículo do Dia
        </span>
        <span className="font-display text-sm sm:text-base font-bold text-foreground">
          {title}
        </span>
      </div>

      <div className="py-4 sm:py-5">
        <blockquote className="reading-text text-base sm:text-lg italic text-foreground leading-relaxed">
          "{verse?.text || ref.text || "Carregando o versículo do dia..."}"
        </blockquote>
      </div>

      <div className="flex min-w-0 flex-col gap-3 border-t border-border/50 pt-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid min-w-0 grid-cols-2 gap-2 xs:flex xs:flex-wrap xs:items-center">
          {/* Botão Ler capítulo */}
          <Button asChild size="sm" className="h-11 px-3 text-xs font-semibold xs:h-9 xs:flex-initial sm:px-4">
            <Link
              to="/biblia/$book/$chapter"
              params={{ book: ref.bookSlug, chapter: String(ref.chapter) }}
            >
              <BookOpen className="mr-1.5 size-3.5" /> Ler capítulo
            </Link>
          </Button>

          {/* Botão Favoritar */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleFavorite}
            className={`h-11 px-3 text-xs font-medium transition-colors xs:h-9 xs:flex-initial sm:px-3.5 ${
              fav ? "border-destructive/40 text-destructive bg-destructive/5" : ""
            }`}
          >
            <Heart className={`mr-1.5 size-3.5 ${fav ? "fill-destructive text-destructive" : ""}`} />
            <span>{fav ? "Favoritado" : "Favoritar"}</span>
          </Button>

          {/* Botão Compartilhar */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="col-span-2 h-11 px-3 text-xs font-medium xs:col-span-1 xs:h-9 xs:flex-initial sm:px-3.5"
          >
            <Share2 className="mr-1.5 size-3.5 text-muted-foreground" />
            <span>Compartilhar</span>
          </Button>
        </div>

        <Link
          to="/versiculo-do-dia"
          className="inline-flex min-h-11 items-center self-end text-xs font-semibold text-primary hover:underline sm:min-h-0 sm:self-auto sm:ml-auto"
        >
          Ver reflexão completa →
        </Link>
      </div>
    </article>
  );
}

