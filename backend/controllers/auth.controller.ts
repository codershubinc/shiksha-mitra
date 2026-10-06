import { Request, Response } from 'express';
import { usersDb, sessions, createUserRecord, User } from '../models/user.model.js';
import { hashPassword, generateToken, sanitizeUser } from '../utils/crypto.utils.js';

export function getAuthenticatedUser(req: Request): User | null {
  const token = req.cookies?.session_token || req.headers.authorization?.replace('Bearer ', '');
  if (!token) return null;
  const session = sessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    if (session) sessions.delete(token);
    return null;
  }
  for (const user of usersDb.values()) {
    if (user.id === session.userId) return user;
  }
  return null;
}

export const authController = {
  signup(req: Request, res: Response) {
    try {
      const { name, email, password, role = 'student', grade = 'Class 8' } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required' });
      }

      const normalizedEmail = email.toLowerCase().trim();
      if (usersDb.has(normalizedEmail)) {
        return res.status(409).json({ error: 'An account with this email already exists' });
      }

      const newUser = createUserRecord(name, normalizedEmail, password, role, grade);
      const token = generateToken();
      const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
      sessions.set(token, { userId: newUser.id, expiresAt });

      res.cookie('session_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(201).json({
        message: 'Signup successful',
        user: sanitizeUser(newUser),
        token,
      });
    } catch (err: any) {
      console.error('Signup error:', err);
      return res.status(500).json({ error: 'Internal server error during registration' });
    }
  },

  login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const normalizedEmail = email.toLowerCase().trim();
      const user = usersDb.get(normalizedEmail);
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const testHash = hashPassword(password, user.salt);
      if (testHash !== user.passwordHash) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const token = generateToken();
      const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
      sessions.set(token, { userId: user.id, expiresAt });

      res.cookie('session_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.json({
        message: 'Login successful',
        user: sanitizeUser(user),
        token,
      });
    } catch (err: any) {
      console.error('Login error:', err);
      return res.status(500).json({ error: 'Internal server error during login' });
    }
  },

  logout(req: Request, res: Response) {
    const token = req.cookies?.session_token || req.headers.authorization?.replace('Bearer ', '');
    if (token) {
      sessions.delete(token);
    }
    res.clearCookie('session_token');
    return res.json({ message: 'Logged out successfully' });
  },

  getMe(req: Request, res: Response) {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthenticated', isAuthenticated: false });
    }
    return res.json({ user: sanitizeUser(user), isAuthenticated: true });
  },

  switchDemo(req: Request, res: Response) {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    const user = usersDb.get(email.toLowerCase().trim());
    if (!user) return res.status(404).json({ error: 'User demo not found' });

    const token = generateToken();
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
    sessions.set(token, { userId: user.id, expiresAt });

    res.cookie('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ user: sanitizeUser(user), token });
  },
};
