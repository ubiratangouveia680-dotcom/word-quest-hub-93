import { queryOptions } from "@tanstack/react-query";
import { getChapter, searchBible } from "./bible.functions";

export const chapterQuery = (bookId: string, chapter: number) =>
  queryOptions({
    queryKey: ["chapter", bookId, chapter],
    queryFn: () => getChapter({ data: { bookId, chapter } }),
    staleTime: 1000 * 60 * 60,
  });

export const searchQuery = (q: string) =>
  queryOptions({
    queryKey: ["bible-search", q],
    queryFn: () => searchBible({ data: { q } }),
    staleTime: 1000 * 60 * 10,
    enabled: q.trim().length > 0,
  });
