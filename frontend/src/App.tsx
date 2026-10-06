import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ScreenId } from './types';
import { TopNavBar } from './components/navigation/TopNavBar';
import { BottomNavBar } from './components/navigation/BottomNavBar';
import { AuthModal } from './components/auth/AuthModal';
import { UserProfileDrawer } from './components/auth/UserProfileDrawer';
import { AwsIntegrationModal } from './components/aws/AwsIntegrationModal';

// Screens
import { StudentDashboardScreen } from './components/screens/StudentDashboardScreen';
import { ExamModeScreen } from './components/screens/ExamModeScreen';
import { EvaluationResultScreen } from './components/screens/EvaluationResultScreen';
import { EvaluationCompleteScreen } from './components/screens/EvaluationCompleteScreen';
import { SnapAndSolveScreen } from './components/screens/SnapAndSolveScreen';
import { CareerTreeScreen } from './components/screens/CareerTreeScreen';
import { FlashcardCenterScreen } from './components/screens/FlashcardCenterScreen';
import { LoopholeDiagnosticScreen } from './components/screens/LoopholeDiagnosticScreen';
import { WeeklyReportScreen } from './components/screens/WeeklyReportScreen';
import { TeacherDashboardScreen } from './components/screens/TeacherDashboardScreen';
import { BulkScanningScreen } from './components/screens/BulkScanningScreen';
import { TeacherAgentChatScreen } from './components/screens/TeacherAgentChatScreen';

import { Sparkles, LayoutGrid } from 'lucide-react';

function AppContent() {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('dashboard');
  const [profileOpen, setProfileOpen] = useState(false);
  const [awsModalOpen, setAwsModalOpen] = useState(false);
  const [screenSelectorOpen, setScreenSelectorOpen] = useState(false);

  const screens: { id: ScreenId; label: string; badge: string }[] = [
    { id: 'dashboard', label: '1. Student Hub', badge: 'Pranav' },
    { id: 'teacher-agent-chat', label: '2. Anita Ma\'am (AI Teacher Agent)', badge: 'Gemini Chat' },
    { id: 'exam', label: '3. Science Mock Exam', badge: 'Zinc + HCl' },
    { id: 'post-scan-growth', label: "4. Rahul's Growth Insight", badge: 'Post-Scan' },
    { id: 'evaluation-complete', label: '5. Performance Analytics', badge: '68 Gauge' },
    { id: 'snap-solve', label: '6. Snap & Solve Mentor', badge: 'Division' },
    { id: 'career-tree', label: '7. Grow Career Path', badge: 'Interactive Tree' },
    { id: 'flashcards', label: '8. Flashcard Center', badge: 'Pythagoras' },
    { id: 'loophole-engine', label: '9. AI Loophole Engine', badge: 'Diagnostic' },
    { id: 'weekly-report', label: '10. Weekly Parent Report', badge: 'WhatsApp' },
    { id: 'teacher-analytics', label: '11. Teacher Analytics', badge: 'Heatmap' },
    { id: 'bulk-scanning', label: '12. Bulk Camera Scanner', badge: 'Viewfinder' },
  ];

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-[#070b14] text-slate-100 flex flex-col">
      {/* Top Navigation - hidden in full screen modes (AI teacher, exam, bulk scanner) */}
      {currentScreen !== 'bulk-scanning' && currentScreen !== 'exam' && currentScreen !== 'teacher-agent-chat' && (
        <TopNavBar
          currentScreen={currentScreen}
          onNavigate={setCurrentScreen}
          onOpenProfile={() => setProfileOpen(true)}
          onOpenAwsModal={() => setAwsModalOpen(true)}
        />
      )}

      {/* Main View Router */}
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
          <StudentDashboardScreen
            onNavigate={setCurrentScreen}
            onOpenProfile={() => setProfileOpen(true)}
          />
        )}
        {currentScreen === 'teacher-agent-chat' && (
          <TeacherAgentChatScreen onNavigate={setCurrentScreen} />
        )}
        {currentScreen === 'exam' && <ExamModeScreen onNavigate={setCurrentScreen} />}
        {currentScreen === 'post-scan-growth' && (
          <EvaluationResultScreen onNavigate={setCurrentScreen} />
        )}
        {currentScreen === 'evaluation-complete' && (
          <EvaluationCompleteScreen onNavigate={setCurrentScreen} />
        )}
        {currentScreen === 'snap-solve' && <SnapAndSolveScreen onNavigate={setCurrentScreen} />}
        {currentScreen === 'career-tree' && <CareerTreeScreen onNavigate={setCurrentScreen} />}
        {currentScreen === 'flashcards' && <FlashcardCenterScreen onNavigate={setCurrentScreen} />}
        {currentScreen === 'loophole-engine' && (
          <LoopholeDiagnosticScreen onNavigate={setCurrentScreen} />
        )}
        {currentScreen === 'weekly-report' && <WeeklyReportScreen onNavigate={setCurrentScreen} />}
        {currentScreen === 'teacher-analytics' && (
          <TeacherDashboardScreen onNavigate={setCurrentScreen} />
        )}
        {currentScreen === 'bulk-scanning' && (
          <BulkScanningScreen onNavigate={setCurrentScreen} />
        )}
      </main>

      {/* Bottom Navigation for Mobile (hidden in full-screen teacher chat, exam, bulk scanner) */}
      {currentScreen !== 'bulk-scanning' && currentScreen !== 'exam' && currentScreen !== 'teacher-agent-chat' && (
        <BottomNavBar
          currentScreen={currentScreen}
          onNavigate={setCurrentScreen}
          onOpenProfile={() => setProfileOpen(true)}
        />
      )}

      {/* Screen Navigator Quick Launcher Pill (hidden during full-screen teacher chat to prevent obstructing input) */}
      {currentScreen !== 'teacher-agent-chat' && (
        <div className="fixed bottom-22 lg:bottom-4 right-4 z-30">
          <div className="relative">
            <button
              onClick={() => setScreenSelectorOpen(!screenSelectorOpen)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-900/90 backdrop-blur-xl border border-amber-500/40 text-amber-300 text-xs font-semibold shadow-2xl hover:bg-slate-800 transition-all active:scale-95 cursor-pointer"
            >
              <LayoutGrid className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">12 Screens Index</span>
            </button>

            {screenSelectorOpen && (
              <div className="absolute bottom-12 right-0 w-72 max-h-96 overflow-y-auto glass-panel p-3 rounded-2xl border border-white/15 shadow-2xl space-y-1 animate-in zoom-in-95">
                <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Jump to Screen</span>
                  <span className="text-[10px] text-amber-400 font-mono">12 of 12</span>
                </div>
                {screens.map((scr) => (
                  <button
                    key={scr.id}
                    onClick={() => {
                      setCurrentScreen(scr.id);
                      setScreenSelectorOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                      currentScreen === scr.id
                        ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span className="truncate">{scr.label}</span>
                    <span className="text-[10px] text-slate-500 shrink-0 font-medium">
                      {scr.badge}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal />

      {/* User Profile & Demo Switcher Drawer */}
      <UserProfileDrawer open={profileOpen} onOpenChange={setProfileOpen} />

      {/* AWS DynamoDB Free-Tier Hub Modal */}
      <AwsIntegrationModal open={awsModalOpen} onOpenChange={setAwsModalOpen} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
