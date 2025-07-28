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

    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Question {questionNumber}
                </h3>
                <p className="text-gray-700 text-base leading-relaxed">
                    {question.question}
                </p>
                <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                    Weightage: {question.weightage} points
                </span>
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
