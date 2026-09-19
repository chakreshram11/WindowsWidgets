import React, { useEffect, useMemo, useState } from 'react';
import { MemoryStick, RefreshCw, X } from 'lucide-react';
import {
  MemoryCleanupResult,
  MemoryStats
} from '../../../main/win32/systemSensors';
import { WidgetThemeSettings, getWidgetCardStyle } from '../../types/theme';

interface MemoryCleanerWidgetProps {
  theme?: WidgetThemeSettings;
  onClose?: () => void;
  lastCleanupAt?: string;
  lastFreedBytes?: number;
  onCleanupComplete?: (result: MemoryCleanupResult, cleanupAt: string) => void;
}

type CleanupState = 'idle' | 'cleaning' | 'success' | 'error';

const formatMemory = (bytes: number): string => {
  const gib = bytes / (1024 ** 3);
  return `${gib >= 1 ? gib.toFixed(1) : gib.toFixed(2)} GB`;
};

const formatCleanupTime = (value?: string): string => {
  if (!value) return 'Never';

  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return 'Never';

  const elapsedMinutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60000));
  if (elapsedMinutes < 1) return 'Just now';
  if (elapsedMinutes < 60) return `${elapsedMinutes}m ago`;
  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) return `${elapsedHours}h ago`;
  return new Date(value).toLocaleDateString();
};

export const MemoryCleanerWidget: React.FC<MemoryCleanerWidgetProps> = ({
  theme,
  onClose,
  lastCleanupAt,
  lastFreedBytes = 0,
  onCleanupComplete
}) => {
  const [memory, setMemory] = useState<MemoryStats | null>(null);
  const [cleanupState, setCleanupState] = useState<CleanupState>('idle');
  const [errorText, setErrorText] = useState('');
  const [cleanupAt, setCleanupAt] = useState(lastCleanupAt);
  const [freedBytes, setFreedBytes] = useState(lastFreedBytes);

  useEffect(() => {
    setCleanupAt(lastCleanupAt);
    setFreedBytes(lastFreedBytes);
  }, [lastCleanupAt, lastFreedBytes]);

  useEffect(() => {
    let mounted = true;

    const refresh = async () => {
      try {
        const stats = await window.dockApi.getMemoryStats();
        if (mounted) setMemory(stats);
      } catch (error) {
        console.error('Failed to fetch memory statistics:', error);
      }
    };

    refresh();
    const interval = setInterval(refresh, 3000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleCleanup = async () => {
    if (cleanupState === 'cleaning') return;

    setCleanupState('cleaning');
    setErrorText('');

    try {
      const result = await window.dockApi.cleanMemory();
      if (!result.success) {
        setCleanupState('error');
        setErrorText(result.error || 'Memory cleanup failed. Try again.');
        return;
      }

      const completedAt = new Date().toISOString();
      setMemory(result.after);
      setFreedBytes(result.reclaimedBytes);
      setCleanupAt(completedAt);
      setCleanupState('success');
      onCleanupComplete?.(result, completedAt);

      window.setTimeout(() => setCleanupState('idle'), 2500);
    } catch (error) {
      console.error('Memory cleanup request failed:', error);
      setCleanupState('error');
      setErrorText('Memory cleanup failed. Try again.');
    }
  };

  const cardStyle = getWidgetCardStyle(theme);
  const textColor = theme?.textColor || '#ffffff';
  const subtextColor = theme?.subtextColor || '#9ca3af';
  const accentColor = theme?.accentColor || '#007AFF';
  const usagePercent = memory?.usagePercent || 0;

  const statusLabel = useMemo(() => {
    if (cleanupState === 'cleaning') return 'Cleaning...';
    if (cleanupState === 'success') return `Freed ${formatMemory(freedBytes)}`;
    if (cleanupState === 'error') return errorText;
    return '';
  }, [cleanupState, errorText, freedBytes]);

  return (
    <div
      style={cardStyle}
      className="text-white shadow-2xl p-4 w-64 flex flex-col select-none transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <MemoryStick className="w-3.5 h-3.5" style={{ color: accentColor }} />
          <span className="text-xs font-semibold" style={{ color: subtextColor }}>
            Memory Cleaner
          </span>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1 rounded-md hover:bg-white/10" style={{ color: subtextColor }}>
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="flex flex-col items-center justify-center my-2">
        <div className="text-3xl font-bold tracking-tight font-mono" style={{ color: accentColor }}>
          {memory ? `${Math.round(usagePercent)}%` : '--'}
        </div>
        <div className="text-xs font-semibold mt-1" style={{ color: textColor }}>
          {memory ? `${formatMemory(memory.usedBytes)} / ${formatMemory(memory.totalBytes)}` : 'Reading memory...'}
        </div>
      </div>

      <div className="w-full bg-gray-800/40 rounded-full h-2 overflow-hidden border border-white/10 mb-3">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.min(100, Math.max(0, usagePercent))}%`, backgroundColor: accentColor }}
        />
      </div>

      <div className="flex flex-col gap-1 text-xs">
        <div className="flex justify-between">
          <span style={{ color: subtextColor }}>Available</span>
          <span style={{ color: textColor }}>{memory ? formatMemory(memory.availableBytes) : '--'}</span>
        </div>
        {freedBytes > 0 && (
          <div className="flex justify-between">
            <span style={{ color: subtextColor }}>Freed</span>
            <span style={{ color: '#34C759' }}>{formatMemory(freedBytes)}</span>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleCleanup}
        disabled={cleanupState === 'cleaning'}
        className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-white transition-all disabled:opacity-60 disabled:cursor-wait"
        style={{ backgroundColor: `${accentColor}cc` }}
      >
        {cleanupState === 'cleaning' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <MemoryStick className="w-3.5 h-3.5" />}
        {cleanupState === 'cleaning' ? 'Cleaning...' : 'Clean Memory'}
      </button>

      <div className={`text-[11px] text-center mt-2 min-h-4 ${cleanupState === 'error' ? 'text-red-300' : ''}`} style={cleanupState === 'error' ? undefined : { color: subtextColor }}>
        {statusLabel || `Last cleanup: ${formatCleanupTime(cleanupAt)}`}
      </div>
    </div>
  );
};
