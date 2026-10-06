export type UserRole = 'student' | 'teacher' | 'parent';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  grade?: string;
  rollNo?: string;
  streakDays: number;
  xp: number;
  avatarUrl: string;
  language: 'EN' | 'HI' | 'MR';
  createdAt?: string;
}

export type ScreenId =
  | 'dashboard'
  | 'exam'
  | 'post-scan-growth'
  | 'evaluation-complete'
  | 'snap-solve'
  | 'career-tree'
  | 'flashcards'
  | 'loophole-engine'
  | 'weekly-report'
  | 'teacher-analytics'
  | 'bulk-scanning'
  | 'teacher-agent-chat';

export interface Question {
  id: string;
  subject: string;
  grade: string;
  title: string;
  prompt: string;
  imageUrl?: string;
  imageAlt?: string;
  options: {
    id: string;
    label: string;
    text: string;
  }[];
  correctOptionId: string;
  explanation: string;
  socraticHint: string;
  hindiTranslation?: string;
}

export interface Flashcard {
  id: string;
  deckName: string;
  formula: string;
  title: string;
  definition: string;
  diagramUrl: string;
  audioPronunciationText: string;
  difficulty: 'easy' | 'good' | 'hard';
  intervalDays: number;
}

export interface LoopholeNode {
  id: string;
  grade: string;
  title: string;
  status: 'passed' | 'warning' | 'root-cause';
  description: string;
}

export interface CareerNode {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  icon: string;
  branch: 'root' | 'stem' | 'arts';
  top: number;
  left: number;
  active?: boolean;
}
