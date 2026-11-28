const SOUND_STORAGE_KEY = "onspot:sound-enabled";

let sharedAudioCtx = null;
let cachedOpenerWavUrl = null;

function getAudioContext() {
  if (typeof window === "undefined") {
    return null;
  }
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) {
    return null;
  }
  if (!sharedAudioCtx) {
    try {
      sharedAudioCtx = new AudioCtx();
    } catch {
      return null;
    }
  }
  return sharedAudioCtx;
}

export function isSoundEnabled() {
  if (typeof window === "undefined") {
    return true;
  }
  try {
    return window.localStorage.getItem(SOUND_STORAGE_KEY) !== "false";
  } catch {
    return true;
  }
}

export function setSoundEnabled(enabled) {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(SOUND_STORAGE_KEY, enabled ? "true" : "false");
  } catch {
    // Ignore storage errors in restricted contexts.
  }
}

export async function ensureAudioRunning() {
  const ctx = getAudioContext();
  if (!ctx) {
    return null;
  }
  if (ctx.state === "suspended") {
    try {
      await ctx.resume();
    } catch {
      return null;
    }
  }
  return ctx.state === "running" ? ctx : null;
}

export function unlockAudio() {
  const ctx = getAudioContext();
  if (ctx && ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }
  return ctx;
}

function playTone(
  ctx,
  { freq, endFreq, type = "sine", start = 0, duration = 0.08, gain = 0.2 }
) {
  const now = ctx.currentTime + start;
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  if (endFreq) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), now + duration);
  }

  amp.gain.setValueAtTime(0.0001, now);
  amp.gain.linearRampToValueAtTime(gain, now + 0.005);
  amp.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  osc.connect(amp);
  amp.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + duration + 0.02);
}

// Build a clean PCM WAV data URL for the 3-note opener chime so <audio>.play() can be tried on load.
function getOpenerWavUrl() {
  if (cachedOpenerWavUrl || typeof window === "undefined") {
    return cachedOpenerWavUrl;
  }

  const sampleRate = 22050;
  const totalSec = 0.9;
  const numSamples = Math.floor(sampleRate * totalSec);
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  function writeStr(offset, str) {
    for (let i = 0; i < str.length; i += 1) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  }

  writeStr(0, "RIFF");
  view.setUint32(4, 36 + numSamples * 2, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, numSamples * 2, true);

  const notes = [
    { freq: 349.23, start: 0.04, dur: 0.45, amp: 0.16 },
    { freq: 440.0, start: 0.12, dur: 0.48, amp: 0.16 },
    { freq: 523.25, start: 0.2, dur: 0.6, amp: 0.18 }
  ];

  for (let i = 0; i < numSamples; i += 1) {
    const t = i / sampleRate;
    let sample = 0;
    for (const note of notes) {
      if (t >= note.start && t <= note.start + note.dur) {
        const localT = t - note.start;
        const env = Math.min(1, localT / 0.012) * Math.exp(-4.5 * localT);
        sample += Math.sin(2 * Math.PI * note.freq * localT) * note.amp * env;
      }
    }
    const clamped = Math.max(-1, Math.min(1, sample));
    view.setInt16(44 + i * 2, clamped * 32767, true);
  }

  const blob = new Blob([buffer], { type: "audio/wav" });
  cachedOpenerWavUrl = URL.createObjectURL(blob);
  return cachedOpenerWavUrl;
}

// Crisp, dry mechanical/tactile tap (short filtered impulse, no musical pitch sweep)
export async function playClickSound() {
  if (!isSoundEnabled()) {
    return;
  }
  const ctx = await ensureAudioRunning();
  if (!ctx) {
    return;
  }

  const duration = 0.016;
  const sampleCount = Math.max(1, Math.floor(ctx.sampleRate * duration));
  const buffer = ctx.createBuffer(1, sampleCount, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < sampleCount; i += 1) {
    const env = 1 - i / sampleCount;
    data[i] = (Math.random() * 2 - 1) * env * env;
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 1800;
  filter.Q.value = 1.4;

  const amp = ctx.createGain();
  const now = ctx.currentTime;
  amp.gain.setValueAtTime(0.32, now);
  amp.gain.exponentialRampToValueAtTime(0.001, now + duration);

  source.connect(filter);
  filter.connect(amp);
  amp.connect(ctx.destination);

  source.start(now);
  source.stop(now + duration + 0.005);
}

export async function playSurpriseSound() {
  if (!isSoundEnabled()) {
    return;
  }
  const ctx = await ensureAudioRunning();
  if (!ctx) {
    return;
  }

  playClickSound();
  playTone(ctx, { freq: 587.33, type: "sine", start: 0.02, duration: 0.14, gain: 0.14 });
  playTone(ctx, { freq: 880.0, type: "sine", start: 0.08, duration: 0.22, gain: 0.16 });
}

export async function playCloudWhooshSound() {
  if (!isSoundEnabled()) {
    return;
  }
  const ctx = getAudioContext();
  if (!ctx || ctx.state !== "running") {
    return;
  }

  const duration = 0.65;
  const sampleCount = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, sampleCount, ctx.sampleRate);
  const channel = buffer.getChannelData(0);

  let lastOut = 0;
  for (let i = 0; i < sampleCount; i += 1) {
    const white = Math.random() * 2 - 1;
    lastOut = (lastOut + 0.05 * white) / 1.05;
    channel[i] = lastOut * 2.4;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.Q.value = 0.8;
  const now = ctx.currentTime;
  filter.frequency.setValueAtTime(280, now);
  filter.frequency.exponentialRampToValueAtTime(760, now + 0.25);
  filter.frequency.exponentialRampToValueAtTime(220, now + duration);

  const amp = ctx.createGain();
  amp.gain.setValueAtTime(0.0001, now);
  amp.gain.linearRampToValueAtTime(0.16, now + 0.14);
  amp.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  noise.connect(filter);
  filter.connect(amp);
  amp.connect(ctx.destination);

  noise.start(now);
  noise.stop(now + duration + 0.02);
}

export async function playOpenerSound() {
  if (!isSoundEnabled()) {
    return false;
  }

  // Try standard HTML5 Audio first (counts toward Chrome Media Engagement Index).
  const wavUrl = getOpenerWavUrl();
  if (wavUrl) {
    try {
      const audio = new Audio(wavUrl);
      audio.volume = 0.85;
      await audio.play();
      return true;
    } catch {
      // Blocked by browser autoplay policy; fall through to AudioContext check.
    }
  }

  const ctx = getAudioContext();
  if (!ctx) {
    return false;
  }

  if (ctx.state === "suspended") {
    await Promise.race([
      ctx.resume().catch(() => {}),
      new Promise(resolve => window.setTimeout(resolve, 60))
    ]);
  }

  if (ctx.state !== "running") {
    return false;
  }

  playTone(ctx, { freq: 349.23, type: "sine", start: 0.06, duration: 0.42, gain: 0.16 });
  playTone(ctx, { freq: 440.0, type: "sine", start: 0.14, duration: 0.45, gain: 0.16 });
  playTone(ctx, { freq: 523.25, type: "sine", start: 0.22, duration: 0.55, gain: 0.18 });
  return true;
}
