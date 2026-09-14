import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WidgetThemeSettings, MACOS_THEME_PRESETS, macOSPresetName, APPLE_ACCENT_COLORS } from '../../types/theme';
import { Slider } from '../common/Slider';
import { X, Sparkles, Palette, Sliders, Check, Save, RotateCcw } from 'lucide-react';

interface WidgetThemeModalProps {
  theme: WidgetThemeSettings;
  onThemeChange: (theme: WidgetThemeSettings) => void;
  onClose: () => void;
}

export const WidgetThemeModal: React.FC<WidgetThemeModalProps> = ({ theme, onThemeChange, onClose }) => {
  const [savedSuccess, setSavedSuccess] = useState(false);

  const applyPreset = (presetName: macOSPresetName) => {
    const presetConfig = MACOS_THEME_PRESETS[presetName];
    if (presetConfig) {
      onThemeChange({ ...presetConfig });
      triggerSaveNotice();
    }
  };

  const update = (fields: Partial<WidgetThemeSettings>) => {
    onThemeChange({
      ...theme,
      ...fields,
      preset: 'Custom'
    });
    triggerSaveNotice();
  };

  const triggerSaveNotice = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleResetDefaults = () => {
    onThemeChange({ ...MACOS_THEME_PRESETS['macOS Sonoma Dark'] });
    triggerSaveNotice();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md pointer-events-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-slate-900/95 text-white border border-white/20 rounded-2xl shadow-2xl w-[640px] max-h-[600px] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-red-500 cursor-pointer" onClick={onClose} />
              <div className="w-3 h-3 rounded-full bg-amber-500 cursor-pointer" />
              <div className="w-3 h-3 rounded-full bg-emerald-500 cursor-pointer" />
              <span className="font-semibold text-sm ml-2">Chakresh Theme Customizer</span>
            </div>
            <div className="flex items-center gap-2">
              {savedSuccess && (
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Check className="w-3 h-3" /> Saved!
                </span>
              )}
              <button onClick={onClose} className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content Body */}
          <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-6 text-sm">
            {/* macOS Presets */}
            <div>
              <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>macOS Theme Presets</span>
              </h4>
              <div className="grid grid-cols-3 gap-2.5">
                {(Object.keys(MACOS_THEME_PRESETS) as macOSPresetName[]).filter(p => p !== 'Custom').map((pName) => (
                  <button
                    key={pName}
                    onClick={() => applyPreset(pName)}
                    className={`px-3 py-2.5 rounded-xl font-medium border text-xs flex items-center justify-between transition-all ${
                      theme.preset === pName
                        ? 'bg-blue-600 border-blue-400 text-white shadow-lg'
                        : 'bg-white/5 border-white/10 hover:bg-white/15 text-gray-300'
                    }`}
                  >
                    <span>{pName}</span>
                    {theme.preset === pName && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Accent Color Palette */}
            <div>
              <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                <Palette className="w-4 h-4 text-purple-400" />
                <span>Apple Accent Color</span>
              </h4>
              <div className="flex items-center gap-3">
                {APPLE_ACCENT_COLORS.map((color) => (
                  <button
                    key={color.hex}
                    onClick={() => update({ accentColor: color.hex })}
                    className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center ${
                      theme.accentColor === color.hex ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  >
                    {theme.accentColor === color.hex && <Check className="w-4 h-4 text-white drop-shadow" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Glass Parameters Sliders */}
            <div className="flex flex-col gap-4">
              <h4 className="font-semibold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-400" />
                <span>Glass & Squircle Controls</span>
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <Slider
                  label="Glass Transparency"
                  min={0}
                  max={90}
                  unit="%"
                  value={theme.transparency}
                  onChange={(val) => update({ transparency: val })}
                />

                <Slider
                  label="Backdrop Blur"
                  min={0}
                  max={50}
                  unit="px"
                  value={theme.blur}
                  onChange={(val) => update({ blur: val })}
                />

                <Slider
                  label="Squircle Radius"
                  min={8}
                  max={32}
                  unit="px"
                  value={theme.borderRadius}
                  onChange={(val) => update({ borderRadius: val })}
                />

                <Slider
                  label="Border Opacity"
                  min={0}
                  max={100}
                  unit="%"
                  value={theme.borderOpacity}
                  onChange={(val) => update({ borderOpacity: val })}
                />

                <Slider
                  label="Border Thickness"
                  min={0}
                  max={6}
                  unit="px"
                  value={theme.borderEnabled ? theme.borderThickness : 0}
                  onChange={(val) => update({ borderThickness: val, borderEnabled: val > 0 })}
                />

                <div className="flex flex-col justify-center gap-1.5 bg-white/5 p-3 rounded-xl border border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-200">Enable Border</span>
                    <input
                      type="checkbox"
                      checked={theme.borderEnabled !== false}
                      onChange={(e) => update({ borderEnabled: e.target.checked })}
                      className="w-4 h-4 accent-blue-500 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-3 border-t border-white/10 bg-white/5 flex items-center justify-between">
            <button
              onClick={handleResetDefaults}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white rounded-xl text-xs font-medium transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5 text-gray-400" />
              <span>Reset Defaults</span>
            </button>
            <button
              onClick={() => {
                onThemeChange(theme);
                triggerSaveNotice();
                onClose();
              }}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Done & Save Theme</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
