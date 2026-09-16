import React, { useState, useEffect } from 'react';
import { Game } from '../../lib/types';
import { Lightbulb, Send, Delete, RotateCcw, Trophy, Crown, Sparkles, CheckCircle2, Clock } from 'lucide-react';

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
  const [isShaking, setIsShaking] = useState(false);
  const [lastFeedback, setLastFeedback] = useState<string | null>(null);

  const round = game.scrambleCurrentRound || 0;
  const words = game.scrambleWords || [];
  const hints = game.scrambleHints || [];
  const jumbled = game.scrambleJumbled || [];
  const scores = game.playerScores || {};
  const lastIncorrect = game.scrambleLastIncorrectGuess;
  const lastSolve = game.scrambleLastSolveResult;
  const history = game.scrambleRoundHistory || [];

  const currentHint = hints[round] || 'Solve the anagram';
  const currentJumbled = jumbled[round] || '';
  const totalRounds = words.length || 5;

  // Find leader score for crown
  const maxScore = Math.max(0, ...game.players.map((p) => scores[p.userId] || 0));

  // Clear input when round advances
  useEffect(() => {
    setGuess('');
    setLastFeedback(null);
  }, [round]);

  // Handle incorrect guess feedback
  useEffect(() => {
    if (lastIncorrect && lastIncorrect.userId === currentUserId) {
      setIsShaking(true);
      setLastFeedback(`"${lastIncorrect.guess}" is incorrect! Try again.`);
      const t = setTimeout(() => setIsShaking(false), 500);
      return () => clearTimeout(t);
    }
  }, [lastIncorrect?.timestamp]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled || !guess.trim()) return;

    onSubmitGuess(guess.trim());
  };

  const handleTileClick = (letter: string) => {
    setGuess((prev) => prev + letter);
  };

  const handleBackspace = () => {
    setGuess((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setGuess('');
  };

  const isMySolve = lastSolve?.solvedByUserId === currentUserId;

  return (
    <div className="flex flex-col items-center w-full max-w-[560px] space-y-4">
      {/* Round & Scores Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between w-full px-4 py-3 bg-white/90 dark:bg-slate-800/90 rounded-2xl border border-teal-200 dark:border-slate-700 shadow-xs gap-2">
        <span className="px-3 py-1 rounded-full text-xs font-black bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300">
          Round {round + 1} of {totalRounds}
        </span>
        <div className="flex items-center flex-wrap justify-center gap-3 text-xs font-bold">
          {game.players.map((p) => {
            const isMe = p.userId === currentUserId;
            const pScore = scores[p.userId] || 0;
            const isLeader = maxScore > 0 && pScore === maxScore;
            const isRecentSolver = lastSolve?.solvedByUserId === p.userId;

            return (
              <div
                key={p.userId}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-xl transition-all ${
                  isMe
                    ? 'bg-teal-50 dark:bg-teal-950/40 border border-teal-300 dark:border-teal-700/60'
                    : 'bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {isLeader && <Crown className="w-3.5 h-3.5 text-amber-500 animate-bounce" />}
                <span className={isMe ? 'text-teal-700 dark:text-teal-300 font-black' : 'text-slate-700 dark:text-slate-300'}>
                  {p.username} {isMe && '(You)'}
                </span>
                <span className="font-extrabold text-slate-800 dark:text-white">
                  {pScore} pts
                </span>
                {isRecentSolver && (
                  <span className="px-1.5 py-0.2 bg-emerald-500 text-white text-[10px] font-black rounded-md animate-pulse">
                    +100
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Latest Solved Announcement Banner */}
      {lastSolve && lastSolve.round && (
        <div
          className={`w-full px-4 py-3 rounded-2xl border shadow-md flex items-center justify-between text-xs animate-in zoom-in-95 ${
            isMySolve
              ? 'bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50 border-emerald-300 dark:border-emerald-700/60 text-emerald-800 dark:text-emerald-200'
              : 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 border-amber-300 dark:border-amber-700/60 text-amber-800 dark:text-amber-200'
          }`}
        >
          <div className="flex items-center space-x-2.5">
            {isMySolve ? (
              <Trophy className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            )}
            <div>
              <span className="font-extrabold block sm:inline">
                {isMySolve ? (
                  <>🎉 <span className="font-black underline">You</span> cracked Round {lastSolve.round}: <span className="font-black tracking-wider uppercase">"{lastSolve.targetWord}"</span>!</>
                ) : (
                  <>⚡ <span className="font-black underline">{lastSolve.solverUsername || 'Opponent'}</span> solved Round {lastSolve.round}: <span className="font-black tracking-wider uppercase">"{lastSolve.targetWord}"</span>!</>
                )}
              </span>
            </div>
          </div>
          <div className="shrink-0 px-2.5 py-1 bg-white/80 dark:bg-black/40 rounded-xl font-black text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-700/40">
            +{lastSolve.pointsAwarded || 100} pts
          </div>
        </div>
      )}

      {/* Main Scramble Card */}
      <div
        className={`w-full p-6 sm:p-8 rounded-[32px] bg-gradient-to-b from-teal-50 to-emerald-50 dark:from-slate-900 dark:to-slate-800/80 border-2 border-teal-200 dark:border-teal-900/40 shadow-xl flex flex-col items-center space-y-5 text-center transition-all ${
          isShaking ? 'animate-shake border-rose-400' : ''
        }`}
      >
        {/* Hint Badge */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-xs font-extrabold border border-amber-200 dark:border-amber-800">
          <Lightbulb className="w-3.5 h-3.5" />
          <span>Hint: {currentHint}</span>
        </div>

        {/* Jumbled Letter Tiles */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 my-1">
          {currentJumbled.split('').map((char, i) => (
            <button
              key={`letter-${i}-${char}`}
              type="button"
              onClick={() => handleTileClick(char)}
              className="w-11 h-13 sm:w-14 sm:h-16 rounded-2xl bg-white dark:bg-slate-800 border-2 border-teal-400 dark:border-teal-500 text-teal-700 dark:text-teal-300 text-2xl sm:text-3xl font-black shadow-md hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
            >
              {char}
            </button>
          ))}
        </div>

        {/* Incorrect Guess Notice */}
        {lastFeedback && (
          <div className="text-xs font-extrabold text-rose-500 animate-in fade-in">
            {lastFeedback}
          </div>
        )}

        {/* Guess Form with Backspace and Clear */}
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center w-full max-w-md gap-2">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={guess}
              onChange={(e) => setGuess(e.target.value.toUpperCase())}
              placeholder="TYPE OR TAP TILES"
              disabled={disabled}
              className="w-full px-4 py-3 rounded-2xl border-2 border-teal-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-extrabold text-center uppercase tracking-wider focus:outline-none focus:ring-4 focus:ring-teal-400/20 text-sm sm:text-base"
            />
            {guess && (
              <button
                type="button"
                onClick={handleBackspace}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                title="Backspace"
              >
                <Delete className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            {guess && (
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-3 rounded-2xl border-2 border-teal-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold text-xs flex items-center justify-center cursor-pointer"
                title="Clear input"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}

            <button
              type="submit"
              disabled={disabled || !guess.trim()}
              className="btn-gradient flex-1 sm:flex-none px-6 py-3 rounded-2xl font-black text-sm flex items-center justify-center space-x-1 shadow-md cursor-pointer disabled:opacity-50"
            >
              <span>Guess</span>
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Rounds Recap / History */}
      <div className="w-full p-4 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-teal-100 dark:border-slate-700 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <span>Rounds Progression</span>
          <span className="text-[11px] font-bold text-teal-600 dark:text-teal-400">100 pts per solve</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
          {Array.from({ length: totalRounds }).map((_, idx) => {
            const roundNum = idx + 1;
            const solve = history.find((h) => h.round === roundNum);
            const isCompleted = !!solve || idx < round;
            const isCurrent = idx === round;

            return (
              <div
                key={`round-slot-${roundNum}`}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  solve
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800/50'
                    : isCurrent
                    ? 'bg-teal-100/60 dark:bg-teal-950/50 border-teal-400 dark:border-teal-600 shadow-xs ring-2 ring-teal-400/20'
                    : isCompleted
                    ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-60'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 opacity-50'
                }`}
              >
                <div className="flex items-center justify-center space-x-1 text-[11px] font-extrabold mb-1">
                  {solve ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  ) : isCurrent ? (
                    <Clock className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 animate-spin" />
                  ) : null}
                  <span className={isCurrent ? 'text-teal-700 dark:text-teal-300' : 'text-slate-700 dark:text-slate-300'}>
                    Round {roundNum}
                  </span>
                </div>
                {solve ? (
                  <div className="space-y-0.5">
                    <div className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
                      {solve.targetWord}
                    </div>
                    <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 truncate">
                      {solve.solvedByUserId === currentUserId ? 'You' : solve.solverUsername} (+{solve.pointsAwarded || 100})
                    </div>
                  </div>
                ) : isCurrent ? (
                  <div className="text-[10px] font-extrabold text-teal-600 dark:text-teal-400 animate-pulse">
                    Racing...
                  </div>
                ) : (
                  <div className="text-[10px] font-medium text-slate-400">
                    Waiting
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
