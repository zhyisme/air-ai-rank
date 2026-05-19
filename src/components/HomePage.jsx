import React, { useState, useEffect } from 'react';
import AI_TYPES from '../data/types';

/**
 * HomePage component - the landing page with hero section and CTA.
 * @param {Function} onStart - Callback when user clicks "开始测试"
 * @param {Function} onViewRanking - Callback when user wants to see ranking
 */
export default function HomePage({ onStart, onViewRanking }) {
  const [currentPreview, setCurrentPreview] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);

  // Cycle through 3 preview cards
  useEffect(() => {
    const interval = setInterval(() => {
      setFadeIn(false);
      setTimeout(() => {
        setCurrentPreview(prev => (prev + 1) % 3);
        setFadeIn(true);
      }, 300);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const previewTypes = [
    AI_TYPES.find(t => t.id === 'WIZARD'),
    AI_TYPES.find(t => t.id === 'FAKE'),
    AI_TYPES.find(t => t.id === 'ADDICT'),
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-64 h-64 rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, #8B5CF6, transparent)',
            top: '-80px',
            right: '-80px',
          }}
        />
        <div
          className="absolute w-48 h-48 rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, #06B6D4, transparent)',
            bottom: '60px',
            left: '-60px',
          }}
        />
      </div>

      {/* Logo / Title */}
      <div className="relative z-10 text-center mb-8 fade-in-up">
        <div className="text-6xl mb-4">🔮</div>
        <h1 className="text-4xl font-black gradient-text mb-3 tracking-wide">
          AIR·AI段位实况
        </h1>
        <p className="text-gray-400 text-base leading-relaxed">
          AI时代，你是青铜还是王者？<br />
          还是……根本没登录？
        </p>
      </div>

      {/* Preview Cards Carousel */}
      <div className="relative z-10 w-full max-w-xs mb-10" style={{ minHeight: '140px' }}>
        <div
          className={`glass-card p-5 text-center transition-opacity duration-300 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}
        >
          <div className="text-3xl mb-2">{previewTypes[currentPreview].emoji}</div>
          <div
            className="text-lg font-bold mb-1"
            style={{ color: previewTypes[currentPreview].color }}
          >
            {previewTypes[currentPreview].name}
          </div>
          <div className="text-sm text-gray-400 italic">
            "{previewTypes[currentPreview].tagline}"
          </div>
        </div>
        {/* Carousel dots */}
        <div className="flex justify-center mt-3 gap-2">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === currentPreview ? 'bg-gradient-to-r from-purple-500 to-cyan-400 w-5' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>

      {/* CTA Button */}
      <div className="relative z-10 mb-6 fade-in-up" style={{ animationDelay: '0.2s' }}>
        <button className="cta-button" onClick={onStart}>
          开始测试 →
        </button>
      </div>

      {/* View ranking link */}
      <div className="relative z-10 mb-8">
        <button
          className="text-sm text-gray-500 hover:text-gray-300 transition-colors underline underline-offset-4"
          onClick={onViewRanking}
        >
          查看段位排行榜
        </button>
      </div>

      {/* Counter */}
      <div className="relative z-10 text-center fade-in-up" style={{ animationDelay: '0.4s' }}>
        <p className="text-xs text-gray-600">
          已有 <span className="text-gray-400 font-mono">128,847</span> 人完成测试
        </p>
      </div>

      {/* Bottom decorative line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
    </div>
  );
}
