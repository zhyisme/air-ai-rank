import React, { useState, useEffect } from 'react';
import AI_TYPES from '../data/types';
import ParticleBackground from './ParticleBackground';
import TypewriterText from './TypewriterText';

/**
 * HomePage component - redesigned landing page with particles, typewriter,
 * dynamic counter, and friend invitation support.
 *
 * @param {Function} onStart - Callback when user clicks "开始灵魂探索"
 * @param {Function} onViewRanking - Callback when user wants to see ranking
 * @param {string} referralType - AI type ID from friend's referral link
 */
export default function HomePage({ onStart, onViewRanking, referralType }) {
  const [count, setCount] = useState(0);
  const [typewriterDone, setTypewriterDone] = useState(false);

  // Dynamic counter: base 128847 + (current timestamp - project start timestamp) / 3000
  useEffect(() => {
    const PROJECT_START = 1716000000000; // Fixed reference timestamp
    const updateCount = () => {
      const now = Date.now();
      const dynamic = 128847 + Math.floor((now - PROJECT_START) / 3000);
      setCount(dynamic);
    };
    updateCount();
    const interval = setInterval(updateCount, 3000);
    return () => clearInterval(interval);
  }, []);

  // referralType is already an AI type object (from getReferralType in shareUtils)
  const referralTypeObj = referralType || null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Particle Background */}
      <ParticleBackground />

      {/* Background decorative glows */}
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

      {/* Referral friend message */}
      {referralTypeObj && (
        <div className="relative z-10 mb-6 fade-in-up">
          <div className="glass-card px-5 py-3 text-center">
            <span className="text-sm text-gray-300">
              你的朋友是 {referralTypeObj.emoji}
              <span style={{ color: referralTypeObj.color }}>{referralTypeObj.name}</span>
              ，你的AI灵魂是什么？
            </span>
          </div>
        </div>
      )}

      {/* Logo / Title */}
      <div className="relative z-10 text-center mb-8 fade-in-up">
        <div className="text-6xl mb-4">🔮</div>
        <h1 className="text-4xl font-black gradient-text mb-3 tracking-wide">
          AIR·AI段位实况
        </h1>
        {/* Typewriter effect for main tagline */}
        <div className="h-10 flex items-center justify-center">
          <TypewriterText
            text="你的AI灵魂是什么？"
            speed={100}
            onComplete={() => setTypewriterDone(true)}
            className="text-xl text-gray-300 font-bold"
          />
        </div>
        {typewriterDone && (
          <p className="text-gray-400 text-base leading-relaxed mt-2 fade-in-up">
            12种AI人格，你属于哪一种？
          </p>
        )}
      </div>

      {/* Preview Cards Carousel */}
      <div className="relative z-10 w-full max-w-xs mb-10" style={{ minHeight: '140px' }}>
        <PreviewCarousel />
      </div>

      {/* CTA Button with pulse animation */}
      <div className="relative z-10 mb-6 fade-in-up" style={{ animationDelay: '0.2s' }}>
        <button className="cta-button pulse-breathe" onClick={onStart}>
          开始灵魂探索 ✨
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

      {/* Dynamic counter */}
      <div className="relative z-10 text-center fade-in-up" style={{ animationDelay: '0.4s' }}>
        <p className="text-xs text-gray-600">
          已有 <span className="text-gray-400 font-mono">{count.toLocaleString()}</span> 人找到了答案
        </p>
      </div>

      {/* Bottom decorative line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
    </div>
  );
}

/** Preview carousel sub-component with auto-cycling cards */
function PreviewCarousel() {
  const [current, setCurrent] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);

  const previewTypes = [
    AI_TYPES.find(t => t.id === 'WIZARD'),
    AI_TYPES.find(t => t.id === 'FAKE'),
    AI_TYPES.find(t => t.id === 'ADDICT'),
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeIn(false);
      setTimeout(() => {
        setCurrent(prev => (prev + 1) % 3);
        setFadeIn(true);
      }, 300);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const type = previewTypes[current];
  return (
    <>
      <div
        className={`glass-card p-5 text-center transition-opacity duration-300 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="text-3xl mb-2">{type.emoji}</div>
        <div
          className="text-lg font-bold mb-1"
          style={{ color: type.color }}
        >
          {type.name}
        </div>
        <div className="text-sm text-gray-400 italic">
          "{type.tagline}"
        </div>
      </div>
      {/* Carousel dots */}
      <div className="flex justify-center mt-3 gap-2">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === current ? 'bg-gradient-to-r from-purple-500 to-cyan-400 w-5' : 'bg-gray-600'
            }`}
          />
        ))}
      </div>
    </>
  );
}
