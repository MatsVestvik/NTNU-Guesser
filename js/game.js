/**
 * NTNU Guesser - Main Game Controller
 * Simplified Flow: Enter Name (Start button disabled until valid) -> 5 Daily Locations -> Normal Distribution Curve & Leaderboard Placement.
 */

// ==========================================
// Deterministic Daily Seed & PRNG Utilities
// ==========================================
function getDailySeed(dateStr) {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = Math.imul(31, hash) + dateStr.charCodeAt(i) | 0;
  }
  return hash;
}

function mulberry32(a) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function getDailyLocations(dateStr, count = 5) {
  const seed = getDailySeed(dateStr);
  const rng = mulberry32(seed);
  const pool = [...NTNU_LOCATIONS];

  // Deterministic Fisher-Yates shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

// Gaussian CDF approximation (Abramowitz & Stegun formula)
function normalCDF(score, mean = 16500, std = 4000) {
  const z = (score - mean) / (std * Math.SQRT2);
  const a1 =  0.254829592;
  const a2 = -0.284496736;
  const a3 =  1.421413741;
  const a4 = -1.453152027;
  const a5 =  1.061405429;
  const p  =  0.3275911;

  const sign = z >= 0 ? 1 : -1;
  const absZ = Math.abs(z);
  const t = 1.0 / (1.0 + p * absZ);
  const erf = sign * (1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absZ * absZ));
  return 0.5 * (1.0 + erf);
}

