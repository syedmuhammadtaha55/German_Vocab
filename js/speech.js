// Speech layer: free, built into the browser, no API key.
//  - Text-to-speech: Web Speech API speechSynthesis (Chrome uses Google's German voice).
//  - Speech recognition: Web Speech API SpeechRecognition (Chrome/Edge/Safari; not Firefox).
(function () {
  const synth = window.speechSynthesis;
  let voices = [];
  let chosen = null;

  function loadVoices() {
    if (!synth) return;
    voices = synth.getVoices().filter(v => /^de(-|_|$)/i.test(v.lang));
    const pref = Settings.get('voice');
    chosen =
      voices.find(v => v.name === pref) ||
      voices.find(v => /google/i.test(v.name) && /de-DE/i.test(v.lang)) ||
      voices.find(v => /de-DE/i.test(v.lang) && /(natural|online|premium|enhanced)/i.test(v.name)) ||
      voices.find(v => /de-DE/i.test(v.lang)) ||
      voices[0] || null;
    document.dispatchEvent(new CustomEvent('voices-ready'));
  }
  if (synth) {
    loadVoices();
    synth.addEventListener?.('voiceschanged', loadVoices);
    if (!voices.length) setTimeout(loadVoices, 600);
  }

  const RATES = { slow: 0.6, normal: 0.9, fast: 1.15 };

  function speak(text, opts = {}) {
    return new Promise(resolve => {
      if (!synth) return resolve(false);
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'de-DE';
      if (chosen) u.voice = chosen;
      const base = RATES[opts.speed || 'normal'] || 0.9;
      u.rate = base * (Settings.get('rateScale') || 1);
      u.onend = () => resolve(true);
      u.onerror = () => resolve(false);
      synth.speak(u);
      // Chrome sometimes stalls long utterances; nudge it.
      setTimeout(() => { if (synth.paused) synth.resume(); }, 250);
    });
  }

  // Embedded frames usually cannot use the microphone, so fall back to self-check there.
  let framed = false;
  try { framed = window.self !== window.top; } catch (_) { framed = true; }
  const Recognition = framed ? null : (window.SpeechRecognition || window.webkitSpeechRecognition);

  // Listen once in German. Resolves with { ok, alternatives: [transcript...], error }
  function listen() {
    return new Promise(resolve => {
      if (!Recognition) return resolve({ ok: false, error: 'unsupported', alternatives: [] });
      synth && synth.cancel();
      const rec = new Recognition();
      rec.lang = 'de-DE';
      rec.interimResults = false;
      rec.maxAlternatives = 5;
      rec.continuous = false;
      let done = false;
      const finish = r => { if (!done) { done = true; resolve(r); } };
      rec.onresult = e => {
        const alts = [];
        for (const res of e.results) for (const a of res) alts.push(a.transcript.trim());
        finish({ ok: true, alternatives: alts });
      };
      rec.onerror = e => finish({ ok: false, error: e.error || 'error', alternatives: [] });
      rec.onend = () => finish({ ok: false, error: 'no-speech', alternatives: [] });
      try { rec.start(); } catch (err) { finish({ ok: false, error: 'start-failed', alternatives: [] }); }
      listen.stop = () => { try { rec.stop(); } catch (_) {} };
    });
  }

  window.Speech = {
    speak,
    listen,
    get canSpeak() { return !!synth; },
    get canListen() { return !!Recognition; },
    get voices() { return voices; },
    get voice() { return chosen; },
    setVoice(name) { Settings.set('voice', name); loadVoices(); },
  };
})();
