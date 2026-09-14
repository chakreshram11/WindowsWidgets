import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RunningAppInfo } from '../../types/dock';
import { Monitor, X, Minus, ExternalLink } from 'lucide-react';

interface WindowPreviewPopupProps {
  runningApp: RunningAppInfo;
  onClose: () => void;
}

export const WindowPreviewPopup: React.FC<WindowPreviewPopupProps> = ({ runningApp, onClose }) => {
  const handleAction = async (hwnd: number, action: 'activate' | 'minimize' | 'close') => {
    await window.dockApi.windowAction(hwnd, action);
    if (action === 'close') {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center pb-24 bg-black/20 backdrop-blur-xs pointer-events-auto" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 15, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gray-900/90 text-white border border-white/20 backdrop-blur-2xl rounded-2xl shadow-2xl p-4 max-w-lg w-full"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4 text-indigo-400" />
              <span className="font-semibold text-sm">{runningApp.processName}</span>
              <span className="text-xs text-gray-400">({runningApp.windows.length} windows)</span>
            </div>
            <button onClick={onClose} className="p-1 text-gray-400 hover:text-white rounded-md hover:bg-white/10">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Window Cards Grid */}
          <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto">
            {runningApp.windows.map((win) => (
              <div
                key={win.hwnd}
                className="group relative bg-white/10 hover:bg-white/20 rounded-xl p-3 border border-white/10 flex flex-col justify-between transition-all cursor-pointer"
                onClick={() => handleAction(win.hwnd, 'activate')}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-medium truncate text-gray-200">{win.title}</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAction(win.hwnd, 'minimize');
                      }}
                      className="p-1 text-gray-300 hover:text-amber-400 rounded hover:bg-white/10"
                      title="Minimize"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAction(win.hwnd, 'close');
                      }}
                      className="p-1 text-gray-300 hover:text-red-400 rounded hover:bg-white/10"
                      title="Close Window"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="w-full h-20 bg-gray-950/60 rounded-lg flex items-center justify-center border border-white/5">
                  <ExternalLink className="w-6 h-6 text-gray-500 group-hover:text-blue-400 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
