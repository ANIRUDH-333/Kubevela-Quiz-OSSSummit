import { QuizQuestion } from '../types/quiz';

/**
 * Selects random questions from the question bank with a specific difficulty distribution
 * 
 * New difficulty-based weightage system:
 * - Easy (5 points): 4 questions = 20 points
 * - Medium (10 points): 4 questions = 40 points  
 * - Hard (20 points): 2 questions = 40 points
 * Total: 10 questions = 100 points
 */
export const selectRandomQuestions = (
    allQuestions: QuizQuestion[],
    targetScore: number = 100,
    questionCount: number = 10
): QuizQuestion[] => {
    console.log(`🎯 Selecting ${questionCount} questions with target score ${targetScore} from ${allQuestions.length} available questions`);
    
    // If we don't have enough questions, return what we have
    if (allQuestions.length < questionCount) {
        console.log(`⚠️ Not enough questions available (${allQuestions.length}), returning all`);
        return [...allQuestions].sort(() => Math.random() - 0.5);
    }

    // Separate questions by difficulty/weightage
    const easyQuestions = allQuestions.filter(q => q.weightage === 5);
    const mediumQuestions = allQuestions.filter(q => q.weightage === 10);
    const hardQuestions = allQuestions.filter(q => q.weightage === 20);

    console.log(`📊 Available questions by difficulty:`, {
        easy: easyQuestions.length,
        medium: mediumQuestions.length,
        hard: hardQuestions.length
    });

    // Define the required distribution
    const requiredDistribution = {
        easy: 4,    // 4 × 5 = 20 points
        medium: 4,  // 4 × 10 = 40 points
        hard: 2     // 2 × 20 = 40 points
    };

    const selectedQuestions: QuizQuestion[] = [];

    // Select Hard questions (20 points each)
    const shuffledHard = [...hardQuestions].sort(() => Math.random() - 0.5);
    const selectedHard = shuffledHard.slice(0, Math.min(requiredDistribution.hard, hardQuestions.length));
    selectedQuestions.push(...selectedHard);

    // Select Medium questions (10 points each)
    const shuffledMedium = [...mediumQuestions].sort(() => Math.random() - 0.5);
    const selectedMedium = shuffledMedium.slice(0, Math.min(requiredDistribution.medium, mediumQuestions.length));
    selectedQuestions.push(...selectedMedium);

    // Select Easy questions (5 points each)
    const shuffledEasy = [...easyQuestions].sort(() => Math.random() - 0.5);
    const selectedEasy = shuffledEasy.slice(0, Math.min(requiredDistribution.easy, easyQuestions.length));
    selectedQuestions.push(...selectedEasy);

    // If we don't have enough questions of a specific difficulty, fill with any available questions
    const remainingNeeded = questionCount - selectedQuestions.length;
    if (remainingNeeded > 0) {
        console.log(`⚠️ Need ${remainingNeeded} more questions, filling with any available`);
        
        // Get all questions that haven't been selected yet
        const usedIds = new Set(selectedQuestions.map(q => q.id));
        const remainingQuestions = allQuestions.filter(q => !usedIds.has(q.id));
        
        // Shuffle and take what we need
        const shuffledRemaining = remainingQuestions.sort(() => Math.random() - 0.5);
        selectedQuestions.push(...shuffledRemaining.slice(0, remainingNeeded));
    }

    // Final shuffle to randomize the order of questions in the quiz
    const finalSelection = selectedQuestions.sort(() => Math.random() - 0.5);

    // Calculate actual distribution and score
    const actualDistribution = {
        easy: finalSelection.filter(q => q.weightage === 5).length,
        medium: finalSelection.filter(q => q.weightage === 10).length,
        hard: finalSelection.filter(q => q.weightage === 20).length
    };
    
    const actualScore = finalSelection.reduce((sum, q) => sum + q.weightage, 0);

    console.log(`✅ Selected ${finalSelection.length} questions:`, {
        distribution: actualDistribution,
        totalScore: actualScore,
        targetScore: targetScore
    });

    return finalSelection;
};

/**
 * Calculate total score for a set of questions
 */
export const calculateTotalScore = (questions: QuizQuestion[]): number => {
    return questions.reduce((total, question) => total + question.weightage, 0);
};
