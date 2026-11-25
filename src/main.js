import './styles/main.css';
import { t, getLang, setLang, onLangChange } from './core/i18n.js';
import { state, saveState, subscribe, getRankInfo, getAchievements, exportBackup, importBackup, notify } from './core/store.js';
import { playTone } from './core/sfx.js';
import { initWatchlist } from './modules/watchlist.js';
import { initGacha } from './modules/gacha.js';
import { initTraining } from './modules/training.js';
import { initCardForge } from './modules/cardforge.js';
import { initQuiz } from './modules/quiz.js';

const TAB_KEYS = ['watchlist', 'gacha', 'training', 'cardforge', 'quiz'];
const TAB_ICONS = ['📺', '✨', '🔥', '🃏', '⚔️'];
let activeTabIndex = 0;

export function openModal(html, onMount) {
  const backdrop = document.getElementById('modal-backdrop');
  const dialog = document.getElementById('modal-dialog');
  if (!backdrop || !dialog) return;
  dialog.innerHTML = html;
  backdrop.hidden = false;
  if (typeof onMount === 'function') onMount(dialog, closeModal);
}

export function closeModal() {
  const backdrop = document.getElementById('modal-backdrop');
  if (backdrop) backdrop.hidden = true;
}

function openPassportModal() {
  const rank = getRankInfo();
  const achs = getAchievements();
  const unlocked = achs.filter((a) => a.unlocked).length;

  openModal(
    `
    <div class="row-wrap" style="justify-content:space-between;margin-bottom:14px">
      <div>
        <div class="panel-kicker">🪪 SAKUGAVERSE ID</div>
        <h3 style="margin:0;font-size:22px;font-weight:800;font-style:italic">${t('passportTitle')}</h3>
      </div>
      <button type="button" class="mini-btn" id="modal-close-x">✕ ${t('closeBtn')}</button>
    </div>

    <div class="manga-card soft" style="padding:16px;margin-bottom:16px;box-shadow:var(--shadow-sm)">
      <div class="row-wrap" style="justify-content:space-between">
        <div>
          <span class="rank-lvl">LV.${rank.level}</span>
          <strong style="margin-left:8px;font-size:18px">${rank.rankName}</strong>
        </div>
        <span class="tag-chip gold">⚡ ${state.exp} EXP</span>
      </div>
      <div class="rank-bar-track" style="margin-top:10px;height:10px">
        <div class="rank-bar-fill" style="width:${rank.pct}%"></div>
      </div>
      <div class="row-wrap" style="margin-top:12px;gap:8px">
        <span class="tag-chip">📺 ${state.watchlist.length}</span>
        <span class="tag-chip">🔥 ${state.sessionsDone}</span>
        <span class="tag-chip">🃏 ${state.cardsForged}</span>
        <span class="tag-chip">🏆 ${state.quizBest}</span>
      </div>
    </div>

    <div class="field-title" style="margin-bottom:4px">
      <span>${t('passportBadges')}</span>
      <span>${unlocked} / ${achs.length}</span>
    </div>
    <div class="badge-grid">
      ${achs
        .map(
          (a) => `
        <div class="ach-card ${a.unlocked ? '' : 'locked'}">
          <span class="ach-icon">${a.icon}</span>
          <span>${a.title}</span>
        </div>`
        )
        .join('')}
    </div>

    <div style="margin-top:20px;padding-top:16px;border-top:2px dashed var(--line)">
      <div class="field-title" style="margin-bottom:10px">${t('passportBackup')}</div>
      <div class="row-wrap">
        <button type="button" class="mini-btn" id="passport-export">💾 ${t('backupExport')}</button>
        <label class="mini-btn" style="cursor:pointer">
          📂 ${t('backupImport')}
          <input type="file" id="passport-import" accept="application/json" hidden>
        </label>
      </div>
    </div>
    `,
    (dialog, close) => {
      dialog.querySelector('#modal-close-x')?.addEventListener('click', close);
      dialog.querySelector('#passport-export')?.addEventListener('click', exportBackup);
      dialog.querySelector('#passport-import')?.addEventListener('change', (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          if (importBackup(String(reader.result || ''))) {
            applyThemes();
            close();
          }
        };
        reader.readAsText(file);
      });
    }
  );
}

function updateStaticI18n() {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n;
    el.textContent = t(key);
  });

  const brandTip = document.getElementById('brand-tooltip');
  if (brandTip) brandTip.setAttribute('text', t('brandTip'));

  document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.lang === getLang());
  });
}

function updateRankAndFooter() {
  const rank = getRankInfo();
  const lvlEl = document.getElementById('rank-lvl');
  const nameEl = document.getElementById('rank-name');
  const expEl = document.getElementById('rank-exp');
  const fillEl = document.getElementById('rank-bar-fill');

  if (lvlEl) lvlEl.textContent = `LV.${rank.level}`;
  if (nameEl) nameEl.textContent = rank.rankName;
  if (expEl) expEl.textContent = `${rank.intoLevel} / ${rank.needed} EXP`;
  if (fillEl) fillEl.style.width = `${rank.pct}%`;

  const fStats = document.getElementById('footer-stats');
  if (fStats) {
    fStats.innerHTML = `
      <span class="tag-chip">📺 ${state.watchlist.length}</span>
      <span class="tag-chip">🔥 ${state.sessionsDone}</span>
      <span class="tag-chip">🃏 ${state.cardsForged}</span>
      <span class="tag-chip gold">⚡ ${state.exp} EXP</span>
    `;
  }
}

