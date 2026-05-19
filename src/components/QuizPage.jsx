import React, { useState, useCallback, useEffect, useRef } from 'react';
import CHAPTERS from '../data/chapters';
import FEEDBACK_POOL from '../data/microFeedback';
import MicroFeedback from './MicroFeedback';

/**
 * QuizPage component - enhanced with chapters, micro-feedback, milestones,
 * emoji-prefixed options, and chapter transition animations.
 *
 * @param {Array} questions - The questions array
 * @param {Array} answers - Current answers state
 * @param {Function} onComplete - Called with final answers when all questions answered
 * @param {Function} onAnswersChange - Called to update answers in parent state
 */
export default function QuizPage({ questions, answers, onComplete, onAnswersChange }) {
  const [currentIndex, setCurrentIndex] = useState(() => {
    const firstUnanswered = answers.findIndex(a => a === null);
    return firstUnanswered >= 0 ? firstUnanswered : 0;
  });
  const [selectedOption, setSelectedOption] = useState(null);
  const [animating, setAnimating] = useState(false);
  const [slideDir, setSlideDir] = useState('right');
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState({ emoji: '', text: '' });
  const [chapterTransition, setChapterTransition] = useState(null);
  const [milestoneText, setMilestoneText] = useState('');
  const timerRef = useRef(null);
  const feedbackTimerRef = useRef(null);
  const milestoneTimerRef = useRef(null);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  // Determine current chapter
  const currentChapter = currentQuestion ? currentQuestion.chapter : 1;
  const chapterData = CHAPTERS.find(c => c.id === currentChapter);

  // Detect chapter boundary transitions
  const prevChapter = currentIndex > 0 ? questions[currentIndex - 1]?.chapter : null;
  const isChapterBoundary = prevChapter !== null && prevChapter !== currentChapter;

  // Show chapter transition when entering a new chapter
  useEffect(() => {
    if (isChapterBoundary && chapterData) {
      setChapterTransition(chapterData);
      const timer = setTimeout(() => {
        setChapterTransition(null);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [currentIndex]);

  // Show milestone text at 1/3 and 2/3 progress
  useEffect(() => {
    const questionNum = currentIndex + 1;
    const total = questions.length;
    const oneThird = Math.floor(total / 3);
    const twoThirds = Math.floor(total * 2 / 3);

    if (chapterData) {
      if (questionNum === oneThird || questionNum === oneThird + 1) {
        setMilestoneText(chapterData.milestoneText1_3);
      } else if (questionNum === twoThirds || questionNum === twoThirds + 1) {
        setMilestoneText(chapterData.milestoneText2_3);
      } else {
        setMilestoneText('');
      }
    }

    if (milestoneTimerRef.current) clearTimeout(milestoneTimerRef.current);
    milestoneTimerRef.current = setTimeout(() => {
      setMilestoneText('');
    }, 2000);

    return () => {
      if (milestoneTimerRef.current) clearTimeout(milestoneTimerRef.current);
    };
  }, [currentIndex, chapterData, questions.length]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    };
  }, []);

  // If current answer exists, show it as selected
  useEffect(() => {
    if (answers[currentIndex] !== null && answers[currentIndex] !== undefined) {
      setSelectedOption(answers[currentIndex]);
    } else {
      setSelectedOption(null);
    }
  }, [currentIndex, answers]);

  const handleSelect = useCallback((optionIndex) => {
    if (animating) return;
    setSelectedOption(optionIndex);

    // Update answers
    const newAnswers = [...answers];
    newAnswers[currentIndex] = optionIndex;
    onAnswersChange(newAnswers);

    // Show micro-feedback
    const option = currentQuestion.options[optionIndex];
    const feedback = option.feedback || '';
    const randomPool = FEEDBACK_POOL[Math.floor(Math.random() * FEEDBACK_POOL.length)];
    setFeedbackData({
      emoji: option.emoji || randomPool.emoji,
      text: feedback || randomPool.text,
    });
    setShowFeedback(true);

    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = setTimeout(() => {
      setShowFeedback(false);
    }, 1200);

    // Auto-advance after brief delay
    setAnimating(true);
    timerRef.current = setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setSlideDir('right');
        setCurrentIndex(prev => prev + 1);
        setSelectedOption(null);
      } else {
        onComplete(newAnswers);
      }
      setAnimating(false);
    }, 500);
  }, [animating, answers, currentIndex, currentQuestion, questions.length, onComplete, onAnswersChange]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0 && !animating) {
      setSlideDir('left');
      setCurrentIndex(prev => prev - 1);
      setSelectedOption(answers[currentIndex - 1]);
    }
  }, [currentIndex, animating, answers]);

  // Chapter transition overlay
  if (chapterTransition) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-[#0F0F1A] chapter-fade-in">
        <div className="text-5xl mb-6">🌀</div>
        <h2 className="text-2xl font-black gradient-text mb-3">
          {chapterTransition.title}
        </h2>
        <p className="text-lg text-gray-300 mb-2">
          {chapterTransition.subtitle}
        </p>
        <p className="text-sm text-gray-500 italic">
          {chapterTransition.transitionText}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Micro Feedback Overlay */}
      <MicroFeedback
        emoji={feedbackData.emoji}
        text={feedbackData.text}
        visible={showFeedback}
      />

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
          {/* Chapter indicator */}
          <span className="text-xs text-purple-400 font-bold">
            {chapterData?.title || ''}
          </span>
        </div>
        <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden relative">
          <div
            className="h-full progress-gradient rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
          {/* Milestone markers at 1/3 and 2/3 */}
          <div className="absolute top-0 h-full w-px bg-gray-600" style={{ left: '33.3%' }} />
          <div className="absolute top-0 h-full w-px bg-gray-600" style={{ left: '66.6%' }} />
        </div>
        {/* Milestone text */}
        {milestoneText && (
          <div className="text-center mt-2 milestone-pulse">
            <span className="text-sm text-purple-300 font-bold">{milestoneText}</span>
          </div>
        )}
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
                  {/* Emoji prefix */}
                  {option.emoji && (
                    <span className="text-base shrink-0">{option.emoji}</span>
                  )}
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
