// client/src/utils/shuffle.js

// Simple seeded random generator (Mulberry32)
function mulberry32(a) {
  return function() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    var t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Get daily seed based on UTC day number
function getDailySeed() {
  const now = Date.now();
  // Number of days since epoch
  return Math.floor(now / (24 * 60 * 60 * 1000));
}

/**
 * Deterministically shuffle an array based on a daily seed.
 * Returns a new shuffled array without mutating the original.
 */
export function seededShuffleArray(array) {
  const result = array.slice();
  const seed = getDailySeed();
  const random = mulberry32(seed);
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

import { useState, useEffect } from 'react';

/**
 * React hook that returns a daily‑shuffled version of a list.
 * It recomputes when the input list reference changes.
 */
export function useDailyShuffle(list) {
  const [shuffled, setShuffled] = useState([]);
  useEffect(() => {
    if (Array.isArray(list) && list.length) {
      setShuffled(seededShuffleArray(list));
    } else {
      setShuffled([]);
    }
  }, [list]);
  return shuffled;
}
