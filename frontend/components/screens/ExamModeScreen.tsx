"use client";

import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, BookOpen, AlertTriangle, Lightbulb, Hexagon, Fingerprint, Lock, 
  ChevronRight, BrainCircuit, XCircle, CheckCircle2, ChevronRightSquare, ShieldCheck, 
  ZoomIn, Activity, Calculator, Beaker, Globe, Atom, BookMarked, Brain, Orbit 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

const mockSubjects = [
  {
    id: 'sci',
    name: 'Science & Cosmos',
    code: 'SCI-801',
    icon: Atom,
    color: 'from-blue-500 to-indigo-600',
    totalQuestions: 15,
    durationMinutes: 15,
    completedPercent: 0,
  },
  {
    id: 'math',
    name: 'Advanced Mathematics',
    code: 'MTH-802',
    icon: Calculator,
    color: 'from-emerald-500 to-teal-600',
    totalQuestions: 20,
    durationMinutes: 20,
    completedPercent: 0,
  },
  {
    id: 'hist',
    name: 'World History',
    code: 'HST-803',
    icon: Globe,
    color: 'from-amber-500 to-orange-600',
    totalQuestions: 10,
    durationMinutes: 10,
    completedPercent: 0,
  }
];

interface ExamModeScreenProps {
  onNavigate: (screen: any) => void;
}

