/**
 * NTNU Guesser - Main Game Controller (Daily Challenge & Shared Leaderboard Edition)
 * Handles deterministic daily seeding, player name management, scoring, timers,
 * REST API communication with server.py, confetti, and leaderboard modal.
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
    this.activeLeaderboardTab = 'daily';

    // Timer config
    this.timerDuration = 0; // 0 = unlimited
    this.timerRemaining = 0;
    this.timerInterval = null;
    this.countdownInterval = null;

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
      timerDisplay: document.getElementById('timer-display'),
      timerBadge: document.getElementById('timer-badge'),
      headerLeaderboardBtn: document.getElementById('header-leaderboard-btn'),
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

      // Welcome / Start Modal
      startModal: document.getElementById('start-modal'),
      playerDisplaynameInput: document.getElementById('player-displayname'),
      nameValidationError: document.getElementById('name-validation-error'),
      dailyBadgePill: document.getElementById('daily-badge-pill'),
      dailyStatusBox: document.getElementById('daily-status-box'),
      dailyChallengeTitle: document.getElementById('daily-challenge-title'),
      dailyCountdownText: document.getElementById('daily-countdown-text'),
      btnStartGame: document.getElementById('btn-start-game'),
      btnStartPractice: document.getElementById('btn-start-practice'),
      btnViewLeaderboardModal: document.getElementById('btn-view-leaderboard-modal'),
      miniLeaderboardList: document.getElementById('mini-leaderboard-list'),

      // Dedicated Leaderboard Modal
      leaderboardModal: document.getElementById('leaderboard-modal'),
      btnCloseLeaderboard: document.getElementById('btn-close-leaderboard'),
      tabDailyLeaderboard: document.getElementById('tab-daily-leaderboard'),
      tabAlltimeLeaderboard: document.getElementById('tab-alltime-leaderboard'),
      tabDateLabel: document.getElementById('tab-date-label'),
      leaderboardTableBody: document.getElementById('leaderboard-table-body'),
      clockCountdown: document.getElementById('clock-countdown'),
      btnPlayFromLeaderboard: document.getElementById('btn-play-from-leaderboard'),

      // Round Result elements
      roundResultModal: document.getElementById('round-result-modal'),
      resultDistance: document.getElementById('result-distance'),
      resultPoints: document.getElementById('result-points'),
      resultRating: document.getElementById('result-rating'),
      resultLocationName: document.getElementById('result-location-name'),
      resultCampusName: document.getElementById('result-campus-name'),
      resultLore: document.getElementById('result-lore'),
      btnNextRound: document.getElementById('btn-next-round'),

      // Game Over elements
      gameOverModal: document.getElementById('game-over-modal'),
      finalScore: document.getElementById('final-score'),
      finalRankTitle: document.getElementById('final-rank-title'),
      finalRankDesc: document.getElementById('final-rank-desc'),
      leaderboardPlacementBanner: document.getElementById('leaderboard-placement-banner'),
      placementIcon: document.getElementById('placement-icon'),
      placementText: document.getElementById('placement-text'),
      tabGameoverRecap: document.getElementById('tab-gameover-recap'),
      tabGameoverLeaderboard: document.getElementById('tab-gameover-leaderboard'),
      gameoverRecapSection: document.getElementById('gameover-recap-section'),
      gameoverLeaderboardSection: document.getElementById('gameover-leaderboard-section'),
      gameoverLeaderboardBody: document.getElementById('gameover-leaderboard-body'),
      recapTableBody: document.getElementById('recap-table-body'),
      btnPlayAgain: document.getElementById('btn-play-again'),
      btnShareScore: document.getElementById('btn-share-score'),
      btnExploreRecapMap: document.getElementById('btn-explore-recap-map'),
      btnBackToSummary: document.getElementById('btn-back-to-summary'),
      shareFeedback: document.getElementById('share-feedback'),

      // Help Modal
      helpModal: document.getElementById('help-modal'),
      btnCloseHelp: document.getElementById('btn-close-help')
    };
  }

  async initDailyGame() {
    // Populate saved player name
    if (this.playerName && this.elements.playerDisplaynameInput) {
      this.elements.playerDisplaynameInput.value = this.playerName;
      this.updatePlayerHudName();
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

    // Format human readable date for NTNU students (f.eks. "14. OKTOBER 2026")
    const dateObj = new Date(this.todayDate);
    const dateFormatted = dateObj.toLocaleDateString('no-NO', { day: 'numeric', month: 'long' });
    if (this.elements.dailyDateSubtitle) {
      this.elements.dailyDateSubtitle.textContent = `DAGENS UTFORDRING #${this.dayNumber} • ${dateFormatted.toUpperCase()}`;
    }
    if (this.elements.dailyBadgePill) {
      this.elements.dailyBadgePill.textContent = `📅 DAGENS UTFORDRING #${this.dayNumber} • ${dateFormatted}`;
    }
    if (this.elements.tabDateLabel) {
      this.elements.tabDateLabel.textContent = dateFormatted;
    }

    // Start live countdown to midnight
    this.startMidnightCountdown();

    // Check if player has already played today's daily challenge
    this.checkDailyPlayedStatus();

    // Fetch and populate mini-leaderboard preview
    this.loadLeaderboardPreview();
  }

  updatePlayerHudName() {
    if (this.elements.playerHudName) {
      this.elements.playerHudName.textContent = this.playerName || "Spiller";
    }
  }

  startMidnightCountdown() {
    clearInterval(this.countdownInterval);
    const update = () => {
      if (this.secondsUntilMidnight > 0) {
        this.secondsUntilMidnight--;
        const h = Math.floor(this.secondsUntilMidnight / 3600);
        const m = Math.floor((this.secondsUntilMidnight % 3600) / 60);
        const s = this.secondsUntilMidnight % 60;
        const str = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        if (this.elements.clockCountdown) {
          this.elements.clockCountdown.textContent = str;
        }
        if (this.elements.dailyCountdownText) {
          this.elements.dailyCountdownText.textContent = `Neste utfordring slippes om ${str}`;
        }
      }
    };
    update();
    this.countdownInterval = setInterval(update, 1000);
  }

  checkDailyPlayedStatus() {
    const key = `ntnu_daily_done_${this.todayDate}`;
    const saved = localStorage.getItem(key);

    if (saved && this.elements.dailyStatusBox) {
      try {
        const parsed = JSON.parse(saved);
        this.elements.dailyChallengeTitle.innerHTML = `🎉 Du har fullført dagens utfordring! Score: <strong>${parsed.score.toLocaleString('no-NO')} poeng</strong>`;
        if (parsed.rank) {
          this.elements.dailyChallengeTitle.innerHTML += ` (Plassering: #${parsed.rank})`;
        }
        this.elements.btnStartGame.textContent = "Start Dagens Utfordring Igjen 🚀";
      } catch (e) {}
    }
  }

  validatePlayerName() {
    const input = this.elements.playerDisplaynameInput;
    if (!input) return false;
    const name = input.value.trim();

    if (name.length < 2) {
      if (this.elements.nameValidationError) {
        this.elements.nameValidationError.classList.remove('hidden');
      }
      input.focus();
      return false;
    }

    if (this.elements.nameValidationError) {
      this.elements.nameValidationError.classList.add('hidden');
    }

    this.playerName = name;
    localStorage.setItem('ntnu_player_name', name);
    this.updatePlayerHudName();
    return true;
  }

  async loadLeaderboardPreview() {
    if (!this.elements.miniLeaderboardList) return;
    try {
      const resp = await fetch(`/api/leaderboard?type=daily&date=${this.todayDate}`);
      if (resp.ok) {
        const data = await resp.json();
        this.renderMiniLeaderboard(data.entries || []);
      }
    } catch (e) {
      console.warn("Could not load preview leaderboard:", e);
    }
  }

  renderMiniLeaderboard(entries) {
    const container = this.elements.miniLeaderboardList;
    if (!container) return;

    if (!entries || entries.length === 0) {
      container.innerHTML = `<div style="text-align: center; color: #94A3B8; padding: 8px; font-size: 0.85rem;">Ingen har spilt dagens utfordring ennå. Bli den første! 🚀</div>`;
      return;
    }

    container.innerHTML = '';
    const medals = ['🥇', '🥈', '🥉'];
    entries.slice(0, 5).forEach((entry, idx) => {
      const row = document.createElement('div');
      const isUser = this.playerName && entry.name.toLowerCase() === this.playerName.toLowerCase();
      row.className = `mini-row ${isUser ? 'user-highlight' : ''}`;
      row.innerHTML = `
        <span class="mini-rank">${medals[idx] || (idx + 1) + '.'}</span>
        <span class="mini-name">${this.escapeHtml(entry.name)} ${isUser ? '<span class="user-badge">DEG</span>' : ''}</span>
        <span class="mini-score">${entry.score.toLocaleString('no-NO')}</span>
      `;
      container.appendChild(row);
    });
  }

  async openLeaderboardModal(tab = 'daily') {
    this.activeLeaderboardTab = tab;
    this.updateLeaderboardTabStyles();
    this.elements.leaderboardModal.classList.remove('hidden');
    await this.fetchAndRenderLeaderboard(tab);
  }

  updateLeaderboardTabStyles() {
    if (this.activeLeaderboardTab === 'daily') {
      this.elements.tabDailyLeaderboard.classList.add('active');
      this.elements.tabAlltimeLeaderboard.classList.remove('active');
    } else {
      this.elements.tabDailyLeaderboard.classList.remove('active');
      this.elements.tabAlltimeLeaderboard.classList.add('active');
    }
  }

  async fetchAndRenderLeaderboard(type = 'daily', targetTbody = null) {
    const tbody = targetTbody || this.elements.leaderboardTableBody;
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 20px; color: #94A3B8;">Laster toppliste...</td></tr>`;

    try {
      const url = `/api/leaderboard?type=${type}&date=${this.todayDate}`;
      const resp = await fetch(url);
      if (!resp.ok) throw new Error("HTTP error " + resp.status);
      const data = await resp.json();
      this.populateLeaderboardTable(data.entries || [], tbody);
    } catch (e) {
      console.warn("Failed fetching leaderboard:", e);
      tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 20px; color: #EF4444;">Kunne ikke laste topplisten akkurat nå.</td></tr>`;
    }
  }

  populateLeaderboardTable(entries, tbody) {
    if (!tbody) return;
    if (!entries || entries.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 24px; color: #94A3B8;">Ingen resultater registrert ennå.</td></tr>`;
      return;
    }

    tbody.innerHTML = '';
    const medals = ['🥇', '🥈', '🥉'];

    entries.forEach((r, idx) => {
      const tr = document.createElement('tr');
      const isUser = this.playerName && r.name.toLowerCase() === this.playerName.toLowerCase();
      if (isUser) tr.classList.add('user-row');

      const rankBadge = medals[idx] ? `<span class="medal-icon">${medals[idx]}</span>` : `${idx + 1}.`;
      const distStr = r.totalDistance < 1000 ? `${Math.round(r.totalDistance)} m` : `${(r.totalDistance / 1000).toFixed(1)} km`;
      
      let timeStr = "";
      if (r.created_at) {
        const parts = r.created_at.split(' ');
        timeStr = parts[1] ? parts[1].slice(0, 5) : "";
      }

      tr.innerHTML = `
        <td style="font-weight: 800; text-align: center;">${rankBadge}</td>
        <td><strong>${this.escapeHtml(r.name)}</strong>${isUser ? ' <span class="user-badge">DEG</span>' : ''}</td>
        <td><span class="score-pill">${r.score.toLocaleString('no-NO')}</span></td>
        <td style="color: #94A3B8;">${distStr}</td>
        <td style="color: #64748B; font-size: 0.8rem;">${timeStr}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  bindEvents() {
    // Display name input change
    if (this.elements.playerDisplaynameInput) {
      this.elements.playerDisplaynameInput.addEventListener('input', (e) => {
        this.playerName = e.target.value.trim();
        localStorage.setItem('ntnu_player_name', this.playerName);
        this.updatePlayerHudName();
      });
    }

    // Start Daily Challenge
    if (this.elements.btnStartGame) {
      this.elements.btnStartGame.addEventListener('click', () => {
        if (!this.validatePlayerName()) return;
        soundManager.playClick();
        this.gameMode = 'daily';
        this.elements.startModal.classList.add('hidden');
        this.startNewGame();
      });
    }

    // Start Practice Mode
    if (this.elements.btnStartPractice) {
      this.elements.btnStartPractice.addEventListener('click', () => {
        if (!this.validatePlayerName()) return;
        soundManager.playClick();
        this.gameMode = 'practice';
        this.elements.startModal.classList.add('hidden');
        this.startNewGame();
      });
    }

    // Open Leaderboard Modal buttons
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

    // Play from Leaderboard Modal
    if (this.elements.btnPlayFromLeaderboard) {
      this.elements.btnPlayFromLeaderboard.addEventListener('click', () => {
        soundManager.playClick();
        this.elements.leaderboardModal.classList.add('hidden');
        if (!this.gameActive) {
          this.elements.startModal.classList.remove('hidden');
        }
      });
    }

    // Leaderboard Tabs
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

    // Game Over Tabs: Recap vs Live Leaderboard
    if (this.elements.tabGameoverRecap) {
      this.elements.tabGameoverRecap.addEventListener('click', () => {
        soundManager.playClick();
        this.elements.tabGameoverRecap.classList.add('active');
        this.elements.tabGameoverLeaderboard.classList.remove('active');
        this.elements.gameoverRecapSection.classList.remove('hidden');
        this.elements.gameoverLeaderboardSection.classList.add('hidden');
      });
    }
    if (this.elements.tabGameoverLeaderboard) {
      this.elements.tabGameoverLeaderboard.addEventListener('click', () => {
        soundManager.playClick();
        this.elements.tabGameoverRecap.classList.remove('active');
        this.elements.tabGameoverLeaderboard.classList.add('active');
        this.elements.gameoverRecapSection.classList.add('hidden');
        this.elements.gameoverLeaderboardSection.classList.remove('hidden');
        this.fetchAndRenderLeaderboard('daily', this.elements.gameoverLeaderboardBody);
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

    // Back to summary from recap map
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
        this.elements.startModal.classList.remove('hidden');
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

    // Keyboard shortcuts: Space to guess, Enter/Space for next round, Esc to unpin map
    window.addEventListener('keydown', (e) => {
      // If round result modal is open, advance on Enter or Space
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
        if (this.elements.hintBox) this.elements.hintBox.classList.add('hidden');
        if (this.elements.leaderboardModal) this.elements.leaderboardModal.classList.add('hidden');
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
    if (this.elements.hintBox) this.elements.hintBox.classList.add('hidden');

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
    this.elements.btnNextRound.textContent = isLastRound ? "Se sluttresultat & Leaderboard 🏆" : "Neste runde ➔";

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
    this.launchConfetti();

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

    // Submit score to Leaderboard API if daily mode
    if (this.gameMode === 'daily') {
      await this.submitDailyScore(this.playerName, this.totalScore, totalDist);
    } else {
      if (this.elements.leaderboardPlacementBanner) {
        this.elements.placementIcon.textContent = "🎯";
        this.elements.placementText.textContent = "Øvingsmodus fullført! (Scores fra øving registreres ikke på daily leaderboard)";
      }
    }

    this.elements.gameOverModal.classList.remove('hidden');
  }

  async submitDailyScore(name, score, totalDistance) {
    const payload = {
      name: name || "Anonym Gløsing",
      score: score,
      totalDistance: totalDistance,
      date: this.todayDate,
      rounds: this.roundsData.map(r => ({
        target: r.target.id,
        score: r.score,
        distance: r.distance
      }))
    };

    try {
      const resp = await fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (resp.ok) {
        const result = await resp.json();
        // Save daily completion in localStorage
        localStorage.setItem(`ntnu_daily_done_${this.todayDate}`, JSON.stringify({
          score: score,
          rank: result.rank
        }));

        if (this.elements.leaderboardPlacementBanner) {
          const medal = result.rank === 1 ? '🥇' : (result.rank === 2 ? '🥈' : (result.rank === 3 ? '🥉' : '🏆'));
          this.elements.placementIcon.textContent = medal;
          this.elements.placementText.innerHTML = `Du kom på <strong>#${result.rank}. plass</strong> på dagens felles leaderboard!`;
        }

        // Render live leaderboard inside game over
        this.populateLeaderboardTable(result.leaderboard || [], this.elements.gameoverLeaderboardBody);
        this.loadLeaderboardPreview();
      }
    } catch (e) {
      console.warn("Could not post score to server:", e);
      if (this.elements.leaderboardPlacementBanner) {
        this.elements.placementText.textContent = `Score registrert lokalt: ${score.toLocaleString('no-NO')} poeng!`;
      }
    }
  }

  shareScoreToClipboard() {
    let emojiRounds = "";
    this.roundsData.forEach(r => {
      let icon = "🟩";
      if (r.score >= 4600) icon = "🟩";
      else if (r.score >= 3800) icon = "🟨";
      else if (r.score >= 2000) icon = "🟧";
      else icon = "🟥";

      const dist = r.distance !== null
        ? (r.distance < 1000 ? `${Math.round(r.distance)}m` : `${(r.distance/1000).toFixed(1)}km`)
        : '0m';
      emojiRounds += `\n${icon} R${r.round}: ${r.score}p (${dist})`;
    });

    const modeLabel = this.gameMode === 'daily' ? `Dagens Utfordring #${this.dayNumber}` : 'Øvingsmodus';
    const shareText = `📍 NTNU GUESSER • ${modeLabel}\nSpiller: ${this.playerName || "Gløsing"}\nScore: ${this.totalScore.toLocaleString('no-NO')} / 25 000 poeng!${emojiRounds}\n\nSpill og sjekk dagens leaderboard: NTNU-Guesser!`;

    navigator.clipboard.writeText(shareText).then(() => {
      this.elements.shareFeedback.textContent = "Resultat og emoji-kort kopiert! 📋";
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
