// Jikan API v4 (MyAnimeList) helper + rich curated fallback catalog so the app always works even offline or rate-limited

export const FALLBACK_ANIME = [
  { mal_id: 52991, title: 'Sousou no Frieren', episodes: 28, score: 9.3, year: 2023, type: 'TV', genres: ['Adventure', 'Drama', 'Fantasy'], popularity: 120, image: 'https://cdn.myanimelist.net/images/anime/1015/138006.jpg', synopsis: 'After a ten-year quest to defeat the Demon King, elven mage Frieren journeys to understand the meaning of human connections.' },
  { mal_id: 5114, title: 'Fullmetal Alchemist: Brotherhood', episodes: 64, score: 9.1, year: 2009, type: 'TV', genres: ['Action', 'Adventure', 'Drama', 'Fantasy'], popularity: 3, image: 'https://cdn.myanimelist.net/images/anime/1208/94745.jpg', synopsis: 'Edward and Alphonse Elric seek the Philosopher’s Stone to restore what they lost in a forbidden alchemical transmutation.' },
  { mal_id: 9253, title: 'Steins;Gate', episodes: 24, score: 9.07, year: 2011, type: 'TV', genres: ['Drama', 'Sci-Fi', 'Suspense'], popularity: 13, image: 'https://cdn.myanimelist.net/images/anime/1935/127974.jpg', synopsis: 'Self-proclaimed mad scientist Rintarou Okabe accidentally invents a device capable of sending text messages into the past.' },
  { mal_id: 11061, title: 'Hunter x Hunter (2011)', episodes: 148, score: 9.03, year: 2011, type: 'TV', genres: ['Action', 'Adventure', 'Fantasy'], popularity: 9, image: 'https://cdn.myanimelist.net/images/anime/1337/99013.jpg', synopsis: 'Young Gon Freecss sets out to become a legendary Hunter and reunite with his father, forging unbreakable friendships along the way.' },
  { mal_id: 37510, title: 'Mob Psycho 100 II', episodes: 13, score: 8.8, year: 2019, type: 'TV', genres: ['Action', 'Comedy', 'Supernatural'], popularity: 65, image: 'https://cdn.myanimelist.net/images/anime/1918/96303.jpg', synopsis: 'Shigeo "Mob" Kageyama is an insanely powerful esper who just wants to grow as a person without relying on his psychic powers.' },
  { mal_id: 32281, title: 'Kimi no Na wa. (Your Name)', episodes: 1, score: 8.84, year: 2016, type: 'Movie', genres: ['Drama', 'Romance', 'Supernatural'], popularity: 11, image: 'https://cdn.myanimelist.net/images/anime/5/87048.jpg', synopsis: 'Two strangers find themselves linked in a bizarre way, swapping bodies across time and distance as a comet approaches Earth.' },
  { mal_id: 28851, title: 'Koe no Katachi (A Silent Voice)', episodes: 1, score: 8.93, year: 2016, type: 'Movie', genres: ['Drama', 'Romance'], popularity: 19, image: 'https://cdn.myanimelist.net/images/anime/1122/96435.jpg', synopsis: 'A former bully seeks redemption by reconnecting with the deaf classmate he once tormented in elementary school.' },
  { mal_id: 40748, title: 'Jujutsu Kaisen', episodes: 24, score: 8.6, year: 2020, type: 'TV', genres: ['Action', 'Fantasy', 'Supernatural'], popularity: 15, image: 'https://cdn.myanimelist.net/images/anime/1171/109222.jpg', synopsis: 'High schooler Yuji Itadori joins a secret organization of Jujutsu Sorcerers to battle deadly Curses born from human negativity.' },
  { mal_id: 47917, title: 'Bocchi the Rock!', episodes: 12, score: 8.8, year: 2022, type: 'TV', genres: ['Comedy', 'Slice of Life'], popularity: 185, image: 'https://cdn.myanimelist.net/images/anime/1448/127956.jpg', synopsis: 'Socially anxious guitarist Hitori Gotoh dreams of playing in a band and gets pulled into Kessoku Band at a Shimokitazawa live house.' },
  { mal_id: 46102, title: 'Odd Taxi', episodes: 13, score: 8.67, year: 2021, type: 'TV', genres: ['Drama', 'Suspense'], popularity: 380, image: 'https://cdn.myanimelist.net/images/anime/1981/113348.jpg', synopsis: 'An eccentric walrus taxi driver’s late-night conversations weave into a razor-sharp Tokyo missing-girl mystery.' },
  { mal_id: 22135, title: 'Ping Pong the Animation', episodes: 11, score: 8.62, year: 2014, type: 'TV', genres: ['Drama', 'Sports'], popularity: 540, image: 'https://cdn.myanimelist.net/images/anime/10/58041.jpg', synopsis: 'Two childhood friends with wildly different temperaments collide on the high school table tennis circuit in explosive sakuga style.' },
  { mal_id: 37521, title: 'Vinland Saga', episodes: 24, score: 8.76, year: 2019, type: 'TV', genres: ['Action', 'Adventure', 'Drama'], popularity: 72, image: 'https://cdn.myanimelist.net/images/anime/1500/103005.jpg', synopsis: 'Raised on tales of Vinland, young Thorfinn enters a brutal Viking war seeking vengeance—and discovers what a true warrior is.' },
  { mal_id: 2001, title: 'Tengen Toppa Gurren Lagann', episodes: 27, score: 8.64, year: 2007, type: 'TV', genres: ['Action', 'Adventure', 'Sci-Fi'], popularity: 64, image: 'https://cdn.myanimelist.net/images/anime/4/5123.jpg', synopsis: 'Subterranean digger Simon and fearless Kamina break through the ceiling of their world to pierce the heavens in colossal mecha.' },
  { mal_id: 35839, title: 'Sora yori mo Tooi Basho', episodes: 13, score: 8.52, year: 2018, type: 'TV', genres: ['Adventure', 'Comedy', 'Drama'], popularity: 340, image: 'https://cdn.myanimelist.net/images/anime/6/89879.jpg', synopsis: 'Four high school girls defy every doubt to board a research vessel bound for Antarctica.' },
  { mal_id: 6675, title: 'Redline', episodes: 1, score: 8.3, year: 2009, type: 'Movie', genres: ['Action', 'Sci-Fi', 'Sports'], popularity: 490, image: 'https://cdn.myanimelist.net/images/anime/12/28553.jpg', synopsis: 'Seven years of hand-drawn madness: daredevil JP blasts across an intergalactic illegal death-race at impossible velocity.' },
  { mal_id: 31043, title: 'Boku dake ga Inai Machi (Erased)', episodes: 12, score: 8.3, year: 2016, type: 'TV', genres: ['Drama', 'Suspense', 'Supernatural'], popularity: 31, image: 'https://cdn.myanimelist.net/images/anime/10/77957.jpg', synopsis: 'Sent 18 years back to his childhood, Satoru gets one shot to prevent a string of kidnappings and change destiny.' },
  { mal_id: 42310, title: 'Cyberpunk: Edgerunners', episodes: 10, score: 8.61, year: 2022, type: 'TV', genres: ['Action', 'Sci-Fi'], popularity: 95, image: 'https://cdn.myanimelist.net/images/anime/1818/126435.jpg', synopsis: 'A street kid tries to survive in a tech-obsessed Night City by becoming a neon-drenched mercenary outlaw: an edgerunner.' },
  { mal_id: 50265, title: 'Spy x Family', episodes: 12, score: 8.48, year: 2022, type: 'TV', genres: ['Action', 'Comedy', 'Slice of Life'], popularity: 55, image: 'https://cdn.myanimelist.net/images/anime/1441/122795.jpg', synopsis: 'A master spy, an assassin, and a telepathic child form a fake family to maintain world peace—while hiding their secrets from each other.' },
  { mal_id: 37999, title: 'Kaguya-sama: Love is War', episodes: 12, score: 8.4, year: 2019, type: 'TV', genres: ['Comedy', 'Romance'], popularity: 40, image: 'https://cdn.myanimelist.net/images/anime/1295/106551.jpg', synopsis: 'Two proud student council geniuses wage hilarious psychological warfare to force the other to confess first.' },
  { mal_id: 54492, title: 'Kusuriya no Hitorigoto (Apothecary Diaries)', episodes: 24, score: 8.88, year: 2023, type: 'TV', genres: ['Drama', 'Mystery'], popularity: 210, image: 'https://cdn.myanimelist.net/images/anime/1708/138033.jpg', synopsis: 'Poison-obsessed apothecary Maomao untangles courtly conspiracies and medical mysteries inside the Imperial Rear Palace.' },
  { mal_id: 1, title: 'Cowboy Bebop', episodes: 26, score: 8.75, year: 1998, type: 'TV', genres: ['Action', 'Sci-Fi'], popularity: 43, image: 'https://cdn.myanimelist.net/images/anime/4/19644.jpg', synopsis: 'A ragtag crew of bounty hunters drifts across the solar system in 2071 to the beat of smoky space jazz.' },
  { mal_id: 33352, title: 'Violet Evergarden', episodes: 13, score: 8.68, year: 2018, type: 'TV', genres: ['Drama', 'Fantasy'], popularity: 48, image: 'https://cdn.myanimelist.net/images/anime/1795/95088.jpg', synopsis: 'A former child soldier becomes an Auto Memory Doll writing letters for others while searching for the meaning of "I love you."' },
  { mal_id: 41457, title: '86 (Eighty-Six)', episodes: 11, score: 8.32, year: 2021, type: 'TV', genres: ['Action', 'Drama', 'Sci-Fi'], popularity: 260, image: 'https://cdn.myanimelist.net/images/anime/1987/117507.jpg', synopsis: 'Beyond the walls of the Republic of San Magnolia, the forgotten 86th sector pilots spider-tanks in a war officially declared "unmanned."' },
  { mal_id: 34599, title: 'Made in Abyss', episodes: 13, score: 8.65, year: 2017, type: 'TV', genres: ['Adventure', 'Drama', 'Fantasy'], popularity: 115, image: 'https://cdn.myanimelist.net/images/anime/6/86733.jpg', synopsis: 'Orphan Riko and a mysterious robot boy descend into a breathtaking, perilous chasm that hides ancient relics and unforgiving curses.' }
];

