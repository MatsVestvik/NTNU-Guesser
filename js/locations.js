/**
 * NTNU Guesser - Campus Locations Database
 */
const NTNU_LOCATIONS = [
  {
    "id": "hovedbygningen_front",
    "title": "File:Hovedbygningen ved NTNU.jpg",
    "name": "Hovedbygningen (Hovedinngangen)",
    "campus": "Gløshaugen",
    "coords": [
      63.41945,
      10.40212
    ],
    "lore": "NTNUs mest ikoniske bygning i råkopp granitt, innviet i 1910 av Kong Haakon VII. Tegnet av Bredo Greve, og viden kjent som Trondheims svar på Galtvort!",
    "hint": "Tung granitt, staselig portal og Norges tekniske hjerte siden 1910.",
    "image": "assets/locations/hovedbygningen_front.jpg"
  },
  {
    "id": "realfagbygget_front",
    "title": "File:Realfagbygget (NTNU) 2006.jpg",
    "name": "Realfagbygget",
    "campus": "Gløshaugen",
    "coords": [
      63.41584,
      10.40625
    ],
    "lore": "Ferdigstilt i 2000 og Gløshaugens største enkeltbygg (ca 60 000 m²). Huser Realfagskantina, Foucault-pendelen og institutter for fysikk, kjemi og biologi.",
    "hint": "Moderne glassfasade mot sør på Gløshaugen.",
    "image": "assets/locations/realfagbygget_front.jpg"
  },
  {
    "id": "sentralbygg_stripa",
    "title": "File:Sentralbygg 1 høyblokk Gløshaugen Trondheim 2022-08-18 01.jpg",
    "name": "Sentralbygg 1 & Stripa",
    "campus": "Gløshaugen",
    "coords": [
      63.41829,
      10.40277
    ],
    "lore": "Sentralbyggene fra 1960-tallet rager høyt over Gløshaugen. I sokkelen ligger Stripa, den beryktede 200 meter lange innendørs korridoren full av vaffellukt og linjeforeninger.",
    "hint": "Brutalistisk høyblokk i betong midt på campus.",
    "image": "assets/locations/sentralbygg_stripa.jpg"
  },
  {
    "id": "studentersamfundet",
    "title": "File:Studentersamfundet Trondheim 2022-08-18 01.jpg",
    "name": "Studentersamfundet i Trondhjem",
    "campus": "Samfundet",
    "coords": [
      63.4225,
      10.39528
    ],
    "lore": "«Det Røde Runde Huset» ved Elgeseter bru, innviet i 1929. Eies og drives av studentene selv, og er arena for UKA, ISFiT, Samfundsmøter og natteliv.",
    "hint": "Rundt, mørkerødt hus ved foten av bakken opp mot Gløshaugen.",
    "image": "assets/locations/studentersamfundet.jpg"
  },
  {
    "id": "dragvoll_campus",
    "title": "File:NTNU - Campus Dragvoll.jpg",
    "name": "Campus Dragvoll",
    "campus": "Dragvoll",
    "coords": [
      63.40875,
      10.47035
    ],
    "lore": "Tegnet av Henning Larsen og åpnet i 1978. Kjent for sine lyse innendørs gater («Gata») under glasstak, og den evige ventingen på buss nummer 3.",
    "hint": "Lavmælt arkitektur i åpent landskap med utsikt mot åkrer og fjord.",
    "image": "assets/locations/dragvoll_campus.jpg"
  },
  {
    "id": "gamle_fysikk",
    "title": "File:Gamle fysikk NTNU.JPG",
    "name": "Gamle Fysikk",
    "campus": "Gløshaugen",
    "coords": [
      63.41873,
      10.40108
    ],
    "lore": "Bygget i 1924 og et av de tidlige praktbyggene på Gløshaugen. Ligger på vestsiden av platået mot Dødens Dal.",
    "hint": "Klassisk gul teglstein og staselige buer på vestsiden av Gløs.",
    "image": "assets/locations/gamle_fysikk.jpg"
  },
  {
    "id": "gamle_kjemi",
    "title": "File:Gamle kjemi Gløshaugen Trondheim 2022-08-18 01.jpg",
    "name": "Gamle Kjemi",
    "campus": "Gløshaugen",
    "coords": [
      63.41982,
      10.40428
    ],
    "lore": "Gamle Kjemi sto ferdig til åpningen i 1910. Bygningen i rød teglstein med bratt tak ligger øst for Hovedbygningen.",
    "hint": "Rød teglstein like øst for Hovedbygningen.",
    "image": "assets/locations/gamle_kjemi.jpg"
  },
  {
    "id": "dodens_dal",
    "title": "File:Dodens dal 2012.jpg",
    "name": "Dødens Dal",
    "campus": "Gløshaugen",
    "coords": [
      63.4208,
      10.3985
    ],
    "lore": "Dødens Dal ligger mellom Gløshaugen og Studentersamfundet. Til hverdags en idrettsplass for NTNUI, men under UKA forvandles dalen til Norges råeste konsertarena i Dødens Dal-teltet!",
    "hint": "Gressbane/idrettsplass i dalsøkket vest for Gløshaugen-platået.",
    "image": "assets/locations/dodens_dal.jpg"
  },
  {
    "id": "ohma_electra",
    "title": "File:Ohma Electra Gløshaugen Trondheim 2022-08-18 01.jpg",
    "name": "Lokomotivet Ohma Electra",
    "campus": "Gløshaugen",
    "coords": [
      63.41785,
      10.4036
    ],
    "lore": "Ohma Electra er verdens eldste bevarte vekselstrømlokomotiv (fra 1908)! Det ble gitt til NTH og står permanent utstilt på sporet utenfor Gamle Elektro.",
    "hint": "Et grønt veterantog stående utendørs mellom Gløshaugen-bygningene.",
    "image": "assets/locations/ohma_electra.jpg"
  },
  {
    "id": "kjelhuset",
    "title": "File:Kjelhuset NTNU.JPG",
    "name": "Kjelhuset & Varmeteknisk",
    "campus": "Gløshaugen",
    "coords": [
      63.4189,
      10.4048
    ],
    "lore": "Det opprinnelige fyrhuset på Gløshaugen med det høye mursteins-pipetårnet. Nå ombygd til toppmoderne auditorier og laber!",
    "hint": "Karakteristisk fabrikkpipe og rød industritegl midt på campus.",
    "image": "assets/locations/kjelhuset.jpg"
  },
  {
    "id": "marinteknisk_tyholt",
    "title": "File:NTNU UB Marine Technology Library 1.jpg",
    "name": "Marinteknisk Bibliotek (Tyholt)",
    "campus": "Tyholt",
    "coords": [
      63.41975,
      10.4278
    ],
    "lore": "Biblioteket ved Marinteknisk Senter på Tyholt, omgitt av skipsmodeller, propellere og forskningslitteratur innen marin teknikk og havromsvitenskap.",
    "hint": "Skipsmodeller og maritime oppslagsverk på Tyholt-campus.",
    "image": "assets/locations/marinteknisk_tyholt.jpg"
  },
  {
    "id": "gunnerus_kalvskinnet",
    "title": "File:NTNU Universitetsbiblioteket, Gunnerusbiblioteket.jpg",
    "name": "Gunnerusbiblioteket (Kalvskinnet)",
    "campus": "Kalvskinnet",
    "coords": [
      63.4289,
      10.3872
    ],
    "lore": "Norges eldste vitenskapelige bibliotek, grunnlagt i 1768 av Det Kongelige Norske Videnskabers Selskab. Ligger på Campus Kalvskinnet.",
    "hint": "Historisk bibliotek og hage midt i Kalvskinnet-kvartalet.",
    "image": "assets/locations/gunnerus_kalvskinnet.jpg"
  },
  {
    "id": "moholt_studentby",
    "title": "File:Moholt studentby 23JUL2023 04.jpg",
    "name": "Moholt Studentby",
    "campus": "Moholt",
    "coords": [
      63.4124,
      10.4343
    ],
    "lore": "Norges største studentby med tusenvis av beboere fra hele verden. Kjent for de moderne massivtre-tårnene, SiT-tjenester og legendariske kjøkkenfester.",
    "hint": "Høye boligblokker kledd i trepanel, fylt av studenter og sykler.",
    "image": "assets/locations/moholt_studentby.jpg"
  },
  {
    "id": "st_olavs_oya",
    "title": "File:St. Olavs Hospital, Kunnskapssenteret (01).jpg",
    "name": "Kunnskapssenteret (Campus Øya)",
    "campus": "Øya",
    "coords": [
      63.4215,
      10.3876
    ],
    "lore": "Kunnskapssenteret binder NTNUs medisinske fakultet sammen med St. Olavs hospital. Her arbeider leger, forskere og nobelprismiljøet ved Kavli-instituttet.",
    "hint": "Toppmoderne glass- og stålarkitektur ved sykehuset på Øya.",
    "image": "assets/locations/st_olavs_oya.jpg"
  },
  {
    "id": "hovedbygningen_ost",
    "title": "File:Hovedbygningen NTNU østfløyen.jpg",
    "name": "Hovedbygningen (Østfløyen)",
    "campus": "Gløshaugen",
    "coords": [
      63.4191,
      10.4035
    ],
    "lore": "Baksiden og østfløyen av Hovedbygningen, med de karakteristiske middelalder-inspirerte granittveggene og tårnene.",
    "hint": "Baksiden av granittkjempen sett fra øst.",
    "image": "assets/locations/hovedbygningen_ost.jpg"
  },
  {
    "id": "realfagbygget_interior",
    "title": "File:NTNU UB Real interior 2.jpg",
    "name": "Realfagbygget (Biblioteket & Glassgården)",
    "campus": "Gløshaugen",
    "coords": [
      63.41584,
      10.40625
    ],
    "lore": "Inne i Realfagbygget med store overlys og studieplasser. Et favorittsted for matte-, fysikk- og informatikkstudenter på Gløshaugen.",
    "hint": "Moderne lyst interiør i Gløshaugens største bygning.",
    "image": "assets/locations/realfagbygget_interior.jpg"
  },
  {
    "id": "gamle_elektro",
    "title": "File:Gamle elektro NTNU.JPG",
    "name": "Gamle Elektro",
    "campus": "Gløshaugen",
    "coords": [
      63.41795,
      10.4039
    ],
    "lore": "Gamle Elektro sto ferdig i 1910 i tegl og granitt. Sammen med Hovedbygningen og Gamle Kjemi utgjør dette NTHs opprinnelige campus-trio.",
    "hint": "Historisk teglsteinsfasade ved siden av lokomotivet Ohma Electra.",
    "image": "assets/locations/gamle_elektro.jpg"
  },
  {
    "id": "elgeseter_bru",
    "title": "File:Elgeseter bru Trondheim 2022-08-18 01.jpg",
    "name": "Elgeseter bru (mot Samfundet)",
    "campus": "Samfundet",
    "coords": [
      63.42435,
      10.3957
    ],
    "lore": "Hovedåren mellom Midtbyen og Gløshaugen! Tusenvis av studenter sykler og går over Nidelva her hver eneste dag på vei til forelesninger og Samfundet.",
    "hint": "Bro over Nidelva med utsikt sørover mot Samfundet og Gløshaugen-høyden.",
    "image": "assets/locations/elgeseter_bru.jpg"
  },
  {
    "id": "tyholttaarnet",
    "title": "File:Tyholttårnet i Trondheim 2021.jpg",
    "name": "Tyholttårnet (ved Marinteknisk)",
    "campus": "Tyholt",
    "coords": [
      63.4225,
      10.4318
    ],
    "lore": "Det 124 meter høye telekommunikasjons- og utsiktstårnet på Tyholt, rett ved NTNUs marintekniske senter. Kjent for Egon-restauranten som roterer 360 grader!",
    "hint": "Høyt tårn med roterende kuppel på Tyholt-høyden.",
    "image": "assets/locations/tyholttaarnet.jpg"
  },
  {
    "id": "gloshaugen_utsikt",
    "title": "File:Kristiansten festning - utsikt mot NTNU, 2023.jpg",
    "name": "Utsikt mot NTNU Gløshaugen",
    "campus": "Gløshaugen",
    "coords": [
      63.4272,
      10.4115
    ],
    "lore": "Den klassiske Trondheims-utsikten mot NTNU Gløshaugen og Hovedbygningen som troner stolt over byens skyline.",
    "hint": "Panoramautsikt over Gløshaugen-platået og Hovedbygningen fra nordøst.",
    "image": "assets/locations/gloshaugen_utsikt.jpg"
  }
];

const NTNU_CAMPUS_PRESETS = [
  { name: Gløshaugen, coords: [63.4184, 10.4032], zoom: 16 },
  { name: Samfundet, coords: [63.4225, 10.3953], zoom: 17 },
  { name: Dragvoll, coords: [63.4087, 10.4704], zoom: 16 },
  { name: Tyholt, coords: [63.4198, 10.4278], zoom: 16 },
  { name: Øya, coords: [63.4215, 10.3876], zoom: 16 },
  { name: Kalvskinnet, coords: [63.4289, 10.3872], zoom: 16 },
  { name: Moholt, coords: [63.4124, 10.4343], zoom: 16 }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { NTNU_LOCATIONS, NTNU_CAMPUS_PRESETS };
}
