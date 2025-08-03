const API_BASE_URL = (() => {
    console.log('🔍 Frontend Debug - window.location.hostname:', window.location.hostname);
    console.log('🔍 Frontend Debug - window.location.origin:', window.location.origin);

    if (window.location.hostname === 'localhost') {
        console.log('📍 Frontend: Using localhost API');
        return 'http://localhost:5000';
    }

    // Check if we're on the final production domain
    if (window.location.hostname === 'kubevela.guidewire.co.in') {
        console.log('📍 Frontend: Using kubevela.guidewire.co.in API');
        return 'https://kubevela.guidewire.co.in/api';
    }

    // For Vercel domain or any other domain, use current origin + /api
    const apiUrl = `${window.location.origin}/api`;
    console.log('📍 Frontend: Using origin-based API:', apiUrl);
    return apiUrl;
})();

export interface User {
    id: string;
    provider: 'google' | 'github';
    name: string;
    email: string;
    avatar?: string;
    username?: string;
}

export const authService = {
    async getCurrentUser(): Promise<User | null> {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/user`, {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                return data.success ? data.user : null;
            }
            return null;
        } catch (error) {
            console.error('Error fetching current user:', error);
            return null;
        }
    },

    async logout(): Promise<boolean> {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/logout`, {
                method: 'POST',
                credentials: 'include'
            });

            if (response.ok) {
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error during logout:', error);
            return false;
        }
    },

    getGoogleLoginUrl(): string {
        return `${API_BASE_URL}/auth/google`;
    },

    getGitHubLoginUrl(): string {
        return `${API_BASE_URL}/auth/github`;
    }
};
