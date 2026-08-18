# BEREM

Igra za učenje branja za 6-letnika (1. razred), narejena za telefon.

Devet načinov:

| Način | Kaj dela otrok |
|---|---|
| 🖼️ **NAJDI SLIKO** | prebere napisano besedo in pokaže ustrezno sliko |
| 🔤 **MANJKA ČRKA** | dopolni manjkajočo črko v besedi |
| 🦖 **DINOZAVRI** | prebere ime po zlogih (`TI · RA · NO · ZA · VER`) in izbere pravo žival med štirimi |
| 🦀 **RAČUNAM** | sešteva in odšteva do 20, do 100 ali do 1000 — z rakci, vedri in ladjami |
| 🚗 **AVTOMOBILI** | prebere znamko po zlogih in izbere pravi logotip |
| 🧚 **JUNAKI** | pravljični in slovenski liki — Kekec, Pehta, Sneguljčica, Ostržek … |
| ⚡ **BOGOVI** | božanstva in mitološka bitja: grška, nordijska, slovanska |
| 🤖 **UKAZI** | sestavi zaporedje puščic, ki robota pripelje do cilja |
| 🔴🔵 **VZORCI** | najde pravilo v traku simbolov in dopolni prazno mesto |

Rakci imajo svojo rundo petih nalog in svoj zaključni pregled; ostali načini
štejejo do desetih zvezdic. Deset zvezdic da pokal. Tri težavnosti filtrirajo
dolžino besed, pri dinozavrih to, kako podobne so napačne izbire, pri računanju
obseg števil, pri ukazih velikost mreže in pri vzorcih dolžino enote.

## Zakaj vedra in ladje

Do 20 otrok šteje posamezne rakce. Nad tem štetje po ena ni več izvedljivo in
tudi ni cilj — cilj je mestna vrednost. Zato slika ostane, spremeni pa se, kaj
en predmet **pomeni**:

```
🦀 = 1        🪣 = 10 rakcev        ⛵ = 10 veder (100 rakcev)
```

Pri 250 otrok ne šteje dvesto petdeset stvari, ampak vidi dve ladji in pet
veder — in prav to je vsebina računanja do 1000. Na stopnji DO 1000 so
seštevanci večkratniki deset, sicer bi bilo predmetov preveč.

Napačna odgovora sta zato tudi vezana na stopnjo: do 20 se zmotiš za ena do
tri, do 100 tudi za deset, do 1000 za deset in sto. Napaka pri deseticah je
prava napaka, ki jo hočemo loviti.

## Zakaj odštevanje nikoli ne zahteva izposojanja

Odštevanje ni narisano kot dve skupini, ampak kot **ena**: prikaže se
zmanjševanec, zadnji predmeti pa so obledeli in prečrtani. Odštevanje je
odvzemanje in mora tako tudi izgledati — dve skupini bi risali primerjavo.

Ker gre stran vedno **cel** predmet, mora biti odštevanec po mestih manjši ali
enak zmanjševancu: `52 − 30` se da narisati (pet veder, tri prečrtaš), `52 − 8`
pa ne, ne da bi vedro razbil. To je izposojanje — svoja lekcija in ne ta. Zato
generator odštevanec sestavlja po mestih in v vsakem vzame kvečjemu toliko,
kolikor ga je tam na voljo. Pravilo se pokaže šele pri redkih žrebih, zato ga
`npm run check` preveri na 300 računih na stopnjo.

Način **OBOJE** znak izžreba za vsako nalogo posebej: otrok ga mora prebrati in
ne more le prešteti vsega po navadi.

## Zakaj robot

V načinu UKAZI robot naredi **točno to, kar piše v seznamu** — nič več, nič
manj. Otrok zloži puščice v trak pod mrežo, trak se bere od leve proti desni kot
poved, in ob zagonu se izvajana ploščica sveti. Gumb 🔊 trak prebere na glas,
zato otrok sliši poved, ki jo je sam napisal.

Ko se robot zaleti v skalo, se ustavi in **tista ploščica** dobi rdeč obroč.
Sporočilo ni »narobe si naredil«, ampak »robot je naredil, kar je pisalo«. Prav
zato robot in ne dinozaver: krivda gre na seznam, ne na otroka. Iskanje
napačnega koraka je razhroščevanje in je pri šestih letih dosegljivo.

