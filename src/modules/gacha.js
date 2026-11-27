import { t, onLangChange } from '../core/i18n.js';
import { state, addExp, addToWatchlist, saveState } from '../core/store.js';
import { summonAnimeBatch, ALL_GENRES } from '../core/jikan.js';
import { playTone } from '../core/sfx.js';
import { fxSSR, fxCelebrate } from '../core/fx.js';

const FALLBACK_SVG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 170'%3E%3Crect width='120' height='170' fill='%23edeaff'/%3E%3Ctext x='60' y='88' text-anchor='middle' font-family='sans-serif' font-weight='800' font-size='16' fill='%23ff5fa8'%3ESSR%3C/text%3E%3C/svg%3E";

export function initGacha(root) {
  let banner = 'allstar';
  let minScore = 7.5;
  let minYear = 2005;
  let format = 'all';
  let selectedGenres = new Set();
  let hiddenGem = false;
  let skipWatchlist = true;
  let currentPulls = [];
  let recentIds = new Set();
  let pulling = false;

  function getRarity(score) {
    if (score >= 8.5) return { code: 'SSR', cls: 'ssr' };
    if (score >= 7.8) return { code: 'SR', cls: 'sr' };
    return { code: 'R', cls: 'r' };
  }

  function updatePityUI() {
    const el = root.querySelector('#gacha-pity-text');
    const bar = root.querySelector('#gacha-pity-fill');
    if (el) el.textContent = t('gcPityText', state.gachaPity || 0);
    if (bar) bar.style.width = `${Math.min(100, ((state.gachaPity || 0) / 5) * 100)}%`;
  }

  function renderResult(withFx = false) {
    updatePityUI();
    const slot = root.querySelector('#gacha-result-slot');
    const histEl = root.querySelector('#gacha-history');
    if (histEl) {
      histEl.innerHTML = state.gachaHistory.length
        ? state.gachaHistory
            .slice(0, 8)
            .map((h) => `<span class="tag-chip ${h.rarity === 'SSR' ? 'gold' : ''}">${h.rarity} · ${escapeHtml(h.title)}</span>`)
            .join('')
        : `<span style="color:var(--mute);font-size:13px">—</span>`;
    }
    if (!slot) return;
    if (!currentPulls.length) {
      slot.innerHTML = `<div class="empty-box" style="max-width:440px">${t('gcIdleText')}</div>`;
      return;
    }

    if (currentPulls.length === 1) {
      const pull = currentPulls[0];
      const rarity = getRarity(pull.score || 8);
      slot.innerHTML = `
        <div class="gacha-flip-scene">
          <div class="gacha-flip-card">
            <div class="gacha-card ${rarity.code === 'SSR' ? 'ssr-glow' : ''}">
              <span class="gacha-rarity ${rarity.cls}">${rarity.code} · ★ ${pull.score || '8.0'}</span>
              <div class="gacha-result-top">
                <div class="gacha-poster">
                  <img src="${pull.image || FALLBACK_SVG}" alt="" onerror="this.src='${FALLBACK_SVG}'">
                </div>
                <div style="flex:1;min-width:0">
                  <h3 style="margin:0 0 6px;font-size:18px;font-weight:800;line-height:1.2">${escapeHtml(pull.title)}</h3>
                  <p style="margin:0 0 8px;font-size:12.5px;color:var(--mute);font-weight:700">
                    ${pull.type || 'TV'} · ${pull.episodes || '?'} eps · ${pull.year || ''}
                  </p>
                  <div class="row-wrap" style="gap:5px;margin-bottom:8px">
                    ${(pull.genres || []).slice(0, 3).map((g) => `<span class="tag-chip">${escapeHtml(g)}</span>`).join('')}
                  </div>
                  <p style="margin:0;font-size:12.5px;color:var(--mute);display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden">
                    ${escapeHtml(pull.synopsis || '')}
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
        if (addToWatchlist(pull)) {
          playTone('chime');
          addBtn.done();
        }
      });
      slot.querySelector('#gc-reroll').addEventListener('click', () => triggerSummon(1));
      return;
    }

    // 5x Multi-Pull Grid!
    const hasSSR = currentPulls.some((a) => getRarity(a.score || 8).code === 'SSR');
    slot.innerHTML = `
      <div class="gacha-multi-grid">
        ${currentPulls
          .map((a, i) => {
            const rarity = getRarity(a.score || 8);
            return `
          <div class="gacha-mini-card ${rarity.code === 'SSR' ? 'ssr-glow' : ''}">
            <span class="gacha-rarity ${rarity.cls}" style="margin-bottom:2px;align-self:flex-start">${rarity.code} · ★ ${a.score || '8.0'}</span>
            <div class="gacha-mini-poster">
              <img src="${a.image || FALLBACK_SVG}" alt="" loading="lazy" onerror="this.src='${FALLBACK_SVG}'">
            </div>
            <h4 style="margin:0;font-size:13.5px;font-weight:800;line-height:1.25;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">
              ${escapeHtml(a.title)}
            </h4>
            <p style="margin:0;font-size:11.5px;color:var(--mute)">${a.type || 'TV'} · ${a.year || ''}</p>
            <button type="button" class="mini-btn" data-multi-add="${i}" style="margin-top:auto">${t('wlAddBtn')}</button>
          </div>`;
          })
          .join('')}
      </div>
    `;

    if (withFx) {
      requestAnimationFrame(() => {
        if (hasSSR) fxSSR(slot);
        else fxCelebrate(slot);
      });
    }

    slot.querySelectorAll('[data-multi-add]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const anime = currentPulls[Number(btn.dataset.multiAdd)];
        if (anime && addToWatchlist(anime)) {
          playTone('chime');
          btn.textContent = t('wlInList');
          btn.disabled = true;
        }
      });
    });
  }

  async function triggerSummon(count = 1) {
    if (pulling) return;
    pulling = true;
    const bar = root.querySelector('#gacha-progress');
    const singleBtn = root.querySelector('#gacha-summon-btn');
    const multiBtn = root.querySelector('#gacha-multi-btn');
    if (singleBtn) singleBtn.disabled = true;
    if (multiBtn) multiBtn.disabled = true;

    const guaranteedSSR = count >= 5 || (state.gachaPity || 0) >= 4;
    const exclude = new Set(recentIds);
    if (skipWatchlist) {
      state.watchlist.forEach((a) => exclude.add(a.mal_id));
    }

    playTone('impact');
    bar.reset();
    bar.set(0.32);

    const fetchPromise = summonAnimeBatch({
      count,
      minScore,
      minYear,
      format,
      genres: [...selectedGenres],
      hiddenGem,
      banner,
      excludeIds: exclude,
      guaranteedSSR
    });

    setTimeout(() => bar.set(0.75), 420);

    const [results] = await Promise.all([
      fetchPromise,
      new Promise((r) => setTimeout(r, 900))
    ]);

    await new Promise((resolve) => {
      const onDone = () => {
        bar.removeEventListener('sakuga:done', onDone);
        resolve();
      };
      bar.addEventListener('sakuga:done', onDone);
      bar.set(1);
      setTimeout(resolve, 1500);
    });

    currentPulls = results;
    let ssrHits = 0;
    results.forEach((anime) => {
      recentIds.add(anime.mal_id);
      const rarity = getRarity(anime.score || 8);
      if (rarity.code === 'SSR') ssrHits++;
      state.gachaHistory.unshift({ title: anime.title, rarity: rarity.code });
    });
    if (recentIds.size > 40) recentIds = new Set([...recentIds].slice(-20));
    state.gachaHistory = state.gachaHistory.slice(0, 14);

    if (ssrHits > 0) state.gachaPity = 0;
    else state.gachaPity = Math.min(4, (state.gachaPity || 0) + count);
    saveState();

    playTone('fanfare');
    if (count === 1 && results[0]) {
      const r = getRarity(results[0].score || 8);
      addExp(15, t('gcPulledToast', r.code, results[0].title));
      singleBtn?.done();
    } else {
      addExp(40, t('gcMultiToast', results.length, ssrHits));
      multiBtn?.done();
    }

    if (singleBtn) singleBtn.disabled = false;
    if (multiBtn) multiBtn.disabled = false;
    pulling = false;
    renderResult(true);
  }

  function render() {
    const banners = t('gcBanners');
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
            <span class="field-title">${t('gcBannerLabel')}</span>
            <sakuga-radio id="gc-banner" label="${t('gcBannerLabel')}">
              <option value="allstar" ${banner === 'allstar' ? 'selected' : ''}>${banners.allstar}</option>
              <option value="seasonal" ${banner === 'seasonal' ? 'selected' : ''}>${banners.seasonal}</option>
              <option value="gems" ${banner === 'gems' ? 'selected' : ''}>${banners.gems}</option>
              <option value="classic" ${banner === 'classic' ? 'selected' : ''}>${banners.classic}</option>
              <option value="movies" ${banner === 'movies' ? 'selected' : ''}>${banners.movies}</option>
            </sakuga-radio>
          </div>

          <div class="field-group">
            <span class="field-title">${t('gcMinScore')}</span>
            <div class="slider-slot">
              <sakuga-slider id="gc-score" min="6" max="9" step="0.5" value="${minScore}" unit="★" label="${t('gcMinScore')}" style="--sk-slider-width: 100%;"></sakuga-slider>
            </div>
          </div>

          <div class="field-group">
            <span class="field-title">${t('gcMinYear')}</span>
            <div class="slider-slot">
              <sakuga-slider id="gc-year" min="1990" max="2025" step="1" value="${minYear}" unit="" label="${t('gcMinYear')}" style="--sk-slider-width: 100%;"></sakuga-slider>
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
              ${ALL_GENRES.map((g) => `<sakuga-checkbox data-genre="${g}">${g}</sakuga-checkbox>`).join('')}
            </div>
          </div>

          <div class="stack" style="gap:10px;padding-top:8px;border-top:2px dashed var(--line)">
            <div class="row-wrap" style="justify-content:space-between">
              <span style="font-size:13px;font-weight:700">${t('gcSkipWatchlist')}</span>
              <sakuga-toggle id="gc-skip-wl" label="${t('gcSkipWatchlist')}"></sakuga-toggle>
            </div>
            <div class="row-wrap" style="justify-content:space-between">
              <span style="font-size:13px;font-weight:700">${t('gcHiddenGem')}</span>
              <sakuga-toggle id="gc-gem" label="${t('gcHiddenGem')}"></sakuga-toggle>
            </div>
          </div>
        </div>

        <div class="manga-card gacha-stage">
          <div class="row-wrap" style="justify-content:center">
            <sakuga-button id="gacha-summon-btn">✨ ${t('gcSummonBtn')}</sakuga-button>
            <sakuga-button id="gacha-multi-btn">${t('gcMultiBtn')}</sakuga-button>
          </div>

          <div class="gacha-pity-bar">
            <div id="gacha-pity-text" style="margin-bottom:6px">${t('gcPityText', state.gachaPity || 0)}</div>
            <div class="rank-bar-track"><div class="rank-bar-fill" id="gacha-pity-fill" style="width:${((state.gachaPity || 0) / 5) * 100}%"></div></div>
          </div>

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

    const bannerEl = root.querySelector('#gc-banner');
    const scoreEl = root.querySelector('#gc-score');
    const yearEl = root.querySelector('#gc-year');
    const fmtEl = root.querySelector('#gc-format');
    const gemEl = root.querySelector('#gc-gem');
    const skipEl = root.querySelector('#gc-skip-wl');

    bannerEl.addEventListener('change', () => (banner = bannerEl.value));
    scoreEl.addEventListener('change', () => (minScore = Number(scoreEl.value)));
    yearEl.addEventListener('change', () => (minYear = Number(yearEl.value)));
    fmtEl.addEventListener('change', () => (format = fmtEl.value));

    requestAnimationFrame(() => {
      gemEl.checked = hiddenGem;
      skipEl.checked = skipWatchlist;
      root.querySelectorAll('[data-genre]').forEach((cb) => {
        cb.checked = selectedGenres.has(cb.dataset.genre);
      });
    });

    gemEl.addEventListener('change', () => (hiddenGem = Boolean(gemEl.checked)));
    skipEl.addEventListener('change', () => (skipWatchlist = Boolean(skipEl.checked)));
    root.querySelectorAll('[data-genre]').forEach((cb) => {
      cb.addEventListener('change', () => {
        if (cb.checked) selectedGenres.add(cb.dataset.genre);
        else selectedGenres.delete(cb.dataset.genre);
      });
    });

    root.querySelector('#gacha-summon-btn').addEventListener('click', () => triggerSummon(1));
    root.querySelector('#gacha-multi-btn').addEventListener('click', () => triggerSummon(5));
    renderResult(false);
  }

  render();
  onLangChange(render);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}
