import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../lib/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authModalOpen: boolean;
  openAuthModal: (defaultMode?: 'login' | 'signup') => void;
  closeAuthModal: () => void;
  authMode: 'login' | 'signup';
  setAuthMode: (mode: 'login' | 'signup') => void;
  login: (email: string, pass: string) => Promise<void>;
  signup: (data: { name: string; email: string; password: string; role: string; grade?: string }) => Promise<void>;
  logout: () => Promise<void>;
  switchDemoUser: (email: string) => Promise<void>;
  updateUserXp: (amount: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  useEffect(() => {
    async function checkAuth() {
      try {
        const data = await api.getMe();
        setUser(data.user);
        setIsAuthenticated(data.isAuthenticated);
      } catch (err) {
        console.error('Session check error:', err);
      } finally {
        setIsLoading(false);
      }
    }
    checkAuth();
  }, []);

  const openAuthModal = (mode: 'login' | 'signup' = 'login') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const login = async (email: string, pass: string) => {
    const res = await api.login({ email, password: pass });
    setUser(res.user);
    setIsAuthenticated(true);
    setAuthModalOpen(false);
  };

  const signup = async (data: { name: string; email: string; password: string; role: string; grade?: string }) => {
    const res = await api.signup(data);
    setUser(res.user);
    setIsAuthenticated(true);
    setAuthModalOpen(false);
  };

  const logout = async () => {
    await api.logout();
    setIsAuthenticated(false);
    // Reload guest / default session
    const data = await api.getMe();
    setUser(data.user);
  };

  const switchDemoUser = async (email: string) => {
    const res = await api.switchDemo(email);
    setUser(res.user);
    setIsAuthenticated(true);
  };

  const updateUserXp = (amount: number) => {
    if (user) {
      setUser({ ...user, xp: Math.max(0, user.xp + amount) });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        authModalOpen,
        openAuthModal,
        closeAuthModal,
        authMode,
        setAuthMode,
        login,
        signup,
        logout,
        switchDemoUser,
        updateUserXp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
