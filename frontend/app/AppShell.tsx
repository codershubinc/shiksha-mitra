"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

import { TopNavBar } from '@/components/navigation/TopNavBar';
import { BottomNavBar } from '@/components/navigation/BottomNavBar';
import { AuthModal } from '@/components/auth/AuthModal';
import { UserProfileDrawer } from '@/components/auth/UserProfileDrawer';
import { AwsIntegrationModal } from '@/components/aws/AwsIntegrationModal';

import { AITeacherPage } from '@/components/screens/AITeacherPage';
import { StudentDashboardScreen } from '@/components/screens/StudentDashboardScreen';
import { ExamModeScreen } from '@/components/screens/ExamModeScreen';
import { EvaluationResultScreen } from '@/components/screens/EvaluationResultScreen';
import { EvaluationCompleteScreen } from '@/components/screens/EvaluationCompleteScreen';
import { SnapAndSolveScreen } from '@/components/screens/SnapAndSolveScreen';
import { CareerTreeScreen } from '@/components/screens/CareerTreeScreen';
import { FlashcardCenterScreen } from '@/components/screens/FlashcardCenterScreen';
import { LoopholeDiagnosticScreen } from '@/components/screens/LoopholeDiagnosticScreen';
import { WeeklyReportScreen } from '@/components/screens/WeeklyReportScreen';
import { TeacherDashboardScreen } from '@/components/screens/TeacherDashboardScreen';
import { BulkScanningScreen } from '@/components/screens/BulkScanningScreen';
import { TeacherAgentChatScreen } from '@/components/screens/TeacherAgentChatScreen';

import { ScreenId } from '@/types';

const pathMap: Record<ScreenId, string> = {
  dashboard: '/',
  'teacher-agent-chat': '/teacher-agent-chat',
  exam: '/exam',
  'post-scan-growth': '/post-scan-growth',
  'evaluation-complete': '/evaluation-complete',
  'snap-solve': '/snap-solve',
  'career-tree': '/career-tree',
  flashcards: '/flashcards',
  'loophole-engine': '/loophole-engine',
  'weekly-report': '/weekly-report',
  'ai-teacher': '/ai-teacher',
  'bulk-scanning': '/bulk-scanning',
  'teacher-analytics': '/teacher-analytics',
};

const urlToScreen: Record<string, ScreenId> = Object.fromEntries(
  Object.entries(pathMap).map(([k, v]) => [v, k as ScreenId])
);

const screens = [
  { id: 'dashboard' as ScreenId, label: '1. Student Hub', badge: 'Student' },
  { id: 'teacher-agent-chat' as ScreenId, label: "2. Anita Ma'am (AI Teacher Agent)", badge: 'Gemini Chat' },
  { id: 'exam' as ScreenId, label: '3. Science Mock Exam', badge: 'Zinc + HCl' },
  { id: 'post-scan-growth' as ScreenId, label: "4. Student's Growth Insight", badge: 'Post-Scan' },
  { id: 'evaluation-complete' as ScreenId, label: '5. Performance Analytics', badge: '68 Gauge' },
  { id: 'snap-solve' as ScreenId, label: '6. Snap & Solve Mentor', badge: 'Division' },
  { id: 'career-tree' as ScreenId, label: '7. Grow Career Path', badge: 'Interactive Tree' },
  { id: 'flashcards' as ScreenId, label: '8. Flashcard Center', badge: 'Pythagoras' },
  { id: 'loophole-engine' as ScreenId, label: '9. AI Loophole Engine', badge: 'Diagnostic' },
  { id: 'weekly-report' as ScreenId, label: '10. Weekly Parent Report', badge: 'WhatsApp' },
  { id: 'ai-teacher' as ScreenId, label: 'AI Teacher Hub', badge: 'AI' },
  { id: 'bulk-scanning' as ScreenId, label: '12. Bulk Camera Scanner', badge: 'Viewfinder' },
];

