import React, { useEffect, useState } from 'react';

interface LastCalledCalloutProps {
  number: number | null;
  calledByUsername?: string;
  isMyPick?: boolean;
}

export const LastCalledCallout: React.FC<LastCalledCalloutProps> = ({
  number,
  calledByUsername,
  isMyPick = false,
}) => {
  const [activeNumber, setActiveNumber] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (number !== null && number > 0) {
      setActiveNumber(number);
      setVisible(true);

      const timer = setTimeout(() => {
        setVisible(false);
      }, 1400);

      return () => clearTimeout(timer);
    }
  }, [number]);

  if (!visible || activeNumber === null) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 pointer-events-none animate-in zoom-in-75 fade-in duration-200">
      <div className="flex items-center space-x-3 px-5 py-2.5 rounded-[24px] bg-[#2a2050]/90 backdrop-blur-md border border-white/20 shadow-[0_12px_32px_rgba(0,0,0,0.35)] text-white">
        <div className="w-12 h-12 rounded-[18px] bg-gradient-to-tr from-[#f8788a] via-[#e271a5] to-[#8b7fe8] flex items-center justify-center font-black text-2xl shadow-[0_4px_16px_rgba(248,120,138,0.4)] animate-bounce-short">
          {activeNumber}
        </div>
        <div className="text-left pr-2">
          <p className="text-[10px] uppercase tracking-wider font-extrabold text-[#f472b6]">
            {isMyPick ? '🎯 You Called' : '📢 Number Picked'}
          </p>
          <p className="text-sm font-black text-white tracking-tight">
            {isMyPick ? `Number ${activeNumber} Locked!` : `${calledByUsername || 'Opponent'} called ${activeNumber}!`}
          </p>
        </div>
      </div>
    </div>
  );
};
