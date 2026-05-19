import React, { useState, useCallback } from 'react';
import AI_TYPES from '../data/types';
import { DIMENSION_LABELS, DIMENSIONS } from '../utils/calculator';
import { calculateRank, calculateRarity, calculateSurpassRate, getCompatibility, getBestMatchType, getWorstMatchType } from '../utils/rankCalculator';
import { generateShareText, generateShareUrl, copyToClipboard } from '../utils/shareUtils';
import RadarChart from './RadarChart';
import ResultReveal from './ResultReveal';
import SharePoster from './SharePoster';

/**
 * ResultPage component - redesigned with reveal animation, rank, rarity,
 * compatibility pairing, and poster sharing.
 *
 * @param {Object} result - { typeId, scores, timestamp }
 * @param {Function} onRetake - Callback to retake quiz
 * @param {Function} onViewRanking - Callback to view ranking page
 */
export default function ResultPage({ result, onRetake, onViewRanking }) {
  const [revealComplete, setRevealComplete] = useState(false);
  const [showPoster, setShowPoster] = useState(false);
  const [copied, setCopied] = useState(false);

  const type = AI_TYPES.find(t => t.id === result.typeId) || AI_TYPES[0];
  const rank = calculateRank(result.scores);
  const rarity = calculateRarity(result.typeId);
  const surpassRate = calculateSurpassRate(result.scores);
  const compat = getCompatibility(result.typeId);
  const bestMatch = getBestMatchType(result.typeId);
  const worstMatch = getWorstMatchType(result.typeId);

  const handleRevealComplete = useCallback(() => {
    setRevealComplete(true);
  }, []);

  const handleShare = useCallback(async () => {
    const text = generateShareText(type);
    const url = generateShareUrl(result.typeId);

    if (navigator.share) {
      try {
        await navigator.share({ title: 'AIR·AI段位实况', text, url });
        return;
      } catch (e) {
        // User cancelled, fall through to clipboard
      }
    }

    // Fallback: copy to clipboard
    const success = await copyToClipboard(`${text}\n${url}`);
    setCopied(success);
    setTimeout(() => setCopied(false), 2000);
  }, [type, result.typeId]);

  // Show reveal animation first
  if (!revealComplete) {
    return <ResultReveal result={result} onComplete={handleRevealComplete} />;
  }

  return (
    <div className="min-h-screen flex flex-col pb-8">
      {/* Result Card - the hero section */}
      <div className="px-6 pt-8 pb-4">
        <div
          className="gradient-border glow"
          style={{ background: `linear-gradient(135deg, ${type.color}, #06B6D4)` }}
        >
          <div className="gradient-border-inner text-center" style={{ background: '#0F0F1A' }}>
            {/* Emoji */}
            <div className="text-6xl mb-3">{type.emoji}</div>
            {/* Type ID */}
            <div
              className="text-xs font-mono tracking-widest mb-2 opacity-70"
              style={{ color: type.color }}
            >
              {type.id}
            </div>
            {/* Type Name */}
            <h1
              className="text-3xl font-black mb-2"
              style={{ color: type.color }}
            >
              {type.name}
            </h1>
            {/* Tagline */}
            <p className="text-lg text-gray-300 italic mb-4">
              "{type.tagline}"
            </p>
            {/* Rank Badge */}
            <div className="flex items-center justify-center gap-2">
              <span
                className="rank-badge"
                style={{ background: rank.color + '25', color: rank.color }}
              >
                {rank.emoji} {rank.name}段位
              </span>
              <span
                className="rank-badge"
                style={{ background: type.color + '20', color: type.color }}
              >
                {type.shortLabel}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Golden Quote */}
      <div className="px-6 mb-4 fade-in-up">
        <div className="glass-card p-4 text-center">
          <p className="text-base text-gray-200 font-bold italic">
            "{type.goldenQuote}"
          </p>
        </div>
      </div>

      {/* Rarity & Surpass */}
      <div className="px-6 mb-4 fade-in-up" style={{ animationDelay: '0.05s' }}>
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card p-4 text-center">
            <div className="text-2xl mb-1">💎</div>
            <div className="text-sm text-gray-400">稀有度</div>
            <div className="text-lg font-bold" style={{ color: type.color }}>
              仅 {rarity}%
            </div>
            <div className="text-xs text-gray-500">的人与你同频</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl mb-1">🏆</div>
            <div className="text-sm text-gray-400">超越率</div>
            <div className="text-lg font-bold" style={{ color: type.color }}>
              {surpassRate}%
            </div>
            <div className="text-xs text-gray-500">的人被你超越</div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="px-6 mb-6 fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div className="glass-card p-5">
          <p className="text-sm text-gray-300 leading-relaxed">
            {type.description}
          </p>
        </div>
      </div>

      {/* Compatibility Section */}
      <div className="px-6 mb-6 fade-in-up" style={{ animationDelay: '0.15s' }}>
        <h3 className="text-sm font-bold text-gray-400 mb-3 text-center">🤝 人格配对</h3>
        <div className="grid grid-cols-2 gap-3">
          {/* Best Match */}
          <div className="glass-card p-4">
            <div className="text-xs text-gray-500 mb-2">最佳搭档</div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{bestMatch.emoji}</span>
              <span className="font-bold text-sm" style={{ color: bestMatch.color }}>
                {bestMatch.name}
              </span>
            </div>
            <div className="text-xs font-bold text-green-400 mb-1">
              {compat.bestMatchLabel}
            </div>
            <div className="text-xs text-gray-400">
              {compat.bestMatchDesc}
            </div>
          </div>
          {/* Worst Match */}
          <div className="glass-card p-4">
            <div className="text-xs text-gray-500 mb-2">最不合拍</div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{worstMatch.emoji}</span>
              <span className="font-bold text-sm" style={{ color: worstMatch.color }}>
                {worstMatch.name}
              </span>
            </div>
            <div className="text-xs font-bold text-orange-400 mb-1">
              {compat.worstMatchLabel}
            </div>
            <div className="text-xs text-gray-400">
              {compat.worstMatchDesc}
            </div>
          </div>
        </div>
      </div>

      {/* Radar Chart */}
      <div className="px-6 mb-6 fade-in-up" style={{ animationDelay: '0.2s' }}>
        <h3 className="text-sm font-bold text-gray-400 mb-3 text-center">你的AI维度画像</h3>
        <div className="glass-card p-4 flex justify-center">
          <RadarChart scores={result.scores} typeColor={type.color} />
        </div>
      </div>

      {/* Dimension Scores List */}
      <div className="px-6 mb-6 fade-in-up" style={{ animationDelay: '0.25s' }}>
        <div className="glass-card p-4 space-y-3">
          {DIMENSIONS.map(dim => (
            <div key={dim} className="flex items-center gap-3">
              <span className="text-xs text-gray-500 w-14 shrink-0">{DIMENSION_LABELS[dim]}</span>
              <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${result.scores[dim]}%`,
                    background: `linear-gradient(90deg, ${type.color}, #06B6D4)`,
                  }}
                />
              </div>
              <span className="text-xs font-mono text-gray-400 w-8 text-right">
                {result.scores[dim]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Soul Questions */}
      <div className="px-6 mb-6 fade-in-up" style={{ animationDelay: '0.3s' }}>
        <h3 className="text-sm font-bold text-gray-400 mb-3">💬 灵魂拷问</h3>
        <div className="space-y-3">
          {type.soulQuestions.map((q, i) => (
            <div key={i} className="glass-card p-4 border-l-2" style={{ borderColor: type.color }}>
              <p className="text-sm text-gray-300 leading-relaxed">{q}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Share Section */}
      <div className="px-6 mb-6 fade-in-up" style={{ animationDelay: '0.35s' }}>
        <div className="glass-card p-5 text-center">
          <p className="text-xs text-gray-500 mb-4">分享给朋友，看看他们的AI灵魂是什么 👇</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button
              className="cta-button text-sm py-3 px-5"
              onClick={() => setShowPoster(true)}
              style={{ fontSize: '14px' }}
            >
              🎨 生成海报
            </button>
            <button
              className="text-sm py-3 px-5 rounded-full border border-gray-600 text-gray-300 hover:border-purple-500 hover:text-white transition-all"
              onClick={handleShare}
            >
              {copied ? '✅ 已复制！' : '📤 分享给好友'}
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-6 flex flex-col gap-3 fade-in-up" style={{ animationDelay: '0.4s' }}>
        <button
          className="w-full py-3.5 rounded-xl border border-gray-700 text-gray-300 hover:border-purple-500 hover:text-white transition-all text-sm font-medium"
          onClick={onViewRanking}
        >
          🏆 查看段位排行榜
        </button>
        <button
          className="w-full py-3.5 rounded-xl text-gray-500 hover:text-gray-300 transition-all text-sm"
          onClick={onRetake}
        >
          🔄 重新测试
        </button>
      </div>

      {/* Share Poster Modal */}
      {showPoster && (
        <SharePoster result={result} onClose={() => setShowPoster(false)} />
      )}
    </div>
  );
}
