import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { MarkdownRenderer } from '../ui/MarkdownRenderer';
import {
  ArrowLeft,
  Languages,
  RotateCcw,
  Mic,
  Keyboard,
  Send,
  Lightbulb,
  Sparkles,
} from 'lucide-react';

interface SnapAndSolveScreenProps {
  onNavigate: (screen: any) => void;
}

export function SnapAndSolveScreen({ onNavigate }: SnapAndSolveScreenProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [showKeyboardInput, setShowKeyboardInput] = useState(false);
  const [userMessage, setUserMessage] = useState('');
  const [conversation, setConversation] = useState<
    Array<{ sender: 'ai' | 'user'; text: string; hindi?: string }>
  >([
    {
      sender: 'ai',
      text: 'I see a 3-digit division problem here (456 ÷ 12)! What do you think our first step should be when looking at the standard divisor 12?',
      hindi:
        'मुझे यहाँ 3-अंकीय विभाजन की समस्या (456 ÷ 12) दिखाई दे रही है! आपको क्या लगता है कि मानक भाजक 12 को देखते समय हमारा पहला कदम क्या होना चाहिए?',
    },
  ]);
  const [hintVisible, setHintVisible] = useState(true);

  const handleSend = () => {
    if (!userMessage.trim()) return;
    const msg = userMessage.trim();
    setUserMessage('');
    setConversation((prev) => [
      ...prev,
      { sender: 'user', text: msg },
      {
        sender: 'ai',
        text: "Exactly right! 12 goes into 45 three times (3 × 12 = 36). Now what is 45 minus 36?",
        hindi: 'बिल्कुल सही! 12 का भाग 45 में 3 बार जाता है (3 × 12 = 36)। अब 45 में से 36 घटाने पर क्या बचेगा?',
      },
    ]);
  };

  const handleVoiceToggle = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      setTimeout(() => {
        setIsRecording(false);
        setConversation((prev) => [
          ...prev,
          { sender: 'user', text: 'We should see how many times 12 divides into 45!' },
          {
            sender: 'ai',
            text: "Brilliant observation! 12 goes into 45 three times (3 × 12 = 36). Then we subtract 36 from 45 to get 9, and bring down the 6 to get 96.",
            hindi:
              'शानदार अवलोकन! 12 का भाग 45 में 3 बार जाता है। फिर 36 घटाने पर 9 बचता है और 6 नीचे लाकर 96 बनता है।',
          },
        ]);
      }, 2500);
    }
  };

  return (
    <div className="min-h-screen flex flex-col pb-28 pt-4 px-4 max-w-2xl mx-auto w-full">
      {/* Top Header */}
      <header className="flex items-center justify-between py-3 mb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('dashboard')}
            className="w-10 h-10 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-headline text-xl font-bold text-white">Snap & Solve</h1>
        </div>

        <button
          onClick={() => onNavigate('bulk-scanning')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-white/10 text-xs text-slate-300 hover:text-amber-400 hover:border-amber-500/40 transition-colors"
        >
          <Languages className="w-4 h-4 text-teal-400" />
          <span>EN / HI</span>
        </button>
      </header>

      {/* Photo Context Area with Retake */}
      <div className="relative w-full h-48 md:h-56 rounded-3xl overflow-hidden border border-white/10 bg-slate-950 mb-5 shadow-2xl shrink-0">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBnpQhaQ7vZ89QXdpTo5UtDcazgNQDCuhKeDmXAuGeG31uTWk6pljQNq7pHY6E3SJ8hmcrx__Bxmqm6i_oPwuTr6w_XfofOrw72QiiRon9MwODFrflB5lzExUYqBY2M_Efb7616qUkmuku4Tlq4IXsOd6JEV2AwjAUMFFXYZNW6utCfBFoEsb6npp8KiPY_VyQhuRNhe2U0ou27-d4jYqcmgk7lEinMNaAFmWT0Fz7dBZPcFhZ2kXlN"
          alt="Handwritten 3-digit division math problem: 456 divided by 12"
          className="w-full h-full object-cover opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

        <button
          onClick={() => onNavigate('bulk-scanning')}
          className="absolute top-4 right-4 z-20 px-3.5 py-1.5 rounded-full bg-slate-900/90 backdrop-blur-md border border-white/15 text-teal-300 text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-800 transition-colors shadow-lg"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Retake</span>
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 space-y-4 mb-6 overflow-y-auto">
        {conversation.map((msg, i) => (
          <div
            key={i}
            className={`flex items-end gap-3 ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.sender === 'ai' && (
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-teal-500/50 shrink-0 shadow-lg">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAtHLXQYqI7hyCHVSXlNxy7sxxmE9dr4Hlf-KWrqorgj2jIc9PS0_8UKd9VCC965F3vnPA3U-zhh3bQmTn-X6LggGFNGmFJ6buDMdHoLBRw4EWAQdsZYrIBQNDsKCUyik_ryA7w4HvX_Dabv_Tckc-MRca3ZNpdLDxqP4sXA5lHMRiL04XhskEmYKpvDA2ecPQGdyKdYqUimDJhPZI9oPZd-CFs1MuAj2Y_Mf5NuY4wOs7GkjLUYvYS"
                  alt="Shiksha Mitra 3D Mentor"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl p-4 shadow-lg text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-br-none'
                  : 'glass-card border-white/10 text-slate-100 rounded-bl-none space-y-2'
              }`}
            >
              <MarkdownRenderer content={msg.text} />
              {msg.hindi && (
                <p className="text-xs text-amber-200/90 font-medium italic border-t border-white/5 pt-1.5">
                  {msg.hindi}
                </p>
              )}
            </div>
          </div>
        ))}

        {/* Hint Nudge Card */}
        {hintVisible && (
          <div className="ml-13 max-w-[85%] p-3 rounded-2xl bg-teal-950/40 border border-teal-500/30 flex items-center gap-3 text-teal-200 text-xs">
            <div className="w-7 h-7 rounded-full bg-teal-500/20 flex items-center justify-center shrink-0 text-teal-300">
              <Lightbulb className="w-4 h-4" />
            </div>
            <p>Hint: Look at the first two digits (45).</p>
          </div>
        )}
      </div>

      {/* Input Fixed Bottom Area */}
      <div className="mt-auto pt-3 border-t border-white/10">
        {showKeyboardInput ? (
          <div className="flex items-center gap-2 mb-2">
            <Input
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              placeholder="Type your explanation or question..."
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1"
            />
            <Button variant="primary" size="md" onClick={handleSend} className="px-4">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        ) : null}

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowKeyboardInput(!showKeyboardInput)}
            className={`w-14 h-14 rounded-2xl border flex items-center justify-center transition-colors ${
              showKeyboardInput
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white'
            }`}
            title="Toggle Keyboard"
          >
            <Keyboard className="w-6 h-6" />
          </button>

          <button
            onClick={handleVoiceToggle}
            className={`flex-1 h-14 rounded-2xl font-headline font-bold text-sm md:text-base flex items-center justify-center gap-3 transition-all duration-300 shadow-xl ${
              isRecording
                ? 'bg-rose-600 text-white animate-pulse border-2 border-rose-400 shadow-rose-900/50'
                : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-amber-950/40 border border-amber-500/30'
            }`}
          >
            <Mic className={`w-5 h-5 ${isRecording ? 'animate-bounce' : ''}`} />
            <span>{isRecording ? 'Listening (Speak now)...' : 'Press to Speak'}</span>
          </button>
        </div>
        <p className="text-center text-[11px] text-slate-400 mt-2">
          Speak in English or Hindi · AI understands vernacular accents
        </p>
      </div>
    </div>
  );
}
