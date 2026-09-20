import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type FavoriteKind = "verse" | "study" | "devotional" | "prayer";

export interface FavoriteItem {
  id: string;
  kind: FavoriteKind;
  title: string;
  text?: string;
  href: string;
  createdAt: number;
}

const FAVORITES_KEY = "bo:favorites";
const PROGRESS_KEY = "bo:progress";
const NOTES_KEY = "bo:notes";
const SETTINGS_KEY = "bo:settings";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent("bo:storage", { detail: key }));
  } catch {
    /* ignore */
  }
}

function parseBookChapterVerse(item: Omit<FavoriteItem, "createdAt">) {
  let book = "biblia";
  let chapter = 1;
  let verse: number | null = null;

  try {
    const cleanHref = item.href.replace(/^\//, "");
    const parts = cleanHref.split("/");
    if (parts[0] === "biblia" && parts[1]) {
      book = parts[1];
      if (parts[2]) {
        const chapterPart = parts[2].split("#")[0] ?? "1";
        chapter = parseInt(chapterPart, 10) || 1;
      }
    }
    if (item.href.includes("#v")) {
      const vStr = item.href.split("#v")[1];
      if (vStr) verse = parseInt(vStr, 10) || null;
    }
  } catch {
    // fallback
  }

  return { book, chapter, verse };
}

export function useFavorites() {
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchRemoteFavorites = useCallback(async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from("favorites")
        .select("*")
        .eq("user_id", uid)
        .order("created_at", { ascending: false });

      if (!error && data) {
        const mapped: FavoriteItem[] = data.map((row) => ({
          id: row.reference || row.id,
          kind: "verse",
          title: row.reference,
          ...(row.text ? { text: row.text } : {}),
          href: `/biblia/${row.book}/${row.chapter}${row.verse ? `#v${row.verse}` : ""}`,
          createdAt: new Date(row.created_at).getTime(),
        }));
        setItems(mapped);
        write(FAVORITES_KEY, mapped);
        return;
      }
    } catch {
      // fallback to local
    }
    setItems(read<FavoriteItem[]>(FAVORITES_KEY, []));
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const uid = session?.user?.id ?? null;
      setUserId(uid);
      if (uid) {
        fetchRemoteFavorites(uid);
      } else {
        setItems(read<FavoriteItem[]>(FAVORITES_KEY, []));
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const uid = session?.user?.id ?? null;
      setUserId(uid);
      if (uid) {
        fetchRemoteFavorites(uid);
      } else {
        setItems(read<FavoriteItem[]>(FAVORITES_KEY, []));
      }
    });

    const localHandler = () => {
      if (!userId) {
        setItems(read<FavoriteItem[]>(FAVORITES_KEY, []));
      }
    };
    window.addEventListener("bo:storage", localHandler);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("bo:storage", localHandler);
    };
  }, [fetchRemoteFavorites, userId]);

  const toggle = useCallback(
    async (item: Omit<FavoriteItem, "createdAt">): Promise<boolean> => {
      const current = items;
      const exists = current.some((i) => i.id === item.id || i.title === item.title);

      if (exists) {
        // Remover
        const next = current.filter((i) => i.id !== item.id && i.title !== item.title);
        setItems(next);
        write(FAVORITES_KEY, next);

        if (userId) {
          try {
            await supabase
              .from("favorites")
              .delete()
              .eq("user_id", userId)
              .or(`reference.eq."${item.title}",id.eq."${item.id}"`);
          } catch (err) {
            console.error("Erro ao remover favorito no Supabase:", err);
          }
        }
        return false;
      } else {
        // Adicionar
        const newItem: FavoriteItem = { ...item, createdAt: Date.now() };
        const next = [newItem, ...current];
        setItems(next);
        write(FAVORITES_KEY, next);

        if (userId) {
          const { book, chapter, verse } = parseBookChapterVerse(item);
          try {
            await supabase.from("favorites").upsert(
              {
                user_id: userId,
                book,
                chapter,
                verse,
                reference: item.title,
                text: item.text || null,
              },
              { onConflict: "user_id,reference" }
            );
          } catch (err) {
            console.error("Erro ao salvar favorito no Supabase:", err);
          }
        }
        return true;
      }
    },
    [items, userId]
  );

  const remove = useCallback(
    async (idOrTitle: string) => {
      const next = items.filter((i) => i.id !== idOrTitle && i.title !== idOrTitle);
      setItems(next);
      write(FAVORITES_KEY, next);

      if (userId) {
        try {
          await supabase
            .from("favorites")
            .delete()
            .eq("user_id", userId)
            .or(`reference.eq."${idOrTitle}",id.eq."${idOrTitle}"`);
        } catch (err) {
          console.error("Erro ao remover favorito remoto:", err);
        }
      }
    },
    [items, userId]
  );

  const isFavorite = useCallback(
    (idOrTitle: string) => items.some((i) => i.id === idOrTitle || i.title === idOrTitle),
    [items]
  );

  return { items, toggle, remove, isFavorite, userId };
}

