# Quiz Application

A React TypeScript quiz application with intelligent question selection, multiple choice questions, scoring system, and modern UI built with TailwindCSS.

## Features

- **Smart Question Selection**: Automatically selects 10 random questions from a bank of 20 that total exactly 50 points
- **Multiple Choice Questions**: MCQ-style questions with single answer selection
- **Weighted Scoring**: Each question has different weightage (3-10 points)
- **Random Quiz Generation**: Every quiz attempt uses a different combination of questions
- **Progress Tracking**: Visual progress bar and question counter
- **Navigation**: Navigate between questions with Previous/Next buttons
- **Results Display**: Comprehensive results with score breakdown and performance metrics
- **Responsive Design**: Mobile-friendly UI built with TailwindCSS
- **Accessibility**: Keyboard navigation and ARIA labels for better accessibility
- **TypeScript**: Full type safety throughout the application
- **Debug Mode**: Development view showing selected questions and their weights

## Question Bank

The application includes 20 diverse questions covering:
- **Programming & Web Development**: JavaScript, React, HTML, CSS, SQL
- **Science & Mathematics**: Physics, Chemistry, Math problems
- **Geography**: Countries, continents, natural features
- **History & Culture**: World events, literature, art
- **General Knowledge**: Mixed topics for variety

Each question has a weightage between 3-10 points, allowing for balanced quiz generation.

## Technologies Used

- **React 18**: Modern React with hooks
- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast build tool and dev server
- **TailwindCSS**: Utility-first CSS framework
- **PostCSS**: CSS processing with Autoprefixer

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   \`\`\`bash
   git clone <repository-url>
   cd quiz-app
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

4. Open your browser and navigate to \`http://localhost:5173\`

### Building for Production

To build the application for production:

\`\`\`bash
npm run build
\`\`\`

The built files will be in the \`dist\` directory.

## Project Structure

\`\`\`
src/
├── components/
│   ├── QuestionComponent.tsx    # Individual question display
│   ├── Results.tsx              # Results and score display
│   └── QuizDebugInfo.tsx        # Debug info for development
├── data/
│   └── questions.ts             # Question bank (20 questions)
├── types/
│   └── quiz.ts                  # TypeScript type definitions
├── utils/
│   └── questionSelector.ts     # Smart question selection algorithm
├── App.tsx                      # Main application component
├── main.tsx                     # Application entry point
└── index.css                    # Global styles with Tailwind
\`\`\`

## Algorithm Details

### Question Selection Logic

The application uses a sophisticated algorithm to select 10 questions that total exactly 50 points:

1. **Randomization**: Questions are shuffled randomly
2. **Backtracking**: Uses recursive backtracking to find valid combinations
3. **Target Optimization**: Attempts to hit exactly 50 points
4. **Fallback Strategy**: If exact match isn't possible, finds the closest combination
5. **Final Shuffle**: Selected questions are shuffled again for random order

This ensures each quiz attempt is unique while maintaining consistent difficulty.

## Customization

### Adding Questions

Edit the \`src/data/questions.ts\` file to add or modify questions:

\`\`\`typescript
{
  id: 21,
  question: "Your question here?",
  options: ["Option A", "Option B", "Option C", "Option D"],
  correctAnswer: 2, // Index of correct option (0-based)
  weightage: 8     // Points for this question (3-10 recommended)
}
\`\`\`

**Important**: The question selection algorithm works best when:
- Questions have weights between 3-10 points
- There are multiple combinations that can total 50 points
- The question bank has sufficient variety

### Customizing Target Score

To change the target score from 50 points, modify the \`selectRandomQuestions\` call in \`src/App.tsx\`:

\`\`\`typescript
const randomQuestions = selectRandomQuestions(questionBank, 60, 10); // 60 points, 10 questions
\`\`\`

### Styling

The application uses TailwindCSS for styling. You can customize:
- Colors and themes in \`tailwind.config.js\`
- Component styles in individual component files
- Global styles in \`src/index.css\`

## Contributing

1. Fork the repository
2. Create a feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add some amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
