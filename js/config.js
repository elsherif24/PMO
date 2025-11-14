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
  { label: 'Iron III', min: 0, max: 119, img: 'IronIII.png' },
  { label: 'Iron II', min: 120, max: 299, img: 'IronII.png' },
  { label: 'Iron I', min: 300, max: 549, img: 'IronI.png' },
  { label: 'Bronze III', min: 550, max: 849, img: 'BronzeIII.png' },
  { label: 'Bronze II', min: 850, max: 1299, img: 'BronzeII.png' },
  { label: 'Bronze I', min: 1300, max: 1849, img: 'BronzeI.png' },
  { label: 'Silver III', min: 1850, max: 2499, img: 'SilverIII.png' },
  { label: 'Silver II', min: 2500, max: 3299, img: 'SilverII.png' },
  { label: 'Silver I', min: 3300, max: 4199, img: 'SilverI.png' },
  { label: 'Gold III', min: 4200, max: 5499, img: 'GoldIII.png' },
  { label: 'Gold II', min: 5500, max: 6999, img: 'GoldII.png' },
  { label: 'Gold I', min: 7000, max: 8999, img: 'GoldI.png' },
  { label: 'Platinum III', min: 9000, max: 11499, img: 'PlatinumIII.png' },
  { label: 'Platinum II', min: 11500, max: 14499, img: 'PlatinumII.png' },
  { label: 'Platinum I', min: 14500, max: 18699, img: 'PlatinumI.png' },
  { label: 'Emerald III', min: 18700, max: 24399, img: 'EmeraldIII.png' },
  { label: 'Emerald II', min: 24400, max: 30799, img: 'EmeraldII.png' },
  { label: 'Emerald I', min: 30800, max: 38899, img: 'EmeraldI.png' },
  { label: 'Diamond III', min: 38900, max: 48499, img: 'DiamondIII.png' },
  { label: 'Diamond II', min: 48500, max: 59999, img: 'DiamondII.png' },
  { label: 'Diamond I', min: 60000, max: 73999, img: 'DiamondI.png' },
  { label: 'Master II', min: 74000, max: 90999, img: 'MasterII.png' },
  { label: 'Master I', min: 91000, max: 111999, img: 'MasterI.png' },
  { label: 'Grand Master II', min: 112000, max: 137999, img: 'GrandmasterII.png' },
  { label: 'Grand Master I', min: 138000, max: 169999, img: 'GrandmasterI.png' },
  { label: 'Challenger II', min: 170000, max: 209999, img: 'ChallengerII.png' },
  { label: 'Challenger I', min: 210000, max: Infinity, img: 'ChallengerI.png' },
];

// Default Point Values
export const DEFAULT_POINTS = {
  qadaa: 20,
  onTime: 25,
  inMosque: 35,
  ghusl: 25,
  quran: 15,
  exercise: 10,
  studyPerHour: 8,
  studyPenalty: 20,
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
