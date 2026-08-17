/**
 * 17 pravljičnih junakov — slovenskih in tujih.
 *
 * SAMO liki v javni lasti (ljudske pravljice, klasična literatura). Nobenih
 * Marvel/DC/Disney likov, ker je repozitorij javen. Disneyjeve UPODOBITVE so
 * zaščitene tudi tam, kjer je zgodba javna last — zato so Sneguljčica, Pepelka
 * in Trnuljčica opisane po ljudski predlogi, ne po risanki. Enako velja za
 * slike: naročene naj bodo po ljudski predlogi.
 *
 * Vsa imena so ENOBESEDNA — večbesedna (MARTIN KRPAN, RDEČA KAPICA) bi v igri
 * zahtevala presledek kot svoj element in so za šestletnika predolga.
 *
 * `syl` je ROČNO zapisana delitev na zloge, ne izračunana. Pravila (enaka kot v
 * dinos.js in words.js): jedro zloga je samoglasnik ali zložni R (KR-PAN),
 * pri sklopu 2+ soglasnikov gre v naslednji zlog SAMO ZADNJI soglasnik
 * (PEH-TA, PE-PEL-KA), digrafi LJ, NJ, DŽ se nikoli ne razbijejo (SNE-GULJ-ČI-CA).
 *
 * `group` je skupina za izbiro napačnih odgovorov: na težki stopnji izbiramo
 * znotraj iste skupine, da o odgovoru odloči BRANJE in ne oblika lika.
 */

export const HEROES = [
  // --- slovenski ---
  {
    id: 'kekec',
    name: 'KEKEC',
    syl: ['KE', 'KEC'],
    group: 'slovenski',
    img: 'img/heroes/kekec.webp',
    fact: 'Pogumen pastir iz slovenskih pravljic, ki se ne boji Bedanca.'
  },
  {
    id: 'pehta',
    name: 'PEHTA',
    syl: ['PEH', 'TA'],
    group: 'slovenski',
    img: 'img/heroes/pehta.webp',
    fact: 'Gorska zeliščarka iz Kekca, sprva stroga, na koncu prijazna.'
  },
  {
    id: 'bedanec',
    name: 'BEDANEC',
    syl: ['BE', 'DA', 'NEC'],
    group: 'slovenski',
    img: 'img/heroes/bedanec.webp',
    fact: 'Velik in nagajiv divjak iz gora, ki ustrahuje pastirje.'
  },
  {
    id: 'krpan',
    name: 'KRPAN',
    syl: ['KR', 'PAN'],
    group: 'slovenski',
    img: 'img/heroes/krpan.webp',
    fact: 'Močan mož iz Vrha, ki je nosil sol čez hribe.'
  },
  {
    id: 'zlatorog',
    name: 'ZLATOROG',
    syl: ['ZLA', 'TO', 'ROG'],
    group: 'slovenski',
    img: 'img/heroes/zlatorog.webp',
    fact: 'Beli kozorog z zlatimi rogovi, čuvar zakladov v Triglavu.'
  },
  {
    id: 'mojca',
    name: 'MOJCA',
    syl: ['MOJ', 'CA'],
    group: 'slovenski',
    img: 'img/heroes/mojca.webp',
    fact: 'Deklica, ki je v piskrčku zbrala premražene gozdne živali.'
  },
  {
    id: 'kurent',
    name: 'KURENT',
    syl: ['KU', 'RENT'],
    group: 'slovenski',
    img: 'img/heroes/kurent.webp',
    fact: 'Kosmata pustna maska s kravjimi zvonci, ki preganja zimo.'
  },
  {
    id: 'klepec',
    name: 'KLEPEC',
    syl: ['KLE', 'PEC'],
    group: 'slovenski',
    img: 'img/heroes/klepec.webp',
    fact: 'Pastir iz Čabranske doline, ki je dobil čudežno moč.'
  },

  // --- tuji pravljični ---
  {
    id: 'sneguljcica',
    name: 'SNEGULJČICA',
    syl: ['SNE', 'GULJ', 'ČI', 'CA'],
    group: 'pravljicni',
    img: 'img/heroes/sneguljcica.webp',
    fact: 'Deklica, ki je našla zavetje pri sedmih palčkih v gozdu.'
  },
  {
    id: 'pepelka',
    name: 'PEPELKA',
    syl: ['PE', 'PEL', 'KA'],
    group: 'pravljicni',
    img: 'img/heroes/pepelka.webp',
    fact: 'Deklica, ki je s plesa zbežala in izgubila čeveljček.'
  },
  {
    id: 'trnuljcica',
    name: 'TRNULJČICA',
    syl: ['TR', 'NULJ', 'ČI', 'CA'],
    group: 'pravljicni',
    img: 'img/heroes/trnuljcica.webp',
    fact: 'Princesa, ki je sto let spala za steno trnja.'
  },
  {
    id: 'ostrzek',
    name: 'OSTRŽEK',
    syl: ['OS', 'TR', 'ŽEK'],
    group: 'pravljicni',
    img: 'img/heroes/ostrzek.webp',
    fact: 'Lesena lutka, ki oživi, ob laži pa mu zraste nos.'
  },
  {
    id: 'metka',
    name: 'METKA',
    syl: ['MET', 'KA'],
    group: 'pravljicni',
    img: 'img/heroes/metka.webp',
    fact: 'Z bratom Jankom je v gozdu našla hišico iz sladkarij.'
  },
  {
    id: 'alica',
    name: 'ALICA',
    syl: ['A', 'LI', 'CA'],
    group: 'pravljicni',
    img: 'img/heroes/alica.webp',
    fact: 'Deklica, ki je padla v zajčjo luknjo v čudežno deželo.'
  },
  {
    id: 'palcek',
    name: 'PALČEK',
    syl: ['PAL', 'ČEK'],
    group: 'pravljicni',
    img: 'img/heroes/palcek.webp',
    fact: 'Majhen bradat možic, ki v pravljicah pomaga ali nagaja.'
  },
  {
    id: 'volk',
    name: 'VOLK',
    syl: ['VOLK'],
    group: 'pravljicni',
    img: 'img/heroes/volk.webp',
    fact: 'Sivi gozdni tekač, pogost nasprotnik v pravljicah o kozličkih.'
  },
  {
    id: 'zmaj',
    name: 'ZMAJ',
    syl: ['ZMAJ'],
    group: 'pravljicni',
    img: 'img/heroes/zmaj.webp',
    fact: 'Krilata pošast, ki bruha ogenj in čuva zaklad.'
  }
];

export const HERO_BY_ID = new Map(HEROES.map((h) => [h.id, h]));

/** Vsi unikatni zlogi — potrebuje jih generator zvočnega paketa. */
export const HERO_SYLLABLES = [...new Set(HEROES.flatMap((h) => h.syl))].sort();
