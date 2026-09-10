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
    <div className="w-full max-w-[440px] mx-auto bg-slate-900/70 border border-slate-800 rounded-xl p-3 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <Volume2 className="w-3.5 h-3.5 text-blue-400" />
          <span>Called Numbers ({calledNumbers.length}/{totalNumbers})</span>
        </div>
        {lastNumber !== null && (
          <div className="text-xs font-medium text-amber-400 flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            <span>Latest: #{lastNumber}</span>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        {calledNumbers.length === 0 ? (
          <div className="text-xs text-slate-500 py-1 italic">No numbers called yet...</div>
        ) : (
          [...calledNumbers].reverse().map((num, idx) => {
            const callerId = calledByMap[num];
            const isMyPick = currentUserId && callerId === currentUserId;
            const isOpponentPick = currentUserId && callerId && callerId !== currentUserId;

            let badgeClass = 'bg-slate-800 text-slate-300 border border-slate-700/60';
            if (isOpponentPick) {
              badgeClass = 'bg-red-900/60 text-red-200 border border-red-500/60 shadow-sm shadow-red-500/20';
            } else if (isMyPick) {
              badgeClass = 'bg-emerald-900/60 text-emerald-200 border border-emerald-500/60 shadow-sm shadow-emerald-500/20';
            }

            if (idx === 0) {
              badgeClass += ' ring-2 ring-blue-400/80 scale-105';
            }

            return (
              <div
                key={`${num}-${idx}`}
                className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${badgeClass}`}
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
