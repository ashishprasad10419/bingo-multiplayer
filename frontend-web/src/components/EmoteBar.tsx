import React, { useState } from 'react';
import { socketService } from '../lib/socket';
import { gameApi } from '../lib/api';
import { useAuthStore } from '../state/authStore';
import { useGameStore } from '../state/gameStore';
import { soundService } from '../lib/sound';

const EMOTES = [
  { emoji: '👏', label: 'Clap' },
  { emoji: '🔥', label: 'Fire' },
  { emoji: '🎯', label: 'Bullseye' },
  { emoji: '😂', label: 'Laugh' },
  { emoji: '😮', label: 'Wow' },
  { emoji: '🥳', label: 'Party' },
];

interface EmoteBarProps {
  gameId: string;
  roomCode: string;
}

export const EmoteBar: React.FC<EmoteBarProps> = ({ gameId, roomCode }) => {
  const { user } = useAuthStore();
  const { addEmote } = useGameStore();
  const [cooldown, setCooldown] = useState(false);

  const handleSendEmote = async (emoji: string) => {
    if (cooldown || !user) return;

    setCooldown(true);
    soundService.playEmoteSound();

    // 0ms Optimistic local bubble spawn
    addEmote({
      id: `${user.id}-${Date.now()}-${Math.random()}`,
      userId: user.id,
      username: user.username,
      emote: emoji,
      timestamp: Date.now(),
    });

    // Send via STOMP WebSocket
    const sent = socketService.sendEmote(gameId, roomCode, emoji);
    if (!sent) {
      // REST fallback
      try {
        await gameApi.sendEmote(gameId, emoji);
      } catch (_) {}
    }

    setTimeout(() => {
      setCooldown(false);
    }, 1200);
  };

  return (
    <div className="flex items-center justify-center space-x-1 sm:space-x-2 p-1.5 sm:p-2 rounded-full bg-white/90 backdrop-blur-md border border-[#ede8f8] shadow-[0_6px_20px_rgba(140,120,210,0.12)] max-w-fit mx-auto transition-all">
      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8b7fe8] px-2 hidden xs:inline">
        React:
      </span>
      {EMOTES.map((item) => (
        <button
          key={item.label}
          onClick={() => handleSendEmote(item.emoji)}
          disabled={cooldown}
          title={item.label}
          className={`w-8 h-8 sm:w-9 sm:h-9 text-base sm:text-lg rounded-full flex items-center justify-center transition-all duration-150 select-none ${
            cooldown
              ? 'opacity-60 cursor-not-allowed scale-95'
              : 'hover:scale-125 hover:bg-[#f0ecfc] active:scale-90 cursor-pointer shadow-2xs hover:shadow-xs'
          }`}
        >
          {item.emoji}
        </button>
      ))}
    </div>
  );
};
