import { useCallback, useEffect, useState } from "react";

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

export function useFavorites() {
  const [items, setItems] = useState<FavoriteItem[]>([]);

  const refresh = useCallback(() => setItems(read<FavoriteItem[]>(FAVORITES_KEY, [])), []);

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener("bo:storage", handler);
    return () => window.removeEventListener("bo:storage", handler);
  }, [refresh]);

  const toggle = useCallback((item: Omit<FavoriteItem, "createdAt">) => {
    const current = read<FavoriteItem[]>(FAVORITES_KEY, []);
    const exists = current.some((i) => i.id === item.id);
    const next = exists
      ? current.filter((i) => i.id !== item.id)
      : [{ ...item, createdAt: Date.now() }, ...current];
    write(FAVORITES_KEY, next);
    return !exists;
  }, []);

  const remove = useCallback((id: string) => {
    write(FAVORITES_KEY, read<FavoriteItem[]>(FAVORITES_KEY, []).filter((i) => i.id !== id));
  }, []);

  const isFavorite = useCallback((id: string) => items.some((i) => i.id === id), [items]);

  return { items, toggle, remove, isFavorite };
}

export interface ReadingProgress {
  bookSlug: string;
  bookName: string;
  chapter: number;
  at: number;
}

export function saveProgress(p: Omit<ReadingProgress, "at">) {
  const history = read<ReadingProgress[]>(PROGRESS_KEY, []).filter(
    (h) => !(h.bookSlug === p.bookSlug && h.chapter === p.chapter),
  );
  write(PROGRESS_KEY, [{ ...p, at: Date.now() }, ...history].slice(0, 50));
}

export function useProgress() {
  const [history, setHistory] = useState<ReadingProgress[]>([]);
  useEffect(() => {
    const refresh = () => setHistory(read<ReadingProgress[]>(PROGRESS_KEY, []));
    refresh();
    window.addEventListener("bo:storage", refresh);
    return () => window.removeEventListener("bo:storage", refresh);
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
    [chapterKey],
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
