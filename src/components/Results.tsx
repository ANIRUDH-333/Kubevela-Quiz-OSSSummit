import React from 'react';
import { QuizResult } from '../types/quiz';

interface ResultsProps {
    results: QuizResult;
    onRetakeQuiz: () => void;
}

const Results: React.FC<ResultsProps> = ({ results, onRetakeQuiz }) => {
    const handleRetakeClick = () => {
        onRetakeQuiz();
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleRetakeClick();
        }
    };

    const getScoreColor = (percentage: number): string => {
        if (percentage >= 80) return 'text-green-600';
        if (percentage >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getScoreMessage = (percentage: number): string => {
        if (percentage >= 90) return 'Excellent! Outstanding performance!';
        if (percentage >= 80) return 'Great job! Well done!';
        if (percentage >= 70) return 'Good work! Keep it up!';
        if (percentage >= 60) return 'Not bad! Room for improvement.';
        return 'Keep practicing! You can do better!';
    };

    return (
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Quiz Results</h2>
                <div className="mb-6">
                    <div className={`text-6xl font-bold mb-2 ${getScoreColor(results.percentage)}`}>
                        {results.percentage.toFixed(1)}%
                    </div>
                    <p className="text-lg text-gray-600">
                        {getScoreMessage(results.percentage)}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">Score Details</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Your Score:</span>
                            <span className="font-semibold text-gray-800">
                                {results.totalScore} / {results.maxScore}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Questions Answered:</span>
                            <span className="font-semibold text-gray-800">
                                {results.answeredQuestions} / {results.totalQuestions}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-green-800 mb-2">Performance</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Accuracy:</span>
                            <span className="font-semibold text-gray-800">
                                {results.answeredQuestions > 0
                                    ? ((results.totalScore / results.maxScore) * 100).toFixed(1)
                                    : '0.0'
                                }%
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Completion:</span>
                            <span className="font-semibold text-gray-800">
                                {((results.answeredQuestions / results.totalQuestions) * 100).toFixed(1)}%
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="text-center">
                <button
                    onClick={handleRetakeClick}
                    onKeyDown={handleKeyDown}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    tabIndex={0}
                    aria-label="Retake the quiz"
                >
                    Retake Quiz
                </button>
            </div>
        </div>
    );
};

export default Results;
