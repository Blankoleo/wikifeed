'use strict';
// Dilemma-Stapel für das Trolley-Spiel.
// Quelle: Christensen, J. F., Flexas, A., Calabrese, M., Gut, N. K. & Gomila, A. (2014):
// „Moral judgment reloaded: a moral dilemma validation study“. Frontiers in Psychology 5:607.
// doi:10.3389/fpsyg.2014.00607 – Lizenz CC BY. Deutsche Fassung der Autoren (Zusatzmaterial),
// hier in Situation / Handlung / Frage zerlegt; Titel und Symbole sind von WikiFeed ergänzt.
// s = Szenario, p = 1: eigenhändig (personal), 0: auf Distanz; i = 1: Tod als Mittel, 0: Tod als Nebenfolge.
const TROLLEY_STACK_TITLES = {"1": ["🔥", "Das brennende Gebäude"], "2": ["👶", "Das schreiende Baby"], "3": ["🧊", "Das U-Boot unter dem Eisberg"], "4": ["🤿", "Die Minentaucher"], "5": ["🏚️", "Das Waisenhaus"], "6": ["🏥", "Das Gesundheitszentrum"], "7": ["🚁", "Der Rettungshubschrauber"], "8": ["🛰️", "Feuer auf der Raumstation"], "9": ["☢️", "Das Atomkraftwerk"], "10": ["🧨", "Die Sprengung"], "12": ["🚌", "Der Bus im Fluss"], "13": ["🫀", "Die Organspende"], "14": ["🏗️", "Der Hafenkran"], "15": ["🦠", "Die Epidemie"], "16": ["🚋", "Die Straßenbahn"], "17": ["⚡", "Die Energiequelle"], "18": ["🏍️", "Das Motorradrennen"], "19": ["🪖", "Der Soldatentrupp"], "20": ["☣️", "Gift im Krankenhaus"], "21": ["🚣", "Die Ruderboote"], "22": ["⛏️", "Der Minenaufzug"], "23": ["💡", "Der Großindustrielle"], "24": ["🕵️", "Der Spion"]};
const TROLLEY_STACK = [
  {
"n": 1,
"s": 1,
"p": 1,
"i": 1,
"text": "Du und fünf weitere Personen seid in einem brennenden Gebäude gefangen. Es gibt nur einen Notausgang, durch den ihr alle entkommen könntet. Er ist aber durch brennende Trümmer blockiert. Eine weitere verletzte Person versucht durch ein Loch im unteren Teil des Ausgangs zu kriechen. Du und die fünf Personen hinter dir habt nicht die Zeit das Gleiche zu tun.",
"act": "Wenn du den verletzten Mann benutzt um die Schuttblockade zu durchbrechen, werdet ihr entkommen können. Dies wird ihn sicher töten, aber du und die fünf Leute hinter dir werdet euch retten können.",
"q": "Durchbrichst du den Schutt mit der verletzten Person damit du und die anderen fünf Personen entkommen könnt?"
},
  {
"n": 2,
"s": 1,
"p": 0,
"i": 0,
"text": "Du und fünf weitere Personen seid in einem brennenden Gebäude gefangen. Es gibt nur einen Notausgang, durch den ihr alle entkommen könntet, er ist aber durch brennende Trümmer blockiert. Eine weitere verletzte Person versucht durch ein Loch im unteren Teil des Ausgangs zu kriechen. Du und die fünf Personen hinter dir habt nicht die Zeit das Gleiche zu tun.",
"act": "Wenn du das Notfallsystem aktivierst wird der Sauerstoff aus dem Flur entfernt und das Feuer wird gelöscht, aber der Verwundete wird keine Luft mehr bekommen. Das wird ihn sicher töten, aber du und die fünf Personen hinter dir könnt euch retten.",
"q": "Löschst du das Feuer indem du das Notfallsystem aktivierst, wodurch der Verwundete keine Luft mehr bekommen wird, damit du und die anderen fünf Personen entkommen könnt?"
},
  {
"n": 3,
"s": 2,
"p": 1,
"i": 0,
"text": "Feindliche Soldaten haben dein Dorf belagert und werden alle Zivilisten über zwei Jahre töten. Du und zehn Nachbarn versteckt euch in zwei Räumen im Keller eines großen Hauses. Ihr hört die Stimmen der Soldaten, die ins Haus gekommen sind um nach Wertgegenständen zu suchen. Dein Säugling beginnt laut zu schreien. Das Schreien wird die Aufmerksamkeit der Soldaten auf euch ziehen, welche zwar nicht dein Baby, schon aber dich und die anderen Flüchtlinge in beiden Räumen töten werden.",
"act": "Wenn du dem Baby den Mund zuhältst wird das Schreien gedämpft, aber es wird so keine Luft mehr bekommen. Das wird das Baby töten, aber du und die anderen zehn Nachbarn könnt euch retten.",
"q": "Dämpfst du das Schreien, indem du deinem Baby den Mund zuhältst, woduch es keine Luft mehr bekommen wird, damit die Soldaten dich und die zehn Nachbarn nicht finden?"
},
  {
"n": 4,
"s": 2,
"p": 0,
"i": 0,
"text": "Feindliche Soldaten haben dein Dorf belagert und werden alle Zivilisten über zwei Jahre töten. Du und zehn Nachbarn versteckt euch in zwei Räumen im Keller eines großen Hauses. Ihr hört die Stimmen der Soldaten, die in das Haus gekommen sind um nach Wertgegenständen zu suchen. Dein Säugling beginnt laut zu schreien. Das Schreien wird die Aufmerksamkeit der Soldaten auf euch ziehen, welche zwar nicht dein Baby, schon aber dich und die anderen Flüchtlinge in beiden Räumen töten werden.",
"act": "Wenn du einen lauten Heizungskessel aktivierst wird das Schreien gedämpft. Allerdings erzeugt er eine für Kinder und Erwachsene unangenehme, aber für Babys tödliche Hitze. Das wird dein Baby töten, aber dich und die zehn Nachbarn retten.",
"q": "Dämpfst du das Schreien, indem du den Heizungskessel aktivierst, wodurch das Baby ersticken wird, damit man dich und die zehn Nachbarn nicht findet?"
},
  {
"n": 5,
"s": 3,
"p": 1,
"i": 0,
"text": "Du gehörst zur Besatzung eines U-Bootes, das sich unter einem großen Eisberg befindet. Eine Explosion hat das Boot beschädigt. Mehrere Kollegen sind verletzt und der einzige Zugang zwischen dem oberen und unteren Teil des Bootes ist verschüttet. Du und zehn weitere Überlebende befindet euch im oberen Teil. Hier gibt es aber nicht genug Sauerstoff für euch alle, bis ihr die Wasseroberfläche erreicht. Ein einzelner Kollege liegt bewusstlos im unteren Teil. Hier gibt es noch genügend Sauerstoff.",
"act": "Wenn du die Notfallklappe zwischen den beiden Teilen aufschiebst, wird die Luft durchgelassen. Allerdings wird die Klappe auf den Kollegen im unteren Teil fallen und ihn töten, aber dies wird dich und die zehn Überlebenden retten.",
"q": "Lässt du die Luft durch, indem du die Notfallklappe öffnest, die auf den Kollegen fallen wird, damit ihr, du und die zehn Überlebenden, genug Sauerstoff bekommt?"
},
  {
"n": 6,
"s": 3,
"p": 0,
"i": 0,
"text": "Du gehörst zur Besatzung eines U-Bootes, das sich unter einem großen Eisberg befindet. Eine Explosion hat das Boot beschädigt. Mehrere Kollegen sind verletzt und der einzige Zugang zwischen dem oberen und unteren Teil des Bootes ist verschüttet. Du und zehn weitere Überlebende befindet euch im oberen Teil. Hier gibt es aber nicht genug Sauerstoff für euch alle, bis ihr die Wasseroberfläche erreicht. Ein einzelner Kollege liegt bewusstlos im unteren Teil. Hier gibt es noch genügend Sauerstoff.",
"act": "Wenn du einen Notfallschalter betätigst, wird eine Notfallklappe zwischen den beiden Teilen geöffnet und die Luft durchgelassen. Allerdings wird die Klappe auf den Kollegen fallen und ihn töten, aber es wird dich und die zehn Überlebenden retten.",
"q": "Betätigst du den Notfallschalter, welcher die Klappe auf den Kollegen fallen lassen wird, damit ihr, du und die zehn Überlebenden, genug Sauerstoff bekommt?"
},
  {
"n": 7,
"s": 4,
"p": 1,
"i": 1,
"text": "Du und zehn Taucher seid Teil eines Teams der Vereinten Nationen was Seeminen aus dem Zweiten Weltkrieg unschädlich macht. Ein Teammitglied wurde verletzt und das Blut hat mehrere Haie angelockt. Du hast ein Unterwassergewehr, aber nur eine Harpune und es sind viele Haie. Der blutende Taucher schwimmt auf den letzten Schutzkäfig zu und wird diesen vor dir und den anderen erreichen. Die Haie folgen der Blutspur und sind zu nah, als dass du und die anderen Taucher entkommen könntet.",
"act": "Wenn du auf den Taucher schießt wird es ihn töten und die Haie werden innehalten um ihn zu fressen, aber du und die zehn Taucher könnt euch retten.",
"q": "Lässt du die Haie den verletzten Taucher fressen, indem du auf ihn schießt, damit du und die anderen zehn Taucher den Schutzkäfig erreichen könnt?"
},
  {
"n": 8,
"s": 4,
"p": 0,
"i": 1,
"text": "Du und zehn Taucher seid Teil eines Teams der Vereinten Nationen was Seeminen des Zweiten Weltkriegs unschädlich macht. Ein Teammitglied wurde verletzt und das Blut hat mehrere Haie angelockt. Du hast ein Unterwassergewehr, aber nur eine Harpune und es sind viele Haie. Der blutende Taucher schwimmt auf den letzten Schutzkäfig zu und wird diesen vor dir und den anderen erreichen. Die Haie folgen der Blutspur und sind zu nah, als dass du und die anderen Taucher entkommen könntet.",
"act": "Wenn du per Fernbedienung eine der Minen detonieren lässt, wird es ihn töten und die Haie werden innehalten um ihn zu fressen, aber du und die zehn Taucher werdet euch retten können.",
"q": "Lässt du die Haie den verletzten Taucher fressen, indem du die Mine per Fernbedienung detonierst, damit du und die anderen zehn Taucher den Schutzkäfig erreichen könnt?"
},
  {
"n": 9,
"s": 5,
"p": 1,
"i": 1,
"text": "Du arbeitest in einem Waisenhaus in einem kriegsgebeutelten Land. Die Rebellen haben die Regierung übernommen und töten alle, die das Regime nicht unterstützen. Außerdem führen sie einen Völkermörd gegen eine bestimmte ethnische Gruppe durch. Du und die elf Waisen des Waisenhauses habt die Rebellion nicht unterstützt und darüber hinaus hast du ein Kind dieser ethnischen Gruppe in deinem Heim. Es gibt keine Möglichkeit, dass du und die Waisenkinder entkommen könnt und mit Sicherheit werden die Soldaten euch alle töten.",
"act": "Wenn du das Kind der verfolgten Volksgruppe mit einem Kissen erstickst, während es schläft, werden die Soldaten glauben, dass du ihr Regime unterstützt. Das wird das Kind töten, aber es wird dich und die restlichen zehn Kinder retten.",
"q": "Lässt du die Soldaten in dem Glauben, dass du ihr Regime unterstützt, indem du das genannte Kind erstickst, damit sie Dich und anderen zehn Kindern verschonen?"
},
  {
"n": 10,
"s": 5,
"p": 0,
"i": 1,
"text": "Du arbeitest in einem Waisenhaus in einem vom Krieg gebeutelten Land. Die Rebellen haben die Regierung übernommen und töten alle, die das Regime nicht unterstützen. Außerdem führen sie einen Völkermörd gegen eine bestimmte ethnische Gruppe durch. Du und die elf Waisen des Waisenhauses habt die Rebellion nicht unterstützt und darüber hinaus hast du ein Kind dieser ethnischen Gruppe in deinem Heim. Es gibt keine Möglichkeit, dass du und die Waisenkinder entkommen könnt und mit Sicherheit werden die Soldaten euch alle töten.",
"act": "Wenn du einer Krankenschwester befiehlst dem Kind der verfolgten Volksgruppe eine tödliche Überdosis von Schlaftabletten zu geben, werden die Soldaten glauben, dass du ihr Regime unterstützt. Das wird das Kind töten, aber es wird dich und die restlichen zehn Kinder retten.",
"q": "Lässt du die Soldaten in dem Glauben, dass du ihr Regime unterstützt, indem du der Krankenschwester befiehlst dem genannten Kind eine Überdosis zu geben, damit sie Dich und anderen zehn Kindern verschonen?"
},
  {
"n": 11,
"s": 6,
"p": 1,
"i": 1,
"text": "Du bist ein/e ehrenamtliche/r Mitarbeiter/in eines Gesundheitszentrums in einem afrikanischen Dorf. Ein Mann aus dem Nachbardorf hat sich mit dem Ebola-Virus infiziert. Die Krankheit ist extrem ansteckend, unheilbar und fast immer tödlich. Unerwarteter Weise hat er sie schon einen Monat überlebt. D.h., dass er wahrscheinlich immun gegen die tödlichen Auswirkungen des Virus ist. Dennoch glaubt er fälschlicherweise, dass dein Gesundheitszentrum ihn vollständig heilen könnte. Du siehst, wie er sich nähert und weißt, dass wenn er das Dorf betritt, er 119 Unschuldige anstecken wird , die im Gegensatz zu ihm sterben werden.",
"act": "Wenn du ihn mit der Pistole des Zentrums erschießt, wirst du verhindern, dass er dich und den Rest des Dorfes mit dem Virus ansteckt. Das wird ihn töten, aber es wird dich und die 119 Bewohner des Dorfes retten.",
"q": "Verhinderst du das der Mann das Dorf betritt, indem du ihn erschießt, damit er dich und die 119 Personen des Dorfes nicht ansteckt?"
},
  {
"n": 12,
"s": 6,
"p": 0,
"i": 1,
"text": "Du bist ein/e ehrenamtliche/r Mitarbeiter/in eines Gesundheitszentrums in einem afrikanischen Dorf. Ein Mann aus dem Nachbardorf hat sich mit dem Ebola-Virus infiziert. Die Krankheit ist extrem ansteckend, unheilbar und fast immer tödlich. Unerwarteter Weise hat er sie schon einen Monat überlebt, d.h. dass er wahrscheinlich immun gegen die tödlichen Auswirkungen des Virus ist. Dennoch glaubt er fälschlicherweise, dass dein Gesundheitszentrum ihn vollständig heilen könnte. Du siehst wie er sich nähert und weisst, dass wenn er das Dorf betritt, wird er 119 Unschuldige anstecken, die, im Gegensatz zu ihm, sterben werden.",
"act": "Wenn du den Gemeinderat informierst, wird dieser seine Erschießung veranlassen, um zu verhindern, dass er dich und den Rest des Dorfes mit dem Virus ansteckt. Das wird ihn töten, aber es wird dich und die 119 Bewohner des Dorfes retten.",
"q": "Verhinderst du, dass der Mann das Dorf betritt indem du den Gemeinderat informierst, damit seine Erschießung veranlasst wird, so dass er dich und die 119 Personen nicht anstecken kann?"
},
  {
"n": 13,
"s": 7,
"p": 1,
"i": 1,
"text": "Du bist ein/e Arzt/Ärztin allein in einem Rettungshubschrauber während einer verheerenden Flutkatastrophe. Du hast acht Schwerverletzte gerettet und erhältst sie am Leben. Plötzlich meldet der Pilot einen Motorschaden und befielt, dass der Hubschrauber von Ballast befreit werden muss, da er sonst abstürzen wird und ihr alle sterben werdet. Du kannst den Hubschrauber nicht verlassen, denn die Verwundeten brauchen deine Hilfe und die schweren medizinischen Gerätschaften sind festgeschraubt.",
"act": "Wenn du einen Verwundeten herausschubst, befreist du den Hubschrauber von ausreichend Ballast um ihn in der Luft zu halten. Dies wird den Verwundeten töten, aber es wird dich und die acht Personen an Bord retten.",
"q": "Befreist du den Hubschrauber von Ballast, indem du einen der Verwundeten herausschubst, um den Hubschrauber mit Dir und den acht Personen in der Luft zu halten?"
},
  {
"n": 14,
"s": 7,
"p": 0,
"i": 1,
"text": "Du bist ein/e Arzt/Ärztin allein in einem Rettungshubschrauber während einer verheerenden Flutkatastrophe. Du hast acht Schwerverletzte gerettet und erhältst sie am Leben. Plötzlich meldet der Pilot einen Motorschaden und befielt, dass der Hubschrauber von Ballast befreit werden muss, da er sonst abstürzen wird und ihr alle sterben werdet. Du kannst den Hubschrauber nicht verlassen, denn die Verwundeten brauchen deine Hilfe und die schweren medizinischen Gerätschaften sind festgeschraubt.",
"act": "Wenn du das Tau durchschneidest, mit dem die letzte gerettete Person hochgezogen wird, reduzierst du genügend Gewicht, um den Hubschrauber in der Luft zu halten. Dies wird den Verletzten töten, aber es wird dich und die acht Personen an Bord retten.",
"q": "Reduzierst du das Gewicht, indem du das Tau durchschneidest an dem die letzte Person hochgezogen wird, um den Hubschrauber mit Dir und den acht Personen in der Luft zu halten?"
},
  {
"n": 15,
"s": 8,
"p": 1,
"i": 0,
"text": "Du bist ein/e Ingenieur/in in der Internationalen Raumstation ISS. Plötzlich fängt der Laderaum Feuer. Das automatische Sicherheitssystem kann den Sauerstoff ablassen und so das Feuer löschen. Allerdings wird dafür die Außentür geöffnet und das funktioniert nur wenn die Innenluke geschlossen ist. Hinter der Luke befindet sich aber noch ein Mechaniker. Du siehst, dass ihm nicht die Zeit bleibt, um die schwere Ausrüstung auszuziehen und dass er steckenbleiben wird, wenn er versucht durch die Innenluke zu kommen. Das wird dazu führen, dass sich das Feuer ausbreitet und euch alle tötet.",
"act": "Wenn du den Mechaniker zurück in den Laderaum schubst, wird sich die Innenluke schließen lassen, das Notfallsystem aktiviert und das Feuer gelöscht. Dies wird den Mechaniker in den Weltraum schleudern und ihn töten, aber es wird dich und die verbleibenden zehn Astronauten retten.",
"q": "Löschst du das Feuer indem du die Innenluke von Hand schließt, was den Mechaniker in den Weltraum schleudert, damit das Feuer dich und die zehn Astronauten nicht erreicht?"
},
  {
"n": 16,
"s": 8,
"p": 0,
"i": 0,
"text": "Du bist ein/e Ingenieur/in in der Internationalen Raumstation ISS. Plötzlich fängt der Laderaum Feuer. Das automatische Sicherheitssystem kann den Sauerstoff ablassen und so das Feuer löschen. Allerdings wird dafür die Außentür geöffnet und das funktioniert nur wenn die Innenluke geschlossen ist. Hinter der Luke befindet sich aber noch ein Mechaniker. Du siehst, dass ihm nicht die Zeit bleibt, um die schwere Ausrüstung auszuziehen und dass er steckenbleiben wird, wenn er versucht durch die Innenluke zu kommen. Das wird dazu führen, dass sich das Feuer ausbreitet und euch alle tötet.",
"act": "Wenn du einen Schalter betätigst, bevor der Mechaniker die Innenluke erreicht, wird sich die Innenluke schließen, was das Notfallsystem aktiviert und das Feuer löscht. Dies wird den Mechaniker in den Weltraum schleudern und ihn töten, aber es wird dich und die verbleibenden zehn Astronauten retten.",
"q": "Löschst du das Feuer, indem du den Schalter betätigst, der die Innenluke schließt, was den Mechaniker in den Weltraum schleudern wird, damit das Feuer dich und die zehn Astronauten nicht erreicht?"
},
  {
"n": 17,
"s": 9,
"p": 1,
"i": 1,
"text": "Du bist ein/e Inspektor/in in einem Atomkraftwerk. Der Direktor und du besichtigt es gerade, als eine der Zuleitungen sich überhitzt. Das Not-Kühlsystem versagt und eine Kettenreaktion steht bevor, die zu einer Kernschmelze führen wird. Wenn dies passiert, wird die freigesetzte Strahlung tödlich für dich und die Bewohner der nahe gelegenen Stadt sein. Tausende Menschen werden sterben.",
"act": "Wenn du den Direktor von der Brücke schubst und er auf die Zuleitungen fällt, wird genügend Hitze freigesetzt, um die Kettenreaktion aufzuhalten. Dies wird ihn töten, aber es wird dich und die tausenden Einwohner der Stadt retten.",
"q": "Kühlst du die Leitungen, indem du den Direktor von der Brücke auf die Zuleitungen schubst, damit die für dich und tausende Menschen so gefährliche Kernschmelze verhindert wird?"
},
  {
"n": 18,
"s": 9,
"p": 0,
"i": 0,
"text": "Du bist ein/e Inspektor/in in einem Atomkraftwerk. Der Direktor und du besichtigt es gerade, als eine der Zuleitungen sich überhitzt. Das Not-Kühlsystem versagt und eine Kettenreaktion steht bevor, die zu einer Kernschmelze führen wird. Wenn dies passiert, wird die freigesetzte Strahlung tödlich für dich und die Bewohner der nahe gelegenen Stadt sein. Tausende Menschen werden sterben.",
"act": "Wenn du flüssigen Stickstoff manuell in die Zuleitungskammer einführst, wird genügend Hitze freigesetzt um die Kettenreaktion aufzuhalten. Dies wird allerdings einen Mitarbeiter töten, der in der Zuleitungskammer festsitzt, aber es wird dich und die tausenden Einwohner der Stadt retten.",
"q": "Setzt du die Hitze frei, indem du flüssigen Stickstoff in die Zuleitungskammer einführst, in der sich ein Mitarbeiter befindet, damit die für dich und tausende Menschen so gefährliche Kernschmelze verhindert wird?"
},
  {
"n": 19,
"s": 10,
"p": 1,
"i": 1,
"text": "Du bist ein/e Sprengstoff-Experte/in eines Unternehmens, das den Auftrag hat ein Hochhaus abzureissen. Du prüfst gerade die letzte Sprengladung, als du einen Jungen siehst, der im Begriff ist versehentlich eine der Sprengladungen zu detonieren. Die Explosion würde zu einem unkontrollierten Einsturz des Gebäudes führen und dich, den Jungen und eine Menge Zuschauer unter sich begraben. Der Junge befindet sich mehrere Stockwerke unter dir und kann dich nicht hören.",
"act": "Wenn du einen schweren Betonblock auf seinen Kopf fallen lässt, wird es ihn töten, aber es wird dich und die Menschenmenge, retten indem es die Explosion verhindert.",
"q": "Hälst du den Jungen auf, indem du den Block auf seinen Kopf fallen lässt, damit das Gebäude nicht über dir und der Zuschauermenge einstürzt?"
},
  {
"n": 20,
"s": 10,
"p": 0,
"i": 1,
"text": "Du bist ein/e Sprengstoff-Experte/in eines Unternehmens, das den Auftrag hat ein Hochhaus abzureissen. Du prüfst gerade die letzte Sprengladung, als du einen Jungen siehst, der im Begriff ist versehentlich eine der Sprengladungen zu detonieren. Die Explosion würde zu einem unkontrollierten Einsturz des Gebäudes führen und dich, den Jungen und eine Menge Zuschauer unter sich begraben. Der Junge befindet sich mehrere Stockwerke unter dir und kann dich nicht hören.",
"act": "Wenn du den Strom des Gebäudes wieder anstellst wird der Junge an dem Stromschlag sterben, da er gerade einen offenen Stromkreis berührt. Dies wird ihn töten, aber es wird dich und die Menschenmenge retten, indem es die Explosion verhindert.",
"q": "Hälst du den Jungen auf, indem du den Strom des Gebäudes wieder anstellst, damit das Gebäude nicht über dir und der Zuschauermenge einstürzt?"
},
  {
"n": 23,
"s": 12,
"p": 1,
"i": 0,
"text": "Du bist Busfahrer/in und fährst den Bus auf einem Kindergartenausflug auf dem Weg in den Zoo. Auf dem Weg stürzt ihr wegen eines Reifenversagens von einer Brücke in einen wilden Fluss. Du und drei Kinder befindet euch noch im sinkenden Fahrzeug. Die anderen sind schon vom Fluss mitgerissen worden. Du nimmst die beiden Kinder an deiner Seite und schwimmst mit ihnen zum Ausgang. Das dritte Kind klammert sich an deinem Bein fest. Du merkst, dass du nicht stark genug bist, um mit allen drei Kindern gegen die Strömung anzuschwimmen.",
"act": "Wenn du das Kind abschüttelst, das sich an deinem Bein festklammert, wirst du gegen die Strömung ankämpfen können, aber das Kind wird ertrinken. Das wird es töten, aber es wird dich und die anderen beiden Kinder retten.",
"q": "Kämpfst du gegen die Strömung an, indem du das Kind abschüttelst, was dazu führen wird dass es ertrinkt, damit du und die anderen beiden Kinder die Oberfläche erreichen könnt?"
},
  {
"n": 24,
"s": 12,
"p": 0,
"i": 0,
"text": "Du bist Busfahrer/in und fährst den Bus auf einem Kindergartenausflug auf dem Weg in den Zoo. Auf dem Weg stürzt ihr wegen eines Reifenversasgen von einer Brücke in einen wilden Fluss. Du und drei Kinder befindet euch noch im sinkenden Fahrzeug. Die anderen sind schon vom Fluss mitgerissen worden. Du nimmst die beiden Kinder an deiner Seite und schwimmst mit ihnen zum Ausgang, doch dieser ist durch einige zerstörte Sitze blockiert.",
"act": "Wenn du die Sitze entfernst, wirst du den Ausgang freimachen, aber du wirst den Gang blockieren und das dritte Kind wird dort eingesperrt ertrinken. Das wird es töten, aber es wird dich und die anderen beiden Kinder retten.",
"q": "Machst du den Ausgang frei, indem du die Sitze in den Gang schiebst, was dazu führt, dass das dritte Kind eingesperrt wird, damit du und die anderen beiden Kinder die Oberfläche erreichen könnt?"
},
  {
"n": 25,
"s": 13,
"p": 1,
"i": 1,
"text": "Du bist Arzt/Ärztin in einem Krankenhaus. Du hast fünf Patienten die sterben werden, wenn sie nicht sofort eine Organspende bekommen. Ein weiterer Patient wird gerade nach einem schweren Autounfall eingeliefert. Sein Zustand ist kritisch, aber wahrscheinlich kannst du ihn durch eine lange und komplizierte Operation retten.",
"act": "Wenn du während der Operation des Unfallopfers unauffällig seine Halsschlagader durchschneidest, verursachst du seinen Tod und wirst so die Organe für die anderen fünf Patienten zur Verfügung haben. Dies wird das Unfallopfer töten, aber es wird die anderen fünf Patienten retten.",
"q": "Beschafftst du dir die Organe, indem du die Halsschlagader des Unfallopfers durchtrennst, damit du sie bei den anderen fünf Patienten verwenden kannst?"
},
  {
"n": 26,
"s": 13,
"p": 0,
"i": 1,
"text": "Du bist Arzt/Ärztin in einem Krankenhaus. Du hast fünf Patienten die sterben werden wenn sie nicht sofort eine Organtransspende bekommen. Ein weiterer Patient wird gerade nach einem schweren Autounfall eingeliefert. Während der langen und komplizierten Operation siehst du wie eine Krankenschwester im Begriff ist eine falsche Injektion zu verabreichen, die in diesem Fall tödlich wäre.",
"act": "Wenn du die Krankenschwester die falsche Injektion verabreichen lässt wird das Unfallopfer sterben und du wirst die Organe für die anderen fünf Patiente zur Verfügung haben. Dies wird das Unfallopfer töten, aber es wird die anderen fünf Patienten retten.",
"q": "Beschafftst du dir die Organe, indem du die Krankenschwester dem Unfallopfer die falsche Injektion verabreichen lässt, damit du sie bei den anderen fünf Patienten verwenden kannst?"
},
  {
"n": 27,
"s": 14,
"p": 1,
"i": 0,
"text": "Du gehörst zu einem Hafenarbeiterteam, das Kranketten an Containern auf Frachtschiffen festmacht, um diese zu entladen. Du und die anderen befestigt gerade Ketten an einem Container und steigt auf diesen herauf, um sicherzustellen, dass er ordnungsgemäß entladen wird. Plötzlich geht das rote Licht an, welches anzeigt, dass die Ketten versagen werden. Du siehst, dass der Grund dafür zwei streitende Kollegen sind. Der Container schwingt gefährlich über den Köpfen von fünf Kollegen, die unten auf dem Deck stehen, hin und her.",
"act": "Wenn du die zwei Streitenden schubst und sie trennst, wirst du verhindern, dass der Container herunterfällt. Allerdings hat einer der zwei seinen Sicherheitsgurt nicht angelegt und wird herunterfallen. Das wird ihn töten, aber es wird die fünf Kollegen, die auf dem Deck stehen, retten.",
"q": "Stoppst du das Schwingen des Containers, indem du deine Kollegen schubst, was dazu führen wird, dass der ohne Sicherheitsgurt herunterfallen wird, damit der Container nicht auf die fünf Kollegen, die auf dem Deck stehen stürzt?"
},
  {
"n": 28,
"s": 14,
"p": 0,
"i": 0,
"text": "Du gehörst zu einem Hafenarbeiterteam, das Kranketten an Containern auf Frachtschiffen festmacht, um diese zu entladen. Du und die anderen befestigt gerade Ketten an einem Container und steigt auf diesen herauf, um sicherzustellen, dass er ordnungsgemäß entladen wird. Plötzlich geht das rote Licht an, welches anzeigt, dass die Ketten versagen werden. Wenn sie über dem Deck reißen, wird der Container auf fünf Kollegen stürzen, die dort arbeiten.",
"act": "Wenn du einen Notfallschalter betätigst, wird der Container zurück in den Laderaum fallen gelassen. Ihr werdet alle von euren Sicherheitsgurten aufgefangen werden, aber ein Kollege befindet sich noch im Laderaum. Der herabstürzende Container wird ihn töten, aber es wird die fünf Kollegen an Deck retten.",
"q": "Lässt du den Container zurück in den Laderaum fallen, indem du den Notfallschalter betätigst, was dazu führt, dass er auf den Kollegen stürzt, damit er nicht auf die fünf Kollegen an Deck stürzt?"
},
  {
"n": 29,
"s": 15,
"p": 1,
"i": 0,
"text": "Eine Epidemie hat sich auf dem ganzen Planeten ausgebreitet und schon tausende Menschen getötet. Du bist Forscher/in und hast zwei Substanzen im Labor entwickelt. Durch einen Fehler sind beide als Impfstoff etikettiert. Eine davon ist tatsächlich der Impfstoff der tausende Leben retten könnte, die andere ist eine tödliche Substanz.",
"act": "Wenn du deinen zwei Laborassistenten je eine dieser beiden Substanzen injizierst, wirst du den Impfstoff identifizieren können. Einer der beiden Assistenten wird sterben, aber du wirst mit dem Impfstoff tausende Leben retten können.",
"q": "Identifizierst du den Impfstoff, indem du die Substanzen deinen Assistenten injizierst, was dazu führen wird, dass einer der beiden vergiftet wird, damit tausende Menschen geimpft werden können?"
},
  {
"n": 30,
"s": 15,
"p": 0,
"i": 0,
"text": "Eine Epidemie hat sich auf dem ganzen Planeten ausgebreitet und schon tausende Menschen getötet. Du bist Forscher/in und hast zwei Substanzen im Labor entwickelt. Durch einen Fehler sind beide als Impfstoff etikettiert. Eine davon ist tatsächlich der Impfstoff der tausende Leben retten könnte, die andere ist eine tödliche Substanz.",
"act": "Wenn du einem Krankenpfleger jeweils eine dieser beiden Substanzen zwei Patienten injizieren lässt, wirst du den Impfstoff identifizieren können. Einer der beiden Patienten wird sterben, aber du wirst tausende Leben mit dem Impfstoff retten.",
"q": "Identifizierst du den Impfstoff indem du dem Krankenpfleger die Substanzen zwei Patienten injizieren lässt, was dazu führen wird, dass einer der beiden vergiftet wird, damit tausende Menschen geimpft werden können?"
},
  {
"n": 31,
"s": 16,
"p": 1,
"i": 1,
"text": "Eine Straßenbahn außer Kontrolle steuert mit hoher Geschwindigkeit auf fünf Arbeiter zu. Diese werden sterben, wenn die Bahn nicht aufgehalten wird. Du stehst an den Gleisen, bist aber zu weit weg, um sie zu warnen. Neben dir steht ein unbekannter, sehr fülliger Mann.",
"act": "Wenn du den Unbekannten auf die Gleise stößt, wird sein Körper die Straßenbahn zum entgleisen bringen und die fünf Arbeiter werden nicht überfahren. Dies wird den Unbekannten töten, aber du wirst die fünf Arbeiter retten.",
"q": "Lässt du die Straßenbahn entgleisen, indem du den Unbekannten auf die Gleise stößt, damit die Straßenbahn die fünf Arbeiter nicht überfährt?"
},
  {
"n": 32,
"s": 16,
"p": 0,
"i": 0,
"text": "Eine Straßenbahn außer Kontrolle steuert mit hoher Geschwindigkeit auf fünf Arbeiter zu. Diese werden sterben, wenn die Bahn nicht aufgehalten wird. Du stehst an den Gleisen, bist aber zu weit weg, um sie zu warnen Neben dir befindet sich ein Kontrollhebel der die Strassenbahn auf ein anderes Gleis umleiten kann. Hier befindet sich nur ein Arbeiter.",
"act": "Wenn du den Stellhebel betätigst, wird die Straßenbahn auf das Gleis auf dem ein Arbeiter steht, umgeleitet und wird die anderen fünf Arbeiter nicht überfahren. Das wird diesen einen Arbeiter töten, aber es wird die anderen Fünf retten.",
"q": "Lenkst du die Straßenbahn um, indem du den Stellhebel betätigst, was dazu führen wird dass ein Arbeiter überfahren wird, damit die Straßenbahn die fünf anderen Arbeiter nicht überfährt?"
},
  {
"n": 33,
"s": 17,
"p": 1,
"i": 1,
"text": "Du und ein Forschungskollege habt eine neue Energiequelle entdeckt, die billig, sauber und sicher ist. Sie könnte der Umweltverschmutzung und der Armut in der Welt ein Ende setzen. Allerdings will dein Kollege die Entdeckung verkaufen und du weißt, dass er plant heute mit potenziellen Käufern Kontakt aufzunehmen. Du weißt ebenfalls mit Sicherheit, dass diese die Energie als schreckliche Waffe einsetzen wollen, aber dein Kollege glaubt dir nicht.",
"act": "Wenn du deinen Kollegen mit einem gänigen Gift aus eurem Labor vergiftest, wirst du verhindern, dass die Entdeckung in falsche Hände gerät. Das Gift wird deinen Kollegen töten, aber du wirst Tausende Menschen retten.",
"q": "Verhinderst du den Verkauf der Entdeckung, indem du deinen Kollegen vergiftest, damit die Energiequelle nicht als Waffe gegen tausende Menschen eingesetzt werden kann?"
},
  {
"n": 34,
"s": 17,
"p": 0,
"i": 1,
"text": "Du und ein Forschungskollege habt eine neue Energiequelle entdeckt, die billig, sauber und sicher ist. Sie könnte der Umweltverschmutzung und der Armut in der Welt ein Ende setzen. Allerdings will dein Kollege die Entdeckung verkaufen und du weißt, dass er plant heute mit potenziellen Käufern Kontakt aufzunehmen. Du weißt ebenfalls mit Sicherheit, dass diese die Energie als schreckliche Waffe einsetzen wollen, aber dein Kollege glaubt dir nicht.",
"act": "Wenn du ein entflammbares Gas im Labor freisetzt, wird es eine Explosion geben, in dem Moment, wenn dein Kollege den Computer anmacht. Dies wird ihn töten, aber du wirst tausende Menschen retten.",
"q": "Lässt du den Computer deines Kollegen explodieren, indem du das entflammbare Gas freisetzt, um zu verhindern, dass die Entdeckung als Waffe gegen tausende Menschen eingesetzt wird?"
},
  {
"n": 35,
"s": 18,
"p": 1,
"i": 1,
"text": "Du bist ein/e erfahrene/r Motorradfahrer/in der/die an einem Motorradevent teilnimmt. Du fährst vor einer großen Gruppe anderer Motorradfahrer. Plötzlich siehst du, wie ein Fahrer weiter vorne die Kontrolle über sein Motorrad verliert. Während du beschleunigst, um ihm zur Hilfe zu eilen, merkst du, dass er jeden Moment stürzen wird. Dies wird eine Massenkarambolage auslösen und eine Gruppe von zehn Fahrern hinter dir töten.",
"act": "Wenn du den stürzenden Motorradfahrer von der Straße abdrängst wird er gegen die Bäume fahren, aber du wirst die Massenkarambolage verhindern. Bei eurer Geschwindigkeit wird ihn das töten, aber du wirst die Gruppe der zehn Fahrer hinter Dir retten.",
"q": "Verhinderst du die Massenkarambolage, indem du den Motorradfahrer von der Straße abkommen lässt, um zu vermeiden, dass die anderen zehn Fahrer stürzen?"
},
  {
"n": 36,
"s": 18,
"p": 0,
"i": 1,
"text": "Du bist ein/e erfahrene/r Motorradfahrer/in der/die an einem Motorradevent teilnimmt. Du fährst vor einer großen Gruppe anderer Motorradfahrer. Plötzlich siehst du, wie ein Fahrer weiter vorne die Kontrolle über sein Motorrad verliert und stürzt. Du selbst kannst ihn leicht umfahren, aber zehn Motorradfahrer hinter dir werden im Versuch ihm auszuweichen aufeinander auffahren, was in einer tödlichen Massenkarambolage enden wird.",
"act": "Wenn du dein Motorrad gegen das des stürzenden Motorradfahrers fahren lässt, während du geschickt in den Straßengraben springst, wirst dies die anderen rechtzeitig alarmieren. Dies wird den stürzenden Motorradfahrer töten, aber du wirst die anderen zehn Motorradfahrer retten.",
"q": "Machst du die anderen auf die Unfallgefahr aufmerksam, indem du dein Motorrad gegen das des stürzenden Motorradfahrers fahren lässt, damit die zehn Motorradfahrer hinter dir genug Zeit haben ihm auszuweichen?"
},
  {
"n": 37,
"s": 19,
"p": 1,
"i": 1,
"text": "Du bist der/die Anführer/in einer kleinen Gruppe von Soldaten. Ihr seid auf dem Rückweg von einer Mission in feindlichem Gebiet, als einer deiner Männer in eine Falle tritt, die sein Bein erfasst und es schwer verletzt. Du kannst ihn nicht befreien, ohne ihn zu töten, aber wenn du ihn zurücklässt werden die feindlichen Truppen ihn finden und foltern, bis er den Standort eines wichtigen Basecamps eurer Alliierten verrät. Danach werden eure Feinde dieses Lager angreifen und die 10 Soldaten der sich dort aufhaltenden Truppe töten. Der Soldat fleht dich an, ihn nicht zurückzulassen, aber die feindlichen Truppen nähern sich und es ist gefährlich für dich und deine Männer länger zu bleiben, da ihr keine Munition mehr habt.",
"act": "Wenn du den Soldaten in der Falle erstichst, verhinderst du, dass er gefoltert wird und die Information preisgibt, die zum Tod der Soldaten der alliierten Truppe führen wird. Dies wird ihn töten, aber du wirst zehn alliierete Truppenmitglieder retten.",
"q": "Verhinderst du, dass der Soldat in der Falle gefoltert wird, indem du ihn selbst erstichst, damit er nicht den Aufenthaltsort der zehn alliierten Truppenmitglieder preisgeben kann?"
},
  {
"n": 38,
"s": 19,
"p": 0,
"i": 1,
"text": "Du bist der/die Anführer/in einer kleinen Gruppe von Soldaten. Ihr seid auf dem Rückweg von einer Mission in feindlichem Gebiet, als einer deiner Männer in eine Falle tritt, die sein Bein erfasst und es schwer verletzt. Du kannst ihn nicht befreien, ohne ihn zu töten, aber wenn du ihn zurücklässt werden die feindlichen Truppen ihn finden und foltern, bis er den Standort eines wichtigen Basecamps eurer Alliierten verrät. Danach werden eure Feinde dieses Lager angreifen und die 10 Soldaten der sich dort aufhaltenden Truppe töten. Der Soldat fleht dich an, ihn nicht zurückzulassen, aber die feindlichen Truppen nähern sich und es ist gefährlich für dich und deine Männer länger zu bleiben, da ihr keine Munition mehr habt.",
"act": "Wenn du die Position des Soldaten in der Falle mit einer Leuchtrakete signalisierst, wird die Gegend bombardiert. So verhinderst du, dass er gefoltert wird und die Information preisgeben kann, die zum Tod der alliierten Truppe führt. Dies wird ihn töten, aber du wirst die zehn Truppenmitglieder retten.",
"q": "Verhinderst du, dass der Soldat in der Falle gefoltert wird, indem du die Gegend bombardieren lässt, damit er nicht den Aufenthaltsort der zehn alliierten Truppenmitglieder preisgeben kann?"
},
  {
"n": 39,
"s": 20,
"p": 1,
"i": 1,
"text": "Du bist der/die Nachtwächter/in in einem Krankenhaus. Ein chemisches Produkt ist in einem Zimmer mit sechs Patienten verschüttet worden. Es ist hochgiftig, denn es verdampft nach kurzer Zeit unter Sauerstoffeinfluss und ein giftiges Gas entsteht was alle Patienten in dem Zimmer töten wird. Man kann es nicht mit herkömlichen Handtüchern oder Lappen wegwischen. Allerdings absorbiert die menschliche Haut es sehr schnell.",
"act": "Wenn du einen der Patienten auf das Produkt legst, verhinderst du, dass das giftige Gas entsteht. Dieser Patient wird sterben, aber du wirst die anderen fünf Patienten in dem Zimmer retten.",
"q": "Verhinderst du die Entstehung des giftigen Gases, indem du einen Patienten auf das Produkt legst, damit die anderen fünf Patienten nicht vergiftet werden?"
},
  {
"n": 40,
"s": 20,
"p": 0,
"i": 0,
"text": "Du bist der/die Nachtwächter/in in einem Krankenhaus. Ein chemisches Produkt ist in einem Zimmer mit sechs Patienten verschüttet worden. Es ist hochgiftig, denn es verdampft nach kurzer Zeit unter Sauerstoffeinfluss und ein giftiges Gas entsteht was alle Patienten in dem Zimmer töten wird. Man kann es nicht mit herkömlichen Handtüchern oder Lappen wegwischen.",
"act": "Wenn du das Ventilationssystem aktivierst, wird das Gas aus dem Zimmer herausgesaugt. Allerdings wird es in einem Raum im oberen Stockwerk gepumpt, wo sich ein anderer Patient befindet, den du nicht schnell genug verlegen kannst. Das wird diesen Patient töten, aber du wirst die anderen fünf retten.",
"q": "Lässt du das Gas aus dem Zimmer absaugen, indem du das Ventilationssystem aktivierst, was dazu führt, dass es in das Zimmer des einzelnen Patient gepumpt wird, damit die anderen fünf Patienten nicht vergiftet werden?"
},
  {
"n": 41,
"s": 21,
"p": 1,
"i": 1,
"text": "Du befindest dich mit einem Reiseleiter in einem von zwei Ruderbooten auf einem See in Alaska. Im anderen Boot sind drei Kinder, aber dieses ist gerade gekentert und die Drei laufen nun Gefahr zu erfrieren. Du ruderst in ihre Richtung aber merkst, dass dein Boot nicht das Gewicht von dir, dem Reiseleiter und das der drei Kinder wird tragen können. Ihr rettet die Kinder, aber eines wiegt sehr viel und ihr werdet untergehen. Weder du noch der Reiseleiter könnt das Boot verlassen, denn du ruderst und der Reiseleiter reanimiert gerade eins der Kinder.",
"act": "Wenn du das schwerere Kind über Bord wirfst, werdet ihr nicht kentern und zwei der Kinder werden gerettet sein können. Das über Bord geworfene Kind wird sterben, aber du wirst die anderen beiden retten.",
"q": "Machst du das Boot leichter indem du das schwerere Kind über Bord wirfst, damit ihr mit den anderen beiden Kindern das Ufer erreichen könnt?"
},
  {
"n": 42,
"s": 21,
"p": 0,
"i": 0,
"text": "Du befindest dich mit einem Reiseleiter in einem von zwei Ruderbooten auf einem See in Alaska. Im anderen Boot sind drei Kinder, aber dieses ist gerade gekentert und die Drei laufen nun Gefahr zu erfrieren. Du ruderst in ihre Richtung aber merkst, dass dein Boot nicht das Gewicht von dir, dem Reiseleiter und das der drei Kinder wird tragen können. Ihr rettet die Kinder, aber eines wiegt sehr viel und ihr werdet untergehen. Weder du noch der Reiseleiter könnt das Boot verlassen, denn du ruderst und der Reiseleiter reanimiert gerade eins der Kinder.",
"act": "Wenn du zum Ufer ruderst und das dritte Kind im Wasser zurücklässt verhinderst du, dass ihr untergeht. Dies wird das zurückgelassene Kind töten, aber du wirst die anderen beiden retten.",
"q": "Verhinderst du, dass ihr untergeht, indem du das dritte Kind zurücklässt, was dazu führen wird dass es erfriert, damit ihr mit den anderen beiden Kindern das Ufer erreichen könnt?"
},
  {
"n": 43,
"s": 22,
"p": 1,
"i": 1,
"text": "Du bist Minenarbeiter im Untertagebau. Nach oben gelangt man nur über einen einfachen Seilaufzug, an dem mehrere Kabinen hängen. Jede Kabine hält das Gewicht von drei Personen. Ihr habt den Arbeitstag beendet und fahrt in den Kabinen nach oben. Während du wartest siehst du plötzlich, dass eins der Kabel an dem alle Kabinen festgemacht sind, gleich reißen wird. 13 Minenarbeiter befinden sich gerade in den verschiedenen Kabinen.",
"act": "Wenn du die letzte Kabine umstürzt, in der nur ein einziger Minenarbeiter fährt, reduzierst du ausreichend Gewicht damit das Kabel mit den Kabinen der zwölf anderen Minenarbeitern nicht reißt. Der Minenarbeiter in der umgestürzten Kabine stirbt, aber du wirst die anderen zwölf retten.",
"q": "Reduzierst du das Gewicht, indem du die Kabine des einzelnen Minenarbeiters umstürzt, damit die Kabinen der anderen zwölf Bergarbeiter nicht abstürzten?"
},
  {
"n": 44,
"s": 22,
"p": 0,
"i": 1,
"text": "Du bist Minenarbeiter im Untertagebau. Nach oben gelangt man nur über einen einfachen Seilaufzug, an dem mehrere Kabinen hängen. Jede Kabine hält das Gewicht von drei Personen. Ihr habt den Arbeitstag beendet und fahrt in den Kabinen nach oben. Während du wartest siehst du plötzlich, dass eins der Kabel an dem alle Kabinen festgemacht sind, gleich reißen wird. 10 Minenarbeiter befinden sich gerade in den verschiedenen Kabinen.",
"act": "Wenn du den Notfallknof betätigst stürzt die letzte Kabine vom Seilaufzug. In dieser Kabine befindet sich nur ein Minenarbeiter und du würdest so das Gewicht ausreichend reduzieren, um die Kabinen der anderen neun Minenarbeiter anzuhalten. Der eine Minenarbeiter wird bei dem Sturz getötet, aber du wirst die anderen neun retten.",
"q": "Reduzierst du das Gewicht, indem du den Knopf betätigst, der die Kabine mit dem einen Minenarbeiter umstürzt, damit die Kabinen der anderen neun Bergarbeiter anzuhalten?"
},
  {
"n": 45,
"s": 23,
"p": 1,
"i": 0,
"text": "Du bist ein/e Elektriker/in, der/die im Haus eines reichen Großindustriellen eine Stromleitung reparieren soll. Der Mann ist unheilbar an Krebs erkrankt und es wurde vor kurzem bekannt, dass nach seinem Tod sein ganzes Vermögen an ein lokales Kinderkrankenhaus gespendet wird. In diesem Krankenhaus befinden sich 109 Kinder, die mit diesem Geld gerettet werden könnten. Sie können aber nicht länger warten, da sie kurz vor dem Tode sind.",
"act": "Wenn du den Großindustriellen erstickst, indem du, während er schläft, seinen Mund und seine Nase mit deinen behandschuhten Händen zuhälst, wirst du die lebensnotwendige Spende beschleunigen. Dies wird den Großindustriellen töten, aber die Leben der 109 Kinder retten.",
"q": "Beschleunigst du die Spende, indem du diesen Mann erstickst, damit die Spende rechtzeitig bei den 109 kranken Kindern ankommt?"
},
  {
"n": 46,
"s": 23,
"p": 0,
"i": 1,
"text": "Du bist ein/e Elektriker/in, der/die im Haus eines reichen Großindustriellen eine Stromleitung reparieren soll. Der Mann ist unheilbar an Krebs erkrankt und es wurde vor kurzem bekannt, dass nach seinem Tod sein ganzes Vermögen an ein lokales Kinderkrankenhaus gespendet wird. In diesem Krankenhaus befinden sich 112 Kinder, die mit diesem Geld gerettet werden könnten. Sie können aber nicht länger warten, da sie kurz vor dem Tode sind.",
"act": "Wenn du die Stromkreise kurzschließt, anstatt das Problem zu beheben, wird das Beatmungsgerät des Mannes ausfallen und du wirst die Spende für die Kinder beschleunigen. Dies wird den Großindustriellen töten, aber du wirst die Leben der 112 Kinder retten.",
"q": "Beschleunigst du die Spende, indem du einen Kurzschluss verursachst, der das Beatmungsgerät des Großindustriellen ausfallen lässt, damit die Spende rechtzeitig bei den 112 kranken Kindern ankommt?"
},
  {
"n": 47,
"s": 24,
"p": 1,
"i": 1,
"text": "Du bist ein Militäroffizier im Krieg. Deine Soldaten haben einen wichtigen Spion aufgefunden, der verletzt und festgeklemmt in einem eingestürzten Gebäude liegt. Per Funk bist Du informiert worden, dass feindliche Soldaten einen Überraschungsangriff auf eine nahe gelegene Stadt planen. Du weißt aber nicht auf welche. Tausende Zivilisten werden getötet, wenn du und deine Soldaten sie nicht aufhalten. Der Spion weiß um welche Stadt es sich handelt. Du hast ihn verhört, aber er verrät es dir nicht. Er wird wegen seiner Verletzungen nicht mehr lange leben.",
"act": "Wenn du den Spion folterst, wird er preisgeben welche Stadt angegriffen werden soll. Die Folter wird ihn töten, aber du wirst tausende Zivilisten retten.",
"q": "Sorgst du dafür, dass der Spion die Information preisgibt, indem du ihn folterst, damit ihr den Angriff auf tausende Zivilisten aufhalten könnt?"
},
  {
"n": 48,
"s": 24,
"p": 0,
"i": 1,
"text": "Du bist ein Militäroffizier im Krieg. Deine Soldaten haben einen wichtigen Spion aufgefunden, der verletzt und festgeklemmt in einem eingestürzten Gebäude liegt. Per Funk bist Du informiert worden, dass feindliche Soldaten einen Überraschungsangriff auf eine nahe gelegene Stadt planen. Du weißt aber nicht auf welche. Tausende Zivilisten werden getötet, wenn du und deine Soldaten sie nicht aufhalten. Der Spion weiß um welche Stadt es sich handelt. Du hast ihn verhört, aber er verrät es dir nicht. Er wird wegen seiner Verletzungen nicht mehr lange leben. Ratten nagen an ihm und er leidet sehr.",
"act": "Wenn du die Ratten mit dieser Folter weitermachen lässt, wird der Spion preisgeben, welche Stadt angegriffen werden soll. Die Folter wird ihn töten, aber du wirst tausende Zivilisten retten.",
"q": "Sorgst du dafür, dass der Spion die Information preisgibt, indem du die Ratten weiter an ihm nagen lässt, damit ihr den Angriff auf tausende Zivilisten aufhalten könnt?"
}
];
