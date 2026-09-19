import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

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
export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("community_categories")
    .select("*")
    .order("order_index", { ascending: true });

  if (error) {
    console.error("Error fetching categories:", error);
    return [
      { id: "biblia", name: "Bíblia", description: "Perguntas sobre as Escrituras", icon: "📖", order_index: 1 },
      { id: "oracao", name: "Oração", description: "Pedidos e gratidão", icon: "🙏", order_index: 2 },
      { id: "vida-crista", name: "Vida Cristã", description: "Desafios e testemunhos", icon: "❤️", order_index: 3 },
      { id: "estudos-biblicos", name: "Estudos Bíblicos", description: "Aprofundamento na Palavra", icon: "📚", order_index: 4 },
      { id: "duvidas", name: "Dúvidas", description: "Dúvidas e respostas", icon: "❓", order_index: 5 },
      { id: "fe", name: "Fé", description: "Esperança e confiança", icon: "🕊️", order_index: 6 },
      { id: "familia", name: "Família", description: "Princípios para o lar", icon: "👨‍👩‍👧", order_index: 7 },
      { id: "historia-biblica", name: "História Bíblica", description: "Contexto e geografia", icon: "📜", order_index: 8 },
      { id: "conhecimento", name: "Conhecimento", description: "Curiosidades e aprendizados", icon: "💡", order_index: 9 },
      { id: "geral", name: "Geral", description: "Comunhão e conversas", icon: "📌", order_index: 10 },
    ];
  }
  return data || [];
}

// ----------------------------------------------------
// Questions Queries
// ----------------------------------------------------
export interface FetchQuestionsParams {
  category_id?: string | null;
  filter?: "recent" | "popular" | "most_answered" | "most_liked" | "answered" | "unanswered";
  search?: string;
  currentUserId?: string | null;
}

export async function fetchQuestions({
  category_id,
  filter = "recent",
  search,
  currentUserId,
}: FetchQuestionsParams): Promise<Question[]> {
  let query = supabase.from("questions").select(`
    *,
    category:community_categories(*)
  `);

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

  const { data, error } = await query;
  if (error) {
    console.error("Error fetching questions:", error);
    return [];
  }

  const rawQuestions = data || [];
  if (rawQuestions.length === 0) return [];

  // Fetch author profiles
  const userIds = Array.from(new Set(rawQuestions.map((q) => q.user_id)));
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, name, avatar_url")
    .in("id", userIds);

  const profileMap = new Map((profiles || []).map((p) => [p.id, p]));

  // If user is logged in, fetch which questions they liked
  let likedQuestionIds = new Set<string>();
  if (currentUserId) {
    const questionIds = rawQuestions.map((q) => q.id);
    const { data: likes } = await supabase
      .from("question_likes")
      .select("question_id")
      .eq("user_id", currentUserId)
      .in("question_id", questionIds);
    if (likes) {
      likedQuestionIds = new Set(likes.map((l) => l.question_id));
    }
  }

  // Fetch reactions summaries for these questions
  const questionIds = rawQuestions.map((q) => q.id);
  const { data: reactions } = await supabase
    .from("reactions")
    .select("target_id, emoji, user_id")
    .eq("target_type", "question")
    .in("target_id", questionIds);

  const reactionsSummaryMap = new Map<string, { [emoji: string]: number }>();
  const userReactionsMap = new Map<string, string[]>();

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

  return rawQuestions.map((q) => ({
    ...q,
    author: profileMap.get(q.user_id) || { id: q.user_id, name: "Irmão(ã) em Cristo", avatar_url: null },
    category: Array.isArray(q.category) ? q.category[0] : q.category,
    user_has_liked: likedQuestionIds.has(q.id),
    reactions_summary: reactionsSummaryMap.get(q.id) || {},
    user_reactions: userReactionsMap.get(q.id) || [],
  }));
}

