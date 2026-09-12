import React, { useState } from 'react';
import { NetworkConnectionStatus } from '../lib/types';
import { RefreshCw } from 'lucide-react';

interface ConnectionStatusPillProps {
  status: NetworkConnectionStatus;
  onRefresh?: () => Promise<any> | void;
  className?: string;
}

export const ConnectionStatusPill: React.FC<ConnectionStatusPillProps> = ({
  status,
  onRefresh,
  className = '',
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onRefresh || isRefreshing) return;
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setTimeout(() => setIsRefreshing(false), 400);
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'CONNECTED':
        return {
          bg: 'bg-[#e6f7ef]',
          border: 'border-[#b6eed0]',
          text: 'text-[#047857]',
          dot: 'bg-[#10b981]',
          label: 'Live',
        };
      case 'RECONNECTING':
        return {
          bg: 'bg-[#fef9c3]',
          border: 'border-[#fde047]',
          text: 'text-[#b45309]',
          dot: 'bg-[#f59e0b] animate-ping',
          label: 'Reconnecting...',
        };
      case 'DISCONNECTED':
      default:
        return {
          bg: 'bg-[#fee8ea]',
          border: 'border-[#fcd3d7]',
          text: 'text-[#dc2626]',
          dot: 'bg-[#ef4444]',
          label: 'Offline',
        };
    }
  };

  const config = getStatusBadge();

  return (
    <div
      className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full border ${config.bg} ${config.border} ${config.text} text-[11px] font-bold shadow-2xs transition-all ${className}`}
      title={status === 'CONNECTED' ? 'Real-time WebSocket Sync Active' : 'WebSocket connection state'}
    >
      <span className="relative flex h-2 w-2">
        <span className={`rounded-full h-2 w-2 ${config.dot}`}></span>
      </span>

      <span className="tracking-wide">{config.label}</span>

      {onRefresh && (
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="ml-1 p-0.5 rounded-full hover:bg-black/5 active:scale-95 transition-transform text-current opacity-70 hover:opacity-100 cursor-pointer"
          title="Force state refresh"
        >
          <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      )}
    </div>
  );
};
