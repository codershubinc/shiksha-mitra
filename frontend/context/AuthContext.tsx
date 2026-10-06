"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { api } from '@/lib/api';

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
        if (data.isAuthenticated && data.user) {
          setUser(data.user);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        setIsAuthenticated(false);
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
    if (res.jwt) {
      localStorage.setItem('aws_jwt', JSON.stringify(res.jwt));
    }
    if (res.token) {
      localStorage.setItem('local_token', res.token);
    }
    setUser(res.user);
    setIsAuthenticated(true);
    setAuthModalOpen(false);
  };

  const signup = async (data: { name: string; email: string; password: string; role: string; grade?: string }) => {
    const res = await api.signup(data);
    if (res.jwt) {
      localStorage.setItem('aws_jwt', JSON.stringify(res.jwt));
    }
    if (res.token) {
      localStorage.setItem('local_token', res.token);
    }
    setUser(res.user);
    setIsAuthenticated(true);
    setAuthModalOpen(false);
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (e) {
      console.warn('Logout API failed:', e);
    }
    localStorage.removeItem('aws_jwt');
    localStorage.removeItem('local_token');
    setIsAuthenticated(false);
    setUser(null);
  };

  const switchDemoUser = async (email: string) => {
    // Deprecated backend endpoint, ignoring
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
