// Web Audio API emergency sound synthesizer
class EmergencySoundPlayer {
  private ctx: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private intervalId: number | null = null;
  private isPlaying: boolean = false;

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playSiren() {
    if (this.isPlaying) return;
    this.initContext();
    if (!this.ctx) return;

    this.isPlaying = true;
    this.oscillator = this.ctx.createOscillator();
    this.gainNode = this.ctx.createGain();

    this.oscillator.type = 'sawtooth';
    this.oscillator.frequency.setValueAtTime(600, this.ctx.currentTime);
    this.gainNode.gain.setValueAtTime(0.3, this.ctx.currentTime);

    this.oscillator.connect(this.gainNode);
    this.gainNode.connect(this.ctx.destination);
    this.oscillator.start();

    // Modulate pitch between 600Hz and 1200Hz
    let high = true;
    this.intervalId = window.setInterval(() => {
      if (!this.ctx || !this.oscillator) return;
      const targetFreq = high ? 1200 : 650;
      this.oscillator.frequency.exponentialRampToValueAtTime(
        targetFreq,
        this.ctx.currentTime + 0.4
      );
      high = !high;
    }, 450);
  }

  public playBeep(freq: number = 880, duration: number = 0.3) {
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  public playUrgentDistressPulse() {
    this.initContext();
    if (!this.ctx) return;

    // 3 rapid warning chirps
    const now = this.ctx.currentTime;
    for (let i = 0; i < 3; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, now + i * 0.18);
      osc.frequency.exponentialRampToValueAtTime(1600, now + i * 0.18 + 0.12);

      gain.gain.setValueAtTime(0.35, now + i * 0.18);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.18 + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + i * 0.18);
      osc.stop(now + i * 0.18 + 0.16);
    }
  }

  public playBroadcastHandshake() {
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 chime
    freqs.forEach((f, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + idx * 0.08);

      gain.gain.setValueAtTime(0.2, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.005, now + idx * 0.08 + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.35);
    });
  }

  public stopSiren() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.oscillator) {
      try {
        this.oscillator.stop();
        this.oscillator.disconnect();
      } catch (e) {}
      this.oscillator = null;
    }
    this.isPlaying = false;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const soundPlayer = new EmergencySoundPlayer();
