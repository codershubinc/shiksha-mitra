import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Dialog } from '../ui/dialog';
import { Button } from '../ui/button';
import {
  User as UserIcon,
  LogOut,
  Flame,
  Award,
  BookOpen,
  Users,
  Sun,
  Moon,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

interface UserProfileDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserProfileDrawer({ open, onOpenChange }: UserProfileDrawerProps) {
  const { user, isAuthenticated, logout, switchDemoUser, openAuthModal } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Student & Educator Profile">
      <div className="space-y-6">
        {/* User Card */}
        {user ? (
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-950/70 border border-white/10">
            <div className="relative">
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500/40 shadow-lg"
              />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-headline text-lg font-bold text-white truncate">{user.name}</h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {user.role}
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
              <p className="text-xs text-teal-400 font-medium mt-0.5">
                {user.grade || 'Class 8'} {user.rollNo && `· Roll No. ${user.rollNo}`}
              </p>
            </div>
          </div>
        ) : null}

        {/* Stats Row */}
        {user && user.role === 'student' && (
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-950/50 border border-white/5 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <div className="font-headline text-lg font-bold text-white tabular-nums">
                  {user.streakDays} Days
                </div>
                <div className="text-xs text-slate-400">Learning Streak</div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/50 border border-white/5 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-teal-500/20 text-teal-400">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <div className="font-headline text-lg font-bold text-white tabular-nums">
                  {user.xp} XP
                </div>
                <div className="text-xs text-slate-400">Mastery Points</div>
              </div>
            </div>
          </div>
        )}

        {/* Theme & Display Mode */}
        <div className="p-3.5 rounded-xl bg-slate-950/50 border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {theme === 'dark' ? (
              <Moon className="w-4 h-4 text-cyan-400" />
            ) : (
              <Sun className="w-4 h-4 text-amber-500" />
            )}
            <span className="text-xs text-slate-300 font-medium">Appearance Theme</span>
          </div>
          <button
            onClick={toggleTheme}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/15 text-slate-200 transition-colors flex items-center gap-1.5"
          >
            <span>{theme === 'dark' ? 'Dark Glassmorphism' : 'Warm Organic (Paper)'}</span>
          </button>
        </div>



        {/* Action Buttons */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-3">
          {!isAuthenticated ? (
            <Button
              variant="primary"
              size="md"
              className="w-full"
              onClick={() => {
                onOpenChange(false);
                openAuthModal('login');
              }}
            >
              Sign In with Credentials
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="md"
              className="w-full text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 gap-2"
              onClick={async () => {
                await logout();
                onOpenChange(false);
              }}
            >
              <LogOut className="w-4 h-4" />
              Sign Out of Session
            </Button>
          )}
        </div>
      </div>
    </Dialog>
  );
}
