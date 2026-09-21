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
// Helper para manipular ranking e tentativas em localStorage com resiliência
const LOCAL_RANKING_KEY = 'bo:quiz_rankings';
const LOCAL_ATTEMPTS_KEY = 'bo:quiz_attempts';

function getLocalRankings(): QuizRankingItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_RANKING_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    // ignorar erro de parsing
  }
  return [];
}

function saveLocalRankings(items: QuizRankingItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_RANKING_KEY, JSON.stringify(items));
  } catch {
    // ignorar falha de armazenamento
  }
}

function saveLocalAttempt(attempt: any) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(LOCAL_ATTEMPTS_KEY);
    const list = raw ? JSON.parse(raw) : [];
    list.unshift(attempt);
    // Guarda até 50 tentativas mais recentes
    localStorage.setItem(LOCAL_ATTEMPTS_KEY, JSON.stringify(list.slice(0, 50)));
  } catch {
    // ignorar
  }
}

/**
 * Valida o resultado com segurança.
 * Busca o gabarito no banco (ou no seed seguro), calcula a pontuação e registra a tentativa real.
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
  const participantKey = userId || `guest_${displayName.toLowerCase().replace(/\s+/g, '_')}`;

  let attemptId: string = `attempt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  // 1. Salva a tentativa no armazenamento local imediatamente
  saveLocalAttempt({
    id: attemptId,
    userId: userId || null,
    displayName,
    score,
    totalQuestions,
    passed,
    completedAt: now,
  });

  // 2. Atualiza o ranking local (deduplica por usuário/nome e organiza pela maior pontuação)
  const localList = getLocalRankings();
  const existingIndex = localList.findIndex((item) => {
    if (userId && item.userId === userId) return true;
    return item.displayName.toLowerCase().trim() === displayName.toLowerCase().trim();
  });

  if (existingIndex >= 0) {
    const prev = localList[existingIndex];
    const newBestScore = Math.max(prev.bestScore, score);
    const newTotalAttempts = prev.totalAttempts + 1;
    const newPassedAttempts = prev.passedAttempts + (passed ? 1 : 0);
    const newTotalScore = prev.totalScore + score;
    const newWinRate = Math.round((newTotalScore / (newTotalAttempts * 10)) * 100);

    localList[existingIndex] = {
      ...prev,
      userId: userId || prev.userId || participantKey,
      displayName, // atualiza com o nome mais recente
      avatarUrl: userAvatarUrl || prev.avatarUrl || null,
      bestScore: newBestScore,
      totalAttempts: newTotalAttempts,
      passedAttempts: newPassedAttempts,
      totalScore: newTotalScore,
      winRate: newWinRate,
      lastAttemptAt: now,
    };
  } else {
    localList.push({
      userId: participantKey,
      displayName,
      avatarUrl: userAvatarUrl || null,
      bestScore: score,
      totalAttempts: 1,
      passedAttempts: passed ? 1 : 0,
      totalScore: score,
      winRate: Math.round((score / 10) * 100),
      lastAttemptAt: now,
    });
  }

  // Ordena por: 1) bestScore DESC, 2) winRate DESC, 3) totalAttempts DESC, 4) lastAttemptAt DESC
  localList.sort((a, b) => {
    if (b.bestScore !== a.bestScore) return b.bestScore - a.bestScore;
    if (b.winRate !== a.winRate) return b.winRate - a.winRate;
    if (b.totalAttempts !== a.totalAttempts) return b.totalAttempts - a.totalAttempts;
    return new Date(b.lastAttemptAt).getTime() - new Date(a.lastAttemptAt).getTime();
  });

  saveLocalRankings(localList);

  // 3. Persiste no Supabase se as tabelas estiverem disponíveis
  try {
    // 3.1 Grava a tentativa
    const { data: attemptData, error: attemptError } = await (supabase as any)
      .from('bible_quiz_attempts')
      .insert([
        {
          user_id: userId || null,
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

    // 3.2 Atualiza ranking no Supabase
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
  } catch (err) {
    // Falha silenciosa no Supabase: o ranking local já foi salvo com sucesso
    console.warn('Persistência remota do quiz no Supabase ignorada:', err);
  }

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
 * Busca o ranking público REAL ordenado por:
 * 1. best_score DESC (maior pontuação)
 * 2. win_rate DESC (melhor aproveitamento)
 * 3. total_attempts DESC (mais provas realizadas)
 * 4. last_attempt_at DESC (mais recente)
 *
 * NUNCA retorna dados fictícios, mocks ou seeds inventadas.
 * Se não houver participantes, retorna array vazio [].
 */
export async function fetchQuizRanking(limit = 50): Promise<QuizRankingItem[]> {
  const localList = getLocalRankings();
  let remoteList: QuizRankingItem[] = [];

  try {
    const { data, error } = await (supabase as any)
      .from('bible_quiz_rankings')
      .select('*')
      .order('best_score', { ascending: false })
      .order('win_rate', { ascending: false })
      .order('total_attempts', { ascending: false })
      .limit(limit);

    if (!error && data && Array.isArray(data)) {
      remoteList = data.map((r: any) => ({
        userId: r.user_id || r.id || `remote_${r.display_name}`,
        displayName: r.display_name,
        avatarUrl: r.avatar_url,
        bestScore: Number(r.best_score) || 0,
        totalAttempts: Number(r.total_attempts) || 1,
        passedAttempts: Number(r.passed_attempts) || 0,
        totalScore: Number(r.total_score) || 0,
        winRate: Number(r.win_rate) || 0,
        lastAttemptAt: r.last_attempt_at || new Date().toISOString(),
      }));
    }
  } catch {
    // Falha de rede/banco: utiliza a lista real local
  }

  // Mescla registros remotos com locais garantindo desduplicação por usuário/nome
  const map = new Map<string, QuizRankingItem>();

  // Primeiro insere os remotos
  for (const item of remoteList) {
    const key = (item.userId || item.displayName).toLowerCase().trim();
    map.set(key, item);
  }

  // Mescla os locais (priorizando a maior pontuação do participante)
  for (const localItem of localList) {
    const key = (localItem.userId || localItem.displayName).toLowerCase().trim();
    const existing = map.get(key);
    if (existing) {
      existing.bestScore = Math.max(existing.bestScore, localItem.bestScore);
      existing.totalAttempts = Math.max(existing.totalAttempts, localItem.totalAttempts);
      existing.passedAttempts = Math.max(existing.passedAttempts, localItem.passedAttempts);
      existing.totalScore = Math.max(existing.totalScore, localItem.totalScore);
      existing.winRate = Math.max(existing.winRate, localItem.winRate);
      if (new Date(localItem.lastAttemptAt).getTime() > new Date(existing.lastAttemptAt).getTime()) {
        existing.lastAttemptAt = localItem.lastAttemptAt;
      }
    } else {
      map.set(key, localItem);
    }
  }

  const combined = Array.from(map.values());

  // Ordenação rigorosa pela maior pontuação
  combined.sort((a, b) => {
    if (b.bestScore !== a.bestScore) return b.bestScore - a.bestScore;
    if (b.winRate !== a.winRate) return b.winRate - a.winRate;
    if (b.totalAttempts !== a.totalAttempts) return b.totalAttempts - a.totalAttempts;
    return new Date(b.lastAttemptAt).getTime() - new Date(a.lastAttemptAt).getTime();
  });

  return combined.slice(0, limit);
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
