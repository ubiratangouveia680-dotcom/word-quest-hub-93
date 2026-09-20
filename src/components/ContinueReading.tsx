import { Link } from "@tanstack/react-router";
import { BookMarked, ArrowRight } from "lucide-react";
import { useProgress } from "@/lib/storage";
import { Button } from "@/components/ui/button";

export function ContinueReading() {
  const { last } = useProgress();

  if (last) {
    return (
      <section className="surface flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl border border-gold/30 bg-gold-soft/30">
        <div className="flex items-center gap-3.5">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold">
            <BookMarked className="size-5" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-gold">
              Continue sua leitura
            </span>
            <p className="mt-0.5 font-display text-lg font-semibold text-foreground">
              Você estava lendo {last.bookName} {last.chapter}
            </p>
          </div>
        </div>
        <Button asChild size="sm" className="h-9 px-4 text-xs font-semibold shrink-0">
          <Link
            to="/biblia/$book/$chapter"
            params={{ book: last.bookSlug, chapter: String(last.chapter) }}
          >
            Continuar leitura <ArrowRight className="ml-1.5 size-3.5" />
          </Link>
        </Button>
      </section>
    );
  }

  return (
    <section className="surface flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl border border-border/80">
      <div className="flex items-center gap-3.5">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <BookMarked className="size-5" />
        </div>
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Continue sua leitura
          </span>
          <p className="mt-0.5 font-display text-base sm:text-lg font-semibold text-foreground">
            Comece sua leitura da Bíblia
          </p>
        </div>
      </div>
      <Button asChild size="sm" variant="outline" className="h-9 px-4 text-xs font-semibold shrink-0">
        <Link
          to="/biblia/$book/$chapter"
          params={{ book: "joao", chapter: "1" }}
        >
          Começar agora <ArrowRight className="ml-1.5 size-3.5" />
        </Link>
      </Button>
    </section>
  );
}


