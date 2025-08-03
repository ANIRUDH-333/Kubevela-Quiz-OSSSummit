import { API_BASE_URL } from '../config/api';

const AUTH_API_BASE_URL = `${API_BASE_URL}/api`;

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
            const response = await fetch(`${AUTH_API_BASE_URL}/auth/user`, {
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
            const response = await fetch(`${AUTH_API_BASE_URL}/auth/logout`, {
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
        const url = `${AUTH_API_BASE_URL}/auth/google`;
        console.log('🔍 Frontend: Google login URL:', url);
        return url;
    },

    getGitHubLoginUrl(): string {
        const url = `${AUTH_API_BASE_URL}/auth/github`;
        console.log('🔍 Frontend: GitHub login URL:', url);
        return url;
    }
};
