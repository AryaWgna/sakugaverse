import { t, onLangChange } from '../core/i18n.js';
import { state, addExp, addToWatchlist, saveState } from '../core/store.js';
import { summonAnime } from '../core/jikan.js';
import { playTone } from '../core/sfx.js';
import { fxSSR, fxCelebrate } from '../core/fx.js';

const GENRES = ['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Romance', 'Sci-Fi', 'Slice of Life'];
const FALLBACK_SVG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 170'%3E%3Crect width='120' height='170' fill='%23edeaff'/%3E%3Ctext x='60' y='88' text-anchor='middle' font-family='sans-serif' font-weight='800' font-size='16' fill='%23ff5fa8'%3ESSR%3C/text%3E%3C/svg%3E";

export function initGacha(root) {
  let minScore = 7.5;
  let minYear = 2010;
  let format = 'all';
  let selectedGenres = new Set(['Action']);
  let hiddenGem = false;
  let currentPull = null;
  let pulling = false;

  function getRarity(score) {
    if (score >= 8.5) return { code: 'SSR', cls: 'ssr' };
    if (score >= 7.8) return { code: 'SR', cls: 'sr' };
    return { code: 'R', cls: 'r' };
  }

  function renderResult(withFx = false) {
    const slot = root.querySelector('#gacha-result-slot');
    const histEl = root.querySelector('#gacha-history');
    if (histEl) {
      histEl.innerHTML = state.gachaHistory.length
        ? state.gachaHistory
            .slice(0, 6)
            .map((h) => `<span class="tag-chip ${h.rarity === 'SSR' ? 'gold' : ''}">${h.rarity} · ${escapeHtml(h.title)}</span>`)
            .join('')
        : `<span style="color:var(--mute);font-size:13px">—</span>`;
    }
    if (!slot) return;
    if (!currentPull) {
      slot.innerHTML = `<div class="empty-box" style="max-width:420px">${t('gcIdleText')}</div>`;
      return;
    }

    const rarity = getRarity(currentPull.score || 8);
    slot.innerHTML = `
      <div class="gacha-flip-scene">
        <div class="gacha-flip-card">
          <div class="gacha-card ${rarity.code === 'SSR' ? 'ssr-glow' : ''}">
            <span class="gacha-rarity ${rarity.cls}">${rarity.code} · ★ ${currentPull.score || '8.0'}</span>
            <div class="gacha-result-top">
              <div class="gacha-poster">
                <img src="${currentPull.image || FALLBACK_SVG}" alt="" onerror="this.src='${FALLBACK_SVG}'">
              </div>
              <div style="flex:1;min-width:0">
                <h3 style="margin:0 0 6px;font-size:18px;font-weight:800;line-height:1.2">${escapeHtml(currentPull.title)}</h3>
                <p style="margin:0 0 8px;font-size:12.5px;color:var(--mute);font-weight:700">
                  ${currentPull.type || 'TV'} · ${currentPull.episodes || '?'} eps · ${currentPull.year || ''}
                </p>
                <div class="row-wrap" style="gap:5px;margin-bottom:8px">
                  ${(currentPull.genres || []).slice(0, 3).map((g) => `<span class="tag-chip">${escapeHtml(g)}</span>`).join('')}
                </div>
                <p style="margin:0;font-size:12.5px;color:var(--mute);display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden">
                  ${escapeHtml(currentPull.synopsis || '')}
                </p>
              </div>
            </div>
            <div class="row-wrap" style="margin-top:16px;justify-content:space-between">
              <sakuga-button id="gc-add-wl">${t('gcAddWatchlist')}</sakuga-button>
              <sakuga-button id="gc-reroll" variant="secondary">${t('gcPullAgain')}</sakuga-button>
            </div>
          </div>
        </div>
      </div>
    `;

    if (withFx) {
      requestAnimationFrame(() => {
        if (rarity.code === 'SSR') fxSSR(slot);
        else fxCelebrate(slot);
      });
    }

    const addBtn = slot.querySelector('#gc-add-wl');
    addBtn.addEventListener('click', () => {
      if (addToWatchlist(currentPull)) {
        playTone('chime');
        addBtn.done();
      }
    });
    slot.querySelector('#gc-reroll').addEventListener('click', () => triggerSummon());
  }

  async function triggerSummon() {
    if (pulling) return;
    pulling = true;
    const bar = root.querySelector('#gacha-progress');
    const summonBtn = root.querySelector('#gacha-summon-btn');
    if (summonBtn) summonBtn.disabled = true;

    playTone('impact');
    bar.reset();
    bar.set(0.32);

    const fetchPromise = summonAnime({
      minScore,
      minYear,
      format,
      genres: [...selectedGenres],
      hiddenGem
    });

    setTimeout(() => bar.set(0.72), 450);

    const [anime] = await Promise.all([
      fetchPromise,
      new Promise((r) => setTimeout(r, 950))
    ]);

    await new Promise((resolve) => {
      const onDone = () => {
        bar.removeEventListener('sakuga:done', onDone);
        resolve();
      };
      bar.addEventListener('sakuga:done', onDone);
      bar.set(1);
      setTimeout(resolve, 1600);
    });

    currentPull = anime;
    const rarity = getRarity(anime.score || 8);
    state.gachaHistory.unshift({ title: anime.title, rarity: rarity.code });
    state.gachaHistory = state.gachaHistory.slice(0, 10);
    saveState();

    playTone('fanfare');
    addExp(15, t('gcPulledToast', rarity.code, anime.title));
    if (summonBtn) {
      summonBtn.disabled = false;
      summonBtn.done();
    }
    pulling = false;
    renderResult(true);
  }

  function render() {
    root.innerHTML = `
      <div class="panel-head">
        <div>
          <div class="panel-kicker">${t('gcKicker')}</div>
          <h2 class="panel-title">${t('gcTitle')}</h2>
          <p class="panel-desc">${t('gcDesc')}</p>
        </div>
      </div>

      <div class="grid-sidebar">
        <div class="manga-card stack">
          <div class="field-group">
            <span class="field-title">${t('gcMinScore')}</span>
            <div class="slider-slot">
              <sakuga-slider id="gc-score" min="6" max="9" step="0.5" value="${minScore}" unit="★" label="${t('gcMinScore')}" style="--sk-slider-width: 100%;"></sakuga-slider>
            </div>
          </div>

          <div class="field-group">
            <span class="field-title">${t('gcMinYear')}</span>
            <div class="slider-slot">
              <sakuga-slider id="gc-year" min="1995" max="2024" step="1" value="${minYear}" unit="" label="${t('gcMinYear')}" style="--sk-slider-width: 100%;"></sakuga-slider>
            </div>
          </div>

          <div class="field-group">
            <span class="field-title">${t('gcFormat')}</span>
            <sakuga-radio id="gc-format" label="${t('gcFormat')}">
              <option value="all" ${format === 'all' ? 'selected' : ''}>${t('gcFmtAll')}</option>
              <option value="tv" ${format === 'tv' ? 'selected' : ''}>${t('gcFmtTv')}</option>
              <option value="movie" ${format === 'movie' ? 'selected' : ''}>${t('gcFmtMovie')}</option>
            </sakuga-radio>
          </div>

          <div class="field-group">
            <span class="field-title">${t('gcGenres')}</span>
            <div class="gacha-genres" id="gc-genres">
              ${GENRES.map((g) => `<sakuga-checkbox data-genre="${g}">${g}</sakuga-checkbox>`).join('')}
            </div>
          </div>

          <div class="row-wrap" style="justify-content:space-between;padding-top:8px;border-top:2px dashed var(--line)">
            <span style="font-size:13px;font-weight:700">${t('gcHiddenGem')}</span>
            <sakuga-toggle id="gc-gem" label="${t('gcHiddenGem')}"></sakuga-toggle>
          </div>
        </div>

        <div class="manga-card gacha-stage">
          <sakuga-button id="gacha-summon-btn">✨ ${t('gcSummonBtn')}</sakuga-button>

          <div class="progress-stage" style="min-height:170px;padding:46px 10px 8px">
            <sakuga-progress id="gacha-progress" label="${t('gcCharging')}" done-label="${t('gcChargeDone')}" style="--sk-progress-width: 300px;"></sakuga-progress>
          </div>

          <div id="gacha-result-slot" style="width:100%;display:flex;justify-content:center"></div>

          <div style="width:100%;text-align:left;padding-top:14px;border-top:2px dashed var(--line)">
            <div class="field-title" style="margin-bottom:8px">${t('gcHistory')}</div>
            <div id="gacha-history" class="row-wrap" style="gap:6px"></div>
          </div>
        </div>
      </div>
    `;

    const scoreEl = root.querySelector('#gc-score');
    const yearEl = root.querySelector('#gc-year');
    const fmtEl = root.querySelector('#gc-format');
    const gemEl = root.querySelector('#gc-gem');

    scoreEl.addEventListener('change', () => (minScore = Number(scoreEl.value)));
    yearEl.addEventListener('change', () => (minYear = Number(yearEl.value)));
    fmtEl.addEventListener('change', () => (format = fmtEl.value));

    requestAnimationFrame(() => {
      gemEl.checked = hiddenGem;
      root.querySelectorAll('[data-genre]').forEach((cb) => {
        cb.checked = selectedGenres.has(cb.dataset.genre);
      });
    });

    gemEl.addEventListener('change', () => (hiddenGem = Boolean(gemEl.checked)));
    root.querySelectorAll('[data-genre]').forEach((cb) => {
      cb.addEventListener('change', () => {
        if (cb.checked) selectedGenres.add(cb.dataset.genre);
        else selectedGenres.delete(cb.dataset.genre);
      });
    });

    root.querySelector('#gacha-summon-btn').addEventListener('click', triggerSummon);
    renderResult(false);
  }

  render();
  onLangChange(render);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}
