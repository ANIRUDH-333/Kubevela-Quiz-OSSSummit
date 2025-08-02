const API_BASE_URL = 'http://localhost:5000';

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
            
            const data = await response.json();
            return data.success;
        } catch (error) {
            console.error('Error logging out:', error);
            return false;
        }
    },

    loginWithGoogle(): void {
        window.location.href = `${API_BASE_URL}/auth/google`;
    },

    loginWithGitHub(): void {
        window.location.href = `${API_BASE_URL}/auth/github`;
    }
};
