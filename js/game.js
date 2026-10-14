/**
 * NTNU Guesser - Main Game Controller
 * Handles round sequencing, distance & score calculation, timers, UI state, confetti, and sharing.
 */
class NTNUGuesserGame {
  constructor() {
    this.totalRounds = 5;
    this.currentRoundIndex = 0;
    this.currentLocation = null;
    this.roundsData = [];
    this.totalScore = 0;
    this.gameActive = false;

    // Config options
    this.campusFilter = 'all'; // 'all', 'gloshaugen', 'other'
    this.timerDuration = 0; // 0 = no limit, 60, 30
    this.timerRemaining = 0;
    this.timerInterval = null;

    // UI elements
    this.elements = {};
    this.cacheElements();

    // Controllers
    this.viewer = new PanoramaViewer('viewer-container', 'location-image', 'compass-widget');
    this.gameMap = new GameMap('guess-map', {
      onPinPlaced: (coords) => this.handlePinPlaced(coords)
    });

    this.bindEvents();
    this.populateCampusPills();
  }

  cacheElements() {
    this.elements = {
      // Header
      roundDisplay: document.getElementById('round-display'),
      scoreDisplay: document.getElementById('score-display'),
      timerDisplay: document.getElementById('timer-display'),
      timerBadge: document.getElementById('timer-badge'),
      muteBtn: document.getElementById('mute-btn'),
      settingsBtn: document.getElementById('settings-btn'),
      helpBtn: document.getElementById('help-btn'),

      // Controls
      btnZoomIn: document.getElementById('btn-zoom-in'),
      btnZoomOut: document.getElementById('btn-zoom-out'),
      btnResetView: document.getElementById('btn-reset-view'),
      btnFullscreen: document.getElementById('btn-fullscreen'),
      btnHint: document.getElementById('btn-hint'),
      hintBox: document.getElementById('hint-box'),
      hintText: document.getElementById('hint-text'),

      // Map widget
      mapWidget: document.getElementById('map-widget'),
      btnToggleMapSize: document.getElementById('btn-toggle-map-size'),
      btnToggleLayer: document.getElementById('btn-toggle-layer'),
      btnGuess: document.getElementById('btn-guess'),
      campusPillsContainer: document.getElementById('campus-pills'),

      // Modals / Overlays
      startModal: document.getElementById('start-modal'),
      btnStartGame: document.getElementById('btn-start-game'),
      roundResultModal: document.getElementById('round-result-modal'),
      gameOverModal: document.getElementById('game-over-modal'),
      helpModal: document.getElementById('help-modal'),

      // Round Result elements
      resultDistance: document.getElementById('result-distance'),
      resultPoints: document.getElementById('result-points'),
      resultRating: document.getElementById('result-rating'),
      resultLocationName: document.getElementById('result-location-name'),
      resultCampusName: document.getElementById('result-campus-name'),
      resultLore: document.getElementById('result-lore'),
      btnNextRound: document.getElementById('btn-next-round'),

      // Game Over elements
      finalScore: document.getElementById('final-score'),
      finalRankTitle: document.getElementById('final-rank-title'),
      finalRankDesc: document.getElementById('final-rank-desc'),
      recapTableBody: document.getElementById('recap-table-body'),
      btnPlayAgain: document.getElementById('btn-play-again'),
      btnShareScore: document.getElementById('btn-share-score'),
      shareFeedback: document.getElementById('share-feedback'),

      // Config inputs
      filterAll: document.getElementById('filter-all'),
      filterGloshaugen: document.getElementById('filter-gloshaugen'),
      timerNone: document.getElementById('timer-none'),
      timer60: document.getElementById('timer-60'),
      timer30: document.getElementById('timer-30')
    };
  }

