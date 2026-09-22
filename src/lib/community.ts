import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useGlobalOnlinePresence } from "@/lib/presence";
import { dispatchPrayerNotificationFallback } from "@/lib/user-notifications";
import { notifyNewPrayerRequest } from "@/lib/push.functions";

// Curated Christian reactions
export const CHRISTIAN_REACTIONS = [
  { emoji: "🙏", name: "Amém" },
  { emoji: "🙌", name: "Glória a Deus" },
  { emoji: "❤️", name: "Deus é amor" },
  { emoji: "🕊️", name: "Paz" },
  { emoji: "✝️", name: "Fé" },
  { emoji: "📖", name: "Palavra" },
  { emoji: "🔥", name: "Aleluia" },
  { emoji: "😊", name: "Deus abençoe" },
  { emoji: "👏", name: "Louvado seja" },
  { emoji: "💡", name: "Edificante" },
] as const;

// Quick inline emoji picker symbols
export const INLINE_EMOJIS = ["🙏", "❤️", "🕊️", "✝️", "🙌", "👏", "😊", "😢", "😄", "🔥", "📖", "💡", "⭐"] as const;

// Categorias canônicas da Comunidade Palavra Viva
export interface CommunityCategoryItem {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

export const COMMUNITY_CATEGORIES: CommunityCategoryItem[] = [
  { id: "oracao", name: "Pedido de oração", emoji: "🙏", description: "Compartilhe suas súplicas e receba orações dos irmãos" },
  { id: "biblia", name: "Versículo", emoji: "📖", description: "Passagens bíblicas que tocaram o seu coração" },
  { id: "fe", name: "Reflexão", emoji: "💭", description: "Pensamentos sobre a vida diária e a aplicação da Palavra" },
  { id: "vida-crista", name: "Testemunho", emoji: "❤️", description: "O que o Senhor tem feito e transformado em sua vida" },
  { id: "duvidas", name: "Pergunta", emoji: "❓", description: "Dúvidas sobre passagens bíblicas, história ou fé" },
  { id: "geral", name: "Devocional", emoji: "🌅", description: "Meditações para nutrir e edificar a comunhão diária" },
];

export function getCategoryMeta(categoryId: string): { name: string; emoji: string } {
  const found = COMMUNITY_CATEGORIES.find((c) => c.id === categoryId);
  if (found) return { name: found.name, emoji: found.emoji };
  if (categoryId === "pedido-de-oracao" || categoryId === "oracao") return { name: "Pedido de oração", emoji: "🙏" };
  if (categoryId === "versiculo" || categoryId === "biblia") return { name: "Versículo", emoji: "📖" };
  if (categoryId === "reflexao" || categoryId === "fe") return { name: "Reflexão", emoji: "💭" };
  if (categoryId === "testemunho" || categoryId === "vida-crista") return { name: "Testemunho", emoji: "❤️" };
  if (categoryId === "pergunta" || categoryId === "duvidas" || categoryId === "estudos-biblicos") return { name: "Pergunta", emoji: "❓" };
  if (categoryId === "devocional" || categoryId === "geral" || categoryId === "conhecimento") return { name: "Devocional", emoji: "🌅" };
  return { name: "Comunidade", emoji: "💬" };
}

export const REPORT_REASONS = [
  "Spam",
  "Conteúdo inadequado",
  "Assédio",
  "Outro",
] as const;

export type ReportReason = typeof REPORT_REASONS[number];

// Sanitização e proteção contra spam
export function sanitizeText(text: string): string {
  if (!text) return "";
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/javascript:/gi, "")
    .trim();
}

const SPAM_COOLDOWN_MS = 15000;
export function checkSpamCooldown(userId?: string): {
  allowed: boolean;
  isLimited: boolean;
  remainingSeconds: number;
  remainingSec: number;
} {
  if (typeof window === "undefined") {
    return { allowed: true, isLimited: false, remainingSeconds: 0, remainingSec: 0 };
  }
  const key = userId ? `bo:last_post_time_${userId}` : "bo:last_post_time";
  const lastPost = localStorage.getItem(key) || localStorage.getItem("bo:last_post_time");
  if (!lastPost) {
    return { allowed: true, isLimited: false, remainingSeconds: 0, remainingSec: 0 };
  }
  const diff = Date.now() - parseInt(lastPost, 10);
  if (diff < SPAM_COOLDOWN_MS) {
    const remainingSec = Math.ceil((SPAM_COOLDOWN_MS - diff) / 1000);
    return { allowed: false, isLimited: true, remainingSeconds: remainingSec, remainingSec };
  }
  return { allowed: true, isLimited: false, remainingSeconds: 0, remainingSec: 0 };
}

export function recordPostTimestamp(userId?: string) {
  if (typeof window === "undefined") return;
  const now = String(Date.now());
  localStorage.setItem("bo:last_post_time", now);
  if (userId) {
    localStorage.setItem(`bo:last_post_time_${userId}`, now);
  }
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  order_index: number;
}

export interface QuestionAuthor {
  id: string;
  name: string | null;
  avatar_url: string | null;
}

