import { createServerFn } from "@tanstack/react-start";

export interface Verse {
  verse: number;
  text: string;
}

export interface ChapterData {
  bookId: string;
  bookName: string;
  chapter: number;
  verses: Verse[];
  translation: string;
}

export const getChapter = createServerFn({ method: "GET" })
  .inputValidator((data: { bookId: string; chapter: number }) => ({
    bookId: String(data.bookId).toUpperCase().slice(0, 3),
    chapter: Math.max(1, Math.floor(Number(data.chapter) || 1)),
  }))
  .handler(async ({ data }): Promise<ChapterData> => {
    const res = await fetch(
      `https://bible-api.com/data/almeida/${data.bookId}/${data.chapter}`,
      { headers: { accept: "application/json" } },
    );
    if (!res.ok) throw new Error("Capítulo não encontrado");
    const json = (await res.json()) as {
      translation: { name: string };
      verses: { book: string; chapter: number; verse: number; text: string }[];
    };
    return {
      bookId: data.bookId,
      bookName: json.verses[0]?.book ?? "",
      chapter: data.chapter,
      translation: json.translation?.name ?? "Edição Almeida (Bible API)",
      verses: json.verses.map((v) => ({ verse: v.verse, text: v.text.trim().replace(/\s+/g, " ") })),
    };
  });

export const searchBible = createServerFn({ method: "GET" })
  .inputValidator((data: { q: string }) => ({ q: String(data.q ?? "").slice(0, 120) }))
  .handler(async ({ data }) => {
    if (!data.q.trim()) return { reference: "", verses: [] as { book: string; chapter: number; verse: number; text: string }[] };
    const res = await fetch(
      `https://bible-api.com/${encodeURIComponent(data.q)}?translation=almeida`,
      { headers: { accept: "application/json" } },
    );
    if (!res.ok) return { reference: "", verses: [] };
    const json = (await res.json()) as {
      reference?: string;
      verses?: { book_name: string; chapter: number; verse: number; text: string }[];
    };
    return {
      reference: json.reference ?? "",
      verses: (json.verses ?? []).map((v) => ({
        book: v.book_name,
        chapter: v.chapter,
        verse: v.verse,
        text: v.text.trim().replace(/\s+/g, " "),
      })),
    };
  });
