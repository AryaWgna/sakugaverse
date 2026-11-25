# SakugaVerse (作画ヴァース)

**Live Demo:** https://sakugaverse.vercel.app

An all-in-one interactive **Anime Hub** powered by [**Sakuga VFX**](https://github.com/finktheartist/sakuga-vfx) Web Components — where every button, slider, toggle, checkbox, tab, and progress bar reacts like hand-drawn anime (*impact frames, smoke clouds, slashes, speed lines, and manga SFX lettering*).

Built with **Vite + Vanilla JavaScript (ES Modules)**, **Jikan API v4 (MyAnimeList)**, and **multi-language UI (`ID` / `EN` / `日本語`)**.

---

## Features (5 Interconnected Modules)

1. **Watchlist (`SakugaList`)**
   - Live anime search via **Jikan API (MyAnimeList)** with a curated offline fallback catalog.
   - Track episode progress (`+1` / `-1`), filter by status (*Watching*, *Completed*, *Plan to Watch*), star ratings (`1–5★`), favorites, and **Spoiler-Free Mode**.
   - Overall completion bar powered by `<sakuga-progress>` (**ゴゴゴゴ → ドン!**).

2. **Anime Gacha Picker (`Anime Summon`)**
   - Filter by minimum MAL score, release year, format (*TV / Movie*), genres, and **Hidden Gem Mode**.
   - Dramatic energy-charge summon animation revealing **SSR / SR / R** anime picks.
   - One-click **Add to Watchlist** integration.

3. **Training Arc (`Shonen Pomodoro & Quests`)**
   - Pomodoro focus timer themed around iconic anime training arcs (*Hyperbolic Time Chamber*, *Hashira Training*, *Forest of Death*, *Bankai Training*).
   - Custom focus/break sliders, subtle Web Audio API synth sound effects, **Daily Quests** with slash animations (**ズザッ**), and daily focus rating.

4. **Power Card Forge (`Character / OC Card Maker`)**
   - Live HTML5 `<canvas>` manga trading card generator with 5 vector art styles or custom image upload.
   - Customize name, epithet, ultimate move, element, 4 stats (`PWR / SPD / SPI / AUR`), rarity (`1–5★`), and **Awakening / Bankai holographic foil**.
   - Export high-resolution **PNG** directly from the browser.

5. **Otaku Arena (`Anime Quiz & Trivia`)**
   - Fully translated trivia questions in **Indonesian, English, and Japanese** across *Shonen*, *Seinen*, and *Romance / Slice of Life*.
   - Combo streak multiplier, manga speech-bubble **Hints** (`<sakuga-tooltip>`), and **Hardcore Mode (2x EXP, no Hints)**.

### Global Hub Systems
- **Otaku Rank & EXP System**: Earn EXP across all 5 modules to rank up (*Genin → Chunin → Jonin → Hashira → Kage → Sakuga God*), persisted in `localStorage`.
- **Awakening Mode**: Global `<sakuga-toggle>` switching `--sk-*` CSS variables between *Sakura Manga* and *Shonen Crimson*.
- **Multi-Language Switcher**: Instant switching between **ID**, **EN**, and **日本語**.

---

## Tech Stack

- **Vite** + **Vanilla JavaScript (ES Modules)** + **Modern CSS**
- **Sakuga VFX** (all 11 native Web Components in `public/sakuga-vfx/`)
- **Jikan API v4** (public MyAnimeList API, no API key required)
- **Vercel** (zero-config Vite static deployment + automatic CI/CD on push)

---

## Local Development

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
npm run preview
```

---

## Deployment (Vercel + GitHub Auto-Deploy)

This project includes [vercel.json](./vercel.json) preconfigured for Vite (`npm run build` -> `dist/`).

1. Push this repository to GitHub.
2. Import the repository in [Vercel Dashboard](https://vercel.com/new) (or connect via `vercel git connect`).
3. Every `git push` to `main` automatically triggers a fresh production build & deployment on Vercel.

---

## Credits

- UI Effects: [Sakuga VFX](https://github.com/finktheartist/sakuga-vfx) (MIT License)
- Anime Data: [Jikan API](https://jikan.moe/) (MyAnimeList unofficial API)
