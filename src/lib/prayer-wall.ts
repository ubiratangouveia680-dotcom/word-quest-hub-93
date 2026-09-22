import { supabase } from "@/integrations/supabase/client";
import { sanitizeText, formatRelativeDate, isQuizInternalRecord } from "@/lib/community";
import { dispatchPrayerNotificationFallback } from "@/lib/user-notifications";
import { notifyNewPrayerRequest } from "@/lib/push.functions";

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

let hasDedicatedTable: boolean | null = null;

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

    // 1. Try prayer_requests table if not confirmed absent
    if (hasDedicatedTable !== false) {
      const { count, error } = await supabase
        .from("prayer_requests")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte("created_at", since);

      if (!error && count !== null) {
        hasDedicatedTable = true;
        return {
          allowed: count < MAX_REQUESTS_PER_24H,
          count,
          remaining: Math.max(0, MAX_REQUESTS_PER_24H - count),
        };
      }
      if (error && (error.code === "42P01" || error.code === "PGRST204" || error.code === "PGRST205" || (error as any).status === 404)) {
        hasDedicatedTable = false;
      }
    }

    // 2. Fallback to questions table
    const { count: qCount, error: qError } = await supabase
      .from("questions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .or("category_id.eq.oracao,title.ilike.%Pedido de Oração%")
      .not("title", "ilike", "[QUIZ_%")
      .not("body", "ilike", '%"displayName":%')
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
  filter?: ("recent" | "most_prayed") | undefined;
  search?: string | undefined;
  currentUserId?: string | null | undefined;
  limit?: number | undefined;
  offset?: number | undefined;
}

