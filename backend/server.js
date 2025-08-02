import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { google } from 'googleapis';
import fs from 'fs';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: 'http://localhost:5173', // Frontend URL
    credentials: true
}));
app.use(express.json());

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'quiz-app-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true in production with HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());

// Passport serialization
passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback"
    }, async (accessToken, refreshToken, profile, done) => {
        const user = {
            id: profile.id,
            provider: 'google',
            name: profile.displayName,
            email: profile.emails[0].value,
            avatar: profile.photos[0].value
        };
        
        // Save user data to Google Sheets
        await saveUserToSheets(user);
        
        return done(null, user);
    }));
}

// GitHub OAuth Strategy
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    passport.use(new GitHubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: "/auth/github/callback"
    }, async (accessToken, refreshToken, profile, done) => {
        const user = {
            id: profile.id,
            provider: 'github',
            name: profile.displayName || profile.username,
            email: profile.emails && profile.emails[0] ? profile.emails[0].value : null,
            avatar: profile.photos[0].value,
            username: profile.username
        };
        
        // Save user data to Google Sheets
        await saveUserToSheets(user);
        
        return done(null, user);
    }));
}

// Helper function to save user data to Google Sheets
async function saveUserToSheets(user) {
    if (!isGoogleSheetsConfigured) {
        console.log('📝 User data (Google Sheets not configured):', {
            timestamp: new Date().toISOString(),
            provider: user.provider,
            email: user.email,
            name: user.name,
            userId: user.id
        });
        return;
    }

    try {
        const userDataRange = 'UserData!A:E';
        const timestamp = new Date().toISOString();
        
        const values = [[
            timestamp,
            user.email || '',
            user.name || '',
            user.provider || '',
            user.id || ''
        ]];

        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: userDataRange,
            valueInputOption: 'RAW',
            resource: {
                values: values
            }
        });

        console.log(`✅ OAuth user data saved: ${user.email} (${user.provider})`);
    } catch (error) {
        console.error('❌ Error saving OAuth user data:', error.message);
        // Still log for manual processing
        console.log('📝 OAuth user data (for manual processing):', {
            timestamp: new Date().toISOString(),
            provider: user.provider,
            email: user.email,
            name: user.name,
            userId: user.id
        });
    }
}

// Google Sheets configuration
const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;
const RANGE = process.env.GOOGLE_SHEETS_RANGE || 'Sheet1!A:G';

// Initialize Google Sheets API
let sheets;
let isGoogleSheetsConfigured = false;

async function initializeGoogleSheets() {
    try {
        // Check if we have the required environment variables
        if (!SPREADSHEET_ID || SPREADSHEET_ID === 'your_spreadsheet_id_here') {
            console.log('Google Sheets not configured - SPREADSHEET_ID missing or default value');
            return;
        }

        // Try to initialize with service account or application default credentials
        let auth;

        if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
            // Use service account key file
            auth = new google.auth.GoogleAuth({
                keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
                scopes: ['https://www.googleapis.com/auth/spreadsheets'],
            });
        } else {
            // Try application default credentials (useful for Google Cloud deployment)
            try {
                auth = new google.auth.GoogleAuth({
                    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
                });
            } catch (error) {
                console.log('No Google credentials found. Using fallback questions.');
                return;
            }
        }

        sheets = google.sheets({ version: 'v4', auth });

        // Test the connection by making a simple API call
        await sheets.spreadsheets.get({
            spreadsheetId: SPREADSHEET_ID,
        });

        isGoogleSheetsConfigured = true;
        console.log('✅ Google Sheets API initialized successfully');
        console.log(`📊 Connected to spreadsheet: ${SPREADSHEET_ID}`);

    } catch (error) {
        console.error('❌ Error initializing Google Sheets API:', error.message);
        console.log('📋 Will use fallback questions instead');
        isGoogleSheetsConfigured = false;
    }
}

// Initialize Google Sheets on startup
initializeGoogleSheets();

