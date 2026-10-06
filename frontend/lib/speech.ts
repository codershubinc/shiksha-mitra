/**
 * Shiksha Mitra - High Reliability Speech & Voice Synthesis Engine
 * Specially engineered for browser iframes, mobile web, and Chrome/Safari audio contexts
 */

import { BACKEND_URL } from './api';

let speechVoices: SpeechSynthesisVoice[] = [];
let voicesLoaded = false;

// AudioContext for sound effects, speech unlocking, and acoustic voice fallback
let globalAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!globalAudioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        globalAudioCtx = new AudioCtxClass();
      }
    }
    if (globalAudioCtx && globalAudioCtx.state === 'suspended') {
      globalAudioCtx.resume().catch(() => {});
    }
    return globalAudioCtx;
  } catch (e) {
    return null;
  }
}

// Unlock audio on first user touch/click
export function unlockAudioContext() {
  if (typeof window === 'undefined') return;
  try {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.resume();
      
      // The crucial silent utterance to unlock speech synthesis on iOS/Safari and strict Chrome
      const silent = new SpeechSynthesisUtterance('');
      silent.volume = 0;
      silent.rate = 1;
      silent.pitch = 1;
      window.speechSynthesis.speak(silent);
    }
  } catch (e) {}
}

if (typeof window !== 'undefined') {
  window.addEventListener('click', unlockAudioContext, { once: true });
  window.addEventListener('touchstart', unlockAudioContext, { once: true });
}

export function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve([]);
      return;
    }

    const available = window.speechSynthesis.getVoices();
    if (available.length > 0) {
      speechVoices = available;
      voicesLoaded = true;
      resolve(available);
      return;
    }

    // Wait for voiceschanged event
    const handleVoicesChanged = () => {
      speechVoices = window.speechSynthesis.getVoices();
      voicesLoaded = true;
      resolve(speechVoices);
    };

    window.speechSynthesis.onvoiceschanged = handleVoicesChanged;

    // Timeout fallback if event never fires
    setTimeout(() => {
      speechVoices = window.speechSynthesis.getVoices();
      resolve(speechVoices);
    }, 400);
  });
}

// Initial eager load
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  loadVoices();
}

export function getAllVoices(): SpeechSynthesisVoice[] {
  if (speechVoices.length === 0 && typeof window !== 'undefined' && 'speechSynthesis' in window) {
    speechVoices = window.speechSynthesis.getVoices();
  }
  return speechVoices;
}

export function getPreferredVoice(preferredLang: string = 'English'): SpeechSynthesisVoice | null {
  const voices = getAllVoices();
  if (voices.length === 0) return null;

  if (preferredLang === 'Hindi') {
    const hindiVoice = voices.find(
      (v) => v.lang.startsWith('hi') || v.name.toLowerCase().includes('hindi')
    );
    if (hindiVoice) return hindiVoice;
  }

  // 1. Look for Indian English (en-IN)
  const indianEng = voices.find(
    (v) =>
      v.lang === 'en-IN' ||
      v.lang.toLowerCase().includes('in') ||
      v.name.toLowerCase().includes('india') ||
      v.name.toLowerCase().includes('neerja') ||
      v.name.toLowerCase().includes('prabhat')
  );
  if (indianEng) return indianEng;

  // 2. Natural / Premium female voices
  const naturalFemale = voices.find(
    (v) =>
      v.lang.startsWith('en') &&
      (v.name.includes('Natural') ||
        v.name.includes('Google') ||
        v.name.includes('Samantha') ||
        v.name.includes('Victoria') ||
        v.name.includes('Karen') ||
        v.name.includes('Zira'))
  );
  if (naturalFemale) return naturalFemale;

  // 3. Any English voice
  const anyEng = voices.find((v) => v.lang.startsWith('en'));
  if (anyEng) return anyEng;

  return voices[0] || null;
}

/**
 * Text normalizer for mathematical, scientific, and markdown expressions
 */
