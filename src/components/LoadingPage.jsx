import React, { useState, useEffect } from 'react';
import { DIMENSION_LABELS, DIMENSIONS } from '../utils/calculator';

/**
 * LoadingPage component - shows an analysis animation before results.
 */
export default function LoadingPage() {
  const [currentDim, setCurrentDim] = useState(0);
  const [dots, setDots] = useState('');

  // Cycle through dimension names
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDim(prev => (prev + 1) % DIMENSIONS.length);
    }, 300);
    return () => clearInterval(interval);
  }, []);

  // Animate dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-20"
            style={{
              width: `${4 + Math.random() * 8}px`,
              height: `${4 + Math.random() * 8}px`,
              background: i % 2 === 0 ? '#8B5CF6' : '#06B6D4',
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Pulsing orb */}
      <div className="relative mb-12">
        <div
          className="w-28 h-28 rounded-full animate-pulse-glow"
          style={{
            background: 'radial-gradient(circle at 40% 40%, #8B5CF6, #06B6D4, #0F0F1A)',
          }}
        />
        <div
          className="absolute inset-0 rounded-full animate-ping opacity-20"
          style={{
            background: 'radial-gradient(circle, #8B5CF6, transparent)',
          }}
        />
      </div>

      {/* Main text */}
      <div className="text-center relative z-10">
        <h2 className="text-xl font-bold text-white mb-4">
          正在分析你的AI使用DNA{dots}
        </h2>

        {/* Scrolling dimension labels */}
        <div className="h-8 overflow-hidden mb-6">
          <div
            className="transition-all duration-300 ease-out text-sm font-mono"
            style={{
              color: '#8B5CF6',
              transform: `translateY(-${currentDim * 28}px)`,
            }}
          >
            {DIMENSIONS.map(dim => (
              <div key={dim} className="h-7 flex items-center justify-center">
                {DIMENSION_LABELS[dim]}
              </div>
            ))}
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex gap-1.5 justify-center">
          {DIMENSIONS.map((_, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full transition-all duration-300"
              style={{
                background: i <= currentDim
                  ? 'linear-gradient(135deg, #8B5CF6, #06B6D4)'
                  : 'rgba(255,255,255,0.1)',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
