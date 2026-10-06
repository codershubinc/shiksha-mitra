"use client";

import { User } from '@/types';

const BACKEND_URL = typeof window !== 'undefined' 
  ? `${window.location.protocol}//${window.location.hostname}:3000`
  : (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000');

function url(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${BACKEND_URL}${normalized}`;
}

function getAuthHeaders(): HeadersInit {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (typeof window !== 'undefined') {
    const jwtStr = localStorage.getItem('aws_jwt');
    if (jwtStr) {
      try {
        const jwt = JSON.parse(jwtStr);
        if (jwt.AccessToken) {
          headers['Authorization'] = `Bearer ${jwt.AccessToken}`;
        }
      } catch (e) {}
    }
  }
  return headers;
}

/**
 * Streams teacher chat response chunk-by-chunk from the backend.
 * The backend sends plain text via chunked Transfer-Encoding.
 * Each yielded string is a raw text chunk to append to the message.
 */
export async function* streamTeacherChatMessage(params: {
  message: string;
  history: Array<{ sender: string; text: string }>;
  subject?: string;
  language?: string;
}): AsyncGenerator<string> {
  const res = await fetch(url('/api/ai/teacher-chat'), {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(params),
  });

  if (!res.ok || !res.body) {
    throw new Error(`Teacher chat request failed: ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder('utf-8');

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    if (chunk) yield chunk;
  }
}

export const api = {
  // Auth endpoints
  async signup(data: { name: string; email: string; password: string; role: string; grade?: string }) {
    const res = await fetch(url('/api/auth/signup'), {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to sign up');
    return result;
  },

  async login(credentials: { email: string; password: string }) {
    const res = await fetch(url('/api/auth/login'), {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(credentials),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to log in');
    return result;
  },

  async logout() {
    const res = await fetch(url('/api/auth/logout'), { 
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    return res.json();
  },

  async getMe(): Promise<{ user: User; isAuthenticated: boolean }> {
    const res = await fetch(url('/api/auth/me'), {
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to fetch session');
    return res.json();
  },

  async switchDemo(email: string): Promise<{ user: User }> {
    const res = await fetch(url('/api/auth/switch-demo'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to switch demo user');
    return result;
  },

  // AI & Socratic endpoints
  async getSocraticHint(params: { question: string; currentInput?: string; context?: string; language?: string }) {
    const res = await fetch(url('/api/ai/socratic-hint'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return res.json();
  },

  async diagnoseLoophole(params: { topic: string; incorrectAnswer: string; stepDetails?: string }) {
    const res = await fetch(url('/api/ai/diagnose-loophole'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return res.json();
  },


  async generateFlashcardExplanation(params: { formula: string; title: string; def: string }) {
    const res = await fetch(url('/api/ai/flashcard-explanation'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return res.json();
  },

  async generateTargetedFlashcards(params: { topic: string }) {
    const res = await fetch(url('/api/ai/generate-targeted-flashcards'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return res.json();
  },

  async evaluateBatch(params?: { totalPapers?: number }) {
    const res = await fetch(url('/api/ai/evaluate-batch'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params ?? {}),
    });
    return res.json();
  },

  async sendTeacherChatMessage(params: {
    message: string;
    history: Array<{ sender: 'user' | 'teacher'; text: string }>;
    subject?: string;
    language?: string;
  }): Promise<string> {
    const res = await fetch(url('/api/ai/teacher-chat'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to fetch teacher chat');
    }
    const contentType = res.headers.get('content-type')?.toLowerCase() ?? '';
    if (contentType.includes('application/json')) {
      const data = await res.json();
      return data.reply ?? '';
    }
    if (res.body) {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
      }
      return accumulated;
    }
    return await res.text();
  },

  // AWS DynamoDB endpoints
  async getAwsStatus() {
    const res = await fetch(url('/api/aws/status'));
    return res.json();
  },

  async testAwsConnection() {
    const res = await fetch(url('/api/aws/test'), { method: 'POST' });
    return res.json();
  },

  async getAwsRecords(pk?: string) {
    const endpoint = pk ? `/api/aws/records?pk=${encodeURIComponent(pk)}` : '/api/aws/records';
    const res = await fetch(url(endpoint));
    return res.json();
  },

  async syncAwsData() {
    const res = await fetch(url('/api/aws/sync'), { method: 'POST' });
    return res.json();
  },

  async getQuiz(subjectId: string) {
    const res = await fetch(url(`/api/quiz/${subjectId}`), {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch quiz');
    return res.json();
  },

  async getAllQuizzes() {
    const res = await fetch(url('/api/quiz/all'), {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch quizzes');
    return res.json();
  },

  async submitQuizAttempt(subjectId: string, answers: any[]) {
    const res = await fetch(url(`/api/quiz/${subjectId}/submit`), {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ answers }),
    });
    if (!res.ok) throw new Error('Failed to submit attempt');
    return res.json();
  }
};
