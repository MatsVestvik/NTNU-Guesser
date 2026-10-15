/**
 * NTNU Guesser - Campus Locations Database
 */
const NTNU_LOCATIONS = [
  {
    "id": "hovedbygningen_front",
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
  { name: "Gløshaugen", coords: [63.417529697233995, 10.403950652027472], zoom: 16 },
  { name: "Dragvoll", coords: [63.408216307787384, 10.469540230705926], zoom: 16 },
  { name: "Tyholt", coords: [63.42303796487462, 10.4331276389853], zoom: 16 },
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { NTNU_LOCATIONS, NTNU_CAMPUS_PRESETS };
}