export default function AppShell() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  const [currentScreen, setCurrentScreen] = useState<ScreenId>('dashboard');
  const [profileOpen, setProfileOpen] = useState(false);
  const [awsModalOpen, setAwsModalOpen] = useState(false);
  const [screenSelectorOpen, setScreenSelectorOpen] = useState(false);

  useEffect(() => {
    const screen = urlToScreen[pathname] ?? 'dashboard';
    setCurrentScreen(screen);
  }, [pathname]);

  const navigate = (screen: ScreenId) => {
    setCurrentScreen(screen);
    router.push(pathMap[screen]);
  };

  // If no user is logged in, show only the simple dashboard (landing page)
  if (!user) {
    return (
      <div className="min-h-screen relative overflow-x-hidden bg-slate-900 text-slate-100 flex flex-col">
        <TopNavBar
          currentScreen="dashboard"
          onNavigate={() => {}}
          onOpenProfile={() => setProfileOpen(true)}
          onOpenAwsModal={() => setAwsModalOpen(true)}
        />
        <main className="w-full flex-1 pt-2 sm:pt-4 pb-32 lg:pb-16">
          <StudentDashboardScreen onNavigate={() => {}} onOpenProfile={() => setProfileOpen(true)} />
        </main>
        <AuthModal />
        <UserProfileDrawer open={profileOpen} onOpenChange={setProfileOpen} />
      </div>
    );
  }

  const fullscreen =
    currentScreen === 'bulk-scanning' ||
    currentScreen === 'exam' ||
    currentScreen === 'teacher-agent-chat';

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-slate-900 text-slate-100 flex flex-col">
      {!fullscreen && (
        <TopNavBar
          currentScreen={currentScreen}
          onNavigate={navigate}
          onOpenProfile={() => setProfileOpen(true)}
          onOpenAwsModal={() => setAwsModalOpen(true)}
        />
      )}

      <main
        className={
          currentScreen === 'teacher-agent-chat'
            ? 'w-full h-dvh flex flex-col overflow-hidden p-0'
            : currentScreen === 'exam' || currentScreen === 'bulk-scanning'
            ? 'w-full flex-1 p-0'
            : 'w-full flex-1 pt-2 sm:pt-4 pb-32 lg:pb-16'
        }
      >
        {currentScreen === 'dashboard' && (
          <StudentDashboardScreen onNavigate={navigate} onOpenProfile={() => setProfileOpen(true)} />
        )}
        {currentScreen === 'ai-teacher' && <AITeacherPage onNavigate={navigate} />}
        {currentScreen === 'exam' && <ExamModeScreen onNavigate={navigate} />}
        {currentScreen === 'post-scan-growth' && <EvaluationResultScreen onNavigate={navigate} />}
        {currentScreen === 'evaluation-complete' && <EvaluationCompleteScreen onNavigate={navigate} />}
        {currentScreen === 'snap-solve' && <SnapAndSolveScreen onNavigate={navigate} />}
        {currentScreen === 'career-tree' && <CareerTreeScreen onNavigate={navigate} />}
        {currentScreen === 'flashcards' && <FlashcardCenterScreen onNavigate={navigate} />}
        {currentScreen === 'loophole-engine' && <LoopholeDiagnosticScreen onNavigate={navigate} />}
        {currentScreen === 'weekly-report' && <WeeklyReportScreen onNavigate={navigate} />}
        {currentScreen === 'teacher-analytics' && <TeacherDashboardScreen onNavigate={navigate} />}
        {currentScreen === 'bulk-scanning' && <BulkScanningScreen onNavigate={navigate} />}
        {currentScreen === 'teacher-agent-chat' && <TeacherAgentChatScreen onNavigate={navigate} />}
      </main>

      {!fullscreen && (
        <BottomNavBar
          currentScreen={currentScreen}
          onNavigate={navigate}
          onOpenProfile={() => setProfileOpen(true)}
        />
      )}

      {currentScreen !== 'teacher-agent-chat' && (
        <div className="fixed bottom-22 lg:bottom-4 right-4 z-30">
          <div className="relative">
            <button
              onClick={() => setScreenSelectorOpen(!screenSelectorOpen)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-900/90 backdrop-blur-xl border border-amber-500/40 text-amber-300 text-xs font-semibold shadow-2xl hover:bg-slate-800 transition-all active:scale-95 cursor-pointer"
            >
              <svg className="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M4 6h16M4 12h16M4 18h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="hidden sm:inline">12 Screens Index</span>
            </button>

            {screenSelectorOpen && (
              <div className="absolute bottom-12 right-0 w-72 max-h-96 overflow-y-auto bg-slate-900/90 backdrop-blur-xl p-3 rounded-2xl border border-white/15 shadow-2xl space-y-1">
                <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Jump to Screen</span>
                  <span className="text-[10px] text-amber-400 font-mono">12 of 12</span>
                </div>
                {screens.map((scr) => (
                  <button
                    key={scr.id}
                    onClick={() => {
                      navigate(scr.id);
                      setScreenSelectorOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                      currentScreen === scr.id
                        ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span className="truncate">{scr.label}</span>
                    <span className="text-[10px] text-slate-500 shrink-0 font-medium">{scr.badge}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <AuthModal />
      <UserProfileDrawer open={profileOpen} onOpenChange={setProfileOpen} />
      <AwsIntegrationModal open={awsModalOpen} onOpenChange={setAwsModalOpen} />
    </div>
  );
}
