"use client";
import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Dialog } from '../ui/dialog';
import {
  Award,
  Clock,
  CheckCircle2,
  Layers,
  Sparkles,
  TrendingDown,
  BarChart2,
  Share2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface WeeklyReportScreenProps {
  onNavigate: (screen: any) => void;
}

export function WeeklyReportScreen({ onNavigate }: WeeklyReportScreenProps) {
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [latestScore, setLatestScore] = useState<number>(82);
  const [maxScore, setMaxScore] = useState<number>(100);

  React.useEffect(() => {
    import('@/lib/api').then(({ api }) => {
      api.getReports().then((data: any[]) => {
        if (data && data.length > 0) {
          const latest = data[0]; // Sort is completedAt -1 in backend
          setLatestScore(latest.score);
          setMaxScore(latest.totalQuestions);
        }
      }).catch(console.error);
    });
  }, []);

  const handleShare = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center justify-center p-4 py-6 max-w-xl mx-auto w-full">
      {/* Container simulating the WhatsApp / Parent Report Card in Dark Glassmorphism */}
      <div className="w-full glass-card rounded-3xl border border-white/15 overflow-hidden shadow-2xl">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-4 flex items-center gap-3.5 shadow-md">
          <div className="w-11 h-11 rounded-2xl bg-slate-950/80 border border-white/20 flex items-center justify-center shadow-lg">
            <Sparkles className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <h3 className="font-headline font-bold text-white text-base leading-tight">
              Shiksha Mitra AI
            </h3>
            <p className="text-xs text-amber-100/90 font-medium">Automated Weekly Parent Update</p>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6 space-y-6">
          <div>
            <h1 className="font-headline text-xl md:text-2xl font-bold text-white mb-1.5 leading-snug">
              Weekly Academic & Focus Report for Student
            </h1>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              Here is a quick summary of Student's progress this week. He is maintaining an excellent
              pace!
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3.5">
            {/* Mock Exam Score (Full width) */}
            <div className="col-span-2 p-4 rounded-2xl bg-slate-950/70 border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center shrink-0">
                  <Award className="w-6 h-6 text-teal-300" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-medium block">Mock Exam Score</span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-headline text-3xl font-bold text-white tabular-nums">
                      {latestScore}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">/{maxScore}</span>
                  </div>
                </div>
              </div>
              <div className="h-10 w-2 rounded-full bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.6)]" />
            </div>

            {/* Study Time */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/10 flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-5 h-5 text-amber-400" />
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <div className="font-headline text-2xl font-bold text-white tabular-nums">
                  5.2 <span className="text-xs font-normal text-slate-400">Hrs</span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">Study Time</div>
              </div>
              <div className="absolute bottom-0 left-0 h-1 bg-slate-800 w-full">
                <div className="h-full bg-amber-500 rounded-r-full" style={{ width: '75%' }} />
              </div>
            </div>

            {/* Cards Mastered */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/10 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <Layers className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <div className="font-headline text-2xl font-bold text-white tabular-nums">85</div>
                <div className="text-xs text-slate-400 mt-0.5">Cards Mastered</div>
              </div>
              <div className="mt-2 self-start px-2 py-0.5 rounded-lg bg-teal-500/15 border border-teal-500/30 text-[10px] font-bold text-teal-300">
                90% Accuracy
              </div>
            </div>

            {/* Focus & Wellbeing (Full width) */}
            <div className="col-span-2 p-4 rounded-2xl bg-slate-950/70 border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6 text-cyan-300" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-medium block">Focus & Wellbeing</span>
                  <div className="text-sm font-medium text-white">
                    Distraction Time:{' '}
                    <span className="font-bold text-emerald-400 tabular-nums">12 mins</span>
                  </div>
                </div>
              </div>
              <TrendingDown className="w-5 h-5 text-emerald-400" />
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2 space-y-3">
            <Button
              variant="primary"
              size="lg"
              glow
              className="w-full gap-2"
              onClick={() => onNavigate('dashboard')}
            >
              <BarChart2 className="w-5 h-5" />
              <span>View Detailed Report</span>
            </Button>

            <Button
              variant="outline"
              size="md"
              className="w-full gap-2 text-teal-300 border-teal-500/30"
              onClick={() => setShareModalOpen(true)}
            >
              <Share2 className="w-4 h-4" />
              <span>Share via WhatsApp to Parent</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Share Dialog */}
      <Dialog
        open={shareModalOpen}
        onOpenChange={setShareModalOpen}
        title="WhatsApp Parent Dispatch"
        description="Encourage parental engagement with vernacular weekly updates."
      >
        <div className="space-y-4 text-xs md:text-sm text-slate-200">
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-emerald-500/30 text-emerald-200 font-mono text-xs leading-relaxed">
            🌟 *Shiksha Mitra Academic Update: Student* 🌟
            <br />
            • Exam Mock Score: 82/100 (Proficient)
            <br />
            • Total Learning Time: 5.2 Hours
            <br />
            • Spaced Repetition: 85 Cards Mastered (90% Accuracy)
            <br />• Distraction Time: Only 12 mins (Down 40%!)
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="primary" size="md" onClick={handleShare}>
              {copied ? 'Copied to Clipboard ✓' : 'Copy WhatsApp Message'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
