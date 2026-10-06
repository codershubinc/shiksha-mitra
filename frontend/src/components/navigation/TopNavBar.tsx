import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../ui/button';
import {
  Sun,
  Moon,
  Sparkles,
  Camera,
  Layers,
  GraduationCap,
  BarChart2,
  GitBranch,
  LogIn,
} from 'lucide-react';
import { ScreenId } from '../../types';

interface TopNavBarProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  onOpenProfile: () => void;
  onOpenAwsModal?: () => void;
}

export function TopNavBar({ currentScreen, onNavigate, onOpenProfile, onOpenAwsModal }: TopNavBarProps) {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const navLinks: { id: ScreenId; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'teacher-agent-chat', label: 'AI Teacher' },
    { id: 'exam', label: 'Mock Exam' },
    { id: 'loophole-engine', label: 'Loophole AI' },
    { id: 'flashcards', label: 'Flashcards' },
    { id: 'career-tree', label: 'Careers' },
    { id: 'teacher-analytics', label: 'Teacher Hub' },
    { id: 'weekly-report', label: 'Parent Report' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/95 backdrop-blur-2xl border-b border-white/10 h-16 px-4 md:px-8 flex items-center justify-between shrink-0 shadow-xl mb-4 sm:mb-6">
      {/* Zone 1: Brand Wordmark */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2.5 text-left group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-orange-950/50 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-headline text-lg md:text-xl font-bold text-white tracking-tight group-hover:text-amber-400 transition-colors">
              Shiksha Mitra
            </span>
          </div>
        </button>
      </div>

      {/* Zone 2: Navigation Links (Desktop) */}
      <nav className="hidden lg:flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900/60 border border-white/5">
        {navLinks.map((item) => {
          const isActive = currentScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Zone 3: Actions (Theme Toggle & Auth) */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Bulk Scanner quick launcher */}
        <button
          onClick={() => onNavigate('bulk-scanning')}
          className="p-2 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-amber-400 hover:border-amber-500/40 transition-colors cursor-pointer"
          title="Open Camera Scanner"
        >
          <Camera className="w-4 h-4" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
          title={theme === 'dark' ? 'Switch to Warm Organic Theme' : 'Switch to Dark Glassmorphism'}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-cyan-400" />
          )}
        </button>

        {/* User Account / Profile */}
        {isAuthenticated && user ? (
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2 p-1 pl-2.5 rounded-full bg-slate-900 border border-white/10 hover:border-amber-500/40 transition-colors"
          >
            <span className="text-xs font-semibold text-slate-200 hidden sm:inline">
              {user.name.split(' ')[0]}
            </span>
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover border border-amber-500/40"
            />
          </button>
        ) : (
          <Button
            variant="primary"
            size="sm"
            onClick={() => openAuthModal('login')}
            className="gap-1.5"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </Button>
        )}
      </div>
    </header>
  );
}
