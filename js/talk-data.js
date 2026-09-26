// Conversation prompts built from the A1 word list.
// topic: word stems that show the answer is on topic (any one is enough).

// The app asks, you answer.
window.TALK_QUESTIONS = [
  { q: 'Wie ist das Wetter heute?', en: 'How is the weather today?', topic: ['wetter', 'sonne', 'regen', 'schnee', 'wind', 'kalt', 'warm', 'heiß', 'kühl', 'schön', 'schlecht', 'bewölkt', 'scheint', 'regnet', 'schneit'], sample: 'Heute ist das Wetter schön. Die Sonne scheint.' },
  { q: 'Was trinkst du gern?', en: 'What do you like to drink?', topic: ['trink', 'wasser', 'milch', 'kaffee', 'tee', 'saft'], sample: 'Ich trinke gern Wasser und Kaffee.' },
  { q: 'Was isst du zum Frühstück?', en: 'What do you eat for breakfast?', topic: ['ess', 'brot', 'apfel', 'banane', 'milch', 'frühstück', 'kaffee'], sample: 'Zum Frühstück esse ich Brot und einen Apfel.' },
  { q: 'Hast du ein Haustier?', en: 'Do you have a pet?', topic: ['hund', 'katze', 'haustier', 'ja', 'nein'], sample: 'Ja, ich habe einen Hund. Der Hund ist klein.' },
  { q: 'Wo wohnst du?', en: 'Where do you live?', topic: ['wohn', 'haus', 'wohnung', 'stadt', 'land', 'in'], sample: 'Ich wohne in einer Wohnung in der Stadt.' },
  { q: 'Wie groß ist deine Familie?', en: 'How big is your family?', topic: ['familie', 'bruder', 'schwester', 'mutter', 'vater', 'kind', 'groß', 'klein'], sample: 'Meine Familie ist groß. Ich habe einen Bruder und eine Schwester.' },
  { q: 'Was machst du am Wochenende?', en: 'What do you do on the weekend?', topic: ['wochenende', 'park', 'freund', 'kino', 'schlafe', 'gehe', 'mache', 'lese', 'spiele'], sample: 'Am Wochenende gehe ich mit meinem Freund in den Park.' },
  { q: 'Wann ist dein Geburtstag?', en: 'When is your birthday?', topic: ['geburtstag', 'januar', 'februar', 'märz', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'dezember'], sample: 'Mein Geburtstag ist im Mai.' },
  { q: 'Welche Farbe magst du?', en: 'Which colour do you like?', topic: ['rot', 'blau', 'grün', 'gelb', 'schwarz', 'weiß', 'farbe'], sample: 'Ich mag Blau. Blau ist meine Lieblingsfarbe.' },
  { q: 'Wie fährst du zur Arbeit?', en: 'How do you get to work?', topic: ['auto', 'bus', 'zug', 'fahrrad', 'fahre', 'gehe', 'arbeit', 'zu fuß'], sample: 'Ich fahre mit dem Auto zur Arbeit.' },
  { q: 'Was ist dein Beruf?', en: 'What is your job?', topic: ['beruf', 'lehrer', 'student', 'arbeite', 'bin', 'ingenieur', 'arzt'], sample: 'Ich bin Lehrer. Ich arbeite in einer Schule.' },
  { q: 'Was hast du gestern Abend gemacht?', en: 'What did you do yesterday evening?', topic: ['gestern', 'habe', 'bin', 'war', 'gegessen', 'gelesen', 'geschlafen', 'gemacht', 'gesehen'], sample: 'Gestern Abend habe ich ein Buch gelesen.' },
  { q: 'Was machst du morgen früh?', en: 'What are you doing tomorrow morning?', topic: ['morgen', 'arbeit', 'schule', 'gehe', 'fahre', 'trinke', 'mache'], sample: 'Morgen früh gehe ich zur Arbeit.' },
  { q: 'Welcher Tag ist heute?', en: 'What day is today?', topic: ['montag', 'dienstag', 'mittwoch', 'donnerstag', 'freitag', 'samstag', 'sonntag', 'heute'], sample: 'Heute ist Mittwoch.' },
  { q: 'Welche Jahreszeit magst du am liebsten?', en: 'Which season do you like best?', topic: ['frühling', 'sommer', 'herbst', 'winter', 'mag'], sample: 'Ich mag den Sommer am liebsten, weil es warm ist.' },
  { q: 'Bist du heute müde?', en: 'Are you tired today?', topic: ['müde', 'wach', 'ja', 'nein', 'bin'], sample: 'Ja, ich bin heute sehr müde.' },
  { q: 'Wie oft gehst du ins Kino?', en: 'How often do you go to the cinema?', topic: ['oft', 'selten', 'nie', 'manchmal', 'immer', 'kino', 'wöchentlich', 'monatlich'], sample: 'Ich gehe manchmal ins Kino, vielleicht monatlich.' },
  { q: 'Wann stehst du normalerweise auf?', en: 'When do you usually get up?', topic: ['uhr', 'früh', 'spät', 'stehe', 'auf', 'normalerweise', 'morgen'], sample: 'Normalerweise stehe ich um sieben Uhr auf.' },
  { q: 'Was kaufst du im Supermarkt?', en: 'What do you buy at the supermarket?', topic: ['kaufe', 'milch', 'brot', 'banane', 'apfel', 'wasser', 'supermarkt'], sample: 'Im Supermarkt kaufe ich Milch, Brot und Bananen.' },
  { q: 'Wie ist deine Wohnung?', en: 'What is your apartment like?', topic: ['wohnung', 'groß', 'klein', 'hell', 'dunkel', 'schön', 'alt', 'neu', 'sauber', 'teuer', 'billig'], sample: 'Meine Wohnung ist klein, aber hell und sauber.' },
  { q: 'Wohnst du lieber am Meer oder in den Bergen?', en: 'Would you rather live by the sea or in the mountains?', topic: ['meer', 'berg', 'wohne', 'lieber', 'see', 'strand'], sample: 'Ich wohne lieber am Meer. Ich mag den Strand.' },
  { q: 'Wie spät ist es?', en: 'What time is it?', topic: ['uhr', 'ist', 'halb', 'viertel', 'mittag', 'mitternacht'], sample: 'Es ist drei Uhr.' },
  { q: 'Was machst du am Abend?', en: 'What do you do in the evening?', topic: ['abend', 'sehe', 'fern', 'lese', 'koche', 'esse', 'schlafe', 'gehe'], sample: 'Am Abend koche ich und dann sehe ich fern.' },
  { q: 'Hast du Hunger?', en: 'Are you hungry?', topic: ['hunger', 'hungrig', 'satt', 'ja', 'nein', 'esse'], sample: 'Nein, ich bin satt. Ich habe schon gegessen.' },
  { q: 'Wie ist das Wetter im Winter?', en: 'What is the weather like in winter?', topic: ['winter', 'kalt', 'schnee', 'schneit', 'dunkel', 'wind'], sample: 'Im Winter ist es kalt und es schneit oft.' },
  { q: 'Was machst du im Sommer?', en: 'What do you do in summer?', topic: ['sommer', 'strand', 'meer', 'urlaub', 'park', 'schwimme', 'fahre', 'gehe'], sample: 'Im Sommer fahre ich ans Meer und gehe zum Strand.' },
  { q: 'Kommst du oft zu spät?', en: 'Are you often late?', topic: ['spät', 'pünktlich', 'früh', 'nie', 'immer', 'manchmal', 'oft', 'selten', 'rechtzeitig'], sample: 'Nein, ich komme nie zu spät. Ich bin immer pünktlich.' },
  { q: 'Was ist wichtig für dich?', en: 'What is important to you?', topic: ['wichtig', 'familie', 'freund', 'arbeit', 'gesund', 'zeit', 'geld'], sample: 'Meine Familie ist sehr wichtig für mich.' },
  { q: 'Wie ist dein Lehrer oder deine Lehrerin?', en: 'What is your teacher like?', topic: ['lehrer', 'lehrerin', 'nett', 'freundlich', 'streng', 'gut', 'erklärt', 'jung', 'alt'], sample: 'Meine Lehrerin ist freundlich und erklärt gut.' },
  { q: 'Was machst du, wenn du krank bist?', en: 'What do you do when you are sick?', topic: ['krank', 'schlafe', 'bett', 'arzt', 'krankenhaus', 'tee', 'trinke', 'bleibe', 'hause'], sample: 'Wenn ich krank bin, bleibe ich zu Hause und schlafe viel.' },
];

