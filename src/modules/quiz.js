import { t, getLang, onLangChange } from '../core/i18n.js';
import { state, addExp, notify, saveState } from '../core/store.js';
import { playTone } from '../core/sfx.js';

const QUESTIONS = [
  {
    cat: 'shonen',
    q: {
      id: 'Apa nama teknik pemanggil domain (Domain Expansion) milik Satoru Gojo di Jujutsu Kaisen?',
      en: 'What is the name of Satoru Gojo’s Domain Expansion in Jujutsu Kaisen?',
      jp: '『呪術廻戦』の五条悟の領域展開の名前は？'
    },
    opts: {
      id: ['Malevolent Shrine', 'Unlimited Void', 'Chimera Shadow Garden', 'Coffin of the Iron Mountain'],
      en: ['Malevolent Shrine', 'Unlimited Void', 'Chimera Shadow Garden', 'Coffin of the Iron Mountain'],
      jp: ['伏魔御廚子', '無量空処', '嵌合暗翳庭', '蓋棺鉄囲山']
    },
    ans: 1,
    hint: {
      id: 'Membanjiri pikiran lawan dengan informasi tak terbatas.',
      en: 'Floods the target’s mind with infinite information.',
      jp: '相手の脳に無限の情報を流し込む領域。'
    }
  },
  {
    cat: 'shonen',
    q: {
      id: 'Di One Piece, pulau terakhir di Grand Line yang menyimpan harta karun One Piece bernama...',
      en: 'In One Piece, the final island of the Grand Line holding the One Piece treasure is called...',
      jp: '『ONE PIECE』でひとつなぎの大秘宝が眠る最終地点の島は？'
    },
    opts: {
      id: ['Skypiea', 'Elbaf', 'Laugh Tale', 'Wano Kuni'],
      en: ['Skypiea', 'Elbaf', 'Laugh Tale', 'Wano Country'],
      jp: ['空島', 'エルバフ', 'ラフテル', 'ワノ国']
    },
    ans: 2,
    hint: {
      id: 'Gol D. Roger tertawa saat tiba di sana.',
      en: 'Gol D. Roger literally laughed upon reaching it.',
      jp: 'ロジャー海賊団が到達した時に大笑いしたことに由来。'
    }
  },
  {
    cat: 'shonen',
    q: {
      id: 'Studio animasi legendaris mana yang menggarap Mob Psycho 100 dan Fullmetal Alchemist: Brotherhood?',
      en: 'Which legendary studio animated both Mob Psycho 100 and Fullmetal Alchemist: Brotherhood?',
      jp: '『モブサイコ100』と『鋼の錬金術師 FA』を制作したアニメスタジオは？'
    },
    opts: {
      id: ['MAPPA', 'Studio Bones', 'Ufotable', 'Kyoto Animation'],
      en: ['MAPPA', 'Studio Bones', 'Ufotable', 'Kyoto Animation'],
      jp: ['MAPPA', 'ボンズ (Bones)', 'ufotable', '京都アニメーション']
    },
    ans: 1,
    hint: {
      id: 'Namanya dalam bahasa Inggris berarti "tulang".',
      en: 'Its name is a skeletal English noun.',
      jp: '英語で「骨」を意味するスタジオ名。'
    }
  },
  {
    cat: 'shonen',
    q: {
      id: 'Di Hunter x Hunter, tipe Nen apa yang dimiliki oleh Killua Zoldyck?',
      en: 'In Hunter x Hunter, what Nen category does Killua Zoldyck belong to?',
      jp: '『HUNTER×HUNTER』でキルア＝ゾルディックの念系統は？'
    },
    opts: {
      id: ['Enhancer (Penguat)', 'Transmuter (Perubah)', 'Conjurer (Perwujud)', 'Emitter (Pemancar)'],
      en: ['Enhancer', 'Transmuter', 'Conjurer', 'Emitter'],
      jp: ['強化系', '変化系', '具現化系', '放出系']
    },
    ans: 1,
    hint: {
      id: 'Ia mengubah sifat auranya menjadi listrik (Godspeed).',
      en: 'He alters the properties of his aura into electricity.',
      jp: 'オーラの性質を電気に変える（神速）。'
    }
  },
  {
    cat: 'shonen',
    q: {
      id: 'Siapa nama pedang Zanpakuto milik Ichigo Kurosaki di Bleach?',
      en: 'What is the name of Ichigo Kurosaki’s Zanpakuto in Bleach?',
      jp: '『BLEACH』で黒崎一護の斬魄刀の名前は？'
    },
    opts: {
      id: ['Senbonzakura', 'Zangetsu', 'Hyorinmaru', 'Zabimaru'],
      en: ['Senbonzakura', 'Zangetsu', 'Hyorinmaru', 'Zabimaru'],
      jp: ['千本桜', '斬月', '氷輪丸', '蛇尾丸']
    },
    ans: 1,
    hint: {
      id: 'Artinya secara harfiah "Bulan Pembelah".',
      en: 'Literally translates to "Slaying Moon".',
      jp: '「月を斬る」と書く名前。'
    }
  },
  {
    cat: 'seinen',
    q: {
      id: 'Di Steins;Gate, apa angka divergensi (Divergence Number) untuk mencapai garis dunia Steins Gate?',
      en: 'In Steins;Gate, what Divergence Number leads to the Steins Gate world line?',
      jp: '『シュタインズ・ゲート』でシュタインズ・ゲート世界線のダイバージェンス値は？'
    },
    opts: {
      id: ['0.571024%', '1.048596%', '1.130426%', '0.000000%'],
      en: ['0.571024%', '1.048596%', '1.130426%', '0.000000%'],
      jp: ['0.571024%', '1.048596%', '1.130426%', '0.000000%']
    },
    ans: 1,
    hint: {
      id: 'Melewati penghalang 1% sedikit saja: 1.048...',
      en: 'Just past the 1% barrier: 1.048...',
      jp: '1%の壁を越えた直後の数値：1.048...'
    }
  },
  {
    cat: 'seinen',
    q: {
      id: 'Siapa nama kapal luar angkasa yang menjadi rumah Spike Spiegel dkk. di Cowboy Bebop?',
      en: 'What is the name of the spaceship Spike Spiegel and his crew live on in Cowboy Bebop?',
      jp: '『カウボーイビバップ』でスパイクたちが拠点とする宇宙船の名前は？'
    },
    opts: {
      id: ['Swordfish II', 'Bebop', 'Red Tail', 'Outlaw Star'],
      en: ['Swordfish II', 'Bebop', 'Red Tail', 'Outlaw Star'],
      jp: ['ソードフィッシュII', 'ビバップ号', 'レッドテイル', 'アウトロースター']
    },
    ans: 1,
    hint: {
      id: 'Namanya ada di judul animenya sendiri!',
      en: 'It is right in the title of the anime!',
      jp: '作品のタイトルそのものに入っている！'
    }
  },
  {
    cat: 'seinen',
    q: {
      id: 'Di Vinland Saga, siapa prajurit legendaris yang merupakan ayah dari Thorfinn?',
      en: 'In Vinland Saga, who is Thorfinn’s legendary warrior father?',
      jp: '『ヴィンランド・サガ』でトルフィンの父である伝説の戦士は？'
    },
    opts: {
      id: ['Askeladd', 'Thors', 'Thorkell', 'Canute'],
      en: ['Askeladd', 'Thors', 'Thorkell', 'Canute'],
      jp: ['アシェラッド', 'トールズ', 'トルケル', 'クヌート']
    },
    ans: 1,
    hint: {
      id: 'Dijuluki "Troll of Jom" dan mengajarkan "Kamu tidak punya musuh".',
      en: 'Known as the "Troll of Jom" who taught "You have no enemies."',
      jp: '「ヨームの戦鬼」と呼ばれ、「お前に敵などいない」と教えた。'
    }
  },
  {
    cat: 'seinen',
    q: {
      id: 'Di Odd Taxi, hewan apa yang menjadi wujud tokoh utama Hiroshi Odokawa?',
      en: 'In Odd Taxi, what animal is the protagonist Hiroshi Odokawa?',
      jp: '『オッドタクシー』の主人公・小戸川は何の動物？'
    },
    opts: {
      id: ['Alpaka', 'Walrus (Singa Laut Gading)', 'Gorila', 'Babun'],
      en: ['Alpaca', 'Walrus', 'Gorilla', 'Baboon'],
      jp: ['アルパカ', 'セイウチ', 'ゴリラ', 'ヒヒ']
    },
    ans: 1,
    hint: {
      id: 'Mamalia laut bertaring panjang yang mengemudikan taksi di Tokyo.',
      en: 'A tusked marine mammal driving a Tokyo cab.',
      jp: '長い牙を持つ海獣で、東京の個人タクシー運転手。'
    }
  },
  {
    cat: 'romance',
    q: {
      id: 'Apa nama band tempat Hitori "Bocchi" Gotoh menjadi gitaris utama di Bocchi the Rock!?',
      en: 'What is the name of the band Hitori "Bocchi" Gotoh joins in Bocchi the Rock!?',
      jp: '『ぼっち・ざ・ろっく！』で後藤ひとりが所属するバンド名は？'
    },
    opts: {
      id: ['Ho-kago Tea Time', 'Kessoku Band', 'SICK HACK', 'Girls Dead Monster'],
      en: ['Ho-kago Tea Time', 'Kessoku Band', 'SICK HACK', 'Girls Dead Monster'],
      jp: ['放課後ティータイム', '結束バンド', 'SICK HACK', 'Girls Dead Monster']
    },
    ans: 1,
    hint: {
      id: 'Dalam bahasa Jepang juga berarti "cable tie / pengikat kabel".',
      en: 'A Japanese pun meaning both "unity band" and "zip tie".',
      jp: '「結束（団結）」とケーブルを留める道具のダジャレ。'
    }
  },
  {
    cat: 'romance',
    q: {
      id: 'Di Sousou no Frieren, siapa nama pahlawan manusia dari party Frieren yang mengalahkan Raja Iblis?',
      en: 'In Frieren: Beyond Journey’s End, who was the Hero of Frieren’s party?',
      jp: '『葬送のフリーレン』でフリーレンと共に魔王を倒した勇者の名前は？'
    },
    opts: {
      id: ['Eisen', 'Heiter', 'Himmel', 'Stark'],
      en: ['Eisen', 'Heiter', 'Himmel', 'Stark'],
      jp: ['アイゼン', 'ハイター', 'ヒンメル', 'シュタルク']
    },
    ans: 2,
    hint: {
      id: 'Dalam bahasa Jerman, namanya berarti "Langit".',
      en: 'His name means "Sky / Heaven" in German.',
      jp: 'ドイツ語で「空・天国」を意味する名前。'
    }
  },
  {
    cat: 'romance',
    q: {
      id: 'Di film Kimi no Na wa. (Your Name), objek langit apa yang terbelah dan menghantam desa Itomori?',
      en: 'In Your Name (Kimi no Na wa.), what celestial object splits and strikes Itomori?',
      jp: '映画『君の名は。』で糸守町に落下した天体は？'
    },
    opts: {
      id: ['Komet Tiamat', 'Bulan Merah', 'Asteroid Halley', 'Meteor Perseid'],
      en: ['Comet Tiamat', 'Blood Moon', 'Halley’s Comet', 'Perseid Meteor'],
      jp: ['ティアマト彗星', '赤い月', 'ハレー彗星', 'ペルセウス流星']
    },
    ans: 0,
    hint: {
      id: 'Namanya diambil dari dewi kuno Mesopotamia: Tiamat.',
      en: 'Named after an ancient Mesopotamian goddess: Tiamat.',
      jp: 'メソポタミア神話の女神の名がついた彗星。'
    }
  }
];

