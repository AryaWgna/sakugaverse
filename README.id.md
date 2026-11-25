<div align="center">

# SakugaVerse (作画ヴァース)

**Hub Anime Interaktif Serba Ada dengan Efek Sakuga VFX**

[English](./README.md) · [**Bahasa Indonesia**](./README.id.md) · [日本語](./README.ja.md)

[![Live Demo](https://img.shields.io/badge/Live%20Demo-sakugaverse.vercel.app-ff5fa8?style=for-the-badge)](https://sakugaverse.vercel.app)
[![Built with Vite](https://img.shields.io/badge/Vite-Vanilla%20JS-8f8df7?style=for-the-badge)](https://vitejs.dev/)
[![Deployed on Vercel](https://img.shields.io/badge/Vercel-Auto%20Deploy-1d1a4a?style=for-the-badge)](https://vercel.com/)

</div>

---

**SakugaVerse** adalah web app anime serba ada yang dibangun dengan Web Components [**Sakuga VFX**](https://github.com/finktheartist/sakuga-vfx) — di mana setiap tombol, slider, toggle, checkbox, tab, dan progress bar bereaksi seperti animasi anime gambar tangan (*impact frame, kepulan asap, efek tebasan, speed lines, dan huruf SFX manga seperti ドン!, ゴゴゴゴ, ズザッ*).

Dilengkapi **pengganti bahasa UI real-time (`ID` / `EN` / `日本語`)**, sistem **Otaku Rank & EXP**, dan sakelar tema global **Awakening Mode**.

---

## Fitur Utama (5 Modul Saling Terhubung)

1. **Watchlist (`SakugaList`)**
   - Pencarian anime langsung dari **Jikan API v4 (MyAnimeList)** lengkap dengan katalog offline cadangan.
   - Catat progres episode (`+1` / `-1`), filter status (*Ditonton*, *Tamat*, *Rencana*), rating bintang (`1–5★`), favorit, dan **Mode Anti-Spoiler**.
   - Bar progres keseluruhan memakai `<sakuga-progress>` (**ゴゴゴゴ → ドン!**).

2. **Anime Gacha Picker (`Anime Summon`)**
   - Filter skor minimal MAL, tahun rilis, format (*TV / Movie*), genre, dan **Mode Hidden Gem**.
   - Animasi *charge* energi dramatis yang memunculkan rekomendasi anime **SSR / SR / R**.
   - Integrasi **Tambah ke Watchlist** dalam 1 klik langsung ke Modul 1.

3. **Training Arc (`Pomodoro & Quest ala Shonen`)**
   - Timer fokus bertema *Training Arc* anime ikonik (*Ruang Waktu & Jiwa*, *Latihan Pilar Hashira*, *Ujian Chunin*, *Pelatihan Bankai*).
   - Slider durasi fokus/istirahat, efek suara synth Web Audio API, **Misi Harian (Daily Quests)** dengan efek tebasan (**ズザッ**), dan evaluasi fokus harian.

4. **Power Card Forge (`Generator Kartu Karakter / OC`)**
   - Generator kartu karakter manga live berbasis HTML5 `<canvas>` dengan 5 gaya siluet vektor atau upload foto sendiri.
   - Atur nama, julukan, jurus pamungkas, elemen, 4 stat (`PWR / SPD / SPI / AUR`), kelangkaan (`1–5★`), dan **foil holografik Awakening / Bankai**.
   - **Download PNG** resolusi tinggi langsung dari browser.

5. **Otaku Arena (`Kuis & Trivia Anime`)**
   - Soal trivia anime lengkap dalam **Bahasa Indonesia, Inggris, dan Jepang** lintas kategori *Shonen*, *Seinen*, dan *Romance / Slice of Life*.
   - Pengganda *combo streak*, tombol **Petunjuk (Hint)** balon dialog manga (`<sakuga-tooltip>`), dan **Mode Hardcore (2x EXP, tanpa Hint)**.

### Sistem Global Hub
- **Otaku Rank & EXP**: Kumpulkan EXP dari seluruh 5 modul untuk naik pangkat (*Genin → Chunin → Jonin → Hashira → Kage → Dewa Sakuga*), tersimpan otomatis di `localStorage`.
- **Awakening Mode**: Toggle global `<sakuga-toggle>` yang mengubah variabel CSS `--sk-*` antara *Sakura Manga* dan *Shonen Crimson*.
- **Multi-Bahasa UI**: Ganti bahasa antara **ID**, **EN**, dan **日本語** seketika tanpa reload.

---

## Teknologi

- **Vite** + **Vanilla JavaScript (ES Modules)** + **Modern CSS**
- **Sakuga VFX** (11 Web Components murni di `public/sakuga-vfx/`)
- **Jikan API v4** (API publik MyAnimeList tanpa API key)
- **Vercel** (deploy Vite otomatis + CI/CD GitHub tiap push)

---

## Menjalankan Secara Lokal

```bash
npm install
npm run dev
```

Build dan preview produksi:

```bash
npm run build
npm run preview
```

---

## Auto-Deploy (GitHub → Vercel)

Repository ini terhubung langsung ke Vercel melalui [vercel.json](./vercel.json). Setiap `git push` ke branch `main` akan otomatis mem-build dan memperbarui **https://sakugaverse.vercel.app**.

---

## Kredit

- Efek UI: [Sakuga VFX](https://github.com/finktheartist/sakuga-vfx) (Lisensi MIT)
- Data Anime: [Jikan API](https://jikan.moe/) (API tidak resmi MyAnimeList)
