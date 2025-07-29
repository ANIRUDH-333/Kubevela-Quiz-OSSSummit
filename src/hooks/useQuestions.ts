import { useState, useEffect } from 'react';
import { QuizQuestion } from '../types/quiz';
import { QuestionService } from '../services/questionService';

interface UseQuestionsReturn {
    questions: QuizQuestion[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export const useQuestions = (): UseQuestionsReturn => {
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchQuestions = async () => {
        try {
            console.log('🚀 useQuestions: Starting to fetch questions...');
            setLoading(true);
            setError(null);

            const fetchedQuestions = await QuestionService.getAllQuestions();

            console.log(`📋 useQuestions: Received ${fetchedQuestions.length} questions`);
            setQuestions(fetchedQuestions);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch questions';
            console.error('❌ useQuestions: Error fetching questions:', errorMessage);
            setError(errorMessage);
        } finally {
            console.log('✅ useQuestions: Fetch complete, setting loading to false');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuestions();
    }, []);

    return {
        questions,
        loading,
        error,
        refetch: fetchQuestions
    };
};
