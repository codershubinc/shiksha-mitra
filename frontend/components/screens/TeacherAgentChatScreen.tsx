"use client";
"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Slider } from '../ui/slider';
import { MarkdownRenderer } from '../ui/MarkdownRenderer';
import {
  Send,
  Volume2,
  VolumeX,
  Sparkles,
  ArrowLeft,
  RotateCcw,
  BookOpen,
  CheckCircle2,
  Copy,
  Check,
  Radio,
  Sliders,
  Square,
  Play,
  Flame,
  HelpCircle,
  Calculator,
  FlaskConical,
  Atom,
  Code,
  Menu,
  MessageSquare,
  Plus,
  Trash2,
} from 'lucide-react';
import { api, streamTeacherChatMessage } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
  playTeacherSpeech,
  stopTeacherSpeech,
  testTeacherVoice,
  loadVoices,
  playAudibleChime,
  unlockAudioContext,
} from '@/lib/speech';

interface Message {
  id: string;
  sender: 'user' | 'teacher';
  text: string;
  timestamp: string;
}

interface ChatSession {
  id: string;
  subject: string;
  messages: Message[];
  updatedAt: number;
}

interface TeacherAgentChatScreenProps {
  onNavigate: (screen: any) => void;
}

const STORAGE_KEY = 'shiksha_mitra_sessions_v1';

const defaultWelcomeMessage: Message = {
  id: 'msg-default-1',
  sender: 'teacher',
  text: `I am Anita Ma'am, your personal AI Teacher and mentor.

Whether you're stuck on an algebra equation like **$2x^2 + 5x = 0$**, curious about a science lab experiment, or reviewing your programming doubts, I will guide you step-by-step to find the answer.

What concept or problem would you like to explore together right now? Click **Listen to Ma'am** anytime to hear me explain aloud!`,
  timestamp: 'Just now',
};

const subjects = [
  { id: 'Mathematics', label: 'Mathematics', icon: Calculator },
  { id: 'Science & Chemistry', label: 'Science & Chemistry', icon: FlaskConical },
  { id: 'Physics & Motion', label: 'Physics', icon: Atom },
  { id: 'Programming', label: 'Programming', icon: Code },
  { id: 'General Doubts', label: 'General Doubts', icon: HelpCircle },
];

