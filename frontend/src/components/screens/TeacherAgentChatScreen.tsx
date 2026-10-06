import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Slider } from '../ui/slider';
import { MarkdownRenderer } from '../ui/MarkdownRenderer';
import {
  Send,
  Volume2,
  VolumeX,
  Volume1,
  Sparkles,
  ArrowLeft,
  RotateCcw,
  BookOpen,
  GraduationCap,
  MessageCircle,
  CheckCircle2,
  Languages,
  Save,
  Trash2,
  Settings2,
  Square,
  Play,
  Flame,
  Radio,
  Sliders,
} from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import {
  playTeacherSpeech,
  stopTeacherSpeech,
  testTeacherVoice,
  getAllVoices,
  loadVoices,
  playAudibleChime,
} from '../../lib/speech';

interface Message {
  id: string;
  sender: 'user' | 'teacher';
  text: string;
  timestamp: string;
}

interface TeacherAgentChatScreenProps {
  onNavigate: (screen: any) => void;
}

const STORAGE_KEY = 'shiksha_mitra_teacher_chat_history_v1';

const defaultWelcomeMessage: Message = {
  id: 'msg-default-1',
  sender: 'teacher',
  text: `Namaste beta! I am Anita Ma'am, your AI Teacher and Socratic Mentor. 

Whether you're stuck on a math equation like **$2x^2 + 5x = 0$**, curious about a science lab experiment, or reviewing exam doubts, I am here to guide you step-by-step. 

What would you like to explore together today? Click the **Listen to Ma'am** button anytime to hear me explain aloud!`,
  timestamp: 'Just now',
};

