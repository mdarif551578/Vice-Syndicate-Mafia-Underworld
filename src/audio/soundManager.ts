/**
 * Procedural Web Audio Synthesizer for Ashen Road
 * 100% code-synthesized trendy music & sound effects without any external files!
 */

type MusicTrack = 'village' | 'forest' | 'ashen' | 'boss' | 'victory';

class SoundManager {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;
  private musicVolume: number = 0.35;
  private sfxVolume: number = 0.45;
  private isPlayingMusic: boolean = false;
  private currentTrack: MusicTrack | null = null;
  private timerId: number | null = null;
  private step: number = 0;
  private tempo: number = 110; // BPM

  // Chord frequencies (Hz)
  private readonly notes: Record<string, number> = {
    C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
    C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
    Eb3: 155.56, Fs3: 185.00, Ab3: 207.65, Bb3: 233.08,
    Eb4: 311.13, Fs4: 369.99, Ab4: 415.30, Bb4: 466.16,
    Eb5: 622.25, Fs5: 739.99, Ab5: 830.61, Bb5: 932.33,
  };

  constructor() {
    // Lazy AudioContext initialization upon user gesture
  }

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.isMuted ? 0 : 1;
      this.masterGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = this.musicVolume;
      this.musicGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = this.sfxVolume;
      this.sfxGain.connect(this.masterGain);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public unlock() {
    this.initContext();
    if (!this.isPlayingMusic && this.currentTrack) {
      this.playMusic(this.currentTrack);
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setMusicVolume(val: number) {
    this.musicVolume = Math.max(0, Math.min(1, val));
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
    }
  }

  public setSfxVolume(val: number) {
    this.sfxVolume = Math.max(0, Math.min(1, val));
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
    }
  }

  // Play procedural trendy music loop
  public playMusic(track: MusicTrack) {
    this.initContext();
    if (this.currentTrack === track && this.isPlayingMusic) return;
    this.currentTrack = track;
    this.isPlayingMusic = true;
    this.step = 0;

    if (this.timerId !== null) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }

    if (track === 'boss') {
      this.tempo = 135;
    } else if (track === 'forest') {
      this.tempo = 115;
    } else if (track === 'ashen') {
      this.tempo = 98;
    } else {
      this.tempo = 105; // Village / victory
    }