function showPanel(index, syncTabs = false) {
  activeTabIndex = index;
  TAB_KEYS.forEach((key, i) => {
    const panel = document.getElementById(`panel-${key}`);
    if (!panel) return;
    const isTarget = i === index;
    panel.hidden = !isTarget;
    if (isTarget) {
      panel.classList.remove('panel-enter');
      void panel.offsetWidth;
      panel.classList.add('panel-enter');
    }
  });
  if (syncTabs) {
    const tabsEl = document.getElementById('main-tabs');
    if (tabsEl) tabsEl.selected = index;
  }
  document.querySelectorAll('.mob-nav-btn').forEach((btn, i) => {
    btn.classList.toggle('active', i === index);
  });
}

function mountMainTabs() {
  const host = document.getElementById('main-tabs-host');
  const labels = t('tabs');
  if (host) {
    host.innerHTML = `
      <sakuga-tabs id="main-tabs" label="SakugaVerse Modules" selected="${activeTabIndex}">
        ${TAB_KEYS.map((key) => `<option value="${key}">${labels[key]}</option>`).join('')}
      </sakuga-tabs>
    `;
    const tabsEl = host.querySelector('#main-tabs');
    tabsEl.addEventListener('change', (e) => {
      playTone('chime');
      showPanel(e.detail.index);
    });
  }

  const mobNav = document.getElementById('mobile-bottom-nav');
  if (mobNav) {
    mobNav.innerHTML = TAB_KEYS.map(
      (key, i) => `
      <button type="button" class="mob-nav-btn ${i === activeTabIndex ? 'active' : ''}" data-mob-tab="${i}">
        <span class="mob-ico">${TAB_ICONS[i]}</span>
        <span>${labels[key]}</span>
      </button>`
    ).join('');
    mobNav.querySelectorAll('[data-mob-tab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.mobTab);
        playTone('chime');
        showPanel(idx, true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  }
}

function applyThemes() {
  document.body.classList.toggle('awakening', Boolean(state.awakening));
  document.body.classList.toggle('dark', Boolean(state.darkMode));
  const darkBtn = document.getElementById('dark-mode-btn');
  if (darkBtn) {
    darkBtn.classList.toggle('active', Boolean(state.darkMode));
    darkBtn.textContent = state.darkMode ? '☀️' : '🌙';
  }
}

function runBootSequence() {
  const bootEl = document.getElementById('sakuga-boot');
  if (!bootEl) return;
  const subEl = bootEl.querySelector('.boot-sub');
  let dismissed = false;
  const timers = [];

  const finish = () => {
    if (dismissed) return;
    dismissed = true;
    timers.forEach(clearTimeout);
    bootEl.classList.add('boot-exit');
    document.documentElement.classList.remove('boot-dark', 'boot-awaken');
    setTimeout(() => {
      bootEl.remove();
    }, 500);
  };

  bootEl.addEventListener('click', finish);
  document.getElementById('boot-skip')?.addEventListener('click', (e) => {
    e.stopPropagation();
    finish();
  });

  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (!reduced && subEl) {
    timers.push(setTimeout(() => { subEl.textContent = 'LOADING SAKUGA VFX ENGINE...'; }, 850));
    timers.push(setTimeout(() => { subEl.textContent = 'SYNCING WATCHLIST · GACHA · QUIZ...'; }, 1750));
    timers.push(setTimeout(() => { subEl.textContent = 'READY! ドン!'; }, 2650));
  }
  timers.push(setTimeout(finish, reduced ? 250 : 3400));
}

function boot() {
  runBootSequence();
  document.documentElement.lang = getLang() === 'jp' ? 'ja' : getLang();
  document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      playTone('chime');
      setLang(btn.dataset.lang);
    });
  });

  // Modal backdrop close + Escape key
  const backdrop = document.getElementById('modal-backdrop');
  backdrop?.addEventListener('click', (e) => {
    if (e.target === backdrop) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
    // Desktop shortcuts 1-5 to jump between modules when not focused in a form field
    const tag = (e.target?.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'sakuga-input') return;
    if (e.key >= '1' && e.key <= '5' && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const idx = Number(e.key) - 1;
      playTone('chime');
      showPanel(idx, true);
    }
  });

  // Otaku Passport Modal trigger
  document.getElementById('rank-pill')?.addEventListener('click', () => {
    playTone('chime');
    openPassportModal();
  });

  // Midnight Dark Mode button
  document.getElementById('dark-mode-btn')?.addEventListener('click', () => {
    state.darkMode = !state.darkMode;
    applyThemes();
    saveState();
    playTone('chime');
    notify(state.darkMode ? t('darkOn') : t('darkOff'));
  });

  // Awakening Mode global toggle
  applyThemes();
  const awakenToggle = document.getElementById('awakening-toggle');
  requestAnimationFrame(() => {
    if (awakenToggle) awakenToggle.checked = state.awakening;
  });
  awakenToggle?.addEventListener('change', () => {
    state.awakening = Boolean(awakenToggle.checked);
    applyThemes();
    saveState();
    playTone('impact');
    notify(state.awakening ? t('awakeningOn') : t('awakeningOff'));
  });

  // Mount global UI
  updateStaticI18n();
  updateRankAndFooter();
  mountMainTabs();
  showPanel(activeTabIndex);

  // Boot all 5 anime modules
  initWatchlist(document.getElementById('panel-watchlist'), { openModal });
  initGacha(document.getElementById('panel-gacha'));
  initTraining(document.getElementById('panel-training'));
  initCardForge(document.getElementById('panel-cardforge'));
  initQuiz(document.getElementById('panel-quiz'));

  // Reactive updates
  subscribe(updateRankAndFooter);
  onLangChange(() => {
    updateStaticI18n();
    updateRankAndFooter();
    mountMainTabs();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
