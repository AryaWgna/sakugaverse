import { t, getLang, onLangChange } from '../core/i18n.js';
import { state, addExp, notify, saveState } from '../core/store.js';
import { FALLBACK_ANIME } from '../core/jikan.js';
import { playTone } from '../core/sfx.js';
import { fxCombo, fxSSR } from '../core/fx.js';

const QUESTIONS = [
  {
    cat: 'shonen',
    q: { id: 'Apa nama Domain Expansion milik Satoru Gojo di Jujutsu Kaisen?', en: 'What is Satoru Gojo’s Domain Expansion in Jujutsu Kaisen?', jp: '『呪術廻戦』の五条悟の領域展開の名前は？' },
    opts: { id: ['Malevolent Shrine', 'Unlimited Void', 'Chimera Shadow Garden', 'Coffin of the Iron Mountain'], en: ['Malevolent Shrine', 'Unlimited Void', 'Chimera Shadow Garden', 'Coffin of the Iron Mountain'], jp: ['伏魔御廚子', '無量空処', '嵌合暗翳庭', '蓋棺鉄囲山'] },
    ans: 1,
    hint: { id: 'Membanjiri pikiran lawan dengan informasi tak terbatas.', en: 'Floods the target’s mind with infinite information.', jp: '相手の脳に無限の情報を流し込む領域。' }
  },
  {
    cat: 'shonen',
    q: { id: 'Di One Piece, pulau terakhir di Grand Line tempat harta karun One Piece bernama...', en: 'In One Piece, the final island of the Grand Line holding the One Piece treasure is...', jp: '『ONE PIECE』でひとつなぎの大秘宝が眠る最終地点の島は？' },
    opts: { id: ['Skypiea', 'Elbaf', 'Laugh Tale', 'Wano Kuni'], en: ['Skypiea', 'Elbaf', 'Laugh Tale', 'Wano Country'], jp: ['空島', 'エルバフ', 'ラフテル', 'ワノ国'] },
    ans: 2,
    hint: { id: 'Gol D. Roger tertawa saat tiba di sana.', en: 'Gol D. Roger literally laughed upon reaching it.', jp: 'ロジャー海賊団が到達した時に大笑いしたことに由来。' }
  },
  {
    cat: 'shonen',
    q: { id: 'Studio animasi legendaris mana yang menggarap Mob Psycho 100 dan FMA: Brotherhood?', en: 'Which legendary studio animated both Mob Psycho 100 and FMA: Brotherhood?', jp: '『モブサイコ100』と『鋼の錬金術師 FA』を制作したスタジオは？' },
    opts: { id: ['MAPPA', 'Studio Bones', 'Ufotable', 'Kyoto Animation'], en: ['MAPPA', 'Studio Bones', 'Ufotable', 'Kyoto Animation'], jp: ['MAPPA', 'ボンズ (Bones)', 'ufotable', '京都アニメーション'] },
    ans: 1,
    hint: { id: 'Namanya dalam bahasa Inggris berarti "tulang".', en: 'Its name is a skeletal English noun.', jp: '英語で「骨」を意味するスタジオ名。' }
  },
  {
    cat: 'shonen',
    q: { id: 'Di Hunter x Hunter, tipe Nen apa yang dimiliki oleh Killua Zoldyck?', en: 'In Hunter x Hunter, what Nen category does Killua Zoldyck belong to?', jp: '『HUNTER×HUNTER』でキルア＝ゾルディックの念系統は？' },
    opts: { id: ['Enhancer', 'Transmuter', 'Conjurer', 'Emitter'], en: ['Enhancer', 'Transmuter', 'Conjurer', 'Emitter'], jp: ['強化系', '変化系', '具現化系', '放出系'] },
    ans: 1,
    hint: { id: 'Ia mengubah sifat auranya menjadi listrik (Godspeed).', en: 'He alters the properties of his aura into electricity.', jp: 'オーラの性質を電気に変える（神速）。' }
  },
  {
    cat: 'shonen',
    q: { id: 'Siapa nama pedang Zanpakuto milik Ichigo Kurosaki di Bleach?', en: 'What is the name of Ichigo Kurosaki’s Zanpakuto in Bleach?', jp: '『BLEACH』で黒崎一護の斬魄刀の名前は？' },
    opts: { id: ['Senbonzakura', 'Zangetsu', 'Hyorinmaru', 'Zabimaru'], en: ['Senbonzakura', 'Zangetsu', 'Hyorinmaru', 'Zabimaru'], jp: ['千本桜', '斬月', '氷輪丸', '蛇尾丸'] },
    ans: 1,
    hint: { id: 'Artinya secara harfiah "Bulan Pembelah".', en: 'Literally translates to "Slaying Moon".', jp: '「月を斬る」と書く名前。' }
  },
  {
    cat: 'shonen',
    q: { id: 'Di Solo Leveling, kata apa yang diucapkan Sung Jinwoo untuk membangkitkan pasukan bayangan?', en: 'In Solo Leveling, what command does Sung Jinwoo utter to extract shadows?', jp: '『俺だけレベルアップな件』で水篠旬が影を抽出する時の掛け声は？' },
    opts: { id: ['Bankai', 'Arise', 'Release', 'Awaken'], en: ['Bankai', 'Arise', 'Release', 'Awaken'], jp: ['卍解', '起きろ (Arise)', '解放', '覚醒'] },
    ans: 1,
    hint: { id: 'Berarti "Bangkitlah!" dalam bahasa Inggris.', en: 'Means "stand up / rise" in English.', jp: '英語で「起き上がれ」を意味する言葉。' }
  },
  {
    cat: 'seinen',
    q: { id: 'Di Steins;Gate, apa angka divergensi untuk mencapai garis dunia Steins Gate?', en: 'In Steins;Gate, what Divergence Number leads to the Steins Gate world line?', jp: '『シュタインズ・ゲート』のシュタインズ・ゲート世界線の数値は？' },
    opts: { id: ['0.571024%', '1.048596%', '1.130426%', '0.000000%'], en: ['0.571024%', '1.048596%', '1.130426%', '0.000000%'], jp: ['0.571024%', '1.048596%', '1.130426%', '0.000000%'] },
    ans: 1,
    hint: { id: 'Melewati penghalang 1% sedikit saja: 1.048...', en: 'Just past the 1% barrier: 1.048...', jp: '1%の壁を越えた直後の数値：1.048...' }
  },
  {
    cat: 'seinen',
    q: { id: 'Siapa nama kapal luar angkasa tempat tinggal Spike Spiegel dkk. di Cowboy Bebop?', en: 'What is the name of the spaceship Spike Spiegel’s crew lives on in Cowboy Bebop?', jp: '『カウボーイビバップ』でスパイクたちが拠点とする宇宙船は？' },
    opts: { id: ['Swordfish II', 'Bebop', 'Red Tail', 'Outlaw Star'], en: ['Swordfish II', 'Bebop', 'Red Tail', 'Outlaw Star'], jp: ['ソードフィッシュII', 'ビバップ号', 'レッドテイル', 'アウトロースター'] },
    ans: 1,
    hint: { id: 'Namanya ada di judul animenya sendiri!', en: 'It is right in the title of the anime!', jp: '作品のタイトルそのものに入っている！' }
  },
  {
    cat: 'seinen',
    q: { id: 'Di Vinland Saga, siapa prajurit legendaris yang merupakan ayah dari Thorfinn?', en: 'In Vinland Saga, who is Thorfinn’s legendary warrior father?', jp: '『ヴィンランド・サガ』でトルフィンの父である伝説の戦士は？' },
    opts: { id: ['Askeladd', 'Thors', 'Thorkell', 'Canute'], en: ['Askeladd', 'Thors', 'Thorkell', 'Canute'], jp: ['アシェラッド', 'トールズ', 'トルケル', 'クヌート'] },
    ans: 1,
    hint: { id: 'Dijuluki "Troll of Jom" dan mengajarkan "Kamu tidak punya musuh".', en: 'Known as the "Troll of Jom" who taught "You have no enemies."', jp: '「ヨームの戦鬼」と呼ばれ、「お前に敵などいない」と教えた。' }
  },
  {
    cat: 'seinen',
    q: { id: 'Di Odd Taxi, hewan apa wujud tokoh utama Hiroshi Odokawa?', en: 'In Odd Taxi, what animal is the protagonist Hiroshi Odokawa?', jp: '『オッドタクシー』の主人公・小戸川は何の動物？' },
    opts: { id: ['Alpaka', 'Walrus', 'Gorila', 'Babun'], en: ['Alpaca', 'Walrus', 'Gorilla', 'Baboon'], jp: ['アルパカ', 'セイウチ', 'ゴリラ', 'ヒヒ'] },
    ans: 1,
    hint: { id: 'Mamalia laut bertaring panjang yang mengemudikan taksi di Tokyo.', en: 'A tusked marine mammal driving a Tokyo cab.', jp: '長い牙を持つ海獣で、東京の個人タクシー運転手。' }
  },
  {
    cat: 'romance',
    q: { id: 'Apa nama band tempat Hitori "Bocchi" Gotoh menjadi gitaris di Bocchi the Rock!?', en: 'What is the name of the band Hitori "Bocchi" Gotoh joins in Bocchi the Rock!?', jp: '『ぼっち・ざ・ろっく！』で後藤ひとりが所属するバンド名は？' },
    opts: { id: ['Ho-kago Tea Time', 'Kessoku Band', 'SICK HACK', 'Girls Dead Monster'], en: ['Ho-kago Tea Time', 'Kessoku Band', 'SICK HACK', 'Girls Dead Monster'], jp: ['放課後ティータイム', '結束バンド', 'SICK HACK', 'Girls Dead Monster'] },
    ans: 1,
    hint: { id: 'Dalam bahasa Jepang juga berarti "cable tie / pengikat kabel".', en: 'A Japanese pun meaning both "unity band" and "zip tie".', jp: '「結束（団結）」とケーブルを留める道具のダジャレ。' }
  },
  {
    cat: 'romance',
    q: { id: 'Di Sousou no Frieren, siapa pahlawan manusia dari party Frieren yang mengalahkan Raja Iblis?', en: 'In Frieren: Beyond Journey’s End, who was the Hero of Frieren’s party?', jp: '『葬送のフリーレン』でフリーレンと共に魔王を倒した勇者は？' },
    opts: { id: ['Eisen', 'Heiter', 'Himmel', 'Stark'], en: ['Eisen', 'Heiter', 'Himmel', 'Stark'], jp: ['アイゼン', 'ハイター', 'ヒンメル', 'シュタルク'] },
    ans: 2,
    hint: { id: 'Dalam bahasa Jerman, namanya berarti "Langit".', en: 'His name means "Sky / Heaven" in German.', jp: 'ドイツ語で「空・天国」を意味する名前。' }
  },
  {
    cat: 'romance',
    q: { id: 'Di film Kimi no Na wa. (Your Name), objek langit apa yang menghantam desa Itomori?', en: 'In Your Name (Kimi no Na wa.), what celestial object strikes Itomori?', jp: '映画『君の名は。』で糸守町に落下した天体は？' },
    opts: { id: ['Komet Tiamat', 'Bulan Merah', 'Asteroid Halley', 'Meteor Perseid'], en: ['Comet Tiamat', 'Blood Moon', 'Halley’s Comet', 'Perseid Meteor'], jp: ['ティアマト彗星', '赤い月', 'ハレー彗星', 'ペルセウス流星'] },
    ans: 0,
    hint: { id: 'Namanya diambil dari dewi kuno Mesopotamia: Tiamat.', en: 'Named after an ancient Mesopotamian goddess: Tiamat.', jp: 'メソポタミア神話の女神の名がついた彗星。' }
  }
];

