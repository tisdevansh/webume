// A calm ambient score synthesised with the Web Audio API: a warm, slowly breathing
// pad that changes chord with each scene, with an occasional soft, distant chime.
// Voiced in the mid range so laptop and phone speakers carry it, pure sine tones only
// (detuned layers "beat" against each other, which gets tiring fast).
// No audio files, so nothing to license and nothing to download.

const VOLUME = 0.6;

const hz = (midi) => 440 * Math.pow(2, (midi - 69) / 12);

// One chord per scene: a soft bass note under an open mid-range voicing
const CHORDS = [
  { bass: 48, pad: [60, 64, 67, 71, 74] }, // Cmaj9
  { bass: 45, pad: [57, 60, 64, 67, 71] }, // Am9
  { bass: 41, pad: [57, 60, 64, 65, 69] }, // Fmaj7
  { bass: 50, pad: [62, 65, 69, 72, 76] }, // Dm9
  { bass: 52, pad: [59, 62, 64, 67, 71] }, // Em7
  { bass: 41, pad: [57, 60, 64, 67, 72] }, // Fmaj9
  { bass: 48, pad: [60, 64, 67, 71, 74] }, // Cmaj9
];

// C major pentatonic sits consonantly over every chord above
const CHIMES = [67, 69, 72, 74, 76, 79];

export class AmbientScore {
  constructor() {
    this.ctx = null;
    this.scene = 0;
    this.voices = [];
    this.muted = false;
    this.timer = null;
  }

  start() {
    if (this.ctx) {
      this.ctx.resume();
      return;
    }
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    this.ctx = ctx;

    // master -> gentle compressor -> speakers keeps it audible without ever getting sharp
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -20;
    comp.knee.value = 18;
    comp.ratio.value = 3;
    comp.attack.value = 0.02;
    comp.release.value = 0.4;
    comp.connect(ctx.destination);
    this.master = ctx.createGain();
    this.master.gain.value = 0;
    this.master.connect(comp);

    this.reverb = ctx.createConvolver();
    this.reverb.buffer = this.impulse(5, 2.6);
    const wet = ctx.createGain();
    wet.gain.value = 0.55;
    this.reverb.connect(wet).connect(this.master);

    // Pads pass through a slowly breathing low-pass before reaching the room
    this.padBus = ctx.createBiquadFilter();
    this.padBus.type = 'lowpass';
    this.padBus.frequency.value = 1000;
    this.padBus.Q.value = 0.2;
    const lfo = ctx.createOscillator();
    const lfoDepth = ctx.createGain();
    lfo.frequency.value = 0.03;
    lfoDepth.gain.value = 220;
    lfo.connect(lfoDepth).connect(this.padBus.frequency);
    lfo.start();
    const padDry = ctx.createGain();
    padDry.gain.value = 0.7;
    this.padBus.connect(padDry).connect(this.master);
    this.padBus.connect(this.reverb);

    // Chimes sit mostly in the reverb, so they feel far away
    this.chimeBus = ctx.createGain();
    this.chimeBus.gain.value = 0.25;
    this.chimeBus.connect(this.master);
    this.chimeBus.connect(this.reverb);

    this.startAir();
    this.playChord(this.scene);
    this.scheduleChime();
    this.fadeTo(this.muted ? 0 : VOLUME, 2.5);
  }

  setScene(index) {
    if (index === this.scene && this.voices.length) return;
    this.scene = index;
    if (this.ctx) this.playChord(index);
  }

  setMuted(muted) {
    this.muted = muted;
    if (!this.ctx) return;
    if (!muted) this.ctx.resume();
    this.fadeTo(muted ? 0 : VOLUME, muted ? 0.8 : 1.5);
  }

  setHidden(hidden) {
    if (!this.ctx) return;
    if (hidden) this.ctx.suspend();
    else this.ctx.resume();
  }

  stop() {
    clearTimeout(this.timer);
    if (this.ctx) this.ctx.close();
    this.ctx = null;
    this.voices = [];
  }

  fadeTo(value, seconds) {
    const gain = this.master.gain;
    const now = this.ctx.currentTime;
    gain.cancelScheduledValues(now);
    gain.setValueAtTime(gain.value, now);
    gain.linearRampToValueAtTime(value, now + seconds);
  }

  playChord(index) {
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const chord = CHORDS[index % CHORDS.length];

    // Let the previous chord ring out underneath the new one
    this.voices.forEach(({ gain, oscs }) => {
      gain.gain.cancelScheduledValues(now);
      gain.gain.setTargetAtTime(0, now, 1.2);
      oscs.forEach((osc) => osc.stop(now + 7));
      setTimeout(() => gain.disconnect(), 7500);
    });

    const notes = [{ midi: chord.bass, level: 0.1 }].concat(chord.pad.map((midi) => ({ midi, level: 0.05 })));
    this.voices = notes.map(({ midi, level }, n) => {
      const gain = ctx.createGain();
      gain.gain.value = 0;
      gain.gain.setTargetAtTime(level, now + n * 0.3, 2);
      gain.connect(this.padBus);
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = hz(midi);
      osc.connect(gain);
      osc.start(now);
      return { gain, oscs: [osc] };
    });
  }

  // Every few seconds, one soft chime: slow attack, long fade, never two close together
  scheduleChime() {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      if (this.ctx && this.ctx.state === 'running' && !this.muted) this.chime(CHIMES[Math.floor(Math.random() * CHIMES.length)]);
      this.scheduleChime();
    }, 4500 + Math.random() * 5000);
  }

  chime(midi) {
    const ctx = this.ctx;
    const at = ctx.currentTime + 0.05;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, at);
    gain.gain.linearRampToValueAtTime(0.12, at + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + 4.5);
    gain.connect(this.chimeBus);
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = hz(midi);
    osc.connect(gain);
    osc.start(at);
    osc.stop(at + 4.6);
    setTimeout(() => gain.disconnect(), 5000);
  }

  // Low brown noise, like distant wind, so the silence between notes feels warm
  startAir() {
    const ctx = this.ctx;
    const length = ctx.sampleRate * 4;
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < length; i++) {
      last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
      data[i] = last * 3.5;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 600;
    const gain = ctx.createGain();
    gain.gain.value = 0.025;
    source.connect(filter).connect(gain).connect(this.master);
    source.start();
  }

  impulse(seconds, decay) {
    const rate = this.ctx.sampleRate;
    const length = rate * seconds;
    const buffer = this.ctx.createBuffer(2, length, rate);
    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
    }
    return buffer;
  }
}
