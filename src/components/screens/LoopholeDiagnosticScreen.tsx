import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import {
  SearchCheck,
  Mic,
  Volume2,
  AlertTriangle,
  Target,
  ArrowRight,
  Wifi,
  Languages,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface LoopholeDiagnosticScreenProps {
  onNavigate: (screen: any) => void;
}

export function LoopholeDiagnosticScreen({ onNavigate }: LoopholeDiagnosticScreenProps) {
  const { user } = useAuth();
  const [language, setLanguage] = useState<'HI' | 'EN'>('HI');
  const [isListening, setIsListening] = useState(false);
  const [mentorSpeech, setMentorSpeech] = useState<string>(
    '"Namaste Pranav! To solve this 8th-grade equation (2x² + 5x = 0), let\'s first fix your 4th-grade fraction rule. What happens when we add two fractions with equal denominators?"'
  );
  const [responseGiven, setResponseGiven] = useState(false);

  const handleHoldToSpeak = () => {
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      setResponseGiven(true);
      setMentorSpeech(
        '"Spot on! The denominator stays the same and we simply add the numerators! Now, in 2x² + 5x = 0, think of x as the common denominator of both terms. What can we factor out?"'
      );
    }, 2200);
  };

  return (
    <div className="flex flex-col py-6 px-4 max-w-2xl mx-auto w-full">
      {/* Top Header */}
      <header className="flex items-center justify-between py-3 border-b border-white/10 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-amber-500/50">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCofhvp6W0pcY4JgW4XcGXjMh1X3s2zl2wQN0GBsPAM7-VrtJY97wm3Diz7KRv-OnKenEeh7iZAMXm2lTPNyXti5r-KZU7ASU45IDR4D6XLBMo7ZWaCujekzCSvgSAzIOJRpRHVTcu_FA8eTRem9lOf0ejN2NsVY16Kfzbkd0Dh0LqCVDTcvMfMl1DkKC8uI5n9tvSqPcq8LaqkGrX30-yLftlUlV0GEW4Is4AONzvxjQn3dAifdL0o"
              alt="Pranav Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h2 className="font-headline font-bold text-sm text-white">Pranav Sharma</h2>
            <p className="text-[11px] text-slate-400">Class 8 Mathematics</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>Active</span>
          </span>

          <button
            onClick={() => setLanguage(language === 'EN' ? 'HI' : 'EN')}
            className="px-2.5 py-1 rounded-xl bg-slate-900 border border-white/10 text-xs font-semibold text-slate-200 hover:text-white"
          >
            {language}
          </button>
        </div>
      </header>

      {/* Recent Quiz Result Card */}
      <Card className="glass-card mb-4 border-rose-500/30 p-4 relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-400">Recent Quiz Result: Class 8 Mathematics</span>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Incorrect Attempt
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/70 border border-white/5 flex items-center justify-center my-1">
          <span className="font-headline text-2xl md:text-3xl font-bold text-white tracking-wider">
            2x² + 5x = 0
          </span>
        </div>
      </Card>

      {/* AI Loophole Engine Flowchart Panel */}
      <Card className="glass-card mb-6 p-5 border-amber-500/20">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h3 className="font-headline text-base font-bold text-white">
            AI Loophole Engine Analysis
          </h3>
        </div>

        {/* Horizontal Flowchart */}
        <div className="relative flex items-center justify-between py-4 px-2">
          {/* Track line behind nodes */}
          <div className="absolute top-1/2 left-8 right-8 h-1 bg-slate-800 -translate-y-1/2 z-0 rounded-full" />

          {/* Node 1: Current Failed Topic */}
          <div className="relative z-10 flex flex-col items-center gap-2 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center shadow-lg">
              <span className="font-headline text-xs font-bold text-slate-300">Cl 8</span>
            </div>
            <span className="text-[10px] text-slate-400 max-w-[75px] leading-tight">
              Quadratic Factoring
            </span>
          </div>

          {/* Node 2: Intermediate Weakness */}
          <div className="relative z-10 flex flex-col items-center gap-2 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-950/70 border-2 border-amber-500 flex items-center justify-center shadow-lg">
              <span className="font-headline text-xs font-bold text-amber-300">Cl 6</span>
            </div>
            <span className="text-[10px] text-slate-300 max-w-[75px] leading-tight">
              Variable Expressions
            </span>
          </div>

          {/* Node 3: The Root Cause */}
          <div className="relative z-10 flex flex-col items-center gap-2 text-center">
            <div className="w-14 h-14 rounded-full bg-rose-950/80 border-2 border-rose-500 flex items-center justify-center shadow-[0_0_20px_rgba(244,63,94,0.4)] animate-pulse">
              <Target className="w-6 h-6 text-rose-400" />
            </div>
            <span className="text-[10px] font-bold text-rose-300 max-w-[85px] leading-tight">
              Class 4: Foundational Fractions
            </span>
          </div>
        </div>

        {/* Root Cause Banner */}
        <div className="mt-4 p-3.5 rounded-xl bg-amber-950/40 border-l-4 border-amber-500 text-xs text-amber-200 leading-relaxed">
          <strong className="text-white">Root cause detected:</strong> Master Class 4 fractions to
          unlock Class 8 Algebra.
        </div>
      </Card>

      {/* Socratic Mentor Socratic Interactive Panel */}
      <div className="mt-6 rounded-3xl bg-slate-900/90 backdrop-blur-2xl border border-white/15 p-5 shadow-2xl max-w-2xl mx-auto w-full">
        <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-4" />

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <h4 className="font-headline text-sm font-bold text-white">Shiksha Mitra</h4>
              <p className="text-[10px] text-teal-300">Vernacular Socratic Mentor</p>
            </div>
          </div>

          <button
            onClick={() => setLanguage(language === 'HI' ? 'EN' : 'HI')}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white"
          >
            <Volume2 className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'HI' ? 'Hindi / हिंदी' : 'English'}</span>
          </button>
        </div>

        {/* Dialogue Bubble */}
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-white/10 text-slate-100 text-xs md:text-sm leading-relaxed mb-4">
          <p>{mentorSpeech}</p>
        </div>

        {/* Pulsating Microphone Button */}
        <div className="flex flex-col items-center justify-center gap-2">
          <button
            onMouseDown={handleHoldToSpeak}
            onTouchStart={handleHoldToSpeak}
            className={`w-18 h-18 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl cursor-pointer ${
              isListening
                ? 'bg-rose-600 scale-110 shadow-[0_0_30px_rgba(244,63,94,0.6)] animate-pulse'
                : 'bg-gradient-to-tr from-amber-600 to-orange-500 hover:scale-105 shadow-[0_0_25px_rgba(245,158,11,0.4)]'
            }`}
          >
            <Mic className={`w-8 h-8 text-white ${isListening ? 'animate-bounce' : ''}`} />
          </button>
          <span className="font-headline text-xs font-bold text-amber-300 tracking-wide">
            {isListening ? 'Listening to your answer...' : 'Hold to Speak Answer'}
          </span>
        </div>
      </div>
    </div>
  );
}
