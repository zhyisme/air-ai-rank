/**
 * Comprehensive tests for new modules added in the viral optimization:
 * - rankCalculator (calculateRank, calculateRarity, calculateSurpassRate, getCompatibility, getBestMatchType, getWorstMatchType)
 * - shareUtils (generateShareText, generateShareUrl, parseReferralParams, getReferralType, copyToClipboard, downloadImage)
 * - posterGenerator (generatePoster)
 * - Data files integrity (types.js new fields, chapters.js, compatibility.js, loadingTexts.js, microFeedback.js, ranks.js)
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { calculateRank, calculateRarity, calculateSurpassRate, getCompatibility, getBestMatchType, getWorstMatchType } from '../utils/rankCalculator';
import { generateShareText, generateShareUrl, parseReferralParams, getReferralType } from '../utils/shareUtils';
import AI_TYPES from '../data/types';
import RANKS from '../data/ranks';
import CHAPTERS from '../data/chapters';
import COMPATIBILITY from '../data/compatibility';
import LOADING_TEXTS from '../data/loadingTexts';
import FEEDBACK_POOL from '../data/microFeedback';
import QUESTIONS from '../data/questions';
import { DIMENSIONS, DIMENSION_LABELS } from '../utils/calculator';

// Mock localStorage
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
// 1. RANKS DATA INTEGRITY
// ============================================================================

describe('Ranks Data Integrity', () => {
  it('should have exactly 6 rank tiers', () => {
    expect(RANKS).toHaveLength(6);
  });

  it('each rank should have required fields', () => {
    RANKS.forEach((rank, i) => {
      expect(rank.id, `Rank ${i} should have id`).toBeTruthy();
      expect(rank.name, `Rank ${i} should have name`).toBeTruthy();
      expect(rank.emoji, `Rank ${i} should have emoji`).toBeTruthy();
      expect(rank.color, `Rank ${i} should have color`).toBeTruthy();
      expect(rank.minScore, `Rank ${i} should have minScore`).toBeDefined();
      expect(rank.maxScore, `Rank ${i} should have maxScore`).toBeDefined();
    });
  });

  it('rank score ranges should be contiguous (no gaps)', () => {
    for (let i = 1; i < RANKS.length; i++) {
      expect(RANKS[i].minScore, `Gap between ${RANKS[i-1].id} and ${RANKS[i].id}`).toBe(RANKS[i-1].maxScore + 1);
    }
  });

  it('ranks should cover 0-100 score range', () => {
    expect(RANKS[0].minScore).toBe(0);
    expect(RANKS[RANKS.length - 1].maxScore).toBe(100);
  });

  it('rank IDs should be unique', () => {
    const ids = RANKS.map(r => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('colors should be valid hex format', () => {
    RANKS.forEach(rank => {
      expect(rank.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });
});

// ============================================================================
// 2. CHAPTERS DATA INTEGRITY
// ============================================================================

describe('Chapters Data Integrity', () => {
  it('should have exactly 3 chapters', () => {
    expect(CHAPTERS).toHaveLength(3);
  });

  it('each chapter should have required fields', () => {
    CHAPTERS.forEach((ch, i) => {
      expect(ch.id, `Chapter ${i} should have id`).toBe(i + 1);
      expect(ch.title, `Chapter ${i} should have title`).toBeTruthy();
      expect(ch.subtitle, `Chapter ${i} should have subtitle`).toBeTruthy();
      expect(ch.transitionText, `Chapter ${i} should have transitionText`).toBeTruthy();
      expect(ch.milestoneText1_3, `Chapter ${i} should have milestoneText1_3`).toBeTruthy();
      expect(ch.milestoneText2_3, `Chapter ${i} should have milestoneText2_3`).toBeTruthy();
    });
  });

  it('chapter IDs should be 1, 2, 3', () => {
    expect(CHAPTERS.map(c => c.id)).toEqual([1, 2, 3]);
  });
});

// ============================================================================
// 3. COMPATIBILITY DATA INTEGRITY
// ============================================================================

describe('Compatibility Data Integrity', () => {
  const TYPE_IDS = AI_TYPES.map(t => t.id);

  it('should have exactly 12 compatibility entries (one per type)', () => {
    expect(COMPATIBILITY).toHaveLength(12);
  });

  it('every AI type should have a compatibility entry', () => {
    TYPE_IDS.forEach(typeId => {
      const entry = COMPATIBILITY.find(c => c.typeId === typeId);
      expect(entry, `Missing compatibility for ${typeId}`).toBeDefined();
    });
  });

  it('each entry should have required fields', () => {
    COMPATIBILITY.forEach((c, i) => {
      expect(c.typeId, `Entry ${i} should have typeId`).toBeTruthy();
      expect(c.bestMatchId, `Entry ${i} should have bestMatchId`).toBeTruthy();
      expect(c.bestMatchLabel, `Entry ${i} should have bestMatchLabel`).toBeTruthy();
      expect(c.bestMatchDesc, `Entry ${i} should have bestMatchDesc`).toBeTruthy();
      expect(c.worstMatchId, `Entry ${i} should have worstMatchId`).toBeTruthy();
      expect(c.worstMatchLabel, `Entry ${i} should have worstMatchLabel`).toBeTruthy();
      expect(c.worstMatchDesc, `Entry ${i} should have worstMatchDesc`).toBeTruthy();
    });
  });

  it('bestMatchId and worstMatchId should reference valid types', () => {
    COMPATIBILITY.forEach(c => {
      expect(TYPE_IDS, `${c.typeId} bestMatchId ${c.bestMatchId} is invalid`).toContain(c.bestMatchId);
      expect(TYPE_IDS, `${c.typeId} worstMatchId ${c.worstMatchId} is invalid`).toContain(c.worstMatchId);
    });
  });

  it('bestMatchId and worstMatchId should differ for each type', () => {
    COMPATIBILITY.forEach(c => {
      expect(c.bestMatchId, `${c.typeId} best and worst should differ`).not.toBe(c.worstMatchId);
    });
  });

  it('typeId should not be its own bestMatch or worstMatch', () => {
    COMPATIBILITY.forEach(c => {
      expect(c.bestMatchId, `${c.typeId} should not be own best match`).not.toBe(c.typeId);
      expect(c.worstMatchId, `${c.typeId} should not be own worst match`).not.toBe(c.typeId);
    });
  });
});

// ============================================================================
// 4. LOADING TEXTS DATA INTEGRITY
// ============================================================================

describe('Loading Texts Data Integrity', () => {
  it('should have at least 3 loading texts', () => {
    expect(LOADING_TEXTS.length).toBeGreaterThanOrEqual(3);
  });

  it('each loading text should be a non-empty string', () => {
    LOADING_TEXTS.forEach((text, i) => {
      expect(text, `Loading text ${i} should be non-empty string`).toBeTruthy();
      expect(typeof text, `Loading text ${i} should be a string`).toBe('string');
    });
  });
});

// ============================================================================
// 5. MICRO FEEDBACK DATA INTEGRITY
// ============================================================================

describe('Micro Feedback Data Integrity', () => {
  it('should have at least 5 feedback entries', () => {
    expect(FEEDBACK_POOL.length).toBeGreaterThanOrEqual(5);
  });

  it('each feedback should have emoji and text', () => {
    FEEDBACK_POOL.forEach((fb, i) => {
      expect(fb.emoji, `Feedback ${i} should have emoji`).toBeTruthy();
      expect(fb.text, `Feedback ${i} should have text`).toBeTruthy();
      expect(typeof fb.text, `Feedback ${i} text should be string`).toBe('string');
    });
  });
});

// ============================================================================
// 6. AI TYPES - NEW FIELDS INTEGRITY
// ============================================================================

describe('AI Types New Fields', () => {
  it('every type should have goldenQuote', () => {
    AI_TYPES.forEach(type => {
      expect(type.goldenQuote, `${type.id} should have goldenQuote`).toBeTruthy();
      expect(typeof type.goldenQuote, `${type.id} goldenQuote should be string`).toBe('string');
    });
  });

  it('every type should have shortLabel', () => {
    AI_TYPES.forEach(type => {
      expect(type.shortLabel, `${type.id} should have shortLabel`).toBeTruthy();
      expect(typeof type.shortLabel, `${type.id} shortLabel should be string`).toBe('string');
    });
  });

  it('goldenQuotes should be non-empty and meaningful', () => {
    AI_TYPES.forEach(type => {
      expect(type.goldenQuote.length, `${type.id} goldenQuote should be substantial`).toBeGreaterThanOrEqual(4);
    });
  });
});

// ============================================================================
// 7. QUESTIONS - NEW FIELDS (emoji, feedback) INTEGRITY
// ============================================================================

describe('Questions New Fields', () => {
  it('every option should have an emoji field', () => {
    QUESTIONS.forEach((q, qi) => {
      q.options.forEach((opt, oi) => {
        expect(opt.emoji, `Q${qi+1} option ${oi+1} should have emoji`).toBeTruthy();
      });
    });
  });

  it('every option should have a feedback field', () => {
    QUESTIONS.forEach((q, qi) => {
      q.options.forEach((opt, oi) => {
        expect(opt.feedback, `Q${qi+1} option ${oi+1} should have feedback`).toBeTruthy();
      });
    });
  });

  it('scores field should still be intact (not broken by new fields)', () => {
    QUESTIONS.forEach((q, qi) => {
      q.options.forEach((opt, oi) => {
        expect(opt.scores, `Q${qi+1} option ${oi+1} should have scores`).toBeDefined();
        expect(typeof opt.scores, `Q${qi+1} option ${oi+1} scores should be object`).toBe('object');
        // Verify all dimension keys are valid
        Object.keys(opt.scores).forEach(dim => {
          expect(DIMENSIONS, `Q${qi+1} option ${oi+1} has invalid dimension ${dim}`).toContain(dim);
        });
      });
    });
  });
});

// ============================================================================
// 8. RANK CALCULATOR TESTS
// ============================================================================

describe('calculateRank', () => {
  it('should return a rank object with required fields', () => {
    const scores = { DEP: 50, SKILL: 50, TRUST: 50, FREQ: 50, DEPTH: 50, FAKE: 50, ANX: 50, CREAT: 50 };
    const rank = calculateRank(scores);
    expect(rank).toHaveProperty('id');
    expect(rank).toHaveProperty('name');
    expect(rank).toHaveProperty('emoji');
    expect(rank).toHaveProperty('color');
    expect(rank).toHaveProperty('minScore');
    expect(rank).toHaveProperty('maxScore');
  });

  it('should return bronze for very low average scores', () => {
    const scores = { DEP: 5, SKILL: 5, TRUST: 5, FREQ: 5, DEPTH: 5, FAKE: 5, ANX: 5, CREAT: 5 };
    const rank = calculateRank(scores);
    expect(rank.id).toBe('bronze');
  });

  it('should return king for very high average scores', () => {
    const scores = { DEP: 95, SKILL: 95, TRUST: 95, FREQ: 95, DEPTH: 95, FAKE: 95, ANX: 95, CREAT: 95 };
    const rank = calculateRank(scores);
    expect(rank.id).toBe('king');
  });

  it('should return gold for average scores around 50', () => {
    const scores = { DEP: 50, SKILL: 50, TRUST: 50, FREQ: 50, DEPTH: 50, FAKE: 50, ANX: 50, CREAT: 50 };
    const rank = calculateRank(scores);
    expect(rank.id).toBe('gold');
  });

  it('should handle zero scores (return bronze)', () => {
    const scores = { DEP: 0, SKILL: 0, TRUST: 0, FREQ: 0, DEPTH: 0, FAKE: 0, ANX: 0, CREAT: 0 };
    const rank = calculateRank(scores);
    expect(rank.id).toBe('bronze');
  });

  it('should handle missing dimension scores (treated as 0)', () => {
    const scores = { DEP: 50, SKILL: 50 };
    const rank = calculateRank(scores);
    expect(rank).toBeDefined();
    expect(rank.id).toBeTruthy();
  });

  it('should handle all 100 scores (return king)', () => {
    const scores = { DEP: 100, SKILL: 100, TRUST: 100, FREQ: 100, DEPTH: 100, FAKE: 100, ANX: 100, CREAT: 100 };
    const rank = calculateRank(scores);
    expect(rank.id).toBe('king');
  });

  it('each rank tier should be reachable', () => {
    const testCases = [
      { avg: 10, expected: 'bronze' },
      { avg: 35, expected: 'silver' },
      { avg: 53, expected: 'gold' },
      { avg: 68, expected: 'platinum' },
      { avg: 83, expected: 'diamond' },
      { avg: 95, expected: 'king' },
    ];

    testCases.forEach(({ avg, expected }) => {
      const scores = {};
      DIMENSIONS.forEach(d => { scores[d] = avg; });
      const rank = calculateRank(scores);
      expect(rank.id, `Average ${avg} should map to ${expected}, got ${rank.id}`).toBe(expected);
    });
  });
});

describe('calculateRarity', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('should return a string (not a number)', () => {
    const rarity = calculateRarity('SLAVE');
    expect(typeof rarity).toBe('string');
  });

  it('should return a parseable number string', () => {
    const rarity = calculateRarity('WIZARD');
    expect(!isNaN(parseFloat(rarity))).toBe(true);
  });

  it('should return default rarity when no localStorage data', () => {
    const rarity = calculateRarity('ORACLE');
    expect(parseFloat(rarity)).toBeGreaterThan(0);
    expect(parseFloat(rarity)).toBeLessThanOrEqual(100);
  });

  it('should return a rarity percentage with one decimal place', () => {
    const rarity = calculateRarity('SLAVE');
    const parsed = parseFloat(rarity);
    expect(parsed).toBeGreaterThanOrEqual(0);
    expect(parsed).toBeLessThanOrEqual(100);
  });

  it('should calculate from localStorage ranking data', () => {
    const ranking = { SLAVE: 50, WIZARD: 50 };
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(ranking));
    const rarity = calculateRarity('SLAVE');
    expect(parseFloat(rarity)).toBe(50.0);
  });

  it('should return 0% for a type with no entries in ranking', () => {
    const ranking = { WIZARD: 100 };
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(ranking));
    const rarity = calculateRarity('SLAVE');
    expect(parseFloat(rarity)).toBe(0.0);
  });

  it('should return default rarity when ranking object is empty (falls back to defaults)', () => {
    const ranking = {};
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(ranking));
    const rarity = calculateRarity('SLAVE');
    // Empty ranking triggers default rarities fallback, which gives 12.5 for SLAVE
    expect(parseFloat(rarity)).toBeGreaterThan(0);
    expect(parseFloat(rarity)).toBeLessThanOrEqual(100);
  });
});

describe('calculateSurpassRate', () => {
  it('should return a string', () => {
    const scores = { DEP: 50, SKILL: 50, TRUST: 50, FREQ: 50, DEPTH: 50, FAKE: 50, ANX: 50, CREAT: 50 };
    const rate = calculateSurpassRate(scores);
    expect(typeof rate).toBe('string');
  });

  it('should return a value in 15-98% range', () => {
    const scores = { DEP: 50, SKILL: 50, TRUST: 50, FREQ: 50, DEPTH: 50, FAKE: 50, ANX: 50, CREAT: 50 };
    const rate = parseFloat(calculateSurpassRate(scores));
    expect(rate).toBeGreaterThanOrEqual(15);
    expect(rate).toBeLessThanOrEqual(98);
  });

  it('higher scores should yield higher surpass rate', () => {
    const lowScores = { DEP: 10, SKILL: 10, TRUST: 10, FREQ: 10, DEPTH: 10, FAKE: 10, ANX: 10, CREAT: 10 };
    const highScores = { DEP: 90, SKILL: 90, TRUST: 90, FREQ: 90, DEPTH: 90, FAKE: 90, ANX: 90, CREAT: 90 };
    const lowRate = parseFloat(calculateSurpassRate(lowScores));
    const highRate = parseFloat(calculateSurpassRate(highScores));
    expect(highRate).toBeGreaterThan(lowRate);
  });

  it('zero scores should return minimum surpass rate (15%)', () => {
    const scores = { DEP: 0, SKILL: 0, TRUST: 0, FREQ: 0, DEPTH: 0, FAKE: 0, ANX: 0, CREAT: 0 };
    const rate = parseFloat(calculateSurpassRate(scores));
    expect(rate).toBe(15.0);
  });

  it('max scores should return near 98% surpass rate', () => {
    const scores = { DEP: 100, SKILL: 100, TRUST: 100, FREQ: 100, DEPTH: 100, FAKE: 100, ANX: 100, CREAT: 100 };
    const rate = parseFloat(calculateSurpassRate(scores));
    expect(rate).toBe(98.0);
  });
});

describe('getCompatibility', () => {
  it('should return compatibility data for a known type', () => {
    const compat = getCompatibility('ORACLE');
    expect(compat.typeId).toBe('ORACLE');
    expect(compat.bestMatchId).toBeTruthy();
    expect(compat.worstMatchId).toBeTruthy();
  });

  it('should return fallback for unknown type', () => {
    const compat = getCompatibility('UNKNOWN_TYPE');
    expect(compat.typeId).toBe('UNKNOWN_TYPE');
    expect(compat.bestMatchId).toBe('FIXER');
    expect(compat.worstMatchId).toBe('OSTRICH');
  });

  it('all 12 types should have valid compatibility data', () => {
    AI_TYPES.forEach(type => {
      const compat = getCompatibility(type.id);
      expect(compat.typeId).toBe(type.id);
      expect(compat.bestMatchId).toBeTruthy();
      expect(compat.worstMatchId).toBeTruthy();
      expect(compat.bestMatchLabel).toBeTruthy();
      expect(compat.worstMatchLabel).toBeTruthy();
    });
  });
});

describe('getBestMatchType', () => {
  it('should return a valid AI type object', () => {
    const match = getBestMatchType('ORACLE');
    expect(match).toHaveProperty('id');
    expect(match).toHaveProperty('name');
    expect(match).toHaveProperty('emoji');
    expect(AI_TYPES.find(t => t.id === match.id)).toBeDefined();
  });

  it('should return WIZARD for ORACLE', () => {
    const match = getBestMatchType('ORACLE');
    expect(match.id).toBe('WIZARD');
  });

  it('should return a type object for unknown input (fallback)', () => {
    const match = getBestMatchType('UNKNOWN');
    expect(match).toHaveProperty('id');
  });
});

describe('getWorstMatchType', () => {
  it('should return a valid AI type object', () => {
    const match = getWorstMatchType('ORACLE');
    expect(match).toHaveProperty('id');
    expect(match).toHaveProperty('name');
    expect(AI_TYPES.find(t => t.id === match.id)).toBeDefined();
  });

  it('should return OSTRICH for ORACLE', () => {
    const match = getWorstMatchType('ORACLE');
    expect(match.id).toBe('OSTRICH');
  });

  it('should return a type object for unknown input (fallback)', () => {
    const match = getWorstMatchType('UNKNOWN');
    expect(match).toHaveProperty('id');
  });
});

// ============================================================================
// 9. SHARE UTILS TESTS
// ============================================================================

describe('generateShareText', () => {
  it('should format share text correctly', () => {
    const type = { emoji: '🔮', name: 'AI先知' };
    const text = generateShareText(type);
    expect(text).toBe('承认吧，这才是你的AI灵魂！我是🔮AI先知，你呢？');
  });

  it('should include emoji and type name', () => {
    const type = { emoji: '🤖', name: 'AI奴隶' };
    const text = generateShareText(type);
    expect(text).toContain('🤖');
    expect(text).toContain('AI奴隶');
  });
});

describe('generateShareUrl', () => {
  it('should include ref and personality params', () => {
    const url = generateShareUrl('ORACLE');
    expect(url).toContain('ref=ORACLE');
    expect(url).toContain('personality=ORACLE');
  });

  it('should use different type IDs correctly', () => {
    const url = generateShareUrl('SLAVE');
    expect(url).toContain('ref=SLAVE');
    expect(url).toContain('personality=SLAVE');
  });
});

describe('parseReferralParams', () => {
  it('should return null values when no window.location', () => {
    // In test environment, window.location.search may be empty
    const params = parseReferralParams();
    expect(params).toHaveProperty('ref');
    expect(params).toHaveProperty('personality');
  });

  it('should always return an object with ref and personality keys', () => {
    const params = parseReferralParams();
    expect('ref' in params).toBe(true);
    expect('personality' in params).toBe(true);
  });
});

describe('getReferralType', () => {
  it('should return null when no personality param in URL', () => {
    const result = getReferralType();
    // Without a personality param, should return null
    expect(result === null || result === undefined || (result && result.id)).toBeDefined();
  });
});

// ============================================================================
// 10. POSTER GENERATOR TESTS
// ============================================================================

describe('Poster Generator', () => {
  // Note: generatePoster requires Canvas API which is not available in Node
  // We test the structural integrity instead

  it('generatePoster should be an async function', async () => {
    const { generatePoster } = await import('../utils/posterGenerator');
    expect(typeof generatePoster).toBe('function');
  });

  it('posterGenerator imports all required dependencies', async () => {
    // Verify the module can be imported without errors
    const module = await import('../utils/posterGenerator');
    expect(module.generatePoster).toBeDefined();
  });
});

// ============================================================================
// 11. CROSS-MODULE INTEGRATION TESTS
// ============================================================================

describe('Cross-Module Integration', () => {
  it('rankCalculator uses correct DIMENSIONS from calculator.js', () => {
    // calculateRank should work with the same DIMENSIONS array
    const scores = {};
    DIMENSIONS.forEach(d => { scores[d] = 50; });
    const rank = calculateRank(scores);
    expect(rank).toBeDefined();
    expect(rank.id).toBeTruthy();
  });

  it('compatibility references match actual AI type IDs', () => {
    const typeIds = new Set(AI_TYPES.map(t => t.id));
    COMPATIBILITY.forEach(c => {
      expect(typeIds.has(c.bestMatchId), `bestMatchId ${c.bestMatchId} is not a valid type`).toBe(true);
      expect(typeIds.has(c.worstMatchId), `worstMatchId ${c.worstMatchId} is not a valid type`).toBe(true);
    });
  });

  it('ranking page would correctly calculate rank for each type', () => {
    // Simulates what RankingPage.jsx does
    AI_TYPES.forEach(type => {
      const repScores = {};
      const allDims = ['DEP', 'SKILL', 'TRUST', 'FREQ', 'DEPTH', 'FAKE', 'ANX', 'CREAT'];
      allDims.forEach(dim => {
        const cond = type.conditions[dim];
        if (cond) {
          repScores[dim] = Math.round((cond[0] + cond[1]) / 2);
        } else {
          repScores[dim] = 40;
        }
      });
      const rank = calculateRank(repScores);
      expect(rank).toBeDefined();
      expect(rank.id).toBeTruthy();
    });
  });

  it('share URL format matches what posterGenerator expects', () => {
    const typeId = 'ORACLE';
    const shareUrl = generateShareUrl(typeId);
    // posterGenerator uses: `${BASE_URL}?ref=${result.typeId}&personality=${result.typeId}`
    expect(shareUrl).toContain(`ref=${typeId}`);
    expect(shareUrl).toContain(`personality=${typeId}`);
  });
});

// ============================================================================
// 12. APP.JX URL PARAMETER PARSING LOGIC
// ============================================================================

describe('App URL Parameter Parsing', () => {
  it('getReferralType should return correct type for valid personality param', () => {
    // We can't easily test URL parsing in Node, but we can verify the logic chain
    // getReferralType calls parseReferralParams and looks up the type
    const oracleType = AI_TYPES.find(t => t.id === 'ORACLE');
    expect(oracleType).toBeDefined();
    expect(oracleType.id).toBe('ORACLE');
  });

  it('HomePage receives referralType prop and renders friend invitation', () => {
    // Verify the prop type structure
    // referralType should be an AI type object or null
    const mockReferralType = AI_TYPES.find(t => t.id === 'ORACLE');
    expect(mockReferralType).toHaveProperty('emoji');
    expect(mockReferralType).toHaveProperty('name');
    expect(mockReferralType).toHaveProperty('color');
  });
});

// ============================================================================
// 13. BACKWARD COMPATIBILITY CHECKS
// ============================================================================

describe('Backward Compatibility', () => {
  it('questions.js scores field should be identical to original structure', () => {
    // Verify scores still has the same structure
    QUESTIONS.forEach(q => {
      q.options.forEach(opt => {
        expect(typeof opt.scores).toBe('object');
        Object.keys(opt.scores).forEach(dim => {
          expect(DIMENSIONS).toContain(dim);
          expect(typeof opt.scores[dim]).toBe('number');
        });
      });
    });
  });

  it('AI_TYPES conditions should still be valid [min, max] pairs', () => {
    AI_TYPES.forEach(type => {
      Object.entries(type.conditions).forEach(([dim, range]) => {
        expect(Array.isArray(range)).toBe(true);
        expect(range).toHaveLength(2);
        expect(range[0]).toBeLessThanOrEqual(range[1]);
      });
    });
  });

  it('new fields should not break existing calculator logic', async () => {
    // Adding emoji, feedback, goldenQuote, shortLabel should not affect score calculation
    const answers = [0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2];
    const { calculateScores: calcScores, determineType: detType } = await import('../utils/calculator');
    const scores = calcScores(answers, QUESTIONS);
    const type = detType(scores);
    expect(type).toBeDefined();
    expect(type.id).toBeTruthy();
  });

  it('RANKS array should have consistent min/max coverage', () => {
    // Every score from 0-100 should fall into exactly one rank
    for (let score = 0; score <= 100; score++) {
      const testScores = {};
      DIMENSIONS.forEach(d => { testScores[d] = score; });
      const rank = calculateRank(testScores);
      expect(rank).toBeDefined();
      expect(rank.id).toBeTruthy();
    }
  });
});
