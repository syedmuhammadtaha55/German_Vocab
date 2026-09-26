// Reviews free German answers (sentences, questions, stories).
//  1. Offline checks: articles vs. the word list, common verb forms, capitals,
//     punctuation, question word order, target words used.
//  2. LanguageTool (free public API, no key): full grammar and spelling check.
//  3. Optional Google Gemini tutor (free API key from Google AI Studio): corrections,
//     explanations and a natural reply so the conversation can continue.
(function () {
  const V = window.VOCAB;

  // ---------- word list lookups ----------
  const nouns = {};    // lowercase form -> { w, plural }
  for (const w of V) {
    if (!w.art || w.noun.includes(' ')) continue;
    nouns[w.noun.toLowerCase()] = { w, plural: w.pl === w.noun };
    if (w.pl && w.pl !== w.noun) nouns[w.pl.toLowerCase()] ||= { w, plural: true, onlyPlural: true };
  }
  const G = { der: 'm', die: 'f', das: 'n' };
  const DEF = { m: ['der', 'den', 'dem', 'des'], f: ['die', 'die', 'der', 'der'], n: ['das', 'das', 'dem', 'des'], pl: ['die', 'die', 'den', 'der'] };
  const END = { m: ['', 'en', 'em', 'es'], f: ['e', 'e', 'er', 'er'], n: ['', '', 'em', 'es'], pl: ['e', 'e', 'en', 'er'] };
  const CASES = ['nominative', 'accusative', 'dative', 'genitive'];
  const POSS = /^(ein|kein|mein|dein|sein|ihr|unser|euer|eur)(e|en|em|er|es)?$/;
  const DAT_PREP = ['mit', 'bei', 'aus', 'nach', 'seit', 'von', 'zu', 'gegenüber'];
  const AKK_PREP = ['für', 'durch', 'ohne', 'gegen', 'um'];
  const W_WORDS = ['wo', 'wann', 'was', 'wie', 'wer', 'wen', 'wem', 'wessen', 'warum', 'wieso', 'weshalb', 'woher', 'wohin', 'welche', 'welcher', 'welches', 'welchen', 'welchem'];
  const SUBJECTS = ['ich', 'du', 'er', 'sie', 'es', 'wir', 'ihr', 'man', 'der', 'die', 'das', 'ein', 'eine', 'mein', 'meine', 'dein', 'deine', 'heute', 'morgen', 'gestern'];

  // Common A1 verbs: ich, du, er/sie/es, wir/sie/Sie, ihr
  const VERBS = [
    ['sein', 'bin', 'bist', 'ist', 'sind', 'seid'], ['haben', 'habe', 'hast', 'hat', 'haben', 'habt'],
    ['gehen', 'gehe', 'gehst', 'geht', 'gehen', 'geht'], ['kommen', 'komme', 'kommst', 'kommt', 'kommen', 'kommt'],
    ['machen', 'mache', 'machst', 'macht', 'machen', 'macht'], ['trinken', 'trinke', 'trinkst', 'trinkt', 'trinken', 'trinkt'],
    ['essen', 'esse', 'isst', 'isst', 'essen', 'esst'], ['wohnen', 'wohne', 'wohnst', 'wohnt', 'wohnen', 'wohnt'],
    ['arbeiten', 'arbeite', 'arbeitest', 'arbeitet', 'arbeiten', 'arbeitet'], ['spielen', 'spiele', 'spielst', 'spielt', 'spielen', 'spielt'],
    ['lernen', 'lerne', 'lernst', 'lernt', 'lernen', 'lernt'], ['kaufen', 'kaufe', 'kaufst', 'kauft', 'kaufen', 'kauft'],
    ['schlafen', 'schlafe', 'schläfst', 'schläft', 'schlafen', 'schlaft'], ['lesen', 'lese', 'liest', 'liest', 'lesen', 'lest'],
    ['fahren', 'fahre', 'fährst', 'fährt', 'fahren', 'fahrt'], ['sehen', 'sehe', 'siehst', 'sieht', 'sehen', 'seht'],
    ['sprechen', 'spreche', 'sprichst', 'spricht', 'sprechen', 'sprecht'], ['mögen', 'mag', 'magst', 'mag', 'mögen', 'mögt'],
    ['heißen', 'heiße', 'heißt', 'heißt', 'heißen', 'heißt'], ['kochen', 'koche', 'kochst', 'kocht', 'kochen', 'kocht'],
    ['schreiben', 'schreibe', 'schreibst', 'schreibt', 'schreiben', 'schreibt'], ['brauchen', 'brauche', 'brauchst', 'braucht', 'brauchen', 'braucht'],
    ['können', 'kann', 'kannst', 'kann', 'können', 'könnt'], ['wollen', 'will', 'willst', 'will', 'wollen', 'wollt'],
    ['müssen', 'muss', 'musst', 'muss', 'müssen', 'müsst'], ['möchten', 'möchte', 'möchtest', 'möchte', 'möchten', 'möchtet'],
    ['finden', 'finde', 'findest', 'findet', 'finden', 'findet'], ['nehmen', 'nehme', 'nimmst', 'nimmt', 'nehmen', 'nehmt'],
    ['geben', 'gebe', 'gibst', 'gibt', 'geben', 'gebt'], ['treffen', 'treffe', 'triffst', 'trifft', 'treffen', 'trefft'],
    ['besuchen', 'besuche', 'besuchst', 'besucht', 'besuchen', 'besucht'], ['stehen', 'stehe', 'stehst', 'steht', 'stehen', 'steht'],
  ];
  const PERSON = { ich: [1], du: [2], er: [3], es: [3], man: [3], wir: [4], ihr: [5], sie: [3, 4] };
  const formIndex = {};
  for (const row of VERBS) row.slice(1).forEach((f, i) => { (formIndex[f] ||= []).push({ row, p: i + 1 }); });

  function tokenize(text) {
    const out = [];
    const re = /[\p{L}ß]+(?:-[\p{L}]+)*/gu;
    let m;
    while ((m = re.exec(text))) out.push({ t: m[0], l: m[0].toLowerCase(), i: m.index });
    return out;
  }

  // ---------- offline review ----------
  function offline(text, { spoken = false, targets = [], mode = 'free', ask = null, question = null } = {}) {
    const issues = [];
    const toks = tokenize(text);
    const add = (level, msg, extra = {}) => issues.push({ level, msg, source: 'app', wrong: extra.at != null ? text.substr(extra.at, extra.len) : undefined, ...extra });

    if (toks.length < 2) add('error', 'Write or say a full sentence (at least a subject and a verb).');

    // Articles before known nouns
    toks.forEach((tok, k) => {
      const entry = nouns[tok.l];
      if (!entry || k === 0) return;
      let det = toks[k - 1];
      // allow one adjective between: "der große Tisch"
      if (!isDet(det.l) && k >= 2 && /(e|en|er|es|em)$/.test(det.l) && isDet(toks[k - 2].l)) det = toks[k - 2];
      if (!isDet(det.l)) return;
      const g = G[entry.w.art];
      const genders = entry.onlyPlural ? ['pl'] : entry.plural ? [g, 'pl'] : [g];
      if (genders.some(x => detFits(det.l, x))) return;
      const prep = toks[toks.indexOf(det) - 1]?.l;
      // After a verb other than "sein" the noun is most likely the object (accusative).
      const afterVerb = formIndex[prep] && formIndex[prep][0].row[0] !== 'sein' && toks.indexOf(det) > 1;
      const cas = DAT_PREP.includes(prep) ? 2 : AKK_PREP.includes(prep) ? 1 : afterVerb && guessCase(det.l) === 0 ? 1 : guessCase(det.l);
      const fix = fixDet(det.l, entry.onlyPlural ? 'pl' : g, cas);
      const nounShown = entry.onlyPlural ? entry.w.pl : entry.w.noun;
      add('error', `"${det.t} ${tok.t}": ${entry.onlyPlural ? `${nounShown} is plural` : `${entry.w.noun} is ${entry.w.art}-word (${entry.w.de})`}.` +
        (fix ? ` Here (${CASES[cas]}${prep && (DAT_PREP.includes(prep) || AKK_PREP.includes(prep)) ? ' after "' + prep + '"' : ''}) use "${matchCase(fix, det.t)} ${tok.t}".` : ''),
        { kind: 'article', at: det.i, len: tok.i + tok.t.length - det.i, fix: fix ? `${matchCase(fix, det.t)} ${tok.t}` : null });
    });

    // Nouns must be capitalised (typed text only)
    if (!spoken) toks.forEach(tok => {
      const entry = nouns[tok.l];
      if (entry && tok.t[0] === tok.l[0] && !['alter'].includes(tok.l)) {
        const cap = tok.t[0].toUpperCase() + tok.t.slice(1);
        add('error', `Nouns start with a capital letter: "${cap}".`, { kind: 'capital', at: tok.i, len: tok.t.length, fix: cap });
      }
    });

    // Subject-verb agreement for common verbs (pronoun next to verb, either order)
    toks.forEach((tok, k) => {
      const p = PERSON[tok.l];
      if (!p) return;
      // Pronoun before the verb ("ich gehe"), or right after a verb in first/second
      // position ("Gehst du", "Morgen gehe ich"). Skip sie/es after a verb: often objects.
      const after = k >= 1 && k <= 2 && !['sie', 'es'].includes(tok.l) ? toks[k - 1] : null;
      for (const nb of [toks[k + 1], after]) {
        if (!nb || !formIndex[nb.l]) continue;
        const cands = formIndex[nb.l];
        if (cands.some(c => p.includes(c.p) || (tok.l === 'sie' && c.p === 3))) continue;
        // "Sie" at the start of a sentence can be formal: accept wir-forms.
        const row = cands[0].row;
        const want = row[p[0]];
        add('error', `"${tok.t} ${nb.t}" does not match: with "${tok.l}" say "${want}" (${row[0]}).`, { kind: 'verb', at: nb.i, len: nb.t.length, fix: nb.t[0] === nb.t[0].toUpperCase() ? want[0].toUpperCase() + want.slice(1) : want });
        break;
      }
    });

    // Sentence shape (typed only; speech recognition often adds no punctuation)
    if (!spoken && text.trim()) {
      const first = text.trim()[0];
      if (first !== first.toUpperCase()) add('warn', 'Start the sentence with a capital letter.', { kind: 'capital' });
      if (!/[.!?]["“”]?\s*$/.test(text.trim())) add('warn', mode === 'ask' ? 'A question ends with "?".' : 'End the sentence with a full stop.', { kind: 'punct' });
    }

    // Question form
    if (ask) {
      const firstW = toks[0]?.l;
      if (!spoken && !/\?\s*$/.test(text.trim())) {
        if (!issues.some(x => x.kind === 'punct')) add('warn', 'A question ends with "?".', { kind: 'punct' });
      }
      if (ask.kind === 'w' && !W_WORDS.includes(firstW)) add('error', `Start this question with a question word (${ask.need[0].join(' / ')}…), then the verb: "${ask.model}"`, { kind: 'question' });
      if (ask.kind === 'yn' && (W_WORDS.includes(firstW) || SUBJECTS.includes(firstW))) add('error', `A yes/no question starts with the verb: "${ask.model}"`, { kind: 'question' });
      if (ask.kind === 'w' && W_WORDS.includes(firstW) && toks[1] && PERSON[toks[1].l] && !formIndex[toks[1].l]) add('error', 'After the question word comes the verb, then the subject: "' + ask.model + '"', { kind: 'question' });
      const low = Lang.fold(text);
      const missing = ask.need.filter(alts => !alts.some(a => low.includes(Lang.fold(a))));
      if (missing.length) add('warn', `Your question should include: ${missing.map(m => m[0]).join(', ')}.`, { kind: 'topic' });
    }

    // Answer is on topic?
    if (question && toks.length >= 2) {
      const low = Lang.fold(text);
      if (!question.topic.some(s => low.includes(Lang.fold(s)))) add('warn', 'This does not seem to answer the question. Try using a word from the question.', { kind: 'topic' });
      if (Lang.similarity(text, question.q) > 0.85) add('warn', 'You repeated the question. Now answer it!', { kind: 'topic' });
    }

    // Target words used?
    const used = targets.map(w => ({ w, used: usesWord(text, toks, w) }));
    used.filter(u => !u.used).forEach(u => add('error', `You did not use "${u.w.de}" (${u.w.en}).`, { kind: 'missing' }));

    return { issues, used, sentences: countSentences(text, spoken) };
  }

  function isDet(l) { return ['der', 'die', 'das', 'den', 'dem', 'des'].includes(l) || (POSS.test(l) && !['sein', 'ihr'].includes(l)); }
  function detFits(l, g) {
    if (DEF[g].includes(l)) return true;
    const m = l.match(POSS);
    if (!m || ['der', 'die', 'das', 'den', 'dem', 'des'].includes(l)) return false;
    if (g === 'pl' && (m[1] === 'ein')) return false;
    return END[g].includes(m[2] || '');
  }
  function guessCase(l) {
    if (['den'].includes(l)) return 1;
    if (['dem'].includes(l)) return 2;
    if (['des'].includes(l)) return 3;
    const m = l.match(POSS);
    if (m) return { '': 0, e: 0, en: 1, em: 2, er: 2, es: 3 }[m[2] || ''];
    return 0;
  }
  function fixDet(l, g, cas) {
    if (['der', 'die', 'das', 'den', 'dem', 'des'].includes(l)) return DEF[g][cas];
    const m = l.match(POSS);
    if (!m) return null;
    if (g === 'pl' && m[1] === 'ein') return cas === 2 ? 'den' : cas === 3 ? 'der' : 'die';
    return m[1] + END[g][cas];
  }
  const matchCase = (w, like) => like[0] === like[0].toUpperCase() ? w[0].toUpperCase() + w.slice(1) : w;

  function usesWord(text, toks, w) {
    const low = Lang.fold(text);
    if (w.type === 'noun') {
      const forms = [w.noun, w.pl].filter(Boolean).map(Lang.fold);
      return toks.some(t => forms.some(f => Lang.fold(t.t) === f || Lang.fold(t.t).endsWith(f) || Lang.fold(t.t) === f + 'n' || Lang.fold(t.t) === f + 's' || Lang.fold(t.t) === f + 'es'));
    }
    if (w.de.includes(' ')) return (` ${low} `).includes(` ${Lang.fold(w.de)} `);
    const stem = Lang.fold(w.de).replace(/e$/, '');
    return toks.some(t => { const f = Lang.fold(t.t); return f === Lang.fold(w.de) || (f.startsWith(stem) && f.length <= stem.length + 3); });
  }
  function countSentences(text, spoken) {
    const parts = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.split(/\s+/).length >= 2);
    if (spoken && parts.length <= 1) return Math.max(1, Math.round(text.split(/\s+/).length / 6));
    return parts.length;
  }

  // ---------- LanguageTool ----------
  const IGNORE_SPOKEN = /^(UPPERCASE_SENTENCE_START|PUNCTUATION_PARAGRAPH_END|COMMA_|DE_CASE|WHITESPACE_RULE|DOUBLE_PUNCTUATION)/;
  async function languageTool(text, spoken) {
    const body = new URLSearchParams({ text, language: 'de-DE', level: 'default' });
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 9000);
    try {
      const res = await fetch('https://api.languagetool.org/v2/check', { method: 'POST', body, signal: ctrl.signal });
      if (!res.ok) throw new Error('LanguageTool answered ' + res.status + (res.status === 429 ? ' (too many checks; wait a minute)' : ''));
      const data = await res.json();
      return (data.matches || [])
        .filter(m => !(spoken && (IGNORE_SPOKEN.test(m.rule?.id || '') || ['PUNCTUATION', 'CASING', 'TYPOGRAPHY'].includes(m.rule?.category?.id))))
        .map(m => ({
          level: m.rule?.issueType === 'style' || m.rule?.issueType === 'typographical' ? 'warn' : 'error',
          msg: m.message,
          at: m.offset, len: m.length,
          fix: m.replacements?.[0]?.value ?? null,
          wrong: text.substr(m.offset, m.length),
          source: 'LanguageTool',
        }));
    } finally { clearTimeout(timer); }
  }

  // Apply fixes from the end so offsets stay valid.
  function applyFixes(text, issues) {
    const fixes = issues.filter(x => x.fix != null && x.at != null).sort((a, b) => b.at - a.at);
    let out = text, lastStart = Infinity;
    for (const f of fixes) {
      if (f.at + f.len > lastStart) continue; // overlapping
      out = out.slice(0, f.at) + f.fix + out.slice(f.at + f.len);
      lastStart = f.at;
    }
    return out;
  }

  // ---------- Gemini (optional) ----------
  async function gemini(text, ctx) {
    const key = Settings.get('geminiKey');
    if (!key) return null;
    const model = Settings.get('geminiModel') || 'gemini-flash-latest';
    const task = ctx.question ? `The learner was asked: "${ctx.question.q}" and answered.` :
      ctx.ask ? `The learner had to ask in German: "${ctx.ask.en}".` :
        ctx.targets?.length ? `The learner had to write ${ctx.mode === 'story' ? 'a short story (3+ sentences)' : 'a sentence'} using: ${ctx.targets.map(w => w.de).join(', ')}.` : 'The learner wrote freely.';
    const prompt = `You are a friendly German tutor for an A1/A2 learner whose first language is English.
${task}
Learner's text${ctx.spoken ? ' (transcribed from speech, so ignore missing punctuation and capitalisation)' : ''}:
"""${text}"""
Reply with JSON only:
{"score": 0-10, "corrected": "the text corrected with minimal changes, natural German",
 "mistakes": [{"wrong": "...", "right": "...", "why": "short English explanation, mention case/article/word order when relevant"}],
 "praise": "one short encouraging English sentence about what was good",
 "reply": "a short natural German reply (A1-A2 level) as a conversation partner reacting to the content",
 "followUp": "one new simple German question to keep the conversation going"}`;
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { temperature: 0.4, responseMimeType: 'application/json' } }),
    });
    if (!res.ok) {
      let msg = 'Gemini answered ' + res.status;
      try { msg += ': ' + ((await res.json()).error?.message || ''); } catch (_) {}
      throw new Error(msg);
    }
    const data = await res.json();
    const raw = data.candidates?.[0]?.content?.parts?.map(p => p.text).join('') || '';
    return JSON.parse(raw.replace(/^```(json)?|```$/g, '').trim());
  }

  // ---------- main entry ----------
  async function review(text, ctx = {}) {
    const base = offline(text, ctx);
    let issues = base.issues;
    let ltError = null, tutor = null, tutorError = null;
    const online = Settings.get('languageTool') !== false;
    const [lt, gm] = await Promise.allSettled([
      online ? languageTool(text, ctx.spoken) : Promise.resolve([]),
      gemini(text, ctx),
    ]);
    if (lt.status === 'fulfilled') {
      // Drop LanguageTool matches that overlap our own, more specific article/verb notes.
      const mine = issues.filter(x => x.at != null);
      issues = issues.concat(lt.value.filter(m => !mine.some(x => m.at < x.at + x.len && x.at < m.at + m.len)));
    } else ltError = lt.reason?.name === 'AbortError' ? 'Grammar check timed out' : 'Online grammar check unavailable (' + (lt.reason?.message || 'offline') + ')';
    if (gm.status === 'fulfilled') tutor = gm.value; else tutorError = gm.reason?.message || 'Tutor unavailable';

    const errors = issues.filter(x => x.level === 'error').length;
    const warns = issues.filter(x => x.level === 'warn').length;
    let score = Math.max(0, 10 - errors * 2 - warns);
    if (tutor && typeof tutor.score === 'number') score = Math.round((score + tutor.score) / 2);
    const corrected = tutor?.corrected || applyFixes(text, issues);
    return { ...base, issues, errors, warns, score, corrected, tutor, ltError, tutorError, ltUsed: online && !ltError };
  }

  window.Checker = { review, offline, tokenize };
})();