// ==========================================
// Bell Curve (Normalfordelt Kurve) Canvas Renderer
// ==========================================
function drawBellCurve(canvas, playerScore, percentile, allScores = []) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();

  const w = rect.width > 50 ? rect.width : 640;
  const h = rect.height > 50 ? rect.height : 200;

  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx.scale(dpr, dpr);

  ctx.clearRect(0, 0, w, h);

  const paddingLeft = 45;
  const paddingRight = 45;
  const paddingTop = 35;
  const paddingBottom = 35;

  const plotW = w - paddingLeft - paddingRight;
  const plotH = h - paddingTop - paddingBottom;

  const minScore = 0;
  const maxScore = 25000;
  const mean = 16500;
  const std = 4000;

  function gaussian(x) {
    const z = (x - mean) / std;
    return Math.exp(-0.5 * z * z);
  }

  const clampedScore = Math.max(0, Math.min(maxScore, playerScore));
  const playerX = paddingLeft + (clampedScore / maxScore) * plotW;
  const playerYVal = gaussian(clampedScore);
  const playerCanvasY = paddingTop + plotH - (playerYVal * (plotH * 0.88));

  // 1. Background Curve fill (subtle dark slate)
  ctx.beginPath();
  ctx.moveTo(paddingLeft, paddingTop + plotH);
  for (let x = 0; x <= plotW; x += 3) {
    const scoreVal = minScore + (x / plotW) * maxScore;
    const yVal = gaussian(scoreVal);
    const canvasY = paddingTop + plotH - (yVal * (plotH * 0.88));
    ctx.lineTo(paddingLeft + x, canvasY);
  }
  ctx.lineTo(paddingLeft + plotW, paddingTop + plotH);
  ctx.closePath();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.fill();

  // 2. Highlighted area under curve from 0 up to Player's Score
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, playerX, h);
  ctx.clip();

  ctx.beginPath();
  ctx.moveTo(paddingLeft, paddingTop + plotH);
  for (let x = 0; x <= plotW; x += 3) {
    const scoreVal = minScore + (x / plotW) * maxScore;
    const yVal = gaussian(scoreVal);
    const canvasY = paddingTop + plotH - (yVal * (plotH * 0.88));
    ctx.lineTo(paddingLeft + x, canvasY);
  }
  ctx.lineTo(paddingLeft + plotW, paddingTop + plotH);
  ctx.closePath();

  ctx.fillStyle = 'rgba(0, 80, 158, 0.35)';
  ctx.fill();
  ctx.restore();

  // 3. Crisp Clean Curve Outline
  ctx.beginPath();
  for (let x = 0; x <= plotW; x += 3) {
    const scoreVal = minScore + (x / plotW) * maxScore;
    const yVal = gaussian(scoreVal);
    const canvasY = paddingTop + plotH - (yVal * (plotH * 0.88));
    if (x === 0) ctx.moveTo(paddingLeft + x, canvasY);
    else ctx.lineTo(paddingLeft + x, canvasY);
  }
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#38BDF8';
  ctx.shadowBlur = 0;
  ctx.stroke();

  // 4. Baseline
  ctx.beginPath();
  ctx.moveTo(paddingLeft, paddingTop + plotH);
  ctx.lineTo(paddingLeft + plotW, paddingTop + plotH);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // 5. Vertical Dashed Marker Line at Player Score
  ctx.beginPath();
  ctx.setLineDash([4, 4]);
  ctx.moveTo(playerX, paddingTop + plotH);
  ctx.lineTo(playerX, playerCanvasY);
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.setLineDash([]);

  // 6. Marker Dot at Curve for this Score
  ctx.beginPath();
  ctx.arc(playerX, playerCanvasY, 5.5, 0, Math.PI * 2);
  ctx.fillStyle = '#F59E0B';
  ctx.fill();
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  ctx.stroke();

  // 7. Floating Pin Badge above Marker
  const tagText = `Din score: ${playerScore.toLocaleString('no-NO')} p`;
  ctx.font = '600 12px "Plus Jakarta Sans", sans-serif';
  const tagW = ctx.measureText(tagText).width + 16;
  const tagH = 26;
  const tagX = Math.max(paddingLeft, Math.min(w - paddingRight - tagW, playerX - tagW / 2));
  const tagY = Math.max(6, playerCanvasY - 34);

  ctx.fillStyle = '#0F172A';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(tagX, tagY, tagW, tagH, 6);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(tagText, tagX + tagW / 2, tagY + tagH / 2);

  // 8. Axis Labels
  ctx.font = '11px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#94A3B8';
  ctx.textBaseline = 'top';

  const axisPoints = [
    { label: '0 p', frac: 0, align: 'left' },
    { label: '5k', frac: 5000 / 25000, align: 'center' },
    { label: '10k', frac: 10000 / 25000, align: 'center' },
    { label: '16.5k (Snitt)', frac: 16500 / 25000, align: 'center' },
    { label: '20k', frac: 20000 / 25000, align: 'center' },
    { label: '25k p', frac: 1, align: 'right' }
  ];

  axisPoints.forEach(pt => {
    ctx.textAlign = pt.align;
    const axX = paddingLeft + pt.frac * plotW;
    ctx.fillText(pt.label, axX, paddingTop + plotH + 8);
  });
}

// ==========================================
// NTNUGuesserGame Main Class
// ==========================================
class NTNUGuesserGame {
  constructor() {
    this.totalRounds = 5;
    this.currentRoundIndex = 0;
    this.currentLocation = null;
    this.roundsData = [];
    this.totalScore = 0;
    this.gameActive = false;

    // Daily & Player state
    this.gameMode = 'daily'; // 'daily' or 'practice'
    this.todayDate = new Date().toISOString().split('T')[0];
    this.dayNumber = 1;
    this.secondsUntilMidnight = 0;
    this.playerName = localStorage.getItem('ntnu_player_name') || '';
    this.percentile = 50;
    this.rank = 1;
    this.allScores = [];

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
    this.initDailyGame();
  }

