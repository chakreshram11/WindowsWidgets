import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DockItemConfig } from '../../types/dock';
import {
  Play,
  FolderOpen,
  Pin,
  Trash2,
  Edit2,
  Image,
  XCircle,
  Plus,
  Check
} from 'lucide-react';

interface DockContextMenuProps {
  x: number;
  y: number;
  item: DockItemConfig | null;
  onClose: () => void;
  onOpen: (item: DockItemConfig) => void;
  onRemove: (item: DockItemConfig) => void;
  onChangeIcon: (item: DockItemConfig) => void;
  onRename: (item: DockItemConfig) => void;
  onTogglePin?: (item: DockItemConfig) => void;
  onEmptyTrash?: () => void;
  onAddItem?: () => void;
}

export const DockContextMenu: React.FC<DockContextMenuProps> = ({
  x,
  y,
  item,
  onClose,
  onOpen,
  onRemove,
  onChangeIcon,
  onRename,
  onTogglePin,
  onEmptyTrash,
  onAddItem
}) => {
  const isPinned = item ? item.isPinned !== false : false;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 pointer-events-auto"
        onClick={onClose}
        onContextMenu={(e) => {
          e.preventDefault();
          onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 5 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92 }}
          transition={{ duration: 0.12 }}
          style={{ left: Math.min(x, window.innerWidth - 220), top: Math.max(10, y - 220) }}
          onClick={(e) => e.stopPropagation()}
          className="absolute w-56 bg-gray-900/95 text-gray-100 border border-white/20 backdrop-blur-2xl rounded-2xl shadow-2xl p-1.5 text-xs font-medium"
        >
          {item ? (
            <>
              {/* Header / Title */}
              <div className="px-3 py-1.5 border-b border-white/10 font-semibold text-gray-300 truncate">
                {item.label}
              </div>

              {/* Action Buttons */}
              <button
                onClick={() => { onOpen(item); onClose(); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-blue-600 hover:text-white transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Open</span>
              </button>

              {item.type === 'folder' && (
                <button
                  onClick={() => { window.dockApi.openFolder(item.folderPath || ''); onClose(); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-blue-600 hover:text-white transition-colors"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>Open in Explorer</span>
                </button>
              )}

              {/* Keep in Dock (Pin / Unpin) Option */}
              {item.type === 'app' && onTogglePin && (
                <button
                  onClick={() => { onTogglePin(item); onClose(); }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-blue-600 hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Pin className="w-3.5 h-3.5 text-amber-400" />
                    <span>Keep in Dock</span>
                  </div>
                  {isPinned && <Check className="w-4 h-4 text-emerald-400" />}
                </button>
              )}

              {item.type === 'trash' && (
                <button
                  onClick={() => { onEmptyTrash && onEmptyTrash(); onClose(); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-red-600 hover:text-white transition-colors text-red-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Empty Trash</span>
                </button>
              )}

              <div className="my-1 border-t border-white/10" />

              <button
                onClick={() => { onChangeIcon(item); onClose(); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/15 transition-colors"
              >
                <Image className="w-3.5 h-3.5 text-blue-400" />
                <span>Change Icon...</span>
              </button>

              <button
                onClick={() => { onRename(item); onClose(); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/15 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Rename...</span>
              </button>

              <div className="my-1 border-t border-white/10" />

              {item.type !== 'trash' && (
                <button
                  onClick={() => { onRemove(item); onClose(); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-red-600 hover:text-white transition-colors text-red-400"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Remove from Dock</span>
                </button>
              )}
            </>
          ) : (
            <>
              <button
                onClick={() => { onAddItem && onAddItem(); onClose(); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-blue-600 hover:text-white transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Application...</span>
              </button>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
