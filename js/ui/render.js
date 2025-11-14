/**
 * Render UI Module
 * Handles all DOM updates and visual state rendering
 */

import { getState, getCleanDays } from '../state.js';
import { getRankFromPoints, calculateRankProgress, formatNumber, $ } from '../utils.js';
import { PRAYER_NAMES } from '../config.js';

/**
 * Renders all UI components
 */
export function renderAll() {
  renderRank();
  renderProgress();
  renderPrayerDebt();
  renderStudyStatus();
  renderStats();
  updatePointDisplays();
  renderOncePerDayButtons();
}

/**
 * Renders the rank display section
 */
export function renderRank() {
  const state = getState();
  const { rank, next } = getRankFromPoints(state.points);

  const rankBadge = $('#rankBadge');
  const rankLabel = $('#rankLabel');
  const rankImageLarge = $('#rankImageLarge');
  const currentPoints = $('#currentPoints');
  const nextRankPoints = $('#nextRankPoints');
  const nextRankLabel = $('#nextRankLabel');

  if (rankBadge) rankBadge.textContent = rank.label;
  if (rankLabel) rankLabel.textContent = rank.label;

  if (rankImageLarge) {
    rankImageLarge.src = `./images/ranks/${rank.img}`;
    rankImageLarge.alt = rank.label;
  }

  if (currentPoints) {
    currentPoints.textContent = formatNumber(state.points);
  }

  if (next) {
    if (nextRankPoints) nextRankPoints.textContent = formatNumber(next.min);
    if (nextRankLabel) nextRankLabel.textContent = next.label;
  } else {
    if (nextRankPoints) nextRankPoints.textContent = '∞';
    if (nextRankLabel) nextRankLabel.textContent = 'Max Rank';
  }
}

/**
 * Renders the progress bar
 */
export function renderProgress() {
  const state = getState();
  const percentage = calculateRankProgress(state.points);

  const progressBar = $('#progressBar');
  const progressText = $('#progressText');

  if (progressBar) {
    progressBar.style.width = `${percentage}%`;
  }

  if (progressText) {
    progressText.textContent = `${percentage}%`;
  }
}

/**
 * Renders the prayer debt counter
 */
export function renderPrayerDebt() {
  const state = getState();
  const remaining = 5 - state.prayersLoggedToday;

  const debtCount = $('#debtCount');
  const logQadaa = $('#logQadaa');
  const logOnTime = $('#logOnTime');
  const logInMosque = $('#logInMosque');

  if (debtCount) {
    if (remaining === 0) {
      debtCount.textContent = 'Complete! ✓';
      debtCount.style.color = 'var(--green)';
    } else {
      const nextPrayer = PRAYER_NAMES[state.prayersLoggedToday];
      debtCount.textContent = nextPrayer;
      debtCount.style.color = 'var(--accent)';
    }
  }

  const disabled = state.prayersLoggedToday >= 5;
  const prayerButtons = [logQadaa, logOnTime, logInMosque];

  prayerButtons.forEach(btn => {
    if (btn) {
      btn.disabled = disabled;
      btn.style.opacity = disabled ? '0.5' : '1';
      btn.style.cursor = disabled ? 'not-allowed' : 'pointer';
    }
  });
}

/**
 * Renders the study status display
 */
export function renderStudyStatus() {
  const state = getState();
  const studyStatus = $('#studyStatus');

  if (!studyStatus) return;

  if (state.todayStudyHours === 0) {
    studyStatus.textContent = 'Not logged today';
    studyStatus.style.color = 'var(--muted)';
  } else {
    const hours = state.todayStudyHours;
    const status = `${hours}h logged (+${Math.floor(hours * 20)} points)`;

    studyStatus.textContent = status;
    studyStatus.style.color = 'var(--green)';
  }
}

/**
 * Renders the stats summary section
 */