// Helper function to transform sheet data to quiz questions
function transformSheetDataToQuestions(rows) {
    const questions = [];

    // Skip header row (index 0) if it exists
    const startIndex = rows[0] && rows[0][0] && rows[0][0].toLowerCase().includes('question') ? 1 : 0;

    for (let i = startIndex; i < rows.length; i++) {
        const row = rows[i];

        // Expected columns: Question, Option1, Option2, Option3, Option4, CorrectAnswer, Difficulty/Weightage
        if (row && row.length >= 6) {
            const options = [
                row[1] ? row[1].toString().trim() : '',
                row[2] ? row[2].toString().trim() : '',
                row[3] ? row[3].toString().trim() : '',
                row[4] ? row[4].toString().trim() : ''
            ].filter(option => option !== ''); // Remove empty options

            // Handle correct answer - could be text or number
            let correctAnswer = 0;
            const correctAnswerValue = row[5] ? row[5].toString().trim() : '';

            if (!isNaN(correctAnswerValue)) {
                // If it's a number, use it directly
                correctAnswer = parseInt(correctAnswerValue);
            } else {
                // If it's text, find the matching option
                correctAnswer = options.findIndex(option =>
                    option.toLowerCase() === correctAnswerValue.toLowerCase()
                );
                if (correctAnswer === -1) correctAnswer = 0; // Default to first option if not found
            }

            // Handle weightage/difficulty
            let weightage = 10; // Default weightage (Medium)
            if (row[6]) {
                const difficultyOrWeightage = row[6].toString().trim().toLowerCase();
                if (!isNaN(difficultyOrWeightage)) {
                    // If it's a number, use it as weightage
                    weightage = parseInt(difficultyOrWeightage);
                } else {
                    // If it's difficulty text, convert to weightage based on new mapping
                    switch (difficultyOrWeightage) {
                        case 'easy':
                            weightage = 5;
                            break;
                        case 'medium':
                            weightage = 10;
                            break;
                        case 'hard':
                            weightage = 20;
                            break;
                        default:
                            console.warn(`Unknown difficulty level: "${difficultyOrWeightage}", using default weightage of 10`);
                            weightage = 10;
                    }
                }
            }

            const question = {
                id: i - startIndex + 1, // Adjust ID based on whether we skipped header
                question: row[0] ? row[0].toString().trim() : '',
                options: options,
                correctAnswer: correctAnswer,
                weightage: weightage
            };

            // Validate the question
            if (question.question && question.options.length >= 2 &&
                question.correctAnswer >= 0 && question.correctAnswer < question.options.length &&
                question.weightage > 0) {
                questions.push(question);
                console.log(`✅ Added question ${question.id}: "${question.question.substring(0, 50)}..." (Answer: ${question.correctAnswer}, Weight: ${question.weightage})`);
            } else {
                console.warn(`❌ Skipping invalid question at row ${i + 1}:`, {
                    question: question.question ? '✓' : '✗',
                    optionsCount: question.options.length,
                    correctAnswer: question.correctAnswer,
                    weightage: question.weightage,
                    originalCorrectAnswer: correctAnswerValue
                });
            }
        }
    }

    console.log(`📝 Transformed ${questions.length} valid questions from Google Sheets`);
    return questions;
}

