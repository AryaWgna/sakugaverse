import { t, onLangChange } from '../core/i18n.js';
import { state, addExp, notify } from '../core/store.js';
import { searchCharacters, FALLBACK_CHARACTERS } from '../core/jikan.js';
import { playTone } from '../core/sfx.js';
import { fxCelebrate } from '../core/fx.js';

const ELEMENTS = {
  flame: { jp: '炎', bg1: '#fff1eb', bg2: '#ffd4c4', pri: '#ff4757', acc: '#ff9f1a', ink: '#2b0d14' },
  thunder: { jp: '雷', bg1: '#fffbe6', bg2: '#ffeaa7', pri: '#f59e0b', acc: '#6c5ce7', ink: '#231942' },
  void: { jp: '呪', bg1: '#f3efff', bg2: '#d9d2ff', pri: '#6c5ce7', acc: '#ff4f9a', ink: '#1b1440' },
  mecha: { jp: '機', bg1: '#eef8ff', bg2: '#c7e8ff', pri: '#0284c7', acc: '#ff3864', ink: '#0f172a' },
  spirit: { jp: '桜', bg1: '#fff0f6', bg2: '#ffd0e5', pri: '#ff5fa8', acc: '#8f8df7', ink: '#2c0b1d' }
};

const FRAMES = {
  manga: { bg1: null, bg2: null, border: null, dark: false },
  cyber: { bg1: '#071124', bg2: '#0f2547', border: '#38bdf8', dark: true, accent: '#22d3ee' },
  cursed: { bg1: '#140826', bg2: '#2d0f4f', border: '#a855f7', dark: true, accent: '#ff5fa8' },
  gold: { bg1: '#2e1e05', bg2: '#6b4509', border: '#ffd43b', dark: true, accent: '#ffe066' }
};

const PRESETS = [
  { id: 'ronin', label: 'Ronin', name: 'Kurogane Ren', title: 'Crimson Blade', ult: 'Zantetsu Eclipse', el: 'flame' },
  { id: 'thunder', label: 'Striker', name: 'Raiden Sora', title: 'Flash Sovereign', ult: 'Godspeed Volt Slash', el: 'thunder' },
  { id: 'void', label: 'Sorcerer', name: 'Yami Gojo', title: 'Limitless Phantom', ult: 'Hollow Singularity', el: 'void' },
  { id: 'mecha', label: 'Pilot', name: 'Unit-09 Valkyrie', title: 'Orbital Breaker', ult: 'Giga Drill Overdrive', el: 'mecha' },
  { id: 'spirit', label: 'Kitsune', name: 'Sakura Hime', title: 'Nine-Tail Oracle', ult: 'Thousand Petals Storm', el: 'spirit' }
];

