/**
 * 18 avtomobilskih znamk, ki jih otrok v Sloveniji vidi na cesti.
 *
 * `syl` je ROČNO zapisana delitev na zloge, po istem pravilu kot pri dinozavrih:
 * jedro zloga je samoglasnik (a e i o u) ali zložni r, pri sklopu 2+ soglasnikov
 * gre v naslednji zlog SAMO ZADNJI soglasnik (SES-TRA, ne SE-STRA), digrafi
 * lj/nj/dž pa ostanejo skupaj. Zato VOLKS-WA-GEN, NIS-SAN in MAZ-DA.
 *
 * ZAVESTNA ODLOČITEV: tuja imena, ki se ne berejo fonetično (RENAULT, PEUGEOT,
 * CITROEN, AUDI, HYUNDAI), zlogujemo TAKO, KOT SE PIŠEJO, ne kot se izgovorijo —
 * otrok bere zapisano besedo, ne slišane glasove. Zato RE-NAULT (in ne re-no),
 * PEU-GEOT, CIT-RO-EN, AU-DI, HYUN-DAI. Tuji dvoglasniki (AU, EU, AI, EO) štejejo
 * kot eno jedro, sicer bi otrok dobil neizgovorljive enočrkovne zloge.
 * Kratici BMW in FORD nimata delitve: BMW je kratica, FORD ima en sam samoglasnik.
 *
 * `group` je skupina po OBLIKI LOGOTIPA (ne po državi) in služi izbiri treh
 * napačnih odgovorov: na težki stopnji izbiramo znotraj iste skupine, da o
 * odgovoru odloči BRANJE in ne oblika znaka.
 *   krog — znak je krog ali sestavljen iz krogov
 *   oval — znak je ležeči oval / elipsa
 *   kot  — znak je oglat: romb, kvadrat, puščice
 *   crke — znak so same črke (napis)
 *
 * Logotipi so z Wikimedia Commons, obrezani na sam znak (brez napisov okoli),
 * 400×400 WebP s prosojnim ozadjem.
 */

export const CARS = [
  {
    id: 'skoda',
    name: 'ŠKODA',
    syl: ['ŠKO', 'DA'],
    group: 'krog',
    img: 'img/cars/skoda.webp',
    fact: 'Češka znamka. Njen znak je zelena puščica s krili.'
  },
  {
    id: 'renault',
    name: 'RENAULT',
    syl: ['RE', 'NAULT'],
    group: 'kot',
    img: 'img/cars/renault.webp',
    fact: 'Francoska znamka. Njen znak je romb, podoben diamantu.'
  },
  {
    id: 'volkswagen',
    name: 'VOLKSWAGEN',
    syl: ['VOLKS', 'WA', 'GEN'],
    group: 'krog',
    img: 'img/cars/volkswagen.webp',
    fact: 'Nemška znamka. Ime v nemščini pomeni ljudski avto.'
  },
  {
    id: 'bmw',
    name: 'BMW',
    syl: ['BMW'],
    group: 'krog',
    img: 'img/cars/bmw.webp',
    fact: 'Nemška znamka. Modro-beli krog so barve dežele Bavarske.'
  },
  {
    id: 'mercedes',
    name: 'MERCEDES',
    syl: ['MER', 'CE', 'DES'],
    group: 'krog',
    img: 'img/cars/mercedes.webp',
    fact: 'Nemška znamka. Njena zvezda ima tri krake.'
  },
  {
    id: 'audi',
    name: 'AUDI',
    syl: ['AU', 'DI'],
    group: 'krog',
    img: 'img/cars/audi.webp',
    fact: 'Nemška znamka. Štirje krogi so štiri stare tovarne.'
  },
  {
    id: 'opel',
    name: 'OPEL',
    syl: ['O', 'PEL'],
    group: 'krog',
    img: 'img/cars/opel.webp',
    fact: 'Nemška znamka. V krogu ima strelo.'
  },
  {
    id: 'ford',
    name: 'FORD',
    syl: ['FORD'],
    group: 'oval',
    img: 'img/cars/ford.webp',
    fact: 'Ameriška znamka. Prva je delala avtomobile po tekočem traku.'
  },
  {
    id: 'fiat',
    name: 'FIAT',
    syl: ['FI', 'AT'],
    group: 'crke',
    img: 'img/cars/fiat.webp',
    fact: 'Italijanska znamka. Najbolj znan je majhen Fiat petsto.'
  },
  {
    id: 'toyota',
    name: 'TOYOTA',
    syl: ['TO', 'YO', 'TA'],
    group: 'oval',
    img: 'img/cars/toyota.webp',
    fact: 'Japonska znamka. Na svetu proda največ avtomobilov.'
  },
  {
    id: 'peugeot',
    name: 'PEUGEOT',
    syl: ['PEU', 'GEOT'],
    group: 'kot',
    img: 'img/cars/peugeot.webp',
    fact: 'Francoska znamka. V znaku ima leva na zadnjih nogah.'
  },
  {
    id: 'citroen',
    name: 'CITROEN',
    syl: ['CIT', 'RO', 'EN'],
    group: 'kot',
    img: 'img/cars/citroen.webp',
    fact: 'Francoska znamka. Njen znak sta dve puščici navzgor.'
  },
  {
    id: 'hyundai',
    name: 'HYUNDAI',
    syl: ['HYUN', 'DAI'],
    group: 'oval',
    img: 'img/cars/hyundai.webp',
    fact: 'Korejska znamka. V ovalu ima poševno črko H.'
  },
  {
    id: 'kia',
    name: 'KIA',
    syl: ['KI', 'A'],
    group: 'crke',
    img: 'img/cars/kia.webp',
    fact: 'Korejska znamka. Ima najkrajše ime med vsemi avtomobili.'
  },
  {
    id: 'nissan',
    name: 'NISSAN',
    syl: ['NIS', 'SAN'],
    group: 'oval',
    img: 'img/cars/nissan.webp',
    fact: 'Japonska znamka. Ime je zapisano sredi kroga.'
  },
  {
    id: 'volvo',
    name: 'VOLVO',
    syl: ['VOL', 'VO'],
    group: 'krog',
    img: 'img/cars/volvo.webp',
    fact: 'Švedska znamka. Njen znak je krog s puščico.'
  },
  {
    id: 'tesla',
    name: 'TESLA',
    syl: ['TES', 'LA'],
    group: 'crke',
    img: 'img/cars/tesla.webp',
    fact: 'Ameriška znamka. Vozi na elektriko, ne na bencin.'
  },
  {
    id: 'mazda',
    name: 'MAZDA',
    syl: ['MAZ', 'DA'],
    group: 'oval',
    img: 'img/cars/mazda.webp',
    fact: 'Japonska znamka. Njen znak je črka M s krili.'
  }
];

export const CAR_BY_ID = new Map(CARS.map((c) => [c.id, c]));

/** Vsi unikatni zlogi — potrebuje jih generator zvočnega paketa. */
export const CAR_SYLLABLES = [...new Set(CARS.flatMap((c) => c.syl))].sort();
