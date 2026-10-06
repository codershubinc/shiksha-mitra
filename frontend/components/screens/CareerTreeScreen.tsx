"use client";
import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Dialog } from '../ui/dialog';
import {
  School,
  FunctionSquare,
  Palette,
  BarChart3,
  SunMedium,
  HeartPulse,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

interface CareerTreeScreenProps {
  onNavigate: (screen: any) => void;
}

export function CareerTreeScreen({ onNavigate }: CareerTreeScreenProps) {
  const [selectedBranch, setSelectedBranch] = useState<'stem' | 'arts'>('stem');
  const [selectedCareer, setSelectedCareer] = useState<any | null>(null);

  const careers = {
    stem: [
      {
        id: 'data',
        title: 'Data Analyst',
        badge: 'Growing',
        salary: '₹6 - 12 LPA',
        demand: 'Very High',
        icon: <BarChart3 className="w-5 h-5 text-teal-400" />,
        desc: 'Transforms numbers into insights using statistics, SQL, and analytical thinking.',
        prereqs: ['Class 8 Algebra', 'Statistics & Charts', 'Basic Logic'],
      },
      {
        id: 'renewable',
        title: 'Renewable Tech',
        badge: 'HOT',
        hot: true,
        salary: '₹5 - 10 LPA',
        demand: 'Surging in Rural & Solar grids',
        icon: <SunMedium className="w-6 h-6 text-amber-400" />,
        desc: 'Specialist in solar installation, photovoltaic maintenance, and clean energy storage.',
        prereqs: ['Physics: Electricity & Current', 'Chemistry: Cell Reactions'],
      },
      {
        id: 'healthcare',
        title: 'Healthcare Asst',
        badge: 'Essential',
        salary: '₹4 - 8 LPA',
        demand: 'High Community Need',
        icon: <HeartPulse className="w-5 h-5 text-rose-400" />,
        desc: 'Provides vital clinical diagnostic support, patient care, and telemedicine operation.',
        prereqs: ['Biology: Human Organ Systems', 'Chemistry Basics'],
      },
    ],
    arts: [
      {
        id: 'content',
        title: 'Vernacular Creator',
        badge: 'Creative',
        salary: '₹5 - 15 LPA',
        demand: 'Booming in Indian Languages',
        icon: <Palette className="w-5 h-5 text-purple-400" />,
        desc: 'Produces educational, cultural, and digital storytelling content in Marathi, Hindi & regional languages.',
        prereqs: ['Grammar & Composition', 'Digital Media'],
      },
    ],
  };

  return (
    <div className="flex flex-col py-6 px-4 max-w-4xl mx-auto w-full">
      {/* Header */}
      <section className="text-center mb-8">
        <h1 className="font-headline text-3xl md:text-4xl font-bold text-white mb-2">
          Grow Your Path
        </h1>
        <p className="text-sm md:text-base text-slate-400">
          Tap a subject to explore careers and real-world opportunities
        </p>
      </section>

      {/* Visual Canvas Container */}
      <div className="relative w-full max-w-2xl mx-auto min-h-[580px] rounded-3xl p-6 glass-panel border border-white/10 shadow-2xl flex flex-col justify-between overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Level: Career Nodes */}
        <div className="relative z-10 grid grid-cols-3 gap-3 md:gap-4 pt-4">
          {careers.stem.map((career) => (
            <button
              key={career.id}
              onClick={() => setSelectedCareer(career)}
              className={`p-3 md:p-4 rounded-2xl text-center glass-card border transition-all duration-300 relative group ${
                career.hot
                  ? 'border-amber-500 bg-amber-500/10 shadow-[0_0_25px_rgba(245,158,11,0.25)] hover:scale-105'
                  : 'border-white/10 hover:border-teal-500/40 hover:bg-slate-900/80 hover:scale-103'
              }`}
            >
              {career.badge && (
                <div
                  className={`absolute top-0 right-0 px-2 py-0.5 rounded-bl-xl text-[10px] font-bold ${
                    career.hot
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : 'bg-slate-800 text-teal-300 border-l border-b border-white/10'
                  }`}
                >
                  {career.badge}
                </div>
              )}

              <div className="w-12 h-12 rounded-2xl mx-auto mb-2 flex items-center justify-center bg-slate-950/70 border border-white/10 group-hover:scale-110 transition-transform">
                {career.icon}
              </div>
              <h4 className="font-headline font-bold text-xs md:text-sm text-white truncate">
                {career.title}
              </h4>
              <span className="text-[10px] text-slate-400 mt-1 block">Tap to explore</span>
            </button>
          ))}
        </div>

        {/* SVG Connecting Branches */}
        <div className="relative w-full h-36 my-2 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 600 150" fill="none">
            {/* Stem branch lines to careers */}
            <path
              d="M 200 140 C 200 80, 100 80, 100 10"
              stroke="#0d9488"
              strokeWidth="4"
              strokeDasharray="6 6"
              className="opacity-70"
            />
            <path
              d="M 200 140 C 200 80, 300 80, 300 10"
              stroke="#f59e0b"
              strokeWidth="5"
              className="opacity-90 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]"
            />
            <path
              d="M 200 140 C 200 80, 500 80, 500 10"
              stroke="#0d9488"
              strokeWidth="4"
              strokeDasharray="6 6"
              className="opacity-70"
            />
            {/* Trunk to Branches */}
            <path
              d="M 300 240 C 300 190, 200 190, 200 140"
              stroke="#f59e0b"
              strokeWidth="6"
              className="drop-shadow-[0_0_10px_rgba(245,158,11,0.6)]"
            />
            <path
              d="M 300 240 C 300 190, 420 190, 420 140"
              stroke="#64748b"
              strokeWidth="3"
              strokeDasharray="4 4"
            />
          </svg>
        </div>

        {/* Mid Level: Subject Pillars */}
        <div className="relative z-10 grid grid-cols-2 gap-4 max-w-md mx-auto w-full">
          {/* Math + Science */}
          <button
            onClick={() => setSelectedBranch('stem')}
            className={`p-4 rounded-2xl text-center glass-card border-2 transition-all ${
              selectedBranch === 'stem'
                ? 'border-teal-500 bg-teal-500/15 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                : 'border-white/10 opacity-70'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl mx-auto mb-2 flex items-center justify-center bg-teal-500/20 text-teal-300">
              <span className="font-headline font-bold text-xl">Σ</span>
            </div>
            <h3 className="font-headline font-bold text-sm md:text-base text-white">
              Math + Science
            </h3>
            <span className="text-[11px] text-teal-300">Active Path</span>
          </button>

          {/* Arts & Humanities */}
          <button
            onClick={() => setSelectedBranch('arts')}
            className={`p-4 rounded-2xl text-center glass-card border-2 transition-all ${
              selectedBranch === 'arts'
                ? 'border-purple-500 bg-purple-500/15 shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                : 'border-white/10 opacity-60 hover:opacity-90'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl mx-auto mb-2 flex items-center justify-center bg-purple-500/20 text-purple-300">
              <Palette className="w-6 h-6" />
            </div>
            <h3 className="font-headline font-bold text-sm md:text-base text-white">
              Arts & Hum.
            </h3>
            <span className="text-[11px] text-slate-400">Electives</span>
          </button>
        </div>

        {/* Bottom Root: Foundation Base */}
        <div className="relative z-10 pt-6 pb-2 text-center">
          <div className="inline-flex flex-col items-center p-3.5 rounded-2xl bg-slate-950/80 border border-amber-500/40 shadow-xl">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-1">
              <School className="w-5 h-5" />
            </div>
            <span className="font-headline text-xs font-bold text-amber-200">
              Foundation Core
            </span>
            <span className="text-[10px] text-slate-400">Class 6 - 8 Essentials</span>
          </div>
        </div>
      </div>

      {/* Career Detail Dialog */}
      <Dialog
        open={!!selectedCareer}
        onOpenChange={(open) => !open && setSelectedCareer(null)}
        title={selectedCareer?.title}
        description={selectedCareer?.desc}
      >
        {selectedCareer && (
          <div className="space-y-4 text-slate-200 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5">
                <span className="text-xs text-slate-400 block mb-0.5">Average Income</span>
                <span className="font-headline text-base font-bold text-amber-400">
                  {selectedCareer.salary}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5">
                <span className="text-xs text-slate-400 block mb-0.5">Industry Demand</span>
                <span className="font-headline text-base font-bold text-teal-400">
                  {selectedCareer.demand}
                </span>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Key School Topics Required
              </span>
              <div className="space-y-1.5">
                {selectedCareer.prereqs.map((prereq: string, idx: number) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-950/40 border border-white/5 text-xs flex items-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{prereq}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button
                variant="primary"
                size="md"
                className="w-full gap-2"
                onClick={() => {
                  setSelectedCareer(null);
                  onNavigate('exam');
                }}
              >
                <span>Practice Skills for this Path</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
