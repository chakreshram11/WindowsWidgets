import React from 'react';
import { DockLayoutSettings, DockPosition } from '../../types/dock';
import { Slider } from '../common/Slider';
import { Layout, Eye } from 'lucide-react';

interface LayoutTabProps {
  layout: DockLayoutSettings;
  onChange: (layout: DockLayoutSettings) => void;
}

export const LayoutTab: React.FC<LayoutTabProps> = ({ layout, onChange }) => {
  const update = (fields: Partial<DockLayoutSettings>) => {
    onChange({ ...layout, ...fields });
  };

  return (
    <div className="flex flex-col gap-6 text-sm text-gray-200">
      {/* Position */}
      <div>
        <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
          <Layout className="w-4 h-4 text-indigo-400" />
          <span>Dock Screen Position</span>
        </h4>
        <div className="grid grid-cols-3 gap-3">
          {(['bottom', 'left', 'right'] as DockPosition[]).map((pos) => (
            <button
              key={pos}
              onClick={() => update({ position: pos })}
              className={`px-4 py-2.5 rounded-xl font-medium border text-xs capitalize transition-all ${
                layout.position === pos
                  ? 'bg-blue-600 border-blue-400 text-white shadow-lg'
                  : 'bg-white/5 border-white/10 hover:bg-white/15 text-gray-300'
              }`}
            >
              {pos}
            </button>
          ))}
        </div>
      </div>

      {/* Spacing & Sizes */}
      <div className="flex flex-col gap-4">
        <h4 className="font-semibold text-white">Spacing & Bottom Edge Offset</h4>
        <div className="grid grid-cols-3 gap-4">
          <Slider
            label="Icon Spacing"
            min={2}
            max={24}
            unit="px"
            value={layout.iconSpacing}
            onChange={(val) => update({ iconSpacing: val })}
          />
          <Slider
            label="Dock Padding"
            min={4}
            max={20}
            unit="px"
            value={layout.dockPadding}
            onChange={(val) => update({ dockPadding: val })}
          />
          <Slider
            label="Bottom Edge Offset"
            min={-30}
            max={60}
            unit="px"
            value={layout.bottomOffset !== undefined ? layout.bottomOffset : -6}
            onChange={(val) => update({ bottomOffset: val })}
          />
        </div>
      </div>

      {/* Labels & Running Indicators */}
      <div className="flex flex-col gap-4">
        <h4 className="font-semibold text-white flex items-center gap-2">
          <Eye className="w-4 h-4 text-emerald-400" />
          <span>Labels & Indicators</span>
        </h4>

        <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/10">
          <span>Show Tooltip Labels on Hover</span>
          <input
            type="checkbox"
            checked={layout.showLabels}
            onChange={(e) => update({ showLabels: e.target.checked })}
            className="w-4 h-4 accent-blue-500 rounded cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/10">
          <span>Show Active App Indicator Dots</span>
          <input
            type="checkbox"
            checked={layout.showRunningIndicators}
            onChange={(e) => update({ showRunningIndicators: e.target.checked })}
            className="w-4 h-4 accent-blue-500 rounded cursor-pointer"
          />
        </div>

        {layout.showRunningIndicators && (
          <div className="grid grid-cols-2 gap-4">
            <Slider
              label="Indicator Size"
              min={2}
              max={10}
              unit="px"
              value={layout.indicatorSize}
              onChange={(val) => update({ indicatorSize: val })}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-300">Indicator Color</label>
              <input
                type="color"
                value={layout.indicatorColor}
                onChange={(e) => update({ indicatorColor: e.target.value })}
                className="w-full h-8 bg-transparent rounded cursor-pointer border border-white/10"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