    const stepInterval = (60 / this.tempo / 4) * 1000; // 16th notes
    this.timerId = window.setInterval(() => {
      this.tickSequencer();
    }, stepInterval);
  }

  public stopMusic() {
    if (this.timerId !== null) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }
    this.isPlayingMusic = false;
  }

  private tickSequencer() {
    if (!this.ctx || !this.musicGain || this.isMuted) {
      this.step = (this.step + 1) % 64;
      return;
    }

    const s = this.step;
    const t = this.ctx.currentTime;
    const track = this.currentTrack;

    if (track === 'village') {
      // Warm trendy lofi / chiptune progression: Cmaj7 - Am7 - Fmaj7 - G7
      const bar = Math.floor(s / 16) % 4;
      const beat = s % 16;

      // Soft bass
      if (beat === 0 || beat === 6 || beat === 10) {
        const bassFreq = [this.notes.C3, this.notes.A3 / 2, this.notes.F3 / 2, this.notes.G3 / 2][bar];
        this.playTone(bassFreq, 'triangle', 0.28, 0.35, this.musicGain, t);
      }

      // Smooth chord pad on quarter beats
      if (beat % 4 === 0) {
        const chords = [
          [this.notes.C4, this.notes.E4, this.notes.G4, this.notes.B4],
          [this.notes.A3, this.notes.C4, this.notes.E4, this.notes.G4],
          [this.notes.F3, this.notes.A3, this.notes.C4, this.notes.E4],
          [this.notes.G3, this.notes.B3, this.notes.D4, this.notes.F4],
        ];
        const chord = chords[bar];
        chord.forEach((freq, idx) => {
          this.playTone(freq, 'sine', 0.45, 0.08, this.musicGain!, t + idx * 0.01);
        });
      }

      // Catchy trendy lead melody
      const melodyMap: Record<number, number> = {
        0: this.notes.E5, 2: this.notes.G5, 4: this.notes.A5, 7: this.notes.G5,
        10: this.notes.E5, 12: this.notes.D5, 14: this.notes.C5,
        16: this.notes.C5, 18: this.notes.E5, 20: this.notes.G5, 22: this.notes.A5,
        26: this.notes.G5, 28: this.notes.E5,
        32: this.notes.A5, 34: this.notes.C5, 36: this.notes.E5, 39: this.notes.D5,
        42: this.notes.C5, 44: this.notes.A4,
        48: this.notes.B4, 50: this.notes.D5, 52: this.notes.F5, 55: this.notes.E5,
        58: this.notes.D5, 60: this.notes.C5, 62: this.notes.D5,
      };
      if (melodyMap[s]) {
        this.playTone(melodyMap[s], 'triangle', 0.18, 0.18, this.musicGain, t);
      }

      // Subtle lofi percussion
      if (beat === 0 || beat === 8) {
        this.playDrum('kick', 0.22, t);
      }
      if (beat === 4 || beat === 12) {
        this.playDrum('snare', 0.15, t);
      }
      if (beat % 2 === 0) {
        this.playDrum('hihat', 0.06, t);
      }

    } else if (track === 'forest') {
      // Groovy synthwave adventure: Dm - Bb - Gm - A7
      const bar = Math.floor(s / 16) % 4;
      const beat = s % 16;

      // Arpeggiated bassline
      const bassArps = [
        [this.notes.D3, this.notes.A3, this.notes.D4, this.notes.A3],
        [this.notes.Bb3 / 2, this.notes.F3, this.notes.Bb3, this.notes.F3],
        [this.notes.G3 / 2, this.notes.D3, this.notes.G3, this.notes.D3],
        [this.notes.A3 / 2, this.notes.E3, this.notes.A3, this.notes.E3],
      ];
      const bassNote = bassArps[bar][Math.floor(beat / 4)];
      if (beat % 2 === 0) {
        this.playTone(bassNote, 'sawtooth', 0.14, 0.18, this.musicGain, t, 600);
      }

      // Atmospheric pad
      if (beat === 0) {
        const pads = [
          [this.notes.D4, this.notes.F4, this.notes.A4],
          [this.notes.Bb3, this.notes.D4, this.notes.F4],
          [this.notes.G3, this.notes.Bb3, this.notes.D4],
          [this.notes.A3, this.notes.Cs4 || 277.18, this.notes.E4],
        ];
        pads[bar].forEach(freq => this.playTone(freq, 'sine', 0.6, 0.09, this.musicGain!, t));
      }

      // Synth arp lead
      const arpLead = [this.notes.D5, this.notes.F5, this.notes.A5, this.notes.D5];
      if (beat % 4 === 2) {
        this.playTone(arpLead[beat % 4], 'sine', 0.15, 0.12, this.musicGain, t);
      }

      // Beat
      if (beat === 0 || beat === 8) this.playDrum('kick', 0.25, t);
      if (beat === 4 || beat === 12) this.playDrum('snare', 0.18, t);
      if (beat % 2 === 0) this.playDrum('hihat', 0.08, t);

    } else if (track === 'ashen') {
      // Dark cinematic pulse: Cm - Ab - Fm - G
      const bar = Math.floor(s / 16) % 4;
      const beat = s % 16;

      if (beat % 4 === 0) {
        const root = [this.notes.C3, this.notes.Ab3 / 2, this.notes.F3 / 2, this.notes.G3 / 2][bar];
        this.playTone(root, 'sawtooth', 0.25, 0.25, this.musicGain, t, 350);
      }
      if (beat === 8) {
        this.playDrum('snare', 0.15, t);
      }
      if (beat % 2 === 0) {
        this.playDrum('hihat', 0.04, t);
      }
      if (s % 8 === 4) {
        this.playTone(this.notes.Eb4, 'sine', 0.35, 0.1, this.musicGain, t);
      }

    } else if (track === 'boss') {
      // High-energy epic cyberpunk / synthwave battle theme (135 BPM)
      const beat = s % 16;
      const bar = Math.floor(s / 16) % 4;

      // Heavy 16th pumping bass
      const bossBass = [this.notes.D3, this.notes.F3, this.notes.G3, this.notes.A3][bar];
      this.playTone(bossBass, 'sawtooth', 0.1, 0.28, this.musicGain, t, 800);

      // Fast arpeggiated synth
      const arpPatterns = [
        [this.notes.D4, this.notes.F4, this.notes.A4, this.notes.D5],
        [this.notes.F4, this.notes.Ab4, this.notes.C5, this.notes.F5],
        [this.notes.G4, this.notes.Bb4, this.notes.D5, this.notes.G5],
        [this.notes.A4, this.notes.Cs5 || 554.37, this.notes.E5, this.notes.A5],
      ];
      const curArp = arpPatterns[bar];
      this.playTone(curArp[s % 4], 'square', 0.08, 0.12, this.musicGain, t, 1200);

      // Driving drum kit
      if (beat % 4 === 0) this.playDrum('kick', 0.38, t);
      if (beat === 4 || beat === 12) this.playDrum('snare', 0.28, t);
      this.playDrum('hihat', beat % 2 === 0 ? 0.12 : 0.06, t);
    }

    this.step = (this.step + 1) % 64;
  }

  // Play tone with envelope and optional low-pass filter
  private playTone(
    freq: number,
    type: OscillatorType,
    duration: number,
    gainLevel: number,
    destination: GainNode,
    time: number,
    filterFreq?: number
  ) {
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0.001, time);
      gain.gain.exponentialRampToValueAtTime(gainLevel, time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

      if (filterFreq) {
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(filterFreq, time);
        osc.connect(filter);
        filter.connect(gain);
      } else {
        osc.connect(gain);
      }

      gain.connect(destination);
      osc.start(time);
      osc.stop(time + duration + 0.05);
    } catch {
      // Ignore audio scheduling blips
    }
  }

  // Synthesized percussion sounds
  private playDrum(drum: 'kick' | 'snare' | 'hihat', volume: number, time: number) {
    if (!this.ctx || !this.musicGain) return;

    if (drum === 'kick') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.frequency.setValueAtTime(140, time);
      osc.frequency.exponentialRampToValueAtTime(32, time + 0.12);

      gain.gain.setValueAtTime(volume, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.14);

      osc.connect(gain);
      gain.connect(this.musicGain);
      osc.start(time);
      osc.stop(time + 0.15);

    } else if (drum === 'snare') {
      // Noise burst + tone
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(190, time);
      osc.frequency.exponentialRampToValueAtTime(80, time + 0.08);

      gain.gain.setValueAtTime(volume * 0.7, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

      osc.connect(gain);
      gain.connect(this.musicGain);
      osc.start(time);
      osc.stop(time + 0.12);

      // Noise component
      this.playNoise(0.08, volume * 0.6, time, 3000);

    } else if (drum === 'hihat') {
      this.playNoise(0.03, volume, time, 7000);
    }
  }

  private playNoise(duration: number, volume: number, time: number, highpassFreq: number) {
    if (!this.ctx || !this.musicGain) return;
    try {
      const bufferSize = Math.floor(this.ctx.sampleRate * duration);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(highpassFreq, time);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(volume, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      noise.start(time);
    } catch {
      // Ignore
    }
  }

  // --- Sound Effects (SFX) ---

  public playSwordSwing() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.16);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(900, t);
    filter.Q.value = 3;

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.7, t + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.18);
  }

  public playEnemyHit(isCrit = false) {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const t = this.ctx.currentTime;

    // Crunch impact
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = isCrit ? 'sawtooth' : 'square';
    osc.frequency.setValueAtTime(isCrit ? 220 : 160, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.12);

    gain.gain.setValueAtTime(this.sfxVolume * (isCrit ? 0.9 : 0.6), t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.16);
  }

  public playPlayerHurt() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.2);

    gain.gain.setValueAtTime(this.sfxVolume * 0.8, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.25);
  }

  public playLevelUp() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const t = this.ctx.currentTime;
    const arpeggio = [this.notes.C4, this.notes.E4, this.notes.G4, this.notes.C5, this.notes.E5, this.notes.G5];
    arpeggio.forEach((freq, idx) => {
      this.playTone(freq, 'triangle', 0.35, this.sfxVolume * 0.8, this.sfxGain!, t + idx * 0.08);
    });
  }

  public playCoin() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const t = this.ctx.currentTime;
    this.playTone(this.notes.B5, 'sine', 0.12, this.sfxVolume * 0.5, this.sfxGain, t);
    this.playTone(this.notes.E5 * 2, 'sine', 0.22, this.sfxVolume * 0.6, this.sfxGain, t + 0.06);
  }

  public playChestOpen() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const t = this.ctx.currentTime;
    // Creak then sparkle
    this.playTone(180, 'sawtooth', 0.15, this.sfxVolume * 0.4, this.sfxGain, t, 500);
    this.playTone(this.notes.G5, 'triangle', 0.25, this.sfxVolume * 0.6, this.sfxGain, t + 0.12);
    this.playTone(this.notes.C5 * 2, 'sine', 0.35, this.sfxVolume * 0.7, this.sfxGain, t + 0.2);
  }

  public playPotion() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const t = this.ctx.currentTime;
    [this.notes.C4, this.notes.F4, this.notes.A4, this.notes.C5].forEach((freq, i) => {
      this.playTone(freq, 'sine', 0.15, this.sfxVolume * 0.4, this.sfxGain!, t + i * 0.05);
    });
  }

  public playClick() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const t = this.ctx.currentTime;
    this.playTone(600, 'sine', 0.04, this.sfxVolume * 0.3, this.sfxGain, t);
  }

  public playBossExplosion() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const t = this.ctx.currentTime;
    this.playNoise(0.6, this.sfxVolume * 0.9, t, 200);
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(25, t + 0.55);
    gain.gain.setValueAtTime(this.sfxVolume * 0.8, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.65);
  }

  // --- POPULAR GUN SOUNDS ---

  /** 1. Tactical 9mm Pistol: Snappy, crisp pop with slide click */
  public playPistolShot() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const t = this.ctx.currentTime;

    // Transient crack
    this.playNoise(0.05, this.sfxVolume * 0.85, t, 1600);

    // Punchy pop
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(55, t + 0.09);

    gain.gain.setValueAtTime(this.sfxVolume * 0.75, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.11);

    // Slide clack
    this.playTone(850, 'sawtooth', 0.02, this.sfxVolume * 0.25, this.sfxGain, t + 0.04);
  }

  /** 2. Combat Shotgun: Heavy concussive blast + mechanical pump rack */
  public playShotgunShot() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const t = this.ctx.currentTime;

    // Massive noise explosion
    this.playNoise(0.22, this.sfxVolume * 1.1, t, 600);

    // Sub-bass thump
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.2);

    gain.gain.setValueAtTime(this.sfxVolume * 0.9, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.24);

    // Pump rack (slide back + forward)
    this.playTone(480, 'square', 0.04, this.sfxVolume * 0.35, this.sfxGain, t + 0.22);
    this.playTone(620, 'square', 0.04, this.sfxVolume * 0.35, this.sfxGain, t + 0.31);
  }

  /** 3. AK-47 / Tactical Assault Rifle: Heavy metallic automatic thuds */
  public playAssaultRifleShot() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const t = this.ctx.currentTime;

    // Metallic crack
    this.playNoise(0.065, this.sfxVolume * 0.85, t, 1200);

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.1);

    gain.gain.setValueAtTime(this.sfxVolume * 0.7, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.11);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.12);
  }

  /** 4. Heavy .50 Sniper Rifle: Thunderous sonic boom crack with echoing sub-bass */
  public playSniperShot() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const t = this.ctx.currentTime;

    // Supersonic crack
    this.playNoise(0.12, this.sfxVolume * 1.3, t, 2800);

    // Concussive sub boom
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(20, t + 0.45);

    gain.gain.setValueAtTime(this.sfxVolume * 1.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.48);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.5);

    // Bolt cycle
    this.playTone(720, 'triangle', 0.05, this.sfxVolume * 0.3, this.sfxGain, t + 0.4);
    this.playTone(540, 'triangle', 0.05, this.sfxVolume * 0.3, this.sfxGain, t + 0.55);
  }

  /** 5. MP5 / SMG: Blistering fast buzzing chatter */
  public playSMGShot() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const t = this.ctx.currentTime;

    this.playNoise(0.038, this.sfxVolume * 0.65, t, 2000);

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(340, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.06);

    gain.gain.setValueAtTime(this.sfxVolume * 0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.08);
  }

  /** 6. RPG-7 Rocket Launcher: Screaming rocket ignition whoosh */
  public playRocketLaunch() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const t = this.ctx.currentTime;

    // Ignition roar
    this.playNoise(0.35, this.sfxVolume * 0.8, t, 500);

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(80, t);
    osc.frequency.linearRampToValueAtTime(320, t + 0.25);
    osc.frequency.exponentialRampToValueAtTime(100, t + 0.38);

    gain.gain.setValueAtTime(this.sfxVolume * 0.7, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.42);
  }

  /** Rocket / Explosion Detonation */
  public playRocketExplosion() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const t = this.ctx.currentTime;

    this.playNoise(0.55, this.sfxVolume * 1.1, t, 350);

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(25, t + 0.5);

    gain.gain.setValueAtTime(this.sfxVolume * 0.95, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.58);
  }

  /** 7. Plasma Rifle / Sci-Fi Laser: High-tech ionization beam */
  public playLaserShot() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1400, t);
    osc.frequency.exponentialRampToValueAtTime(180, t + 0.16);

    gain.gain.setValueAtTime(this.sfxVolume * 0.75, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  /** Weapon Reload Sound: Mag eject, mag insert, bolt slide */
  public playReload() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const t = this.ctx.currentTime;

    // Mag out
    this.playTone(380, 'triangle', 0.05, this.sfxVolume * 0.4, this.sfxGain, t);
    // Mag click in
    this.playTone(650, 'sawtooth', 0.06, this.sfxVolume * 0.5, this.sfxGain, t + 0.3);
    // Slide rack
    this.playTone(880, 'square', 0.05, this.sfxVolume * 0.45, this.sfxGain, t + 0.6);
  }

  /** Dry fire click when ammo is 0 */
  public playEmptyGun() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const t = this.ctx.currentTime;
    this.playTone(750, 'square', 0.03, this.sfxVolume * 0.35, this.sfxGain, t);
  }

  /** Tactical Dash / Dodge Roll Whoosh */
  public playDash() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(240, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.2);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, t);
    filter.frequency.exponentialRampToValueAtTime(200, t + 0.2);

    gain.gain.setValueAtTime(this.sfxVolume * 0.65, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.24);
  }

  /** Hit marker tick for successful bullet hit */
  public playHitMarker() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const t = this.ctx.currentTime;
    this.playTone(1850, 'sine', 0.035, this.sfxVolume * 0.35, this.sfxGain, t);
  }

  /** Tesla Arc Shock */
  public playTeslaShock() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const t = this.ctx.currentTime;
    this.playNoise(0.08, this.sfxVolume * 0.6, t, 1200);
    this.playTone(880, 'sawtooth', 0.07, this.sfxVolume * 0.5, this.sfxGain, t);
    this.playTone(1760, 'square', 0.05, this.sfxVolume * 0.3, this.sfxGain, t + 0.02);
  }

  /** Flame Pyrocaster Burn */
  public playFlameBurn() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const t = this.ctx.currentTime;
    this.playNoise(0.12, this.sfxVolume * 0.45, t, 400);
  }

  /** Heavy Minigun Spin Shot */
  public playMinigunShot() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const t = this.ctx.currentTime;
    this.playNoise(0.04, this.sfxVolume * 0.7, t, 1000);
    this.playTone(280, 'sawtooth', 0.035, this.sfxVolume * 0.6, this.sfxGain, t);
  }

  /** Quantum Railgun Hyper-Beam */
  public playRailgunFire() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const t = this.ctx.currentTime;
    this.playTone(2400, 'sine', 0.12, this.sfxVolume * 0.9, this.sfxGain, t);
    this.playNoise(0.35, this.sfxVolume * 1.1, t, 450);
    this.playTone(85, 'sawtooth', 0.4, this.sfxVolume * 0.8, this.sfxGain, t + 0.05);
  }

  /** Cryo Freeze Frost Beam */
  public playCryoBeam() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const t = this.ctx.currentTime;
    this.playTone(1200, 'triangle', 0.1, this.sfxVolume * 0.4, this.sfxGain, t);
    this.playNoise(0.08, this.sfxVolume * 0.35, t, 2200);
  }

  public playCryoShot() {
    this.playCryoBeam();
  }

  public playRailgunShot() {
    this.playRailgunFire();
  }

  public playOrbitalStrike() {
    this.playOrbitalBeam();
  }

  public playFlamethrower() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const t = this.ctx.currentTime;
    this.playNoise(0.12, this.sfxVolume * 0.4, t, 900);
    this.playTone(140, 'sawtooth', 0.08, this.sfxVolume * 0.3, this.sfxGain, t);
  }

  /** Sawblade Throw / Buzz */
  public playSawblade() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const t = this.ctx.currentTime;
    this.playTone(550, 'sawtooth', 0.09, this.sfxVolume * 0.5, this.sfxGain, t);
    this.playTone(1100, 'square', 0.05, this.sfxVolume * 0.3, this.sfxGain, t + 0.03);
  }

  /** Orbital Strike Laser Ignition */
  public playOrbitalBeam() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const t = this.ctx.currentTime;
    this.playTone(180, 'sine', 0.8, this.sfxVolume * 1.0, this.sfxGain, t);
    this.playNoise(0.7, this.sfxVolume * 1.2, t + 0.2, 300);
  }

  /** Cyber Hacking Execution */
  public playHackSuccess() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const t = this.ctx.currentTime;
    this.playTone(523, 'sine', 0.06, this.sfxVolume * 0.45, this.sfxGain, t);
    this.playTone(659, 'sine', 0.06, this.sfxVolume * 0.45, this.sfxGain, t + 0.06);
    this.playTone(784, 'sine', 0.06, this.sfxVolume * 0.45, this.sfxGain, t + 0.12);
    this.playTone(1046, 'square', 0.12, this.sfxVolume * 0.5, this.sfxGain, t + 0.18);
  }

  /** Vehicle Engine Start / Throttle */
  public playVehicleMount() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const t = this.ctx.currentTime;
    this.playTone(85, 'sawtooth', 0.3, this.sfxVolume * 0.6, this.sfxGain, t);
    this.playTone(130, 'square', 0.25, this.sfxVolume * 0.5, this.sfxGain, t + 0.15);
  }

  /** Factory Building Placed */
  public playBuildingConstructed() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const t = this.ctx.currentTime;
    this.playTone(330, 'triangle', 0.08, this.sfxVolume * 0.5, this.sfxGain, t);
    this.playTone(440, 'triangle', 0.08, this.sfxVolume * 0.5, this.sfxGain, t + 0.08);
    this.playTone(660, 'sine', 0.14, this.sfxVolume * 0.55, this.sfxGain, t + 0.16);
  }

  /** Gun Equip / Swap */
  public playEquipGun() {
    this.playClick();
  }

  /** Out of Ammo / Failed Action */
  public playOutOfAmmo() {
    this.playEmptyGun();
  }

  /** Tactical Radio Comms Transceiver Squawk / Squelch In */
  public playRadioIn() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const t = this.ctx.currentTime;
    // Walkie-talkie high double-pip beep
    this.playTone(1760, 'sine', 0.04, this.sfxVolume * 0.4, this.sfxGain, t);
    this.playTone(2200, 'sine', 0.05, this.sfxVolume * 0.45, this.sfxGain, t + 0.04);
    this.playNoise(0.06, this.sfxVolume * 0.15, t + 0.08, 1800);
  }

  /** Tactical Radio Comms Click / Squelch Out */
  public playRadioOut() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const t = this.ctx.currentTime;
    // Walkie-talkie release click & low static burst
    this.playNoise(0.05, this.sfxVolume * 0.18, t, 1200);
    this.playTone(880, 'sine', 0.04, this.sfxVolume * 0.35, this.sfxGain, t + 0.03);
  }

  /** Territory Liberated / Conquered Triumphant Fanfare */
  public playTerritoryConquered() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const t = this.ctx.currentTime;
    const root = 330;
    this.playTone(root, 'triangle', 0.12, this.sfxVolume * 0.6, this.sfxGain, t);
    this.playTone(root * 1.25, 'triangle', 0.12, this.sfxVolume * 0.65, this.sfxGain, t + 0.1);
    this.playTone(root * 1.5, 'triangle', 0.14, this.sfxVolume * 0.7, this.sfxGain, t + 0.2);
    this.playTone(root * 2.0, 'square', 0.25, this.sfxVolume * 0.75, this.sfxGain, t + 0.32);
  }

  /** Enemy mob gunfire burst */
  public playMobGunfire() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const t = this.ctx.currentTime;
    this.playNoise(0.04, this.sfxVolume * 0.35, t, 1400);
    this.playTone(180, 'sawtooth', 0.05, this.sfxVolume * 0.4, this.sfxGain, t);
  }

  /** Enemy mob tactical roll */
  public playMobRoll() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const t = this.ctx.currentTime;
    this.playNoise(0.08, this.sfxVolume * 0.2, t, 600);
  }

  /** Player heal / revive sound */
  public playHeal() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const t = this.ctx.currentTime;
    this.playTone(523.25, 'sine', 0.12, this.sfxVolume * 0.5, this.sfxGain, t);
    this.playTone(659.25, 'sine', 0.14, this.sfxVolume * 0.55, this.sfxGain, t + 0.08);
    this.playTone(783.99, 'sine', 0.2, this.sfxVolume * 0.6, this.sfxGain, t + 0.16);
  }
}

export const soundManager = new SoundManager();
