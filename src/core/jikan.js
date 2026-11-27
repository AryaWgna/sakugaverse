// Jikan API v4 (MyAnimeList) helper with retry, caching, 14 genres, pagination, 5 gacha banners, character search, and 44-anime curated fallback

export const GENRE_MAP = {
  Action: 1,
  Adventure: 2,
  Comedy: 4,
  Drama: 8,
  Fantasy: 10,
  Romance: 22,
  'Sci-Fi': 24,
  'Slice of Life': 36,
  Mystery: 7,
  Sports: 30,
  Supernatural: 37,
  Suspense: 41,
  Mecha: 18,
  Music: 19
};

export const ALL_GENRES = Object.keys(GENRE_MAP);

export const FALLBACK_ANIME = [
  { mal_id: 52991, title: 'Sousou no Frieren', episodes: 28, score: 9.3, year: 2023, type: 'TV', genres: ['Adventure', 'Drama', 'Fantasy'], popularity: 120, image: 'https://cdn.myanimelist.net/images/anime/1015/138006.jpg', synopsis: 'After a ten-year quest to defeat the Demon King, elven mage Frieren journeys to understand the meaning of human connections.' },
  { mal_id: 5114, title: 'Fullmetal Alchemist: Brotherhood', episodes: 64, score: 9.1, year: 2009, type: 'TV', genres: ['Action', 'Adventure', 'Drama', 'Fantasy'], popularity: 3, image: 'https://cdn.myanimelist.net/images/anime/1208/94745.jpg', synopsis: 'Edward and Alphonse Elric seek the Philosopher’s Stone to restore what they lost in a forbidden alchemical transmutation.' },
  { mal_id: 9253, title: 'Steins;Gate', episodes: 24, score: 9.07, year: 2011, type: 'TV', genres: ['Drama', 'Sci-Fi', 'Suspense'], popularity: 13, image: 'https://cdn.myanimelist.net/images/anime/1935/127974.jpg', synopsis: 'Self-proclaimed mad scientist Rintarou Okabe accidentally invents a device capable of sending text messages into the past.' },
  { mal_id: 11061, title: 'Hunter x Hunter (2011)', episodes: 148, score: 9.03, year: 2011, type: 'TV', genres: ['Action', 'Adventure', 'Fantasy'], popularity: 9, image: 'https://cdn.myanimelist.net/images/anime/1337/99013.jpg', synopsis: 'Young Gon Freecss sets out to become a legendary Hunter and reunite with his father, forging unbreakable friendships along the way.' },
  { mal_id: 28851, title: 'Koe no Katachi (A Silent Voice)', episodes: 1, score: 8.93, year: 2016, type: 'Movie', genres: ['Drama', 'Romance'], popularity: 19, image: 'https://cdn.myanimelist.net/images/anime/1122/96435.jpg', synopsis: 'A former bully seeks redemption by reconnecting with the deaf classmate he once tormented in elementary school.' },
  { mal_id: 54492, title: 'Kusuriya no Hitorigoto (Apothecary Diaries)', episodes: 24, score: 8.88, year: 2023, type: 'TV', genres: ['Drama', 'Mystery'], popularity: 210, image: 'https://cdn.myanimelist.net/images/anime/1708/138033.jpg', synopsis: 'Poison-obsessed apothecary Maomao untangles courtly conspiracies and medical mysteries inside the Imperial Rear Palace.' },
  { mal_id: 19, title: 'Monster', episodes: 74, score: 8.88, year: 2004, type: 'TV', genres: ['Drama', 'Mystery', 'Suspense'], popularity: 125, image: 'https://cdn.myanimelist.net/images/anime/10/18793.jpg', synopsis: 'Brilliant neurosurgeon Kenzo Tenma risks everything to save a young boy’s life, only to confront the terrifying sociopath that child becomes.' },
  { mal_id: 32281, title: 'Kimi no Na wa. (Your Name)', episodes: 1, score: 8.84, year: 2016, type: 'Movie', genres: ['Drama', 'Romance', 'Supernatural'], popularity: 11, image: 'https://cdn.myanimelist.net/images/anime/5/87048.jpg', synopsis: 'Two strangers find themselves linked in a bizarre way, swapping bodies across time and distance as a comet approaches Earth.' },
  { mal_id: 37510, title: 'Mob Psycho 100 II', episodes: 13, score: 8.8, year: 2019, type: 'TV', genres: ['Action', 'Comedy', 'Supernatural'], popularity: 65, image: 'https://cdn.myanimelist.net/images/anime/1918/96303.jpg', synopsis: 'Shigeo "Mob" Kageyama is an insanely powerful esper who just wants to grow as a person without relying on his psychic powers.' },
  { mal_id: 47917, title: 'Bocchi the Rock!', episodes: 12, score: 8.8, year: 2022, type: 'TV', genres: ['Comedy', 'Music', 'Slice of Life'], popularity: 185, image: 'https://cdn.myanimelist.net/images/anime/1448/127956.jpg', synopsis: 'Socially anxious guitarist Hitori Gotoh dreams of playing in a band and gets pulled into Kessoku Band at a Shimokitazawa live house.' },
  { mal_id: 37521, title: 'Vinland Saga', episodes: 24, score: 8.76, year: 2019, type: 'TV', genres: ['Action', 'Adventure', 'Drama'], popularity: 72, image: 'https://cdn.myanimelist.net/images/anime/1500/103005.jpg', synopsis: 'Raised on tales of Vinland, young Thorfinn enters a brutal Viking war seeking vengeance—and discovers what a true warrior is.' },
  { mal_id: 1, title: 'Cowboy Bebop', episodes: 26, score: 8.75, year: 1998, type: 'TV', genres: ['Action', 'Sci-Fi'], popularity: 43, image: 'https://cdn.myanimelist.net/images/anime/4/19644.jpg', synopsis: 'A ragtag crew of bounty hunters drifts across the solar system in 2071 to the beat of smoky space jazz.' },
  { mal_id: 21, title: 'One Piece', episodes: 1122, score: 8.73, year: 1999, type: 'TV', genres: ['Action', 'Adventure', 'Fantasy'], popularity: 18, image: 'https://cdn.myanimelist.net/images/anime/1244/138851.jpg', synopsis: 'Monkey D. Luffy sets sail across the Grand Line with his Straw Hat crew to claim the legendary treasure One Piece.' },
  { mal_id: 1575, title: 'Code Geass: Hangyaku no Lelouch', episodes: 25, score: 8.7, year: 2006, type: 'TV', genres: ['Action', 'Drama', 'Mecha', 'Sci-Fi'], popularity: 22, image: 'https://cdn.myanimelist.net/images/anime/1032/135088.jpg', synopsis: 'Exiled prince Lelouch obtains the power of absolute obedience—Geass—and leads a masked rebellion against the Britannian Empire.' },
  { mal_id: 33352, title: 'Violet Evergarden', episodes: 13, score: 8.68, year: 2018, type: 'TV', genres: ['Drama', 'Fantasy'], popularity: 48, image: 'https://cdn.myanimelist.net/images/anime/1795/95088.jpg', synopsis: 'A former child soldier becomes an Auto Memory Doll writing letters for others while searching for the meaning of "I love you."' },
  { mal_id: 46102, title: 'Odd Taxi', episodes: 13, score: 8.67, year: 2021, type: 'TV', genres: ['Drama', 'Mystery', 'Suspense'], popularity: 380, image: 'https://cdn.myanimelist.net/images/anime/1981/113348.jpg', synopsis: 'An eccentric walrus taxi driver’s late-night conversations weave into a razor-sharp Tokyo missing-girl mystery.' },
  { mal_id: 34599, title: 'Made in Abyss', episodes: 13, score: 8.65, year: 2017, type: 'TV', genres: ['Adventure', 'Drama', 'Fantasy', 'Mystery'], popularity: 115, image: 'https://cdn.myanimelist.net/images/anime/6/86733.jpg', synopsis: 'Orphan Riko and a mysterious robot boy descend into a breathtaking, perilous chasm that hides ancient relics and unforgiving curses.' },
  { mal_id: 2001, title: 'Tengen Toppa Gurren Lagann', episodes: 27, score: 8.64, year: 2007, type: 'TV', genres: ['Action', 'Adventure', 'Mecha', 'Sci-Fi'], popularity: 64, image: 'https://cdn.myanimelist.net/images/anime/4/5123.jpg', synopsis: 'Subterranean digger Simon and fearless Kamina break through the ceiling of their world to pierce the heavens in colossal mecha.' },
  { mal_id: 23273, title: 'Shigatsu wa Kimi no Uso (Your Lie in April)', episodes: 22, score: 8.64, year: 2014, type: 'TV', genres: ['Drama', 'Music', 'Romance'], popularity: 25, image: 'https://cdn.myanimelist.net/images/anime/3/67177.jpg', synopsis: 'A piano prodigy who lost the ability to hear his own playing meets a spirited violinist who brings color back to his life.' },
  { mal_id: 1535, title: 'Death Note', episodes: 37, score: 8.62, year: 2006, type: 'TV', genres: ['Mystery', 'Supernatural', 'Suspense'], popularity: 2, image: 'https://cdn.myanimelist.net/images/anime/1079/138100.jpg', synopsis: 'A genius student discovers a supernatural notebook that kills anyone whose name is written inside, sparking a deadly cat-and-mouse duel with L.' },
  { mal_id: 22135, title: 'Ping Pong the Animation', episodes: 11, score: 8.62, year: 2014, type: 'TV', genres: ['Drama', 'Sports'], popularity: 540, image: 'https://cdn.myanimelist.net/images/anime/10/58041.jpg', synopsis: 'Two childhood friends with wildly different temperaments collide on the high school table tennis circuit in explosive sakuga style.' },
  { mal_id: 42310, title: 'Cyberpunk: Edgerunners', episodes: 10, score: 8.61, year: 2022, type: 'TV', genres: ['Action', 'Sci-Fi'], popularity: 95, image: 'https://cdn.myanimelist.net/images/anime/1818/126435.jpg', synopsis: 'A street kid tries to survive in a tech-obsessed Night City by becoming a neon-drenched mercenary outlaw: an edgerunner.' },
  { mal_id: 40748, title: 'Jujutsu Kaisen', episodes: 24, score: 8.6, year: 2020, type: 'TV', genres: ['Action', 'Fantasy', 'Supernatural'], popularity: 15, image: 'https://cdn.myanimelist.net/images/anime/1171/109222.jpg', synopsis: 'High schooler Yuji Itadori joins a secret organization of Jujutsu Sorcerers to battle deadly Curses born from human negativity.' },
  { mal_id: 57334, title: 'Dandadan', episodes: 12, score: 8.56, year: 2024, type: 'TV', genres: ['Action', 'Comedy', 'Sci-Fi', 'Supernatural'], popularity: 175, image: 'https://cdn.myanimelist.net/images/anime/1584/143719.jpg', synopsis: 'Momo believes in ghosts while Okarun believes in aliens—their bet spirals into chaotic, sakuga-packed occult battles.' },
  { mal_id: 16498, title: 'Shingeki no Kyojin (Attack on Titan)', episodes: 25, score: 8.55, year: 2013, type: 'TV', genres: ['Action', 'Drama', 'Suspense'], popularity: 1, image: 'https://cdn.myanimelist.net/images/anime/10/47347.jpg', synopsis: 'Humanity fights for survival behind towering walls after colossal man-eating Titans shatter a century of peace.' },
  { mal_id: 35839, title: 'Sora yori mo Tooi Basho', episodes: 13, score: 8.52, year: 2018, type: 'TV', genres: ['Adventure', 'Comedy', 'Drama'], popularity: 340, image: 'https://cdn.myanimelist.net/images/anime/6/89879.jpg', synopsis: 'Four high school girls defy every doubt to board a research vessel bound for Antarctica.' },
  { mal_id: 52034, title: 'Oshi no Ko', episodes: 11, score: 8.59, year: 2023, type: 'TV', genres: ['Drama', 'Mystery', 'Supernatural'], popularity: 112, image: 'https://cdn.myanimelist.net/images/anime/1812/134736.jpg', synopsis: 'Behind the glittering lights of Japan’s idol entertainment industry lurks a gripping tale of reincarnation, ambition, and revenge.' },
  { mal_id: 44511, title: 'Chainsaw Man', episodes: 12, score: 8.5, year: 2022, type: 'TV', genres: ['Action', 'Fantasy'], popularity: 52, image: 'https://cdn.myanimelist.net/images/anime/1806/126216.jpg', synopsis: 'Betrayed and left for dead, impoverished devil hunter Denji merges with his chainsaw devil Pochita to become Chainsaw Man.' },
  { mal_id: 50265, title: 'Spy x Family', episodes: 12, score: 8.48, year: 2022, type: 'TV', genres: ['Action', 'Comedy', 'Slice of Life'], popularity: 55, image: 'https://cdn.myanimelist.net/images/anime/1441/122795.jpg', synopsis: 'A master spy, an assassin, and a telepathic child form a fake family to maintain world peace—while hiding their secrets.' },
  { mal_id: 20583, title: 'Haikyuu!!', episodes: 25, score: 8.44, year: 2014, type: 'TV', genres: ['Sports', 'Comedy', 'Drama'], popularity: 35, image: 'https://cdn.myanimelist.net/images/anime/7/76014.jpg', synopsis: 'Determined to soar despite his height, Shoyo Hinata teams up with rival setter Tobio Kageyama to revive Karasuno High volleyball.' },
  { mal_id: 38000, title: 'Kimetsu no Yaiba (Demon Slayer)', episodes: 26, score: 8.45, year: 2019, type: 'TV', genres: ['Action', 'Fantasy'], popularity: 5, image: 'https://cdn.myanimelist.net/images/anime/1286/99889.jpg', synopsis: 'After demons slaughter his family and transform his sister Nezuko, Tanjiro Kamado joins the Demon Slayer Corps.' },
  { mal_id: 51009, title: 'Pluto', episodes: 8, score: 8.46, year: 2023, type: 'TV', genres: ['Action', 'Mystery', 'Sci-Fi', 'Suspense'], popularity: 620, image: 'https://cdn.myanimelist.net/images/anime/1516/138801.jpg', synopsis: 'In a world where humans and advanced robots coexist, Europol detective Gesicht investigates the systematic murders of the seven greatest robots.' },
  { mal_id: 37999, title: 'Kaguya-sama: Love is War', episodes: 12, score: 8.4, year: 2019, type: 'TV', genres: ['Comedy', 'Romance'], popularity: 40, image: 'https://cdn.myanimelist.net/images/anime/1295/106551.jpg', synopsis: 'Two proud student council geniuses wage hilarious psychological warfare to force the other to confess first.' },
  { mal_id: 199, title: 'Sen to Chihiro no Kamikakushi (Spirited Away)', episodes: 1, score: 8.77, year: 2001, type: 'Movie', genres: ['Adventure', 'Fantasy', 'Supernatural'], popularity: 44, image: 'https://cdn.myanimelist.net/images/anime/6/79597.jpg', synopsis: 'Young Chihiro wanders into a spirit bathhouse world and must work to rescue her parents who were turned into pigs.' },
  { mal_id: 30, title: 'Neon Genesis Evangelion', episodes: 26, score: 8.35, year: 1995, type: 'TV', genres: ['Action', 'Drama', 'Mecha', 'Sci-Fi', 'Suspense'], popularity: 45, image: 'https://cdn.myanimelist.net/images/anime/1314/108941.jpg', synopsis: 'Teenager Shinji Ikari is recruited to pilot a biomechanical Eva unit against monstrous Angels threatening Tokyo-3.' },
  { mal_id: 41457, title: '86 (Eighty-Six)', episodes: 11, score: 8.32, year: 2021, type: 'TV', genres: ['Action', 'Drama', 'Mecha', 'Sci-Fi'], popularity: 260, image: 'https://cdn.myanimelist.net/images/anime/1987/117507.jpg', synopsis: 'Beyond the walls of San Magnolia, the forgotten 86th sector pilots spider-tanks in a war officially declared "unmanned."' },
  { mal_id: 52299, title: 'Ore dake Level Up na Ken (Solo Leveling)', episodes: 12, score: 8.31, year: 2024, type: 'TV', genres: ['Action', 'Adventure', 'Fantasy'], popularity: 145, image: 'https://cdn.myanimelist.net/images/anime/1926/140799.jpg', synopsis: 'Known as the weakest hunter, Sung Jinwoo unlocks a mysterious System allowing him alone to level up without limit.' },
  { mal_id: 6675, title: 'Redline', episodes: 1, score: 8.3, year: 2009, type: 'Movie', genres: ['Action', 'Sci-Fi', 'Sports'], popularity: 490, image: 'https://cdn.myanimelist.net/images/anime/12/28553.jpg', synopsis: 'Seven years of hand-drawn madness: daredevil JP blasts across an intergalactic illegal death-race at impossible velocity.' },
  { mal_id: 31043, title: 'Boku dake ga Inai Machi (Erased)', episodes: 12, score: 8.3, year: 2016, type: 'TV', genres: ['Drama', 'Mystery', 'Supernatural', 'Suspense'], popularity: 31, image: 'https://cdn.myanimelist.net/images/anime/10/77957.jpg', synopsis: 'Sent 18 years back to his childhood, Satoru gets one shot to prevent a string of kidnappings and change destiny.' },
  { mal_id: 31240, title: 'Re:Zero kara Hajimeru Isekai Seikatsu', episodes: 25, score: 8.24, year: 2016, type: 'TV', genres: ['Drama', 'Fantasy', 'Suspense'], popularity: 23, image: 'https://cdn.myanimelist.net/images/anime/1522/128039.jpg', synopsis: 'Summoned to a fantasy world, Subaru Natsuki discovers his only power is "Return by Death"—rewinding time each time he dies.' },
  { mal_id: 49596, title: 'Blue Lock', episodes: 24, score: 8.21, year: 2022, type: 'TV', genres: ['Sports'], popularity: 165, image: 'https://cdn.myanimelist.net/images/anime/1258/126929.jpg', synopsis: 'Three hundred high school strikers enter a ruthless ego-driven training facility to forge Japan’s ultimate World Cup striker.' },
  { mal_id: 42897, title: 'Horimiya', episodes: 13, score: 8.2, year: 2021, type: 'TV', genres: ['Romance', 'Slice of Life'], popularity: 78, image: 'https://cdn.myanimelist.net/images/anime/1695/111486.jpg', synopsis: 'Popular classmate Hori and quiet pierced loner Miyamura discover each other’s hidden home-life sides and fall in love.' },
  { mal_id: 30831, title: 'Kono Subarashii Sekai ni Shukufuku wo!', episodes: 10, score: 8.11, year: 2016, type: 'TV', genres: ['Adventure', 'Comedy', 'Fantasy'], popularity: 27, image: 'https://cdn.myanimelist.net/images/anime/1895/142748.jpg', synopsis: 'Reincarnated with a useless goddess, explosion-obsessed mage, and masochist knight, Kazuma tries to survive isekai chaos.' },
  { mal_id: 38691, title: 'Dr. Stone', episodes: 24, score: 8.28, year: 2019, type: 'TV', genres: ['Adventure', 'Comedy', 'Sci-Fi'], popularity: 54, image: 'https://cdn.myanimelist.net/images/anime/1613/102576.jpg', synopsis: '3,700 years after humanity turns to stone, science prodigy Senku Ishigami vows to rebuild civilization from scratch.' }
];

