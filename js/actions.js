/**
 * Actions Module
 * Handles all user actions and interactions
 */

import { PRAYER_NAMES } from './config.js';
import {
  getState,
  addPointsToState,
  resetCleanHours,
  checkDayRollover,
} from './state.js';
import { saveState, clearStorage } from './storage.js';
import { showNotification } from './ui/notifications.js';
import { safeParseFloat, safeParseInt } from './utils.js';

/**
 * Logs a Qadaa prayer
 * @returns {boolean} True if successful, false otherwise
 */
export function logQadaaPrayer() {
  const state = getState();

  if (state.prayersLoggedToday >= 5) {
    showNotification('All 5 prayers already logged today!', 'info');
    return false;
  }

  const prayerName = PRAYER_NAMES[state.prayersLoggedToday];
  addPointsToState(state.customPoints.qadaa, 'prayer', `${prayerName} Qadaa logged`);
  state.prayersLoggedToday++;
  saveState(state);

  showNotification(`${prayerName} Qadaa logged (+${state.customPoints.qadaa} points)`, 'success');
  return true;
}

/**
 * Logs an on-time prayer
 * @returns {boolean} True if successful, false otherwise
 */
export function logOnTimePrayer() {
  const state = getState();

  if (state.prayersLoggedToday >= 5) {
    showNotification('All 5 prayers already logged today!', 'info');
    return false;
  }

  const prayerName = PRAYER_NAMES[state.prayersLoggedToday];
  addPointsToState(state.customPoints.onTime, 'prayer', `${prayerName} on time`);
  state.prayersLoggedToday++;
  saveState(state);

  showNotification(`${prayerName} on time (+${state.customPoints.onTime} points)`, 'success');
  return true;
}

/**
 * Logs a prayer performed in the mosque
 * @returns {boolean} True if successful, false otherwise
 */
export function logInMosquePrayer() {
  const state = getState();

  if (state.prayersLoggedToday >= 5) {
    showNotification('All 5 prayers already logged today!', 'info');
    return false;
  }

  const prayerName = PRAYER_NAMES[state.prayersLoggedToday];
  addPointsToState(state.customPoints.inMosque, 'prayer', `${prayerName} in mosque`);
  state.prayersLoggedToday++;
  saveState(state);

  showNotification(`${prayerName} in mosque (+${state.customPoints.inMosque} points)`, 'success');
  return true;
}

/**
 * Submits study hours for the day
 * @param {number} hours - Number of hours studied
 * @returns {boolean} True if successful, false otherwise
 */
export function submitStudyHours(hours) {
  const state = getState();
  const parsedHours = safeParseFloat(hours, -1);

  if (parsedHours < 0 || parsedHours > 24) {
    showNotification('Please enter valid hours (0-24)', 'error');
    return false;
  }

  const oldHours = state.todayStudyHours;
  const oldPoints = oldHours < 2
    ? -state.customPoints.studyPenalty
    : Math.floor(oldHours * state.customPoints.studyPerHour);

  const newPoints = parsedHours < 2
    ? -state.customPoints.studyPenalty
    : Math.floor(parsedHours * state.customPoints.studyPerHour);

  const pointDiff = newPoints - oldPoints;

  state.todayStudyHours = parsedHours;
  addPointsToState(pointDiff, 'study', `Study updated: ${parsedHours}h`);
  saveState(state);

  if (parsedHours < 2) {
    showNotification(`Study updated: ${parsedHours}h (below threshold, penalty applied)`, 'warning');
  } else {
    showNotification(`Study updated: ${parsedHours}h (+${newPoints} points total)`, 'success');
  }

  return true;
}

/**
 * Logs Ghusl performed
 * @returns {boolean} True if successful
 */
export function logGhusl() {
  const state = getState();
  addPointsToState(state.customPoints.ghusl, 'good', 'Ghusl performed');
  saveState(state);
  showNotification(`Ghusl logged (+${state.customPoints.ghusl} points)`, 'success');
  return true;
}

/**
 * Logs Quran reading
 * @returns {boolean} True if successful
 */
export function logQuran() {
  const state = getState();
  addPointsToState(state.customPoints.quran, 'good', 'Quran reading');
  saveState(state);
  showNotification(`Quran reading logged (+${state.customPoints.quran} points)`, 'success');
  return true;
}

/**
 * Logs exercise completed
 * @returns {boolean} True if successful
 */
export function logExercise() {
  const state = getState();
  addPointsToState(state.customPoints.exercise, 'good', 'Exercise completed');
  saveState(state);
  showNotification(`Exercise logged (+${state.customPoints.exercise} points)`, 'success');
  return true;
}

/**
 * Logs a masturbation relapse
 * @returns {Object} Penalty amount and confirmation message
 */
export function getMasturbationRelapseInfo() {
  const state = getState();
  const penalty = (state.customPoints.exercise + state.customPoints.quran + state.customPoints.ghusl) * 2;
  return {
    penalty,
    message: `Log masturbation relapse? This will deduct ${penalty} points.`,
  };
}

/**
 * Confirms and logs masturbation relapse
 * @returns {boolean} True if successful
 */
export function confirmMasturbationRelapse() {
  const state = getState();
  const penalty = (state.customPoints.exercise + state.customPoints.quran + state.customPoints.ghusl) * 2;
  addPointsToState(-penalty, 'relapse', 'Masturbation relapse');
  resetCleanHours();
  saveState(state);
  showNotification(`Masturbation relapse logged (-${penalty} points)`, 'warning');
  return true;
}

/**
 * Logs a porn relapse
 * @returns {Object} Penalty amount and confirmation message
 */
export function getPornRelapseInfo() {
  const state = getState();
  const penalty = (state.customPoints.exercise + state.customPoints.quran + state.customPoints.ghusl) * 4;
  return {
    penalty,
    message: `Log porn relapse? This will deduct ${penalty} points.`,
  };
}

/**
 * Confirms and logs porn relapse
 * @returns {boolean} True if successful
 */
export function confirmPornRelapse() {
  const state = getState();
  const penalty = (state.customPoints.exercise + state.customPoints.quran + state.customPoints.ghusl) * 4;
  addPointsToState(-penalty, 'relapse', 'Porn relapse');
  resetCleanHours();
  saveState(state);
  showNotification(`Porn relapse logged (-${penalty} points). Immediate Ghusl gives points back!`, 'warning');
  return true;
}

/**
 * Updates custom point values
 * @param {Object} customPoints - New custom point values
 * @returns {boolean} True if successful
 */
export function updateCustomPoints(customPoints) {
  const state = getState();
  state.customPoints = { ...state.customPoints, ...customPoints };
  saveState(state);
  return true;
}

/**
 * Resets custom points to default values
 * @param {Object} defaultPoints - Default point values
 * @returns {boolean} True if successful
 */
export function resetCustomPoints(defaultPoints) {
  const state = getState();
  state.customPoints = { ...defaultPoints };
  saveState(state);
  return true;
}

/**
 * Performs daily rollover check
 * @returns {boolean} True if rollover occurred
 */
export function performDayRollover() {
  const changed = checkDayRollover();
  if (changed) {
    saveState(getState());
  }
  return changed;
}

/**
 * Resets all application data
 * @param {Function} createDefaultState - Function to create default state
 * @returns {boolean} True if successful
 */
export function resetAllData(createDefaultState) {
  clearStorage();
  const newState = createDefaultState();
  saveState(newState);
  return true;
}
