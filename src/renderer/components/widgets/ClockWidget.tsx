import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { WidgetThemeSettings, getWidgetCardStyle } from '../../types/theme';

interface ClockWidgetProps {
  theme?: WidgetThemeSettings;
  onClose?: () => void;
}

export const ClockWidget: React.FC<ClockWidgetProps> = ({ theme, onClose }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = String(time.getHours()).padStart(2, '0');
  const minutes = String(time.getMinutes()).padStart(2, '0');
  const seconds = String(time.getSeconds()).padStart(2, '0');
  const dayName = time.toLocaleDateString('en-US', { weekday: 'long' });
  const fullDate = time.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  const isLight = theme?.mode === 'light';
  const textColor = theme?.textColor || '#ffffff';
  const subtextColor = theme?.subtextColor || '#9ca3af';
  const accentColor = theme?.accentColor || '#007AFF';

  const cardStyle = getWidgetCardStyle(theme);

  return (
    <div
      style={cardStyle}
      className="text-white shadow-2xl p-4 w-64 flex flex-col justify-between select-none transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold" style={{ color: subtextColor }}>Clock</span>
        {onClose && (
          <button onClick={onClose} className="p-1 rounded-md hover:bg-white/10" style={{ color: subtextColor }}>
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="flex flex-col items-center justify-center my-2">
        <div className="text-3xl font-bold tracking-tight font-mono" style={{ color: accentColor }}>
          {hours}:{minutes}:{seconds}
        </div>
        <div className="text-sm font-semibold mt-1" style={{ color: textColor }}>{dayName}</div>
        <div className="text-xs mt-0.5" style={{ color: subtextColor }}>{fullDate}</div>
      </div>
    </div>
  );
};
