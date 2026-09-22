export type QuizDifficulty = 'facil' | 'medio' | 'dificil';
export type QuizOptionLetter = 'A' | 'B' | 'C' | 'D';

export interface QuizQuestionRaw {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: QuizOptionLetter;
  explanation: string;
  biblical_reference?: string;
  difficulty: QuizDifficulty;
  category: string;
  active: boolean;
}

// Interface entregue ao cliente durante a prova (sem a resposta correta!)
export interface QuizQuestionClient {
  id: string;
  question: string;
  options: {
    letter: QuizOptionLetter;
    text: string;
    originalLetter: QuizOptionLetter;
  }[];
  category: string;
  difficulty: QuizDifficulty;
}

// Resposta enviada pelo usuário
export interface UserQuizAnswer {
  questionId: string;
  selectedLetter: QuizOptionLetter; // a letra que ele clicou na tela (A, B, C ou D)
  selectedOriginalLetter: QuizOptionLetter; // a chave original no banco
}

// Item detalhado do resultado final
export interface QuizResultItem {
  questionId: string;
  question: string;
  userAnswerLetter: QuizOptionLetter;
  userAnswerText: string;
  correctAnswerLetter: QuizOptionLetter;
  correctAnswerText: string;
  isCorrect: boolean;
  explanation: string;
  biblicalReference?: string;
}

// Resultado consolidado da prova
export interface QuizFinalResult {
  attemptId?: string;
  score: number; // 0 a 10
  totalQuestions: number; // 10
  wrongCount: number;
  percentage: number; // 0 a 100
  passed: boolean; // score >= 5
  questions: QuizResultItem[];
  completedAt: string;
}

// Item do ranking público
export interface QuizRankingItem {
  userId: string;
  displayName: string;
  avatarUrl?: string | null;
  bestScore: number;
  totalAttempts: number;
  passedAttempts: number;
  totalScore: number;
  totalCorrectAnswers?: number;
  winRate: number; // percentual de aproveitamento
  lastAttemptAt: string;
  firstScoreAt?: string;
}

// Estatísticas pessoais do usuário
export interface UserQuizStats {
  totalAttempts: number;
  bestScore: number;
  passedAttempts: number;
  failedAttempts: number;
  averageScore: number;
  recentAttempts: {
    id: string;
    score: number;
    passed: boolean;
    completedAt: string;
  }[];
}
