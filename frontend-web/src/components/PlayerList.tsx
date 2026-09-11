import React from 'react';
import { Crown, CheckCircle2, Clock, Wifi, WifiOff } from 'lucide-react';
import { RoomPlayer, GamePlayer } from '../lib/types';

interface PlayerListProps {
  roomPlayers?: RoomPlayer[];
  gamePlayers?: GamePlayer[];
  hostId?: string;
  currentTurnUserId?: string;
  currentUserId?: string;
}

export const PlayerList: React.FC<PlayerListProps> = ({
  roomPlayers,
  gamePlayers,
  hostId,
  currentTurnUserId,
  currentUserId,
}) => {
  const isGame = !!gamePlayers;

  return (
    <div className="w-full mx-auto card-clay p-4 sm:p-5">
      <div className="text-xs font-extrabold text-[#2a2050] uppercase tracking-wider mb-3.5 flex items-center justify-between">
        <span>{isGame ? 'Players in Match' : `Players (${roomPlayers?.length || 0}/6)`}</span>
        <span className="text-[11px] text-[#7e749c] font-medium">Live Roster</span>
      </div>

      <div className="space-y-2.5">
        {isGame &&
          gamePlayers?.map((player) => {
            const isTurn = player.userId === currentTurnUserId;
            const isMe = player.userId === currentUserId;
            const isConnected = player.connectionStatus === 'CONNECTED';

            return (
              <div
                key={player.userId}
                className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                  isTurn
                    ? 'bg-[#f0ecfc] border-2 border-[#8b7fe8] shadow-[0_4px_14px_rgba(139,127,232,0.2)] ring-4 ring-[#8b7fe8]/15'
                    : 'bg-[#faf7fe] border-[#ede8f8] shadow-2xs'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#f8788a] via-[#e271a5] to-[#8b7fe8] text-white flex items-center justify-center font-extrabold text-xs shadow-xs">
                      {player.username.slice(0, 2).toUpperCase()}
                    </div>
                    {/* Connection indicator */}
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                        isConnected ? 'bg-[#10b981]' : 'bg-[#f59e0b]'
                      }`}
                    />
                  </div>

                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="font-extrabold text-sm text-[#2a2050]">
                        {player.username}
                      </span>
                      {isMe && (
                        <span className="text-[10px] px-2 py-0.5 bg-[#f0ecfc] text-[#6d5ebd] border border-[#e2d7f8] rounded-full font-bold">
                          You
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-[#7e749c] flex items-center space-x-1 mt-0.5 font-medium">
                      {isConnected ? (
                        <span className="flex items-center text-[#047857]">
                          <Wifi className="w-3 h-3 mr-0.5" /> Online
                        </span>
                      ) : (
                        <span className="flex items-center text-[#b45309]">
                          <WifiOff className="w-3 h-3 mr-0.5" /> Reconnecting...
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Score & Turn Badge */}
                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <div className="text-xs font-black text-[#b45309] bg-[#fef5db] border border-[#fde7ad] px-2.5 py-1 rounded-full shadow-2xs">
                      {player.lineCount} / 5 Lines
                    </div>
                    {isTurn && (
                      <div className="text-[10px] font-black text-[#8b7fe8] animate-pulse mt-0.5">
                        Current Turn
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

        {!isGame &&
          roomPlayers?.map((player) => {
            const isHost = player.userId === hostId;
            const isMe = player.userId === currentUserId;

            return (
              <div
                key={player.userId}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-[#faf7fe] border border-[#ede8f8] shadow-2xs"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#f8788a] via-[#e271a5] to-[#8b7fe8] text-white flex items-center justify-center font-extrabold text-xs shadow-xs">
                    {player.username.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="font-extrabold text-sm text-[#2a2050]">
                        {player.username}
                      </span>
                      {isHost && (
                        <span title="Host" className="flex items-center text-[#f59e0b]">
                          <Crown className="w-4 h-4 fill-[#f59e0b]" />
                        </span>
                      )}
                      {isMe && (
                        <span className="text-[10px] px-2 py-0.5 bg-[#f0ecfc] text-[#6d5ebd] border border-[#e2d7f8] rounded-full font-bold">
                          You
                        </span>
                      )}
                    </div>
                    {player.isGuest && (
                      <span className="text-[10px] text-[#7e749c] font-medium">Guest</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {player.boardLocked ? (
                    <span className="flex items-center space-x-1 text-xs font-bold text-[#047857] bg-[#e6f7ef] border border-[#c3eed7] px-3 py-1 rounded-full shadow-2xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
                      <span>Ready</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1 text-xs font-bold text-[#b45309] bg-[#fef5db] border border-[#fde7ad] px-3 py-1 rounded-full shadow-2xs">
                      <Clock className="w-3.5 h-3.5 animate-spin text-[#f59e0b]" />
                      <span>Setting Up</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};
