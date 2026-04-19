import { create } from 'zustand';

interface User {
  id: number;
  email: string;
  name: string;
  is_admin: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  const safeGetItem = (key: string) => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  };

  const safeJsonParse = (val: string | null) => {
    try {
      return val ? JSON.parse(val) : null;
    } catch {
      return null;
    }
  };

  return {
    user: safeJsonParse(safeGetItem('user')),
    token: safeGetItem('token'),
    setAuth: (user, token) => {
      try {
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', token);
        set({ user, token });
      } catch (err) {
        console.error("AuthStore setAuth error:", err);
      }
    },
    logout: () => {
      try {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        set({ user: null, token: null });
      } catch (err) {
        console.error("AuthStore logout error:", err);
      }
    },
  };
});
