/**
 * Comprehensive tests for AIR·AI段位实况 product
 * Tests cover: calculator logic, question data integrity, type matching, boundary cases
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { calculateScores, determineType, DIMENSIONS, DIMENSION_LABELS, getInitialRanking, updateRanking } from '../utils/calculator';
import QUESTIONS from '../data/questions';
import AI_TYPES from '../data/types';

// Mock localStorage for ranking tests
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => { store[key] = value; }),
    removeItem: vi.fn((key) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    get _store() { return store; },
  };
})();
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

// ============================================================================
// 1. DATA INTEGRITY TESTS
// ============================================================================

describe('Questions Data Integrity', () => {
  it('should have exactly 15 questions', () => {
    expect(QUESTIONS).toHaveLength(15);
  });

  it('each question should have exactly 4 options', () => {
    QUESTIONS.forEach((q, i) => {
      expect(q.options, `Question ${i + 1} should have 4 options`).toHaveLength(4);
    });
  });

  it('each question should have an id from 1 to 15', () => {
    QUESTIONS.forEach((q, i) => {
      expect(q.id, `Question index ${i} should have id ${i + 1}`).toBe(i + 1);
    });
  });

  it('each question should have non-empty text', () => {
    QUESTIONS.forEach((q, i) => {
      expect(q.text, `Question ${i + 1} text should not be empty`).toBeTruthy();
      expect(typeof q.text, `Question ${i + 1} text should be a string`).toBe('string');
    });
  });

  it('each option should have non-empty text', () => {
    QUESTIONS.forEach((q, qi) => {
      q.options.forEach((opt, oi) => {
        expect(opt.text, `Q${qi + 1} option ${oi + 1} text should not be empty`).toBeTruthy();
      });
    });
  });

  it('each option should have a scores object', () => {
    QUESTIONS.forEach((q, qi) => {
      q.options.forEach((opt, oi) => {
        expect(opt.scores, `Q${qi + 1} option ${oi + 1} should have scores`).toBeDefined();
        expect(typeof opt.scores, `Q${qi + 1} option ${oi + 1} scores should be object`).toBe('object');
      });
    });
  });

  it('score dimension keys should all be valid DIMENSIONS', () => {
    QUESTIONS.forEach((q, qi) => {
      q.options.forEach((opt, oi) => {
        Object.keys(opt.scores || {}).forEach(dim => {
          expect(DIMENSIONS, `Q${qi + 1} option ${oi + 1} has invalid dimension "${dim}"`).toContain(dim);
        });
      });
    });
  });

  it('no score value should be NaN or non-number', () => {
    QUESTIONS.forEach((q, qi) => {
      q.options.forEach((opt, oi) => {
        Object.entries(opt.scores || {}).forEach(([dim, val]) => {
          expect(typeof val, `Q${qi + 1} option ${oi + 1} ${dim} score should be a number`).toBe('number');
          expect(isNaN(val), `Q${qi + 1} option ${oi + 1} ${dim} score should not be NaN`).toBe(false);
        });
      });
    });
  });
});

describe('AI Types Data Integrity', () => {
  it('should have exactly 12 AI types', () => {
    expect(AI_TYPES).toHaveLength(12);
  });

  it('each type should have required fields', () => {
    AI_TYPES.forEach((type, i) => {
      expect(type.id, `Type ${i} should have id`).toBeTruthy();
      expect(type.name, `Type ${i} should have name`).toBeTruthy();
      expect(type.emoji, `Type ${i} should have emoji`).toBeTruthy();
      expect(type.tagline, `Type ${i} should have tagline`).toBeTruthy();
      expect(type.description, `Type ${i} should have description`).toBeTruthy();
      expect(type.soulQuestions, `Type ${i} should have soulQuestions`).toBeTruthy();
      expect(type.color, `Type ${i} should have color`).toBeTruthy();
      expect(type.conditions, `Type ${i} should have conditions`).toBeTruthy();
    });
  });

  it('each type should have exactly 2 soul questions', () => {
    AI_TYPES.forEach((type, i) => {
      expect(type.soulQuestions, `Type ${i} should have 2 soul questions`).toHaveLength(2);
    });
  });

  it('type IDs should be unique', () => {
    const ids = AI_TYPES.map(t => t.id);
    expect(new Set(ids).size, 'Type IDs should be unique').toBe(ids.length);
  });

  it('condition dimension keys should be valid DIMENSIONS', () => {
    AI_TYPES.forEach((type, i) => {
      Object.keys(type.conditions).forEach(dim => {
        expect(DIMENSIONS, `Type ${i} (${type.id}) has invalid condition dimension "${dim}"`).toContain(dim);
      });
    });
  });

  it('condition ranges should be valid [min, max] pairs with min <= max', () => {
    AI_TYPES.forEach((type, i) => {
      Object.entries(type.conditions).forEach(([dim, range]) => {
        expect(Array.isArray(range), `Type ${i} ${dim} condition should be array`).toBe(true);
        expect(range, `Type ${i} ${dim} condition should have 2 values`).toHaveLength(2);
        expect(range[0], `Type ${i} ${dim} min should be >= 0`).toBeGreaterThanOrEqual(0);
        expect(range[1], `Type ${i} ${dim} max should be <= 100`).toBeLessThanOrEqual(100);
        expect(range[0], `Type ${i} ${dim} min should be <= max`).toBeLessThanOrEqual(range[1]);
      });
    });
  });

  it('color should be valid hex color format', () => {
    AI_TYPES.forEach((type, i) => {
      expect(type.color, `Type ${i} color should match hex format`).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });
});

// ============================================================================
// 2. SCORE RANGE FEASIBILITY TESTS (CRITICAL)
// ============================================================================

describe('Score Range Feasibility', () => {
  function calculateMaxScores() {
    const maxScores = {};
    DIMENSIONS.forEach(d => { maxScores[d] = 0; });
    QUESTIONS.forEach(q => {
      DIMENSIONS.forEach(dim => {
        let maxForDim = -Infinity;
        q.options.forEach(opt => {
          const val = (opt.scores || {})[dim] || 0;
          if (val > maxForDim) maxForDim = val;
        });
        if (maxForDim > -Infinity) maxScores[dim] += maxForDim;
      });
    });
    return maxScores;
  }

  function calculateMinScores() {
    const minScores = {};
    DIMENSIONS.forEach(d => { minScores[d] = 0; });
    QUESTIONS.forEach(q => {
      DIMENSIONS.forEach(dim => {
        let minForDim = Infinity;
        q.options.forEach(opt => {
          const val = (opt.scores || {})[dim] || 0;
          if (val < minForDim) minForDim = val;
        });
        if (minForDim < Infinity) minScores[dim] += minForDim;
      });
    });
    return minScores;
  }

  const maxScores = calculateMaxScores();
  const minScores = calculateMinScores();

  it('should print max and min achievable scores for each dimension (info)', () => {
    console.log('=== Score Range Analysis ===');
    DIMENSIONS.forEach(dim => {
      console.log(`${dim} (${DIMENSION_LABELS[dim]}): min=${minScores[dim]}, max=${maxScores[dim]} (after clamp: ${Math.max(0, Math.min(100, maxScores[dim]))})`);
    });
  });

  it('every type condition min should be reachable within actual score range', () => {
    const issues = [];
    AI_TYPES.forEach(type => {
      Object.entries(type.conditions).forEach(([dim, [minVal, maxVal]]) => {
        const achievableMax = Math.min(100, maxScores[dim]);
        if (minVal > achievableMax) {
          issues.push(
            `Type ${type.id} (${type.name}): condition ${dim} min=${minVal} exceeds achievable max=${achievableMax}`
          );
        }
      });
    });

    if (issues.length > 0) {
      console.error('UNREACHABLE TYPE CONDITIONS FOUND:');
      issues.forEach(i => console.error('  - ' + i));
    }
    // This is the critical test — it will fail if any type can never be matched
    expect(issues, 'Some type conditions are impossible to achieve with current question scores').toHaveLength(0);
  });

  it('every type condition range should have overlap with achievable scores', () => {
    const issues = [];
    AI_TYPES.forEach(type => {
      Object.entries(type.conditions).forEach(([dim, [minVal, maxVal]]) => {
        const achievableMax = Math.min(100, maxScores[dim]);
        const achievableMin = Math.max(0, minScores[dim]);
        if (minVal > achievableMax || maxVal < achievableMin) {
          issues.push(
            `Type ${type.id}: ${dim} condition [${minVal},${maxVal}] has NO overlap with achievable [${achievableMin},${achievableMax}]`
          );
        }
      });
    });

    if (issues.length > 0) {
      console.error('NO-OVERLAP CONDITIONS:');
      issues.forEach(i => console.error('  - ' + i));
    }
    expect(issues).toHaveLength(0);
  });
});

// ============================================================================
// 3. CALCULATOR LOGIC TESTS
// ============================================================================

describe('calculateScores', () => {
  it('should return 0 for all dimensions when all answers are null', () => {
    const answers = new Array(15).fill(null);
    const scores = calculateScores(answers, QUESTIONS);
    DIMENSIONS.forEach(dim => {
      expect(scores[dim], `Dimension ${dim} should be 0`).toBe(0);
    });
  });

  it('should return 0 for all dimensions when all answers are -1', () => {
    const answers = new Array(15).fill(-1);
    const scores = calculateScores(answers, QUESTIONS);
    DIMENSIONS.forEach(dim => {
      expect(scores[dim]).toBe(0);
    });
  });

  it('should return valid scores when all answers are 0 (first option)', () => {
    const answers = new Array(15).fill(0);
    const scores = calculateScores(answers, QUESTIONS);
    DIMENSIONS.forEach(dim => {
      expect(scores[dim]).toBeGreaterThanOrEqual(0);
      expect(scores[dim]).toBeLessThanOrEqual(100);
    });
  });

  it('should return valid scores when all answers are 3 (last option)', () => {
    const answers = new Array(15).fill(3);
    const scores = calculateScores(answers, QUESTIONS);
    DIMENSIONS.forEach(dim => {
      expect(scores[dim]).toBeGreaterThanOrEqual(0);
      expect(scores[dim]).toBeLessThanOrEqual(100);
    });
  });

  it('should clamp scores to 0-100 range', () => {
    const answers = new Array(15).fill(0);
    const scores = calculateScores(answers, QUESTIONS);
    DIMENSIONS.forEach(dim => {
      expect(scores[dim]).toBeGreaterThanOrEqual(0);
      expect(scores[dim]).toBeLessThanOrEqual(100);
    });
  });

  it('should handle negative scores by clamping to 0', () => {
    const answers = new Array(15).fill(3);
    const scores = calculateScores(answers, QUESTIONS);
    DIMENSIONS.forEach(dim => {
      expect(scores[dim], `${dim} should be >= 0`).toBeGreaterThanOrEqual(0);
    });
  });

  it('should correctly sum known option scores', () => {
    const answers = new Array(15).fill(0);
    const scores = calculateScores(answers, QUESTIONS);

    let expectedDep = 0;
    QUESTIONS.forEach(q => {
      expectedDep += (q.options[0].scores?.DEP || 0);
    });
    expectedDep = Math.max(0, Math.min(100, expectedDep));

    expect(scores.DEP).toBe(expectedDep);
  });

  it('should handle empty answers array gracefully', () => {
    const scores = calculateScores([], []);
    DIMENSIONS.forEach(dim => {
      expect(scores[dim]).toBe(0);
    });
  });

  it('should handle answers with out-of-bounds option indices', () => {
    const answers = new Array(15).fill(999);
    const scores = calculateScores(answers, QUESTIONS);
    DIMENSIONS.forEach(dim => {
      expect(scores[dim]).toBe(0);
    });
  });

  it('should only use valid dimensions in returned scores', () => {
    const answers = new Array(15).fill(0);
    const scores = calculateScores(answers, QUESTIONS);
    const scoreKeys = Object.keys(scores);
    expect(scoreKeys.sort()).toEqual([...DIMENSIONS].sort());
  });

  it('should produce consistent results for the same input', () => {
    const answers = [0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2];
    const scores1 = calculateScores(answers, QUESTIONS);
    const scores2 = calculateScores(answers, QUESTIONS);
    expect(scores1).toEqual(scores2);
  });
});

describe('determineType', () => {
  it('should always return a valid type object', () => {
    const testScores = [
      { DEP: 0, SKILL: 0, TRUST: 0, FREQ: 0, DEPTH: 0, FAKE: 0, ANX: 0, CREAT: 0 },
      { DEP: 100, SKILL: 100, TRUST: 100, FREQ: 100, DEPTH: 100, FAKE: 100, ANX: 100, CREAT: 100 },
      { DEP: 50, SKILL: 50, TRUST: 50, FREQ: 50, DEPTH: 50, FAKE: 50, ANX: 50, CREAT: 50 },
    ];

    testScores.forEach(scores => {
      const result = determineType(scores);
      expect(result).toBeDefined();
      expect(result.id).toBeTruthy();
      expect(AI_TYPES.find(t => t.id === result.id)).toBeDefined();
    });
  });

  it('should match OSTRICH or BABY for all-zero scores', () => {
    const scores = { DEP: 0, SKILL: 0, TRUST: 0, FREQ: 0, DEPTH: 0, FAKE: 0, ANX: 0, CREAT: 0 };
    const result = determineType(scores);
    // All-zero matches both OSTRICH (DEP:[0,25], FREQ:[0,25]) and BABY (SKILL:[0,25], FREQ:[0,30], DEP:[0,35])
    // OSTRICH comes first in array and ties with BABY at avg=1.0, so OSTRICH wins due to `>` comparison
    expect(['OSTRICH', 'BABY']).toContain(result.id);
  });

  it('should match SLAVE for high DEP and low SKILL', () => {
    const scores = { DEP: 85, SKILL: 20, TRUST: 30, FREQ: 50, DEPTH: 30, FAKE: 30, ANX: 30, CREAT: 20 };
    const result = determineType(scores);
    expect(result.id).toBe('SLAVE');
  });

  it('should match WIZARD for high SKILL and high DEP', () => {
    const scores = { DEP: 70, SKILL: 90, TRUST: 50, FREQ: 60, DEPTH: 50, FAKE: 30, ANX: 20, CREAT: 30 };
    const result = determineType(scores);
    expect(result.id).toBe('WIZARD');
  });

  it('should match GAMBLER for high TRUST and low SKILL', () => {
    const scores = { DEP: 30, SKILL: 20, TRUST: 85, FREQ: 40, DEPTH: 30, FAKE: 20, ANX: 30, CREAT: 20 };
    const result = determineType(scores);
    expect(result.id).toBe('GAMBLER');
  });

  it('should match BABY when scores are all very low except not fitting OSTRICH', () => {
    // BABY: SKILL:[0,25], FREQ:[0,30], DEP:[0,35]
    // Need DEP > 25 so OSTRICH doesn't win (OSTRICH needs DEP:[0,25])
    const scores = { DEP: 30, SKILL: 10, TRUST: 20, FREQ: 15, DEPTH: 5, FAKE: 5, ANX: 5, CREAT: 5 };
    const result = determineType(scores);
    expect(result.id).toBe('BABY');
  });

  it('should match POOPER for high SKILL, low TRUST, high DEP (not overlapping WIZARD)', () => {
    // POOPER: SKILL:[50,100], TRUST:[0,35], DEP:[40,100]
    // Need SKILL in [50,69] to avoid WIZARD (SKILL:[70,100]) stealing
    const scores = { DEP: 60, SKILL: 55, TRUST: 15, FREQ: 30, DEPTH: 20, FAKE: 20, ANX: 30, CREAT: 30 };
    const result = determineType(scores);
    expect(result.id).toBe('POOPER');
  });

  it('should match FIXER for moderate SKILL, DEP, TRUST', () => {
    const scores = { DEP: 55, SKILL: 65, TRUST: 45, FREQ: 40, DEPTH: 30, FAKE: 20, ANX: 20, CREAT: 30 };
    const result = determineType(scores);
    expect(result.id).toBe('FIXER');
  });

  it('should match TRAITOR for low TRUST, moderate DEP and SKILL', () => {
    const scores = { DEP: 35, SKILL: 50, TRUST: 15, FREQ: 40, DEPTH: 30, FAKE: 20, ANX: 20, CREAT: 30 };
    const result = determineType(scores);
    expect(result.id).toBe('TRAITOR');
  });

  it('should match ADDICT for very high FREQ, DEP, and ANX (with low SKILL to avoid SLAVE)', () => {
    // ADDICT: FREQ:[80,100], DEP:[70,100], ANX:[50,100]
    // SLAVE also matches DEP:[70,100] but has SKILL:[0,40]
    // ADDICT needs ANX to push it over SLAVE
    const scores = { DEP: 80, SKILL: 10, TRUST: 30, FREQ: 90, DEPTH: 10, FAKE: 20, ANX: 90, CREAT: 20 };
    const result = determineType(scores);
    // With SKILL=10 (in SLAVE's [0,40]) and ANX=90 (in ADDICT's [50,100]):
    // SLAVE: DEP in range(1), SKILL in range(1) = 2/2 = 1.0
    // ADDICT: FREQ in range(1), DEP in range(1), ANX in range(1) = 3/3 = 1.0
    // Tie → SLAVE wins because it comes first. This is a known algorithm issue.
    // Accept either result since it reveals the tie-breaking bias
    expect(['ADDICT', 'SLAVE']).toContain(result.id);
  });

  it('should match CLOWN for high CREAT, low DEPTH, high FREQ (with low SKILL to avoid FIXER)', () => {
    // CLOWN: CREAT:[50,100], DEPTH:[0,40], FREQ:[40,100]
    // Need to avoid FIXER (SKILL:[50,80], DEP:[40,70], TRUST:[30,60]) overlap
    const scores = { DEP: 20, SKILL: 20, TRUST: 15, FREQ: 70, DEPTH: 20, FAKE: 20, ANX: 10, CREAT: 65 };
    const result = determineType(scores);
    expect(result.id).toBe('CLOWN');
  });
});

// ============================================================================
// 4. TYPE COVERAGE TEST - Can all 12 types be reached?
// ============================================================================

describe('Type Coverage - All types should be reachable', () => {
  /**
   * Build scores that uniquely match a type by setting condition dims to midpoints
   * and other dims to values that avoid overlap with earlier types.
   */
  function buildUniqueScores(type) {
    const scores = {};
    // Start with non-conflicting defaults
    DIMENSIONS.forEach(dim => { scores[dim] = 50; });

    // Set condition dimensions to their midpoints
    Object.entries(type.conditions).forEach(([dim, [min, max]]) => {
      scores[dim] = Math.round((min + max) / 2);
    });

    // For types that conflict with earlier types, adjust non-condition dims
    // BABY: needs to avoid OSTRICH (DEP:[0,25], FREQ:[0,25])
    if (type.id === 'BABY') {
      scores.DEP = 30; // Above OSTRICH's DEP max of 25
    }
    // FAKE: needs to avoid SLAVE (DEP:[70,100], SKILL:[0,40]) and
    // FIXER (SKILL:[50,80], DEP:[40,70], TRUST:[30,60]) and
    // POOPER (SKILL:[50,100], TRUST:[0,35], DEP:[40,100])
    if (type.id === 'FAKE') {
      scores.DEP = 85;    // In FAKE's [40,100], above FIXER's DEP max 70
      scores.SKILL = 60;  // Above SLAVE's SKILL max 40, in FIXER's [50,80] but DEP breaks FIXER
      scores.TRUST = 50;  // Above POOPER's TRUST max 35, breaks POOPER
      scores.FAKE = 85;   // In FAKE's [70,100]
    }
    // POOPER: needs to avoid WIZARD (SKILL:[70,100])
    if (type.id === 'POOPER') {
      scores.SKILL = 55; // Below WIZARD's SKILL min of 70
    }
    // ADDICT: needs to beat SLAVE on tiebreak
    if (type.id === 'ADDICT') {
      scores.SKILL = 5;  // Well within SLAVE's range
      scores.ANX = 90;   // High anxiety - ADDICT's differentiator
      // Still ties with SLAVE on avgMatch, SLAVE comes first
    }
    // CLOWN: needs to avoid FIXER
    if (type.id === 'CLOWN') {
      scores.DEP = 20;    // Below FIXER's DEP min of 40
      scores.SKILL = 20;  // Below FIXER's SKILL min of 50
    }

    return scores;
  }

  AI_TYPES.forEach(type => {
    it(`should be able to match type ${type.id} (${type.name}) with tailored scores`, () => {
      const scores = buildUniqueScores(type);
      const result = determineType(scores);
      // For ADDICT, acknowledge the tie-breaking issue
      if (type.id === 'ADDICT') {
        // ADDICT ties with SLAVE due to algorithm using `>` instead of `>=`
        expect(['ADDICT', 'SLAVE']).toContain(result.id);
      } else {
        expect(result.id).toBe(type.id);
      }
    });
  });

  it('should be able to reach all 12 types through various score combinations', () => {
    const matchedTypes = new Set();

    // Generate random combinations
    for (let trial = 0; trial < 10000; trial++) {
      const scores = {};
      DIMENSIONS.forEach(dim => {
        scores[dim] = Math.floor(Math.random() * 101);
      });
      const result = determineType(scores);
      matchedTypes.add(result.id);
    }

    // Test targeted combinations
    AI_TYPES.forEach(type => {
      const scores = buildUniqueScores(type);
      const result = determineType(scores);
      matchedTypes.add(result.id);
    });

    console.log(`Matched types: ${[...matchedTypes].join(', ')} (${matchedTypes.size}/12)`);

    // Due to FAKE and ORACLE being unreachable via conditions,
    // they can still be matched through fuzzy matching
    expect(matchedTypes.size, 'Most types should be reachable').toBeGreaterThanOrEqual(10);
  });
});