function makePosterQuestions(count = 6) {
  const pool = [...FALLBACK_ANIME].sort(() => Math.random() - 0.5).slice(0, count);
  return pool.map((target) => {
    const distractors = FALLBACK_ANIME.filter((a) => a.mal_id !== target.mal_id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    const choices = [target, ...distractors].sort(() => Math.random() - 0.5);
    const ans = choices.findIndex((c) => c.mal_id === target.mal_id);
    const titles = choices.map((c) => c.title);
    const genreHint = `${target.year} · ${target.genres.slice(0, 2).join(', ')}`;
    return {
      cat: 'poster',
      poster: target.image,
      q: {
        id: 'Tebak judul anime dari poster blur ini!',
        en: 'Guess the anime from this blurred poster!',
        jp: 'このぼかしポスターのアニメ作品はどれ？'
      },
      opts: { id: titles, en: titles, jp: titles },
      ans,
      hint: { id: `Rilis ${genreHint}`, en: `Released ${genreHint}`, jp: `${genreHint}` }
    };
  });
}

function pickHigherLowerPair() {
  const pool = [...FALLBACK_ANIME].sort(() => Math.random() - 0.5);
  const a = pool[0];
  const b = pool.find((x) => x.mal_id !== a.mal_id && Math.abs((x.score || 8) - (a.score || 8)) >= 0.05) || pool[1];
  return [a, b];
}

export function initQuiz(root) {
  let category = 'all';
  let hardcore = false;
  let active = false;
  let finished = false;
  let deck = [];
  let idx = 0;
  let score = 0;
  let streak = 0;
  let lives = 3;
  let selectedOpt = null;
  let answered = false;
  let hintUsed = false;
  let lastFeedback = null;
  let hlPair = null;
  let hlRevealed = false;

  function buildDeck() {
    if (category === 'poster') return makePosterQuestions(6);
    if (category === 'survival') {
      const combined = [...QUESTIONS, ...makePosterQuestions(10)];
      return combined.sort(() => Math.random() - 0.5);
    }
    const base = category === 'all' ? [...QUESTIONS, ...makePosterQuestions(4)] : QUESTIONS.filter((q) => q.cat === category);
    return [...base].sort(() => Math.random() - 0.5).slice(0, Math.min(6, base.length));
  }

  function startBattle() {
    score = 0;
    streak = 0;
    lives = 3;
    selectedOpt = null;
    answered = false;
    hintUsed = false;
    lastFeedback = null;
    active = true;
    finished = false;
    if (category === 'higherlower') {
      hlPair = pickHigherLowerPair();
      hlRevealed = false;
    } else {
      deck = buildDeck();
      idx = 0;
    }
    playTone('impact');
    render();
  }

  function pickHigherLower(pickedIdx) {
    if (hlRevealed || !hlPair) return;
    hlRevealed = true;
    const [a, b] = hlPair;
    const winner = (a.score || 0) >= (b.score || 0) ? 0 : 1;
    const quizBox = root.querySelector('.quiz-box');

    if (pickedIdx === winner) {
      score += 1;
      streak += 1;
      if (score > (state.higherLowerBest || 0)) state.higherLowerBest = score;
      const gain = (15 + streak * 5) * (hardcore ? 2 : 1);
      lastFeedback = { ok: true, text: t('qzCorrect', gain) };
      playTone('fanfare');
      if (streak >= 2) fxCombo(quizBox);
      addExp(gain, t('qzCorrect', gain));
    } else {
      lives -= 1;
      streak = 0;
      lastFeedback = { ok: false, text: t('qzWrong', hlPair[winner].title) };
      playTone('impact');
      saveState();
    }
    render();
  }

  function nextHigherLower() {
    if (lives <= 0) {
      finished = true;
      render();
      return;
    }
    hlPair = pickHigherLowerPair();
    hlRevealed = false;
    lastFeedback = null;
    render();
  }

  function lockAnswer() {
    if (selectedOpt === null) {
      notify(t('qzPickFirst'));
      return;
    }
    const q = deck[idx];
    const lang = getLang();
    answered = true;
    const actBtn = root.querySelector('#qz-action');
    const quizBox = root.querySelector('.quiz-box');

    if (selectedOpt === q.ans) {
      score += 1;
      streak += 1;
      if (streak > state.quizMaxStreak) state.quizMaxStreak = streak;
      if (category === 'survival' && score > (state.survivalBest || 0)) state.survivalBest = score;
      const gain = (20 + streak * 5) * (hardcore ? 2 : 1);
      lastFeedback = { ok: true, text: t('qzCorrect', gain) };
      playTone('fanfare');
      if (streak >= 2) fxCombo(quizBox);
      if (actBtn && typeof actBtn.done === 'function') actBtn.done();
      addExp(gain, t('qzCorrect', gain));
    } else {
      streak = 0;
      if (category === 'survival') lives -= 1;
      const rightText = q.opts[lang][q.ans];
      lastFeedback = { ok: false, text: t('qzWrong', rightText) };
      playTone('impact');
      saveState();
    }

    const posterImg = root.querySelector('#qz-poster-img');
    if (posterImg) {
      posterImg.style.filter = 'blur(0px)';
      posterImg.style.transform = 'scale(1)';
    }

    const scoreChip = root.querySelector('#qz-score-chip');
    const streakChip = root.querySelector('#qz-streak-chip');
    const livesChip = root.querySelector('#qz-lives-chip');
    const optRadio = root.querySelector('#qz-options');
    const fbSlot = root.querySelector('#qz-feedback-slot');
    const prog = root.querySelector('#qz-progress');

    if (scoreChip) scoreChip.textContent = `${t('qzScore')}: ${score}`;
    if (streakChip) streakChip.textContent = `🔥 ${t('qzStreak')}: ${streak}x`;
    if (livesChip) livesChip.textContent = '❤️'.repeat(Math.max(0, lives)) + '🖤'.repeat(Math.max(0, 3 - lives));
    if (optRadio) optRadio.setAttribute('disabled', '');
    if (fbSlot) {
      fbSlot.innerHTML = `<div class="quiz-feedback ${lastFeedback.ok ? 'correct' : 'wrong'}">${escapeHtml(lastFeedback.text)}</div>`;
    }
    if (prog && typeof prog.set === 'function' && category !== 'survival') {
      prog.set((idx + 1) / Math.max(1, deck.length));
    }
    if (actBtn) {
      setTimeout(() => {
        if (answered && actBtn.isConnected) actBtn.textContent = t('qzNext');
      }, 420);
    }
  }

  function nextQuestion() {
    if (category === 'survival') {
      if (lives <= 0) {
        finished = true;
        playTone('fanfare');
      } else {
        idx += 1;
        if (idx >= deck.length) {
          deck = [...deck, ...makePosterQuestions(6)];
        }
        selectedOpt = null;
        answered = false;
        hintUsed = false;
        lastFeedback = null;
      }
      render();
      return;
    }

    if (idx + 1 >= deck.length) {
      finished = true;
      if (score > state.quizBest) {
        state.quizBest = score;
        saveState();
      }
      playTone('fanfare');
    } else {
      idx += 1;
      selectedOpt = null;
      answered = false;
      hintUsed = false;
      lastFeedback = null;
    }
    render();
  }

  function render() {
    const lang = getLang();
    const cats = t('qzCats');

    if (!active) {
      root.innerHTML = `
        <div class="panel-head">
          <div>
            <div class="panel-kicker">${t('qzKicker')}</div>
            <h2 class="panel-title">${t('qzTitle')}</h2>
            <p class="panel-desc">${t('qzDesc')}</p>
          </div>
          <div class="row-wrap" style="gap:6px">
            <span class="tag-chip gold">🏆 ${t('qzBest')}: ${state.quizBest}</span>
            <span class="tag-chip">❤️ Survival: ${state.survivalBest || 0}</span>
            <span class="tag-chip">📊 H/L: ${state.higherLowerBest || 0}</span>
          </div>
        </div>

        <div class="manga-card quiz-box stack">
          <div class="field-group">
            <span class="field-title">${t('qzCategory')}</span>
            <sakuga-radio id="qz-cat" label="${t('qzCategory')}">
              <option value="all" ${category === 'all' ? 'selected' : ''}>${cats.all}</option>
              <option value="survival" ${category === 'survival' ? 'selected' : ''}>${cats.survival}</option>
              <option value="higherlower" ${category === 'higherlower' ? 'selected' : ''}>${cats.higherlower}</option>
              <option value="poster" ${category === 'poster' ? 'selected' : ''}>${cats.poster}</option>
              <option value="shonen" ${category === 'shonen' ? 'selected' : ''}>${cats.shonen}</option>
              <option value="seinen" ${category === 'seinen' ? 'selected' : ''}>${cats.seinen}</option>
              <option value="romance" ${category === 'romance' ? 'selected' : ''}>${cats.romance}</option>
            </sakuga-radio>
          </div>

          <div class="row-wrap" style="justify-content:space-between;padding:12px 14px;background:var(--surface-alt);border:2.5px solid var(--ink);border-radius:14px">
            <span style="font-size:13.5px;font-weight:800">🔥 ${t('qzHardcore')}</span>
            <sakuga-toggle id="qz-hardcore" label="${t('qzHardcore')}"></sakuga-toggle>
          </div>

          <div style="text-align:center;padding-top:8px">
            <sakuga-button id="qz-start">⚔️ ${t('qzStart')}</sakuga-button>
          </div>
        </div>
      `;

      const catEl = root.querySelector('#qz-cat');
      const hcEl = root.querySelector('#qz-hardcore');
      requestAnimationFrame(() => { hcEl.checked = hardcore; });
      catEl.addEventListener('change', () => (category = catEl.value));
      hcEl.addEventListener('change', () => (hardcore = Boolean(hcEl.checked)));
      root.querySelector('#qz-start').addEventListener('click', startBattle);
      return;
    }

    if (finished) {
      const endless = category === 'survival' || category === 'higherlower';
      const stars = endless
        ? Math.max(1, Math.min(5, Math.ceil(score / 2)))
        : Math.max(1, Math.min(5, Math.round((score / Math.max(1, deck.length)) * 5)));
      root.innerHTML = `
        <div class="panel-head">
          <div>
            <div class="panel-kicker">${t('qzKicker')}</div>
            <h2 class="panel-title">${t('qzFinishTitle')}</h2>
          </div>
        </div>
        <div class="manga-card quiz-box" id="qz-finish-card" style="text-align:center">
          <div class="timer-display" style="font-size:56px">${endless ? score : `${score} / ${deck.length}`}</div>
          <p style="font-size:16px;font-weight:700;color:var(--mute);margin:8px 0 20px">${t('qzFinishDesc', score, endless ? 0 : deck.length)}</p>
          <div style="display:flex;justify-content:center;margin-bottom:24px">
            <sakuga-rating id="qz-final-rating" label="Final Rank"></sakuga-rating>
          </div>
          <div class="row-wrap" style="justify-content:center">
            <sakuga-button id="qz-again">🔥 ${t('qzRestart')}</sakuga-button>
            <sakuga-button id="qz-back" variant="secondary">${t('qzCategory')}</sakuga-button>
          </div>
        </div>
      `;
      const ratingEl = root.querySelector('#qz-final-rating');
      requestAnimationFrame(() => {
        ratingEl.value = stars;
        if (stars >= 4) fxSSR(root.querySelector('#qz-finish-card'));
      });
      root.querySelector('#qz-again').addEventListener('click', startBattle);
      root.querySelector('#qz-back').addEventListener('click', () => { active = false; render(); });
      return;
    }

    // Mode: Higher or Lower (MAL Score Duel)
    if (category === 'higherlower' && hlPair) {
      const [a, b] = hlPair;
      root.innerHTML = `
        <div class="panel-head">
          <div>
            <div class="panel-kicker">${t('qzKicker')}</div>
            <h2 class="panel-title">📊 Higher or Lower (MAL Score)</h2>
          </div>
        </div>
        <div class="manga-card quiz-box">
          <div class="quiz-hud">
            <span class="tag-chip">${'❤️'.repeat(Math.max(0, lives))}${'🖤'.repeat(Math.max(0, 3 - lives))}</span>
            <span class="tag-chip pri">${t('qzScore')}: ${score}</span>
            <span class="tag-chip accent">🔥 ${t('qzStreak')}: ${streak}x</span>
          </div>
          <h3 class="quiz-question" style="text-align:center">${t('qzHlPrompt')}</h3>
          <div class="hl-arena">
            ${[a, b]
              .map(
                (item, i) => `
              <div class="hl-card">
                <div class="hl-poster"><img src="${item.image}" alt=""></div>
                <h4 style="margin:0;font-size:16px;font-weight:800">${escapeHtml(item.title)}</h4>
                <span class="tag-chip">${item.type} · ${item.year}</span>
                ${
                  hlRevealed
                    ? `<span class="tag-chip gold" style="font-size:16px;padding:6px 14px">MAL ★ ${item.score}</span>`
                    : `<sakuga-button data-hl-pick="${i}">${t('qzHlPick')}</sakuga-button>`
                }
              </div>`
              )
              .join('')}
          </div>
          ${lastFeedback ? `<div class="quiz-feedback ${lastFeedback.ok ? 'correct' : 'wrong'}">${escapeHtml(lastFeedback.text)}</div>` : ''}
          <div class="row-wrap" style="margin-top:18px;justify-content:space-between">
            ${hlRevealed ? `<sakuga-button id="hl-next">${t('qzNext')}</sakuga-button>` : '<span></span>'}
            <sakuga-button id="qz-exit" variant="secondary">${t('qzCategory')}</sakuga-button>
          </div>
        </div>
      `;

      root.querySelectorAll('[data-hl-pick]').forEach((btn) => {
        btn.addEventListener('click', () => pickHigherLower(Number(btn.dataset.hlPick)));
      });
      root.querySelector('#hl-next')?.addEventListener('click', nextHigherLower);
      root.querySelector('#qz-exit').addEventListener('click', () => { active = false; render(); });
      return;
    }

    const q = deck[idx];
    const opts = q.opts[lang];
    const ratio = category === 'survival' ? Math.min(1, (score % 10) / 10) : (idx + (answered ? 1 : 0)) / Math.max(1, deck.length);
    const blurPx = answered ? 0 : hintUsed ? 6 : 13;

    root.innerHTML = `
      <div class="panel-head">
        <div>
          <div class="panel-kicker">${t('qzKicker')}</div>
          <h2 class="panel-title">${t('qzTitle')}</h2>
        </div>
      </div>

      <div class="manga-card quiz-box">
        <div class="quiz-hud">
          ${category === 'survival' ? `<span class="tag-chip" id="qz-lives-chip">${'❤️'.repeat(Math.max(0, lives))}${'🖤'.repeat(Math.max(0, 3 - lives))}</span>` : `<span class="tag-chip pri">${t('qzQuestionOf', idx + 1, deck.length)}</span>`}
          <span class="tag-chip" id="qz-score-chip">${t('qzScore')}: ${score}</span>
          <span class="tag-chip accent" id="qz-streak-chip">🔥 ${t('qzStreak')}: ${streak}x</span>
          ${!hardcore ? `<div class="row-wrap" style="gap:6px"><span style="font-size:12px;font-weight:800">${t('qzHintLabel')}</span><sakuga-tooltip id="qz-hint-tip" text="${escapeAttr(q.hint[lang])}" label="${t('qzHintLabel')}"></sakuga-tooltip></div>` : `<span class="tag-chip gold">HARDCORE 2X</span>`}
        </div>

        <div class="progress-stage" style="min-height:155px;padding:38px 8px 4px">
          <sakuga-progress id="qz-progress" label="${t('qzComboBar')}" done-label="${t('qzComboDone')}" style="--sk-progress-width: 280px;"></sakuga-progress>
        </div>

        ${q.poster ? `<div class="quiz-poster-box"><img id="qz-poster-img" src="${q.poster}" alt="Mystery anime poster" style="filter:blur(${blurPx}px);transform:scale(${answered ? 1 : 1.08})"></div>` : ''}

        <h3 class="quiz-question">${escapeHtml(q.q[lang])}</h3>

        <sakuga-radio id="qz-options" label="Answer choices" ${answered ? 'disabled' : ''}>
          ${opts.map((opt, i) => `<option value="${i}" ${selectedOpt === i ? 'selected' : ''}>${String.fromCharCode(65 + i)}. ${escapeHtml(opt)}</option>`).join('')}
        </sakuga-radio>

        <div id="qz-feedback-slot">${lastFeedback ? `<div class="quiz-feedback ${lastFeedback.ok ? 'correct' : 'wrong'}">${escapeHtml(lastFeedback.text)}</div>` : ''}</div>

        <div class="row-wrap" style="margin-top:20px;justify-content:space-between">
          <sakuga-button id="qz-action">${answered ? t('qzNext') : t('qzLock')}</sakuga-button>
          <sakuga-button id="qz-exit" variant="secondary">${t('qzCategory')}</sakuga-button>
        </div>
      </div>
    `;

    const prog = root.querySelector('#qz-progress');
    requestAnimationFrame(() => {
      if (prog && typeof prog.set === 'function' && !root.hidden) prog.set(ratio, !answered);
    });

    const hintTip = root.querySelector('#qz-hint-tip');
    if (hintTip && q.poster) {
      const sharpen = () => {
        if (!answered && !hintUsed) {
          hintUsed = true;
          const img = root.querySelector('#qz-poster-img');
          if (img) img.style.filter = 'blur(6px)';
        }
      };
      hintTip.addEventListener('pointerenter', sharpen);
      hintTip.addEventListener('click', sharpen);
    }

    const optRadio = root.querySelector('#qz-options');
    optRadio.addEventListener('change', () => {
      selectedOpt = Number(optRadio.value);
    });

    const actBtn = root.querySelector('#qz-action');
    actBtn.addEventListener('click', () => {
      if (!answered) lockAnswer();
      else nextQuestion();
    });

    root.querySelector('#qz-exit').addEventListener('click', () => {
      active = false;
      render();
    });
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
