// Shared reactive store + localStorage persistence + Otaku Rank/EXP + Achievements + JSON Backup
import { t } from './i18n.js';
import { fxLevelUp } from './fx.js';

const STORAGE_KEY = 'sakugaverse_state_v1';
const STARTER_PACK_VERSION = 2;

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
    favorite: true,
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
    watched: 64,
    score: 9.1,
    rating: 5,
    favorite: true,
    year: 2009,
    type: 'TV',
    genres: ['Action', 'Adventure', 'Drama', 'Fantasy'],
    image: 'https://cdn.myanimelist.net/images/anime/1208/94745.jpg',
    synopsis: 'Two brothers search for the Philosopher’s Stone to restore their bodies after a forbidden alchemical ritual goes tragically wrong.'
  },
  {
    mal_id: 21,
    title: 'One Piece',
    episodes: 1122,
    watched: 1086,
    score: 8.73,
    rating: 5,
    favorite: true,
    year: 1999,
    type: 'TV',
    genres: ['Action', 'Adventure', 'Fantasy'],
    image: 'https://cdn.myanimelist.net/images/anime/1244/138851.jpg',
    synopsis: 'Monkey D. Luffy sets sail with his Straw Hat crew across the Grand Line in pursuit of the legendary treasure One Piece to become King of the Pirates.'
  },
  {
    mal_id: 52299,
    title: 'Ore dake Level Up na Ken (Solo Leveling)',
    episodes: 12,
    watched: 12,
    score: 8.31,
    rating: 5,
    favorite: true,
    year: 2024,
    type: 'TV',
    genres: ['Action', 'Adventure', 'Fantasy'],
    image: 'https://cdn.myanimelist.net/images/anime/1926/140799.jpg',
    synopsis: 'Known as the weakest hunter of all mankind, Sung Jinwoo unlocks a mysterious System that allows him alone to level up without limit.'
  },
  {
    mal_id: 57334,
    title: 'Dandadan',
    episodes: 12,
    watched: 9,
    score: 8.56,
    rating: 5,
    favorite: false,
    year: 2024,
    type: 'TV',
    genres: ['Action', 'Comedy', 'Sci-Fi', 'Supernatural'],
    image: 'https://cdn.myanimelist.net/images/anime/1584/143719.jpg',
    synopsis: 'Momo believes in ghosts while Okarun believes in aliens—their bet to prove each other wrong spirals into chaotic, sakuga-packed occult battles.'
  },
  {
    mal_id: 16498,
    title: 'Shingeki no Kyojin (Attack on Titan)',
    episodes: 25,
    watched: 25,
    score: 8.55,
    rating: 5,
    favorite: true,
    year: 2013,
    type: 'TV',
    genres: ['Action', 'Drama', 'Suspense'],
    image: 'https://cdn.myanimelist.net/images/anime/10/47347.jpg',
    synopsis: 'Humanity fights for survival behind towering walls after colossal man-eating Titans shatter a century of fragile peace.'
  },
  {
    mal_id: 38000,
    title: 'Kimetsu no Yaiba (Demon Slayer)',
    episodes: 26,
    watched: 26,
    score: 8.45,
    rating: 4,
    favorite: false,
    year: 2019,
    type: 'TV',
    genres: ['Action', 'Fantasy'],
    image: 'https://cdn.myanimelist.net/images/anime/1286/99889.jpg',
    synopsis: 'After demons slaughter his family and transform his sister Nezuko, Tanjiro Kamado joins the Demon Slayer Corps to find a cure.'
  },
  {
    mal_id: 44511,
    title: 'Chainsaw Man',
    episodes: 12,
    watched: 8,
    score: 8.5,
    rating: 4,
    favorite: false,
    year: 2022,
    type: 'TV',
    genres: ['Action', 'Fantasy'],
    image: 'https://cdn.myanimelist.net/images/anime/1806/126216.jpg',
    synopsis: 'Betrayed and left for dead, impoverished devil hunter Denji merges with his chainsaw devil Pochita to become the unstoppable Chainsaw Man.'
  },
  {
    mal_id: 50265,
    title: 'Spy x Family',
    episodes: 12,
    watched: 12,
    score: 8.48,
    rating: 4,
    favorite: false,
    year: 2022,
    type: 'TV',
    genres: ['Action', 'Comedy', 'Slice of Life'],
    image: 'https://cdn.myanimelist.net/images/anime/1441/122795.jpg',
    synopsis: 'Master spy Twilight builds a fake family with an assassin wife and a telepathic daughter to keep peace between rival nations.'
  },
  {
    mal_id: 47917,
    title: 'Bocchi the Rock!',
    episodes: 12,
    watched: 7,
    score: 8.8,
    rating: 5,
    favorite: true,
    year: 2022,
    type: 'TV',
    genres: ['Comedy', 'Slice of Life'],
    image: 'https://cdn.myanimelist.net/images/anime/1448/127956.jpg',
    synopsis: 'Painfully shy guitar prodigy Hitori "Bocchi" Gotoh joins Kessoku Band and navigates live-house stage fright in hilarious, creative animation.'
  },
  {
    mal_id: 9253,
    title: 'Steins;Gate',
    episodes: 24,
    watched: 0,
    score: 9.07,
    rating: 0,
    favorite: false,
    year: 2011,
    type: 'TV',
    genres: ['Drama', 'Sci-Fi', 'Suspense'],
    image: 'https://cdn.myanimelist.net/images/anime/1935/127974.jpg',
    synopsis: 'Eccentric scientist Rintarou Okabe accidentally invents a microwave capable of sending text messages into the past, altering timelines forever.'
  },
  {
    mal_id: 37521,
    title: 'Vinland Saga',
    episodes: 24,
    watched: 14,
    score: 8.76,
    rating: 5,
    favorite: false,
    year: 2019,
    type: 'TV',
    genres: ['Action', 'Adventure', 'Drama'],
    image: 'https://cdn.myanimelist.net/images/anime/1500/103005.jpg',
    synopsis: 'Driven by vengeance against his father’s killer, young Viking warrior Thorfinn grows amid brutal wars toward a deeper meaning of strength.'
  },
  {
    mal_id: 37510,
    title: 'Mob Psycho 100 II',
    episodes: 13,
    watched: 0,
    score: 8.8,
    rating: 0,
    favorite: false,
    year: 2019,
    type: 'TV',
    genres: ['Action', 'Comedy', 'Supernatural'],
    image: 'https://cdn.myanimelist.net/images/anime/1918/96303.jpg',
    synopsis: 'Unbelievably powerful esper Shigeo "Mob" Kageyama strives to improve himself as an ordinary person while facing his greatest psychic threats.'
  },
  {
    mal_id: 42310,
    title: 'Cyberpunk: Edgerunners',
    episodes: 10,
    watched: 0,
    score: 8.61,
    rating: 0,
    favorite: false,
    year: 2022,
    type: 'TV',
    genres: ['Action', 'Sci-Fi'],
    image: 'https://cdn.myanimelist.net/images/anime/1818/126435.jpg',
    synopsis: 'In neon-drenched Night City, street kid David Martinez installs military-grade chrome and becomes an outlaw mercenary known as an edgerunner.'
  }
];

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      let watchlist = Array.isArray(parsed.watchlist) ? parsed.watchlist : [...STARTER_WATCHLIST];
      const packVer = Number(parsed.starterPackVersion) || 1;
      if (packVer < STARTER_PACK_VERSION) {
        const existingIds = new Set(watchlist.map((a) => a.mal_id));
        const existingTitles = new Set(watchlist.map((a) => (a.title || '').toLowerCase()));
        for (const item of STARTER_WATCHLIST) {
          if (!existingIds.has(item.mal_id) && !existingTitles.has(item.title.toLowerCase())) {
            watchlist.push({ ...item });
          }
        }
      }
      const next = {
        starterPackVersion: STARTER_PACK_VERSION,
        exp: Number(parsed.exp) || 0,
        awakening: Boolean(parsed.awakening),
        darkMode: Boolean(parsed.darkMode),
        watchlist,
        gachaHistory: Array.isArray(parsed.gachaHistory) ? parsed.gachaHistory : [],
        quests: Array.isArray(parsed.quests) ? parsed.quests : null,
        quizBest: Number(parsed.quizBest) || 0,
        quizMaxStreak: Number(parsed.quizMaxStreak) || 0,
        sessionsDone: Number(parsed.sessionsDone) || 0,
        cardsForged: Number(parsed.cardsForged) || 0
      };
      if (packVer < STARTER_PACK_VERSION) {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      }
      return next;
    }
  } catch {
    // ignore corrupted storage
  }
  return {
    starterPackVersion: STARTER_PACK_VERSION,
    exp: 45,
    awakening: false,
    darkMode: false,
    watchlist: STARTER_WATCHLIST.map((a) => ({ ...a })),
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