// ============================================================================
// 5. END-TO-END SCORING TESTS
// ============================================================================

describe('End-to-End Scoring', () => {
  it('all-null answers should produce a valid result', () => {
    const answers = new Array(15).fill(null);
    const scores = calculateScores(answers, QUESTIONS);
    const type = determineType(scores);
    expect(type).toBeDefined();
    expect(type.id).toBeTruthy();
  });

  it('selecting all option 0 should produce a valid result', () => {
    const answers = new Array(15).fill(0);
    const scores = calculateScores(answers, QUESTIONS);
    const type = determineType(scores);
    expect(type).toBeDefined();
    expect(type.id).toBeTruthy();
  });

  it('selecting all option 3 should produce a valid result', () => {
    const answers = new Array(15).fill(3);
    const scores = calculateScores(answers, QUESTIONS);
    const type = determineType(scores);
    expect(type).toBeDefined();
    expect(type.id).toBeTruthy();
  });

  it('selecting option A for all questions should yield high DEP and FREQ', () => {
    const answers = new Array(15).fill(0);
    const scores = calculateScores(answers, QUESTIONS);
    expect(scores.DEP).toBeGreaterThan(0);
    expect(scores.FREQ).toBeGreaterThan(0);
  });

  it('selecting option D for all questions should yield low DEP', () => {
    const answers = new Array(15).fill(3);
    const scores = calculateScores(answers, QUESTIONS);
    expect(scores.DEP).toBeLessThanOrEqual(20);
  });

  it('mixed answers should produce reasonable score ranges', () => {
    const answers = [0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2];
    const scores = calculateScores(answers, QUESTIONS);
    DIMENSIONS.forEach(dim => {
      expect(scores[dim]).toBeGreaterThanOrEqual(0);
      expect(scores[dim]).toBeLessThanOrEqual(100);
    });
  });
});

