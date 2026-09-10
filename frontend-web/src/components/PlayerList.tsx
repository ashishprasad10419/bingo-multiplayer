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
    <div className="w-full max-w-[420px] mx-auto bg-slate-900/80 border border-slate-800 rounded-xl p-3">
      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
        {isGame ? 'Players in Match' : `Players (${roomPlayers?.length || 0}/6)`}
      </div>

      <div className="space-y-2">
        {isGame &&
          gamePlayers?.map((player) => {
            const isTurn = player.userId === currentTurnUserId;
            const isMe = player.userId === currentUserId;
            const isConnected = player.connectionStatus === 'CONNECTED';

            return (
              <div
                key={player.userId}
                className={`flex items-center justify-between p-2 rounded-lg border transition ${
                  isTurn
                    ? 'bg-blue-600/15 border-blue-500/60 ring-1 ring-blue-500/40'
                    : 'bg-slate-800/40 border-slate-800'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-700 to-indigo-950 border border-slate-600 flex items-center justify-center font-bold text-xs text-indigo-200">
                      {player.username.slice(0, 2).toUpperCase()}
                    </div>
                    {/* Connection indicator */}
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${
                        isConnected ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                    />
                  </div>

                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="font-semibold text-sm text-slate-200">
                        {player.username}
                      </span>
                      {isMe && (
                        <span className="text-[10px] px-1.5 py-0.2 bg-blue-500/20 text-blue-300 rounded font-medium">
                          You
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center space-x-1">
                      {isConnected ? (
                        <span className="flex items-center text-emerald-400/80">
                          <Wifi className="w-3 h-3 mr-0.5" /> Online
                        </span>
                      ) : (
                        <span className="flex items-center text-amber-400">
                          <WifiOff className="w-3 h-3 mr-0.5" /> Reconnecting...
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Score & Turn Badge */}
                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <div className="text-xs font-bold text-amber-400">
                      {player.lineCount} / 5 Lines
                    </div>
                    {isTurn && (
                      <div className="text-[10px] font-semibold text-blue-400 animate-pulse">
                        Turn
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
                className="flex items-center justify-between p-2 rounded-lg bg-slate-800/50 border border-slate-800"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center font-bold text-xs text-indigo-300">
                    {player.username.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="font-semibold text-sm text-slate-200">
                        {player.username}
                      </span>
                      {isHost && (
                        <span title="Host">
                          <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
                        </span>
                      )}
                      {isMe && (
                        <span className="text-[10px] px-1.5 py-0.2 bg-blue-500/20 text-blue-300 rounded font-medium">
                          You
                        </span>
                      )}
                    </div>
                    {player.isGuest && (
                      <span className="text-[10px] text-slate-500">Guest</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {player.boardLocked ? (
                    <span className="flex items-center space-x-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Ready</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1 text-xs font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                      <Clock className="w-3 h-3 animate-spin" />
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
