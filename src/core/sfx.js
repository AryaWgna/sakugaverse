// Subtle synthesized anime chimes/impacts + 3 procedural Web Audio ambient modes (rain / campfire / space)
let ctx = null;
let enabled = true;
let ambientNodes = [];
let ambientGain = null;
let ambientOn = false;
let ambientMode = 'rain';
let ambientVol = 0.22;

function getCtx() {
  if (!ctx && typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)) {
    const AC = window.AudioContext || window.webkitAudioContext;
    ctx = new AC();
  }
  if (ctx && ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function setSfxEnabled(val) {
  enabled = Boolean(val);
}

export function isAmbientPlaying() {
  return ambientOn;
}

export function getAmbientMode() {
  return ambientMode;
}

export function setAmbientVolume(v) {
  ambientVol = Math.max(0.02, Math.min(0.6, Number(v) || 0.22));
  if (ambientGain && ctx) {
    ambientGain.gain.setTargetAtTime(ambientVol, ctx.currentTime, 0.08);
  }
}

export function setAmbientMode(mode) {
  ambientMode = mode || 'rain';
  if (ambientOn) {
    toggleAmbient(false);
    toggleAmbient(true);
  }
}

function stopAmbientNodes() {
  ambientNodes.forEach((n) => {
    try { n.stop?.(); } catch {}
    try { n.disconnect?.(); } catch {}
  });
  ambientNodes = [];
  if (ambientGain) {
    try { ambientGain.disconnect(); } catch {}
    ambientGain = null;
  }
}

export function toggleAmbient(forceState) {
  const target = typeof forceState === 'boolean' ? forceState : !ambientOn;
  if (!target) {
    stopAmbientNodes();
    ambientOn = false;
    return false;
  }

  const ac = getCtx();
  if (!ac) return false;
  stopAmbientNodes();

  const master = ac.createGain();
  master.gain.setValueAtTime(0.001, ac.currentTime);
  master.gain.exponentialRampToValueAtTime(ambientVol, ac.currentTime + 0.5);
  master.connect(ac.destination);
  ambientGain = master;

  if (ambientMode === 'space') {
    // Deep Hyperbolic Time Chamber warm harmonic drone
    [110, 164.81, 220].forEach((freq, i) => {
      const osc = ac.createOscillator();
      const g = ac.createGain();
      osc.type = i === 0 ? 'sine' : 'triangle';
      osc.frequency.value = freq;
      g.gain.value = i === 0 ? 0.22 : 0.07;
      osc.connect(g);
      g.connect(master);
      osc.start();
      ambientNodes.push(osc, g);
    });
  } else {
    // Pink/Brown noise buffer for Rain or Campfire
    const bufSize = ac.sampleRate * 3;
    const buf = ac.createBuffer(1, bufSize, ac.sampleRate);
    const data = buf.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      let sample = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
      if (ambientMode === 'campfire' && Math.random() < 0.0007) {
        sample += (Math.random() * 2 - 1) * 0.35; // gentle crackle spark
      }
      data[i] = sample;
      b6 = white * 0.115926;
    }

    const src = ac.createBufferSource();
    src.buffer = buf;
    src.loop = true;

    const filter = ac.createBiquadFilter();
    filter.type = ambientMode === 'campfire' ? 'bandpass' : 'lowpass';
    filter.frequency.value = ambientMode === 'campfire' ? 380 : 780;
    filter.Q.value = ambientMode === 'campfire' ? 0.7 : 1;

    src.connect(filter);
    filter.connect(master);
    src.start();
    ambientNodes.push(src, filter);
  }

  ambientOn = true;
  return true;
}

export function playTone(type = 'chime') {
  if (!enabled) return;
  const ac = getCtx();
  if (!ac) return;

  const now = ac.currentTime;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.connect(gain);
  gain.connect(ac.destination);

  if (type === 'impact') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(190, now);
    osc.frequency.exponentialRampToValueAtTime(48, now + 0.22);
    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc.start(now);
    osc.stop(now + 0.26);
  } else if (type === 'fanfare') {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(freq, now + i * 0.08);
      g.gain.setValueAtTime(0.11, now + i * 0.08);
      g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.28);
      o.connect(g);
      g.connect(ac.destination);
      o.start(now + i * 0.08);
      o.stop(now + i * 0.08 + 0.3);
    });
  } else {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(660, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
    osc.start(now);
    osc.stop(now + 0.17);
  }
}