export const FALLBACK_CHARACTERS = [
  { name: 'Satoru Gojo', title: 'Strongest Sorcerer', ultimate: 'Unlimited Void', element: 'void', image: 'https://cdn.myanimelist.net/images/characters/15/422168.jpg' },
  { name: 'Frieren', title: 'Elven Archmage', ultimate: 'Zoltraak Full Burst', element: 'spirit', image: 'https://cdn.myanimelist.net/images/characters/7/525105.jpg' },
  { name: 'Monkey D. Luffy', title: 'Emperor of the Sea', ultimate: 'Gear 5 Bajrang Gun', element: 'flame', image: 'https://cdn.myanimelist.net/images/characters/9/310307.jpg' },
  { name: 'Levi Ackerman', title: 'Humanity’s Strongest', ultimate: 'Spinning Blade Vortex', element: 'mecha', image: 'https://cdn.myanimelist.net/images/characters/2/241413.jpg' },
  { name: 'Sung Jinwoo', title: 'Shadow Monarch', ultimate: 'Arise: Shadow Army', element: 'void', image: 'https://cdn.myanimelist.net/images/characters/15/535733.jpg' },
  { name: 'Killua Zoldyck', title: 'Lightning Assassin', ultimate: 'Godspeed Kanmuru', element: 'thunder', image: 'https://cdn.myanimelist.net/images/characters/2/327920.jpg' }
];