// Enhanced fallback questions with new difficulty-based weightage (Easy=5, Medium=10, Hard=20)
const fallbackQuestions = [
    {
        id: 1,
        question: "What is the capital of France?",
        options: ["London", "Berlin", "Paris", "Madrid"],
        correctAnswer: 2,
        weightage: 5 // Easy
    },
    {
        id: 2,
        question: "Which programming language is known for its use in web development and has a React library?",
        options: ["Python", "JavaScript", "Java", "C++"],
        correctAnswer: 1,
        weightage: 10 // Medium
    },
    {
        id: 3,
        question: "What is 2 + 2?",
        options: ["3", "4", "5", "6"],
        correctAnswer: 1,
        weightage: 5 // Easy
    },
    {
        id: 4,
        question: "Which planet is known as the Red Planet?",
        options: ["Venus", "Mars", "Jupiter", "Saturn"],
        correctAnswer: 1,
        weightage: 5 // Easy
    },
    {
        id: 5,
        question: "What is the largest ocean on Earth?",
        options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
        correctAnswer: 3,
        weightage: 5 // Easy
    },
    {
        id: 6,
        question: "Who wrote 'Romeo and Juliet'?",
        options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"],
        correctAnswer: 1,
        weightage: 10 // Medium
    },
    {
        id: 7,
        question: "What is the chemical symbol for gold?",
        options: ["Go", "Gd", "Au", "Ag"],
        correctAnswer: 2,
        weightage: 10 // Medium
    },
    {
        id: 8,
        question: "Which year did World War II end?",
        options: ["1944", "1945", "1946", "1947"],
        correctAnswer: 1,
        weightage: 10 // Medium
    },
    {
        id: 9,
        question: "What is the smallest prime number?",
        options: ["0", "1", "2", "3"],
        correctAnswer: 2,
        weightage: 10 // Medium
    },
    {
        id: 10,
        question: "Which continent is the largest by area?",
        options: ["Africa", "Asia", "North America", "Europe"],
        correctAnswer: 1,
        weightage: 5 // Easy
    },
    {
        id: 11,
        question: "What is the speed of light in vacuum?",
        options: ["300,000 km/s", "150,000 km/s", "450,000 km/s", "600,000 km/s"],
        correctAnswer: 0,
        weightage: 20 // Hard
    },
    {
        id: 12,
        question: "Which HTML tag is used to create a hyperlink?",
        options: ["<link>", "<a>", "<href>", "<url>"],
        correctAnswer: 1,
        weightage: 5 // Easy
    },
    {
        id: 13,
        question: "What is the square root of 144?",
        options: ["10", "11", "12", "13"],
        correctAnswer: 2,
        weightage: 5 // Easy
    },
    {
        id: 14,
        question: "Who painted the Mona Lisa?",
        options: ["Pablo Picasso", "Vincent van Gogh", "Leonardo da Vinci", "Michelangelo"],
        correctAnswer: 2,
        weightage: 10 // Medium
    },
    {
        id: 15,
        question: "What is the most abundant gas in Earth's atmosphere?",
        options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"],
        correctAnswer: 2,
        weightage: 10 // Medium
    },
    {
        id: 16,
        question: "In React, what hook is used to manage component state?",
        options: ["useEffect", "useState", "useContext", "useReducer"],
        correctAnswer: 1,
        weightage: 10 // Medium
    },
    {
        id: 17,
        question: "What is the currency of Japan?",
        options: ["Yuan", "Won", "Yen", "Dong"],
        correctAnswer: 2,
        weightage: 5 // Easy
    },
    {
        id: 18,
        question: "Which CSS property is used to change text color?",
        options: ["font-color", "text-color", "color", "background-color"],
        correctAnswer: 2,
        weightage: 5 // Easy
    },
    {
        id: 19,
        question: "What is the tallest mountain in the world?",
        options: ["K2", "Mount Everest", "Kangchenjunga", "Lhotse"],
        correctAnswer: 1,
        weightage: 5 // Easy
    },
    {
        id: 20,
        question: "Which database query language is most commonly used?",
        options: ["NoSQL", "SQL", "GraphQL", "MongoDB"],
        correctAnswer: 1,
        weightage: 10 // Medium
    },
    {
        id: 21,
        question: "What is the time complexity of binary search in a sorted array?",
        options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
        correctAnswer: 1,
        weightage: 20 // Hard
    },
    {
        id: 22,
        question: "In computer science, what does 'NP-Complete' refer to?",
        options: ["Not Polynomial Complete", "Non-deterministic Polynomial Complete", "Nearly Perfect Complete", "Network Protocol Complete"],
        correctAnswer: 1,
        weightage: 20 // Hard
    },
    {
        id: 23,
        question: "What is the result of 15 % 4 in most programming languages?",
        options: ["3", "3.75", "4", "1"],
        correctAnswer: 0,
        weightage: 10 // Medium
    },
    {
        id: 24,
        question: "Which sorting algorithm has the best average-case time complexity?",
        options: ["Bubble Sort", "Quick Sort", "Selection Sort", "Insertion Sort"],
        correctAnswer: 1,
        weightage: 20 // Hard
    },
    {
        id: 25,
        question: "What does HTTP stand for?",
        options: ["HyperText Transfer Protocol", "High Tech Transfer Protocol", "HyperText Translation Protocol", "Home Tool Transfer Protocol"],
        correctAnswer: 0,
        weightage: 5 // Easy
    }
];

// Authentication middleware
const requireAuth = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({
        success: false,
        message: 'Authentication required'
    });
};

// OAuth Routes
app.get('/auth/google', 
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: 'http://localhost:5173?error=auth_failed' }),
    (req, res) => {
        // Successful authentication, redirect to frontend
        res.redirect('http://localhost:5173?auth=success');
    }
);

