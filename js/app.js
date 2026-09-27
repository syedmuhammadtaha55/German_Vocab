// Taha's Lehrer: views and drills.
(function () {
  const V = window.VOCAB;
  const byId = Object.fromEntries(V.map(w => [w.id, w]));
  const view = document.getElementById('view');

  // ---------- tiny DOM helper ----------
  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
      else el.setAttribute(k, v === true ? '' : v);
    }
    for (const k of kids.flat(Infinity)) {
      if (k == null || k === false) continue;
      el.append(k.nodeType ? k : document.createTextNode(String(k)));
    }
    return el;
  }
  const ICON = {
    play: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 9v6h4l5 4V5L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 8v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z"/></svg>',
    slow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M9 2h6"/></svg>',
    mic: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.9V21h2v-3.1A7 7 0 0 0 19 11h-2z"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  };
  const icon = name => h('span', { html: ICON[name], style: { display: 'inline-flex' } });
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const sample = (arr, n, not = []) => shuffle(arr.filter(x => !not.includes(x))).slice(0, n);
  const gclass = w => (w.art && !w.plOnly ? 'g-' + w.art : '');
  const LIST_NAMES = { sg: 'StudyGerman A1', goethe: 'Goethe A1' };
  const inList = (w, l) => (w.lists || ['sg']).includes(l);

  function toast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg; t.hidden = false;
    clearTimeout(toast.t); toast.t = setTimeout(() => (t.hidden = true), 2200);
  }

  // Word rendered with a coloured article.
  function wordEl(w, cls = 'word') {
    if (!w.art) return h('span', { class: cls }, w.de);
    return h('span', { class: `${cls} ${gclass(w)}` }, h('span', { class: 'art' }, w.art), ' ', w.noun);
  }
  function speakBtn(text, { slow = false, label } = {}) {
    return h('button', {
      class: 'btn icon-btn speak' + (slow ? ' slow' : ''), type: 'button',
      'aria-label': label || (slow ? 'Play slowly: ' : 'Play: ') + text, title: slow ? 'Slow' : 'Listen',
      onclick: e => { e.stopPropagation(); Speech.speak(text, { speed: slow ? 'slow' : 'normal' }); },
    }, icon(slow ? 'slow' : 'play'));
  }
  const statusPill = id => { const s = Progress.status(id); return h('span', { class: 'pill s-' + s }, s); };

  // ---------- routing ----------
  let current = 'home';
  let cleanup = null;
  function go(tab, arg) {
    if (cleanup) { cleanup(); cleanup = null; }
    Speech.canSpeak && speechSynthesis.cancel();
    current = tab;
    document.querySelectorAll('#tabs button').forEach(b => b.setAttribute('aria-current', b.dataset.tab === tab ? 'page' : 'false'));
    view.replaceChildren();
    ({ home: Home, words: Words, review: Review, drills: Drills })[tab](arg);
    window.scrollTo(0, 0);
    try { if (['home', 'words', 'review', 'drills'].includes(tab)) history.replaceState(null, '', '#' + tab); } catch (_) {}
    renderStreak();
  }
  document.getElementById('tabs').addEventListener('click', e => {
    const b = e.target.closest('button[data-tab]'); if (b) go(b.dataset.tab);
  });
  function renderStreak() {
    const s = Progress.streak();
    document.getElementById('streak').textContent = s ? `${s} day${s > 1 ? 's' : ''} streak` : '';
  }

  // ---------- word detail sheet ----------
  const sheet = document.getElementById('sheet');
  const backdrop = document.getElementById('sheet-backdrop');
  function closeSheet() { sheet.hidden = true; backdrop.hidden = true; sheet.replaceChildren(); }
  backdrop.addEventListener('click', closeSheet);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !sheet.hidden) closeSheet(); });

  function wordCard(w, { compact = false } = {}) {
    const tips = Lang.pronunciationTips(w.de);
    const rule = w.art ? Lang.articleRule(w) : '';
    const typeLabel = { noun: w.plOnly ? 'noun, plural only' : 'noun', adj: 'adjective', adv: 'adverb / time word', verb: 'verb', word: 'small word', phrase: 'phrase' }[w.type];
    const lists = (w.lists || ['sg']).map(l => LIST_NAMES[l]).join(' + ');
    return h('article', { class: compact ? `card flat ${gclass(w)}` : `card ${w.art ? 'gendered ' + gclass(w) : ''}` },
      h('div', { class: 'row between' },
        h('span', { class: 'eyebrow' }, `#${w.id} · ${typeLabel} · ${lists}`),
        statusPill(w.id)),
      h('div', { class: 'stack', style: { gap: '6px' } },
        h('div', { class: 'row', style: { flexWrap: 'nowrap', alignItems: 'flex-start' } },
          h('div', { class: 'big-word', style: { flex: '1' } }, wordEl(w, '')),
          h('div', { class: 'row', style: { flexWrap: 'nowrap' } }, speakBtn(w.de), speakBtn(w.de, { slow: true }))),
        h('p', { style: { fontSize: '1.15rem' } }, w.en),
        w.pl ? h('p', { class: 'plural' }, 'Plural: ', h('b', {}, 'die'), ' ' + w.pl, ' ', speakBtn('die ' + w.pl, { label: 'Play plural' })) : null,
        w.plOnly ? h('p', { class: 'plural small' }, 'Only used in the plural, so the article is always die.') :
          w.art && !w.pl ? h('p', { class: 'plural small' }, 'Usually no plural.') : null,
        w.adjNoun ? h('p', { class: 'plural small' }, `Declined like an adjective: der ${w.noun} but ein ${w.noun}r (ein Bekannter, eine Bekannte).`) : null),
      rule ? h('p', { class: 'rule' }, h('b', {}, w.art + ' · '), rule) : null,
      h('div', { class: 'ex' },
        h('div', { class: 'row', style: { flexWrap: 'nowrap', alignItems: 'flex-start' } },
          h('p', { class: 'de', style: { flex: '1' } }, w.ex),
          speakBtn(w.ex), speakBtn(w.ex, { slow: true })),
        h('p', { class: 'en' }, w.exEn)),
      (w.more || []).map(m => h('div', { class: 'ex' },
        h('div', { class: 'row', style: { flexWrap: 'nowrap', alignItems: 'flex-start' } },
          h('p', { class: 'de', style: { flex: '1' } }, m.de),
          speakBtn(m.de), compact ? null : speakBtn(m.de, { slow: true })),
        h('p', { class: 'en' }, m.en))),
      compact ? null : h('details', { class: 'more', open: true },
        h('summary', {}, 'How to pronounce it'),
        tips.length ? h('ul', { class: 'tips' }, tips.map(t => h('li', {}, h('b', {}, t.label), h('span', {}, t.text))))
          : h('p', { class: 'muted small' }, 'Spoken as written. Stress the first syllable.'),
        h('p', { class: 'muted small', style: { marginTop: '8px' } }, 'Stress usually falls on the first syllable. Listen at slow speed, then repeat out loud.')),
      compact || !w.art || w.plOnly || w.adjNoun ? null : h('details', { class: 'more' },
        h('summary', {}, 'Use it in a sentence (cases)'),
        h('div', { style: { overflowX: 'auto' } },
          h('table', { class: 'case-table' },
            h('thead', {}, h('tr', {}, h('th', {}, 'Case'), h('th', {}, 'the'), h('th', {}, 'a / an'))),
            h('tbody', {}, Lang.cases(w).map(c => h('tr', {}, h('th', {}, c.label), h('td', {}, c.def), h('td', {}, c.indef)))))),
        h('p', { class: 'muted small', style: { marginTop: '8px' } },
          w.art === 'der' ? 'Only der-words change in the accusative: Ich sehe den ' + w.noun + '.' :
            w.art === 'die' ? 'die stays die in the accusative: Ich sehe die ' + w.noun + '.' :
              'das stays das in the accusative: Ich sehe das ' + w.noun + '.')),
    );
  }

  function openWord(id) {
    const w = byId[id];
    sheet.replaceChildren(
      h('button', { class: 'btn icon-btn ghost sheet-close', 'aria-label': 'Close', onclick: closeSheet }, icon('x')),
      wordCard(w),
      h('div', { class: 'row' },
        h('button', { class: 'btn', onclick: () => { Progress.markKnown(id); toast('Marked as known'); openWord(id); } }, 'I already know this'),
        Progress.state(id) ? h('button', { class: 'btn ghost', onclick: () => { Progress.reset(id); toast('Progress reset'); openWord(id); } }, 'Reset progress') : null));
    sheet.hidden = false; backdrop.hidden = false;
    sheet.scrollTop = 0;
    Speech.speak(w.de);
  }

  // ---------- HOME ----------
  function counts(ids = V.map(w => w.id)) {
    const c = { new: 0, learning: 0, known: 0, mastered: 0 };
    ids.forEach(id => c[Progress.status(id)]++);
    return c;
  }
  function skillTotals() {
    const t = { article: [0, 0], listen: [0, 0], write: [0, 0], speak: [0, 0], use: [0, 0] };
    V.forEach(w => { const s = Progress.state(w.id); if (!s) return; for (const k in t) { const x = s.skills?.[k]; if (x) { t[k][0] += x[0]; t[k][1] += x[1]; } } });
    return t;
  }
  function newQueue() {
    const left = Math.max(0, (Settings.get('newPerDay') || 10) - Progress.newToday());
    const from = Settings.get('newFrom') || 'mixed';
    const fresh = l => V.filter(w => !Progress.state(w.id) && inList(w, l));
    let ids;
    if (from === 'mixed') {
      // Alternate between the two lists; words on both lists count for either.
      const a = fresh('sg'), b = fresh('goethe').filter(w => !inList(w, 'sg'));
      ids = [];
      for (let i = 0; ids.length < left && (i < a.length || i < b.length); i++) {
        if (a[i]) ids.push(a[i].id);
        if (b[i] && ids.length < left) ids.push(b[i].id);
      }
    } else ids = fresh(from).slice(0, left).map(w => w.id);
    return ids;
  }

  function Home() {
    const c = counts();
    const due = Progress.dueIds().length;
    const fresh = newQueue().length;
    const seen = V.length - c.new;
    const segs = [['mastered', 'var(--das)'], ['known', 'var(--der)'], ['learning', 'var(--warn)']];

    view.append(
      h('section', { class: 'panel hero' },
        h('div', { class: 'stack', style: { gap: '4px' } },
          h('span', { class: 'eyebrow' }, new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })),
          h('h1', {}, due + fresh ? 'Your session is ready' : seen === V.length ? `All ${V.length} words started. Keep them fresh.` : 'All done for today')),
        h('div', { class: 'hero-stats' },
          h('div', { class: 'stat' }, h('b', {}, due), h('span', {}, 'reviews due')),
          h('div', { class: 'stat' }, h('b', {}, fresh), h('span', {}, 'new words today')),
          h('div', { class: 'stat' }, h('b', {}, `${seen}/${V.length}`), h('span', {}, 'words started'))),
        h('div', { class: 'row' },
          h('button', { class: 'btn gold big', onclick: () => go('review'), disabled: !(due + fresh) }, due + fresh ? 'Start session' : 'Nothing due'),
          h('button', { class: 'btn big', onclick: () => go('drills') }, 'Practise with drills')),
        h('div', { class: 'stack', style: { gap: '8px' } },
          h('div', { class: 'bar', role: 'img', 'aria-label': `${c.mastered} mastered, ${c.known} known, ${c.learning} learning, ${c.new} new` },
            segs.map(([k, col]) => h('i', { style: { width: (c[k] / V.length * 100) + '%', background: col } }))),
          h('div', { class: 'legend num' },
            segs.map(([k, col]) => h('span', { style: { '--c': col } }, `${c[k]} ${k}`)),
            h('span', { style: { '--c': 'var(--surface-2)' } }, `${c.new} new`)))),
    );

    const st = skillTotals();
    for (const k of ['talk', 'a2']) st[k] = Progress.stats[k] || [0, 0];
    const skills = [['article', 'Articles', 'der · die · das'], ['listen', 'Listening', 'recognise by ear'], ['speak', 'Speaking', 'say it out loud'], ['write', 'Spelling', 'write what you hear'], ['use', 'Usage', 'words in sentences'], ['talk', 'Conversation', 'answers without mistakes'], ['a2', 'A2 articles', 'cases in sentences']];
    view.append(h('section', { class: 'panel' },
      h('div', { class: 'row between' }, h('h2', {}, 'Skills'), h('span', { class: 'muted small' }, 'accuracy in drills')),
      h('div', { class: 'grid-3' }, skills.map(([k, name, sub]) => {
        const [ok, tot] = st[k]; const pct = tot ? Math.round(ok / tot * 100) : 0;
        return h('div', { class: 'skill' },
          h('span', { class: 'eyebrow' }, name),
          h('b', {}, tot ? pct + '%' : '–'),
          h('div', { class: 'meter' }, h('i', { style: { width: pct + '%' } })),
          h('span', { class: 'muted small' }, tot ? `${ok}/${tot} · ${sub}` : sub));
      }))));

    const weak = V.filter(w => Progress.weakness(w.id) > 0).sort((a, b) => Progress.weakness(b.id) - Progress.weakness(a.id)).slice(0, 8);
    view.append(h('div', { class: 'grid-2' },
      h('section', { class: 'panel' },
        h('h2', {}, 'Topics'),
        h('div', {}, CATEGORIES.map(cat => {
          const ids = V.filter(w => w.cat === cat).map(w => w.id);
          const cc = counts(ids);
          const started = ids.length - cc.new;
          return h('button', { class: 'cat-row', onclick: () => go('words', { cat }) },
            h('span', {}, cat),
            h('span', { class: 'muted small num' }, `${started}/${ids.length}`),
            h('div', { class: 'meter' }, h('i', { style: { width: ((cc.known + cc.mastered) / ids.length * 100) + '%' } })));
        }))),
      h('section', { class: 'panel' },
        h('h2', {}, 'Words to work on'),
        weak.length ? h('div', { class: 'wlist', style: { boxShadow: 'none' } }, weak.map(listItem))
          : h('p', { class: 'muted' }, 'Words you get wrong in reviews and drills show up here.'),
        weak.length ? h('button', { class: 'btn', onclick: () => go('drills', { pool: 'weak' }) }, 'Drill these words') : null)));

    view.append(SettingsPanel());
  }

  function SettingsPanel() {
    const voiceSel = h('select', { id: 'set-voice', onchange: e => { Speech.setVoice(e.target.value); Speech.speak('Guten Tag! Ich heiße Anna.'); } });
    const fillVoices = () => {
      voiceSel.replaceChildren(...(Speech.voices.length ? Speech.voices.map(v => h('option', { value: v.name, selected: Speech.voice && v.name === Speech.voice.name }, `${v.name} (${v.lang})`))
        : [h('option', {}, 'No German voice found on this device')]));
    };
    fillVoices();
    document.addEventListener('voices-ready', fillVoices);
    const backup = h('textarea', { id: 'set-backup', placeholder: 'Paste a backup here to restore it', 'aria-label': 'Progress backup' });
    return h('details', { class: 'panel' },
      h('summary', { style: { cursor: 'pointer' } }, h('h2', { style: { display: 'inline' } }, 'Settings & backup')),
      h('div', { class: 'grid-2' },
        h('div', { class: 'field' }, h('label', { for: 'set-voice' }, 'German voice'), voiceSel,
          h('span', { class: 'muted small' }, 'In Chrome, "Google Deutsch" sounds most natural. On iPhone, add a German voice in Settings > Accessibility > Spoken Content.')),
        h('div', { class: 'field' }, h('label', { for: 'set-rate' }, 'Speaking speed'),
          h('select', { id: 'set-rate', onchange: e => { Settings.set('rateScale', +e.target.value); Speech.speak('Das ist die normale Geschwindigkeit.'); } },
            [['0.85', 'Slower'], ['1', 'Normal'], ['1.15', 'Faster']].map(([v, l]) => h('option', { value: v, selected: String(Settings.get('rateScale') || 1) === v }, l)))),
        h('div', { class: 'field' }, h('label', { for: 'set-new' }, 'New words per day'),
          h('input', { id: 'set-new', type: 'number', min: 1, max: 50, value: Settings.get('newPerDay') || 10, onchange: e => Settings.set('newPerDay', Math.max(1, Math.min(50, +e.target.value || 10))) })),
        h('div', { class: 'field' }, h('label', { for: 'set-from' }, 'New words come from'),
          h('select', { id: 'set-from', onchange: e => Settings.set('newFrom', e.target.value) },
            [['mixed', 'Both lists, alternating'], ['sg', 'StudyGerman A1 list first'], ['goethe', 'Goethe A1 list (exam words) first']].map(([v, l]) => h('option', { value: v, selected: (Settings.get('newFrom') || 'mixed') === v }, l)))),
        h('div', { class: 'field' }, h('label', { for: 'set-front' }, 'Review cards show'),
          h('select', { id: 'set-front', onchange: e => Settings.set('front', e.target.value) },
            [['mixed', 'Mix of English and audio'], ['en', 'English (you produce German)'], ['audio', 'Audio only (you recognise German)']].map(([v, l]) => h('option', { value: v, selected: Settings.get('front') === v }, l))))),
      h('div', { class: 'grid-2' },
        h('div', { class: 'field' }, h('label', { for: 'set-gemini' }, 'Google Gemini API key (optional)'),
          h('input', { id: 'set-gemini', type: 'password', autocomplete: 'off', placeholder: 'Paste your free key', value: Settings.get('geminiKey') || '', onchange: e => { Settings.set('geminiKey', e.target.value.trim()); toast(e.target.value.trim() ? 'Tutor feedback turned on' : 'Tutor feedback turned off'); } }),
          h('span', { class: 'muted small' }, 'Adds tutor feedback and replies in the conversation drills. Get a free key at aistudio.google.com/apikey. It is stored only in this browser.')),
        h('div', { class: 'field' }, h('label', { for: 'set-model' }, 'Gemini model'),
          h('input', { id: 'set-model', type: 'text', autocomplete: 'off', value: Settings.get('geminiModel') || 'gemini-flash-latest', onchange: e => Settings.set('geminiModel', e.target.value.trim() || 'gemini-flash-latest') }),
          h('span', { class: 'muted small' }, 'Leave as is unless Google renames its models.'))),
      h('label', { class: 'check' }, h('input', { type: 'checkbox', id: 'set-lt', checked: Settings.get('languageTool') !== false, onchange: e => Settings.set('languageTool', e.target.checked) }), 'Check grammar online with LanguageTool (free; your text is sent to languagetool.org)'),
      h('label', { class: 'check' }, h('input', { type: 'checkbox', id: 'set-art', checked: Settings.get('requireArticle') !== false, onchange: e => Settings.set('requireArticle', e.target.checked) }), 'Require the article (der/die/das) when writing or speaking nouns'),
      h('div', { class: 'notice' },
        Speech.canListen ? 'Speech recognition is available in this browser. Allow microphone access when asked.'
          : 'This browser has no speech recognition (Firefox, or an embedded view). Speaking drills fall back to self-check. Use Chrome, Edge or Safari for automatic checking.'),
      h('div', { class: 'field' },
        h('label', { for: 'set-backup' }, 'Backup'),
        h('span', { class: 'muted small' }, 'Progress is saved in this browser only. Copy a backup to move it to another device.'),
        backup,
        h('div', { class: 'row' },
          h('button', { class: 'btn', onclick: () => { backup.value = Progress.exportJSON(); backup.select(); navigator.clipboard?.writeText(backup.value).then(() => toast('Backup copied'), () => toast('Backup selected; copy it manually')); } }, 'Copy backup'),
          h('button', { class: 'btn', onclick: () => { try { Progress.importJSON(backup.value); toast('Progress restored'); go('home'); } catch (e) { toast(e.message || 'That backup could not be read.'); } } }, 'Restore from backup'))));
  }

  // ---------- WORDS ----------
  function listItem(w) {
    return h('div', { class: 'witem' },
      h('button', { class: 'open', onclick: () => openWord(w.id) },
        h('span', { class: 'de' }, h('span', { class: 'n' }, w.id), wordEl(w)),
        h('span', { class: 'en' }, w.en)),
      h('div', { class: 'row', style: { flexWrap: 'nowrap', gap: '6px' } }, statusPill(w.id), speakBtn(w.de)));
  }

  function Words(arg = {}) {
    let cat = arg.cat || 'All', q = '', art = 'all', src = 'all';
    const list = h('div', { class: 'wlist' });
    const count = h('span', { class: 'muted small num' });
    const render = () => {
      const qq = Lang.fold(q);
      const typeOk = w => art === 'all' || (['der', 'die', 'das'].includes(art) ? w.art === art && !w.plOnly : w.type === art);
      const items = V.filter(w => (cat === 'All' || w.cat === cat) && typeOk(w) && (src === 'all' || inList(w, src)) &&
        (!qq || Lang.fold(w.de).includes(qq) || w.en.toLowerCase().includes(q.toLowerCase())));
      count.textContent = `${items.length} word${items.length === 1 ? '' : 's'}`;
      list.replaceChildren(...(items.length ? items.map(listItem) : [h('p', { class: 'muted', style: { padding: '16px' } }, 'No words match. Try English or German, e.g. "house" or "Haus".')]));
    };
    const chip = (label, active, onclick) => h('button', { class: 'chip', 'aria-pressed': String(active), onclick }, label);
    const catChips = h('div', { class: 'chips', role: 'group', 'aria-label': 'Topic' });
    const artChips = h('div', { class: 'chips', role: 'group', 'aria-label': 'Word type' });
    const srcChips = h('div', { class: 'chips', role: 'group', 'aria-label': 'Word list' });
    const renderChips = () => {
      catChips.replaceChildren(...['All', ...CATEGORIES].map(c => chip(c, c === cat, () => { cat = c; renderChips(); render(); })));
      srcChips.replaceChildren(...[['all', 'Both lists'], ['sg', 'StudyGerman A1'], ['goethe', 'Goethe A1']].map(([v, l]) => chip(l, v === src, () => { src = v; renderChips(); render(); })));
      artChips.replaceChildren(...[['all', 'All types'], ['der', 'der'], ['die', 'die'], ['das', 'das'], ['verb', 'Verbs'], ['adj', 'Adjectives'], ['phrase', 'Phrases']].map(([v, l]) => {
        const b = chip(l, v === art, () => { art = v; renderChips(); render(); });
        if (['der', 'die', 'das'].includes(v)) b.classList.add('g-' + v), b.style.color = 'var(--g)';
        return b;
      }));
    };
    renderChips();
    view.append(
      h('div', { class: 'row between' }, h('h1', {}, `All ${V.length} words`), count),
      h('div', { class: 'filters' },
        h('input', { class: 'search', id: 'word-search', type: 'search', placeholder: 'Search German or English…', 'aria-label': 'Search words', oninput: e => { q = e.target.value.trim(); render(); } }),
        srcChips, catChips, artChips),
      list);
    render();
  }

  // ---------- REVIEW (spaced repetition) ----------
  function Review() {
    const queue = [
      ...Progress.dueIds().map(id => ({ id, kind: 'card' })),
      ...newQueue().map(id => ({ id, kind: 'intro' })),
    ];
    const total = queue.length;
    let done = 0, again = 0;
    const wrap = h('div', { class: 'stack', style: { gap: '16px' } });
    const bar = h('i', { style: { width: '0%' } });
    const label = h('span', { class: 'muted small num' });
    view.append(h('div', { class: 'row between' }, h('h1', {}, 'Review'), label), h('div', { class: 'progress-line' }, bar), wrap);

    if (!total) {
      wrap.append(h('div', { class: 'panel' },
        h('h2', {}, 'Nothing due right now'),
        h('p', { class: 'muted' }, 'You have finished today\'s reviews and new words. Drills are a good way to keep practising, or raise "New words per day" in Settings.'),
        h('div', { class: 'row' },
          h('button', { class: 'btn gold', onclick: () => go('drills') }, 'Go to drills'),
          h('button', { class: 'btn', onclick: () => { Settings.set('newPerDay', (Settings.get('newPerDay') || 10) + 5); go('review'); } }, 'Learn 5 more words'))));
      return;
    }

    const next = () => {
      label.textContent = `${Math.min(done + 1, total)} of ${total}${again ? ` · ${again} to repeat` : ''}`;
      bar.style.width = (done / total * 100) + '%';
      const item = queue.shift();
      if (!item) return finish();
      wrap.replaceChildren(item.kind === 'intro' ? intro(item) : card(item));
      window.scrollTo(0, 0);
    };
    const finish = () => {
      bar.style.width = '100%';
      label.textContent = 'Done';
      wrap.replaceChildren(h('div', { class: 'panel' },
        h('h2', {}, 'Session complete'),
        h('p', {}, `You practised ${total} card${total === 1 ? '' : 's'}.`),
        h('p', { class: 'muted' }, 'Now train your ears and mouth: the listening and speaking drills use the words you just studied.'),
        h('div', { class: 'row' },
          h('button', { class: 'btn gold', onclick: () => go('drills', { start: 'listen' }) }, 'Listening drill'),
          h('button', { class: 'btn', onclick: () => go('drills', { start: 'speak' }) }, 'Speaking drill'),
          h('button', { class: 'btn ghost', onclick: () => go('home') }, 'Back to Today'))));
      renderStreak();
    };

    function intro(item) {
      const w = byId[item.id];
      setTimeout(() => Speech.speak(w.de), 150);
      return h('div', { class: 'stack', style: { gap: '14px' } },
        h('span', { class: 'eyebrow', style: { color: 'var(--accent-ink)' } }, 'New word · listen, repeat out loud twice'),
        wordCard(w),
        h('button', { class: 'btn primary big wide', onclick: () => {
          // Quiz the new word again after a few cards.
          queue.splice(Math.min(3, queue.length), 0, { id: item.id, kind: 'card', fresh: true });
          next();
        } }, 'Got it, quiz me'));
    }

    function card(item) {
      const w = byId[item.id];
      const s = Progress.state(w.id);
      let mode = Settings.get('front') || 'mixed';
      if (mode === 'mixed') mode = (!s || s.reps < 1 || Math.random() < 0.5) ? 'en' : 'audio';
      const box = h('div', { class: `card ${w.art ? 'gendered ' + gclass(w) : ''}` });
      const front = h('div', { class: 'stack' });
      const heard = h('div', {});
      if (mode === 'audio') {
        front.append(h('div', { class: 'listen-hero' },
          h('button', { class: 'play-big', 'aria-label': 'Play the word', onclick: () => Speech.speak(w.de) }, icon('play')),
          h('p', { class: 'front-hint' }, 'What does this mean? Say the English meaning to yourself.'),
          h('button', { class: 'btn ghost', onclick: () => Speech.speak(w.de, { speed: 'slow' }) }, icon('slow'), 'Slower')));
        setTimeout(() => Speech.speak(w.de), 200);
      } else {
        front.append(
          h('p', { class: 'front-prompt' }, w.en),
          h('p', { class: 'front-hint' }, w.type === 'noun' ? 'Say the German word with its article' : 'Say the German word'),
          Speech.canListen ? h('button', { class: 'btn', style: { justifySelf: 'center' }, onclick: async e => {
            const b = e.currentTarget; b.disabled = true; b.textContent = 'Listening…';
            const r = await Speech.listen();
            const res = judgeSpoken(w, r);
            Progress.skill(w.id, 'speak', res.level === 'ok');
            heard.replaceChildren(res.el);
            reveal();
          } }, icon('mic'), 'Answer by speaking') : null,
          heard);
      }
      const showBtn = h('button', { class: 'btn primary big wide', onclick: () => reveal() }, 'Show answer');
      const grades = h('div', { class: 'grades' },
        [[0, 'Again', 'forgot', 'again'], [1, 'Hard', 'barely', ''], [2, 'Good', 'knew it', 'good'], [3, 'Easy', 'instantly', '']].map(([g, l, sub, cls]) =>
          h('button', { class: 'btn ' + cls, onclick: () => {
            Progress.grade(w.id, g);
            if (g === 0) { again++; queue.splice(Math.min(4, queue.length), 0, { id: w.id, kind: 'card' }); }
            else done++;
            next();
          } }, l, h('small', {}, sub))));
      grades.hidden = true;
      let revealed = false;
      function reveal() {
        if (revealed) return; revealed = true;
        showBtn.hidden = true; grades.hidden = false;
        front.after(h('hr', { style: { border: 0, borderTop: '1px solid var(--line)', margin: 0, width: '100%' } }), wordCard(w, { compact: true }));
        if (mode === 'audio') front.querySelector('.front-hint').textContent = w.en;
        Speech.speak(w.de);
        heard.parentNode && box.append(heard);
      }
      box.append(h('span', { class: 'eyebrow' }, mode === 'audio' ? 'Listen' : 'Recall', item.fresh ? ' · new' : ''), front);
      return h('div', { class: 'stack', style: { gap: '14px' } }, box, showBtn, grades);
    }
    next();
  }

  // Compare speech-recognition alternatives to a word.
  function judgeSpoken(w, r) {
    if (!r.ok) {
      const msg = { 'not-allowed': 'Microphone access was blocked. Allow it in the browser settings.', unsupported: 'Speech recognition is not available in this browser.', 'no-speech': 'I did not hear anything. Tap and speak right away.', network: 'Speech recognition needs an internet connection.' }[r.error] || 'Could not recognise speech (' + r.error + ').';
      return { level: 'bad', el: h('div', { class: 'feedback close' }, msg) };
    }
    const needArt = w.art && Settings.get('requireArticle') !== false;
    const target = needArt ? w.de : (w.noun || w.de);
    let best = '', score = 0;
    for (const alt of r.alternatives) {
      const f = Lang.fold(alt), t = Lang.fold(target);
      const sc = (` ${f} `).includes(` ${t} `) ? 1 : Lang.similarity(alt, target);
      if (sc > score) { score = sc; best = alt; }
    }
    let nounOnly = false;
    if (w.art && score < 0.85) {
      nounOnly = r.alternatives.some(a => (` ${Lang.fold(a)} `).includes(` ${Lang.fold(w.noun)} `));
    }
    const level = score >= 0.85 ? 'ok' : nounOnly || score >= 0.6 ? 'close' : 'bad';
    const text = level === 'ok' ? 'Great pronunciation!' : nounOnly ? `Right word. Now add the article: ${w.de}` : level === 'close' ? 'Almost. Listen and try again.' : 'Not quite. Listen to the model and try again.';
    return {
      level, el: h('div', { class: 'feedback ' + level },
        text,
        h('span', { class: 'detail' }, 'Heard: "', best || r.alternatives[0] || '…', '"'))
    };
  }

  // ---------- DRILLS ----------
  const DRILLS = [
    { key: 'article', title: 'der, die, das', desc: 'Pick the right article for each noun. Colour and rule hints help it stick.', skill: 'article' },
    { key: 'listen', title: 'Hear it', desc: 'Listen to German and choose what it means. Words or full sentences.', skill: 'listen' },
    { key: 'dictation', title: 'Dictation', desc: 'Write what you hear, with umlauts. Trains spelling and listening.', skill: 'write' },
    { key: 'speak', title: 'Say it', desc: 'Speak the German word; speech recognition checks you. Or shadow full sentences.', skill: 'speak' },
    { key: 'gap', title: 'Fill the gap', desc: 'Complete the example sentence with the right word.', skill: 'use' },
    { key: 'build', title: 'Build the sentence', desc: 'Put the words in the right order. Learn German word order.', skill: 'use' },
    { key: 'answer', group: 'talk', title: 'Answer questions', desc: 'Hear a question in German and answer it by speaking or typing. Your answer is checked.' },
    { key: 'ask', group: 'talk', title: 'Ask questions', desc: 'Turn a situation into a German question. Get word order right and hear the reply.' },
    { key: 'sentence', group: 'talk', title: 'Make sentences', desc: 'Use two of your words in your own sentence. Articles and grammar are checked.' },
    { key: 'story', group: 'talk', title: 'Tell a story', desc: 'Use 5–6 words in a short story of three or more sentences, spoken or written.' },
    { key: 'a2', group: 'a2', title: 'Articles in A2 sentences', desc: 'der/den/dem/des, ein/einen/einem… Choose the article the case needs. Read or listen.' },
  ];

  function poolFor(choice) {
    let ids;
    if (choice === 'weak') ids = V.filter(w => Progress.weakness(w.id) > 0).map(w => w.id);
    else if (choice === 'learning') ids = V.filter(w => Progress.state(w.id)).map(w => w.id);
    else if (choice === 'all') ids = V.map(w => w.id);
    else if (choice.startsWith('list:')) ids = V.filter(w => inList(w, choice.slice(5))).map(w => w.id);
    else ids = V.filter(w => w.cat === choice).map(w => w.id);
    return ids.map(id => byId[id]);
  }

  function Drills(arg = {}) {
    let pool = arg.pool || (V.some(w => Progress.state(w.id)) ? 'learning' : CATEGORIES[0]);
    const learningCount = V.filter(w => Progress.state(w.id)).length;
    const weakCount = V.filter(w => Progress.weakness(w.id) > 0).length;
    const sel = h('select', { id: 'drill-pool', onchange: e => { pool = e.target.value; } },
      learningCount ? h('option', { value: 'learning', selected: pool === 'learning' }, `Words I have started (${learningCount})`) : null,
      weakCount ? h('option', { value: 'weak', selected: pool === 'weak' }, `Words to work on (${weakCount})`) : null,
      h('option', { value: 'all', selected: pool === 'all' }, `All ${V.length} words`),
      h('option', { value: 'list:sg', selected: pool === 'list:sg' }, `StudyGerman A1 list (${V.filter(w => inList(w, 'sg')).length})`),
      h('option', { value: 'list:goethe', selected: pool === 'list:goethe' }, `Goethe A1 list (${V.filter(w => inList(w, 'goethe')).length})`),
      CATEGORIES.map(c => h('option', { value: c, selected: pool === c }, `Topic: ${c}`)));
    view.append(
      h('div', { class: 'stack', style: { gap: '6px' } }, h('h1', {}, 'Drills'), h('p', { class: 'muted' }, 'Ten quick questions per round. Mistakes come back in your reviews.')),
      h('div', { class: 'field', style: { maxWidth: '420px' } }, h('label', { for: 'drill-pool' }, 'Practise with'), sel),
      ...[['words', 'Words'], ['talk', 'Speak & write: checked by the app'], ['a2', 'A2 level']].map(([grp, name]) => h('section', { class: 'stack' },
        h('h2', {}, name),
        h('div', { class: 'grid-2' }, DRILLS.filter(d => (d.group || 'words') === grp).map(d => h('button', { class: 'drill-card', onclick: () => runDrill(d.key, pool) },
          h('span', { class: 'glyph' }, d.title),
          h('span', { class: 'muted' }, d.desc)))))));
    if (arg.start) runDrill(arg.start, pool);
  }

  function runDrill(key, poolChoice) {
    const d = DRILLS.find(x => x.key === key);
    if (window.TalkDrills?.[key]) {
      if (cleanup) { cleanup(); cleanup = null; }
      Speech.canSpeak && speechSynthesis.cancel();
      view.replaceChildren();
      window.scrollTo(0, 0);
      return TalkDrills[key](poolChoice, poolFor(poolChoice));
    }
    let pool = poolFor(poolChoice);
    if (key === 'article') pool = pool.filter(w => w.art && !w.plOnly);
    if (key === 'gap') pool = pool.filter(w => gapFor(w));
    if (pool.length < 4) {
      const extra = (key === 'article' ? V.filter(w => w.art && !w.plOnly) : V).filter(w => !pool.includes(w) && (key !== 'gap' || gapFor(w)));
      pool = pool.concat(extra.slice(0, 10 - pool.length));
      toast('Added some words so there are enough for a round');
    }
    // Weak words first, then random.
    const round = shuffle(pool).sort((a, b) => Progress.weakness(b.id) - Progress.weakness(a.id) + (Math.random() - 0.5) * 2).slice(0, 10);
    let i = 0, score = 0;
    const mistakes = [];
    let sub = key === 'listen' || key === 'speak' ? 'words' : null;

    view.replaceChildren();
    const bar = h('i', { style: { width: '0%' } });
    const label = h('span', { class: 'muted small num' });
    const stage = h('div', { class: 'stack', style: { gap: '14px' } });
    const header = h('div', { class: 'row between' },
      h('div', { class: 'row' }, h('button', { class: 'btn ghost', onclick: () => go('drills', { pool: poolChoice }) }, '← Drills'), h('h1', { style: { fontSize: '1.5rem' } }, d.title)),
      label);
    view.append(header);
    if (sub) {
      const seg = h('div', { class: 'seg', role: 'group', 'aria-label': 'Mode' });
      const opts = key === 'listen' ? [['words', 'Words'], ['sentences', 'Sentences'], ['fast', 'Fast speech']] : [['words', 'Words'], ['shadow', 'Shadow sentences']];
      const paint = () => seg.replaceChildren(...opts.map(([v, l]) => h('button', { 'aria-pressed': String(sub === v), onclick: () => { sub = v; paint(); ask(); } }, l)));
      paint();
      view.append(seg);
    }
    view.append(h('div', { class: 'progress-line' }, bar), stage);

    const record = (w, ok) => { Progress.skill(w.id, d.skill, ok); if (ok) score++; else mistakes.push(w); };
    const nextBtn = () => h('button', { class: 'btn primary big wide', onclick: advance, id: 'next-btn' }, i + 1 >= round.length ? 'See results' : 'Next');
    function advance() { i++; ask(); }

    function ask() {
      if (cleanup) { cleanup(); cleanup = null; }
      bar.style.width = (i / round.length * 100) + '%';
      label.textContent = `${Math.min(i + 1, round.length)} / ${round.length} · ${score} correct`;
      if (i >= round.length) return results();
      const w = round[i];
      stage.replaceChildren(({ article: askArticle, listen: askListen, dictation: askDictation, speak: askSpeak, gap: askGap, build: askBuild })[key](w));
      stage.querySelector('input')?.focus();
    }

    function results() {
      bar.style.width = '100%';
      label.textContent = `${score} / ${round.length}`;
      stage.replaceChildren(h('div', { class: 'panel' },
        h('h2', {}, score === round.length ? 'Perfect round!' : `${score} of ${round.length} correct`),
        mistakes.length ? h('p', { class: 'muted' }, 'Review these. They will also come back sooner in your reviews.') : h('p', { class: 'muted' }, 'Every answer right. Try a harder mode or another drill.'),
        mistakes.length ? h('div', { class: 'wlist', style: { boxShadow: 'none' } }, [...new Set(mistakes)].map(listItem)) : null,
        h('div', { class: 'row' },
          h('button', { class: 'btn gold', onclick: () => runDrill(key, poolChoice) }, 'Another round'),
          h('button', { class: 'btn', onclick: () => go('drills', { pool: poolChoice }) }, 'Other drills'))));
      renderStreak();
    }

    // --- der/die/das
    function askArticle(w) {
      const fb = h('div', {});
      const buttons = ['der', 'die', 'das'].map(a => h('button', { class: `art-btn g-${a}`, onclick: () => pick(a) }, a));
      let answered = false;
      function pick(a) {
        if (answered) return; answered = true;
        const ok = a === w.art;
        record(w, ok);
        buttons.forEach(b => { if (b.textContent !== w.art) b.classList.add('dim'); });
        Speech.speak(w.de);
        const rule = Lang.articleRule(w);
        fb.replaceChildren(h('div', { class: `feedback ${ok ? 'ok' : 'bad'} ${gclass(w)}` },
          ok ? 'Richtig!' : `It's ${w.de}`,
          h('span', { class: 'detail' }, wordEl(w), w.pl ? ` · plural: die ${w.pl}` : ''),
          rule ? h('span', { class: 'detail' }, rule) : null));
        if (ok) setTimeout(() => { if (stage.contains(fb)) advance(); }, 1300); else fb.append(nextBtn());
      }
      const keys = e => { const m = { 1: 'der', 2: 'die', 3: 'das', r: 'der', e: 'die', s: 'das' }[e.key]; if (m && !e.target.matches('input')) pick(m); };
      document.addEventListener('keydown', keys);
      cleanup = () => document.removeEventListener('keydown', keys);
      const card = h('div', { class: 'card' },
        h('p', { class: 'front-prompt', style: { paddingTop: '8px' } }, w.noun),
        h('p', { class: 'front-hint' }, w.en),
        h('div', { class: 'art-buttons' }, buttons));
      return h('div', { class: 'stack' }, card, fb);
    }

    // --- listening multiple choice
    function askListen(w) {
      const sentence = sub === 'sentences';
      const speed = sub === 'fast' ? 'fast' : 'normal';
      const text = sentence ? w.ex : w.de;
      const same = V.filter(x => x.type === w.type && x.id !== w.id && x.en !== w.en);
      const choices = shuffle([w, ...sample(same, 3)]);
      const fb = h('div', {});
      let answered = false;
      const opts = choices.map(c => h('button', { class: 'btn opt', onclick: e => {
        if (answered) return; answered = true;
        const ok = c === w;
        record(w, ok);
        e.currentTarget.classList.add(ok ? 'correct' : 'wrong');
        opts[choices.indexOf(w)].classList.add('correct');
        fb.replaceChildren(h('div', { class: `feedback ${ok ? 'ok' : 'bad'}` }, ok ? 'Richtig!' : 'Not this time.',
          h('span', { class: 'detail' }, wordEl(w), ` = ${w.en}`),
          sentence ? h('span', { class: 'detail' }, w.ex) : null,
          h('div', { class: 'row' }, speakBtn(text), speakBtn(text, { slow: true }))), nextBtn());
      } }, sentence ? c.exEn : c.en));
      setTimeout(() => Speech.speak(text, { speed }), 250);
      return h('div', { class: 'stack' },
        h('div', { class: 'card' },
          h('div', { class: 'listen-hero' },
            h('button', { class: 'play-big', 'aria-label': 'Play again', onclick: () => Speech.speak(text, { speed }) }, icon('play')),
            h('button', { class: 'btn ghost', onclick: () => Speech.speak(text, { speed: 'slow' }) }, icon('slow'), 'Slower'),
            h('p', { class: 'front-hint' }, sentence ? 'What does the sentence mean?' : 'What does this word mean?'))),
        h('div', { class: 'options' }, opts), fb);
    }

    // --- dictation
    function askDictation(w) {
      const needArt = w.art && Settings.get('requireArticle') !== false;
      const input = h('input', { class: 'answer-input', id: 'dict-input', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', lang: 'de', placeholder: needArt ? 'Article + word, e.g. der Tisch' : 'Type what you hear' });
      const fb = h('div', {});
      let answered = false;
      const check = () => {
        if (answered) return;
        const v = input.value.trim(); if (!v) return;
        answered = true;
        const target = needArt ? w.de : (w.noun || w.de);
        const exact = v.replace(/[.!?]$/, '') === target;
        const folded = Lang.fold(v) === Lang.fold(target);
        const dist = Lang.lev(Lang.fold(v), Lang.fold(target));
        const ok = exact || folded;
        record(w, ok);
        let note = '';
        if (!exact && folded) {
          if (v.toLowerCase() === target.toLowerCase()) note = 'Watch the capital letters: German nouns always start with a capital.';
          else note = 'Accepted. The exact spelling is ' + target + '.';
        }
        const artWrong = w.art && needArt && !ok && Lang.fold(v).endsWith(Lang.fold(w.noun)) && !Lang.fold(v).startsWith(w.art);
        fb.replaceChildren(h('div', { class: `feedback ${ok ? 'ok' : dist <= 2 ? 'close' : 'bad'} ${gclass(w)}` },
          ok ? 'Richtig!' : artWrong ? 'Word right, article wrong.' : dist <= 2 ? 'Close. Check the spelling.' : 'Not quite.',
          h('span', { class: 'detail' }, wordEl(w), ` = ${w.en}`),
          note ? h('span', { class: 'detail' }, note) : null), nextBtn());
        input.disabled = true;
        fb.querySelector('#next-btn')?.focus();
        Speech.speak(w.de);
      };
      input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); answered ? advance() : check(); } });
      setTimeout(() => Speech.speak(w.de), 250);
      const ins = ch => { const s = input.selectionStart ?? input.value.length; input.value = input.value.slice(0, s) + ch + input.value.slice(input.selectionEnd ?? s); input.focus(); input.setSelectionRange(s + 1, s + 1); };
      return h('div', { class: 'stack' },
        h('div', { class: 'card' },
          h('div', { class: 'listen-hero' },
            h('button', { class: 'play-big', 'aria-label': 'Play again', onclick: () => Speech.speak(w.de) }, icon('play')),
            h('button', { class: 'btn ghost', onclick: () => Speech.speak(w.de, { speed: 'slow' }) }, icon('slow'), 'Slower')),
          input,
          h('div', { class: 'row between' },
            h('div', { class: 'umlauts' }, ['ä', 'ö', 'ü', 'ß'].map(c => h('button', { type: 'button', onclick: () => ins(c), 'aria-label': 'Insert ' + c }, c))),
            h('button', { class: 'btn primary', onclick: check }, 'Check'))),
        fb);
    }

    // --- speaking
    function askSpeak(w) {
      const shadow = sub === 'shadow';
      const fb = h('div', {});
      const mic = h('button', { class: 'mic', 'aria-label': 'Start speaking' }, icon('mic'));
      let answered = false;
      const done = ok => { if (answered) return; answered = true; record(w, ok); fb.append(nextBtn()); };

      if (!Speech.canListen) {
        // Self-check fallback.
        return h('div', { class: 'stack' },
          h('div', { class: 'card' },
            h('p', { class: 'front-prompt' }, shadow ? w.ex : w.en),
            h('p', { class: 'front-hint' }, shadow ? 'Listen, then repeat it out loud.' : 'Say the German out loud, then check.'),
            h('div', { class: 'row', style: { justifyContent: 'center' } },
              h('button', { class: 'btn', onclick: () => Speech.speak(shadow ? w.ex : w.de) }, icon('play'), shadow ? 'Hear it' : 'Hear the answer'))),
          h('div', { class: 'notice' }, 'Automatic checking needs Chrome, Edge or Safari. Grade yourself honestly.'),
          h('div', { class: 'row' },
            h('button', { class: 'btn', onclick: () => { fb.replaceChildren(h('div', { class: 'feedback bad' }, wordEl(w))); done(false); } }, 'I got it wrong'),
            h('button', { class: 'btn primary', onclick: () => { fb.replaceChildren(h('div', { class: 'feedback ok' }, wordEl(w))); done(true); } }, 'I said it right')),
          fb);
      }

      mic.addEventListener('click', async () => {
        if (mic.classList.contains('live')) return;
        mic.classList.add('live'); mic.setAttribute('aria-label', 'Listening');
        const r = await Speech.listen();
        mic.classList.remove('live'); mic.setAttribute('aria-label', 'Speak again');
        if (shadow) {
          if (!r.ok) { fb.replaceChildren(judgeSpoken(w, r).el); return; }
          const target = Lang.norm(w.ex).split(' ');
          let best = null;
          for (const alt of r.alternatives) {
            const heard = new Set(Lang.fold(alt).split(' '));
            const hits = target.map(t => heard.has(Lang.fold(t)));
            const sc = hits.filter(Boolean).length / target.length;
            if (!best || sc > best.sc) best = { sc, hits, alt };
          }
          const ok = best.sc >= 0.8;
          fb.replaceChildren(h('div', { class: `feedback ${ok ? 'ok' : best.sc >= 0.5 ? 'close' : 'bad'}` },
            ok ? `Sehr gut! ${Math.round(best.sc * 100)}% of words recognised.` : `${Math.round(best.sc * 100)}% recognised. Red words need work.`,
            h('div', { class: 'heard-words' }, w.ex.split(' ').map((t, k) => h('span', { class: best.hits[k] ? 'hit' : 'miss' }, t))),
            h('span', { class: 'detail' }, `Heard: "${best.alt}"`)));
          if (ok) done(true);
          else if (!answered) fb.append(h('div', { class: 'row' }, h('button', { class: 'btn ghost', onclick: () => done(false) }, 'Skip')));
        } else {
          const res = judgeSpoken(w, r);
          fb.replaceChildren(res.el);
          if (res.level === 'ok') { Speech.speak(w.de); done(true); }
          else if (r.ok && !answered) fb.append(h('div', { class: 'row' },
            h('button', { class: 'btn', onclick: () => Speech.speak(w.de, { speed: 'slow' }) }, icon('play'), 'Hear it'),
            h('button', { class: 'btn ghost', onclick: () => { fb.append(h('p', { class: 'feedback bad' }, wordEl(w))); done(false); } }, 'Give up')));
        }
      });
      if (shadow) setTimeout(() => Speech.speak(w.ex), 250);
      return h('div', { class: 'stack' },
        h('div', { class: `card ${shadow ? '' : ''}` },
          shadow ? h('p', { class: 'sentence', style: { textAlign: 'center' } }, w.ex) : h('p', { class: 'front-prompt' }, w.en),
          h('p', { class: 'front-hint' }, shadow ? w.exEn : (w.art ? 'Say it with der, die or das' : 'Say it in German')),
          shadow ? h('div', { class: 'row', style: { justifyContent: 'center' } }, speakBtn(w.ex), speakBtn(w.ex, { slow: true })) : null,
          mic,
          h('p', { class: 'front-hint small' }, 'Tap the microphone and speak')),
        fb);
    }

    // --- gap fill
    function askGap(w) {
      const g = gapFor(w);
      const others = V.filter(x => x.id !== w.id && x.type === w.type && gapLabel(x, g.mode) !== g.label);
      const choices = shuffle([g.label, ...sample(others, 3).map(x => gapLabel(x, g.mode))]);
      const blank = h('span', { class: 'blank' }, '?');
      const fb = h('div', {});
      let answered = false;
      const opts = choices.map(c => h('button', { class: 'btn opt', onclick: e => {
        if (answered) return; answered = true;
        const ok = c === g.label;
        record(w, ok);
        e.currentTarget.classList.add(ok ? 'correct' : 'wrong');
        opts[choices.indexOf(g.label)].classList.add('correct');
        blank.textContent = g.match;
        Speech.speak(w.ex);
        fb.replaceChildren(h('div', { class: `feedback ${ok ? 'ok' : 'bad'}` }, ok ? 'Richtig!' : 'Not quite.',
          h('span', { class: 'detail' }, wordEl(w), ` = ${w.en}`)), nextBtn());
      } }, c));
      return h('div', { class: 'stack' },
        h('div', { class: 'card' },
          h('p', { class: 'sentence' }, g.before, blank, g.after),
          h('p', { class: 'muted' }, w.exEn)),
        h('div', { class: 'options' }, opts), fb);
    }

    // --- sentence builder
    function askBuild(w) {
      const words = w.ex.split(' ');
      let pool = shuffle(words.map((t, k) => ({ t, k })));
      if (words.length > 1) while (pool.map(p => p.t).join(' ') === w.ex) pool = shuffle(pool);
      const chosen = [];
      const ans = h('div', { class: 'tiles answer', 'aria-label': 'Your sentence' });
      const src = h('div', { class: 'tiles', 'aria-label': 'Word tiles' });
      const fb = h('div', {});
      let answered = false;
      const paint = () => {
        ans.replaceChildren(...chosen.map(p => h('button', { class: 'tile', onclick: () => { if (answered) return; chosen.splice(chosen.indexOf(p), 1); pool.push(p); paint(); } }, p.t)));
        src.replaceChildren(...pool.map(p => h('button', { class: 'tile', onclick: () => { if (answered) return; pool.splice(pool.indexOf(p), 1); chosen.push(p); paint(); if (!pool.length) check(); } }, p.t)));
      };
      const check = () => {
        if (answered) return; answered = true;
        const ok = chosen.map(p => p.t).join(' ') === w.ex;
        record(w, ok);
        Speech.speak(w.ex);
        fb.replaceChildren(h('div', { class: `feedback ${ok ? 'ok' : 'bad'}` }, ok ? 'Richtig!' : 'The correct order:',
          h('span', { class: 'detail', style: { fontSize: '1.1rem' } }, w.ex),
          !ok && /^(Am|Im|Heute|Gestern|Morgen|Dann|Danach|Zuerst|Zuletzt|Manchmal|Meistens|Normalerweise|Gewöhnlich|Um|In)\b/.test(w.ex)
            ? h('span', { class: 'detail' }, 'Rule: the verb is always the 2nd element. If a time word comes first, the subject moves after the verb.') : null,
          h('div', { class: 'row' }, speakBtn(w.ex), speakBtn(w.ex, { slow: true }))), nextBtn());
      };
      paint();
      return h('div', { class: 'stack' },
        h('div', { class: 'card' },
          h('p', { class: 'front-prompt', style: { fontSize: '1.4rem', padding: '8px 0 0' } }, w.exEn),
          h('p', { class: 'front-hint' }, 'Tap the words in order'),
          ans, src,
          h('div', { class: 'row between' },
            h('button', { class: 'btn ghost', onclick: () => { if (answered) return; pool = pool.concat(chosen.splice(0)); paint(); } }, 'Clear'),
            h('button', { class: 'btn primary', onclick: check }, 'Check'))),
        fb);
    }

    ask();
  }

  // Find the word inside its example sentence for the gap-fill drill.
  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const gapCache = {};
  function gapFor(w) {
    if (w.id in gapCache) return gapCache[w.id];
    let res = null;
    const B = '(?<![\\p{L}-])', E = '(?![\\p{L}-])';
    if (w.art) {
      const m = w.ex.match(new RegExp(`${B}${esc(w.art)}\\s+${esc(w.noun)}${E}`, 'iu'));
      if (m) res = { mode: 'full', index: m.index, match: m[0], label: w.de };
      else {
        const m2 = w.ex.match(new RegExp(`${B}${esc(w.noun)}${E}`, 'u'));
        if (m2) res = { mode: 'bare', index: m2.index, match: m2[0], label: w.noun };
      }
    } else {
      const m = w.ex.match(new RegExp(`${B}${esc(w.de)}${E}`, 'iu'));
      if (m) res = { mode: 'word', index: m.index, match: m[0], label: w.de };
    }
    if (res) { res.before = w.ex.slice(0, res.index); res.after = w.ex.slice(res.index + res.match.length); }
    return (gapCache[w.id] = res);
  }
  const gapLabel = (x, mode) => mode === 'full' ? x.de : mode === 'bare' ? (x.noun || x.de) : x.de;

  window.UI = { h, icon, speakBtn, wordEl, toast, shuffle, sample, go, gclass, byId, view, listItem, renderStreak, judgeSpoken, runDrill };

  // ---------- boot ----------
  const start = (location.hash || '').slice(1);
  go(['home', 'words', 'review', 'drills'].includes(start) ? start : 'home');

  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
})();
