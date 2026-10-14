/**
 * NTNU Guesser - Interactive Leaflet Map Controller
 * Manages guess placement, satellite/street tile layers, campus navigation, animations and line drawing.
 */
class GameMap {
  constructor(mapContainerId, options = {}) {
    this.containerId = mapContainerId;
    this.map = null;
    this.guessMarker = null;
    this.targetMarker = null;
    this.connectionLine = null;
    this.recapLayers = [];
    this.currentTileLayer = null;
    this.layerMode = 'satellite'; // 'satellite' or 'streets'
    this.onPinPlacedCallback = options.onPinPlaced || null;

    this.initMap();
  }

  initMap() {
    const el = document.getElementById(this.containerId);
    if (!el || typeof L === 'undefined') return;

    // Default to NTNU Gløshaugen center
    this.map = L.map(this.containerId, {
      center: [63.4184, 10.4032],
      zoom: 15,
      minZoom: 12,
      maxZoom: 19,
      zoomControl: false,
      attributionControl: false
    });

    // Custom modern zoom controls
    L.control.zoom({ position: 'topleft' }).addTo(this.map);

    // Setup Tile Layers
    this.satelliteLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 19,
        attribution: 'Esri, Maxar, Earthstar Geographics'
      }
    );

    this.streetLayer = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      {
        maxZoom: 19,
        subdomains: 'abcd',
        attribution: '&copy; OpenStreetMap &copy; CARTO'
      }
    );

    // Default to satellite layer for high visual fidelity of campus buildings
    this.setLayer('satellite');

    // Map click handler for placing guess pin
    this.map.on('click', (e) => {
      this.placeGuessPin(e.latlng);
    });

    // Invalidate map size when expanded
    setTimeout(() => {
      this.map.invalidateSize();
    }, 200);
  }

  setLayer(mode) {
    if (!this.map) return;
    if (this.currentTileLayer) {
      this.map.removeLayer(this.currentTileLayer);
    }
    if (mode === 'streets') {
      this.currentTileLayer = this.streetLayer;
      this.layerMode = 'streets';
    } else {
      this.currentTileLayer = this.satelliteLayer;
      this.layerMode = 'satellite';
    }
    this.currentTileLayer.addTo(this.map);
  }

  toggleLayer() {
    const newMode = this.layerMode === 'satellite' ? 'streets' : 'satellite';
    this.setLayer(newMode);
    return newMode;
  }

  createPinIcon(type = 'guess', number = null) {
    const isGuess = type === 'guess';
    const color = isGuess ? '#0070F3' : '#10B981';
    const glow = isGuess ? 'rgba(0, 112, 243, 0.5)' : 'rgba(16, 185, 129, 0.5)';
    const text = number !== null ? number : (isGuess ? '?' : '★');

    const svgHtml = `
      <div class="custom-map-pin ${type}">
        <div class="pin-pulse" style="border-color: ${color};"></div>
        <svg width="34" height="44" viewBox="0 0 34 44" fill="none" xmlns="http://www.w3.org/2000/svg">
          <filter id="shadow-${type}" x="-10" y="-10" width="54" height="64" filterUnits="userSpaceOnUse">
            <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="black" flood-opacity="0.4"/>
          </filter>
          <path d="M17 0C7.61 0 0 7.61 0 17C0 27.5 14.5 42.5 16.1 43.8C16.6 44.2 17.4 44.2 17.9 43.8C19.5 42.5 34 27.5 34 17C34 7.61 26.39 0 17 0Z" 
                fill="${color}" filter="url(#shadow-${type})"/>
          <circle cx="17" cy="16" r="10" fill="#FFFFFF"/>
          <text x="17" y="20.5" font-size="12" font-family="'Plus Jakarta Sans', sans-serif" font-weight="bold" 
                fill="${color}" text-anchor="middle">${text}</text>
        </svg>
      </div>
    `;

    return L.divIcon({
      html: svgHtml,
      className: 'pin-icon-wrapper',
      iconSize: [34, 44],
      iconAnchor: [17, 44],
      popupAnchor: [0, -44]
    });
  }

  placeGuessPin(latlng) {
    if (!this.map) return;

    if (this.guessMarker) {
      this.guessMarker.setLatLng(latlng);
    } else {
      this.guessMarker = L.marker(latlng, {
        icon: this.createPinIcon('guess'),
        draggable: true
      }).addTo(this.map);

      this.guessMarker.on('dragend', (e) => {
        if (this.onPinPlacedCallback) {
          this.onPinPlacedCallback(e.target.getLatLng());
        }
      });
    }

    if (typeof soundManager !== 'undefined') {
      soundManager.playPinDrop();
    }

    if (this.onPinPlacedCallback) {
      this.onPinPlacedCallback(latlng);
    }
  }

  getGuessCoords() {
    return this.guessMarker ? this.guessMarker.getLatLng() : null;
  }

  flyToCampus(coords, zoom = 16) {
    if (!this.map) return;
    this.map.flyTo(coords, zoom, {
      duration: 0.9,
      easeLinearity: 0.25
    });
  }

  showRoundResult(guessCoords, targetCoords, locationName) {
    if (!this.map) return;

    // Remove any previous target marker and line
    if (this.targetMarker) this.map.removeLayer(this.targetMarker);
    if (this.connectionLine) this.map.removeLayer(this.connectionLine);

    // Place Target Marker
    this.targetMarker = L.marker(targetCoords, {
      icon: this.createPinIcon('target')
    }).addTo(this.map);

    this.targetMarker.bindPopup(`<b>${locationName}</b><br><small>Riktig plassering</small>`).openPopup();

    // Draw connection line
    if (guessCoords) {
      this.connectionLine = L.polyline([guessCoords, targetCoords], {
        color: '#FFB703',
        weight: 4,
        dashArray: '8, 8',
        lineCap: 'round',
        opacity: 0.95
      }).addTo(this.map);

      // Fit both points in view
      const bounds = L.latLngBounds([guessCoords, targetCoords]);
      this.map.fitBounds(bounds, {
        padding: [60, 60],
        maxZoom: 17,
        animate: true,
        duration: 1.0
      });
    } else {
      // If timed out without guess
      this.map.flyTo(targetCoords, 17, { duration: 1.0 });
    }
  }

  showAllRecap(rounds) {
    if (!this.map) return;
    this.clearAll();

    const allPoints = [];

    rounds.forEach((round, idx) => {
      const roundNum = idx + 1;
      const tCoords = round.target.coords;
      allPoints.push(tCoords);

      // Target pin
      const tMarker = L.marker(tCoords, {
        icon: this.createPinIcon('target', roundNum)
      }).addTo(this.map);
      tMarker.bindPopup(`<b>Runde ${roundNum}: ${round.target.name}</b><br>Score: ${round.score} poeng`);
      this.recapLayers.push(tMarker);

      if (round.guessCoords) {
        allPoints.push(round.guessCoords);
        const gMarker = L.marker(round.guessCoords, {
          icon: this.createPinIcon('guess', roundNum)
        }).addTo(this.map);
        this.recapLayers.push(gMarker);

        const line = L.polyline([round.guessCoords, tCoords], {
          color: round.score >= 4000 ? '#10B981' : (round.score >= 2000 ? '#FFB703' : '#EF4444'),
          weight: 3,
          dashArray: '6, 6',
          opacity: 0.9
        }).addTo(this.map);
        this.recapLayers.push(line);
      }
    });

    if (allPoints.length > 0) {
      const bounds = L.latLngBounds(allPoints);
      this.map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 16,
        animate: true,
        duration: 1.0
      });
    }
  }

  clearRound() {
    if (!this.map) return;
    if (this.guessMarker) {
      this.map.removeLayer(this.guessMarker);
      this.guessMarker = null;
    }
    if (this.targetMarker) {
      this.map.removeLayer(this.targetMarker);
      this.targetMarker = null;
    }
    if (this.connectionLine) {
      this.map.removeLayer(this.connectionLine);
      this.connectionLine = null;
    }
    // Return to default Gløshaugen view
    this.map.setView([63.4184, 10.4032], 15);
  }

  clearAll() {
    this.clearRound();
    this.recapLayers.forEach(layer => this.map.removeLayer(layer));
    this.recapLayers = [];
  }

  invalidate() {
    if (this.map) {
      this.map.invalidateSize();
    }
  }
}