  bindEvents() {
    // Start game
    if (this.elements.btnStartGame) {
      this.elements.btnStartGame.addEventListener('click', () => {
        soundManager.playClick();
        this.applySettingsFromModal();
        this.elements.startModal.classList.add('hidden');
        this.startNewGame();
      });
    }

    // Guess button
    if (this.elements.btnGuess) {
      this.elements.btnGuess.addEventListener('click', () => {
        this.submitGuess();
      });
    }

    // Next round
    if (this.elements.btnNextRound) {
      this.elements.btnNextRound.addEventListener('click', () => {
        soundManager.playClick();
        this.elements.roundResultModal.classList.add('hidden');
        if (this.currentRoundIndex < this.totalRounds) {
          this.loadRound(this.currentRoundIndex);
        } else {
          this.showGameOver();
        }
      });
    }

    // Play again
    if (this.elements.btnPlayAgain) {
      this.elements.btnPlayAgain.addEventListener('click', () => {
        soundManager.playClick();
        this.elements.gameOverModal.classList.add('hidden');
        this.startNewGame();
      });
    }

    // Share score
    if (this.elements.btnShareScore) {
      this.elements.btnShareScore.addEventListener('click', () => {
        this.shareScoreToClipboard();
      });
    }

    // Mute toggle
    if (this.elements.muteBtn) {
      this.elements.muteBtn.addEventListener('click', () => {
        const isMuted = soundManager.toggleMute();
        this.updateMuteIcon(isMuted);
      });
      this.updateMuteIcon(soundManager.isMuted());
    }

    // Settings modal reopen
    if (this.elements.settingsBtn) {
      this.elements.settingsBtn.addEventListener('click', () => {
        soundManager.playClick();
        this.elements.startModal.classList.remove('hidden');
      });
    }

    // Help modal toggle
    if (this.elements.helpBtn) {
      this.elements.helpBtn.addEventListener('click', () => {
        soundManager.playClick();
        this.elements.helpModal.classList.toggle('hidden');
      });
    }
    const closeHelpBtn = document.getElementById('btn-close-help');
    if (closeHelpBtn) {
      closeHelpBtn.addEventListener('click', () => {
        soundManager.playClick();
        this.elements.helpModal.classList.add('hidden');
      });
    }

    // Viewport Controls
    if (this.elements.btnZoomIn) {
      this.elements.btnZoomIn.addEventListener('click', () => {
        soundManager.playClick();
        this.viewer.zoomIn();
      });
    }
    if (this.elements.btnZoomOut) {
      this.elements.btnZoomOut.addEventListener('click', () => {
        soundManager.playClick();
        this.viewer.zoomOut();
      });
    }
    if (this.elements.btnResetView) {
      this.elements.btnResetView.addEventListener('click', () => {
        soundManager.playClick();
        this.viewer.resetView();
      });
    }
    if (this.elements.btnFullscreen) {
      this.elements.btnFullscreen.addEventListener('click', () => {
        soundManager.playClick();
        this.toggleFullscreen();
      });
    }

    // Hint toggle
    if (this.elements.btnHint) {
      this.elements.btnHint.addEventListener('click', () => {
        soundManager.playClick();
        if (this.elements.hintBox) {
          const isHidden = this.elements.hintBox.classList.contains('hidden');
          if (isHidden && this.currentLocation) {
            this.elements.hintText.textContent = this.currentLocation.hint;
            this.elements.hintBox.classList.remove('hidden');
          } else {
            this.elements.hintBox.classList.add('hidden');
          }
        }
      });
    }

    // Map size toggle (Pin/Unpin expansion)
    if (this.elements.btnToggleMapSize) {
      this.elements.btnToggleMapSize.addEventListener('click', () => {
        soundManager.playClick();
        this.elements.mapWidget.classList.toggle('pinned-large');
        this.gameMap.invalidate();
      });
    }

    // Map layer toggle (Satellite / Street)
    if (this.elements.btnToggleLayer) {
      this.elements.btnToggleLayer.addEventListener('click', () => {
        soundManager.playClick();
        const mode = this.gameMap.toggleLayer();
        this.elements.btnToggleLayer.title = mode === 'satellite' ? 'Bytt til gatekart' : 'Bytt til satellitt';
      });
    }

    // Keyboard shortcuts: Space to guess, Esc to unpin map
    window.addEventListener('keydown', (e) => {
      if (e.key === ' ' && !this.elements.btnGuess.disabled && this.gameActive) {
        e.preventDefault();
        this.submitGuess();
      } else if (e.key === 'Escape') {
        if (this.elements.mapWidget.classList.contains('pinned-large')) {
          this.elements.mapWidget.classList.remove('pinned-large');
          this.gameMap.invalidate();
        }
        if (this.elements.hintBox) this.elements.hintBox.classList.add('hidden');
      }
    });
  }

  populateCampusPills() {
    if (!this.elements.campusPillsContainer) return;
    this.elements.campusPillsContainer.innerHTML = '';

    NTNU_CAMPUS_PRESETS.forEach(preset => {
      const pill = document.createElement('button');
      pill.className = 'campus-pill';
      pill.textContent = preset.name;
      pill.title = `Gå til ${preset.name}`;
      pill.addEventListener('click', (e) => {
        e.stopPropagation();
        soundManager.playClick();
        this.gameMap.flyToCampus(preset.coords, preset.zoom);
      });
      this.elements.campusPillsContainer.appendChild(pill);
    });
  }

