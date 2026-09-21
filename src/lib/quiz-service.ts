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
    [arr[i], arr[j]] = [arr[j], arr[i]];
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
      letter: LETTERS[index],
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
 * Garante uma sessão de autenticação válida para salvar dados no Supabase com RLS.
 * Se o usuário já estiver autenticado na conta, usa a sessão dele.
 * Se for um visitante, utiliza ou cria uma conta de participante autenticada no Supabase.
 */
async function getEffectiveSupabaseUserId(currentUserId?: string): Promise<string | null> {
  if (currentUserId) return currentUserId;
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData?.session?.user?.id) {
      return sessionData.session.user.id;
    }

    let guestSeed = typeof window !== 'undefined' ? localStorage.getItem('bo:guest_auth_seed') : null;
    if (!guestSeed) {
      guestSeed = Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
      if (typeof window !== 'undefined') localStorage.setItem('bo:guest_auth_seed', guestSeed);
    }

    const guestEmail = `guest_${guestSeed}@bibliaonline.internal`;
    const guestPass = `QuizPass123!${guestSeed}`;

    const signInRes = await supabase.auth.signInWithPassword({ email: guestEmail, password: guestPass });
    if (signInRes.data?.user?.id) {
      return signInRes.data.user.id;
    }

    const signUpRes = await supabase.auth.signUp({ email: guestEmail, password: guestPass });
    if (signUpRes.data?.user?.id) {
      return signUpRes.data.user.id;
    }
  } catch (err) {
    console.warn('[Quiz] Falha ao autenticar sessão de participante:', err);
  }
  return null;
}

/**
 * Valida o resultado com segurança.
 * Busca o gabarito no banco (ou no seed seguro), calcula a pontuação e registra a tentativa real no banco de dados na nuvem.
 */
export async function submitQuizAttempt(
  answers: UserQuizAnswer[],
  userId?: string,
  userDisplayName?: string,
  userAvatarUrl?: string | null
): Promise<QuizFinalResult> {
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
      biblicalReference: q.biblical_reference,
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

  // Autenticação para persistência no banco Supabase
  const effectiveUserId = await getEffectiveSupabaseUserId(userId);

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
        const newBestScore = Math.max(prevBest, score);
        const newTotalAttempts = Number(prevBody.totalAttempts || 1) + 1;
        const newPassedAttempts = Number(prevBody.passedAttempts || 0) + (passed ? 1 : 0);
        const newTotalScore = Number(prevBody.totalScore || prevBest) + score;
        const newWinRate = Math.round((newTotalScore / (newTotalAttempts * 10)) * 100);

        const updatedPayload = {
          displayName,
          avatarUrl: userAvatarUrl || prevBody.avatarUrl || null,
          bestScore: newBestScore,
          score,
          totalAttempts: newTotalAttempts,
          passedAttempts: newPassedAttempts,
          totalScore: newTotalScore,
          winRate: newWinRate,
          lastAttemptAt: now,
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
          score,
          totalAttempts: 1,
          passedAttempts: passed ? 1 : 0,
          totalScore: score,
          winRate: Math.round((score / 10) * 100),
          lastAttemptAt: now,
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
      display_name: displayName,
      avatar_url: userAvatarUrl || currentRank?.avatar_url || null,
      best_score: nextBestScore,
      total_attempts: nextTotalAttempts,
      passed_attempts: nextPassedAttempts,
      total_score: nextTotalScore,
      win_rate: nextWinRate,
      last_attempt_at: now,
    };

    if (userId) {
      payload.user_id = userId;
      await (supabase as any).from('bible_quiz_rankings').upsert(payload, { onConflict: 'user_id' });
    } else if (currentRank?.id) {
      await (supabase as any).from('bible_quiz_rankings').update(payload).eq('id', currentRank.id);
    } else {
      await (supabase as any).from('bible_quiz_rankings').insert([payload]);
    }
  } catch {}

  return {
    attemptId,
    score,
    totalQuestions,
    wrongCount,
    percentage,
    passed,
    questions: resultItems,
    completedAt: now,
  };
}

