# Quiz Application

A React TypeScript quiz application with user registration, intelligent question selection, Google Sheets integration, and modern UI built with TailwindCSS.

## Features

- **User Registration**: Collect user details (email, name, company) before starting the quiz
- **Google Sheets Integration**: Store user data and quiz questions in Google Spreadsheets
- **Smart Question Selection**: Automatically selects 10 random questions targeting 100 points total
- **Multiple Choice Questions**: MCQ-style questions with single answer selection
- **Weighted Scoring**: Questions have different difficulty levels (Easy=5, Medium=10, Hard=20 points)
- **Random Quiz Generation**: Every quiz attempt uses a different combination of questions
- **Progress Tracking**: Visual progress bar and question counter
- **Navigation**: Navigate between questions with Previous/Next buttons
- **Results Display**: Comprehensive results with score breakdown and performance metrics
- **Responsive Design**: Mobile-friendly UI built with TailwindCSS
- **Accessibility**: Keyboard navigation and ARIA labels for better accessibility
- **TypeScript**: Full type safety throughout the application
- **Backend API**: Express.js backend with Google Sheets API integration
- **Debug Mode**: Development view showing selected questions and their weights

## Architecture

### Frontend (React + TypeScript)
- User registration form with validation
- Quiz interface with question navigation
- Results display with user information
- Real-time backend communication

### Backend (Node.js + Express)
- RESTful API endpoints for questions and user data
- Google Sheets API integration for data storage
- Automatic fallback to local data if Google Sheets unavailable
- Comprehensive error handling and logging

### Data Storage
- **Google Sheets**: Primary storage for questions and user data
- **Fallback Questions**: Local question bank when Google Sheets unavailable
- **Caching**: 5-minute cache for Google Sheets data to improve performance

## Technologies Used

- **Frontend**: React 18, TypeScript, Vite, TailwindCSS
- **Backend**: Node.js, Express.js, Google Sheets API
- **Styling**: TailwindCSS, PostCSS
- **Development**: Hot reload, ESLint, TypeScript compilation

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn
- Google Cloud Platform account (for Google Sheets integration)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd osssummit
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Install backend dependencies:
   ```bash
   cd backend
   npm install
   cd ..
   ```

4. Set up Google Sheets integration:
   - Follow the detailed guide in [`GOOGLE_SHEETS_SETUP.md`](./GOOGLE_SHEETS_SETUP.md)
   - Create service account credentials
   - Set up your spreadsheet with required sheets

5. Configure environment variables:
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your Google Sheets configuration
   ```

6. Start the backend server:
   ```bash
   cd backend
   npm start
   ```

7. Start the frontend development server:
   ```bash
   npm run dev
   ```

8. Open your browser and navigate to `http://localhost:5173`

### Building for Production

To build the application for production:

```bash
npm run build
```

The built files will be in the \`dist\` directory.

## Project Structure

```
src/
├── components/
│   ├── QuestionComponent.tsx    # Individual question display
│   ├── Results.tsx              # Results and score display
│   ├── UserRegistration.tsx     # User registration form
│   └── QuizDebugInfo.tsx        # Debug info for development
├── data/
│   └── questions.ts             # Fallback question bank
├── hooks/
│   └── useQuestions.ts          # Custom hook for fetching questions
├── services/
│   ├── questionService.ts       # API calls for questions
│   └── userService.ts           # API calls for user data
├── types/
│   └── quiz.ts                  # TypeScript type definitions
├── utils/
│   └── questionSelector.ts     # Smart question selection algorithm
├── App.tsx                      # Main application component
├── main.tsx                     # Application entry point
└── index.css                    # Global styles with Tailwind

backend/
├── server.js                    # Express server with Google Sheets API
├── package.json                 # Backend dependencies
├── credentials.json             # Google service account key (not in repo)
└── .env                         # Environment variables (not in repo)
```

## API Endpoints

### Questions
- `GET /api/questions` - Get all quiz questions
- `GET /api/questions/:id` - Get specific question by ID
- `GET /api/questions/stats` - Get question statistics
- `POST /api/questions/refresh` - Refresh question cache

### User Data
- `POST /api/user-data` - Save user registration data

### System
- `GET /api/health` - Health check endpoint
- `GET /api/debug` - Debug information for troubleshooting

## Algorithm Details

### Question Selection Logic

The application selects 10 questions targeting 100 total points:

1. **Difficulty Distribution**: Aims for a mix of Easy (5pts), Medium (10pts), and Hard (20pts) questions
2. **Randomization**: Questions are shuffled for variety
3. **Score Optimization**: Attempts to reach exactly 100 points
4. **Fallback Strategy**: If exact match isn't possible, finds the closest combination
5. **Final Shuffle**: Selected questions are shuffled again for random order

### Scoring System
- **Easy Questions**: 5 points each
- **Medium Questions**: 10 points each  
- **Hard Questions**: 20 points each
- **Target Total**: 100 points per quiz

## Google Sheets Integration

The application integrates with Google Sheets for:

### Questions Storage
- Reads quiz questions from Google Sheets
- Supports dynamic question management
- Automatic fallback to local questions if sheets unavailable

### User Data Storage
- Saves user registration data (email, name, company)
- Timestamps all entries automatically
- Handles sheet creation and permission errors gracefully

For detailed setup instructions, see [`GOOGLE_SHEETS_SETUP.md`](./GOOGLE_SHEETS_SETUP.md).

## Customization

### Adding Questions via Google Sheets

1. Access your Google Spreadsheet
2. Add new rows to the Questions sheet with the format:
   - Column A: Question text
   - Column B-E: Answer options  
   - Column F: Correct answer (0-3 or exact text)
   - Column G: Difficulty (Easy/Medium/Hard or 5/10/20)

### Local Question Bank

For testing or fallback, edit `src/data/questions.ts`:

```typescript
{
  id: 26,
  question: "Your question here?",
  options: ["Option A", "Option B", "Option C", "Option D"],
  correctAnswer: 2, // Index of correct option (0-based)
  weightage: 10    // Points: 5 (Easy), 10 (Medium), 20 (Hard)
}
```

### Customizing Target Score

To change the target score from 100 points, modify the `selectRandomQuestions` call in `src/App.tsx`:

```typescript
const randomQuestions = selectRandomQuestions(allQuestions, 150, 12); // 150 points, 12 questions
```

### Environment Configuration

Backend configuration in `backend/.env`:

```env
PORT=5000
GOOGLE_SPREADSHEET_ID=your_spreadsheet_id
GOOGLE_SHEETS_RANGE=Sheet1!A:G
GOOGLE_APPLICATION_CREDENTIALS=./credentials.json
NODE_ENV=development
```

## Troubleshooting

### Common Issues

1. **Backend not starting**: Check if port 5000 is available
2. **Google Sheets errors**: Verify credentials and spreadsheet permissions
3. **Questions not loading**: Check spreadsheet format and API quotas
4. **User data not saving**: Ensure UserData sheet exists with correct headers

### Debug Information

- Access `/api/debug` for backend diagnostics
- Check browser console for frontend errors
- Review backend logs for Google Sheets connection status

### Fallback Behavior

The application gracefully handles failures:
- **No Google Sheets**: Uses local question bank
- **Network issues**: Continues with cached data
- **User data errors**: Logs data to console for manual recovery

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
