'use strict';
// Fundstücke pour WikiFeed (français). Titres et images vérifiés sur fr.wikipedia ; chaque phrase de liaison a été comparée à l’introduction de l’article français.
// Format : { id, object, image (article de l’image d’ouverture), q, teaser, steps: [{ title, link }] }
const FUNDSTUECKE_FR = [
 {
  "id": "kaugummi",
  "object": "Le chewing-gum",
  "image": "Chewing-gum",
  "q": "Qu’y a-t-il derrière ?",
  "teaser": "Bien avant les emballages, il y avait le latex d’un arbre d’Amérique centrale.",
  "steps": [
   {
    "title": "Chewing-gum",
    "link": "Le chewing-gum est fait pour être mâché, pas avalé. Les premiers ont été vendus en 1872 par Thomas Adams, qui mélangeait du chiclé, de la résine et du sirop."
   },
   {
    "title": "Sapotillier",
    "link": "Le chiclé est un latex tiré du sapotillier, un arbre fruitier originaire des Caraïbes et d’Amérique centrale, qui s’est ensuite répandu en Afrique et en Asie."
   },
   {
    "title": "Chiclé",
    "link": "Le chiclé est une gomme naturelle. On la tire de plusieurs arbres du genre Manilkara, dont le sapotillier."
   },
   {
    "title": "Nahuatl",
    "link": "Son nom vient du nahuatl tzictli, « pâte collante ». C’était la langue de la capitale aztèque, et près de deux millions de personnes la parlent encore aujourd’hui, surtout au Mexique."
   }
  ]
 },
 {
  "id": "mikrowelle",
  "object": "Le four à micro-ondes",
  "image": "Four à micro-ondes",
  "q": "Qu’y a-t-il derrière ?",
  "teaser": "La boîte qui réchauffe tes restes doit beaucoup au radar de la Seconde Guerre mondiale.",
  "steps": [
   {
    "title": "Four à micro-ondes",
    "link": "Un four à micro-ondes chauffe les aliments en agitant les molécules d’eau qu’ils contiennent, grâce à un rayonnement micro-onde."
   },
   {
    "title": "Percy Spencer",
    "link": "On doit son invention à l’Américain Percy Spencer (1894-1970)."
   },
   {
    "title": "Magnétron",
    "link": "Les micro-ondes sont produites par un magnétron, un tube à vide qui transforme l’énergie des électrons en ondes. On le trouve aujourd’hui jusque dans l’électroménager."
   },
   {
    "title": "Radar",
    "link": "Avant d’arriver dans les cuisines, le magnétron a joué un rôle crucial dans le développement du radar, et donc dans la Seconde Guerre mondiale. Le radar envoie des ondes qui rebondissent sur les avions ou les bateaux, puis capte leur écho."
   },
   {
    "title": "Écholocalisation",
    "link": "Les chauves-souris et certains cétacés font la même chose avec des sons : ils émettent des cris et se repèrent grâce à leur écho."
   }
  ]
 },
 {
  "id": "kork",
  "object": "Le bouchon de liège",
  "image": "Liège (matériau)",
  "q": "Qu’y a-t-il derrière ?",
  "teaser": "Du liège à la cellule, puis au grand incendie de Londres : il n’y a que quelques pas.",
  "steps": [
   {
    "title": "Liège (matériau)",
    "link": "Le liège vient de l’écorce du chêne-liège, aujourd’hui le seul arbre à en produire en quantité exploitable. C’est un matériau dit cellulaire."
   },
   {
    "title": "Cellule (biologie)",
    "link": "Les cellules ont été découvertes en 1665 par le naturaliste anglais Robert Hooke. Leur nom vient du latin cellula, « chambre de moine »."
   },
   {
    "title": "Robert Hooke",
    "link": "Hooke était un savant touche-à-tout, l’un des plus grands expérimentateurs du XVIIe siècle. Un historien l’a surnommé le « Léonard d’Angleterre »."
   },
   {
    "title": "Grand incendie de Londres",
    "link": "En septembre 1666, le grand incendie de Londres ravage la ville. Il part d’une boulangerie de Pudding Lane. Hooke a ensuite aidé à rebâtir la ville."
   },
   {
    "title": "Monument au Grand incendie de Londres",
    "link": "Le Monument rappelle l’incendie : une colonne de 61 mètres, plantée à 61 mètres de l’endroit où le feu a commencé. On en attribue les plans à Christopher Wren et à Hooke."
   }
  ]
 },
 {
  "id": "streichholz",
  "object": "L’allumette",
  "image": "Allumette",
  "q": "Qu’y a-t-il derrière ?",
  "teaser": "Les allumettes contiennent un élément découvert par un alchimiste.",
  "steps": [
   {
    "title": "Allumette",
    "link": "Une allumette s’enflamme par friction, grâce au produit chimique inflammable qui couvre son bout. Ensuite, elle ne sert plus."
   },
   {
    "title": "Phosphore",
    "link": "L’ingrédient clé est le phosphore. Son nom vient du grec et veut dire « porteur de lumière », parce que le phosphore blanc luit dans l’obscurité."
   },
   {
    "title": "Hennig Brand",
    "link": "C’est Hennig Brand, souffleur de verre et alchimiste de Hambourg, qui a découvert le phosphore."
   },
   {
    "title": "Pierre philosophale",
    "link": "Les alchimistes rêvaient de la pierre philosophale, une substance hypothétique censée changer les métaux vils en or, guérir les maladies et prolonger la vie."
   }
  ]
 },
 {
  "id": "vanille",
  "object": "La gousse de vanille",
  "image": "Vanille",
  "q": "Qu’y a-t-il derrière ?",
  "teaser": "La culture de la vanille doit beaucoup à un garçon de 12 ans.",
  "steps": [
   {
    "title": "Vanille",
    "link": "La vanille est le fruit de certaines orchidées tropicales. Rapportée au poids, c’est l’un des produits agricoles alimentaires les plus chers au monde."
   },
   {
    "title": "Vanilla planifolia",
    "link": "L’essentiel vient d’une seule espèce d’origine mésoaméricaine : Vanilla planifolia, la principale orchidée cultivée pour sa vanille."
   },
   {
    "title": "Pollinisation",
    "link": "Pour qu’un fruit se forme, le pollen doit passer des organes mâles aux organes femelles de la fleur : c’est la pollinisation. Sans elle, pas de fécondation."
   },
   {
    "title": "Edmond Albius",
    "link": "Le procédé pratique pour polliniser la vanille, c’est Edmond Albius qui l’a trouvé, à 12 ans, alors qu’il était esclave sur l’île de La Réunion."
   },
   {
    "title": "La Réunion",
    "link": "Avant de s’appeler La Réunion, l’île portait le nom d’« île Bourbon ». C’est ce nom qu’on retrouve dans la « vanille Bourbon »."
   }
  ]
 },
 {
  "id": "roboter",
  "object": "Le robot",
  "image": "R. U. R.",
  "q": "Qu’y a-t-il derrière ?",
  "teaser": "Le mot « robot » vient d’une pièce de théâtre, et en réalité du frère de l’auteur.",
  "steps": [
   {
    "title": "Robot",
    "link": "Un robot est une machine conçue pour accomplir automatiquement des tâches qui imitent des actions humaines. Le mot apparaît pour la première fois dans une pièce écrite en 1920."
   },
   {
    "title": "Karel Čapek",
    "link": "Son auteur, Karel Čapek, compte parmi les plus importants écrivains tchécoslovaques du XXe siècle."
   },
   {
    "title": "Josef Čapek",
    "link": "Mais le mot a été forgé par son frère aîné Josef, peintre, à partir du tchèque robota, « travail » ou « corvée »."
   },
   {
    "title": "R. U. R.",
    "link": "La pièce s’intitule R. U. R., pour Rossum’s Universal Robots. C’est une pièce de science-fiction."
   },
   {
    "title": "Golem",
    "link": "Bien avant les robots, une légende juive parlait déjà d’un être artificiel : le golem, façonné dans l’argile et associé à la figure du Maharal de Prague."
   }
  ]
 },
 {
  "id": "fingerabdruck",
  "object": "L’empreinte digitale",
  "image": "Empreinte digitale",
  "q": "Qu’y a-t-il derrière ?",
  "teaser": "Du bout de ton doigt à la courbe la plus célèbre des statistiques, il n’y a qu’un pas.",
  "steps": [
   {
    "title": "Empreinte digitale",
    "link": "Une empreinte digitale, c’est le dessin que laisse un doigt sur une surface assez lisse."
   },
   {
    "title": "Francis Galton",
    "link": "Francis Galton a mis en place une méthode systématique pour identifier les gens grâce à leurs empreintes. Ce statisticien est aussi considéré comme le fondateur de l’eugénisme."
   },
   {
    "title": "Planche de Galton",
    "link": "Il a aussi inventé une planche qui porte son nom : des billes y tombent entre des clous et passent au hasard à gauche ou à droite."
   },
   {
    "title": "Loi normale",
    "link": "Avec assez de billes, leur répartition dessine une courbe en cloche : la loi normale, l’une des lois les plus utilisées pour modéliser des phénomènes naturels."
   }
  ]
 },
 {
  "id": "glasauge",
  "object": "L’œil de verre",
  "image": "Prothèse oculaire",
  "q": "Qu’y a-t-il derrière ?",
  "teaser": "Le verre de certains yeux artificiels mène jusqu’au Groenland.",
  "steps": [
   {
    "title": "Prothèse oculaire",
    "link": "Une prothèse oculaire remplace un œil qu’on a dû retirer, sans permettre de voir. On l’appelle « œil de verre », même si elle peut aussi être en résine synthétique."
   },
   {
    "title": "Cryolite",
    "link": "Certains yeux de verre sont faits d’un verre qui tient son nom d’un minéral rare : la cryolite, découverte sur la côte ouest du Groenland."
   },
   {
    "title": "Ivittuut",
    "link": "C’est près d’Ivittuut, un village du sud du Groenland au bord de la mer du Labrador, qu’on l’a longtemps extraite."
   },
   {
    "title": "Aluminium",
    "link": "La cryolite sert surtout à produire l’aluminium, le métal le plus abondant de l’écorce terrestre. Comme elle est rare, on la fabrique aussi artificiellement."
   }
  ]
 },
 {
  "id": "sicherheitsnadel",
  "object": "L’épingle de sûreté",
  "image": "Épingle de sûreté",
  "q": "Qu’y a-t-il derrière ?",
  "teaser": "L’épingle de sûreté a un inventeur, et pourtant ses ancêtres remontent à l’âge du bronze.",
  "steps": [
   {
    "title": "Épingle de sûreté",
    "link": "Une épingle de sûreté tient sur un petit ressort, et sa pointe est protégée par un capuchon : elle attache le tissu presque sans risque de se piquer."
   },
   {
    "title": "Walter Hunt",
    "link": "Elle a été inventée en 1849 par l’Américain Walter Hunt, qui avait aussi conçu une machine à coudre. Il en a vendu le brevet pour 400 dollars, afin de rembourser une dette de 15 dollars."
   },
   {
    "title": "Fibule",
    "link": "Mais l’idée était bien plus ancienne : la fibule, une agrafe pour fermer les vêtements, est considérée comme l’ancêtre de l’épingle de sûreté. Les premières datent de l’âge du bronze final."
   },
   {
    "title": "Fibula",
    "link": "Le mot latin fibula, « agrafe », a aussi donné son nom à un os de la jambe, la fibula, qu’on appelait autrefois le péroné."
   }
  ]
 },
 {
  "id": "bleistift",
  "object": "Le crayon",
  "image": "Crayon",
  "q": "Qu’y a-t-il derrière ?",
  "teaser": "Dans un crayon, pas de plomb : plutôt un proche parent du diamant.",
  "steps": [
   {
    "title": "Crayon",
    "link": "Un crayon, c’est une petite baguette de bois qui protège une mine. Quand elle s’use, on taille le bois pour dégager un nouveau bout."
   },
   {
    "title": "Graphite",
    "link": "Cette mine est le plus souvent faite de graphite, un minéral qui est l’une des formes naturelles du carbone."
   },
   {
    "title": "Carbone",
    "link": "Le carbone est l’élément de base de toutes les formes de vie connues. On le trouve surtout sous deux formes : le graphite et le diamant."
   },
   {
    "title": "Diamant",
    "link": "Le diamant est lui aussi du carbone, simplement arrangé autrement, et c’est le matériau naturel le plus dur. Dans nos conditions de tous les jours, il est pourtant moins stable que le graphite."
   }
  ]
 },
 {
  "id": "quarzuhr",
  "object": "La montre à quartz",
  "image": "Horloge à quartz",
  "q": "Qu’y a-t-il derrière ?",
  "teaser": "Un cristal donne l’heure dans ta montre, et la piste mène à un célèbre couple de physiciens.",
  "steps": [
   {
    "title": "Horloge à quartz",
    "link": "Une montre à quartz mesure le temps grâce à un cristal de quartz qui oscille à une fréquence précise. La première montre-bracelet de ce type, une Seiko, est sortie en 1969."
   },
   {
    "title": "Quartz (minéral)",
    "link": "Le quartz est le minéral le plus commun de la croûte terrestre : on le trouve dans le granite comme dans le sable."
   },
   {
    "title": "Piézoélectricité",
    "link": "Le cristal oscille grâce à la piézoélectricité : quand on presse certains cristaux, ils se chargent électriquement ; quand on leur applique une tension, ils se déforment. C’est aussi ce qui produit l’étincelle des allume-gaz."
   },
   {
    "title": "Pierre Curie",
    "link": "Le physicien français Pierre Curie est connu pour ses travaux sur la piézoélectricité, mais aussi sur la radioactivité et le magnétisme."
   },
   {
    "title": "Marie Curie",
    "link": "En 1903, il partage le prix Nobel de physique avec son épouse, Marie, et Henri Becquerel. Elle reste la seule personne récompensée dans deux domaines scientifiques différents."
   }
  ]
 },
 {
  "id": "und-zeichen",
  "object": "L’esperluette &",
  "image": "Ligature (écriture)",
  "q": "Qu’y a-t-il derrière ?",
  "teaser": "Le & cache deux lettres, et la piste mène au secrétaire de Cicéron.",
  "steps": [
   {
    "title": "Esperluette",
    "link": "L’esperluette, c’est le signe &. Elle a le même sens que le mot « et », dont elle reprend les lettres."
   },
   {
    "title": "Ligature (écriture)",
    "link": "Le & est une ligature : deux lettres fusionnées pour former un nouveau signe."
   },
   {
    "title": "Notes tironiennes",
    "link": "Les Romains avaient un moyen encore plus rapide d’écrire : les notes tironiennes, une sténographie d’environ 1 000 signes, dont certains ont servi jusqu’au XVIIe siècle."
   },
   {
    "title": "Tiron (secrétaire)",
    "link": "Elles portent le nom de Tiron, esclave puis affranchi, secrétaire de Cicéron, qui les aurait inventées. On lui attribue parfois aussi l’esperluette, sans preuve dans ses manuscrits."
   },
   {
    "title": "Cicéron",
    "link": "Cicéron était avocat, homme d’État, philosophe et écrivain. 954 de ses lettres nous sont parvenues, un témoignage exceptionnel sur la fin de la République romaine."
   }
  ]
 },
 {
  "id": "gaensehaut",
  "object": "La chair de poule",
  "image": "Chair de poule",
  "q": "Qu’y a-t-il derrière ?",
  "teaser": "Quand les poils de ton bras se dressent, ton corps fait comme un porc-épic en danger.",
  "steps": [
   {
    "title": "Chair de poule",
    "link": "La chair de poule apparaît quand on a froid, peur, ou sous le coup d’un grand plaisir : de minuscules muscles redressent alors les poils."
   },
   {
    "title": "Hystricidae",
    "link": "Beaucoup de mammifères ont ce réflexe. Les porcs-épics de l’Ancien Monde, eux, hérissent leurs piquants face au danger, et ces piquants sont des poils modifiés."
   },
   {
    "title": "Structure vestigiale",
    "link": "Chez l’humain, qui a perdu presque tous ses poils, ce mécanisme ne sert plus à grand-chose. On parle de structure vestigiale : un caractère qui a perdu tout ou partie de sa fonction au cours de l’évolution."
   },
   {
    "title": "Coccyx",
    "link": "Un autre vestige se trouve au bas de ta colonne vertébrale : le coccyx, l’équivalent d’une queue."
   }
  ]
 },
 {
  "id": "strichcode",
  "object": "Le code-barres",
  "image": "Code-barres",
  "q": "Qu’y a-t-il derrière ?",
  "teaser": "Les rayures sur chaque emballage auraient un ancêtre inattendu : le code Morse.",
  "steps": [
   {
    "title": "Code-barres",
    "link": "Un code-barres représente des données par des barres et des espaces d’épaisseurs différentes, qu’un lecteur électronique déchiffre."
   },
   {
    "title": "Norman Joseph Woodland",
    "link": "Il a été inventé par l’Américain Norman Joseph Woodland, qui l’a breveté en 1952."
   },
   {
    "title": "Code Morse international",
    "link": "L’idée serait venue du code Morse, avec ses impulsions courtes et longues : des points et des traits étirés en barres fines et épaisses."
   },
   {
    "title": "Samuel Morse",
    "link": "Le code porte le nom de Samuel Morse, mais certains en attribuent la paternité à son assistant, Alfred Vail. Avant le télégraphe, Morse était peintre."
   }
  ]
 },
 {
  "id": "banane",
  "object": "La banane",
  "image": "Gros Michel",
  "q": "Qu’y a-t-il derrière ?",
  "teaser": "La banane qu’on mange aujourd’hui en remplace une autre, qu’un champignon a presque fait disparaître.",
  "steps": [
   {
    "title": "Gros Michel",
    "link": "Le Gros Michel est une variété de banane originaire d’Asie du Sud-Est. Son nom viendrait notamment de la grande taille de ses fruits."
   },
   {
    "title": "Maladie de Panama",
    "link": "Puis un champignon a frappé. La maladie de Panama, causée par un champignon du sol, a décimé les plantations de Gros Michel dans les années 1950."
   },
   {
    "title": "Cavendish (bananier)",
    "link": "Les planteurs sont passés à la Cavendish, qui représente aujourd’hui l’immense majorité des bananes vendues dans le monde."
   },
   {
    "title": "Monoculture",
    "link": "Cultiver une seule espèce sur une même parcelle année après année, c’est la monoculture. Quand presque toutes les bananes du commerce se ressemblent autant, une seule maladie peut les menacer toutes."
   }
  ]
 }
];