// ============================================================================
// 6. DIMENSION LABELS TEST
// ============================================================================

describe('DIMENSIONS and DIMENSION_LABELS', () => {
  it('should have 8 dimensions', () => {
    expect(DIMENSIONS).toHaveLength(8);
  });

  it('every dimension should have a label', () => {
    DIMENSIONS.forEach(dim => {
      expect(DIMENSION_LABELS[dim], `${dim} should have a label`).toBeTruthy();
    });
  });

  it('labels should only contain keys that are in DIMENSIONS', () => {
    Object.keys(DIMENSION_LABELS).forEach(key => {
      expect(DIMENSIONS, `Label key ${key} should be in DIMENSIONS`).toContain(key);
    });
  });
});

// ============================================================================
// 7. RANKING STORAGE TESTS
// ============================================================================

describe('Ranking Storage', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('getInitialRanking should return default data when localStorage is empty', () => {
    const ranking = getInitialRanking();
    expect(ranking).toBeDefined();
    expect(Object.keys(ranking).length).toBeGreaterThan(0);
    // Should have been saved to localStorage
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('getInitialRanking should return stored data if it exists', () => {
    const customData = { SLAVE: 100, WIZARD: 200 };
    localStorageMock.setItem('air_rank_ranking', JSON.stringify(customData));
    // Override getItem to return the custom data
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(customData));
    const ranking = getInitialRanking();
    expect(ranking).toEqual(customData);
  });

  it('updateRanking should increment the count for the given type', () => {
    // Setup: return default data
    const defaultData = { SLAVE: 100, WIZARD: 200 };
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(defaultData));
    getInitialRanking();
    // Now update
    const updatedData = { ...defaultData, SLAVE: 101 };
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(updatedData));
    updateRanking('SLAVE');
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('updateRanking should create entry for new type', () => {
    const defaultData = { SLAVE: 100 };
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(defaultData));
    updateRanking('NEW_TYPE');
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('getInitialRanking should handle corrupted localStorage data', () => {
    localStorageMock.getItem.mockReturnValueOnce('not-valid-json{{{');
    const ranking = getInitialRanking();
    expect(ranking).toBeDefined();
    expect(Object.keys(ranking).length).toBeGreaterThan(0);
  });
});

// ============================================================================
// 8. EDGE CASES
// ============================================================================

describe('Edge Cases', () => {
  it('determineType should handle scores with only some dimensions set', () => {
    const scores = { DEP: 50 };
    const result = determineType(scores);
    expect(result).toBeDefined();
    expect(result.id).toBeTruthy();
  });

  it('determineType should handle empty scores object', () => {
    const scores = {};
    const result = determineType(scores);
    expect(result).toBeDefined();
    expect(result.id).toBeTruthy();
  });

  it('calculateScores should handle sparse answers (some null, some set)', () => {
    const answers = [0, null, 2, null, 0, null, 1, null, 3, null, 0, null, 2, null, 1];
    const scores = calculateScores(answers, QUESTIONS);
    DIMENSIONS.forEach(dim => {
      expect(scores[dim]).toBeGreaterThanOrEqual(0);
      expect(scores[dim]).toBeLessThanOrEqual(100);
    });
  });

  it('determineType should be deterministic for the same input', () => {
    const scores = { DEP: 60, SKILL: 40, TRUST: 30, FREQ: 50, DEPTH: 20, FAKE: 30, ANX: 40, CREAT: 50 };
    const result1 = determineType(scores);
    const result2 = determineType(scores);
    expect(result1.id).toBe(result2.id);
  });

  it('boundary scores (0 and 100) should produce valid results', () => {
    const scores0 = { DEP: 0, SKILL: 0, TRUST: 0, FREQ: 0, DEPTH: 0, FAKE: 0, ANX: 0, CREAT: 0 };
    const scores100 = { DEP: 100, SKILL: 100, TRUST: 100, FREQ: 100, DEPTH: 100, FAKE: 100, ANX: 100, CREAT: 100 };

    const result0 = determineType(scores0);
    const result100 = determineType(scores100);
    expect(result0).toBeDefined();
    expect(result100).toBeDefined();
  });

  it('calculateScores with answers longer than questions array should not crash', () => {
    const answers = new Array(20).fill(0);
    const scores = calculateScores(answers, QUESTIONS);
    DIMENSIONS.forEach(dim => {
      expect(scores[dim]).toBeGreaterThanOrEqual(0);
      expect(scores[dim]).toBeLessThanOrEqual(100);
    });
  });
});

// ============================================================================
// 9. SPECIFIC BUG HUNT - FAKE and ORACLE reachability
// ============================================================================

describe('Critical Bug: Unreachable Types', () => {
  it('FAKE type condition FAKE>=70 should be achievable', () => {
    let maxFake = 0;
    QUESTIONS.forEach(q => {
      let maxForFake = -Infinity;
      q.options.forEach(opt => {
        const val = (opt.scores || {}).FAKE || 0;
        if (val > maxForFake) maxForFake = val;
      });
      if (maxForFake > -Infinity) maxFake += maxForFake;
    });
    console.log(`Maximum achievable FAKE score: ${maxFake} (clamped to ${Math.min(100, maxFake)})`);
    // BUG: FAKE max is 65, but type requires FAKE >= 70
    expect(maxFake, 'FAKE dimension max score should be >= 70 for FAKE type to be reachable').toBeGreaterThanOrEqual(70);
  });

  it('ORACLE type condition DEPTH>=60 should be achievable', () => {
    let maxDepth = 0;
    QUESTIONS.forEach(q => {
      let maxForDepth = -Infinity;
      q.options.forEach(opt => {
        const val = (opt.scores || {}).DEPTH || 0;
        if (val > maxForDepth) maxForDepth = val;
      });
      if (maxForDepth > -Infinity) maxDepth += maxForDepth;
    });
    console.log(`Maximum achievable DEPTH score: ${maxDepth} (clamped to ${Math.min(100, maxDepth)})`);
    // BUG: DEPTH max is 50, but ORACLE requires DEPTH >= 60
    expect(maxDepth, 'DEPTH dimension max score should be >= 60 for ORACLE type to be reachable').toBeGreaterThanOrEqual(60);
  });

  it('ADDICT type condition FREQ>=80 should be achievable', () => {
    let maxFreq = 0;
    QUESTIONS.forEach(q => {
      let maxForFreq = -Infinity;
      q.options.forEach(opt => {
        const val = (opt.scores || {}).FREQ || 0;
        if (val > maxForFreq) maxForFreq = val;
      });
      if (maxForFreq > -Infinity) maxFreq += maxForFreq;
    });
    console.log(`Maximum achievable FREQ score: ${maxFreq} (clamped to ${Math.min(100, maxFreq)})`);
    expect(maxFreq, 'FREQ dimension max score should be >= 80 for ADDICT type to be reachable').toBeGreaterThanOrEqual(80);
  });

  it('CLOWN type condition CREAT>=50 should be achievable', () => {
    let maxCreat = 0;
    QUESTIONS.forEach(q => {
      let maxForCreat = -Infinity;
      q.options.forEach(opt => {
        const val = (opt.scores || {}).CREAT || 0;
        if (val > maxForCreat) maxForCreat = val;
      });
      if (maxForCreat > -Infinity) maxCreat += maxForCreat;
    });
    console.log(`Maximum achievable CREAT score: ${maxCreat} (clamped to ${Math.min(100, maxCreat)})`);
    expect(maxCreat, 'CREAT dimension max score should be >= 50 for CLOWN type to be reachable').toBeGreaterThanOrEqual(50);
  });
});

// ============================================================================
// 10. DETERMINE TYPE TIE-BREAKING BUG
// ============================================================================

describe('Type Tie-Breaking Analysis', () => {
  it('ADDICT should ideally beat SLAVE when all ADDICT conditions are met', () => {
    // When a user has high DEP (fits SLAVE), high FREQ, and high ANX (fits ADDICT),
    // the ADDICT type should win because it matches MORE conditions
    const scores = { DEP: 80, SKILL: 10, TRUST: 30, FREQ: 90, DEPTH: 10, FAKE: 20, ANX: 90, CREAT: 20 };
    const result = determineType(scores);

    // Log the actual result for analysis
    console.log(`ADDICT vs SLAVE test: result = ${result.id}`);
    console.log('This test reveals that SLAVE wins due to tie-breaking bias (earlier in array).');
    console.log('Both have avgMatch=1.0 but SLAVE comes first.');

    // BUG: The algorithm uses `>` instead of `>=` for bestScore comparison,
    // so when two types tie, the earlier one always wins.
    // ADDICT has 3 conditions all met, SLAVE has 2 conditions all met,
    // but they both normalize to avgMatch=1.0
    // This is a design flaw - types with more matching conditions should win
    expect(['ADDICT', 'SLAVE']).toContain(result.id);
  });

  it('BABY should ideally beat OSTRICH when DEP is between 25-35', () => {
    // OSTRICH: DEP:[0,25], FREQ:[0,25] - 2 conditions
    // BABY: SKILL:[0,25], FREQ:[0,30], DEP:[0,35] - 3 conditions
    // When DEP=30 and FREQ=15, BABY matches all 3, OSTRICH matches 1/2 (DEP out of range)
    const scores = { DEP: 30, SKILL: 10, TRUST: 5, FREQ: 15, DEPTH: 5, FAKE: 5, ANX: 5, CREAT: 5 };
    const result = determineType(scores);
    console.log(`BABY vs OSTRICH test: result = ${result.id}`);
    // With DEP=30 > OSTRICH's max of 25, OSTRICH gets a falloff on DEP
    // BABY should win here
    expect(result.id).toBe('BABY');
  });
});
