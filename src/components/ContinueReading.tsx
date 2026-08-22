import { Link } from "@tanstack/react-router";
import { BookMarked } from "lucide-react";
import { useProgress } from "@/lib/storage";
import { Button } from "@/components/ui/button";

export function ContinueReading() {
  const { last } = useProgress();
  if (!last) return null;

  return (
    <section className="surface flex flex-wrap items-center justify-between gap-3 p-4">
      <div className="flex items-center gap-3">
        <BookMarked className="size-5 text-gold" />
        <div>
          <p className="text-xs text-muted-foreground">Continue sua leitura</p>
          <p className="font-display text-lg font-semibold">
            {last.bookName} {last.chapter}
          </p>
        </div>
      </div>
      <Button asChild size="sm">
        <Link
          to="/biblia/$book/$chapter"
          params={{ book: last.bookSlug, chapter: String(last.chapter) }}
        >
          Continuar lendo
        </Link>
      </Button>
    </section>
  );
}
