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
    <div className="w-full mx-auto bg-white/90 border border-slate-200/90 rounded-2xl p-3.5 shadow-sm backdrop-blur-md">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-600 uppercase tracking-wider">
          <Volume2 className="w-3.5 h-3.5 text-blue-600" />
          <span>Called Numbers ({calledNumbers.length}/{totalNumbers})</span>
        </div>
        {lastNumber !== null && (
          <div className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
            <span>Latest: #{lastNumber}</span>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        {calledNumbers.length === 0 ? (
          <div className="text-xs text-slate-400 py-1.5 italic">No numbers called yet...</div>
        ) : (
          [...calledNumbers].reverse().map((num, idx) => {
            const callerId = calledByMap[num];
            const isMyPick = currentUserId && callerId === currentUserId;
            const isOpponentPick = currentUserId && callerId && callerId !== currentUserId;

            let badgeClass = 'bg-slate-100 text-slate-700 border border-slate-200';
            if (isOpponentPick) {
              badgeClass = 'bg-rose-500 text-white border border-rose-600 shadow-xs';
            } else if (isMyPick) {
              badgeClass = 'bg-emerald-500 text-white border border-emerald-600 shadow-xs';
            }

            if (idx === 0) {
              badgeClass += ' ring-2 ring-indigo-500 scale-105 shadow-sm font-black';
            }

            return (
              <div
                key={`${num}-${idx}`}
                className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm ${badgeClass}`}
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
