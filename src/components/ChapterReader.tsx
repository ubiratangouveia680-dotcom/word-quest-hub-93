import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, NotebookPen, Pause, Play, Sparkles, Square, Volume2, BookOpen } from "lucide-react";
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

type AudioStatus = "checking" | "idle" | "speaking" | "paused" | "unsupported";

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
  const [audioStatus, setAudioStatus] = useState<AudioStatus>("checking");
  const [spokenVerse, setSpokenVerse] = useState(0);
  const speechSession = useRef(0);

  const stopReading = () => {
    speechSession.current += 1;
    window.speechSynthesis.cancel();
    setAudioStatus("idle");
    setSpokenVerse(0);
  };

  const speakVerse = (index: number, session: number) => {
    const verse = data.verses[index];
    if (!verse || session !== speechSession.current) {
      setAudioStatus("idle");
      setSpokenVerse(0);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(`${verse.verse}. ${verse.text}`);
    utterance.lang = "pt-BR";
    utterance.rate = 0.95;
    const portugueseVoice = window.speechSynthesis
      .getVoices()
      .find((voice) => voice.lang.toLowerCase().startsWith("pt"));
    if (portugueseVoice) utterance.voice = portugueseVoice;
    utterance.onstart = () => {
      if (session === speechSession.current) {
        setAudioStatus("speaking");
        setSpokenVerse(index + 1);
      }
    };
    utterance.onend = () => {
      if (session === speechSession.current) speakVerse(index + 1, session);
    };
    utterance.onerror = () => {
      if (session === speechSession.current) {
        setAudioStatus("idle");
        setSpokenVerse(0);
      }
    };
    window.speechSynthesis.speak(utterance);
  };

  const toggleReading = () => {
    if (audioStatus === "paused") {
      window.speechSynthesis.resume();
      setAudioStatus("speaking");
      return;
    }
    if (audioStatus === "speaking") {
      window.speechSynthesis.pause();
      setAudioStatus("paused");
      return;
    }

    window.speechSynthesis.cancel();
    speechSession.current += 1;
    const session = speechSession.current;
    speakVerse(0, session);
  };

  useEffect(() => {
    saveProgress({ bookSlug: book.slug, bookName: book.name, chapter });
  }, [book.slug, book.name, chapter]);

  useEffect(() => {
    if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
      setAudioStatus("unsupported");
      return;
    }
    setAudioStatus("idle");
    return () => {
      speechSession.current += 1;
      window.speechSynthesis.cancel();
    };
  }, [book.slug, chapter]);

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
        <h1 className="font-display text-2xl sm:text-3xl font-semibold">
          {book.name} {chapter}
        </h1>
        <FontSizeControls />
      </div>
      {(prev || next) && (
        <nav aria-label="Navegação rápida do capítulo" className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
          {prev && (
            <Link
              to="/biblia/$book/$chapter"
              params={{ book: prev.book, chapter: String(prev.chapter) }}
              className="hover:text-gold transition-colors inline-flex items-center gap-1 font-medium"
            >
              ← {BIBLE_BOOKS.find((b) => b.slug === prev.book)?.name ?? prev.book} {prev.chapter}
            </Link>
          )}
          {prev && next && <span className="text-border">|</span>}
          {next && (
            <Link
              to="/biblia/$book/$chapter"
              params={{ book: next.book, chapter: String(next.chapter) }}
              className="hover:text-gold transition-colors inline-flex items-center gap-1 font-medium"
            >
              {BIBLE_BOOKS.find((b) => b.slug === next.book)?.name ?? next.book} {next.chapter} →
            </Link>
          )}
        </nav>
      )}
      <p className="mt-1 text-xs text-muted-foreground">
        Texto bíblico disponibilizado através da Bible API. Verifique sempre o contexto canônico.
      </p>
      {audioStatus === "unsupported" ? (
        <p className="mt-3 text-sm text-muted-foreground" role="status">
          A leitura em voz alta não está disponível neste navegador.
        </p>
      ) : audioStatus !== "checking" ? (
        <div className="mt-3 flex min-h-10 flex-wrap items-center gap-2" aria-live="polite">
          <Button variant="outline" size="sm" onClick={toggleReading} className="h-9 text-xs sm:text-sm">
            {audioStatus === "speaking" ? (
              <Pause className="mr-1.5 size-4" />
            ) : audioStatus === "paused" ? (
              <Play className="mr-1.5 size-4" />
            ) : (
              <Volume2 className="mr-1.5 size-4" />
            )}
            {audioStatus === "speaking" ? "Pausar" : audioStatus === "paused" ? "Continuar" : "Ouvir capítulo"}
          </Button>
          {(audioStatus === "speaking" || audioStatus === "paused") && (
            <>
              <Button variant="ghost" size="icon" aria-label="Parar leitura" onClick={stopReading} className="size-9">
                <Square className="size-4" />
              </Button>
              <span className="text-xs text-muted-foreground">
                {audioStatus === "paused" ? "Pausado" : "Lendo"} · versículo {spokenVerse} de {data.verses.length}
              </span>
            </>
          )}
        </div>
      ) : null}
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
              <div className="mt-1 flex items-center gap-1.5 opacity-80 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
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
                  className="size-8 sm:size-7"
                  aria-label="Anotar"
                  onClick={() => setOpenNote(openNote === v.verse ? null : v.verse)}
                >
                  <NotebookPen className={`size-3.5 ${notes[String(v.verse)] ? "text-gold" : ""}`} />
                </Button>
                <Button variant="ghost" size="icon" className="size-8 sm:size-7" aria-label="Explicar com IA" asChild>
                  <Link to="/pergunte" search={{ q: `Explique ${title}` }}>
                    <Sparkles className="size-3.5" />
                  </Link>
                </Button>
              </div>
              {openNote === v.verse && (
                <Textarea
                  className="mt-2 text-sm"
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

      <nav aria-label="Navegação entre capítulos" className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
        {prev ? (
          <Button asChild variant="outline" className="h-10 text-xs sm:text-sm">
            <Link to="/biblia/$book/$chapter" params={{ book: prev.book, chapter: String(prev.chapter) }}>
              <ChevronLeft className="mr-1 size-4" />
              <span className="sm:hidden">Cap. anterior ({prev.chapter})</span>
              <span className="hidden sm:inline">Capítulo anterior ({prev.chapter})</span>
            </Link>
          </Button>
        ) : (
          <span className="hidden sm:inline-block" />
        )}

        <Button asChild variant="ghost" className="h-10 text-xs sm:text-sm text-gold hover:text-gold/90 hover:bg-gold/10">
          <Link to="/biblia/$book" params={{ book: book.slug }}>
            <BookOpen className="mr-1.5 size-4" />
            <span>Índice de {book.name}</span>
          </Link>
        </Button>

        {next ? (
          <Button asChild variant="outline" className="h-10 text-xs sm:text-sm ml-auto sm:ml-0">
            <Link to="/biblia/$book/$chapter" params={{ book: next.book, chapter: String(next.chapter) }}>
              <span className="sm:hidden">Próx. capítulo ({next.chapter})</span>
              <span className="hidden sm:inline">Próximo capítulo ({next.chapter})</span>
              <ChevronRight className="ml-1 size-4" />
            </Link>
          </Button>
        ) : (
          <span className="hidden sm:inline-block" />
        )}
      </nav>
    </article>
  );
}
