import { t, onLangChange } from '../core/i18n.js';
import { state, saveState, subscribe, addExp, addToWatchlist, notify } from '../core/store.js';
import { searchAnime, ALL_GENRES } from '../core/jikan.js';
import { playTone } from '../core/sfx.js';
import { fxCelebrate } from '../core/fx.js';

const FALLBACK_SVG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 170'%3E%3Crect width='120' height='170' fill='%23edeaff'/%3E%3Ctext x='60' y='88' text-anchor='middle' font-family='sans-serif' font-weight='800' font-size='16' fill='%235a4fd8'%3EANIME%3C/text%3E%3C/svg%3E";

export function initWatchlist(root, { openModal } = {}) {
  let activeFilter = 'all';
  let sortMode = 'default';
  let spoilerFree = false;

  // Search Pro state
  let searchMode = 'search'; // 'search' | 'airing' | 'top' | 'upcoming'
  let searchQuery = '';
  let searchType = 'all';
  let searchGenre = 'all';
  let searchSort = 'relevance';
  let searchPage = 1;
  let hasNextPage = false;
  let searchResults = [];
  let searchStatus = '';
  let lastListSig = '';

  function getListSig() {
    return state.watchlist.map((a) => `${a.mal_id}:${a.title}`).join('|');
  }

  function isInWatchlist(anime) {
    return state.watchlist.some(
      (a) => (anime.mal_id && a.mal_id === anime.mal_id) || a.title.toLowerCase() === (anime.title || '').toLowerCase()
    );
  }

  function getStatus(item) {
    if (item.watched >= item.episodes && item.episodes > 0) return 'completed';
    if (item.watched > 0) return 'watching';
    return 'plan';
  }

  function calcOverallProgress() {
    const totalEps = state.watchlist.reduce((acc, a) => acc + Math.max(1, a.episodes || 12), 0);
    const doneEps = state.watchlist.reduce((acc, a) => acc + Math.min(a.watched || 0, Math.max(1, a.episodes || 12)), 0);
    return totalEps > 0 ? doneEps / totalEps : 0;
  }

  function updateOverallBar(instant = false) {
    if (root.hidden) return;
    const bar = root.querySelector('#wl-overall-progress');
    if (bar && typeof bar.set === 'function') {
      bar.set(calcOverallProgress(), instant);
    }
  }

  function updateFilterCounts() {
    const counts = { all: state.watchlist.length, watching: 0, completed: 0, plan: 0, fav: 0 };
    state.watchlist.forEach((a) => {
      counts[getStatus(a)]++;
      if (a.favorite) counts.fav++;
    });
    const map = {
      all: `${t('wlFilterAll')} (${counts.all})`,
      watching: `${t('wlFilterWatching')} (${counts.watching})`,
      completed: `${t('wlFilterCompleted')} (${counts.completed})`,
      plan: `${t('wlFilterPlan')} (${counts.plan})`,
      fav: `${t('wlFilterFav')} (${counts.fav})`
    };
    root.querySelectorAll('[data-filter]').forEach((btn) => {
      if (map[btn.dataset.filter]) btn.textContent = map[btn.dataset.filter];
    });
  }

  function openAnimeDetail(anime, isSaved = true) {
    if (typeof openModal !== 'function') return;
    const maxEp = Math.max(1, anime.episodes || 12);
    const malUrl = anime.mal_id && anime.mal_id < 9999999 ? `https://myanimelist.net/anime/${anime.mal_id}` : '';
    const alreadyAdded = isInWatchlist(anime);

    openModal(
      `
      <div class="row-wrap" style="justify-content:space-between;margin-bottom:14px">
        <span class="tag-chip gold">MAL ★ ${anime.score || '—'} · ${anime.year || ''}</span>
        <button type="button" class="mini-btn" id="detail-close">✕ ${t('closeBtn')}</button>
      </div>
      <div class="gacha-result-top" style="margin-bottom:16px">
        <div class="gacha-poster">
          <img src="${anime.image || FALLBACK_SVG}" alt="" onerror="this.src='${FALLBACK_SVG}'">
        </div>
        <div style="flex:1;min-width:0">
          <h3 style="margin:0 0 8px;font-size:21px;font-weight:800;line-height:1.2">${escapeHtml(anime.title)}</h3>
          <div class="row-wrap" style="gap:6px;margin-bottom:10px">
            <span class="tag-chip pri">${anime.type || 'TV'} · ${maxEp} EPS</span>
            ${(anime.genres || []).slice(0, 4).map((g) => `<span class="tag-chip">${escapeHtml(g)}</span>`).join('')}
          </div>
          <p style="margin:0;font-size:13.5px;color:var(--mute);line-height:1.55">${escapeHtml(anime.synopsis || '')}</p>
        </div>
      </div>

      ${
        isSaved
          ? `
        <div class="manga-card soft stack" style="padding:14px;box-shadow:var(--shadow-sm)">
          <div class="field-group">
            <span class="field-title">${t('wlQuickEp')} (${anime.watched} / ${maxEp})</span>
            <div class="slider-slot">
              <sakuga-slider id="detail-ep-slider" min="0" max="${maxEp}" step="1" value="${anime.watched}" unit=" ep" label="${t('wlQuickEp')}" style="--sk-slider-width:100%"></sakuga-slider>
            </div>
          </div>
          <div class="field-group">
            <span class="field-title">${t('wlNotesLabel')}</span>
            <textarea id="detail-notes" class="manga-textarea" placeholder="${escapeAttr(t('wlNotesPlaceholder'))}">${escapeHtml(anime.notes || '')}</textarea>
          </div>
        </div>`
          : `
        <div style="text-align:center;margin:14px 0">
          <button type="button" class="mini-btn" id="detail-add-now" style="padding:10px 18px;font-size:14px">
            ${alreadyAdded ? t('wlInList') : t('wlAddBtn')}
          </button>
        </div>`
      }

      ${malUrl ? `<div style="margin-top:16px;text-align:right"><a class="mini-btn" href="${malUrl}" target="_blank" rel="noopener">${t('wlOpenMal')}</a></div>` : ''}
      `,
      (dialog, close) => {
        dialog.querySelector('#detail-close')?.addEventListener('click', close);
        const epSlider = dialog.querySelector('#detail-ep-slider');
        epSlider?.addEventListener('change', () => {
          const prev = anime.watched;
          anime.watched = Number(epSlider.value) || 0;
          if (anime.watched === maxEp && prev < maxEp) {
            playTone('fanfare');
            fxCelebrate(dialog);
            addExp(40, t('wlCompletedToast', anime.title));
          } else {
            playTone('chime');
            saveState();
          }
          renderList();
          updateOverallBar();
        });
        const notesEl = dialog.querySelector('#detail-notes');
        notesEl?.addEventListener('change', () => {
          anime.notes = notesEl.value.trim();
          saveState();
          notify(t('wlNotesSaved'));
        });
        dialog.querySelector('#detail-add-now')?.addEventListener('click', (e) => {
          if (addToWatchlist(anime)) {
            playTone('chime');
            e.currentTarget.textContent = t('wlInList');
            renderSearchResults();
            renderList();
            updateOverallBar();
          }
        });
      }
    );
  }

  function renderSearchResults() {
    const box = root.querySelector('#wl-search-results');
    const msg = root.querySelector('#wl-search-status');
    const moreWrap = root.querySelector('#wl-load-more-wrap');
    if (!box || !msg) return;
    msg.textContent = searchStatus;
    if (!searchResults.length) {
      box.innerHTML = '';
      if (moreWrap) moreWrap.innerHTML = '';
      return;
    }

    box.innerHTML = searchResults
      .map((a, idx) => {
        const added = isInWatchlist(a);
        return `
      <div class="search-item">
        <div class="anime-thumb" data-preview-idx="${idx}" style="cursor:pointer" title="${t('wlDetailBtn')}">
          <img src="${a.image || FALLBACK_SVG}" alt="" loading="lazy" onerror="this.src='${FALLBACK_SVG}'">
        </div>
        <div class="search-meta">
          <h4 data-preview-idx="${idx}" style="cursor:pointer">${escapeHtml(a.title)}</h4>
          <p>★ ${a.score || 'N/A'} · ${a.type || 'TV'} · ${a.episodes || '?'} eps · ${a.year || ''}</p>
          <div class="row-wrap" style="gap:6px">
            <button type="button" class="mini-btn" data-add-idx="${idx}" ${added ? 'disabled style="opacity:0.65"' : ''}>
              ${added ? t('wlInList') : t('wlAddBtn')}
            </button>
            <button type="button" class="mini-btn" data-preview-idx="${idx}">${t('wlDetailBtn')}</button>
          </div>
        </div>
      </div>`;
      })
      .join('');

    box.querySelectorAll('[data-add-idx]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const item = searchResults[Number(btn.dataset.addIdx)];
        if (item && addToWatchlist(item)) {
          playTone('chime');
          renderSearchResults();
          renderList();
          updateOverallBar();
        }
      });
    });

    box.querySelectorAll('[data-preview-idx]').forEach((el) => {
      el.addEventListener('click', () => {
        const item = searchResults[Number(el.dataset.previewIdx)];
        if (item) {
          playTone('chime');
          openAnimeDetail(item, false);
        }
      });
    });

    if (moreWrap) {
      moreWrap.innerHTML = hasNextPage
        ? `<button type="button" class="filter-pill active" id="wl-load-more-btn">${t('wlLoadMore')}</button>`
        : '';
      moreWrap.querySelector('#wl-load-more-btn')?.addEventListener('click', () => runSearch(true));
    }
  }

  async function runSearch(append = false) {
    const inputEl = root.querySelector('#wl-search-input');
    const searchBtn = root.querySelector('#wl-search-btn');
    if (inputEl) searchQuery = inputEl.value || '';
    if (!append) {
      searchPage = 1;
      searchResults = [];
    } else {
      searchPage += 1;
    }
    searchStatus = t('wlSearching');
    renderSearchResults();

    const { items, hasNextPage: more, fromFallback } = await searchAnime({
      query: searchQuery,
      type: searchType,
      genre: searchGenre,
      orderBy: searchSort,
      page: searchPage,
      mode: searchMode
    });

    if (append) {
      const seen = new Set(searchResults.map((a) => a.mal_id));
      searchResults = [...searchResults, ...items.filter((a) => !seen.has(a.mal_id))];
    } else {
      searchResults = items;
    }
    hasNextPage = more;
    searchStatus = !searchResults.length ? t('wlNoResult') : fromFallback ? t('wlApiFallback') : '';
    if (!append && searchBtn && typeof searchBtn.done === 'function') searchBtn.done();
    renderSearchResults();
  }

  function renderList() {
    lastListSig = getListSig();
    const counts = { all: state.watchlist.length, watching: 0, completed: 0, plan: 0, fav: 0 };
    state.watchlist.forEach((a) => {
      counts[getStatus(a)]++;
      if (a.favorite) counts.fav++;
    });

    const pills = root.querySelector('#wl-filters');
    if (pills) {
      pills.innerHTML = [
        ['all', `${t('wlFilterAll')} (${counts.all})`],
        ['watching', `${t('wlFilterWatching')} (${counts.watching})`],
        ['completed', `${t('wlFilterCompleted')} (${counts.completed})`],
        ['plan', `${t('wlFilterPlan')} (${counts.plan})`],
        ['fav', `${t('wlFilterFav')} (${counts.fav})`]
      ]
        .map(
          ([key, label]) =>
            `<button type="button" class="filter-pill ${activeFilter === key ? 'active' : ''}" data-filter="${key}">${label}</button>`
        )
        .join('');

      pills.querySelectorAll('[data-filter]').forEach((btn) => {
        btn.addEventListener('click', () => {
          activeFilter = btn.dataset.filter;
          renderList();
        });
      });
    }

    const listEl = root.querySelector('#wl-grid');
    if (!listEl) return;
    let filtered = state.watchlist.filter((a) => {
      if (activeFilter === 'all') return true;
      if (activeFilter === 'fav') return Boolean(a.favorite);
      return getStatus(a) === activeFilter;
    });

    if (sortMode === 'mal') filtered = [...filtered].sort((a, b) => (b.score || 0) - (a.score || 0));
    else if (sortMode === 'myrate') filtered = [...filtered].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    else if (sortMode === 'prog') {
      filtered = [...filtered].sort(
        (a, b) => b.watched / Math.max(1, b.episodes) - a.watched / Math.max(1, a.episodes)
      );
    } else if (sortMode === 'az') filtered = [...filtered].sort((a, b) => (a.title || '').localeCompare(b.title || ''));

    if (!filtered.length) {
      listEl.innerHTML = `<div class="empty-box">${t('wlEmpty')}</div>`;
      return;
    }

    listEl.innerHTML = '';
    filtered.forEach((anime) => {
      const pct = Math.min(100, Math.round(((anime.watched || 0) / Math.max(1, anime.episodes || 12)) * 100));
      const status = getStatus(anime);
      const card = document.createElement('article');
      card.className = 'wl-card';
      card.innerHTML = `
        <div class="wl-top">
          <div class="wl-poster" data-open-detail title="${t('wlDetailBtn')}">
            <img src="${anime.image || FALLBACK_SVG}" alt="" loading="lazy" onerror="this.src='${FALLBACK_SVG}'">
          </div>
          <div class="wl-info">
            <div class="wl-title-row">
              <h3 class="wl-title" data-open-detail>${escapeHtml(anime.title)}</h3>
              <sakuga-tooltip text="${escapeAttr((anime.synopsis || '').slice(0, 160))}" label="Synopsis"></sakuga-tooltip>
            </div>
            <div class="row-wrap" style="margin-top:6px;gap:6px">
              <span class="tag-chip ${status === 'completed' ? 'accent' : status === 'watching' ? 'pri' : ''}">
                ${status === 'completed' ? t('wlFilterCompleted') : status === 'watching' ? t('wlFilterWatching') : t('wlFilterPlan')}
              </span>
              <span class="tag-chip gold">MAL ${anime.score || '—'}</span>
              ${anime.notes ? `<span class="tag-chip">📝</span>` : ''}
            </div>
            <p class="wl-synopsis ${spoilerFree ? 'blurred' : ''}">${escapeHtml(anime.synopsis || '')}</p>
          </div>
        </div>

        <div class="wl-ep-bar">
          <span class="wl-ep-count">${anime.watched} / ${anime.episodes} EPS (${pct}%)</span>
          <div class="row-wrap" style="gap:6px">
            <button type="button" class="mini-btn" data-ep-delta="-1">${t('wlEpMinus')}</button>
            <button type="button" class="mini-btn" data-ep-delta="1">${t('wlEpPlus')}</button>
          </div>
        </div>
        <div class="wl-prog-mini"><div style="width:${pct}%"></div></div>

        <div class="wl-footer">
          <sakuga-rating label="Rate ${escapeAttr(anime.title)}"></sakuga-rating>
          <sakuga-checkbox>${t('wlFavorite')}</sakuga-checkbox>
          <button type="button" class="mini-btn danger" data-remove>${t('wlRemove')}</button>
        </div>
      `;

      card.querySelectorAll('[data-open-detail]').forEach((el) => {
        el.addEventListener('click', () => {
          playTone('chime');
          openAnimeDetail(anime, true);
        });
      });

      const ratingEl = card.querySelector('sakuga-rating');
      requestAnimationFrame(() => {
        if (anime.rating) ratingEl.value = anime.rating;
      });
      ratingEl.addEventListener('change', () => {
        anime.rating = Number(ratingEl.value) || 0;
        saveState();
        if (anime.rating > 0) notify(t('wlRatingSaved', anime.rating));
      });

      const favEl = card.querySelector('sakuga-checkbox');
      requestAnimationFrame(() => {
        favEl.checked = Boolean(anime.favorite);
      });
      favEl.addEventListener('change', () => {
        anime.favorite = Boolean(favEl.checked);
        saveState();
        updateFilterCounts();
      });

      card.querySelectorAll('[data-ep-delta]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const delta = Number(btn.dataset.epDelta);
          const prev = anime.watched;
          const prevStatus = getStatus(anime);
          anime.watched = Math.max(0, Math.min(anime.episodes || 999, prev + delta));
          if (anime.watched !== prev) {
            if (anime.watched === anime.episodes && prev < anime.episodes) {
              playTone('fanfare');
              fxCelebrate(card);
              addExp(40, t('wlCompletedToast', anime.title));
            } else {
              playTone('chime');
              saveState();
            }
            const nextStatus = getStatus(anime);
            if (activeFilter !== 'all' && activeFilter !== 'fav' && nextStatus !== prevStatus) {
              renderList();
            } else {
              const newPct = Math.min(100, Math.round((anime.watched / Math.max(1, anime.episodes || 12)) * 100));
              const countEl = card.querySelector('.wl-ep-count');
              const barFill = card.querySelector('.wl-prog-mini > div');
              const badge = card.querySelector('.tag-chip');
              if (countEl) countEl.textContent = `${anime.watched} / ${anime.episodes} EPS (${newPct}%)`;
              if (barFill) barFill.style.width = `${newPct}%`;
              if (badge) {
                badge.className = `tag-chip ${nextStatus === 'completed' ? 'accent' : nextStatus === 'watching' ? 'pri' : ''}`;
                badge.textContent = nextStatus === 'completed' ? t('wlFilterCompleted') : nextStatus === 'watching' ? t('wlFilterWatching') : t('wlFilterPlan');
              }
              updateFilterCounts();
            }
            updateOverallBar();
          }
        });
      });

      card.querySelector('[data-remove]').addEventListener('click', () => {
        const idx = state.watchlist.findIndex((x) => x.mal_id === anime.mal_id && x.title === anime.title);
        if (idx !== -1) {
          state.watchlist.splice(idx, 1);
          saveState();
          notify(t('wlRemoved'));
          renderList();
          renderSearchResults();
          updateOverallBar();
        }
      });

      listEl.append(card);
    });
  }

  function render() {
    root.innerHTML = `
      <div class="panel-head">
        <div>
          <div class="panel-kicker">${t('wlKicker')}</div>
          <h2 class="panel-title">${t('wlTitle')}</h2>
          <p class="panel-desc">${t('wlDesc')}</p>
        </div>
        <div class="row-wrap">
          <span class="field-title" style="margin:0">${t('wlSpoilerFree')}</span>
          <sakuga-tooltip text="${escapeAttr(t('wlSpoilerHint'))}"></sakuga-tooltip>
          <sakuga-toggle id="wl-spoiler-toggle" label="${escapeAttr(t('wlSpoilerFree'))}"></sakuga-toggle>
        </div>
      </div>

      <div class="grid-split" style="margin-bottom:22px">
        <div class="manga-card">
          <div class="filter-pills" id="wl-search-modes" style="margin-bottom:14px">
            <button type="button" class="filter-pill ${searchMode === 'search' ? 'active' : ''}" data-smode="search">${t('wlTabSearch')}</button>
            <button type="button" class="filter-pill ${searchMode === 'airing' ? 'active' : ''}" data-smode="airing">${t('wlTabAiring')}</button>
            <button type="button" class="filter-pill ${searchMode === 'top' ? 'active' : ''}" data-smode="top">${t('wlTabTop')}</button>
            <button type="button" class="filter-pill ${searchMode === 'upcoming' ? 'active' : ''}" data-smode="upcoming">${t('wlTabUpcoming')}</button>
          </div>

          <div class="search-bar-row">
            <sakuga-input id="wl-search-input" type="search" label="${escapeAttr(t('wlSearchBtn'))}" placeholder="${escapeAttr(t('wlSearchPlaceholder'))}"></sakuga-input>
            <sakuga-button id="wl-search-btn">${t('wlSearchBtn')}</sakuga-button>
          </div>

          <div class="row-wrap" style="margin-top:12px;gap:8px">
            <select id="wl-stype" class="manga-select" aria-label="Anime type">
              <option value="all" ${searchType === 'all' ? 'selected' : ''}>${t('wlFilterTypeAll')}</option>
              <option value="tv" ${searchType === 'tv' ? 'selected' : ''}>TV</option>
              <option value="movie" ${searchType === 'movie' ? 'selected' : ''}>Movie</option>
              <option value="ova" ${searchType === 'ova' ? 'selected' : ''}>OVA</option>
            </select>
            <select id="wl-sgenre" class="manga-select" aria-label="Anime genre">
              <option value="all" ${searchGenre === 'all' ? 'selected' : ''}>${t('wlFilterGenreAll')}</option>
              ${ALL_GENRES.map((g) => `<option value="${g}" ${searchGenre === g ? 'selected' : ''}>${g}</option>`).join('')}
            </select>
            <select id="wl-ssort" class="manga-select" aria-label="Search sort">
              <option value="relevance" ${searchSort === 'relevance' ? 'selected' : ''}>${t('wlSortRel')}</option>
              <option value="score" ${searchSort === 'score' ? 'selected' : ''}>${t('wlSortScore')}</option>
              <option value="popularity" ${searchSort === 'popularity' ? 'selected' : ''}>${t('wlSortPop')}</option>
            </select>
          </div>

          <p id="wl-search-status" style="margin:10px 0 0;font-size:13px;color:var(--mute)"></p>
          <div id="wl-search-results" class="search-results"></div>
          <div id="wl-load-more-wrap" style="margin-top:14px;text-align:center"></div>
        </div>

        <div class="manga-card soft">
          <h3 class="card-label">⚡ ${t('wlOverallProgress')}</h3>
          <div class="progress-stage">
            <sakuga-progress id="wl-overall-progress" label="${escapeAttr(t('wlOverallProgress'))}" done-label="${escapeAttr(t('wlOverallDone'))}" style="--sk-progress-width: 300px;"></sakuga-progress>
          </div>
        </div>
      </div>

      <div class="manga-card">
        <div class="row-wrap" style="justify-content:space-between;margin-bottom:6px">
          <div id="wl-filters" class="filter-pills"></div>
          <div class="row-wrap" style="gap:8px">
            <span style="font-size:12.5px;font-weight:800;color:var(--mute)">${t('wlSortLabel')}</span>
            <select id="wl-list-sort" class="manga-select" aria-label="Sort watchlist">
              <option value="default" ${sortMode === 'default' ? 'selected' : ''}>${t('wlSortDefault')}</option>
              <option value="mal" ${sortMode === 'mal' ? 'selected' : ''}>${t('wlSortMal')}</option>
              <option value="myrate" ${sortMode === 'myrate' ? 'selected' : ''}>${t('wlSortMyRate')}</option>
              <option value="prog" ${sortMode === 'prog' ? 'selected' : ''}>${t('wlSortProg')}</option>
              <option value="az" ${sortMode === 'az' ? 'selected' : ''}>${t('wlSortAZ')}</option>
            </select>
          </div>
        </div>
        <div id="wl-grid" class="watchlist-grid"></div>
      </div>
    `;

    const inputEl = root.querySelector('#wl-search-input');
    const searchBtn = root.querySelector('#wl-search-btn');
    const spoilerToggle = root.querySelector('#wl-spoiler-toggle');

    requestAnimationFrame(() => {
      if (searchQuery) inputEl.value = searchQuery;
      spoilerToggle.checked = spoilerFree;
      updateOverallBar(true);
    });

    root.querySelectorAll('[data-smode]').forEach((btn) => {
      btn.addEventListener('click', () => {
        searchMode = btn.dataset.smode;
        root.querySelectorAll('[data-smode]').forEach((b) => b.classList.toggle('active', b === btn));
        playTone('chime');
        if (searchMode !== 'search' || searchQuery) runSearch(false);
      });
    });

    root.querySelector('#wl-stype').addEventListener('change', (e) => {
      searchType = e.target.value;
      searchMode = 'search';
      runSearch(false);
    });
    root.querySelector('#wl-sgenre').addEventListener('change', (e) => {
      searchGenre = e.target.value;
      searchMode = 'search';
      runSearch(false);
    });
    root.querySelector('#wl-ssort').addEventListener('change', (e) => {
      searchSort = e.target.value;
      searchMode = 'search';
      runSearch(false);
    });

    root.querySelector('#wl-list-sort').addEventListener('change', (e) => {
      sortMode = e.target.value;
      renderList();
    });

    searchBtn.addEventListener('click', () => {
      searchMode = 'search';
      root.querySelectorAll('[data-smode]').forEach((b) => b.classList.toggle('active', b.dataset.smode === 'search'));
      runSearch(false);
    });
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        searchMode = 'search';
        runSearch(false);
      }
    });

    spoilerToggle.addEventListener('change', () => {
      spoilerFree = Boolean(spoilerToggle.checked);
      renderList();
    });

    renderSearchResults();
    renderList();
  }

  render();
  onLangChange(render);
  subscribe(() => {
    const sig = getListSig();
    if (sig !== lastListSig) {
      renderList();
      renderSearchResults();
      updateOverallBar();
    }
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}

function escapeAttr(s) {
  return escapeHtml(s).replace(/\n/g, ' ');
}
