# 📍 NTNU Guesser - Daily Challenge & Felles Leaderboard

Et interaktivt nettleserspill inspirert av GeoGuessr – dedikert **100% til NTNUs campuser** i Trondheim!

![NTNU Guesser](assets/locations/hovedbygningen_front.jpg)

---

## 🌟 Funksjoner

- **📅 Dagens Utfordring (Daily Challenge)**:
  - 5 nye håndplukkede NTNU-bilder hver eneste dag ved midnatt.
  - Deterministisk generert via dato-seedet PRNG: **alle spillere får nøyaktig de samme 5 bildene** på samme dag!
  - Nedtelling til neste daglige utfordring.
- **🏷️ Display Name & Profil**:
  - Skriv inn ditt kallenavn/visningsnavn før runden starter.
  - Huskes automatisk i nettleseren og registreres direkte på leaderboarden.
- **🏆 Felles Leaderboard (SQLite-backed API)**:
  - **Dagens Toppliste**: Se hvem som leder dagens utfordring i sanntid.
  - **All-Time Hall of Fame**: De beste poengsummene noensinne.
  - Rangeringsmedaljer (🥇 1. plass, 🥈 2. plass, 🥉 3. plass), poengsum, totalt avvik i meter, og tidsstempel.
  - Eget bruker-highlight («DEG») slik at du ser akkurat hvor du plasserer deg.
- **🎯 NTNU-lokasjoner**:
  - Testsett med 5 utvalgte lokasjoner (Gløshaugen, Samfundet, Dragvoll).
- **🧭 360° / Panoramavisning**:
  - Klikk og dra for å se deg rundt med realistisk fysikk og bevegelsestreghet.
  - Rullehjul / knapper for zoom (1x til 3.5x for å lese skilt og bygningskoder).
  - Levende kompassnål som roterer i sanntid etter synsfeltet ditt.
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
  - Klikkelyder, nålplassering, spenningseffekter, poengtellere og seiersfanfarer generert direkte i nettleseren.
- **📋 Deling & Konfetti**:
  - Resultat-delig med Wordle/GeoGuessr emoji-grid for Discord, Slack og sosiale medier.
  - Feiring med konfettikanon ved fullført runde.

---

## 🚀 Hvordan starte spillet lokalt

Start Python-serveren som håndterer både spillet og Leaderboard-API-et:
```bash
python3 server.py
```
Åpne deretter i nettleseren:
👉 **[http://localhost:8080](http://localhost:8080)**

For å åpne nettleseren automatisk:
```bash
python3 server.py --open
```

---

## 🎮 Spillmoduser

1. **📅 Dagens Utfordring (Daily Challenge)**:
   - 5 felles lokasjoner valgt ut for dagen.
   - Poengsummen din registreres på dagens felles leaderboard med ditt kallenavn!
2. **🎯 Øvingsmodus (Practice)**:
   - Ubegrenset fri trening med tilfeldige lokasjoner for å finpusse campuskunnskapene.

---

## 🛠️ Teknologistakk

- **Backend**: Python 3 HTTP Server med innebygd SQLite-database (`data/leaderboard.db`) og REST API (`/api/daily`, `/api/leaderboard`, `/api/score`).
- **Frontend**: HTML5, Vanilla JavaScript (ES6+), Vanilla CSS3 med Glassmorphism & Dark Mode.
- **Kart**: Leaflet.js med Esri World Imagery (satellitt) og CartoDB Voyager (gatekart).
- **Lyd**: Web Audio API (prosedural sanntidslyd).