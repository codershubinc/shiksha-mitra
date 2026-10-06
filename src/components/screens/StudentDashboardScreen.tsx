import React from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { useAuth } from '../../context/AuthContext';
import {
  Camera,
  Layers,
  Timer,
  GitBranch,
  Flame,
  Award,
  Wifi,
  Sparkles,
  CheckCircle2,
  Lock,
  Mic,
  ArrowRight,
  Languages,
  BookOpen,
} from 'lucide-react';

interface StudentDashboardScreenProps {
  onNavigate: (screen: any) => void;
  onOpenProfile: () => void;
}

export function StudentDashboardScreen({ onNavigate, onOpenProfile }: StudentDashboardScreenProps) {
  const { user } = useAuth();

  return (
    <div className="flex flex-col py-6 px-4 max-w-4xl mx-auto w-full">
      {/* Welcome & Stats Ribbon */}
      <section className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                Grade 8 Socratic Companion
              </span>
            </div>
            <h1 className="font-headline text-3xl md:text-4xl font-bold text-white tracking-tight">
              Namaste, {user?.name?.split(' ')[0] || 'Pranav'}!
            </h1>
            <p className="text-sm md:text-base text-slate-400 mt-1">
              Ready to grow your foundational skills today?
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-slate-900 border border-white/10 hover:border-amber-500/40 transition-colors"
            >
              <img
                src={
                  user?.avatarUrl ||
                  'https://lh3.googleusercontent.com/aida-public/AB6AXuAac4hS2E8jjJnEOnz6z-JIJPHEVeubY-O1J--MpU7zQ9fjm7QZciJTqBTX32AtY9p93QInAdmVO80Wg_9MGiVPhw8kXGgA0i0ldnLHO0YLDK_mSGBvaUY9qTBtwIpgk5hL1r8VZQ01Jgi9SLiRZlL0jgOkr1dsaTCy8uN00mzdd5hM1Vm0QVqSQb_35XCCXwrcQpqPQGSYSqxWYud3-I0PiA9h8Oe3C52K4YUgx0bfxYIuBBkyjt5K'
                }
                alt="Student profile"
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="text-xs font-semibold text-slate-200">
                {user?.name?.split(' ')[0] || 'Pranav'}
              </span>
            </button>
          </div>
        </div>

        {/* Stats Badges */}
        <div className="flex flex-wrap gap-2.5">
          <div className="px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1.5 shadow-sm">
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>{user?.streakDays || 12} Day Streak</span>
          </div>

          <div className="px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold flex items-center gap-1.5 shadow-sm">
            <Award className="w-4 h-4 text-teal-400" />
            <span>{user?.xp || 1240} XP</span>
          </div>

          <div className="px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 shadow-sm">
            <Wifi className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Offline Mesh: Sync Active</span>
          </div>
        </div>
      </section>

      {/* Quick Access Bento Grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-8">
        {/* Snap & Solve */}
        <button
          onClick={() => onNavigate('snap-solve')}
          className="p-5 rounded-3xl glass-card border-white/10 hover:border-amber-500/40 flex flex-col items-center justify-center gap-3 transition-all duration-300 group hover:-translate-y-1 text-center shadow-lg"
        >
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all shadow-md">
            <Camera className="w-6 h-6" />
          </div>
          <span className="font-headline font-bold text-sm text-white">Snap & Solve</span>
        </button>

        {/* Flashcard Centre */}
        <button
          onClick={() => onNavigate('flashcards')}
          className="p-5 rounded-3xl glass-card border-white/10 hover:border-teal-500/40 flex flex-col items-center justify-center gap-3 transition-all duration-300 group hover:-translate-y-1 text-center shadow-lg"
        >
          <div className="w-14 h-14 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center group-hover:scale-110 group-hover:bg-teal-500 group-hover:text-slate-950 transition-all shadow-md">
            <Layers className="w-6 h-6" />
          </div>
          <span className="font-headline font-bold text-sm text-white">Flashcard Centre</span>
        </button>

        {/* Exam Centre */}
        <button
          onClick={() => onNavigate('exam')}
          className="p-5 rounded-3xl glass-card border-white/10 hover:border-cyan-500/40 flex flex-col items-center justify-center gap-3 transition-all duration-300 group hover:-translate-y-1 text-center shadow-lg"
        >
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center group-hover:scale-110 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-all shadow-md">
            <Timer className="w-6 h-6" />
          </div>
          <span className="font-headline font-bold text-sm text-white">Exam Centre</span>
        </button>

        {/* Career Tree */}
        <button
          onClick={() => onNavigate('career-tree')}
          className="p-5 rounded-3xl glass-card border-white/10 hover:border-purple-500/40 flex flex-col items-center justify-center gap-3 transition-all duration-300 group hover:-translate-y-1 text-center shadow-lg"
        >
          <div className="w-14 h-14 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center group-hover:scale-110 group-hover:bg-purple-500 group-hover:text-slate-950 transition-all shadow-md">
            <GitBranch className="w-6 h-6" />
          </div>
          <span className="font-headline font-bold text-sm text-white">Career Tree</span>
        </button>
      </section>

      {/* Interactive Current Journey / Skill Road */}
      <Card className="glass-card mb-8 border-white/10 relative overflow-hidden p-6 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-headline text-xl font-bold text-white">Current Journey</h2>
            <p className="text-xs text-slate-400">Class 8 Mathematics Foundational Pathway</p>
          </div>
          <button
            onClick={() => onNavigate('loophole-engine')}
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
          >
            <span>View AI Loophole Engine</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Visual Roadmap with Connecting SVG Curve */}
        <div className="relative max-w-sm mx-auto flex flex-col items-center justify-center py-4">
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-0"
            viewBox="0 0 300 320"
            fill="none"
          >
            <path
              d="M 100 50 C 40 120, 260 160, 200 240"
              stroke="#0d9488"
              strokeWidth="4"
              strokeDasharray="6 6"
              className="opacity-40"
            />
          </svg>

          {/* Node 1: Completed / Mastered */}
          <div className="z-10 flex flex-col items-center mb-10 w-full -translate-x-12">
            <button
              onClick={() => onNavigate('evaluation-complete')}
              className="w-16 h-16 rounded-full bg-teal-950 border-2 border-teal-400 text-teal-300 flex items-center justify-center shadow-lg shadow-teal-950/60 hover:scale-105 transition-transform"
            >
              <CheckCircle2 className="w-8 h-8 text-teal-400" />
            </button>
            <div className="mt-2 text-center p-2 rounded-xl bg-slate-950/80 border border-white/10 text-xs">
              <span className="font-bold text-teal-300 block">Basic Division</span>
              <span className="text-[10px] text-slate-400">Mastered 100%</span>
            </div>
          </div>

          {/* Node 2: Active / In Progress with Pulse Ring */}
          <div className="z-10 flex flex-col items-center mb-10 w-full translate-x-12 relative">
            <button
              onClick={() => onNavigate('loophole-engine')}
              className="relative w-18 h-18 rounded-full bg-gradient-to-tr from-amber-600 to-orange-500 text-white flex items-center justify-center shadow-[0_0_25px_rgba(245,158,11,0.5)] hover:scale-105 transition-transform"
            >
              <span className="font-headline text-2xl font-bold">Σ</span>
              <span className="absolute -inset-1.5 rounded-full border border-amber-400 opacity-75 animate-ping pointer-events-none" />
            </button>
            <div className="mt-2 text-center p-2 rounded-xl bg-slate-950/90 border border-amber-500/40 text-xs">
              <span className="font-bold text-amber-300 block">Algebraic Expressions</span>
              <span className="text-[10px] text-slate-300">In Progress · 60%</span>
            </div>
          </div>

          {/* Node 3: Locked */}
          <div className="z-10 flex flex-col items-center w-full -translate-x-6 opacity-60">
            <div className="w-14 h-14 rounded-full bg-slate-900 border-2 border-slate-700 text-slate-400 flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <div className="mt-2 text-center p-2 rounded-xl bg-slate-950/80 border border-white/5 text-xs">
              <span className="font-medium text-slate-400 block">Quadratic Equations</span>
              <span className="text-[10px] text-slate-500">Locked</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Vernacular AI Teacher Hero Action Banner */}
      <div className="mt-8 flex justify-center w-full">
        <button
          onClick={() => onNavigate('teacher-agent-chat')}
          className="w-full sm:w-auto bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 text-white px-8 py-4 rounded-2xl shadow-[0_10px_35px_rgba(245,158,11,0.35)] border border-amber-400/40 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all duration-300 cursor-pointer"
        >
          <Sparkles className="w-5 h-5 text-amber-200 animate-pulse" />
          <div className="text-left">
            <span className="font-headline font-bold text-sm sm:text-base block">
              Ask Anita Ma'am (AI Teacher Agent)
            </span>
            <span className="text-[11px] text-amber-100 font-normal block">
              Instant voice guidance, math step-by-step & exam doubts
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}