export async function fetchQuestionById(id: string, currentUserId?: string | null): Promise<Question | null> {
  const { data, error } = await supabase
    .from("questions")
    .select(`*, category:community_categories(*)`)
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error("Error fetching question by id:", error);
    return null;
  }

  // Increment views count asynchronously
  supabase
    .from("questions")
    .update({ views_count: (data.views_count || 0) + 1 })
    .eq("id", id)
    .then(() => {});

  // Fetch author profile
  const { data: author } = await supabase
    .from("profiles")
    .select("id, name, avatar_url")
    .eq("id", data.user_id)
    .single();

  // User liked?
  let user_has_liked = false;
  if (currentUserId) {
    const { data: like } = await supabase
      .from("question_likes")
      .select("id")
      .eq("question_id", id)
      .eq("user_id", currentUserId)
      .maybeSingle();
    user_has_liked = !!like;
  }

  // Reactions
  const { data: reactions } = await supabase
    .from("reactions")
    .select("emoji, user_id")
    .eq("target_type", "question")
    .eq("target_id", id);

  const reactions_summary: { [emoji: string]: number } = {};
  const user_reactions: string[] = [];

  (reactions || []).forEach((r) => {
    reactions_summary[r.emoji] = (reactions_summary[r.emoji] || 0) + 1;
    if (currentUserId && r.user_id === currentUserId) {
      user_reactions.push(r.emoji);
    }
  });

  return {
    ...data,
    views_count: data.views_count + 1,
    author: author || { id: data.user_id, name: "Irmão(ã) em Cristo", avatar_url: null },
    category: Array.isArray(data.category) ? data.category[0] : data.category,
    user_has_liked,
    reactions_summary,
    user_reactions,
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

  // Fetch author profiles
  const userIds = Array.from(new Set(rawAnswers.map((a) => a.user_id)));
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, name, avatar_url")
    .in("id", userIds);

  const profileMap = new Map((profiles || []).map((p) => [p.id, p]));

  // User likes on answers
  let likedAnswerIds = new Set<string>();
  if (currentUserId) {
    const answerIds = rawAnswers.map((a) => a.id);
    const { data: likes } = await supabase
      .from("answer_likes")
      .select("answer_id")
      .eq("user_id", currentUserId)
      .in("answer_id", answerIds);
    if (likes) {
      likedAnswerIds = new Set(likes.map((l) => l.answer_id));
    }
  }

  // Reactions for answers
  const answerIds = rawAnswers.map((a) => a.id);
  const { data: reactions } = await supabase
    .from("reactions")
    .select("target_id, emoji, user_id")
    .eq("target_type", "answer")
    .in("target_id", answerIds);

  const reactionsSummaryMap = new Map<string, { [emoji: string]: number }>();
  const userReactionsMap = new Map<string, string[]>();

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

  const parsedAnswers: Answer[] = rawAnswers.map((a) => ({
    ...a,
    author: profileMap.get(a.user_id) || { id: a.user_id, name: "Irmão(ã) em Cristo", avatar_url: null },
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
  title: string;
  body: string;
  verseReference?: string;
}): Promise<Question | null> {
  const { data, error } = await supabase
    .from("questions")
    .insert({
      user_id: params.userId,
      category_id: params.categoryId,
      title: params.title.trim(),
      body: params.body.trim(),
      verse_reference: params.verseReference?.trim() || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating question:", error);
    throw error;
  }
  return data;
}

export async function updateQuestion(
  questionId: string,
  updates: { title?: string; body?: string; categoryId?: string; verseReference?: string }
) {
  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (updates.title) payload.title = updates.title.trim();
  if (updates.body) payload.body = updates.body.trim();
  if (updates.categoryId) payload.category_id = updates.categoryId;
  if (updates.verseReference !== undefined) payload.verse_reference = updates.verseReference.trim() || null;

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
  verseReference?: string;
  parentId?: string | null;
  questionAuthorId?: string;
  parentAnswerAuthorId?: string;
}): Promise<Answer | null> {
  const { data, error } = await supabase
    .from("answers")
    .insert({
      question_id: params.questionId,
      user_id: params.userId,
      parent_id: params.parentId || null,
      body: params.body.trim(),
      verse_reference: params.verseReference?.trim() || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating answer:", error);
    throw error;
  }

  // Increment answers_count in question
  const { data: q } = await supabase.from("questions").select("answers_count").eq("id", params.questionId).single();
  if (q) {
    await supabase.from("questions").update({ answers_count: (q.answers_count || 0) + 1 }).eq("id", params.questionId);
  }

  // Create notification for question author or parent answer author
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
      message: "respondeu à sua pergunta na comunidade.",
    });
  }

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
  const { data: q } = await supabase.from("questions").select("answers_count").eq("id", questionId).single();
  if (q && q.answers_count > 0) {
    await supabase.from("questions").update({ answers_count: q.answers_count - 1 }).eq("id", questionId);
  }
}

