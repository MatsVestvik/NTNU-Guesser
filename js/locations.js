/**
 * NTNU Guesser - Campus Locations Database
 * Coordinates, Campus names, Curated Lore, Clues and local image paths.
 */
const NTNU_LOCATIONS = [
  {
    id: "hovedbygningen_front",
    name: "Hovedbygningen (Hovedinngangen)",
    campus: "Gløshaugen",
    coords: [63.41945, 10.40212],
    image: "assets/locations/hovedbygningen_front.jpg",
    category: "gloshaugen",
    lore: "NTNUs mest ikoniske bygning i råkopp granitt, innviet i 1910 av Kong Haakon VII. Tegnet av Bredo Greve, og viden kjent som Trondheims svar på Galtvort (Hogwarts)!",
    hint: "Tung nasjonalromantisk granitt, staselig portal og NTHs opprinnelige hjerte."
  },
  {
    id: "realfagbygget_front",
    name: "Realfagbygget (Søndre fasade)",
    campus: "Gløshaugen",
    coords: [63.41584, 10.40625],
    image: "assets/locations/realfagbygget_front.jpg",
    category: "gloshaugen",
    lore: "Ferdigstilt i år 2000 og Gløshaugens største enkeltbygg (ca 60 000 m²). Huser Realfagskantina, Foucault-pendelen og institutter for fysikk, kjemi og matematikk.",
    hint: "Karakteristisk buet glassfasade og moderne arkitektur mot sørenden av Gløs."
  },
  {
    id: "sentralbygg_stripa",
    name: "Sentralbygg 1 & Stripa",
    campus: "Gløshaugen",
    coords: [63.41829, 10.40277],
    image: "assets/locations/sentralbygg_stripa.jpg",
    category: "gloshaugen",
    lore: "Sentralbyggene fra 1960-tallet rager høyt over Gløshaugen. I sokkelen ligger Stripa, den beryktede 200 meter lange innendørs gaten full av vaffelsalg, stands og linjeforeninger.",
    hint: "Høyblokk i rå betong midt på Gløshaugen, like over Stripa."
  },
  {
    id: "studentersamfundet",
    name: "Studentersamfundet i Trondhjem",
    campus: "Samfundet",
    coords: [63.42250, 10.39528],
    image: "assets/locations/studentersamfundet.jpg",
    category: "samfundet",
    lore: "«Det Røde Runde Huset» ved Elgeseter bru, innviet i 1929. Eies og drives av studentene selv, og er arena for UKA, ISFiT, Samfundsmøter, Bodegaen og Edgar.",
    hint: "Rundt, mørkerødt ikonisk hus ved foten av bakken opp mot Gløshaugen."
  },
  {
    id: "dragvoll_campus",
    name: "Campus Dragvoll",
    campus: "Dragvoll",
    coords: [63.40875, 10.47035],
    image: "assets/locations/dragvoll_campus.jpg",
    category: "dragvoll",
    lore: "Tegnet av Henning Larsen og åpnet i 1978. Kjent for sine lyse innendørs gater under glasstak, og den evige ventingen på buss nummer 3 ut i marka.",
    hint: "Lavmælt paviljongarkitektur i åpent landskap med utsikt mot åkrer mot øst."
  },
  {
    id: "gamle_fysikk",
    name: "Gamle Fysikk",
    campus: "Gløshaugen",
    coords: [63.41873, 10.40108],
    image: "assets/locations/gamle_fysikk.jpg",
    category: "gloshaugen",
    lore: "Bygget i 1924 og et av de tidlige praktbyggene på Gløshaugen. Ligger på vestsiden av platået med utsikt ned mot Dødens Dal og Samfundet.",
    hint: "Klassisk okergul teglstein og staselige buer på vestsiden av Gløs-platået."
  },
  {
    id: "gamle_kjemi",
    name: "Gamle Kjemi",
    campus: "Gløshaugen",
    coords: [63.41982, 10.40428],
    image: "assets/locations/gamle_kjemi.jpg",
    category: "gloshaugen",
    lore: "Gamle Kjemi sto ferdig til åpningen i 1910. Bygningen i dyp rød teglstein med bratt tak og høye piper ligger like øst for Hovedbygningen.",
    hint: "Rød teglstein og tårn like øst for Hovedbygningen langs Høgskoleringen."
  },
  {
    id: "dodens_dal",
    name: "Dødens Dal",
    campus: "Gløshaugen",
    coords: [63.42080, 10.39850],
    image: "assets/locations/dodens_dal.jpg",
    category: "gloshaugen",
    lore: "Dødens Dal ligger i kløften mellom Gløshaugen og Samfundet. Til hverdags treningsbane for NTNUI, men under UKA forvandles dalen til Nord-Europas villeste konsertarena i det gigantiske sirkusteltet!",
    hint: "Idrettsbane i dalsøkket like nedenfor Hovedbygningen mot vest."
  },
  {
    id: "ohma_electra",
    name: "Lokomotivet Ohma Electra (Gamle Elektro)",
    campus: "Gløshaugen",
    coords: [63.41785, 10.40360],
    image: "assets/locations/ohma_electra.jpg",
    category: "gloshaugen",
    lore: "Ohma Electra er verdens eldste operative vekselstrømlokomotiv (bygget i 1908)! Ble gitt som gave til NTH og står permanent på skinner utenfor Gamle Elektro.",
    hint: "Et grønt historisk tog stående på et lite jernbanespor midt på campus."
  },
  {
    id: "kjelhuset",
    name: "Kjelhuset & Varmeteknisk",
    campus: "Gløshaugen",
    coords: [63.41890, 10.40480],
    image: "assets/locations/kjelhuset.jpg",
    category: "gloshaugen",
    lore: "Det opprinnelige fyr- og kjelhuset for Gløshaugen med den karakteristiske fabrikkpipen. I dag et levende knutepunkt med auditorier, verksteder og laber.",
    hint: "Høy industripipestabel i tegl og fabrikkarkitektur midt på Gløshaugen."
  },
  {
    id: "marinteknisk_tyholt",
    name: "Marinteknisk Senter (Tyholt)",
    campus: "Tyholt",
    coords: [63.41975, 10.42780],
    image: "assets/locations/marinteknisk_tyholt.jpg",
    category: "tyholt",
    lore: "Biblioteket og senteret ved Marinteknisk på Tyholt, omgitt av skipsmodeller, propeller og havromslaboratorier. Her bygges nå det nye Ocean Space Centre!",
    hint: "Skipsmodeller og maritim forskningslitteratur oppe på Tyholt-platået."
  },
  {
    id: "gunnerus_kalvskinnet",
    name: "Gunnerusbiblioteket (Campus Kalvskinnet)",
    campus: "Kalvskinnet",
    coords: [63.42890, 10.38720],
    image: "assets/locations/gunnerus_kalvskinnet.jpg",
    category: "kalvskinnet",
    lore: "Norges eldste vitenskapelige bibliotek, etablert i 1768 av biskop Gunnerus og DKNVS. Ligger i den historiske hagen på Campus Kalvskinnet nær Nidarosdomen.",
    hint: "Klassisk hvitmalt herskapsbygg og historisk bibliotekpark i Kalvskinnet-kvartalet."
  },
  {
    id: "moholt_studentby",
    name: "Moholt Studentby (Massivtre-tårnene)",
    campus: "Moholt",
    coords: [63.41240, 10.43430],
    image: "assets/locations/moholt_studentby.jpg",
    category: "moholt",
    lore: "Norges største studentby med tusenvis av studenter fra hele verden. Kjent for de prisbelønte massivtre-tårnene på Moholt Allmenning, Loftet og SiT treningssenter.",
    hint: "Høye studentblokker i trepanel, omkranset av studentboliger og sykkelstier."
  },
  {
    id: "st_olavs_oya",
    name: "Kunnskapssenteret (Campus Øya)",
    campus: "Øya",
    coords: [63.42150, 10.38760],
    image: "assets/locations/st_olavs_oya.jpg",
    category: "oya",
    lore: "Kunnskapssenteret binder NTNUs medisinske fakultet sammen med St. Olavs hospital. Her finner du blant annet Kavli-instituttet og miljøet til nobelprisvinnerne Moser.",
    hint: "Ultramoderne glassarkitektur og sykehuscampus på Øya like ved Nidelva."
  },
  {
    id: "hovedbygningen_ost",
    name: "Hovedbygningen (Østfløyen)",
    campus: "Gløshaugen",
    coords: [63.41910, 10.40350],
    image: "assets/locations/hovedbygningen_ost.jpg",
    category: "gloshaugen",
    lore: "Østsiden av Hovedbygningen, med dype vindusnisjer i granitt og tårn. Herfra har du utsikt mot Elektrobygget og Høgskoleringen.",
    hint: "Granittfasade på baksiden/østfløyen av NTNUs eldste praktbygg."
  },
  {
    id: "realfagbygget_interior",
    name: "Realfagbygget (Biblioteket & overlysene)",
    campus: "Gløshaugen",
    coords: [63.41584, 10.40625],
    image: "assets/locations/realfagbygget_interior.jpg",
    category: "gloshaugen",
    lore: "Inne i Realfagbiblioteket med de karakteristiske takvinduene, lesesalsplassene og trappeløpene. Et av Gløshaugens mest besøkte studieområder.",
    hint: "Åpent innendørs bibliotekrom med store overlys og bokhyller."
  },
  {
    id: "gamle_elektro",
    name: "Gamle Elektro",
    campus: "Gløshaugen",
    coords: [63.41795, 10.40390],
    image: "assets/locations/gamle_elektro.jpg",
    category: "gloshaugen",
    lore: "Gamle Elektro sto ferdig i 1910 som et av de tre opprinnelige NTH-anleggene. Her har generasjoner av sivilingeniører innen elektro og kybernetikk trådt sine barnesko.",
    hint: "Rød teglstein, hvelvede vinduer og klassisk 1910-fasade rett ved Ohma Electra."
  }
];

// Campus presets for quick-navigation on the map
const NTNU_CAMPUS_PRESETS = [
  { name: "Gløshaugen", coords: [63.4184, 10.4032], zoom: 16 },
  { name: "Samfundet", coords: [63.4225, 10.3953], zoom: 17 },
  { name: "Dragvoll", coords: [63.4087, 10.4704], zoom: 16 },
  { name: "Tyholt", coords: [63.4198, 10.4278], zoom: 16 },
  { name: "Øya", coords: [63.4215, 10.3876], zoom: 16 },
  { name: "Kalvskinnet", coords: [63.4289, 10.3872], zoom: 16 },
  { name: "Moholt", coords: [63.4124, 10.4343], zoom: 16 }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { NTNU_LOCATIONS, NTNU_CAMPUS_PRESETS };
}