const apiCache = new Map();

async function fetchJikan(url, retries = 1) {
  const cached = apiCache.get(url);
  if (cached && Date.now() - cached.at < 180000) {
    return cached.data;
  }
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 7500);
    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);
      if (res.status === 429 && attempt < retries) {
        await new Promise((r) => setTimeout(r, 900));
        continue;
      }
      if (!res.ok) throw new Error('Jikan HTTP ' + res.status);
      const data = await res.json();
      apiCache.set(url, { at: Date.now(), data });
      return data;
    } catch (err) {
      clearTimeout(timer);
      if (attempt >= retries) throw err;
      await new Promise((r) => setTimeout(r, 600));
    }
  }
  throw new Error('Jikan failed');
}

function normalizeJikan(item) {
  return {
    mal_id: item.mal_id,
    title: item.title_english || item.title,
    episodes: item.episodes || 12,
    score: item.score || 7.6,
    year: item.year || (item.aired?.from ? new Date(item.aired.from).getFullYear() : 2022),
    type: item.type || 'TV',
    genres: (item.genres || []).map((g) => g.name),
    popularity: item.popularity || 300,
    image: item.images?.jpg?.large_image_url || item.images?.jpg?.image_url || '',
    synopsis: item.synopsis || 'No synopsis available.'
  };
}

