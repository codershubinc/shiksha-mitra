import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Dialog } from '../ui/dialog';
import { MarkdownRenderer } from '../ui/MarkdownRenderer';
import {
  ArrowLeft,
  CloudCheck,
  Volume2,
  Sparkles,
  RotateCw,
  CheckCircle2,
  Flame,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface FlashcardCenterScreenProps {
  onNavigate: (screen: any) => void;
}

export function FlashcardCenterScreen({ onNavigate }: FlashcardCenterScreenProps) {
  const { updateUserXp } = useAuth();
  const [currentCardIndex, setCurrentCardIndex] = useState(3); // Card 4 of 15
  const [isFlipped, setIsFlipped] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiExplanation, setAiExplanation] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const cards = [
    {
      formula: 'v = u + at',
      title: 'First Equation of Motion',
      def: 'Relates final velocity (v) to initial velocity (u), uniform acceleration (a), and elapsed time (t).',
      deck: 'Physics & Math Basics',
    },
    {
      formula: 'F = m · a',
      title: "Newton's Second Law",
      def: 'The force acting on an object is equal to the mass of the object multiplied by its acceleration.',
      deck: 'Physics & Math Basics',
    },
    {
      formula: '(a + b)² = a² + 2ab + b²',
      title: 'Square of a Binomial',
      def: 'The algebraic expansion of the sum of two variables squared.',
      deck: 'Physics & Math Basics',
    },
    {
      formula: 'a² + b² = c²',
      title: 'Pythagorean Theorem',
      def: 'In a right-angled triangle, the square of the hypotenuse side (c) is equal to the sum of squares of the other two perpendicular sides (a and b).',
      deck: 'Physics & Math Basics',
      diagram:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBaslXjc9BLKQk8XI-Zw5QnW-yy8_ISh6G9qpi1l_CwhAhUpXUsBW9Z6LIyWiNvpuKt7tYrbsLmMYIqFIeRa1jhvvYuCXLzBQXdedt7D-g-2-gQb6oln0wafVTukLiUFqXuEKhBd7eMc4-LJ4Pv3KIWG1ZG1ydmTOSPKNVNzu7GYz3FUod1Tx9p15RgNsecypFt_V7euzxZXym78iiqbAcblCkyzLZvf-2T4rtlC5xd7jGWW0EzeMa-',
    },
  ];

  const currentCard = cards[currentCardIndex] || cards[3];

  const handleAudio = () => {
    setIsPlayingAudio(true);
    // Use Web Speech API if supported
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(
        `Pythagorean Theorem: a squared plus b squared equals c squared. काटकोन त्रिकोणात कर्णाचा वर्ग हा इतर दोन बाजूंच्या वर्गांच्या बेरजेइतका असतो.`
      );
      utterance.onend = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setIsPlayingAudio(false), 2000);
    }
  };

  const handleRating = (difficulty: 'hard' | 'good' | 'easy') => {
    updateUserXp(difficulty === 'easy' ? 15 : difficulty === 'good' ? 10 : 5);
    setIsFlipped(false);
    // Cycle cards
    setCurrentCardIndex((prev) => (prev + 1) % cards.length);
  };

  const handleGenerateAiExplanation = () => {
    setAiModalOpen(true);
    if (!aiExplanation) {
      setAiLoading(true);
      setTimeout(() => {
        setAiExplanation(
          `Imagine you want to walk from the corner of a farm to the opposite diagonal corner across a rectangular field.
Instead of walking along side 'a' and then turning along side 'b', you take the diagonal shortcut 'c'.
The Pythagorean Theorem mathematically proves that: c = √(a² + b²).
For example, with sides 3 meters and 4 meters: 3² + 4² = 9 + 16 = 25, so hypotenuse c = 5 meters!`
        );
        setAiLoading(false);
      }, 800);
    }
  };

  return (
    <div className="min-h-screen flex flex-col pb-32 pt-4 px-4 max-w-3xl mx-auto w-full">
      {/* Top Header */}
      <header className="py-3 border-b border-white/10 mb-4">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2 text-xs md:text-sm text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Decks</span>
          </button>
          <h1 className="font-headline text-base md:text-lg font-bold text-amber-400 truncate max-w-[50%]">
            Physics & Math Basics Deck
          </h1>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span className="hidden sm:inline">Offline Ready</span>
          </div>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Progress</span>
            <span className="font-medium text-slate-200">
              Card {currentCardIndex + 1} of {cards.length}
            </span>
          </div>
          <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-300"
              style={{ width: `${((currentCardIndex + 1) / cards.length) * 100}%` }}
            />
          </div>
        </div>
      </header>

      {/* Main Flashcard Container */}
      <div className="flex-1 flex flex-col items-center justify-center my-4">
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className="w-full max-w-xl glass-card border-white/15 p-6 md:p-8 rounded-3xl cursor-pointer hover:border-amber-500/40 transition-all duration-300 relative group shadow-2xl"
        >
          {/* Audio Pronunciation Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAudio();
            }}
            className={`absolute top-5 right-5 p-2.5 rounded-full border transition-all ${
              isPlayingAudio
                ? 'bg-amber-500 text-slate-950 border-amber-400 animate-pulse'
                : 'bg-slate-900/80 border-white/10 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="Listen in English and Marathi"
          >
            <Volume2 className="w-4 h-4" />
          </button>

          {/* Diagram Area */}
          <div className="w-full h-44 md:h-56 rounded-2xl bg-slate-950/70 border border-white/10 flex items-center justify-center mb-6 overflow-hidden p-3">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBaslXjc9BLKQk8XI-Zw5QnW-yy8_ISh6G9qpi1l_CwhAhUpXUsBW9Z6LIyWiNvpuKt7tYrbsLmMYIqFIeRa1jhvvYuCXLzBQXdedt7D-g-2-gQb6oln0wafVTukLiUFqXuEKhBd7eMc4-LJ4Pv3KIWG1ZG1ydmTOSPKNVNzu7GYz3FUod1Tx9p15RgNsecypFt_V7euzxZXym78iiqbAcblCkyzLZvf-2T4rtlC5xd7jGWW0EzeMa-"
              alt="Right-angled triangle diagram for Pythagorean theorem"
              className="w-full h-full object-contain filter drop-shadow-lg"
            />
          </div>

          {/* Card Front / Back Content */}
          <div className="text-center space-y-2">
            <h2 className="font-headline text-3xl md:text-4xl font-bold text-amber-400 tracking-wide">
              {currentCard.formula}
            </h2>
            <div className="h-0.5 w-12 bg-amber-500/40 mx-auto my-3" />
            <p className="font-headline text-lg font-semibold text-white">{currentCard.title}</p>
            <p className="text-xs md:text-sm text-slate-300 max-w-md mx-auto leading-relaxed pt-1">
              {currentCard.def}
            </p>
          </div>

          <div className="mt-6 text-center">
            <span className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
              <RotateCw className="w-3 h-3" />
              <span>Tap anywhere to review details</span>
            </span>
          </div>
        </div>

        {/* Spaced Repetition SRS Controls */}
        <div className="w-full max-w-xl grid grid-cols-3 gap-3 mt-6">
          <button
            onClick={() => handleRating('hard')}
            className="flex flex-col items-center justify-center py-3 px-2 rounded-2xl border-2 border-rose-500/40 bg-rose-950/30 text-rose-300 hover:bg-rose-900/40 hover:border-rose-400 transition-all active:scale-95"
          >
            <span className="font-headline font-bold text-sm">Hard</span>
            <span className="text-[10px] text-slate-400 mt-0.5">&lt; 10 mins</span>
          </button>

          <button
            onClick={() => handleRating('good')}
            className="flex flex-col items-center justify-center py-3 px-2 rounded-2xl border-2 border-amber-500/50 bg-amber-950/30 text-amber-300 hover:bg-amber-900/40 hover:border-amber-400 transition-all active:scale-95 shadow-lg shadow-amber-950/40 scale-102"
          >
            <span className="font-headline font-bold text-sm">Good</span>
            <span className="text-[10px] text-amber-200/80 mt-0.5">Tomorrow</span>
          </button>

          <button
            onClick={() => handleRating('easy')}
            className="flex flex-col items-center justify-center py-3 px-2 rounded-2xl border-2 border-teal-500/40 bg-teal-950/30 text-teal-300 hover:bg-teal-900/40 hover:border-teal-400 transition-all active:scale-95"
          >
            <span className="font-headline font-bold text-sm">Easy</span>
            <span className="text-[10px] text-slate-400 mt-0.5">4 Days</span>
          </button>
        </div>

        {/* AI Assistant Link */}
        <button
          onClick={handleGenerateAiExplanation}
          className="mt-6 flex items-center gap-2 text-xs md:text-sm text-teal-400 hover:text-teal-300 transition-colors group underline underline-offset-4 decoration-teal-500/40"
        >
          <Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span>Generate Socratic AI Explanation</span>
        </button>
      </div>

      {/* AI Explanation Dialog */}
      <Dialog
        open={aiModalOpen}
        onOpenChange={setAiModalOpen}
        title="Socratic Pythagorean Intuition"
        description="Everyday analogy to make the theorem crystal clear."
      >
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-teal-500/30 text-sm text-slate-200 leading-relaxed space-y-3">
          {aiLoading ? (
            <div className="flex items-center justify-center py-6 gap-2 text-slate-400">
              <span className="w-4 h-4 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
              <span>Generating intuitive real-world explanation...</span>
            </div>
          ) : (
            <MarkdownRenderer content={aiExplanation} />
          )}
        </div>
      </Dialog>
    </div>
  );
}
