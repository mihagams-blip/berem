# BEREM

Igra za učenje branja za 6-letnika (1. razred), narejena za telefon.

Trije načini:

| Način | Kaj dela otrok |
|---|---|
| 🖼️ **NAJDI SLIKO** | prebere napisano besedo in pokaže ustrezno sliko |
| 🔤 **MANJKA ČRKA** | dopolni manjkajočo črko v besedi |
| 🦖 **DINOZAVER** | prebere ime po zlogih (`TI · RA · NO · ZA · VER`) in izbere pravo žival med štirimi |
| 🦀 **RAČUNAM** | prešteje rakce in sešteje dve ali tri številke do 20 |

Rakci imajo svojo rundo petih nalog in svoj zaključni pregled; ostali trije
načini štejejo do desetih zvezdic. Deset zvezdic da pokal. Tri težavnosti filtrirajo dolžino besed in — pri
dinozavrih — kako podobne so napačne izbire.

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

Posnetki števil (`num.0`–`num.20`) so preneseni iz Dino Akademije — isti glas,
zato se z zlogi ujemajo. Uporabi jih način RAČUNAM: tap na račun ga prebere.

Potrebuje macOS z glasom **Tina** (sl_SI). ffmpeg ni potreben — rez tišine in
izenačitev glasnosti opravi `tools/trim-audio.py`, zapis pa vgrajeni `afconvert`.

## Sredstva

Slike dinozavrov in podatki (dolžina, teža, prehrana, obdobje) so iz projekta
Dino Akademija, kjer so bili preverjeni ob paleontoloških virih. Ilustracije so
generirane z ChatGPT.

Pisava **Fredoka** je pod SIL Open Font License 1.1 — glej
[public/fonts/LICENSE.md](public/fonts/LICENSE.md) in
[public/fonts/OFL.txt](public/fonts/OFL.txt). Ob vsaki objavi morata ostati
priloženi.