  cacheElements() {
    this.elements = {
      // Header
      dailyDateSubtitle: document.getElementById('daily-date-subtitle'),
      roundDisplay: document.getElementById('round-display'),
      scoreDisplay: document.getElementById('score-display'),
      playerHudPill: document.getElementById('player-hud-pill'),
      playerHudName: document.getElementById('player-hud-name'),
      headerLeaderboardBtn: document.getElementById('header-leaderboard-btn'),
      muteBtn: document.getElementById('mute-btn'),
      helpBtn: document.getElementById('help-btn'),

      // Controls
      btnZoomIn: document.getElementById('btn-zoom-in'),
      btnZoomOut: document.getElementById('btn-zoom-out'),
      btnResetView: document.getElementById('btn-reset-view'),
      btnFullscreen: document.getElementById('btn-fullscreen'),

      // Map widget
      mapWidget: document.getElementById('map-widget'),
      btnToggleMapSize: document.getElementById('btn-toggle-map-size'),
      btnToggleLayer: document.getElementById('btn-toggle-layer'),
      btnGuess: document.getElementById('btn-guess'),
      campusPillsContainer: document.getElementById('campus-pills'),

      // Simplified Start Modal
      startModal: document.getElementById('start-modal'),
      playerDisplaynameInput: document.getElementById('player-displayname'),
      btnStartGame: document.getElementById('btn-start-game'),
      btnViewLeaderboardModal: document.getElementById('btn-view-leaderboard-modal'),

      // Dedicated Leaderboard Modal
      leaderboardModal: document.getElementById('leaderboard-modal'),
      btnCloseLeaderboard: document.getElementById('btn-close-leaderboard'),
      tabDailyLeaderboard: document.getElementById('tab-daily-leaderboard'),
      tabAlltimeLeaderboard: document.getElementById('tab-alltime-leaderboard'),
      tabDateLabel: document.getElementById('tab-date-label'),
      leaderboardTableBody: document.getElementById('leaderboard-table-body'),
      clockCountdown: document.getElementById('clock-countdown'),
      btnPlayFromLeaderboard: document.getElementById('btn-play-from-leaderboard'),

      // Round Result Modal
      roundResultModal: document.getElementById('round-result-modal'),
      resultDistance: document.getElementById('result-distance'),
      resultPoints: document.getElementById('result-points'),
      resultRating: document.getElementById('result-rating'),
      resultLocationName: document.getElementById('result-location-name'),
      resultCampusName: document.getElementById('result-campus-name'),
      btnNextRound: document.getElementById('btn-next-round'),

      // Game Over: Bell Curve & Leaderboard
      gameOverModal: document.getElementById('game-over-modal'),
      finalScore: document.getElementById('final-score'),
      finalRankTitle: document.getElementById('final-rank-title'),
      finalRankDesc: document.getElementById('final-rank-desc'),
      percentileValue: document.getElementById('percentile-value'),
      percentileSubtext: document.getElementById('percentile-subtext'),
      rankValue: document.getElementById('rank-value'),
      bellCurveCanvas: document.getElementById('bell-curve-canvas'),
      tabGameoverLeaderboard: document.getElementById('tab-gameover-leaderboard'),
      tabGameoverRecap: document.getElementById('tab-gameover-recap'),
      gameoverLeaderboardSection: document.getElementById('gameover-leaderboard-section'),
      gameoverRecapSection: document.getElementById('gameover-recap-section'),
      gameoverLeaderboardBody: document.getElementById('gameover-leaderboard-body'),
      recapTableBody: document.getElementById('recap-table-body'),
      btnShareScore: document.getElementById('btn-share-score'),
      btnExploreRecapMap: document.getElementById('btn-explore-recap-map'),
      btnPlayAgain: document.getElementById('btn-play-again'),
      btnBackToSummary: document.getElementById('btn-back-to-summary'),
      shareFeedback: document.getElementById('share-feedback'),

      // Help Modal
      helpModal: document.getElementById('help-modal'),
      btnCloseHelp: document.getElementById('btn-close-help')
    };
  }

