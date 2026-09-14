import React, { useRef, useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { DockItemConfig, DockAppearance, DockLayoutSettings, DockBehaviorSettings, DockBadgeSettings, RunningAppInfo } from '../../types/dock';
import { Folder, Globe, Trash2, FileText, Terminal as TerminalIcon, AppWindow } from 'lucide-react';

interface DockItemProps {
  item: DockItemConfig;
  size: number;
  appearance: DockAppearance;
  layout: DockLayoutSettings;
  behavior: DockBehaviorSettings;
  badges: DockBadgeSettings;
  runningApp?: RunningAppInfo;
  isRecycleBinEmpty?: boolean;
  onItemClick: (item: DockItemConfig, e: React.MouseEvent) => void;
  onContextMenu: (item: DockItemConfig, e: React.MouseEvent) => void;
  onDragStart?: (e: React.DragEvent, item: DockItemConfig) => void;
  onDragOver?: (e: React.DragEvent, item: DockItemConfig) => void;
  onDrop?: (e: React.DragEvent, item: DockItemConfig) => void;
}

export const DockItem: React.FC<DockItemProps> = ({
  item,
  size,
  appearance,
  layout,
  behavior,
  badges,
  runningApp,
  isRecycleBinEmpty = true,
  onItemClick,
  onContextMenu,
  onDragStart,
  onDragOver,
  onDrop
}) => {
  const [extractedIcon, setExtractedIcon] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isBouncing, setIsBouncing] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);

  // Auto-extract executable icon if custom icon is not set
  useEffect(() => {
    let isMounted = true;
    if (item.type === 'app' && item.executablePath && !item.icon) {
      window.dockApi.extractIcon(item.executablePath).then((base64) => {
        if (isMounted && base64) {
          setExtractedIcon(base64);
        }
      });
    }
    return () => { isMounted = false; };
  }, [item.executablePath, item.icon, item.type]);

  const displayIcon = useMemo(() => {
    if (item.icon) return item.icon;
    if (extractedIcon) return extractedIcon;
    return null;
  }, [item.icon, extractedIcon]);

  const handleClick = (e: React.MouseEvent) => {
    if (behavior.clickAnimation === 'bounce') {
      setIsBouncing(true);
      setTimeout(() => setIsBouncing(false), 600);
    }
    onItemClick(item, e);
  };

  const isRunning = Boolean(runningApp && (runningApp.windowCount > 0 || runningApp.pid > 0));

  return (
    <div
      ref={itemRef}
      className="relative flex flex-col items-center justify-center cursor-pointer group p-1"
      style={{ width: size, height: size }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      onContextMenu={(e) => onContextMenu(item, e)}
      draggable
      onDragStart={(e) => onDragStart && onDragStart(e, item)}
      onDragOver={(e) => onDragOver && onDragOver(e, item)}
      onDrop={(e) => onDrop && onDrop(e, item)}
    >
      {/* Tooltip / Label */}
      {layout.showLabels && isHovered && (
        <div
          className={`absolute z-50 pointer-events-none px-3 py-1 rounded-md text-white text-xs font-medium bg-gray-900/90 backdrop-blur-md border border-white/10 shadow-xl whitespace-nowrap transition-all duration-150 ${
            layout.labelPosition === 'top' ? '-top-10' : 'top-full mt-2'
          }`}
        >
          {item.label}
          <div className={layout.labelPosition === 'top' ? 'tooltip-arrow tooltip-arrow-bottom' : 'tooltip-arrow tooltip-arrow-top'} />
        </div>
      )}

      {/* Main Icon Container */}
      <motion.div
        className={`relative w-full h-full flex items-center justify-center rounded-2xl ${
          isBouncing ? 'animate-bounce-once' : ''
        } ${behavior.hoverEffect === 'lift' && isHovered ? '-translate-y-2' : ''} ${
          behavior.hoverEffect === 'scale' && isHovered ? 'scale-110' : ''
        }`}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        {displayIcon ? (
          <img
            src={displayIcon}
            alt={item.label}
            className="w-full h-full object-contain pointer-events-none drop-shadow-md rounded-xl"
          />
        ) : item.type === 'folder' ? (
          <div className="w-full h-full rounded-2xl bg-gradient-to-b from-blue-400 to-blue-600 flex items-center justify-center shadow-lg border border-white/20">
            <Folder className="w-3/5 h-3/5 text-white drop-shadow" />
          </div>
        ) : item.type === 'url' ? (
          <div className="w-full h-full rounded-2xl bg-gradient-to-b from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg border border-white/20">
            <Globe className="w-3/5 h-3/5 text-white drop-shadow" />
          </div>
        ) : item.type === 'trash' ? (
          <div className="w-full h-full rounded-2xl bg-gradient-to-b from-gray-700 to-gray-900 flex items-center justify-center shadow-lg border border-white/20">
            <Trash2 className={`w-3/5 h-3/5 ${isRecycleBinEmpty ? 'text-gray-300' : 'text-amber-400'} drop-shadow`} />
          </div>
        ) : item.type === 'file' ? (
          <div className="w-full h-full rounded-2xl bg-gradient-to-b from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg border border-white/20">
            <FileText className="w-3/5 h-3/5 text-white drop-shadow" />
          </div>
        ) : item.label.toLowerCase().includes('cmd') || item.label.toLowerCase().includes('terminal') ? (
          <div className="w-full h-full rounded-2xl bg-gradient-to-b from-gray-800 to-black flex items-center justify-center shadow-lg border border-white/20">
            <TerminalIcon className="w-3/5 h-3/5 text-emerald-400 drop-shadow" />
          </div>
        ) : (
          <div className="w-full h-full rounded-2xl bg-gradient-to-b from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg border border-white/20">
            <AppWindow className="w-3/5 h-3/5 text-white drop-shadow" />
          </div>
        )}

        {/* Icon Reflection Effect */}
        {(appearance.iconEffect === 'reflection' || appearance.iconEffect === 'glass_reflection') && (
          <div className="absolute -bottom-full left-0 w-full h-full opacity-20 transform scale-y-[-1] pointer-events-none mask-gradient">
            {displayIcon ? (
              <img src={displayIcon} alt="" className="w-full h-full object-contain blur-[1px]" />
            ) : null}
          </div>
        )}

        {/* Notification Badge - ONLY render when windowCount > 1 */}
        {badges.enabled && item.type === 'app' && runningApp && runningApp.windowCount > 1 && (
          <div
            className="absolute -top-1 -right-1 bg-red-500 text-white font-bold rounded-full flex items-center justify-center shadow-lg border border-white/40 z-20"
            style={{
              width: Math.max(18, badges.size),
              height: Math.max(18, badges.size),
              fontSize: badges.fontSize || 11
            }}
          >
            {runningApp.windowCount}
          </div>
        )}
      </motion.div>

      {/* Running Application Indicator Dot */}
      {layout.showRunningIndicators && isRunning && (
        <div
          className="absolute -bottom-2 w-1.5 h-1.5 rounded-full z-30 shadow-glow"
          style={{
            backgroundColor: layout.indicatorColor || '#007AFF',
            width: layout.indicatorSize || 5,
            height: layout.indicatorSize || 5
          }}
        />
      )}
    </div>
  );
};
