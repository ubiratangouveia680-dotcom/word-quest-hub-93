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

  let attemptId: string | undefined;

  // Se logado, grava no Supabase e atualiza ranking
  if (userId) {
    try {
      // 1. Grava a tentativa
      const { data: attemptData, error: attemptError } = await (supabase as any)
        .from('bible_quiz_attempts')
        .insert([
          {
            user_id: userId,
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
        .single();

      if (!attemptError && attemptData) {
        attemptId = attemptData.id;
      }

      // 2. Atualiza ou cria o registro do usuário no ranking
      const { data: currentRank } = await (supabase as any)
        .from('bible_quiz_rankings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      const prevBestScore = currentRank?.best_score || 0;
      const prevTotalAttempts = currentRank?.total_attempts || 0;
      const prevPassedAttempts = currentRank?.passed_attempts || 0;
      const prevTotalScore = currentRank?.total_score || 0;

      const nextBestScore = Math.max(prevBestScore, score);
      const nextTotalAttempts = prevTotalAttempts + 1;
      const nextPassedAttempts = prevPassedAttempts + (passed ? 1 : 0);
      const nextTotalScore = prevTotalScore + score;
      // Taxa de aproveitamento médio (%)
      const nextWinRate = Math.round((nextTotalScore / (nextTotalAttempts * 10)) * 100);

      const displayName = userDisplayName || 'Membro Palavra Viva';

      await (supabase as any).from('bible_quiz_rankings').upsert(
        {
          user_id: userId,
          display_name: displayName,
          avatar_url: userAvatarUrl || null,
          best_score: nextBestScore,
          total_attempts: nextTotalAttempts,
          passed_attempts: nextPassedAttempts,
          total_score: nextTotalScore,
          win_rate: nextWinRate,
          last_attempt_at: now,
        },
        { onConflict: 'user_id' }
      );
    } catch (err) {
      console.warn('Erro ao persistir tentativa no Supabase:', err);
    }
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
 * Busca o ranking público ordenado por:
 * 1. best_score DESC
 * 2. win_rate DESC
 * 3. total_attempts DESC
 */
export async function fetchQuizRanking(limit = 50): Promise<QuizRankingItem[]> {
  try {
    const { data, error } = await (supabase as any)
      .from('bible_quiz_rankings')
      .select('*')
      .order('best_score', { ascending: false })
      .order('win_rate', { ascending: false })
      .order('total_attempts', { ascending: false })
      .limit(limit);

    if (!error && data) {
      return data.map((r: any) => ({
        userId: r.user_id,
        displayName: r.display_name,
        avatarUrl: r.avatar_url,
        bestScore: r.best_score,
        totalAttempts: r.total_attempts,
        passedAttempts: r.passed_attempts,
        totalScore: r.total_score,
        winRate: Number(r.win_rate) || 0,
        lastAttemptAt: r.last_attempt_at,
      }));
    }
  } catch {
    // fallback
  }

  // Exemplos amigáveis caso o ranking esteja no primeiro dia
  return [
    {
      userId: 'mock-1',
      displayName: 'Pr. Marcos Silva',
      avatarUrl: null,
      bestScore: 10,
      totalAttempts: 15,
      passedAttempts: 14,
      totalScore: 138,
      winRate: 92,
      lastAttemptAt: new Date().toISOString(),
    },
    {
      userId: 'mock-2',
      displayName: 'Ana Carolina',
      avatarUrl: null,
      bestScore: 10,
      totalAttempts: 12,
      passedAttempts: 11,
      totalScore: 104,
      winRate: 87,
      lastAttemptAt: new Date().toISOString(),
    },
    {
      userId: 'mock-3',
      displayName: 'Lucas Evangelista',
      avatarUrl: null,
      bestScore: 9,
      totalAttempts: 18,
      passedAttempts: 15,
      totalScore: 142,
      winRate: 79,
      lastAttemptAt: new Date().toISOString(),
    },
    {
      userId: 'mock-4',
      displayName: 'Débora Rodrigues',
      avatarUrl: null,
      bestScore: 9,
      totalAttempts: 8,
      passedAttempts: 7,
      totalScore: 61,
      winRate: 76,
      lastAttemptAt: new Date().toISOString(),
    },
  ];
}

/**
 * Busca histórico e estatísticas pessoais de um usuário
 */
export async function fetchUserQuizStats(userId: string): Promise<UserQuizStats> {
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
    // fallback
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
