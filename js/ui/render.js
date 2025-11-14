/**
 * Render UI Module
 * Handles all DOM updates and visual state rendering
 */

import { getState, getCleanHours } from '../state.js';
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
    const status = hours < 2
      ? `${hours}h logged (below 2h threshold: -${state.customPoints.studyPenalty}pts)`
      : `${hours}h logged (+${Math.floor(hours * state.customPoints.studyPerHour)} points)`;

    studyStatus.textContent = status;
    studyStatus.style.color = hours < 2 ? 'var(--yellow)' : 'var(--green)';
  }
}

/**
 * Renders the stats summary section
 */
export function renderStats() {
  const state = getState();
  const pointsToday = $('#pointsToday');
  const cleanHoursValue = $('#cleanHoursValue');

  if (pointsToday) {
    const sign = state.todayPoints >= 0 ? '+' : '';
    pointsToday.textContent = sign + state.todayPoints;
    pointsToday.style.color = state.todayPoints >= 0 ? 'var(--green)' : 'var(--red)';
  }

  if (cleanHoursValue) {
    const cleanHours = getCleanHours();
    cleanHoursValue.textContent = cleanHours;
    cleanHoursValue.style.color = cleanHours > 24 ? 'var(--green)' : 'var(--accent)';
  }
}

/**
 * Updates all point display elements
 */
export function updatePointDisplays() {
  const state = getState();
  const cp = state.customPoints;

  const pointDisplays = {
    pointsQadaa: `+${cp.qadaa}`,
    pointsOnTime: `+${cp.onTime}`,
    pointsInMosque: `+${cp.inMosque}`,
    pointsGhusl: `+${cp.ghusl}`,
    pointsQuran: `+${cp.quran}`,
    pointsExercise: `+${cp.exercise}`,
    pointsMasturbation: `-${cp.exercise * 2 + cp.quran * 2 + cp.ghusl * 2}`,
    pointsPorn: `-${(cp.exercise * 2 + cp.quran * 2 + cp.ghusl * 2) * 2}`,
  };

  Object.entries(pointDisplays).forEach(([id, value]) => {
    const element = $(`#${id}`);
    if (element) {
      element.textContent = value;
    }
  });
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