export interface Question {
  id: string;
  category_id: string;
  user_id: string;
  title: string;
  body: string;
  verse_reference: string | null;
  is_answered: boolean;
  accepted_answer_id: string | null;
  likes_count: number;
  answers_count: number;
  views_count: number;
  created_at: string;
  updated_at: string;
  author?: QuestionAuthor;
  category?: Category;
  user_has_liked?: boolean;
  user_has_prayed?: boolean;
  prayed_count?: number;
  reactions_summary?: { [emoji: string]: number };
  user_reactions?: string[];
}

export interface Answer {
  id: string;
  question_id: string;
  user_id: string;
  parent_id: string | null;
  body: string;
  verse_reference: string | null;
  is_accepted: boolean;
  likes_count: number;
  created_at: string;
  updated_at: string;
  author?: QuestionAuthor;
  user_has_liked?: boolean;
  reactions_summary?: { [emoji: string]: number };
  user_reactions?: string[];
  replies?: Answer[];
}

export interface NotificationItem {
  id: string;
  user_id: string;
  actor_id: string;
  type: "answer" | "reply" | "question_like" | "answer_like" | "reaction" | "accepted_answer";
  question_id: string;
  answer_id: string | null;
  read: boolean;
  message: string;
  created_at: string;
  actor?: QuestionAuthor;
}

// ----------------------------------------------------
// Categories
// ----------------------------------------------------

/**
 * Busca as categorias da tabela `community_categories` no Supabase.
 * Se a tabela não existir ou estiver vazia, usa os dados estáticos como fallback
 * para manter compatibilidade.
 */
export async function fetchCategoriesFromDB(): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from("community_categories")
      .select("id, name, description, icon, order_index")
      .order("order_index", { ascending: true });

    if (error) {
      // Tabela pode não existir (42P01) ou outro erro — usa fallback estático
      console.warn("[fetchCategoriesFromDB] Erro ao buscar categorias do banco, usando fallback estático:", error.message);
      return COMMUNITY_CATEGORIES.map((c, index) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        icon: c.emoji,
        order_index: index + 1,
      }));
    }

    if (!data || data.length === 0) {
      // Tabela existe mas está vazia — retorna vazio para que a UI possa alertar o usuário
      return [];
    }

    return data as Category[];
  } catch {
    // Fallback de segurança
    return COMMUNITY_CATEGORIES.map((c, index) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      icon: c.emoji,
      order_index: index + 1,
    }));
  }
}

/** @deprecated Use fetchCategoriesFromDB para obter categorias reais do banco. */
export async function fetchCategories(): Promise<Category[]> {
  return fetchCategoriesFromDB();
}

// ----------------------------------------------------
// Questions Queries
// ----------------------------------------------------
/**
 * Helper para identificar dados ou publicações internas geradas automaticamente pelo Quiz.
 * Garante que identificadores como [QUIZ_RANKING], [QUIZ_...] ou payloads JSON com
 * pontuação, estatísticas e tentativas NUNCA sejam retornados ou renderizados no mural público.
 */
export function isQuizInternalRecord(item: { title?: string | null; body?: string | null } | null | undefined): boolean {
  if (!item) return false;
  const title = String(item.title || "").trim();
  const body = String(item.body || "").trim();

  if (title.startsWith("[QUIZ_") || title.includes("[QUIZ_RANKING]") || title.toUpperCase().includes("QUIZ_RANKING")) {
    return true;
  }
  if (
    body.includes('"displayName"') ||
    body.includes('"bestScore"') ||
    body.includes('"passedAttempts"') ||
    body.includes('"totalAttempts"') ||
    body.includes('"winRate"')
  ) {
    return true;
  }
  return false;
}

export interface FetchQuestionsParams {
  category_id?: string | null | undefined;
  filter?: ("recent" | "popular" | "most_answered" | "most_liked" | "answered" | "unanswered") | undefined;
  search?: string | undefined;
  currentUserId?: string | null | undefined;
  limit?: number | undefined;
  offset?: number | undefined;
}

