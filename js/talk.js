// Conversation drills (answer, ask, make sentences, tell a story) and the A2 article drill.
(function () {
  const { h, icon, speakBtn, wordEl, toast, shuffle, go, gclass, byId, view, renderStreak } = window.UI;

  // ---------- shared pieces ----------
  function frame(title, poolChoice, seg) {
    const bar = h('i', { style: { width: '0%' } });
    const label = h('span', { class: 'muted small num' });
    const stage = h('div', { class: 'stack', style: { gap: '14px' } });
    view.append(h('div', { class: 'row between' },
      h('div', { class: 'row' }, h('button', { class: 'btn ghost', onclick: () => go('drills', { pool: poolChoice }) }, '← Drills'), h('h1', { style: { fontSize: '1.5rem' } }, title)),
      label));
    if (seg) view.append(seg);
    view.append(h('div', { class: 'progress-line' }, bar), stage);
    return { bar, label, stage };
  }

  function segmented(opts, current, onPick) {
    const el = h('div', { class: 'seg', role: 'group', 'aria-label': 'Mode' });
    const paint = () => el.replaceChildren(...opts.map(([v, l]) => h('button', { 'aria-pressed': String(current === v), onclick: () => { current = v; paint(); onPick(v); } }, l)));
    paint();
    return el;
  }

  // Text box with microphone dictation and umlaut keys.
  function composer({ id, placeholder, rows = 3, onCheck }) {
    let spoken = false;
    const ta = h('textarea', { class: 'answer-input talk-input', id, rows, lang: 'de', spellcheck: 'false', autocapitalize: 'sentences', placeholder });
    ta.addEventListener('input', e => { if (e.inputType) spoken = spoken && ta.value.length > 0; });
    const checkBtn = h('button', { class: 'btn primary', onclick: () => run() }, 'Check my answer');
    const ins = ch => { const s = ta.selectionStart ?? ta.value.length; ta.value = ta.value.slice(0, s) + ch + ta.value.slice(ta.selectionEnd ?? s); ta.focus(); ta.setSelectionRange(s + 1, s + 1); };
    let mic = null;
    if (Speech.canListen) {
      mic = h('button', { class: 'btn', type: 'button', onclick: async () => {
        if (mic.classList.contains('live')) return;
        mic.classList.add('live'); mic.lastChild.textContent = 'Listening…';
        const r = await Speech.listen();
        mic.classList.remove('live'); mic.lastChild.textContent = 'Speak';
        if (!r.ok) { toast({ 'not-allowed': 'Microphone blocked. Allow it in browser settings.', 'no-speech': 'Nothing heard. Tap Speak and talk right away.', network: 'Speech recognition needs internet.' }[r.error] || 'Could not recognise speech.'); return; }
        const said = r.alternatives[0];
        ta.value = (ta.value.trim() ? ta.value.trim() + ' ' : '') + said.charAt(0).toUpperCase() + said.slice(1);
        spoken = true;
      } }, icon('mic'), h('span', {}, 'Speak'));
    }
    async function run() {
      const text = ta.value.trim();
      if (!text) { toast(Speech.canListen ? 'Speak or type your answer first' : 'Type your answer first'); return; }
      checkBtn.disabled = true; checkBtn.textContent = 'Checking…';
      try { await onCheck(text, spoken); } finally { checkBtn.disabled = false; checkBtn.textContent = 'Check again'; }
    }
    ta.addEventListener('keydown', e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) run(); });
    const el = h('div', { class: 'stack' },
      ta,
      h('div', { class: 'row between' },
        h('div', { class: 'umlauts' }, ['ä', 'ö', 'ü', 'ß'].map(c => h('button', { type: 'button', onclick: () => ins(c), 'aria-label': 'Insert ' + c }, c))),
        h('div', { class: 'row' }, mic, checkBtn)),
      Speech.canListen ? h('p', { class: 'muted small' }, 'Tap Speak and answer out loud (you can speak several times), fix anything by typing, then check.')
        : h('p', { class: 'muted small' }, 'Type your answer, then read it out loud before checking. (Speech input needs Chrome, Edge or Safari.)'));
    return { el, ta, reset() { ta.value = ''; spoken = false; checkBtn.textContent = 'Check my answer'; } };
  }

  // Show the review result.
  function reviewView(text, res, { targets, extra } = {}) {
    const good = res.errors === 0;
    const verdict = res.score >= 9 && good ? 'Sehr gut!' : good ? 'Gut gemacht!' : res.score >= 6 ? 'Almost there' : 'Let\'s fix this';
    // Highlight problem spans in the learner's text.
    const marks = res.issues.filter(x => x.at != null && x.len > 0).sort((a, b) => a.at - b.at);
    const pieces = []; let pos = 0;
    for (const m of marks) {
      if (m.at < pos) continue;
      pieces.push(text.slice(pos, m.at), h('mark', { class: 'err-' + m.level, title: m.msg }, text.slice(m.at, m.at + m.len)));
      pos = m.at + m.len;
    }
    pieces.push(text.slice(pos));

    const t = res.tutor;
    const box = h('div', { class: 'panel review ' + (good ? 'is-ok' : 'is-bad') },
      h('div', { class: 'row between' },
        h('h2', {}, verdict),
        h('span', { class: 'score num' }, `${res.score}/10`)),
      targets?.length ? h('div', { class: 'row', style: { gap: '6px' } }, res.used.map(u =>
        h('span', { class: 'pill ' + (u.used ? 'used' : 'unused') }, (u.used ? '✓ ' : '✗ ') + u.w.de))) : null,
      h('div', { class: 'stack', style: { gap: '4px' } },
        h('span', { class: 'eyebrow' }, 'You wrote'),
        h('p', { class: 'learner-text' }, pieces)),
      res.issues.length ? h('ul', { class: 'issues' }, res.issues.map(x => h('li', { class: 'lvl-' + x.level },
        h('span', {}, x.msg),
        x.fix != null && x.wrong ? h('span', { class: 'fix' }, `${x.wrong} → ${x.fix || '(remove)'}`) : null,
        h('span', { class: 'src' }, x.source === 'app' ? 'Wortschatz check' : x.source)))) :
        h('p', { class: 'ok-line' }, res.ltUsed ? 'No mistakes found by the grammar check.' : 'No mistakes found by the offline check.'),
      res.corrected && Lang.norm(res.corrected) !== Lang.norm(text) ? h('div', { class: 'ex' },
        h('span', { class: 'eyebrow' }, 'Corrected'),
        h('div', { class: 'row', style: { flexWrap: 'nowrap', alignItems: 'flex-start' } }, h('p', { class: 'de', style: { flex: '1' } }, res.corrected), speakBtn(res.corrected), speakBtn(res.corrected, { slow: true }))) :
        h('div', { class: 'row' }, h('span', { class: 'muted small' }, 'Hear your text read by a native voice:'), speakBtn(text)),
      t ? h('div', { class: 'tutor stack' },
        h('span', { class: 'eyebrow' }, 'Tutor (Gemini)'),
        t.praise ? h('p', {}, t.praise) : null,
        t.mistakes?.length ? h('ul', { class: 'issues' }, t.mistakes.map(m => h('li', { class: 'lvl-error' }, h('span', { class: 'fix' }, `${m.wrong} → ${m.right}`), h('span', {}, m.why)))) : null,
        t.reply ? h('div', { class: 'row', style: { flexWrap: 'nowrap' } }, h('p', { class: 'reply', style: { flex: 1 } }, t.reply), speakBtn(t.reply)) : null) : null,
      extra || null,
      res.ltError ? h('p', { class: 'muted small' }, res.ltError + '. Offline checks still ran.') : null,
      res.tutorError ? h('p', { class: 'muted small' }, 'Tutor: ' + res.tutorError) : null,
      !Settings.get('geminiKey') ? h('p', { class: 'muted small' }, 'Tip: add a free Google Gemini key in Today → Settings for a tutor that explains mistakes and replies to you.') : null);
    if (t?.reply) setTimeout(() => Speech.speak(t.reply), 300);
    return box;
  }

  // ---------- Answer questions ----------
  function answer(poolChoice) {
    let order = shuffle(TALK_QUESTIONS), i = 0, count = 0, okCount = 0;
    let showText = false;
    const { bar, label, stage } = frame('Answer questions', poolChoice,
      segmented([['listen', 'Listen first'], ['read', 'Show the text']], 'listen', v => { showText = v === 'read'; render(current); }));
    let current = order[0];
    function next(q) { current = q || order[(++i) % order.length]; render(current); }
    function render(q) {
      label.textContent = `${count} answered · ${okCount} without mistakes`;
      bar.style.width = Math.min(100, count * 10) + '%';
      const qText = h('p', { class: 'front-prompt', style: { fontSize: '1.5rem', padding: '4px 0' }, hidden: !showText }, q.q);
      const qEn = h('p', { class: 'front-hint', hidden: true }, q.en || '');
      const out = h('div', {});
      const comp = composer({ id: 'answer-input', placeholder: 'Antworte auf Deutsch… (answer in German)', onCheck: async (text, spoken) => {
        const res = await Checker.review(text, { spoken, question: q.topic?.length ? q : null, mode: 'answer' });
        const ok = res.errors === 0;
        count++; if (ok) okCount++;
        Progress.stat('talk', ok);
        label.textContent = `${count} answered · ${okCount} without mistakes`;
        bar.style.width = Math.min(100, count * 10) + '%';
        qText.hidden = false;
        out.replaceChildren(reviewView(text, res, {
          extra: q.sample ? h('div', { class: 'ex' },
            h('span', { class: 'eyebrow' }, 'Model answer'),
            h('div', { class: 'row', style: { flexWrap: 'nowrap', alignItems: 'flex-start' } }, h('p', { class: 'de', style: { flex: 1 } }, q.sample), speakBtn(q.sample), speakBtn(q.sample, { slow: true }))) : null,
        }), h('div', { class: 'row' },
          res.tutor?.followUp ? h('button', { class: 'btn gold', onclick: () => next({ q: res.tutor.followUp, en: '', topic: [] }) }, 'Answer the tutor\'s question') : null,
          h('button', { class: 'btn primary', onclick: () => next() }, 'Next question')));
        renderStreak();
      } });
      stage.replaceChildren(
        h('div', { class: 'card' },
          h('span', { class: 'eyebrow' }, showText ? 'Read and answer' : 'Listen and answer'),
          h('div', { class: 'listen-hero', style: { padding: '4px 0' } },
            h('button', { class: 'play-big', 'aria-label': 'Play the question', onclick: () => Speech.speak(q.q) }, icon('play')),
            h('div', { class: 'row' },
              h('button', { class: 'btn ghost', onclick: () => Speech.speak(q.q, { speed: 'slow' }) }, icon('slow'), 'Slower'),
              h('button', { class: 'btn ghost', onclick: () => { qText.hidden = false; } }, 'Show text'),
              q.en ? h('button', { class: 'btn ghost', onclick: () => { qEn.hidden = false; qText.hidden = false; } }, 'English') : null)),
          qText, qEn,
          comp.el),
        out);
      setTimeout(() => Speech.speak(q.q), 250);
    }
    render(current);
  }

  // ---------- Ask questions ----------
  function ask(poolChoice) {
    let order = shuffle(TALK_ASK), i = 0, count = 0, okCount = 0;
    const { bar, label, stage } = frame('Ask questions', poolChoice);
    function render() {
      const a = order[i % order.length];
      label.textContent = `${count} asked · ${okCount} without mistakes`;
      bar.style.width = Math.min(100, count * 10) + '%';
      const out = h('div', {});
      const comp = composer({ id: 'ask-input', rows: 2, placeholder: 'Frag auf Deutsch… (ask in German)', onCheck: async (text, spoken) => {
        const res = await Checker.review(text, { spoken, ask: a, mode: 'ask' });
        const ok = res.errors === 0;
        count++; if (ok) okCount++;
        Progress.stat('talk', ok);
        label.textContent = `${count} asked · ${okCount} without mistakes`;
        const replyBox = h('div', { class: 'ex' },
          h('span', { class: 'eyebrow' }, ok ? 'Your partner answers' : 'A correct question'),
          ok ? h('div', { class: 'row', style: { flexWrap: 'nowrap' } }, h('p', { class: 'de reply', style: { flex: 1 } }, a.reply), speakBtn(a.reply)) : null,
          h('div', { class: 'row', style: { flexWrap: 'nowrap' } }, h('p', { class: ok ? 'en' : 'de', style: { flex: 1 } }, 'Model: ', a.model), speakBtn(a.model), speakBtn(a.model, { slow: true })),
          a.kind === 'w' ? h('p', { class: 'en' }, 'W-question: question word → verb → subject → rest.') : h('p', { class: 'en' }, 'Yes/no question: verb first → subject → rest.'));
        out.replaceChildren(reviewView(text, res, { extra: replyBox }), h('button', { class: 'btn primary', onclick: () => { i++; render(); } }, 'Next situation'));
        if (ok && !res.tutor?.reply) setTimeout(() => Speech.speak(a.reply), 300);
        renderStreak();
      } });
      stage.replaceChildren(
        h('div', { class: 'card' },
          h('span', { class: 'eyebrow' }, 'Situation'),
          h('p', { class: 'front-prompt', style: { fontSize: '1.45rem', padding: '4px 0' } }, a.en),
          h('p', { class: 'front-hint' }, a.kind === 'w' ? 'Start with a question word: wo, wann, was, wie…' : 'Start with the verb: Hast du…? Ist das…?'),
          comp.el),
        out);
    }
    render();
  }

  // ---------- Make sentences ----------
  function sentence(poolChoice, pool) {
    if (pool.length < 4) pool = VOCAB.slice(0, 40);
    let count = 0, okCount = 0;
    const { bar, label, stage } = frame('Make sentences', poolChoice,
      segmented([['1', 'One word'], ['2', 'Two words'], ['3', 'Three words']], '2', v => { n = +v; render(); }));
    let n = 2;
    function pick() {
      const nounsP = shuffle(pool.filter(w => w.type === 'noun'));
      const others = shuffle(pool.filter(w => w.type !== 'noun'));
      const out = [];
      if (nounsP.length) out.push(nounsP[0]);
      const rest = shuffle([...nounsP.slice(1, 3), ...others.slice(0, 3)]);
      while (out.length < n && rest.length) out.push(rest.shift());
      return out.slice(0, n);
    }
    function render() {
      const targets = pick();
      label.textContent = `${count} sentences · ${okCount} without mistakes`;
      bar.style.width = Math.min(100, count * 10) + '%';
      const out = h('div', {});
      const comp = composer({ id: 'sentence-input', rows: 2, placeholder: 'Schreib einen Satz… (write one sentence)', onCheck: async (text, spoken) => {
        const res = await Checker.review(text, { spoken, targets, mode: 'sentence' });
        const ok = res.errors === 0;
        count++; if (ok) okCount++;
        Progress.stat('talk', ok);
        res.used.forEach(u => Progress.skill(u.w.id, 'use', ok && u.used));
        label.textContent = `${count} sentences · ${okCount} without mistakes`;
        out.replaceChildren(reviewView(text, res, { targets,
          extra: h('div', { class: 'ex' }, h('span', { class: 'eyebrow' }, 'Example from the word list'),
            targets.map(w => h('div', { class: 'row', style: { flexWrap: 'nowrap' } }, h('p', { class: 'de', style: { flex: 1 } }, w.ex), speakBtn(w.ex)))) }),
          h('button', { class: 'btn primary', onclick: render }, 'New words'));
        renderStreak();
      } });
      stage.replaceChildren(
        h('div', { class: 'card' },
          h('span', { class: 'eyebrow' }, `Use ${targets.length === 1 ? 'this word' : 'these words'} in one sentence`),
          h('div', { class: 'target-words' }, targets.map(w => h('div', { class: 'target' }, wordEl(w), h('span', { class: 'muted small' }, w.en), speakBtn(w.de)))),
          h('p', { class: 'muted small' }, patternHint(targets)),
          comp.el),
        out);
    }
    render();
  }
  function patternHint(targets) {
    const n = targets.find(w => w.type === 'noun');
    const a = targets.find(w => w.type === 'adj');
    const t = targets.find(w => w.type === 'adv');
    const parts = [];
    if (n && a) parts.push(`${n.de[0].toUpperCase() + n.de.slice(1)} ist ${a.de}.`);
    if (n && t) parts.push(`${t.de[0].toUpperCase() + t.de.slice(1)} sehe ich ${n.art === 'der' ? 'den' : n.art} ${n.noun}.`);
    if (n && !a && !t) parts.push(`Ich habe ${n.art === 'der' ? 'einen' : n.art === 'die' ? 'eine' : 'ein'} ${n.noun}.`);
    return parts.length ? 'Idea: ' + parts[0] + ' Try to make it your own.' : 'Idea: start simple (subject + verb + rest), then add a time word.';
  }

  // ---------- Tell a story ----------
  function story(poolChoice, pool) {
    let mode = 'scene', sceneOrder = shuffle(TALK_SCENES), si = 0, count = 0, okCount = 0;
    const { bar, label, stage } = frame('Tell a story', poolChoice,
      segmented([['scene', 'Scenes'], ['mine', 'Random words from my list']], 'scene', v => { mode = v; render(); }));
    function render() {
      let title, prompt, targets;
      if (mode === 'scene' || pool.length < 6) {
        const sc = sceneOrder[si % sceneOrder.length];
        title = sc.title; prompt = sc.en; targets = sc.words.map(id => byId[id]);
      } else {
        const nounsP = shuffle(pool.filter(w => w.type === 'noun')).slice(0, 3);
        targets = nounsP.concat(shuffle(pool.filter(w => w.type !== 'noun')).slice(0, 5 - nounsP.length));
        title = 'Your words'; prompt = 'Write a short story that uses all of these words.';
      }
      label.textContent = `${count} stories · ${okCount} without mistakes`;
      bar.style.width = Math.min(100, count * 20) + '%';
      const out = h('div', {});
      const comp = composer({ id: 'story-input', rows: 6, placeholder: 'Erzähl eine Geschichte… (3 or more sentences)', onCheck: async (text, spoken) => {
        const res = await Checker.review(text, { spoken, targets, mode: 'story' });
        if (res.sentences < 3) { res.issues.unshift({ level: 'error', msg: `Write at least 3 sentences (you have ${res.sentences}).`, source: 'app' }); res.errors++; res.score = Math.max(0, res.score - 2); }
        const ok = res.errors === 0;
        count++; if (ok) okCount++;
        Progress.stat('talk', ok);
        res.used.forEach(u => Progress.skill(u.w.id, 'use', u.used && ok));
        label.textContent = `${count} stories · ${okCount} without mistakes`;
        const listenText = res.corrected || text;
        out.replaceChildren(reviewView(text, res, { targets,
          extra: h('div', { class: 'row' },
            h('button', { class: 'btn', onclick: () => Speech.speak(listenText) }, icon('play'), 'Listen to your story'),
            h('button', { class: 'btn ghost', onclick: () => Speech.speak(listenText, { speed: 'slow' }) }, icon('slow'), 'Slowly')) }),
          h('div', { class: 'row' },
            h('button', { class: 'btn primary', onclick: () => { si++; render(); } }, 'New story'),
            h('button', { class: 'btn', onclick: () => { out.replaceChildren(); comp.ta.focus(); } }, 'Improve this one')));
        renderStreak();
      } });
      stage.replaceChildren(
        h('div', { class: 'card' },
          h('span', { class: 'eyebrow' }, title),
          h('p', { style: { fontSize: '1.15rem', fontWeight: 700 } }, prompt),
          h('div', { class: 'target-words' }, targets.map(w => h('div', { class: 'target' }, wordEl(w), h('span', { class: 'muted small' }, w.en), speakBtn(w.de)))),
          h('p', { class: 'muted small' }, 'Link sentences with und, aber, dann, danach. Remember: the verb is always the 2nd element ("Dann gehen wir…").'),
          comp.el),
        out);
    }
    render();
  }

  // ---------- A2 articles in context ----------
  function a2(poolChoice) {
    let mode = 'read';
    const round = shuffle(A2_ARTICLES).slice(0, 10);
    let i = 0, score = 0;
    const mistakes = [];
    const { bar, label, stage } = frame('Articles in A2 sentences', poolChoice,
      segmented([['read', 'Read'], ['listen', 'Listen']], 'read', v => { mode = v; ask(); }));
    const cap = s => s[0].toUpperCase() + s.slice(1);
    const filled = it => it.s.replace('___', it.s.startsWith('___') ? cap(it.a) : it.a);

    function ask() {
      bar.style.width = (i / round.length * 100) + '%';
      label.textContent = `${Math.min(i + 1, round.length)} / ${round.length} · ${score} correct`;
      if (i >= round.length) return results();
      const it = round[i];
      const full = filled(it);
      const atStart = it.s.startsWith('___');
      const [before, after] = it.s.split('___');
      const blank = h('span', { class: 'blank' }, '?');
      const noun = after.trim().split(/\s+/)[0].replace(/[.,!?]$/, '');
      const fb = h('div', {});
      let answered = false;
      const opts = A2_SETS[it.set].map(o => h('button', { class: 'btn opt a2-opt', onclick: e => {
        if (answered) return; answered = true;
        const ok = o === it.a;
        if (ok) score++; else mistakes.push(it);
        Progress.stat('a2', ok);
        e.currentTarget.classList.add(ok ? 'correct' : 'wrong');
        opts.find(b => b.dataset.v === it.a).classList.add('correct');
        blank.textContent = atStart ? cap(it.a) : it.a;
        sentenceEl.hidden = false;
        Speech.speak(full);
        fb.replaceChildren(h('div', { class: `feedback ${ok ? 'ok' : 'bad'}` },
          ok ? 'Richtig!' : `It's "${it.a}".`,
          h('span', { class: 'detail' }, h('span', { class: 'pill case-' + it.c }, CASE_NAMES[it.c]), ' ', it.why),
          h('span', { class: 'detail' }, it.en),
          h('div', { class: 'row' }, speakBtn(full), speakBtn(full, { slow: true }), sayItButton(full))),
        h('button', { class: 'btn primary big wide', id: 'next-btn', onclick: () => { i++; ask(); } }, i + 1 >= round.length ? 'See results' : 'Next'));
        label.textContent = `${Math.min(i + 1, round.length)} / ${round.length} · ${score} correct`;
      }, 'data-v': o }, atStart ? cap(o) : o));
      const sentenceEl = h('p', { class: 'sentence', hidden: mode === 'listen' }, before, blank, after);
      stage.replaceChildren(
        h('div', { class: 'card' },
          h('span', { class: 'eyebrow' }, mode === 'listen' ? 'Which article do you hear?' : 'Which article fits?'),
          mode === 'listen' ? h('div', { class: 'listen-hero', style: { padding: '4px 0' } },
            h('button', { class: 'play-big', 'aria-label': 'Play the sentence', onclick: () => Speech.speak(full) }, icon('play')),
            h('button', { class: 'btn ghost', onclick: () => Speech.speak(full, { speed: 'slow' }) }, icon('slow'), 'Slower'),
            h('p', { class: 'sentence' }, h('span', { class: 'blank' }, '?'), ' ', noun, ' …')) : null,
          sentenceEl,
          mode === 'read' ? h('p', { class: 'muted' }, it.en) : null),
        h('div', { class: 'a2-options' }, opts),
        fb);
      if (mode === 'listen') setTimeout(() => Speech.speak(full), 250);
    }

    function results() {
      bar.style.width = '100%';
      stage.replaceChildren(h('div', { class: 'panel' },
        h('h2', {}, `${score} of ${round.length} correct`),
        h('p', { class: 'muted' }, 'Quick guide: Nominative = subject · Accusative = direct object, für/durch/ohne/gegen/um, movement (Wohin?) · Dative = to whom, mit/bei/aus/nach/seit/von/zu, location (Wo?) · Genitive = whose, wegen/während.'),
        mistakes.length ? h('ul', { class: 'issues' }, mistakes.map(it => h('li', { class: 'lvl-error' },
          h('span', { class: 'row', style: { flexWrap: 'nowrap' } }, h('span', { style: { flex: 1 } }, filled(it)), speakBtn(filled(it))),
          h('span', { class: 'src' }, `${CASE_NAMES[it.c]} · ${it.why}`)))) : null,
        h('div', { class: 'row' },
          h('button', { class: 'btn gold', onclick: () => UI.runDrill('a2', poolChoice) }, 'Another round'),
          h('button', { class: 'btn', onclick: () => go('drills', { pool: poolChoice }) }, 'Other drills'))));
      renderStreak();
    }
    ask();
  }

  // Say a full sentence and see which words were recognised.
  function sayItButton(target) {
    if (!Speech.canListen) return null;
    const out = h('span', {});
    const b = h('button', { class: 'btn', onclick: async () => {
      b.disabled = true; b.lastChild.textContent = 'Listening…';
      const r = await Speech.listen();
      b.disabled = false; b.lastChild.textContent = 'Say it';
      if (!r.ok) { toast('Nothing recognised. Try again.'); return; }
      const words = target.split(' ');
      let best = null;
      for (const alt of r.alternatives) {
        const heard = new Set(Lang.fold(alt).split(' '));
        const hits = words.map(t => heard.has(Lang.fold(t)));
        const sc = hits.filter(Boolean).length / words.length;
        if (!best || sc > best.sc) best = { sc, hits };
      }
      out.replaceChildren(h('span', { class: 'heard-words', style: { marginTop: '6px' } }, words.map((t, k) => h('span', { class: best.hits[k] ? 'hit' : 'miss' }, t))));
    } }, icon('mic'), h('span', {}, 'Say it'));
    return h('span', { class: 'stack', style: { gap: '4px' } }, b, out);
  }

  window.TalkDrills = { answer, ask, sentence, story, a2 };
})();
