import { supabase } from '@/integrations/supabase/client';
import { BibleMaterial, MaterialFilter, MaterialType } from './studies-types';
import { INITIAL_MATERIALS } from './studies-seed';

function mapDbRowToMaterial(row: any): BibleMaterial {
  return {
    id: row.id,
    slug: row.slug,
    type: row.type as MaterialType,
    title: row.title,
    category: row.category,
    categorySlug: row.category_slug,
    audience: row.audience,
    level: row.level,
    bibleBook: row.bible_book,
    series: row.series,
    lessonNumber: row.lesson_number,
    author: row.author,
    coverUrl: row.cover_url,
    excerpt: row.excerpt,
    mainVerse: row.main_verse,
    mainVerseRef: row.main_verse_ref,
    objectives: row.objectives || [],
    content: row.content,
    topics: row.topics || [],
    questions: row.questions || [],
    practicalApplication: row.practical_application,
    conclusion: row.conclusion,
    referenceVerses: row.reference_verses || [],
    tableOfContents: row.table_of_contents || [],
    isDownloadable: row.is_downloadable ?? true,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapMaterialToDbRow(mat: Partial<BibleMaterial>) {
  return {
    slug: mat.slug,
    type: mat.type,
    title: mat.title,
    category: mat.category,
    category_slug: mat.categorySlug,
    audience: mat.audience || 'geral',
    level: mat.level || 'basico',
    bible_book: mat.bibleBook || null,
    series: mat.series || null,
    lesson_number: mat.lessonNumber || null,
    author: mat.author || 'Equipe Bíblia Online',
    cover_url: mat.coverUrl || null,
    excerpt: mat.excerpt,
    main_verse: mat.mainVerse || null,
    main_verse_ref: mat.mainVerseRef || null,
    objectives: mat.objectives || [],
    content: mat.content,
    topics: mat.topics || [],
    questions: mat.questions || [],
    practical_application: mat.practicalApplication || null,
    conclusion: mat.conclusion || null,
    reference_verses: mat.referenceVerses || [],
    table_of_contents: mat.tableOfContents || [],
    is_downloadable: mat.isDownloadable ?? true,
    status: mat.status || 'published',
    updated_at: new Date().toISOString(),
  };
}

/**
 * Busca todos os materiais de estudo (do Supabase com fallback/merge de conteúdos semente)
 */
export async function fetchAllMaterials(includeDrafts = false): Promise<BibleMaterial[]> {
  try {
    let query = (supabase as any)
      .from('bible_materials')
      .select('*')
      .order('created_at', { ascending: false });

    if (!includeDrafts) {
      query = query.eq('status', 'published');
    }

    const { data, error } = await query;

    if (!error && data && data.length > 0) {
      const dbMaterials = data.map(mapDbRowToMaterial);
      const dbSlugs = new Set(dbMaterials.map((m: BibleMaterial) => m.slug));
      // Mescla com sementes que ainda não foram salvas no banco
      const uniqueSeeds = INITIAL_MATERIALS.filter((s) => !dbSlugs.has(s.slug));
      return [...dbMaterials, ...uniqueSeeds];
    }
  } catch {
    // Caso a tabela ainda esteja sendo migrada ou ocorra falha de rede
  }

  // Fallback para conteúdo local completo e rico
  return includeDrafts
    ? INITIAL_MATERIALS
    : INITIAL_MATERIALS.filter((m) => m.status === 'published');
}

/**
 * Busca um material pelo slug
 */
export async function fetchMaterialBySlug(slug: string): Promise<BibleMaterial | null> {
  try {
    const { data, error } = await (supabase as any)
      .from('bible_materials')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (!error && data) {
      return mapDbRowToMaterial(data);
    }
  } catch {
    // ignora e tenta no fallback
  }

  // Fallback nos dados locais
  const local = INITIAL_MATERIALS.find((m) => m.slug === slug);
  return local || null;
}

/**
 * Busca materiais relacionados por categoria ou tema
 */
export function getRelatedMaterials(
  allMaterials: BibleMaterial[],
  currentSlug: string,
  category: string,
  limit = 3
): BibleMaterial[] {
  const sameCategory = allMaterials.filter(
    (m) => m.slug !== currentSlug && m.categorySlug === category && m.status === 'published'
  );
  if (sameCategory.length >= limit) {
    return sameCategory.slice(0, limit);
  }
  const others = allMaterials.filter(
    (m) => m.slug !== currentSlug && m.categorySlug !== category && m.status === 'published'
  );
  return [...sameCategory, ...others].slice(0, limit);
}

/**
 * Filtro em memória para respostas instantâneas na interface (celular e desktop)
 */
export function filterMaterials(
  materials: BibleMaterial[],
  filters: MaterialFilter
): BibleMaterial[] {
  return materials.filter((item) => {
    // Filtro por tipo
    if (filters.type && filters.type !== 'todos' && item.type !== filters.type) {
      return false;
    }

    // Filtro por categoria
    if (
      filters.category &&
      filters.category !== 'todos' &&
      item.categorySlug !== filters.category &&
      item.category !== filters.category
    ) {
      return false;
    }

    // Filtro por público
    if (filters.audience && filters.audience !== 'todos' && item.audience !== filters.audience) {
      return false;
    }

    // Filtro por nível
    if (filters.level && filters.level !== 'todos' && item.level !== filters.level) {
      return false;
    }

    // Filtro por livro da bíblia
    if (
      filters.bibleBook &&
      filters.bibleBook !== 'todos' &&
      item.bibleBook?.toLowerCase() !== filters.bibleBook.toLowerCase()
    ) {
      return false;
    }

    // Busca textual livre
    if (filters.searchQuery && filters.searchQuery.trim().length > 0) {
      const q = filters.searchQuery.toLowerCase().trim();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchExcerpt = item.excerpt.toLowerCase().includes(q);
      const matchCategory = item.category.toLowerCase().includes(q);
      const matchBook = item.bibleBook?.toLowerCase().includes(q) || false;
      const matchVerse = item.mainVerse?.toLowerCase().includes(q) || false;
      const matchAuthor = item.author.toLowerCase().includes(q);
      const matchContent = item.content.toLowerCase().includes(q);

      if (
        !matchTitle &&
        !matchExcerpt &&
        !matchCategory &&
        !matchBook &&
        !matchVerse &&
        !matchAuthor &&
        !matchContent
      ) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Funções Administrativas de CRUD
 */
export async function createBibleMaterial(material: Partial<BibleMaterial>): Promise<BibleMaterial> {
  const payload = mapMaterialToDbRow(material);
  const { data, error } = await (supabase as any)
    .from('bible_materials')
    .insert([payload])
    .select()
    .single();

  if (error) {
    throw new Error(`Erro ao criar material bíblico: ${error.message}`);
  }

  return mapDbRowToMaterial(data);
}

export async function updateBibleMaterial(id: string, material: Partial<BibleMaterial>): Promise<BibleMaterial> {
  const payload = mapMaterialToDbRow(material);
  const { data, error } = await (supabase as any)
    .from('bible_materials')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Erro ao atualizar material bíblico: ${error.message}`);
  }

  return mapDbRowToMaterial(data);
}

export async function deleteBibleMaterial(id: string): Promise<void> {
  const { error } = await (supabase as any)
    .from('bible_materials')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Erro ao excluir material bíblico: ${error.message}`);
  }
}
