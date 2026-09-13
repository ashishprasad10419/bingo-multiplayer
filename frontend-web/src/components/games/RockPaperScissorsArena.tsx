import React, { useState, useEffect } from 'react';
import { Game } from '../../lib/types';
import { Swords, CheckCircle2 } from 'lucide-react';

interface RockPaperScissorsArenaProps {
  game: Game;
  currentUserId: string;
  onSubmitChoice: (choice: string) => void;
  disabled?: boolean;
}

export const RockPaperScissorsArena: React.FC<RockPaperScissorsArenaProps> = ({
  game,
  currentUserId,
  onSubmitChoice,
  disabled = false,
}) => {
  const [selected, setSelected] = useState<string | null>(null);

  const choices = [
    { key: 'ROCK', emoji: '✊', label: 'Rock', desc: 'Crushes Scissors', bg: 'from-amber-500 to-orange-600' },
    { key: 'PAPER', emoji: '✋', label: 'Paper', desc: 'Covers Rock', bg: 'from-blue-500 to-indigo-600' },
    { key: 'SCISSORS', emoji: '✌️', label: 'Scissors', desc: 'Cuts Paper', bg: 'from-rose-500 to-red-600' },
  ];

  const round = game.rpsRound || 1;
  const targetWins = game.rpsTargetWins || 3;
  const roundWins = game.rpsRoundWins || {};
  const lastResult = game.rpsLastRoundResult;

  // Auto-reset selection when round changes
  useEffect(() => {
    setSelected(null);
  }, [round]);

  const player1 = game.players[0];
  const player2 = game.players[1];

  const p1Score = roundWins[player1?.userId || ''] || 0;
  const p2Score = roundWins[player2?.userId || ''] || 0;

  const hasSubmitted = !!selected || (game.rpsChoices && !!game.rpsChoices[currentUserId]);

  const handleChoose = (key: string) => {
    if (disabled || hasSubmitted) return;
    setSelected(key);
    onSubmitChoice(key);
  };

  const getEmoji = (choiceKey?: string) => {
    if (choiceKey === 'ROCK') return '✊';
    if (choiceKey === 'PAPER') return '✋';
    if (choiceKey === 'SCISSORS') return '✌️';
    return '❓';
  };

  return (
    <div className="flex flex-col items-center w-full max-w-[560px] space-y-4">
      {/* Round & Target Banner */}
      <div className="flex items-center justify-between w-full px-4 py-2.5 bg-white/90 dark:bg-slate-800/90 rounded-2xl border border-orange-200 dark:border-slate-700 shadow-xs">
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
            Round {round}
          </span>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Target: First to {targetWins} wins
          </span>
        </div>
        <div className="flex items-center space-x-3 text-sm font-extrabold">
          <span className={currentUserId === player1?.userId ? 'text-orange-600 dark:text-orange-400' : 'text-slate-700 dark:text-slate-300'}>
            {player1?.username || 'P1'}: {p1Score}
          </span>
          <span className="text-slate-300 dark:text-slate-600">—</span>
          <span className={currentUserId === player2?.userId ? 'text-orange-600 dark:text-orange-400' : 'text-slate-700 dark:text-slate-300'}>
            {player2?.username || 'P2'}: {p2Score}
          </span>
        </div>
      </div>

      {/* Last Round Reveal Modal / Banner */}
      {lastResult && lastResult.round && (
        <div className="w-full p-4 rounded-3xl bg-gradient-to-r from-orange-50 to-amber-50 dark:from-slate-900 dark:to-slate-800 border-2 border-orange-200 dark:border-orange-900/40 shadow-sm text-center animate-in zoom-in-95">
          <div className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400 mb-1">
            Round {lastResult.round} Result
          </div>
          <div className="flex items-center justify-center space-x-5 text-xl font-black my-2">
            <div className="flex flex-col items-center">
              <span className="text-2xl filter drop-shadow-sm">{getEmoji(lastResult.user1Choice)}</span>
              <span className="text-[10px] font-bold text-slate-500 mt-0.5">{player1?.username || 'P1'}</span>
            </div>
            <Swords className="w-5 h-5 text-orange-500 animate-pulse" />
            <div className="flex flex-col items-center">
              <span className="text-2xl filter drop-shadow-sm">{getEmoji(lastResult.user2Choice)}</span>
              <span className="text-[10px] font-bold text-slate-500 mt-0.5">{player2?.username || 'P2'}</span>
            </div>
          </div>
          <div className="text-xs font-extrabold text-slate-700 dark:text-slate-200">
            {lastResult.isTie ? (
              <span className="text-amber-600 dark:text-amber-400 font-black">It's a Tie! Replaying for point...</span>
            ) : lastResult.roundWinnerId === currentUserId ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-black">🎉 You won this round!</span>
            ) : (
              <span className="text-rose-600 dark:text-rose-400 font-black">Opponent won this round!</span>
            )}
          </div>
        </div>
      )}

      {/* Choice Buttons Grid */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full">
        {choices.map((c) => {
          const isChosen = selected === c.key;
          return (
            <button
              key={c.key}
              onClick={() => handleChoose(c.key)}
              disabled={disabled || hasSubmitted}
              className={`relative flex flex-col items-center justify-center p-4 sm:p-5 rounded-3xl border-2 transition-all duration-300 ${
                isChosen
                  ? 'bg-orange-500 text-white border-orange-600 ring-4 ring-orange-400/30 scale-105 shadow-lg'
                  : hasSubmitted
                  ? 'opacity-50 border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 cursor-not-allowed'
                  : 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 hover:border-orange-400 hover:scale-102 hover:shadow-md cursor-pointer active:scale-95'
              }`}
            >
              <span className="text-4xl sm:text-5xl mb-2 filter drop-shadow-sm select-none transition-transform hover:scale-110">
                {c.emoji}
              </span>
              <span className="text-xs sm:text-sm font-black">{c.label}</span>
              <span className="text-[10px] opacity-75 font-medium mt-0.5 hidden sm:inline">{c.desc}</span>

              {isChosen && (
                <div className="absolute top-2 right-2">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Status Notice */}
      <div className="w-full text-center py-2">
        {hasSubmitted ? (
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold animate-pulse">
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {selected ? `You picked ${selected === 'ROCK' ? '✊ Rock' : selected === 'PAPER' ? '✋ Paper' : '✌️ Scissors'} — ` : ''}Choice locked! Waiting for opponent...
            </span>
          </div>
        ) : (
          <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
            Choose Rock, Paper, or Scissors before time runs out!
          </div>
        )}
      </div>
    </div>
  );
};
