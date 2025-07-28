import { QuizQuestion } from '../types/quiz';

/**
 * Selects 10 random questions from the question bank that add up to a target score of 50
 * Uses a backtracking algorithm to find a valid combination
 */
export const selectRandomQuestions = (
    allQuestions: QuizQuestion[],
    targetScore: number = 50,
    questionCount: number = 10
): QuizQuestion[] => {
    // Shuffle the questions array to randomize selection
    const shuffledQuestions = [...allQuestions].sort(() => Math.random() - 0.5);

    // Try to find a combination that adds up to the target score
    const findCombination = (
        questions: QuizQuestion[],
        index: number,
        currentSum: number,
        currentCount: number,
        result: QuizQuestion[]
    ): QuizQuestion[] | null => {
        // If we have the right count and sum, return the result
        if (currentCount === questionCount && currentSum === targetScore) {
            return [...result];
        }

        // If we've used all questions or exceeded limits, backtrack
        if (index >= questions.length || currentCount >= questionCount || currentSum > targetScore) {
            return null;
        }

        // Try including the current question
        const withCurrent = findCombination(
            questions,
            index + 1,
            currentSum + questions[index].weightage,
            currentCount + 1,
            [...result, questions[index]]
        );

        if (withCurrent) return withCurrent;

        // Try skipping the current question
        return findCombination(questions, index + 1, currentSum, currentCount, result);
    };

    // Try multiple times with different shuffles if needed
    for (let attempt = 0; attempt < 10; attempt++) {
        const result = findCombination(shuffledQuestions, 0, 0, 0, []);
        if (result) {
            // Shuffle the final result to randomize question order
            return result.sort(() => Math.random() - 0.5);
        }
        // Re-shuffle for next attempt
        shuffledQuestions.sort(() => Math.random() - 0.5);
    }

    // Fallback: if exact target can't be reached, get closest combination
    return getClosestCombination(shuffledQuestions, targetScore, questionCount);
};

/**
 * Fallback function to get the closest possible combination to target score
 */
const getClosestCombination = (
    questions: QuizQuestion[],
    targetScore: number,
    questionCount: number
): QuizQuestion[] => {
    // Sort questions by weightage to try different combinations
    const sorted = [...questions].sort((a, b) => a.weightage - b.weightage);

    let bestCombination: QuizQuestion[] = [];
    let bestDifference = Infinity;

    // Generate combinations and find the one closest to target
    const generateCombinations = (
        index: number,
        current: QuizQuestion[],
        currentSum: number
    ) => {
        if (current.length === questionCount) {
            const difference = Math.abs(currentSum - targetScore);
            if (difference < bestDifference) {
                bestDifference = difference;
                bestCombination = [...current];
            }
            return;
        }

        if (index >= sorted.length || current.length >= questionCount) return;

        // Include current question
        generateCombinations(index + 1, [...current, sorted[index]], currentSum + sorted[index].weightage);

        // Skip current question
        generateCombinations(index + 1, current, currentSum);
    };

    generateCombinations(0, [], 0);

    // Shuffle the result
    return bestCombination.sort(() => Math.random() - 0.5);
};

/**
 * Calculate total score for a set of questions
 */
export const calculateTotalScore = (questions: QuizQuestion[]): number => {
    return questions.reduce((total, question) => total + question.weightage, 0);
};