const GENRE_MAP = {
  Action: 1,
  Adventure: 2,
  Comedy: 4,
  Drama: 8,
  Fantasy: 10,
  Romance: 22,
  'Sci-Fi': 24,
  'Slice of Life': 36
};

function normalizeJikan(item) {
  return {
    mal_id: item.mal_id,
    title: item.title_english || item.title,
    episodes: item.episodes || 12,
    score: item.score || 7.8,
    year: item.year || (item.aired?.from ? new Date(item.aired.from).getFullYear() : 2022),
    type: item.type || 'TV',
    genres: (item.genres || []).map((g) => g.name),
    popularity: item.popularity || 300,
    image: item.images?.jpg?.large_image_url || item.images?.jpg?.image_url || '',
    synopsis: item.synopsis || 'No synopsis available.'
  };
}

export async function searchAnime(query) {
  const q = query.trim();
  if (!q) return { items: FALLBACK_ANIME.slice(0, 6), fromFallback: false };
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5500);
    const res = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(q)}&limit=8&sfw=true`, {
      signal: controller.signal
    });
    clearTimeout(timer);
    if (!res.ok) throw new Error('Jikan HTTP ' + res.status);
    const json = await res.json();
    const items = (json.data || []).map(normalizeJikan);
    return { items, fromFallback: false };
  } catch {
    const low = q.toLowerCase();
    const matched = FALLBACK_ANIME.filter(
      (a) => a.title.toLowerCase().includes(low) || a.genres.some((g) => g.toLowerCase().includes(low))
    );
    return { items: matched.length ? matched : FALLBACK_ANIME.slice(0, 6), fromFallback: true };
  }
}

export async function summonAnime({ minScore = 7.5, minYear = 2005, format = 'all', genres = [], hiddenGem = false }) {
  try {
    const params = new URLSearchParams({
      sfw: 'true',
      min_score: String(minScore),
      order_by: hiddenGem ? 'score' : 'members',
      sort: 'desc',
      limit: '25',
      page: String(hiddenGem ? Math.floor(Math.random() * 4) + 2 : Math.floor(Math.random() * 3) + 1)
    });
    if (format !== 'all') params.set('type', format);
    if (minYear > 1990) params.set('start_date', `${minYear}-01-01`);
    const ids = genres.map((g) => GENRE_MAP[g]).filter(Boolean);
    if (ids.length) params.set('genres', ids.join(','));

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5500);
    const res = await fetch(`https://api.jikan.moe/v4/anime?${params.toString()}`, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error('Jikan HTTP ' + res.status);
    const json = await res.json();
    let pool = (json.data || []).map(normalizeJikan);
    if (hiddenGem) {
      const gems = pool.filter((a) => a.popularity > 150);
      if (gems.length) pool = gems;
    }
    if (pool.length) {
      return pool[Math.floor(Math.random() * pool.length)];
    }
  } catch {
    // fall through to curated offline pool
  }

  let pool = FALLBACK_ANIME.filter((a) => a.score >= minScore && a.year >= minYear);
  if (format !== 'all') pool = pool.filter((a) => a.type.toLowerCase() === format);
  if (genres.length) pool = pool.filter((a) => genres.some((g) => a.genres.includes(g)));
  if (hiddenGem) {
    const gems = pool.filter((a) => a.popularity >= 150);
    if (gems.length) pool = gems;
  }
  if (!pool.length) pool = FALLBACK_ANIME;
  return pool[Math.floor(Math.random() * pool.length)];
}
