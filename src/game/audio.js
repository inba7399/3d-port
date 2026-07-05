// ---------------------------------------------------------------------------
// Tiny WebAudio "theme park" loop + UI blips — no audio files needed.
// Everything is synthesized: soft triangle-wave arpeggios over a I–V–vi–IV
// progression with a gentle sine bass. Volumes are deliberately low.
// ---------------------------------------------------------------------------

const store = {
  ctx: null,
  master: null,
  musicGain: null,
  sfxGain: null,
  timer: null,
  nextBarTime: 0,
  bar: 0,
  music: localStorage.getItem('park-music') !== 'off',
  sfx: localStorage.getItem('park-sfx') !== 'off',
};

// C major-ish, one chord per bar: C, G, Am, F (frequencies in Hz).
const CHORDS = [
  [261.63, 329.63, 392.0, 523.25],
  [196.0, 246.94, 392.0, 493.88],
  [220.0, 261.63, 329.63, 440.0],
  [174.61, 220.0, 349.23, 440.0],
];
const BASS = [130.81, 98.0, 110.0, 87.31];
const BAR_SECONDS = 2.4; // ~100bpm, 4 beats

function note(freq, when, dur, vol, type, dest) {
  const { ctx } = store;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, when);
  gain.gain.linearRampToValueAtTime(vol, when + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + dur);
  osc.connect(gain).connect(dest);
  osc.start(when);
  osc.stop(when + dur + 0.05);
}

function scheduleBar(barIndex, when) {
  const chord = CHORDS[barIndex % 4];
  const bass = BASS[barIndex % 4];
  const g = store.musicGain;

  note(bass, when, BAR_SECONDS * 0.9, 0.05, 'sine', g);
  // Up-down arpeggio, 8 eighth notes.
  const order = [0, 1, 2, 3, 2, 3, 1, 2];
  for (let i = 0; i < 8; i++) {
    const t = when + (i * BAR_SECONDS) / 8;
    note(chord[order[i]], t, 0.34, 0.032, 'triangle', g);
  }
  // A sparkle high note every other bar.
  if (barIndex % 2 === 1) {
    note(chord[2] * 2, when + BAR_SECONDS * 0.5, 0.5, 0.02, 'sine', g);
  }
}

function pump() {
  const { ctx } = store;
  // Keep two bars scheduled ahead.
  while (store.nextBarTime < ctx.currentTime + BAR_SECONDS * 2) {
    scheduleBar(store.bar, store.nextBarTime);
    store.bar += 1;
    store.nextBarTime += BAR_SECONDS;
  }
}

export const audio = {
  get music() {
    return store.music;
  },
  get sfx() {
    return store.sfx;
  },

  // Must be called from a user gesture (the "Enter the park" click).
  init() {
    if (store.ctx) {
      store.ctx.resume();
      return;
    }
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    store.ctx = new Ctx();
    store.master = store.ctx.createGain();
    store.master.gain.value = 1;
    store.master.connect(store.ctx.destination);

    store.musicGain = store.ctx.createGain();
    store.musicGain.gain.value = store.music ? 1 : 0;
    store.musicGain.connect(store.master);

    store.sfxGain = store.ctx.createGain();
    store.sfxGain.gain.value = store.sfx ? 1 : 0;
    store.sfxGain.connect(store.master);

    store.nextBarTime = store.ctx.currentTime + 0.1;
    pump();
    store.timer = setInterval(pump, 600);
  },

  setMusic(on) {
    store.music = on;
    localStorage.setItem('park-music', on ? 'on' : 'off');
    if (store.musicGain) {
      store.musicGain.gain.linearRampToValueAtTime(on ? 1 : 0, store.ctx.currentTime + 0.2);
    }
  },

  setSfx(on) {
    store.sfx = on;
    localStorage.setItem('park-sfx', on ? 'on' : 'off');
    if (store.sfxGain) store.sfxGain.gain.value = on ? 1 : 0;
  },

  // --- UI blips -----------------------------------------------------------
  pop() {
    if (!store.ctx) return;
    const t = store.ctx.currentTime;
    note(660, t, 0.09, 0.12, 'sine', store.sfxGain);
    note(880, t + 0.05, 0.1, 0.09, 'sine', store.sfxGain);
  },
  close() {
    if (!store.ctx) return;
    const t = store.ctx.currentTime;
    note(520, t, 0.09, 0.1, 'sine', store.sfxGain);
    note(390, t + 0.05, 0.1, 0.08, 'sine', store.sfxGain);
  },
  whoosh() {
    if (!store.ctx) return;
    const t = store.ctx.currentTime;
    for (let i = 0; i < 5; i++) note(300 + i * 90, t + i * 0.03, 0.12, 0.05, 'triangle', store.sfxGain);
  },
  tada() {
    if (!store.ctx) return;
    const t = store.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => note(f, t + i * 0.09, 0.35, 0.09, 'triangle', store.sfxGain));
  },
};
