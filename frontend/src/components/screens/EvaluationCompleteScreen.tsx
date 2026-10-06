import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Dialog } from '../ui/dialog';
import {
  AlertTriangle,
  TrendingDown,
  FileCheck,
  Brain,
  Pencil,
  Image as ImageIcon,
  Share2,
  CheckCircle2,
  User,
} from 'lucide-react';

interface EvaluationCompleteScreenProps {
  onNavigate: (screen: any) => void;
}

export function EvaluationCompleteScreen({ onNavigate }: EvaluationCompleteScreenProps) {
  const [notifyParentOpen, setNotifyParentOpen] = useState(false);
  const [parentNotified, setParentNotified] = useState(false);

  return (
    <div className="flex flex-col py-6 px-4 max-w-5xl mx-auto w-full">
      {/* Header */}
      <section className="mb-6">
        <h1 className="font-headline text-2xl md:text-3xl font-bold text-white mb-1">
          Evaluation Complete
        </h1>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <User className="w-4 h-4 text-teal-400" />
          <span>Student: Rahul (Roll No. 12) · Mid-Term Diagnostics</span>
        </div>
      </section>

      {/* Performance Analytics Card with Gauge */}
      <Card className="glass-card mb-6">
        <h3 className="font-headline text-lg font-bold text-white pb-3 border-b border-white/5 mb-6">
          Performance Analytics
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Circular Gauge */}
          <div className="md:col-span-4 flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-950/60 border border-white/10">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-slate-800"
                  strokeWidth="8"
                  fill="transparent"
                />
                {/* Value circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-amber-500"
                  strokeWidth="8"
                  strokeDasharray="264"
                  strokeDashoffset={264 - (264 * 68) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-headline text-4xl font-bold text-amber-400 leading-none">
                  68
                </span>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mt-1">
                  Overall
                </span>
              </div>
            </div>
            <p className="text-xs font-semibold text-amber-300/90 mt-4">Needs Improvement</p>
          </div>

          {/* Breakdown Stats Progress Bars */}
          <div className="md:col-span-8 space-y-4">
            {/* Accuracy */}
            <div className="p-3.5 rounded-xl bg-slate-950/40 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <FileCheck className="w-5 h-5 text-teal-400" />
                <span className="text-sm font-semibold text-slate-200">Accuracy</span>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-1/2">
                <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-500 rounded-full" style={{ width: '80%' }} />
                </div>
                <span className="text-sm font-bold text-white tabular-nums min-w-[3ch] text-right">
                  80%
                </span>
              </div>
            </div>

            {/* Logic & Steps */}
            <div className="p-3.5 rounded-xl bg-slate-950/40 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <Brain className="w-5 h-5 text-cyan-400" />
                <span className="text-sm font-semibold text-slate-200">Logic & Steps</span>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-1/2">
                <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 rounded-full" style={{ width: '55%' }} />
                </div>
                <span className="text-sm font-bold text-white tabular-nums min-w-[3ch] text-right">
                  55%
                </span>
              </div>
            </div>

            {/* Effort */}
            <div className="p-3.5 rounded-xl bg-slate-950/40 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <Pencil className="w-5 h-5 text-amber-400" />
                <span className="text-sm font-semibold text-slate-200">Effort</span>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-1/2">
                <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '90%' }} />
                </div>
                <span className="text-sm font-bold text-white tabular-nums min-w-[3ch] text-right">
                  90%
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Root Cause & Evidence Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Root Cause Analysis */}
        <Card className="glass-card flex flex-col justify-between">
          <div>
            <h3 className="font-headline text-lg font-bold text-white pb-3 border-b border-white/5 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              <span>Root Cause Analysis</span>
            </h3>

            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-200 mb-4">
              <h4 className="font-bold text-rose-300 text-sm mb-1 flex items-center gap-1.5">
                Foundational Gap Detected
              </h4>
              <p className="text-xs md:text-sm leading-relaxed text-rose-100/90">
                Rahul repeatedly failed variable isolation. The AI traces this to a loophole in
                6th-grade basic linear equations and fraction equality rules.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/50 border border-white/5 space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Impact Area:</span>
              <span className="font-bold text-slate-200">Current Quadratic Topics</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Severity:</span>
              <span className="text-rose-400 font-bold flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5" /> High
              </span>
            </div>
          </div>
        </Card>

        {/* Evidence Card */}
        <Card className="glass-card flex flex-col justify-between">
          <div>
            <h3 className="font-headline text-lg font-bold text-white pb-3 border-b border-white/5 mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-teal-400" />
              <span>Diagnostic Evidence</span>
            </h3>

            <div className="relative rounded-xl overflow-hidden border border-white/10 bg-slate-950/80">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7HLrteDmFcjIRNlIBGwCMxLgU37VaTbkEMFhRQwlezPH5iIx8oIqmtgJ6fYnzb7_F0LO-rqbwVJ3PvHnkWPv4sx4gpEvTY2dO_KMgvaKgRX_B_bkq099J_J9Fzkto2jYmWMbxN1Zp3HmjMks_b4gsM5ZteJzo3d2Qfi6YtT94gFlom3aH9pG8h2WneCZ2dxRf_bKyENPRtJCIq27x2IPzniogrnV3_25NKqu-_NlgC0o7aw0Otms_"
                alt="Scanned math submission showing error"
                className="w-full h-44 object-cover"
              />
              <div className="absolute top-[30%] left-[20%] w-[58%] h-[28%] border-2 border-rose-500 rounded bg-rose-500/10 pointer-events-none flex items-start justify-end p-1">
                <span className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-bold">
                  !
                </span>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-slate-400 mt-3">
            Scanned submission showing algebraic factorization error in Step 2.
          </p>
        </Card>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto w-full">
        <Button
          variant="secondary"
          size="lg"
          glow
          className="flex-1 gap-2 py-4"
          onClick={() => onNavigate('loophole-engine')}
        >
          <Brain className="w-5 h-5" />
          <span>Generate Remediation Plan</span>
        </Button>

        <Button
          variant="outline"
          size="lg"
          className="gap-2"
          onClick={() => setNotifyParentOpen(true)}
        >
          <Share2 className="w-4 h-4 text-teal-400" />
          <span>{parentNotified ? 'Parent Notified ✓' : 'Notify Parent'}</span>
        </Button>
      </div>

      {/* Parent Notification Dialog */}
      <Dialog
        open={notifyParentOpen}
        onOpenChange={setNotifyParentOpen}
        title="Notify Parent: WhatsApp / SMS Update"
        description="Preview of automated report dispatch to Rahul's guardian."
      >
        <div className="space-y-4 text-sm text-slate-200">
          <div className="p-4 rounded-xl bg-slate-950/70 border border-teal-500/30 text-xs space-y-2">
            <div className="font-semibold text-teal-300">Message Preview:</div>
            <p className="text-slate-300 leading-relaxed italic">
              "Namaste! Rahul completed today's Class 8 Math mock exam. He scored 68/100 with 90%
              effort. Shiksha Mitra AI detected a quick foundational refresher in basic equations
              that will elevate his score to 85%+. View full progress in app."
            </p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                setParentNotified(true);
                setNotifyParentOpen(false);
              }}
            >
              Send WhatsApp & SMS Now
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
