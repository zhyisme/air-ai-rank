import React, { useState, useCallback } from 'react';
import AI_TYPES from '../data/types';
import { DIMENSION_LABELS, DIMENSIONS } from '../utils/calculator';
import { calculateRank, calculateRarity, calculateSurpassRate, getCompatibility, getBestMatchType, getWorstMatchType } from '../utils/rankCalculator';
import { triggerShare, isWeChat, generateShareUrl } from '../utils/shareUtils';
import RadarChart from './RadarChart';
import ResultReveal from './ResultReveal';
import SharePoster from './SharePoster';

/**
 * ResultPage — compact share-first design.
 * Optimized for mobile sharing to WeChat Moments / Groups.
 */
export default function ResultPage({ result, onRetake, onViewRanking }) {
  const [revealComplete, setRevealComplete] = useState(false);
  const [showPoster, setShowPoster] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showWeChatGuide, setShowWeChatGuide] = useState(false);
  const [shareStatus, setShareStatus] = useState(''); // 'copied' | 'wechat-guide' | ''
  const [posterUrl, setPosterUrl] = useState(null);

  const type = AI_TYPES.find(t => t.id === result.typeId) || AI_TYPES[0];
  const rank = calculateRank(result.scores);
  const rarity = calculateRarity(result.typeId);
  const surpassRate = calculateSurpassRate(result.scores);
  const compat = getCompatibility(result.typeId);
  const bestMatch = getBestMatchType(result.typeId);
  const worstMatch = getWorstMatchType(result.typeId);
  const inWeChat = isWeChat();

  const handleRevealComplete = useCallback(() => {
    setRevealComplete(true);
  }, []);

  const handleShare = useCallback(async () => {
    setShareStatus('');
    const status = await triggerShare(type, result.typeId, posterUrl);
    if (status === 'wechat-guide') {
      setShareStatus('wechat-guide');
      setShowWeChatGuide(true);
    } else if (status === 'copied') {
      setShareStatus('copied');
      setTimeout(() => setShareStatus(''), 2000);
    } else if (status === 'shared') {
      setShareStatus('shared');
      setTimeout(() => setShareStatus(''), 2000);
    }
  }, [type, result.typeId, posterUrl]);

  const handleShowPoster = useCallback(() => {
    setShowPoster(true);
  }, []);

  const handlePosterReady = useCallback((url) => {
    setPosterUrl(url);
  }, []);

  if (!revealComplete) {
    return <ResultReveal result={result} onComplete={handleRevealComplete} />;
  }

  return (
    <div className="min-h-screen flex flex-col pb-6">
      {/* ===== HERO CARD (compact, all-in-one) ===== */}
      <div className="px-4 pt-6 pb-2">
        <div className="gradient-border glow">
          <div className="gradient-border-inner text-center" style={{ background: '#0F0F1A', padding: '20px 16px' }}>
            {/* Emoji + Name */}
            <div className="text-5xl mb-2">{type.emoji}</div>
            <h1 className="text-2xl font-black mb-1" style={{ color: type.color }}>
              {type.name}
            </h1>
            <p className="text-sm text-gray-400 italic mb-3">"{type.tagline}"</p>

            {/* Rank + ShortLabel badges */}
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="rank-badge" style={{ background: rank.color + '20', color: rank.color }}>
                {rank.emoji} {rank.name}
              </span>
              <span className="rank-badge" style={{ background: type.color + '15', color: type.color }}>
                {type.shortLabel}
              </span>
            </div>

            {/* Golden Quote */}
            <p className="text-sm text-gray-200 font-bold italic leading-snug">
              "{type.goldenQuote}"
            </p>

            {/* Inline stats */}
            <div className="flex items-center justify-center gap-4 mt-3">
              <span className="text-xs text-gray-400">
                💎 仅 <strong style={{ color: type.color }}>{rarity}%</strong> 同频
              </span>
              <span className="text-xs text-gray-400">
                🏆 超越 <strong style={{ color: type.color }}>{surpassRate}%</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ===== COMPATIBILITY (compact row) ===== */}
      <div className="px-4 mb-3">
        <div className="glass-card p-3 flex items-center justify-between gap-2">
          <div className="flex-1 text-center">
            <div className="text-xs text-gray-500 mb-0.5">最佳搭档</div>
            <div className="flex items-center justify-center gap-1">
              <span className="text-lg">{bestMatch.emoji}</span>
              <span className="text-xs font-bold" style={{ color: bestMatch.color }}>{bestMatch.name}</span>
            </div>
            <div className="text-[10px] text-green-400 mt-0.5">{compat.bestMatchLabel}</div>
          </div>
          <div className="w-px h-10 bg-gray-700" />
          <div className="flex-1 text-center">
            <div className="text-xs text-gray-500 mb-0.5">最不合拍</div>
            <div className="flex items-center justify-center gap-1">
              <span className="text-lg">{worstMatch.emoji}</span>
              <span className="text-xs font-bold" style={{ color: worstMatch.color }}>{worstMatch.name}</span>
            </div>
            <div className="text-[10px] text-orange-400 mt-0.5">{compat.worstMatchLabel}</div>
          </div>
        </div>
      </div>

      {/* ===== SHARE SECTION (prominent, primary CTA) ===== */}
      <div className="px-4 mb-3">
        <div className="glass-card p-4 text-center">
          <p className="text-xs text-gray-400 mb-3">分享给朋友，看看他们的AI灵魂是什么 👇</p>

          <div className="flex gap-2 justify-center">
            {/* Primary: Share button */}
            <button
              className="cta-button text-sm py-2.5 px-5 flex-1 max-w-[160px]"
              onClick={handleShare}
            >
              {shareStatus === 'copied' ? '✅ 已复制' :
               shareStatus === 'shared' ? '✅ 已分享' :
               '📤 分享给好友'}
            </button>
            {/* Secondary: Poster button */}
            <button
              className="text-sm py-2.5 px-4 rounded-full border border-gray-600 text-gray-300 hover:border-purple-500 hover:text-white transition-all flex-1 max-w-[140px]"
              onClick={handleShowPoster}
            >
              🎨 生成海报
            </button>
          </div>

          {/* WeChat tip */}
          {inWeChat && (
            <p className="text-[11px] text-gray-500 mt-2">
              微信内点击右上角「···」→ 转发给朋友
            </p>
          )}
        </div>
      </div>

      {/* ===== COLLAPSIBLE DETAILS ===== */}
      <div className="px-4 mb-3">
        <button
          className="w-full glass-card p-3 flex items-center justify-between text-gray-300 hover:text-white transition-all"
          onClick={() => setShowDetails(!showDetails)}
        >
          <span className="text-sm font-medium">📊 查看详细画像</span>
          <span className="text-lg transition-transform duration-200" style={{ transform: showDetails ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            ▼
          </span>
        </button>

        {showDetails && (
          <div className="mt-2 space-y-3 fade-in-up">
            {/* Description */}
            <div className="glass-card p-3">
              <p className="text-xs text-gray-300 leading-relaxed">{type.description}</p>
            </div>

            {/* Radar Chart (smaller) */}
            <div className="glass-card p-3 flex justify-center">
              <RadarChart scores={result.scores} typeColor={type.color} />
            </div>

            {/* Dimension Scores */}
            <div className="glass-card p-3 space-y-2">
              {DIMENSIONS.map(dim => (
                <div key={dim} className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-500 w-12 shrink-0">{DIMENSION_LABELS[dim]}</span>
                  <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${result.scores[dim]}%`,
                        background: `linear-gradient(90deg, ${type.color}, #06B6D4)`,
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-gray-400 w-6 text-right">{result.scores[dim]}</span>
                </div>
              ))}
            </div>

            {/* Soul Questions */}
            <div>
              <h3 className="text-xs font-bold text-gray-400 mb-2">💬 灵魂拷问</h3>
              {type.soulQuestions.map((q, i) => (
                <div key={i} className="glass-card p-3 mb-2 border-l-2" style={{ borderColor: type.color }}>
                  <p className="text-xs text-gray-300 leading-relaxed">{q}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ===== BOTTOM ACTIONS ===== */}
      <div className="px-4 flex flex-col gap-2 mt-auto">
        <button
          className="w-full py-3 rounded-xl border border-gray-700 text-gray-300 hover:border-purple-500 hover:text-white transition-all text-sm font-medium"
          onClick={onViewRanking}
        >
          🏆 查看段位排行榜
        </button>
        <button
          className="w-full py-3 rounded-xl text-gray-500 hover:text-gray-300 transition-all text-sm"
          onClick={onRetake}
        >
          🔄 重新测试
        </button>
      </div>

      {/* ===== SHARE POSTER MODAL ===== */}
      {showPoster && (
        <SharePoster result={result} onClose={() => setShowPoster(false)} onPosterReady={handlePosterReady} />
      )}

      {/* ===== WECHAT SHARE GUIDE OVERLAY ===== */}
      {showWeChatGuide && (
        <div
          className="fixed inset-0 z-[60] bg-black/80 flex flex-col items-end pt-4 pr-6"
          onClick={() => setShowWeChatGuide(false)}
        >
          {/* Arrow pointing to top-right */}
          <div className="text-right mb-2">
            <div className="text-4xl mb-2">👆</div>
            <div className="bg-white text-gray-800 text-sm font-bold px-4 py-2 rounded-lg inline-block">
              点击右上角「···」<br />
              <span className="text-xs font-normal text-gray-500">转发给朋友 / 分享到朋友圈</span>
            </div>
          </div>
          <div className="text-white/60 text-xs mt-4 text-center w-full">
            链接已复制到剪贴板，点击任意处关闭
          </div>
        </div>
      )}
    </div>
  );
}
