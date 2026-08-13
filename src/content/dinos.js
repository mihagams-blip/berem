/**
 * 22 dinozavrov (in dva plazilca, ki to nista — Pteranodon leti, Mozazaver plava).
 *
 * `syl` je ROČNO zapisana delitev na zloge, ne izračunana. Pravilo je iz
 * raziskave dino-akademija/dev/research-branje.md §3.4: pri sklopu 2+ soglasnikov
 * gre v naslednji zlog SAMO ZADNJI soglasnik (zato DIP-LO-DOK in PA-RA-ZAV-RO-LOF).
 * Šestletnik prebere SES-TRA laže kot SE-STRA.
 *
 * `shape` je izpeljana skupina za izbiro napačnih odgovorov: na težki stopnji
 * izbiramo znotraj iste skupine, da o odgovoru odloči BRANJE in ne oblika živali.
 *
 * Dolžine, teže in dejstva so prenesena iz Dino Akademije, kjer so bila
 * preverjena ob paleontoloških virih — ne spreminjaj jih brez vira.
 */

export const DINOS = [
  {
    "id": "tyrannosaurus",
    "name": "TIRANOZAVER",
    "syl": [
      "TI",
      "RA",
      "NO",
      "ZA",
      "VER"
    ],
    "latin": "Tyrannosaurus rex",
    "diet": "carnivore",
    "period": "cretaceous",
    "lengthM": 12.3,
    "weightKg": 8000,
    "shape": "dvonozni-plenilec",
    "fact": "Njegov največji zob je bil s korenino vred dolg približno 30 centimetrov.",
    "benchmark": "Dolg kot 7 očkov, ki bi legli drug za drugim.",
    "img": "img/dinos/tyrannosaurus.webp"
  },
  {
    "id": "triceratops",
    "name": "TRICERATOPS",
    "syl": [
      "TRI",
      "CE",
      "RA",
      "TOPS"
    ],
    "latin": "Triceratops horridus",
    "diet": "herbivore",
    "period": "cretaceous",
    "lengthM": 8,
    "weightKg": 8000,
    "shape": "oklepni",
    "fact": "Njegova lobanja z rogovi je merila do 2,5 metra — ena največjih glav med kopenskimi živalmi.",
    "benchmark": "Težak kot 16 konj.",
    "img": "img/dinos/triceratops.webp"
  },
  {
    "id": "velociraptor",
    "name": "VELOCIRAPTOR",
    "syl": [
      "VE",
      "LO",
      "CI",
      "RAP",
      "TOR"
    ],
    "latin": "Velociraptor mongoliensis",
    "diet": "carnivore",
    "period": "cretaceous",
    "lengthM": 1.8,
    "weightKg": 17,
    "shape": "dvonozni-plenilec",
    "fact": "Na kosteh njegovih rok so našli sledi peres — bil je pernat in velik približno kot puran.",
    "benchmark": "Težak kot 4 mačke.",
    "img": "img/dinos/velociraptor.webp"
  },
  {
    "id": "stegosaurus",
    "name": "STEGOZAVER",
    "syl": [
      "STE",
      "GO",
      "ZA",
      "VER"
    ],
    "latin": "Stegosaurus stenops",
    "diet": "herbivore",
    "period": "jurassic",
    "lengthM": 6.5,
    "weightKg": 3500,
    "shape": "oklepni",
    "fact": "Na hrbtu je imel 17 kostnih plošč, na repu pa štiri dolge bodice.",
    "benchmark": "Težak kot 7 konj.",
    "img": "img/dinos/stegosaurus.webp"
  },
  {
    "id": "brachiosaurus",
    "name": "BRAHIOZAVER",
    "syl": [
      "BRA",
      "HI",
      "O",
      "ZA",
      "VER"
    ],
    "latin": "Brachiosaurus altithorax",
    "diet": "herbivore",
    "period": "jurassic",
    "lengthM": 20,
    "weightKg": 35000,
    "shape": "dolgovrati",
    "fact": "Sprednje noge je imel daljše od zadnjih, zato se je njegovo telo dvigalo naprej kot pri žirafi.",
    "benchmark": "Težak kot 7 slonov.",
    "img": "img/dinos/brachiosaurus.webp"
  },
  {
    "id": "diplodocus",
    "name": "DIPLODOK",
    "syl": [
      "DIP",
      "LO",
      "DOK"
    ],
    "latin": "Diplodocus carnegii",
    "diet": "herbivore",
    "period": "jurassic",
    "lengthM": 25,
    "weightKg": 13000,
    "shape": "dolgovrati",
    "fact": "Skoraj polovica njegove dolžine je bil rep — v njem je bilo okoli 80 vretenc.",
    "benchmark": "Dolg kot 2 avtobusa.",
    "img": "img/dinos/diplodocus.webp"
  },
  {
    "id": "allosaurus",
    "name": "ALOZAVER",
    "syl": [
      "A",
      "LO",
      "ZA",
      "VER"
    ],
    "latin": "Allosaurus fragilis",
    "diet": "carnivore",
    "period": "jurassic",
    "lengthM": 8.5,
    "weightKg": 2000,
    "shape": "dvonozni-plenilec",
    "fact": "V kamnolomu Cleveland-Lloyd v Utahu so na enem samem mestu našli ostanke več kot 46 alozavrov.",
    "benchmark": "Dolg kot 5 očkov.",
    "img": "img/dinos/allosaurus.webp"
  },
  {
    "id": "compsognathus",
    "name": "KOMPSOGNAT",
    "syl": [
      "KOMP",
      "SOG",
      "NAT"
    ],
    "latin": "Compsognathus longipes",
    "diet": "carnivore",
    "period": "jurassic",
    "lengthM": 1.25,
    "weightKg": 3,
    "shape": "dvonozni-plenilec",
    "fact": "V trebuhu enega osebka so našli celega kuščarja — njegov zadnji obrok.",
    "benchmark": "Težak kot 2 kokoši.",
    "img": "img/dinos/compsognathus.webp"
  },
  {
    "id": "spinosaurus",
    "name": "SPINOZAVER",
    "syl": [
      "SPI",
      "NO",
      "ZA",
      "VER"
    ],
    "latin": "Spinosaurus aegyptiacus",
    "diet": "carnivore",
    "period": "cretaceous",
    "lengthM": 14,
    "weightKg": 7400,
    "shape": "dvonozni-plenilec",
    "fact": "Na hrbtu je nosil jadro iz kostnih trnov, visokih do 1,6 metra, in veliko časa lovil ribe v vodi.",
    "benchmark": "Dolg kot 8 očkov.",
    "img": "img/dinos/spinosaurus.webp"
  },
  {
    "id": "giganotosaurus",
    "name": "GIGANTOZAVER",
    "syl": [
      "GI",
      "GAN",
      "TO",
      "ZA",
      "VER"
    ],
    "latin": "Giganotosaurus carolinii",
    "diet": "carnivore",
    "period": "cretaceous",
    "lengthM": 12.5,
    "weightKg": 8000,
    "shape": "dvonozni-plenilec",
    "fact": "Našel ga je Rubén Carolini, ki fosilov ni iskal poklicno — dinozaver zato nosi njegovo ime.",
    "benchmark": "Dolg kot 3 avti, postavljeni drug za drugim.",
    "img": "img/dinos/giganotosaurus.webp"
  },
  {
    "id": "ankylosaurus",
    "name": "ANKILOZAVER",
    "syl": [
      "AN",
      "KI",
      "LO",
      "ZA",
      "VER"
    ],
    "latin": "Ankylosaurus magniventris",
    "diet": "herbivore",
    "period": "cretaceous",
    "lengthM": 8,
    "weightKg": 5000,
    "shape": "oklepni",
    "fact": "Na koncu repa je imel kostni kij, s katerim je lahko napadalcu zlomil nogo.",
    "benchmark": "Težak kot 1 odrasel slon.",
    "img": "img/dinos/ankylosaurus.webp"
  },
  {
    "id": "parasaurolophus",
    "name": "PARAZAVROLOF",
    "syl": [
      "PA",
      "RA",
      "ZAV",
      "RO",
      "LOF"
    ],
    "latin": "Parasaurolophus walkeri",
    "diet": "herbivore",
    "period": "cretaceous",
    "lengthM": 9.5,
    "weightKg": 5000,
    "shape": "dvonozni-rastlinojed",
    "fact": "Votli greben na glavi je bil dolg 1,6 metra in je deloval kot trobenta za globoke zvoke.",
    "benchmark": "Dolg kot 5 postelj.",
    "img": "img/dinos/parasaurolophus.webp"
  },
  {
    "id": "iguanodon",
    "name": "IGVANODON",
    "syl": [
      "IG",
      "VA",
      "NO",
      "DON"
    ],
    "latin": "Iguanodon bernissartensis",
    "diet": "herbivore",
    "period": "cretaceous",
    "lengthM": 10,
    "weightKg": 3500,
    "shape": "dvonozni-rastlinojed",
    "fact": "Palec je imel spremenjen v koničasto bodico — prvi raziskovalci so mu jo pomotoma postavili na nos.",
    "benchmark": "Dolg kot 6 očkov.",
    "img": "img/dinos/iguanodon.webp"
  },
  {
    "id": "pachycephalosaurus",
    "name": "PAHICEFALOZAVER",
    "syl": [
      "PA",
      "HI",
      "CE",
      "FA",
      "LO",
      "ZA",
      "VER"
    ],
    "latin": "Pachycephalosaurus wyomingensis",
    "diet": "herbivore",
    "period": "cretaceous",
    "lengthM": 4.5,
    "weightKg": 400,
    "shape": "oklepni",
    "fact": "Kost na vrhu njegove glave je bila debela do 25 centimetrov.",
    "benchmark": "Dolg kot 1 avto.",
    "img": "img/dinos/pachycephalosaurus.webp"
  },
  {
    "id": "protoceratops",
    "name": "PROTOCERATOPS",
    "syl": [
      "PRO",
      "TO",
      "CE",
      "RA",
      "TOPS"
    ],
    "latin": "Protoceratops andrewsi",
    "diet": "herbivore",
    "period": "cretaceous",
    "lengthM": 2,
    "weightKg": 85,
    "shape": "oklepni",
    "fact": "Našli so fosil, na katerem se protoceratops in velociraptor borita — sredi boja ju je zasul pesek.",
    "benchmark": "Težak kot 3 veliki psi.",
    "img": "img/dinos/protoceratops.webp"
  },
  {
    "id": "argentinosaurus",
    "name": "ARGENTINOZAVER",
    "syl": [
      "AR",
      "GEN",
      "TI",
      "NO",
      "ZA",
      "VER"
    ],
    "latin": "Argentinosaurus huinculensis",
    "diet": "herbivore",
    "period": "cretaceous",
    "lengthM": 33,
    "weightKg": 75000,
    "shape": "dolgovrati",
    "fact": "Eno samo vretence iz njegovega hrbta je visoko 159 centimetrov — skoraj kot odrasel človek.",
    "benchmark": "Težak kot 15 slonov.",
    "img": "img/dinos/argentinosaurus.webp"
  },
  {
    "id": "therizinosaurus",
    "name": "TERIZINOZAVER",
    "syl": [
      "TE",
      "RI",
      "ZI",
      "NO",
      "ZA",
      "VER"
    ],
    "latin": "Therizinosaurus cheloniformis",
    "diet": "herbivore",
    "period": "cretaceous",
    "lengthM": 9.5,
    "weightKg": 5000,
    "shape": "dvonozni-rastlinojed",
    "fact": "Njegovi kremplji so bili dolgi do 52 centimetrov — najdaljši med vsemi znanimi živalmi.",
    "benchmark": "Težak kot 20 medvedov.",
    "img": "img/dinos/therizinosaurus.webp"
  },
  {
    "id": "gallimimus",
    "name": "GALIMIM",
    "syl": [
      "GA",
      "LI",
      "MIM"
    ],
    "latin": "Gallimimus bullatus",
    "diet": "omnivore",
    "period": "cretaceous",
    "lengthM": 6,
    "weightKg": 450,
    "shape": "dvonozni-rastlinojed",
    "fact": "Tekel je okoli 50 kilometrov na uro — hitreje, kot vozijo avtomobili v mestu.",
    "benchmark": "Težak kot 1 konj.",
    "img": "img/dinos/gallimimus.webp"
  },
  {
    "id": "plateosaurus",
    "name": "PLATEOZAVER",
    "syl": [
      "PLA",
      "TE",
      "O",
      "ZA",
      "VER"
    ],
    "latin": "Plateosaurus trossingensis",
    "diet": "herbivore",
    "period": "triassic",
    "lengthM": 8,
    "weightKg": 2000,
    "shape": "dolgovrati",
    "fact": "V Trossingenu v Nemčiji so na enem najdišču izkopali na desetine njegovih okostij.",
    "benchmark": "Težak kot 4 konji.",
    "img": "img/dinos/plateosaurus.webp"
  },
  {
    "id": "eoraptor",
    "name": "EORAPTOR",
    "syl": [
      "E",
      "O",
      "RAP",
      "TOR"
    ],
    "latin": "Eoraptor lunensis",
    "diet": "omnivore",
    "period": "triassic",
    "lengthM": 1.25,
    "weightKg": 10,
    "shape": "dvonozni-rastlinojed",
    "fact": "Sodi med prve dinozavre na svetu. V gobcu je imel dve vrsti zob — ostre in listaste.",
    "benchmark": "Težak kot 7 kokoši.",
    "img": "img/dinos/eoraptor.webp"
  },
  {
    "id": "pteranodon",
    "name": "PTERANODON",
    "syl": [
      "PTE",
      "RA",
      "NO",
      "DON"
    ],
    "latin": "Pteranodon longiceps",
    "diet": "carnivore",
    "period": "cretaceous",
    "lengthM": 1.8,
    "weightKg": 25,
    "shape": "leteci",
    "fact": "Ni bil dinozaver, ampak leteči plazilec — pterozaver. Krila je razpel čez 6 metrov, v želodcu enega pa so našli ribje kosti.",
    "benchmark": "Težak kot 6 mačk, čeprav je imel ogromna krila.",
    "img": "img/dinos/pteranodon.webp"
  },
  {
    "id": "mosasaurus",
    "name": "MOZAZAVER",
    "syl": [
      "MO",
      "ZA",
      "ZA",
      "VER"
    ],
    "latin": "Mosasaurus hoffmannii",
    "diet": "carnivore",
    "period": "cretaceous",
    "lengthM": 12,
    "weightKg": 10000,
    "shape": "morski",
    "fact": "Ni bil dinozaver, ampak morski plazilec in sorodnik kuščarjev. Prvo lobanjo so našli že leta 1764.",
    "benchmark": "Težak kot 2 slona.",
    "img": "img/dinos/mosasaurus.webp"
  }
];

export const DINO_BY_ID = new Map(DINOS.map((d) => [d.id, d]));

/** Vsi unikatni zlogi — potrebuje jih generator zvočnega paketa. */
export const SYLLABLES = [...new Set(DINOS.flatMap((d) => d.syl))].sort();
