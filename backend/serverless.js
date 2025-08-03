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

// Debug environment variables on startup
console.log('🚀 Server starting with environment:');
console.log('📍 NODE_ENV:', process.env.NODE_ENV);
console.log('📍 FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('📍 API_BASE_URL:', process.env.API_BASE_URL);
console.log('📍 GOOGLE_CLIENT_ID set:', !!process.env.GOOGLE_CLIENT_ID);
console.log('📍 GITHUB_CLIENT_ID set:', !!process.env.GITHUB_CLIENT_ID);

const app = express();

// Helper function to get the appropriate frontend URL
function getFrontendURL(req = null) {
    console.log('🔍 Debug - NODE_ENV:', process.env.NODE_ENV);
    console.log('🔍 Debug - FRONTEND_URL:', process.env.FRONTEND_URL);
    console.log('🔍 Debug - VERCEL:', process.env.VERCEL);
    console.log('🔍 Debug - VERCEL_URL:', process.env.VERCEL_URL);

    // Force production mode if we're on Vercel
    const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';

    if (!isProduction) {
        console.log('📍 Using localhost (development mode)');
        return 'http://localhost:5173';
    }

    // Check if we have a custom frontend URL set via environment variable
    if (process.env.FRONTEND_URL) {
        console.log('📍 Using FRONTEND_URL env var:', process.env.FRONTEND_URL);
        return process.env.FRONTEND_URL;
    }

    // If we have access to the request, try to determine from the referer or host
    if (req) {
        const referer = req.get('referer');
        const host = req.get('host');
        console.log('🔍 Debug - Referer:', referer);
        console.log('🔍 Debug - Host:', host);

        if (host && host.includes('kubevela.guidewire.co.in')) {
            console.log('📍 Detected kubevela.guidewire.co.in from host');
            return 'https://kubevela.guidewire.co.in';
        }
        if (host && host.includes('vercel.app')) {
            console.log('📍 Detected Vercel from host');
            return 'https://kubevela-quiz-oss-summit.vercel.app';
        }

        if (referer && referer.includes('kubevela.guidewire.co.in')) {
            console.log('📍 Detected kubevela.guidewire.co.in from referer');
            return 'https://kubevela.guidewire.co.in';
        }
        if (referer && referer.includes('kubevela-quiz-oss-summit.vercel.app')) {
            console.log('📍 Detected Vercel from referer');
            return 'https://kubevela-quiz-oss-summit.vercel.app';
        }
    }

    // If on Vercel but can't detect domain, default to Vercel URL
    if (process.env.VERCEL === '1' || process.env.VERCEL_URL) {
        const vercelUrl = `https://${process.env.VERCEL_URL || 'kubevela-quiz-oss-summit.vercel.app'}`;
        console.log('📍 Using Vercel URL:', vercelUrl);
        return vercelUrl;
    }

    // Default to Vercel for now since that's what's currently deployed
    console.log('📍 Using default: Vercel domain');
    return 'https://kubevela-quiz-oss-summit.vercel.app';
}

// Helper function to get the appropriate API callback URL
function getCallbackURL(path) {
    if (process.env.NODE_ENV !== 'production') {
        console.log('📍 Using local callback:', `http://localhost:3000${path}`);
        return `http://localhost:3000${path}`;
    }

    // For production, always use the current deployment domain
    // Don't use API_BASE_URL for callbacks - use the actual API domain
    const fullUrl = `https://kubevela-quiz-oss-summit.vercel.app${path}`;
    console.log('📍 Using Vercel callback (fixed):', fullUrl);
    return fullUrl;
}

// Middleware
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
const corsOrigins = isProduction
    ? ['https://kubevela-quiz-oss-summit.vercel.app', 'https://kubevela.guidewire.co.in']
    : 'http://localhost:5173';

console.log('🔧 CORS configuration - NODE_ENV:', process.env.NODE_ENV);
console.log('🔧 CORS configuration - VERCEL:', process.env.VERCEL);
console.log('🔧 CORS configuration - isProduction:', isProduction);
console.log('🔧 CORS origins:', corsOrigins);

app.use(cors({
    origin: corsOrigins,
    credentials: true
}));
app.use(express.json());

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'quiz-app-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: isProduction,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: isProduction ? 'none' : 'lax' // Allow cross-site cookies in production
    },
    // Add a session store warning for production
    ...(isProduction && {
        name: 'quiz.sid'
    })
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
        callbackURL: getCallbackURL('/api/auth/google/callback')
    }, async (accessToken, refreshToken, profile, done) => {
        const user = {
            id: profile.id,
            provider: 'google',
            name: profile.displayName,
            email: profile.emails[0].value,
            avatar: profile.photos[0].value
        };

        await saveUserToSheets(user);
        return done(null, user);
    }));
}

