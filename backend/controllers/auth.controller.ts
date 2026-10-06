import { Request, Response } from 'express';
import { generateToken, sanitizeUser } from '../utils/crypto.utils.js';
import { cognitoService } from '../services/cognito.service.js';
import { UserModel, User, UserRole } from '../models/user.model.js';
import { SessionModel } from '../models/session.model.js';
import crypto from 'node:crypto';

async function createUserRecord(
  name: string,
  email: string,
  role: UserRole,
  grade: string = 'Class 8',
  rollNo?: string,
  avatar?: string,
  streak: number = 7,
  xp: number = 450
) {
  const normalizedEmail = email.toLowerCase().trim();
  const id = `usr_${crypto.randomUUID().slice(0, 8)}`;
  
  const user = new UserModel({
    id,
    name,
    email: normalizedEmail,
    role,
    grade,
    rollNo,
    streakDays: streak,
    xp,
    avatarUrl: avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCK0-0JwP88HWKu6oQUjNCgb05unct8XMYddUw_uJdbLA0udACQT_FFuVSr1d5XjNIOslLrb6GEB48SK31UfdAcXtHCCJs_HYunCs3RvJhaIjgvn0JafTdn1Xb2gOzOhPMu-i423Gq716dY930KOuTNgm-J15PqGdJfd3NFMlTdAi0j_IKIOAfFxd77CAJUlH2GCMydp8pHzKBCW3tXWhy5Oj6nk8XJrIwC0E2V2FyRGY0uulK_ckKD',
    language: 'EN',
    createdAt: new Date().toISOString(),
  });
  await user.save();
  return user.toObject();
}

export async function getAuthenticatedUser(req: Request): Promise<any | null> {
  const token = req.cookies?.session_token;
  if (token) {
    const session = await SessionModel.findOne({ token });
    if (session && session.expiresAt > Date.now()) {
      const user = await UserModel.findOne({ id: session.userId }).lean();
      if (user) return user;
    }
  }

  // Fallback: If local session is lost, rebuild from AWS JWT
  const authHeader = req.headers.authorization?.replace('Bearer ', '');
  if (authHeader) {
    try {
      const attrs = await cognitoService.getUser(authHeader);
      const email = attrs.email?.toLowerCase().trim();
      if (!email) return null;
      
      let user = await UserModel.findOne({ email }).lean();
      if (!user) {
        user = await createUserRecord(attrs.name || 'User', email, (attrs['custom:role'] as any) || 'student');
      }
      return user;
    } catch (e) {
      console.warn('JWT Auto-Restore failed:', (e as Error).message);
    }
  }

  return null;
}

