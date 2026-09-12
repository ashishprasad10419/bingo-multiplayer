import React, { useState } from 'react';
import { Game } from '../../lib/types';
import { Lightbulb, Send } from 'lucide-react';

interface WordScrambleArenaProps {
  game: Game;
  currentUserId: string;
  onSubmitGuess: (guess: string) => void;
  disabled?: boolean;
}

export const WordScrambleArena: React.FC<WordScrambleArenaProps> = ({
  game,
  currentUserId,
  onSubmitGuess,
  disabled = false,
}) => {
  const [guess, setGuess] = useState('');

  const round = game.scrambleCurrentRound || 0;
  const words = game.scrambleWords || [];
  const hints = game.scrambleHints || [];
  const jumbled = game.scrambleJumbled || [];
  const scores = game.playerScores || {};

  const currentHint = hints[round] || 'Solve the anagram';
  const currentJumbled = jumbled[round] || '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled || !guess.trim()) return;

    onSubmitGuess(guess.trim());
    setGuess('');
  };

  const handleTileClick = (letter: string) => {
    setGuess((prev) => prev + letter);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-[560px] space-y-4">
      {/* Round & Scores Header */}
      <div className="flex items-center justify-between w-full px-4 py-2.5 bg-white/90 dark:bg-slate-800/90 rounded-2xl border border-teal-200 dark:border-slate-700 shadow-xs">
        <span className="px-3 py-1 rounded-full text-xs font-black bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300">
          Round {round + 1} of {words.length || 5}
        </span>
        <div className="flex items-center space-x-3 text-xs font-bold">
          {game.players.map((p) => (
            <span key={p.userId} className={p.userId === currentUserId ? 'text-teal-600 dark:text-teal-400 font-extrabold' : 'text-slate-600 dark:text-slate-300'}>
              {p.username}: {scores[p.userId] || 0} pts
            </span>
          ))}
        </div>
      </div>

      {/* Main Scramble Card */}
      <div className="w-full p-6 sm:p-8 rounded-[32px] bg-gradient-to-b from-teal-50 to-emerald-50 dark:from-slate-900 dark:to-slate-800/80 border-2 border-teal-200 dark:border-teal-900/40 shadow-xl flex flex-col items-center space-y-6 text-center">
        {/* Hint Badge */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-xs font-extrabold border border-amber-200 dark:border-amber-800">
          <Lightbulb className="w-3.5 h-3.5" />
          <span>Hint: {currentHint}</span>
        </div>

        {/* Jumbled Letter Tiles */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 my-2">
          {currentJumbled.split('').map((char, i) => (
            <button
              key={`letter-${i}-${char}`}
              onClick={() => handleTileClick(char)}
              className="w-12 h-14 sm:w-14 sm:h-16 rounded-2xl bg-white dark:bg-slate-800 border-2 border-teal-400 dark:border-teal-500 text-teal-700 dark:text-teal-300 text-2xl sm:text-3xl font-black shadow-md hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
            >
              {char}
            </button>
          ))}
        </div>

        {/* Guess Form */}
        <form onSubmit={handleSubmit} className="flex items-center w-full max-w-md space-x-2">
          <input
            type="text"
            value={guess}
            onChange={(e) => setGuess(e.target.value.toUpperCase())}
            placeholder="Type your word here..."
            disabled={disabled}
            className="flex-1 px-4 py-3 rounded-2xl border-2 border-teal-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-extrabold text-center uppercase tracking-wider focus:outline-none focus:ring-4 focus:ring-teal-400/20"
          />
          <button
            type="submit"
            disabled={disabled || !guess.trim()}
            className="btn-gradient px-5 py-3 rounded-2xl font-bold text-sm flex items-center space-x-1 shadow-md cursor-pointer disabled:opacity-50"
          >
            <span>Guess</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
