# Google Sheets Setup Guide

This application integrates with Google Sheets to store quiz questions and user registration data. Follow this guide to set up your Google Spreadsheet correctly.

## Required Sheets and Structure

Your Google Spreadsheet must contain the following sheets with the specified column structure:

### 1. Questions Sheet (Sheet1 or Main Sheet)

This sheet contains the quiz questions. The application expects the following columns:

| Column | Header | Description | Example |
|--------|--------|-------------|---------|
| A | Question | The quiz question text | "What is the capital of France?" |
| B | Option1 | First answer option | "London" |
| C | Option2 | Second answer option | "Berlin" |
| D | Option3 | Third answer option | "Paris" |
| E | Option4 | Fourth answer option | "Madrid" |
| F | CorrectAnswer | Index of correct answer (0-3) or exact text | 2 or "Paris" |
| G | Difficulty | Question difficulty or weightage | "Easy", "Medium", "Hard" or 5, 10, 20 |

#### Difficulty/Weightage Mapping:
- **Easy**: 5 points
- **Medium**: 10 points  
- **Hard**: 20 points

#### Sample Questions Sheet:
```
Question                                    | Option1    | Option2    | Option3  | Option4 | CorrectAnswer | Difficulty
What is the capital of France?             | London     | Berlin     | Paris    | Madrid  | 2             | Easy
Which language is used for web development?| Python     | JavaScript | Java     | C++     | 1             | Medium
What is 15 + 25?                          | 30         | 35         | 40       | 45      | 2             | Easy
```

### 2. UserData Sheet

Create a new sheet named **"UserData"** (exact name, case-sensitive) for storing OAuth user authentication information.

| Column | Header | Description | Auto-filled |
|--------|--------|-------------|-------------|
| A | Timestamp | When the user authenticated | ✅ Auto |
| B | Email | User's email address | From OAuth |
| C | Name | User's display name | From OAuth |
| D | Provider | OAuth provider (google/github) | From OAuth |
| E | UserId | Unique user ID from provider | From OAuth |

#### Sample UserData Sheet:
```
Timestamp                    | Email              | Name        | Provider | UserId
2025-08-02T10:30:00.000Z    | john@example.com   | John Doe    | google   | 123456789
2025-08-02T11:15:00.000Z    | jane@github.com    | Jane Smith  | github   | 987654321
```

## Setup Instructions

### Step 1: Create Google Spreadsheet
1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it appropriately (e.g., "Quiz App Data")

### Step 2: Set up Questions Sheet
1. In the first sheet (usually named "Sheet1"), add the headers in row 1:
   ```
   A1: Question
   B1: Option1  
   C1: Option2
   D1: Option3
   E1: Option4
   F1: CorrectAnswer
   G1: Difficulty
   ```
2. Add your quiz questions starting from row 2
3. Make sure the CorrectAnswer column uses 0-based indexing (0=Option1, 1=Option2, 2=Option3, 3=Option4)

### Step 3: Create UserData Sheet
1. Right-click on the sheet tab at the bottom
2. Select "Insert sheet"
3. Name the new sheet exactly: **"UserData"** (case-sensitive)
4. Add the headers in row 1:
   ```
   A1: Timestamp
   B1: Email
   C1: Name  
   D1: Provider
   E1: UserId
   ```
5. Leave the data rows empty - the application will populate them automatically when users authenticate via OAuth

### Step 4: Configure Environment Variables
Make sure your backend `.env` file has the correct Google Sheets configuration:

```env
GOOGLE_SPREADSHEET_ID=your_actual_spreadsheet_id_here
GOOGLE_SHEETS_RANGE=Sheet1!A:G
GOOGLE_APPLICATION_CREDENTIALS=path/to/your/service-account-key.json
```

### Step 5: Set Permissions
1. Share your Google Spreadsheet with the service account email
2. Give "Editor" permissions to allow the application to write user data
3. The service account email can be found in your service account JSON file

## Troubleshooting

### Common Issues:

1. **"UserData sheet not found"**
   - Ensure the sheet is named exactly "UserData" (case-sensitive)
   - Check that the sheet exists in the same spreadsheet as your questions

2. **Questions not loading**
   - Verify the questions sheet has the correct column structure
   - Check that CorrectAnswer values are valid (0-3 or exact option text)
   - Ensure at least 2 options are provided for each question

3. **User data not saving**
   - Verify the service account has "Editor" permissions on the spreadsheet
   - Check that the UserData sheet exists with correct headers
   - Review backend logs for specific error messages

4. **Fallback behavior**
   - If Google Sheets is not configured or fails, the app uses built-in fallback questions
   - User registration data will be logged to server console for manual processing

### Validation Rules:

- **Questions**: Must have at least 2 options, valid correct answer, and positive weightage
- **OAuth Authentication**: Users must authenticate with Google or GitHub
- **Automatic Data**: User information is automatically captured from OAuth providers

## OAuth Setup

The application uses OAuth authentication instead of manual registration. You'll need to set up OAuth applications:

### Google OAuth Setup:
1. Go to [Google Cloud Console](https://console.developers.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set authorized redirect URIs: `http://localhost:5000/auth/google/callback`
6. Copy Client ID and Client Secret to your `.env` file

### GitHub OAuth Setup:
1. Go to [GitHub Developer Settings](https://github.com/settings/applications/new)
2. Create a new OAuth App
3. Set Homepage URL: `http://localhost:5173`
4. Set Authorization callback URL: `http://localhost:5000/auth/github/callback`
5. Copy Client ID and Client Secret to your `.env` file

### Backend Environment Variables:
```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
SESSION_SECRET=your-secret-key-change-in-production
```

## Alternative Fallback Approach

If the UserData sheet cannot be created or accessed, the application will attempt to save data to "Sheet2". As a backup:

1. Create a second sheet named "Sheet2"
2. Use the same UserData column structure
3. The application will automatically try this fallback location

## Testing Your Setup

1. Start the backend server
2. Check the console logs for Google Sheets connection status
3. Visit the health endpoint: `http://localhost:5000/api/health`
4. Test questions API: `http://localhost:5000/api/questions`
5. Register a test user through the frontend to verify data saving

If you see "Google Sheets: CONFIGURED" in the logs, your setup is working correctly!