// GitHub OAuth Strategy
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    passport.use(new GitHubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: getCallbackURL('/api/auth/github/callback')
    }, async (accessToken, refreshToken, profile, done) => {
        const user = {
            id: profile.id,
            provider: 'github',
            name: profile.displayName || profile.username,
            email: profile.emails && profile.emails[0] ? profile.emails[0].value : null,
            avatar: profile.photos[0].value,
            username: profile.username
        };

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
        if (!SPREADSHEET_ID || SPREADSHEET_ID === 'your_spreadsheet_id_here') {
            console.log('Google Sheets not configured - SPREADSHEET_ID missing or default value');
            return;
        }

        let auth;
        if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
            // Use JSON credentials from environment variable
            try {
                const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
                auth = new google.auth.GoogleAuth({
                    credentials: credentials,
                    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
                });
            } catch (parseError) {
                console.error('❌ Error parsing GOOGLE_SERVICE_ACCOUNT_JSON:', parseError.message);
                return;
            }
        } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
            // Check if it's a file path or JSON content
            let credentials;
            if (process.env.GOOGLE_APPLICATION_CREDENTIALS.startsWith('{')) {
                // It's JSON content
                try {
                    credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
                    auth = new google.auth.GoogleAuth({
                        credentials: credentials,
                        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
                    });
                } catch (parseError) {
                    console.error('❌ Error parsing Google credentials JSON:', parseError.message);
                    return;
                }
            } else {
                // It's a file path
                auth = new google.auth.GoogleAuth({
                    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
                    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
                });
            }
        } else {
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
    const startIndex = rows[0] && rows[0][0] && rows[0][0].toLowerCase().includes('question') ? 1 : 0;

    for (let i = startIndex; i < rows.length; i++) {
        const row = rows[i];

        if (row && row.length >= 6) {
            const options = [
                row[1] ? row[1].toString().trim() : '',
                row[2] ? row[2].toString().trim() : '',
                row[3] ? row[3].toString().trim() : '',
                row[4] ? row[4].toString().trim() : ''
            ].filter(option => option !== '');

            let correctAnswer = 0;
            const correctAnswerValue = row[5] ? row[5].toString().trim() : '';

            if (!isNaN(correctAnswerValue)) {
                correctAnswer = parseInt(correctAnswerValue);
            } else {
                correctAnswer = options.findIndex(option =>
                    option.toLowerCase() === correctAnswerValue.toLowerCase()
                );
                if (correctAnswer === -1) correctAnswer = 0;
            }

            let weightage = 10;
            if (row[6]) {
                const difficultyOrWeightage = row[6].toString().trim().toLowerCase();
                if (!isNaN(difficultyOrWeightage)) {
                    weightage = parseInt(difficultyOrWeightage);
                } else {
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
                id: i - startIndex + 1,
                question: row[0] ? row[0].toString().trim() : '',
                options: options,
                correctAnswer: correctAnswer,
                weightage: weightage
            };

            if (question.question && question.options.length >= 2 &&
                question.correctAnswer >= 0 && question.correctAnswer < question.options.length &&
                question.weightage > 0) {
                questions.push(question);
            }
        }
    }

    console.log(`📝 Transformed ${questions.length} valid questions from Google Sheets`);
    return questions;
}

// Fallback questions
const fallbackQuestions = [
    {
        id: 1,
        question: "What is the capital of France?",
        options: ["London", "Berlin", "Paris", "Madrid"],
        correctAnswer: 2,
        weightage: 5
    },
    {
        id: 2,
        question: "Which programming language is known for its use in web development and has a React library?",
        options: ["Python", "JavaScript", "Java", "C++"],
        correctAnswer: 1,
        weightage: 10
    },
    {
        id: 3,
        question: "What is 2 + 2?",
        options: ["3", "4", "5", "6"],
        correctAnswer: 1,
        weightage: 5
    },
    {
        id: 4,
        question: "Which planet is known as the Red Planet?",
        options: ["Venus", "Mars", "Jupiter", "Saturn"],
        correctAnswer: 1,
        weightage: 5
    },
    {
        id: 5,
        question: "What is the largest ocean on Earth?",
        options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
        correctAnswer: 3,
        weightage: 5
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
app.get('/api/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/api/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/?error=auth_failed' }),
    (req, res) => {
        const frontendURL = getFrontendURL(req);
        res.redirect(`${frontendURL}?auth=success`);
    }
);

app.get('/api/auth/github',
    passport.authenticate('github', { scope: ['user:email'] })
);

app.get('/api/auth/github/callback',
    passport.authenticate('github', { failureRedirect: '/?error=auth_failed' }),
    (req, res) => {
        const frontendURL = getFrontendURL(req);
        res.redirect(`${frontendURL}?auth=success`);
    }
);

app.get('/api/auth/user', (req, res) => {
    console.log('🔍 Auth debug - req.isAuthenticated():', req.isAuthenticated());
    console.log('🔍 Auth debug - req.user:', req.user);
    console.log('🔍 Auth debug - req.session:', req.session);
    
    if (req.isAuthenticated()) {
        res.json({
            success: true,
            user: req.user
        });
    } else {
        res.status(401).json({
            success: false,
            message: 'Not authenticated',
            debug: {
                isAuthenticated: req.isAuthenticated(),
                hasSession: !!req.session,
                sessionId: req.sessionID
            }
        });
    }
});

app.post('/api/auth/logout', (req, res) => {
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

// Cache for Google Sheets data
let cachedQuestions = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function fetchQuestionsFromSheets() {
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

        if (!rows || rows.length === 0) {
            console.log('📋 No data found in Google Sheets, using fallback questions');
            return { questions: fallbackQuestions, source: 'fallback' };
        }

        const questions = transformSheetDataToQuestions(rows);

        if (questions.length === 0) {
            console.log('📋 No valid questions found in Google Sheets, using fallback questions');
            return { questions: fallbackQuestions, source: 'fallback' };
        }

        const result = { questions, source: 'google-sheets' };
        cachedQuestions = result;
        cacheTimestamp = Date.now();

        console.log(`✅ Successfully fetched ${questions.length} questions from Google Sheets`);
        return result;

    } catch (error) {
        console.error('❌ Error fetching from Google Sheets:', error.message);

        if (cachedQuestions) {
            console.log('📋 Using expired cache due to error');
            return { ...cachedQuestions, source: 'cached-fallback' };
        }

        return { questions: fallbackQuestions, source: 'fallback-error' };
    }
}

// API Routes
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Quiz backend is running',
        googleSheets: isGoogleSheetsConfigured ? 'Connected' : 'Using fallback',
        timestamp: new Date().toISOString()
    });
});

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

        res.json({
            success: true,
            questions: fallbackQuestions,
            source: 'fallback-error',
            count: fallbackQuestions.length,
            error: 'Unexpected error occurred'
        });
    }
});

app.get('/api/questions/:id', async (req, res) => {
    try {
        const questionId = parseInt(req.params.id);

        if (isNaN(questionId) || questionId < 1) {
            return res.status(400).json({
                success: false,
                message: 'Invalid question ID'
            });
        }

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

app.post('/api/questions/refresh', async (req, res) => {
    try {
        cachedQuestions = null;
        cacheTimestamp = null;

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

// Export the app for serverless deployment
export default app;
