import React, { useState, useEffect } from 'react';
import { X, ArrowDown, ArrowUp } from 'lucide-react';
import { NetworkMetrics } from '../../../main/win32/systemSensors';
import { WidgetThemeSettings, getWidgetCardStyle } from '../../types/theme';

interface NetworkWidgetProps {
  theme?: WidgetThemeSettings;
  onClose?: () => void;
}

export const NetworkWidget: React.FC<NetworkWidgetProps> = ({ theme, onClose }) => {
  const [network, setNetwork] = useState<NetworkMetrics>({
    downloadBps: 129,
    uploadBps: 113,
    downloadText: '129 B/s',
    uploadText: '113 B/s'
  });

  useEffect(() => {
    let isMounted = true;
    const fetchNetwork = async () => {
      try {
        const data = await window.dockApi.getNetworkMetrics();
        if (isMounted && data) {
          setNetwork(data);
        }
      } catch (e) {}
    };

    fetchNetwork();
    const interval = setInterval(fetchNetwork, 2000);
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
        <span className="text-xs font-semibold" style={{ color: subtextColor }}>Network Activity</span>
        {onClose && (
          <button onClick={onClose} className="p-1 rounded-md hover:bg-white/10" style={{ color: subtextColor }}>
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2 my-1">
        <div className="flex items-center justify-between text-xs bg-white/5 p-2 rounded-xl border border-white/5">
          <div className="flex items-center gap-1.5 font-medium" style={{ color: accentColor }}>
            <ArrowDown className="w-3.5 h-3.5" />
            <span>Download:</span>
          </div>
          <span className="font-mono font-semibold" style={{ color: textColor }}>{network.downloadText}</span>
        </div>

        <div className="flex items-center justify-between text-xs bg-white/5 p-2 rounded-xl border border-white/5">
          <div className="flex items-center gap-1.5 font-medium" style={{ color: '#34C759' }}>
            <ArrowUp className="w-3.5 h-3.5" />
            <span>Upload:</span>
          </div>
          <span className="font-mono font-semibold" style={{ color: textColor }}>{network.uploadText}</span>
        </div>
      </div>
    </div>
  );
};
