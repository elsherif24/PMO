// Recovery Tracker — Points-based system
// All data stored in LocalStorage; no network, no cookies.

(function () {
  'use strict';

  // ============================================================================
  // CONFIGURATION
  // ============================================================================

  const STORAGE_KEY = 'recovery:v2';
  const PRAYER_NAMES = ['Fajr', 'Duhr', 'Asr', 'Maghrib', 'Isha'];

  const RANKS = [
    { label: 'Iron III', min: 0, max: 119, img: 'IronIII.png' },
    { label: 'Iron II', min: 120, max: 299, img: 'IronII.png' },
    { label: 'Iron I', min: 300, max: 549, img: 'IronI.png' },
    { label: 'Bronze III', min: 550, max: 849, img: 'BronzeIII.png' },
    { label: 'Bronze II', min: 850, max: 1299, img: 'BronzeII.png' },
    { label: 'Bronze I', min: 1300, max: 1849, img: 'BronzeI.png' },
    { label: 'Silver III', min: 1850, max: 2499, img: 'SilverIII.png' },
    { label: 'Silver II', min: 2500, max: 3299, img: 'SilverII.png' },
    { label: 'Silver I', min: 3300, max: 4199, img: 'SilverI.png' },
    { label: 'Gold III', min: 4200, max: 5499, img: 'GoldIII.png' },
    { label: 'Gold II', min: 5500, max: 6999, img: 'GoldII.png' },
    { label: 'Gold I', min: 7000, max: 8999, img: 'GoldI.png' },
    { label: 'Platinum III', min: 9000, max: 11499, img: 'PlatinumIII.png' },
    { label: 'Platinum II', min: 11500, max: 14499, img: 'PlatinumII.png' },
    { label: 'Platinum I', min: 14500, max: 18699, img: 'PlatinumI.png' },
    { label: 'Emerald III', min: 18700, max: 24399, img: 'EmeraldIII.png' },
    { label: 'Emerald II', min: 24400, max: 30799, img: 'EmeraldII.png' },
    { label: 'Emerald I', min: 30800, max: 38899, img: 'EmeraldI.png' },
    { label: 'Diamond III', min: 38900, max: 48499, img: 'DiamondIII.png' },
    { label: 'Diamond II', min: 48500, max: 59999, img: 'DiamondII.png' },
    { label: 'Diamond I', min: 60000, max: 73999, img: 'DiamondI.png' },
    { label: 'Master II', min: 74000, max: 90999, img: 'MasterII.png' },
    { label: 'Master I', min: 91000, max: 111999, img: 'MasterI.png' },
    { label: 'Grand Master II', min: 112000, max: 137999, img: 'GrandmasterII.png' },
    { label: 'Grand Master I', min: 138000, max: 169999, img: 'GrandmasterI.png' },
    { label: 'Challenger II', min: 170000, max: 209999, img: 'ChallengerII.png' },
    { label: 'Challenger I', min: 210000, max: Infinity, img: 'ChallengerI.png' },
  ];

  // ============================================================================
  // DOM REFERENCES
  // ============================================================================

  const $ = (sel) => document.querySelector(sel);

  const els = {
    // Rank display
    rankBadge: $('#rankBadge'),
    rankImageLarge: $('#rankImageLarge'),
    rankLabel: $('#rankLabel'),
    currentPoints: $('#currentPoints'),
    nextRankPoints: $('#nextRankPoints'),
    nextRankLabel: $('#nextRankLabel'),
    progressBar: $('#progressBar'),
    progressText: $('#progressText'),

    // Prayer tracking
    debtCount: $('#debtCount'),
    logQadaa: $('#logQadaa'),
    logOnTime: $('#logOnTime'),
    logInMosque: $('#logInMosque'),

    // Study tracking
    studyHours: $('#studyHours'),
    submitStudy: $('#submitStudy'),
    studyStatus: $('#studyStatus'),

    // Good deeds
    logGhusl: $('#logGhusl'),
    logQuran: $('#logQuran'),
    logExercise: $('#logExercise'),

    // Relapses
    logMasturbation: $('#logMasturbation'),
    logPorn: $('#logPorn'),

    // Stats
    pointsToday: $('#pointsToday'),

    // Controls
    exportBtn: $('#exportBtn'),
    importBtn: $('#importBtn'),
    importFile: $('#importFile'),
    resetBtn: $('#resetBtn'),

    // Modal
    confirmModal: $('#confirmModal'),
    confirmClose: $('#confirmClose'),
    confirmCancel: $('#confirmCancel'),
    confirmOk: $('#confirmOk'),
    confirmMessage: $('#confirmMessage'),
  };

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  function defaultState() {
    return {
      version: 2,
      createdAt: Date.now(),
      points: -100,
      prayersLoggedToday: 0,
      lastCleanHourUpdate: Date.now(),
      todayDate: getTodayISO(),
      todayPoints: -100,
      todayStudyHours: 0,
    };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      if (parsed.version !== 2) return defaultState();
      return parsed;
    } catch (e) {
      console.error('Failed to load state:', e);
      return defaultState();
    }
  }

  function saveState(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save state:', e);
    }
  }

  let state = loadState();
  let pendingConfirmAction = null;

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  function getTodayISO() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }

  function addPoints(amount, animate = true) {
    state.points += amount;
    state.todayPoints += amount;

    if (animate && amount !== 0) {
      const className = amount > 0 ? 'points-animate-gain' : 'points-animate-loss';
      els.currentPoints.classList.add(className);
      setTimeout(() => els.currentPoints.classList.remove(className), 400);
    }

    saveState(state);
    renderAll();
  }

  function getRankFromPoints(points) {
    for (let i = RANKS.length - 1; i >= 0; i--) {
      if (points >= RANKS[i].min && points <= RANKS[i].max) {
        return {
          rank: RANKS[i],
          next: RANKS[i + 1] || null,
        };
      }
    }
    return { rank: RANKS[0], next: RANKS[1] };
  }

  function updateCleanHours() {
    const now = Date.now();
    const elapsed = now - state.lastCleanHourUpdate;
    const hours = Math.floor(elapsed / (1000 * 60 * 60));

    if (hours > 0) {
      addPoints(hours, false);
      state.lastCleanHourUpdate = now;
      saveState(state);
    }
  }

  function checkDayRollover() {
    const today = getTodayISO();
    if (state.todayDate !== today) {
      state.todayDate = today;
      state.prayersLoggedToday = 0;
      state.todayPoints = -100;
      state.points -= 100;
      state.todayStudyHours = 0;
      saveState(state);
      renderAll();
    }
  }

  // ============================================================================
  // ACTION HANDLERS
  // ============================================================================

  function logQadaaPrayer() {
    if (state.prayersLoggedToday >= 5) {
      showNotification('All 5 prayers already logged today!', 'info');
      return;
    }
    const prayerName = PRAYER_NAMES[state.prayersLoggedToday];
    addPoints(20);
    state.prayersLoggedToday++;
    saveState(state);
    renderPrayerDebt();
    showNotification(`${prayerName} Qadaa logged (+20 points)`, 'success');
  }

  function logOnTimePrayer() {
    if (state.prayersLoggedToday >= 5) {
      showNotification('All 5 prayers already logged today!', 'info');
      return;
    }
    const prayerName = PRAYER_NAMES[state.prayersLoggedToday];
    addPoints(25);
    state.prayersLoggedToday++;
    saveState(state);
    renderPrayerDebt();
    showNotification(`${prayerName} on time (+25 points)`, 'success');
  }

  function logInMosquePrayer() {
    if (state.prayersLoggedToday >= 5) {
      showNotification('All 5 prayers already logged today!', 'info');
      return;
    }
    const prayerName = PRAYER_NAMES[state.prayersLoggedToday];
    addPoints(35);
    state.prayersLoggedToday++;
    saveState(state);
    renderPrayerDebt();
    showNotification(`${prayerName} in mosque (+35 points)`, 'success');
  }

  function submitStudyHours() {
    const hours = parseFloat(els.studyHours.value);
    if (isNaN(hours) || hours < 0 || hours > 24) {
      showNotification('Please enter valid hours (0-24)', 'error');
      return;
    }

    const oldHours = state.todayStudyHours;
    const oldPoints = oldHours < 2 ? -20 : Math.floor(oldHours * 8);
    const newPoints = hours < 2 ? -20 : Math.floor(hours * 8);
    const pointDiff = newPoints - oldPoints;

    state.todayStudyHours = hours;
    addPoints(pointDiff);

    if (hours < 2) {
      showNotification(`Study updated: ${hours}h (below threshold, -20 total)`, 'warning');
    } else {
      showNotification(`Study updated: ${hours}h (+${newPoints} points total)`, 'success');
    }

    els.studyHours.value = '';
    renderStudyStatus();
  }

  function logGhusl() {
    addPoints(25);
    showNotification('Ghusl logged (+25 points)', 'success');
  }

  function logQuran() {
    addPoints(15);
    showNotification('Quran reading logged (+15 points)', 'success');
  }

  function logExercise() {
    addPoints(10);
    showNotification('Exercise logged (+10 points)', 'success');
  }

  function logMasturbation() {
    pendingConfirmAction = () => {
      addPoints(-70);
      state.lastCleanHourUpdate = Date.now();
      saveState(state);
      showNotification('Masturbation relapse logged (-70 points)', 'warning');
      closeConfirmModal();
    };
    showConfirmModal('Log masturbation relapse? This will deduct 70 points.');
  }

  function logPorn() {
    pendingConfirmAction = () => {
      addPoints(-140);
      state.lastCleanHourUpdate = Date.now();
      saveState(state);
      showNotification('Porn relapse logged (-140 points). Immediate Ghusl gives +25 back!', 'warning');
      closeConfirmModal();
    };
    showConfirmModal('Log porn relapse? This will deduct 140 points.');
  }

  // ============================================================================
  // UI RENDERING
  // ============================================================================

  function renderAll() {
    renderRank();
    renderProgress();
    renderPrayerDebt();
    renderStudyStatus();
    renderStats();
  }

  function renderRank() {
    const { rank, next } = getRankFromPoints(state.points);

    els.rankBadge.textContent = rank.label;
    els.rankLabel.textContent = rank.label;
    els.rankImageLarge.src = `ranks/${rank.img}`;
    els.rankImageLarge.alt = rank.label;
    els.currentPoints.textContent = state.points.toLocaleString();

    if (next) {
      els.nextRankPoints.textContent = next.min.toLocaleString();
      els.nextRankLabel.textContent = next.label;
    } else {
      els.nextRankPoints.textContent = '∞';
      els.nextRankLabel.textContent = 'Max Rank';
    }
  }

  function renderProgress() {
    const { rank, next } = getRankFromPoints(state.points);

    if (!next) {
      els.progressBar.style.width = '100%';
      els.progressText.textContent = '100%';
      return;
    }

    const currentInRange = state.points - rank.min;
    const rangeSize = next.min - rank.min;
    const percentage = Math.min(100, Math.max(0, (currentInRange / rangeSize) * 100));

    els.progressBar.style.width = `${percentage}%`;
    els.progressText.textContent = `${Math.floor(percentage)}%`;
  }

  function renderPrayerDebt() {
    const remaining = 5 - state.prayersLoggedToday;

    if (remaining === 0) {
      els.debtCount.textContent = 'No Prayers';
      els.debtCount.style.color = 'var(--green)';
    } else {
      const nextPrayer = PRAYER_NAMES[state.prayersLoggedToday];
      els.debtCount.textContent = nextPrayer;
      els.debtCount.style.color = 'var(--red)';
    }

    const disabled = state.prayersLoggedToday >= 5;
    [els.logQadaa, els.logOnTime, els.logInMosque].forEach(btn => {
      btn.disabled = disabled;
      btn.style.opacity = disabled ? '0.5' : '1';
      btn.style.cursor = disabled ? 'not-allowed' : 'pointer';
    });
  }

  function renderStudyStatus() {
    if (state.todayStudyHours === 0) {
      els.studyStatus.textContent = 'Not logged today';
      els.studyStatus.style.color = 'var(--muted)';
    } else {
      const hours = state.todayStudyHours;
      const status = hours < 2
        ? `${hours}h logged (below 2h threshold: -20pts)`
        : `${hours}h logged (+${Math.floor(hours * 8)} points)`;
      els.studyStatus.textContent = status;
      els.studyStatus.style.color = hours < 2 ? 'var(--yellow)' : 'var(--green)';
    }
  }

  function renderStats() {
    const sign = state.todayPoints >= 0 ? '+' : '';
    els.pointsToday.textContent = sign + state.todayPoints;
    els.pointsToday.style.color = state.todayPoints >= 0 ? 'var(--green)' : 'var(--red)';
  }

  // ============================================================================
  // MODAL & NOTIFICATIONS
  // ============================================================================

  function showConfirmModal(message) {
    els.confirmMessage.textContent = message;
    els.confirmModal.setAttribute('aria-hidden', 'false');
  }

  function closeConfirmModal() {
    els.confirmModal.setAttribute('aria-hidden', 'true');
    pendingConfirmAction = null;
  }

  function confirmAction() {
    if (pendingConfirmAction) {
      pendingConfirmAction();
    }
  }

  function showNotification(message, type = 'info') {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--card);
      border: 1px solid var(--border);
      padding: 0.75rem 1rem;
      border-radius: 0.5rem;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 9999;
      max-width: 90vw;
      animation: slideUp 0.3s ease;
    `;

    if (type === 'success') toast.style.borderColor = 'var(--green)';
    if (type === 'warning') toast.style.borderColor = 'var(--yellow)';
    if (type === 'error') toast.style.borderColor = 'var(--red)';

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideDown 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // ============================================================================
  // EXPORT/IMPORT/RESET
  // ============================================================================

  function exportData() {
    const json = JSON.stringify(state, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recovery-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Data exported successfully', 'success');
  }

  function importData() {
    els.importFile.click();
  }

  function handleImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (imported.version === 2) {
          state = imported;
          saveState(state);
          renderAll();
          showNotification('Data imported successfully', 'success');
        } else {
          showNotification('Invalid or outdated backup file', 'error');
        }
      } catch (err) {
        showNotification('Failed to import data', 'error');
        console.error(err);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }

  function resetAll() {
    pendingConfirmAction = () => {
      state = defaultState();
      saveState(state);
      renderAll();
      showNotification('All data reset', 'info');
      closeConfirmModal();
    };
    showConfirmModal('Reset all data? This action cannot be undone!');
  }

  // ============================================================================
  // EVENT LISTENERS
  // ============================================================================

  function initListeners() {
    els.logQadaa.addEventListener('click', logQadaaPrayer);
    els.logOnTime.addEventListener('click', logOnTimePrayer);
    els.logInMosque.addEventListener('click', logInMosquePrayer);

    els.submitStudy.addEventListener('click', submitStudyHours);
    els.studyHours.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') submitStudyHours();
    });

    els.logGhusl.addEventListener('click', logGhusl);
    els.logQuran.addEventListener('click', logQuran);
    els.logExercise.addEventListener('click', logExercise);

    els.logMasturbation.addEventListener('click', logMasturbation);
    els.logPorn.addEventListener('click', logPorn);

    els.exportBtn.addEventListener('click', exportData);
    els.importBtn.addEventListener('click', importData);
    els.importFile.addEventListener('change', handleImport);
    els.resetBtn.addEventListener('click', resetAll);

    els.confirmClose.addEventListener('click', closeConfirmModal);
    els.confirmCancel.addEventListener('click', closeConfirmModal);
    els.confirmOk.addEventListener('click', confirmAction);

    els.confirmModal.addEventListener('click', (e) => {
      if (e.target === els.confirmModal) closeConfirmModal();
    });
  }

  // ============================================================================
  // BACKGROUND TICKER
  // ============================================================================

  function startTicker() {
    setInterval(() => {
      checkDayRollover();
      updateCleanHours();
      renderStats();
    }, 60000); // Every minute
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideUp {
      from { transform: translate(-50%, 100px); opacity: 0; }
      to { transform: translate(-50%, 0); opacity: 1; }
    }
    @keyframes slideDown {
      from { transform: translate(-50%, 0); opacity: 1; }
      to { transform: translate(-50%, 100px); opacity: 0; }
    }
  `;
  document.head.appendChild(style);

  checkDayRollover();
  updateCleanHours();
  initListeners();
  renderAll();
  startTicker();

  console.log('Recovery Tracker initialized ✓');
})();
