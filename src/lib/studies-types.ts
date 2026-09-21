export type MaterialType = 'estudo' | 'escola-dominical' | 'apostila' | 'curso';
export type MaterialAudience = 'geral' | 'familia' | 'jovens' | 'infantil' | 'adultos';
export type MaterialLevel = 'basico' | 'intermediario' | 'avancado';
export type MaterialStatus = 'published' | 'draft';

export interface ReferenceVerse {
  ref: string;
  link: string;
  text: string;
}

export interface TopicItem {
  title: string;
  content: string;
  verseRef?: string;
}

export interface TableOfContentItem {
  id: string;
  title: string;
  description?: string;
  page?: number;
}

export interface BibleMaterial {
  id: string;
  slug: string;
  type: MaterialType;
  title: string;
  category: string;
  categorySlug: string;
  audience: MaterialAudience;
  level: MaterialLevel;
  bibleBook?: string | null;
  series?: string | null;
  lessonNumber?: number | null;
  author: string;
  coverUrl?: string | null;
  excerpt: string;
  mainVerse?: string | null;
  mainVerseRef?: string | null;
  objectives: string[];
  content: string;
  topics: TopicItem[];
  questions: string[];
  practicalApplication?: string | null;
  conclusion?: string | null;
  referenceVerses: ReferenceVerse[];
  tableOfContents: TableOfContentItem[];
  isDownloadable: boolean;
  status: MaterialStatus;
  createdAt: string;
  updatedAt: string;
}

export interface MaterialFilter {
  type?: MaterialType | 'todos';
  category?: string | 'todos';
  audience?: MaterialAudience | 'todos';
  level?: MaterialLevel | 'todos';
  bibleBook?: string | 'todos';
  searchQuery?: string;
}
