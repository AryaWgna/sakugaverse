import { t, onLangChange } from '../core/i18n.js';
import { state, saveState, addExp } from '../core/store.js';
import { playTone, setSfxEnabled, toggleAmbient, isAmbientPlaying } from '../core/sfx.js';
import { fxSSR, fxCombo } from '../core/fx.js';

export function initTraining(root) {
  let arc = 'chamber';
  let focusMin = 25;
  let breakMin = 5;
  let phase = 'focus';
  let remainingSec = focusMin * 60;
  let running = false;
  let sfxOn = true;
  let tickId = null;

  if (!state.quests) {
    state.quests = t('trDefaultQuests').map((text, i) => ({ id: i + 1, text, done: false }));
    saveState();
  }

  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function totalSec() {
    return (phase === 'focus' ? focusMin : breakMin) * 60;
  }

  function updateClockUI(instant = false) {
    const clock = root.querySelector('#tr-clock');
    const phaseEl = root.querySelector('#tr-phase');
    const bar = root.querySelector('#tr-progress');
    const ring = root.querySelector('#tr-aura-ring');
    const pct = Math.max(0, Math.min(1, 1 - remainingSec / Math.max(1, totalSec())));
    if (clock) clock.textContent = formatTime(remainingSec);
    if (phaseEl) phaseEl.textContent = phase === 'focus' ? t('trPhaseFocus') : t('trPhaseBreak');
    if (ring) ring.style.setProperty('--ring-pct', String(Math.round(pct * 100)));
    if (bar && typeof bar.set === 'function') {
      bar.set(pct, instant);
    }
  }

  function completeSession() {
    stopTimer();
    remainingSec = 0;
    const bar = root.querySelector('#tr-progress');
    const ring = root.querySelector('#tr-aura-ring');
    if (ring) ring.style.setProperty('--ring-pct', '100');
    if (bar) bar.set(1);
    playTone('fanfare');
    fxSSR(ring || bar);

    if (phase === 'focus') {
      state.sessionsDone += 1;
      addExp(50, t('trSessionComplete'));
      phase = 'break';
    } else {
      phase = 'focus';
    }
    setTimeout(() => {
      remainingSec = totalSec();
      if (bar) bar.reset();
      updateClockUI(true);
      updateStartBtnText();
    }, 1800);
  }

  function stopTimer() {
    running = false;
    if (tickId) {
      clearInterval(tickId);
      tickId = null;
    }
  }

  function updateStartBtnText() {
    const btn = root.querySelector('#tr-start-btn');
    if (btn) btn.textContent = running ? t('trPause') : t('trStart');
  }

  function toggleTimer() {
    if (running) {
      stopTimer();
      playTone('chime');
    } else {
      running = true;
      playTone('impact');
      tickId = setInterval(() => {
        remainingSec = Math.max(0, remainingSec - 1);
        updateClockUI();
        if (remainingSec <= 0) {
          completeSession();
        }
      }, 1000);
    }
    updateStartBtnText();
  }

  function resetTimer() {
    stopTimer();
    phase = 'focus';
    remainingSec = focusMin * 60;
    const bar = root.querySelector('#tr-progress');
    if (bar) bar.reset();
    updateClockUI(true);
    updateStartBtnText();
  }

  function renderQuests() {
    const list = root.querySelector('#tr-quest-list');
    if (!list) return;
    list.innerHTML = '';
    state.quests.forEach((q) => {
      const row = document.createElement('div');
      row.className = 'quest-row' + (q.done ? ' done' : '');
      row.innerHTML = `
        <sakuga-checkbox>${escapeHtml(q.text)}</sakuga-checkbox>
        <button type="button" class="mini-btn danger" aria-label="Delete">✕</button>
      `;
      const cb = row.querySelector('sakuga-checkbox');
      requestAnimationFrame(() => {
        cb.checked = Boolean(q.done);
      });
      cb.addEventListener('change', () => {
        const wasDone = q.done;
        q.done = Boolean(cb.checked);
        row.classList.toggle('done', q.done);
        if (q.done && !wasDone) {
          playTone('impact');
          fxCombo(row);
          addExp(20, t('trQuestDone', q.text));
        } else {
          saveState();
        }
      });
      row.querySelector('button').addEventListener('click', () => {
        state.quests = state.quests.filter((item) => item.id !== q.id);
        saveState();
        renderQuests();
      });
      list.append(row);
    });
  }

  function render() {
    const arcs = t('trArcs');
    root.innerHTML = `
      <div class="panel-head">
        <div>
          <div class="panel-kicker">${t('trKicker')}</div>
          <h2 class="panel-title">${t('trTitle')}</h2>
          <p class="panel-desc">${t('trDesc')}</p>
        </div>
        <div class="row-wrap">
          <div class="row-wrap" style="gap:8px">
            <span class="field-title" style="margin:0">🌧️ ${t('trAmbientToggle')}</span>
            <sakuga-toggle id="tr-ambient" label="${t('trAmbientToggle')}"></sakuga-toggle>
          </div>
          <div class="row-wrap" style="gap:8px">
            <span class="field-title" style="margin:0">🔊 ${t('trSfxToggle')}</span>
            <sakuga-toggle id="tr-sfx" label="${t('trSfxToggle')}"></sakuga-toggle>
          </div>
        </div>
      </div>

      <div class="grid-split">
        <div class="stack">
          <div class="manga-card" style="text-align:center">
            <div class="row-wrap" style="justify-content:center;gap:8px;margin-bottom:8px">
              <span class="arc-banner" id="tr-arc-banner">🔥 ${escapeHtml(arcs[arc])}</span>
            </div>

            <div class="aura-clock-ring" id="tr-aura-ring" style="--ring-pct: 0">
              <div class="aura-clock-inner">
                <span class="tag-chip accent" id="tr-phase" style="margin-bottom:4px">${phase === 'focus' ? t('trPhaseFocus') : t('trPhaseBreak')}</span>
                <div class="timer-display" id="tr-clock">${formatTime(remainingSec)}</div>
              </div>
            </div>

            <div class="progress-stage" style="min-height:175px;padding:48px 10px 10px">
              <sakuga-progress id="tr-progress" label="${t('trProgressLabel')}" done-label="${t('trDoneLabel')}" style="--sk-progress-width: 300px;"></sakuga-progress>
            </div>

            <div class="row-wrap" style="justify-content:center;margin-top:8px">
              <sakuga-button id="tr-start-btn">${running ? t('trPause') : t('trStart')}</sakuga-button>
              <sakuga-button id="tr-reset-btn" variant="secondary">${t('trReset')}</sakuga-button>
              <sakuga-button id="tr-quick-btn" variant="secondary">⚡ ${t('trSkipDemo')}</sakuga-button>
            </div>
          </div>

          <div class="manga-card soft stack">
            <div class="field-group">
              <span class="field-title">${t('trSelectArc')}</span>
              <sakuga-radio id="tr-arc-radio" label="${t('trSelectArc')}">
                <option value="chamber" ${arc === 'chamber' ? 'selected' : ''}>${arcs.chamber}</option>
                <option value="hashira" ${arc === 'hashira' ? 'selected' : ''}>${arcs.hashira}</option>
                <option value="chunin" ${arc === 'chunin' ? 'selected' : ''}>${arcs.chunin}</option>
                <option value="soul" ${arc === 'soul' ? 'selected' : ''}>${arcs.soul}</option>
              </sakuga-radio>
            </div>

            <div class="grid-2">
              <div class="field-group">
                <span class="field-title">${t('trFocusMin')}</span>
                <div class="slider-slot">
                  <sakuga-slider id="tr-focus-slider" min="5" max="60" step="5" value="${focusMin}" unit="m" label="${t('trFocusMin')}" style="--sk-slider-width:100%"></sakuga-slider>
                </div>
              </div>
              <div class="field-group">
                <span class="field-title">${t('trBreakMin')}</span>
                <div class="slider-slot">
                  <sakuga-slider id="tr-break-slider" min="1" max="20" step="1" value="${breakMin}" unit="m" label="${t('trBreakMin')}" style="--sk-slider-width:100%"></sakuga-slider>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="stack">
          <div class="manga-card">
            <h3 class="card-label">⚔️ ${t('trQuestTitle')}</h3>
            <div class="row-wrap" style="margin-bottom:16px">
              <sakuga-input id="tr-quest-input" label="${t('trQuestAdd')}" placeholder="${escapeAttr(t('trQuestPlaceholder'))}" style="--sk-input-width: 260px;"></sakuga-input>
              <sakuga-button id="tr-quest-add" variant="secondary">${t('trQuestAdd')}</sakuga-button>
            </div>
            <div id="tr-quest-list" class="quest-list"></div>
          </div>

          <div class="manga-card soft">
            <h3 class="card-label">⭐ ${t('trDailyEval')}</h3>
            <sakuga-rating id="tr-daily-rating" label="${t('trDailyEval')}"></sakuga-rating>
          </div>
        </div>
      </div>
    `;

    const sfxEl = root.querySelector('#tr-sfx');
    const ambEl = root.querySelector('#tr-ambient');
    requestAnimationFrame(() => {
      sfxEl.checked = sfxOn;
      ambEl.checked = isAmbientPlaying();
      updateClockUI(true);
    });
    sfxEl.addEventListener('change', () => {
      sfxOn = Boolean(sfxEl.checked);
      setSfxEnabled(sfxOn);
    });
    ambEl.addEventListener('change', () => {
      toggleAmbient(Boolean(ambEl.checked));
    });

    root.querySelector('#tr-start-btn').addEventListener('click', toggleTimer);
    root.querySelector('#tr-reset-btn').addEventListener('click', resetTimer);
    root.querySelector('#tr-quick-btn').addEventListener('click', completeSession);

    const arcRadio = root.querySelector('#tr-arc-radio');
    arcRadio.addEventListener('change', () => {
      arc = arcRadio.value;
      const banner = root.querySelector('#tr-arc-banner');
      if (banner) banner.textContent = `🔥 ${t('trArcs')[arc]}`;
    });

    const focusSlider = root.querySelector('#tr-focus-slider');
    focusSlider.addEventListener('change', () => {
      focusMin = Number(focusSlider.value) || 25;
      if (!running && phase === 'focus') {
        remainingSec = focusMin * 60;
        updateClockUI(true);
      }
    });

    const breakSlider = root.querySelector('#tr-break-slider');
    breakSlider.addEventListener('change', () => {
      breakMin = Number(breakSlider.value) || 5;
      if (!running && phase === 'break') {
        remainingSec = breakMin * 60;
        updateClockUI(true);
      }
    });

    const qInput = root.querySelector('#tr-quest-input');
    const qAdd = root.querySelector('#tr-quest-add');
    const addQuest = () => {
      const txt = (qInput.value || '').trim();
      if (!txt) return;
      state.quests.unshift({ id: Date.now(), text: txt, done: false });
      qInput.value = '';
      saveState();
      renderQuests();
    };
    qAdd.addEventListener('click', addQuest);
    qInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addQuest();
      }
    });

    const dailyRate = root.querySelector('#tr-daily-rating');
    dailyRate.addEventListener('change', () => {
      const val = Number(dailyRate.value);
      if (val > 0) {
        playTone('chime');
        addExp(10, t('trEvalSaved', val));
      }
    });

    renderQuests();
  }

  render();
  onLangChange(render);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}

function escapeAttr(s) {
  return escapeHtml(s).replace(/\n/g, ' ');
}
