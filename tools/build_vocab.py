"""Merge the Goethe A1 word list into js/data.js.

Existing entries (ids 1-252, StudyGerman list) keep their ids so learning
progress stays valid. A Goethe word that is already in the list is not added
again: the existing entry is tagged as being on the Goethe list and gets the
Goethe example sentence as an extra example. New words get ids from 253 on.

Run from the repo root:  python3 tools/build_vocab.py
"""
import json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
from goethe_a_e import ROWS as A
from goethe_f_l import ROWS as F
from goethe_m_r import ROWS as M
from goethe_s_z import ROWS as S

CATS = {
    'fam': 'Family, school & work', 'town': 'Town & places', 'nat': 'Nature & weather',
    'col': 'Colours', 'desc': 'Describing things', 'feel': 'Feelings & states',
    'time': 'Clock & frequency',
    'per': 'Personal details & forms', 'home': 'Home & housing', 'food': 'Food & drink',
    'shop': 'Shopping & money', 'trav': 'Travel & transport', 'work': 'Work & study',
    'body': 'Body & health', 'free': 'Free time & celebrations', 'comm': 'Post, phone & internet',
    'verb': 'Everyday verbs', 'small': 'Small words & phrases', 'num': 'Numbers & measures',
    'geo': 'Countries & directions',
}
TYPES = {'n': 'noun', 'a': 'adj', 'd': 'adv', 'v': 'verb', 'w': 'word', 'p': 'phrase'}
ADJ_NOUNS = {'Bekannte', 'Beamte', 'Erwachsene', 'Jugendliche', 'Verwandte', 'Deutsche'}

path = os.path.join(ROOT, 'js', 'data.js')
src = open(path, encoding='utf-8').read()
old = json.loads(re.search(r'window\.VOCAB = (\[.*?\]);\n', src, re.S).group(1))
old = [w for w in old if w['id'] <= 252]   # rebuild idempotently
old_cats = json.loads(re.search(r'window\.CATEGORIES = (\[.*?\]);', src).group(1))[:11]


def key(de, is_noun):
    d = re.sub(r'\s*\(.*?\)', '', de).strip()
    if is_noun:
        d = re.sub(r'^(der|die|das)\s+', '', d)
    d = re.sub(r'^sich\s+', '', d)
    return ('n:' if is_noun else 'x:') + d.lower()


index = {}
for w in old:
    w.setdefault('lists', ['sg'])
    index[key(w['de'], w['type'] == 'noun')] = w

out = [dict(w) for w in old]
by_id = {w['id']: w for w in out}
next_id = 253
seen = set()
dups, added = [], []
for de, en, t, cat, pl, ex, ex_en in A + F + M + S:
    is_noun = t == 'n'
    k = key(de, is_noun)
    if (k, en) in seen:
        continue
    seen.add((k, en))
    if k in index and index[k]['id'] <= 252:
        w = by_id[index[k]['id']]
        if 'goethe' not in w['lists']:
            w['lists'] = w['lists'] + ['goethe']
        if ex and ex != w['ex'] and not any(m['de'] == ex for m in w.get('more', [])):
            w.setdefault('more', []).append({'de': ex, 'en': ex_en})
        # Goethe adds a second meaning (bank → bank / bench): show both.
        if '/' not in w['en'] and '/' in en and en.split(' / ')[0] == w['en']:
            w['en'] = en
        if is_noun and pl and not w.get('pl') and w.get('noun') and ' ' not in w['noun']:
            w['pl'] = pl
        dups.append(de)
        continue
    display = re.sub(r'\s*\(Pronomen\)', '', de)
    w = {'id': next_id, 'de': display, 'en': en, 'ex': ex, 'exEn': ex_en,
         'type': TYPES[t], 'cat': CATS[cat], 'lists': ['goethe']}
    if is_noun:
        art, noun = display.split(' ', 1)
        w['art'], w['noun'] = art, noun
        if '(plural)' in en:
            w['plOnly'] = True
        elif pl:
            w['pl'] = pl
        if noun in ADJ_NOUNS:
            w['adjNoun'] = True
    out.append(w)
    index.setdefault(k, w)
    added.append(display)
    next_id += 1

cats = old_cats + [c for c in CATS.values() if c not in old_cats]
used = {w['cat'] for w in out}
cats = [c for c in cats if c in used]

js = ('// A1 German vocabulary: the StudyGerman.io A1 list (ids 1-252) merged with the\n'
      '// Goethe-Zertifikat A1 (Start Deutsch 1) word list (ids 253+). Built by tools/build_vocab.py.\n'
      '// type: noun | adj | adv | verb | word | phrase   art: der/die/das   pl: plural\n'
      '// lists: which source lists contain the word ("sg", "goethe")   more: extra examples\n'
      '// plOnly: plural-only noun   adjNoun: noun declined like an adjective (der Bekannte / ein Bekannter)\n'
      'window.VOCAB = [\n' + ',\n'.join(json.dumps(w, ensure_ascii=False) for w in out) + '\n];\n'
      'window.CATEGORIES = ' + json.dumps(cats, ensure_ascii=False) + ';\n')
open(path, 'w', encoding='utf-8').write(js)
print(f'{len(old)} existing, {len(dups)} duplicates merged, {len(added)} new -> {len(out)} words, {len(cats)} topics')
print('Duplicates:', ', '.join(dups))
