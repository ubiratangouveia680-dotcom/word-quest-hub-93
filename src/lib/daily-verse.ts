export interface DailyRef {
  bookSlug: string;
  bookId: string;
  bookName: string;
  chapter: number;
  verse: number;
}

export const DAILY_REFS: DailyRef[] = [
  { bookSlug: "joao", bookId: "JHN", bookName: "João", chapter: 3, verse: 16 },
  { bookSlug: "salmos", bookId: "PSA", bookName: "Salmos", chapter: 23, verse: 1 },
  { bookSlug: "filipenses", bookId: "PHP", bookName: "Filipenses", chapter: 4, verse: 13 },
  { bookSlug: "isaias", bookId: "ISA", bookName: "Isaías", chapter: 41, verse: 10 },
  { bookSlug: "romanos", bookId: "ROM", bookName: "Romanos", chapter: 8, verse: 28 },
  { bookSlug: "josue", bookId: "JOS", bookName: "Josué", chapter: 1, verse: 9 },
  { bookSlug: "proverbios", bookId: "PRO", bookName: "Provérbios", chapter: 3, verse: 5 },
  { bookSlug: "mateus", bookId: "MAT", bookName: "Mateus", chapter: 11, verse: 28 },
  { bookSlug: "salmos", bookId: "PSA", bookName: "Salmos", chapter: 46, verse: 1 },
  { bookSlug: "1-pedro", bookId: "1PE", bookName: "1 Pedro", chapter: 5, verse: 7 },
  { bookSlug: "jeremias", bookId: "JER", bookName: "Jeremias", chapter: 29, verse: 11 },
  { bookSlug: "salmos", bookId: "PSA", bookName: "Salmos", chapter: 119, verse: 105 },
  { bookSlug: "hebreus", bookId: "HEB", bookName: "Hebreus", chapter: 11, verse: 1 },
  { bookSlug: "galatas", bookId: "GAL", bookName: "Gálatas", chapter: 5, verse: 22 },
  { bookSlug: "1-corintios", bookId: "1CO", bookName: "1 Coríntios", chapter: 13, verse: 4 },
  { bookSlug: "efesios", bookId: "EPH", bookName: "Efésios", chapter: 2, verse: 8 },
  { bookSlug: "salmos", bookId: "PSA", bookName: "Salmos", chapter: 91, verse: 1 },
  { bookSlug: "tiago", bookId: "JAS", bookName: "Tiago", chapter: 1, verse: 5 },
  { bookSlug: "colossenses", bookId: "COL", bookName: "Colossenses", chapter: 3, verse: 23 },
  { bookSlug: "salmos", bookId: "PSA", bookName: "Salmos", chapter: 37, verse: 5 },
  { bookSlug: "miqueias", bookId: "MIC", bookName: "Miquéias", chapter: 6, verse: 8 },
  { bookSlug: "joao", bookId: "JHN", bookName: "João", chapter: 14, verse: 27 },
  { bookSlug: "lamentacoes", bookId: "LAM", bookName: "Lamentações", chapter: 3, verse: 22 },
  { bookSlug: "romanos", bookId: "ROM", bookName: "Romanos", chapter: 12, verse: 2 },
  { bookSlug: "salmos", bookId: "PSA", bookName: "Salmos", chapter: 34, verse: 18 },
  { bookSlug: "2-corintios", bookId: "2CO", bookName: "2 Coríntios", chapter: 12, verse: 9 },
  { bookSlug: "sofonias", bookId: "ZEP", bookName: "Sofonias", chapter: 3, verse: 17 },
  { bookSlug: "provérbios" === "" ? "" : "proverbios", bookId: "PRO", bookName: "Provérbios", chapter: 16, verse: 3 },
  { bookSlug: "1-joao", bookId: "1JN", bookName: "1 João", chapter: 4, verse: 19 },
  { bookSlug: "apocalipse", bookId: "REV", bookName: "Apocalipse", chapter: 21, verse: 4 },
  { bookSlug: "deuteronomio", bookId: "DEU", bookName: "Deuteronômio", chapter: 31, verse: 6 },
];

export function dayIndex(date = new Date()): number {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const diff = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) - start;
  return Math.floor(diff / 86400000);
}

export function getDailyRef(date = new Date()): DailyRef {
  return DAILY_REFS[dayIndex(date) % DAILY_REFS.length];
}
