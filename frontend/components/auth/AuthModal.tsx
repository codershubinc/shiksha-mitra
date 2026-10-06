import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Dialog } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Lock, Mail, User as UserIcon, GraduationCap, CheckCircle2, ShieldAlert } from 'lucide-react';

export function AuthModal() {
  const { authModalOpen, closeAuthModal, authMode, setAuthMode, login, signup, switchDemoUser } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'student' | 'teacher' | 'parent'>('student');
  const [grade, setGrade] = useState('Class 8');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (authMode === 'login') {
        await login(email, password);
      } else {
        await signup({ name, email, password, role, grade });
      }
      setEmail('');
      setPassword('');
      setName('');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSelect = async (demoEmail: string) => {
    setLoading(true);
    setError(null);
    try {
      await switchDemoUser(demoEmail);
      closeAuthModal();
    } catch (err: any) {
      setError(err.message || 'Failed to switch demo user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={authModalOpen}
      onOpenChange={(open) => !open && closeAuthModal()}
      title={authMode === 'login' ? 'Welcome Back to Shiksha Mitra' : 'Join Shiksha Mitra'}
      description={
        authMode === 'login'
          ? 'Enter your credentials to access your adaptive learning dashboard and records.'
          : 'Create your account to unlock AI loophole diagnosis, mock exams, and personalized growth.'
      }
    >
      {/* Quick Demo Switcher Section */}
      <div className="mb-6 p-3.5 rounded-2xl bg-slate-950/60 border border-amber-500/20">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-amber-400" />
            Quick Demo Sign-In
          </span>
          <span className="text-[11px] text-slate-400">1-click preview</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => handleDemoSelect('pranav@shikshamitra.edu')}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-amber-950/40 border border-slate-700/60 hover:border-amber-500/40 text-left transition-all text-slate-200 hover:text-white"
          >
            <div className="font-semibold text-amber-300">Student (Student)</div>
            <div className="text-[10px] text-slate-400">Class 8 · 12-Day Streak</div>
          </button>
          <button
            type="button"
            onClick={() => handleDemoSelect('rahul@shikshamitra.edu')}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-teal-950/40 border border-slate-700/60 hover:border-teal-500/40 text-left transition-all text-slate-200 hover:text-white"
          >
            <div className="font-semibold text-teal-300">Student (Student)</div>
            <div className="text-[10px] text-slate-400">Class 8 · Roll No. 12</div>
          </button>
          <button
            type="button"
            onClick={() => handleDemoSelect('anita@shikshamitra.edu')}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-orange-950/40 border border-slate-700/60 hover:border-orange-500/40 text-left transition-all text-slate-200 hover:text-white"
          >
            <div className="font-semibold text-orange-300">Anita (Teacher)</div>
            <div className="text-[10px] text-slate-400">Predictive Gap Analytics</div>
          </button>
          <button
            type="button"
            onClick={() => handleDemoSelect('parent@shikshamitra.edu')}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-cyan-950/40 border border-slate-700/60 hover:border-cyan-500/40 text-left transition-all text-slate-200 hover:text-white"
          >
            <div className="font-semibold text-cyan-300">Sunita (Parent)</div>
            <div className="text-[10px] text-slate-400">Weekly WhatsApp Report</div>
          </button>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex rounded-xl bg-slate-950/60 p-1 mb-5 border border-white/5">
        <button
          type="button"
          onClick={() => {
            setAuthMode('login');
            setError(null);
          }}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
            authMode === 'login'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            setAuthMode('signup');
            setError(null);
          }}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
            authMode === 'signup'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Create Account
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {authMode === 'signup' && (
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name</label>
            <Input
              type="text"
              placeholder="e.g. Aarav Patil"
              value={name}
              onChange={(e) => setName(e.target.value)}
              icon={<UserIcon className="w-4 h-4" />}
              required
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
          <Input
            type="email"
            placeholder="you@school.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail className="w-4 h-4" />}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
          <Input
            type="password"
            placeholder="Minimum 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock className="w-4 h-4" />}
            required
          />
        </div>

        {authMode === 'signup' && (
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full h-11 rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20"
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="parent">Parent</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Grade / Subject</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full h-11 rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20"
              >
                <option value="Class 8">Class 8</option>
                <option value="Class 9">Class 9</option>
                <option value="Class 10">Class 10</option>
                <option value="Class 7">Class 7</option>
              </select>
            </div>
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-4"
          disabled={loading}
          glow
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {authMode === 'login' ? 'Authenticating...' : 'Registering Account...'}
            </span>
          ) : authMode === 'login' ? (
            'Sign In to Dashboard'
          ) : (
            'Create Account & Start Learning'
          )}
        </Button>
      </form>
    </Dialog>
  );
}
