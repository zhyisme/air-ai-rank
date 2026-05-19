import RANKS from '../data/ranks';
import COMPATIBILITY from '../data/compatibility';
import { DIMENSIONS } from './calculator';
import AI_TYPES from '../data/types';

/**
 * Calculate the rank tier based on dimension scores.
 * Uses the average of all 8 dimensions mapped to rank thresholds.
 * @param {Object} scores - Dimension scores object { DEP: 45, SKILL: 72, ... }
 * @returns {Object} The matched rank object { id, name, emoji, color, minScore, maxScore }
 */
export function calculateRank(scores) {
  const dimValues = DIMENSIONS.map(dim => scores[dim] || 0);
  const avg = dimValues.reduce((sum, val) => sum + val, 0) / dimValues.length;

  for (const rank of RANKS) {
    if (avg >= rank.minScore && avg <= rank.maxScore) {
      return rank;
    }
  }

  // Fallback to highest rank if somehow above max
  return RANKS[RANKS.length - 1];
}

/**
 * Calculate the rarity percentage of a given type based on localStorage ranking data.
 * Lower percentage = rarer type.
 * @param {string} typeId - The AI type id
 * @returns {string} Rarity percentage string, e.g. "8.3"
 */
export function calculateRarity(typeId) {
  let ranking = {};
  try {
    const stored = localStorage.getItem('air_rank_ranking');
    if (stored) {
      ranking = JSON.parse(stored);
    }
  } catch (e) {
    // Fall through to defaults
  }

  // If no ranking data, use type-based defaults
  if (!ranking || Object.keys(ranking).length === 0) {
    const defaultRarities = {
      SLAVE: 12.5, WIZARD: 8.3, OSTRICH: 6.2, FAKE: 15.1,
      POOPER: 9.8, GAMBLER: 11.7, BABY: 13.4, FIXER: 14.2,
      TRAITOR: 5.1, CLOWN: 10.6, ADDICT: 7.9, ORACLE: 4.8,
    };
    return (defaultRarities[typeId] || 10.0).toFixed(1);
  }

  const total = Object.values(ranking).reduce((sum, count) => sum + count, 0);
  if (total === 0) return '10.0';

  const typeCount = ranking[typeId] || 0;
  const percentage = (typeCount / total) * 100;
  return percentage.toFixed(1);
}

/**
 * Calculate the surpass rate based on rank score.
 * Higher average score means surpassing more people.
 * @param {Object} scores - Dimension scores object
 * @returns {string} Surpass percentage, e.g. "72.3"
 */
export function calculateSurpassRate(scores) {
  const dimValues = DIMENSIONS.map(dim => scores[dim] || 0);
  const avg = dimValues.reduce((sum, val) => sum + val, 0) / dimValues.length;
  // Map 0-100 average to a curved surpass rate (15-98%)
  const rate = 15 + (avg / 100) * 83;
  return rate.toFixed(1);
}

/**
 * Get the compatibility data for a given type.
 * Returns best match and worst match with descriptions.
 * @param {string} typeId - The AI type id
 * @returns {Object} Compatibility data { typeId, bestMatchId, bestMatchLabel, bestMatchDesc, worstMatchId, worstMatchLabel, worstMatchDesc }
 */
export function getCompatibility(typeId) {
  const entry = COMPATIBILITY.find(c => c.typeId === typeId);
  if (entry) return entry;

  // Fallback: return a generic compatibility
  return {
    typeId,
    bestMatchId: 'FIXER',
    bestMatchLabel: '🤝 默认搭档',
    bestMatchDesc: '你们的组合有待发掘',
    worstMatchId: 'OSTRICH',
    worstMatchLabel: '😅 默认对手',
    worstMatchDesc: '你们可能需要更多磨合',
  };
}

/**
 * Get the best match type object for a given type.
 * @param {string} typeId - The AI type id
 * @returns {Object} The best match AI type object
 */
export function getBestMatchType(typeId) {
  const compat = getCompatibility(typeId);
  return AI_TYPES.find(t => t.id === compat.bestMatchId) || AI_TYPES[0];
}

/**
 * Get the worst match type object for a given type.
 * @param {string} typeId - The AI type id
 * @returns {Object} The worst match AI type object
 */
export function getWorstMatchType(typeId) {
  const compat = getCompatibility(typeId);
  return AI_TYPES.find(t => t.id === compat.worstMatchId) || AI_TYPES[0];
}
