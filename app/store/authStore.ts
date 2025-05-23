import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';

export interface User {
  _id: string;
  username: string;
  email: string;
  bio?: string;
  role?: string;
  location?: string;
  website?: string;
  phoneNumber?: any;
  profileImage?: string;
  socialMediaLink?: {
    name: string;
    link: string;
  }
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
}

const updateAuthCookies = (token: string | null) => {
  if (typeof window === 'undefined') return; // Skip on server-side
  
  if (token) {
    Cookies.set('auth_token', token, { 
      expires: 7,
      path: '/',
      sameSite: 'Lax'
    });
  } else {
    Cookies.remove('auth_token');
  }
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      
      setAuth: (token: string, user: User | null) => {
        // Update cookie first
        updateAuthCookies(token);
        // Then update state
        set({ token, user, isAuthenticated: true });
      },
      
      clearAuth: () => {
        // Clear cookie first
        updateAuthCookies(null);
        // Then clear state
        set({ token: null, user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

if (typeof window !== 'undefined') {
  const state = useAuthStore.getState();
  if (state.token) {
    updateAuthCookies(state.token);
  }
}