export async function searchAnime({ query = '', type = 'all', genre = 'all', orderBy = 'relevance', page = 1, mode = 'search' } = {}) {
  const q = String(query || '').trim();
  try {
    let url = '';
    if (mode === 'airing') {
      url = `https://api.jikan.moe/v4/seasons/now?sfw=true&limit=12&page=${page}`;
    } else if (mode === 'upcoming') {
      url = `https://api.jikan.moe/v4/seasons/upcoming?sfw=true&limit=12&page=${page}`;
    } else if (mode === 'top') {
      url = `https://api.jikan.moe/v4/top/anime?sfw=true&limit=12&page=${page}`;
    } else {
      const params = new URLSearchParams({ sfw: 'true', limit: '12', page: String(page) });
      if (q) params.set('q', q);
      if (type !== 'all') params.set('type', type);
      if (genre !== 'all' && GENRE_MAP[genre]) params.set('genres', String(GENRE_MAP[genre]));
      if (orderBy === 'score') {
        params.set('order_by', 'score');
        params.set('sort', 'desc');
      } else if (orderBy === 'popularity') {
        params.set('order_by', 'members');
        params.set('sort', 'desc');
      } else if (!q) {
        params.set('order_by', 'score');
        params.set('sort', 'desc');
      }
      url = `https://api.jikan.moe/v4/anime?${params.toString()}`;
    }

    const json = await fetchJikan(url);
    let items = (json.data || []).map(normalizeJikan);
    // Deduplicate by mal_id
    const seen = new Set();
    items = items.filter((a) => {
      if (seen.has(a.mal_id)) return false;
      seen.add(a.mal_id);
      return true;
    });
    const hasNextPage = Boolean(json.pagination?.has_next_page);
    return { items, hasNextPage, page, fromFallback: false };
  } catch {
    let pool = [...FALLBACK_ANIME];
    if (q) {
      const low = q.toLowerCase();
      pool = pool.filter(
        (a) => a.title.toLowerCase().includes(low) || a.genres.some((g) => g.toLowerCase().includes(low))
      );
    }
    if (type !== 'all') pool = pool.filter((a) => a.type.toLowerCase() === type);
    if (genre !== 'all') pool = pool.filter((a) => a.genres.includes(genre));
    if (orderBy === 'score') pool.sort((a, b) => (b.score || 0) - (a.score || 0));
    else if (orderBy === 'popularity') pool.sort((a, b) => (a.popularity || 999) - (b.popularity || 999));

    const start = (page - 1) * 12;
    const slice = pool.slice(start, start + 12);
    return { items: slice.length ? slice : FALLBACK_ANIME.slice(0, 12), hasNextPage: start + 12 < pool.length, page, fromFallback: true };
  }
}

