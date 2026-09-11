import React from 'react';
import { Volume2 } from 'lucide-react';

interface CalledNumbersTickerProps {
  calledNumbers: number[];
  lastNumber: number | null;
  totalNumbers?: number;
  calledByMap?: Record<number, string>;
  currentUserId?: string;
}

export const CalledNumbersTicker: React.FC<CalledNumbersTickerProps> = ({
  calledNumbers,
  lastNumber,
  totalNumbers = 25,
  calledByMap = {},
  currentUserId,
}) => {
  return (
    <div className="w-full mx-auto card-clay p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2 text-xs font-extrabold text-[#2a2050] uppercase tracking-wider">
          <Volume2 className="w-4 h-4 text-[#8b7fe8]" />
          <span>Called Numbers ({calledNumbers.length}/{totalNumbers})</span>
        </div>
        {lastNumber !== null && (
          <div className="text-xs font-bold text-[#b45309] bg-[#fef5db] border border-[#fde7ad] px-3 py-1 rounded-full flex items-center space-x-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#f59e0b] animate-ping"></span>
            <span>Latest: #{lastNumber}</span>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        {calledNumbers.length === 0 ? (
          <div className="text-xs text-[#9f96ba] py-1.5 italic font-medium">No numbers called yet...</div>
        ) : (
          [...calledNumbers].reverse().map((num, idx) => {
            const callerId = calledByMap[num];
            const isMyPick = currentUserId && callerId === currentUserId;
            const isOpponentPick = currentUserId && callerId && callerId !== currentUserId;

            let badgeClass = 'bg-[#f4effc] text-[#2a2050] border border-[#ede8f8]';
            if (isOpponentPick) {
              badgeClass = 'bg-gradient-to-br from-[#f8788a] to-[#e11d48] text-white shadow-[0_4px_10px_rgba(248,120,138,0.3)]';
            } else if (isMyPick) {
              badgeClass = 'bg-gradient-to-br from-[#10b981] to-[#059669] text-white shadow-[0_4px_10px_rgba(16,185,129,0.3)]';
            }

            if (idx === 0) {
              badgeClass += ' ring-2 ring-[#8b7fe8] scale-105 shadow-md font-extrabold';
            }

            return (
              <div
                key={`${num}-${idx}`}
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${badgeClass}`}
              >
                {num}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
