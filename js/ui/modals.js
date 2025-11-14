/**
 * Modals UI Module
 * Handles all modal dialog operations
 */

import { getState, updateState } from '../state.js';
import { saveState } from '../storage.js';
import { DEFAULT_POINTS, RANKS, CATEGORY_ICONS } from '../config.js';
import { formatTime, formatNumber, $ } from '../utils.js';
import { showNotification } from './notifications.js';
import { updatePointDisplays } from './render.js';

// Store pending confirmation action
let pendingConfirmCallback = null;

/**
 * Opens a modal by ID
 * @param {string} modalId - Modal element ID
 */
export function openModal(modalId) {
  const modal = $(`#${modalId}`);
  if (modal) {
    modal.setAttribute('aria-hidden', 'false');
  }
}

/**
 * Closes a modal by ID
 * @param {string} modalId - Modal element ID
 */
export function closeModal(modalId) {
  const modal = $(`#${modalId}`);
  if (modal) {
    modal.setAttribute('aria-hidden', 'true');
  }
}

/**
 * Opens the settings modal
 */
export function openSettingsModal() {
  const state = getState();
  const cp = state.customPoints;

  // Populate settings inputs
  const inputs = {
    settingQadaa: cp.qadaa,
    settingOnTime: cp.onTime,
    settingInMosque: cp.inMosque,
    settingGhusl: cp.ghusl,
    settingQuran: cp.quran,
    settingExercise: cp.exercise,
    settingStudyPerHour: cp.studyPerHour,
    settingStudyPenalty: cp.studyPenalty,
  };

  Object.entries(inputs).forEach(([id, value]) => {
    const input = $(`#${id}`);
    if (input) input.value = value;
  });

  updateNegativePointsPreview();
  openModal('settingsModal');
}

/**
 * Updates the negative points preview in settings
 */
export function updateNegativePointsPreview() {
  const exercise = parseInt($('#settingExercise')?.value) || 10;
  const quran = parseInt($('#settingQuran')?.value) || 15;
  const ghusl = parseInt($('#settingGhusl')?.value) || 25;
  const basePenalty = (exercise + quran + ghusl) * 2;

  const negMasturbation = $('#negMasturbation');
  const negPorn = $('#negPorn');

  if (negMasturbation) negMasturbation.textContent = `-${basePenalty}`;
  if (negPorn) negPorn.textContent = `-${basePenalty * 2}`;
}

/**
 * Saves settings from the settings modal
 */
export function saveSettings() {
  const state = getState();

  const newPoints = {
    qadaa: parseInt($('#settingQadaa')?.value) || DEFAULT_POINTS.qadaa,
    onTime: parseInt($('#settingOnTime')?.value) || DEFAULT_POINTS.onTime,
    inMosque: parseInt($('#settingInMosque')?.value) || DEFAULT_POINTS.inMosque,
    ghusl: parseInt($('#settingGhusl')?.value) || DEFAULT_POINTS.ghusl,
    quran: parseInt($('#settingQuran')?.value) || DEFAULT_POINTS.quran,
    exercise: parseInt($('#settingExercise')?.value) || DEFAULT_POINTS.exercise,
    studyPerHour: parseInt($('#settingStudyPerHour')?.value) || DEFAULT_POINTS.studyPerHour,
    studyPenalty: parseInt($('#settingStudyPenalty')?.value) || DEFAULT_POINTS.studyPenalty,
  };

  state.customPoints = newPoints;
  saveState(state);
  updatePointDisplays();
  closeModal('settingsModal');
  showNotification('Settings saved successfully!', 'success');
}

/**
 * Resets settings to default values
 */
export function resetSettings() {
  const state = getState();
  state.customPoints = { ...DEFAULT_POINTS };
  saveState(state);
  openSettingsModal();
  updatePointDisplays();
  showNotification('Settings reset to defaults', 'info');
}

/**
 * Opens the timeline modal and renders ranks
 */
export function openTimelineModal() {
  renderTimeline();
  openModal('timelineModal');
}

/**
 * Renders the timeline of ranks
 */