  async initDailyGame() {
    // Check saved name and set input
    if (this.elements.playerDisplaynameInput) {
      if (this.playerName) {
        this.elements.playerDisplaynameInput.value = this.playerName;
        this.updateStartButtonState();
        this.updatePlayerHudName();
      }
    }

    // Fetch daily info from backend
    try {
      const resp = await fetch('/api/daily');
      if (resp.ok) {
        const data = await resp.json();
        this.todayDate = data.date;
        this.dayNumber = data.dayNumber;
        this.secondsUntilMidnight = data.secondsUntilMidnight;
      }
    } catch (e) {
      console.warn("Could not fetch /api/daily, using local time:", e);
    }

    const dateObj = new Date(this.todayDate);
    const dateFormatted = dateObj.toLocaleDateString('no-NO', { day: 'numeric', month: 'long' });
    if (this.elements.dailyDateSubtitle) {
      this.elements.dailyDateSubtitle.textContent = `DAGENS UTFORDRING #${this.dayNumber} • ${dateFormatted.toUpperCase()}`;
    }
    if (this.elements.tabDateLabel) {
      this.elements.tabDateLabel.textContent = dateFormatted;
    }

    this.startMidnightCountdown();
  }

  updatePlayerHudName() {
    if (this.elements.playerHudName) {
      this.elements.playerHudName.textContent = this.playerName || "Spiller";
    }
  }

  updateStartButtonState() {
    const input = this.elements.playerDisplaynameInput;
    const btn = this.elements.btnStartGame;
    if (!input || !btn) return;

    const val = input.value.trim();
    if (val.length >= 2) {
      btn.disabled = false;
      btn.classList.add('ready');
    } else {
      btn.disabled = true;
      btn.classList.remove('ready');
    }
  }

  startMidnightCountdown() {
    setInterval(() => {
      if (this.secondsUntilMidnight > 0) {
        this.secondsUntilMidnight--;
        const h = Math.floor(this.secondsUntilMidnight / 3600);
        const m = Math.floor((this.secondsUntilMidnight % 3600) / 60);
        const s = this.secondsUntilMidnight % 60;
        const str = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        if (this.elements.clockCountdown) {
          this.elements.clockCountdown.textContent = str;
        }
      }
    }, 1000);
  }

