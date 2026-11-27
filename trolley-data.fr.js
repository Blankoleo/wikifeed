'use strict';
// Research stack for the trolley game – French version (same numbers n, s, p, i as trolley-data.js / trolley-data.en.js).
// Translation of the English original version by the authors (trolley-data.en.js); titles added by WikiFeed.
// Source: Christensen, J. F., Flexas, A., Calabrese, M., Gut, N. K. & Gomila, A. (2014):
// “Moral judgment reloaded: a moral dilemma validation study”. Frontiers in Psychology 5:607.
// doi:10.3389/fpsyg.2014.00607 – licence CC BY. French translation by WikiFeed.
// s = scenario, p = 1: personal, 0: at a distance; i = 1: death as a means, 0: death as a side effect.
const TROLLEY_STACK_TITLES = {"1":"L’immeuble en feu","2":"Le bébé qui pleure","3":"Le sous-marin sous l’iceberg","4":"Les plongeurs démineurs","5":"L’orphelinat","6":"Le centre de santé","7":"L’hélicoptère de secours","8":"Le feu sur la station spatiale","9":"La centrale nucléaire","10":"La démolition","12":"Le bus dans la rivière","13":"La greffe d’organes","14":"La grue du port","15":"L’épidémie","16":"Le tramway fou","17":"La source d’énergie","18":"Le rassemblement de motards","19":"Les soldats","20":"Du poison à l’hôpital","21":"Les barques","22":"L’ascenseur de la mine","23":"Le magnat","24":"L’espion"};
const TROLLEY_STACK = [
  {
"n": 1,
"s": 1,
"p": 1,
"i": 1,
"text": "Toi et cinq autres personnes êtes pris au piège dans un immeuble en feu. Il n’y a qu’une seule issue de secours par laquelle vous pourriez tous vous échapper, mais elle est bloquée par des débris en flammes. Un autre blessé est sur le point de ramper par un trou au bas de la porte de secours. Toi et les cinq personnes derrière toi n’avez pas le temps d’en faire autant.",
"act": "Si tu te sers du blessé pour enfoncer les débris, tu pourras t’échapper. Cela le tuera à coup sûr, mais cela te sauvera, toi et les cinq personnes derrière toi.",
"q": "Enfonces-tu les débris en te servant du blessé, pour que toi et les cinq autres personnes puissiez vous échapper ?"
},
  {
"n": 2,
"s": 1,
"p": 0,
"i": 0,
"text": "Toi et cinq autres personnes êtes pris au piège dans un immeuble en feu. Il n’y a qu’une seule issue de secours par laquelle vous pourriez tous vous échapper, mais elle est bloquée par des débris en flammes. Un autre blessé est sur le point de ramper par un trou au bas de la porte de secours. Toi et les cinq personnes derrière toi n’avez pas le temps d’en faire autant.",
"act": "Si tu actives le système d’urgence, il retirera l’oxygène du couloir, ce qui éteindra le feu. Mais le blessé se retrouvera sans air. Cela le tuera, mais toi et les cinq personnes derrière toi serez sauvés.",
"q": "Éteins-tu le feu en activant le système d’urgence, qui laissera le blessé sans air, pour que toi et les cinq autres personnes puissiez vous échapper ?"
},
  {
"n": 3,
"s": 2,
"p": 1,
"i": 0,
"text": "Des soldats ennemis ont pris ton village et vont tuer tous les civils de plus de deux ans. Toi et dix voisins vous cachez dans deux pièces de la cave d’une grande maison. Tu entends les voix de soldats venus fouiller la maison à la recherche d’objets de valeur. Ton bébé se met à pleurer très fort. Ses pleurs vont attirer l’attention des soldats, qui épargneront la vie de ton bébé, mais te tueront, toi et les autres réfugiés des deux pièces.",
"act": "Si tu lui mets la main sur la bouche, tu étoufferas ses pleurs, mais ton bébé ne pourra plus respirer. Cela le tuera, mais cela te sauvera, toi et les dix autres voisins.",
"q": "Étouffes-tu les pleurs en mettant ta main sur la bouche de ton bébé, ce qui le privera d’air, pour que les soldats ne vous trouvent pas, toi et les dix voisins ?"
},
  {
"n": 4,
"s": 2,
"p": 0,
"i": 0,
"text": "Des soldats ennemis ont pris ton village et vont tuer tous les civils de plus de deux ans. Toi et dix voisins vous cachez dans deux pièces de la cave d’une grande maison. Tu entends les voix de soldats venus fouiller la maison à la recherche d’objets de valeur. Ton bébé se met à pleurer très fort. Ses pleurs vont attirer l’attention des soldats, qui épargneront la vie de ton bébé, mais te tueront, toi et les autres réfugiés des deux pièces.",
"act": "Si tu mets en marche une chaudière bruyante, elle couvrira les pleurs, mais il fera alors une chaleur pénible. La chaleur tuera ton bébé, mais elle te sauvera, toi et les dix voisins.",
"q": "Couvres-tu les pleurs en mettant en marche la chaudière bruyante, qui asphyxiera le bébé, pour qu’ils ne vous trouvent pas, toi et les dix voisins ?"
},
  {
"n": 5,
"s": 3,
"p": 1,
"i": 0,
"text": "Tu es membre de l’équipage d’un sous-marin qui navigue sous un grand iceberg. Une explosion a endommagé le navire, blessé plusieurs membres d’équipage et fait s’effondrer le seul passage entre le pont supérieur et le pont inférieur. Toi et dix survivants êtes dans la partie supérieure, où il n’y a pas assez d’oxygène pour que vous surviviez tous jusqu’à la remontée à la surface. Un seul membre d’équipage gît inconscient dans la partie inférieure, où il y a assez d’oxygène.",
"act": "Si tu pousses la trappe d’accès de secours entre la partie supérieure et la partie inférieure du navire, l’oxygène pourra affluer dans la partie supérieure. La trappe tombera cependant sur le membre d’équipage de la partie inférieure et le tuera, mais cela te sauvera, toi et les dix survivants.",
"q": "Fais-tu entrer l’air en ouvrant la trappe, qui tombera sur le membre d’équipage d’en bas, pour que toi et les dix survivants ayez assez d’oxygène ?"
},
  {
"n": 6,
"s": 3,
"p": 0,
"i": 0,
"text": "Tu es membre de l’équipage d’un sous-marin qui navigue sous un grand iceberg. Une explosion a endommagé le navire, blessé plusieurs membres d’équipage et fait s’effondrer le seul passage entre le pont supérieur et le pont inférieur. Toi et dix survivants êtes dans la partie supérieure, où il n’y a pas assez d’oxygène pour que vous surviviez tous jusqu’à la remontée à la surface. Un seul membre d’équipage gît inconscient dans la partie inférieure, où il y a assez d’oxygène.",
"act": "Si tu appuies sur un bouton d’urgence, une trappe entre la partie supérieure et la partie inférieure du navire se libérera et laissera l’oxygène affluer dans la partie supérieure. La trappe tombera cependant sur le membre d’équipage de la partie inférieure et le tuera, mais cela te sauvera, toi et les dix survivants.",
"q": "Appuies-tu sur le bouton, ce qui fera tomber la trappe sur le membre d’équipage, pour que toi et les dix survivants ayez assez d’oxygène ?"
},
  {
"n": 7,
"s": 4,
"p": 1,
"i": 1,
"text": "Toi et dix plongeurs faites partie d’une équipe de l’ONU qui désamorce des mines antinavires de la Seconde Guerre mondiale. Un membre de l’équipe s’est blessé et le sang dans l’eau a attiré plusieurs requins. Tu as un fusil sous-marin, mais un seul harpon, et les requins sont nombreux. Le plongeur qui saigne nage vers la dernière cage de protection et l’atteindra avant toi et les autres. Les requins, qui suivent le sang, s’approchent trop pour que toi et les autres plongeurs puissiez vous échapper.",
"act": "Si tu tires sur le plongeur blessé, cela le tuera et les requins s’arrêteront pour le dévorer, mais toi et les dix plongeurs serez sauvés.",
"q": "Laisses-tu les requins dévorer le plongeur blessé en tirant sur lui, pour que toi et les dix autres plongeurs puissiez atteindre la cage de protection ?"
},
  {
"n": 8,
"s": 4,
"p": 0,
"i": 1,
"text": "Toi et dix plongeurs faites partie d’une équipe de l’ONU qui désamorce des mines antinavires de la Seconde Guerre mondiale. Un membre de l’équipe s’est blessé et le sang dans l’eau a attiré plusieurs requins. Tu as un fusil sous-marin, mais un seul harpon, et les requins sont nombreux. Le plongeur qui saigne nage vers la dernière cage de protection et l’atteindra avant toi et les autres. Les requins, qui suivent le sang, s’approchent trop pour que toi et les autres plongeurs puissiez vous échapper.",
"act": "Si tu fais exploser l’une des mines à l’aide d’une télécommande, cela tuera le plongeur blessé et les requins s’arrêteront pour le dévorer. Toi et les dix plongeurs serez alors sauvés.",
"q": "Laisses-tu les requins dévorer le plongeur blessé en faisant exploser par télécommande la mine à côté de lui, pour que toi et les dix autres plongeurs puissiez atteindre la cage de protection ?"
},
  {
"n": 9,
"s": 5,
"p": 1,
"i": 1,
"text": "Tu travailles dans un orphelinat qui accueille dix orphelins, dans un pays ravagé par la guerre. Des soldats rebelles ont pris le pouvoir et tuent désormais tous ceux qui ne soutiennent pas leur régime. De plus, ils mènent une campagne génocidaire de « nettoyage ethnique » pour tuer tous les membres d’un certain groupe ethnique. Toi et les onze enfants de l’orphelinat n’avez pas soutenu la rébellion, et tu as aussi dans ton orphelinat un enfant de ce groupe ethnique. Il n’y a aucun moyen pour toi et les autres enfants de vous enfuir, et les soldats vont à coup sûr vous tuer tous.",
"act": "Si tu étouffes avec un oreiller l’enfant du groupe ethnique persécuté pendant son sommeil, les soldats croiront que tu soutiens leur régime. Cela tuera l’enfant, mais cela te sauvera, toi et les dix enfants restants.",
"q": "Fais-tu croire aux soldats que tu soutiens leur régime en étouffant cet enfant, pour qu’ils vous laissent la vie sauve, à toi et aux dix autres enfants ?"
},
  {
"n": 10,
"s": 5,
"p": 0,
"i": 1,
"text": "Tu travailles dans un orphelinat qui accueille dix orphelins, dans un pays ravagé par la guerre. Des soldats rebelles ont pris le pouvoir et tuent désormais tous ceux qui ne soutiennent pas leur régime. De plus, ils mènent une campagne génocidaire de « nettoyage ethnique » pour tuer tous les membres d’un certain groupe ethnique. Toi et les onze enfants de l’orphelinat n’avez pas soutenu la rébellion, et tu as aussi dans ton orphelinat un enfant de ce groupe ethnique. Il n’y a aucun moyen pour toi et les autres enfants de vous enfuir, et les soldats vont à coup sûr vous tuer tous.",
"act": "Si tu ordonnes à une infirmière de donner à l’enfant du groupe ethnique persécuté une surdose mortelle de somnifères, les soldats croiront que tu soutiens leur régime. Cela tuera l’enfant, mais cela te sauvera, toi et les dix enfants restants.",
"q": "Fais-tu croire aux soldats que tu soutiens leur régime en ordonnant à l’infirmière de donner une surdose à cet enfant, pour qu’ils vous laissent la vie sauve, à toi et aux dix autres enfants ?"
},
  {
"n": 11,
"s": 6,
"p": 1,
"i": 1,
"text": "Tu es agent de santé bénévole du Peace Corps dans un village rural d’Afrique. Un homme d’un village voisin a été infecté par le virus Ebola, extrêmement contagieux, incurable et presque toujours mortel. Contre toute attente, cet homme est toujours en vie, ce qui signifie qu’il doit être immunisé contre les effets mortels du virus. Il croit cependant, à tort, que ton centre de santé peut le guérir complètement. Tu le vois arriver et tu sais que s’il entre dans le village, il transmettra le virus à 119 personnes innocentes qui, contrairement à lui, mourront.",
"act": "Si tu l’abats avec l’arme du centre de santé, tu l’empêcheras de transmettre le virus à toi et au reste du village. Cela le tuera, mais cela te sauvera, toi et les 119 habitants du village.",
"q": "Empêches-tu l’homme d’entrer dans le village en l’abattant, pour qu’il ne transmette pas le virus à toi et aux 119 habitants du village ?"
},
  {
"n": 12,
"s": 6,
"p": 0,
"i": 1,
"text": "Tu es agent de santé bénévole du Peace Corps dans un village rural d’Afrique. Un homme d’un village voisin a été infecté par le virus Ebola, extrêmement contagieux, incurable et presque toujours mortel. Contre toute attente, cet homme est toujours en vie, ce qui signifie qu’il doit être immunisé contre les effets mortels du virus. Il croit cependant, à tort, que ton centre de santé peut le guérir complètement. Tu le vois arriver et tu sais que s’il entre dans le village, il transmettra le virus à 119 personnes innocentes qui, contrairement à lui, mourront.",
"act": "Si tu préviens le conseil du village, ses membres l’abattront pour l’empêcher de transmettre le virus à toi et au reste du village. Cela le tuera, mais cela te sauvera, toi et les 119 habitants du village.",
"q": "Empêches-tu l’homme d’entrer dans le village en prévenant le conseil du village pour qu’il le fasse abattre, afin qu’il ne transmette pas le virus à toi et aux 119 habitants du village ?"
},
  {
"n": 13,
"s": 7,
"p": 1,
"i": 1,
"text": "Tu es médecin, seul à bord d’un hélicoptère de secours pendant une inondation dévastatrice. Tu as secouru huit personnes grièvement blessées et tu les maintiens en vie. Soudain, le pilote te signale un problème de moteur et ordonne d’alléger l’hélicoptère, sinon il s’écrasera et vous mourrez tous. Tu ne peux pas quitter l’hélicoptère, car les blessés ont besoin de ton aide, et le lourd matériel médical est fixé par des boulons.",
"act": "Si tu jettes l’un des blessés hors de l’hélicoptère, tu l’allégeras suffisamment pour qu’il reste en l’air. Cela tuera le blessé, mais cela te sauvera, toi et les huit personnes à bord.",
"q": "Allèges-tu l’hélicoptère en jetant l’un des blessés par-dessus bord, pour que toi et les huit personnes à bord puissiez rester en l’air ?"
},
  {
"n": 14,
"s": 7,
"p": 0,
"i": 1,
"text": "Tu es médecin, seul à bord d’un hélicoptère de secours pendant une inondation dévastatrice. Tu as secouru huit personnes grièvement blessées et tu les maintiens en vie. Soudain, le pilote te signale un problème de moteur et ordonne d’alléger l’hélicoptère, sinon il s’écrasera et vous mourrez tous. Tu ne peux pas quitter l’hélicoptère, car les blessés ont besoin de ton aide, et le lourd matériel médical est fixé par des boulons.",
"act": "Si tu coupes le câble par lequel la dernière personne secourue est en train d’être hissée, tu allégeras suffisamment l’hélicoptère pour qu’il reste en l’air. Cela la tuera, mais cela te sauvera, toi et les huit personnes à bord.",
"q": "Allèges-tu l’hélicoptère en coupant le câble par lequel la dernière personne est hissée, pour vous maintenir en l’air, toi et les huit personnes à bord ?"
},
  {
"n": 15,
"s": 8,
"p": 1,
"i": 0,
"text": "Tu es ingénieur à bord de la Station spatiale internationale (ISS). Soudain, un incendie se déclare dans la soute. Le système automatique de lutte contre l’incendie ouvrirait la porte extérieure de la soute, laissant s’échapper l’oxygène et éteignant aussitôt le feu. Mais il ne fonctionne que si le sas intérieur est fermé, or un mécanicien se trouve encore dans la soute. Tu comprends qu’il n’a pas le temps d’enlever sa combinaison spatiale encombrante et qu’il restera coincé en essayant de franchir le sas intérieur, si bien que le feu se propagera et vous tuera tous.",
"act": "Si tu repousses le mécanicien dans la soute, le sas se fermera et activera le système d’urgence, qui éteindra le feu. Cela aspirera le mécanicien dans l’espace et le tuera, mais cela te sauvera, toi et les dix autres astronautes.",
"q": "Éteins-tu le feu en fermant à la main le sas intérieur, ce qui aspirera le mécanicien dans l’espace, pour que le feu ne vous atteigne pas, toi et les dix astronautes ?"
},
  {
"n": 16,
"s": 8,
"p": 0,
"i": 0,
"text": "Tu es ingénieur à bord de la Station spatiale internationale (ISS). Soudain, un incendie se déclare dans la soute. Le système automatique de lutte contre l’incendie ouvrirait la porte extérieure de la soute, laissant s’échapper l’oxygène et éteignant aussitôt le feu. Mais il ne fonctionne que si le sas intérieur est fermé, or un mécanicien se trouve encore dans la soute. Tu comprends qu’il n’a pas le temps d’enlever sa combinaison spatiale encombrante et qu’il restera coincé en essayant de franchir le sas intérieur, si bien que le feu se propagera et vous tuera tous.",
"act": "Si tu appuies sur un bouton avant que le mécanicien n’atteigne le sas intérieur, le sas se fermera et activera le système d’urgence, qui éteindra le feu. Cela aspirera le mécanicien dans l’espace et le tuera, mais cela te sauvera, toi et les dix astronautes restants.",
"q": "Éteins-tu le feu en appuyant sur le bouton qui ferme le sas intérieur, aspirant le mécanicien dans l’espace, pour que le feu ne vous atteigne pas, toi et les dix astronautes ?"
},
  {
"n": 17,
"s": 9,
"p": 1,
"i": 1,
"text": "Tu es inspecteur dans une centrale nucléaire. Le chef de la centrale et toi visitez l’installation quand l’une des conduites d’alimentation surchauffe. Le système de refroidissement d’urgence ne se déclenche pas, et une réaction en chaîne qui mènera à la fusion du cœur est sur le point de commencer. Elle libérera des radiations mortelles sur la ville voisine et tuera des milliers de personnes.",
"act": "Si tu pousses le chef sur les conduites, cela dissipera assez de chaleur pour empêcher la réaction en chaîne. Cela le tuera, mais cela te sauvera, toi et les milliers d’habitants de la ville.",
"q": "Refroidis-tu les conduites en y poussant le chef, pour que la réaction en chaîne soit arrêtée à temps pour toi et les milliers de personnes ?"
},
  {
"n": 18,
"s": 9,
"p": 0,
"i": 0,
"text": "Tu es inspecteur dans une centrale nucléaire. Le chef de la centrale et toi visitez l’installation quand l’une des conduites d’alimentation surchauffe. Le système de refroidissement d’urgence ne se déclenche pas, et une réaction en chaîne qui mènera à la fusion du cœur est sur le point de commencer. Elle libérera des radiations mortelles sur la ville voisine et tuera des milliers de personnes.",
"act": "Si tu injectes à la main de l’azote liquide dans la chambre d’alimentation, cela dissipera assez de chaleur pour empêcher la réaction en chaîne. Cela tuera un employé coincé dans la chambre d’alimentation, mais cela te sauvera, toi et les milliers d’habitants de la ville.",
"q": "Dissipes-tu la chaleur en injectant de l’azote liquide dans la chambre d’alimentation où l’employé est coincé, pour que la réaction en chaîne soit arrêtée à temps pour toi et les milliers de personnes ?"
},
  {
"n": 19,
"s": 10,
"p": 1,
"i": 1,
"text": "Tu es l’expert en explosifs d’une entreprise chargée de démolir un gratte-ciel. Tu vérifies les dernières charges quand tu remarques soudain un adolescent sur le point de faire exploser accidentellement l’une d’elles. L’explosion provoquera l’effondrement incontrôlé du bâtiment sur toi, sur l’adolescent et sur la foule de spectateurs. L’adolescent se trouve plusieurs étages en dessous de toi et ne peut pas t’entendre.",
"act": "Si tu lui lâches un lourd parpaing sur la tête, cela le tuera, mais cela empêchera l’explosion et te sauvera, toi et la foule.",
"q": "Arrêtes-tu l’adolescent en lui lâchant le parpaing sur la tête, pour que le bâtiment ne s’effondre pas sur toi et la foule de spectateurs ?"
},
  {
"n": 20,
"s": 10,
"p": 0,
"i": 1,
"text": "Tu es l’expert en explosifs d’une entreprise chargée de démolir un gratte-ciel. Tu vérifies les dernières charges quand tu remarques soudain un adolescent sur le point de faire exploser accidentellement l’une d’elles. L’explosion provoquera l’effondrement incontrôlé du bâtiment sur toi, sur l’adolescent et sur la foule de spectateurs. L’adolescent se trouve plusieurs étages en dessous de toi et ne peut pas t’entendre.",
"act": "Si tu rétablis l’électricité du bâtiment, le garçon recevra une décharge électrique, car il touche un circuit ouvert. Cela le tuera, mais cela te sauvera, toi et la foule, en empêchant l’explosion.",
"q": "Arrêtes-tu l’adolescent en rétablissant l’électricité du bâtiment, pour que le bâtiment ne s’effondre pas sur toi et la foule de spectateurs ?"
},
  {
"n": 23,
"s": 12,
"p": 1,
"i": 0,
"text": "Tu conduis le bus d’une sortie de maternelle au zoo. En chemin, à cause de pneus défectueux, le bus tombe d’un pont et plonge dans une rivière en furie. Toi et trois des enfants êtes encore dans le bus qui coule. Les autres ont déjà été emportés par la rivière. Tu attrapes les deux enfants à côté de toi et tu commences à nager vers la sortie. Le troisième enfant s’agrippe à ta jambe. Tu sens que tu n’as pas assez de force pour lutter contre le courant et nager avec les trois enfants.",
"act": "Si tu secoues ta jambe pour te dégager du troisième enfant, tu pourras lutter contre le courant, mais l’enfant laissé derrière se noiera. Cela le tuera, mais cela te sauvera, toi et les deux autres enfants.",
"q": "Luttes-tu contre le courant en te dégageant de l’enfant, ce qui le fera se noyer, pour que toi et les deux autres enfants puissiez remonter à la surface ?"
},
  {
"n": 24,
"s": 12,
"p": 0,
"i": 0,
"text": "Tu conduis le bus d’une sortie de maternelle au zoo. En chemin, à cause de pneus défectueux, le bus tombe d’un pont et plonge dans une rivière en furie. Toi et trois des enfants êtes encore dans le bus qui coule. Les autres ont déjà été emportés par la rivière. Tu attrapes les deux enfants à côté de toi et tu commences à nager vers la sortie, mais des sièges encombrants la bloquent.",
"act": "Si tu tires les sièges sur le côté, tu dégageras la sortie, mais tu bloqueras le couloir et le troisième enfant sera pris au piège, si bien qu’il se noiera. Cela le tuera, mais cela te sauvera, toi et les deux autres enfants.",
"q": "Dégages-tu la sortie en mettant les sièges dans le couloir, ce qui piégera le troisième enfant, pour que toi et les deux autres enfants puissiez remonter à la surface ?"
},
  {
"n": 25,
"s": 13,
"p": 1,
"i": 1,
"text": "Tu es médecin. Tu as cinq patients qui mourront tous s’ils ne reçoivent pas immédiatement une greffe d’organe. Un autre patient vient d’être amené d’urgence à l’hôpital après un grave accident de voiture. Il est grièvement blessé, mais tu peux probablement le sauver grâce à une opération longue et compliquée.",
"act": "Si tu lui sectionnes secrètement l’artère carotide pendant l’opération, il mourra et tu auras les organes pour les cinq autres patients. Cela le tuera, mais sauvera les cinq autres patients.",
"q": "Obtiens-tu les organes en sectionnant l’artère carotide de l’accidenté, pour pouvoir pratiquer les greffes pour les cinq autres patients ?"
},
  {
"n": 26,
"s": 13,
"p": 0,
"i": 1,
"text": "Tu es médecin. Tu as cinq patients qui mourront tous s’ils ne reçoivent pas immédiatement une greffe d’organe. Un autre patient vient d’être amené d’urgence à l’hôpital après un grave accident de voiture. Il est grièvement blessé. Pendant l’opération, longue et compliquée, tu remarques qu’une infirmière est sur le point d’injecter le mauvais médicament, qui sera mortel dans ce cas.",
"act": "Si tu laisses l’infirmière injecter le mauvais médicament, l’accidenté mourra et tu auras les organes pour les cinq autres patients. Cela tuera ce patient, mais sauvera les cinq autres patients.",
"q": "Obtiens-tu les organes en laissant l’infirmière injecter le mauvais médicament, pour pouvoir pratiquer les greffes pour les cinq autres patients ?"
},
  {
"n": 27,
"s": 14,
"p": 1,
"i": 0,
"text": "Tu fais partie d’une équipe de dockers qui accrochent les câbles de grue aux conteneurs pour décharger les cargos. Toi et les autres venez d’accrocher les câbles à un conteneur et vous montez maintenant dessus pour vérifier qu’il est bien déchargé. Soudain, le voyant rouge clignote : le câble de la grue est sur le point de lâcher. Tu vois que la cause est une bagarre entre deux membres de l’équipe. Le conteneur se balance dangereusement au-dessus de cinq autres membres de l’équipe, sur le pont.",
"act": "Si tu pousses les deux hommes qui se battent pour les séparer, tu éviteras la chute du conteneur. Mais l’un d’eux ne porte pas son harnais de sécurité et tombera du conteneur. Cela le tuera, mais cela sauvera les cinq membres de l’équipe sur le pont.",
"q": "Arrêtes-tu le balancement du conteneur en poussant tes collègues, ce qui fera tomber celui qui n’a pas de harnais, pour que le conteneur ne s’écrase pas sur les cinq membres de l’équipe sur le pont ?"
},
  {
"n": 28,
"s": 14,
"p": 0,
"i": 0,
"text": "Tu fais partie d’une équipe de dockers qui accrochent les câbles de grue aux conteneurs pour décharger les cargos. Toi et les autres venez d’accrocher les câbles à un conteneur et vous montez maintenant dessus pour vérifier qu’il est bien déchargé. Soudain, le voyant rouge clignote : un câble est sur le point de lâcher. S’il lâche au-dessus du pont, le conteneur s’écrasera sur cinq membres de l’équipe.",
"act": "Si tu appuies sur le bouton de largage d’urgence, le conteneur retombera dans la cale. Toi et les autres resterez suspendus dans les airs par vos harnais de sécurité, mais un membre de l’équipe travaille encore dans la cale. Y faire retomber le conteneur le tuera, mais cela sauvera les cinq membres de l’équipe sur le pont.",
"q": "Largues-tu le conteneur en appuyant sur le bouton d’urgence, ce qui le fera retomber dans la cale sur le membre de l’équipe, pour qu’il ne s’écrase pas sur les cinq membres de l’équipe sur le pont ?"
},
  {
"n": 29,
"s": 15,
"p": 1,
"i": 0,
"text": "Une épidémie virale s’est répandue dans le monde entier et a tué des milliers de personnes. Tu es chercheur en médecine et tu as mis au point deux substances dans ton laboratoire. À la suite d’une erreur, les deux portent l’étiquette « vaccin ». L’une d’elles est bien le vaccin, qui pourrait sauver des milliers de vies. L’autre est mortelle.",
"act": "Si tu injectes les substances à tes deux assistants de laboratoire sans savoir laquelle est laquelle, tu pourras identifier le vaccin. L’un des assistants mourra, mais tu pourras sauver des milliers de vies avec ton vaccin.",
"q": "Identifies-tu le vaccin en injectant ces deux substances à tes deux assistants, ce qui empoisonnera l’un d’eux, pour que des milliers de personnes puissent être vaccinées ?"
},
  {
"n": 30,
"s": 15,
"p": 0,
"i": 0,
"text": "Une épidémie virale s’est répandue dans le monde entier et a tué des milliers de personnes. Tu es chercheur en médecine et tu as mis au point deux substances dans ton laboratoire. À la suite d’une erreur, les deux portent l’étiquette « vaccin ». L’une d’elles est bien le vaccin, qui pourrait sauver des milliers de vies. L’autre est mortelle.",
"act": "Si tu laisses une infirmière injecter les deux substances à deux patients, tu pourras identifier le vaccin. L’un des patients mourra, mais tu pourras sauver des milliers de vies avec le vaccin.",
"q": "Identifies-tu le vaccin en laissant l’infirmière injecter les deux substances à deux patients, ce qui empoisonnera l’un d’eux, pour que des milliers de personnes puissent être vaccinées ?"
},
  {
"n": 31,
"s": 16,
"p": 1,
"i": 1,
"text": "Un tramway fou fonce sur les rails vers cinq ouvriers, qui seront tués s’il poursuit sa course. Tu te tiens à côté des rails, mais tu es trop loin pour les prévenir. À côté de toi se trouve un inconnu très corpulent.",
"act": "Si tu pousses l’inconnu corpulent sur les rails, le tramway déraillera et ne poursuivra pas sa course vers les ouvriers. Cela tuera l’inconnu, mais tu sauveras les cinq ouvriers.",
"q": "Fais-tu dérailler le tramway en poussant l’inconnu sur les rails, pour que le tramway n’atteigne pas les cinq ouvriers ?"
},
  {
"n": 32,
"s": 16,
"p": 0,
"i": 0,
"text": "Un tramway fou fonce sur les rails vers cinq ouvriers, qui seront tués s’il poursuit sa course. Tu te tiens à côté des rails, mais tu es trop loin pour les prévenir. À côté de toi se trouve un aiguillage qui peut dévier le tramway sur une autre voie, où ne travaille qu’un seul ouvrier.",
"act": "Si tu actionnes l’aiguillage, le tramway sera dévié sur la voie de l’ouvrier seul et ne poursuivra pas sa course vers les cinq ouvriers. Cela tuera cet ouvrier, mais sauvera les cinq autres.",
"q": "Dévies-tu le tramway en actionnant l’aiguillage, ce qui fera que le tramway écrasera un ouvrier, pour que le tramway n’atteigne pas les cinq ouvriers ?"
},
  {
"n": 33,
"s": 17,
"p": 1,
"i": 1,
"text": "Avec un collègue chercheur, tu as découvert une nouvelle source d’énergie puissante, bon marché, sûre et propre. Elle pourrait mettre fin à la pollution et à la pauvreté dans le monde. Mais ton collègue veut vendre la découverte, et tu sais qu’il compte contacter les acheteurs potentiels aujourd’hui. Tu sais aussi avec certitude que ceux-ci utiliseront l’invention comme arme meurtrière, mais ton collègue ne te croit pas.",
"act": "Si tu empoisonnes ton collègue avec un poison courant disponible dans ton laboratoire, tu éviteras que la découverte tombe entre de mauvaises mains. Le poison tuera ton collègue, mais tu sauveras des milliers de personnes.",
"q": "Empêches-tu la vente de la découverte en empoisonnant ton collègue, pour que la source d’énergie ne puisse pas servir d’arme contre des milliers de personnes ?"
},
  {
"n": 34,
"s": 17,
"p": 0,
"i": 1,
"text": "Avec un collègue chercheur, tu as découvert une nouvelle source d’énergie puissante, bon marché, sûre et propre. Elle pourrait mettre fin à la pollution et à la pauvreté dans le monde. Mais ton collègue veut vendre la découverte, et tu sais qu’il compte contacter les acheteurs potentiels par e-mail aujourd’hui. Tu sais aussi avec certitude que ceux-ci utiliseront l’invention comme arme meurtrière, mais ton collègue ne te croit pas.",
"act": "Si tu libères un gaz inflammable dans le laboratoire, il provoquera une explosion quand ton collègue allumera son ordinateur. Cela le tuera, mais tu sauveras des milliers de personnes.",
"q": "Fais-tu exploser l’ordinateur de ton collègue en libérant le gaz inflammable, pour empêcher que la découverte serve d’arme contre des milliers de personnes ?"
},
  {
"n": 35,
"s": 18,
"p": 1,
"i": 1,
"text": "Tu es un motard expérimenté et tu participes à une Bike Week. Alors que tu roules en tête d’un grand groupe de dix motards, tu remarques soudain qu’un motard devant toi perd le contrôle de sa machine. En accélérant pour arriver à sa hauteur, tu comprends qu’il va chuter d’un instant à l’autre. Cela provoquerait un grand carambolage, et le groupe de dix motards derrière toi mourrait.",
"act": "Si tu pousses ce motard hors de la route, il s’écrasera contre les arbres, mais tu empêcheras le carambolage. À ta vitesse actuelle, cela le tuera, mais tu sauveras le groupe de dix motards.",
"q": "Empêches-tu le grand carambolage en poussant ce motard hors de la route, pour éviter que le groupe de dix motards ne le percute ?"
},
  {
"n": 36,
"s": 18,
"p": 0,
"i": 1,
"text": "Tu es un motard expérimenté et tu participes à une Bike Week. Alors que tu roules en tête d’un grand groupe de dix motards, tu remarques soudain qu’un motard devant toi perd le contrôle de sa machine et tombe. Tu peux facilement l’éviter toi-même, mais les motards derrière toi vont se percuter et mourir dans le carambolage qui s’ensuivra.",
"act": "Si tu laisses ta moto percuter le motard qui tombe tout en sautant toi-même dans le fossé, tu préviendras les autres à temps. Cela tuera ce motard, mais tu sauveras les dix autres.",
"q": "Alertes-tu les autres de l’accident imminent en lançant ta moto contre celle du motard qui tombe, pour que les dix autres aient assez de temps pour le contourner ?"
},
  {
"n": 37,
"s": 19,
"p": 1,
"i": 1,
"text": "Tu commandes un petit groupe de soldats. Vous rentrez d’une mission en territoire ennemi quand l’un de tes hommes met le pied dans un piège qui lui saisit la jambe et le blesse grièvement. Tu ne peux pas le libérer sans le tuer, mais si tu l’abandonnes, les troupes ennemies le tortureront jusqu’à ce qu’il révèle la position d’un important camp de base allié. Les soldats attaqueront ensuite ce camp et tueront les 10 soldats de la section qui s’y trouve. Le soldat te supplie de ne pas l’abandonner, mais les troupes ennemies approchent et il est dangereux pour toi et tes hommes de rester, car vous n’avez plus de munitions.",
"act": "Si tu poignardes toi-même le soldat, tu éviteras qu’il soit torturé et révèle l’information qui entraînerait la mort de la section alliée. Cela le tuera, mais tu sauveras les dix soldats de la section.",
"q": "Empêches-tu que le soldat piégé soit torturé en le poignardant à mort, pour qu’il ne puisse pas révéler la position des dix soldats alliés ?"
},
  {
"n": 38,
"s": 19,
"p": 0,
"i": 1,
"text": "Tu commandes un petit groupe de soldats. Vous rentrez d’une mission en territoire ennemi quand l’un de tes hommes met le pied dans un piège qui lui saisit la jambe et le blesse grièvement. Tu ne peux pas le libérer sans le tuer, mais si tu l’abandonnes, les troupes ennemies le tortureront jusqu’à ce qu’il révèle la position d’un important camp de base allié. Les soldats attaqueront ensuite ce camp et tueront les 10 soldats de la section qui s’y trouve. Le soldat te supplie de ne pas l’abandonner, mais les troupes ennemies approchent et il est dangereux pour toi et tes hommes de rester, car vous n’avez plus de munitions.",
"act": "Si tu signales la position du soldat piégé avec une fusée éclairante, la zone sera bombardée. Tu éviteras ainsi que le soldat soit torturé et révèle l’information qui entraînerait la mort de la troupe alliée. Cela le tuera, mais tu sauveras les dix soldats de la section alliée.",
"q": "Empêches-tu que le soldat piégé soit torturé en faisant bombarder la zone, pour qu’il ne puisse pas révéler la position des dix soldats alliés ?"
},
  {
"n": 39,
"s": 20,
"p": 1,
"i": 1,
"text": "Tu es de garde de nuit dans un hôpital. Un produit chimique s’est répandu dans une chambre où se trouvent six patients. Ce produit est très toxique : au contact de l’oxygène, il s’évapore et se transforme en un gaz toxique qui tuera tous les patients de la chambre. Tu ne peux pas l’essuyer avec des serviettes ou des chiffons ordinaires. La peau humaine, en revanche, l’absorbe rapidement.",
"act": "Si tu places l’un des patients sur le produit, tu l’empêcheras de s’évaporer. Cela tuera ce patient, mais tu sauveras les cinq autres patients de la chambre.",
"q": "Empêches-tu l’évaporation toxique en plaçant l’un des patients sur le produit, pour que les cinq autres patients ne soient pas empoisonnés ?"
},
  {
"n": 40,
"s": 20,
"p": 0,
"i": 0,
"text": "Tu es de garde de nuit dans un hôpital. Un produit chimique s’est répandu dans une chambre où se trouvent cinq patients. Ce produit est très toxique : au contact de l’oxygène, il s’évapore et se transforme en un gaz toxique qui tuera tous les patients de la chambre. Tu ne peux pas l’essuyer avec des serviettes ou des chiffons ordinaires.",
"act": "Si tu actives la ventilation, le gaz toxique sera évacué de la chambre. Mais il sera transféré dans une chambre à l’étage où se trouve un patient que tu ne pourras pas évacuer à temps. Cela tuera ce patient, mais tu sauveras les cinq autres.",
"q": "Évacues-tu le gaz de la chambre en activant la ventilation, ce qui le transférera dans la chambre où se trouve un seul patient, pour que les cinq autres patients ne soient pas empoisonnés ?"
},
  {
"n": 41,
"s": 21,
"p": 1,
"i": 1,
"text": "Tu es dans une barque avec un guide sur un lac en Alaska. Non loin de là, trois enfants sont tombés de leur bateau et risquent de mourir de froid. Tu sauves les enfants, mais l’un d’eux est très lourd et tu comprends que si tu le gardes à bord, ta barque coulera et tout le monde mourra. Ni toi ni le guide ne pouvez quitter la barque, car tu rames et le guide pratique une réanimation sur l’un des enfants.",
"act": "Si tu jettes l’enfant lourd par-dessus bord, tu pourras atteindre la rive. Cela tuera cet enfant, mais tu sauveras les deux autres.",
"q": "Allèges-tu la barque en jetant cet enfant par-dessus bord, pour pouvoir atteindre la rive avec les deux autres enfants ?"
},
  {
"n": 42,
"s": 21,
"p": 0,
"i": 0,
"text": "Tu es dans une barque avec un guide sur un lac en Alaska. Non loin de là, trois enfants sont tombés de leur bateau et risquent de mourir de froid. Après avoir sauvé deux des enfants, tu comprends que le poids du troisième ferait couler ta barque et que tout le monde mourrait. Ni toi ni le guide ne pouvez quitter la barque, car tu rames et le guide pratique une réanimation sur l’un des enfants.",
"act": "Si tu rames vers la rive en laissant le troisième enfant dans l’eau, tu empêcheras ta barque de couler. Cela tuera l’enfant laissé derrière, mais tu sauveras les deux autres.",
"q": "Empêches-tu ta barque de couler en laissant le troisième enfant derrière toi, ce qui causera sa mort, pour pouvoir atteindre la rive avec les deux autres enfants ?"
},
  {
"n": 43,
"s": 22,
"p": 1,
"i": 1,
"text": "Tu es mineur. Le seul moyen de sortir de la mine est de remonter par un simple ascenseur à câble composé de petites cabines. C’est la fin de ton poste et tout le monde remonte à la surface dans les cabines. Pendant que tu fais la queue, tu vois que le câble qui porte toutes les cabines est sur le point de rompre. En ce moment, 10 mineurs se trouvent dans les cabines.",
"act": "Si tu fais basculer la dernière cabine, le mineur qui s’y trouve tombera. Tu réduiras ainsi assez la charge pour que le câble ne rompe pas, et tu amèneras les 10 autres mineurs jusqu’à la sortie. Cela tuera le mineur de la cabine que tu fais basculer, mais tu sauveras les 10 autres.",
"q": "Réduis-tu le poids en faisant basculer la cabine où se trouve un seul mineur, pour que les dix autres mineurs atteignent la sortie ?"
},
  {
"n": 44,
"s": 22,
"p": 0,
"i": 1,
"text": "Tu es mineur. Le seul moyen de sortir de la mine est de remonter par un simple ascenseur à câble composé de petites cabines. C’est la fin de ton poste et tout le monde remonte à la surface dans les cabines. Pendant que tu fais la queue, tu vois que le câble qui porte toutes les cabines est sur le point de rompre. En ce moment, 10 mineurs se trouvent dans les cabines.",
"act": "Si tu actionnes un interrupteur d’urgence, la dernière cabine se détachera du câble. Le poids sera ainsi assez réduit pour que les cabines des 10 autres mineurs tiennent. Cela tuera le mineur de la cabine détachée, mais sauvera les dix autres.",
"q": "Réduis-tu le poids en actionnant l’interrupteur d’urgence qui détache la dernière cabine, pour que les dix autres mineurs puissent atteindre la sortie ?"
},
  {
"n": 45,
"s": 23,
"p": 1,
"i": 0,
"text": "Tu es électricien et on t’a engagé pour réparer une panne électrique chez un magnat très riche, atteint d’un cancer en phase terminale. On a récemment annoncé qu’à sa mort, son immense fortune sera léguée à l’hôpital pour enfants de la région. Tu sais que 109 enfants de cet hôpital pourraient être sauvés grâce à cet argent, mais qu’ils ne peuvent plus attendre longtemps avant de mourir.",
"act": "Si tu étouffes le magnat pendant son sommeil en lui couvrant le nez et la bouche de tes mains gantées, ce don essentiel pour les enfants arrivera à temps. Cela tuera le magnat, mais tu sauveras la vie de 109 enfants.",
"q": "Accélères-tu le don en étouffant cet homme, pour que le don parvienne à temps aux 109 enfants malades ?"
},
  {
"n": 46,
"s": 23,
"p": 0,
"i": 1,
"text": "Tu es électricien et on t’a engagé pour réparer une panne électrique chez un magnat très riche, atteint d’un cancer en phase terminale. On a récemment annoncé qu’à sa mort, son immense fortune sera léguée à l’hôpital pour enfants de la région. Tu sais que 112 enfants de cet hôpital pourraient être sauvés grâce à cet argent, mais qu’ils ne peuvent plus attendre longtemps avant de mourir.",
"act": "Si tu provoques un court-circuit au lieu de réparer la panne, l’appareil de maintien en vie du magnat tombera en panne et ce don essentiel pour les enfants arrivera à temps. Cela tuera le magnat, mais tu sauveras la vie de 112 enfants.",
"q": "Avances-tu le don en provoquant la panne de l’appareil de maintien en vie du magnat, pour que le don parvienne à temps aux 112 enfants malades ?"
},
  {
"n": 47,
"s": 24,
"p": 1,
"i": 1,
"text": "Tu es officier pendant une guerre. Tes soldats ont trouvé un important espion ennemi, blessé et coincé dans un bâtiment effondré. Par radio, tu as appris que des soldats ennemis préparent une attaque surprise contre une ville voisine, mais tu ne sais pas laquelle. Ils tueront des milliers de civils si tes soldats et toi ne les arrêtez pas. L’espion sait quelle ville sera attaquée. Tu l’as interrogé, mais il ne veut rien te dire. Il ne survivra plus très longtemps à ses blessures.",
"act": "Si tu tortures l’espion, il révélera l’information sur la ville. La torture le tuera, mais tu sauveras des milliers de civils.",
"q": "Fais-tu révéler l’information à l’espion en le torturant, pour pouvoir empêcher l’attaque contre des milliers de civils ?"
},
  {
"n": 48,
"s": 24,
"p": 0,
"i": 1,
"text": "Tu es officier pendant une guerre. Tes soldats ont trouvé un important espion ennemi, blessé et coincé dans un bâtiment effondré. Par radio, tu as appris que des soldats ennemis préparent une attaque surprise contre une ville voisine, mais tu ne sais pas laquelle. Ils tueront des milliers de civils si tes soldats et toi ne les arrêtez pas. L’espion sait quelle ville sera attaquée. Tu l’as interrogé, mais il ne veut rien te dire. Il ne survivra plus très longtemps à ses blessures. Des rats ont commencé à lui ronger les jambes et il souffre beaucoup.",
"act": "Si tu laisses les rats poursuivre cette torture, l’espion révélera l’information sur la ville. La torture le tuera, mais tu sauveras des milliers de civils.",
"q": "Fais-tu révéler l’information à l’espion en laissant les rats continuer à le torturer, pour pouvoir empêcher l’attaque contre les milliers de civils ?"
}
];