Ukazi so štiri **absolutne** puščice. Obračanje glede na robota (»obrni levo«)
zahteva miselno rotacijo, ki je pri tej starosti pogosto še pretrda in bi merila
njo namesto zaporedja. Težje pomeni večjo mrežo, več skal in daljšo pot:

```
🟢 4×4, brez skal, 3–5 korakov   🟡 5×5, 3 skale, 5–8   🔴 6×6, 6 skal, 8–12
```

Plošče so **generirane, ne napisane** — napisanih dvajset stopenj se otrok nauči
na pamet. BFS naredi dvoje hkrati: jamči, da je plošča rešljiva, in pove, kako
dolga je najkrajša pot. Brez druge polovice ni zvezdice, ki bi kaj pomenila:
**zvezdica pade samo pri najkrajšem programu.** Če robot pride do cilja po
ovinkih, se runda šteje kot rešena, a brez zvezdice — »deluje« in »narejeno je
dobro« morata ostati ločena.

## Zakaj se vzorec tudi sliši

VZORCI so predalgebra: otrok ne išče odgovora, ampak **pravilo**, in ga potem
uporabi. Trak simbolov ima eno prazno mesto; kaj vanj sodi?

Vzorec ni izbran s seznama, ampak generiran. Enota se ponavlja v neskončno
zaporedje `p(i) = enota[i mod dolžina]`, iz njega izrežemo vidni del in eno mesto
skrijemo. Dolžina traku je naključna — če bi ga vedno odrezali na meji enote, bi
bil odgovor vedno prvi element enote in tega bi se otrok naučil prej kot vzorca.

Pred režo mora ostati vsaj ena cela enota. Iz tega sledi lastnost, ki jo igra
potrebuje: **pravilni simbol se v traku pojavi tudi drugje.** Sicer bi otrok
izbral »tistega, ki ga še ni«, in bi imel prav, ne da bi vzorec pogledal.
`npm run check` to preveri na 400 nalogah na stopnjo.

Vsak simbol ima **svoj ton** iz pentatonike, zato se vzorec ne le vidi, ampak
tudi sliši: `ABAB` je do-mi-do-mi. Kdor pravila ne vidi, ga lahko ujame po sluhu
— in to je hkrati dostopnost, ker sta 🔴 in 🟢 barvno slepemu otroku neločljiva,
njuna tona pa ne.

Namig se pokaže šele po **drugem** zgrešenem poskusu in ne pove odgovora: med
ploščicami se odprejo reže, ki trak razdelijo na enote ponavljanja. To je ravno
tisto, česar se otrok uči, zato je namig lekcija in ne bližnjica.

## Zakaj zlogi

Ime dinozavra je za začetnika predolgo, da bi ga prebral naenkrat. Zlog ga
razbije na obvladljive kose. Pomembno pa je, česa zlog **ne** počne: ne
nadomešča glaskovanja. Zlog je enota prikaza in urjenja, fonem ostaja mehanizem
branja (Sargiani, Ehri & Maluf 2022). Zato so zlogi vidni le pri dolgih imenih,
kratke besede pa ostanejo cele.

Delitev je zapisana ročno, po pravilu: **pri sklopu dveh ali več soglasnikov gre
v naslednji zlog samo zadnji soglasnik.** Otrok prebere `SES-TRA` laže kot
`SE-STRA`, ker mu drugi zapis naloži trisoglasniški nastop. Zato tudi
`DIP-LO-DOK` in `PA-RA-ZAV-RO-LOF`.

## Zagon

```bash
npm install
npm run dev      # http://localhost:8105
npm run check    # zlogi, slike, besede + računi, uganke, vzorci in govor
npm run build
```

## Zgradba

```
src/content/   dinos.js · words.js · cars.js · heroes.js · myth.js
src/modes/     devet načinov igre (PickByName poganja štiri od njih)
src/ui/        skupni gradniki
src/lib/       zvok, naključnost, slogi + čista logika, ki jo preveri `npm run
               check`: arith.js (računanje), maze.js (uganke), patterns.js (vzorci)
public/        slike, posnetki, pisave
tools/         generator zvočnega paketa, preverjanje vsebine
```

## Na namizje kot aplikacija

Na iPhonu: **Safari** → Deli → *Na začetni zaslon*. Odpre se brez naslovne
vrstice, pokončno, z lastno ikono. Na Androidu ponudi Chrome namestitev sam.

