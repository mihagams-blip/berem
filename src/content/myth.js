/**
 * 18 božanstev in mitoloških bitij — grških, nordijskih in slovanskih.
 *
 * Vse iz mitologije, torej v javni lasti. Opisi so mitološki, ne po sodobnih
 * stripovskih ali filmskih upodobitvah (TOR je nordijski bog groma, ne Marvelov
 * lik) — enako naj velja za naročene slike.
 *
 * Vsa imena so ENOBESEDNA — POVODNI MOŽ je izpuščen, ker bi zahteval presledek
 * kot svoj element in je za šestletnika predolg.
 *
 * `syl` je ROČNO zapisana delitev na zloge, ne izračunana. Pravila (enaka kot v
 * dinos.js in words.js): jedro zloga je samoglasnik ali zložni R, pri sklopu
 * 2+ soglasnikov gre v naslednji zlog SAMO ZADNJI soglasnik (KEN-TA-VER,
 * PO-ZEJ-DON), digrafi LJ, NJ, DŽ se nikoli ne razbijejo.
 *
 * `group` je skupina za izbiro napačnih odgovorov: na težki stopnji izbiramo
 * znotraj iste skupine, da o odgovoru odloči BRANJE in ne oblika bitja.
 */

export const MYTH = [
  // --- grška ---
  {
    id: 'zevs',
    name: 'ZEVS',
    syl: ['ZEVS'],
    group: 'grska',
    img: 'img/myth/zevs.webp',
    fact: 'Vrhovni grški bog neba, ki meče strele.'
  },
  {
    id: 'pozejdon',
    name: 'POZEJDON',
    syl: ['PO', 'ZEJ', 'DON'],
    group: 'grska',
    img: 'img/myth/pozejdon.webp',
    fact: 'Grški bog morja, ki s trizobom razburka valove.'
  },
  {
    id: 'meduza',
    name: 'MEDUZA',
    syl: ['ME', 'DU', 'ZA'],
    group: 'grska',
    img: 'img/myth/meduza.webp',
    fact: 'Pošast s kačami namesto las, njen pogled okameni ljudi.'
  },
  {
    id: 'hidra',
    name: 'HIDRA',
    syl: ['HID', 'RA'],
    group: 'grska',
    img: 'img/myth/hidra.webp',
    fact: 'Večglava kača, namesto odsekane glave ji zrasteta dve novi.'
  },
  {
    id: 'minotaver',
    name: 'MINOTAVER',
    syl: ['MI', 'NO', 'TA', 'VER'],
    group: 'grska',
    img: 'img/myth/minotaver.webp',
    fact: 'Bitje z bikovo glavo, ki živi v labirintu na Kreti.'
  },
  {
    id: 'kentaver',
    name: 'KENTAVER',
    syl: ['KEN', 'TA', 'VER'],
    group: 'grska',
    img: 'img/myth/kentaver.webp',
    fact: 'Napol človek, napol konj, odličen lokostrelec iz grških zgodb.'
  },
  {
    id: 'pegaz',
    name: 'PEGAZ',
    syl: ['PE', 'GAZ'],
    group: 'grska',
    img: 'img/myth/pegaz.webp',
    fact: 'Beli krilati konj, ki leti po nebu.'
  },
  {
    id: 'kiklop',
    name: 'KIKLOP',
    syl: ['KIK', 'LOP'],
    group: 'grska',
    img: 'img/myth/kiklop.webp',
    fact: 'Velikan z enim samim očesom sredi čela.'
  },

  // --- nordijska ---
  {
    id: 'odin',
    name: 'ODIN',
    syl: ['O', 'DIN'],
    group: 'nordijska',
    img: 'img/myth/odin.webp',
    fact: 'Vrhovni nordijski bog z enim očesom in dvema vranoma.'
  },
  {
    id: 'tor',
    name: 'TOR',
    syl: ['TOR'],
    group: 'nordijska',
    img: 'img/myth/tor.webp',
    fact: 'Nordijski bog groma s čarobnim kladivom Mjolnir.'
  },
  {
    id: 'loki',
    name: 'LOKI',
    syl: ['LO', 'KI'],
    group: 'nordijska',
    img: 'img/myth/loki.webp',
    fact: 'Zvit nordijski bog, ki se rad spreminja in nagaja.'
  },
  {
    id: 'valkira',
    name: 'VALKIRA',
    syl: ['VAL', 'KI', 'RA'],
    group: 'nordijska',
    img: 'img/myth/valkira.webp',
    fact: 'Krilata bojevnica, ki padle junake odnese v Valhalo.'
  },
  {
    id: 'trol',
    name: 'TROL',
    syl: ['TROL'],
    group: 'nordijska',
    img: 'img/myth/trol.webp',
    fact: 'Kosmat velikan iz severnih gozdov, sonce ga spremeni v kamen.'
  },

  // --- slovanska ---
  {
    id: 'perun',
    name: 'PERUN',
    syl: ['PE', 'RUN'],
    group: 'slovanska',
    img: 'img/myth/perun.webp',
    fact: 'Slovanski bog groma, ki vihti sekiro in strele.'
  },
  {
    id: 'veles',
    name: 'VELES',
    syl: ['VE', 'LES'],
    group: 'slovanska',
    img: 'img/myth/veles.webp',
    fact: 'Slovanski bog živine in podzemlja, Perunov večni nasprotnik.'
  },
  {
    id: 'vila',
    name: 'VILA',
    syl: ['VI', 'LA'],
    group: 'slovanska',
    img: 'img/myth/vila.webp',
    fact: 'Gorska bela žena iz slovenskih pripovedk, ki pomaga pastirjem.'
  },
  {
    id: 'skrat',
    name: 'ŠKRAT',
    syl: ['ŠKRAT'],
    group: 'slovanska',
    img: 'img/myth/skrat.webp',
    fact: 'Majhen bradat duh, ki živi v hiši ali rudniku.'
  },
  {
    id: 'morana',
    name: 'MORANA',
    syl: ['MO', 'RA', 'NA'],
    group: 'slovanska',
    img: 'img/myth/morana.webp',
    fact: 'Slovanska boginja zime in smrti, ki jo spomladi zažgejo.'
  }
];

export const MYTH_BY_ID = new Map(MYTH.map((m) => [m.id, m]));

/** Vsi unikatni zlogi — potrebuje jih generator zvočnega paketa. */
export const MYTH_SYLLABLES = [...new Set(MYTH.flatMap((m) => m.syl))].sort();
