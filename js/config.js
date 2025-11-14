/**
 * Configuration Module
 * Contains all constants, ranks data, and default point values
 */

// LocalStorage Key
export const STORAGE_KEY = 'lockin:v3';

// Prayer Names for Daily Tracking
export const PRAYER_NAMES = ['Fajr', 'Duhr', 'Asr', 'Maghrib', 'Isha'];

// Rank System Definition
export const RANKS = [
  { label: 'Iron III', min: 0, max: 269, img: 'IronIII.png' },
  { label: 'Iron II', min: 270, max: 539, img: 'IronII.png' },
  { label: 'Iron I', min: 540, max: 809, img: 'IronI.png' },
  { label: 'Bronze III', min: 810, max: 1079, img: 'BronzeIII.png' },
  { label: 'Bronze II', min: 1080, max: 1619, img: 'BronzeII.png' },
  { label: 'Bronze I', min: 1620, max: 2159, img: 'BronzeI.png' },
  { label: 'Silver III', min: 2160, max: 2969, img: 'SilverIII.png' },
  { label: 'Silver II', min: 2970, max: 3779, img: 'SilverII.png' },
  { label: 'Silver I', min: 3780, max: 4859, img: 'SilverI.png' },
  { label: 'Gold III', min: 4860, max: 5939, img: 'GoldIII.png' },
  { label: 'Gold II', min: 5940, max: 7289, img: 'GoldII.png' },
  { label: 'Gold I', min: 7290, max: 8639, img: 'GoldI.png' },
  { label: 'Platinum III', min: 8640, max: 10259, img: 'PlatinumIII.png' },
  { label: 'Platinum II', min: 10260, max: 11879, img: 'PlatinumII.png' },
  { label: 'Platinum I', min: 11880, max: 13769, img: 'PlatinumI.png' },
  { label: 'Emerald III', min: 13770, max: 15659, img: 'EmeraldIII.png' },
  { label: 'Emerald II', min: 15660, max: 17819, img: 'EmeraldII.png' },
  { label: 'Emerald I', min: 17820, max: 19979, img: 'EmeraldI.png' },
  { label: 'Diamond III', min: 19980, max: 22409, img: 'DiamondIII.png' },
  { label: 'Diamond II', min: 22410, max: 24839, img: 'DiamondII.png' },
  { label: 'Diamond I', min: 24840, max: 27539, img: 'DiamondI.png' },
  { label: 'Master II', min: 27540, max: 30239, img: 'MasterII.png' },
  { label: 'Master I', min: 30240, max: 33209, img: 'MasterI.png' },
  { label: 'Grand Master II', min: 33210, max: 36179, img: 'GrandmasterII.png' },
  { label: 'Grand Master I', min: 36180, max: 39419, img: 'GrandmasterI.png' },
  { label: 'Challenger II', min: 39420, max: 42659, img: 'ChallengerII.png' },
  { label: 'Challenger I', min: 42660, max: 46169, img: 'ChallengerI.png' },

];

// Default Point Values
export const DEFAULT_POINTS = {
  qadaa: 10,
  onTime: 20,
  inMosque: 30,
  twaba: 30,
  quran: 20,
  workout: 40,
  studyPerHour: 20,
};

// Category Icons for Activity Display
export const CATEGORY_ICONS = {
  prayer: '🕌',
  study: '📚',
  good: '✨',
  relapse: '⚠️',
  clean: '⏰',
};

// State Version for Migration
export const STATE_VERSION = 3;