app.get('/auth/github',
    passport.authenticate('github', { scope: ['user:email'] })
);

app.get('/auth/github/callback',
    passport.authenticate('github', { failureRedirect: 'http://localhost:5173?error=auth_failed' }),
    (req, res) => {
        // Successful authentication, redirect to frontend
        res.redirect('http://localhost:5173?auth=success');
    }
);

// Get current user
app.get('/auth/user', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({
            success: true,
            user: req.user
        });
    } else {
        res.status(401).json({
            success: false,
            message: 'Not authenticated'
        });
    }
});

// Logout
app.post('/auth/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Logout failed'
            });
        }
        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    });
});

// Routes
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Quiz backend is running',
        googleSheets: isGoogleSheetsConfigured ? 'Connected' : 'Using fallback',
        timestamp: new Date().toISOString()
    });
});

// Debug endpoint to help troubleshoot Google Sheets issues
app.get('/api/debug', (req, res) => {
    const debug = {
        environment: {
            NODE_ENV: process.env.NODE_ENV,
            GOOGLE_SPREADSHEET_ID: process.env.GOOGLE_SPREADSHEET_ID ? 'Set' : 'Not set',
            GOOGLE_SHEETS_RANGE: process.env.GOOGLE_SHEETS_RANGE || 'Default: Sheet1!A:G',
            GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS ? 'Set' : 'Not set'
        },
        googleSheets: {
            configured: isGoogleSheetsConfigured,
            spreadsheetId: SPREADSHEET_ID || 'Not configured',
            range: RANGE
        },
        cache: {
            hasCachedQuestions: cachedQuestions !== null,
            cacheAge: cacheTimestamp ? Date.now() - cacheTimestamp : null
        },
        fileChecks: {
            envFileExists: fs.existsSync('.env'),
            credentialsFileExists: process.env.GOOGLE_APPLICATION_CREDENTIALS ?
                fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS) : false
        }
    };

    res.json({
        success: true,
        debug: debug,
        timestamp: new Date().toISOString()
    });
});

// Cache for Google Sheets data to avoid excessive API calls
let cachedQuestions = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function fetchQuestionsFromSheets() {
    // Check cache first
    if (cachedQuestions && cacheTimestamp &&
        (Date.now() - cacheTimestamp) < CACHE_DURATION) {
        console.log('📋 Using cached questions');
        return cachedQuestions;
    }

    if (!isGoogleSheetsConfigured) {
        console.log('🔄 Google Sheets not configured, using fallback questions');
        return { questions: fallbackQuestions, source: 'fallback' };
    }

    try {
        console.log('📊 Fetching fresh data from Google Sheets...');
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: RANGE,
        });

        const rows = response.data.values;
        console.log(`📋 Raw data from Google Sheets:`, {
            totalRows: rows ? rows.length : 0,
            firstRow: rows && rows[0] ? rows[0] : null,
            sampleRow: rows && rows[1] ? rows[1] : null
        });

        if (!rows || rows.length === 0) {
            console.log('📋 No data found in Google Sheets, using fallback questions');
            return { questions: fallbackQuestions, source: 'fallback' };
        }

        const questions = transformSheetDataToQuestions(rows);

        if (questions.length === 0) {
            console.log('📋 No valid questions found in Google Sheets, using fallback questions');
            console.log('🔍 Check your sheet format - expected columns: Question, Option1, Option2, Option3, Option4, CorrectAnswer, Weightage');
            return { questions: fallbackQuestions, source: 'fallback' };
        }

        // Cache the results
        const result = { questions, source: 'google-sheets' };
        cachedQuestions = result;
        cacheTimestamp = Date.now();

        console.log(`✅ Successfully fetched ${questions.length} questions from Google Sheets`);
        return result;

    } catch (error) {
        console.error('❌ Error fetching from Google Sheets:', error.message);

        // If we have cached data, use it even if expired
        if (cachedQuestions) {
            console.log('📋 Using expired cache due to error');
            return { ...cachedQuestions, source: 'cached-fallback' };
        }

        return { questions: fallbackQuestions, source: 'fallback-error' };
    }
}