// The app gives a situation in English; you ask the question in German.
// kind: w = W-question (wo, wann, was, wie…), yn = yes/no question (verb first)
// need: each inner list is one idea that must appear (any stem in it counts).
window.TALK_ASK = [
  { en: 'Ask someone where they live.', kind: 'w', need: [['wo'], ['wohn']], model: 'Wo wohnst du?', reply: 'Ich wohne in Hamburg, in einer kleinen Wohnung.' },
  { en: 'Ask someone what their job is.', kind: 'w', need: [['was'], ['beruf', 'arbeit']], model: 'Was ist dein Beruf?', reply: 'Ich bin Lehrerin. Ich arbeite in einer Schule.' },
  { en: 'Ask a friend if they have a dog.', kind: 'yn', need: [['hund']], model: 'Hast du einen Hund?', reply: 'Nein, aber ich habe eine Katze.' },
  { en: 'Ask a friend when their birthday is.', kind: 'w', need: [['wann'], ['geburtstag']], model: 'Wann ist dein Geburtstag?', reply: 'Mein Geburtstag ist im Oktober.' },
  { en: 'Ask how the weather is today.', kind: 'w', need: [['wie'], ['wetter']], model: 'Wie ist das Wetter heute?', reply: 'Das Wetter ist schlecht. Es regnet.' },
  { en: 'Ask what time it is.', kind: 'w', need: [['wie'], ['spät', 'uhr']], model: 'Wie spät ist es?', reply: 'Es ist halb drei.' },
  { en: 'Ask if the shop is open.', kind: 'yn', need: [['geschäft', 'laden', 'supermarkt'], ['offen', 'geöffnet', 'auf']], model: 'Ist das Geschäft offen?', reply: 'Ja, das Geschäft ist bis acht Uhr offen.' },
  { en: 'Ask where the train station is.', kind: 'w', need: [['wo'], ['bahnhof']], model: 'Wo ist der Bahnhof?', reply: 'Der Bahnhof ist dort, neben dem Park.' },
  { en: 'Ask a friend if they are tired.', kind: 'yn', need: [['müde']], model: 'Bist du müde?', reply: 'Ja, ich bin sehr müde. Ich gehe früh schlafen.' },
  { en: 'Ask a friend what they are drinking.', kind: 'w', need: [['was'], ['trink']], model: 'Was trinkst du?', reply: 'Ich trinke einen Kaffee mit Milch.' },
  { en: 'Ask a friend how old they are.', kind: 'w', need: [['wie'], ['alt']], model: 'Wie alt bist du?', reply: 'Ich bin dreißig Jahre alt.' },
  { en: 'Ask if the apartment is expensive.', kind: 'yn', need: [['wohnung'], ['teuer']], model: 'Ist die Wohnung teuer?', reply: 'Nein, die Wohnung ist billig, aber klein.' },
  { en: 'Ask when the train comes.', kind: 'w', need: [['wann'], ['zug']], model: 'Wann kommt der Zug?', reply: 'Der Zug kommt in zehn Minuten. Er ist verspätet.' },
  { en: 'Ask a friend what they do on the weekend.', kind: 'w', need: [['was'], ['wochenende']], model: 'Was machst du am Wochenende?', reply: 'Am Wochenende besuche ich meine Familie.' },
  { en: 'Ask a friend if they have time tomorrow.', kind: 'yn', need: [['zeit'], ['morgen']], model: 'Hast du morgen Zeit?', reply: 'Morgen Abend habe ich Zeit.' },
  { en: 'Ask where the hospital is.', kind: 'w', need: [['wo'], ['krankenhaus']], model: 'Wo ist das Krankenhaus?', reply: 'Das Krankenhaus ist in der Bahnhofstraße.' },
  { en: 'Ask a friend how often they go to the cinema.', kind: 'w', need: [['wie'], ['oft'], ['kino']], model: 'Wie oft gehst du ins Kino?', reply: 'Ich gehe selten ins Kino, vielleicht monatlich.' },
  { en: 'Ask if the food is spicy.', kind: 'yn', need: [['essen'], ['scharf']], model: 'Ist das Essen scharf?', reply: 'Nein, das Essen ist mild.' },
  { en: 'Ask a friend what their favourite colour is.', kind: 'w', need: [['was', 'welche'], ['farbe']], model: 'Was ist deine Lieblingsfarbe?', reply: 'Meine Lieblingsfarbe ist Grün.' },
  { en: 'Ask if the coffee is hot.', kind: 'yn', need: [['kaffee'], ['heiß', 'warm']], model: 'Ist der Kaffee heiß?', reply: 'Ja, Vorsicht, der Kaffee ist sehr heiß!' },
  { en: 'Ask a friend if their family is big.', kind: 'yn', need: [['familie'], ['groß']], model: 'Ist deine Familie groß?', reply: 'Ja, ich habe drei Brüder und eine Schwester.' },
  { en: 'Ask where the supermarket is.', kind: 'w', need: [['wo'], ['supermarkt']], model: 'Wo ist der Supermarkt?', reply: 'Der Supermarkt ist neben der Bank.' },
  { en: 'Ask a friend what they eat for breakfast.', kind: 'w', need: [['was'], ['ess', 'isst'], ['frühstück']], model: 'Was isst du zum Frühstück?', reply: 'Ich esse Brot mit Käse und trinke Kaffee.' },
  { en: 'Ask a friend if they are hungry.', kind: 'yn', need: [['hunger', 'hungrig']], model: 'Hast du Hunger?', reply: 'Ja, ich habe großen Hunger!' },
];

