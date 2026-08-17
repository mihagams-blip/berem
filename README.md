# BEREM

Igra za učenje branja za 6-letnika (1. razred), narejena za telefon.

Trije načini:

| Način | Kaj dela otrok |
|---|---|
| 🖼️ **NAJDI SLIKO** | prebere napisano besedo in pokaže ustrezno sliko |
| 🔤 **MANJKA ČRKA** | dopolni manjkajočo črko v besedi |
| 🦖 **DINOZAVER** | prebere ime po zlogih (`TI · RA · NO · ZA · VER`) in izbere pravo žival med štirimi |
| 🦀 **RAČUNAM** | sešteva do 20, do 100 ali do 1000 — z rakci, vedri in ladjami |
| 🚗 **AVTOMOBILI** | prebere znamko po zlogih in izbere pravi logotip |
| 🧚 **JUNAKI** | pravljični in slovenski liki — Kekec, Pehta, Sneguljčica, Ostržek … |
| ⚡ **BOGOVI** | božanstva in mitološka bitja: grška, nordijska, slovanska |

Rakci imajo svojo rundo petih nalog in svoj zaključni pregled; ostali trije
načini štejejo do desetih zvezdic. Deset zvezdic da pokal. Tri težavnosti filtrirajo dolžino besed in — pri
dinozavrih — kako podobne so napačne izbire.

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
npm run check    # preveri zloge, slike in besede
npm run build
```

## Zgradba

```
src/content/   dinos.js (22 živali z zlogi in dejstvi) · words.js (besede)
src/modes/     trije načini igre
src/ui/        skupni gradniki
src/lib/       zvok, naključnost, slogi
public/        slike, posnetki, pisave
tools/         generator zvočnega paketa, preverjanje vsebine
```

## Zvok

Zvočni učinki so proceduralni (WebAudio, brez datotek). Govor so **posnetki**,
ne sinteza v brskalniku — na telefonu slovenskega glasu pogosto ni, jedro igre
pa je branje in ne sme utihniti.

```bash
bash tools/make-voice-pack.sh --dry-run
bash tools/make-voice-pack.sh          # 73 posnetkov: 22 imen + 51 zlogov
```

Števila (`num.0`–`num.100` in vse desetice do `num.1000`, skupaj 191 posnetkov)
generira ista skripta. Glas Tina slovenske številke prebere kot **besede**
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
