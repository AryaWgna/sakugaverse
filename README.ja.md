<div align="center">

# SakugaVerse (作画ヴァース)

**Sakuga VFX 搭載・オールインワン インタラクティブ アニメハブ**

[English](./README.md) · [Bahasa Indonesia](./README.id.md) · [**日本語**](./README.ja.md)

[![Live Demo](https://img.shields.io/badge/Live%20Demo-sakugaverse.vercel.app-ff5fa8?style=for-the-badge)](https://sakugaverse.vercel.app)
[![Built with Vite](https://img.shields.io/badge/Vite-Vanilla%20JS-8f8df7?style=for-the-badge)](https://vitejs.dev/)
[![Deployed on Vercel](https://img.shields.io/badge/Vercel-Auto%20Deploy-1d1a4a?style=for-the-badge)](https://vercel.com/)

</div>

---

**SakugaVerse（作画ヴァース）** は、[**Sakuga VFX**](https://github.com/finktheartist/sakuga-vfx) Web Components を採用したオールインワン・アニメWebアプリです。すべてのボタン、スライダー、トグル、チェックボックス、タブ、プログレスバーが、手描きアニメのように反応します（*インパクトフレーム、煙、斬撃、スピード線、「ドン！」「ゴゴゴゴ」「ズザッ」などの漫画擬音エフェクト*）。

リアルタイムの **3言語UI切替（`ID` / `EN` / `日本語`）**、永続保存される **オタクランク＆EXPシステム**、テーマを一瞬で変える **覚醒モード（Awakening Mode）** を搭載しています。

---

## 機能一覧（連動する5つのモジュール）

1. **視聴リスト（`SakugaList`）**
   - **Jikan API v4（MyAnimeList）** からリアルタイム検索（オフライン厳選カタログのフォールバック付き）。
   - 話数カウント（`+1` / `-1`）、ステータス絞り込み（*視聴中・視聴完了・視聴予定*）、星評価（`1–5★`）、お気に入り、**ネタバレ防止モード**に対応。
   - 全体進捗バーは `<sakuga-progress>` で演出（**ゴゴゴゴ → ドン！**）。

2. **アニメガチャ・ピッカー（`Anime Summon`）**
   - 最低MALスコア、放送年、形式（*TV / 劇場版*）、ジャンル、**隠れた名作モード**で絞り込み。
   - 迫力のエネルギー充填演出から **SSR / SR / R** のおすすめアニメを召喚。
   - ワンクリックでモジュール1の **視聴リストへ追加** 可能。

3. **修行アーク（`少年漫画ポモドーロ＆クエスト`）**
   - 名作アニメの修行編をイメージした集中タイマー（*精神と時の部屋・柱稽古編・中忍試験 死の森・卍解修行*）。
   - 集中／休憩スライダー、Web Audio API シンセ効果音、斬撃エフェクト付き **デイリー任務（ズザッ）**、今日の集中度評価を搭載。

4. **パワーカード鍛冶（`キャラクター／OCカード生成`）**
   - HTML5 `<canvas>` によるリアルタイム漫画風トレーディングカード作成（5種のベクタースタイル＋オリジナル画像アップロード対応）。
   - キャラ名、二つ名、必殺技、属性、4ステータス（`PWR / SPD / SPI / AUR`）、レアリティ（`1–5★`）、**覚醒・卍解ホロ加工**を自由にカスタマイズ。
   - ブラウザから直接高解像度 **PNG保存** が可能。

5. **オタクアリーナ（`アニメクイズ＆トリビア`）**
   - **日本語・英語・インドネシア語** 完全対応のアニメクイズ（*少年漫画・青年＆サスペンス・恋愛＆日常*）。
   - コンボ倍率、漫画吹き出し型の **ヒント（`<sakuga-tooltip>`）**、**ハードコアモード（EXP 2倍・ヒント無し）** に対応。

### グローバルシステム
- **オタクランク＆EXP**: 5つのモジュールすべてでEXPを獲得し昇格（*下忍 → 中忍 → 上忍 → 柱 → 影 → 作画神*）。`localStorage` に自動保存。
- **覚醒モード（Awakening Mode）**: ヘッダーの `<sakuga-toggle>` で CSS 変数 `--sk-*` を *サクラ漫画* ⇔ *紅蓮クリムゾン* に瞬時切替。
- **多言語UI**: リロード不要で **ID** / **EN** / **日本語** をリアルタイム切替。

---

## 技術スタック

- **Vite** + **Vanilla JavaScript (ES Modules)** + **Modern CSS**
- **Sakuga VFX**（`public/sakuga-vfx/` 内の全11種のネイティブ Web Components）
- **Jikan API v4**（APIキー不要の MyAnimeList 公開API）
- **Vercel**（ゼロコンフィグ Vite デプロイ ＋ GitHub 連携自動デプロイ）

---

## ローカル開発

```bash
npm install
npm run dev
```

本番ビルド＆プレビュー：

```bash
npm run build
npm run preview
```

---

## 自動デプロイ（GitHub → Vercel）

本リポジトリは [vercel.json](./vercel.json) により Vercel と連携済みです。`main` ブランチへ `git push` するたびに **https://sakugaverse.vercel.app** が自動でビルド・更新されます。

---

## クレジット

- UIエフェクト: [Sakuga VFX](https://github.com/finktheartist/sakuga-vfx)（MITライセンス）
- アニメデータ: [Jikan API](https://jikan.moe/)（MyAnimeList 非公式API）