export async function fetchQuestions({
  category_id,
  filter = "recent",
  search,
  currentUserId,
  limit,
  offset,
}: FetchQuestionsParams): Promise<Question[]> {
  let query = supabase.from("questions").select(`
    *,
    category:community_categories(*)
  `);

  // Exclui estritamente registros internos e automáticos do Quiz no nível do banco
  query = query
    .not("title", "ilike", "[QUIZ_%")
    .not("title", "ilike", "%QUIZ_RANKING%")
    .not("body", "ilike", '%"displayName":%');

  if (category_id && category_id !== "todas") {
    query = query.eq("category_id", category_id);
  }

  if (search && search.trim()) {
    query = query.or(`title.ilike.%${search.trim()}%,body.ilike.%${search.trim()}%,verse_reference.ilike.%${search.trim()}%`);
  }

  if (filter === "popular") {
    query = query.order("views_count", { ascending: false }).order("created_at", { ascending: false });
  } else if (filter === "most_answered") {
    query = query.order("answers_count", { ascending: false }).order("created_at", { ascending: false });
  } else if (filter === "most_liked") {
    query = query.order("likes_count", { ascending: false }).order("created_at", { ascending: false });
  } else if (filter === "answered") {
    query = query.eq("is_answered", true).order("created_at", { ascending: false });
  } else if (filter === "unanswered") {
    query = query.eq("answers_count", 0).order("created_at", { ascending: false });
  } else {
    // recent
    query = query.order("created_at", { ascending: false });
  }

  if (offset !== undefined && limit !== undefined) {
    query = query.range(offset, offset + limit - 1);
  } else if (limit !== undefined) {
    query = query.limit(limit);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error fetching questions:", error);
    return [];
  }

  // Filtragem defensiva na camada lógica garantindo que nenhum post do quiz passe
  const rawQuestions = (data || []).filter((q) => !isQuizInternalRecord(q));
  if (rawQuestions.length === 0) return [];

  // Fetch author profiles safely
  const userIds = Array.from(new Set(rawQuestions.map((q) => q.user_id)));
  const profileMap = new Map<string, { id: string; user_id: string; name: string | null; avatar_url: string | null }>();
  if (userIds.length > 0) {
    try {
      let profilesData: any[] | null = null;
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("id, user_id, name, avatar_url")
        .in("user_id", userIds);

      if (!error && profiles) {
        profilesData = profiles;
      } else {
        const { data: fallbackProfiles } = await supabase
          .from("profiles")
          .select("id, user_id, name")
          .in("user_id", userIds);
        profilesData = fallbackProfiles || [];
      }

      (profilesData || []).forEach((p: any) => {
        profileMap.set(p.user_id, {
          id: p.user_id,
          user_id: p.user_id,
          name: p.name,
          avatar_url: p.avatar_url || null,
        });
      });
    } catch (err) {
      console.warn("Profiles query warning:", err);
    }
  }

  const questionIds = rawQuestions.map((q) => q.id);

  // Count likes from question_likes
  const likesCountMap = new Map<string, number>();
  try {
    const { data: allLikes } = await supabase
      .from("question_likes")
      .select("question_id")
      .in("question_id", questionIds);
    (allLikes || []).forEach((l) => {
      likesCountMap.set(l.question_id, (likesCountMap.get(l.question_id) || 0) + 1);
    });
  } catch {}

  // Count answers from answers
  const answersCountMap = new Map<string, number>();
  try {
    const { data: allAnswers } = await supabase
      .from("answers")
      .select("question_id")
      .in("question_id", questionIds);
    (allAnswers || []).forEach((a) => {
      answersCountMap.set(a.question_id, (answersCountMap.get(a.question_id) || 0) + 1);
    });
  } catch {}

  // If user is logged in, fetch which questions they liked
  let likedQuestionIds = new Set<string>();
  if (currentUserId) {
    try {
      const { data: likes } = await supabase
        .from("question_likes")
        .select("question_id")
        .eq("user_id", currentUserId)
        .in("question_id", questionIds);
      if (likes) {
        likedQuestionIds = new Set(likes.map((l) => l.question_id));
      }
    } catch {}
  }

  // Fetch reactions summaries for these questions
  const reactionsSummaryMap = new Map<string, { [emoji: string]: number }>();
  const userReactionsMap = new Map<string, string[]>();

  try {
    const { data: reactions } = await supabase
      .from("reactions")
      .select("target_id, emoji, user_id")
      .eq("target_type", "question")
      .in("target_id", questionIds);

    (reactions || []).forEach((r) => {
      if (!reactionsSummaryMap.has(r.target_id)) {
        reactionsSummaryMap.set(r.target_id, {});
      }
      const currentCounts = reactionsSummaryMap.get(r.target_id)!;
      currentCounts[r.emoji] = (currentCounts[r.emoji] || 0) + 1;

      if (currentUserId && r.user_id === currentUserId) {
        const userReactions = userReactionsMap.get(r.target_id) || [];
        userReactions.push(r.emoji);
        userReactionsMap.set(r.target_id, userReactions);
      }
    });
  } catch {}

  return rawQuestions.map((q) => {
    const isAnon = Boolean(q.title?.startsWith("[ANÔNIMO]"));
    const summary = reactionsSummaryMap.get(q.id) || {};
    const userReactions = userReactionsMap.get(q.id) || [];
    const realLikes = likesCountMap.has(q.id) ? likesCountMap.get(q.id)! : (q.likes_count || 0);
    const realAnswers = answersCountMap.has(q.id) ? answersCountMap.get(q.id)! : (q.answers_count || 0);
    const author = isAnon
      ? { id: q.user_id, name: "Pedido anônimo", avatar_url: null }
      : profileMap.get(q.user_id) || { id: q.user_id, name: "Usuário", avatar_url: null };

    return {
      ...q,
      likes_count: realLikes,
      answers_count: realAnswers,
      author,
      category: Array.isArray(q.category) ? q.category[0] : q.category,
      user_has_liked: likedQuestionIds.has(q.id),
      user_has_prayed: userReactions.includes("🙏"),
      prayed_count: summary["🙏"] || 0,
      reactions_summary: summary,
      user_reactions: userReactions,
    };
  });
}

