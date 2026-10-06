import React from 'react';
import { ScreenId } from '../../types';
import { BookOpen, Camera, GitBranch, User, Layers, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface BottomNavBarProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  onOpenProfile: () => void;
}

export function BottomNavBar({ currentScreen, onNavigate, onOpenProfile }: BottomNavBarProps) {
  // Hide bottom nav during focused modal modes like exam or bulk scanner if needed, or keep thumb accessible
  if (currentScreen === 'bulk-scanning' || currentScreen === 'exam') {
    return null;
  }

  const items = [
    {
      id: 'dashboard' as ScreenId,
      label: 'Learning',
      icon: <BookOpen className="w-5 h-5" />,
      active: currentScreen === 'dashboard',
    },
    {
      id: 'teacher-agent-chat' as ScreenId,
      label: 'AI Teacher',
      icon: <Sparkles className="w-5 h-5" />,
      active: currentScreen === 'teacher-agent-chat',
    },
    {
      id: 'snap-solve' as ScreenId,
      label: 'Doubts',
      icon: <Camera className="w-5 h-5" />,
      active: currentScreen === 'snap-solve',
    },
    {
      id: 'career-tree' as ScreenId,
      label: 'Careers',
      icon: <GitBranch className="w-5 h-5" />,
      active: currentScreen === 'career-tree',
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: <User className="w-5 h-5" />,
      active: false,
      onClick: onOpenProfile,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-2xl border-t border-white/10 px-4 py-2 flex justify-around items-center h-18 lg:hidden shadow-2xl">
      {items.map((item) => {
        const isCurrent = item.active;
        return (
          <button
            key={item.label}
            onClick={() => {
              if (item.onClick) {
                item.onClick();
              } else if (item.id) {
                onNavigate(item.id as ScreenId);
              }
            }}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 ${
              isCurrent
                ? 'bg-amber-500/20 text-amber-300 font-bold scale-105 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {item.icon}
            <span className="text-[11px] font-headline mt-1 tracking-tight">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
