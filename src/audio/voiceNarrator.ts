/**
 * Ashen Road - Syndicate Radio Voice Narrator & Comms Dispatch
 * Provides realistic synthesized voice narration, radio squelch effects,
 * mission explanations, tactical walkthroughs, and real-time transcripts.
 */
import { soundManager } from './soundManager';
import { VoiceBriefing } from '../types';

export interface VoiceNarratorState {
  currentBriefing: VoiceBriefing | null;
  isPlaying: boolean;
  isMuted: boolean;
  history: VoiceBriefing[];
}

type Listener = (state: VoiceNarratorState) => void;

class VoiceNarrator {
  private isMuted: boolean = false;
  private isSpeaking: boolean = false;
  private currentBriefing: VoiceBriefing | null = null;
  private history: VoiceBriefing[] = [];
  private listeners: Set<Listener> = new Set();
  private synth: SpeechSynthesis | null = null;
  private preferredVoice: SpeechSynthesisVoice | null = null;
  private initialized: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      // Load voices when available
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.selectBestVoice();
      }
      this.selectBestVoice();
    }
  }

  private selectBestVoice() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    if (!voices || voices.length === 0) return;

    // Prioritize natural, realistic English voices with deep, authoritative tone
    const priorities = [
      'Google UK English Male',
      'Daniel',
      'Microsoft George Online',
      'Microsoft David',
      'Google US English',
      'en-GB',
      'en-US',
    ];

    for (const name of priorities) {
      const match = voices.find(v => v.name.includes(name) || v.lang.includes(name));
      if (match) {
        this.preferredVoice = match;
        return;
      }
    }

    // Fallback to any English voice
    this.preferredVoice = voices.find(v => v.lang.startsWith('en')) || voices[0];
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach(cb => cb(state));
  }

  public getState(): VoiceNarratorState {
    return {
      currentBriefing: this.currentBriefing,
      isPlaying: this.isSpeaking,
      isMuted: this.isMuted,
      history: [...this.history],
    };
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted && this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
    }
    this.notify();
    return this.isMuted;
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
    }
    this.isSpeaking = false;
    this.currentBriefing = null;
    soundManager.playRadioOut();
    this.notify();
  }

  public replayCurrent() {
    if (this.currentBriefing) {
      const b = { ...this.currentBriefing };
      this.narrate(b, true);
    }
  }

  /**
   * Play a voice narrative briefing with radio comms sound FX and on-screen transcript
   */
  public narrate(briefing: VoiceBriefing, force = false) {
    if (!briefing || (!force && this.currentBriefing?.id === briefing.id && this.isSpeaking)) {
      return;
    }

    // Stop previous utterance
    if (this.synth) {
      this.synth.cancel();
    }

    this.currentBriefing = {
      ...briefing,
      timestamp: Date.now(),
    };

    // Store in history
    if (!this.history.some(h => h.id === briefing.id && h.title === briefing.title)) {
      this.history.unshift(this.currentBriefing);
      if (this.history.length > 20) this.history.pop();
    }

    // Radio in chirp sound effect
    soundManager.playRadioIn();

    if (this.isMuted || !this.synth) {
      this.isSpeaking = false;
      this.notify();
      return;
    }

    try {
      this.selectBestVoice();
      const utterance = new SpeechSynthesisUtterance(briefing.audioText);
      if (this.preferredVoice) {
        utterance.voice = this.preferredVoice;
      }
      
      // Realistic mob consigliere / gritty radio comms settings:
      // Slightly measured tempo, authoritative deep pitch
      utterance.rate = 0.95;
      utterance.pitch = 0.92;
      utterance.volume = 0.95;

      utterance.onstart = () => {
        this.isSpeaking = true;
        this.notify();
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        soundManager.playRadioOut();
        this.notify();
      };

      utterance.onerror = () => {
        this.isSpeaking = false;
        this.notify();
      };

      this.synth.speak(utterance);
      this.isSpeaking = true;
      this.notify();
    } catch (err) {
      console.warn('Voice narration error:', err);
      this.isSpeaking = false;
      this.notify();
    }
  }
}

export const voiceNarrator = new VoiceNarrator();
