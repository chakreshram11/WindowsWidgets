import React from 'react';
import { DockBehaviorSettings, AutoHideMode, HoverEffectType, ClickAnimationType } from '../../types/dock';
import { Slider } from '../common/Slider';
import { MousePointer, PlayCircle, EyeOff } from 'lucide-react';

interface BehaviorTabProps {
  behavior: DockBehaviorSettings;
  onChange: (behavior: DockBehaviorSettings) => void;
}

export const BehaviorTab: React.FC<BehaviorTabProps> = ({ behavior, onChange }) => {
  const update = (fields: Partial<DockBehaviorSettings>) => {
    onChange({ ...behavior, ...fields });
  };

  return (
    <div className="flex flex-col gap-6 text-sm text-gray-200">
      {/* Auto Hide */}
      <div className="flex flex-col gap-3">
        <h4 className="font-semibold text-white flex items-center gap-2">
          <EyeOff className="w-4 h-4 text-purple-400" />
          <span>Auto-Hide Options</span>
        </h4>
        <div className="grid grid-cols-3 gap-2">
          {(['never', 'always', 'intelligent'] as AutoHideMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => update({ autoHide: mode })}
              className={`px-3 py-2 rounded-xl font-medium border text-xs capitalize transition-all ${
                behavior.autoHide === mode
                  ? 'bg-blue-600 border-blue-400 text-white shadow-lg'
                  : 'bg-white/5 border-white/10 hover:bg-white/15 text-gray-300'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {behavior.autoHide !== 'never' && (
          <div className="grid grid-cols-2 gap-4 mt-2">
            <Slider
              label="Reveal Sensitivity"
              min={5}
              max={30}
              unit="px"
              value={behavior.revealSensitivity}
              onChange={(val) => update({ revealSensitivity: val })}
            />
            <Slider
              label="Hide Delay"
              min={100}
              max={1000}
              unit="ms"
              value={behavior.hideDelay}
              onChange={(val) => update({ hideDelay: val })}
            />
          </div>
        )}
      </div>

      {/* Hover Effects */}
      <div className="flex flex-col gap-3">
        <h4 className="font-semibold text-white flex items-center gap-2">
          <MousePointer className="w-4 h-4 text-blue-400" />
          <span>Hover Effect</span>
        </h4>
        <div className="grid grid-cols-3 gap-2">
          {(['magnification', 'scale', 'lift', 'glow', 'bounce', 'none'] as HoverEffectType[]).map((eff) => (
            <button
              key={eff}
              onClick={() => update({ hoverEffect: eff })}
              className={`px-3 py-2 rounded-xl font-medium border text-xs capitalize transition-all ${
                behavior.hoverEffect === eff
                  ? 'bg-blue-600 border-blue-400 text-white shadow-lg'
                  : 'bg-white/5 border-white/10 hover:bg-white/15 text-gray-300'
              }`}
            >
              {eff}
            </button>
          ))}
        </div>
      </div>

      {/* Click Animations */}
      <div className="flex flex-col gap-3">
        <h4 className="font-semibold text-white flex items-center gap-2">
          <PlayCircle className="w-4 h-4 text-emerald-400" />
          <span>Launch Click Animation</span>
        </h4>
        <div className="grid grid-cols-3 gap-2">
          {(['bounce', 'pulse', 'zoom', 'shake', 'none'] as ClickAnimationType[]).map((anim) => (
            <button
              key={anim}
              onClick={() => update({ clickAnimation: anim })}
              className={`px-3 py-2 rounded-xl font-medium border text-xs capitalize transition-all ${
                behavior.clickAnimation === anim
                  ? 'bg-blue-600 border-blue-400 text-white shadow-lg'
                  : 'bg-white/5 border-white/10 hover:bg-white/15 text-gray-300'
              }`}
            >
              {anim}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
