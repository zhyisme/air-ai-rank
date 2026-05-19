import React, { useState, useEffect, useRef } from 'react';

/**
 * TypewriterText - Displays text with a typewriter animation effect.
 * Characters appear one by one at a given speed, with a blinking cursor.
 *
 * @param {string} text - The text to animate
 * @param {number} speed - Milliseconds per character (default: 80)
 * @param {Function} onComplete - Callback when typing finishes
 * @param {string} className - Additional CSS classes
 */
export default function TypewriterText({ text, speed = 80, onComplete, className = '' }) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const indexRef = useRef(0);
  const timerRef = useRef(null);

  useEffect(() => {
    // Reset when text changes
    indexRef.current = 0;
    setDisplayedText('');
    setIsComplete(false);

    timerRef.current = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayedText(text.slice(0, indexRef.current + 1));
        indexRef.current += 1;
      } else {
        clearInterval(timerRef.current);
        setIsComplete(true);
        if (onComplete) onComplete();
      }
    }, speed);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [text, speed]);

  return (
    <span className={className}>
      {displayedText}
      <span
        className="inline-block w-[2px] h-[1em] ml-0.5 align-middle"
        style={{
          background: 'currentColor',
          animation: isComplete ? 'blink 1s step-end infinite' : 'none',
          opacity: isComplete ? undefined : 1,
        }}
      />
    </span>
  );
}
