import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { SystemMetrics } from '../../../main/win32/systemSensors';
import { WidgetThemeSettings, getWidgetCardStyle } from '../../types/theme';

interface SystemMonitorWidgetProps {
  theme?: WidgetThemeSettings;
  onClose?: () => void;
}

export const SystemMonitorWidget: React.FC<SystemMonitorWidgetProps> = ({ theme, onClose }) => {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu: 11.9,
    ram: 56.5,
    disk: 69.0
  });

  useEffect(() => {
    let isMounted = true;
    const fetchMetrics = async () => {
      try {
        const data = await window.dockApi.getSystemMetrics();
        if (isMounted && data) {
          setMetrics(data);
        }
      } catch (e) {}
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 3000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const textColor = theme?.textColor || '#ffffff';
  const subtextColor = theme?.subtextColor || '#9ca3af';
  const accentColor = theme?.accentColor || '#007AFF';

  const cardStyle = getWidgetCardStyle(theme);

  return (
    <div
      style={cardStyle}
      className="text-white shadow-2xl p-4 w-64 flex flex-col justify-between select-none transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold" style={{ color: subtextColor }}>System Monitor</span>
        {onClose && (
          <button onClick={onClose} className="p-1 rounded-md hover:bg-white/10" style={{ color: subtextColor }}>
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {/* CPU */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold" style={{ color: textColor }}>CPU</span>
            <span className="font-mono" style={{ color: textColor }}>{metrics.cpu}%</span>
          </div>
          <div className="w-full bg-gray-800/40 rounded-full h-1.5 overflow-hidden border border-white/5">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, metrics.cpu))}%`, backgroundColor: accentColor }}
            />
          </div>
        </div>

        {/* RAM */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold" style={{ color: textColor }}>RAM</span>
            <span className="font-mono" style={{ color: textColor }}>{metrics.ram}%</span>
          </div>
          <div className="w-full bg-gray-800/40 rounded-full h-1.5 overflow-hidden border border-white/5">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, metrics.ram))}%`, backgroundColor: '#34C759' }}
            />
          </div>
        </div>

        {/* Disk */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold" style={{ color: textColor }}>Disk</span>
            <span className="font-mono" style={{ color: textColor }}>{metrics.disk}%</span>
          </div>
          <div className="w-full bg-gray-800/40 rounded-full h-1.5 overflow-hidden border border-white/5">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, metrics.disk))}%`, backgroundColor: '#FFCC00' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
