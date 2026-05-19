import React, { useState, useEffect } from 'react';
import AI_TYPES from '../data/types';
import TypewriterText from './TypewriterText';

/**
 * ResultReveal - Dramatic result reveal animation with 4 stages:
 * 1. Full-screen blur (1s)
 * 2. Spotlight effect (1.5s)
 * 3. Type emoji + name from blur to clear (1s)
 * 4. Golden quote typewriter effect (2s)
 *
 * @param {Object} result - { typeId, scores, timestamp }
 * @param {Function} onComplete - Callback when reveal animation finishes
 */
export default function ResultReveal({ result, onComplete }) {
  const [stage, setStage] = useState(0);
  const type = AI_TYPES.find(t => t.id === result.typeId) || AI_TYPES[0];

  useEffect(() => {
    // Stage 0 → 1: Full screen blur (1s)
    const t1 = setTimeout(() => setStage(1), 1000);
    // Stage 1 → 2: Spotlight effect (1.5s)
    const t2 = setTimeout(() => setStage(2), 2500);
    // Stage 2 → 3: Emoji + name reveal (1s)
    const t3 = setTimeout(() => setStage(3), 3500);
    // Stage 3 → 4: Quote typewriter (2s) then complete
    const t4 = setTimeout(() => {
      setStage(4);
      if (onComplete) onComplete();
    }, 5500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0F0F1A]">
      {/* Stage 0-1: Blur overlay */}
      {stage < 2 && (
        <div
          className="absolute inset-0 transition-all duration-1000"
          style={{
            backdropFilter: stage < 1 ? 'blur(30px)' : 'blur(15px)',
            background: stage < 1 ? 'rgba(15,15,26,0.95)' : 'rgba(15,15,26,0.7)',
          }}
        />
      )}

      {/* Stage 1: Spotlight effect */}
      {stage === 1 && (
        <div
          className="absolute inset-0 reveal-spotlight"
          style={{
            boxShadow: 'inset 0 0 200px 100px rgba(0,0,0,0.9)',
          }}
        />
      )}

      {/* Stage 2+: Central reveal content */}
      {stage >= 2 && (
        <div className="relative z-10 text-center reveal-scale-up">
          {/* Emoji */}
          <div className="text-7xl mb-4 reveal-blur">
            {type.emoji}
          </div>

          {/* Type name */}
          <h1
            className="text-4xl font-black mb-4 reveal-glow"
            style={{ color: type.color }}
          >
            {type.name}
          </h1>
        </div>
      )}

      {/* Stage 3+: Golden quote typewriter */}
      {stage >= 3 && (
        <div className="relative z-10 mt-4 px-8 text-center fade-in-up">
          <TypewriterText
            text={type.goldenQuote}
            speed={80}
            className="text-lg text-gray-300 italic"
          />
        </div>
      )}

      {/* Progress indicator dots */}
      <div className="absolute bottom-12 flex gap-2">
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className="w-2 h-2 rounded-full transition-all duration-300"
            style={{
              background: stage >= i
                ? type.color
                : 'rgba(255,255,255,0.15)',
              transform: stage >= i ? 'scale(1.2)' : 'scale(1)',
            }}
          />
        ))}
      </div>
    </div>
  );
}
