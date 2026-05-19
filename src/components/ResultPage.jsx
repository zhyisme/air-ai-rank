import React, { useRef, useCallback } from 'react';
import AI_TYPES from '../data/types';
import { DIMENSION_LABELS, DIMENSIONS } from '../utils/calculator';
import RadarChart from './RadarChart';

/**
 * ResultPage component - displays the quiz result with type card, radar chart, soul questions.
 * @param {Object} result - { typeId, scores, timestamp }
 * @param {Function} onRetake - Callback to retake quiz
 * @param {Function} onViewRanking - Callback to view ranking page
 */
export default function ResultPage({ result, onRetake, onViewRanking }) {
  const resultRef = useRef(null);
  const type = AI_TYPES.find(t => t.id === result.typeId) || AI_TYPES[0];

  const handleSaveImage = useCallback(() => {
    // Use html2canvas-like approach: create a canvas from the result card
    // For simplicity, we'll use the Web Share API or just notify user to screenshot
    if (navigator.share) {
      navigator.share({
        title: `我是${type.name}！AIR·AI段位实况`,
        text: `我的AI人格类型是 ${type.emoji} ${type.name} - "${type.tagline}"，来测测你的AI段位！`,
        url: window.location.href,
      }).catch(() => {
        // User cancelled or not supported
      });
    } else {
      // Fallback: copy text to clipboard
      const text = `我是${type.emoji} ${type.name} - "${type.tagline}"\n来测测你的AI段位！🔮`;
      navigator.clipboard.writeText(text).then(() => {
        alert('已复制到剪贴板！快去朋友圈分享吧~');
      }).catch(() => {
        alert('请截图分享到朋友圈~');
      });
    }
  }, [type]);

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      alert('链接已复制！');
    }).catch(() => {
      // Fallback
      const input = document.createElement('input');
      input.value = window.location.href;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      alert('链接已复制！');
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col pb-8">
      {/* Result Card - the hero section */}
      <div className="px-6 pt-8 pb-4" ref={resultRef}>
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
            <p className="text-lg text-gray-300 italic">
              "{type.tagline}"
            </p>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="px-6 mb-6 fade-in-up">
        <div className="glass-card p-5">
          <p className="text-sm text-gray-300 leading-relaxed">
            {type.description}
          </p>
        </div>
      </div>

      {/* Radar Chart */}
      <div className="px-6 mb-6 fade-in-up" style={{ animationDelay: '0.1s' }}>
        <h3 className="text-sm font-bold text-gray-400 mb-3 text-center">你的AI维度画像</h3>
        <div className="glass-card p-4 flex justify-center">
          <RadarChart scores={result.scores} typeColor={type.color} />
        </div>
      </div>

      {/* Dimension Scores List */}
      <div className="px-6 mb-6 fade-in-up" style={{ animationDelay: '0.15s' }}>
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
      <div className="px-6 mb-6 fade-in-up" style={{ animationDelay: '0.2s' }}>
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
      <div className="px-6 mb-6 fade-in-up" style={{ animationDelay: '0.25s' }}>
        <div className="glass-card p-5 text-center">
          <p className="text-xs text-gray-500 mb-4">截图分享到朋友圈，看看朋友们是什么段位 👇</p>
          <div className="flex gap-3 justify-center">
            <button
              className="cta-button text-sm py-3 px-6"
              onClick={handleSaveImage}
              style={{ fontSize: '14px' }}
            >
              📤 分享结果
            </button>
            <button
              className="text-sm py-3 px-6 rounded-full border border-gray-600 text-gray-300 hover:border-purple-500 hover:text-white transition-all"
              onClick={handleCopyLink}
            >
              🔗 复制链接
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-6 flex flex-col gap-3 fade-in-up" style={{ animationDelay: '0.3s' }}>
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
    </div>
  );
}