// ----------------------------------------------------
// Likes
// ----------------------------------------------------
export async function toggleQuestionLike(questionId: string, userId: string, questionAuthorId?: string): Promise<boolean> {
  const { data: existing } = await supabase
    .from("question_likes")
    .select("id")
    .eq("question_id", questionId)
    .eq("user_id", userId)
    .maybeSingle();

  const { data: q } = await supabase.from("questions").select("likes_count").eq("id", questionId).single();
  const currentLikes = q?.likes_count || 0;

  if (existing) {
    await supabase.from("question_likes").delete().eq("id", existing.id);
    await supabase.from("questions").update({ likes_count: Math.max(0, currentLikes - 1) }).eq("id", questionId);
    return false;
  } else {
    await supabase.from("question_likes").insert({ question_id: questionId, user_id: userId });
    await supabase.from("questions").update({ likes_count: currentLikes + 1 }).eq("id", questionId);

    if (questionAuthorId && questionAuthorId !== userId) {
      await createNotification({
        userId: questionAuthorId,
        actorId: userId,
        type: "question_like",
        questionId,
        message: "curtiu a sua pergunta.",
      });
    }
    return true;
  }
}

export async function toggleAnswerLike(answerId: string, questionId: string, userId: string, answerAuthorId?: string): Promise<boolean> {
  const { data: existing } = await supabase
    .from("answer_likes")
    .select("id")
    .eq("answer_id", answerId)
    .eq("user_id", userId)
    .maybeSingle();

  const { data: a } = await supabase.from("answers").select("likes_count").eq("id", answerId).single();
  const currentLikes = a?.likes_count || 0;

  if (existing) {
    await supabase.from("answer_likes").delete().eq("id", existing.id);
    await supabase.from("answers").update({ likes_count: Math.max(0, currentLikes - 1) }).eq("id", answerId);
    return false;
  } else {
    await supabase.from("answer_likes").insert({ answer_id: answerId, user_id: userId });
    await supabase.from("answers").update({ likes_count: currentLikes + 1 }).eq("id", answerId);

    if (answerAuthorId && answerAuthorId !== userId) {
      await createNotification({
        userId: answerAuthorId,
        actorId: userId,
        type: "answer_like",
        questionId,
        answerId,
        message: "curtiu a sua resposta.",
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
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, name, avatar_url")
    .in("id", actorIds);

  const profileMap = new Map((profiles || []).map((p) => [p.id, p]));

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
// Online Members (Supabase Presence) - Without chat
// ----------------------------------------------------
export function useOnlineMembersCount(userId?: string) {
  const [onlineCount, setOnlineCount] = useState<number>(1);

  useEffect(() => {
    const channel = supabase.channel("community_online_presence", {
      config: {
        presence: {
          key: userId || `guest_${Math.random().toString(36).substring(2, 9)}`,
        },
      },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const keysCount = Object.keys(state).length;
        setOnlineCount(Math.max(1, keysCount));
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return onlineCount;
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
