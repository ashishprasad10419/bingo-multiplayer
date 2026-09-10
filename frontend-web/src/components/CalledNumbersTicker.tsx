import React from 'react';
import { Volume2 } from 'lucide-react';

interface CalledNumbersTickerProps {
  calledNumbers: number[];
  lastNumber: number | null;
}

export const CalledNumbersTicker: React.FC<CalledNumbersTickerProps> = ({
  calledNumbers,
  lastNumber,
}) => {
  return (
    <div className="w-full max-w-[420px] mx-auto bg-slate-900/70 border border-slate-800 rounded-xl p-3 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <Volume2 className="w-3.5 h-3.5 text-blue-400" />
          <span>Called Numbers ({calledNumbers.length}/25)</span>
        </div>
        {lastNumber !== null && (
          <div className="text-xs font-medium text-emerald-400 flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Latest: #{lastNumber}</span>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        {calledNumbers.length === 0 ? (
          <div className="text-xs text-slate-500 py-1 italic">No numbers called yet...</div>
        ) : (
          [...calledNumbers].reverse().map((num, idx) => (
            <div
              key={idx}
              className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                idx === 0
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 scale-105 ring-2 ring-blue-400/50'
                  : 'bg-slate-800 text-slate-300 border border-slate-700/60'
              }`}
            >
              {num}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
