import React, { useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw } from 'lucide-react';
import { WidgetThemeSettings, getWidgetCardStyle } from '../../types/theme';

interface TimerWidgetProps {
  theme?: WidgetThemeSettings;
  onClose?: () => void;
}

export const TimerWidget: React.FC<TimerWidgetProps> = ({ theme, onClose }) => {
  const [timeMs, setTimeMs] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isRunning) {
      interval = setInterval(() => {
        setTimeMs((prev) => prev + 10);
      }, 10);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const handleReset = () => {
    setIsRunning(false);
    setTimeMs(0);
  };

  const minutes = String(Math.floor((timeMs / 60000) % 60)).padStart(2, '0');
  const seconds = String(Math.floor((timeMs / 1000) % 60)).padStart(2, '0');
  const ms = String(Math.floor((timeMs % 1000) / 10)).padStart(2, '0');

  const textColor = theme?.textColor || '#ffffff';
  const subtextColor = theme?.subtextColor || '#9ca3af';
  const accentColor = theme?.accentColor || '#34C759';

  const cardStyle = getWidgetCardStyle(theme);

  return (
    <div
      style={cardStyle}
      className="text-white shadow-2xl p-4 w-64 flex flex-col select-none transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold" style={{ color: subtextColor }}>Timer / Stopwatch</span>
        {onClose && (
          <button onClick={onClose} className="p-1 rounded-md hover:bg-white/10" style={{ color: subtextColor }}>
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="text-center my-3">
        <span className="text-3xl font-bold font-mono tracking-tight" style={{ color: accentColor }}>
          {minutes}:{seconds}.{ms}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-1">
        <button
          onClick={() => setIsRunning(!isRunning)}
          style={{ backgroundColor: isRunning ? '#d97706' : accentColor }}
          className="py-2 px-3 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-all shadow-md hover:opacity-90"
        >
          {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{isRunning ? 'Pause' : 'Start'}</span>
        </button>

        <button
          onClick={handleReset}
          className="py-2 px-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border border-white/10"
          style={{ color: textColor }}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
};