export function normalizeEducationalTextForSpeech(text: string): string {
  let cleaned = text;

  // Strip markdown code blocks & raw markdown
  cleaned = cleaned.replace(/```[\s\S]*?```/g, ' [code block omitted] ');
  cleaned = cleaned.replace(/`([^`]+)`/g, '$1');

  // Math equations and symbols
  cleaned = cleaned
    .replace(/2x²\s*\+\s*5x\s*=\s*0/gi, '2 x squared plus 5 x equals 0')
    .replace(/x²/g, 'x squared')
    .replace(/y²/g, 'y squared')
    .replace(/a²\s*\+\s*b²\s*=\s*c²/g, 'a squared plus b squared equals c squared')
    .replace(/a²/g, 'a squared')
    .replace(/b²/g, 'b squared')
    .replace(/c²/g, 'c squared')
    .replace(/√(\d+)/g, 'square root of $1')
    .replace(/÷/g, ' divided by ')
    .replace(/×/g, ' times ')
    .replace(/≠/g, ' is not equal to ')
    .replace(/≤/g, ' is less than or equal to ')
    .replace(/≥/g, ' is greater than or equal to ')
    .replace(/±/g, ' plus or minus ')
    .replace(/\$/g, ''); // strip LaTeX dollar signs

  // Chemistry notation
  cleaned = cleaned
    .replace(/Zn\s*\+\s*2HCl\s*→\s*ZnCl₂\s*\+\s*H₂↑?/gi, 'Zinc plus 2 H C L reacts to form Zinc Chloride plus Hydrogen gas')
    .replace(/ZnCl₂/gi, 'Zinc Chloride')
    .replace(/HCl/gi, 'H C L')
    .replace(/H₂/gi, 'Hydrogen')
    .replace(/O₂/gi, 'Oxygen')
    .replace(/CO₂/gi, 'C O 2')
    .replace(/→/g, ' yields ');

  // Markdown lists and formatting
  cleaned = cleaned
    .replace(/[*_#~]/g, '')
    .replace(/Step \d+:/gi, (match) => `. ${match}. `)
    .replace(/💡|🔬|📐|🎉|✨|🌟|👏/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  return cleaned;
}

/**
 * Split text into natural sentence fragments to prevent Chrome's 15-second freeze
 */
export function splitIntoSentences(text: string): string[] {
  const normalized = normalizeEducationalTextForSpeech(text);
  if (!normalized) return [];

  // Match sentences ending in ., !, ?, or newlines
  const rawSentences = normalized.match(/[^.!?\n]+[.!?\n]+|[^.!?\n]+$/g) || [normalized];

  const result: string[] = [];
  for (const s of rawSentences) {
    const trimmed = s.trim();
    if (trimmed.length > 0) {
      // If a sentence is unusually long (> 150 chars), break at commas or semicolons
      if (trimmed.length > 150) {
        const parts = trimmed.split(/[,;:]\s+/);
        for (const p of parts) {
          if (p.trim().length > 0) result.push(p.trim());
        }
      } else {
        result.push(trimmed);
      }
    }
  }

  return result.length > 0 ? result : [normalized];
}

/**
 * Web Audio pleasant harmonic chime to signal voice start or fallback
 */
export function playAudibleChime(type: 'start' | 'success' | 'note' = 'start') {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (type === 'start') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime); // A4
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.18); // A5
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    } else {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
    }

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.45);
  } catch (e) {
    console.warn('Web Audio chime not permitted:', e);
  }
}

/**
 * High-clarity Acoustic Formant Voice Synthesizer
 * Plays melodic, pleasant vocal cadences when native speech engine is muted or blocked
 */
export function playAcousticVoiceSyllables(
  sentenceCount: number = 3,
  onComplete?: () => void
) {
  try {
    const ctx = getAudioContext();
    if (!ctx) {
      onComplete?.();
      return;
    }

    const syllables = Math.min(Math.max(sentenceCount * 4, 6), 18);
    const now = ctx.currentTime + 0.05;
    const duration = 0.14;

    // Pitch contours for gentle, encouraging cadence
    const baseFreqs = [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 392.0, 329.63];

    for (let i = 0; i < syllables; i++) {
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      const startTime = now + i * duration;
      const freq = baseFreqs[i % baseFreqs.length] * (1 + (i % 3) * 0.15);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, startTime);

      // Formant vocal filter (mimics human vowel sound /a/ and /o/)
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800 + (i % 2) * 400, startTime);
      filter.Q.setValueAtTime(4.0, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.12, startTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration - 0.01);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    }

    setTimeout(() => {
      onComplete?.();
    }, (syllables * duration + 0.2) * 1000);
  } catch (err) {
    onComplete?.();
  }
}

export interface PlaySpeechOptions {
  language?: 'English' | 'Hindi' | 'Hinglish';
  rate?: number;
  pitch?: number;
  volume?: number;
  onStart?: () => void;
  onSentenceStart?: (sentence: string, index: number, total: number) => void;
  onEnd?: () => void;
  onError?: (error: any) => void;
}

// Global active controller to manage sequential chunks and cancellations
// Global active audio element so we can cancel it
let activeGoogleAudio: HTMLAudioElement | null = null;

class SpeechPlaybackController {
  private isCancelled: boolean = false;
  private currentChunkIndex: number = 0;
  private chunks: string[] = [];
  private options: PlaySpeechOptions = {};
  private pingInterval: any = null;

  stop() {
    this.isCancelled = true;
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }
    (window as any).__activeUtterance = null;
    if (activeGoogleAudio) {
      activeGoogleAudio.pause();
      activeGoogleAudio.src = '';
      activeGoogleAudio = null;
    }
  }

  play(text: string, options: PlaySpeechOptions = {}) {
    this.stop();
    this.isCancelled = false;
    this.options = options;

    unlockAudioContext();

    const sentences = splitIntoSentences(text);
    if (sentences.length === 0) {
      options.onEnd?.();
      return;
    }

    this.chunks = sentences;
    this.currentChunkIndex = 0;

    playAudibleChime('start');

    options.onStart?.();

    setTimeout(() => {
      if (this.isCancelled) return;
      this.playNextChunk();
    }, 80);
  }

  private playNextChunk() {
    if (this.isCancelled) return;

    if (this.currentChunkIndex >= this.chunks.length) {
      if (this.pingInterval) clearInterval(this.pingInterval);
      this.options.onEnd?.();
      return;
    }

    const sentence = this.chunks[this.currentChunkIndex];
    this.options.onSentenceStart?.(sentence, this.currentChunkIndex, this.chunks.length);

    let chunkFinished = false;
    const finishChunk = () => {
      if (chunkFinished) return;
      chunkFinished = true;
      activeGoogleAudio = null;
      this.currentChunkIndex++;
      setTimeout(() => {
        if (!this.isCancelled) {
          this.playNextChunk();
        }
      }, 70);
    };

    // Google Translate TTS
    try {
      const tl = this.options.language === 'Hindi' ? 'hi' : 'en-IN';
      const url = `${BACKEND_URL}/api/ai/tts?tl=${tl}&text=${encodeURIComponent(sentence)}`;
      const audio = new Audio(url);
      activeGoogleAudio = audio;

      audio.onended = finishChunk;
      
      audio.onerror = (e) => {
        console.warn('Google TTS error:', e);
        finishChunk();
      };

      audio.play().catch((err) => {
        console.warn('Google TTS playback error:', err);
        finishChunk();
      });
    } catch (err) {
      console.warn('Google TTS setup error:', err);
      finishChunk();
    }
  }

  private playNativeSynthesis(sentence: string, finishChunk: () => void) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      playAcousticVoiceSyllables(this.chunks.length, () => {
        this.options.onEnd?.();
      });
      this.isCancelled = true;
      return;
    }

    try {
      window.speechSynthesis.resume();
      const utterance = new SpeechSynthesisUtterance(sentence);
      (window as any).__activeUtterance = utterance;

      const voice = getPreferredVoice(this.options.language || 'English');
      if (voice) utterance.voice = voice;

      utterance.lang = this.options.language === 'Hindi' ? 'hi-IN' : 'en-IN';
      utterance.rate = this.options.rate ?? 0.95;
      utterance.pitch = this.options.pitch ?? 1.05;
      utterance.volume = this.options.volume ?? 1.0;

      let synthFinished = false;
      const finishSynth = () => {
        if (synthFinished) return;
        synthFinished = true;
        finishChunk();
      };

      utterance.onend = finishSynth;
      utterance.onerror = finishSynth;

      const maxDuration = Math.max(sentence.length * 90, 3000);
      setTimeout(() => {
        if (!synthFinished && !this.isCancelled) finishSynth();
      }, maxDuration);

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      finishChunk();
    }
  }
}

export const speechController = new SpeechPlaybackController();

export function playTeacherSpeech(text: string, options?: PlaySpeechOptions) {
  speechController.play(text, options);
}

export function stopTeacherSpeech() {
  speechController.stop();
}

/**
 * Self-test utility so user can test their audio right from the UI
 */
export function testTeacherVoice(
  onComplete?: () => void
) {
  const testText =
    "Namaste beta! I am Anita Ma'am, your AI teacher. Sound is working beautifully! You can ask me any doubt now.";
  playTeacherSpeech(testText, {
    language: 'English',
    rate: 1.0,
    volume: 1.0,
    onEnd: onComplete,
  });
}
