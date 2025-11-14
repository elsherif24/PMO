/**
 * Main Application Entry Point
 * Initializes the application, sets up event listeners, and starts background processes
 */

import { loadState, saveState, exportStateAsJSON, importStateFromJSON } from './storage.js';
import { initState, getState, updateCleanHours, checkDayRollover } from './state.js';
import {
  logQadaaPrayer,
  logOnTimePrayer,
  logInMosquePrayer,
  submitStudyHours,
  logGhusl,
  logQuran,
  logExercise,
  getMasturbationRelapseInfo,
  confirmMasturbationRelapse,
  getPornRelapseInfo,
  confirmPornRelapse,
  resetAllData,
} from './actions.js';
import { renderAll, animatePointChange } from './ui/render.js';
import { showNotification } from './ui/notifications.js';
import { setupModalListeners, showConfirmModal } from './ui/modals.js';
import { createDefaultState } from './state.js';
import { $ } from './utils.js';

/**
 * Initialize the application
 */
function init() {
  console.log('🚀 Lock In - Winter Arc Tracker initialized');

  // Load state from localStorage
  const savedState = loadState();
  initState(savedState);

  // Check for day rollover
  checkDayRollover();
  updateCleanHours();

  // Render initial UI
  renderAll();

  // Setup all event listeners
  setupEventListeners();
  setupModalListeners();

  // Start background ticker
  startBackgroundTicker();

  console.log('✅ Application ready');
}

/**
 * Sets up all event listeners for the application
 */
function setupEventListeners() {
  // Prayer tracking buttons
  $('#logQadaa')?.addEventListener('click', handleLogQadaa);
  $('#logOnTime')?.addEventListener('click', handleLogOnTime);
  $('#logInMosque')?.addEventListener('click', handleLogInMosque);

  // Study tracking
  $('#submitStudy')?.addEventListener('click', handleSubmitStudy);
  $('#studyHours')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSubmitStudy();
  });

  // Good deeds buttons
  $('#logGhusl')?.addEventListener('click', handleLogGhusl);
  $('#logQuran')?.addEventListener('click', handleLogQuran);
  $('#logExercise')?.addEventListener('click', handleLogExercise);

  // Relapse buttons
  $('#logMasturbation')?.addEventListener('click', handleLogMasturbation);
  $('#logPorn')?.addEventListener('click', handleLogPorn);

  // Data management buttons
  $('#exportBtn')?.addEventListener('click', handleExport);
  $('#importBtn')?.addEventListener('click', handleImport);
  $('#importFile')?.addEventListener('change', handleFileImport);
  $('#resetBtn')?.addEventListener('click', handleReset);
}

/**
 * Prayer action handlers
 */
function handleLogQadaa() {
  const success = logQadaaPrayer();
  if (success) {
    animatePointChange(getState().customPoints.qadaa);
    renderAll();
  }
}

function handleLogOnTime() {
  const success = logOnTimePrayer();
  if (success) {
    animatePointChange(getState().customPoints.onTime);
    renderAll();
  }
}

function handleLogInMosque() {
  const success = logInMosquePrayer();
  if (success) {
    animatePointChange(getState().customPoints.inMosque);
    renderAll();
  }
}

/**
 * Study action handler
 */
function handleSubmitStudy() {
  const studyHoursInput = $('#studyHours');
  if (!studyHoursInput) return;

  const hours = parseFloat(studyHoursInput.value);
  const success = submitStudyHours(hours);

  if (success) {
    studyHoursInput.value = '';
    renderAll();
  }
}

/**
 * Good deeds handlers
 */
function handleLogGhusl() {
  logGhusl();
  animatePointChange(getState().customPoints.ghusl);
  renderAll();
}

function handleLogQuran() {
  logQuran();
  animatePointChange(getState().customPoints.quran);
  renderAll();
}

function handleLogExercise() {
  logExercise();
  animatePointChange(getState().customPoints.exercise);
  renderAll();
}

/**
 * Relapse handlers with confirmation
 */
function handleLogMasturbation() {
  const { penalty, message } = getMasturbationRelapseInfo();
  showConfirmModal(message, () => {
    confirmMasturbationRelapse();
    animatePointChange(-penalty);
    renderAll();
  });
}

function handleLogPorn() {
  const { penalty, message } = getPornRelapseInfo();
  showConfirmModal(message, () => {
    confirmPornRelapse();
    animatePointChange(-penalty);
    renderAll();
  });
}

/**
 * Export data as JSON file
 */
function handleExport() {
  const state = getState();
  const json = exportStateAsJSON(state);

  if (!json) {
    showNotification('Failed to export data', 'error');
    return;
  }

  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `lockin-backup-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);

  showNotification('Data exported successfully', 'success');
}

/**
 * Trigger file input for import
 */
function handleImport() {
  const importFile = $('#importFile');
  if (importFile) {
    importFile.click();
  }
}

/**
 * Handle file import
 */
function handleFileImport(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const imported = importStateFromJSON(e.target.result);

      if (!imported) {
        showNotification('Invalid or outdated backup file', 'error');
        return;
      }

      initState(imported);
      saveState(imported);
      renderAll();
      showNotification('Data imported successfully', 'success');
    } catch (err) {
      showNotification('Failed to import data', 'error');
      console.error('Import error:', err);
    }
  };

  reader.readAsText(file);
  event.target.value = ''; // Reset file input
}

/**
 * Reset all data with confirmation
 */
function handleReset() {
  showConfirmModal('Reset all data? This action cannot be undone!', () => {
    resetAllData(createDefaultState);
    initState(createDefaultState());
    renderAll();
    showNotification('All data reset', 'info');
  });
}

/**
 * Background ticker for automatic updates
 * Runs every minute to check for day rollover and update clean hours
 */
function startBackgroundTicker() {
  setInterval(() => {
    const dayChanged = checkDayRollover();
    if (dayChanged) {
      saveState(getState());
      renderAll();
      showNotification('New day started! Daily stats reset.', 'info');
    }

    const hoursAdded = updateCleanHours();
    if (hoursAdded > 0) {
      saveState(getState());
      renderAll();
    }
  }, 60000); // Every minute

  console.log('⏰ Background ticker started');
}

/**
 * Auto-save state on page unload
 */
window.addEventListener('beforeunload', () => {
  saveState(getState());
});

/**
 * Handle visibility change to update clean hours when tab becomes visible
 */
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    checkDayRollover();
    updateCleanHours();
    renderAll();
  }
});

/**
 * Start the application when DOM is ready
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Export for debugging in console
window.LockIn = {
  getState,
  saveState,
  renderAll,
};