export interface ReadingProgress {
  bookSlug: string;
  bookName: string;
  chapter: number;
  at: number;
}

export function saveProgress(p: Omit<ReadingProgress, "at">) {
  const history = read<ReadingProgress[]>(PROGRESS_KEY, []).filter(
    (h) => !(h.bookSlug === p.bookSlug && h.chapter === p.chapter)
  );
  const next = [{ ...p, at: Date.now() }, ...history].slice(0, 50);
  write(PROGRESS_KEY, next);

  // Sincronizar com o Supabase se logado
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session?.user) {
      supabase
        .from("reading_history")
        .upsert(
          {
            user_id: session.user.id,
            book: p.bookSlug,
            chapter: p.chapter,
            verse: null,
            reference: `${p.bookName} ${p.chapter}`,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id,book,chapter" }
        )
        .then(({ error }) => {
          if (error) console.warn("Histórico remoto não pôde ser salvo:", error.message);
        });
    }
  });
}

export function useProgress() {
  const [history, setHistory] = useState<ReadingProgress[]>([]);

  useEffect(() => {
    let active = true;

    const fetchHistory = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        try {
          const { data, error } = await supabase
            .from("reading_history")
            .select("*")
            .eq("user_id", session.user.id)
            .order("updated_at", { ascending: false })
            .limit(50);

          if (!error && data && data.length > 0 && active) {
            const mapped: ReadingProgress[] = data.map((row) => ({
              bookSlug: row.book,
              bookName: row.reference.replace(/\s+\d+$/, ""),
              chapter: row.chapter,
              at: new Date(row.updated_at || row.created_at).getTime(),
            }));
            setHistory(mapped);
            write(PROGRESS_KEY, mapped);
            return;
          }
        } catch {
          // fallback to local
        }
      }
      if (active) {
        setHistory(read<ReadingProgress[]>(PROGRESS_KEY, []));
      }
    };

    fetchHistory();

    const refresh = () => setHistory(read<ReadingProgress[]>(PROGRESS_KEY, []));
    window.addEventListener("bo:storage", refresh);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchHistory();
    });

    return () => {
      active = false;
      subscription.unsubscribe();
      window.removeEventListener("bo:storage", refresh);
    };
  }, []);

  return { history, last: history[0] };
}

export function useNotes(chapterKey: string) {
  const [notes, setNotes] = useState<Record<string, string>>({});
  useEffect(() => {
    const all = read<Record<string, Record<string, string>>>(NOTES_KEY, {});
    setNotes(all[chapterKey] ?? {});
  }, [chapterKey]);

  const setNote = useCallback(
    (verse: string, value: string) => {
      const all = read<Record<string, Record<string, string>>>(NOTES_KEY, {});
      const chapterNotes = { ...(all[chapterKey] ?? {}) };
      if (value.trim()) chapterNotes[verse] = value;
      else delete chapterNotes[verse];
      write(NOTES_KEY, { ...all, [chapterKey]: chapterNotes });
      setNotes(chapterNotes);
    },
    [chapterKey]
  );

  return { notes, setNote };
}

export type FontSize = "sm" | "base" | "lg" | "xl";
export interface Settings {
  theme: "light" | "dark";
  fontSize: FontSize;
}

export const DEFAULT_SETTINGS: Settings = { theme: "light", fontSize: "base" };

export function readSettings(): Settings {
  return { ...DEFAULT_SETTINGS, ...read<Partial<Settings>>(SETTINGS_KEY, {}) };
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const refresh = () => setSettings(readSettings());
    refresh();
    window.addEventListener("bo:storage", refresh);
    return () => window.removeEventListener("bo:storage", refresh);
  }, []);

  const update = useCallback((patch: Partial<Settings>) => {
    const next = { ...readSettings(), ...patch };
    write(SETTINGS_KEY, next);
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", next.theme === "dark");
    }
  }, []);

  return { settings, update };
}
