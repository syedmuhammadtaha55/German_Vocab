// A2 article-in-context sentences. "___" marks the gap.
// set: which article family the options come from (def = der/die/das…, indef = ein/eine…, poss = mein/meine…)
// g: gender of the noun (m, f, n, pl)   c: case   why: the reason, shown after answering
window.A2_ARTICLES = [
  // Nominative traps: the noun is the subject
  { s: '___ Wetter ist heute schlecht.', a: 'das', set: 'def', g: 'n', c: 'Nom', why: 'Wetter is the subject (who/what is bad?), so nominative: das.', en: 'The weather is bad today.' },
  { s: 'Ist ___ Supermarkt heute geöffnet?', a: 'der', set: 'def', g: 'm', c: 'Nom', why: 'Supermarkt is the subject of "ist", so nominative: der.', en: 'Is the supermarket open today?' },
  { s: 'Wie gefällt dir ___ Wohnung?', a: 'die', set: 'def', g: 'f', c: 'Nom', why: 'With gefallen, the thing that pleases is the subject: die Wohnung (nominative). "dir" is the dative.', en: 'How do you like the apartment?' },
  { s: 'Das ist ___ Geschenk für dich.', a: 'ein', set: 'indef', g: 'n', c: 'Nom', why: 'After "das ist" the noun stays nominative: ein Geschenk.', en: 'This is a present for you.' },
  { s: 'Das ist ___ Lehrerin.', a: 'meine', set: 'poss', g: 'f', c: 'Nom', why: 'Nominative feminine: meine (like eine).', en: 'This is my teacher.' },
  { s: '___ Kinder spielen im Garten.', a: 'die', set: 'def', g: 'pl', c: 'Nom', why: 'Plural nominative is always die.', en: 'The children are playing in the garden.' },
  { s: 'Morgen kommt ___ Bruder von Anna.', a: 'der', set: 'def', g: 'm', c: 'Nom', why: 'The subject comes after the verb here (time first), but it is still nominative: der Bruder.', en: 'Tomorrow Anna\'s brother is coming.' },

  // Accusative: direct object
  { s: 'Ich sehe ___ Hund im Park.', a: 'den', set: 'def', g: 'm', c: 'Akk', why: 'Hund is the direct object of "sehen" (what do I see?). Masculine accusative: der → den.', en: 'I see the dog in the park.' },
  { s: 'Wir kaufen morgen ___ Auto.', a: 'das', set: 'def', g: 'n', c: 'Akk', why: 'Direct object of "kaufen". Neuter stays das in the accusative.', en: 'We are buying the car tomorrow.' },
  { s: 'Sie öffnet ___ Tür.', a: 'die', set: 'def', g: 'f', c: 'Akk', why: 'Direct object of "öffnen". Feminine stays die in the accusative.', en: 'She opens the door.' },
  { s: 'Hast du ___ Brief schon gelesen?', a: 'den', set: 'def', g: 'm', c: 'Akk', why: 'Brief is what you read: direct object. der → den.', en: 'Have you read the letter yet?' },
  { s: 'Kannst du bitte ___ Fenster schließen?', a: 'das', set: 'def', g: 'n', c: 'Akk', why: 'Direct object of "schließen"; das stays das.', en: 'Can you close the window, please?' },
  { s: 'Ich suche ___ Bahnhof.', a: 'den', set: 'def', g: 'm', c: 'Akk', why: '"suchen" takes a direct object: der Bahnhof → den Bahnhof.', en: 'I am looking for the train station.' },
  { s: 'Ich habe ___ Hund und eine Katze.', a: 'einen', set: 'indef', g: 'm', c: 'Akk', why: '"haben" takes the accusative. Masculine: ein → einen.', en: 'I have a dog and a cat.' },
  { s: 'Er kauft ___ Banane.', a: 'eine', set: 'indef', g: 'f', c: 'Akk', why: 'Feminine accusative stays eine.', en: 'He buys a banana.' },
  { s: 'Wir suchen ___ Wohnung in der Stadt.', a: 'eine', set: 'indef', g: 'f', c: 'Akk', why: 'Direct object, feminine: eine.', en: 'We are looking for an apartment in the city.' },
  { s: 'Ich brauche ___ Computer.', a: 'einen', set: 'indef', g: 'm', c: 'Akk', why: '"brauchen" + accusative. Masculine: einen.', en: 'I need a computer.' },
  { s: 'Gibt es hier ___ Restaurant?', a: 'ein', set: 'indef', g: 'n', c: 'Akk', why: '"es gibt" always takes the accusative. Neuter: ein.', en: 'Is there a restaurant here?' },
  { s: 'Ich trinke ___ Glas Wasser.', a: 'ein', set: 'indef', g: 'n', c: 'Akk', why: 'Das Glas is neuter; accusative neuter: ein.', en: 'I drink a glass of water.' },
  { s: 'Ich rufe heute ___ Mutter an.', a: 'meine', set: 'poss', g: 'f', c: 'Akk', why: '"anrufen" takes the accusative. Feminine: meine.', en: 'I am calling my mother today.' },
  { s: 'Ich habe ___ Schlüssel vergessen.', a: 'meinen', set: 'poss', g: 'm', c: 'Akk', why: 'der Schlüssel is the direct object: mein → meinen.', en: 'I forgot my key.' },
  { s: 'Er legt ___ Bücher auf den Tisch.', a: 'die', set: 'def', g: 'pl', c: 'Akk', why: 'Plural accusative is die.', en: 'He puts the books on the table.' },

  // Accusative prepositions: durch, für, gegen, ohne, um
  { s: 'Das Geschenk ist für ___ Mutter.', a: 'die', set: 'def', g: 'f', c: 'Akk', why: '"für" always takes the accusative. die stays die.', en: 'The present is for the mother.' },
  { s: 'Wir gehen durch ___ Wald.', a: 'den', set: 'def', g: 'm', c: 'Akk', why: '"durch" always takes the accusative: der Wald → den Wald.', en: 'We walk through the forest.' },
  { s: 'Ich gehe nicht ohne ___ Hund spazieren.', a: 'den', set: 'def', g: 'm', c: 'Akk', why: '"ohne" always takes the accusative: den Hund.', en: 'I don\'t go for a walk without the dog.' },
  { s: 'Das Auto fährt gegen ___ Baum.', a: 'den', set: 'def', g: 'm', c: 'Akk', why: '"gegen" always takes the accusative: der Baum → den Baum.', en: 'The car drives into the tree.' },

  // Two-way prepositions with movement (Wohin?) → accusative
  { s: 'Ich lege das Buch auf ___ Tisch.', a: 'den', set: 'def', g: 'm', c: 'Akk', why: 'Movement to a place (Wohin? onto the table) → accusative: den Tisch.', en: 'I put the book on the table.' },
  { s: 'Wir gehen heute in ___ Park.', a: 'den', set: 'def', g: 'm', c: 'Akk', why: '"in" + movement (Wohin?) → accusative: den Park.', en: 'We are going to the park today.' },
  { s: 'Stell den Stuhl neben ___ Tisch.', a: 'den', set: 'def', g: 'm', c: 'Akk', why: 'You move the chair somewhere (Wohin?) → accusative: den Tisch.', en: 'Put the chair next to the table.' },
  { s: 'Die Kinder laufen in ___ Schule.', a: 'die', set: 'def', g: 'f', c: 'Akk', why: 'Movement into (Wohin?) → accusative, feminine stays die.', en: 'The children run to school.' },

  // Dative: indirect object and dative verbs
  { s: 'Ich helfe ___ Frau.', a: 'der', set: 'def', g: 'f', c: 'Dat', why: '"helfen" always takes the dative. Feminine dative: die → der.', en: 'I help the woman.' },
  { s: 'Das Buch gehört ___ Kind.', a: 'dem', set: 'def', g: 'n', c: 'Dat', why: '"gehören" takes the dative. Neuter dative: das → dem.', en: 'The book belongs to the child.' },
  { s: 'Ich gebe ___ Hund Wasser.', a: 'dem', set: 'def', g: 'm', c: 'Dat', why: 'The receiver (to whom?) is dative: der → dem.', en: 'I give the dog water.' },
  { s: 'Wir danken ___ Lehrerin.', a: 'der', set: 'def', g: 'f', c: 'Dat', why: '"danken" takes the dative. Feminine dative: der.', en: 'We thank the teacher.' },
  { s: 'Das Essen schmeckt ___ Kind nicht.', a: 'dem', set: 'def', g: 'n', c: 'Dat', why: '"schmecken" + dative (tastes good to whom?): dem Kind.', en: 'The child doesn\'t like the food.' },
  { s: 'Ich antworte ___ Lehrer.', a: 'dem', set: 'def', g: 'm', c: 'Dat', why: '"antworten" takes the dative: der → dem.', en: 'I answer the teacher.' },
  { s: 'Kannst du ___ Mann helfen?', a: 'dem', set: 'def', g: 'm', c: 'Dat', why: '"helfen" + dative: dem Mann.', en: 'Can you help the man?' },
  { s: 'Sie schreibt ___ Freundin eine E-Mail.', a: 'einer', set: 'indef', g: 'f', c: 'Dat', why: 'The person receiving the e-mail is dative. Feminine: eine → einer.', en: 'She writes an e-mail to a friend.' },
  { s: 'Ich schenke ___ Bruder ein Buch.', a: 'meinem', set: 'poss', g: 'm', c: 'Dat', why: 'The receiver (to whom?) is dative: mein → meinem.', en: 'I give my brother a book.' },
  { s: 'Ich gebe ___ Kindern Schokolade.', a: 'den', set: 'def', g: 'pl', c: 'Dat', why: 'Dative plural is den, and the noun gets an extra -n: den Kindern.', en: 'I give the children chocolate.' },

  // Dative prepositions: aus, bei, mit, nach, seit, von, zu
  { s: 'Ich fahre mit ___ Auto zur Arbeit.', a: 'dem', set: 'def', g: 'n', c: 'Dat', why: '"mit" always takes the dative: das → dem.', en: 'I drive to work by car.' },
  { s: 'Nach ___ Arbeit gehe ich nach Hause.', a: 'der', set: 'def', g: 'f', c: 'Dat', why: '"nach" always takes the dative. Feminine: der Arbeit.', en: 'After work I go home.' },
  { s: 'Sie kommt aus ___ Stadt.', a: 'der', set: 'def', g: 'f', c: 'Dat', why: '"aus" always takes the dative: die → der.', en: 'She comes from the city.' },
  { s: 'Das Kind wohnt bei ___ Mutter.', a: 'der', set: 'def', g: 'f', c: 'Dat', why: '"bei" always takes the dative: der Mutter.', en: 'The child lives with the mother.' },
  { s: 'Ich wohne seit ___ Jahr in Berlin.', a: 'einem', set: 'indef', g: 'n', c: 'Dat', why: '"seit" always takes the dative. Neuter: ein → einem.', en: 'I have lived in Berlin for a year.' },
  { s: 'Ich spreche mit ___ Mann.', a: 'dem', set: 'def', g: 'm', c: 'Dat', why: '"mit" + dative: der → dem.', en: 'I am talking to the man.' },
  { s: 'Mit ___ Freund gehe ich ins Kino.', a: 'einem', set: 'indef', g: 'm', c: 'Dat', why: '"mit" + dative. Masculine: ein → einem.', en: 'I go to the cinema with a friend.' },
  { s: 'Ich wohne bei ___ Eltern.', a: 'meinen', set: 'poss', g: 'pl', c: 'Dat', why: '"bei" + dative; dative plural: meinen.', en: 'I live with my parents.' },
  { s: 'Ich warte seit ___ Viertelstunde.', a: 'einer', set: 'indef', g: 'f', c: 'Dat', why: '"seit" + dative. Feminine: eine → einer.', en: 'I have been waiting for a quarter of an hour.' },
  { s: 'Vor ___ Woche war ich krank.', a: 'einer', set: 'indef', g: 'f', c: 'Dat', why: '"vor" meaning "ago" takes the dative: vor einer Woche.', en: 'A week ago I was sick.' },
  { s: 'Er kommt in ___ Stunde.', a: 'einer', set: 'indef', g: 'f', c: 'Dat', why: '"in" + time (when?) takes the dative: in einer Stunde.', en: 'He is coming in an hour.' },

  // Two-way prepositions with location (Wo?) → dative
  { s: 'Das Buch liegt auf ___ Tisch.', a: 'dem', set: 'def', g: 'm', c: 'Dat', why: 'Location, no movement (Wo?) → dative: dem Tisch.', en: 'The book is lying on the table.' },
  { s: 'Die Katze schläft unter ___ Stuhl.', a: 'dem', set: 'def', g: 'm', c: 'Dat', why: 'Where is the cat? Location → dative: dem Stuhl.', en: 'The cat sleeps under the chair.' },
  { s: 'Das Bild hängt an ___ Wand.', a: 'der', set: 'def', g: 'f', c: 'Dat', why: 'Location (Wo?) → dative. die Wand → der Wand.', en: 'The picture hangs on the wall.' },
  { s: 'Der Hund liegt vor ___ Tür.', a: 'der', set: 'def', g: 'f', c: 'Dat', why: 'Location (Wo?) → dative: der Tür.', en: 'The dog is lying in front of the door.' },
  { s: 'Das Café ist neben ___ Bank.', a: 'der', set: 'def', g: 'f', c: 'Dat', why: 'Location (Wo?) → dative: der Bank.', en: 'The café is next to the bank.' },
  { s: 'Er wartet vor ___ Bahnhof.', a: 'dem', set: 'def', g: 'm', c: 'Dat', why: 'Location (Wo?) → dative: dem Bahnhof.', en: 'He is waiting in front of the station.' },
  { s: 'Er wohnt in ___ Haus am See.', a: 'einem', set: 'indef', g: 'n', c: 'Dat', why: 'Location (Wo?) → dative. Neuter: ein → einem.', en: 'He lives in a house by the lake.' },
  { s: 'Sie arbeitet in ___ Krankenhaus.', a: 'einem', set: 'indef', g: 'n', c: 'Dat', why: 'Where does she work? Location → dative: einem Krankenhaus.', en: 'She works in a hospital.' },
  { s: 'In ___ Nacht schlafe ich.', a: 'der', set: 'def', g: 'f', c: 'Dat', why: '"in" + time (when?) → dative: in der Nacht.', en: 'At night I sleep.' },

  // Genitive (whose?)
  { s: 'Das ist das Auto ___ Vaters.', a: 'des', set: 'def', g: 'm', c: 'Gen', why: 'Whose car? Genitive masculine: des, and the noun gets -s: des Vaters.', en: 'That is the father\'s car.' },
  { s: 'Die Farbe ___ Hauses ist weiß.', a: 'des', set: 'def', g: 'n', c: 'Gen', why: 'Genitive neuter: des Hauses (noun gets -es).', en: 'The colour of the house is white.' },
  { s: 'Der Name ___ Straße ist lang.', a: 'der', set: 'def', g: 'f', c: 'Gen', why: 'Genitive feminine: die → der.', en: 'The name of the street is long.' },
  { s: 'Wegen ___ Regens bleiben wir zu Hause.', a: 'des', set: 'def', g: 'm', c: 'Gen', why: '"wegen" takes the genitive: des Regens.', en: 'Because of the rain we stay at home.' },
  { s: 'Während ___ Woche arbeite ich viel.', a: 'der', set: 'def', g: 'f', c: 'Gen', why: '"während" takes the genitive. Feminine: der Woche.', en: 'During the week I work a lot.' },
];

window.A2_SETS = {
  def: ['der', 'die', 'das', 'den', 'dem', 'des'],
  indef: ['ein', 'eine', 'einen', 'einem', 'einer', 'eines'],
  poss: ['mein', 'meine', 'meinen', 'meinem', 'meiner', 'meines'],
};
window.CASE_NAMES = { Nom: 'Nominative', Akk: 'Accusative', Dat: 'Dative', Gen: 'Genitive' };