export function initCardForge(root) {
  let card = {
    name: 'Kurogane Ren',
    title: 'Crimson Blade',
    ultimate: 'Zantetsu Eclipse',
    element: 'flame',
    frame: 'manga',
    preset: 'ronin',
    power: 88,
    speed: 92,
    spirit: 76,
    aura: 95,
    rarity: 5,
    awakened: false,
    customImg: null
  };
  let charResults = FALLBACK_CHARACTERS;

  function calcPowerLevel() {
    const base = (card.power + card.speed + card.spirit + card.aura) * 20;
    const rarityMult = 0.7 + card.rarity * 0.14;
    const awakeMult = card.awakened ? 1.35 : 1;
    return Math.round(base * rarityMult * awakeMult);
  }

  function updatePowerMeter(instant = false) {
    if (root.hidden) return;
    const bar = root.querySelector('#cf-power-bar');
    if (bar && typeof bar.set === 'function') {
      const ratio = Math.min(1, calcPowerLevel() / 11000);
      bar.set(ratio, instant);
    }
  }

  function drawProceduralArt(ctx, w, h, preset, theme, isDark) {
    ctx.save();
    ctx.translate(w / 2, h / 2);

    ctx.strokeStyle = isDark ? 'rgba(255,95,168,0.24)' : 'rgba(29,26,74,0.12)';
    for (let i = 0; i < 36; i++) {
      const ang = (i / 36) * Math.PI * 2;
      ctx.lineWidth = i % 3 === 0 ? 4 : 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(ang) * 75, Math.sin(ang) * 75);
      ctx.lineTo(Math.cos(ang) * 320, Math.sin(ang) * 320);
      ctx.stroke();
    }

    const grad = ctx.createRadialGradient(0, 0, 20, 0, 0, 155);
    grad.addColorStop(0, isDark ? '#ff2a55' : theme.pri);
    grad.addColorStop(0.65, theme.acc + '88');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, 155, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = theme.ink;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 5;

    if (preset === 'ronin') {
      ctx.beginPath();
      ctx.moveTo(-125, 115);
      ctx.quadraticCurveTo(-20, -145, 130, -110);
      ctx.quadraticCurveTo(20, -60, -85, 135);
      ctx.closePath();
      ctx.fillStyle = isDark ? '#ff1f5a' : theme.acc;
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = theme.ink;
      ctx.beginPath();
      ctx.arc(0, -35, 42, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-75, 135);
      ctx.quadraticCurveTo(0, -10, 75, 135);
      ctx.closePath();
      ctx.fill();
    } else if (preset === 'thunder') {
      ctx.fillStyle = '#ffe066';
      ctx.strokeStyle = theme.ink;
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(25, -135);
      ctx.lineTo(-75, 10);
      ctx.lineTo(-5, 10);
      ctx.lineTo(-40, 135);
      ctx.lineTo(80, -20);
      ctx.lineTo(10, -20);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (preset === 'void') {
      for (let r = 115; r >= 35; r -= 26) {
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fillStyle = r === 35 ? '#ffffff' : r % 2 === 0 ? theme.pri : theme.ink;
        ctx.fill();
        ctx.strokeStyle = theme.ink;
        ctx.lineWidth = 4;
        ctx.stroke();
      }
    } else if (preset === 'mecha') {
      ctx.fillStyle = theme.ink;
      ctx.beginPath();
      ctx.moveTo(0, -110);
      ctx.lineTo(95, -20);
      ctx.lineTo(65, 110);
      ctx.lineTo(-65, 110);
      ctx.lineTo(-95, -20);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 5;
      ctx.stroke();
      ctx.fillStyle = isDark ? '#ff2a55' : '#38bdf8';
      ctx.fillRect(-58, -22, 116, 26);
      ctx.strokeStyle = '#ffd43b';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(-115, -95);
      ctx.lineTo(0, -35);
      ctx.lineTo(115, -95);
      ctx.stroke();
    } else {
      for (let i = 0; i < 5; i++) {
        ctx.save();
        ctx.rotate((i * Math.PI * 2) / 5);
        ctx.beginPath();
        ctx.moveTo(0, -15);
        ctx.quadraticCurveTo(55, -75, 0, -130);
        ctx.quadraticCurveTo(-55, -75, 0, -15);
        ctx.fillStyle = i % 2 === 0 ? '#ff5fa8' : '#ffb8d9';
        ctx.fill();
        ctx.strokeStyle = theme.ink;
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.restore();
      }
      ctx.beginPath();
      ctx.arc(0, 0, 26, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.strokeStyle = theme.ink;
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawCard() {
    const canvas = root.querySelector('#forge-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const theme = ELEMENTS[card.element] || ELEMENTS.flame;
    const frame = FRAMES[card.frame] || FRAMES.manga;
    const isDark = card.awakened || frame.dark;

    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, card.awakened ? '#240715' : frame.bg1 || theme.bg1);
    bg.addColorStop(1, card.awakened ? '#4a0d27' : frame.bg2 || theme.bg2);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(29,26,74,0.065)';
    for (let y = 16; y < H; y += 22) {
      for (let x = 16; x < W; x += 22) {
        ctx.beginPath();
        ctx.arc(x, y, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const borderCol = card.awakened ? '#ff5fa8' : frame.border || theme.ink;
    ctx.strokeStyle = borderCol;
    ctx.lineWidth = 14;
    ctx.strokeRect(20, 20, W - 40, H - 40);

    ctx.fillStyle = card.awakened ? '#ff1f5a' : frame.border || theme.ink;
    ctx.fillRect(42, 42, W - 84, 82);

    ctx.fillStyle = card.frame === 'gold' && !card.awakened ? '#2e1e05' : '#ffffff';
    ctx.font = 'italic 800 35px "Space Grotesk", sans-serif';
    ctx.fillText((card.name || 'UNKNOWN').slice(0, 20).toUpperCase(), 62, 92);

    ctx.fillStyle = isDark ? '#ffe066' : theme.acc;
    ctx.beginPath();
    ctx.arc(W - 86, 83, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.fillStyle = isDark ? '#240715' : '#ffffff';
    ctx.font = '800 30px "M PLUS Rounded 1c", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(theme.jp, W - 86, 94);
    ctx.textAlign = 'left';

    const artX = 42, artY = 142, artW = W - 84, artH = 420;
    ctx.save();
    ctx.beginPath();
    ctx.rect(artX, artY, artW, artH);
    ctx.clip();

    const artGrad = ctx.createLinearGradient(artX, artY, artX + artW, artY + artH);
    artGrad.addColorStop(0, isDark ? '#1a1230' : '#ffffff');
    artGrad.addColorStop(1, theme.bg2);
    ctx.fillStyle = artGrad;
    ctx.fillRect(artX, artY, artW, artH);

    if (card.customImg) {
      const img = card.customImg;
      const scale = Math.max(artW / img.width, artH / img.height);
      const iw = img.width * scale;
      const ih = img.height * scale;
      ctx.drawImage(img, artX + (artW - iw) / 2, artY + (artH - ih) / 2, iw, ih);
    } else {
      ctx.save();
      ctx.translate(artX, artY);
      drawProceduralArt(ctx, artW, artH, card.preset, theme, isDark);
      ctx.restore();
    }

    if (card.awakened || card.frame === 'gold') {
      ctx.fillStyle = 'rgba(255, 224, 102, 0.16)';
      for (let i = -artH; i < artW; i += 64) {
        ctx.beginPath();
        ctx.moveTo(artX + i, artY);
        ctx.lineTo(artX + i + 26, artY);
        ctx.lineTo(artX + i + 26 + artH * 0.45, artY + artH);
        ctx.lineTo(artX + i + artH * 0.45, artY + artH);
        ctx.closePath();
        ctx.fill();
      }
    }

    ctx.fillStyle = 'rgba(20, 14, 42, 0.88)';
    ctx.fillRect(artX, artY + artH - 54, artW, 54);
    ctx.fillStyle = '#ffe066';
    ctx.font = '800 22px "Space Grotesk", sans-serif';
    ctx.fillText(`★`.repeat(card.rarity) + `☆`.repeat(Math.max(0, 5 - card.rarity)), artX + 18, artY + artH - 19);
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'right';
    ctx.font = 'italic 700 22px "Space Grotesk", sans-serif';
    ctx.fillText((card.title || '').slice(0, 26), artX + artW - 18, artY + artH - 19);
    ctx.textAlign = 'left';
    ctx.restore();

    ctx.strokeStyle = isDark ? '#ffe066' : theme.ink;
    ctx.lineWidth = 6;
    ctx.strokeRect(artX, artY, artW, artH);

    const ultY = 582;
    ctx.fillStyle = isDark ? 'rgba(0,0,0,0.35)' : '#ffffff';
    ctx.fillRect(42, ultY, W - 84, 88);
    ctx.strokeStyle = borderCol;
    ctx.lineWidth = 4;
    ctx.strokeRect(42, ultY, W - 84, 88);

    ctx.fillStyle = isDark ? (frame.accent || '#ffb3cb') : theme.pri;
    ctx.font = '800 16px "Space Grotesk", sans-serif';
    ctx.fillText(card.awakened ? '⚡ AWAKENED ULTIMATE ART' : '⚡ ULTIMATE TECHNIQUE', 60, ultY + 30);
    ctx.fillStyle = isDark ? '#ffffff' : theme.ink;
    ctx.font = 'italic 800 28px "Space Grotesk", sans-serif';
    ctx.fillText(`「${(card.ultimate || 'Sakuga Burst').slice(0, 24)}」`, 56, ultY + 68);

    const stats = [
      ['PWR', card.power, '#ff4757'],
      ['SPD', card.speed, '#0ea5e9'],
      ['SPI', card.spirit, '#8b5cf6'],
      ['AUR', card.aura, '#ff5fa8']
    ];
    let sy = 702;
    stats.forEach(([label, val, col]) => {
      ctx.fillStyle = isDark ? '#ffffff' : theme.ink;
      ctx.font = '800 22px "Space Grotesk", sans-serif';
      ctx.fillText(label, 48, sy + 24);
      ctx.textAlign = 'right';
      ctx.fillText(String(val), W - 48, sy + 24);
      ctx.textAlign = 'left';

      const bx = 122, bw = W - 228, bh = 24;
      ctx.fillStyle = isDark ? 'rgba(255,255,255,0.16)' : '#e6e4f8';
      ctx.fillRect(bx, sy + 4, bw, bh);
      ctx.fillStyle = col;
      ctx.fillRect(bx, sy + 4, (bw * val) / 100, bh);
      ctx.strokeStyle = isDark ? '#ffffff' : theme.ink;
      ctx.lineWidth = 3;
      ctx.strokeRect(bx, sy + 4, bw, bh);
      sy += 56;
    });

    const pwr = calcPowerLevel();
    ctx.fillStyle = isDark ? '#ffe066' : theme.ink;
    ctx.fillRect(42, H - 122, W - 84, 76);
    ctx.fillStyle = isDark ? '#1a0b15' : '#ffffff';
    ctx.font = '800 20px "Space Grotesk", sans-serif';
    ctx.fillText('SAKUGAVERSE EDITION', 62, H - 77);
    ctx.textAlign = 'right';
    ctx.font = 'italic 800 34px "Space Grotesk", sans-serif';
    ctx.fillText(`BP ${pwr.toLocaleString()}`, W - 62, H - 72);
    ctx.textAlign = 'left';
  }

  function wireHoloTilt() {
    const shell = root.querySelector('#holo-shell');
    const glare = root.querySelector('#holo-glare');
    if (!shell || !glare) return;

    shell.addEventListener('pointermove', (e) => {
      const rect = shell.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const rx = (0.5 - py) * 18;
      const ry = (px - 0.5) * 18;
      shell.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) scale(1.02)`;
      glare.style.setProperty('--mx', `${Math.round(px * 100)}%`);
      glare.style.setProperty('--my', `${Math.round(py * 100)}%`);
    });

    shell.addEventListener('pointerleave', () => {
      shell.style.transform = '';
    });
  }

  function renderCharChips() {
    const host = root.querySelector('#cf-char-results');
    if (!host) return;
    host.innerHTML = charResults
      .map(
        (c, i) => `
      <button type="button" class="char-chip" data-char-idx="${i}">
        ${c.image ? `<img src="${c.image}" alt="" loading="lazy">` : ''}
        <span>${escapeHtml(c.name)}</span>
      </button>`
      )
      .join('');

    host.querySelectorAll('[data-char-idx]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const ch = charResults[Number(btn.dataset.charIdx)];
        if (!ch) return;
        card.name = ch.name;
        card.title = ch.title || 'Anime Legend';
        if (ch.ultimate) card.ultimate = ch.ultimate;
        if (ch.element) card.element = ch.element;
        const nameIn = root.querySelector('#cf-name');
        const titleIn = root.querySelector('#cf-title');
        const ultIn = root.querySelector('#cf-ult');
        if (nameIn) nameIn.value = card.name;
        if (titleIn) titleIn.value = card.title;
        if (ultIn) ultIn.value = card.ultimate;

        if (ch.image) {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            card.customImg = img;
            drawCard();
          };
          img.onerror = () => {
            // If remote host blocks CORS for canvas, still show procedural art + updated name
            card.customImg = null;
            drawCard();
          };
          img.src = ch.image;
        }
        playTone('chime');
        notify(t('cfCharImported', ch.name));
        drawCard();
      });
    });
  }

  function render() {
    const els = t('cfElements');
    const st = t('cfStats');
    const frames = t('cfFrames');

    root.innerHTML = `
      <div class="panel-head">
        <div>
          <div class="panel-kicker">${t('cfKicker')}</div>
          <h2 class="panel-title">${t('cfTitle')}</h2>
          <p class="panel-desc">${t('cfDesc')}</p>
        </div>
      </div>

      <div class="grid-split">
        <div class="manga-card card-canvas-wrap">
          <div class="holo-stage">
            <div class="holo-card-shell" id="holo-shell">
              <canvas id="forge-canvas" class="forge-canvas" width="760" height="1040"></canvas>
              <div class="holo-glare" id="holo-glare"></div>
            </div>
          </div>
          <span style="font-size:12px;color:var(--mute);font-weight:700">✨ ${t('cfTiltHint')}</span>

          <div class="progress-stage" style="min-height:165px;padding:42px 8px 6px;width:100%">
            <sakuga-progress id="cf-power-bar" label="${t('cfPowerCharge')}" done-label="${t('cfMaxPower')}" style="--sk-progress-width: 280px;"></sakuga-progress>
          </div>
          <div class="row-wrap" style="justify-content:center">
            <sakuga-button id="cf-download">💾 ${t('cfDownload')}</sakuga-button>
            <sakuga-button id="cf-copy" variant="secondary">📋 ${t('cfCopyImg')}</sakuga-button>
            <sakuga-button id="cf-random" variant="secondary">🎲 ${t('cfRandomize')}</sakuga-button>
          </div>
        </div>

        <div class="manga-card stack">
          <!-- Jikan Character Search -->
          <div class="field-group" style="padding:12px;background:var(--surface-alt);border:2px solid var(--ink);border-radius:14px">
            <span class="field-title">🔍 ${t('cfSearchCharBtn')} (MyAnimeList)</span>
            <div class="row-wrap" style="gap:10px">
              <sakuga-input id="cf-char-search" type="search" label="${t('cfSearchCharBtn')}" placeholder="${escapeAttr(t('cfSearchCharPlaceholder'))}" style="--sk-input-width:240px"></sakuga-input>
              <sakuga-button id="cf-char-btn" variant="secondary">${t('cfSearchCharBtn')}</sakuga-button>
            </div>
            <div class="char-results-row" id="cf-char-results"></div>
          </div>

          <div class="field-group">
            <span class="field-title">${t('cfFrameLabel')}</span>
            <div class="filter-pills" id="cf-frames">
              ${Object.entries(frames)
                .map(([key, label]) => `<button type="button" class="filter-pill ${card.frame === key ? 'active' : ''}" data-frame="${key}">${label}</button>`)
                .join('')}
            </div>
          </div>

          <div class="grid-2">
            <div class="field-group">
              <span class="field-title">${t('cfCharName')}</span>
              <sakuga-input id="cf-name" label="${t('cfCharName')}" style="--sk-input-width:100%"></sakuga-input>
            </div>
            <div class="field-group">
              <span class="field-title">${t('cfCharTitle')}</span>
              <sakuga-input id="cf-title" label="${t('cfCharTitle')}" style="--sk-input-width:100%"></sakuga-input>
            </div>
          </div>

          <div class="field-group">
            <span class="field-title">${t('cfUltimate')}</span>
            <sakuga-input id="cf-ult" label="${t('cfUltimate')}" style="--sk-input-width:100%"></sakuga-input>
          </div>

          <div class="field-group">
            <span class="field-title">${t('cfAvatarPreset')}</span>
            <div class="avatar-presets" id="cf-presets">
              ${PRESETS.map((p) => `<button type="button" class="preset-btn ${card.preset === p.id && !card.customImg ? 'active' : ''}" data-preset="${p.id}">${p.label}</button>`).join('')}
              <label class="preset-btn" style="cursor:pointer">
                📷 ${t('cfUploadBtn')}
                <input type="file" id="cf-upload" accept="image/*" hidden>
              </label>
            </div>
          </div>

          <div class="grid-2">
            <div class="field-group">
              <span class="field-title">${t('cfElement')}</span>
              <sakuga-radio id="cf-element" label="${t('cfElement')}">
                <option value="flame" ${card.element === 'flame' ? 'selected' : ''}>${els.flame}</option>
                <option value="thunder" ${card.element === 'thunder' ? 'selected' : ''}>${els.thunder}</option>
                <option value="void" ${card.element === 'void' ? 'selected' : ''}>${els.void}</option>
                <option value="mecha" ${card.element === 'mecha' ? 'selected' : ''}>${els.mecha}</option>
                <option value="spirit" ${card.element === 'spirit' ? 'selected' : ''}>${els.spirit}</option>
              </sakuga-radio>
            </div>

            <div class="stack">
              <div class="field-group">
                <span class="field-title">${t('cfRarity')}</span>
                <sakuga-rating id="cf-rarity" label="${t('cfRarity')}"></sakuga-rating>
              </div>
              <div class="row-wrap" style="justify-content:space-between;padding:10px 12px;background:var(--surface-alt);border:2px solid var(--ink);border-radius:12px">
                <span style="font-size:13px;font-weight:800">${t('cfAwakenCard')}</span>
                <sakuga-toggle id="cf-awaken" label="${t('cfAwakenCard')}"></sakuga-toggle>
              </div>
            </div>
          </div>

          <div class="grid-2">
            <div class="field-group">
              <span class="field-title">${st.power}</span>
              <div class="slider-slot"><sakuga-slider id="cf-pwr" min="10" max="100" value="${card.power}" unit="" label="${st.power}" style="--sk-slider-width:100%"></sakuga-slider></div>
            </div>
            <div class="field-group">
              <span class="field-title">${st.speed}</span>
              <div class="slider-slot"><sakuga-slider id="cf-spd" min="10" max="100" value="${card.speed}" unit="" label="${st.speed}" style="--sk-slider-width:100%"></sakuga-slider></div>
            </div>
            <div class="field-group">
              <span class="field-title">${st.spirit}</span>
              <div class="slider-slot"><sakuga-slider id="cf-spi" min="10" max="100" value="${card.spirit}" unit="" label="${st.spirit}" style="--sk-slider-width:100%"></sakuga-slider></div>
            </div>
            <div class="field-group">
              <span class="field-title">${st.aura}</span>
              <div class="slider-slot"><sakuga-slider id="cf-aur" min="10" max="100" value="${card.aura}" unit="" label="${st.aura}" style="--sk-slider-width:100%"></sakuga-slider></div>
            </div>
          </div>
        </div>
      </div>
    `;

    const nameIn = root.querySelector('#cf-name');
    const titleIn = root.querySelector('#cf-title');
    const ultIn = root.querySelector('#cf-ult');
    const elRadio = root.querySelector('#cf-element');
    const rarityEl = root.querySelector('#cf-rarity');
    const awakenEl = root.querySelector('#cf-awaken');
    const charSearchIn = root.querySelector('#cf-char-search');
    const charSearchBtn = root.querySelector('#cf-char-btn');

    requestAnimationFrame(() => {
      nameIn.value = card.name;
      titleIn.value = card.title;
      ultIn.value = card.ultimate;
      rarityEl.value = card.rarity;
      awakenEl.checked = card.awakened;
      drawCard();
      updatePowerMeter(true);
      wireHoloTilt();
    });

    const doCharSearch = async () => {
      charResults = await searchCharacters(charSearchIn.value || '');
      renderCharChips();
    };
    charSearchBtn.addEventListener('click', doCharSearch);
    charSearchIn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        doCharSearch();
      }
    });
    renderCharChips();

    root.querySelectorAll('[data-frame]').forEach((btn) => {
      btn.addEventListener('click', () => {
        card.frame = btn.dataset.frame;
        root.querySelectorAll('[data-frame]').forEach((b) => b.classList.toggle('active', b === btn));
        playTone('chime');
        drawCard();
      });
    });

    nameIn.addEventListener('input', () => { card.name = nameIn.value; drawCard(); });
    titleIn.addEventListener('input', () => { card.title = titleIn.value; drawCard(); });
    ultIn.addEventListener('input', () => { card.ultimate = ultIn.value; drawCard(); });
    elRadio.addEventListener('change', () => { card.element = elRadio.value; drawCard(); });
    rarityEl.addEventListener('change', () => { card.rarity = Math.max(1, Number(rarityEl.value) || 1); drawCard(); updatePowerMeter(); });
    awakenEl.addEventListener('change', () => { card.awakened = Boolean(awakenEl.checked); playTone('impact'); drawCard(); updatePowerMeter(); });

    [['#cf-pwr', 'power'], ['#cf-spd', 'speed'], ['#cf-spi', 'spirit'], ['#cf-aur', 'aura']].forEach(([sel, key]) => {
      const s = root.querySelector(sel);
      s.addEventListener('input', () => { card[key] = Number(s.value); drawCard(); });
      s.addEventListener('change', () => { card[key] = Number(s.value); drawCard(); updatePowerMeter(); });
    });

    root.querySelectorAll('[data-preset]').forEach((btn) => {
      btn.addEventListener('click', () => {
        card.preset = btn.dataset.preset;
        card.customImg = null;
        root.querySelectorAll('[data-preset]').forEach((b) => b.classList.toggle('active', b === btn));
        drawCard();
      });
    });

    root.querySelector('#cf-upload').addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          card.customImg = img;
          drawCard();
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });

    root.querySelector('#cf-random').addEventListener('click', () => {
      const p = PRESETS[Math.floor(Math.random() * PRESETS.length)];
      const frameKeys = Object.keys(FRAMES);
      card = {
        ...card,
        name: p.name,
        title: p.title,
        ultimate: p.ult,
        element: p.el,
        frame: frameKeys[Math.floor(Math.random() * frameKeys.length)],
        preset: p.id,
        power: 55 + Math.floor(Math.random() * 46),
        speed: 55 + Math.floor(Math.random() * 46),
        spirit: 55 + Math.floor(Math.random() * 46),
        aura: 60 + Math.floor(Math.random() * 41),
        rarity: 3 + Math.floor(Math.random() * 3),
        awakened: Math.random() > 0.5,
        customImg: null
      };
      playTone('chime');
      notify(t('cfRandomized'));
      render();
    });

    const dlBtn = root.querySelector('#cf-download');
    dlBtn.addEventListener('click', () => {
      const canvas = root.querySelector('#forge-canvas');
      try {
        const link = document.createElement('a');
        const slug = (card.name || 'sakuga-card').toLowerCase().replace(/[^a-z0-9]+/g, '-');
        link.download = `${slug}-sakugaverse.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        state.cardsForged += 1;
        playTone('fanfare');
        fxCelebrate(canvas);
        dlBtn.done();
        addExp(25, t('cfDownloaded'));
      } catch {
        // If remote image tainted canvas, fallback to procedural art for clean export
        card.customImg = null;
        drawCard();
        notify('Exported with vector art (remote image blocked CORS).');
      }
    });

    const copyBtn = root.querySelector('#cf-copy');
    copyBtn.addEventListener('click', () => {
      const canvas = root.querySelector('#forge-canvas');
      if (!navigator.clipboard || typeof window.ClipboardItem === 'undefined') {
        notify(t('cfCopyFail'));
        return;
      }
      try {
        canvas.toBlob(async (blob) => {
          if (!blob) return notify(t('cfCopyFail'));
          try {
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
            state.cardsForged += 1;
            playTone('fanfare');
            fxCelebrate(canvas);
            copyBtn.done();
            addExp(15, t('cfCopied'));
          } catch {
            notify(t('cfCopyFail'));
          }
        }, 'image/png');
      } catch {
        notify(t('cfCopyFail'));
      }
    });
  }

  render();
  onLangChange(render);
  root.addEventListener('panel:show', () => updatePowerMeter(true));
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}

function escapeAttr(s) {
  return escapeHtml(s).replace(/\n/g, ' ');
}
