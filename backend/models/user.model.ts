import crypto from 'node:crypto';
import { hashPassword, generateSalt } from '../utils/crypto.utils.js';

export type UserRole = 'student' | 'teacher' | 'parent';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  role: UserRole;
  grade?: string;
  rollNo?: string;
  streakDays: number;
  xp: number;
  avatarUrl: string;
  language: 'EN' | 'HI' | 'MR';
  createdAt: string;
}

export const usersDb = new Map<string, User>();
export const sessions = new Map<string, { userId: string; expiresAt: number }>();

export function createUserRecord(
  name: string,
  email: string,
  pass: string,
  role: UserRole,
  grade: string = 'Class 8',
  rollNo?: string,
  avatar?: string,
  streak: number = 7,
  xp: number = 450
): User {
  const salt = generateSalt();
  const passwordHash = hashPassword(pass, salt);
  const user: User = {
    id: `usr_${crypto.randomUUID().slice(0, 8)}`,
    name,
    email: email.toLowerCase().trim(),
    passwordHash,
    salt,
    role,
    grade,
    rollNo,
    streakDays: streak,
    xp,
    avatarUrl:
      avatar ||
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCK0-0JwP88HWKu6oQUjNCgb05unct8XMYddUw_uJdbLA0udACQT_FFuVSr1d5XjNIOslLrb6GEB48SK31UfdAcXtHCCJs_HYunCs3RvJhaIjgvn0JafTdn1Xb2gOzOhPMu-i423Gq716dY930KOuTNgm-J15PqGdJfd3NFMlTdAi0j_IKIOAfFxd77CAJUlH2GCMydp8pHzKBCW3tXWhy5Oj6nk8XJrIwC0E2V2FyRGY0uulK_ckKD',
    language: 'EN',
    createdAt: new Date().toISOString(),
  };
  usersDb.set(user.email, user);
  return user;
}

// Seed accounts matching the application design system
export function initializeSeedUsers() {
  if (usersDb.size > 0) return;

  createUserRecord(
    'Pranav Sharma',
    'pranav@shikshamitra.edu',
    'password123',
    'student',
    'Class 8',
    'Roll No. 07',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCofhvp6W0pcY4JgW4XcGXjMh1X3s2zl2wQN0GBsPAM7-VrtJY97wm3Diz7KRv-OnKenEeh7iZAMXm2lTPNyXti5r-KZU7ASU45IDR4D6XLBMo7ZWaCujekzCSvgSAzIOJRpRHVTcu_FA8eTRem9lOf0ejN2NsVY16Kfzbkd0Dh0LqCVDTcvMfMl1DkKC8uI5n9tvSqPcq8LaqkGrX30-yLftlUlV0GEW4Is4AONzvxjQn3dAifdL0o',
    12,
    720
  );

  createUserRecord(
    'Rahul Verma',
    'rahul@shikshamitra.edu',
    'password123',
    'student',
    'Class 8',
    'Roll No. 12',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCr2u_54g-QJqgG_5Lh99w0-g42n9-M99_1919k1817-j81728190-jklwndoiq0912j3012930-192-310-9123-1',
    4,
    380
  );

  createUserRecord(
    'Anita Deshmukh',
    'anita@shikshamitra.edu',
    'password123',
    'teacher',
    'Middle School Lead',
    undefined,
    'https://lh3.googleusercontent.com/aida-public/AB6AXuArQo7uLrplNf5RxigElyfquxORgDVwRiffuHJLlp8TO0VBqan1Pd2RJ0ZM5dhdFpN_me1a7GTtlyN_0jXgZ34yw8j8M30zHK1PlUlR2LgCG1AODsYRBaUp9E9n1aMGByMRuNPigKPjhw9T--SYAjFwKaPOkNzt6KlG7BipfkvCL4hFtcNQiIOFFOHq1frIxTXoHhyRnHxTzfnBxMBQeeT1qB-Gb9EoYA0u-301NUCrmI-bRFqS9erg',
    30,
    1850
  );

  createUserRecord(
    'Sunita Sharma',
    'sunita@shikshamitra.edu',
    'password123',
    'parent',
    'Guardian of Pranav',
    undefined,
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCK0-0JwP88HWKu6oQUjNCgb05unct8XMYddUw_uJdbLA0udACQT_FFuVSr1d5XjNIOslLrb6GEB48SK31UfdAcXtHCCJs_HYunCs3RvJhaIjgvn0JafTdn1Xb2gOzOhPMu-i423Gq716dY930KOuTNgm-J15PqGdJfd3NFMlTdAi0j_IKIOAfFxd77CAJUlH2GCMydp8pHzKBCW3tXWhy5Oj6nk8XJrIwC0E2V2FyRGY0uulK_ckKD',
    7,
    500
  );
}

initializeSeedUsers();
