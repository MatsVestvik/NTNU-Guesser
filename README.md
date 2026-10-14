# 📍 NTNU Guesser

Et interaktivt nettleserspill inspirert av GeoGuessr – dedikert **100% til NTNUs campuser** i Trondheim!

![NTNU Guesser](assets/locations/hovedbygningen_front.jpg)

---

## 🌟 Funksjoner

- **🎯 Ekte NTNU-lokasjoner**: 17 håndplukkede, høyoppløselige lokasjoner på tvers av:
  - **Campus Gløshaugen**: Hovedbygningen (front & øst), Realfagbygget (eksteriør & interiør), Sentralbygg 1 / Stripa, Gamle Fysikk, Gamle Kjemi, Gamle Elektro, Kjelhuset, Dødens Dal og lokomotivet Ohma Electra!
  - **Campus Dragvoll**: Paviljongene, Gata og utsikten over åkrene.
  - **Studentersamfundet i Trondhjem**: Det Røde Runde Huset ved Elgeseter bru.
  - **Campus Tyholt**: Marinteknisk senter, biblioteket og skipstanken.
  - **Campus Kalvskinnet**: Historiske Gunnerusbiblioteket.
  - **Campus Øya**: Kunnskapssenteret ved St. Olavs hospital.
  - **Moholt Studentby**: Massivtre-tårnene på Moholt Allmenning.
- **🧭 360° / Panoramavisning**:
  - Klikk og dra for å se deg rundt med realistisk fysikk og bevegelsestreghet.
  - Rullehjul / knapper for zoom (1x til 3.5x for å lese skilt og bygningskoder).
  - Levende kompassnål som roterer i sanntid etter synsfeltet ditt.
  - Hint-knapp med kryptiske campus-gåter hvis du står fast.
- **🗺️ Interaktivt Minikart**:
  - Bygget med Leaflet.
  - Bytte mellom høyoppløselig satellittbilde og detaljert gatekart.
  - **Hurtighopp-knapper**: Klikk på *Gløs*, *Dragvoll*, *Samfundet*, *Tyholt*, *Øya*, *Kalvskinnet* eller *Moholt* for å fly direkte til riktig campus!
- **⚡ Poengberegning & Matematikk**:
  - Geodetisk avstandsberegning (Haversine-formel).
  - Skalert eksponensiell GeoGuessr-kurve tilpasset campusmålestokk (opptil 5 000 poeng per runde, 25 000 totalt).
  - Perfekt treff innen 15 meter gir 5 000 poeng!
- **🎓 NTNU-Grad & Titler**:
  - `24 000 - 25 000`: Sivilingeniør i NTNU-geografi 🎓👑
  - `20 000 - 23 999`: Mastergrad i Stripa & Samfundet-Høvding 🌟
  - `15 000 - 19 999`: Bachelorgrad i Campus-Orientering 🗺️
  - `10 000 - 14 999`: Forvillet Førsteklassing på jakt etter R1 🎒
  - `< 10 000`: Tok linje 3 til feil ende av byen 🚌💨
- **🔊 Syntetisert Lyddesign (Web Audio API)**:
  - Klikkelyder, nålplassering, spenningseffekter, poengtellere og seiersfanfarer generert direkte i nettleseren uten eksterne lydfiler.
- **📋 Deling & Konfetti**:
  - Visuell oppsummering av alle 5 runder med linjer og markører.
  - Emoji-grid for enkel deling i Discord, Slack eller sosiale medier.
  - Feiring med konfettikanon ved fullført spill.

---

## 🚀 Hvordan starte spillet lokalt

### Alternativ 1: Python-server (Anbefalt)
Kjør den inkluderte Python-serveren:
```bash
python3 server.py
```
Åpne deretter nettleseren på:
👉 **[http://localhost:8080](http://localhost:8080)**

For å åpne nettleseren automatisk:
```bash
python3 server.py --open
```

### Alternativ 2: Direkte i nettleseren
Du kan også åpne [index.html](file:///home/mats/Prosjekter/NTNU-Guesser/index.html) direkte i favorittnettleseren din!

---

## 🎮 Spillmoduser

1. **Alle Campuser**: Lokasjoner tilfeldig trukket fra Gløshaugen, Dragvoll, Samfundet, Kalvskinnet, Tyholt, Øya og Moholt.
2. **Kun Gløshaugen**: Eksklusivt fokus på Gløshaugens klassiske og hemmelige hjørner.
3. **Valgfri Timer**:
   - Ingen tidsfrist (Chille og utforske)
   - 60 sekunder per runde
   - 30 sekunder (Speedrun for proffer)

---

## 🛠️ Teknologistakk

- **HTML5 & Vanilla JavaScript (ES6+)**: Rask, lettvektig og fri for tunge rammeverk.
- **Vanilla CSS3**: Glassmorphism, CSS Custom Properties og flytende mikromotstand.
- **Leaflet.js**: Interaktivt kart med Esri Satellite og CartoDB Voyager.
- **Web Audio API**: Prosedyrisk lydsyntese i sanntid.
- **HTML5 Canvas**: Konfetti-partikkelsystem.