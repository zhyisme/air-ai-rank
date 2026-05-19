/**
 * Rank tier definitions for AI personality types.
 * Each rank maps a score range to a named tier with emoji and color.
 */
const RANKS = [
  { id: 'bronze',   name: '青铜', emoji: '🥉', color: '#CD7F32', minScore: 0,  maxScore: 25 },
  { id: 'silver',   name: '白银', emoji: '🥈', color: '#C0C0C0', minScore: 26, maxScore: 45 },
  { id: 'gold',     name: '黄金', emoji: '🥇', color: '#FFD700', minScore: 46, maxScore: 60 },
  { id: 'platinum', name: '铂金', emoji: '💎', color: '#E5E4E2', minScore: 61, maxScore: 75 },
  { id: 'diamond',  name: '钻石', emoji: '💠', color: '#B9F2FF', minScore: 76, maxScore: 90 },
  { id: 'king',     name: '王者', emoji: '👑', color: '#FF6B6B', minScore: 91, maxScore: 100 },
];

export default RANKS;
