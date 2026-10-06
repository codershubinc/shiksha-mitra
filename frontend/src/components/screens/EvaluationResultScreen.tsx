import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Dialog } from '../ui/dialog';
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  MessageSquare,
  User,
  ArrowRight,
  Lightbulb,
  CheckCircle2,
} from 'lucide-react';

interface EvaluationResultScreenProps {
  onNavigate: (screen: any) => void;
}

export function EvaluationResultScreen({ onNavigate }: EvaluationResultScreenProps) {
  const [smsSent, setSmsSent] = useState<boolean>(false);
  const [lessonModalOpen, setLessonModalOpen] = useState<boolean>(false);

  return (
    <div className="flex flex-col py-6 px-4 max-w-5xl mx-auto w-full">
      {/* Header section */}
      <section className="mb-6">
        <h1 className="font-headline text-2xl md:text-3xl font-bold text-white mb-1">
          Insight for Rahul's Growth
        </h1>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <User className="w-4 h-4 text-teal-400" />
          <span>Student: Rahul (Roll No. 12) · Class 8 Mathematics</span>
        </div>
      </section>

      {/* Main Grid: Score + Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Score & Mastery Meter */}
        <Card className="lg:col-span-5 glass-card flex flex-col justify-center items-center text-center p-6 bg-slate-900/60 border-amber-500/20">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center mb-4 shadow-lg shadow-orange-950/50">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <h2 className="font-headline text-2xl font-bold text-amber-300 mb-1">
            Developing Mastery
          </h2>
          <p className="text-xs text-slate-400 mb-6">Performance band: Level 2 / Proficient</p>

          <div className="w-full max-w-xs">
            <div className="flex justify-between text-xs font-semibold text-slate-300 mb-2">
              <span>Concept Retention</span>
              <span className="text-amber-400">68%</span>
            </div>
            <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-700"
                style={{ width: '68%' }}
              />
            </div>
            <p className="text-xs text-slate-400 text-center mt-3">
              Almost there! Needs a little nudge in algebraic factorization.
            </p>
          </div>
        </Card>

        {/* Scanned Image Area with Bounding Box */}
        <Card className="lg:col-span-7 glass-card p-4 relative overflow-hidden flex flex-col items-center justify-center">
          <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-slate-950/80 p-2 w-full max-w-lg">
            <div className="relative">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7HLrteDmFcjIRNlIBGwCMxLgU37VaTbkEMFhRQwlezPH5iIx8oIqmtgJ6fYnzb7_F0LO-rqbwVJ3PvHnkWPv4sx4gpEvTY2dO_KMgvaKgRX_B_bkq099J_J9Fzkto2jYmWMbxN1Zp3HmjMks_b4gsM5ZteJzo3d2Qfi6YtT94gFlom3aH9pG8h2WneCZ2dxRf_bKyENPRtJCIq27x2IPzniogrnV3_25NKqu-_NlgC0o7aw0Otms_"
                alt="Rahul's handwritten math notebook scan with teacher feedback"
                className="w-full h-auto object-cover rounded-xl"
              />

              {/* Bounding Box Overlay for Step 4 error */}
              <div className="absolute top-[35%] left-[22%] w-[60%] h-[26%] border-2 border-amber-500 bg-amber-500/15 rounded-md pointer-events-none flex items-start justify-end p-1.5 animate-pulse">
                <span className="p-1 rounded-full bg-slate-900/90 text-amber-400 shadow-md">
                  <Lightbulb className="w-4 h-4" />
                </span>
              </div>
            </div>

            <p className="text-center text-xs text-slate-400 italic mt-2.5">
              Rahul's Workspace · Error flagged in step factorization
            </p>
          </div>
        </Card>
      </div>

      {/* Coaching Opportunity Card */}
      <Card className="glass-card mb-8 border-teal-500/30 bg-teal-950/30">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6 text-teal-300" />
          </div>
          <div>
            <h3 className="font-headline text-lg font-bold text-teal-200 mb-1">
              Coaching Opportunity Detected
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Rahul is close! He understands the quadratic structure, but he just needs a quick
              refresher on 6th-grade variable isolation to unlock this topic completely.
            </p>
          </div>
        </div>
      </Card>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto w-full">
        <Button
          variant="primary"
          size="lg"
          glow
          className="flex-1 gap-2 py-4"
          onClick={() => setLessonModalOpen(true)}
        >
          <BookOpen className="w-5 h-5" />
          <span>Create Personalized Lesson for Rahul</span>
        </Button>

        <Button
          variant="outline"
          size="lg"
          className="gap-2"
          onClick={() => setSmsSent(true)}
        >
          <MessageSquare className="w-4 h-4 text-teal-400" />
          <span>{smsSent ? 'SMS Sent to Parent ✓' : 'Send Summary to Parent via SMS'}</span>
        </Button>
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={() => onNavigate('evaluation-complete')}
          className="text-xs text-slate-400 hover:text-amber-400 underline underline-offset-4 transition-colors"
        >
          View Full Performance Analytics & Breakdown →
        </button>
      </div>

      {/* Lesson Generation Modal */}
      <Dialog
        open={lessonModalOpen}
        onOpenChange={setLessonModalOpen}
        title="Personalized Remediation Module"
        description="Targeted 10-minute micro-module generated for Rahul."
      >
        <div className="space-y-4 text-sm text-slate-200">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-amber-500/30">
            <h4 className="font-bold text-amber-300 mb-1">Micro-Lesson: The Variable Isolation Bridge</h4>
            <p className="text-xs text-slate-400 mb-3">Estimated time: 8 mins · Rewards: 25 XP</p>
            <ul className="text-xs space-y-2 text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Step 1: Balance review with 6th-grade scale models</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Step 2: Factoring common terms out before dividing</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Step 3: Verification check with 2 practice problems</span>
              </li>
            </ul>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                setLessonModalOpen(false);
                onNavigate('loophole-engine');
              }}
            >
              Open in Socratic Tutor
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