app.get('/api/questions', async (req, res) => {
    try {
        const result = await fetchQuestionsFromSheets();

        res.json({
            success: true,
            questions: result.questions,
            source: result.source,
            count: result.questions.length,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Unexpected error in /api/questions:', error);

        // Always return something, even if it's just fallback questions
        res.json({
            success: true,
            questions: fallbackQuestions,
            source: 'fallback-error',
            count: fallbackQuestions.length,
            error: 'Unexpected error occurred'
        });
    }
});

// Get specific question by ID
app.get('/api/questions/:id', async (req, res) => {
    try {
        const questionId = parseInt(req.params.id);

        if (isNaN(questionId) || questionId < 1) {
            return res.status(400).json({
                success: false,
                message: 'Invalid question ID'
            });
        }

        // Get questions using the same caching mechanism
        const result = await fetchQuestionsFromSheets();
        const question = result.questions.find(q => q.id === questionId);

        if (!question) {
            return res.status(404).json({
                success: false,
                message: `Question with ID ${questionId} not found`
            });
        }

        res.json({
            success: true,
            question: question,
            source: result.source
        });

    } catch (error) {
        console.error('❌ Error fetching specific question:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get questions statistics
app.get('/api/questions/stats', async (req, res) => {
    try {
        const result = await fetchQuestionsFromSheets();
        const questions = result.questions;

        const stats = {
            totalQuestions: questions.length,
            totalWeightage: questions.reduce((sum, q) => sum + q.weightage, 0),
            averageWeightage: questions.length > 0 ?
                (questions.reduce((sum, q) => sum + q.weightage, 0) / questions.length).toFixed(2) : 0,
            weightageDistribution: {},
            source: result.source,
            lastUpdated: new Date().toISOString()
        };

        // Calculate weightage distribution
        questions.forEach(q => {
            stats.weightageDistribution[q.weightage] =
                (stats.weightageDistribution[q.weightage] || 0) + 1;
        });

        res.json({
            success: true,
            stats: stats
        });

    } catch (error) {
        console.error('❌ Error getting question stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get question statistics'
        });
    }
});

// Force refresh cache
app.post('/api/questions/refresh', async (req, res) => {
    try {
        // Clear cache
        cachedQuestions = null;
        cacheTimestamp = null;

        // Fetch fresh data
        const result = await fetchQuestionsFromSheets();

        res.json({
            success: true,
            message: 'Cache refreshed successfully',
            questions: result.questions.length,
            source: result.source,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Error refreshing cache:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to refresh cache'
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!'
    });
});

// Start server
app.listen(PORT, async () => {
    console.log(`🚀 Quiz backend server running on port ${PORT}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    console.log(`📋 Questions API: http://localhost:${PORT}/api/questions`);
    console.log(`📊 Stats API: http://localhost:${PORT}/api/questions/stats`);
    console.log(`🔄 Refresh API: http://localhost:${PORT}/api/questions/refresh`);
    console.log(`� OAuth Routes:`);
    console.log(`   Google: http://localhost:${PORT}/auth/google`);
    console.log(`   GitHub: http://localhost:${PORT}/auth/github`);
    console.log(`   User Info: http://localhost:${PORT}/auth/user`);
    console.log(`   Logout: http://localhost:${PORT}/auth/logout`);
    console.log(`⚡ Environment: ${process.env.NODE_ENV || 'development'}`);

    // Wait a moment for Google Sheets initialization to complete
    setTimeout(() => {
        if (isGoogleSheetsConfigured) {
            console.log(`📈 Google Sheets: CONFIGURED`);
            console.log(`📝 Spreadsheet ID: ${SPREADSHEET_ID}`);
        } else {
            console.log(`📈 Google Sheets: NOT CONFIGURED - Using fallback questions`);
        }
        
        // OAuth configuration status
        const googleOAuthConfigured = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
        const githubOAuthConfigured = !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET);
        
        console.log(`🔐 OAuth Status:`);
        console.log(`   Google OAuth: ${googleOAuthConfigured ? 'CONFIGURED' : 'NOT CONFIGURED'}`);
        console.log(`   GitHub OAuth: ${githubOAuthConfigured ? 'CONFIGURED' : 'NOT CONFIGURED'}`);
        
        if (!googleOAuthConfigured && !githubOAuthConfigured) {
            console.log(`⚠️  No OAuth providers configured. Please set up OAuth credentials in .env`);
        }
    }, 1000);
});
