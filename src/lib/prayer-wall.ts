import { supabase } from "@/integrations/supabase/client";
import { sanitizeText, formatRelativeDate } from "@/lib/community";

export interface PrayerRequest {
  id: string;
  user_id: string;
  content: string;
  title: string | null;
  verse_reference: string | null;
  is_anonymous: boolean;
  status: string;
  prayed_count: number;
  created_at: string;
  updated_at: string;
  author_name?: string | null;
  author_avatar?: string | null;
  user_has_prayed?: boolean;
}

export const PRAYER_REPORT_REASONS = [
  "Spam",
  "Conteúdo ofensivo",
  "Conteúdo impróprio",
  "Golpe/fraude",
  "Outro",
] as const;

export type PrayerReportReason = (typeof PRAYER_REPORT_REASONS)[number];

const MAX_CHAR_LIMIT = 1000;
const MAX_REQUESTS_PER_24H = 5;
const COOLDOWN_MS = 15000;

export { formatRelativeDate };

// ---------------------------------------------------------------------------
// Anti-Spam Local & Temporal Helpers
// ---------------------------------------------------------------------------
export function checkPrayerCooldown(userId?: string): {
  allowed: boolean;
  remainingSeconds: number;
} {
  if (typeof window === "undefined") {
    return { allowed: true, remainingSeconds: 0 };
  }
  const key = userId ? `bo:last_prayer_post_${userId}` : "bo:last_prayer_post";
  const lastPost = localStorage.getItem(key);
  if (!lastPost) {
    return { allowed: true, remainingSeconds: 0 };
  }
  const diff = Date.now() - parseInt(lastPost, 10);
  if (diff < COOLDOWN_MS) {
    const remainingSeconds = Math.ceil((COOLDOWN_MS - diff) / 1000);
    return { allowed: false, remainingSeconds };
  }
  return { allowed: true, remainingSeconds: 0 };
}

export function recordPrayerTimestamp(userId?: string) {
  if (typeof window === "undefined") return;
  const now = String(Date.now());
  localStorage.setItem("bo:last_prayer_post", now);
  if (userId) {
    localStorage.setItem(`bo:last_prayer_post_${userId}`, now);
  }
}

// ---------------------------------------------------------------------------
// Helper: Check 24h Quota (max 5 requests per 24 hours)
// ---------------------------------------------------------------------------
export async function checkPrayerDailyQuota(userId: string): Promise<{
  allowed: boolean;
  count: number;
  remaining: number;
}> {
  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // 1. Try prayer_requests table
    const { count, error } = await supabase
      .from("prayer_requests")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", since);

    if (!error && count !== null) {
      return {
        allowed: count < MAX_REQUESTS_PER_24H,
        count,
        remaining: Math.max(0, MAX_REQUESTS_PER_24H - count),
      };
    }

    // 2. Fallback to questions table (category_id = 'oracao')
    const { count: qCount, error: qError } = await supabase
      .from("questions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("category_id", "oracao")
      .gte("created_at", since);

    if (!qError && qCount !== null) {
      return {
        allowed: qCount < MAX_REQUESTS_PER_24H,
        count: qCount,
        remaining: Math.max(0, MAX_REQUESTS_PER_24H - qCount),
      };
    }

    return { allowed: true, count: 0, remaining: MAX_REQUESTS_PER_24H };
  } catch {
    return { allowed: true, count: 0, remaining: MAX_REQUESTS_PER_24H };
  }
}

// ---------------------------------------------------------------------------
// Fetch Prayer Requests (Dual Adapter: prayer_requests or questions fallback)
// ---------------------------------------------------------------------------
export interface FetchPrayerParams {
  filter?: "recent" | "most_prayed";
  search?: string;
  currentUserId?: string | null;
  limit?: number;
  offset?: number;
}

