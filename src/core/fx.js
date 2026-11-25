// Direct SakugaFX climax animations using window.SakugaFX + subtle screen shake

function getFX() {
  return typeof window !== 'undefined' ? window.SakugaFX : null;
}

function centerOf(el) {
  const fx = getFX();
  if (el && fx && typeof fx.at === 'function') {
    const pos = fx.at(el, 0.5, 0.5);
    if (pos.w > 0 && pos.h > 0) return pos;
  }
  return { x: window.scrollX + window.innerWidth / 2, y: window.scrollY + window.innerHeight * 0.35 };
}

export function screenShake() {
  const shell = document.querySelector('.app-shell');
  if (!shell) return;
  shell.classList.remove('sakuga-shake');
  void shell.offsetWidth;
  shell.classList.add('sakuga-shake');
  setTimeout(() => shell.classList.remove('sakuga-shake'), 280);
}

export function fxLevelUp(el) {
  const fx = getFX();
  if (!fx) return;
  const { x, y } = centerOf(el);
  fx.burst(x, y, { r: 72, spikes: 15, life: 0.48 });
  fx.shards(x, y, { n: 14, speed: 240, size: 6, life: 0.85, arc: Math.PI * 2 });
  fx.sfx('don', x, y - 48, { size: 78, rot: -0.1, life: 1.1 });
  for (let i = 0; i < 5; i++) {
    const ang = (i / 5) * Math.PI * 2;
    fx.kira(x + Math.cos(ang) * 58, y + Math.sin(ang) * 34, { r: 13, life: 0.75, col: '#ffe066' });
  }
  screenShake();
}

export function fxSSR(el) {
  const fx = getFX();
  if (!fx) return;
  const { x, y } = centerOf(el);
  fx.burst(x, y, { r: 95, spikes: 16, life: 0.52 });
  fx.ring(x, y, { rx: 95, ry: 34, life: 0.65, w: 6 });
  fx.shards(x, y, { n: 18, speed: 280, size: 6.5, life: 0.9, arc: Math.PI * 2 });
  fx.sfx('don', x, y - 64, { size: 88, rot: -0.12, life: 1.15 });
  for (let i = 0; i < 6; i++) {
    const ang = (i / 6) * Math.PI * 2;
    fx.kira(x + Math.cos(ang) * 90, y + Math.sin(ang) * 65, { r: 15, life: 0.85, col: '#ffe066' });
  }
  screenShake();
}

export function fxCombo(el) {
  const fx = getFX();
  if (!fx) return;
  const { x, y } = centerOf(el);
  fx.slash(x, y, { len: 140, ang: -0.42, life: 0.44, thick: 16 });
  fx.lines(x, y, { n: 10, dir: 0, len: 70, spread: 42, life: 0.36 });
  fx.shards(x, y, { n: 9, speed: 220, size: 5, life: 0.65 });
  screenShake();
}

export function fxCelebrate(el) {
  const fx = getFX();
  if (!fx) return;
  const { x, y } = centerOf(el);
  fx.puff(x - 36, y, { n: 5, size: 14, vx: -28, vy: -24, life: 0.75 });
  fx.puff(x + 36, y, { n: 5, size: 14, vx: 28, vy: -24, life: 0.75 });
  fx.ticks(x, y - 24, { n: 5, r: 22, len: 13, dir: -Math.PI / 2, fan: 0.48 });
  fx.kira(x, y - 20, { r: 14, life: 0.7, col: '#ffe066' });
}
