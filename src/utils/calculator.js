import AI_TYPES from '../data/types';

/** Dimension keys used throughout the app */
export const DIMENSIONS = ['DEP', 'SKILL', 'TRUST', 'FREQ', 'DEPTH', 'FAKE', 'ANX', 'CREAT'];

/** Chinese labels for each dimension */
export const DIMENSION_LABELS = {
  DEP: '依赖度',
  SKILL: '技能度',
  TRUST: '信任度',
  FREQ: '使用频率',
  DEPTH: '使用深度',
  FAKE: '伪装度',
  ANX: '焦虑度',
  CREAT: '创造力',
};

/**
 * Calculate dimension scores from answers.
 * @param {Array<number>} answers - Array of selected option indices (0-3) for each question.
 * @param {Array} questions - The full questions array.
 * @returns {Object} scores - Object with each dimension's clamped score (0-100).
 */
export function calculateScores(answers, questions) {
  const scores = {};
  DIMENSIONS.forEach(d => { scores[d] = 0; });

  answers.forEach((optionIndex, questionIndex) => {
    if (optionIndex == null || optionIndex < 0) return;
    const question = questions[questionIndex];
    if (!question) return;
    const option = question.options[optionIndex];
    if (!option) return;
    const s = option.scores || {};
    DIMENSIONS.forEach(d => {
      scores[d] += (s[d] || 0);
    });
  });

  // Clamp each dimension to 0-100
  DIMENSIONS.forEach(d => {
    scores[d] = Math.max(0, Math.min(100, scores[d]));
  });

  return scores;
}

/**
 * Determine the best-matching AI type based on dimension scores.
 * For each type, compute a match score: for each condition dimension,
 * if the score is within the [min, max] range, contribution = 1,
 * otherwise the further from range the lower (using a Gaussian-like falloff).
 * Return the type with the highest match score.
 * @param {Object} scores - Dimension scores object.
 * @returns {Object} The matched AI type object.
 */
export function determineType(scores) {
  let bestType = AI_TYPES[0];
  let bestScore = -Infinity;
  let bestConditionsMatched = 0;

  AI_TYPES.forEach(type => {
    const conditions = type.conditions;
    const dimKeys = Object.keys(conditions);
    let totalMatch = 0;
    let conditionsMatched = 0;

    dimKeys.forEach(dim => {
      const [minVal, maxVal] = conditions[dim];
      const val = scores[dim] || 0;
      if (val >= minVal && val <= maxVal) {
        totalMatch += 1;
        conditionsMatched += 1;
      } else {
        // Calculate distance-based falloff
        const mid = (minVal + maxVal) / 2;
        const range = (maxVal - minVal) / 2;
        const dist = val < minVal ? minVal - val : val - maxVal;
        // Falloff: the further from range, the lower the match
        const falloff = Math.exp(-(dist * dist) / (2 * Math.max(range, 15) * Math.max(range, 15)));
        totalMatch += falloff;
      }
    });

    // Normalize by number of conditions
    const avgMatch = totalMatch / dimKeys.length;

    // Tie-breaking: prefer types with more conditions fully matched,
    // then prefer types with more total conditions (more specific)
    const isBetter = avgMatch > bestScore ||
      (avgMatch === bestScore && conditionsMatched > bestConditionsMatched) ||
      (avgMatch === bestScore && conditionsMatched === bestConditionsMatched && dimKeys.length > Object.keys(bestType.conditions).length);

    if (isBetter) {
      bestScore = avgMatch;
      bestType = type;
      bestConditionsMatched = conditionsMatched;
    }
  });

  return bestType;
}

/**
 * Get initial ranking data (simulated).
 * @returns {Object} ranking - Object mapping type id to count.
 */
export function getInitialRanking() {
  const stored = localStorage.getItem('air_rank_ranking');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      // Fall through to defaults
    }
  }

  const defaults = {
    SLAVE: 8923,
    WIZARD: 7456,
    OSTRICH: 5621,
    FAKE: 11234,
    POOPER: 6789,
    GAMBLER: 8901,
    BABY: 9345,
    FIXER: 10567,
    TRAITOR: 4321,
    CLOWN: 7890,
    ADDICT: 6234,
    ORACLE: 5123,
  };

  localStorage.setItem('air_rank_ranking', JSON.stringify(defaults));
  return defaults;
}

/**
 * Update ranking with a new result type.
 * @param {string} typeId - The AI type id.
 */
export function updateRanking(typeId) {
  const ranking = getInitialRanking();
  ranking[typeId] = (ranking[typeId] || 0) + 1;
  localStorage.setItem('air_rank_ranking', JSON.stringify(ranking));
}

/**
 * Save the current test result to localStorage.
 * @param {Object} result - { typeId, scores, timestamp }
 */
export function saveResult(result) {
  localStorage.setItem('air_rank_result', JSON.stringify(result));
}

/**
 * Load the last test result from localStorage.
 * @returns {Object|null}
 */
export function loadResult() {
  const stored = localStorage.getItem('air_rank_result');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      return null;
    }
  }
  return null;
}