export async function summonAnimeBatch({
  count = 1,
  minScore = 7.5,
  minYear = 2005,
  format = 'all',
  genres = [],
  hiddenGem = false,
  banner = 'allstar',
  excludeIds = new Set(),
  guaranteedSSR = false
} = {}) {
  const effectiveMinScore = guaranteedSSR ? Math.max(minScore, 8.5) : minScore;
  const sortOptions = ['score', 'members', 'favorites', 'popularity'];
  const pickedSort = hiddenGem || banner === 'gems' ? 'score' : sortOptions[Math.floor(Math.random() * sortOptions.length)];
  const sortDir = pickedSort === 'popularity' ? 'asc' : 'desc';

  let maxPage = banner === 'allstar' ? 10 : banner === 'classic' ? 7 : banner === 'gems' ? 12 : 5;
  if (genres.length >= 2 || effectiveMinScore >= 8.5) maxPage = Math.min(maxPage, 4);
  const startPage = banner === 'gems' || hiddenGem ? Math.floor(Math.random() * Math.max(1, maxPage - 1)) + 2 : Math.floor(Math.random() * maxPage) + 1;

  let pool = [];
  try {
    const params = new URLSearchParams({
      sfw: 'true',
      min_score: String(effectiveMinScore),
      order_by: pickedSort,
      sort: sortDir,
      limit: '25',
      page: String(startPage)
    });

    const effFormat = banner === 'movies' ? 'movie' : format;
    if (effFormat !== 'all') params.set('type', effFormat);

    if (banner === 'seasonal') {
      params.set('start_date', '2023-01-01');
    } else if (banner === 'classic') {
      params.set('start_date', '1990-01-01');
      params.set('end_date', '2012-12-31');
    } else if (minYear > 1990) {
      params.set('start_date', `${minYear}-01-01`);
    }

    const ids = genres.map((g) => GENRE_MAP[g]).filter(Boolean);
    if (ids.length) params.set('genres', ids.join(','));

    const json = await fetchJikan(`https://api.jikan.moe/v4/anime?${params.toString()}`);
    pool = (json.data || []).map(normalizeJikan);

    // If random high page came back empty, retry page 1 cleanly
    if (pool.length < count && startPage > 1) {
      params.set('page', '1');
      const retryJson = await fetchJikan(`https://api.jikan.moe/v4/anime?${params.toString()}`);
      pool = [...pool, ...(retryJson.data || []).map(normalizeJikan)];
    }
  } catch {
    // fallback below
  }

  // Merge in matching fallback anime if API pool is thin
  if (pool.length < count * 2) {
    let fb = FALLBACK_ANIME.filter((a) => a.score >= effectiveMinScore);
    if (banner === 'seasonal') fb = fb.filter((a) => a.year >= 2022);
    else if (banner === 'classic') fb = fb.filter((a) => a.year <= 2012);
    else fb = fb.filter((a) => a.year >= minYear);

    const effFormat = banner === 'movies' ? 'movie' : format;
    if (effFormat !== 'all') fb = fb.filter((a) => a.type.toLowerCase() === effFormat);
    if (genres.length) fb = fb.filter((a) => genres.some((g) => a.genres.includes(g)));
    pool = [...pool, ...fb];
  }

  if (hiddenGem || banner === 'gems') {
    const gems = pool.filter((a) => (a.popularity || 300) > 150);
    if (gems.length >= count) pool = gems;
  }

  // Deduplicate + apply anti-duplicate excludeIds
  const dedup = [];
  const seen = new Set();
  for (const item of pool) {
    if (!seen.has(item.mal_id)) {
      seen.add(item.mal_id);
      dedup.push(item);
    }
  }

  let fresh = dedup.filter((a) => !excludeIds.has(a.mal_id));
  if (fresh.length < count) fresh = dedup.length >= count ? dedup : [...FALLBACK_ANIME];

  // Shuffle Fisher-Yates
  for (let i = fresh.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [fresh[i], fresh[j]] = [fresh[j], fresh[i]];
  }

  const picked = fresh.slice(0, count);
  if (guaranteedSSR && picked.length && !picked.some((a) => (a.score || 0) >= 8.5)) {
    const ssrs = FALLBACK_ANIME.filter((a) => a.score >= 8.5 && !excludeIds.has(a.mal_id));
    if (ssrs.length) picked[0] = ssrs[Math.floor(Math.random() * ssrs.length)];
  }
  return picked;
}

export async function searchCharacters(query) {
  const q = String(query || '').trim();
  if (!q) return FALLBACK_CHARACTERS;
  try {
    const json = await fetchJikan(`https://api.jikan.moe/v4/characters?q=${encodeURIComponent(q)}&limit=6&order_by=favorites&sort=desc`);
    const items = (json.data || []).map((c) => ({
      mal_id: c.mal_id,
      name: c.name,
      title: c.nicknames?.[0] || c.name_kanji || 'Anime Legend',
      ultimate: 'Sakuga Overdrive',
      element: 'flame',
      image: c.images?.jpg?.image_url || ''
    }));
    return items.length ? items : FALLBACK_CHARACTERS;
  } catch {
    const low = q.toLowerCase();
    const matched = FALLBACK_CHARACTERS.filter((c) => c.name.toLowerCase().includes(low));
    return matched.length ? matched : FALLBACK_CHARACTERS;
  }
}
