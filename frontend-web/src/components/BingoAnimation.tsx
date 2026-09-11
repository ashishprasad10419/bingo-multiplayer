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
  // If standard 5 lines, use classic B-I-N-G-O. If > 5 lines, extend with extra 'O's (e.g., BINGOOOOOO)
  const baseLetters = ['B', 'I', 'N', 'G', 'O'];
  const fullLetters = targetLines <= 5
    ? baseLetters
    : [...baseLetters, ...Array.from({ length: targetLines - 5 }, () => 'O')];

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
    <div className="w-full max-w-[560px] mx-auto flex items-center justify-between gap-1.5 sm:gap-2.5 px-3 py-2.5 card-clay">
      {fullLetters.map((char, index) => {
        const isLit = index < lineCount;
        return (
          <div
            key={`${char}-${index}`}
            className={`flex-1 aspect-square max-w-[54px] rounded-2xl flex items-center justify-center font-extrabold text-lg sm:text-2xl transition-all duration-300 ${
              isLit
                ? 'bg-gradient-to-tr from-[#f8788a] via-[#e271a5] to-[#8b7fe8] text-white shadow-[0_6px_18px_rgba(240,115,145,0.4)] scale-105 ring-2 ring-[#fbcfe8]'
                : 'bg-[#f7f4fc] text-[#a39bbd] border border-[#ede8f8] shadow-2xs'
            }`}
          >
            {char}
          </div>
        );
      })}
    </div>
  );
};
