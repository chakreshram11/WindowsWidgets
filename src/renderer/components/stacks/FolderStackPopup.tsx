import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderItemEntry, StackDisplayMode } from '../../types/dock';
import { Folder, FileText, ExternalLink, X, Grid, List, Layers } from 'lucide-react';

interface FolderStackPopupProps {
  folderPath: string;
  folderName: string;
  initialMode?: StackDisplayMode;
  onClose: () => void;
}

export const FolderStackPopup: React.FC<FolderStackPopupProps> = ({
  folderPath,
  folderName,
  initialMode = 'fan',
  onClose
}) => {
  const [items, setItems] = useState<FolderItemEntry[]>([]);
  const [mode, setMode] = useState<StackDisplayMode>(initialMode);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    window.dockApi.readFolderContents(folderPath).then((entries) => {
      if (isMounted) {
        setItems(entries);
        setLoading(false);
      }
    });
    return () => { isMounted = false; };
  }, [folderPath]);

  const handleOpenItem = (path: string, isDirectory: boolean) => {
    if (isDirectory) {
      window.dockApi.openFolder(path);
    } else {
      window.dockApi.launchApp(path);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center pb-24 bg-black/30 backdrop-blur-xs pointer-events-auto" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gray-900/90 text-white border border-white/20 backdrop-blur-2xl rounded-2xl shadow-2xl p-4 max-w-xl w-full max-h-[480px] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <Folder className="w-5 h-5 text-blue-400" />
              <span className="font-semibold text-base">{folderName}</span>
              <span className="text-xs text-gray-400">({items.length} items)</span>
            </div>

            {/* View Mode Controls */}
            <div className="flex items-center gap-1 bg-white/10 p-1 rounded-lg">
              <button
                onClick={() => setMode('fan')}
                className={`p-1.5 rounded-md transition-all ${mode === 'fan' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                title="Fan View"
              >
                <Layers className="w-4 h-4" />
              </button>
              <button
                onClick={() => setMode('grid')}
                className={`p-1.5 rounded-md transition-all ${mode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setMode('list')}
                className={`p-1.5 rounded-md transition-all ${mode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-gray-400 hover:text-white ml-2 rounded-md hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content Body */}
          {loading ? (
            <div className="flex-1 flex items-center justify-center p-8 text-gray-400">
              Loading contents...
            </div>
          ) : items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-8 text-gray-400">
              Folder is empty
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto pr-1">
              {mode === 'grid' && (
                <div className="grid grid-cols-4 gap-3">
                  {items.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => handleOpenItem(item.path, item.isDirectory)}
                      className="flex flex-col items-center justify-center p-3 rounded-xl hover:bg-white/15 transition-all text-center group"
                    >
                      {item.isDirectory ? (
                        <Folder className="w-10 h-10 text-blue-400 mb-1 group-hover:scale-110 transition-transform" />
                      ) : (
                        <FileText className="w-10 h-10 text-emerald-400 mb-1 group-hover:scale-110 transition-transform" />
                      )}
                      <span className="text-xs truncate w-full text-gray-200">{item.name}</span>
                    </button>
                  ))}
                </div>
              )}

              {mode === 'list' && (
                <div className="flex flex-col gap-1">
                  {items.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => handleOpenItem(item.path, item.isDirectory)}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/15 transition-all text-left group"
                    >
                      {item.isDirectory ? (
                        <Folder className="w-5 h-5 text-blue-400" />
                      ) : (
                        <FileText className="w-5 h-5 text-emerald-400" />
                      )}
                      <span className="text-sm text-gray-200 flex-1 truncate">{item.name}</span>
                      <ExternalLink className="w-4 h-4 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              )}

              {mode === 'fan' && (
                <div className="flex flex-col gap-2 p-2">
                  {items.slice(0, 10).map((item, index) => (
                    <motion.button
                      key={item.path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.04 }}
                      onClick={() => handleOpenItem(item.path, item.isDirectory)}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/20 transition-all text-left shadow-sm border border-white/5"
                    >
                      {item.isDirectory ? (
                        <Folder className="w-6 h-6 text-blue-400" />
                      ) : (
                        <FileText className="w-6 h-6 text-emerald-400" />
                      )}
                      <span className="text-sm font-medium text-gray-100 flex-1 truncate">{item.name}</span>
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="mt-3 pt-2 border-t border-white/10 flex justify-end">
            <button
              onClick={() => window.dockApi.openFolder(folderPath)}
              className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              <span>Open in Explorer</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
