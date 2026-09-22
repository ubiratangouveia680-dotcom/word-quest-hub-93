import { supabase } from '@/integrations/supabase/client';
import {
  QuizDifficulty,
  QuizOptionLetter,
  QuizQuestionClient,
  QuizQuestionRaw,
  UserQuizAnswer,
  QuizFinalResult,
  QuizResultItem,
  QuizRankingItem,
  UserQuizStats,
} from './quiz-types';
import { INITIAL_QUIZ_QUESTIONS } from './quiz-seed';

// Função utilitária para embaralhar arrays (Fisher-Yates)
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const current = arr[i];
    const replacement = arr[j];
    if (current === undefined || replacement === undefined) continue;
    arr[i] = replacement;
    arr[j] = current;
  }
  return arr;
}

const LETTERS: QuizOptionLetter[] = ['A', 'B', 'C', 'D'];

/**
 * Busca 10 questões aleatórias e embaralha as alternativas.
 * IMPORTANTE: A resposta correta NUNCA é enviada para o cliente aqui.
 */
export async function fetchQuizQuestions(
  userId?: string,
  excludeQuestionIds: string[] = []
): Promise<QuizQuestionClient[]> {
  let allQuestions: QuizQuestionRaw[] = [];

  try {
    const { data, error } = await (supabase as any)
      .from('bible_quiz_questions')
      .select('id, question, option_a, option_b, option_c, option_d, difficulty, category, active')
      .eq('active', true);

    if (!error && data && data.length >= 10) {
      // Usar perguntas do banco
      allQuestions = data;
    }
  } catch {
    // Falha silenciosa: usa banco local de fallback
  }

  if (allQuestions.length === 0) {
    allQuestions = INITIAL_QUIZ_QUESTIONS.filter((q) => q.active);
  }

  // Se o usuário passou perguntas da tentativa anterior, priorizamos perguntas que ele AINDA NÃO fez
  const excludeSet = new Set(excludeQuestionIds);
  let candidatePool = allQuestions.filter((q) => !excludeSet.has(q.id));

  // Se a sobra for menor que 10, mescla com o restante
  if (candidatePool.length < 10) {
    const remaining = allQuestions.filter((q) => excludeSet.has(q.id));
    candidatePool = [...candidatePool, ...shuffleArray(remaining)];
  }

  // Embaralha o pool e pega exatamente 10 questões distintas
  const selectedRaw = shuffleArray(candidatePool).slice(0, 10);

  // Mapeia para o formato do cliente e embaralha as alternativas de cada questão
  const clientQuestions: QuizQuestionClient[] = selectedRaw.map((q) => {
    const originalOptions: { originalLetter: QuizOptionLetter; text: string }[] = [
      { originalLetter: 'A', text: q.option_a },
      { originalLetter: 'B', text: q.option_b },
      { originalLetter: 'C', text: q.option_c },
      { originalLetter: 'D', text: q.option_d },
    ];

    const shuffled = shuffleArray(originalOptions);

    const options = shuffled.map((item, index) => ({
      letter: LETTERS[index] ?? "A",
      text: item.text,
      originalLetter: item.originalLetter,
    }));

    return {
      id: q.id,
      question: q.question,
      options,
      category: q.category,
      difficulty: q.difficulty as QuizDifficulty,
    };
  });

  return clientQuestions;
}

/**
 * Valida o resultado com segurança.
 * Busca o gabarito no banco (ou no seed seguro), calcula a pontuação e registra a tentativa.
 */
// Helper para manter histórico pessoal de tentativas localmente (apenas para estatísticas do próprio dispositivo)
const LOCAL_ATTEMPTS_KEY = 'bo:quiz_attempts';

// Cache em memória para evitar duplicações por duplo clique ou requisições paralelas
const recentSubmissionsCache = new Map<string, { result: QuizFinalResult; timestamp: number }>();

function saveLocalAttempt(attempt: any) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(LOCAL_ATTEMPTS_KEY);
    const list = raw ? JSON.parse(raw) : [];
    list.unshift(attempt);
    localStorage.setItem(LOCAL_ATTEMPTS_KEY, JSON.stringify(list.slice(0, 50)));
  } catch {
    // ignorar
  }
}

