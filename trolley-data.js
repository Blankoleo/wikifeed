'use strict';
// Dilemma-Stapel für das Trolley-Spiel.
// Quelle: Christensen, J. F., Flexas, A., Calabrese, M., Gut, N. K. & Gomila, A. (2014):
// „Moral judgment reloaded: a moral dilemma validation study“. Frontiers in Psychology 5:607.
// doi:10.3389/fpsyg.2014.00607 – Lizenz CC BY. Deutsche Fassung der Autoren (Zusatzmaterial),
// hier in Situation / Handlung / Frage zerlegt; Titel und Symbole sind von WikiFeed ergänzt.
// s = Szenario, p = 1: eigenhändig (personal), 0: auf Distanz; i = 1: Tod als Mittel, 0: Tod als Nebenfolge.
const TROLLEY_STACK_TITLES_DE = {"1": ["🔥", "Das brennende Gebäude"], "2": ["👶", "Das schreiende Baby"], "3": ["🧊", "Das U-Boot unter dem Eisberg"], "4": ["🤿", "Die Minentaucher"], "5": ["🏚️", "Das Waisenhaus"], "6": ["🏥", "Das Gesundheitszentrum"], "7": ["🚁", "Der Rettungshubschrauber"], "8": ["🛰️", "Feuer auf der Raumstation"], "9": ["☢️", "Das Atomkraftwerk"], "10": ["🧨", "Die Sprengung"], "12": ["🚌", "Der Bus im Fluss"], "13": ["🫀", "Die Organspende"], "14": ["🏗️", "Der Hafenkran"], "15": ["🦠", "Die Epidemie"], "16": ["🚋", "Die Straßenbahn"], "17": ["⚡", "Die Energiequelle"], "18": ["🏍️", "Das Motorradrennen"], "19": ["🪖", "Der Soldatentrupp"], "20": ["☣️", "Gift im Krankenhaus"], "21": ["🚣", "Die Ruderboote"], "22": ["⛏️", "Der Minenaufzug"], "23": ["💡", "Der Großindustrielle"], "24": ["🕵️", "Der Spion"]};
const TROLLEY_STACK_DE = [
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

// English original by the same authors (supplementary material of the paper). Titles added by WikiFeed.
const TROLLEY_STACK_TITLES_EN = {"1": ["🔥", "The Burning Building"], "2": ["👶", "The Crying Baby"], "3": ["🧊", "The Submarine under the Iceberg"], "4": ["🤿", "The Mine Divers"], "5": ["🏚️", "The Orphanage"], "6": ["🏥", "The Health Centre"], "7": ["🚁", "The Rescue Helicopter"], "8": ["🛰️", "Fire on the Space Station"], "9": ["☢️", "The Nuclear Power Plant"], "10": ["🧨", "The Demolition"], "12": ["🚌", "The Bus in the River"], "13": ["🫀", "The Organ Transplant"], "14": ["🏗️", "The Harbour Crane"], "15": ["🦠", "The Epidemic"], "16": ["🚋", "The Runaway Trolley"], "17": ["⚡", "The Energy Source"], "18": ["🏍️", "The Motorbike Rally"], "19": ["🪖", "The Soldiers"], "20": ["☣️", "Poison in the Hospital"], "21": ["🚣", "The Rowing Boats"], "22": ["⛏️", "The Mine Lift"], "23": ["💡", "The Tycoon"], "24": ["🕵️", "The Spy"]};
const TROLLEY_STACK_EN = [
  {
"n": 1,
"s": 1,
"p": 1,
"i": 1,
"text": "You and five other people are trapped in a burning building. There is only one emergency exit through which all of you could escape, but it is blocked by burning debris. Another injured person is about to crawl through a hole at the bottom of the exit door. You and the five people behind you do not have time to do the same.",
"act": "If you use the injured person to break down the debris you will be able to escape. Doing this will certainly kill him, but it will save you and the five people behind you.",
"q": "Do you break down the blockage by using the injured person so you and the five other people can escape?"
},
  {
"n": 2,
"s": 1,
"p": 0,
"i": 0,
"text": "You and five other people are trapped in a burning building. There is only one emergency exit through which all of you could escape, but it is blocked by burning debris. Another injured person is about to crawl through a hole at the bottom of the exit door. You and the five people behind you do not have time to do the same.",
"act": "If you activate the emergency system it will eliminate oxygen from the hallway which will put out the fire. However, it will leave the injured person without air. This will kill him, but you and the five people behind you will be saved.",
"q": "Do you put out the fire by activating the emergency system, which will leave the injured without air, so you and the five other people can escape?"
},
  {
"n": 3,
"s": 2,
"p": 1,
"i": 0,
"text": "Enemy soldiers have taken over your village and will kill all civilians above the age of two. You and ten neighbors are hiding in two rooms of the cellar of a large house. You can hear the voices of soldiers who have come to search the house for valuables. Your baby begins to cry loudly. The crying will attract the attention of the soldiers, who will spare your baby’s life, but will kill you and the other refugees in both rooms.",
"act": "If you put your hand over its mouth the crying will be absorbed, but your baby will not be able to breathe. This will kill it, but it will save you and the other ten neighbors.",
"q": "Do you absorb the crying by putting your hand over your baby’s mouth, which will leave it without air, so the soldiers won’t find you and the ten neighbors?"
},
  {
"n": 4,
"s": 2,
"p": 0,
"i": 0,
"text": "Enemy soldiers have taken over your village and will kill all civilians above the age of two. You and ten neighbors are hiding in two rooms of the cellar of a large house. You can hear the voices of soldiers who have come to search the house for valuables. Your baby begins to cry loudly. The crying will attract the attention of the soldiers, who will spare your baby’s life, but will kill you and the other refugees in both rooms.",
"act": "If you activate a noisy boiler it will cushion the crying, but it will become uncomfortably hot. The heat will be mortal for your baby, but it will save you and the ten neighbors.",
"q": "Do you cushion the crying by activating the noisy boiler which will asphyxiate the baby, so they won’t find you and the ten neighbors?"
},
  {
"n": 5,
"s": 3,
"p": 1,
"i": 0,
"text": "You are a crewmember on a submarine traveling under a large iceberg. An explosion has damaged the ship, injured several crewmembers and collapsed the only access between the upper and lower decks of the ship. You and ten survivors are in the upper section, which does not have enough oxygen for all of you to survive until you reach the surface. One single crewmember is lying unconscious in the lower section, where there is enough oxygen.",
"act": "If you push the emergency access hatch between the upper and lower sections of the ship it will allow oxygen to flow into the upper section. However, the hatch will fall down on the crewmember in the lower section and kill him, but it will save you and the ten survivors.",
"q": "Do you let in the air by opening the hatch, which will fall on the crewmember below, so that you and the ten survivors get enough oxygen?"
},
  {
"n": 6,
"s": 3,
"p": 0,
"i": 0,
"text": "You are a crewmember on a submarine traveling under a large iceberg. An explosion has damaged the ship, injured several crewmembers and collapsed the only access between the upper and lower parts of the ship. You and ten survivors are in the upper section, which does not have enough oxygen for all of you to survive until you reach the surface. One single crewmember is lying unconscious in the lower section, where there is enough oxygen.",
"act": "If you push an emergency button a hatch between the upper and lower sections of the ship will be released and will allow the oxygen to flow into the upper section. However, the hatch will fall on the crewmember in the lower section and kill him, but it will save you and the ten survivors.",
"q": "Do you push the button, which will make the hatch fall down on the crewmember, so that you and the ten survivors get enough oxygen?"
},
  {
"n": 7,
"s": 4,
"p": 1,
"i": 1,
"text": "You and ten divers are part of an U.N. team who is deactivating anti-ship mines from World War II. One team member has hurt himself and the blood in the water has attracted several sharks. You have an underwater rifle but only one harpoon and there are many sharks. The bleeding diver is swimming towards the last protective cage and will reach it before you and the others. The sharks, following the blood, are coming too close for you and the other divers to escape.",
"act": "If you shoot at the injured diver this will kill him and the sharks will stop to eat him, but you and the ten divers will be saved.",
"q": "Do you let the sharks eat the injured diver by shooting at him, so you and the other ten divers can reach the protective cage?"
},
  {
"n": 8,
"s": 4,
"p": 0,
"i": 1,
"text": "You and ten divers are part of an U.N. team who is deactivating anti-ship mines from World War II. One team member has hurt himself and the blood in the water has attracted several sharks. You have an underwater rifle, but only one harpoon and there are many sharks. The bleeding diver is swimming towards the last protective cage and will reach it before you and the others. The sharks, following the blood, are coming too close for you and the other divers to escape.",
"act": "If you detonate one of the mines by mean of a remote control, it will kill the injured diver and the sharks will stop to eat him. Then, you and the ten divers will be saved.",
"q": "Do you let the sharks eat the injured diver by detonating the mine next to him with a remote control, so you and the other ten divers can reach the protective cage?"
},
  {
"n": 9,
"s": 5,
"p": 1,
"i": 1,
"text": "You work in an orphanage in a war swept country that hosts ten orphans. Rebel soldiers have taken over the government and are now killing everyone who does not support their regime. Moreover, they are conducting an ‘ethnic cleansing’ genocide campaign to kill everyone of a particular ethnic group. You and the eleven children of the orphanage did not support the rebellion and you also have one child of this ethnic group in your orphanage. There is no way for you and the other children to escape and the soldiers will certainly kill you all.",
"act": "If you smother the child of the pursued ethnic group to death with a pillow while he is sleeping, the soldiers will believe that you support their regime. This will kill the child, but it will save you and the remaining ten children.",
"q": "Do you make the soldiers believe you are supporting their regime by smothering that one child, so they will spare your and the other ten children’s life?"
},
  {
"n": 10,
"s": 5,
"p": 0,
"i": 1,
"text": "You work in an orphanage in a war swept country that hosts ten orphans. Rebel soldiers have taken over the government and are now killing everyone who does not support their regime. Moreover, they are conducting an ‘ethnic cleansing’ genocide campaign to kill everyone of a particular ethnic group. You and the eleven children of the orphanage did not support the rebellion and you also have one child of this ethnic group in your orphanage. There is no way for you and the other children to escape and the soldiers will certainly kill you all.",
"act": "If you order a nurse to give the child of the pursued ethnic group a lethal overdose of sleeping pills, the soldiers will believe that you support their regime. This will kill the child, but it will save you and the remaining ten children.",
"q": "Do you make the soldiers believe you are supporting their regime ordering the nurse to give that one child an overdose, so they will spare your and the other ten children’s life?"
},
  {
"n": 11,
"s": 6,
"p": 1,
"i": 1,
"text": "You are a Peace Corps health-worker who is volunteering in a rural African village. A man from a nearby village has been infected with the Ebola virus that is extremely contagious, incurable, and almost always deadly. Unexpectedly, this man is still alive which means he must be immune to the virus’ deadly consequences. However, he wrongly believes that your health center can cure his disease completely. You see him approaching and you know that if he enters the village he will pass the virus to 119 innocent people who, unlike him, will die.",
"act": "If you shoot him with the gun of the health center you will prevent him from spreading the virus to you and the rest of the village. This will kill him, but it will save you and the 119 inhabitants of the village.",
"q": "Do you prevent the man from entering the village by shooting him, so he won’t spread the virus to you and the 119 people of the village?"
},
  {
"n": 12,
"s": 6,
"p": 0,
"i": 1,
"text": "You are a Peace Corps health-worker who is volunteering in a rural African village. A man from a nearby village has been infected with the Ebola virus that is extremely contagious, incurable, and almost always deadly. Unexpectedly, this man is still alive, which means he must be immune to the virus’ deadly consequences. However, he wrongly believes that your health center can cure his disease completely. You see him approaching and you know that if he enters the village he will pass the virus to 119 innocent people who, unlike him, will die.",
"act": "If you warn the village council they will shoot him to prevent him from spreading the virus to you and the rest of the village. This will kill him, but it will save you and the 119 inhabitants of the village.",
"q": "Do you prevent the man from entering into the village by warning the village council so that they shoot him, so he won’t spread the virus to you and the 119 people of the village?"
},
  {
"n": 13,
"s": 7,
"p": 1,
"i": 1,
"text": "You are a doctor alone in a rescue helicopter during a devastating flood. You have rescued eight critically injured people and you are keeping them alive. Suddenly, the pilot notifies you of a problem in the engine and gives the order that the helicopter needs to release weight or it will crash and you will all die. You cannot abandon the helicopter because the wounded need your help and the heavy medical equipment is bolted down.",
"act": "If you throw off one of the injured people, you will release enough weight to keep the helicopter in the air. This will kill him, but it will save you and the eight people on board.",
"q": "Do you release weight by throwing one of the injured people off the helicopter, so you and the eight persons on board will be able to stay in the air?"
},
  {
"n": 14,
"s": 7,
"p": 0,
"i": 1,
"text": "You are a doctor alone in a rescue helicopter during a devastating flood. You have rescued eight critically injured people and you are keeping them alive. Suddenly, the pilot notifies you of a problem in the engine and gives the order that the helicopter needs to release weight or it will crash and you will all die. You cannot abandon the helicopter because the wounded need your help and the heavy medical equipment is bolted down.",
"act": "If you cut the cable by which the last rescued person is ascending, you will release enough weight to keep the helicopter in the air. This will kill him, but it will save you and the eight people on board.",
"q": "Do you release weight by cutting the cable by which the last person is ascending, in order to keep you and the eight people on board in the air?"
},
  {
"n": 15,
"s": 8,
"p": 1,
"i": 0,
"text": "You are an engineer on the international space station ISS. Suddenly, a fire breaks out in the cargo bay. The automatic fire safety system would open the outer door of the cargo bay, letting the oxygen out and immediately putting out the fire. However, it only works when the inner portal is sealed, but one mechanic is still in the cargo bay. You realize that he doesn’t have the time to take off the bulky space suit and that he’ll get stuck when trying to get through the inner portal, causing the fire to spread and to kill you all.",
"act": "If you push the mechanic back into the cargo bay, the portal will close activating the emergency system which will put out the fire. This will suck the mechanic into space and kill him, but it will save you and the other ten astronauts.",
"q": "Do you put out the fire by manually sealing the inner portal, which will suck the mechanic into space, so the fire won’t reach you and the ten astronauts?"
},
  {
"n": 16,
"s": 8,
"p": 0,
"i": 0,
"text": "You are an engineer on the international space station ISS. Suddenly, a fire breaks out in the cargo bay. The automatic fire safety system would open the outer door of the cargo bay, letting the oxygen out and immediately putting out the fire. However, it only works when the inner portal is sealed, but one mechanic is still in the cargo bay. You realize that he doesn’t have the time to take off the bulky space suit and that he’ll get stuck when trying to get through the inner portal, causing the fire to spread and to kill you all.",
"act": "If you push a button before the mechanic reaches the inner portal, the portal will close activating the emergency system which will put out the fire. This will suck the mechanic into space and kill him, but it will save you and the remaining ten astronauts.",
"q": "Do you put out the fire pushing the button which seals the inner portal, sucking the mechanic into space, so the fire won’t reach you and the ten astronauts?"
},
  {
"n": 17,
"s": 9,
"p": 1,
"i": 1,
"text": "You are an inspector of a nuclear power plant. The plant foreman and you are visiting the facility when one of the supply conduits overheats. The emergency coolant system fails to activate, and a chain reaction which will result in a nuclear meltdown is about to start. This will release lethal radiation into the nearby town, killing thousands of people.",
"act": "If you push the foreman onto the conduits it will release enough heat to prevent the nuclear chain reaction. This will kill him, but it will save you and the thousands of town inhabitants.",
"q": "Do you cool down the conduits by pushing the foreman down on them, so the nuclear chain reaction will be stopped in time for you and the thousands of people?"
},
  {
"n": 18,
"s": 9,
"p": 0,
"i": 0,
"text": "You are an inspector of a nuclear power plant. The plant foreman and you are visiting the facility when one of the supply conduits overheats. The emergency coolant system fails to activate, and a chain reaction which will result in a nuclear meltdown is about to start. This will release lethal radiation into the nearby town, killing thousands of people.",
"act": "If you insert liquid nitrogen manually into the supply chamber it will release enough heat to prevent the nuclear chain reaction. This will kill one employee, who is trapped in the supply chamber, but it will save you and the thousands of town inhabitants.",
"q": "Do you release the heat inserting liquid nitrogen into the supply chamber where the employee is trapped, so the nuclear chain reaction will be stopped in time for you and the thousands of people?"
},
  {
"n": 19,
"s": 10,
"p": 1,
"i": 1,
"text": "You are the explosives expert of a company that has been hired to demolish a skyscraper. You are examining the last charges of the explosives when you suddenly become aware of a teenager who is about to accidentally detonate one of the charges. The explosion will result in the building’s uncontrolled collapse over you, the teenager, and the crowd of spectators. The teenager stands several floors below you and cannot hear you.",
"act": "If you drop a heavy cinderblock on his head, this will kill him, but it will prevent the explosion and save you and the crowd.",
"q": "Do you stop the teenager by dropping the cinderblock on his head, so the building won’t collapse over you and the crowd of spectators?"
},
  {
"n": 20,
"s": 10,
"p": 0,
"i": 1,
"text": "You are the explosives expert of a company that has been hired to demolish a skyscraper. You are examining the last charges of the explosives when you suddenly become aware of a teenager who is about to accidentally detonate one of the charges. The explosion will result in the building’s uncontrolled collapse over you, the teenager, and the crowd of spectators. The teenager stands several floors below you and cannot hear you.",
"act": "If you reactivate the building’s electricity, the boy will get an electric shock because he is touching an open circuit. This will kill him, but it will save you and the crowd by preventing the explosion.",
"q": "Do you stop the teenager by reactivating the building’s electricity, so the building won’t collapse over you and the crowd of spectators?"
},
  {
"n": 23,
"s": 12,
"p": 1,
"i": 0,
"text": "You are the bus driver of a kindergarten trip to the zoo. On the way, faulty tires cause the bus to plunge off a bridge and into a roaring river. You and three of the children are still in the sinking bus. The rest has already been swept away by the river. You grab the two children next to you and begin to swim towards the exit. The third child latches onto your leg. You feel that you are not strong enough to fight against the current and swim with all three children.",
"act": "If you shake off the third child you will be able to fight against the current, but the child dropped behind will drown. This will kill him, but it will save you and the other two children.",
"q": "Do you fight against the current shaking off the child, which will make him to drown, so you and the other two children can reach the surface?"
},
  {
"n": 24,
"s": 12,
"p": 0,
"i": 0,
"text": "You are the bus driver of a kindergarten trip to the zoo. On the way, faulty tires cause the bus to plunge off a bridge and into a roaring river. You and three of the children are still in the sinking bus. The rest has already been swept away by the river. You grab the two children next to you and begin to swim towards the exit, but bulky seats are blocking it.",
"act": "If you pull the seats away you will free the exit, but you will block the corridor and the third child will be trapped, causing him to drown. This will kill him, but it will save you and the other two children.",
"q": "Do you free the exit putting the seats in the corridor, which will trap the third child, so you and the other two children can reach the surface?"
},
  {
"n": 25,
"s": 13,
"p": 1,
"i": 1,
"text": "You are a doctor. You have five patients who will all die if they don’t get an immediate organ transplant. Another patient is just being rushed to the hospital after a serious car accident. This person is critically injured, but you can probably save him by means of a long and complicated operation.",
"act": "If you secretly cut his carotid artery during surgery it will cause his death and you will have the organs for the other five patients. This will kill him, but save the other five patients.",
"q": "Do you obtain the organs cutting the carotid artery of the accident victim, so you can undertake the transplantations for the other five patients?"
},
  {
"n": 26,
"s": 13,
"p": 0,
"i": 1,
"text": "You are a doctor. You have five patients who will all die if they don’t get an immediate organ transplant. Another patient is just being rushed to the hospital after a serious car accident. This person is critically injured. During the long and complicated surgery you notice that a nurse is about to inject the wrong medication, which will be lethal in this case.",
"act": "If you let the nurse inject the wrong medication the accident victim will die and you will have the organs for the other five patients. This will kill this patient, but will save the other five patients.",
"q": "Do you obtain the organs letting the nurse inject the wrong medication, so you can undertake the transplantations for the other five patients?"
},
  {
"n": 27,
"s": 14,
"p": 1,
"i": 0,
"text": "You are part of a shipyard dock team that attaches crane cables to containers to unload the cargo ships. You and the others have just attached cables to a container and are now climbing on top of it to make sure it is unloaded properly. Suddenly the red warning light flashes indicating that the crane cable is about to fail. You see that the reason for this is a fight between two crewmembers. The container is swinging dangerously over five other crewmembers on the deck.",
"act": "If you push the two fighting crewmembers to separate them, you will avoid having the container fall down. However, one of the crewmembers is not wearing his safety harness and will fall off the container. This will kill him, but it will save the five crewmembers on the deck.",
"q": "Do you stop the swinging of the container by pushing your colleagues, which will cause the one without safety harness to fall down, so the container won’t collapse onto the five crewmembers on the deck?"
},
  {
"n": 28,
"s": 14,
"p": 0,
"i": 0,
"text": "You are part of a shipyard dock team that attaches crane cables to containers to unload the cargo ships. You and the others have just attached cables to a container and are now climbing on top of it to make sure it is unloaded properly. Suddenly the red warning light flashes indicating that a cable is about to fail. If it fails over the deck the container will collapse onto five crewmembers.",
"act": "If you push the emergency release button the container will be dropped back into the cargo bay. You and the others will be held suspended in mid air by your safety harnesses, but one crewmember is still working in the cargo bay. Dropping the container back there will kill him, but it will save the five crewmembers on the deck.",
"q": "Do you drop the container pushing the emergency button, which will cause the container to fall back into the cargo bay on the crewmember, so the container won’t collapse onto the five crewmembers on the deck?"
},
  {
"n": 29,
"s": 15,
"p": 1,
"i": 0,
"text": "A viral epidemic has spread across the globe killing thousands of people. You are a medical researcher and have developed two substances in your laboratory. Due to a mistake both are labeled as vaccine. One of them is indeed the vaccine, which could save thousands of lives. The other one is lethal.",
"act": "If you inject the substances to your two lab assistants without knowing which substance is which, you will be able to identify the vaccine. One of the assistants will die, but you will be able to save thousands of lives with your vaccine.",
"q": "Do you identify the vaccine injecting these two substances into your two lab assistants which will poison one of them, so thousands of people can be vaccinated?"
},
  {
"n": 30,
"s": 15,
"p": 0,
"i": 0,
"text": "A viral epidemic has spread across the globe killing thousands of people. You are a medical researcher and have developed two substances in your laboratory. Due to a mistake both are labeled as vaccine. One of them is indeed the vaccine, which could save thousands of lives. The other one is lethal.",
"act": "If you allow a nurse to inject the two substances to two patients, you will be able to identify the vaccine. One of the patients will die, but you will be able to save thousands of lives with the vaccine.",
"q": "Do you identify the vaccine allowing the nurse to inject the two substances to two patients which will poison one of them, so thousands of people can be vaccinated?"
},
  {
"n": 31,
"s": 16,
"p": 1,
"i": 1,
"text": "A runaway trolley is speeding down the tracks towards five workmen who will be killed if the trolley continues on its present course. You are standing next to the tracks, but you are too far away to warn them. Next to you there is a very large stranger.",
"act": "If you push the large stranger onto the tracks, the trolley will slide off the tracks and won’t continue its course towards the workmen. This will kill the stranger, but you will save the five workmen.",
"q": "Do you cause the trolley to derail pushing the stranger onto the tracks, so the trolley does not reach the five workmen?"
},
  {
"n": 32,
"s": 16,
"p": 0,
"i": 0,
"text": "A runaway trolley is speeding down the tracks towards five workmen who will be killed if the trolley continues on its present course. You are standing next to the tracks, but you are too far away to warn them. Next to you there is a control switch that can redirect the trolley onto a different track, where only one workman is working.",
"act": "If you flip the control switch it will divert the trolley onto the track with one workman and will not continue its course towards the five workmen. This will kill this workman, but it will save the other five.",
"q": "Do you divert the trolley by flipping the control switch, which will cause the trolley to run over one workman, so the trolley does not reach the five workmen?"
},
  {
"n": 33,
"s": 17,
"p": 1,
"i": 1,
"text": "You and a fellow researcher have discovered a powerful new energy source that is cheap, safe, and clean. It has the potential to put an end to pollution and poverty in the world However, your colleague wants to sell the discovery and you know that he is planning to contact the potential buyers today. You also know for sure that the latter will use the invention as a deadly weapon, but your colleague doesn’t believe you.",
"act": "If you poison your colleague with a common poison available in your lab, you will avoid having the discovery fall into the wrong hands. The poison will kill your colleague, but you will save thousands of people.",
"q": "Do you prevent the sale of the discovery by poisoning your colleague, so the source of energy can’t be used as a weapon against thousands of people?"
},
  {
"n": 34,
"s": 17,
"p": 0,
"i": 1,
"text": "You and a fellow researcher have discovered a powerful new energy source that is cheap, safe, and clean. It has the potential to put an end to pollution and poverty in the world However, your colleague wants to sell the discovery and you know that he is planning to contact the potential buyers by email today. You also know for sure that the latter will use the invention as a deadly weapon, but your colleague doesn’t believe you.",
"act": "If you release a flammable gas in the lab, it will cause an explosion when your colleague turns on his computer. This will kill him, but you will save thousands of people.",
"q": "Do you cause the computer of your colleague to explode releasing the flammable gas, in order to prevent the discovery being used as a weapon against thousands of people?"
},
  {
"n": 35,
"s": 18,
"p": 1,
"i": 1,
"text": "You are an expert motorcyclist participating in a Bike Week. As you are driving down the road in front of a large group of ten bikers, you suddenly notice that a biker up front is losing control over his machine. As you speed up to pull alongside him, you realize that he is going to crash any moment. This would result in a large pile-up and the group of ten bikers behind you will die.",
"act": "If you force this biker off the road he will crash into the trees, but you will prevent the pile-up. At your current speed this will kill him, but you will save the group of ten riders.",
"q": "Do you prevent the large pile-up by forcing this biker off the road, in order to impede that the group of ten bikers crash into him?"
},
  {
"n": 36,
"s": 18,
"p": 0,
"i": 1,
"text": "You are an expert motorcyclist participating in a Bike Week. As you are driving down the road in front of a large group of ten bikers, you suddenly notice that a biker up front is losing control over his machine and is falling. You can easily evade him yourself but the bikers behind you will crash into each other and die in the resulting pile-up.",
"act": "If you let your bike run into the falling biker while jumping into the roadside ditch yourself, you will warn the others in time. This will kill this biker, but you will save the other ten.",
"q": "Do you alert the others about the imminent accident by running your bike into the falling bikers’ machine, so the other ten riders will have enough time to drive around him?"
},
  {
"n": 37,
"s": 19,
"p": 1,
"i": 1,
"text": "You are the leader of a small group of soldiers. You are on your way back from a mission in enemy territory when one of your men steps in a trap that catches his leg, injuring him badly. You cannot free him without killing him, but if you leave him behind, enemy troops will torture him until he reveals the position of an important allied base camp. After that the soldiers will attack this camp and kill the 10 soldiers of the platoon there. The soldier begs you not to leave him behind, but the enemy troops are approaching and it is dangerous for you and your men to stay because you don’t have any more ammunition.",
"act": "If you stab the soldier yourself you will impede that he’ll be tortured and reveal the information which leads to the death of the allied platoon. This will kill him, but you will save the ten soldiers of the platoon.",
"q": "Do you impede that the trapped soldier will be tortured by stabbing him to death, so he can’t reveal the location of the ten allied troop members?"
},
  {
"n": 38,
"s": 19,
"p": 0,
"i": 1,
"text": "You are the leader of a small group of soldiers. You are on your way back from a mission in enemy territory when one of your men steps in a trap that catches his leg, injuring him badly. You cannot free him without killing him, but if you leave him behind, enemy troops will torture him until he reveals the position of an important allied base camp. After that the soldiers will attack this camp and kill the 10 soldiers of the platoon there. The soldier begs you not to leave him behind, but the enemy troops are approaching and it is dangerous for you and your men to stay because you don’t have more ammunition.",
"act": "If you signalize the position of the trapped soldier with an illumination rocket, the region will be bombed. Thus, you will avoid that the soldier is tortured and reveals the information which will lead to the death of the allied troop. This will kill him, but you will save the ten soldiers of the allied platoon.",
"q": "Do you impede that the trapped soldier is tortured by ordering the bombing of that region, so he can’t reveal the location of the ten allied troop members?"
},
  {
"n": 39,
"s": 20,
"p": 1,
"i": 1,
"text": "You are on the night watch in a hospital. A chemical product has been spilled in a room with six patients. This chemical is highly toxic because once exposed to oxygen it evaporates and transforms into a poisonous gas which will kill all the patients in the room. You cannot wipe it away with conventional towels or wiping clothes. However, human skin absorbs it swiftly.",
"act": "If you place one of the patients on the chemical you will prevent it from evaporating. This will kill this patient but you will save the other five patients in the room.",
"q": "Do you prevent the toxic evaporation placing one of the patients on the chemical, so the other five patients won’t be poisoned?"
},
  {
"n": 40,
"s": 20,
"p": 0,
"i": 0,
"text": "You are on the night watch in a hospital. A chemical product has been spilled in a room with five patients. This chemical is highly toxic because once exposed to oxygen it evaporates and transforms into a poisonous gas which will kill all the patients in the room. You cannot wipe it away with conventional towels or wiping clothes.",
"act": "If you activate the ventilation system the poisonous gas will be taken out of the room. However, it will be transferred into a room upstairs with one patient, whom you won’t be able to evacuate in time. This will kill this patient, but you will save the other five.",
"q": "Do you divert the gas out of the room by activating the ventilation system, causing it to be transferred to the room with one patient, so the other five patients won’t be poisoned?"
},
  {
"n": 41,
"s": 21,
"p": 1,
"i": 1,
"text": "You are on a rowboat with a tour guide on a lake in Alaska. Nearby, three children have fallen off their boat and are in danger of freezing to death. You rescue the children, but one of them is very heavy and you realize that if you keep him on board your boat will sink and all will die. Neither you nor the guide can leave the boat because you are rowing and the guide is giving CPR to one of the children.",
"act": "If you throw the heavy child off the boat you will be able to reach the shore. This will kill this child, but you will save the other two.",
"q": "Do you get rid of load by throwing that one child overboard, so you can reach the shore with the other two children?"
},
  {
"n": 42,
"s": 21,
"p": 0,
"i": 0,
"text": "You are on a rowboat with a tour guide on a lake in Alaska. Nearby, three children have fallen off their boat and are in danger of freezing to death. After you rescue two of the children, you realize that the weight of the third child would cause your boat to sink and all would die. Neither you nor the guide can leave the boat because you are rowing and the guide is giving CPR to one of the children.",
"act": "If you row to the shore leaving the third child behind in the water, you will prevent your boat from sinking. This will kill the child left behind, but you will save the other two.",
"q": "Do you prevent your boot from sinking by leaving the third child behind, which will cause him to die, so that you can reach the shore with the other two children?"
},
  {
"n": 43,
"s": 22,
"p": 1,
"i": 1,
"text": "You are a miner. The only way out of the mine is to ride up with a simple cable elevator with small cubicles. It is the end of your shift and everybody is riding up to the surface in the cubicles. While you are in the queue, you see that the cable supporting all the cubicles is about to snap. 10 miners are riding in the cubicles at this time.",
"act": "If you knock over the last cubicle, the miner inside will fall down. In this way, you will reduce the load enough for the cable to resist breaking, and bring the other 10 miners to the exit. This will kill the miner in the cubicle you knock over, but you will save the other 10.",
"q": "Do you reduce weight by knocking over the cubicle with only one miner, so that the other ten miners will reach the exit?"
},
  {
"n": 44,
"s": 22,
"p": 0,
"i": 1,
"text": "You are a miner. The only way out of the mine is to ride up with a simple cable elevator with small cubicles. It is the end of your turn and everybody is riding up to the surface in the cubicles. While you are in the queue, you see that the cable supporting all the cubicles is about to snap. 10 miners are riding the cubicles at this time.",
"act": "If you push an emergency switch the last cubicle will be detached from the cable. This will reduce enough weight to maintain the cubicles of the other 10 miners. This will kill the miner in the detached cubicle, but it will save the other ten.",
"q": "Do you reduce weight by pushing the emergency switch which detaches the last cubicle, so that the other ten miners can reach the exit?"
},
  {
"n": 45,
"s": 23,
"p": 1,
"i": 0,
"text": "You are an electrician hired to fix an electrical problem in the home of a very wealthy tycoon who is terminally ill of cancer. Recently, it has been announced that upon his death, his enormous fortune will be donated to the local children’s hospital. You know that there are 109 children at this hospital who could be saved with this money, but who cannot wait much longer before they die.",
"act": "If you suffocate the tycoon while he is sleeping by covering his nose and mouth with your gloved hands, this essential donation for the children will arrive in time. This will kill the tycoon, but you will save the lives of 109 children.",
"q": "Do you speed the donation by suffocating this man, so that the donation will get to the 109 ill children in time?"
},
  {
"n": 46,
"s": 23,
"p": 0,
"i": 1,
"text": "You are an electrician hired to fix an electrical problem in the home of a very wealthy tycoon who is terminally ill of cancer. Recently, it has been announced that upon his death, his enormous fortune will be donated to the local children’s hospital. You know that there are 112 children at this hospital who could be saved with this money, but who cannot wait much longer before they die.",
"act": "If you short-circuit the cables instead of fixing the problem, the tycoon’s life support equipment will fail and this essential donation for the children will arrive in time. This will kill the tycoon, but you will save the lives of 112 children.",
"q": "Do you anticipate the donation by causing the tycoon’s life support equipment to fail, so that the donation gets to the 112 ill children in time?"
},
  {
"n": 47,
"s": 24,
"p": 1,
"i": 1,
"text": "You are a military officer during a war. Your soldiers have found an important enemy spy trapped and injured in a collapsed building. Over the radio you have been informed that enemy soldiers are planning a surprise attack on a nearby town, but you don’t know which. They will kill thousands of civilians if you and your soldiers do not stop them. The spy knows which town will be attacked. You have questioned him but he doesn’t want to tell you. He won’t survive much longer due to his injuries.",
"act": "If you torture the spy, he will reveal the information about the town. The torture will kill him, but you will save thousands of civilians.",
"q": "Do you make the spy reveal the information by torturing him, so you can prevent the attack on thousands of civilians?"
},
  {
"n": 48,
"s": 24,
"p": 0,
"i": 1,
"text": "You are a military officer during a war. Your soldiers have found an important enemy spy trapped and injured in a collapsed building. Over the radio you have been informed that enemy soldiers are planning a surprise attack on a nearby town, but you don’t know which. They will kill thousands of civilians if you and your soldiers do not stop them. The spy knows which town will be attacked. You have questioned him but he doesn’t want to tell you. He won’t survive much longer due to his injuries. Rats have begun to chew his legs and he is suffering a lot.",
"act": "If you let the rats continue with this torture the spy will reveal the information about the town. The torture will kill him, but you will save thousands of civilians.",
"q": "Do you make the spy reveal the information by letting the rats continue to torture him, so that you can prevent the attack on the thousands of civilians?"
}
];

const TROLLEY_STACK_TITLES = LANG === 'en' ? TROLLEY_STACK_TITLES_EN : TROLLEY_STACK_TITLES_DE;
const TROLLEY_STACK = LANG === 'en' ? TROLLEY_STACK_EN : TROLLEY_STACK_DE;
