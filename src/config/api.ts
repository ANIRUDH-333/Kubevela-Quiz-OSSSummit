// Shared API configuration
export const getApiBaseUrl = (): string => {
    console.log('🔍 API Config Debug - window.location.hostname:', window.location.hostname);
    console.log('🔍 API Config Debug - window.location.origin:', window.location.origin);
    console.log('🔍 API Config Debug - VITE_API_URL:', import.meta.env.VITE_API_URL);

    // PRIORITY 1: Check for environment variable first
    if (import.meta.env.VITE_API_URL) {
        console.log('📍 API Config: Using VITE_API_URL:', import.meta.env.VITE_API_URL);
        return import.meta.env.VITE_API_URL;
    }

    // PRIORITY 2: localhost development fallback
    if (window.location.hostname === 'localhost') {
        console.log('📍 API Config: Using localhost API (fallback)');
        return 'http://localhost:5000';
    }

    // PRIORITY 3: Force Vercel API for production domains
    console.log('📍 API Config: Using Vercel API (default)');
    return 'https://kubevela-quiz-oss-summit.vercel.app';
};

export const API_BASE_URL = getApiBaseUrl();
