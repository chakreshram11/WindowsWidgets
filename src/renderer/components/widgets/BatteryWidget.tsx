import React, { useState, useEffect } from 'react';
import { X, Zap } from 'lucide-react';
import { BatteryMetrics } from '../../../main/win32/systemSensors';
import { WidgetThemeSettings, getWidgetCardStyle } from '../../types/theme';

interface BatteryWidgetProps {
  theme?: WidgetThemeSettings;
  onClose?: () => void;
}

export const BatteryWidget: React.FC<BatteryWidgetProps> = ({ theme, onClose }) => {
  const [battery, setBattery] = useState<BatteryMetrics>({
    percentage: 63,
    isCharging: false,
    statusText: 'Discharging (1h 55m left)'
  });

  useEffect(() => {
    let isMounted = true;
    const fetchBattery = async () => {
      try {
        const data = await window.dockApi.getBatteryMetrics();
        if (isMounted && data) {
          setBattery({
            percentage: data.percentage,
            isCharging: data.isCharging,
            statusText: data.statusText || (data.isCharging ? 'Charging' : 'Discharging')
          });
        }
      } catch (e) {}
    };

    fetchBattery();
    const interval = setInterval(fetchBattery, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

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
        <span className="text-xs font-semibold" style={{ color: subtextColor }}>Battery Status</span>
        {onClose && (
          <button onClick={onClose} className="p-1 rounded-md hover:bg-white/10" style={{ color: subtextColor }}>
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="flex flex-col items-center justify-center my-2">
        <div className="flex items-center gap-2">
          <span className="text-3xl font-bold font-mono tracking-tight" style={{ color: textColor }}>{battery.percentage}%</span>
          {battery.isCharging && <Zap className="w-5 h-5 text-amber-400 fill-amber-400 animate-pulse" />}
        </div>
        <span className="text-xs mt-0.5" style={{ color: subtextColor }}>{battery.statusText}</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-800/40 rounded-full h-2 mt-2 overflow-hidden border border-white/10">
        <div
          className="h-full rounded-full transition-all duration-500 shadow-glow"
          style={{ width: `${Math.min(100, Math.max(0, battery.percentage))}%`, backgroundColor: accentColor }}
        />
      </div>
    </div>
  );
};
