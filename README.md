# Wortschatz A1

A free web app for learning the 252 core **A1 German words**
(from the StudyGerman.io A1 list). For every word you learn the
**article**, the **pronunciation**, how to **use it in a sentence**, and how to
**recognise it when someone says it**.

No accounts, no API keys, no cost. It runs in the browser and works offline once loaded.

## What's inside

| Section | What it does |
|---|---|
| **Today** | Your daily plan: reviews due, new words, skill accuracy, topics, and the words you get wrong most. |
| **Words** | All 252 words, searchable in German or English, filterable by topic and by der/die/das. Tap a word for audio (normal and slow), plural, example sentence, pronunciation tips and a case table (der/den/dem, ein/einen/einem). |
| **Review** | Spaced repetition (SM-2 style). New words are introduced first, then quizzed. Cards alternate between *English → say the German* and *German audio → what does it mean?*. |
| **Drills** | Ten-question rounds, weakest words first: |
| | • **der, die, das**: article trainer with colour coding and gender rules (‑ung → die, ‑chen → das, days → der …) |
| | • **Hear it**: listen and choose the meaning; word, sentence, or fast-speech mode |
| | • **Dictation**: write what you hear, with ä ö ü ß keys |
| | • **Say it**: speak the word; speech recognition checks you. *Shadow* mode scores full sentences word by word. |
| | • **Fill the gap**: complete the example sentence |
| | • **Build the sentence**: put the words in order (German verb-second word order) |

Colours follow the classroom convention: **der = blue, die = red, das = green**.

## The (free) APIs it uses

Both are the browser's built-in **Web Speech API**, so there are no keys and no billing:

* **Text-to-speech** (`speechSynthesis`) reads every word and sentence in German.
  In Chrome this is Google's own "Google Deutsch" voice. You can choose the voice and speed in *Today → Settings*.
* **Speech recognition** (`SpeechRecognition`) listens to you in German (`de-DE`).
  In Chrome it runs on Google's speech service. It works in **Chrome, Edge and Safari** (desktop and mobile).
  Firefox has no speech recognition, so speaking drills fall back to self-grading there.

Recognition needs `https://` (or `localhost`) and microphone permission.

## Run it

It is a static site: no build step, no dependencies.

**On your computer**
```bash
cd German_Vocab
python3 -m http.server 8000
# open http://localhost:8000 in Chrome
```

**On your phone (recommended): GitHub Pages**
1. On GitHub: *Settings → Pages → Build and deployment → Deploy from a branch*, pick this branch and `/ (root)`.
2. Open `https://<your-username>.github.io/German_Vocab/` on your phone in Chrome or Safari.
3. Use *Add to Home Screen*. It then opens like an app and works offline
   (speech recognition still needs internet).

## Your progress

Progress is stored in your browser (`localStorage`). To move it to another device, use
*Today → Settings & backup → Copy backup* and paste it into *Restore* on the other device.

## Files

```
index.html            app shell
css/styles.css        styles (light + dark)
js/data.js            the 252 words: article, plural, English, example sentence, topic
js/store.js           settings, spaced-repetition scheduler, pronunciation and gender rules
js/speech.js          Web Speech API wrapper (TTS + recognition)
js/app.js             views and drills
sw.js, manifest.webmanifest, icons/   offline support and install-to-home-screen
```

## A suggested routine (15–20 min/day)

1. **Review**: do everything due, plus 10 new words. Say every word out loud with its article.
2. **der, die, das**: one round.
3. **Hear it**: one round in *Sentences* mode. Switch to *Fast speech* once it's easy.
4. **Say it**: one round of *Shadow sentences*.

At 10 new words a day you meet all 252 words in under 4 weeks. Reviews keep them in long-term memory.
