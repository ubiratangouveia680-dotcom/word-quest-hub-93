import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { chapterQuery } from "@/lib/bible-queries";
import { getDailyRef } from "@/lib/daily-verse";
import { VerseActions } from "@/components/VerseActions";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function DailyVerseCard() {
  const ref = getDailyRef();
  const { data, isLoading } = useQuery(chapterQuery(ref.bookId, ref.chapter));
  const verse = data?.verses.find((v) => v.verse === ref.verse);
  const title = `${ref.bookName} ${ref.chapter}:${ref.verse}`;
  const href = `/biblia/${ref.bookSlug}/${ref.chapter}/${ref.verse}`;

  return (
    <section className="warm-panel p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold">Versículo do Dia</h2>
        <span className="text-xs text-muted-foreground">{title}</span>
      </div>
      <div className="gold-rule my-4" />
      {isLoading ? (
        <Skeleton className="h-16 w-full" />
      ) : (
        <blockquote className="reading-text italic">{verse?.text ?? "—"}</blockquote>
      )}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <VerseActions
          id={`verse:${ref.bookSlug}:${ref.chapter}:${ref.verse}`}
          kind="verse"
          title={title}
          text={verse?.text ?? ""}
          href={href}
        />
        <Button asChild variant="outline" size="sm">
          <Link to="/biblia/$book/$chapter" params={{ book: ref.bookSlug, chapter: String(ref.chapter) }}>
            Ler contexto
          </Link>
        </Button>
      </div>
    </section>
  );
}
