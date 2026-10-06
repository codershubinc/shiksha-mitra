import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Dialog } from '../ui/dialog';
import { MarkdownRenderer } from '../ui/MarkdownRenderer';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import {
  ShieldCheck,
  Timer,
  ZoomIn,
  Sparkles,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  CheckCircle2,
  FlaskConical,
  Calculator,
  Leaf,
  Landmark,
  BookOpen,
} from 'lucide-react';

interface ExamModeScreenProps {
  onNavigate: (screen: any) => void;
}

interface SubjectMock {
  id: string;
  name: string;
  code: string;
  icon: any;
  color: string;
  totalQuestions: number;
  durationMinutes: number;
  completedPercent: number;
  questionIndex: number;
  questionPrompt: string;
  imageUrl?: string;
  imageAlt?: string;
  options: { id: string; label: string; text: string }[];
  correctOptionId: string;
  socraticContext: string;
}

const mockSubjects: SubjectMock[] = [
  {
    id: 'science',
    name: 'Science (Term 1)',
    code: 'SCI-801',
    icon: FlaskConical,
    color: 'from-amber-500 to-orange-600',
    totalQuestions: 20,
    durationMinutes: 45,
    completedPercent: 25,
    questionIndex: 5,
    questionPrompt:
      'Observe the chemical reaction depicted in the diagram below. What is the primary gas evolved when solid Zinc granules react with dilute Hydrochloric Acid under these conditions?',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA9bykSAVUFnzqf_35wlmUu_Yc2qAXxoItXR8iAp7zUhTTcdY_QJyjMvJjhRZhkq09N35EVFx--HS8pHKOQdo9luaNtFfqn_YwIa9ChhT74CvoqrJMxl7Re6MPnv0wFN6iPfVbwwc44rc26B5M9jW5Vx3KveBCUK1b04AwPQA7YgXcqj3HUY8NykcbwVDcziyyFyucoepLlRc0ceXlff6sQ5M4bAm9ecaH1nwQIHBpgYoBMlWi0dQgu',
    imageAlt: 'Chemical apparatus with zinc granules and dilute hydrochloric acid producing bubbles in water trough',
    options: [
      { id: 'a', label: 'A', text: 'Oxygen (O₂)' },
      { id: 'b', label: 'B', text: 'Hydrogen (H₂)' },
      { id: 'c', label: 'C', text: 'Carbon Dioxide (CO₂)' },
      { id: 'd', label: 'D', text: 'Chlorine (Cl₂)' },
    ],
    correctOptionId: 'b',
    socraticContext: 'Observe metal + dilute acid displacement forming diatomic gas bubbles.',
  },
  {
    id: 'math',
    name: 'Mathematics (Term 1)',
    code: 'MTH-802',
    icon: Calculator,
    color: 'from-teal-500 to-cyan-600',
    totalQuestions: 25,
    durationMinutes: 60,
    completedPercent: 40,
    questionIndex: 10,
    questionPrompt:
      'Solve the following quadratic algebraic equation: 2x² + 5x = 0. Which of the following gives the complete and correct solution set for the real variable x?',
    options: [
      { id: 'a', label: 'A', text: 'x = 0 only' },
      { id: 'b', label: 'B', text: 'x = 0 or x = -5/2' },
      { id: 'c', label: 'C', text: 'x = 2 or x = 5' },
      { id: 'd', label: 'D', text: 'x = -5 or x = 2' },
    ],
    correctOptionId: 'b',
    socraticContext: 'Notice that both terms share a common factor x. Factor x(2x + 5) = 0.',
  },
  {
    id: 'biology',
    name: 'Biology & Living Organisms',
    code: 'BIO-803',
    icon: Leaf,
    color: 'from-emerald-500 to-teal-600',
    totalQuestions: 15,
    durationMinutes: 30,
    completedPercent: 60,
    questionIndex: 8,
    questionPrompt:
      'Which specialized organelle in green plant cells contains chlorophyll and carries out the biochemical process of photosynthesis by converting solar photons into chemical glucose?',
    options: [
      { id: 'a', label: 'A', text: 'Mitochondria' },
      { id: 'b', label: 'B', text: 'Chloroplast' },
      { id: 'c', label: 'C', text: 'Endoplasmic Reticulum' },
      { id: 'd', label: 'D', text: 'Golgi Apparatus' },
    ],
    correctOptionId: 'b',
    socraticContext: 'Think of the green pigment that captures sunlight for food synthesis.',
  },
  {
    id: 'social',
    name: 'Social Studies & Civics',
    code: 'SST-804',
    icon: Landmark,
    color: 'from-indigo-500 to-purple-600',
    totalQuestions: 20,
    durationMinutes: 40,
    completedPercent: 15,
    questionIndex: 3,
    questionPrompt:
      'Under the Indian Constitution, which article is widely regarded as the fundamental safeguard guaranteeing the "Right to Equality" before law to all citizens?',
    options: [
      { id: 'a', label: 'A', text: 'Article 14' },
      { id: 'b', label: 'B', text: 'Article 21' },
      { id: 'c', label: 'C', text: 'Article 32' },
      { id: 'd', label: 'D', text: 'Article 45' },
    ],
    correctOptionId: 'a',
    socraticContext: 'Equality before law is the cornerstone of fundamental rights in Part III.',
  },
  {
    id: 'languages',
    name: 'English & Vernacular Grammar',
    code: 'ENG-805',
    icon: BookOpen,
    color: 'from-rose-500 to-pink-600',
    totalQuestions: 15,
    durationMinutes: 30,
    completedPercent: 80,
    questionIndex: 12,
    questionPrompt:
      'Identify the passive voice transformation for the sentence: "The rural farmers installed solar water pumps across the village fields."',
    options: [
      { id: 'a', label: 'A', text: 'Solar water pumps had installed by the rural farmers.' },
      { id: 'b', label: 'B', text: 'Solar water pumps were installed by the rural farmers across the village fields.' },
      { id: 'c', label: 'C', text: 'Solar water pumps are being installed by the rural farmers.' },
      { id: 'd', label: 'D', text: 'Across the village fields, solar water pumps install the rural farmers.' },
    ],
    correctOptionId: 'b',
    socraticContext: 'Past tense simple (installed) transforms into (were + past participle installed).',
  },
];