export const authController = {
  async signup(req: Request, res: Response) {
    try {
      const { name, email, password, role = 'student', grade = 'Class 8' } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required' });
      }

      const normalizedEmail = email.toLowerCase().trim();
      
      const existingUser = await UserModel.findOne({ email: normalizedEmail });
      if (existingUser) {
        return res.status(409).json({ error: 'An account with this email already exists' });
      }

      // Strict AWS Cognito Signup
      try {
        await cognitoService.signUp(normalizedEmail, password, name, role);
      } catch (cognitoErr: any) {
        console.error('Cognito Signup Failed:', cognitoErr.message);
        return res.status(400).json({ error: cognitoErr.message || 'Failed to sign up with AWS' });
      }

      // Automatically login to get JWT tokens immediately
      let cognitoAuth;
      try {
        cognitoAuth = await cognitoService.signIn(normalizedEmail, password);
      } catch (loginErr: any) {
        console.warn('Auto-login after signup failed:', loginErr.message);
      }

      const newUser = await createUserRecord(name, normalizedEmail, role, grade);
      const token = generateToken();
      const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
      
      await SessionModel.create({ token, userId: newUser.id, expiresAt });

      res.cookie('session_token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(201).json({
        message: 'Signup successful',
        user: sanitizeUser(newUser),
        token,
        jwt: cognitoAuth
      });
    } catch (err: any) {
      console.error('Signup error:', err);
      return res.status(500).json({ error: 'Internal server error during registration' });
    }
  },

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const normalizedEmail = email.toLowerCase().trim();

      // Strict AWS Cognito SignIn
      let cognitoAuth;
      try {
        cognitoAuth = await cognitoService.signIn(normalizedEmail, password);
      } catch (cognitoErr: any) {
        console.error('Cognito Login Failed:', cognitoErr.message);
        return res.status(401).json({ error: cognitoErr.message || 'Invalid email or password' });
      }

      let user = await UserModel.findOne({ email: normalizedEmail }).lean();
      if (!user) {
        let realName = 'User';
        let realRole: any = 'student';
        if (cognitoAuth?.AccessToken) {
          try {
            const attrs = await cognitoService.getUser(cognitoAuth.AccessToken);
            if (attrs.name) realName = attrs.name;
            if (attrs['custom:role']) realRole = attrs['custom:role'];
          } catch (e) {
            console.warn('Failed to fetch user attributes from Cognito', e);
          }
        }
        user = await createUserRecord(realName, normalizedEmail, realRole);
      }

      const token = generateToken();
      const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
      await SessionModel.create({ token, userId: user.id, expiresAt });

      res.cookie('session_token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.json({
        message: 'Login successful',
        user: sanitizeUser(user),
        token,
        jwt: cognitoAuth
      });
    } catch (err: any) {
      console.error('Login error:', err);
      return res.status(500).json({ error: 'Internal server error during login' });
    }
  },

  async logout(req: Request, res: Response) {
    const token = req.cookies?.session_token || req.headers.authorization?.replace('Bearer ', '');
    if (token) {
      await SessionModel.deleteOne({ token });
    }
    res.clearCookie('session_token');
    return res.json({ message: 'Logged out successfully' });
  },

  async getMe(req: Request, res: Response) {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthenticated', isAuthenticated: false });
    }
    return res.json({ user: sanitizeUser(user), isAuthenticated: true });
  },

  async getStudents(req: Request, res: Response) {
    const user = await getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthenticated' });

    if (user.role === 'teacher') {
      const students = await UserModel.find({ role: 'student' }).lean();
      return res.json({ students: students.map(sanitizeUser) });
    }

    if (user.role === 'parent') {
      if (!user.studentIds || user.studentIds.length === 0) {
        return res.json({ students: [] });
      }
      const students = await UserModel.find({ id: { $in: user.studentIds } }).lean();
      return res.json({ students: students.map(sanitizeUser) });
    }

    return res.status(403).json({ error: 'Unauthorized role' });
  },

  async linkStudent(req: Request, res: Response) {
    const user = await getAuthenticatedUser(req);
    if (!user || user.role !== 'parent') {
      return res.status(403).json({ error: 'Only parents can link students' });
    }

    const { studentEmail } = req.body;
    if (!studentEmail) return res.status(400).json({ error: 'Student email required' });

    const student = await UserModel.findOne({ email: studentEmail.toLowerCase().trim() });
    if (!student || student.role !== 'student') {
      return res.status(404).json({ error: 'Student not found' });
    }

    if (!user.studentIds) user.studentIds = [];
    if (!user.studentIds.includes(student.id)) {
      await UserModel.updateOne({ id: user.id }, { $push: { studentIds: student.id } });
    }

    if (!student.parentIds) student.parentIds = [];
    if (!student.parentIds.includes(user.id)) {
      await UserModel.updateOne({ id: student.id }, { $push: { parentIds: user.id } });
    }

    try {
      await cognitoService.linkParentToStudent(user.email, student.email);
    } catch (e: any) {
      console.warn('Cognito link failed:', e.message);
    }

    const updatedStudent = await UserModel.findOne({ id: student.id }).lean();

    return res.json({ message: 'Student linked successfully', student: sanitizeUser(updatedStudent) });
  }
};
