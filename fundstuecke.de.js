'use strict';
// Fundstücke für WikiFeed (Deutsch). Jeder Verbindungssatz ist an den Einleitungen der Wikipedia-Artikel geprüft.
// Format: { id, object, image (Artikel für das Einstiegsbild), q, teaser, steps: [{ title, link }] }
const FUNDSTUECKE_DE = [
 {
  "id": "kaugummi",
  "object": "Der Kaugummi",
  "image": "Kaugummi",
  "q": "Was steckt dahinter?",
  "teaser": "Lange bevor es Kaugummi im Laden gab, kauten Menschen den Saft eines Baumes.",
  "steps": [
   {
    "title": "Kaugummi",
    "link": "Kaugummi lässt sich stundenlang kauen, weil sich seine Kaumasse weder in Speichel noch in Getränken auflöst. Gekaut haben Menschen schon in der Steinzeit: Skandinavier etwa kauten Birkenpech."
   },
   {
    "title": "Breiapfelbaum",
    "link": "Die Maya und Azteken kauten den Saft des Breiapfelbaums. Der Baum stammt aus Südmexiko und Mittelamerika, seine Früchte isst man als Obst."
   },
   {
    "title": "Chicle",
    "link": "Dieser Milchsaft heißt Chicle. Man ritzt die Rinde im Zickzack an und fängt den tropfenden Saft auf, ganz ähnlich wie beim Kautschuk."
   },
   {
    "title": "Nahuatl",
    "link": "Der Name Chicle kommt aus dem Nahuatl, der Sprache der Azteken, und bedeutet so viel wie „klebriger Stoff“. Aus derselben Sprache stammen auch Schokolade, Tomate und Avocado."
   }
  ]
 },
 {
  "id": "mikrowelle",
  "object": "Die Mikrowelle",
  "image": "Mikrowellenherd",
  "q": "Was steckt dahinter?",
  "teaser": "Das Gerät, das abends die Reste aufwärmt, geht auf Radartechnik aus dem Zweiten Weltkrieg zurück.",
  "steps": [
   {
    "title": "Mikrowellenherd",
    "link": "Eine Mikrowelle erhitzt Essen mit elektromagnetischen Wellen in einem Metallkasten. Schalter an der Tür sorgen dafür, dass sie nur bei geschlossener Tür strahlt."
   },
   {
    "title": "Percy Spencer",
    "link": "Als ihr Erfinder gilt der US-Ingenieur Percy Spencer. Er hatte nie die Grundschule beendet und brachte sich Mathematik und Physik in Nachtschichten selbst bei."
   },
   {
    "title": "Magnetron",
    "link": "Im Zweiten Weltkrieg leitete Spencer bei der Firma Raytheon die Abteilung für Leistungsröhren. Eine solche Röhre erzeugt bis heute in den meisten Mikrowellen die Wellen: das Magnetron."
   },
   {
    "title": "Radar",
    "link": "Eingesetzt wurde das Magnetron zuerst im Radar. Es sendet Funkwellen aus und erkennt an ihrem Echo, wo Flugzeuge oder Schiffe sind."
   },
   {
    "title": "Echoortung (Tiere)",
    "link": "Fledermäuse und Zahnwale machen es ähnlich, nur mit Schall: Sie stoßen Rufe aus und orten ihre Beute am Echo."
   }
  ]
 },
 {
  "id": "kork",
  "object": "Der Korken",
  "image": "Kork",
  "q": "Was steckt dahinter?",
  "teaser": "Ein Stück Kork unter dem Mikroskop gab dem Grundbaustein des Lebens seinen Namen.",
  "steps": [
   {
    "title": "Kork",
    "link": "Kork stammt meist aus der Rinde der Korkeiche, und vor allem macht man daraus Korken. Der größte Korkproduzent der Welt ist Portugal."
   },
   {
    "title": "Zelle (Biologie)",
    "link": "Der Engländer Robert Hooke untersuchte Kork unter dem Mikroskop und entdeckte dabei die Zelle. Der Name kommt vom lateinischen cellula, „Kämmerchen“."
   },
   {
    "title": "Robert Hooke",
    "link": "Hooke war ein Universalgelehrter. Er entdeckte auch den Großen Roten Fleck auf dem Jupiter und erkannte in Fossilien die Reste ausgestorbener Lebewesen."
   },
   {
    "title": "Großer Brand von London",
    "link": "Nach dem Großen Brand von 1666 half Hooke als Vermesser und Architekt, London wieder aufzubauen. Das Feuer war in einer Bäckerei in der Pudding Lane ausgebrochen."
   },
   {
    "title": "Monument (London)",
    "link": "Zusammen mit Christopher Wren entwarf Hooke auch das Denkmal für den Brand: eine 62 Meter hohe Säule. Sie steht genau so weit von der Stelle entfernt, an der das Feuer ausbrach, wie sie hoch ist."
   }
  ]
 },
 {
  "id": "streichholz",
  "object": "Das Streichholz",
  "image": "Streichholz",
  "q": "Was steckt dahinter?",
  "teaser": "In Streichhölzern steckt ein Element, das ein Alchemist auf der Suche nach Gold entdeckte.",
  "steps": [
   {
    "title": "Streichholz",
    "link": "Die ersten brauchbaren Streichhölzer kamen Anfang des 19. Jahrhunderts auf den Markt. Sie waren unzuverlässig, konnten explodieren und enthielten giftigen weißen Phosphor."
   },
   {
    "title": "Phosphor",
    "link": "Phosphor heißt auf Griechisch „Lichtträger“, weil weißer Phosphor an der Luft leuchtet. In Streichhölzern steckt heute der weniger gefährliche rote Phosphor."
   },
   {
    "title": "Hennig Brand",
    "link": "Entdeckt hat ihn 1669 der Hamburger Kaufmann und Alchemist Hennig Brand. Es war das erste neu entdeckte Element seit der Antike."
   },
   {
    "title": "Stein der Weisen",
    "link": "Gesucht hatte Brand eigentlich etwas ganz anderes: den Stein der Weisen, der unedle Metalle in Gold verwandeln sollte."
   }
  ]
 },
 {
  "id": "vanille",
  "object": "Die Vanilleschote",
  "image": "Vanille (Gewürz)",
  "q": "Was steckt dahinter?",
  "teaser": "Dass Vanille heute rund um die Welt wächst, verdanken wir einem zwölfjährigen Jungen.",
  "steps": [
   {
    "title": "Vanille (Gewürz)",
    "link": "Vanille wird aus den fermentierten Schoten bestimmter Orchideen gewonnen. Man nennt sie auch die Königin der Gewürze."
   },
   {
    "title": "Gewürzvanille",
    "link": "Die wichtigste Art ist die Gewürzvanille, eine Orchidee mit grün-gelblichen Blüten. Ihre Heimat reicht von Mexiko bis Brasilien."
   },
   {
    "title": "Bestäubung",
    "link": "Eine Schote entsteht nur, wenn die Blüte bestäubt wird, also Pollen auf ihre Narbe gelangt. Ein belgischer Botaniker fand 1837 einen Weg, sie künstlich zu bestäuben, doch das lohnte sich nicht."
   },
   {
    "title": "Edmond Albius",
    "link": "1841 entdeckte Edmond Albius, ein zwölfjähriger versklavter Junge auf der Insel Réunion, wie man Vanille schnell von Hand bestäubt. Erst damit ließ sie sich weltweit anbauen."
   },
   {
    "title": "Réunion",
    "link": "Bis heute erinnert ein Name an die Insel: Bourbon-Vanille. Réunion hieß früher Île Bourbon."
   }
  ]
 },
 {
  "id": "roboter",
  "object": "Der Roboter",
  "image": "R.U.R.",
  "q": "Was steckt dahinter?",
  "teaser": "Das Wort Roboter stammt aus einem Theaterstück und eigentlich vom Bruder des Autors.",
  "steps": [
   {
    "title": "Roboter",
    "link": "Roboter nehmen Menschen Arbeit ab, die sich ständig wiederholt oder gefährlich ist. Das Wort selbst stammt aus dem Jahr 1920."
   },
   {
    "title": "Karel Čapek",
    "link": "Bekannt gemacht hat es der tschechische Schriftsteller Karel Čapek. Er gilt als einer der wichtigsten tschechischen Autoren des 20. Jahrhunderts."
   },
   {
    "title": "Josef Čapek",
    "link": "Erfunden hat das Wort aber sein Bruder Josef, ein Maler. Er leitete es vom westslawischen Wort robota ab, das Fronarbeit bedeutet."
   },
   {
    "title": "R.U.R.",
    "link": "Zuerst stand das Wort in Karels Theaterstück R.U.R. von 1920. Darin baut eine Firma künstliche Menschen als billige Arbeiter, die sich am Ende erheben und die Menschheit vernichten."
   },
   {
    "title": "Golem",
    "link": "Im Stück klingt eine alte jüdische Sage aus Prag an: der Golem, ein Wesen aus Lehm, das seinem Schöpfer gehorcht."
   }
  ]
 },
 {
  "id": "fingerabdruck",
  "object": "Der Fingerabdruck",
  "image": "Fingerabdruck",
  "q": "Was steckt dahinter?",
  "teaser": "Von der Fingerkuppe ist es nur ein kurzer Weg zur berühmtesten Kurve der Statistik.",
  "steps": [
   {
    "title": "Fingerabdruck",
    "link": "Bisher sind keine zwei Menschen mit demselben Fingerabdruck bekannt. Selbst eineiige Zwillinge haben unterschiedliche."
   },
   {
    "title": "Francis Galton",
    "link": "Als Vater der Fingerabdruck-Lehre gilt der Brite Francis Galton, ein Cousin von Charles Darwin. Er zeichnete die erste Wetterkarte, begründete aber auch die Eugenik."
   },
   {
    "title": "Galtonbrett",
    "link": "Um zu zeigen, wie der Zufall wirkt, baute Galton ein Nagelbrett, das heute seinen Namen trägt."
   },
   {
    "title": "Normalverteilung",
    "link": "Das Brett macht sichtbar, wie aus vielen Zufällen eine Glockenkurve wird: die Normalverteilung. Mit ihr beschreibt man zum Beispiel, wie Messwerte streuen."
   }
  ]
 },
 {
  "id": "glasauge",
  "object": "Das Glasauge",
  "image": "Augenprothese",
  "q": "Was steckt dahinter?",
  "teaser": "Das Glas für manche Glasaugen führt zu einer verlassenen Bergbausiedlung auf Grönland.",
  "steps": [
   {
    "title": "Augenprothese",
    "link": "Ein Glasauge ersetzt ein verlorenes Auge, sehen kann man damit nicht. Fachleute, die Okularisten, fertigen es einzeln an, aus Kunststoff oder aus Kryolithglas."
   },
   {
    "title": "Kryolith",
    "link": "Der Name des Glases führt zu Kryolith, einem eher seltenen Mineral."
   },
   {
    "title": "Ivittuut",
    "link": "Der einzige Ort der Welt, an dem Kryolith in großen Mengen gewinnbringend abgebaut wurde, war Ivittuut auf Grönland. Heute ist die Siedlung verlassen."
   },
   {
    "title": "Aluminium",
    "link": "Kryolith braucht man unter anderem, um Aluminium zu gewinnen, das häufigste Metall der Erdkruste. Weil natürlicher Kryolith knapp ist, stellt man ihn inzwischen auch künstlich her."
   }
  ]
 },
 {
  "id": "sicherheitsnadel",
  "object": "Die Sicherheitsnadel",
  "image": "Sicherheitsnadel",
  "q": "Was steckt dahinter?",
  "teaser": "Die Sicherheitsnadel hat einen Erfinder und trotzdem Vorfahren aus der Bronzezeit.",
  "steps": [
   {
    "title": "Sicherheitsnadel",
    "link": "Eine Sicherheitsnadel hat eine Feder und einen Verschluss, der die Spitze abdeckt. So hält sie Stoff zusammen, ohne zu stechen."
   },
   {
    "title": "Walter Hunt (Erfinder)",
    "link": "Erfunden hat sie der US-Amerikaner Walter Hunt, der auch eine Nähmaschine erfand. Reich wurde er nicht: Er verkaufte seine Patente billig, andere verdienten mit der Sicherheitsnadel Millionen."
   },
   {
    "title": "Fibel (Schließe)",
    "link": "Ganz neu war die Idee nicht. Schon in der Bronzezeit hielten Fibeln die Kleidung zusammen, Gewandnadeln nach dem Prinzip der Sicherheitsnadel."
   },
   {
    "title": "Wadenbein",
    "link": "Im Lateinischen heißt die Fibel fibula, genau wie das Wadenbein. Die Römer fanden, dass sich Knochen und Spange ähneln."
   }
  ]
 },
 {
  "id": "bleistift",
  "object": "Der Bleistift",
  "image": "Bleistift",
  "q": "Was steckt dahinter?",
  "teaser": "In einem Bleistift steckt kein Blei, sondern ein naher Verwandter des Diamanten.",
  "steps": [
   {
    "title": "Bleistift",
    "link": "Früher schrieb man mit Griffeln aus echtem Blei. Seit dem 19. Jahrhundert besteht die Mine aus Graphit und Ton, nur der Name ist geblieben."
   },
   {
    "title": "Graphit",
    "link": "Graphit ist ein grau-schwarzes, weiches Mineral. Sein Name kommt vom griechischen Wort für „schreiben“."
   },
   {
    "title": "Kohlenstoff",
    "link": "Graphit ist reiner Kohlenstoff. Dieses Element bildet mehr Verbindungen als jedes andere und ist die Grundlage des Lebens auf der Erde."
   },
   {
    "title": "Diamant",
    "link": "Auch Diamant ist reiner Kohlenstoff, nur anders aufgebaut. Er ist der härteste natürliche Stoff: Auf der Härteskala nach Mohs hat er den Wert 10, Graphit nur 1 bis 2."
   }
  ]
 },
 {
  "id": "quarzuhr",
  "object": "Die Quarzuhr",
  "image": "Quarzuhr",
  "q": "Was steckt dahinter?",
  "teaser": "In deiner Uhr schwingt ein Kristall, und warum er das tut, entdeckten zwei Brüder.",
  "steps": [
   {
    "title": "Quarzuhr",
    "link": "Eine Quarzuhr bekommt ihren Takt von einem schwingenden Quarzkristall. Solche Uhren stecken auch in Computern, damit sie die Uhrzeit kennen."
   },
   {
    "title": "Quarz",
    "link": "Quarz ist nach den Feldspaten das zweithäufigste Mineral der Erdkruste. Für Uhren schneidet man Schwingquarze aus künstlich hergestellten Kristallen."
   },
   {
    "title": "Piezoelektrizität",
    "link": "Der Kristall schwingt dank des Piezoeffekts: Verformt man ihn, entsteht eine elektrische Spannung, legt man Spannung an, verformt er sich. Derselbe Effekt erzeugt den Funken in vielen Feuerzeugen."
   },
   {
    "title": "Pierre Curie",
    "link": "Entdeckt haben den Effekt 1880 die französischen Brüder Jacques und Pierre Curie."
   },
   {
    "title": "Marie Curie",
    "link": "Pierre Curie erhielt 1903 zusammen mit seiner Frau Marie den Nobelpreis für Physik. Sie gewann 1911 noch einen zweiten, für Chemie."
   }
  ]
 },
 {
  "id": "und-zeichen",
  "object": "Das Und-Zeichen &",
  "image": "Ligatur (Typografie)",
  "q": "Was steckt dahinter?",
  "teaser": "Im Zeichen & stecken zwei lateinische Buchstaben, und die Spur führt zu Ciceros Sekretär.",
  "steps": [
   {
    "title": "Et-Zeichen",
    "link": "Das Zeichen & steht für „und“, lateinisch et. Weil es oft in Firmennamen vorkommt, heißt es auch kaufmännisches Und."
   },
   {
    "title": "Ligatur (Typografie)",
    "link": "Das & ist eine Ligatur: Die Buchstaben e und t sind darin zu einem Zeichen verschmolzen. Ein anderes bekanntes Beispiel ist das ß."
   },
   {
    "title": "Tironische Noten",
    "link": "Solche Verschmelzungen entstanden oft beim schnellen Schreiben. Die Römer gingen noch weiter und nutzten eine Kurzschrift mit rund 4000 Zeichen."
   },
   {
    "title": "Marcus Tullius Tiro",
    "link": "Entwickelt hat sie Tiro, zuerst Sklave, dann Freigelassener und Privatsekretär Ciceros. Damit schrieb er Reden und Gerichtsverhandlungen mit."
   },
   {
    "title": "Marcus Tullius Cicero",
    "link": "Cicero war der berühmteste Redner des alten Rom. Nach seinem Tod gab Tiro die Briefe und Reden seines früheren Herrn heraus."
   }
  ]
 },
 {
  "id": "gaensehaut",
  "object": "Die Gänsehaut",
  "image": "Gänsehaut",
  "q": "Was steckt dahinter?",
  "teaser": "Wenn sich deine Härchen aufstellen, tut dein Körper dasselbe wie ein bedrohtes Stachelschwein.",
  "steps": [
   {
    "title": "Gänsehaut",
    "link": "Bei Gänsehaut stellen sich die Körperhaare auf und die Haut bekommt kleine Erhebungen, wie bei einer gerupften Gans. Warum Menschen sie bekommen, ist bis heute nicht ganz geklärt."
   },
   {
    "title": "Stachelschweine",
    "link": "Viele Säugetiere kennen diesen Reflex. Stachelschweine stellen bei Gefahr ihre Stacheln auf, und diese Stacheln sind nichts anderes als umgewandelte Haare."
   },
   {
    "title": "Rudiment",
    "link": "Manche halten Gänsehaut beim Menschen für ein Rudiment: ein Merkmal, das im Lauf der Evolution seine Aufgabe ganz oder teilweise verloren hat, aber geblieben ist."
   },
   {
    "title": "Steißbein",
    "link": "Ein weiteres Rudiment sitzt am unteren Ende der Wirbelsäule: das Steißbein, der Rest eines Schwanzes."
   }
  ]
 },
 {
  "id": "strichcode",
  "object": "Der Strichcode",
  "image": "Strichcode",
  "q": "Was steckt dahinter?",
  "teaser": "Hinter den Strichen auf jeder Verpackung steckt ein alter Telegrafen-Code.",
  "steps": [
   {
    "title": "Strichcode",
    "link": "Ein Strichcode besteht aus verschieden breiten Strichen und Lücken, die ein Scanner oder eine Kamera liest."
   },
   {
    "title": "Norman Joseph Woodland",
    "link": "Erfunden hat ihn Norman Joseph Woodland zusammen mit Bernard Silver, das Patent erhielten sie 1952. Später entwickelte Woodland bei IBM den Universal Product Code für Waren im Handel."
   },
   {
    "title": "Morsecode",
    "link": "Die Idee beruhte auf dem Morsecode: Aus Punkten und Strichen wurden dünne und dicke Balken."
   },
   {
    "title": "Samuel F. B. Morse",
    "link": "Benannt ist der Code nach Samuel Morse, der allerdings eine deutlich andere Vorform vorgeschlagen hatte. Bevor er den Telegrafen mitentwickelte, war Morse Maler."
   }
  ]
 },
 {
  "id": "banane",
  "object": "Die Banane",
  "image": "Gros Michel",
  "q": "Was steckt dahinter?",
  "teaser": "Die Banane, die wir heute essen, ist ein Ersatz für eine Sorte, die ein Pilz fast ausgelöscht hat.",
  "steps": [
   {
    "title": "Gros Michel",
    "link": "Bis Ende der 1950er-Jahre war Gros Michel, der „Dicke Michael“, die wichtigste Handelssorte unter den Bananen weltweit. Sie war die erste Exportbanane in die USA."
   },
   {
    "title": "Panamakrankheit",
    "link": "Doch die Panamakrankheit vernichtete bis etwa 1960 einen Großteil der Bestände. Ein Pilz lässt die Pflanzen welken, bis sie keine Früchte mehr tragen und absterben."
   },
   {
    "title": "Cavendish (Banane)",
    "link": "Ersetzt wurde sie durch die Sorte Cavendish, benannt nach einem englischen Herzog, der um 1830 in seinem Gewächshaus Bananen zog. Fast alle Bananen im Handel sind Klone dieser einen Pflanze."
   },
   {
    "title": "Monokultur",
    "link": "Wächst über Jahre nur eine einzige Pflanzenart auf einer Fläche, spricht man von Monokultur. Krankheiten haben dort leichtes Spiel, und eine neue Form der Panamakrankheit bedroht inzwischen auch die Cavendish."
   }
  ]
 }
];
