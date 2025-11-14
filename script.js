// Lock In — Winter Arc Progress Tracker
// All data stored in LocalStorage; no network, no cookies.

(function () {
  'use strict';

  // ============================================================================
  // CONFIGURATION
  // ============================================================================

  const STORAGE_KEY = 'lockin:v3';
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

  const DEFAULT_POINTS = {
    qadaa: 20,
    onTime: 25,
    inMosque: 35,
    ghusl: 25,
    quran: 15,
    exercise: 10,
    studyPerHour: 8,
    studyPenalty: 20,
  };

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
    cleanHoursValue: $('#cleanHoursValue'),

    // Controls
    settingsBtn: $('#settingsBtn'),
    timelineBtn: $('#timelineBtn'),
    detailsBtn: $('#detailsBtn'),
    exportBtn: $('#exportBtn'),
    importBtn: $('#importBtn'),
    importFile: $('#importFile'),
    resetBtn: $('#resetBtn'),

    // Settings Modal
    settingsModal: $('#settingsModal'),
    settingsClose: $('#settingsClose'),
    settingsSave: $('#settingsSave'),
    settingsReset: $('#settingsReset'),
    settingQadaa: $('#settingQadaa'),
    settingOnTime: $('#settingOnTime'),
    settingInMosque: $('#settingInMosque'),
    settingGhusl: $('#settingGhusl'),
    settingQuran: $('#settingQuran'),
    settingExercise: $('#settingExercise'),
    settingStudyPerHour: $('#settingStudyPerHour'),
    settingStudyPenalty: $('#settingStudyPenalty'),
    negMasturbation: $('#negMasturbation'),
    negPorn: $('#negPorn'),

    // Timeline Modal
    timelineModal: $('#timelineModal'),
    timelineClose: $('#timelineClose'),
    timelineCloseBtn: $('#timelineCloseBtn'),
    timelineContainer: $('#timelineContainer'),

    // Details Modal
    detailsModal: $('#detailsModal'),
    detailsClose: $('#detailsClose'),
    detailsCloseBtn: $('#detailsCloseBtn'),
    detailPrayer: $('#detailPrayer'),
    detailStudy: $('#detailStudy'),
    detailGood: $('#detailGood'),
    detailRelapse: $('#detailRelapse'),
    detailClean: $('#detailClean'),
    activityLog: $('#activityLog'),

    // Confirm Modal
    confirmModal: $('#confirmModal'),
    confirmClose: $('#confirmClose'),
    confirmCancel: $('#confirmCancel'),
    confirmOk: $('#confirmOk'),
    confirmMessage: $('#confirmMessage'),

    // Point displays
    pointsQadaa: $('#pointsQadaa'),
    pointsOnTime: $('#pointsOnTime'),
    pointsInMosque: $('#pointsInMosque'),
    pointsGhusl: $('#pointsGhusl'),
    pointsQuran: $('#pointsQuran'),
    pointsExercise: $('#pointsExercise'),
    pointsMasturbation: $('#pointsMasturbation'),
    pointsPorn: $('#pointsPorn'),
  };

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  function defaultState() {
    return {
      version: 3,
      createdAt: Date.now(),
      points: -100,
      prayersLoggedToday: 0,
      lastCleanHourUpdate: Date.now(),
      todayDate: getTodayISO(),
      todayPoints: -100,
      todayStudyHours: 0,
      customPoints: { ...DEFAULT_POINTS },
      categoryPoints: {
        prayer: 0,
        study: -100,
        good: 0,
        relapse: 0,
        clean: 0,
      },
      activityHistory: [],
    };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      if (parsed.version !== 3) {
        // Migrate from older version
        const newState = defaultState();
        newState.points = parsed.points || 0;
        newState.prayersLoggedToday = parsed.prayersLoggedToday || 0;
        newState.lastCleanHourUpdate = parsed.lastCleanHourUpdate || Date.now();
        newState.todayDate = parsed.todayDate || getTodayISO();
        newState.todayPoints = parsed.todayPoints || 0;
        newState.todayStudyHours = parsed.todayStudyHours || 0;
        return newState;
      }
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

  function formatTime(timestamp) {
    const date = new Date(timestamp);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  function addPoints(amount, category, description, animate = true) {
    state.points += amount;
    state.todayPoints += amount;

    if (category && state.categoryPoints[category] !== undefined) {
      state.categoryPoints[category] += amount;
    }

    // Log activity
    if (description) {
      state.activityHistory.unshift({
        timestamp: Date.now(),
        description,
        points: amount,
        category,
      });

      // Keep only last 50 activities
      if (state.activityHistory.length > 50) {
        state.activityHistory = state.activityHistory.slice(0, 50);
      }
    }

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
      addPoints(hours, 'clean', `${hours} clean hour${hours > 1 ? 's' : ''}`, false);
      state.lastCleanHourUpdate = now;
      saveState(state);
    }
  }

  function getCleanHours() {
    const now = Date.now();
    const elapsed = now - state.lastCleanHourUpdate;
    return Math.floor(elapsed / (1000 * 60 * 60));
  }

  function checkDayRollover() {
    const today = getTodayISO();
    if (state.todayDate !== today) {
      state.todayDate = today;
      state.prayersLoggedToday = 0;
      state.todayPoints = -100;
      state.points -= 100;
      state.todayStudyHours = 0;
      state.categoryPoints.study = -100;
      addPoints(0, null, 'New day started (daily penalty applied)', false);
      saveState(state);
      renderAll();
    }
  }

  function updatePointDisplays() {
    const cp = state.customPoints;
    els.pointsQadaa.textContent = `+${cp.qadaa}`;
    els.pointsOnTime.textContent = `+${cp.onTime}`;
    els.pointsInMosque.textContent = `+${cp.inMosque}`;
    els.pointsGhusl.textContent = `+${cp.ghusl}`;
    els.pointsQuran.textContent = `+${cp.quran}`;
    els.pointsExercise.textContent = `+${cp.exercise}`;
    els.pointsMasturbation.textContent = `-${cp.exercise * 2 + cp.quran * 2 + cp.ghusl * 2}`;
    els.pointsPorn.textContent = `-${(cp.exercise * 2 + cp.quran * 2 + cp.ghusl * 2) * 2}`;
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
    addPoints(state.customPoints.qadaa, 'prayer', `${prayerName} Qadaa logged`);
    state.prayersLoggedToday++;
    saveState(state);
    renderPrayerDebt();
    showNotification(`${prayerName} Qadaa logged (+${state.customPoints.qadaa} points)`, 'success');
  }

  function logOnTimePrayer() {
    if (state.prayersLoggedToday >= 5) {
      showNotification('All 5 prayers already logged today!', 'info');
      return;
    }
    const prayerName = PRAYER_NAMES[state.prayersLoggedToday];
    addPoints(state.customPoints.onTime, 'prayer', `${prayerName} on time`);
    state.prayersLoggedToday++;
    saveState(state);
    renderPrayerDebt();
    showNotification(`${prayerName} on time (+${state.customPoints.onTime} points)`, 'success');
  }

  function logInMosquePrayer() {
    if (state.prayersLoggedToday >= 5) {
      showNotification('All 5 prayers already logged today!', 'info');
      return;
    }
    const prayerName = PRAYER_NAMES[state.prayersLoggedToday];
    addPoints(state.customPoints.inMosque, 'prayer', `${prayerName} in mosque`);
    state.prayersLoggedToday++;
    saveState(state);
    renderPrayerDebt();
    showNotification(`${prayerName} in mosque (+${state.customPoints.inMosque} points)`, 'success');
  }

  function submitStudyHours() {
    const hours = parseFloat(els.studyHours.value);
    if (isNaN(hours) || hours < 0 || hours > 24) {
      showNotification('Please enter valid hours (0-24)', 'error');
      return;
    }

    const oldHours = state.todayStudyHours;
    const oldPoints = oldHours < 2 ? -state.customPoints.studyPenalty : Math.floor(oldHours * state.customPoints.studyPerHour);
    const newPoints = hours < 2 ? -state.customPoints.studyPenalty : Math.floor(hours * state.customPoints.studyPerHour);
    const pointDiff = newPoints - oldPoints;

    state.todayStudyHours = hours;
    addPoints(pointDiff, 'study', `Study updated: ${hours}h`);

    if (hours < 2) {
      showNotification(`Study updated: ${hours}h (below threshold, penalty applied)`, 'warning');
    } else {
      showNotification(`Study updated: ${hours}h (+${newPoints} points total)`, 'success');
    }

    els.studyHours.value = '';
    renderStudyStatus();
  }

  function logGhusl() {
    addPoints(state.customPoints.ghusl, 'good', 'Ghusl performed');
    showNotification(`Ghusl logged (+${state.customPoints.ghusl} points)`, 'success');
  }

  function logQuran() {
    addPoints(state.customPoints.quran, 'good', 'Quran reading');
    showNotification(`Quran reading logged (+${state.customPoints.quran} points)`, 'success');
  }

  function logExercise() {
    addPoints(state.customPoints.exercise, 'good', 'Exercise completed');
    showNotification(`Exercise logged (+${state.customPoints.exercise} points)`, 'success');
  }

  function logMasturbation() {
    const penalty = (state.customPoints.exercise + state.customPoints.quran + state.customPoints.ghusl) * 2;
    pendingConfirmAction = () => {
      addPoints(-penalty, 'relapse', 'Masturbation relapse');
      state.lastCleanHourUpdate = Date.now();
      saveState(state);
      showNotification(`Masturbation relapse logged (-${penalty} points)`, 'warning');
      closeConfirmModal();
    };
    showConfirmModal(`Log masturbation relapse? This will deduct ${penalty} points.`);
  }

  function logPorn() {
    const penalty = (state.customPoints.exercise + state.customPoints.quran + state.customPoints.ghusl) * 4;
    pendingConfirmAction = () => {
      addPoints(-penalty, 'relapse', 'Porn relapse');
      state.lastCleanHourUpdate = Date.now();
      saveState(state);
      showNotification(`Porn relapse logged (-${penalty} points). Immediate Ghusl gives points back!`, 'warning');
      closeConfirmModal();
    };
    showConfirmModal(`Log porn relapse? This will deduct ${penalty} points.`);
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
    updatePointDisplays();
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
      els.debtCount.textContent = 'Complete! ✓';
      els.debtCount.style.color = 'var(--green)';
    } else {
      const nextPrayer = PRAYER_NAMES[state.prayersLoggedToday];
      els.debtCount.textContent = nextPrayer;
      els.debtCount.style.color = 'var(--accent)';
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
        ? `${hours}h logged (below 2h threshold: -${state.customPoints.studyPenalty}pts)`
        : `${hours}h logged (+${Math.floor(hours * state.customPoints.studyPerHour)} points)`;
      els.studyStatus.textContent = status;
      els.studyStatus.style.color = hours < 2 ? 'var(--yellow)' : 'var(--green)';
    }
  }

  function renderStats() {
    const sign = state.todayPoints >= 0 ? '+' : '';
    els.pointsToday.textContent = sign + state.todayPoints;
    els.pointsToday.style.color = state.todayPoints >= 0 ? 'var(--green)' : 'var(--red)';

    const cleanHours = getCleanHours();
    els.cleanHoursValue.textContent = cleanHours;
    els.cleanHoursValue.style.color = cleanHours > 24 ? 'var(--green)' : 'var(--accent)';
  }

  // ============================================================================
  // SETTINGS MODAL
  // ============================================================================

  function openSettingsModal() {
    els.settingQadaa.value = state.customPoints.qadaa;
    els.settingOnTime.value = state.customPoints.onTime;
    els.settingInMosque.value = state.customPoints.inMosque;
    els.settingGhusl.value = state.customPoints.ghusl;
    els.settingQuran.value = state.customPoints.quran;
    els.settingExercise.value = state.customPoints.exercise;
    els.settingStudyPerHour.value = state.customPoints.studyPerHour;
    els.settingStudyPenalty.value = state.customPoints.studyPenalty;
    updateNegativePointsPreview();
    els.settingsModal.setAttribute('aria-hidden', 'false');
  }

  function closeSettingsModal() {
    els.settingsModal.setAttribute('aria-hidden', 'true');
  }

  function updateNegativePointsPreview() {
    const exercise = parseInt(els.settingExercise.value) || 10;
    const quran = parseInt(els.settingQuran.value) || 15;
    const ghusl = parseInt(els.settingGhusl.value) || 25;
    const basePenalty = (exercise + quran + ghusl) * 2;
    els.negMasturbation.textContent = `-${basePenalty}`;
    els.negPorn.textContent = `-${basePenalty * 2}`;
  }

  function saveSettings() {
    state.customPoints.qadaa = parseInt(els.settingQadaa.value) || DEFAULT_POINTS.qadaa;
    state.customPoints.onTime = parseInt(els.settingOnTime.value) || DEFAULT_POINTS.onTime;
    state.customPoints.inMosque = parseInt(els.settingInMosque.value) || DEFAULT_POINTS.inMosque;
    state.customPoints.ghusl = parseInt(els.settingGhusl.value) || DEFAULT_POINTS.ghusl;
    state.customPoints.quran = parseInt(els.settingQuran.value) || DEFAULT_POINTS.quran;
    state.customPoints.exercise = parseInt(els.settingExercise.value) || DEFAULT_POINTS.exercise;
    state.customPoints.studyPerHour = parseInt(els.settingStudyPerHour.value) || DEFAULT_POINTS.studyPerHour;
  state.customPoints.studyPenalty = parseInt(els.settingStudyPenalty.value) || DEFAULT_POINTS.studyPenalty;

  saveState(state);
  updatePointDisplays();
  closeSettingsModal();
  showNotification('Settings saved successfully!', 'success');
}

  function resetSettings() {
  state.customPoints = { ...DEFAULT_POINTS };
  saveState(state);
  openSettingsModal();
  updatePointDisplays();
  showNotification('Settings reset to defaults', 'info');
}

// ============================================================================
// TIMELINE MODAL
// ============================================================================

function openTimelineModal() {
  renderTimeline();
  els.timelineModal.setAttribute('aria-hidden', 'false');
}

function closeTimelineModal() {
  els.timelineModal.setAttribute('aria-hidden', 'true');
}

function renderTimeline() {
  const currentPoints = state.points;
  const { rank: currentRank } = getRankFromPoints(currentPoints);

  els.timelineContainer.innerHTML = '';

  RANKS.forEach((rank, index) => {
    const isCurrent = rank.label === currentRank.label;
    const isCompleted = currentPoints > rank.max;
    const isLocked = currentPoints < rank.min;

    const item = document.createElement('div');
    item.className = `timeline-item ${isCurrent ? 'current' : ''} ${isCompleted ? 'completed' : ''} ${isLocked ? 'locked' : ''}`;

    const img = document.createElement('img');
    img.src = `ranks/${rank.img}`;
    img.alt = rank.label;
    img.className = 'timeline-rank-img';

    const info = document.createElement('div');
    info.className = 'timeline-info';

    const name = document.createElement('div');
    name.className = 'timeline-rank-name';
    name.textContent = rank.label;

    const points = document.createElement('div');
    points.className = 'timeline-points';
    points.textContent = rank.max === Infinity
      ? `${rank.min.toLocaleString()}+ points`
      : `${rank.min.toLocaleString()} - ${rank.max.toLocaleString()} points`;

    info.appendChild(name);
    info.appendChild(points);

    const badge = document.createElement('div');
    badge.className = `timeline-badge ${isCurrent ? 'badge-current' : ''} ${isCompleted ? 'badge-completed' : ''} ${isLocked ? 'badge-locked' : ''}`;
    badge.textContent = isCurrent ? 'Current' : isCompleted ? 'Completed' : 'Locked';

    item.appendChild(img);
    item.appendChild(info);
    item.appendChild(badge);

    els.timelineContainer.appendChild(item);

    // Scroll to current rank
    if (isCurrent) {
      setTimeout(() => {
        item.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  });
}

// ============================================================================
// DETAILS MODAL
// ============================================================================

function openDetailsModal() {
  renderDetails();
  els.detailsModal.setAttribute('aria-hidden', 'false');
}

function closeDetailsModal() {
  els.detailsModal.setAttribute('aria-hidden', 'true');
}

function renderDetails() {
  // Update category totals
  els.detailPrayer.textContent = state.categoryPoints.prayer >= 0
    ? `+${state.categoryPoints.prayer}`
    : state.categoryPoints.prayer;
  els.detailStudy.textContent = state.categoryPoints.study >= 0
    ? `+${state.categoryPoints.study}`
    : state.categoryPoints.study;
  els.detailGood.textContent = state.categoryPoints.good >= 0
    ? `+${state.categoryPoints.good}`
    : state.categoryPoints.good;
  els.detailRelapse.textContent = state.categoryPoints.relapse >= 0
    ? `+${state.categoryPoints.relapse}`
    : state.categoryPoints.relapse;
  els.detailClean.textContent = state.categoryPoints.clean >= 0
    ? `+${state.categoryPoints.clean}`
    : state.categoryPoints.clean;

  // Render activity log
  els.activityLog.innerHTML = '';

  if (state.activityHistory.length === 0) {
    els.activityLog.innerHTML = '<div class="muted small">No activity recorded yet.</div>';
    return;
  }

  const categoryIcons = {
    prayer: '🕌',
    study: '📚',
    good: '✨',
    relapse: '⚠️',
    clean: '⏰',
  };

  state.activityHistory.forEach(activity => {
    const item = document.createElement('div');
    item.className = 'activity-item';

    const info = document.createElement('div');
    info.className = 'activity-info';

    const icon = document.createElement('div');
    icon.className = 'activity-icon';
    icon.textContent = categoryIcons[activity.category] || '📝';

    const textWrapper = document.createElement('div');

    const text = document.createElement('div');
    text.className = 'activity-text';
    text.textContent = activity.description;

    const time = document.createElement('div');
    time.className = 'activity-time';
    time.textContent = formatTime(activity.timestamp);

    textWrapper.appendChild(text);
    textWrapper.appendChild(time);

    info.appendChild(icon);
    info.appendChild(textWrapper);

    const pointsEl = document.createElement('div');
    pointsEl.className = `activity-points ${activity.points >= 0 ? 'positive' : 'negative'}`;
    pointsEl.textContent = activity.points >= 0 ? `+${activity.points}` : activity.points;

    item.appendChild(info);
    item.appendChild(pointsEl);

    els.activityLog.appendChild(item);
  });
}

// ============================================================================
// CONFIRM MODAL & NOTIFICATIONS
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
  a.download = `lockin-backup-${Date.now()}.json`;
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
      if (imported.version === 3) {
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
  // Prayer actions
  els.logQadaa.addEventListener('click', logQadaaPrayer);
  els.logOnTime.addEventListener('click', logOnTimePrayer);
  els.logInMosque.addEventListener('click', logInMosquePrayer);

  // Study
  els.submitStudy.addEventListener('click', submitStudyHours);
  els.studyHours.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') submitStudyHours();
  });

  // Good deeds
  els.logGhusl.addEventListener('click', logGhusl);
  els.logQuran.addEventListener('click', logQuran);
  els.logExercise.addEventListener('click', logExercise);

  // Relapses
  els.logMasturbation.addEventListener('click', logMasturbation);
  els.logPorn.addEventListener('click', logPorn);

  // Settings modal
  els.settingsBtn.addEventListener('click', openSettingsModal);
  els.settingsClose.addEventListener('click', closeSettingsModal);
  els.settingsSave.addEventListener('click', saveSettings);
  els.settingsReset.addEventListener('click', resetSettings);
  els.settingsModal.addEventListener('click', (e) => {
    if (e.target === els.settingsModal) closeSettingsModal();
  });

  // Update negative points preview on input change
  [els.settingExercise, els.settingQuran, els.settingGhusl].forEach(input => {
    input.addEventListener('input', updateNegativePointsPreview);
  });

  // Timeline modal
  els.timelineBtn.addEventListener('click', openTimelineModal);
  els.timelineClose.addEventListener('click', closeTimelineModal);
  els.timelineCloseBtn.addEventListener('click', closeTimelineModal);
  els.timelineModal.addEventListener('click', (e) => {
    if (e.target === els.timelineModal) closeTimelineModal();
  });

  // Details modal
  els.detailsBtn.addEventListener('click', openDetailsModal);
  els.detailsClose.addEventListener('click', closeDetailsModal);
  els.detailsCloseBtn.addEventListener('click', closeDetailsModal);
  els.detailsModal.addEventListener('click', (e) => {
    if (e.target === els.detailsModal) closeDetailsModal();
  });

  // Data management
  els.exportBtn.addEventListener('click', exportData);
  els.importBtn.addEventListener('click', importData);
  els.importFile.addEventListener('change', handleImport);
  els.resetBtn.addEventListener('click', resetAll);

  // Confirm modal
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

checkDayRollover();
updateCleanHours();
initListeners();
renderAll();
startTicker();

console.log('Lock In — Winter Arc initialized ✓');
}) ();
