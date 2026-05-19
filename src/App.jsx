import React, { useState, useCallback } from 'react';
import HomePage from './components/HomePage';
import QuizPage from './components/QuizPage';
import LoadingPage from './components/LoadingPage';
import ResultPage from './components/ResultPage';
import RankingPage from './components/RankingPage';
import { calculateScores, determineType, saveResult, updateRanking, loadResult } from './utils/calculator';
import { parseReferralParams, getReferralType } from './utils/shareUtils';
import QUESTIONS from './data/questions';

/** Page state constants */
const PAGES = {
  HOME: 'home',
  QUIZ: 'quiz',
  LOADING: 'loading',
  RESULT: 'result',
  RANKING: 'ranking',
};

export default function App() {
  const [page, setPage] = useState(() => {
    // If there's a cached result, go directly to result page
    const cached = loadResult();
    return cached ? PAGES.RESULT : PAGES.HOME;
  });
  const [answers, setAnswers] = useState(new Array(QUESTIONS.length).fill(null));
  const [result, setResult] = useState(() => loadResult());
  const [direction, setDirection] = useState('forward');

  // Parse referral params from URL on mount
  const referralType = getReferralType();

  const handleStart = useCallback(() => {
    setDirection('forward');
    setPage(PAGES.QUIZ);
  }, []);

  const handleQuizComplete = useCallback((finalAnswers) => {
    setAnswers(finalAnswers);
    setDirection('forward');
    setPage(PAGES.LOADING);

    // Calculate after a delay (loading animation)
    setTimeout(() => {
      const scores = calculateScores(finalAnswers, QUESTIONS);
      const type = determineType(scores);
      const newResult = {
        typeId: type.id,
        scores,
        timestamp: Date.now(),
      };
      setResult(newResult);
      saveResult(newResult);
      updateRanking(type.id);
      setPage(PAGES.RESULT);
    }, 2500);
  }, []);

  const handleRetake = useCallback(() => {
    setAnswers(new Array(QUESTIONS.length).fill(null));
    setResult(null);
    localStorage.removeItem('air_rank_result');
    setDirection('forward');
    setPage(PAGES.HOME);
  }, []);

  const handleViewRanking = useCallback(() => {
    setDirection('forward');
    setPage(PAGES.RANKING);
  }, []);

  const handleBackFromRanking = useCallback(() => {
    setDirection('back');
    setPage(PAGES.RESULT);
  }, []);

  const animationClass = direction === 'forward' ? 'slide-in-right' : 'slide-in-left';

  return (
    <div className="min-h-screen flex justify-center bg-[#0F0F1A]">
      <div className="w-full max-w-[430px] min-h-screen relative overflow-hidden">
        {page === PAGES.HOME && (
          <div key="home" className={animationClass}>
            <HomePage
              onStart={handleStart}
              onViewRanking={handleViewRanking}
              referralType={referralType}
            />
          </div>
        )}
        {page === PAGES.QUIZ && (
          <div key="quiz" className={animationClass}>
            <QuizPage
              questions={QUESTIONS}
              answers={answers}
              onComplete={handleQuizComplete}
              onAnswersChange={setAnswers}
            />
          </div>
        )}
        {page === PAGES.LOADING && (
          <div key="loading" className="fade-in">
            <LoadingPage />
          </div>
        )}
        {page === PAGES.RESULT && result ? (
          <div key="result" className={animationClass}>
            <ResultPage
              result={result}
              onRetake={handleRetake}
              onViewRanking={handleViewRanking}
            />
          </div>
        ) : page === PAGES.RESULT && !result ? (
          <div key="home" className={animationClass}>
            <HomePage
              onStart={handleStart}
              onViewRanking={handleViewRanking}
              referralType={referralType}
            />
          </div>
        ) : null}
        {page === PAGES.RANKING && (
          <div key="ranking" className={animationClass}>
            <RankingPage onBack={handleBackFromRanking} />
          </div>
        )}
      </div>
    </div>
  );
}
