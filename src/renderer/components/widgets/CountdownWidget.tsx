import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { WidgetThemeSettings, getWidgetCardStyle } from '../../types/theme';

interface CountdownWidgetProps {
  title?: string;
  targetDate?: string;
  theme?: WidgetThemeSettings;
  onClose?: () => void;
}

export const CountdownWidget: React.FC<CountdownWidgetProps> = ({
  title = 'New Year',
  targetDate = `${new Date().getFullYear() + 1}-01-01T00:00:00`,
  theme,
  onClose
}) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });

  useEffect(() => {
    const calculateTime = () => {
      const target = new Date(targetDate).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, target - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setTimeLeft({ days, hours, minutes });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 60000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const textColor = theme?.textColor || '#ffffff';
  const subtextColor = theme?.subtextColor || '#9ca3af';
  const accentColor = theme?.accentColor || '#FF2D55';

  const cardStyle = getWidgetCardStyle(theme);

  return (
    <div
      style={cardStyle}
      className="text-white shadow-2xl p-4 w-64 flex flex-col justify-between select-none transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold" style={{ color: subtextColor }}>Countdown</span>
        {onClose && (
          <button onClick={onClose} className="p-1 rounded-md hover:bg-white/10" style={{ color: subtextColor }}>
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="flex flex-col items-center justify-center my-2 text-center">
        <span className="text-sm font-bold mb-1" style={{ color: accentColor }}>{title}</span>
        <div className="text-2xl font-bold font-mono tracking-tight" style={{ color: textColor }}>
          {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
        </div>
        <span className="text-[10px] mt-1 font-mono" style={{ color: subtextColor }}>
          {targetDate.replace('T', ' ').substring(0, 16)}
        </span>
      </div>
    </div>
  );
};
