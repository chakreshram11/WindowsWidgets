import React from 'react';
import { DockItemConfig, DockAppearance } from '../../types/dock';

interface DockSeparatorProps {
  item: DockItemConfig;
  size: number;
  appearance: DockAppearance;
  onContextMenu?: (item: DockItemConfig, e: React.MouseEvent) => void;
}

export const DockSeparator: React.FC<DockSeparatorProps> = ({ item, size, appearance, onContextMenu }) => {
  if (item.type === 'spacer') {
    return <div style={{ width: size / 2, height: size }} />;
  }

  return (
    <div
      className="flex items-center justify-center cursor-pointer group px-1"
      style={{ height: size }}
      onContextMenu={(e) => onContextMenu && onContextMenu(item, e)}
    >
      <div
        className="w-[1px] h-3/4 transition-all"
        style={{
          backgroundColor: appearance.borderEnabled
            ? appearance.borderColor
            : 'rgba(255, 255, 255, 0.25)',
          opacity: (appearance.borderOpacity || 30) / 100
        }}
      />
    </div>
  );
};