export async function fetchPrayerRequests({
  filter = "recent",
  search,
  currentUserId,
  limit = 20,
  offset = 0,
}: FetchPrayerParams): Promise<PrayerRequest[]> {
  if (hasDedicatedTable !== false) {
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
        hasDedicatedTable = true;
        return await enrichPrayerRequests(data, currentUserId);
      }
      if (error && (error.code === "42P01" || error.code === "PGRST204" || (error as any).status === 404)) {
        hasDedicatedTable = false;
      }
    } catch (err) {
      hasDedicatedTable = false;
    }
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
      let profilesData: any[] | null = null;
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("user_id, name, avatar_url")
        .in("user_id", publicUserIds);

      if (!error && profiles) {
        profilesData = profiles;
      } else {
        const { data: fallbackProfiles } = await supabase
          .from("profiles")
          .select("user_id, name")
          .in("user_id", publicUserIds);
        profilesData = fallbackProfiles || [];
      }

      (profilesData || []).forEach((p: any) => {
        profileMap.set(p.user_id, { name: p.name, avatar_url: p.avatar_url || null });
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
      .or("category_id.eq.oracao,title.ilike.%Pedido de Oração%")
      .not("title", "ilike", "[QUIZ_%")
      .not("title", "ilike", "%QUIZ_RANKING%")
      .not("body", "ilike", '%"displayName":%');

    if (search && search.trim()) {
      query = query.or(`body.ilike.%${search.trim()}%,title.ilike.%${search.trim()}%`);
    }

    query = query.order("created_at", { ascending: false });
    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;
    if (error || !data) return [];

    // Filtra defensivamente qualquer publicação interna do quiz
    const validData = data.filter((q) => !isQuizInternalRecord(q));
    if (validData.length === 0) return [];

    // Check prayer reactions (emoji: '🙏') and aggregate counts
    const prayedSet = new Set<string>();
    const prayerCountsMap = new Map<string, number>();

    if (validData.length > 0) {
      try {
        const qIds = validData.map((q) => q.id);
        const { data: reactions } = await supabase
          .from("reactions")
          .select("target_id, user_id")
          .eq("target_type", "question")
          .eq("emoji", "🙏")
          .in("target_id", qIds);

        (reactions || []).forEach((rx) => {
          prayerCountsMap.set(rx.target_id, (prayerCountsMap.get(rx.target_id) || 0) + 1);
          if (currentUserId && rx.user_id === currentUserId) {
            prayedSet.add(rx.target_id);
          }
        });
      } catch (e) {
        console.warn("reactions count warning:", e);
      }
    }

    // Identify profiles for non-anonymous items
    const nonAnonUserIds = validData
      .filter((q) => !q.title?.startsWith("[ANÔNIMO]"))
      .map((q) => q.user_id);

    const profileMap = new Map<string, { name: string | null; avatar_url: string | null }>();
    if (nonAnonUserIds.length > 0) {
      try {
        let profilesData: any[] | null = null;
        const { data: profiles, error } = await supabase
          .from("profiles")
          .select("user_id, name, avatar_url")
          .in("user_id", nonAnonUserIds);

        if (!error && profiles) {
          profilesData = profiles;
        } else {
          const { data: fallbackProfiles } = await supabase
            .from("profiles")
            .select("user_id, name")
            .in("user_id", nonAnonUserIds);
          profilesData = fallbackProfiles || [];
        }

        (profilesData || []).forEach((p: any) => {
          profileMap.set(p.user_id, { name: p.name, avatar_url: p.avatar_url || null });
        });
      } catch {}
    }

    const results: PrayerRequest[] = validData.map((q) => {
      const isAnon = Boolean(q.title?.startsWith("[ANÔNIMO]"));
      const profile = isAnon ? null : profileMap.get(q.user_id);
      const prayedCount = prayerCountsMap.get(q.id) || 0;

      let displayTitle = q.title || null;
      if (isAnon || displayTitle?.startsWith("[ANÔNIMO]")) {
        displayTitle = null;
      }

      return {
        id: q.id,
        user_id: q.user_id,
        content: q.body,
        title: displayTitle,
        verse_reference: q.verse_reference || null,
        is_anonymous: isAnon,
        status: "active",
        prayed_count: prayedCount,
        created_at: q.created_at,
        updated_at: q.updated_at || q.created_at,
        author_name: isAnon ? "Pedido anônimo" : profile?.name || "Irmão(ã) em Cristo",
        author_avatar: isAnon ? null : profile?.avatar_url || null,
        user_has_prayed: prayedSet.has(q.id),
      };
    });

    if (filter === "most_prayed") {
      results.sort((a, b) => b.prayed_count - a.prayed_count);
    }

    return results;
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
  verseReference?: string | undefined;
  isAnonymous?: boolean | undefined;
  authorName?: string | undefined;
}

export async function createPrayerRequest(input: CreatePrayerInput): Promise<PrayerRequest | null> {
  const { data: sessionData } = await supabase.auth.getSession();
  const sessionUser = sessionData?.session?.user;
  if (!sessionUser || !input.userId || sessionUser.id !== input.userId) {
    throw new Error("Para criar um pedido de oração, você precisa criar uma conta gratuita.");
  }

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
  const authorDisplayName = isAnon
    ? "Alguém da comunidade"
    : (input.authorName && input.authorName.trim() ? input.authorName.trim() : "Irmão(ã)");

  if (hasDedicatedTable !== false) {
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
        hasDedicatedTable = true;
        recordPrayerTimestamp(input.userId);

        console.log("[PRAYER] Novo pedido criado");
        console.log("[PRAYER] ID do pedido:", data.id);
        console.log("[PRAYER] Autor:", input.userId);

        // Notificações internas no banco e Web Push disparados de forma segura pelo backend
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token;

        notifyNewPrayerRequest({
          data: {
            authorId: input.userId,
            authorName: authorDisplayName,
            prayerRequestId: data.id,
            content: cleanContent,
            ...(token ? { accessToken: token } : {}),
          },
        }).catch((pushErr) => console.warn("[PUSH/NOTIF] notifyNewPrayerRequest warning:", pushErr));

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
          author_name: isAnon ? "Pedido anônimo" : authorDisplayName,
          user_has_prayed: false,
        };
      }
      if (error && (error.code === "42P01" || error.code === "PGRST204" || (error as any).status === 404)) {
        hasDedicatedTable = false;
      }
    } catch {
      hasDedicatedTable = false;
    }
  }

  // 2. Fallback de transição segura para questions
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
        is_answered: false,
      })
      .select()
      .single();

    if (!qError && qData) {
      recordPrayerTimestamp(input.userId);

      console.log("[PRAYER] Novo pedido criado");
      console.log("[PRAYER] ID do pedido:", qData.id);
      console.log("[PRAYER] Autor:", input.userId);

      // Notificações internas no banco e Web Push disparados de forma segura pelo backend
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      notifyNewPrayerRequest({
        data: {
          authorId: input.userId,
          authorName: authorDisplayName,
          prayerRequestId: qData.id,
          content: cleanContent,
          ...(token ? { accessToken: token } : {}),
        },
      }).catch((pushErr) => console.warn("[PUSH/NOTIF] notifyNewPrayerRequest warning:", pushErr));

      return {
        id: qData.id,
        user_id: qData.user_id,
        content: qData.body,
        title: isAnon ? null : qData.title,
        verse_reference: qData.verse_reference,
        is_anonymous: isAnon,
        status: "active",
        prayed_count: 0,
        created_at: qData.created_at,
        updated_at: qData.updated_at,
        author_name: isAnon ? "Pedido anônimo" : authorDisplayName,
        user_has_prayed: false,
      };
    }

    if (qError) {
      console.error("createPrayerRequest fallback error:", qError);
      throw new Error("Não foi possível publicar seu pedido de oração. Tente novamente.");
    }
  } catch (err: any) {
    console.error("createPrayerRequest error:", err);
    throw new Error(err.message || "Não foi possível publicar seu pedido de oração. Tente novamente.");
  }

  throw new Error("Não foi possível publicar seu pedido. Tente novamente.");
}

