/**
 * Modals UI Module
 * Handles all modal dialog operations
 */

import { getState, updateState } from '../state.js';
import { saveState } from '../storage.js';
import { RANKS, CATEGORY_ICONS } from '../config.js';
import { formatTime, formatNumber, $ } from '../utils.js';
import { showNotification } from './notifications.js';

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

  // Calculate statistics for each category
  // Praying = prayer points + quran + twaba
  const quranPoints = state.activityHistory.filter(a => a.description.includes('Quran')).reduce((sum, a) => sum + a.points, 0);
  const twabaPoints = state.activityHistory.filter(a => a.description.includes('Twaba')).reduce((sum, a) => sum + a.points, 0);
  const prayingPoints = state.categoryPoints.prayer + quranPoints + twabaPoints;

  // Study = study points only
  const studyPoints = state.categoryPoints.study;

  // Workout = workout points only
  const workoutPoints = state.activityHistory.filter(a => a.description.includes('Workout')).reduce((sum, a) => sum + a.points, 0);

  // PMO = clean hours points - porn and masturbation penalties
  const pmoPoints = state.categoryPoints.clean + state.categoryPoints.relapse;

  // Update category totals
  const categoryElements = {
    detailPraying: prayingPoints,
    detailStudy: studyPoints,
    detailWorkout: workoutPoints,
    detailPMO: pmoPoints,
  };

  Object.entries(categoryElements).forEach(([id, value]) => {
    const element = $(`#${id}`);
    if (element) {
      element.textContent = value >= 0 ? `+${value}` : value;
    }
  });

  // Update counts from state.counts
  const counts = state.counts || {
    qadaa: 0,
    onTime: 0,
    inMosque: 0,
    studyHours: 0,
    workouts: 0,
    cleanHours: 0,
    porn: 0,
    masturbation: 0,
  };

  const totalCleanDays = counts.cleanDays || 0;

  const countElements = {
    countQadaa: counts.qadaa,
    countOnTime: counts.onTime,
    countInMosque: counts.inMosque,
    countStudyHours: counts.studyHours,
    countWorkouts: counts.workouts,
    countCleanDays: totalCleanDays,
    countPorn: counts.porn,
    countMasturbation: counts.masturbation,
  };

  Object.entries(countElements).forEach(([id, value]) => {
    const element = $(`#${id}`);
    if (element) {
      element.textContent = typeof value === 'number' ? value.toFixed(1).replace('.0', '') : value;
    }
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
