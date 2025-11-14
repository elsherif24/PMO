/**
 * Storage Module
 * Handles localStorage persistence and data migration
 */

import { STORAGE_KEY, STATE_VERSION } from './config.js';
import { createDefaultState, initState } from './state.js';
import { getTodayISO } from './utils.js';

/**
 * Loads state from localStorage
 * @returns {Object} Loaded or default state
 */
export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return createDefaultState();
    }

    const parsed = JSON.parse(raw);

    // Check version and migrate if necessary
    if (parsed.version !== STATE_VERSION) {
      return migrateState(parsed);
    }

    return parsed;
  } catch (error) {
    console.error('Failed to load state from localStorage:', error);
    return createDefaultState();
  }
}

/**
 * Saves state to localStorage
 * @param {Object} state - State object to save
 * @returns {boolean} True if successful, false otherwise
 */
export function saveState(state) {
  try {
    const json = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, json);
    return true;
  } catch (error) {
    console.error('Failed to save state to localStorage:', error);
    return false;
  }
}

/**
 * Clears all data from localStorage
 * @returns {boolean} True if successful, false otherwise
 */
export function clearStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear localStorage:', error);
    return false;
  }
}

/**
 * Exports state as JSON string
 * @param {Object} state - State to export
 * @returns {string} JSON string representation
 */
export function exportStateAsJSON(state) {
  try {
    return JSON.stringify(state, null, 2);
  } catch (error) {
    console.error('Failed to export state:', error);
    return null;
  }
}

/**
 * Imports state from JSON string
 * @param {string} jsonString - JSON string to import
 * @returns {Object|null} Parsed state or null if invalid
 */
export function importStateFromJSON(jsonString) {
  try {
    const parsed = JSON.parse(jsonString);

    // Validate the imported data
    if (!validateImportedState(parsed)) {
      throw new Error('Invalid state structure');
    }

    // Migrate if necessary
    if (parsed.version !== STATE_VERSION) {
      return migrateState(parsed);
    }

    return parsed;
  } catch (error) {
    console.error('Failed to import state:', error);
    return null;
  }
}

/**
 * Validates imported state structure
 * @param {Object} state - State to validate
 * @returns {boolean} True if valid, false otherwise
 */
function validateImportedState(state) {
  if (!state || typeof state !== 'object') {
    return false;
  }

  // Check for required properties
  const requiredProps = ['version', 'points', 'customPoints'];
  for (const prop of requiredProps) {
    if (!(prop in state)) {
      return false;
    }
  }

  return true;
}

/**
 * Migrates old state versions to current version
 * @param {Object} oldState - Old state object
 * @returns {Object} Migrated state
 */
function migrateState(oldState) {
  console.log(`Migrating state from version ${oldState.version || 'unknown'} to ${STATE_VERSION}`);

  const newState = createDefaultState();

  // Preserve core data
  newState.points = oldState.points || 0;
  newState.prayersLoggedToday = oldState.prayersLoggedToday || 0;
  newState.lastCleanHourUpdate = oldState.lastCleanHourUpdate || Date.now();
  newState.todayDate = oldState.todayDate || getTodayISO();
  newState.todayPoints = oldState.todayPoints || 0;
  newState.todayStudyHours = oldState.todayStudyHours || 0;

  // Preserve custom points if they exist
  if (oldState.customPoints) {
    newState.customPoints = { ...newState.customPoints, ...oldState.customPoints };
  }

  // Preserve category points if they exist
  if (oldState.categoryPoints) {
    newState.categoryPoints = { ...newState.categoryPoints, ...oldState.categoryPoints };
  }

  // Preserve activity history if it exists
  if (oldState.activityHistory && Array.isArray(oldState.activityHistory)) {
    newState.activityHistory = oldState.activityHistory.slice(0, 50);
  }

  return newState;
}

/**
 * Gets the storage size in bytes
 * @returns {number} Size in bytes
 */
export function getStorageSize() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? new Blob([data]).size : 0;
  } catch (error) {
    console.error('Failed to get storage size:', error);
    return 0;
  }
}

/**
 * Checks if localStorage is available
 * @returns {boolean} True if available, false otherwise
 */
export function isStorageAvailable() {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (error) {
    return false;
  }
}
