import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../state/gameStore';
import { useAuthStore } from '../state/authStore';
import { soundService } from '../lib/sound';

export const FloatingEmotesOverlay: React.FC = () => {
  const { activeEmotes } = useGameStore();
  const { user } = useAuthStore();
  const prevCountRef = useRef(activeEmotes.length);

  useEffect(() => {
    // If a new emote was added by someone else, play sound
    if (activeEmotes.length > prevCountRef.current) {
      const latest = activeEmotes[activeEmotes.length - 1];
      if (latest && latest.userId !== user?.id) {
        soundService.playEmoteSound();
      }
    }
    prevCountRef.current = activeEmotes.length;
  }, [activeEmotes, user?.id]);

  // Only display recent emotes (within 3 seconds)
  const now = Date.now();
  const visibleEmotes = activeEmotes.filter((e) => now - e.timestamp < 3200);

  if (visibleEmotes.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden flex flex-col justify-end items-end p-6 sm:p-10 space-y-3">
      {visibleEmotes.map((item, idx) => {
        const isMe = item.userId === user?.id;
        // Randomize slight horizontal offset for organic cloud effect
        const randomX = ((idx * 37) % 50) - 25;

        return (
          <div
            key={item.id}
            style={{
              transform: `translateX(${randomX}px)`,
            }}
            className="animate-float-emote flex items-center space-x-2 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-full border border-[#ede8f8] shadow-[0_10px_30px_rgba(140,120,210,0.22)]"
          >
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                isMe
                  ? 'bg-[#e6f7ef] text-[#047857]'
                  : 'bg-[#f0ecfc] text-[#6d5ebd]'
              }`}
            >
              {isMe ? 'You' : item.username}
            </span>
            <span className="text-2xl sm:text-3xl filter drop-shadow-sm select-none">
              {item.emote}
            </span>
          </div>
        );
      })}
    </div>
  );
};
