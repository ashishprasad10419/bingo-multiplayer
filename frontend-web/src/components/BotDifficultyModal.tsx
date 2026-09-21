import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameType } from '../lib/types';
import { BotDifficulty, BOT_PROFILES } from '../lib/bot/botEngine';
import { X, Play, WifiOff } from 'lucide-react';
import { GameVisualIcon } from './games/GameVisualIcon';

interface BotDifficultyModalProps {
  gameType: GameType | null;
  onClose: () => void;
}

export const BotDifficultyModal: React.FC<BotDifficultyModalProps> = ({ gameType, onClose }) => {
  const navigate = useNavigate();
  const [selectedDifficulty, setSelectedDifficulty] = useState<BotDifficulty>('MEDIUM');

  if (!gameType) return null;

  const handleStart = () => {
    navigate(`/bot-game?game=${gameType}&difficulty=${selectedDifficulty}`);
  };

  const difficulties: {
    key: BotDifficulty;
    label: string;
    sublabel: string;
    desc: string;
    borderActive: string;
    bgActive: string;
    badgeBg: string;
  }[] = [
    {
      key: 'EASY',
      label: 'Easy AI',
      sublabel: 'RoboEasy 🤖',
      desc: 'Casual & friendly. Makes occasional mistakes, great for practice.',
      borderActive: 'border-emerald-500 ring-2 ring-emerald-500/20',
      bgActive: 'bg-emerald-50/80 dark:bg-emerald-950/40',
      badgeBg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300',
    },
    {
      key: 'MEDIUM',
      label: 'Medium AI',
      sublabel: 'CyberMind 🧠',
      desc: 'Balanced & clever. Blocks winning moves and seizes opportunities.',
      borderActive: 'border-amber-500 ring-2 ring-amber-500/20',
      bgActive: 'bg-amber-50/80 dark:bg-amber-950/40',
      badgeBg: 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300',
    },
    {
      key: 'HARD',
      label: 'Hard AI',
      sublabel: 'OmniBot ⚡',
      desc: 'Grandmaster level. Minimax & high-speed tactics, maximum challenge.',
      borderActive: 'border-rose-500 ring-2 ring-rose-500/20',
      bgActive: 'bg-rose-50/80 dark:bg-rose-950/40',
      badgeBg: 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300',
    },
  ];

  const formatGameTitle = (t: GameType) => {
    switch (t) {
      case 'BINGO': return 'Bingo';
      case 'TIC_TAC_TOE': return 'Tic-Tac-Toe';
      case 'DOTS_AND_BOXES': return 'Dots & Boxes';
      case 'CONNECT_FOUR': return 'Connect Four';
      case 'ROCK_PAPER_SCISSORS': return 'Rock Paper Scissors';
      case 'MEMORY': return 'Memory Match';
      case 'NUMBER_RUSH': return 'Number Rush';
      case 'WORD_SCRAMBLE': return 'Word Scramble';
      default: return t;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[32px] p-6 sm:p-7 shadow-2xl border-2 border-[#e0d6f8] dark:border-slate-800 relative space-y-5 animate-in zoom-in-95">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center mx-auto shadow-md p-2">
            <GameVisualIcon type={gameType} size="lg" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Play {formatGameTitle(gameType)} vs Bot
          </h3>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-extrabold text-slate-600 dark:text-slate-300">
            <WifiOff className="w-3.5 h-3.5 text-emerald-500" />
            <span>Works 100% Offline & Solo</span>
          </div>
        </div>

        {/* Difficulty Options */}
        <div className="space-y-2.5">
          <div className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
            Choose Difficulty:
          </div>

          {difficulties.map((d) => {
            const isSelected = selectedDifficulty === d.key;
            return (
              <div
                key={d.key}
                onClick={() => setSelectedDifficulty(d.key)}
                className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-start space-x-3 select-none ${
                  isSelected
                    ? `${d.borderActive} ${d.bgActive} shadow-xs scale-[1.01]`
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="text-2xl pt-0.5">{BOT_PROFILES[d.key].avatar}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm font-black text-slate-900 dark:text-white">
                      {d.label}
                    </span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${d.badgeBg}`}>
                      {d.sublabel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                    {d.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-xs font-black text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleStart}
            className="flex-2 btn-gradient py-3 rounded-2xl text-xs font-black text-white shadow-lg flex items-center justify-center space-x-2 cursor-pointer hover:brightness-105 active:scale-95 transition"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Start Bot Game 🚀</span>
          </button>
        </div>
      </div>
    </div>
  );
};
