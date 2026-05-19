import React, { useMemo } from 'react';
import AI_TYPES from '../data/types';
import RANKS from '../data/ranks';
import { getInitialRanking } from '../utils/calculator';
import { calculateRank } from '../utils/rankCalculator';

/**
 * RankingPage component - enhanced with rank tier badges next to each type.
 *
 * @param {Function} onBack - Callback to go back to result page
 */
export default function RankingPage({ onBack }) {
  const ranking = useMemo(() => getInitialRanking(), []);

  // Sort types by count descending
  const sortedTypes = useMemo(() => {
    return [...AI_TYPES].sort((a, b) => (ranking[b.id] || 0) - (ranking[a.id] || 0));
  }, [ranking]);

  // Calculate total and max for percentage
  const total = useMemo(() => {
    return Object.values(ranking).reduce((sum, count) => sum + count, 0);
  }, [ranking]);

  const maxCount = Math.max(...Object.values(ranking), 1);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0F0F1A]/90 backdrop-blur-sm px-4 pt-4 pb-3 border-b border-white/5">
        <div className="flex items-center gap-3">
          <button
            className="text-gray-400 hover:text-white transition-colors"
            onClick={onBack}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <h2 className="text-lg font-bold text-white">🏆 段位排行榜</h2>
        </div>
        <p className="text-xs text-gray-500 mt-1 ml-8">共 {total.toLocaleString()} 人完成测试</p>
      </div>

      {/* Rank tier legend */}
      <div className="px-4 py-3 flex items-center gap-2 overflow-x-auto">
        {RANKS.map(rank => (
          <span
            key={rank.id}
            className="shrink-0 text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ background: rank.color + '20', color: rank.color }}
          >
            {rank.emoji} {rank.name}
          </span>
        ))}
      </div>

      {/* Ranking List */}
      <div className="px-4 py-4 space-y-2.5">
        {sortedTypes.map((type, index) => {
          const count = ranking[type.id] || 0;
          const percentage = total > 0 ? ((count / total) * 100) : 0;
          const barWidth = (count / maxCount) * 100;

          // Calculate rank for this type based on a simulated average score
          // Use the midpoint of condition ranges as a representative score
          const repScores = {};
          const allDims = ['DEP', 'SKILL', 'TRUST', 'FREQ', 'DEPTH', 'FAKE', 'ANX', 'CREAT'];
          allDims.forEach(dim => {
            const cond = type.conditions[dim];
            if (cond) {
              repScores[dim] = Math.round((cond[0] + cond[1]) / 2);
            } else {
              repScores[dim] = 40; // Default moderate score
            }
          });
          const typeRank = calculateRank(repScores);

          return (
            <div
              key={type.id}
              className="glass-card px-4 py-3 fade-in-up"
              style={{ animationDelay: `${index * 0.04}s` }}
            >
              <div className="flex items-center gap-3 mb-2">
                {/* Rank */}
                <span className={`text-xs font-bold w-5 text-center ${
                  index === 0 ? 'text-yellow-400' :
                  index === 1 ? 'text-gray-300' :
                  index === 2 ? 'text-orange-400' :
                  'text-gray-600'
                }`}>
                  {index + 1}
                </span>
                {/* Emoji */}
                <span className="text-lg">{type.emoji}</span>
                {/* Name & ID + Rank Badge */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="font-bold text-sm" style={{ color: type.color }}>
                      {type.name}
                    </span>
                    <span className="text-xs text-gray-600 font-mono">{type.id}</span>
                    {/* Rank tier badge */}
                    <span
                      className="text-xs font-bold px-1.5 py-0.5 rounded"
                      style={{ background: typeRank.color + '20', color: typeRank.color }}
                    >
                      {typeRank.emoji}{typeRank.name}
                    </span>
                  </div>
                </div>
                {/* Percentage */}
                <span className="text-sm font-mono text-gray-400 shrink-0">
                  {percentage.toFixed(1)}%
                </span>
              </div>
              {/* Progress Bar */}
              <div className="ml-8 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${barWidth}%`,
                    background: `linear-gradient(90deg, ${type.color}, ${type.color}88)`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom note */}
      <div className="px-4 py-6 text-center">
        <p className="text-xs text-gray-600">
          数据来源于所有测试者结果统计
        </p>
      </div>
    </div>
  );
}
