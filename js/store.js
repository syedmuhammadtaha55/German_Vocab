// Settings, spaced-repetition progress and language helpers.
(function () {
  const KEY = 'a1-wortschatz-v1';
  const DAY = 86400000;

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (_) { return {}; }
  }
  let db = load();
  db.settings ||= { newPerDay: 10, front: 'mixed', rateScale: 1, requireArticle: true };
  db.words ||= {};      // id -> { due, ivl, ease, reps, lapses, first, skills: {article:[ok,total], listen:[..], speak:[..], write:[..], use:[..]} }
  db.days ||= {};       // 'YYYY-MM-DD' -> { reviews, newCount, correct }
  db.stats ||= {};      // drill stats not tied to one word, e.g. talk: [ok, total], a2: [ok, total]

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (_) {}
  }

  const Settings = {
    get: k => db.settings[k],
    set(k, v) { db.settings[k] = v; save(); },
  };

  const today = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  const dayRec = () => (db.days[today()] ||= { reviews: 0, newCount: 0, correct: 0 });

  function state(id) { return db.words[id]; }

  function status(id) {
    const s = db.words[id];
    if (!s) return 'new';
    if (s.ivl >= 21) return 'mastered';
    if (s.ivl >= 7) return 'known';
    return 'learning';
  }

  // SM-2 style scheduler. grade: 0 again, 1 hard, 2 good, 3 easy
  function grade(id, g) {
    const now = Date.now();
    let s = db.words[id];
    const isNew = !s;
    if (!s) s = db.words[id] = { ivl: 0, ease: 2.5, reps: 0, lapses: 0, first: now, due: now, skills: {} };
    if (g === 0) {
      s.lapses++; s.reps = 0; s.ivl = 0; s.ease = Math.max(1.3, s.ease - 0.2);
      s.due = now + 60 * 1000;
    } else {
      if (s.reps === 0) s.ivl = g === 3 ? 4 : g === 2 ? 1 : 0.5;
      else if (s.reps === 1 && s.ivl < 3) s.ivl = g === 3 ? 6 : g === 2 ? 3 : 1.2;
      else s.ivl = s.ivl * (g === 1 ? 1.2 : g === 2 ? s.ease : s.ease * 1.3);
      if (g === 1) s.ease = Math.max(1.3, s.ease - 0.15);
      if (g === 3) s.ease += 0.15;
      s.reps++;
      s.due = now + s.ivl * DAY;
    }
    const d = dayRec();
    d.reviews++;
    if (g > 0) d.correct++;
    if (isNew) d.newCount++;
    save();
  }

  // Record a drill result for a skill (does not reschedule, but a wrong answer
  // on a known word pulls it forward so it comes back in Review soon).
  function skill(id, name, ok) {
    let s = db.words[id];
    if (!s) s = db.words[id] = { ivl: 0, ease: 2.5, reps: 0, lapses: 0, first: Date.now(), due: Date.now(), skills: {} };
    const k = (s.skills[name] ||= [0, 0]);
    k[1]++; if (ok) k[0]++;
    if (!ok && s.reps > 0) s.due = Math.min(s.due, Date.now() + DAY / 2);
    const d = dayRec();
    d.drills = (d.drills || 0) + 1;
    save();
  }

  function weakness(id) {
    const s = db.words[id];
    if (!s) return 0;
    let w = s.lapses;
    for (const [ok, tot] of Object.values(s.skills || {})) w += (tot - ok) * 1.5 - ok * 0.2;
    return w;
  }

  function dueIds() {
    const now = Date.now();
    return Object.entries(db.words)
      .filter(([, s]) => s.due <= now)
      .sort((a, b) => a[1].due - b[1].due)
      .map(([id]) => +id);
  }

  function newToday() { return dayRec().newCount; }

  function streak() {
    let n = 0;
    const d = new Date();
    const key = x => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
    if (!db.days[key(d)]) d.setDate(d.getDate() - 1);
    while (db.days[key(d)]) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }

  function reset(id) { delete db.words[id]; save(); }
  function markKnown(id) {
    db.words[id] = { ivl: 21, ease: 2.6, reps: 3, lapses: 0, first: Date.now(), due: Date.now() + 21 * DAY, skills: (db.words[id] || {}).skills || {} };
    save();
  }

  function stat(name, ok) {
    const k = (db.stats[name] ||= [0, 0]);
    k[1]++; if (ok) k[0]++;
    const d = dayRec();
    d.drills = (d.drills || 0) + 1;
    save();
  }

  function exportJSON() { return JSON.stringify(db); }
  function importJSON(text) {
    const d = JSON.parse(text);
    if (!d || typeof d !== 'object' || !d.words) throw new Error('This does not look like a progress backup.');
    db = d; db.settings ||= {}; db.days ||= {}; db.stats ||= {}; save();
  }

  window.Settings = Settings;
  window.Progress = { grade, skill, stat, get stats() { return db.stats; }, status, state, dueIds, newToday, streak, weakness, reset, markKnown, exportJSON, importJSON, get days() { return db.days; } };

  // ---------- Language helpers ----------
  const norm = s => s.toLowerCase()
    .replace(/[.,!?;:"„“”'’()\-–]/g, ' ')
    .replace(/ß/g, 'ss')
    .replace(/\s+/g, ' ').trim();
  // Also fold umlaut spellings so "ae" == "ä" when typing without German keys.
  const fold = s => norm(s).replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue');

  function lev(a, b) {
    const m = a.length, n = b.length;
    if (!m) return n; if (!n) return m;
    let prev = Array.from({ length: n + 1 }, (_, j) => j);
    for (let i = 1; i <= m; i++) {
      const cur = [i];
      for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = cur;
    }
    return prev[n];
  }
  const similarity = (a, b) => { a = fold(a); b = fold(b); return 1 - lev(a, b) / Math.max(a.length, b.length, 1); };

  // Plain-English pronunciation hints derived from German spelling rules.
  const RULES = [
    [/sch/i, 'sch', 'like English "sh" (Schule = SHOO-luh)'],
    [/^(sp|st)/i, 'sp/st at the start', 'say "shp" / "sht" (Straße = SHTRAH-seh)'],
    [/tsch/i, 'tsch', 'like "ch" in "church"'],
    [/[aou]ch/i, 'ch after a/o/u', 'rough sound from the back of the throat, like Scottish "loch"'],
    [/([eiäöüly]|[lnr])ch/i, 'ch after e/i/ä/ö/ü', 'soft hiss: say "h" in "huge" with more air (ich)'],
    [/ig\b/i, '-ig at the end', 'sounds like "-ich" (richtig = RICH-tich)'],
    [/ei/i, 'ei', 'like English "eye" (Stein, drei)'],
    [/ie/i, 'ie', 'long "ee" as in "see"'],
    [/(eu|äu)/i, 'eu / äu', 'like "oy" in "boy"'],
    [/au/i, 'au', 'like "ow" in "how"'],
    [/ä/i, 'ä', 'like "e" in "bed" (long: "air" without the r)'],
    [/ö/i, 'ö', 'say "ay" and round your lips as if for "o"'],
    [/ü/i, 'ü', 'say "ee" and round your lips as if for "oo"'],
    [/ß/, 'ß', 'a sharp "ss"'],
    [/w/i, 'w', 'like English "v" (Wasser = VAH-ser)'],
    [/v/i, 'v', 'usually like English "f" (Vater = FAH-ter)'],
    [/z/i, 'z', 'like "ts" in "cats" (Zeit = TSITE)'],
    [/j/i, 'j', 'like English "y" (Jahr = YAR)'],
    [/qu/i, 'qu', 'like "kv"'],
    [/pf/i, 'pf', 'say both: p + f together'],
    [/th/i, 'th', 'just "t", no English th'],
    [/[aeiouäöü]h/i, 'vowel + h', 'the h is silent and makes the vowel long'],
    [/r/i, 'r', 'soft gargle at the back of the throat; at a word\'s end it fades to "uh"'],
    [/er\b/i, '-er at the end', 'sounds like a short "uh" (Vater = FAH-tuh)'],
    [/[^aeiouäöü\s]e\b/i, '-e at the end', 'always pronounced, a short "uh" (Katze = KAT-suh)'],
    [/[bdg]\b/i, 'final b / d / g', 'become p / t / k at the end of a word (Hund = HOONT)'],
    [/(^|[^sß])s[aeiouäöü]/i, 's before a vowel', 'buzzes like English "z" (Sonne = ZON-uh)'],
  ];
  function pronunciationTips(word) {
    const w = word.replace(/^(der|die|das)\s+/i, '');
    const tips = [];
    const seen = new Set();
    for (const [re, label, text] of RULES) {
      if (re.test(w) && !seen.has(label)) {
        // skip overlapping rules
        if (label === 'au' && /(äu|eu)/i.test(w) && !/(^|[^eä])au/i.test(w)) continue;
        if (label === 'ch after e/i/ä/ö/ü' && !/([eiäöül]|[nr])ch/i.test(w.replace(/sch/gi, ''))) continue;
        if (label === 'ch after a/o/u' && !/[aou]ch/i.test(w.replace(/sch/gi, ''))) continue;
        if (label === 'r' && tips.length > 3) continue;
        if (label === 'final b / d / g' && /ig\b/i.test(w) && !/[bd]\b/i.test(w)) continue;
        if (label === 'v' && /November|Klavier/i.test(w)) continue;
        tips.push({ label, text }); seen.add(label);
      }
    }
    return tips.slice(0, 5);
  }

  // Gender hints that work for many A1 nouns.
  function articleRule(w) {
    const n = w.noun || '';
    if (/(ung|heit|keit|schaft|ion|tät|ik|ur)$/.test(n)) return 'Nouns ending in -ung, -heit, -keit, -schaft, -ion, -tät, -ur are almost always die.';
    if (/in$/.test(n) && w.art === 'die') return 'Female people ending in -in are always die (die Lehrerin).';
    if (/(chen|lein)$/.test(n)) return 'Nouns ending in -chen or -lein are always das.';
    if (/tag$/.test(n) || /Wochenende/.test(n)) return w.art === 'der' ? 'Days of the week are der.' : '';
    if (w.id >= 197 && w.id <= 212) return 'Months and seasons are always der.';
    if (/(ment|um)$/.test(n) && w.art === 'das') return 'Nouns ending in -um or -ment are usually das.';
    if (/e$/.test(n) && w.art === 'die') return 'About 90% of nouns ending in -e are die.';
    if (/e$/.test(n) && w.art !== 'die') return 'Exception: most nouns ending in -e are die, but this one is ' + w.art + '.';
    if (/(er|ling|ismus|or)$/.test(n) && w.art === 'der' && w.id >= 26 && w.id <= 40) return 'Male people and jobs are der (der Lehrer).';
    if (/(ling|ismus)$/.test(n)) return 'Nouns ending in -ling or -ismus are der.';
    if (w.art === 'das' && /^(Auto|Hotel|Café|Restaurant|Internet|Telefon)$/.test(n)) return 'Many borrowed words are das.';
    if (w.art === 'der' && /^(Regen|Schnee|Wind|Himmel|Mond|Stern)$/.test(n)) return 'Weather and sky words are often der.';
    return '';
  }

  // Declension helper for the case table.
  function cases(w) {
    const n = w.noun, a = w.art;
    const t = {
      der: [['der', 'ein'], ['den', 'einen'], ['dem', 'einem']],
      die: [['die', 'eine'], ['die', 'eine'], ['der', 'einer']],
      das: [['das', 'ein'], ['das', 'ein'], ['dem', 'einem']],
    }[a];
    return [['Nominative (subject)', ...t[0]], ['Accusative (object)', ...t[1]], ['Dative (after mit, in, zu…)', ...t[2]]]
      .map(([label, def, indef]) => ({ label, def: `${def} ${n}`, indef: `${indef} ${n}` }));
  }

  window.Lang = { norm, fold, lev, similarity, pronunciationTips, articleRule, cases };
})();