export function renderStats() {
  const state = getState();
  const pointsToday = $('#pointsToday');
  const prayersToday = $('#prayersToday');
  const studyToday = $('#studyToday');
  const workoutsToday = $('#workoutsToday');

  if (pointsToday) {
    const sign = state.todayPoints >= 0 ? '+' : '';
    pointsToday.textContent = sign + state.todayPoints;
    pointsToday.style.color = state.todayPoints >= 0 ? 'var(--green)' : 'var(--red)';
  }

  if (prayersToday) {
    prayersToday.textContent = `${state.prayersLoggedToday}/5`;
    prayersToday.style.color = state.prayersLoggedToday >= 5 ? 'var(--green)' : 'var(--accent)';
  }

  if (studyToday) {
    studyToday.textContent = state.todayStudyHours || 0;
    studyToday.style.color = state.todayStudyHours > 0 ? 'var(--green)' : 'var(--muted)';
  }

  if (workoutsToday) {
    const hasWorkedOut = state.activityHistory.some(a =>
      a.description.includes('Workout') &&
      new Date(a.timestamp).toDateString() === new Date().toDateString()
    );
    workoutsToday.textContent = hasWorkedOut ? '✓' : '✗';
    workoutsToday.style.color = hasWorkedOut ? 'var(--green)' : 'var(--muted)';
  }
}

/**
 * Updates all point display elements
 */
export function updatePointDisplays() {
  const pointDisplays = {
    pointsQadaa: `+10`,
    pointsOnTime: `+20`,
    pointsInMosque: `+30`,
    pointsTwaba: `+30`,
    pointsQuran: `+20`,
    pointsWorkout: `+40`,
    pointsMasturbation: `-80`,
    pointsPorn: `-200`,
  };

  Object.entries(pointDisplays).forEach(([id, value]) => {
    const element = $(`#${id}`);
    if (element) {
      element.textContent = value;
    }
  });
}

/**
 * Renders once-per-day button states (Twaba, Quran, Workout)
 */
export function renderOncePerDayButtons() {
  const state = getState();
  const today = new Date().toDateString();

  // Check Twaba
  const hasTwabaToday = state.activityHistory.some(a =>
    a.description.includes('Twaba') &&
    new Date(a.timestamp).toDateString() === today
  );
  updateButtonState('logTwaba', 'labelTwaba', 'pointsTwaba', hasTwabaToday);

  // Check Quran
  const hasQuranToday = state.activityHistory.some(a =>
    a.description.includes('Quran') &&
    new Date(a.timestamp).toDateString() === today
  );
  updateButtonState('logQuran', 'labelQuran', 'pointsQuran', hasQuranToday);

  // Check Workout
  const hasWorkoutToday = state.activityHistory.some(a =>
    a.description.includes('Workout') &&
    new Date(a.timestamp).toDateString() === today
  );
  updateButtonState('logWorkout', 'labelWorkout', 'pointsWorkout', hasWorkoutToday);
}

/**
 * Updates button state to show completed or available
 * @param {string} buttonId - Button element ID
 * @param {string} labelId - Label element ID
 * @param {string} pointsId - Points element ID
 * @param {boolean} isComplete - Whether action is complete
 */
function updateButtonState(buttonId, labelId, pointsId, isComplete) {
  const button = $(`#${buttonId}`);
  const label = $(`#${labelId}`);
  const points = $(`#${pointsId}`);

  if (!button || !label || !points) return;

  if (isComplete) {
    button.disabled = true;
    button.style.opacity = '0.5';
    button.style.cursor = 'not-allowed';
    label.textContent = 'Complete';
    points.style.display = 'none';
  } else {
    button.disabled = false;
    button.style.opacity = '1';
    button.style.cursor = 'pointer';
    // Restore original labels
    if (buttonId === 'logTwaba') label.textContent = 'Twaba';
    if (buttonId === 'logQuran') label.textContent = 'Quran';
    if (buttonId === 'logWorkout') label.textContent = 'Workout';
    points.style.display = '';
  }
}

/**
 * Animates point changes
 * @param {number} amount - Point amount (positive or negative)
 */
export function animatePointChange(amount) {
  const currentPoints = $('#currentPoints');
  if (!currentPoints) return;

  const className = amount > 0 ? 'points-animate-gain' : 'points-animate-loss';
  currentPoints.classList.add(className);

  setTimeout(() => {
    currentPoints.classList.remove(className);
  }, 400);
}

/**
 * Refreshes the entire UI
 */
export function refresh() {
  renderAll();
}
