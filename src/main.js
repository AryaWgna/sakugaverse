import './styles/main.css';
import { t, getLang, setLang, onLangChange } from './core/i18n.js';
import { state, saveState, subscribe, getRankInfo, notify } from './core/store.js';
import { playTone } from './core/sfx.js';
import { initWatchlist } from './modules/watchlist.js';
import { initGacha } from './modules/gacha.js';
import { initTraining } from './modules/training.js';
import { initCardForge } from './modules/cardforge.js';
import { initQuiz } from './modules/quiz.js';

const TAB_KEYS = ['watchlist', 'gacha', 'training', 'cardforge', 'quiz'];
let activeTabIndex = 0;

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

function showPanel(index) {
  activeTabIndex = index;
  TAB_KEYS.forEach((key, i) => {
    const panel = document.getElementById(`panel-${key}`);
    if (panel) panel.hidden = i !== index;
  });
}

function mountMainTabs() {
  const host = document.getElementById('main-tabs-host');
  if (!host) return;
  const labels = t('tabs');
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

function applyAwakening(on) {
  document.body.classList.toggle('awakening', Boolean(on));
}

function boot() {
  // Language switcher
  document.documentElement.lang = getLang() === 'jp' ? 'ja' : getLang();
  document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      playTone('chime');
      setLang(btn.dataset.lang);
    });
  });

  // Awakening Mode global toggle
  applyAwakening(state.awakening);
  const awakenToggle = document.getElementById('awakening-toggle');
  requestAnimationFrame(() => {
    if (awakenToggle) awakenToggle.checked = state.awakening;
  });
  awakenToggle?.addEventListener('change', () => {
    state.awakening = Boolean(awakenToggle.checked);
    applyAwakening(state.awakening);
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
  initWatchlist(document.getElementById('panel-watchlist'));
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
