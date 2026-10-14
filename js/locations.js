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
    "image": "assets/locations/dragvoll_campus.jpg"
  }
];

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