// Story scenes: a situation plus the words to use.
window.TALK_SCENES = [
  { title: 'A day at the park', en: 'Describe a sunny day in the park with your family.', words: [44, 67, 28, 12, 99, 223] },
  { title: 'Bad weather', en: 'Tell what you do on a rainy, cold day.', words: [72, 104, 9, 6, 174, 131] },
  { title: 'Shopping', en: 'You go shopping for breakfast.', words: [47, 16, 15, 18, 109, 161] },
  { title: 'My apartment', en: 'Describe your apartment or house.', words: [10, 7, 8, 4, 147, 101] },
  { title: 'A trip', en: 'Tell about a trip to the sea or the mountains.', words: [58, 62, 61, 63, 210, 226] },
  { title: 'My week', en: 'Describe your week: what you do on which day.', words: [189, 193, 38, 33, 238, 240] },
  { title: 'At the café', en: 'You meet a friend in a café.', words: [46, 26, 105, 162, 234, 230] },
  { title: 'A sick day', en: 'You feel sick and stay at home.', words: [134, 131, 50, 76, 217, 173] },
  { title: 'My family', en: 'Introduce your family.', words: [28, 29, 30, 31, 32, 139] },
  { title: 'Winter holidays', en: 'Describe the winter and December.', words: [212, 208, 73, 83, 104, 139] },
];
