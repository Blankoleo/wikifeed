'use strict';
// Curiosities for WikiFeed (English). Every linking sentence was checked against the article introductions.
// Format: { id, object, image (Artikel für das Einstiegsbild), q, teaser, steps: [{ title, link }] }
const FUNDSTUECKE_EN = [
 {
  "id": "kaugummi",
  "object": "Chewing gum",
  "image": "Chewing gum",
  "q": "What’s behind it?",
  "teaser": "Long before gum came in wrappers, people chewed the sap of a tree.",
  "steps": [
   {
    "title": "Chewing gum",
    "link": "Chewing gum is made to be chewed but never swallowed. Its rubbery texture comes from the polymers and resins it contains."
   },
   {
    "title": "Manilkara zapota",
    "link": "The Maya and the Aztecs chewed the sap of an evergreen tree from southern Mexico and Central America. Its fruit, the sapodilla, is eaten too."
   },
   {
    "title": "Chicle",
    "link": "That sap is chicle. Collectors cut zig-zag gashes into the trunk and catch the dripping gum in small bags, much like tapping rubber."
   },
   {
    "title": "Nahuatl",
    "link": "The word chicle comes from Nahuatl, the language of the Aztecs, where it meant something sticky. English owes Nahuatl other words too: chocolate, tomato, avocado and coyote."
   }
  ]
 },
 {
  "id": "mikrowelle",
  "object": "The microwave oven",
  "image": "Microwave oven",
  "q": "What’s behind it?",
  "teaser": "The box that reheats your leftovers grew out of Second World War radar.",
  "steps": [
   {
    "title": "Microwave oven",
    "link": "A microwave oven heats food with electromagnetic waves. They make molecules in the food rotate, and that movement produces heat."
   },
   {
    "title": "Percy Spencer",
    "link": "Its inventor, the American engineer Percy Spencer, never finished grammar school. He taught himself physics and maths on night shifts."
   },
   {
    "title": "Cavity magnetron",
    "link": "During the Second World War, Spencer ran Raytheon's power tube division. One of those tubes, the cavity magnetron, still produces the microwaves in most ovens."
   },
   {
    "title": "Radar",
    "link": "Before ovens, the magnetron powered early radar, which bounces radio waves off aircraft and ships to find them. It made small, sharp radar sets possible."
   },
   {
    "title": "Animal echolocation",
    "link": "Bats and toothed whales do much the same with sound: they call out and track down prey from the echoes."
   }
  ]
 },
 {
  "id": "kork",
  "object": "The cork",
  "image": "Cork (material)",
  "q": "What’s behind it?",
  "teaser": "A slice of cork under a microscope gave the building block of life its name.",
  "steps": [
   {
    "title": "Cork (material)",
    "link": "Cork comes mainly from the bark of the cork oak, and its best-known use is wine stoppers. Portugal produces about half of the world's supply."
   },
   {
    "title": "Cell (biology)",
    "link": "Robert Hooke looked at cork under a microscope and discovered the cell. He named it after the small rooms of a monastery."
   },
   {
    "title": "Robert Hooke",
    "link": "Hooke was a polymath who has been called England's Leonardo. He also argued that fossils were the remains of living things, some of them extinct."
   },
   {
    "title": "Great Fire of London",
    "link": "After the Great Fire of 1666, Hooke carried out more than half of the property surveys and helped rebuild the city. The fire had started in a bakery on Pudding Lane."
   },
   {
    "title": "Monument to the Great Fire of London",
    "link": "Hooke and Christopher Wren also designed the Monument to the fire, a column 202 feet tall that stands exactly 202 feet from where the blaze began."
   }
  ]
 },
 {
  "id": "streichholz",
  "object": "The match",
  "image": "Match",
  "q": "What’s behind it?",
  "teaser": "Matches contain an element that an alchemist stumbled on while trying to make gold.",
  "steps": [
   {
    "title": "Match",
    "link": "A match lights by friction. Safety matches only strike on their special surface, while strike-anywhere matches light on almost anything rough."
   },
   {
    "title": "Phosphorus",
    "link": "The key ingredient is phosphorus. Its name means 'light-bearer' in Greek, after the faint glow of white phosphorus, but matches use the less dangerous red kind."
   },
   {
    "title": "Hennig Brand",
    "link": "In 1669 the Hamburg alchemist Hennig Brand discovered phosphorus by accident. It was the first new element found since antiquity."
   },
   {
    "title": "Philosopher's stone",
    "link": "What Brand was really after was the philosopher's stone, a mythical substance said to turn lead into gold."
   }
  ]
 },
 {
  "id": "vanille",
  "object": "The vanilla pod",
  "image": "Vanilla",
  "q": "What’s behind it?",
  "teaser": "Vanilla grows all over the world today thanks to a 12-year-old boy.",
  "steps": [
   {
    "title": "Vanilla",
    "link": "Vanilla comes from the seed pods of orchids. By weight, it is the world's second most expensive spice after saffron."
   },
   {
    "title": "Vanilla planifolia",
    "link": "Most of it comes from one species, Vanilla planifolia, which grows wild from Mexico to Brazil. In the wild it is now endangered."
   },
   {
    "title": "Pollination",
    "link": "Vanilla can't pollinate itself, so a pod only forms if pollen reaches the flower. A Belgian botanist worked out an artificial method in 1837, but it didn't pay."
   },
   {
    "title": "Edmond Albius",
    "link": "In 1841 Edmond Albius, a 12-year-old enslaved boy on the island of Réunion, found a quick, profitable way to hand-pollinate vanilla. It meant vanilla could be grown far from home."
   },
   {
    "title": "Réunion",
    "link": "The island's old name lives on in the shops: Réunion used to be called Île Bourbon, hence Bourbon vanilla."
   }
  ]
 },
 {
  "id": "roboter",
  "object": "The robot",
  "image": "R.U.R.",
  "q": "What’s behind it?",
  "teaser": "The word robot comes from a play, and really from the playwright's brother.",
  "steps": [
   {
    "title": "Robot",
    "link": "A robot is a machine, usually programmable, that can carry out a complex series of actions on its own. The word itself comes from a play written in 1920."
   },
   {
    "title": "Karel Čapek",
    "link": "The playwright was the Czech writer Karel Čapek, who was nominated for the Nobel Prize in Literature seven times but never won."
   },
   {
    "title": "Josef Čapek",
    "link": "But the word was invented by his brother Josef, a painter. Karel was the one who put it into literature."
   },
   {
    "title": "R.U.R.",
    "link": "The play was R.U.R., short for Rossum's Universal Robots, in which artificial workers end up wiping out humanity. By 1923 it had been translated into thirty languages."
   },
   {
    "title": "Golem",
    "link": "The play echoes an older legend from Prague: the golem, a being shaped from clay and brought to life."
   }
  ]
 },
 {
  "id": "fingerabdruck",
  "object": "The fingerprint",
  "image": "Fingerprint",
  "q": "What’s behind it?",
  "teaser": "From your fingertip, it's a short trip to the most famous curve in statistics.",
  "steps": [
   {
    "title": "Fingerprint",
    "link": "Fingerprints are detailed, unique and last a lifetime, which is why police use them to identify people."
   },
   {
    "title": "Francis Galton",
    "link": "Francis Galton, a half-cousin of Charles Darwin, came up with a way to classify fingerprints. He also drew the first weather map, and founded eugenics."
   },
   {
    "title": "Galton board",
    "link": "To show how chance behaves, Galton built a board that now bears his name."
   },
   {
    "title": "Normal distribution",
    "link": "With enough samples, the board shows random outcomes settling into a bell curve: the normal distribution. It describes things like measurement errors."
   }
  ]
 },
 {
  "id": "glasauge",
  "object": "The glass eye",
  "image": "Ocular prosthesis",
  "q": "What’s behind it?",
  "teaser": "The glass used for some artificial eyes leads to an abandoned mining town in Greenland.",
  "steps": [
   {
    "title": "Ocular prosthesis",
    "link": "An artificial eye replaces one that has been lost, but it cannot see. Most are made of acrylic today, though a few are still made of cryolite glass."
   },
   {
    "title": "Cryolite",
    "link": "That glass is named after cryolite, a rare mineral."
   },
   {
    "title": "Ivittuut",
    "link": "Cryolite was mined at Ivittuut in Greenland until 1987, one of the few places where it occurs naturally. The town now lies abandoned, on the ruins of a Norse settlement."
   },
   {
    "title": "Aluminium",
    "link": "Cryolite is used to make aluminium, a metal about a third as dense as steel. Because natural cryolite is scarce, it is now also produced synthetically."
   }
  ]
 },
 {
  "id": "sicherheitsnadel",
  "object": "The safety pin",
  "image": "Safety pin",
  "q": "What’s behind it?",
  "teaser": "The safety pin has an inventor, and yet its ancestors date back to the Bronze Age.",
  "steps": [
   {
    "title": "Safety pin",
    "link": "A safety pin has a simple spring and a clasp that covers the sharp point, so it fastens fabric without pricking anyone."
   },
   {
    "title": "Walter Hunt (inventor)",
    "link": "It was invented by the American Walter Hunt, who also came up with a sewing machine. He sold his patent rights cheaply, and others made millions from his safety pin."
   },
   {
    "title": "Fibula (brooch)",
    "link": "The idea was much older than Hunt. Fibulae, brooches built on the safety-pin principle, were already fastening clothes in the Bronze Age, until buttons took over in the Middle Ages."
   },
   {
    "title": "Fibula",
    "link": "In Latin, fibula meant both the brooch and a bone in the lower leg, because the two were thought to look alike."
   }
  ]
 },
 {
  "id": "bleistift",
  "object": "The pencil",
  "image": "Pencil",
  "q": "What’s behind it?",
  "teaser": "There is no lead in a pencil, just a close relative of diamond.",
  "steps": [
   {
    "title": "Pencil",
    "link": "Most pencil cores are graphite powder mixed with clay. The old name 'lead pencil' has stuck anyway."
   },
   {
    "title": "Graphite",
    "link": "Graphite consists of many stacked layers of carbon, often hundreds of them. Its name comes from the Greek word for 'to write'."
   },
   {
    "title": "Carbon",
    "link": "Graphite is a form of pure carbon, the element at the heart of all known life and, after oxygen, the most common element in the human body by mass."
   },
   {
    "title": "Diamond",
    "link": "Diamond is carbon too, just arranged differently, and it is the hardest natural material. Under everyday conditions it actually turns into graphite, but at a negligible rate."
   }
  ]
 },
 {
  "id": "quarzuhr",
  "object": "The quartz watch",
  "image": "Quartz clock",
  "q": "What’s behind it?",
  "teaser": "A crystal keeps time in your watch, and two brothers found out why.",
  "steps": [
   {
    "title": "Quartz clock",
    "link": "A quartz watch keeps time with a vibrating quartz crystal, which makes it at least ten times more accurate than a mechanical clock."
   },
   {
    "title": "Quartz",
    "link": "Quartz is the second most common mineral in the Earth's crust. It is also the yardstick for 7 on the Mohs hardness scale."
   },
   {
    "title": "Piezoelectricity",
    "link": "The crystal vibrates thanks to piezoelectricity: squeeze certain crystals and they build up an electric charge, apply a voltage and they change shape. The same effect makes the spark in many lighters."
   },
   {
    "title": "Pierre Curie",
    "link": "The effect was discovered in 1880 by two French brothers, Jacques and Pierre Curie."
   },
   {
    "title": "Marie Curie",
    "link": "In 1903 Pierre shared the Nobel Prize in Physics with his wife, Marie. She went on to become the first person to win a Nobel Prize twice."
   }
  ]
 },
 {
  "id": "und-zeichen",
  "object": "The ampersand &",
  "image": "Ligature (writing)",
  "q": "What’s behind it?",
  "teaser": "Hidden in the & are two Latin letters, and the trail leads to Cicero's secretary.",
  "steps": [
   {
    "title": "Ampersand",
    "link": "The ampersand is a sign for 'and'. Its shape began as the Latin word et."
   },
   {
    "title": "Ligature (writing)",
    "link": "The & is a ligature: the handwritten letters e and t merged into a single sign, much as a and e became æ."
   },
   {
    "title": "Tironian notes",
    "link": "The Romans had an even faster trick: a shorthand of about 4,000 signs, a few of which are still used today."
   },
   {
    "title": "Marcus Tullius Tiro",
    "link": "The shorthand is named after Tiro, first a slave and later a freedman of Cicero, who is thought to have invented it."
   },
   {
    "title": "Cicero",
    "link": "Cicero is considered one of Rome's greatest orators. After his death, Tiro published his former master's letters and speeches."
   }
  ]
 },
 {
  "id": "gaensehaut",
  "object": "Goose bumps",
  "image": "Goose bumps",
  "q": "What’s behind it?",
  "teaser": "When the hairs on your arm stand up, your body is doing what a porcupine does in danger.",
  "steps": [
   {
    "title": "Goose bumps",
    "link": "Goose bumps pop up at the base of body hairs when we're cold, tickled or gripped by strong emotions like fear or euphoria."
   },
   {
    "title": "Old World porcupine",
    "link": "Many mammals share this reflex. Porcupines raise their quills when threatened, and those quills are nothing but modified hairs."
   },
   {
    "title": "Vestigiality",
    "link": "Some consider goose bumps in humans a vestigial reflex: a trait that has lost some or all of its original job during evolution, yet stuck around."
   },
   {
    "title": "Coccyx",
    "link": "Another vestigial leftover sits at the bottom of your spine: the tailbone, all that remains of a tail."
   }
  ]
 },
 {
  "id": "strichcode",
  "object": "The barcode",
  "image": "Barcode",
  "q": "What’s behind it?",
  "teaser": "The stripes on every package are based on an old telegraph code.",
  "steps": [
   {
    "title": "Barcode",
    "link": "A barcode stores data in parallel lines of different widths, which scanners and phone cameras can read."
   },
   {
    "title": "Norman Joseph Woodland",
    "link": "It was invented by Norman Joseph Woodland and Bernard Silver, who patented it in 1952. Later, at IBM, Woodland developed what became the Universal Product Code."
   },
   {
    "title": "Morse code",
    "link": "The idea was based on Morse code, with its dots and dashes stretched into thin and thick bars."
   },
   {
    "title": "Samuel Morse",
    "link": "Morse code is named after Samuel Morse, though his own first draft was replaced by others' work. Before turning to the telegraph in middle age, Morse was a well-known portrait painter."
   }
  ]
 },
 {
  "id": "banane",
  "object": "The banana",
  "image": "Gros Michel",
  "q": "What’s behind it?",
  "teaser": "The banana we eat today is a stand-in for one that a fungus nearly wiped out.",
  "steps": [
   {
    "title": "Gros Michel",
    "link": "Until the 1950s, the Gros Michel, or 'Big Mike', was the world's main banana. Its thick peel and dense bunches made it ideal for shipping."
   },
   {
    "title": "Panama disease",
    "link": "Then a fungus struck. Panama disease, a wilt that fungicides can't stop, almost wiped out commercial Gros Michel growing in the 1950s."
   },
   {
    "title": "Cavendish banana",
    "link": "Growers switched to the Cavendish, the most traded banana since the 1950s. It cannot reproduce sexually, so the plants are identical clones."
   },
   {
    "title": "Monoculture",
    "link": "Fields of a single crop are called a monoculture, and they leave crops more open to disease. Since the 2010s, a new strain of Panama disease has been threatening the Cavendish too."
   }
  ]
 }
];