export async function fetchQuestionById(id: string, currentUserId?: string | null): Promise<Question | null> {
  const { data, error } = await supabase
    .from("questions")
    .select(`*, category:community_categories(*)`)
    .eq("id", id)
    .single();

  if (error || !data || isQuizInternalRecord(data)) {
    if (error && (error as any).code !== "PGRST116") {
      console.error("Error fetching question by id:", error);
    }
    return null;
  }

  // Increment views count asynchronously (ignore failure if restricted)
  void supabase
    .from("questions")
    .update({ views_count: (data.views_count || 0) + 1 })
    .eq("id", id)
    .then(() => undefined);

  // Fetch author profile safely
  const isAnon = Boolean(data.title?.startsWith("[ANÔNIMO]"));
  let authorProfile: QuestionAuthor = isAnon
    ? {
        id: data.user_id,
        name: "Pedido anônimo",
        avatar_url: null,
      }
    : {
        id: data.user_id,
        name: "Usuário",
        avatar_url: null,
      };

  if (!isAnon) {
    try {
      let authorData: any = null;
      const { data: author, error } = await supabase
        .from("profiles")
        .select("id, user_id, name, avatar_url")
        .eq("user_id", data.user_id)
        .maybeSingle();

      if (!error && author) {
        authorData = author;
      } else {
        const { data: fallbackAuthor } = await supabase
          .from("profiles")
          .select("id, user_id, name")
          .eq("user_id", data.user_id)
          .maybeSingle();
        authorData = fallbackAuthor;
      }

      if (authorData?.name) {
        authorProfile.name = authorData.name;
      }
      if (authorData?.avatar_url) {
        authorProfile.avatar_url = authorData.avatar_url;
      }
    } catch {}
  }

  // Fetch real likes count
  let realLikes = data.likes_count || 0;
  try {
    const { count } = await supabase
      .from("question_likes")
      .select("*", { count: "exact", head: true })
      .eq("question_id", id);
    if (count !== null && count !== undefined) realLikes = count;
  } catch {}

  // Fetch real answers count
  let realAnswers = data.answers_count || 0;
  try {
    const { count } = await supabase
      .from("answers")
      .select("*", { count: "exact", head: true })
      .eq("question_id", id);
    if (count !== null && count !== undefined) realAnswers = count;
  } catch {}

  // User liked?
  let user_has_liked = false;
  if (currentUserId) {
    try {
      const { data: like } = await supabase
        .from("question_likes")
        .select("id")
        .eq("question_id", id)
        .eq("user_id", currentUserId)
        .maybeSingle();
      user_has_liked = !!like;
    } catch {}
  }

  // Reactions
  const reactions_summary: { [emoji: string]: number } = {};
  const user_reactions: string[] = [];

  try {
    const { data: reactions } = await supabase
      .from("reactions")
      .select("emoji, user_id")
      .eq("target_type", "question")
      .eq("target_id", id);

    (reactions || []).forEach((r) => {
      reactions_summary[r.emoji] = (reactions_summary[r.emoji] || 0) + 1;
      if (currentUserId && r.user_id === currentUserId) {
        user_reactions.push(r.emoji);
      }
    });
  } catch {}

  return {
    ...data,
    views_count: data.views_count + 1,
    likes_count: realLikes,
    answers_count: realAnswers,
    author: authorProfile,
    category: Array.isArray(data.category) ? data.category[0] : data.category,
    user_has_liked,
    user_has_prayed: user_reactions.includes("🙏"),
    prayed_count: reactions_summary["🙏"] || 0,
    reactions_summary,
    user_reactions,
  };
}

// ----------------------------------------------------
// Prayer Requests Intercession ("Orar por esta pessoa")
// ----------------------------------------------------
export async function togglePrayer(
  questionId: string,
  userId: string,
  questionAuthorId?: string
): Promise<{ userHasPrayed: boolean; prayedCount: number }> {
  if (!userId || !userId.trim()) {
    throw new Error("Para apoiar em oração, você precisa criar uma conta gratuita.");
  }

  const { data: existing } = await supabase
    .from("reactions")
    .select("id")
    .eq("target_type", "question")
    .eq("target_id", questionId)
    .eq("user_id", userId)
    .eq("emoji", "🙏")
    .maybeSingle();

  if (existing) {
    await supabase.from("reactions").delete().eq("id", existing.id);
  } else {
    await supabase.from("reactions").insert({
      target_type: "question",
      target_id: questionId,
      user_id: userId,
      emoji: "🙏",
      reaction_name: "Oração",
    });

    if (questionAuthorId && questionAuthorId !== userId) {
      await createNotification({
        userId: questionAuthorId,
        actorId: userId,
        type: "reaction",
        questionId,
        message: "marcou que está orando pelo seu pedido de oração. 🙏",
      });
    }
  }

  const { count } = await supabase
    .from("reactions")
    .select("*", { count: "exact", head: true })
    .eq("target_type", "question")
    .eq("target_id", questionId)
    .eq("emoji", "🙏");

  return {
    userHasPrayed: !existing,
    prayedCount: count || 0,
  };
}

// ----------------------------------------------------
// Public Profile (LGPD Compliant - zero private exposure)
// ----------------------------------------------------
export interface PublicProfileData {
  id: string;
  name: string;
  avatar_url: string | null;
  created_at: string;
  questions: Question[];
}

export async function fetchPublicProfile(userId: string): Promise<PublicProfileData | null> {
  let profileName = "Usuário";
  let profileCreatedAt = new Date().toISOString();

  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, user_id, name, created_at")
      .eq("user_id", userId)
      .maybeSingle();

    if (profile?.name) profileName = profile.name;
    if (profile?.created_at) profileCreatedAt = profile.created_at;
  } catch {}

  const { data: questions } = await supabase
    .from("questions")
    .select("*")
    .eq("user_id", userId)
    .not("title", "ilike", "[QUIZ_%")
    .not("body", "ilike", '%"displayName":%')
    .order("created_at", { ascending: false })
    .limit(20);

  return {
    id: userId,
    name: profileName,
    avatar_url: null,
    created_at: profileCreatedAt,
    questions: (questions || [])
      .filter((q) => !q.title?.startsWith("[ANÔNIMO]") && !isQuizInternalRecord(q))
      .map((q) => ({
        ...q,
        author: {
          id: userId,
          name: profileName,
          avatar_url: null,
        },
        user_has_liked: false,
      })),
  };
}