  applySettingsFromModal() {
    // Filter
    if (this.elements.filterGloshaugen && this.elements.filterGloshaugen.checked) {
      this.campusFilter = 'gloshaugen';
    } else {
      this.campusFilter = 'all';
    }

    // Timer
    if (this.elements.timer60 && this.elements.timer60.checked) {
      this.timerDuration = 60;
    } else if (this.elements.timer30 && this.elements.timer30.checked) {
      this.timerDuration = 30;
    } else {
      this.timerDuration = 0;
    }
  }

  startNewGame() {
    this.totalScore = 0;
    this.currentRoundIndex = 0;
    this.roundsData = [];
    this.gameActive = true;

    // Pick 5 random locations based on campusFilter
    let pool = [...NTNU_LOCATIONS];
    if (this.campusFilter === 'gloshaugen') {
      pool = pool.filter(l => l.category === 'gloshaugen');
    }

    // Shuffle pool
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    this.selectedLocations = pool.slice(0, Math.min(this.totalRounds, pool.length));
    this.updateScoreUI();
    this.loadRound(0);
  }

  loadRound(index) {
    this.currentRoundIndex = index;
    this.currentLocation = this.selectedLocations[index];

    // Reset UI state
    this.elements.roundDisplay.textContent = `Runde ${index + 1} / ${this.totalRounds}`;
    this.elements.btnGuess.disabled = true;
    this.elements.btnGuess.classList.remove('ready');
    if (this.elements.hintBox) this.elements.hintBox.classList.add('hidden');

    // Unpin map if enlarged
    this.elements.mapWidget.classList.remove('pinned-large');
    this.gameMap.clearRound();

    // Load photo
    this.viewer.loadLocation(this.currentLocation);

    // Start timer if configured
    this.startTimer();
  }

  startTimer() {
    clearInterval(this.timerInterval);
    if (this.timerDuration <= 0) {
      this.elements.timerBadge.classList.add('hidden');
      return;
    }

    this.elements.timerBadge.classList.remove('hidden');
    this.elements.timerBadge.classList.remove('urgent');
    this.timerRemaining = this.timerDuration;
    this.updateTimerDisplay();

    this.timerInterval = setInterval(() => {
      this.timerRemaining--;
      this.updateTimerDisplay();

      if (this.timerRemaining <= 10 && this.timerRemaining > 0) {
        this.elements.timerBadge.classList.add('urgent');
        soundManager.playTimerUrgent();
      }

      if (this.timerRemaining <= 0) {
        clearInterval(this.timerInterval);
        this.handleTimeOut();
      }
    }, 1000);
  }

