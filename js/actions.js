/**
 * Actions Module
 * Handles all user actions and interactions
 */

import { PRAYER_NAMES } from './config.js';
import {
  getState,
  addPointsToState,
  resetCleanDays,
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
  addPointsToState(10, 'prayer', `${prayerName} Qadaa logged`);
  state.prayersLoggedToday++;
  state.counts.qadaa++;
  saveState(state);

  showNotification(`${prayerName} Qadaa logged (+10 points)`, 'success');
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
  addPointsToState(20, 'prayer', `${prayerName} on time`);
  state.prayersLoggedToday++;
  state.counts.onTime++;
  saveState(state);

  showNotification(`${prayerName} on time (+20 points)`, 'success');
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
  addPointsToState(30, 'prayer', `${prayerName} in mosque`);
  state.prayersLoggedToday++;
  state.counts.inMosque++;
  saveState(state);

  showNotification(`${prayerName} in mosque (+30 points)`, 'success');
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
  const oldPoints = Math.floor(oldHours * 20);

  const newPoints = Math.floor(parsedHours * 20);

  const pointDiff = newPoints - oldPoints;

  state.todayStudyHours = parsedHours;
  state.counts.studyHours = parsedHours;
  addPointsToState(pointDiff, 'study', `Study updated: ${parsedHours}h`);
  saveState(state);

  showNotification(`Study updated: ${parsedHours}h (+${newPoints} points total)`, 'success');

  return true;
}

/**
 * Logs Twaba (Ghusl + Doaa) performed (once per day)
 * @returns {boolean} True if successful
 */
export function logTwaba() {
  const state = getState();

  // Check if Twaba already logged today
  const hasTwabaToday = state.activityHistory.some(a =>
    a.description.includes('Twaba') &&
    new Date(a.timestamp).toDateString() === new Date().toDateString()
  );

  if (hasTwabaToday) {
    showNotification('Twaba already logged today!', 'info');
    return false;
  }

  addPointsToState(30, 'good', 'Twaba performed');
  saveState(state);
  showNotification(`Twaba logged (+30 points)`, 'success');
  return true;
}

/**
 * Logs Quran reading (once per day)
 * @returns {boolean} True if successful
 */
export function logQuran() {
  const state = getState();

  // Check if Quran already logged today
  const hasQuranToday = state.activityHistory.some(a =>
    a.description.includes('Quran') &&
    new Date(a.timestamp).toDateString() === new Date().toDateString()
  );

  if (hasQuranToday) {
    showNotification('Quran reading already logged today!', 'info');
    return false;
  }

  addPointsToState(20, 'good', 'Quran reading');
  saveState(state);
  showNotification(`Quran reading logged (+20 points)`, 'success');
  return true;
}

/**
 * Logs workout completed (once per day)
 * @returns {boolean} True if successful
 */
export function logWorkout() {
  const state = getState();

  // Check if workout already logged today
  const hasWorkedOutToday = state.activityHistory.some(a =>
    a.description.includes('Workout') &&
    new Date(a.timestamp).toDateString() === new Date().toDateString()
  );

  if (hasWorkedOutToday) {
    showNotification('Workout already logged today!', 'info');
    return false;
  }

  addPointsToState(40, 'good', 'Workout completed');
  state.counts.workouts++;
  saveState(state);
  showNotification(`Workout logged (+40 points)`, 'success');
  return true;
}

/**
 * Logs a masturbation relapse
 * @returns {Object} Penalty amount and confirmation message
 */
export function getMasturbationRelapseInfo() {
  const penalty = 80;
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
  const penalty = 80;
  addPointsToState(-penalty, 'relapse', 'Masturbation relapse');
  state.counts.masturbation++;
  resetCleanDays();
  saveState(state);
  showNotification(`Masturbation relapse logged (-${penalty} points)`, 'warning');
  return true;
}

/**
 * Logs a porn relapse
 * @returns {Object} Penalty amount and confirmation message
 */
export function getPornRelapseInfo() {
  const penalty = 200;
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
  const penalty = 200;
  addPointsToState(-penalty, 'relapse', 'Porn relapse');
  state.counts.porn++;
  resetCleanDays();
  saveState(state);
  showNotification(`Porn relapse logged (-${penalty} points). Immediate Twaba gives points back!`, 'warning');
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
