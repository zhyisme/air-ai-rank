import React from 'react';

/**
 * MicroFeedback - Instant feedback popup shown after selecting a quiz option.
 * Bounces in from below with emoji + text, then fades out after 1.2s.
 *
 * @param {string} emoji - The emoji to display
 * @param {string} text - Short feedback text
 * @param {boolean} visible - Whether to show the feedback
 */
export default function MicroFeedback({ emoji, text, visible }) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="micro-feedback-in">
        <div className="glass-card px-6 py-4 flex items-center gap-3">
          <span className="text-3xl">{emoji}</span>
          <span className="text-lg font-bold text-white">{text}</span>
        </div>
      </div>
    </div>
  );
}