export function ExamModeScreen({ onNavigate }: ExamModeScreenProps) {
  const { user, updateUserXp } = useAuth();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('science');
  const [selectedOption, setSelectedOption] = useState<string>('b');
  const [markedForReview, setMarkedForReview] = useState<boolean>(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(34 * 60 + 12);
  const [imageZoomOpen, setImageZoomOpen] = useState<boolean>(false);
  const [hintModalOpen, setHintModalOpen] = useState<boolean>(false);
  const [hintLoading, setHintLoading] = useState<boolean>(false);
  const [hintText, setHintText] = useState<string>('');

  const currentSubject =
    mockSubjects.find((s) => s.id === selectedSubjectId) || mockSubjects[0];

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSubjectChange = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    setSelectedOption('');
    setMarkedForReview(false);
    setHintText('');
    const sub = mockSubjects.find((s) => s.id === subjectId);
    if (sub) {
      setSecondsRemaining(sub.durationMinutes * 60 - 150); // Set realistic remaining time
    }
  };

  const handleAskHint = async () => {
    setHintModalOpen(true);
    if (!hintText) {
      setHintLoading(true);
      try {
        const res = await api.getSocraticHint({
          question: currentSubject.questionPrompt,
          currentInput: `Student is reviewing options for ${currentSubject.name}`,
          context: `Class 8 ${currentSubject.name} Mock Test: ${currentSubject.socraticContext}`,
        });
        setHintText(res.hint);
        updateUserXp(-10);
      } catch (e) {
        setHintText(currentSubject.socraticContext);
      } finally {
        setHintLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col pb-28 pt-20 px-4 max-w-4xl mx-auto w-full">
      {/* Top Locked Exam Header */}
      <div className="fixed top-0 left-0 w-full z-40 bg-slate-950/80 backdrop-blur-xl border-b border-white/10 px-4 md:px-8 py-3 flex justify-between items-center h-16">
        {/* Focus Lock Pill */}
        <div className="flex items-center gap-2 bg-teal-500/10 border border-teal-500/30 px-3.5 py-1.5 rounded-full">
          <div className="relative flex items-center justify-center">
            <span className="material-symbols-outlined text-teal-400 fill text-[18px] relative z-10">
              shield_lock
            </span>
            <span className="absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-30 animate-ping" />
          </div>
          <span className="text-xs font-semibold text-teal-200 hidden sm:inline tracking-wide">
            Focus Lock Active
          </span>
        </div>

        {/* Exam Title (Middle) */}
        <h1 className="font-headline text-sm md:text-base font-bold text-white truncate text-center absolute left-1/2 -translate-x-1/2 max-w-[45%]">
          Class 8 {currentSubject.name} Mock
        </h1>

        {/* Countdown Timer */}
        <div className="flex items-center gap-2 bg-rose-500/15 border border-rose-500/30 text-rose-300 px-3.5 py-1.5 rounded-full shadow-inner">
          <Timer className="w-4 h-4 text-rose-400" />
          <span className="font-headline font-bold text-sm md:text-base tabular-nums tracking-tight">
            {formatTimer(secondsRemaining)}
          </span>
        </div>
      </div>

      {/* Multiple Subject Slides / Tiles Section */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Select Mock Exam Subject
          </span>
          <span className="text-[11px] text-slate-500">5 Active Term 1 Papers</span>
        </div>

        {/* Horizontal Scrollable Slide Deck */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none snap-x">
          {mockSubjects.map((sub) => {
            const isSelected = selectedSubjectId === sub.id;
            const IconComponent = sub.icon;
            return (
              <button
                key={sub.id}
                onClick={() => handleSubjectChange(sub.id)}
                className={`snap-start shrink-0 min-w-[170px] md:min-w-[190px] p-3.5 rounded-2xl text-left transition-all duration-300 relative group cursor-pointer ${
                  isSelected
                    ? 'glass-card border-2 border-amber-500 bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.25)] scale-102'
                    : 'glass-panel border-white/10 hover:border-white/20 hover:bg-slate-900/60 opacity-75 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-tr ${sub.color} text-white shadow-md`}
                  >
                    <IconComponent className="w-5 h-5" />
                  </div>
                  {isSelected ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 uppercase tracking-wide">
                      Active
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-mono">{sub.code}</span>
                  )}
                </div>

                <div className="font-headline font-bold text-xs md:text-sm text-white truncate">
                  {sub.name}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                  <span>{sub.totalQuestions} Questions</span>
                  <span>{sub.durationMinutes}m</span>
                </div>

                {/* Progress bar on each card */}
                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                    style={{ width: `${sub.completedPercent}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Progress Track for Active Exam */}
      <section className="flex flex-col gap-2 mb-6">
        <div className="flex justify-between items-end">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Question {currentSubject.questionIndex} of {currentSubject.totalQuestions}
          </h2>
          <span className="text-xs font-semibold text-teal-400">
            {currentSubject.completedPercent}% Completed
          </span>
        </div>
        <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
            style={{ width: `${currentSubject.completedPercent}%` }}
          />
        </div>
      </section>

      {/* Main Question Card */}
      <Card className="glass-card mb-6 border-white/10 shadow-2xl relative">
        {/* Accent top gradient stripe */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-teal-500" />

        {/* Question Text */}
        <p className="font-body text-base md:text-lg text-slate-100 font-medium leading-relaxed mb-5">
          {currentSubject.questionPrompt}
        </p>

        {/* Optional Diagram Box (e.g. Science) */}
        {currentSubject.imageUrl && (
          <div className="relative group w-full rounded-2xl overflow-hidden border border-white/10 bg-slate-950/60 flex items-center justify-center h-60 md:h-80 mb-6">
            <img
              src={currentSubject.imageUrl}
              alt={currentSubject.imageAlt || 'Subject Diagram'}
              className="w-full h-full object-contain p-4 group-hover:scale-102 transition-transform duration-300"
            />
            <button
              onClick={() => setImageZoomOpen(true)}
              className="absolute bottom-3 right-3 p-2 rounded-xl bg-slate-900/80 backdrop-blur-md border border-white/15 text-slate-300 hover:text-white hover:border-amber-500/50 transition-all opacity-80 group-hover:opacity-100"
              title="Expand Diagram"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Multiple Choice Radio List */}
        <div className="space-y-3" role="radiogroup">
          {currentSubject.options.map((opt) => {
            const isSelected = selectedOption === opt.id;
            return (
              <label
                key={opt.id}
                onClick={() => setSelectedOption(opt.id)}
                className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'border-amber-500 bg-amber-500/15 shadow-[0_0_20px_rgba(245,158,11,0.15)] text-white'
                    : 'border-white/5 bg-slate-950/40 text-slate-300 hover:border-white/20 hover:bg-slate-950/60'
                }`}
              >
                <input
                  type="radio"
                  name="quiz_answer"
                  value={opt.id}
                  checked={isSelected}
                  onChange={() => setSelectedOption(opt.id)}
                  className="sr-only"
                />
                <div
                  className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center transition-colors ${
                    isSelected ? 'border-amber-400 bg-amber-500' : 'border-slate-600'
                  }`}
                >
                  {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-slate-950" />}
                </div>
                <span className="text-sm md:text-base font-medium">{opt.text}</span>
              </label>
            );
          })}
        </div>
      </Card>

      {/* Socratic Hint Button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={handleAskHint}
          className="flex items-center gap-2.5 px-6 py-3 rounded-full border-2 border-teal-500/40 bg-teal-950/30 text-teal-300 hover:bg-teal-900/40 hover:border-teal-400 transition-all text-sm font-semibold shadow-lg shadow-teal-950/40 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-teal-400 animate-pulse" />
          <span>Ask Socratic Hint</span>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-teal-500/20 text-teal-200 border border-teal-500/30">
            Costs 10 XP
          </span>
        </button>
      </div>

      {/* Focus Mode Enforced Banner */}
      <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 flex items-start gap-3 text-rose-200 text-xs md:text-sm">
        <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
        <div>
          <div className="font-bold text-rose-300 mb-0.5">Focus Mode Enforced</div>
          <p className="opacity-90 leading-relaxed text-xs">
            Leaving or switching apps will flag distraction time on your parent's weekly WhatsApp
            report. Stay focused!
          </p>
        </div>
      </div>

      {/* Bottom Action Footer */}
      <footer className="fixed bottom-0 left-0 w-full z-40 bg-slate-950/90 backdrop-blur-xl border-t border-white/10 px-4 md:px-8 py-3.5 flex justify-between items-center">
        <Button
          variant="outline"
          size="md"
          className="gap-1.5"
          onClick={() => onNavigate('dashboard')}
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Dashboard</span>
        </Button>

        <button
          onClick={() => setMarkedForReview(!markedForReview)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all ${
            markedForReview
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-slate-300 hover:text-white hover:bg-white/5'
          }`}
        >
          <Bookmark className={`w-4 h-4 ${markedForReview ? 'fill-amber-400' : ''}`} />
          <span>{markedForReview ? 'Marked' : 'Mark for Review'}</span>
        </button>

        <Button
          variant="primary"
          size="md"
          glow
          className="gap-2 px-6"
          onClick={() => onNavigate('post-scan-growth')}
        >
          <span>Next / Evaluate</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </footer>

      {/* Hint Dialog */}
      <Dialog
        open={hintModalOpen}
        onOpenChange={setHintModalOpen}
        title="Socratic Guidance"
        description="A gentle nudge to spark your reasoning without spoiling the solution."
      >
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-teal-500/30 text-teal-100 text-sm leading-relaxed space-y-3">
          {hintLoading ? (
            <div className="flex items-center justify-center py-6 gap-3 text-slate-300">
              <span className="w-5 h-5 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
              <span>Generating Socratic hint with Gemini AI...</span>
            </div>
          ) : (
            <MarkdownRenderer content={hintText} />
          )}
        </div>
        <div className="mt-4 flex justify-end">
          <Button variant="outline" size="sm" onClick={() => setHintModalOpen(false)}>
            Got it, thanks!
          </Button>
        </div>
      </Dialog>

      {/* Diagram Zoom Dialog */}
      {currentSubject.imageUrl && (
        <Dialog
          open={imageZoomOpen}
          onOpenChange={setImageZoomOpen}
          title={`${currentSubject.name} Diagram View`}
        >
          <div className="p-2 bg-slate-950 rounded-2xl border border-white/10 flex items-center justify-center">
            <img
              src={currentSubject.imageUrl}
              alt={currentSubject.imageAlt || 'Diagram'}
              className="w-full h-auto object-contain max-h-[70vh]"
            />
          </div>
        </Dialog>
      )}
    </div>
  );
}
