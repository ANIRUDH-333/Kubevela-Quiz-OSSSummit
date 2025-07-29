# Quiz Backend

A Node.js/Express backend service that fetches quiz questions from Google Sheets with fallback to static questions.

## Features

- **Google Sheets Integration**: Dynamically fetch questions from Google Sheets
- **Fallback System**: Uses static questions if Google Sheets is unavailable
- **RESTful API**: Clean API endpoints for frontend integration
- **CORS Enabled**: Ready for frontend integration
- **Error Handling**: Robust error handling with graceful fallbacks

## API Endpoints

### GET /api/health
Returns server health status.

**Response:**
```json
{
  "status": "OK",
  "message": "Quiz backend is running"
}
```

### GET /api/questions
Fetches all quiz questions from Google Sheets (with fallback to static questions).

**Response:**
```json
{
  "success": true,
  "questions": [
    {
      "id": 1,
      "question": "What is the capital of France?",
      "options": ["London", "Berlin", "Paris", "Madrid"],
      "correctAnswer": 2,
      "weightage": 5
    }
  ],
  "source": "google-sheets" // or "fallback"
}
```

### GET /api/questions/:id
Fetches a specific question by ID.

**Response:**
```json
{
  "success": true,
  "question": {
    "id": 1,
    "question": "What is the capital of France?",
    "options": ["London", "Berlin", "Paris", "Madrid"],
    "correctAnswer": 2,
    "weightage": 5
  }
}
```

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Google Sheets Setup

#### A. Create a Google Sheet
1. Create a new Google Sheet
2. Set up columns as follows:
   - **Column A**: Question
   - **Column B**: Option 1
   - **Column C**: Option 2
   - **Column D**: Option 3
   - **Column E**: Option 4
   - **Column F**: Correct Answer (0-3, where 0 = Option 1, 1 = Option 2, etc.)
   - **Column G**: Weightage (numeric value)

#### B. Enable Google Sheets API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Sheets API
4. Go to "Credentials" and create a Service Account
5. Download the JSON key file for the service account
6. Share your Google Sheet with the service account email (give "Viewer" access)

### 3. Environment Configuration
```bash
cp .env.example .env
```

Edit `.env` and update:
- `GOOGLE_SPREADSHEET_ID`: Your Google Sheet ID (from the URL)
- `GOOGLE_APPLICATION_CREDENTIALS`: Path to your service account JSON file
- `GOOGLE_SHEETS_RANGE`: Range to read from (default: Sheet1!A:G)

### 4. Run the Server
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## Google Sheet Format Example

| Question | Option 1 | Option 2 | Option 3 | Option 4 | Correct Answer | Weightage |
|----------|----------|----------|----------|----------|----------------|-----------|
| What is the capital of France? | London | Berlin | Paris | Madrid | 2 | 5 |
| Which programming language is used for React? | Python | JavaScript | Java | C++ | 1 | 10 |

## Environment Variables

- `GOOGLE_SPREADSHEET_ID`: The ID of your Google Sheet
- `GOOGLE_SHEETS_RANGE`: The range to read (default: Sheet1!A:G)
- `GOOGLE_APPLICATION_CREDENTIALS`: Path to service account JSON
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment (development/production)

## Fallback System

If Google Sheets is not configured or fails:
- The API will automatically return a set of fallback questions
- The response will include `"source": "fallback"` to indicate this
- No errors are thrown - the system gracefully degrades

## CORS Configuration

The server is configured to accept requests from any origin. In production, you should restrict this to your frontend domain only.

## Error Handling

- All endpoints return JSON responses
- Errors are logged to console
- Graceful fallbacks prevent service interruption
- HTTP status codes follow REST conventions