export function ExamModeScreen({ onNavigate }: ExamModeScreenProps) {
  const { user, updateUserXp } = useAuth();
  
  const [subjects, setSubjects] = useState(mockSubjects);
  
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(mockSubjects[0].id);
  const [isSelectingSubject, setIsSelectingSubject] = useState<boolean>(true);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  
  const [quizData, setQuizData] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  
  const [markedForReview, setMarkedForReview] = useState<{ [key: number]: boolean }>({});
  const [hintModalOpen, setHintModalOpen] = useState<boolean>(false);
  const [hintLoading, setHintLoading] = useState<boolean>(false);
  const [hintText, setHintText] = useState<string>('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [examResult, setExamResult] = useState<any>(null);

  useEffect(() => {
    // Fetch actual quiz counts from backend
    api.getAllQuizzes().then((remoteQuizzes: any[]) => {
      setSubjects(prev => prev.map(sub => {
        const remote = remoteQuizzes.find(rq => rq.id === sub.id);
        if (remote) {
          return {
            ...sub,
            totalQuestions: remote.totalQuestions,
            durationMinutes: remote.durationMinutes,
          };
        }
        return sub;
      }));
    }).catch(console.error);
  }, []);

  const currentSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];

  useEffect(() => {
    let interval: any;
    if (!isSelectingSubject && !examResult && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            handleSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSelectingSubject, secondsRemaining, examResult]);

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const loadQuiz = async (subjectId: string) => {
    try {
      const data = await api.getQuiz(subjectId);
      setQuizData(data);
      setSecondsRemaining(data.durationMinutes * 60);
    } catch (e) {
      console.error(e);
      // fallback to some defaults if failed
    }
  };

  const handleStartExam = async (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    if (subject) {
      setSelectedSubjectId(subjectId);
      setIsSelectingSubject(false);
      setExamResult(null);
      setCurrentQuestionIndex(0);
      setAnswers({});
      setMarkedForReview({});
      setHintText('');
      await loadQuiz(subjectId);
    }
  };

  const handleSelectOption = (option: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestionIndex]: option }));
  };

  const handleToggleReview = () => {
    setMarkedForReview(prev => ({
      ...prev,
      [currentQuestionIndex]: !prev[currentQuestionIndex]
    }));
  };

  const handleNext = () => {
    if (quizData && currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex(curr => curr + 1);
      setHintText('');
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(curr => curr - 1);
      setHintText('');
    }
  };

  const handleSubmitExam = async () => {
    if (!quizData || isSubmitting) return;
    setIsSubmitting(true);
    
    const formattedAnswers = Object.keys(answers).map(key => ({
      questionIndex: parseInt(key, 10),
      selectedOption: answers[parseInt(key, 10)]
    }));

    try {
      const result = await api.submitQuizAttempt(selectedSubjectId, formattedAnswers);
      setExamResult(result);
      if (user) {
        // Add XP based on score
        updateUserXp(result.score * 50);
      }
    } catch (e) {
      console.error('Failed to submit exam', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAskHint = async () => {
    if (user) updateUserXp(-10);
    setHintModalOpen(true);
    if (!hintText && quizData) {
      setHintLoading(true);
      try {
        const currentQ = quizData.questions[currentQuestionIndex];
        const res = await api.getSocraticHint({
          question: currentQ.questionText,
        });
        setHintText(res.hint || "Think about the key concepts mentioned in the question.");
      } catch (e) {
        setHintText("Think about the key concepts mentioned in the question.");
      } finally {
        setHintLoading(false);
      }
    }
  };

  if (isSelectingSubject) {
    return (
      <div className="flex flex-col py-6 px-4 md:px-8 max-w-6xl mx-auto w-full min-h-screen">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-headline text-2xl md:text-3xl font-bold text-white mb-2">
              Mock Examinations
            </h1>
            <p className="text-sm md:text-base text-slate-400">
              Select a topic to start your timed, focus-locked mock exam.
            </p>
          </div>
          <Button variant="outline" size="md" className="gap-2" onClick={() => onNavigate('dashboard')}>
            <ChevronLeft className="w-4 h-4" /> Dashboard
          </Button>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {subjects.map((sub) => {
            const IconComponent = sub.icon;
            return (
              <Card
                key={sub.id}
                onClick={() => handleStartExam(sub.id)}
                className="glass-card p-5 border-white/10 hover:border-amber-500/50 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)] transition-all duration-300 cursor-pointer group flex flex-col h-full"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-tr ${sub.color} text-white shadow-lg group-hover:scale-110 transition-transform`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/5 text-slate-300 uppercase tracking-wider font-mono">
                    {sub.code}
                  </span>
                </div>

                <h3 className="font-headline text-lg font-bold text-white mb-1 group-hover:text-amber-300 transition-colors">
                  {sub.name}
                </h3>
                
                <div className="flex items-center gap-4 text-xs font-medium text-slate-400 mb-6">
                  <span className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" /> {sub.totalQuestions} Questions</span>
                  <span className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5" /> {sub.durationMinutes} mins</span>
                </div>

                <div className="mt-auto">
                  <div className="flex justify-between text-xs font-medium text-slate-300 mb-2">
                    <span>Mastery Progress</span>
                    <span className="text-amber-400">{sub.completedPercent}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500" style={{ width: `${sub.completedPercent}%` }} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  if (examResult) {
    return (
      <div className="flex flex-col py-10 px-4 max-w-2xl mx-auto w-full items-center text-center">
        <CheckCircle2 className="w-20 h-20 text-emerald-400 mb-6" />
        <h2 className="text-3xl font-bold text-white mb-2">Exam Completed!</h2>
        <p className="text-slate-300 mb-8">You scored {examResult.score} out of {examResult.totalQuestions}.</p>
        
        <div className="flex gap-4">
          <Button variant="primary" onClick={() => onNavigate('post-scan-growth')}>
            View Detailed Analysis
          </Button>
          <Button variant="outline" onClick={() => setIsSelectingSubject(true)}>
            Back to Subjects
          </Button>
        </div>
      </div>
    );
  }

  if (!quizData) {
    return (
      <div className="flex items-center justify-center min-h-screen text-slate-300">
        Loading exam data...
      </div>
    );
  }

  const currentQuestion = quizData.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quizData.questions.length - 1;

  return (
    <div className="flex flex-col py-4 px-4 max-w-4xl mx-auto w-full">
      {/* Top Locked Exam Header */}
      <div className="sticky top-0 z-40 w-full bg-slate-950/90 backdrop-blur-xl border-b border-white/10 px-4 md:px-8 py-3 flex justify-between items-center h-16 shadow-lg mb-6 rounded-2xl">
        <div className="flex items-center gap-2 bg-teal-500/10 border border-teal-500/30 px-3.5 py-1.5 rounded-full">
          <ShieldCheck className="w-4 h-4 text-teal-400" />
          <span className="text-teal-400 text-xs font-bold uppercase tracking-wider font-mono">
            Focus Lock Active
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-500 animate-pulse" />
            <span className="font-mono text-xl font-bold text-white tracking-wider">
              {formatTimer(secondsRemaining)}
            </span>
          </div>
          <Button variant="outline" size="sm" className="hidden sm:flex border-rose-500/30 text-rose-400 hover:bg-rose-500/10" onClick={() => setIsSelectingSubject(true)}>
            <XCircle className="w-4 h-4 mr-1.5" /> End Exam
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Exam Area */}
        <div className="flex-1">
          <Card className="glass-card p-6 md:p-8 border-white/10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-bl-full pointer-events-none" />
            
            <div className="flex justify-between items-start mb-6">
              <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-medium text-slate-300">
                Question {currentQuestionIndex + 1} of {quizData.questions.length}
              </span>
              <button 
                onClick={handleToggleReview}
                className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${markedForReview[currentQuestionIndex] ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-white/5 text-slate-400 border border-transparent hover:bg-white/10'}`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                {markedForReview[currentQuestionIndex] ? 'Marked for Review' : 'Mark for Review'}
              </button>
            </div>

            <div className="mb-8">
              <h2 className="text-xl md:text-2xl font-semibold text-white leading-relaxed font-headline">
                {currentQuestion.questionText}
              </h2>
            </div>

            <div className="space-y-3 mb-8">
              {currentQuestion.options.map((option: string, idx: number) => {
                const isSelected = answers[currentQuestionIndex] === option;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(option)}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center gap-4 ${
                      isSelected 
                        ? 'bg-amber-500/10 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.1)]' 
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      isSelected ? 'border-amber-500 bg-amber-500' : 'border-slate-500'
                    }`}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-slate-900" />}
                    </div>
                    <span className={`text-sm md:text-base ${isSelected ? 'text-amber-100 font-medium' : 'text-slate-300'}`}>
                      {option}
                    </span>
                  </button>
                );
              })}
            </div>
            
            <div className="flex items-center justify-between pt-6 border-t border-white/10">
              <Button 
                variant="outline" 
                onClick={handleAskHint}
                className="text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                Ask Mitra (Costs 10 XP)
              </Button>
              
              <div className="flex gap-3">
                <Button variant="outline" onClick={handlePrev} disabled={currentQuestionIndex === 0}>
                  Previous
                </Button>
                {isLastQuestion ? (
                  <Button variant="primary" onClick={handleSubmitExam} disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit Exam'}
                  </Button>
                ) : (
                  <Button variant="primary" onClick={handleNext}>
                    Next <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
        
        {/* Sidebar / Question Palette */}
        <div className="w-full lg:w-72 shrink-0">
          <Card className="glass-card p-5 border-white/10 h-full">
            <h3 className="font-headline font-semibold text-white mb-4 flex items-center gap-2">
              <Hexagon className="w-4 h-4 text-amber-500" /> Question Palette
            </h3>
            
            <div className="grid grid-cols-5 gap-2">
              {quizData.questions.map((_: any, idx: number) => {
                const isAnswered = !!answers[idx];
                const isMarked = markedForReview[idx];
                const isCurrent = currentQuestionIndex === idx;
                
                let bgClass = 'bg-white/5 text-slate-400 border-white/10';
                if (isCurrent) bgClass = 'bg-white/20 text-white border-white/40 shadow-inner';
                else if (isMarked) bgClass = 'bg-amber-500/20 text-amber-400 border-amber-500/30';
                else if (isAnswered) bgClass = 'bg-teal-500/20 text-teal-400 border-teal-500/30';
                
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentQuestionIndex(idx);
                      setHintText('');
                    }}
                    className={`w-full aspect-square rounded-lg flex items-center justify-center text-xs font-bold border transition-colors ${bgClass}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
            
            <div className="mt-8 space-y-3 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-teal-500/20 border border-teal-500/30" />
                Answered
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-amber-500/20 border border-amber-500/30" />
                Marked for Review
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-white/5 border border-white/10" />
                Unanswered
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Hint Modal Overlay */}
      {hintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <Card className="glass-card max-w-md w-full p-6 border-amber-500/30 shadow-[0_0_50px_rgba(245,158,11,0.15)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-bl-full pointer-events-none" />
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 p-[2px]">
                  <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center">
                    <BrainCircuit className="w-5 h-5 text-amber-400" />
                  </div>
                </div>
                <div>
                  <h3 className="font-headline font-bold text-white">Shiksha Mitra</h3>
                  <p className="text-xs text-amber-400/80">Socratic Guide</p>
                </div>
              </div>
              <button 
                onClick={() => setHintModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5 relative z-10 min-h-[100px] flex items-center">
              {hintLoading ? (
                <div className="flex items-center gap-3 text-slate-400">
                  <div className="w-4 h-4 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                  Analyzing the question context...
                </div>
              ) : (
                <p className="text-sm text-slate-300 leading-relaxed">
                  {hintText}
                </p>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
