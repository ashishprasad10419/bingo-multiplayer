import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface BingoAnimationProps {
  lineCount: number;
  targetLines?: number;
  triggerConfetti?: boolean;
}

export const BingoAnimation: React.FC<BingoAnimationProps> = ({
  lineCount,
  targetLines = 5,
  triggerConfetti = false,
}) => {
  // If standard 5 lines, use classic B-I-N-G-O. If > 5 lines, extend with extra markers or numbers!
  const baseLetters = ['B', 'I', 'N', 'G', 'O'];
  const fullLetters = targetLines <= 5
    ? baseLetters
    : [...baseLetters, ...Array.from({ length: targetLines - 5 }, (_, i) => `${i + 6}`)];

  useEffect(() => {
    if (triggerConfetti || lineCount >= targetLines) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [triggerConfetti, lineCount, targetLines]);

  return (
    <div className="w-full max-w-[440px] mx-auto flex items-center justify-between gap-1.5 px-3 py-2 bg-slate-900/60 rounded-xl border border-slate-800 backdrop-blur-sm">
      {fullLetters.map((char, index) => {
        const isLit = index < lineCount;
        return (
          <div
            key={`${char}-${index}`}
            className={`flex-1 aspect-square max-w-[44px] rounded-xl flex items-center justify-center font-black text-lg sm:text-xl transition-all duration-300 ${
              isLit
                ? 'bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 shadow-lg shadow-amber-500/40 scale-105 ring-2 ring-yellow-300'
                : 'bg-slate-800/80 text-slate-500 border border-slate-700/60'
            }`}
          >
            {char}
          </div>
        );
      })}
    </div>
  );
};
