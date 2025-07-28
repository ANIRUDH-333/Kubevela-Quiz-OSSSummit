import React from 'react';
import { QuizQuestion } from '../types/quiz';

interface QuizDebugInfoProps {
    questions: QuizQuestion[];
    show: boolean;
}

const QuizDebugInfo: React.FC<QuizDebugInfoProps> = ({ questions, show }) => {
    if (!show) return null;

    const totalScore = questions.reduce((sum, q) => sum + q.weightage, 0);

    return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                🔧 Debug Info (Development Only)
            </h3>
            <div className="text-sm text-yellow-700">
                <p className="mb-2">
                    <strong>Total Questions:</strong> {questions.length} |
                    <strong> Total Score:</strong> {totalScore} points
                </p>
                <details className="mt-2">
                    <summary className="cursor-pointer font-medium">
                        View Selected Questions & Weights
                    </summary>
                    <div className="mt-2 space-y-1">
                        {questions.map((q, index) => (
                            <div key={q.id} className="text-xs">
                                {index + 1}. {q.question.substring(0, 50)}...
                                <span className="font-medium"> ({q.weightage} pts)</span>
                            </div>
                        ))}
                    </div>
                </details>
            </div>
        </div>
    );
};

export default QuizDebugInfo;
