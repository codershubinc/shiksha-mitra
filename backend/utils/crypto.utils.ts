import crypto from 'node:crypto';

export function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

export function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function sanitizeUser(user: any) {
  const { passwordHash, salt, ...safeUser } = user;
  return safeUser;
}
