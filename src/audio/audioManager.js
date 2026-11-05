export class AudioManager {
  constructor() {
    this.context = null;
    this.master = null;
    this.started = false;
  }

  ensure() {
    if (!this.context) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.context = new AudioCtx();
      this.master = this.context.createGain();
      this.master.gain.value = 0.08;
      this.master.connect(this.context.destination);
    }
    if (this.context.state === 'suspended') this.context.resume();
  }

  tone(freq, duration, type = 'sawtooth', gain = 0.04, ramp = 0.02) {
    this.ensure();
    if (!this.context) return;
    const osc = this.context.createOscillator();
    const g = this.context.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.value = 0.0001;
    osc.connect(g);
    g.connect(this.master);
    const now = this.context.currentTime;
    g.gain.cancelScheduledValues(now);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(gain, now + ramp);
    g.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.start(now);
    osc.stop(now + duration);
  }

  playLaunch(kind) {
    if (kind === 'missile') this.tone(90, 0.22, 'sawtooth', 0.06, 0.02);
    if (kind === 'cannon') this.tone(380, 0.07, 'square', 0.03, 0.005);
    if (kind === 'rocket') this.tone(140, 0.25, 'triangle', 0.05, 0.03);
  }

  playExplosion() {
    this.tone(42, 0.35, 'sawtooth', 0.1, 0.02);
    this.tone(18, 0.5, 'square', 0.08, 0.04);
  }
}