// ---------------------------------------------------------------------------
// Toggle Prayer Support ("🙏 Vou orar por você" ⇋ "🙏 Estou orando por você")
// ---------------------------------------------------------------------------
export async function togglePrayerSupport(
  prayerRequestId: string,
  userId: string,
  currentCount: number,
  authorId?: string
): Promise<{ prayed: boolean; count: number }> {
  const { data: sessionData } = await supabase.auth.getSession();
  const sessionUser = sessionData?.session?.user;
  if (!sessionUser || !userId || sessionUser.id !== userId) {
    throw new Error("Para se unir em oração, você precisa criar uma conta gratuita.");
  }

  if (hasDedicatedTable !== false) {
    try {
      // 1. Try prayer_support table
      const { data: existing, error: checkErr } = await supabase
        .from("prayer_support")
        .select("id")
        .eq("prayer_request_id", prayerRequestId)
        .eq("user_id", userId)
        .maybeSingle();

      if (!checkErr) {
        hasDedicatedTable = true;
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
      if (checkErr && (checkErr.code === "42P01" || checkErr.code === "PGRST204" || (checkErr as any).status === 404)) {
        hasDedicatedTable = false;
      }
    } catch {
      hasDedicatedTable = false;
    }
  }

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
        .eq("id", existingRx.id);
    } else {
      await supabase.from("reactions").insert({
        target_type: "question",
        target_id: prayerRequestId,
        user_id: userId,
        emoji: "🙏",
        reaction_name: "Orando",
      });

      // Disparar notificação para o autor se for outro usuário
      if (authorId && authorId !== userId) {
        try {
          await supabase.from("notifications").insert({
            user_id: authorId,
            actor_id: userId,
            type: "reaction",
            question_id: prayerRequestId,
            message: "marcou que está orando pelo seu pedido de oração. 🙏",
          });
        } catch {}
      }
    }

    // Consulta contagem precisa em reactions
    const { count } = await supabase
      .from("reactions")
      .select("*", { count: "exact", head: true })
      .eq("target_type", "question")
      .eq("target_id", prayerRequestId)
      .eq("emoji", "🙏");

    const fallbackCount = existingRx ? Math.max(0, currentCount - 1) : currentCount + 1;
    return { prayed: !existingRx, count: count !== null && count !== undefined ? count : fallbackCount };
  } catch (err) {
    console.error("togglePrayerSupport fallback error:", err);
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Delete Prayer Request (Author or Admin)
// ---------------------------------------------------------------------------
export async function deletePrayerRequest(id: string, userId: string): Promise<boolean> {
  const { data: sessionData } = await supabase.auth.getSession();
  const sessionUser = sessionData?.session?.user;
  if (!sessionUser || !userId || sessionUser.id !== userId) {
    throw new Error("Não autorizado.");
  }

  if (hasDedicatedTable !== false) {
    try {
      const { error } = await supabase
        .from("prayer_requests")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);

      if (!error) return true;
      if (error && (error.code === "42P01" || error.code === "PGRST204" || (error as any).status === 404)) {
        hasDedicatedTable = false;
      }
    } catch {
      hasDedicatedTable = false;
    }
  }

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
  const { data: sessionData } = await supabase.auth.getSession();
  const sessionUser = sessionData?.session?.user;
  if (!sessionUser || !input.reporterUserId || sessionUser.id !== input.reporterUserId) {
    throw new Error("Para reportar um pedido, você precisa criar uma conta gratuita.");
  }
  if (hasDedicatedTable !== false) {
    try {
      const { error } = await supabase.from("prayer_reports").insert({
        prayer_request_id: input.prayerRequestId,
        reporter_user_id: input.reporterUserId,
        reason: input.reason,
        status: "pending",
      });

      if (!error) return true;
      if (error && (error.code === "42P01" || error.code === "PGRST204" || (error as any).status === 404)) {
        hasDedicatedTable = false;
      }
    } catch {
      hasDedicatedTable = false;
    }
  }

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
  if (hasDedicatedTable !== false) {
    try {
      const { data, error } = await supabase
        .from("prayer_requests")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (!error && Array.isArray(data)) {
        hasDedicatedTable = true;
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
      if (error && (error.code === "42P01" || error.code === "PGRST204" || (error as any).status === 404)) {
        hasDedicatedTable = false;
      }
    } catch {
      hasDedicatedTable = false;
    }
  }

  // Fallback to questions
  try {
    const { data: qData, error: qError } = await supabase
      .from("questions")
      .select("*")
      .eq("user_id", userId)
      .eq("category_id", "oracao")
      .not("title", "ilike", "[QUIZ_%")
      .not("body", "ilike", '%"displayName":%')
      .order("created_at", { ascending: false });

    const filteredQData = (qData || []).filter((q) => !isQuizInternalRecord(q));

    if (!qError && Array.isArray(filteredQData)) {
      const qIds = filteredQData.map((q) => q.id);
      const prayerCountsMap = new Map<string, number>();

      if (qIds.length > 0) {
        try {
          const { data: reactions } = await supabase
            .from("reactions")
            .select("target_id")
            .eq("target_type", "question")
            .eq("emoji", "🙏")
            .in("target_id", qIds);

          (reactions || []).forEach((rx) => {
            prayerCountsMap.set(rx.target_id, (prayerCountsMap.get(rx.target_id) || 0) + 1);
          });
        } catch {}
      }

      return filteredQData.map((q) => {
        const isAnon = Boolean(q.title?.startsWith("[ANÔNIMO]"));
        let displayTitle: string | null = q.title;
        if (isAnon || displayTitle?.startsWith("[ANÔNIMO]")) {
          displayTitle = null;
        }

        return {
          id: q.id,
          user_id: q.user_id,
          content: q.body,
          title: displayTitle,
          verse_reference: q.verse_reference,
          is_anonymous: isAnon,
          status: "active",
          prayed_count: prayerCountsMap.get(q.id) || 0,
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

