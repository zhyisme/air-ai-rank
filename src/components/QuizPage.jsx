import React, { useState, useCallback, useEffect, useRef } from 'react';

/**
 * QuizPage component - handles the 15-question quiz flow.
 * @param {Array} questions - The questions array
 * @param {Array} answers - Current answers state
 * @param {Function} onComplete - Called with final answers when all questions answered
 * @param {Function} onAnswersChange - Called to update answers in parent state
 */
export default function QuizPage({ questions, answers, onComplete, onAnswersChange }) {
  const [currentIndex, setCurrentIndex] = useState(() => {
    // Find first unanswered question
    const firstUnanswered = answers.findIndex(a => a === null);
    return firstUnanswered >= 0 ? firstUnanswered : 0;
  });
  const [selectedOption, setSelectedOption] = useState(null);
  const [animating, setAnimating] = useState(false);
  const [slideDir, setSlideDir] = useState('right'); // 'right' | 'left'
  const timerRef = useRef(null);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleSelect = useCallback((optionIndex) => {
    if (animating) return;
    setSelectedOption(optionIndex);

    // Update answers
    const newAnswers = [...answers];
    newAnswers[currentIndex] = optionIndex;
    onAnswersChange(newAnswers);

    // Auto-advance after brief delay
    setAnimating(true);
    timerRef.current = setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setSlideDir('right');
        setCurrentIndex(prev => prev + 1);
        setSelectedOption(null);
      } else {
        // Quiz complete
        onComplete(newAnswers);
      }
      setAnimating(false);
    }, 500);
  }, [animating, answers, currentIndex, questions.length, onComplete, onAnswersChange]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0 && !animating) {
      setSlideDir('left');
      setCurrentIndex(prev => prev - 1);
      setSelectedOption(answers[currentIndex - 1]);
    }
  }, [currentIndex, animating, answers]);

  // If current answer exists, show it as selected
  useEffect(() => {
    if (answers[currentIndex] !== null && answers[currentIndex] !== undefined) {
      setSelectedOption(answers[currentIndex]);
    } else {
      setSelectedOption(null);
    }
  }, [currentIndex, answers]);

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Progress Bar */}
      <div className="sticky top-0 z-20 bg-[#0F0F1A]/90 backdrop-blur-sm px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-2">
          {currentIndex > 0 ? (
            <button
              className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-1"
              onClick={handlePrev}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              上一题
            </button>
          ) : (
            <div className="w-16" />
          )}
          <span className="text-sm text-gray-400 font-mono">
            {currentIndex + 1} / {questions.length}
          </span>
        </div>
        <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full progress-gradient rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question Content */}
      <div className="flex-1 flex flex-col justify-center px-6 py-8" key={currentIndex}>
        <div className={`mb-8 ${slideDir === 'right' ? 'slide-in-right' : 'slide-in-left'}`}>
          <h2 className="text-xl font-bold text-white leading-relaxed text-center mb-8">
            {currentQuestion.text}
          </h2>

          <div className="space-y-3 stagger-children">
            {currentQuestion.options.map((option, idx) => (
              <button
                key={idx}
                className={`option-card w-full text-left px-5 py-4 rounded-xl border transition-all duration-200 ${
                  selectedOption === idx
                    ? 'selected border-purple-500 bg-purple-500/20'
                    : 'border-gray-700/50 bg-white/[0.03] hover:bg-white/[0.06]'
                } ${animating ? 'pointer-events-none' : ''}`}
                onClick={() => handleSelect(idx)}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-200 ${
                    selectedOption === idx
                      ? 'border-purple-400 bg-purple-500/30 text-purple-300'
                      : 'border-gray-600 text-gray-500'
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className={`text-sm leading-relaxed ${
                    selectedOption === idx ? 'text-white' : 'text-gray-300'
                  }`}>
                    {option.text}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom hint */}
      <div className="px-6 pb-6 text-center">
        <p className="text-xs text-gray-600">选择后自动跳转下一题</p>
      </div>
    </div>
  );
}
