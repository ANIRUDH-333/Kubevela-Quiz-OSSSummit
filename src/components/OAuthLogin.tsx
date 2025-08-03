import React, { useState, useEffect } from 'react';

interface OAuthLoginProps {
    onSuccess: (user: any) => void;
}

const OAuthLogin: React.FC<OAuthLoginProps> = ({ onSuccess }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Check if user is already authenticated
        const checkAuth = async () => {
            try {
                const response = await fetch('http://localhost:5000/auth/user', {
                    credentials: 'include'
                });
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.user) {
                        onSuccess(data.user);
                    }
                }
            } catch (error) {
                console.log('No existing authentication found');
            }
        };

        checkAuth();

        // Check for OAuth callback parameters
        const urlParams = new URLSearchParams(window.location.search);
        const authStatus = urlParams.get('auth');
        const authError = urlParams.get('error');

        if (authStatus === 'success') {
            // Clear URL parameters
            window.history.replaceState({}, document.title, window.location.pathname);
            // Check user info
            checkAuth();
        } else if (authError) {
            setError('Authentication failed. Please try again.');
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, [onSuccess]);

    const handleGoogleLogin = () => {
        setIsLoading(true);
        setError(null);
        window.location.href = 'http://localhost:5000/auth/google';
    };

    const handleGitHubLogin = () => {
        setIsLoading(true);
        setError(null);
        window.location.href = 'http://localhost:5000/auth/github';
    };

    const handleKeyDown = (event: React.KeyboardEvent, action: () => void) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            action();
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-8 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        Welcome to the Quiz
                    </h1>
                    <p className="text-gray-600">
                        Sign in with your preferred account to get started
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                )}

                <div className="space-y-4">
                    {/* Google Login Button */}
                    <button
                        onClick={handleGoogleLogin}
                        onKeyDown={(e) => handleKeyDown(e, handleGoogleLogin)}
                        disabled={isLoading}
                        className={`w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                            isLoading 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                : 'bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500'
                        }`}
                        tabIndex={0}
                        aria-label="Sign in with Google"
                    >
                        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        {isLoading ? 'Signing in...' : 'Continue with Google'}
                    </button>

                    {/* GitHub Login Button */}
                    <button
                        onClick={handleGitHubLogin}
                        onKeyDown={(e) => handleKeyDown(e, handleGitHubLogin)}
                        disabled={isLoading}
                        className={`w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                            isLoading 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                : 'bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-500'
                        }`}
                        tabIndex={0}
                        aria-label="Sign in with GitHub"
                    >
                        <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                        </svg>
                        {isLoading ? 'Signing in...' : 'Continue with GitHub'}
                    </button>
                </div>

                <div className="mt-8 text-center text-sm text-gray-500">
                    <p>
                        By signing in, you agree to participate in the quiz.
                        <br />
                        Your information will be kept confidential.
                    </p>
                </div>

                {/* Benefits Section */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h3 className="text-sm font-medium text-blue-800 mb-2">Why sign in?</h3>
                    <ul className="text-xs text-blue-700 space-y-1">
                        <li>• Secure authentication with trusted providers</li>
                        <li>• Automatic profile information</li>
                        <li>• Track your quiz progress</li>
                        <li>• No need to remember another password</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default OAuthLogin;
