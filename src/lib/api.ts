import { User } from '../types';

export const api = {
  // Auth endpoints
  async signup(data: { name: string; email: string; password: string; role: string; grade?: string }) {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to sign up');
    return result;
  },

  async login(credentials: { email: string; password: string }) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to log in');
    return result;
  },

  async logout() {
    const res = await fetch('/api/auth/logout', { method: 'POST' });
    return res.json();
  },

  async getMe(): Promise<{ user: User; isAuthenticated: boolean }> {
    const res = await fetch('/api/auth/me');
    if (!res.ok) throw new Error('Failed to fetch session');
    return res.json();
  },

  async switchDemo(email: string): Promise<{ user: User }> {
    const res = await fetch('/api/auth/switch-demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to switch demo user');
    return result;
  },

  // AI & Socratic Endpoints
  async getSocraticHint(params: { question: string; currentInput?: string; context?: string; language?: string }) {
    const res = await fetch('/api/ai/socratic-hint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return res.json();
  },

  async diagnoseLoophole(params: { topic: string; incorrectAnswer: string; stepDetails?: string }) {
    const res = await fetch('/api/ai/diagnose-loophole', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return res.json();
  },

  async evaluateBatch(params?: { totalPapers?: number }) {
    const res = await fetch('/api/ai/evaluate-batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params || {}),
    });
    return res.json();
  },

  async sendTeacherChatMessage(params: {
    message: string;
    history: Array<{ sender: 'user' | 'teacher'; text: string }>;
    subject?: string;
    language?: string;
  }) {
    const res = await fetch('/api/ai/teacher-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to get teacher response');
    return data;
  },
};
