import React from 'react';
import { QuizQuestion } from '../types/quiz';

interface QuestionComponentProps {
    question: QuizQuestion;
    questionNumber: number;
    selectedOption: number | null;
    onAnswerSelect: (questionId: number, optionIndex: number) => void;
}

const QuestionComponent: React.FC<QuestionComponentProps> = ({
    question,
    questionNumber,
    selectedOption,
    onAnswerSelect,
}) => {
    const handleOptionSelect = (optionIndex: number) => {
        onAnswerSelect(question.id, optionIndex);
    };

    const handleKeyDown = (event: React.KeyboardEvent, optionIndex: number) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleOptionSelect(optionIndex);
        }
    };

    const getDifficultyInfo = (weightage: number) => {
        switch (weightage) {
            case 5:
                return { level: 'Easy', color: 'bg-green-100 text-green-800' };
            case 10:
                return { level: 'Medium', color: 'bg-yellow-100 text-yellow-800' };
            case 20:
                return { level: 'Hard', color: 'bg-red-100 text-red-800' };
            default:
                return { level: 'Unknown', color: 'bg-gray-100 text-gray-800' };
        }
    };

    const difficultyInfo = getDifficultyInfo(question.weightage);

    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">
                        Question {questionNumber}
                    </h3>
                    <div className="flex items-center gap-2">
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${difficultyInfo.color}`}>
                            {difficultyInfo.level}
                        </span>
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                            {question.weightage} pts
                        </span>
                    </div>
                </div>
                <p className="text-gray-700 text-base leading-relaxed">
                    {question.question}
                </p>
            </div>

            <div className="space-y-3">
                {question.options.map((option, index) => (
                    <div
                        key={index}
                        className={`p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 ${selectedOption === index
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                        onClick={() => handleOptionSelect(index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        tabIndex={0}
                        role="button"
                        aria-label={`Option ${index + 1}: ${option}`}
                    >
                        <div className="flex items-center">
                            <div
                                className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${selectedOption === index
                                        ? 'border-blue-500 bg-blue-500'
                                        : 'border-gray-300'
                                    }`}
                            >
                                {selectedOption === index && (
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                )}
                            </div>
                            <span className="text-gray-700">{option}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default QuestionComponent;