export function TeacherAgentChatScreen({ onNavigate }: TeacherAgentChatScreenProps) {
  const { user, updateUserXp } = useAuth();

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSessions(parsed);
        }
      }
    } catch (e) { }
    setIsLoaded(true);
  }, []);

  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeSession = sessions.find((s) => s.id === activeSessionId);
  const messages = activeSession ? activeSession.messages : [];

  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('Mathematics');
  const [selectedLanguage, setSelectedLanguage] = useState<'English' | 'Hindi' | 'Hinglish'>('English');
  const [autoSpeak, setAutoSpeak] = useState(true);

  // Audio / Speech state
  const [isSpeakingId, setIsSpeakingId] = useState<string | null>(null);
  const [currentSpokenSentence, setCurrentSpokenSentence] = useState<string>('');
  const [sentenceProgress, setSentenceProgress] = useState<{ index: number; total: number }>({
    index: 0,
    total: 0,
  });
  const [speechRate, setSpeechRate] = useState<number>(0.95);
  const [speechVolume, setSpeechVolume] = useState<number>(1.0);
  const [voiceSettingsOpen, setVoiceSettingsOpen] = useState(false);
  const [isTestingVoice, setIsTestingVoice] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (e) { }
  }, [sessions, isLoaded]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, activeSessionId]);

  useEffect(() => {
    loadVoices();
    return () => {
      stopTeacherSpeech();
    };
  }, []);

  const quickPromptsBySubject: Record<string, string[]> = {
    Mathematics: [
      'How do I solve 2x² + 5x = 0 step-by-step?',
      'Explain the Pythagorean theorem with a real-life triangle example',
      'How do I divide 456 by 12 without getting confused?',
      'What is the formula for the surface area of a cylinder?',
    ],
    'Science & Chemistry': [
      'Why does Zinc react with dilute HCl to produce hydrogen gas bubbles?',
      'What is the difference between physical and chemical changes?',
      'Why does copper turn green when exposed to moist air?',
      'How does litmus paper test acids versus bases?',
    ],
    'Physics & Motion': [
      'What is the difference between speed and velocity?',
      'Can you explain Newton’s 1st Law of Motion with an example?',
      'Why does friction produce heat?',
      'How does atmospheric pressure change at higher altitudes?',
    ],
    Programming: [
      'What is the difference between a list and a dictionary in Python?',
      'How do I write a for loop to count from 1 to 10?',
      'Can you explain what a function is with a simple example?',
      'Why am I getting a syntax error in my code?',
    ],
    'General Doubts': [
      'I have an exam tomorrow, how should I revise key formulas?',
      'How do I overcome silly calculation mistakes in algebra?',
      'Can you quiz me with 3 quick science questions?',
      'Help me create a 30-minute daily study plan',
    ],
  };

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText.trim();
    if (!text || loading) return;

    unlockAudioContext();
    handleStopSpeech();

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    let targetSessionId = activeSessionId;
    const historyPayload = messages.map((m) => ({ sender: m.sender, text: m.text }));

    if (!targetSessionId) {
      targetSessionId = `session-${Date.now()}`;
    }

    setSessions((prev) => {
      if (activeSessionId === null) {
        const newSession: ChatSession = {
          id: targetSessionId!,
          subject: selectedSubject,
          messages: [userMsg],
          updatedAt: Date.now(),
        };
        return [newSession, ...prev];
      } else {
        return prev.map((s) => {
          if (s.id === targetSessionId) {
            return { ...s, messages: [...s.messages, userMsg], updatedAt: Date.now() };
          }
          return s;
        });
      }
    });

    if (!activeSessionId) {
      setActiveSessionId(targetSessionId);
    }

    setInputText('');
    setLoading(true);

    try {
      const teacherMsgId = `tch-${Date.now()}`;
      const teacherMsg: Message = {
        id: teacherMsgId,
        sender: 'teacher',
        text: '',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === targetSessionId) {
            return { ...s, messages: [...s.messages, teacherMsg] };
          }
          return s;
        })
      );
      setLoading(false);

      const stream = streamTeacherChatMessage({
        message: text,
        history: historyPayload,
        subject: selectedSubject,
        language: selectedLanguage,
      });

      let accumulatedText = '';
      for await (const chunk of stream) {
        accumulatedText += chunk;
        setSessions((prev) =>
          prev.map((s) => {
            if (s.id === targetSessionId) {
              const updatedMessages = s.messages.map((m) =>
                m.id === teacherMsgId ? { ...m, text: accumulatedText } : m
              );
              return { ...s, messages: updatedMessages, updatedAt: Date.now() };
            }
            return s;
          })
        );
      }

      updateUserXp(5);

      if (autoSpeak) {
        handleSpeakMessage(accumulatedText, teacherMsgId);
      }
    } catch (err: any) {
      setLoading(false);
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        sender: 'teacher',
        text: err?.message || 'Failed to get teacher response.',
        timestamp: 'Just now',
      };
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === targetSessionId) {
            return { ...s, messages: [...s.messages, errorMsg] };
          }
          return s;
        })
      );
      if (autoSpeak) {
        handleSpeakMessage(errorMsg.text, errorMsg.id);
      }
    }
  };

  const handleDeleteChat = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (activeSessionId === id) {
      setActiveSessionId(null);
      handleStopSpeech();
    }
  };

  const handleNewChat = () => {
    handleStopSpeech();
    setActiveSessionId(null);
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  const handleSubjectClick = (subId: string) => {
    setSelectedSubject(subId);
    handleNewChat();
  };

  const handleSpeakMessage = (text: string, id: string) => {
    if (isSpeakingId === id) {
      handleStopSpeech();
      return;
    }

    handleStopSpeech();
    setIsSpeakingId(id);

    playTeacherSpeech(text, {
      language: selectedLanguage,
      rate: speechRate,
      volume: speechVolume,
      onStart: () => {
        setIsSpeakingId(id);
      },
      onSentenceStart: (sentence: string, index: number, total: number) => {
        setCurrentSpokenSentence(sentence);
        setSentenceProgress({ index: index + 1, total });
      },
      onEnd: () => {
        setIsSpeakingId(null);
        setCurrentSpokenSentence('');
      },
      onError: () => {
        setIsSpeakingId(null);
        setCurrentSpokenSentence('');
      },
    });
  };

  const handleStopSpeech = () => {
    stopTeacherSpeech();
    setIsSpeakingId(null);
    setCurrentSpokenSentence('');
    setIsTestingVoice(false);
  };

  const handleRunVoiceTest = () => {
    setIsTestingVoice(true);
    playAudibleChime('start');
    testTeacherVoice(() => {
      setIsTestingVoice(false);
    });
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const activePrompts = quickPromptsBySubject[selectedSubject] || quickPromptsBySubject['Mathematics'];
  const displayMessages = messages.length > 0 ? messages : [defaultWelcomeMessage];

  return (
    <div className="h-dvh w-full flex flex-col bg-slate-900 overflow-hidden select-none" suppressHydrationWarning>
      {/* Full-Screen Sleek Top Header */}
      <header className="shrink-0 h-16 border-b border-white/10 bg-slate-950/90 backdrop-blur-2xl px-3 sm:px-6 flex items-center justify-between z-30 shadow-lg">
        {/* Left: Menu, Back & Teacher Profile */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              handleStopSpeech();
              onNavigate('/');
            }}
            className="text-slate-300 hover:text-white hover:bg-white/10 gap-1.5 px-2.5 h-9 rounded-xl cursor-pointer"
            title="Return to Student Hub"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-semibold hidden md:inline">Dashboard</span>
          </Button>

          <div className="h-6 w-px bg-white/10 hidden sm:block" />

          {/* Anita Ma'am Identity */}
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuArQo7uLrplNf5RxigElyfquxORgDVwRiffuHJLlp8TO0VBqan1Pd2RJ0ZM5dhdFpN_me1a7GTtlyN_0jXgZ34yw8j8M30zHK1PlUlR2LgCG1AODsYRBaUp9E9n1aMGByMRuNPigKPjhw9T--SYAjFwKaPOkNzt6KlG7BipfkvCL4hFtcNQiIOFFOHq1frIxTXoHhyRnHxTzfnBxMBQeeT1qB-Gb9EoYA0u-301NUCrmI-bRFqS9erg"
                alt="Anita Ma'am"
                className="w-10 h-10 rounded-2xl object-cover border border-amber-500/50 shadow-md ring-2 ring-amber-500/20"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center">
                <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
              </span>
            </div>

            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <h1 className="font-headline text-sm sm:text-base font-bold text-white tracking-tight">
                  Anita Ma'am
                </h1>
                <Badge variant="saffron" className="text-[10px] py-0 px-2 font-semibold hidden xs:inline-flex">
                  AI Teacher
                </Badge>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5 leading-none mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                <span>Active 1-on-1 Mentor</span>
                <span className="hidden md:inline">· Class 8</span>
              </p>
            </div>
          </div>
        </div>

        {/* Center: Subject Selection Pills (hidden on mobile, visible on tablet+) */}
        <div className="hidden lg:flex items-center gap-1 p-1 rounded-2xl bg-slate-900/80 border border-white/5">
          {subjects.map((sub) => {
            const Icon = sub.icon;
            const isSelected = selectedSubject === sub.id;
            return (
              <button
                key={sub.id}
                onClick={() => handleSubjectClick(sub.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${isSelected
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{sub.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Audio Settings, Language, New Chat */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Language Toggle */}
          <div className="flex rounded-xl bg-slate-900 border border-white/10 p-0.5 text-xs">
            {(['English', 'Hindi', 'Hinglish'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setSelectedLanguage(lang)}
                className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${selectedLanguage === lang
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                  }`}
              >
                {lang}
              </button>
            ))}
          </div>

          {/* Voice Controls Popover Toggle */}
          <button
            onClick={() => setVoiceSettingsOpen(!voiceSettingsOpen)}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${voiceSettingsOpen || isSpeakingId
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md shadow-amber-950/40'
                : 'bg-slate-900 text-slate-300 border-white/10 hover:border-amber-500/40 hover:text-white'
              }`}
            title="Voice Speed & Audio Settings"
          >
            {isSpeakingId ? (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span className="hidden sm:inline">Voice</span>
          </button>

          {/* New Chat */}
          <button
            onClick={handleNewChat}
            className="p-2 sm:px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
            title="Start New Conversation"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline text-xs">New Chat</span>
          </button>
        </div>
      </header>

      {/* Voice Settings Flyout Drawer */}
      {voiceSettingsOpen && (
        <div className="shrink-0 bg-slate-900/95 backdrop-blur-2xl border-b border-white/10 px-4 py-3 z-20 animate-in slide-in-from-top-2">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-slate-200">Teacher Voice Preferences</span>
              <span className="text-[11px] text-slate-400 hidden sm:inline">· Adjust speed and volume to suit your study pace</span>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {/* Volume Slider */}
              <div className="flex items-center gap-2 min-w-[130px]">
                <Volume2 className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px] text-slate-400">Volume:</span>
                <Slider
                  min={0.1}
                  max={1.0}
                  step={0.1}
                  value={speechVolume}
                  onValueChange={(val) => setSpeechVolume(val)}
                  label="Speech Volume"
                  className="w-20"
                />
                <span className="text-[11px] font-mono text-amber-400">
                  {Math.round(speechVolume * 100)}%
                </span>
              </div>

              {/* Speed Buttons */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-white/10 text-xs">
                <span className="text-[10px] text-slate-400 px-1 font-medium">Speed:</span>
                {[0.8, 0.95, 1.15].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => setSpeechRate(rate)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer ${speechRate === rate
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'text-slate-400 hover:text-white'
                      }`}
                  >
                    {rate === 0.95 ? 'Normal' : `${rate}x`}
                  </button>
                ))}
              </div>

              {/* Test Audio Button */}
              <Button
                size="sm"
                variant="outline"
                onClick={handleRunVoiceTest}
                disabled={isTestingVoice}
                className="text-xs gap-1.5 h-7"
              >
                <Play className="w-3 h-3 text-emerald-400 fill-emerald-400" />
                <span>{isTestingVoice ? 'Playing...' : 'Test Voice'}</span>
              </Button>

              {/* Close flyout */}
              <button
                onClick={() => setVoiceSettingsOpen(false)}
                className="text-xs text-slate-400 hover:text-white font-medium px-2 py-1"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Layout with Sidebar */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar Overlay for Mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar for Chat History */}
        <aside
          className={`absolute lg:static top-0 bottom-0 left-0 w-72 bg-slate-950 border-r border-white/10 z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
            }`}
        >
          <div className="p-4 flex items-center justify-between border-b border-white/10">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-400" />
              Chat History
            </h2>
            <button
              onClick={handleNewChat}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-amber-400 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {sessions.map((s) => (
              <div
                key={s.id}
                onClick={() => {
                  setActiveSessionId(s.id);
                  setSelectedSubject(s.subject);
                  if (window.innerWidth < 1024) setSidebarOpen(false);
                }}
                className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer relative group ${
                  activeSessionId === s.id
                    ? 'bg-amber-500/10 border border-amber-500/20 text-amber-300 shadow-sm'
                    : 'bg-transparent hover:bg-white/5 text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold truncate pr-6">{s.subject}</span>
                  <span className="text-[9px] opacity-60">
                    {new Date(s.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <div className="text-[11px] opacity-70 truncate pr-6">
                  {s.messages[s.messages.length - 1]?.text || 'Empty Chat'}
                </div>
                <button
                  onClick={(e) => handleDeleteChat(e, s.id)}
                  className="absolute right-2 top-1.5 p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                  title="Delete Chat"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {sessions.length === 0 && (
              <div className="text-center p-4 text-xs text-slate-500 mt-4">
                No recent sessions found. Click the + button to start a new chat.
              </div>
            )}
          </div>
        </aside>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-900">
          {/* Subject Filter Bar for Mobile/Tablet */}
          {!activeSessionId && (
            <div className="lg:hidden shrink-0 flex items-center gap-1.5 px-3 py-2 bg-slate-950/60 border-b border-white/5 overflow-x-auto no-scrollbar">
              {subjects.map((sub) => {
                const Icon = sub.icon;
                const isSelected = selectedSubject === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => handleSubjectClick(sub.id)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${isSelected
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'text-slate-400 hover:text-slate-200 bg-slate-900/60 border border-white/5'
                      }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{sub.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Main Chat Scroll Container - Fills Viewport */}
          <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 space-y-4 max-w-4xl mx-auto w-full select-text">
            {/* Suggestion Starter Cards if chat is fresh */}
            {(!activeSessionId || messages.length === 0) && (
              <div className="mb-4 p-4 rounded-3xl bg-gradient-to-b from-amber-500/10 via-slate-900/60 to-slate-900/40 border border-amber-500/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                    <Sparkles className="w-4 h-4" />
                    <span>Explore with Anita Ma'am ({selectedSubject})</span>
                  </div>
                  <span className="text-[11px] text-slate-400">Tap any question to ask</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activePrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(prompt)}
                      className="p-3 rounded-2xl bg-slate-950/80 hover:bg-slate-800/80 border border-white/10 hover:border-amber-500/40 text-left text-xs text-slate-300 hover:text-white transition-all flex items-center justify-between group cursor-pointer shadow-sm"
                    >
                      <span className="pr-2 leading-relaxed">{prompt}</span>
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 opacity-60 group-hover:opacity-100 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Message Stream */}
            {displayMessages.map((msg) => {
              const isTeacher = msg.sender === 'teacher';
              const isCurrentlySpeakingThis = isSpeakingId === msg.id;

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${isTeacher ? 'justify-start' : 'justify-end'}`}
                >
                  {isTeacher && (
                    <div className="w-9 h-9 rounded-2xl overflow-hidden border border-amber-500/40 shrink-0 shadow-md mt-1">
                      <img
                        src="/placeholder-avatar.png"
                        alt="Anita Ma'am"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            'https://lh3.googleusercontent.com/aida-public/AB6AXuArQo7uLrplNf5RxigElyfquxORgDVwRiffuHJLlp8TO0VBqan1Pd2RJ0ZM5dhdFpN_me1a7GTtlyN_0jXgZ34yw8j8M30zHK1PlUlR2LgCG1AODsYRBaUp9E9n1aMGByMRuNPigKPjhw9T--SYAjFwKaPOkNzt6KlG7BipfkvCL4hFtcNQiIOFFOHq1frIxTXoHhyRnHxTzfnBxMBQeeT1qB-Gb9EoYA0u-301NUCrmI-bRFqS9erg';
                        }}
                      />
                    </div>
                  )}

                  <div
                    className={`max-w-[92%] sm:max-w-[85%] md:max-w-[78%] rounded-3xl p-4 sm:p-5 shadow-xl text-sm leading-relaxed relative group transition-all ${isTeacher
                        ? isCurrentlySpeakingThis
                          ? 'bg-slate-900/95 border border-amber-500/50 text-slate-100 rounded-tl-sm ring-1 ring-amber-500/40 shadow-[0_0_25px_rgba(245,158,11,0.15)]'
                          : 'bg-slate-900/80 border border-white/10 text-slate-100 rounded-tl-sm backdrop-blur-md'
                        : 'bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-tr-sm shadow-md shadow-orange-950/40'
                      }`}
                  >
                    {/* Content */}
                    <MarkdownRenderer content={msg.text} />

                    {/* Footer Toolbar */}
                    <div
                      className={`mt-3 pt-2.5 flex items-center justify-between text-[11px] border-t ${isTeacher ? 'border-white/10 text-slate-400' : 'border-white/20 text-amber-100'
                        }`}
                    >
                      <span className="tabular-nums font-mono text-[10px]">{msg.timestamp}</span>

                      {isTeacher && (
                        <div className="flex items-center gap-2">
                          {/* Copy */}
                          <button
                            onClick={() => handleCopy(msg.id, msg.text)}
                            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                            title="Copy text"
                          >
                            {copiedId === msg.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* Listen button */}
                          <button
                            onClick={() => handleSpeakMessage(msg.text, msg.id)}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${isCurrentlySpeakingThis
                                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-950/50 ring-2 ring-amber-400'
                                : 'bg-white/10 hover:bg-white/20 text-slate-200 hover:text-amber-300'
                              }`}
                            title={isCurrentlySpeakingThis ? 'Pause / Stop speaking' : 'Read aloud with AI teacher voice'}
                          >
                            {isCurrentlySpeakingThis ? (
                              <>
                                <div className="flex items-center gap-0.5 h-3">
                                  <span className="w-0.5 h-3 bg-slate-950 animate-[pulse_0.4s_infinite]" />
                                  <span className="w-0.5 h-2 bg-slate-950 animate-[pulse_0.6s_infinite]" />
                                  <span className="w-0.5 h-3.5 bg-slate-950 animate-[pulse_0.5s_infinite]" />
                                </div>
                                <span>Speaking...</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                                <span>Listen to Ma'am</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex items-start gap-3 justify-start animate-in fade-in">
                <div className="w-9 h-9 rounded-2xl overflow-hidden border border-amber-500/40 shrink-0 shadow-md mt-1">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuArQo7uLrplNf5RxigElyfquxORgDVwRiffuHJLlp8TO0VBqan1Pd2RJ0ZM5dhdFpN_me1a7GTtlyN_0jXgZ34yw8j8M30zHK1PlUlR2LgCG1AODsYRBaUp9E9n1aMGByMRuNPigKPjhw9T--SYAjFwKaPOkNzt6KlG7BipfkvCL4hFtcNQiIOFFOHq1frIxTXoHhyRnHxTzfnBxMBQeeT1qB-Gb9EoYA0u-301NUCrmI-bRFqS9erg"
                    alt="Anita Ma'am"
                    className="w-full h-full object-cover animate-pulse"
                  />
                </div>
                <div className="p-4 rounded-3xl bg-slate-900/80 border border-white/10 rounded-tl-sm flex items-center gap-3 text-xs text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                  <span>Anita Ma'am is preparing your step-by-step guidance...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Floating Active Speech Player Status Bar (when audio is active) */}
          {isSpeakingId && (
            <div className="shrink-0 px-3 sm:px-6 z-20 mb-2 relative">
              <div className="max-w-4xl mx-auto p-2.5 rounded-2xl bg-gradient-to-r from-amber-950/90 via-slate-900/90 to-slate-900/90 border border-amber-500/40 shadow-xl flex items-center justify-between gap-3 animate-in slide-in-from-bottom-2">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="w-7 h-7 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0 border border-amber-500/30">
                    <Volume2 className="w-4 h-4 text-amber-400 animate-pulse" />
                  </div>
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-amber-300">Anita Ma'am is Explaining</span>
                      {sentenceProgress.total > 0 && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          Part {sentenceProgress.index} of {sentenceProgress.total}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-300 truncate italic">
                      "{currentSpokenSentence || 'Speaking educational guidance...'}"
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleStopSpeech}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/80 border border-white/10 hover:border-rose-500/40 text-slate-200 hover:text-rose-300 text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                >
                  <Square className="w-3 h-3 fill-current" />
                  <span className="hidden sm:inline">Stop Audio</span>
                </button>
              </div>
            </div>
          )}

          {/* Docked Prompt Input Bar */}
          <footer className="shrink-0 border-t border-white/10 bg-slate-950/95 backdrop-blur-2xl p-3 sm:p-4 z-30">
            <div className="max-w-4xl mx-auto w-full">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <div className="relative flex-1">
                  <Input
                    ref={inputRef}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={`Ask Anita Ma'am anything in ${selectedSubject}... (e.g. 2x² + 5x = 0, zinc + HCl)`}
                    disabled={loading}
                    className="pr-10 text-xs sm:text-sm py-3 bg-slate-900/90 border-white/10 focus:border-amber-500/50 rounded-2xl"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  glow
                  disabled={!inputText.trim() || loading}
                  className="px-5 shrink-0 h-11 rounded-2xl cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Ask Ma'am</span>
                </Button>
              </form>

              {/* Student reassurance sub-row - completely free of tech jargon */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1">
                <span className="flex items-center gap-1 text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                  <span className="hidden sm:inline">Socratic step-by-step guidance · Ask as many questions as you like</span>
                  <span className="sm:hidden">Step-by-step guidance</span>
                </span>
                <span className="flex items-center gap-1 text-amber-400 font-semibold">
                  <Flame className="w-3.5 h-3.5" /> +5 XP
                </span>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
