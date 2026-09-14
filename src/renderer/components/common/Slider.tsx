import React from 'react';

interface SliderProps {
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  unit?: string;
  onChange: (val: number) => void;
}

export const Slider: React.FC<SliderProps> = ({ label, min, max, step = 1, value, unit = '', onChange }) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex justify-between items-center text-xs">
        <span className="font-medium text-gray-300">{label}</span>
        <span className="text-gray-400 font-mono">{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-colors"
      />
    </div>
  );
};