export function initQuiz(root) {
  let category = 'all';
  let hardcore = false;
  let active = false;
  let finished = false;
  let deck = [];
  let idx = 0;
  let score = 0;
  let streak = 0;
  let selectedOpt = null;
  let answered = false;
  let lastFeedback = null;

  function buildDeck() {
    const pool = category === 'all' ? [...QUESTIONS] : QUESTIONS.filter((q) => q.cat === category);
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, Math.min(6, pool.length));
  }

  function startBattle() {
    deck = buildDeck();
    idx = 0;
    score = 0;
    streak = 0;
    selectedOpt = null;
    answered = false;
    lastFeedback = null;
    active = true;
    finished = false;
    playTone('impact');
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
    if (selectedOpt === q.ans) {
      score += 1;
      streak += 1;
      const gain = (20 + streak * 5) * (hardcore ? 2 : 1);
      lastFeedback = { ok: true, text: t('qzCorrect', gain) };
      playTone('fanfare');
      if (actBtn && typeof actBtn.done === 'function') actBtn.done();
      addExp(gain, t('qzCorrect', gain));
    } else {
      streak = 0;
      const rightText = q.opts[lang][q.ans];
      lastFeedback = { ok: false, text: t('qzWrong', rightText) };
      playTone('impact');
    }

    // Update UI in-place so the button burst and progress storm cloud play uninterrupted
    const scoreChip = root.querySelector('#qz-score-chip');
    const streakChip = root.querySelector('#qz-streak-chip');
    const optRadio = root.querySelector('#qz-options');
    const fbSlot = root.querySelector('#qz-feedback-slot');
    const prog = root.querySelector('#qz-progress');

    if (scoreChip) scoreChip.textContent = `${t('qzScore')}: ${score}`;
    if (streakChip) streakChip.textContent = `🔥 ${t('qzStreak')}: ${streak}x`;
    if (optRadio) optRadio.setAttribute('disabled', '');
    if (fbSlot) {
      fbSlot.innerHTML = `<div class="quiz-feedback ${lastFeedback.ok ? 'correct' : 'wrong'}">${escapeHtml(lastFeedback.text)}</div>`;
    }
    if (prog && typeof prog.set === 'function') {
      prog.set((idx + 1) / Math.max(1, deck.length));
    }
    if (actBtn) {
      setTimeout(() => {
        if (answered && actBtn.isConnected) actBtn.textContent = t('qzNext');
      }, 420);
    }
  }

  function nextQuestion() {
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
          <span class="tag-chip gold">🏆 ${t('qzBest')}: ${state.quizBest}</span>
        </div>

        <div class="manga-card quiz-box stack">
          <div class="field-group">
            <span class="field-title">${t('qzCategory')}</span>
            <sakuga-radio id="qz-cat" label="${t('qzCategory')}">
              <option value="all" ${category === 'all' ? 'selected' : ''}>${cats.all}</option>
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
      const stars = Math.max(1, Math.min(5, Math.round((score / Math.max(1, deck.length)) * 5)));
      root.innerHTML = `
        <div class="panel-head">
          <div>
            <div class="panel-kicker">${t('qzKicker')}</div>
            <h2 class="panel-title">${t('qzFinishTitle')}</h2>
          </div>
        </div>
        <div class="manga-card quiz-box" style="text-align:center">
          <div class="timer-display" style="font-size:56px">${score} / ${deck.length}</div>
          <p style="font-size:16px;font-weight:700;color:var(--mute);margin:8px 0 20px">${t('qzFinishDesc', score, deck.length)}</p>
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
      requestAnimationFrame(() => { ratingEl.value = stars; });
      root.querySelector('#qz-again').addEventListener('click', startBattle);
      root.querySelector('#qz-back').addEventListener('click', () => { active = false; render(); });
      return;
    }

    const q = deck[idx];
    const opts = q.opts[lang];
    const ratio = (idx + (answered ? 1 : 0)) / Math.max(1, deck.length);

    root.innerHTML = `
      <div class="panel-head">
        <div>
          <div class="panel-kicker">${t('qzKicker')}</div>
          <h2 class="panel-title">${t('qzTitle')}</h2>
        </div>
      </div>

      <div class="manga-card quiz-box">
        <div class="quiz-hud">
          <span class="tag-chip pri">${t('qzQuestionOf', idx + 1, deck.length)}</span>
          <span class="tag-chip" id="qz-score-chip">${t('qzScore')}: ${score}</span>
          <span class="tag-chip accent" id="qz-streak-chip">🔥 ${t('qzStreak')}: ${streak}x</span>
          ${!hardcore ? `<div class="row-wrap" style="gap:6px"><span style="font-size:12px;font-weight:800">${t('qzHintLabel')}</span><sakuga-tooltip text="${escapeAttr(q.hint[lang])}" label="${t('qzHintLabel')}"></sakuga-tooltip></div>` : `<span class="tag-chip gold">HARDCORE 2X</span>`}
        </div>

        <div class="progress-stage" style="min-height:155px;padding:38px 8px 4px">
          <sakuga-progress id="qz-progress" label="${t('qzComboBar')}" done-label="${t('qzComboDone')}" style="--sk-progress-width: 280px;"></sakuga-progress>
        </div>

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
      if (prog && typeof prog.set === 'function') prog.set(ratio, !answered);
    });

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