// ----------------------------------------------------
// Answers Queries
// ----------------------------------------------------
export async function fetchAnswers(questionId: string, currentUserId?: string | null): Promise<Answer[]> {
  const { data, error } = await supabase
    .from("answers")
    .select("*")
    .eq("question_id", questionId)
    .order("created_at", { ascending: true });

  if (error || !data) {
    console.error("Error fetching answers:", error);
    return [];
  }

  const rawAnswers = data;
  if (rawAnswers.length === 0) return [];

  // Fetch author profiles safely
  const userIds = Array.from(new Set(rawAnswers.map((a) => a.user_id)));
  const profileMap = new Map<string, { id: string; user_id: string; name: string | null; avatar_url: string | null }>();
  if (userIds.length > 0) {
    try {
      let profilesData: any[] | null = null;
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("id, user_id, name, avatar_url")
        .in("user_id", userIds);

      if (!error && profiles) {
        profilesData = profiles;
      } else {
        const { data: fallbackProfiles } = await supabase
          .from("profiles")
          .select("id, user_id, name")
          .in("user_id", userIds);
        profilesData = fallbackProfiles || [];
      }

      (profilesData || []).forEach((p: any) => {
        profileMap.set(p.user_id, {
          id: p.user_id,
          user_id: p.user_id,
          name: p.name,
          avatar_url: p.avatar_url || null,
        });
      });
    } catch {}
  }

  const answerIds = rawAnswers.map((a) => a.id);

  // User likes on answers
  let likedAnswerIds = new Set<string>();
  if (currentUserId) {
    try {
      const { data: likes } = await supabase
        .from("answer_likes")
        .select("answer_id")
        .eq("user_id", currentUserId)
        .in("answer_id", answerIds);
      if (likes) {
        likedAnswerIds = new Set(likes.map((l) => l.answer_id));
      }
    } catch {}
  }

  // Count likes from answer_likes
  const likesCountMap = new Map<string, number>();
  try {
    const { data: allAnsLikes } = await supabase
      .from("answer_likes")
      .select("answer_id")
      .in("answer_id", answerIds);
    (allAnsLikes || []).forEach((al) => {
      likesCountMap.set(al.answer_id, (likesCountMap.get(al.answer_id) || 0) + 1);
    });
  } catch {}

  // Reactions for answers
  const reactionsSummaryMap = new Map<string, { [emoji: string]: number }>();
  const userReactionsMap = new Map<string, string[]>();

  try {
    const { data: reactions } = await supabase
      .from("reactions")
      .select("target_id, emoji, user_id")
      .eq("target_type", "answer")
      .in("target_id", answerIds);

    (reactions || []).forEach((r) => {
      if (!reactionsSummaryMap.has(r.target_id)) {
        reactionsSummaryMap.set(r.target_id, {});
      }
      const currentCounts = reactionsSummaryMap.get(r.target_id)!;
      currentCounts[r.emoji] = (currentCounts[r.emoji] || 0) + 1;

      if (currentUserId && r.user_id === currentUserId) {
        const uReactions = userReactionsMap.get(r.target_id) || [];
        uReactions.push(r.emoji);
        userReactionsMap.set(r.target_id, uReactions);
      }
    });
  } catch {}

  const parsedAnswers: Answer[] = rawAnswers.map((a) => ({
    ...a,
    likes_count: likesCountMap.has(a.id) ? likesCountMap.get(a.id)! : (a.likes_count || 0),
    author: profileMap.get(a.user_id) || { id: a.user_id, name: "Usuário", avatar_url: null },
    user_has_liked: likedAnswerIds.has(a.id),
    reactions_summary: reactionsSummaryMap.get(a.id) || {},
    user_reactions: userReactionsMap.get(a.id) || [],
    replies: [],
  }));

  // Build threaded tree (depth 2: top-level answers and their replies)
  const topLevelAnswers: Answer[] = [];
  const repliesMap = new Map<string, Answer[]>();

  parsedAnswers.forEach((ans) => {
    if (ans.parent_id) {
      const list = repliesMap.get(ans.parent_id) || [];
      list.push(ans);
      repliesMap.set(ans.parent_id, list);
    } else {
      topLevelAnswers.push(ans);
    }
  });

  topLevelAnswers.forEach((ans) => {
    ans.replies = repliesMap.get(ans.id) || [];
  });

  // Sort top-level answers: accepted answer first, then highest likes/created_at
  topLevelAnswers.sort((a, b) => {
    if (a.is_accepted && !b.is_accepted) return -1;
    if (!a.is_accepted && b.is_accepted) return 1;
    return b.likes_count - a.likes_count;
  });

  return topLevelAnswers;
}