Na iOS je ključna `apple-touch-icon` 180×180 — brez nje iOS na namizje postavi
kar posnetek strani in izgleda kot zaznamek, ne kot igra. Manifest sam za ikono
na iOS ne zadošča, na Androidu pa je obratno, zato je v `index.html` oboje.
Ikone dela `python3 tools/make-icons.py` iz sistemskega emojija 📖 na istem
prelivu kot domači zaslon; Apple Color Emoji ima eno samo bitno različico, pri
velikosti 160, zato se vse ostale velikosti izpeljejo iz nje.

`public/sw.js` poskrbi, da igra teče **brez omrežja**. Namenoma nima
vnaprejšnjega seznama datotek: v prejšnjem projektu je bil ročno vzdrževan
seznam vir napak, ker manjkajoča datoteka odpove tiho. Shrani se tisto, kar je
otrok res odprl — po prvi igri je predpomnjeno vse potrebno, prvi obisk pa ne
povleče štirih megabajtov zvoka vnaprej. Ogrodje in seznam posnetkov gresta
najprej na omrežje, da nova objava pride do otroka; odgovori, ki niso v redu, se
ne shranijo.

`npm run check` preveri, da ikone obstajajo in da se njihove velikosti ujemajo z
zapisanimi — oboje odpove tiho, zato ju na oko ni mogoče ujeti.

## Zvok

Zvočni učinki so proceduralni (WebAudio, brez datotek) — tudi toni vzorcev, zato
je VZORCI edini način, ki govornega paketa ne potrebuje. Govor so **posnetki**,
ne sinteza v brskalniku — na telefonu slovenskega glasu pogosto ni, jedro igre
pa je branje in ne sme utihniti.

```bash
bash tools/make-voice-pack.sh --dry-run
bash tools/make-voice-pack.sh          # 401 posnetkov
```

Od tega 75 imen (dinozavri, znamke, junaki, bogovi) in 129 zlogov. Zlogi so
**deljeni med paketi** — `RA`, `TO`, `LO` se pojavijo povsod — zato jih skripta
zbere v množico in vsakega posname enkrat.

Števila (`num.0`–`num.100` in vse desetice do `num.1000`, skupaj 191 posnetkov)
generira ista skripta. Poleg njih še `op.plus` / `op.minus` — brez njiju »osem …
tri« zveni enako za plus in minus — in `cmd.gor` / `cmd.dol` / `cmd.levo` /
`cmd.desno` za branje traku v načinu UKAZI. Glas Tina slovenske številke prebere kot **besede**
(»34« → štiriintrideset), zato jih podamo kot števke; sestavljanje iz delov bi
zaradi slovenske inverzije (štiri-in-trideset) dalo napačen vrstni red.

Potrebuje macOS z glasom **Tina** (sl_SI). ffmpeg ni potreben — rez tišine in
izenačitev glasnosti opravi `tools/trim-audio.py`, zapis pa vgrajeni `afconvert`.

## Pravice na likih

Junaki so **samo iz javne lasti** — ljudske in klasične pravljice ter slovensko
izročilo. Marvel, DC in Disney niso vključeni: repozitorij je javen, in tudi
generirana slika zaščitenega lika bi bila kršitev. Pri klasikah, ki jih je
Disney upodobil (Sneguljčica, Pepelka, Ostržek), so slike narejene po **ljudski
predlogi**, ne po filmski upodobitvi.

Logotipi avtomobilov so blagovne znamke svojih lastnikov, uporabljeni v
nekomercialni otroški igri za prepoznavanje. Vir je Wikimedia Commons.

Slike, ki niso v javni lasti, so navedene v [public/img/CREDITS.md](public/img/CREDITS.md).

## Sredstva

Slike dinozavrov in podatki (dolžina, teža, prehrana, obdobje) so iz projekta
Dino Akademija, kjer so bili preverjeni ob paleontoloških virih. Ilustracije so
generirane z ChatGPT.

Pisava **Fredoka** je pod SIL Open Font License 1.1 — glej
[public/fonts/LICENSE.md](public/fonts/LICENSE.md) in
[public/fonts/OFL.txt](public/fonts/OFL.txt). Ob vsaki objavi morata ostati
priloženi.
