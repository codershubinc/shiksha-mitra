import React, { useState, useRef, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { MarkdownRenderer } from '../ui/MarkdownRenderer';
import {
  Send,
  Mic,
  Volume2,
  Sparkles,
  ArrowLeft,
  RotateCcw,
  BookOpen,
  GraduationCap,
  MessageCircle,
  CheckCircle2,
  HelpCircle,
  Languages,
  Save,
  Trash2,
} from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

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

What would you like to explore together today?`,
  timestamp: 'Just now',
};

export function TeacherAgentChatScreen({ onNavigate }: TeacherAgentChatScreenProps) {
  const { user, updateUserXp } = useAuth();

  // Load initial messages from localStorage if available
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
  const [isSpeakingId, setIsSpeakingId] = useState<string | null>(null);
  const [showSavedToast, setShowSavedToast] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Sync messages to localStorage whenever they change
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

  const quickPrompts = [
    'Why does Zinc react with dilute HCl to produce bubbles?',
    'How do I solve 2x² + 5x = 0 step-by-step?',
    'Explain the Pythagorean theorem with a real-life example',
    'How do I divide 456 by 12 without getting confused?',
  ];

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText.trim();
    if (!text || loading) return;

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
      // Build history for multi-turn conversation
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
      updateUserXp(5); // Reward 5 XP for asking thoughtful questions!
    } catch (err: any) {
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        sender: 'teacher',
        text:
          "Beta, I had a brief connection pause. But remember: in **$2x^2 + 5x = 0$**, both terms share '$x$', so we factor out $x$ to get **$x(2x + 5) = 0$**! What do you think $x$ equals next?",
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
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

  const speakText = (text: string, id: string) => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeakingId === id) {
      window.speechSynthesis.cancel();
      setIsSpeakingId(null);
      return;
    }
    window.speechSynthesis.cancel();
    setIsSpeakingId(id);

    // Strip markdown formatting symbols for natural vocal reading
    const cleanSpeech = text
      .replace(/[*_#`$]/g, '')
      .replace(/\n+/g, '. ');

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeakingId(null);
    utterance.onerror = () => setIsSpeakingId(null);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="min-h-screen flex flex-col pb-28 pt-4 px-4 max-w-4xl mx-auto w-full">
      {/* Top Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 border-b border-white/10 mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('dashboard')}
            className="w-10 h-10 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="relative">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuArQo7uLrplNf5RxigElyfquxORgDVwRiffuHJLlp8TO0VBqan1Pd2RJ0ZM5dhdFpN_me1a7GTtlyN_0jXgZ34yw8j8M30zHK1PlUlR2LgCG1AODsYRBaUp9E9n1aMGByMRuNPigKPjhw9T--SYAjFwKaPOkNzt6KlG7BipfkvCL4hFtcNQiIOFFOHq1frIxTXoHhyRnHxTzfnBxMBQeeT1qB-Gb9EoYA0u-301NUCrmI-bRFqS9erg"
              alt="Anita Ma'am Teacher Agent"
              className="w-12 h-12 rounded-2xl object-cover border-2 border-amber-500/50 shadow-md"
            />
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-headline text-lg font-bold text-white leading-tight">
                Anita Ma'am
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                AI Teacher Agent
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              <span>Class 8 Socratic Mentor</span>
              <span>·</span>
              <span className="text-emerald-400 flex items-center gap-1 font-medium">
                <Save className="w-3 h-3" /> Auto-saved in Local Storage
              </span>
            </div>
          </div>
        </div>

        {/* Filters & Actions */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Language Selector */}
          <div className="flex rounded-xl bg-slate-900 border border-white/10 p-1 text-xs">
            {(['English', 'Hindi', 'Hinglish'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setSelectedLanguage(lang)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  selectedLanguage === lang
                    ? 'bg-amber-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          {/* Clear Thread & Storage */}
          <button
            onClick={handleClearHistory}
            className="p-2 rounded-xl bg-slate-900 border border-white/10 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 transition-colors flex items-center gap-1 text-xs"
            title="Clear Chat History from Local Storage"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden md:inline">Clear</span>
          </button>
        </div>
      </header>

      {/* Suggested Quick Starters */}
      {messages.length <= 2 && (
        <div className="mb-4">
          <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Suggested Student Questions</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                className="p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-white/10 hover:border-amber-500/40 text-left text-xs text-slate-300 hover:text-white transition-all flex items-center justify-between group"
              >
                <span className="truncate pr-2">{prompt}</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-400 opacity-60 group-hover:opacity-100 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Conversation Thread with Markdown Rendering */}
      <div className="flex-1 space-y-4 mb-4 overflow-y-auto min-h-[380px] p-2">
        {messages.map((msg) => {
          const isTeacher = msg.sender === 'teacher';
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
                className={`max-w-[88%] md:max-w-[80%] rounded-3xl p-4.5 shadow-xl text-sm leading-relaxed relative group ${
                  isTeacher
                    ? 'glass-card border-white/10 text-slate-100 rounded-tl-sm'
                    : 'bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-tr-sm'
                }`}
              >
                {/* Render via MarkdownRenderer so LaTeX, bold, equations, lists, and steps look crisp */}
                <MarkdownRenderer content={msg.text} />

                {/* Footer metadata & Speech button */}
                <div
                  className={`mt-3 flex items-center justify-between text-[10px] border-t border-white/5 pt-2 ${
                    isTeacher ? 'text-slate-400' : 'text-amber-200'
                  }`}
                >
                  <span className="tabular-nums">{msg.timestamp}</span>

                  {isTeacher && (
                    <button
                      onClick={() => speakText(msg.text, msg.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-colors cursor-pointer ${
                        isSpeakingId === msg.id
                          ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                          : 'bg-white/5 hover:bg-white/10 hover:text-amber-300'
                      }`}
                      title="Read aloud"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{isSpeakingId === msg.id ? 'Speaking...' : 'Listen to Ma\'am'}</span>
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
            <div className="p-4 rounded-3xl glass-card border-white/10 rounded-tl-sm flex items-center gap-2.5 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>Anita Ma'am is preparing a clear, step-by-step response...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="pt-2 border-t border-white/10">
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
              placeholder="Ask Anita Ma'am anything (e.g. 2x² + 5x = 0, science reactions)..."
              disabled={loading}
              className="pr-10"
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
            <span>Chat stored in local storage for easy review</span>
          </span>
          <span>Earn 5 XP per Socratic query</span>
        </div>
      </div>
    </div>
  );
}