  updateTimerDisplay() {
    const mins = Math.floor(this.timerRemaining / 60);
    const secs = this.timerRemaining % 60;
    this.elements.timerDisplay.textContent = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  handlePinPlaced(coords) {
    this.elements.btnGuess.disabled = false;
    this.elements.btnGuess.classList.add('ready');
  }

  submitGuess() {
    if (!this.gameActive) return;
    clearInterval(this.timerInterval);

    const guessCoords = this.gameMap.getGuessCoords();
    if (!guessCoords) return;

    soundManager.playSubmit();

    const targetCoords = {
      lat: this.currentLocation.coords[0],
      lng: this.currentLocation.coords[1]
    };

    const distance = this.calculateDistance(
      guessCoords.lat,
      guessCoords.lng,
      targetCoords.lat,
      targetCoords.lng
    );

    const score = this.calculateScore(distance);
    this.totalScore += score;
    this.updateScoreUI();

    const roundResult = {
      round: this.currentRoundIndex + 1,
      target: this.currentLocation,
      guessCoords: [guessCoords.lat, guessCoords.lng],
      distance: distance,
      score: score
    };
    this.roundsData.push(roundResult);

    // Show on Map
    this.gameMap.showRoundResult(
      [guessCoords.lat, guessCoords.lng],
      [targetCoords.lat, targetCoords.lng],
      this.currentLocation.name
    );

    // Show result popup
    this.showRoundResultModal(roundResult);
  }

  handleTimeOut() {
    if (!this.gameActive) return;

    soundManager.playRoundFinish(0);

    const targetCoords = {
      lat: this.currentLocation.coords[0],
      lng: this.currentLocation.coords[1]
    };

    const roundResult = {
      round: this.currentRoundIndex + 1,
      target: this.currentLocation,
      guessCoords: null,
      distance: null,
      score: 0
    };
    this.roundsData.push(roundResult);

    this.gameMap.showRoundResult(null, [targetCoords.lat, targetCoords.lng], this.currentLocation.name);
    this.showRoundResultModal(roundResult, true);
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth radius in meters
    const phi1 = lat1 * Math.PI / 180;
    const phi2 = lat2 * Math.PI / 180;
    const deltaPhi = (lat2 - lat1) * Math.PI / 180;
    const deltaLambda = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
              Math.cos(phi1) * Math.cos(phi2) *
              Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  calculateScore(distanceInMeters) {
    // If within 15 meters, award exact bullseye: 5000 points!
    if (distanceInMeters <= 15) return 5000;

    // Campus-tuned exponential curve: 5000 * exp(-distance / 800)
    const score = Math.round(5000 * Math.exp(-distanceInMeters / 800));
    return Math.max(0, Math.min(5000, score));
  }

  showRoundResultModal(data, timedOut = false) {
    const isLastRound = this.currentRoundIndex + 1 >= this.totalRounds;
    this.elements.btnNextRound.textContent = isLastRound ? "Se sluttresultat 🏆" : "Neste runde ➔";

    if (timedOut) {
      this.elements.resultDistance.textContent = "Tiden rant ut! ⏰";
      this.elements.resultPoints.textContent = "0 poeng";
      this.elements.resultRating.textContent = "Ingen gjett registrert.";
      this.elements.resultRating.className = "result-badge low";
    } else {
      const distFormatted = data.distance < 1000
        ? `${Math.round(data.distance)} meter`
        : `${(data.distance / 1000).toFixed(2)} km`;
      this.elements.resultDistance.textContent = `${distFormatted} fra målet!`;

      // Animate score counter
      this.animateScoreCounter(data.score, this.elements.resultPoints);

      // Rating badge text
      let ratingText = "";
      let ratingClass = "high";
      if (data.distance <= 20) {
        ratingText = "🌟 Bullseye! Ekte Sivilingeniør-presisjon!";
        ratingClass = "perfect";
      } else if (data.distance <= 75) {
        ratingText = "🎯 Fantastisk treff!";
        ratingClass = "high";
      } else if (data.distance <= 250) {
        ratingText = "👍 Ganske nærme!";
        ratingClass = "medium";
      } else if (data.distance <= 700) {
        ratingText = "🧭 Riktig nabolag, men litt på villspor.";
        ratingClass = "low";
      } else {
        ratingText = "🚌 Tok du feil buss til Dragvoll?";
        ratingClass = "fail";
      }
      this.elements.resultRating.textContent = ratingText;
      this.elements.resultRating.className = `result-badge ${ratingClass}`;

      soundManager.playRoundFinish(data.score);
    }

    // Location Lore
    this.elements.resultLocationName.textContent = data.target.name;
    this.elements.resultCampusName.textContent = `Campus ${data.target.campus}`;
    this.elements.resultLore.textContent = data.target.lore;

    // Show modal
    setTimeout(() => {
      this.elements.roundResultModal.classList.remove('hidden');
    }, 600);
  }

  animateScoreCounter(targetScore, element) {
    const duration = 1200;
    const start = performance.now();
    let tickCount = 0;

    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / duration);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * targetScore);
      element.textContent = `+${current.toLocaleString('no-NO')} poeng`;

      if (progress > (tickCount + 1) * 0.12 && progress < 1) {
        soundManager.playTallyTick(tickCount);
        tickCount++;
      }

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        element.textContent = `+${targetScore.toLocaleString('no-NO')} poeng`;
      }
    };
    requestAnimationFrame(step);
  }

  updateScoreUI() {
    this.elements.scoreDisplay.textContent = `Poeng: ${this.totalScore.toLocaleString('no-NO')}`;
  }

  showGameOver() {
    this.gameActive = false;
    soundManager.playVictory();

    // Trigger confetti
    this.launchConfetti();

    // Total score
    this.elements.finalScore.textContent = `${this.totalScore.toLocaleString('no-NO')} / 25 000`;

    // Calculate degree rank
    let rank = "";
    let desc = "";
    if (this.totalScore >= 24000) {
      rank = "Sivilingeniør i NTNU-geografi 🎓👑";
      desc = "Eksepsjonell innsats! Du kjenner hver eneste brostein, trappegang og auditorium bedre enn rektor selv!";
    } else if (this.totalScore >= 20000) {
      rank = "Mastergrad i Stripa & Samfundet-Høvding 🌟";
      desc = "Imponerende lokalkunnskap! Du navigerer Trondheim på autopilot, selv etter en lang kveld på Bodegaen.";
    } else if (this.totalScore >= 15000) {
      rank = "Bachelorgrad i Campus-Orientering 🗺️";
      desc = "Godt levert! Du finner veien til de fleste forelesninger, men har kanskje unngått krikene og krokene på Tyholt.";
    } else if (this.totalScore >= 10000) {
      rank = "Forvillet Førsteklassing på jakt etter R1 🎒";
      desc = "Helt greit, men du har nok virret en del rundt i Sentralbygg og lurt på hvor heisen ender.";
    } else {
      rank = "Tok linje 3 til feil ende av byen 🚌💨";
      desc = "Du endte visst opp på feil campus... Anbefaler en guidet tur langs Høgskoleringen og et vaffelhjerte på Stripa!";
    }

    this.elements.finalRankTitle.textContent = rank;
    this.elements.finalRankDesc.textContent = desc;

    // Populate Recap Table
    this.elements.recapTableBody.innerHTML = '';
    this.roundsData.forEach(r => {
      const tr = document.createElement('tr');
      const distStr = r.distance !== null
        ? (r.distance < 1000 ? `${Math.round(r.distance)} m` : `${(r.distance / 1000).toFixed(2)} km`)
        : 'Tidsavbrudd';
      tr.innerHTML = `
        <td><img src="${r.target.image}" class="recap-thumb" alt="${r.target.name}"></td>
        <td><strong>${r.target.name}</strong><br><small>${r.target.campus}</small></td>
        <td>${distStr}</td>
        <td><span class="score-pill">${r.score.toLocaleString('no-NO')}</span></td>
      `;
      this.elements.recapTableBody.appendChild(tr);
    });

    // Show All on Recap Map
    this.gameMap.showAllRecap(this.roundsData);

    this.elements.gameOverModal.classList.remove('hidden');
  }

  shareScoreToClipboard() {
    const rankTitle = this.elements.finalRankTitle.textContent;
    let emojiRounds = "";

    this.roundsData.forEach(r => {
      let icon = "🟩";
      if (!r.guessCoords) icon = "🟥";
      else if (r.score >= 4500) icon = "🟩";
      else if (r.score >= 3500) icon = "🟨";
      else if (r.score >= 2000) icon = "🟧";
      else icon = "🟥";

      const dist = r.distance !== null
        ? (r.distance < 1000 ? `${Math.round(r.distance)}m` : `${(r.distance/1000).toFixed(1)}km`)
        : '0m';
      emojiRounds += `\n${icon} Runde ${r.round}: ${r.score} poeng (${dist})`;
    });

    const shareText = `📍 NTNU GUESSER\nScore: ${this.totalScore.toLocaleString('no-NO')} / 25 000\nTittel: ${rankTitle}${emojiRounds}\n\nSpill nå: NTNU-Guesser!`;

    navigator.clipboard.writeText(shareText).then(() => {
      this.elements.shareFeedback.textContent = "Kopiert til utklippstavlen! 📋";
      this.elements.shareFeedback.classList.remove('hidden');
      setTimeout(() => {
        this.elements.shareFeedback.classList.add('hidden');
      }, 3000);
    }).catch(err => {
      prompt("Kopier resultatet ditt her:", shareText);
    });
  }

  launchConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#0070F3', '#10B981', '#FFB703', '#EF4444', '#EC4899', '#8B5CF6'];

    for (let i = 0; i < 120; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height * 0.4,
        vx: (Math.random() - 0.5) * 14,
        vy: (Math.random() - 0.7) * 16,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        vr: (Math.random() - 0.5) * 10,
        opacity: 1
      });
    }

    let frame = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // Gravity
        p.rotation += p.vr;
        p.opacity -= 0.007;

        if (p.opacity > 0) {
          alive = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
          ctx.restore();
        }
      });

      frame++;
      if (alive && frame < 200) {
        requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
    requestAnimationFrame(animate);
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  }

  updateMuteIcon(isMuted) {
    if (!this.elements.muteBtn) return;
    this.elements.muteBtn.innerHTML = isMuted
      ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>`
      : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>`;
    this.elements.muteBtn.title = isMuted ? 'Slå på lyd' : 'Slå av lyd';
  }
}

// Global initialization
window.addEventListener('DOMContentLoaded', () => {
  window.game = new NTNUGuesserGame();
});
