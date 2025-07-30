export interface QuizQuestion {
    id: number;
    question: string;
    options: string[];
    correctAnswer: number;
    weightage: number;
}

export interface UserAnswer {
    questionId: number;
    selectedOption: number;
}

export interface QuizResult {
    totalScore: number;
    maxScore: number;
    percentage: number;
    answeredQuestions: number;
    totalQuestions: number;
    difficultyBreakdown?: {
        easy: { correct: number; total: number; points: number };
        medium: { correct: number; total: number; points: number };
        hard: { correct: number; total: number; points: number };
    };
}
