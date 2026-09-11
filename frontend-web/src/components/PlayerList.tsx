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
    <div className="w-full mx-auto bg-white/90 border border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-sm backdrop-blur-md">
      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center justify-between">
        <span>{isGame ? 'Players in Match' : `Players (${roomPlayers?.length || 0}/6)`}</span>
        <span className="text-[10px] text-slate-400 font-normal">Live Roster</span>
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
                className={`flex items-center justify-between p-3 rounded-2xl border transition ${
                  isTurn
                    ? 'bg-blue-50/90 border-blue-400 shadow-xs ring-2 ring-blue-300/40'
                    : 'bg-slate-50/80 border-slate-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                      {player.username.slice(0, 2).toUpperCase()}
                    </div>
                    {/* Connection indicator */}
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                        isConnected ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                    />
                  </div>

                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="font-bold text-sm text-slate-900">
                        {player.username}
                      </span>
                      {isMe && (
                        <span className="text-[10px] px-1.5 py-0.2 bg-blue-100 text-blue-700 rounded-md font-bold">
                          You
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center space-x-1 mt-0.5">
                      {isConnected ? (
                        <span className="flex items-center text-emerald-600 font-medium">
                          <Wifi className="w-3 h-3 mr-0.5" /> Online
                        </span>
                      ) : (
                        <span className="flex items-center text-amber-600 font-medium">
                          <WifiOff className="w-3 h-3 mr-0.5" /> Reconnecting...
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Score & Turn Badge */}
                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <div className="text-xs font-black text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg">
                      {player.lineCount} / 5 Lines
                    </div>
                    {isTurn && (
                      <div className="text-[10px] font-black text-blue-600 animate-pulse mt-0.5">
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
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/80 border border-slate-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-blue-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                    {player.username.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="font-bold text-sm text-slate-900">
                        {player.username}
                      </span>
                      {isHost && (
                        <span title="Host" className="flex items-center text-amber-500">
                          <Crown className="w-4 h-4 fill-amber-400" />
                        </span>
                      )}
                      {isMe && (
                        <span className="text-[10px] px-1.5 py-0.2 bg-blue-100 text-blue-700 rounded-md font-bold">
                          You
                        </span>
                      )}
                    </div>
                    {player.isGuest && (
                      <span className="text-[10px] text-slate-400">Guest</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {player.boardLocked ? (
                    <span className="flex items-center space-x-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Ready</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl">
                      <Clock className="w-3.5 h-3.5 animate-spin text-amber-600" />
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
