import React from 'react';
import { DockMagnificationSettings } from '../../types/dock';
import { Slider } from '../common/Slider';
import { Maximize2, Zap } from 'lucide-react';

interface MagnificationTabProps {
  magnification: DockMagnificationSettings;
  onChange: (magnification: DockMagnificationSettings) => void;
}

export const MagnificationTab: React.FC<MagnificationTabProps> = ({ magnification, onChange }) => {
  const update = (fields: Partial<DockMagnificationSettings>) => {
    onChange({ ...magnification, ...fields });
  };

  return (
    <div className="flex flex-col gap-6 text-sm text-gray-200">
      {/* Enable Toggle */}
      <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10">
        <div className="flex items-center gap-3">
          <Maximize2 className="w-5 h-5 text-blue-400" />
          <div>
            <div className="font-semibold text-white">Enable macOS Dock Magnification</div>
            <div className="text-xs text-gray-400">Icons dynamically expand as mouse cursor moves across Dock</div>
          </div>
        </div>
        <input
          type="checkbox"
          checked={magnification.enabled}
          onChange={(e) => update({ enabled: e.target.checked })}
          className="w-5 h-5 accent-blue-500 rounded cursor-pointer"
        />
      </div>

      {magnification.enabled && (
        <div className="flex flex-col gap-5">
          <h4 className="font-semibold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Size & Curve Calibration</span>
          </h4>

          <div className="grid grid-cols-2 gap-4">
            <Slider
              label="Base Icon Size"
              min={24}
              max={80}
              unit="px"
              value={magnification.baseIconSize}
              onChange={(val) => update({ baseIconSize: val })}
            />
            <Slider
              label="Maximum Magnified Size"
              min={48}
              max={160}
              unit="px"
              value={magnification.maxIconSize}
              onChange={(val) => update({ maxIconSize: val })}
            />
            <Slider
              label="Magnification Radius"
              min={80}
              max={300}
              unit="px"
              value={magnification.radius}
              onChange={(val) => update({ radius: val })}
            />
            <Slider
              label="Magnification Strength"
              min={1}
              max={3}
              step={0.1}
              value={magnification.strength}
              onChange={(val) => update({ strength: val })}
            />
          </div>
        </div>
      )}
    </div>
  );
};