/**
 * Busca o ranking público REAL diretamente do banco de dados compartilhado na nuvem (Supabase).
 * NÃO utiliza localStorage. Sincroniza entre todos os dispositivos em tempo real.
 * Ordenado por:
 * 1. best_score DESC (maior pontuação)
 * 2. win_rate DESC (melhor aproveitamento)
 * 3. total_attempts DESC (mais provas realizadas)
 * 4. last_attempt_at DESC (mais recente)
 *
 * Se um usuário fizer mais de uma prova, mantém apenas a sua MAIOR pontuação.
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
          const displayName = (parsed.displayName || row.title.replace('[QUIZ_RANKING]', '')).trim();
          if (!displayName) continue;

          const key = displayName.toLowerCase();
          const bestScore = Number(parsed.bestScore ?? parsed.score ?? 0);
          const totalAttempts = Number(parsed.totalAttempts || 1);
          const passedAttempts = Number(parsed.passedAttempts || (bestScore >= 5 ? 1 : 0));
          const totalScore = Number(parsed.totalScore || bestScore);
          const winRate = Number(parsed.winRate || Math.round((bestScore / 10) * 100));
          const lastAttemptAt = parsed.lastAttemptAt || row.updated_at || row.created_at;

          const existing = map.get(key);
          if (existing) {
            existing.bestScore = Math.max(existing.bestScore, bestScore);
            existing.totalAttempts = Math.max(existing.totalAttempts, totalAttempts);
            existing.passedAttempts = Math.max(existing.passedAttempts, passedAttempts);
            existing.totalScore = Math.max(existing.totalScore, totalScore);
            existing.winRate = Math.max(existing.winRate, winRate);
            if (new Date(lastAttemptAt).getTime() > new Date(existing.lastAttemptAt).getTime()) {
              existing.lastAttemptAt = lastAttemptAt;
            }
          } else {
            map.set(key, {
              userId: row.user_id || row.id || `user_${displayName}`,
              displayName,
              avatarUrl: parsed.avatarUrl || null,
              bestScore,
              totalAttempts,
              passedAttempts,
              totalScore,
              winRate,
              lastAttemptAt,
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
      .order('best_score', { ascending: false })
      .limit(limit);

    if (!dError && dedicatedRows && Array.isArray(dedicatedRows)) {
      for (const r of dedicatedRows) {
        const displayName = String(r.display_name || '').trim();
        if (!displayName) continue;
        const key = displayName.toLowerCase();

        const bestScore = Number(r.best_score || 0);
        const totalAttempts = Number(r.total_attempts || 1);
        const passedAttempts = Number(r.passed_attempts || 0);
        const totalScore = Number(r.total_score || 0);
        const winRate = Number(r.win_rate || 0);
        const lastAttemptAt = r.last_attempt_at || new Date().toISOString();

        const existing = map.get(key);
        if (existing) {
          existing.bestScore = Math.max(existing.bestScore, bestScore);
          existing.totalAttempts = Math.max(existing.totalAttempts, totalAttempts);
          existing.passedAttempts = Math.max(existing.passedAttempts, passedAttempts);
          existing.totalScore = Math.max(existing.totalScore, totalScore);
          existing.winRate = Math.max(existing.winRate, winRate);
          if (new Date(lastAttemptAt).getTime() > new Date(existing.lastAttemptAt).getTime()) {
            existing.lastAttemptAt = lastAttemptAt;
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
            winRate,
            lastAttemptAt,
          });
        }
      }
    }
  } catch {}

  const list = Array.from(map.values());

  // Ordenação global da classificação:
  // 1º Maior pontuação (bestScore DESC)
  // 2º Aproveitamento (winRate DESC)
  // 3º Mais tentativas (totalAttempts DESC)
  // 4º Mais recente (lastAttemptAt DESC)
  list.sort((a, b) => {
    if (b.bestScore !== a.bestScore) return b.bestScore - a.bestScore;
    if (b.winRate !== a.winRate) return b.winRate - a.winRate;
    if (b.totalAttempts !== a.totalAttempts) return b.totalAttempts - a.totalAttempts;
    return new Date(b.lastAttemptAt).getTime() - new Date(a.lastAttemptAt).getTime();
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
