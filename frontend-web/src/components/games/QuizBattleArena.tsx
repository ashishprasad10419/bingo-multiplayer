import React, { useState, useEffect } from 'react';
import { Game } from '../../lib/types';
import { HelpCircle, CheckCircle2, Award } from 'lucide-react';

interface QuizBattleArenaProps {
  game: Game;
  currentUserId: string;
  onSubmitAnswer: (optionIndex: number) => void;
  disabled?: boolean;
}

export const QuizBattleArena: React.FC<QuizBattleArenaProps> = ({
  game,
  currentUserId,
  onSubmitAnswer,
  disabled = false,
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const currentQ = game.quizCurrentQuestion || 0;
  const questions = game.quizQuestions || [];
  const optionsList = game.quizOptions || [];
  const scores = game.playerScores || {};
  const userAnswers = game.quizAnswers || {};
  const lastResult = game.quizLastRoundResult;

  // Auto-reset selection when moving to next question
  useEffect(() => {
    setSelectedOption(null);
  }, [currentQ]);

  const questionText = questions[currentQ] || 'Preparing next trivia question...';
  const options = optionsList[currentQ] || [];
  const hasAnswered = selectedOption !== null || userAnswers[currentUserId] !== undefined;

  const optionLabels = ['A', 'B', 'C', 'D'];

  const handleSelect = (idx: number) => {
    if (disabled || hasAnswered) return;
    setSelectedOption(idx);
    onSubmitAnswer(idx);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-[560px] space-y-4">
      {/* Header with question number and player scores */}
      <div className="flex items-center justify-between w-full px-4 py-2.5 bg-white/90 dark:bg-slate-800/90 rounded-2xl border border-purple-200 dark:border-slate-700 shadow-xs">
        <span className="px-3 py-1 rounded-full text-xs font-black bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
          Question {currentQ + 1} of {questions.length || 5}
        </span>
        <div className="flex items-center space-x-3 text-xs font-bold">
          {game.players.map((p) => (
            <span key={p.userId} className={p.userId === currentUserId ? 'text-purple-600 dark:text-purple-400 font-extrabold' : 'text-slate-600 dark:text-slate-300'}>
              {p.username}: {scores[p.userId] || 0} pts
            </span>
          ))}
        </div>
      </div>

      {/* Previous Question Feedback */}
      {lastResult && lastResult.questionIndex !== undefined && (
        <div className="w-full px-4 py-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center space-x-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 animate-in fade-in">
          <Award className="w-4 h-4 text-emerald-500" />
          <span>Previous Question #{lastResult.questionIndex + 1} Answer was ({optionLabels[lastResult.correctIndex]})!</span>
        </div>
      )}

      {/* Question Card */}
      <div className="w-full p-6 sm:p-7 rounded-[32px] bg-gradient-to-b from-purple-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800/80 border-2 border-purple-200 dark:border-purple-900/40 shadow-xl flex flex-col items-center text-center space-y-6">
        <div className="w-10 h-10 rounded-2xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center">
          <HelpCircle className="w-6 h-6" />
        </div>

        <h3 className="text-lg sm:text-xl font-black text-slate-800 dark:text-slate-100 leading-snug">
          {questionText}
        </h3>

        {/* 4 Choices Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
          {options.map((opt, i) => {
            const isSelected = selectedOption === i || userAnswers[currentUserId] === i;

            return (
              <button
                key={`opt-${i}-${opt}`}
                onClick={() => handleSelect(i)}
                disabled={disabled || hasAnswered}
                className={`flex items-center space-x-3 p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                  isSelected
                    ? 'bg-purple-600 text-white border-purple-700 ring-4 ring-purple-400/30 scale-102 shadow-md'
                    : hasAnswered
                    ? 'opacity-60 bg-white/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 cursor-not-allowed text-slate-600 dark:text-slate-300'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-purple-400 hover:scale-102 cursor-pointer shadow-xs active:scale-98'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs ${
                    isSelected ? 'bg-white text-purple-700' : 'bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400'
                  }`}
                >
                  {optionLabels[i]}
                </div>
                <span className="font-bold text-sm flex-1">{opt}</span>
              </button>
            );
          })}
        </div>

        {hasAnswered && (
          <div className="inline-flex items-center space-x-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>Answer locked! Waiting for all players...</span>
          </div>
        )}
      </div>
    </div>
  );
};
