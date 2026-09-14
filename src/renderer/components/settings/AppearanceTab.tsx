import React from 'react';
import { DockAppearance } from '../../types/dock';
import { Slider } from '../common/Slider';
import { Sparkles, Palette, ShieldAlert } from 'lucide-react';

interface AppearanceTabProps {
  appearance: DockAppearance;
  onChange: (appearance: DockAppearance) => void;
}

const PRESETS = [
  { name: 'macOS Dark', bg: 'rgba(28, 28, 30, 0.75)', blur: 30, opacity: 75, border: true },
  { name: 'macOS Light', bg: 'rgba(240, 240, 243, 0.75)', blur: 30, opacity: 75, border: true },
  { name: 'Clear Glass', bg: 'rgba(255, 255, 255, 0.15)', blur: 15, opacity: 25, border: true },
  { name: 'Frosted', bg: 'rgba(30, 30, 35, 0.9)', blur: 50, opacity: 90, border: false },
  { name: 'Minimal', bg: 'rgba(0, 0, 0, 0.05)', blur: 5, opacity: 10, border: false }
];

export const AppearanceTab: React.FC<AppearanceTabProps> = ({ appearance, onChange }) => {
  const update = (fields: Partial<DockAppearance>) => {
    onChange({ ...appearance, ...fields });
  };

  const applyPreset = (presetName: string) => {
    const found = PRESETS.find(p => p.name === presetName);
    if (!found) return;
    update({
      preset: presetName as any,
      backgroundColor: found.bg,
      blur: found.blur,
      transparency: found.opacity,
      borderEnabled: found.border
    });
  };

  return (
    <div className="flex flex-col gap-6 text-sm text-gray-200">
      {/* Presets */}
      <div>
        <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Theme Presets</span>
        </h4>
        <div className="grid grid-cols-3 gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => applyPreset(p.name)}
              className={`px-3 py-2 rounded-xl font-medium border text-xs transition-all ${
                appearance.preset === p.name
                  ? 'bg-blue-600 border-blue-400 text-white shadow-lg'
                  : 'bg-white/5 border-white/10 hover:bg-white/15 text-gray-300'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Background & Glass Sliders */}
      <div className="flex flex-col gap-4">
        <h4 className="font-semibold text-white flex items-center gap-2">
          <Palette className="w-4 h-4 text-blue-400" />
          <span>Glass & Transparency</span>
        </h4>

        <div className="grid grid-cols-2 gap-4">
          <Slider
            label="Transparency"
            min={0}
            max={100}
            unit="%"
            value={appearance.transparency}
            onChange={(val) => update({ transparency: val })}
          />
          <Slider
            label="Blur Intensity"
            min={0}
            max={50}
            unit="px"
            value={appearance.blur}
            onChange={(val) => update({ blur: val })}
          />
          <Slider
            label="Saturation"
            min={0}
            max={200}
            unit="%"
            value={appearance.saturation}
            onChange={(val) => update({ saturation: val })}
          />
          <Slider
            label="Border Radius"
            min={0}
            max={40}
            unit="px"
            value={appearance.borderRadius}
            onChange={(val) => update({ borderRadius: val })}
          />
        </div>
      </div>

      {/* Border & Shadows */}
      <div className="flex flex-col gap-4">
        <h4 className="font-semibold text-white">Border & Shadow</h4>

        <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/10">
          <span>Enable Border</span>
          <input
            type="checkbox"
            checked={appearance.borderEnabled}
            onChange={(e) => update({ borderEnabled: e.target.checked })}
            className="w-4 h-4 accent-blue-500 rounded cursor-pointer"
          />
        </div>

        {appearance.borderEnabled && (
          <div className="grid grid-cols-2 gap-4">
            <Slider
              label="Border Thickness"
              min={0}
              max={6}
              unit="px"
              value={appearance.borderThickness}
              onChange={(val) => update({ borderThickness: val })}
            />
            <Slider
              label="Border Opacity"
              min={0}
              max={100}
              unit="%"
              value={appearance.borderOpacity}
              onChange={(val) => update({ borderOpacity: val })}
            />
          </div>
        )}

        <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/10">
          <span>Enable Shadow</span>
          <input
            type="checkbox"
            checked={appearance.shadowEnabled}
            onChange={(e) => update({ shadowEnabled: e.target.checked })}
            className="w-4 h-4 accent-blue-500 rounded cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
