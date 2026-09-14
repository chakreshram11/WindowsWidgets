import React, { useRef, useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { DockProfile, DockItemConfig, RunningAppInfo } from '../../types/dock';
import { useMagnification } from '../../hooks/useMagnification';
import { DockItem } from './DockItem';
import { DockSeparator } from './DockSeparator';
import { DragIndicator } from './DragIndicator';
import { Plus, Settings } from 'lucide-react';

interface DockContainerProps {
  profile: DockProfile;
  runningApps: RunningAppInfo[];
  isRecycleBinEmpty: boolean;
  onItemClick: (item: DockItemConfig, e: React.MouseEvent) => void;
  onContextMenu: (item: DockItemConfig, e: React.MouseEvent) => void;
  onOpenSettings: () => void;
  onAddItem: () => void;
  onReorderItems: (items: DockItemConfig[]) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const DockContainer: React.FC<DockContainerProps> = ({
  profile,
  runningApps,
  isRecycleBinEmpty,
  onItemClick,
  onContextMenu,
  onOpenSettings,
  onAddItem,
  onReorderItems,
  onMouseEnter,
  onMouseLeave
}) => {
  const { appearance, magnification, layout, behavior, badges, items } = profile;

  // Combine pinned items with unpinned running apps
  const displayItems = useMemo(() => {
    const combined = [...items];

    // Find running processes that are not currently pinned on the Dock
    runningApps.forEach((app) => {
      if (!app.executablePath && !app.processName) return;

      const isAlreadyOnDock = items.some(
        (i) =>
          (i.executablePath && app.executablePath?.toLowerCase() === i.executablePath.toLowerCase()) ||
          (app.processName && i.label.toLowerCase().includes(app.processName.toLowerCase()))
      );

      if (!isAlreadyOnDock && app.executablePath) {
        const trashIndex = combined.findIndex((i) => i.type === 'trash');
        const insertPos = trashIndex !== -1 ? trashIndex : combined.length;

        combined.splice(insertPos, 0, {
          id: `unpinned_${app.pid}`,
          type: 'app',
          label: app.mainWindowTitle || app.processName,
          executablePath: app.executablePath,
          isPinned: false
        });
      }
    });

    return combined;
  }, [items, runningApps]);

  const { containerRef, getItemSize, handleMouseMove, handleMouseLeave } = useMagnification(
    magnification,
    magnification.enabled
  );

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isAutoHidden, setIsAutoHidden] = useState(false);

  // Auto-hide edge detection
  useEffect(() => {
    if (behavior.autoHide === 'never') {
      setIsAutoHidden(false);
      return;
    }

    const handleWindowMouseMove = (e: MouseEvent) => {
      const screenHeight = window.innerHeight;
      if (layout.position === 'bottom') {
        if (e.clientY >= screenHeight - (behavior.revealSensitivity || 10)) {
          setIsAutoHidden(false);
        } else if (e.clientY < screenHeight - 120) {
          setIsAutoHidden(true);
        }
      }
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    return () => window.removeEventListener('mousemove', handleWindowMouseMove);
  }, [behavior.autoHide, behavior.revealSensitivity, layout.position]);

  // Drag & Drop reorder & External Windows File Drop
  const handleDragStart = (e: React.DragEvent, item: DockItemConfig) => {
    const index = displayItems.findIndex((i) => i.id === item.id);
    setDraggedIndex(index);
    e.dataTransfer.setData('text/plain', item.id);
  };

  const handleDragOver = (e: React.DragEvent, item?: DockItemConfig) => {
    e.preventDefault();
    if (item) {
      const index = displayItems.findIndex((i) => i.id === item.id);
      if (index !== dragOverIndex) {
        setDragOverIndex(index);
      }
    }
  };

  const handleDrop = async (e: React.DragEvent, item?: DockItemConfig) => {
    e.preventDefault();
    setDraggedIndex(null);
    setDragOverIndex(null);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const filePath = (file as any).path || file.name;
      const isExe = filePath.endsWith('.exe') || filePath.endsWith('.lnk');
      const icon = isExe ? await window.dockApi.extractIcon(filePath) : undefined;
      const name = file.name.replace(/\.[^/.]+$/, '');

      const newItem: DockItemConfig = {
        id: String(Date.now()),
        type: isExe ? 'app' : 'file',
        label: name,
        executablePath: isExe ? filePath : undefined,
        folderPath: !isExe ? filePath : undefined,
        icon: icon || undefined,
        isPinned: true
      };

      onReorderItems([...items, newItem]);
      return;
    }

    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      const updated = [...items];
      const [removed] = updated.splice(draggedIndex, 1);
      if (removed) {
        updated.splice(Math.min(dragOverIndex, updated.length), 0, removed);
        onReorderItems(updated);
      }
    }
  };

  const containerStyle: React.CSSProperties = {
    backgroundColor: appearance.backgroundType === 'transparent'
      ? 'transparent'
      : appearance.backgroundColor || 'rgba(255, 255, 255, 0.25)',
    borderRadius: `${appearance.borderRadius || 24}px`,
    borderWidth: appearance.borderEnabled ? `${appearance.borderThickness || 1}px` : '1px',
    borderColor: appearance.borderEnabled ? appearance.borderColor : 'rgba(255, 255, 255, 0.35)',
    boxShadow: appearance.shadowEnabled
      ? `0 20px 50px rgba(0, 0, 0, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.4)`
      : '0 10px 30px rgba(0,0,0,0.3)',
    gap: `${layout.iconSpacing || 10}px`,
    padding: `${layout.dockPadding || 10}px`
  };

  const bottomMargin = layout.bottomOffset !== undefined ? layout.bottomOffset : -6;

  return (
    <div className="w-full h-full flex items-end justify-center pb-0 px-2 relative pointer-events-none">
      <motion.div
        animate={{
          y: isAutoHidden ? 120 : 0,
          opacity: isAutoHidden ? 0 : 1
        }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        style={{ marginBottom: `${bottomMargin}px` }}
        className="relative flex items-center justify-center pointer-events-auto"
      >
        <div
          ref={containerRef}
          onMouseEnter={onMouseEnter}
          onMouseLeave={(e) => {
            handleMouseLeave();
            onMouseLeave && onMouseLeave();
          }}
          onMouseMove={handleMouseMove}
          onDragOver={(e) => handleDragOver(e)}
          onDrop={(e) => handleDrop(e)}
          style={containerStyle}
          className="glass-panel flex items-center justify-center transition-all duration-200 border border-white/30 backdrop-blur-2xl shadow-2xl pointer-events-auto"
        >
          {/* Empty Dock Fallback */}
          {displayItems.length === 0 && (
            <button
              onClick={onAddItem}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white/90 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Application</span>
            </button>
          )}

          {/* Dock Items List */}
          {displayItems.map((item, index) => {
            const runningApp = runningApps.find(
              (app) =>
                (item.executablePath && app.executablePath?.toLowerCase() === item.executablePath.toLowerCase()) ||
                (app.processName && item.label.toLowerCase().includes(app.processName.toLowerCase()))
            );

            let itemCenterX = index * (magnification.baseIconSize + (layout.iconSpacing || 10)) + magnification.baseIconSize / 2;
            const currentSize = getItemSize(itemCenterX);

            return (
              <React.Fragment key={item.id}>
                {dragOverIndex === index && draggedIndex !== null && <DragIndicator />}

                {item.type === 'separator' || item.type === 'spacer' ? (
                  <DockSeparator
                    item={item}
                    size={currentSize}
                    appearance={appearance}
                    onContextMenu={onContextMenu}
                  />
                ) : (
                  <DockItem
                    item={item}
                    size={currentSize}
                    appearance={appearance}
                    layout={layout}
                    behavior={behavior}
                    badges={badges}
                    runningApp={runningApp}
                    isRecycleBinEmpty={isRecycleBinEmpty}
                    onItemClick={onItemClick}
                    onContextMenu={onContextMenu}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  />
                )}
              </React.Fragment>
            );
          })}

          {/* Quick Settings Gear Icon */}
          <div className="border-l border-white/20 pl-2 ml-1 flex items-center">
            <button
              onClick={onOpenSettings}
              className="p-2 text-white/70 hover:text-white hover:bg-white/15 rounded-xl transition-all"
              title="Dock Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