export async function fetchPrayerRequests({
  filter = "recent",
  search,
  currentUserId,
  limit = 20,
  offset = 0,
}: FetchPrayerParams): Promise<PrayerRequest[]> {
  try {
    // TENTATIVA 1: Tabela dedicada prayer_requests
    let query = supabase
      .from("prayer_requests")
      .select("*")
      .in("status", ["active", "hidden"]);

    if (search && search.trim()) {
      query = query.ilike("content", `%${search.trim()}%`);
    }

    if (filter === "most_prayed") {
      query = query.order("prayed_count", { ascending: false }).order("created_at", { ascending: false });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (!error && Array.isArray(data)) {
      return await enrichPrayerRequests(data, currentUserId);
    }
  } catch (err) {
    console.warn("prayer_requests query error, checking fallback:", err);
  }

  // TENTATIVA 2: Fallback transparente para questions (category_id = 'oracao')
  return await fetchPrayerRequestsFromQuestionsFallback({ filter, search, currentUserId, limit, offset });
}

// ---------------------------------------------------------------------------
// Enrich Prayer Requests (User Profiles & Support state)
// ---------------------------------------------------------------------------
async function enrichPrayerRequests(
  rawList: any[],
  currentUserId?: string | null
): Promise<PrayerRequest[]> {
  if (rawList.length === 0) return [];

  // 1. Identify author profiles needed for NON-ANONYMOUS posts
  const publicUserIds = Array.from(
    new Set(
      rawList
        .filter((item) => !item.is_anonymous)
        .map((item) => item.user_id)
    )
  );

  const profileMap = new Map<string, { name: string | null; avatar_url: string | null }>();
  if (publicUserIds.length > 0) {
    try {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, name, avatar_url")
        .in("user_id", publicUserIds);

      (profiles || []).forEach((p) => {
        profileMap.set(p.user_id, { name: p.name, avatar_url: p.avatar_url });
      });
    } catch {}
  }

  // 2. Identify which ones current user is praying for
  const prayedSet = new Set<string>();
  if (currentUserId) {
    try {
      const reqIds = rawList.map((r) => r.id);
      const { data: supportRows } = await supabase
        .from("prayer_support")
        .select("prayer_request_id")
        .eq("user_id", currentUserId)
        .in("prayer_request_id", reqIds);

      (supportRows || []).forEach((s) => {
        prayedSet.add(s.prayer_request_id);
      });
    } catch {}
  }

  return rawList.map((r) => {
    const isAnon = Boolean(r.is_anonymous);
    const profile = isAnon ? null : profileMap.get(r.user_id);

    return {
      id: r.id,
      user_id: r.user_id,
      content: r.content || r.body || "",
      title: r.title || null,
      verse_reference: r.verse_reference || null,
      is_anonymous: isAnon,
      status: r.status || "active",
      prayed_count: Number(r.prayed_count || 0),
      created_at: r.created_at,
      updated_at: r.updated_at || r.created_at,
      author_name: isAnon ? "Pedido anônimo" : profile?.name || "Irmão(ã) em Cristo",
      author_avatar: isAnon ? null : profile?.avatar_url || null,
      user_has_prayed: prayedSet.has(r.id),
    };
  });
}

// ---------------------------------------------------------------------------
// Fallback Adapter using 'questions' table
// ---------------------------------------------------------------------------
async function fetchPrayerRequestsFromQuestionsFallback({
  filter,
  search,
  currentUserId,
  limit = 20,
  offset = 0,
}: FetchPrayerParams): Promise<PrayerRequest[]> {
  try {
    let query = supabase
      .from("questions")
      .select("*")
      .eq("category_id", "oracao");

    if (search && search.trim()) {
      query = query.or(`body.ilike.%${search.trim()}%,title.ilike.%${search.trim()}%`);
    }

    if (filter === "most_prayed") {
      query = query.order("likes_count", { ascending: false }).order("created_at", { ascending: false });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;
    if (error || !data) return [];

    // Check user prayer reactions (emoji: '🙏')
    const prayedSet = new Set<string>();
    if (currentUserId && data.length > 0) {
      try {
        const qIds = data.map((q) => q.id);
        const { data: reactions } = await supabase
          .from("reactions")
          .select("target_id")
          .eq("target_type", "question")
          .eq("emoji", "🙏")
          .eq("user_id", currentUserId)
          .in("target_id", qIds);

        (reactions || []).forEach((rx) => prayedSet.add(rx.target_id));
      } catch {}
    }

    // Identify profiles for non-anonymous items
    const nonAnonUserIds = data
      .filter((q) => !q.title?.startsWith("[ANÔNIMO]"))
      .map((q) => q.user_id);

    const profileMap = new Map<string, { name: string | null; avatar_url: string | null }>();
    if (nonAnonUserIds.length > 0) {
      try {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, name, avatar_url")
          .in("user_id", nonAnonUserIds);

        (profiles || []).forEach((p) => {
          profileMap.set(p.user_id, { name: p.name, avatar_url: p.avatar_url });
        });
      } catch {}
    }

    return data.map((q) => {
      const isAnon = Boolean(q.title?.startsWith("[ANÔNIMO]"));
      const profile = isAnon ? null : profileMap.get(q.user_id);

      return {
        id: q.id,
        user_id: q.user_id,
        content: q.body,
        title: isAnon ? null : q.title || null,
        verse_reference: q.verse_reference || null,
        is_anonymous: isAnon,
        status: "active",
        prayed_count: Number(q.likes_count || 0),
        created_at: q.created_at,
        updated_at: q.updated_at || q.created_at,
        author_name: isAnon ? "Pedido anônimo" : profile?.name || "Irmão(ã) em Cristo",
        author_avatar: isAnon ? null : profile?.avatar_url || null,
        user_has_prayed: prayedSet.has(q.id),
      };
    });
  } catch (err) {
    console.error("fetchPrayerRequestsFromQuestionsFallback error:", err);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Create Prayer Request
// ---------------------------------------------------------------------------
export interface CreatePrayerInput {
  userId: string;
  content: string;
  verseReference?: string;
  isAnonymous?: boolean;
}

export async function createPrayerRequest(input: CreatePrayerInput): Promise<PrayerRequest | null> {
  const cleanContent = sanitizeText(input.content.trim());
  if (!cleanContent || cleanContent.length < 5) {
    throw new Error("Por favor, escreva um pedido de oração com no mínimo 5 caracteres.");
  }
  if (cleanContent.length > MAX_CHAR_LIMIT) {
    throw new Error(`O pedido excede o limite máximo de ${MAX_CHAR_LIMIT} caracteres.`);
  }

  // Anti-spam checks
  const cooldown = checkPrayerCooldown(input.userId);
  if (!cooldown.allowed) {
    throw new Error(`Por favor, aguarde ${cooldown.remainingSeconds} segundos antes de enviar um novo pedido.`);
  }

  const quota = await checkPrayerDailyQuota(input.userId);
  if (!quota.allowed) {
    throw new Error(`Você atingiu o limite de ${MAX_REQUESTS_PER_24H} pedidos de oração por dia. Que o Senhor abençoe suas preces!`);
  }

  const isAnon = Boolean(input.isAnonymous);
  const cleanVerse = input.verseReference ? sanitizeText(input.verseReference.trim()) : null;

  try {
    // 1. Try prayer_requests table
    const { data, error } = await supabase
      .from("prayer_requests")
      .insert({
        user_id: input.userId,
        content: cleanContent,
        title: cleanContent.slice(0, 60),
        verse_reference: cleanVerse,
        is_anonymous: isAnon,
        status: "active",
        prayed_count: 0,
      })
      .select()
      .single();

    if (!error && data) {
      recordPrayerTimestamp(input.userId);
      return {
        id: data.id,
        user_id: data.user_id,
        content: data.content,
        title: data.title,
        verse_reference: data.verse_reference,
        is_anonymous: data.is_anonymous,
        status: data.status,
        prayed_count: 0,
        created_at: data.created_at,
        updated_at: data.updated_at,
        author_name: isAnon ? "Pedido anônimo" : null,
        user_has_prayed: false,
      };
    }
  } catch {}

  // 2. Fallback to questions table
  try {
    const titleTag = isAnon ? `[ANÔNIMO] Pedido de Oração` : cleanContent.slice(0, 60);
    const { data: qData, error: qError } = await supabase
      .from("questions")
      .insert({
        category_id: "oracao",
        user_id: input.userId,
        title: titleTag,
        body: cleanContent,
        verse_reference: cleanVerse,
        likes_count: 0,
        answers_count: 0,
        views_count: 0,
      })
      .select()
      .single();

    if (!qError && qData) {
      recordPrayerTimestamp(input.userId);
      return {
        id: qData.id,
        user_id: qData.user_id,
        content: qData.body,
        title: qData.title,
        verse_reference: qData.verse_reference,
        is_anonymous: isAnon,
        status: "active",
        prayed_count: 0,
        created_at: qData.created_at,
        updated_at: qData.updated_at,
        author_name: isAnon ? "Pedido anônimo" : null,
        user_has_prayed: false,
      };
    }
  } catch (err: any) {
    console.error("createPrayerRequest fallback error:", err);
    throw new Error(err.message || "Não foi possível publicar seu pedido. Tente novamente.");
  }

  throw new Error("Não foi possível publicar seu pedido. Tente novamente.");
}

// ---------------------------------------------------------------------------
// Toggle Prayer Support ("🙏 Vou orar por você" ⇋ "🙏 Estou orando por você")
// ---------------------------------------------------------------------------
export async function togglePrayerSupport(
  prayerRequestId: string,
  userId: string,
  currentCount: number
): Promise<{ prayed: boolean; count: number }> {
  try {
    // 1. Try prayer_support table
    const { data: existing, error: checkErr } = await supabase
      .from("prayer_support")
      .select("id")
      .eq("prayer_request_id", prayerRequestId)
      .eq("user_id", userId)
      .maybeSingle();

    if (!checkErr) {
      if (existing) {
        // Remove prayer support (Deixar de orar)
        await supabase
          .from("prayer_support")
          .delete()
          .eq("prayer_request_id", prayerRequestId)
          .eq("user_id", userId);

        const newCount = Math.max(0, currentCount - 1);
        await supabase
          .from("prayer_requests")
          .update({ prayed_count: newCount })
          .eq("id", prayerRequestId);

        return { prayed: false, count: newCount };
      } else {
        // Add prayer support
        await supabase
          .from("prayer_support")
          .insert({ prayer_request_id: prayerRequestId, user_id: userId });

        const newCount = currentCount + 1;
        await supabase
          .from("prayer_requests")
          .update({ prayed_count: newCount })
          .eq("id", prayerRequestId);

        return { prayed: true, count: newCount };
      }
    }
  } catch {}

  // 2. Fallback to reactions table
  try {
    const { data: existingRx } = await supabase
      .from("reactions")
      .select("id")
      .eq("target_type", "question")
      .eq("target_id", prayerRequestId)
      .eq("user_id", userId)
      .eq("emoji", "🙏")
      .maybeSingle();

    if (existingRx) {
      await supabase
        .from("reactions")
        .delete()
        .eq("target_type", "question")
        .eq("target_id", prayerRequestId)
        .eq("user_id", userId)
        .eq("emoji", "🙏");

      const newCount = Math.max(0, currentCount - 1);
      await supabase.from("questions").update({ likes_count: newCount }).eq("id", prayerRequestId);
      return { prayed: false, count: newCount };
    } else {
      await supabase.from("reactions").insert({
        target_type: "question",
        target_id: prayerRequestId,
        user_id: userId,
        emoji: "🙏",
        reaction_name: "Orando",
      });

      const newCount = currentCount + 1;
      await supabase.from("questions").update({ likes_count: newCount }).eq("id", prayerRequestId);
      return { prayed: true, count: newCount };
    }
  } catch (err) {
    console.error("togglePrayerSupport fallback error:", err);
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Delete Prayer Request (Author or Admin)
// ---------------------------------------------------------------------------
export async function deletePrayerRequest(id: string, userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("prayer_requests")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (!error) return true;
  } catch {}

  // Fallback to questions
  try {
    const { error: qError } = await supabase
      .from("questions")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    return !qError;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Report Prayer Request
// ---------------------------------------------------------------------------
export async function reportPrayerRequest(input: {
  prayerRequestId: string;
  reporterUserId: string;
  reason: PrayerReportReason;
}): Promise<boolean> {
  try {
    const { error } = await supabase.from("prayer_reports").insert({
      prayer_request_id: input.prayerRequestId,
      reporter_user_id: input.reporterUserId,
      reason: input.reason,
      status: "pending",
    });

    if (!error) return true;
  } catch {}

  // Fallback to community_reports
  try {
    const { error: qError } = await supabase.from("community_reports").insert({
      target_type: "question",
      target_id: input.prayerRequestId,
      reporter_id: input.reporterUserId,
      reason: input.reason,
      status: "pending",
    });

    return !qError;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Fetch User's Own Prayer Requests (For /perfil)
// ---------------------------------------------------------------------------
export async function fetchMyPrayerRequests(userId: string): Promise<PrayerRequest[]> {
  try {
    const { data, error } = await supabase
      .from("prayer_requests")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error && Array.isArray(data)) {
      return data.map((r) => ({
        id: r.id,
        user_id: r.user_id,
        content: r.content,
        title: r.title,
        verse_reference: r.verse_reference,
        is_anonymous: Boolean(r.is_anonymous),
        status: r.status,
        prayed_count: Number(r.prayed_count || 0),
        created_at: r.created_at,
        updated_at: r.updated_at,
        author_name: r.is_anonymous ? "Publicado como anônimo" : "Você",
        user_has_prayed: false,
      }));
    }
  } catch {}

  // Fallback
  try {
    const { data: qData, error: qError } = await supabase
      .from("questions")
      .select("*")
      .eq("user_id", userId)
      .eq("category_id", "oracao")
      .order("created_at", { ascending: false });

    if (!qError && Array.isArray(qData)) {
      return qData.map((q) => {
        const isAnon = Boolean(q.title?.startsWith("[ANÔNIMO]"));
        return {
          id: q.id,
          user_id: q.user_id,
          content: q.body,
          title: q.title,
          verse_reference: q.verse_reference,
          is_anonymous: isAnon,
          status: "active",
          prayed_count: Number(q.likes_count || 0),
          created_at: q.created_at,
          updated_at: q.updated_at,
          author_name: isAnon ? "Publicado como anônimo" : "Você",
          user_has_prayed: false,
        };
      });
    }
  } catch {}

  return [];
}
