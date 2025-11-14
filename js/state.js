/**
 * State Management Module
 * Handles application state and provides getter/setter functions
 */

import { STATE_VERSION } from './config.js';
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
    points: 0,
    prayersLoggedToday: 0,
    lastCleanDayUpdate: getTodayISO(),
    todayDate: getTodayISO(),
    todayPoints: 0,
    todayStudyHours: 0,
    categoryPoints: {
      prayer: 0,
      study: 0,
      good: 0,
      relapse: 0,
      clean: 0,
    },
    activityHistory: [],
    counts: {
      qadaa: 0,
      onTime: 0,
      inMosque: 0,
      studyHours: 0,
      workouts: 0,
      cleanDays: 0,
      porn: 0,
      masturbation: 0,
    },
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
    appState.todayPoints = 0;
    appState.todayStudyHours = 0;

    // Add daily rollover to activity history
    appState.activityHistory.unshift({
      timestamp: Date.now(),
      description: 'New day started',
      points: 0,
      category: null,
    });

    return true;
  }

  return false;
}

/**
 * Updates clean days counter
 * @returns {number} Number of days added
 */
export function updateCleanDays() {
  if (!appState) {
    return 0;
  }

  const today = getTodayISO();

  // Check if we've already awarded points for today
  if (appState.lastCleanDayUpdate === today) {
    return 0;
  }

  // Calculate days since last update
  const lastDate = new Date(appState.lastCleanDayUpdate);
  const currentDate = new Date(today);
  const daysDiff = Math.floor((currentDate - lastDate) / (1000 * 60 * 60 * 24));

  if (daysDiff > 0) {
    const points = daysDiff * 50;
    addPointsToState(points, 'clean', `${daysDiff} clean day${daysDiff > 1 ? 's' : ''} (+${points} points)`);
    appState.lastCleanDayUpdate = today;
    if (appState.counts) {
      appState.counts.cleanDays += daysDiff;
    }
    return daysDiff;
  }

  return 0;
}

/**
 * Gets the number of clean days since last relapse
 * @returns {number} Clean days count
 */
export function getCleanDays() {
  if (!appState) {
    return 0;
  }

  const today = getTodayISO();
  const lastDate = new Date(appState.lastCleanDayUpdate);
  const currentDate = new Date(today);
  const daysDiff = Math.floor((currentDate - lastDate) / (1000 * 60 * 60 * 24));

  return (appState.counts?.cleanDays || 0) + daysDiff;
}

/**
 * Resets clean days counter (called on relapse)
 */
export function resetCleanDays() {
  if (!appState) {
    return;
  }
  appState.lastCleanDayUpdate = getTodayISO();
  if (appState.counts) {
    appState.counts.cleanDays = 0;
  }
}
