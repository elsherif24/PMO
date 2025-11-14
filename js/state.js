/**
 * State Management Module
 * Handles application state and provides getter/setter functions
 */

import { DEFAULT_POINTS, STATE_VERSION } from './config.js';
import { getTodayISO } from './utils.js';

// Application State
let appState = null;

/**
 * Creates a new default state object
 * @returns {Object} Default state structure
 */
export function createDefaultState() {
  return {
    version: STATE_VERSION,
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

/**
 * Initializes the application state
 * @param {Object} initialState - Optional initial state to use
 */
export function initState(initialState = null) {
  if (initialState) {
    appState = initialState;
  } else {
    appState = createDefaultState();
  }
}

/**
 * Gets the current application state
 * @returns {Object} Current state
 */
export function getState() {
  if (!appState) {
    initState();
  }
  return appState;
}

/**
 * Sets the entire application state
 * @param {Object} newState - New state object
 */
export function setState(newState) {
  appState = newState;
}

/**
 * Updates specific properties in the state
 * @param {Object} updates - Object with properties to update
 */
export function updateState(updates) {
  if (!appState) {
    initState();
  }
  appState = { ...appState, ...updates };
}

/**
 * Adds points to the state and updates category points
 * @param {number} amount - Points to add (can be negative)
 * @param {string} category - Category name (prayer, study, good, relapse, clean)
 * @param {string} description - Description of the action
 */
export function addPointsToState(amount, category, description) {
  if (!appState) {
    initState();
  }

  // Update total and today's points
  appState.points += amount;
  appState.todayPoints += amount;

  // Update category points
  if (category && appState.categoryPoints[category] !== undefined) {
    appState.categoryPoints[category] += amount;
  }

  // Log activity to history
  if (description) {
    appState.activityHistory.unshift({
      timestamp: Date.now(),
      description,
      points: amount,
      category,
    });

    // Keep only last 50 activities
    if (appState.activityHistory.length > 50) {
      appState.activityHistory = appState.activityHistory.slice(0, 50);
    }
  }
}

/**
 * Resets the state to default values
 */
export function resetState() {
  appState = createDefaultState();
}

/**
 * Checks if the day has changed and resets daily counters
 * @returns {boolean} True if day changed, false otherwise
 */
export function checkDayRollover() {
  if (!appState) {
    return false;
  }

  const today = getTodayISO();
  if (appState.todayDate !== today) {
    appState.todayDate = today;
    appState.prayersLoggedToday = 0;
    appState.todayPoints = -100;
    appState.points -= 100;
    appState.todayStudyHours = 0;
    appState.categoryPoints.study = -100;

    // Add daily penalty to activity history
    appState.activityHistory.unshift({
      timestamp: Date.now(),
      description: 'New day started (daily penalty applied)',
      points: 0,
      category: null,
    });

    return true;
  }

  return false;
}

/**
 * Updates clean hours counter
 * @returns {number} Number of hours added
 */
export function updateCleanHours() {
  if (!appState) {
    return 0;
  }

  const now = Date.now();
  const elapsed = now - appState.lastCleanHourUpdate;
  const hours = Math.floor(elapsed / (1000 * 60 * 60));

  if (hours > 0) {
    addPointsToState(hours, 'clean', `${hours} clean hour${hours > 1 ? 's' : ''}`);
    appState.lastCleanHourUpdate = now;
  }

  return hours;
}

/**
 * Gets the number of clean hours since last relapse
 * @returns {number} Clean hours count
 */
export function getCleanHours() {
  if (!appState) {
    return 0;
  }

  const now = Date.now();
  const elapsed = now - appState.lastCleanHourUpdate;
  return Math.floor(elapsed / (1000 * 60 * 60));
}

/**
 * Resets clean hours counter (called on relapse)
 */
export function resetCleanHours() {
  if (!appState) {
    return;
  }
  appState.lastCleanHourUpdate = Date.now();
}
