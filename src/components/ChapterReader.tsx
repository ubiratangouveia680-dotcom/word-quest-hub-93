import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, NotebookPen, Sparkles } from "lucide-react";
import { chapterQuery } from "@/lib/bible-queries";
import { BIBLE_BOOKS, type BibleBook } from "@/lib/bible-books";
import { VerseActions } from "@/components/VerseActions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { saveProgress, useNotes, useSettings, type FontSize } from "@/lib/storage";
import { AdEndOfChapter, AdMobile } from "@/components/Ads";

const SIZES: { key: FontSize; label: string }[] = [
  { key: "sm", label: "Pequena" },
  { key: "base", label: "Normal" },
  { key: "lg", label: "Grande" },
  { key: "xl", label: "Muito grande" },
];

export function FontSizeControls() {
  const { settings, update } = useSettings();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const idx = SIZES.findIndex((s) => s.key === settings.fontSize);
  const setIdx = (i: number) => {
    const next = SIZES[Math.min(SIZES.length - 1, Math.max(0, i))]!;
    update({ fontSize: next.key });
    document.documentElement.setAttribute("data-font", next.key);
  };

  return (
    <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
      <Button variant="ghost" size="sm" aria-label="Diminuir fonte" onClick={() => setIdx(idx - 1)}>
        A−
      </Button>
      <span className="min-w-16 text-center text-xs text-muted-foreground">
        {mounted ? SIZES[idx]?.label ?? "Normal" : "Normal"}
      </span>
      <Button variant="ghost" size="sm" aria-label="Aumentar fonte" onClick={() => setIdx(idx + 1)}>
        A+
      </Button>
    </div>
  );
}

export function ChapterReader({
  book,
  chapter,
  highlight,
}: {
  book: BibleBook;
  chapter: number;
  highlight?: number;
}) {
  const { data } = useSuspenseQuery(chapterQuery(book.id, chapter));
  const chapterKey = `${book.slug}:${chapter}`;
  const { notes, setNote } = useNotes(chapterKey);
  const [openNote, setOpenNote] = useState<number | null>(null);

  useEffect(() => {
    saveProgress({ bookSlug: book.slug, bookName: book.name, chapter });
  }, [book.slug, book.name, chapter]);

  const bookIdx = BIBLE_BOOKS.findIndex((b) => b.slug === book.slug);
  const prev =
    chapter > 1
      ? { book: book.slug, chapter: chapter - 1 }
      : bookIdx > 0
        ? { book: BIBLE_BOOKS[bookIdx - 1]!.slug, chapter: BIBLE_BOOKS[bookIdx - 1]!.chapters }
        : null;
  const next =
    chapter < book.chapters
      ? { book: book.slug, chapter: chapter + 1 }
      : bookIdx < BIBLE_BOOKS.length - 1
        ? { book: BIBLE_BOOKS[bookIdx + 1]!.slug, chapter: 1 }
        : null;

  return (
    <article>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-semibold">
          {book.name} {chapter}
        </h1>
        <FontSizeControls />
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Tradução João Ferreira de Almeida — domínio público
      </p>
      <div className="gold-rule my-5" />

      <div className="space-y-1">
        {data.verses.map((v) => {
          const title = `${book.name} ${chapter}:${v.verse}`;
          const href = `/biblia/${book.slug}/${chapter}/${v.verse}`;
          const isHighlight = highlight === v.verse;
          return (
            <div
              key={v.verse}
              id={`v${v.verse}`}
              className={`group rounded-lg px-2 py-1.5 transition-colors ${
                isHighlight ? "bg-gold-soft" : "hover:bg-accent/40"
              }`}
            >
              <p className="reading-text">
                <Link
                  to="/biblia/$book/$chapter/$verse"
                  params={{ book: book.slug, chapter: String(chapter), verse: String(v.verse) }}
                  className="mr-1.5 align-super text-xs font-semibold text-gold"
                >
                  {v.verse}
                </Link>
                {v.text}
              </p>
              <div className="mt-1 flex items-center gap-1 opacity-70 transition-opacity group-hover:opacity-100">
                <VerseActions
                  id={`verse:${book.slug}:${chapter}:${v.verse}`}
                  kind="verse"
                  title={title}
                  text={v.text}
                  href={href}
                  compact
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  aria-label="Anotar"
                  onClick={() => setOpenNote(openNote === v.verse ? null : v.verse)}
                >
                  <NotebookPen className={`size-3.5 ${notes[String(v.verse)] ? "text-gold" : ""}`} />
                </Button>
                <Button variant="ghost" size="icon" className="size-7" aria-label="Explicar com IA" asChild>
                  <Link to="/pergunte" search={{ q: `Explique ${title}` }}>
                    <Sparkles className="size-3.5" />
                  </Link>
                </Button>
              </div>
              {openNote === v.verse && (
                <Textarea
                  className="mt-2"
                  placeholder="Sua anotação sobre este versículo..."
                  defaultValue={notes[String(v.verse)] ?? ""}
                  onBlur={(e) => setNote(String(v.verse), e.target.value)}
                />
              )}
            </div>
          );
        })}
      </div>

      <AdMobile className="mt-8" />
      <AdEndOfChapter className="mt-6" />

      <nav className="mt-8 flex items-center justify-between gap-3">
        {prev ? (
          <Button asChild variant="outline">
            <Link to="/biblia/$book/$chapter" params={{ book: prev.book, chapter: String(prev.chapter) }}>
              <ChevronLeft className="mr-1 size-4" /> Capítulo anterior
            </Link>
          </Button>
        ) : (
          <span />
        )}
        {next && (
          <Button asChild variant="outline">
            <Link to="/biblia/$book/$chapter" params={{ book: next.book, chapter: String(next.chapter) }}>
              Próximo capítulo <ChevronRight className="ml-1 size-4" />
            </Link>
          </Button>
        )}
      </nav>
    </article>
  );
}
