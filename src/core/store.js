// Shared reactive store + localStorage persistence + Otaku Rank/EXP + Achievements + JSON Backup
import { t } from './i18n.js';
import { fxLevelUp } from './fx.js';

const STORAGE_KEY = 'sakugaverse_state_v1';

const STARTER_WATCHLIST = [
  {
    mal_id: 52991,
    title: 'Sousou no Frieren',
    episodes: 28,
    watched: 28,
    score: 9.3,
    rating: 5,
    favorite: true,
    year: 2023,
    type: 'TV',
    genres: ['Adventure', 'Drama', 'Fantasy'],
    image: 'https://cdn.myanimelist.net/images/anime/1015/138006.jpg',
    synopsis: 'After a ten-year quest to defeat the Demon King, elven mage Frieren embarks on a quiet journey to understand humanity and cherish fleeting memories.'
  },
  {
    mal_id: 40748,
    title: 'Jujutsu Kaisen',
    episodes: 24,
    watched: 16,
    score: 8.6,
    rating: 4,
    favorite: false,
    year: 2020,
    type: 'TV',
    genres: ['Action', 'Fantasy', 'Supernatural'],
    image: 'https://cdn.myanimelist.net/images/anime/1171/109222.jpg',
    synopsis: 'Yuji Itadori swallows a cursed talisman—the finger of a legendary demon—and enrolls at Tokyo Jujutsu High to exorcise deadly curses.'
  },
  {
    mal_id: 5114,
    title: 'Fullmetal Alchemist: Brotherhood',
    episodes: 64,
    watched: 0,
    score: 9.1,
    rating: 0,
    favorite: false,
    year: 2009,
    type: 'TV',
    genres: ['Action', 'Adventure', 'Drama', 'Fantasy'],
    image: 'https://cdn.myanimelist.net/images/anime/1208/94745.jpg',
    synopsis: 'Two brothers search for the Philosopher’s Stone to restore their bodies after a forbidden alchemical ritual goes tragically wrong.'
  }
];

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        exp: Number(parsed.exp) || 0,
        awakening: Boolean(parsed.awakening),
        darkMode: Boolean(parsed.darkMode),
        watchlist: Array.isArray(parsed.watchlist) ? parsed.watchlist : STARTER_WATCHLIST,
        gachaHistory: Array.isArray(parsed.gachaHistory) ? parsed.gachaHistory : [],
        quests: Array.isArray(parsed.quests) ? parsed.quests : null,
        quizBest: Number(parsed.quizBest) || 0,
        quizMaxStreak: Number(parsed.quizMaxStreak) || 0,
        sessionsDone: Number(parsed.sessionsDone) || 0,
        cardsForged: Number(parsed.cardsForged) || 0
      };
    }
  } catch {
    // ignore corrupted storage
  }
  return {
    exp: 45,
    awakening: false,
    darkMode: false,
    watchlist: STARTER_WATCHLIST,
    gachaHistory: [],
    quests: null,
    quizBest: 0,
    quizMaxStreak: 0,
    sessionsDone: 0,
    cardsForged: 0
  };
}

export const state = loadState();
const listeners = new Set();

export function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore storage quota errors
  }
  listeners.forEach((fn) => fn(state));
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getRankInfo(exp = state.exp) {
  const level = Math.floor(exp / 100) + 1;
  const intoLevel = exp % 100;
  const ranks = t('ranks');
  const rankIdx = Math.min(ranks.length - 1, Math.floor((level - 1) / 2));
  return {
    level,
    intoLevel,
    needed: 100,
    pct: Math.min(100, (intoLevel / 100) * 100),
    rankName: ranks[rankIdx]
  };
}

export function getAchievements() {
  const completedCount = state.watchlist.filter((a) => a.episodes > 0 && a.watched >= a.episodes).length;
  const hasSSR = state.gachaHistory.some((h) => h.rarity === 'SSR');
  const level = getRankInfo().level;
  const labels = t('achievements');
  return [
    { id: 'completed', icon: '🏆', title: labels.completed, unlocked: completedCount >= 1 },
    { id: 'ssr', icon: '✨', title: labels.ssr, unlocked: hasSSR },
    { id: 'trainer', icon: '🔥', title: labels.trainer, unlocked: state.sessionsDone >= 1 },
    { id: 'forger', icon: '🃏', title: labels.forger, unlocked: state.cardsForged >= 1 },
    { id: 'quiz', icon: '⚡', title: labels.quiz, unlocked: state.quizBest >= 4 || state.quizMaxStreak >= 3 },
    { id: 'rank', icon: '👑', title: labels.rank, unlocked: level >= 3 }
  ];
}

export function notify(message) {
  const toast = document.getElementById('global-toast');
  if (toast && typeof toast.show === 'function') {
    toast.show(message);
  }
}

export function addExp(amount, customToast) {
  const prevLevel = getRankInfo(state.exp).level;
  state.exp += amount;
  saveState();
  const next = getRankInfo(state.exp);
  if (next.level > prevLevel) {
    fxLevelUp(document.getElementById('rank-pill'));
    notify(t('levelUp', next.level, next.rankName));
  } else if (customToast) {
    notify(customToast);
  }
}

export function addToWatchlist(anime) {
  const exists = state.watchlist.some(
    (a) => (anime.mal_id && a.mal_id === anime.mal_id) || a.title.toLowerCase() === anime.title.toLowerCase()
  );
  if (exists) {
    notify(t('wlExists'));
    return false;
  }
  state.watchlist.unshift({
    mal_id: anime.mal_id || Date.now(),
    title: anime.title,
    episodes: anime.episodes || 12,
    watched: 0,
    score: anime.score || 8.0,
    rating: 0,
    favorite: false,
    year: anime.year || 2024,
    type: anime.type || 'TV',
    genres: anime.genres || [],
    image: anime.image || '',
    synopsis: anime.synopsis || 'No synopsis available.'
  });
  addExp(15, t('wlAdded', anime.title));
  return true;
}

export function exportBackup() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sakugaverse-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  notify(t('backupExported'));
}

export function importBackup(rawText) {
  try {
    const parsed = JSON.parse(rawText);
    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.watchlist)) {
      notify(t('backupInvalid'));
      return false;
    }
    Object.assign(state, {
      exp: Number(parsed.exp) || 0,
      awakening: Boolean(parsed.awakening),
      darkMode: Boolean(parsed.darkMode),
      watchlist: parsed.watchlist,
      gachaHistory: Array.isArray(parsed.gachaHistory) ? parsed.gachaHistory : [],
      quests: Array.isArray(parsed.quests) ? parsed.quests : state.quests,
      quizBest: Number(parsed.quizBest) || 0,
      quizMaxStreak: Number(parsed.quizMaxStreak) || 0,
      sessionsDone: Number(parsed.sessionsDone) || 0,
      cardsForged: Number(parsed.cardsForged) || 0
    });
    saveState();
    notify(t('backupImported'));
    return true;
  } catch {
    notify(t('backupInvalid'));
    return false;
  }
}