function renderTimeline() {
  const state = getState();
  const currentPoints = state.points;
  const container = $('#timelineContainer');

  if (!container) return;

  container.innerHTML = '';

  RANKS.forEach((rank, index) => {
    const isCurrent = currentPoints >= rank.min && currentPoints <= rank.max;
    const isCompleted = currentPoints > rank.max;
    const isLocked = currentPoints < rank.min;

    const item = document.createElement('div');
    item.className = `timeline-item ${isCurrent ? 'current' : ''} ${isCompleted ? 'completed' : ''} ${isLocked ? 'locked' : ''}`;

    const img = document.createElement('img');
    img.src = `./images/ranks/${rank.img}`;
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
      ? `${formatNumber(rank.min)}+ points`
      : `${formatNumber(rank.min)} - ${formatNumber(rank.max)} points`;

    info.appendChild(name);
    info.appendChild(points);

    const badge = document.createElement('div');
    badge.className = `timeline-badge ${isCurrent ? 'badge-current' : ''} ${isCompleted ? 'badge-completed' : ''} ${isLocked ? 'badge-locked' : ''}`;
    badge.textContent = isCurrent ? 'Current' : isCompleted ? 'Completed' : 'Locked';

    item.appendChild(img);
    item.appendChild(info);
    item.appendChild(badge);

    container.appendChild(item);

    // Scroll to current rank
    if (isCurrent) {
      setTimeout(() => {
        item.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  });
}

/**
 * Opens the details modal
 */
export function openDetailsModal() {
  renderDetails();
  openModal('detailsModal');
}

/**
 * Renders the details/activity modal
 */
function renderDetails() {
  const state = getState();

  // Update category totals
  const categoryElements = {
    detailPrayer: state.categoryPoints.prayer,
    detailStudy: state.categoryPoints.study,
    detailGood: state.categoryPoints.good,
    detailRelapse: state.categoryPoints.relapse,
    detailClean: state.categoryPoints.clean,
  };

  Object.entries(categoryElements).forEach(([id, value]) => {
    const element = $(`#${id}`);
    if (element) {
      element.textContent = value >= 0 ? `+${value}` : value;
    }
  });

  // Render activity log
  renderActivityLog();
}

/**
 * Renders the activity log
 */
function renderActivityLog() {
  const state = getState();
  const activityLog = $('#activityLog');

  if (!activityLog) return;

  activityLog.innerHTML = '';

  if (state.activityHistory.length === 0) {
    activityLog.innerHTML = '<div class="muted small">No activity recorded yet.</div>';
    return;
  }

  state.activityHistory.forEach(activity => {
    const item = document.createElement('div');
    item.className = 'activity-item';

    const info = document.createElement('div');
    info.className = 'activity-info';

    const icon = document.createElement('div');
    icon.className = 'activity-icon';
    icon.textContent = CATEGORY_ICONS[activity.category] || '📝';

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

    activityLog.appendChild(item);
  });
}

/**
 * Shows a confirmation modal
 * @param {string} message - Confirmation message
 * @param {Function} callback - Callback function on confirm
 */
export function showConfirmModal(message, callback) {
  const confirmMessage = $('#confirmMessage');
  if (confirmMessage) {
    confirmMessage.textContent = message;
  }

  pendingConfirmCallback = callback;
  openModal('confirmModal');
}

/**
 * Handles confirmation modal OK button
 */
export function confirmAction() {
  if (pendingConfirmCallback) {
    pendingConfirmCallback();
    pendingConfirmCallback = null;
  }
  closeModal('confirmModal');
}

/**
 * Cancels confirmation modal
 */
export function cancelConfirm() {
  pendingConfirmCallback = null;
  closeModal('confirmModal');
}

/**
 * Setup modal event listeners
 */
export function setupModalListeners() {
  // Settings modal
  $('#settingsBtn')?.addEventListener('click', openSettingsModal);
  $('#settingsClose')?.addEventListener('click', () => closeModal('settingsModal'));
  $('#settingsSave')?.addEventListener('click', saveSettings);
  $('#settingsReset')?.addEventListener('click', resetSettings);
  $('#settingsModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'settingsModal') closeModal('settingsModal');
  });

  // Update negative points preview on input change
  const settingInputs = ['#settingExercise', '#settingQuran', '#settingGhusl'];
  settingInputs.forEach(selector => {
    $(selector)?.addEventListener('input', updateNegativePointsPreview);
  });

  // Timeline modal
  $('#timelineBtn')?.addEventListener('click', openTimelineModal);
  $('#timelineClose')?.addEventListener('click', () => closeModal('timelineModal'));
  $('#timelineCloseBtn')?.addEventListener('click', () => closeModal('timelineModal'));
  $('#timelineModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'timelineModal') closeModal('timelineModal');
  });

  // Details modal
  $('#detailsBtn')?.addEventListener('click', openDetailsModal);
  $('#detailsClose')?.addEventListener('click', () => closeModal('detailsModal'));
  $('#detailsCloseBtn')?.addEventListener('click', () => closeModal('detailsModal'));
  $('#detailsModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'detailsModal') closeModal('detailsModal');
  });

  // Confirm modal
  $('#confirmClose')?.addEventListener('click', cancelConfirm);
  $('#confirmCancel')?.addEventListener('click', cancelConfirm);
  $('#confirmOk')?.addEventListener('click', confirmAction);
  $('#confirmModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'confirmModal') cancelConfirm();
  });
}
