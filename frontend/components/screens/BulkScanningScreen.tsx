"use client";
import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Dialog } from '../ui/dialog';
import {
  ArrowLeft,
  Flashlight,
  Camera,
  Image as ImageIcon,
  Layers,
  Sparkles,
  QrCode,
  CheckCircle2,
} from 'lucide-react';
import { api } from '@/lib/api';

interface BulkScanningScreenProps {
  onNavigate: (screen: any) => void;
}

export function BulkScanningScreen({ onNavigate }: BulkScanningScreenProps) {
  const [scannedCount, setScannedCount] = useState<number>(14);
  const [flashOn, setFlashOn] = useState<boolean>(false);
  const [isShutterPressing, setIsShutterPressing] = useState<boolean>(false);
  const [batchEvaluating, setBatchEvaluating] = useState<boolean>(false);
  const [batchResults, setBatchResults] = useState<any | null>(null);

  const handleCapture = () => {
    setIsShutterPressing(true);
    setTimeout(() => {
      setIsShutterPressing(false);
      setScannedCount((prev) => Math.min(40, prev + 1));
    }, 250);
  };

  const handleEvaluateBatch = async () => {
    setBatchEvaluating(true);
    try {
      const data = await api.evaluateBatch({ totalPapers: scannedCount });
      setBatchResults(data);
    } catch (e) {
      setBatchResults({
        totalPapers: scannedCount,
        evaluatedCount: scannedCount,
        classAverage: 75.2,
        topGap: 'Fraction Operations (60% of class)',
      });
    } finally {
      setBatchEvaluating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between overflow-hidden select-none">
      {/* Camera Feed Background */}
      <div className="absolute inset-0 z-0 bg-slate-950">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAM01UgTZ8kyDa12jzaqH1ZSphQjWI6piB1eUp7yrnNgr_CJ5T6fBKgKFWkhry-n0AqbBsZnE3WzkjJTO91AwajYnRmZFPDng_yAaPHPO6g5s5jt3pYzbLMAaLdMHXQRpQcTcV6Qv6cjuZfC3-hc-ijj9mJMxS8jgrPXl_H8suYkP2-ZzLDR8rlHUdvAhZgP3HxjLepamCshm49JZMd9iHrsL4Rsuxg4obAhzm-oCK3Wxc8naeqWvvV"
          alt="Desk background for test papers"
          className="w-full h-full object-cover filter blur-[2px] opacity-75 scale-105"
        />
        {/* Flash overlay */}
        {flashOn && (
          <div className="absolute inset-0 bg-white/20 pointer-events-none transition-opacity" />
        )}
      </div>

      {/* Top Header */}
      <header className="relative z-20 bg-slate-950/80 backdrop-blur-xl border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => onNavigate('teacher-analytics')}
          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <h1 className="font-headline text-xs md:text-sm font-bold text-white truncate max-w-[65%] text-center">
          Bulk Scanning: Class 8 Mathematics Mock Test
        </h1>

        <button
          onClick={() => setFlashOn(!flashOn)}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
            flashOn ? 'bg-amber-400 text-slate-950' : 'bg-white/10 text-white hover:bg-white/20'
          }`}
          title="Toggle Flash"
        >
          <Flashlight className="w-5 h-5" />
        </button>
      </header>

      {/* Center Viewfinder & Laser Reticles */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-6">
        <div className="relative w-full max-w-sm aspect-[3/4] border-2 border-emerald-400/80 rounded-2xl animate-pulse-border">
          {/* Corner Reticles */}
          <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl" />
          <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl" />
          <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl" />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-xl" />

          {/* Animated Laser Scanline */}
          <div className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_3px_rgba(52,211,153,0.8)] animate-scanline left-0" />

          {/* Simulated Detected Bounding Boxes */}
          <div className="absolute top-4 right-4 w-11 h-11 border border-emerald-400/60 bg-emerald-500/20 rounded-xl flex items-center justify-center">
            <QrCode className="w-5 h-5 text-emerald-300" />
          </div>

          <div className="absolute top-28 left-6 w-44 h-9 border border-emerald-400/50 bg-emerald-500/15 rounded-lg flex items-center px-2">
            <span className="text-[10px] text-emerald-200 font-mono">Q1: Factorization</span>
          </div>

          <div className="absolute top-42 left-6 w-36 h-9 border border-emerald-400/50 bg-emerald-500/15 rounded-lg flex items-center px-2">
            <span className="text-[10px] text-emerald-200 font-mono">Q2: Step 2 detected</span>
          </div>
        </div>
      </div>

      {/* Bottom Control Bar */}
      <footer className="relative z-20 bg-slate-950/90 backdrop-blur-2xl rounded-t-3xl border-t border-white/10 px-6 pt-5 pb-8 flex flex-col items-center">
        {/* Status Counter */}
        <div className="flex items-center gap-2 mb-4 bg-slate-900/90 border border-white/10 py-1.5 px-4 rounded-full text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-slate-300">
            Successfully Scanned:{' '}
            <strong className="text-amber-400 font-bold tabular-nums">
              {scannedCount} / 40
            </strong>{' '}
            Papers
          </span>
        </div>

        {/* Shutter & Controls Row */}
        <div className="flex items-center justify-between w-full max-w-sm mb-4">
          <button
            onClick={() => onNavigate('post-scan-growth')}
            className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
            title="Browse Gallery"
          >
            <ImageIcon className="w-5 h-5" />
          </button>

          {/* Shutter Button */}
          <button
            onClick={handleCapture}
            className={`w-20 h-20 rounded-full border-4 border-white/20 bg-slate-950 flex items-center justify-center transition-transform shadow-2xl ${
              isShutterPressing ? 'scale-90' : 'hover:scale-105 active:scale-95'
            }`}
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-900/50">
              <Camera className="w-7 h-7 text-white" />
            </div>
          </button>

          {/* Stack Preview Button */}
          <button
            onClick={() => onNavigate('evaluation-complete')}
            className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-colors relative"
            title="View Stack"
          >
            <Layers className="w-5 h-5" />
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md">
              {scannedCount}
            </span>
          </button>
        </div>

        {/* Batch AI Evaluation Button */}
        <Button
          variant="secondary"
          size="lg"
          glow
          className="w-full max-w-sm gap-2 py-4"
          onClick={handleEvaluateBatch}
          disabled={batchEvaluating}
        >
          <Sparkles className={`w-5 h-5 ${batchEvaluating ? 'animate-spin' : ''}`} />
          <span>
            {batchEvaluating
              ? `Processing OCR & Diagnostics for ${scannedCount} Papers...`
              : 'Evaluate Batch via AI'}
          </span>
        </Button>
      </footer>

      {/* Batch Results Dialog */}
      <Dialog
        open={!!batchResults}
        onOpenChange={(open) => !open && setBatchResults(null)}
        title="Batch Evaluation Completed"
        description={`AI has analyzed all ${batchResults?.evaluatedCount || scannedCount} submissions.`}
      >
        <div className="space-y-4 text-slate-200 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5">
              <span className="text-xs text-slate-400 block">Class Average</span>
              <span className="font-headline text-2xl font-bold text-teal-400">
                {batchResults?.classAverage || 75.2}%
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5">
              <span className="text-xs text-slate-400 block">Top Foundational Gap</span>
              <span className="text-xs font-bold text-rose-300">
                {batchResults?.topGap || 'Fractions (60%)'}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Sample Student Outcomes
            </h4>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between p-2 rounded-lg bg-white/5">
                <span>Student Verma (Roll 12)</span>
                <span className="text-amber-400 font-bold">68% · Variable Gap</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-white/5">
                <span>Student Sharma (Roll 07)</span>
                <span className="text-emerald-400 font-bold">82% · Steady</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-white/5">
                <span>Diya Kulkarni (Roll 19)</span>
                <span className="text-teal-400 font-bold">74% · Exponents</span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              variant="primary"
              size="md"
              className="w-full"
              onClick={() => {
                setBatchResults(null);
                onNavigate('teacher-analytics');
              }}
            >
              Open Teacher Analytics Dashboard
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