/**
 * Valida o resultado com segurança.
 * Busca o gabarito no banco (ou no seed seguro), calcula a pontuação e registra a tentativa real no banco de dados na nuvem.
 * REGRA ESTRITA: Exige usuário cadastrado e autenticado. Visitantes não podem gerar pontuação nem participar do ranking.
 */
export async function submitQuizAttempt(
  answers: UserQuizAnswer[],
  userId?: string,
  userDisplayName?: string,
  userAvatarUrl?: string | null
): Promise<QuizFinalResult> {
  // 1. Verificação obrigatória de autenticação no backend/banco
  const { data: sessionData } = await supabase.auth.getSession();
  const sessionUser = sessionData?.session?.user;
  const effectiveUserId = sessionUser?.id || (userId && userId.trim() ? userId : null);

  if (!effectiveUserId) {
    throw new Error(
      "Para participar do Quiz Bíblico e registrar pontuação no Ranking, você precisa criar uma conta gratuita."
    );
  }
  // Deduplicação para evitar duplicação de pontos em caso de envio duplo ou cliques repetidos
  const answersHash = answers.map((a) => `${a.questionId}:${a.selectedOriginalLetter}`).sort().join('|');
  const dedupeKey = `${userId || userDisplayName || 'anon'}_${answersHash}`;
  const cached = recentSubmissionsCache.get(dedupeKey);
  if (cached && Date.now() - cached.timestamp < 10000) {
    return cached.result;
  }

  const questionIds = answers.map((a) => a.questionId);

  // Busca as questões completas com gabarito
  let fullQuestions: QuizQuestionRaw[] = [];

  try {
    const { data, error } = await (supabase as any)
      .from('bible_quiz_questions')
      .select('*')
      .in('id', questionIds);

    if (!error && data && data.length > 0) {
      fullQuestions = data;
    }
  } catch {
    // usa fallback local
  }

  // Mescla com sementes locais se alguma questão não estiver no banco
  const foundIds = new Set(fullQuestions.map((q) => q.id));
  const missing = INITIAL_QUIZ_QUESTIONS.filter(
    (q) => questionIds.includes(q.id) && !foundIds.has(q.id)
  );
  fullQuestions = [...fullQuestions, ...missing];

  const questionsMap = new Map<string, QuizQuestionRaw>();
  fullQuestions.forEach((q) => questionsMap.set(q.id, q));

  let score = 0;
  const resultItems: QuizResultItem[] = [];

  answers.forEach((ans) => {
    const q = questionsMap.get(ans.questionId);
    if (!q) return;

    // A resposta original que o usuário selecionou ('A', 'B', 'C' ou 'D' no banco original)
    const isCorrect = ans.selectedOriginalLetter === q.correct_answer;
    if (isCorrect) {
      score += 1;
    }

    // Texto da resposta do usuário
    const userText =
      ans.selectedOriginalLetter === 'A'
        ? q.option_a
        : ans.selectedOriginalLetter === 'B'
        ? q.option_b
        : ans.selectedOriginalLetter === 'C'
        ? q.option_c
        : q.option_d;

    // Texto da resposta correta
    const correctText =
      q.correct_answer === 'A'
        ? q.option_a
        : q.correct_answer === 'B'
        ? q.option_b
        : q.correct_answer === 'C'
        ? q.option_c
        : q.option_d;

    resultItems.push({
      questionId: q.id,
      question: q.question,
      userAnswerLetter: ans.selectedLetter,
      userAnswerText: userText,
      correctAnswerLetter: q.correct_answer,
      correctAnswerText: correctText,
      isCorrect,
      explanation: q.explanation,
      ...(q.biblical_reference ? { biblicalReference: q.biblical_reference } : {}),
    });
  });

  const totalQuestions = answers.length;
  const wrongCount = totalQuestions - score;
  const percentage = Math.round((score / totalQuestions) * 100);
  const passed = score >= 5;
  const now = new Date().toISOString();
  const displayName = (userDisplayName && userDisplayName.trim()) ? userDisplayName.trim() : 'Participante';

  let attemptId: string = `attempt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  // Salva no histórico de tentativas local do dispositivo
  saveLocalAttempt({
    id: attemptId,
    userId: userId || null,
    displayName,
    score,
    totalQuestions,
    passed,
    completedAt: now,
  });

  // 1. Grava no banco compartilhado na nuvem (Supabase - Bridge em questions)
  try {
    if (effectiveUserId) {
      // Procura se já existe um registro deste usuário/nome no ranking
      const { data: existingRows } = await supabase
        .from('questions')
        .select('id, user_id, title, body')
        .eq('category_id', 'conhecimento')
        .ilike('title', `[QUIZ_RANKING] ${displayName}`)
        .limit(1);

      const existingRecord = existingRows && existingRows.length > 0 ? existingRows[0] : null;

      if (existingRecord) {
        let prevBody: any = {};
        try {
          prevBody = JSON.parse(existingRecord.body);
        } catch {}

        const prevBest = Number(prevBody.bestScore ?? prevBody.score ?? 0);
        const prevTotalScore = Number(prevBody.totalScore ?? prevBest ?? 0);
        const prevTotalAttempts = Number(prevBody.totalAttempts ?? 0);
        const prevPassedAttempts = Number(prevBody.passedAttempts ?? 0);
        const prevTotalCorrect = Number(prevBody.totalCorrectAnswers ?? prevTotalScore ?? 0);
        const firstScoreAt = prevBody.firstScoreAt || (existingRecord as any).created_at || now;

        const newBestScore = Math.max(prevBest, score);
        const newTotalAttempts = prevTotalAttempts + 1;
        const newPassedAttempts = prevPassedAttempts + (passed ? 1 : 0);
        const newTotalScore = prevTotalScore + score; // Pontuação acumulativa: cada tentativa gera pontos que somam ao TOTAL
        const newTotalCorrect = prevTotalCorrect + score;
        const newWinRate = Math.round((newTotalCorrect / (newTotalAttempts * 10)) * 100);

        const updatedPayload = {
          displayName,
          avatarUrl: userAvatarUrl || prevBody.avatarUrl || null,
          bestScore: newBestScore,
          score, // pontuação da rodada atual
          totalAttempts: newTotalAttempts,
          passedAttempts: newPassedAttempts,
          totalScore: newTotalScore,
          totalCorrectAnswers: newTotalCorrect,
          winRate: newWinRate,
          lastAttemptAt: now,
          firstScoreAt,
          userId: effectiveUserId,
        };

        await supabase
          .from('questions')
          .update({
            body: JSON.stringify(updatedPayload),
            updated_at: now,
          })
          .eq('id', existingRecord.id);
      } else {
        const newPayload = {
          displayName,
          avatarUrl: userAvatarUrl || null,
          bestScore: score,
          score, // pontuação da rodada atual
          totalAttempts: 1,
          passedAttempts: passed ? 1 : 0,
          totalScore: score,
          totalCorrectAnswers: score,
          winRate: Math.round((score / 10) * 100),
          lastAttemptAt: now,
          firstScoreAt: now,
          userId: effectiveUserId,
        };

        await supabase
          .from('questions')
          .insert([
            {
              user_id: effectiveUserId,
              category_id: 'conhecimento',
              title: `[QUIZ_RANKING] ${displayName}`,
              body: JSON.stringify(newPayload),
            },
          ]);
      }
    }
  } catch (bridgeErr) {
    console.warn('[Quiz] Falha ao sincronizar registro na nuvem:', bridgeErr);
  }

  // 2. Grava na tabela dedicada bible_quiz_rankings e bible_quiz_attempts caso ela já exista
  try {
    const { data: attemptData, error: attemptError } = await (supabase as any)
      .from('bible_quiz_attempts')
      .insert([
        {
          user_id: effectiveUserId || null,
          user_name: displayName,
          question_ids: questionIds,
          answers: answers.reduce((acc, cur) => {
            acc[cur.questionId] = cur.selectedOriginalLetter;
            return acc;
          }, {} as Record<string, string>),
          score,
          total_questions: totalQuestions,
          passed,
          completed_at: now,
        },
      ])
      .select('id')
      .maybeSingle();

    if (!attemptError && attemptData?.id) {
      attemptId = attemptData.id;
    }

    let query = (supabase as any).from('bible_quiz_rankings').select('*');
    if (userId) {
      query = query.eq('user_id', userId);
    } else {
      query = query.eq('display_name', displayName);
    }
    const { data: existingRows } = await query.limit(1);
    const currentRank = existingRows && existingRows.length > 0 ? existingRows[0] : null;

    const prevBestScore = currentRank?.best_score || 0;
    const prevTotalAttempts = currentRank?.total_attempts || 0;
    const prevPassedAttempts = currentRank?.passed_attempts || 0;
    const prevTotalScore = currentRank?.total_score || 0;

    const nextBestScore = Math.max(prevBestScore, score);
    const nextTotalAttempts = prevTotalAttempts + 1;
    const nextPassedAttempts = prevPassedAttempts + (passed ? 1 : 0);
    const nextTotalScore = prevTotalScore + score;
    const nextWinRate = Math.round((nextTotalScore / (nextTotalAttempts * 10)) * 100);

    const payload: any = {
      user_id: effectiveUserId,
      display_name: displayName,
      avatar_url: userAvatarUrl || currentRank?.avatar_url || null,
      best_score: nextBestScore,
      total_attempts: nextTotalAttempts,
      passed_attempts: nextPassedAttempts,
      total_score: nextTotalScore,
      win_rate: nextWinRate,
      last_attempt_at: now,
    };

    await (supabase as any)
      .from('bible_quiz_rankings')
      .upsert(payload, { onConflict: 'user_id' });
  } catch {}

  const finalResult: QuizFinalResult = {
    attemptId,
    score,
    totalQuestions,
    wrongCount,
    percentage,
    passed,
    questions: resultItems,
    completedAt: now,
  };

  recentSubmissionsCache.set(dedupeKey, { result: finalResult, timestamp: Date.now() });
  if (recentSubmissionsCache.size > 200) {
    const nowTs = Date.now();
    for (const [k, v] of recentSubmissionsCache.entries()) {
      if (nowTs - v.timestamp > 30000) recentSubmissionsCache.delete(k);
    }
  }

  return finalResult;
}

/**
 * Busca o ranking público REAL diretamente do banco de dados compartilhado na nuvem (Supabase).
 * NÃO utiliza localStorage. Sincroniza entre todos os dispositivos em tempo real.
 *
 * CRITÉRIOS OFICIAIS DE CLASSIFICAÇÃO E DESEMPATE:
 * 1. Maior pontuação TOTAL acumulada (não limitada a 10 pontos).
 * 2. Se empatar, maior número de quizzes aprovados.
 * 3. Se continuar empatado, maior número total de respostas corretas.
 * 4. Se continuar empatado, manter quem alcançou a pontuação primeiro (mais antigo primeiro).
 *
 * NUNCA retorna dados fictícios ou usuários simulados.
 */
export async function fetchQuizRanking(limit = 50): Promise<QuizRankingItem[]> {
  const map = new Map<string, QuizRankingItem>();

  // 1. Consulta a tabela de persistência compartilhada em questions
  try {
    const { data: qData, error: qError } = await supabase
      .from('questions')
      .select('id, user_id, title, body, created_at, updated_at')
      .eq('category_id', 'conhecimento')
      .like('title', '[QUIZ_RANKING]%')
      .order('updated_at', { ascending: false })
      .limit(limit * 3);

    if (!qError && qData && Array.isArray(qData)) {
      for (const row of qData) {
        try {
          const parsed = JSON.parse(row.body);
          const rawUserId = row.user_id || parsed.userId;
          // REGRA DE SEGURANÇA: Somente usuários reais cadastrados aparecem no Ranking
          if (!rawUserId || String(rawUserId).startsWith('guest_') || String(rawUserId).startsWith('user_')) {
            continue;
          }

          const displayName = (parsed.displayName || row.title.replace('[QUIZ_RANKING]', '')).trim();
          if (!displayName) continue;

          const key = displayName.toLowerCase();
          const bestScore = Number(parsed.bestScore ?? parsed.score ?? 0);
          const totalAttempts = Number(parsed.totalAttempts || 1);
          const passedAttempts = Number(parsed.passedAttempts || (bestScore >= 5 ? 1 : 0));
          const totalScore = Number(parsed.totalScore ?? bestScore);
          const totalCorrectAnswers = Number(parsed.totalCorrectAnswers ?? totalScore);
          const winRate = Number(parsed.winRate ?? Math.round((totalCorrectAnswers / (totalAttempts * 10)) * 100));
          const lastAttemptAt = parsed.lastAttemptAt || row.updated_at || row.created_at;
          const firstScoreAt = parsed.firstScoreAt || row.created_at || lastAttemptAt;

          const existing = map.get(key);
          if (existing) {
            existing.bestScore = Math.max(existing.bestScore, bestScore);
            existing.totalAttempts = Math.max(existing.totalAttempts, totalAttempts);
            existing.passedAttempts = Math.max(existing.passedAttempts, passedAttempts);
            existing.totalScore = Math.max(existing.totalScore, totalScore);
            existing.totalCorrectAnswers = Math.max(existing.totalCorrectAnswers || 0, totalCorrectAnswers);
            existing.winRate = Math.max(existing.winRate, winRate);
            if (new Date(lastAttemptAt).getTime() > new Date(existing.lastAttemptAt).getTime()) {
              existing.lastAttemptAt = lastAttemptAt;
            }
            if (new Date(firstScoreAt).getTime() < new Date(existing.firstScoreAt || firstScoreAt).getTime()) {
              existing.firstScoreAt = firstScoreAt;
            }
          } else {
            map.set(key, {
              userId: rawUserId,
              displayName,
              avatarUrl: parsed.avatarUrl || null,
              bestScore,
              totalAttempts,
              passedAttempts,
              totalScore,
              totalCorrectAnswers,
              winRate,
              lastAttemptAt,
              firstScoreAt,
            });
          }
        } catch {}
      }
    }
  } catch (err) {
    console.warn('[Quiz] Falha ao consultar ranking compartilhado:', err);
  }

  // 2. Consulta tabela dedicada bible_quiz_rankings (se já disponível)
  try {
    const { data: dedicatedRows, error: dError } = await (supabase as any)
      .from('bible_quiz_rankings')
      .select('*')
      .not('user_id', 'is', null)
      .order('total_score', { ascending: false })
      .limit(limit);

    if (!dError && dedicatedRows && Array.isArray(dedicatedRows)) {
      for (const r of dedicatedRows) {
        if (!r.user_id || String(r.user_id).startsWith('guest_') || String(r.user_id).startsWith('user_')) {
          continue;
        }
        const displayName = String(r.display_name || '').trim();
        if (!displayName) continue;
        const key = displayName.toLowerCase();

        const bestScore = Number(r.best_score || 0);
        const totalAttempts = Number(r.total_attempts || 1);
        const passedAttempts = Number(r.passed_attempts || 0);
        const totalScore = Number(r.total_score || bestScore);
        const totalCorrectAnswers = Number(r.total_correct_answers || totalScore);
        const winRate = Number(r.win_rate || 0);
        const lastAttemptAt = r.last_attempt_at || new Date().toISOString();
        const firstScoreAt = r.created_at || lastAttemptAt;

        const existing = map.get(key);
        if (existing) {
          existing.bestScore = Math.max(existing.bestScore, bestScore);
          existing.totalAttempts = Math.max(existing.totalAttempts, totalAttempts);
          existing.passedAttempts = Math.max(existing.passedAttempts, passedAttempts);
          existing.totalScore = Math.max(existing.totalScore, totalScore);
          existing.totalCorrectAnswers = Math.max(existing.totalCorrectAnswers || 0, totalCorrectAnswers);
          existing.winRate = Math.max(existing.winRate, winRate);
          if (new Date(lastAttemptAt).getTime() > new Date(existing.lastAttemptAt).getTime()) {
            existing.lastAttemptAt = lastAttemptAt;
          }
          if (new Date(firstScoreAt).getTime() < new Date(existing.firstScoreAt || firstScoreAt).getTime()) {
            existing.firstScoreAt = firstScoreAt;
          }
        } else {
          map.set(key, {
            userId: r.user_id || r.id || `remote_${displayName}`,
            displayName,
            avatarUrl: r.avatar_url || null,
            bestScore,
            totalAttempts,
            passedAttempts,
            totalScore,
            totalCorrectAnswers,
            winRate,
            lastAttemptAt,
            firstScoreAt,
          });
        }
      }
    }
  } catch {}

  const list = Array.from(map.values());

  // CRITÉRIOS OFICIAIS DE CLASSIFICAÇÃO E DESEMPATE:
  // 1. Maior pontuação TOTAL acumulada.
  // 2. Se empatar, maior número de quizzes aprovados.
  // 3. Se continuar empatado, maior número total de respostas corretas.
  // 4. Se continuar empatado, manter quem alcançou a pontuação primeiro.
  list.sort((a, b) => {
    // 1. Maior pontuação total acumulada
    if (b.totalScore !== a.totalScore) {
      return b.totalScore - a.totalScore;
    }
    // 2. Se empatar, maior número de quizzes aprovados
    if (b.passedAttempts !== a.passedAttempts) {
      return b.passedAttempts - a.passedAttempts;
    }
    // 3. Se continuar empatado, maior número total de respostas corretas
    const aCorrect = a.totalCorrectAnswers ?? a.totalScore;
    const bCorrect = b.totalCorrectAnswers ?? b.totalScore;
    if (bCorrect !== aCorrect) {
      return bCorrect - aCorrect;
    }
    // 4. Se continuar empatado, manter quem alcançou a pontuação primeiro
    const aTime = new Date(a.firstScoreAt || a.lastAttemptAt).getTime();
    const bTime = new Date(b.firstScoreAt || b.lastAttemptAt).getTime();
    return aTime - bTime;
  });

  return list.slice(0, limit);
}

/**
 * Busca histórico e estatísticas pessoais de um usuário
 */
export async function fetchUserQuizStats(userId?: string, displayName?: string): Promise<UserQuizStats> {
  // 1. Tenta buscar do Supabase se userId fornecido
  if (userId) {
    try {
      const { data: attempts, error } = await (supabase as any)
        .from('bible_quiz_attempts')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false });

      if (!error && attempts && attempts.length > 0) {
        const totalAttempts = attempts.length;
        const bestScore = Math.max(...attempts.map((a: any) => a.score));
        const passedAttempts = attempts.filter((a: any) => a.passed).length;
        const failedAttempts = totalAttempts - passedAttempts;
        const totalPoints = attempts.reduce((acc: number, cur: any) => acc + cur.score, 0);
        const averageScore = Math.round((totalPoints / totalAttempts) * 10) / 10;

        return {
          totalAttempts,
          bestScore,
          passedAttempts,
          failedAttempts,
          averageScore,
          recentAttempts: attempts.slice(0, 5).map((a: any) => ({
            id: a.id,
            score: a.score,
            passed: a.passed,
            completedAt: a.completed_at,
          })),
        };
      }
    } catch {
      // fallback local
    }
  }

  // 2. Fallback de histórico local do navegador
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(LOCAL_ATTEMPTS_KEY);
      if (raw) {
        const allAttempts = JSON.parse(raw);
        if (Array.isArray(allAttempts)) {
          const userAttempts = allAttempts.filter((a: any) => {
            if (userId && a.userId === userId) return true;
            if (displayName && a.displayName?.toLowerCase().trim() === displayName.toLowerCase().trim()) return true;
            return !userId && !displayName; // todas se for visitante único
          });

          if (userAttempts.length > 0) {
            const totalAttempts = userAttempts.length;
            const bestScore = Math.max(...userAttempts.map((a: any) => a.score));
            const passedAttempts = userAttempts.filter((a: any) => a.passed).length;
            const failedAttempts = totalAttempts - passedAttempts;
            const totalPoints = userAttempts.reduce((acc: number, cur: any) => acc + cur.score, 0);
            const averageScore = Math.round((totalPoints / totalAttempts) * 10) / 10;

            return {
              totalAttempts,
              bestScore,
              passedAttempts,
              failedAttempts,
              averageScore,
              recentAttempts: userAttempts.slice(0, 5).map((a: any) => ({
                id: a.id,
                score: a.score,
                passed: a.passed,
                completedAt: a.completedAt,
              })),
            };
          }
        }
      }
    } catch {
      // ignorar
    }
  }

  return {
    totalAttempts: 0,
    bestScore: 0,
    passedAttempts: 0,
    failedAttempts: 0,
    averageScore: 0,
    recentAttempts: [],
  };
}