  bindEvents() {
    // Name input: strictly enables/disables the start button!
    if (this.elements.playerDisplaynameInput) {
      this.elements.playerDisplaynameInput.addEventListener('input', (e) => {
        this.playerName = e.target.value.trim();
        this.updateStartButtonState();
        if (this.playerName.length >= 2) {
          localStorage.setItem('ntnu_player_name', this.playerName);
          this.updatePlayerHudName();
        }
      });

      // Pressing Enter starts the game if valid
      this.elements.playerDisplaynameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && this.elements.btnStartGame && !this.elements.btnStartGame.disabled) {
          e.preventDefault();
          this.elements.btnStartGame.click();
        }
      });
    }

    // Start Button Click: Starts directly on the 5 daily locations!
    if (this.elements.btnStartGame) {
      this.elements.btnStartGame.addEventListener('click', () => {
        const name = this.elements.playerDisplaynameInput.value.trim();
        if (name.length < 2) return;

        this.playerName = name;
        localStorage.setItem('ntnu_player_name', name);
        this.updatePlayerHudName();

        soundManager.playClick();
        this.elements.startModal.classList.add('hidden');
        this.startNewGame();
      });
    }

    // Open Leaderboard Modal from Header or Start Modal
    const openLeaderboard = () => {
      soundManager.playClick();
      this.openLeaderboardModal('daily');
    };
    if (this.elements.headerLeaderboardBtn) {
      this.elements.headerLeaderboardBtn.addEventListener('click', openLeaderboard);
    }
    if (this.elements.btnViewLeaderboardModal) {
      this.elements.btnViewLeaderboardModal.addEventListener('click', openLeaderboard);
    }

    // Close Leaderboard Modal
    if (this.elements.btnCloseLeaderboard) {
      this.elements.btnCloseLeaderboard.addEventListener('click', () => {
        soundManager.playClick();
        this.elements.leaderboardModal.classList.add('hidden');
      });
    }
    if (this.elements.btnPlayFromLeaderboard) {
      this.elements.btnPlayFromLeaderboard.addEventListener('click', () => {
        soundManager.playClick();
        this.elements.leaderboardModal.classList.add('hidden');
        if (!this.gameActive) {
          this.elements.startModal.classList.remove('hidden');
        }
      });
    }

    // Leaderboard Tabs in Modal
    if (this.elements.tabDailyLeaderboard) {
      this.elements.tabDailyLeaderboard.addEventListener('click', () => {
        soundManager.playClick();
        this.openLeaderboardModal('daily');
      });
    }
    if (this.elements.tabAlltimeLeaderboard) {
      this.elements.tabAlltimeLeaderboard.addEventListener('click', () => {
        soundManager.playClick();
        this.openLeaderboardModal('alltime');
      });
    }

    // Game Over Tabs: Live Leaderboard vs Rounds Recap
    if (this.elements.tabGameoverLeaderboard) {
      this.elements.tabGameoverLeaderboard.addEventListener('click', () => {
        soundManager.playClick();
        this.elements.tabGameoverLeaderboard.classList.add('active');
        this.elements.tabGameoverRecap.classList.remove('active');
        this.elements.gameoverLeaderboardSection.classList.remove('hidden');
        this.elements.gameoverRecapSection.classList.add('hidden');
      });
    }
    if (this.elements.tabGameoverRecap) {
      this.elements.tabGameoverRecap.addEventListener('click', () => {
        soundManager.playClick();
        this.elements.tabGameoverRecap.classList.add('active');
        this.elements.tabGameoverLeaderboard.classList.remove('active');
        this.elements.gameoverRecapSection.classList.remove('hidden');
        this.elements.gameoverLeaderboardSection.classList.add('hidden');
      });
    }

    // Explore recap map from Game Over
    if (this.elements.btnExploreRecapMap) {
      this.elements.btnExploreRecapMap.addEventListener('click', () => {
        soundManager.playClick();
        this.elements.gameOverModal.classList.add('hidden');
        this.elements.mapWidget.classList.add('result-expanded');
        this.gameMap.invalidate();
        if (this.elements.btnBackToSummary) {
          this.elements.btnBackToSummary.classList.remove('hidden');
        }
      });
    }

    // Back to summary from map exploration
    if (this.elements.btnBackToSummary) {
      this.elements.btnBackToSummary.addEventListener('click', () => {
        soundManager.playClick();
        this.elements.btnBackToSummary.classList.add('hidden');
        this.elements.mapWidget.classList.remove('result-expanded');
        this.elements.gameOverModal.classList.remove('hidden');
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
        try {
          soundManager.playClick();
        } catch (e) {}

        this.elements.roundResultModal.classList.add('hidden');
        this.elements.mapWidget.classList.remove('result-expanded');
        this.elements.mapWidget.classList.remove('pinned-large');

        const nextRoundIndex = this.currentRoundIndex + 1;
        if (nextRoundIndex < this.totalRounds) {
          this.loadRound(nextRoundIndex);
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
        this.gameMode = 'practice';
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

    // Help modal toggle
    if (this.elements.helpBtn) {
      this.elements.helpBtn.addEventListener('click', () => {
        soundManager.playClick();
        this.elements.helpModal.classList.remove('hidden');
      });
    }
    if (this.elements.btnCloseHelp) {
      this.elements.btnCloseHelp.addEventListener('click', () => {
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

    // Map size toggle
    if (this.elements.btnToggleMapSize) {
      this.elements.btnToggleMapSize.addEventListener('click', () => {
        soundManager.playClick();
        this.elements.mapWidget.classList.toggle('pinned-large');
        this.gameMap.invalidate();
      });
    }

    // Map layer toggle
    if (this.elements.btnToggleLayer) {
      this.elements.btnToggleLayer.addEventListener('click', () => {
        soundManager.playClick();
        this.gameMap.toggleLayer();
      });
    }

    // Keyboard shortcuts: Space to guess, Enter/Space for next round, Esc to unpin map
    window.addEventListener('keydown', (e) => {
      if (this.elements.roundResultModal && !this.elements.roundResultModal.classList.contains('hidden')) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.elements.btnNextRound.click();
          return;
        }
      }

      if (e.key === ' ' && !this.elements.btnGuess.disabled && this.gameActive) {
        e.preventDefault();
        this.submitGuess();
      } else if (e.key === 'Escape') {
        if (this.elements.mapWidget.classList.contains('pinned-large')) {
          this.elements.mapWidget.classList.remove('pinned-large');
          this.gameMap.invalidate();
        }
        if (this.elements.leaderboardModal) this.elements.leaderboardModal.classList.add('hidden');
      }
    });

    // Window resize redraws bell curve
    window.addEventListener('resize', () => {
      if (!this.elements.gameOverModal.classList.contains('hidden')) {
        drawBellCurve(this.elements.bellCurveCanvas, this.totalScore, this.percentile, this.allScores);
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

  startNewGame() {
    this.totalScore = 0;
    this.currentRoundIndex = 0;
    this.roundsData = [];
    this.gameActive = true;

    if (this.gameMode === 'daily') {
      // Deterministic 5 locations for today's date
      this.selectedLocations = getDailyLocations(this.todayDate, this.totalRounds);
    } else {
      // Practice mode: random 5 locations
      const pool = [...NTNU_LOCATIONS];
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      this.selectedLocations = pool.slice(0, this.totalRounds);
    }

    this.updateScoreUI();
    this.loadRound(0);
  }

  loadRound(index) {
    this.currentRoundIndex = index;
    this.currentLocation = this.selectedLocations[index];

    // Reset UI state
    const modeTag = this.gameMode === 'daily' ? 'DAGENS' : 'ØVING';
    this.elements.roundDisplay.textContent = `${modeTag} • Runde ${index + 1} / ${this.totalRounds}`;
    this.elements.btnGuess.disabled = true;
    this.elements.btnGuess.classList.remove('ready');

    // Unpin & un-expand map
    this.elements.mapWidget.classList.remove('pinned-large');
    this.elements.mapWidget.classList.remove('result-expanded');
    this.gameMap.clearRound();

    // Load photo
    this.viewer.loadLocation(this.currentLocation);
  }

  handlePinPlaced(coords) {
    this.elements.btnGuess.disabled = false;
    this.elements.btnGuess.classList.add('ready');
  }

  submitGuess() {
    if (!this.gameActive) return;

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

    // Expand map so player sees their guess and the target
    this.elements.mapWidget.classList.add('result-expanded');
    setTimeout(() => {
      this.gameMap.invalidate();
      this.gameMap.showRoundResult(
        [guessCoords.lat, guessCoords.lng],
        [targetCoords.lat, targetCoords.lng],
        this.currentLocation.name
      );
    }, 150);

    // Show result popup
    this.showRoundResultModal(roundResult);
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
    if (distanceInMeters <= 15) return 5000;
    const score = Math.round(5000 * Math.exp(-distanceInMeters / 800));
    return Math.max(0, Math.min(5000, score));
  }

  showRoundResultModal(data) {
    const isLastRound = this.currentRoundIndex + 1 >= this.totalRounds;
    this.elements.btnNextRound.textContent = isLastRound ? "Se sluttresultat & kurve" : "Neste runde";

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
      ratingText = "Bullseye! Ekte sivilingeniør-presisjon";
      ratingClass = "perfect";
    } else if (data.distance <= 75) {
      ratingText = "Meget bra treff!";
      ratingClass = "high";
    } else if (data.distance <= 250) {
      ratingText = "Ganske nærme";
      ratingClass = "medium";
    } else if (data.distance <= 700) {
      ratingText = "Riktig campusområde";
      ratingClass = "low";
    } else {
      ratingText = "Langt unna målet";
      ratingClass = "fail";
    }
    this.elements.resultRating.textContent = ratingText;
    this.elements.resultRating.className = `result-badge ${ratingClass}`;

    soundManager.playRoundFinish(data.score);

    // Location Info
    this.elements.resultLocationName.textContent = data.target.name;
    this.elements.resultCampusName.textContent = `Campus ${data.target.campus}`;

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

  async showGameOver() {
    this.gameActive = false;
    soundManager.playVictory();

    this.elements.finalScore.textContent = `${this.totalScore.toLocaleString('no-NO')} / 25 000`;

    // Calculate degree rank
    let rankTitle = "";
    let desc = "";
    if (this.totalScore >= 24000) {
      rankTitle = "Sivilingeniør i NTNU-geografi";
      desc = "Eksepsjonell innsats! Du kjenner hver eneste brostein og auditorium på campus bedre enn rektor!";
    } else if (this.totalScore >= 20000) {
      rankTitle = "Mastergrad i campus-geografi";
      desc = "Imponerende lokalkunnskap! Du navigerer Trondheim på autopilot, selv etter en lang kveld på Bodegaen.";
    } else if (this.totalScore >= 15000) {
      rankTitle = "Bachelorgrad i campus-orientering";
      desc = "Godt levert! Du finner veien til de fleste forelesninger, men har kanskje unngått krikene på Tyholt.";
    } else if (this.totalScore >= 10000) {
      rankTitle = "Førsteklassing på jakt etter R1";
      desc = "Helt greit, men du har nok virret en del rundt i Sentralbygg og lurt på hvor heisen ender.";
    } else {
      rankTitle = "Tok linje 3 til feil ende av byen";
      desc = "Du endte visst opp på feil campus... Anbefaler en guidet tur langs Høgskoleringen og et vaffelhjerte på Stripa!";
    }

    this.elements.finalRankTitle.textContent = rankTitle;
    this.elements.finalRankDesc.textContent = desc;

    // Calculate total distance
    const totalDist = this.roundsData.reduce((acc, r) => acc + (r.distance || 0), 0);

    // Populate Recap Table
    this.elements.recapTableBody.innerHTML = '';
    this.roundsData.forEach(r => {
      const tr = document.createElement('tr');
      const distStr = r.distance !== null
        ? (r.distance < 1000 ? `${Math.round(r.distance)} m` : `${(r.distance / 1000).toFixed(2)} km`)
        : '0 m';
      tr.innerHTML = `
        <td><img src="${r.target.image}" class="recap-thumb" alt="${r.target.name}"></td>
        <td><strong>${r.target.name}</strong><br><small>${r.target.campus}</small></td>
        <td>${distStr}</td>
        <td><span class="score-pill">${r.score.toLocaleString('no-NO')}</span></td>
      `;
      this.elements.recapTableBody.appendChild(tr);
    });

    // Prepare All on Recap Map
    this.gameMap.showAllRecap(this.roundsData);

    // Default theoretical percentile from Gaussian CDF
    let computedPercentile = Math.round(normalCDF(this.totalScore) * 100);
    computedPercentile = Math.max(1, Math.min(99, computedPercentile));
    this.percentile = computedPercentile;
    this.rank = 1;

    // Submit score to Leaderboard API
    try {
      const payload = {
        name: this.playerName || "Anonym Gløsing",
        score: this.totalScore,
        totalDistance: totalDist,
        date: this.todayDate,
        rounds: this.roundsData.map(r => ({
          target: r.target.id,
          score: r.score,
          distance: r.distance
        }))
      };

      const resp = await fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (resp.ok) {
        const result = await resp.json();
        if (result.percentile !== undefined) {
          this.percentile = result.percentile;
        }
        if (result.rank !== undefined) {
          this.rank = result.rank;
        }
        this.allScores = result.allScores || [];

        // Populate live leaderboard table in game over
        this.populateLeaderboardTable(result.leaderboard || [], this.elements.gameoverLeaderboardBody);
      }
    } catch (e) {
      console.warn("Could not post score to server:", e);
    }

    // Update Percentile Banner & Subtext
    if (this.elements.percentileValue) {
      this.elements.percentileValue.textContent = `${this.percentile}%`;
    }
    if (this.elements.rankValue) {
      this.elements.rankValue.textContent = this.rank;
    }

    // Show Game Over Modal
    this.elements.gameOverModal.classList.remove('hidden');

    // Draw the Bell Curve with slight delay so canvas has dimensions
    setTimeout(() => {
      drawBellCurve(this.elements.bellCurveCanvas, this.totalScore, this.percentile, this.allScores);
    }, 100);
  }

  async openLeaderboardModal(tab = 'daily') {
    this.elements.leaderboardModal.classList.remove('hidden');
    if (tab === 'daily') {
      this.elements.tabDailyLeaderboard.classList.add('active');
      this.elements.tabAlltimeLeaderboard.classList.remove('active');
    } else {
      this.elements.tabDailyLeaderboard.classList.remove('active');
      this.elements.tabAlltimeLeaderboard.classList.add('active');
    }

    const tbody = this.elements.leaderboardTableBody;
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 20px; color: #94A3B8;">Laster inn toppliste...</td></tr>`;

    try {
      const resp = await fetch(`/api/leaderboard?type=${tab}&date=${this.todayDate}`);
      if (resp.ok) {
        const data = await resp.json();
        this.populateLeaderboardTable(data.entries || [], tbody);
      }
    } catch (e) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 20px; color: #EF4444;">Kunne ikke laste topplisten.</td></tr>`;
    }
  }

  populateLeaderboardTable(entries, tbody) {
    if (!tbody) return;
    if (!entries || entries.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 20px; color: #94A3B8;">Ingen resultater registrert ennå.</td></tr>`;
      return;
    }

    tbody.innerHTML = '';

    entries.forEach((r, idx) => {
      const tr = document.createElement('tr');
      const isUser = this.playerName && r.name.toLowerCase() === this.playerName.toLowerCase();
      if (isUser) tr.classList.add('user-row');

      let rankBadge = `<span class="rank-badge-other">${idx + 1}.</span>`;
      if (idx === 0) rankBadge = `<span class="rank-badge rank-badge-1">1</span>`;
      else if (idx === 1) rankBadge = `<span class="rank-badge rank-badge-2">2</span>`;
      else if (idx === 2) rankBadge = `<span class="rank-badge rank-badge-3">3</span>`;

      const distStr = r.totalDistance < 1000 ? `${Math.round(r.totalDistance)} m` : `${(r.totalDistance / 1000).toFixed(1)} km`;

      let timeStr = "";
      if (r.created_at) {
        const parts = r.created_at.split(' ');
        timeStr = parts[1] ? parts[1].slice(0, 5) : "";
      }

      tr.innerHTML = `
        <td style="font-weight: 700; text-align: center;">${rankBadge}</td>
        <td><strong>${this.escapeHtml(r.name)}</strong>${isUser ? ' <span class="user-badge">DEG</span>' : ''}</td>
        <td><span class="score-pill">${r.score.toLocaleString('no-NO')}</span></td>
        <td style="color: #94A3B8;">${distStr}</td>
        ${r.created_at ? `<td style="color: #64748B; font-size: 0.8rem;">${timeStr}</td>` : ''}
      `;
      tbody.appendChild(tr);
    });
  }

  shareScoreToClipboard() {
    let roundsSummary = "";
    this.roundsData.forEach(r => {
      const dist = r.distance !== null
        ? (r.distance < 1000 ? `${Math.round(r.distance)}m` : `${(r.distance/1000).toFixed(1)}km`)
        : '0m';
      roundsSummary += `\n• R${r.round}: ${r.score} poeng (${dist})`;
    });

    const shareText = `NTNU GUESSER • Dagens utfordring #${this.dayNumber}\nSpiller: ${this.playerName || "Spiller"}\nPoeng: ${this.totalScore.toLocaleString('no-NO')} / 25 000 (Plass #${this.rank})\nBedre enn ${this.percentile}% av spillerne${roundsSummary}\n\nSpill nå: NTNU-Guesser!`;

    navigator.clipboard.writeText(shareText).then(() => {
      this.elements.shareFeedback.textContent = "Kopiert til utklippstavlen";
      this.elements.shareFeedback.classList.remove('hidden');
      setTimeout(() => {
        this.elements.shareFeedback.classList.add('hidden');
      }, 3000);
    }).catch(() => {
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
        p.vy += 0.35;
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

  escapeHtml(str) {
    if (!str) return "";
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
}

// Global initialization
window.addEventListener('DOMContentLoaded', () => {
  window.game = new NTNUGuesserGame();
});