// ----------------------------------------------------
// Mutations: Questions & Answers
// ----------------------------------------------------
export async function createQuestion(params: {
  userId: string;
  categoryId: string;
  title?: string | undefined;
  body: string;
  verseReference?: string | undefined;
}): Promise<Question | null> {
  if (!params.userId || !params.userId.trim()) {
    throw new Error("Para publicar, você precisa criar uma conta gratuita.");
  }

  const sanitizedBody = sanitizeText(params.body);
  const rawTitle = params.title?.trim() || "";
  const sanitizedTitle = rawTitle ? sanitizeText(rawTitle) : (sanitizedBody.slice(0, 60) + (sanitizedBody.length > 60 ? "..." : ""));

  // Garantir que categoryId seja um valor válido não-vazio.
  // NÃO validamos contra o array estático local — o ID deve vir de fetchCategoriesFromDB()
  // para garantir que existe no banco. Se vier vazio/undefined, lançamos erro descritivo.
  const categoryId = params.categoryId?.trim();
  if (!categoryId) {
    throw new Error(
      "Nenhuma categoria selecionada. Selecione uma categoria antes de publicar."
    );
  }

  // Verificar se a categoria realmente existe no banco antes de inserir
  const { data: catExists, error: catError } = await supabase
    .from("community_categories")
    .select("id")
    .eq("id", categoryId)
    .maybeSingle();

  if (catError) {
    console.warn("[createQuestion] Não foi possível validar a categoria no banco:", catError.message);
    // Continua sem validação para não bloquear em caso de erro de permissão
  } else if (!catExists) {
    throw new Error(
      `A categoria selecionada ("${categoryId}") não existe no banco de dados. ` +
      "Por favor, selecione uma categoria válida."
    );
  }

  const { data, error } = await supabase
    .from("questions")
    .insert({
      user_id: params.userId,
      category_id: categoryId,
      title: sanitizedTitle || "Publicação na Comunidade",
      body: sanitizedBody,
      verse_reference: params.verseReference?.trim() ? sanitizeText(params.verseReference.trim()) : null,
      likes_count: 0,
      answers_count: 0,
      views_count: 0,
      is_answered: false,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating question:", error);
    throw error;
  }

  // Disparo automático de notificações para pedidos de oração criados via mural
  if (data && categoryId === "oracao") {
    // 1. Notificações internas no banco para o sininho de todos os outros usuários
    dispatchPrayerNotificationFallback(data.id, params.userId, undefined, sanitizedBody).catch((err) =>
      console.warn("[NOTIFICATION] Erro ao disparar fallback na comunidade:", err)
    );

    // 2. Disparo de Web Push nativo para os outros dispositivos cadastrados
    notifyNewPrayerRequest({
      data: {
        authorId: params.userId,
        authorName: "Alguém da comunidade",
        prayerRequestId: data.id,
        content: sanitizedBody,
      },
    }).catch((pushErr) => console.warn("[PUSH] notifyNewPrayerRequest error na comunidade:", pushErr));
  }

  return data;
}

export async function updateQuestion(
  questionId: string,
  updates: { title?: string | undefined; body?: string | undefined; categoryId?: string | undefined; verseReference?: string | undefined }
) {
  const payload: {
    updated_at: string;
    title?: string;
    body?: string;
    category_id?: string;
    verse_reference?: string | null;
  } = {
    updated_at: new Date().toISOString(),
  };
  if (updates.title !== undefined) {
    const cleanTitle = sanitizeText(updates.title).trim();
    payload.title = cleanTitle || (updates.body ? sanitizeText(updates.body).trim().slice(0, 50) : "Publicação");
  }
  if (updates.body !== undefined) {
    payload.body = sanitizeText(updates.body).trim();
  }
  // Só inclui category_id se for um valor não-vazio (evita FK violation por string vazia)
  if (updates.categoryId && updates.categoryId.trim()) {
    payload.category_id = updates.categoryId.trim();
  }
  if (updates.verseReference !== undefined) {
    payload.verse_reference = updates.verseReference.trim() ? sanitizeText(updates.verseReference.trim()) : null;
  }

  const { error } = await supabase.from("questions").update(payload).eq("id", questionId);
  if (error) throw error;
}

export async function deleteQuestion(questionId: string) {
  const { error } = await supabase.from("questions").delete().eq("id", questionId);
  if (error) throw error;
}

export async function createAnswer(params: {
  questionId: string;
  userId: string;
  body: string;
  verseReference?: string | undefined;
  parentId?: string | null | undefined;
  questionAuthorId?: string | undefined;
  parentAnswerAuthorId?: string | undefined;
}): Promise<Answer | null> {
  if (!params.userId || !params.userId.trim()) {
    throw new Error("Para comentar, você precisa criar uma conta gratuita.");
  }

  const sanitizedBody = sanitizeText(params.body);
  const { data, error } = await supabase
    .from("answers")
    .insert({
      question_id: params.questionId,
      user_id: params.userId,
      parent_id: params.parentId || null,
      body: sanitizedBody,
      verse_reference: params.verseReference?.trim() ? sanitizeText(params.verseReference.trim()) : null,
      likes_count: 0,
      is_accepted: false,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating answer:", error);
    throw error;
  }

  // Increment answers_count in question (silently ignore if restricted)
  try {
    const { data: q } = await supabase.from("questions").select("answers_count").eq("id", params.questionId).single();
    if (q) {
      await supabase.from("questions").update({ answers_count: (q.answers_count || 0) + 1 }).eq("id", params.questionId);
    }
  } catch {}

  // Create notification for question author or parent answer author
  try {
    if (params.parentId && params.parentAnswerAuthorId && params.parentAnswerAuthorId !== params.userId) {
      await createNotification({
        userId: params.parentAnswerAuthorId,
        actorId: params.userId,
        type: "reply",
        questionId: params.questionId,
        answerId: data.id,
        message: "respondeu ao seu comentário na comunidade.",
      });
    } else if (params.questionAuthorId && params.questionAuthorId !== params.userId) {
      await createNotification({
        userId: params.questionAuthorId,
        actorId: params.userId,
        type: "answer",
        questionId: params.questionId,
        answerId: data.id,
        message: "comentou na sua publicação da comunidade.",
      });
    }
  } catch {}

  return data;
}

export async function updateAnswer(answerId: string, body: string) {
  const { error } = await supabase
    .from("answers")
    .update({ body: body.trim(), updated_at: new Date().toISOString() })
    .eq("id", answerId);
  if (error) throw error;
}

export async function deleteAnswer(answerId: string, questionId: string) {
  const { error } = await supabase.from("answers").delete().eq("id", answerId);
  if (error) throw error;

  // Decrement answers_count
  try {
    const { data: q } = await supabase.from("questions").select("answers_count").eq("id", questionId).single();
    if (q && q.answers_count > 0) {
      await supabase.from("questions").update({ answers_count: q.answers_count - 1 }).eq("id", questionId);
    }
  } catch {}
}

// ----------------------------------------------------
// Likes
// ----------------------------------------------------
export async function toggleQuestionLike(questionId: string, userId: string, questionAuthorId?: string): Promise<boolean> {
  if (!userId || !userId.trim()) {
    throw new Error("Para curtir uma publicação, você precisa criar uma conta gratuita.");
  }

  const { data: existing } = await supabase
    .from("question_likes")
    .select("id")
    .eq("question_id", questionId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    await supabase.from("question_likes").delete().eq("id", existing.id);
    return false;
  } else {
    await supabase.from("question_likes").insert({ question_id: questionId, user_id: userId });

    if (questionAuthorId && questionAuthorId !== userId) {
      await createNotification({
        userId: questionAuthorId,
        actorId: userId,
        type: "question_like",
        questionId,
        message: "curtiu a sua publicação na comunidade.",
      });
    }
    return true;
  }
}

export async function toggleAnswerLike(answerId: string, questionId: string, userId: string, answerAuthorId?: string): Promise<boolean> {
  if (!userId || !userId.trim()) {
    throw new Error("Para curtir um comentário, você precisa criar uma conta gratuita.");
  }

  const { data: existing } = await supabase
    .from("answer_likes")
    .select("id")
    .eq("answer_id", answerId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    await supabase.from("answer_likes").delete().eq("id", existing.id);
    return false;
  } else {
    await supabase.from("answer_likes").insert({ answer_id: answerId, user_id: userId });

    if (answerAuthorId && answerAuthorId !== userId) {
      await createNotification({
        userId: answerAuthorId,
        actorId: userId,
        type: "answer_like",
        questionId,
        answerId,
        message: "curtiu o seu comentário na comunidade.",
      });
    }
    return true;
  }
}

// ----------------------------------------------------
// Christian Reactions
// ----------------------------------------------------
export async function toggleReaction(params: {
  targetType: "question" | "answer";
  targetId: string;
  userId: string;
  emoji: string;
  reactionName: string;
  targetAuthorId?: string;
  questionId: string;
}): Promise<boolean> {
  if (!params.userId || !params.userId.trim()) {
    throw new Error("Para reagir a uma publicação, você precisa criar uma conta gratuita.");
  }

  const { data: existing } = await supabase
    .from("reactions")
    .select("id")
    .eq("target_type", params.targetType)
    .eq("target_id", params.targetId)
    .eq("user_id", params.userId)
    .eq("emoji", params.emoji)
    .maybeSingle();

  if (existing) {
    await supabase.from("reactions").delete().eq("id", existing.id);
    return false;
  } else {
    await supabase.from("reactions").insert({
      target_type: params.targetType,
      target_id: params.targetId,
      user_id: params.userId,
      emoji: params.emoji,
      reaction_name: params.reactionName,
    });

    if (params.targetAuthorId && params.targetAuthorId !== params.userId) {
      await createNotification({
        userId: params.targetAuthorId,
        actorId: params.userId,
        type: "reaction",
        questionId: params.questionId,
        answerId: params.targetType === "answer" ? params.targetId : null,
        message: `reagiu com ${params.emoji} "${params.reactionName}" à sua publicação.`,
      });
    }
    return true;
  }
}

// ----------------------------------------------------
// Accept Answer (Best Answer)
// ----------------------------------------------------
export async function markAcceptedAnswer(questionId: string, answerId: string, answerAuthorId: string, currentUserId: string) {
  // Check if answer is already accepted
  const { data: answer } = await supabase.from("answers").select("is_accepted").eq("id", answerId).single();
  const willBeAccepted = !answer?.is_accepted;

  // Unaccept any previous accepted answers for this question
  await supabase.from("answers").update({ is_accepted: false }).eq("question_id", questionId);

  if (willBeAccepted) {
    await supabase.from("answers").update({ is_accepted: true }).eq("id", answerId);
    await supabase.from("questions").update({ is_answered: true, accepted_answer_id: answerId }).eq("id", questionId);

    if (answerAuthorId !== currentUserId) {
      await createNotification({
        userId: answerAuthorId,
        actorId: currentUserId,
        type: "accepted_answer",
        questionId,
        answerId,
        message: "marcou a sua resposta como a resposta aceita e edificante! ✅",
      });
    }
  } else {
    await supabase.from("questions").update({ is_answered: false, accepted_answer_id: null }).eq("id", questionId);
  }
}

// ----------------------------------------------------
// Reports and Blocks
// ----------------------------------------------------
export async function reportContent(params: {
  targetType: "question" | "answer" | "user";
  targetId: string;
  reporterId: string;
  reason: string;
}) {
  const { error } = await supabase.from("community_reports").insert({
    target_type: params.targetType,
    target_id: params.targetId,
    reporter_id: params.reporterId,
    reason: params.reason,
    status: "pending",
  });
  if (error) throw error;
}

export async function blockCommunityUser(userId: string, blockedUserId: string) {
  const { error } = await supabase.from("community_blocked_users").insert({
    user_id: userId,
    blocked_user_id: blockedUserId,
  });
  if (error) throw error;
}

// ----------------------------------------------------
// Notifications
// ----------------------------------------------------
export async function createNotification(params: {
  userId: string;
  actorId: string;
  type: "answer" | "reply" | "question_like" | "answer_like" | "reaction" | "accepted_answer";
  questionId: string;
  answerId?: string | null;
  message: string;
}) {
  try {
    await supabase.from("notifications").insert({
      user_id: params.userId,
      actor_id: params.actorId,
      type: params.type,
      question_id: params.questionId,
      answer_id: params.answerId || null,
      message: params.message,
      read: false,
    });
  } catch (err) {
    console.error("Error creating notification:", err);
  }
}

export async function fetchNotifications(userId: string): Promise<NotificationItem[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(30);

  if (error || !data) return [];

  const actorIds = Array.from(new Set(data.map((n) => n.actor_id)));
  const profileMap = new Map<string, { id: string; name: string | null; avatar_url: string | null }>();
  if (actorIds.length > 0) {
    try {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, user_id, name")
        .in("user_id", actorIds);

      (profiles || []).forEach((p) => {
        profileMap.set(p.user_id, {
          id: p.user_id,
          name: p.name,
          avatar_url: null,
        });
      });
    } catch {}
  }

  return data.map((n) => ({
    ...n,
    type: n.type as NotificationItem["type"],
    actor: profileMap.get(n.actor_id) || { id: n.actor_id, name: "Irmão(ã)", avatar_url: null },
  }));
}

export async function markNotificationAsRead(id: string) {
  await supabase.from("notifications").update({ read: true }).eq("id", id);
}

export async function markAllNotificationsAsRead(userId: string) {
  await supabase.from("notifications").update({ read: true }).eq("user_id", userId).eq("read", false);
}

export function useUnreadNotificationsCount(userId?: string) {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    if (!userId) {
      setCount(0);
      return;
    }

    async function loadCount() {
      const { count: unreadCount } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId!)
        .eq("read", false);
      setCount(unreadCount || 0);
    }

    loadCount();

    const channel = supabase
      .channel(`user-notifications-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          loadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return count;
}

// ----------------------------------------------------
// Online Members (Supabase Presence)
// ----------------------------------------------------
export function useOnlineMembersCount(userId?: string) {
  const { totalOnline } = useGlobalOnlinePresence(userId);
  return totalOnline;
}

// Format relative date in Portuguese
export function formatRelativeDate(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSec < 60) return "agora mesmo";
    if (diffMin < 60) return `${diffMin} ${diffMin === 1 ? "minuto" : "minutos"} atrás`;
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? "hora" : "horas"} atrás`;
    if (diffDays === 1) return "ontem";
    if (diffDays < 7) return `${diffDays} dias atrás`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} sem. atrás`;
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  } catch {
    return "";
  }
}

// ----------------------------------------------------
// Admin Moderation
// ----------------------------------------------------
export interface CommunityReportItem {
  id: string;
  target_type: string;
  target_id: string;
  reporter_id: string;
  reason: string;
  status: string;
  created_at: string;
  reporter_name?: string;
  target_title?: string;
  target_body?: string;
}

export async function fetchCommunityReports(): Promise<CommunityReportItem[]> {
  const { data, error } = await supabase
    .from("community_reports")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data;
}

export async function resolveCommunityReport(reportId: string, status: "resolved" | "dismissed") {
  const { error } = await supabase
    .from("community_reports")
    .update({ status })
    .eq("id", reportId);
  if (error) throw error;
}

export async function adminDeleteQuestion(questionId: string) {
  const { error } = await supabase.from("questions").delete().eq("id", questionId);
  if (error) throw error;
}

export async function adminDeleteAnswer(answerId: string, questionId?: string) {
  const { error } = await supabase.from("answers").delete().eq("id", answerId);
  if (error) throw error;
  if (questionId) {
    const { data: q } = await supabase.from("questions").select("answers_count").eq("id", questionId).single();
    if (q && q.answers_count > 0) {
      await supabase.from("questions").update({ answers_count: q.answers_count - 1 }).eq("id", questionId);
    }
  }
}

