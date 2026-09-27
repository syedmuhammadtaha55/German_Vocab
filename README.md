# Taha's Lehrer

A free web app for learning **904 A1 German words**: the StudyGerman.io A1 list (252 words)
merged with the official **Goethe-Zertifikat A1 (Start Deutsch 1)** word list, without duplicates. For every word you learn the
**article**, the **pronunciation**, how to **use it in a sentence**, and how to
**recognise it when someone says it**.

No accounts, no API keys, no cost. It runs in the browser and works offline once loaded.

## What's inside

| Section | What it does |
|---|---|
| **Today** | Your daily plan: reviews due, new words, skill accuracy, topics, and the words you get wrong most. |
| **Words** | All 904 words, searchable in German or English, filterable by list (StudyGerman / Goethe), topic, der/die/das, verbs, adjectives and phrases. Tap a word for audio (normal and slow), plural, example sentence, pronunciation tips and a case table (der/den/dem, ein/einen/einem). |
| **Review** | Spaced repetition (SM-2 style). New words are introduced first, then quizzed. Cards alternate between *English → say the German* and *German audio → what does it mean?*. |
| **Drills** | Ten-question rounds, weakest words first: |
| | • **der, die, das**: article trainer with colour coding and gender rules (‑ung → die, ‑chen → das, days → der …) |
| | • **Hear it**: listen and choose the meaning; word, sentence, or fast-speech mode |
| | • **Dictation**: write what you hear, with ä ö ü ß keys |
| | • **Say it**: speak the word; speech recognition checks you. *Shadow* mode scores full sentences word by word. |
| | • **Fill the gap**: complete the example sentence |
| | • **Build the sentence**: put the words in order (German verb-second word order) |
| **Drills: Speak & write** | Free answers, spoken or typed, reviewed by the app: |
| | • **Answer questions**: hear a German question (text hidden by default) and answer it |
| | • **Ask questions**: turn an English situation into a German question; your partner answers |
| | • **Make sentences**: use 1–3 of your words in your own sentence |
| | • **Tell a story**: 3+ sentences using 5–6 words from a scene or from your list |
| **Drills: A2 level** | **Articles in A2 sentences**: 65 sentences covering nominative, accusative, dative and genitive (der/den/dem/des, ein/einen/einem, mein/meinen…). *Read* or *Listen* mode, a case explanation after each answer, and a "Say it" check. |

### How free answers are reviewed

1. **Offline checks (always on):** each noun from the word list is checked against its article
   ("die Hund" → "den Hund", with the likely case), plus verb forms for 30+ common verbs ("ich bist" → "bin"),
   capital letters on nouns, punctuation, question word order, staying on topic, and whether you used the target words.
2. **LanguageTool (free, no key, on by default):** a full German grammar and spelling check from languagetool.org.
   Limit: about 20 checks per minute.
3. **Google Gemini tutor (optional, free key):** paste a key from <https://aistudio.google.com/apikey> in
   *Today → Settings*. You then get corrections with explanations, a reply as a conversation partner, and a
   follow-up question so the conversation continues.

Colours follow the classroom convention: **der = blue, die = red, das = green**.

## The (free) APIs it uses

Both are the browser's built-in **Web Speech API**, so there are no keys and no billing:

* **Text-to-speech** (`speechSynthesis`) reads every word and sentence in German.
  In Chrome this is Google's own "Google Deutsch" voice. You can choose the voice and speed in *Today → Settings*.
* **LanguageTool** (`api.languagetool.org`): free grammar checking for the Speak & write drills.
* **Google Gemini** (optional, your own free key): tutor feedback.
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
js/data.js            the 904 words: article, plural, English, example sentences, topic, source list
tools/build_vocab.py  merges the Goethe list (tools/goethe_*.py) into js/data.js, skipping duplicates
js/store.js           settings, spaced-repetition scheduler, pronunciation and gender rules
js/speech.js          Web Speech API wrapper (TTS + recognition)
js/app.js             views and drills
js/talk.js            conversation drills and the A2 article drill
js/checker.js         answer review: offline rules + LanguageTool + optional Gemini
js/talk-data.js       questions, question prompts and story scenes
js/a2.js              A2 article-in-context sentences
sw.js, manifest.webmanifest, icons/   offline support and install-to-home-screen
```

## A suggested routine (15–20 min/day)

1. **Review**: do everything due, plus 10 new words. Say every word out loud with its article.
2. **der, die, das**: one round.
3. **Hear it**: one round in *Sentences* mode. Switch to *Fast speech* once it's easy.
4. **Say it**: one round of *Shadow sentences*.
5. **Answer questions**: 5 questions, answered out loud. Every few days, **Tell a story**.
6. Once the A1 articles are easy, add a round of **Articles in A2 sentences**.

At 10 new words a day you meet all 904 words in about 3 months (Settings → *New words come from* lets you do the Goethe exam list first). Reviews keep them in long-term memory.

## The word lists

* **StudyGerman A1** (ids 1–252): the original list with example sentences.
* **Goethe-Zertifikat A1** (ids 253–904): the Start Deutsch 1 exam word list, with English meanings,
  plurals and translated example sentences added. Numbers, grau/braun, compass directions and measures
  come from the list's word groups.
* **105 words are on both lists.** They appear once. Their card keeps your progress and shows the Goethe
  example as a second example sentence.

To change the Goethe words, edit `tools/goethe_*.py` and run `python3 tools/build_vocab.py`.