export function TeacherAgentChatScreen({ onNavigate }: TeacherAgentChatScreenProps) {
  const { user, updateUserXp } = useAuth();

  // Load initial messages from localStorage
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not retrieve chat from local storage:', e);
    }
    return [defaultWelcomeMessage];
  });

  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('Science & Math');
  const [selectedLanguage, setSelectedLanguage] = useState<'English' | 'Hindi' | 'Hinglish'>('English');

  // Speech & Audio state
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
  const [showSavedToast, setShowSavedToast] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      setShowSavedToast(true);
      const timer = setTimeout(() => setShowSavedToast(false), 2000);
      return () => clearTimeout(timer);
    } catch (e) {
      console.warn('Could not save chat to local storage:', e);
    }
  }, [messages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Clean up speech when unmounting
  useEffect(() => {
    loadVoices();
    return () => {
      stopTeacherSpeech();
    };
  }, []);

  const quickPrompts = [
    'Why does Zinc react with dilute HCl to produce bubbles?',
    'How do I solve 2x² + 5x = 0 step-by-step?',
    'Explain the Pythagorean theorem with a real-life example',
    'How do I divide 456 by 12 without getting confused?',
  ];

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText.trim();
    if (!text || loading) return;

    // Stop previous speech if any
    handleStopSpeech();

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const historyPayload = messages.map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      const res = await api.sendTeacherChatMessage({
        message: text,
        history: historyPayload,
        subject: selectedSubject,
        language: selectedLanguage,
      });

      const teacherMsg: Message = {
        id: `tch-${Date.now()}`,
        sender: 'teacher',
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, teacherMsg]);
      updateUserXp(5); // Reward 5 XP

      // Auto-trigger audible speech for teacher reply
      handleSpeakMessage(teacherMsg.text, teacherMsg.id);
    } catch (err: any) {
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        sender: 'teacher',
        text:
          "Beta, I had a brief connection pause. But remember: in **$2x^2 + 5x = 0$**, both terms share '$x$', so we factor out $x$ to get **$x(2x + 5) = 0$**! What do you think $x$ equals next?",
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, errorMsg]);
      handleSpeakMessage(errorMsg.text, errorMsg.id);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    handleStopSpeech();
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
    setMessages([
      {
        id: `msg-reset-${Date.now()}`,
        sender: 'teacher',
        text: "New conversation started! Chat history has been reset. What topic or homework problem can I guide you on today, beta?",
        timestamp: 'Just now',
      },
    ]);
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
      onSentenceStart: (sentence, index, total) => {
        setCurrentSpokenSentence(sentence);
        setSentenceProgress({ index: index + 1, total });
      },
      onEnd: () => {
        setIsSpeakingId(null);
        setCurrentSpokenSentence('');
      },
      onError: (err) => {
        console.warn('Speech playback notification:', err);
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

  return (
    <div className="flex flex-col h-[calc(100dvh-12.5rem)] lg:h-[calc(100dvh-7.5rem)] max-w-4xl mx-auto w-full px-3 sm:px-4">
      {/* Top Header Card */}
      <header className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-white/10 mb-3 shadow-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('dashboard')}
            className="w-9 h-9 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700 transition-colors shrink-0 cursor-pointer"
            title="Back to Student Hub"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="relative shrink-0">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuArQo7uLrplNf5RxigElyfquxORgDVwRiffuHJLlp8TO0VBqan1Pd2RJ0ZM5dhdFpN_me1a7GTtlyN_0jXgZ34yw8j8M30zHK1PlUlR2LgCG1AODsYRBaUp9E9n1aMGByMRuNPigKPjhw9T--SYAjFwKaPOkNzt6KlG7BipfkvCL4hFtcNQiIOFFOHq1frIxTXoHhyRnHxTzfnBxMBQeeT1qB-Gb9EoYA0u-301NUCrmI-bRFqS9erg"
              alt="Anita Ma'am Teacher Agent"
              className="w-11 h-11 rounded-2xl object-cover border-2 border-amber-500/60 shadow-md"
            />
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center">
              <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-headline text-base sm:text-lg font-bold text-white leading-tight">
                Anita Ma'am
              </h1>
              <Badge variant="saffron" className="text-[10px] py-0 px-2">
                AI Teacher Agent
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
              <span>Class 8 Socratic Mentor</span>
              <span>·</span>
              <span className="text-emerald-400 flex items-center gap-1 font-medium">
                <Save className="w-3 h-3" /> Auto-saved in Local Storage
              </span>
            </div>
          </div>
        </div>

        {/* Controls: Audio Settings, Language, Clear */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Test Sound & Voice Settings */}
          <button
            onClick={() => setVoiceSettingsOpen(!voiceSettingsOpen)}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              voiceSettingsOpen || isSpeakingId
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md shadow-amber-950/40'
                : 'bg-slate-800/80 text-slate-300 border-white/10 hover:border-amber-500/40 hover:text-white'
            }`}
            title="Audio & Voice Controls"
          >
            {isSpeakingId ? (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span className="hidden sm:inline">Voice & Audio</span>
          </button>

          {/* Quick Voice Sound Test Button */}
          <button
            onClick={handleRunVoiceTest}
            disabled={isTestingVoice}
            className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-600/90 to-orange-600/90 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
            title="Test Voice Audio immediately"
          >
            <Radio className={`w-3.5 h-3.5 ${isTestingVoice ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">Test Sound</span>
          </button>

          {/* Language Selector */}
          <div className="flex rounded-xl bg-slate-950/70 border border-white/10 p-0.5 text-xs">
            {(['English', 'Hindi', 'Hinglish'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setSelectedLanguage(lang)}
                className={`px-2 py-1 rounded-lg text-xs transition-all cursor-pointer ${
                  selectedLanguage === lang
                    ? 'bg-amber-600 text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          {/* Clear Thread */}
          <button
            onClick={handleClearHistory}
            className="p-1.5 rounded-xl bg-slate-800/80 border border-white/10 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 transition-colors flex items-center gap-1 text-xs cursor-pointer"
            title="Clear Chat History from Local Storage"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Voice & Sound Settings Drawer Card (when toggled open) */}
      {voiceSettingsOpen && (
        <Card className="shrink-0 mb-3 border-amber-500/30 bg-slate-900/95 backdrop-blur-2xl p-4 animate-in slide-in-from-top-3 duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-headline">
                  Speech & Sound Settings
                </h4>
                <Badge variant="teal" className="text-[10px] py-0 px-2">
                  Dual-Engine: WebSpeech + Acoustic Formant
                </Badge>
              </div>
              <p className="text-[11px] text-slate-400">
                Audio is enabled for browser iframes, mobile devices, and headphones. Click test to verify your speaker sound.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {/* Volume Slider */}
              <div className="flex items-center gap-2 min-w-[140px]">
                <Volume2 className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px] text-slate-400 w-8">Vol:</span>
                <Slider
                  min={0.1}
                  max={1.0}
                  step={0.1}
                  value={speechVolume}
                  onValueChange={(val) => setSpeechVolume(val)}
                  label="Speech Volume"
                  className="w-24"
                />
                <span className="text-[11px] font-mono text-amber-400">
                  {Math.round(speechVolume * 100)}%
                </span>
              </div>

              {/* Speed Buttons */}
              <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-white/10 text-xs">
                <span className="text-[10px] text-slate-400 px-1 font-medium">Speed:</span>
                {[0.8, 0.95, 1.15].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => setSpeechRate(rate)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer ${
                      speechRate === rate
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {rate === 0.95 ? 'Normal' : `${rate}x`}
                  </button>
                ))}
              </div>

              {/* Direct Test Button */}
              <Button
                size="sm"
                variant="outline"
                onClick={handleRunVoiceTest}
                disabled={isTestingVoice}
                className="text-xs gap-1.5"
              >
                <Play className="w-3 h-3 text-emerald-400 fill-emerald-400" />
                <span>{isTestingVoice ? 'Playing...' : 'Play Test Sample'}</span>
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Suggested Quick Starters (if conversation is fresh) */}
      {messages.length <= 2 && (
        <div className="shrink-0 mb-3">
          <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Suggested Student Questions</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                className="p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-white/10 hover:border-amber-500/40 text-left text-xs text-slate-300 hover:text-white transition-all flex items-center justify-between group cursor-pointer"
              >
                <span className="truncate pr-2">{prompt}</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-400 opacity-60 group-hover:opacity-100 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Conversation Thread - Scrollable and fills remaining space */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 p-2 rounded-2xl border border-white/5 bg-slate-950/40 backdrop-blur-sm">
        {messages.map((msg) => {
          const isTeacher = msg.sender === 'teacher';
          const isCurrentlySpeakingThis = isSpeakingId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                isTeacher ? 'justify-start' : 'justify-end'
              }`}
            >
              {isTeacher && (
                <div className="w-9 h-9 rounded-xl overflow-hidden border border-amber-500/40 shrink-0 shadow-md mt-1">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuArQo7uLrplNf5RxigElyfquxORgDVwRiffuHJLlp8TO0VBqan1Pd2RJ0ZM5dhdFpN_me1a7GTtlyN_0jXgZ34yw8j8M30zHK1PlUlR2LgCG1AODsYRBaUp9E9n1aMGByMRuNPigKPjhw9T--SYAjFwKaPOkNzt6KlG7BipfkvCL4hFtcNQiIOFFOHq1frIxTXoHhyRnHxTzfnBxMBQeeT1qB-Gb9EoYA0u-301NUCrmI-bRFqS9erg"
                    alt="Anita Ma'am"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div
                className={`max-w-[88%] md:max-w-[82%] rounded-2xl p-4 shadow-xl text-sm leading-relaxed relative group transition-all ${
                  isTeacher
                    ? isCurrentlySpeakingThis
                      ? 'glass-card border-amber-500/50 bg-slate-900/90 text-slate-100 rounded-tl-sm ring-1 ring-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                      : 'glass-card border-white/10 text-slate-100 rounded-tl-sm'
                    : 'bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-tr-sm shadow-md'
                }`}
              >
                {/* Render via MarkdownRenderer so LaTeX, bold, equations, lists, and steps look crisp */}
                <MarkdownRenderer content={msg.text} />

                {/* Footer metadata & Speech button */}
                <div
                  className={`mt-3 flex items-center justify-between text-[11px] border-t border-white/10 pt-2 ${
                    isTeacher ? 'text-slate-400' : 'text-amber-100'
                  }`}
                >
                  <span className="tabular-nums font-mono text-[10px]">{msg.timestamp}</span>

                  {isTeacher && (
                    <button
                      onClick={() => handleSpeakMessage(msg.text, msg.id)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        isCurrentlySpeakingThis
                          ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-950/50 scale-105 ring-2 ring-amber-400'
                          : 'bg-white/10 hover:bg-white/20 text-slate-200 hover:text-amber-300'
                      }`}
                      title={isCurrentlySpeakingThis ? 'Pause / Stop speaking' : 'Read aloud with AI teacher voice'}
                    >
                      {isCurrentlySpeakingThis ? (
                        <>
                          {/* Animated equalizer waves */}
                          <div className="flex items-center gap-0.5 h-3">
                            <span className="w-0.5 h-3 bg-slate-950 animate-[pulse_0.4s_infinite]" />
                            <span className="w-0.5 h-2 bg-slate-950 animate-[pulse_0.6s_infinite]" />
                            <span className="w-0.5 h-3.5 bg-slate-950 animate-[pulse_0.5s_infinite]" />
                          </div>
                          <span>Speaking... (Stop)</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                          <span>Listen to Ma'am</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-start gap-3 justify-start">
            <div className="w-9 h-9 rounded-xl overflow-hidden border border-amber-500/40 shrink-0 shadow-md mt-1">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuArQo7uLrplNf5RxigElyfquxORgDVwRiffuHJLlp8TO0VBqan1Pd2RJ0ZM5dhdFpN_me1a7GTtlyN_0jXgZ34yw8j8M30zHK1PlUlR2LgCG1AODsYRBaUp9E9n1aMGByMRuNPigKPjhw9T--SYAjFwKaPOkNzt6KlG7BipfkvCL4hFtcNQiIOFFOHq1frIxTXoHhyRnHxTzfnBxMBQeeT1qB-Gb9EoYA0u-301NUCrmI-bRFqS9erg"
                alt="Anita Ma'am"
                className="w-full h-full object-cover animate-pulse"
              />
            </div>
            <div className="p-4 rounded-2xl glass-card border-white/10 rounded-tl-sm flex items-center gap-2.5 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>Anita Ma'am is preparing a clear, step-by-step Socratic response...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Floating Active Speech Player Status Bar (when audio is active) */}
      {isSpeakingId && (
        <div className="shrink-0 mt-2 mb-1 p-2.5 rounded-2xl bg-gradient-to-r from-amber-950/90 to-slate-900/90 border border-amber-500/40 shadow-xl flex items-center justify-between gap-3 animate-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0 border border-amber-500/30">
              <Volume2 className="w-4 h-4 text-amber-400 animate-pulse" />
            </div>
            <div className="overflow-hidden">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-300">
                  Anita Ma'am Speaking
                </span>
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
            <span>Stop Audio</span>
          </button>
        </div>
      )}

      {/* Docked Input Area */}
      <div className="shrink-0 pt-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask Anita Ma'am anything (e.g. 2x² + 5x = 0, zinc + HCl reaction, pythagoras)..."
              disabled={loading}
              className="pr-10 text-xs sm:text-sm py-2.5"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            glow
            disabled={!inputText.trim() || loading}
            className="px-5 shrink-0"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Ask Ma'am</span>
          </Button>
        </form>

        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1">
          <span className="flex items-center gap-1 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Chat & audio history stored in local storage</span>
          </span>
          <span className="flex items-center gap-1 text-amber-400 font-semibold">
            <Flame className="w-3.5 h-3.5" /> +5 XP per question
          </span>
        </div>
      </div>
    </div>
  );
}
