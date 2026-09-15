import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { ClockWidget } from './components/widgets/ClockWidget';
import { CalendarWidget } from './components/widgets/CalendarWidget';
import { TimerWidget } from './components/widgets/TimerWidget';
import { CountdownWidget } from './components/widgets/CountdownWidget';
import { TasksWidget } from './components/widgets/TasksWidget';
import { NetworkWidget } from './components/widgets/NetworkWidget';
import { BatteryWidget } from './components/widgets/BatteryWidget';
import { NoteWidget } from './components/widgets/NoteWidget';
import { SystemMonitorWidget } from './components/widgets/SystemMonitorWidget';
import { WidgetThemeModal } from './components/theme/WidgetThemeModal';
import { WidgetThemeSettings, MACOS_THEME_PRESETS } from './types/theme';
import { WidgetState, TaskItem } from './types/dock';
import { LayoutGrid, Download, Upload, Plus, X, Palette } from 'lucide-react';

const defaultTasks: TaskItem[] = [
  { id: '1', text: 'CRTA', completed: false },
  { id: '2', text: 'Security +', completed: false },
  { id: '3', text: 'ISC2', completed: false }
];

const defaultNoteText = 'Stay curious. Keep building.';

const defaultWidgets: Record<string, WidgetState> = {
  clock: { id: 'clock', visible: true, x: 30, y: 30 },
  calendar: { id: 'calendar', visible: true, x: 310, y: 30 },
  timer: { id: 'timer', visible: true, x: 610, y: 30 },
  countdown: { id: 'countdown', visible: true, x: 890, y: 30 },
  tasks: { id: 'tasks', visible: true, x: 30, y: 230, tasks: defaultTasks },
  network: { id: 'network', visible: true, x: 610, y: 230 },
  battery: { id: 'battery', visible: true, x: 310, y: 440 },
  note: { id: 'note', visible: true, x: 610, y: 430, noteText: defaultNoteText },
  system: { id: 'system', visible: true, x: 30, y: 670 }
};

export const App: React.FC = () => {
  const [widgets, setWidgets] = useState<Record<string, WidgetState>>(defaultWidgets);
  const [theme, setTheme] = useState<WidgetThemeSettings>(MACOS_THEME_PRESETS['macOS Sonoma Dark']);
  const [showControlBar, setShowControlBar] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  const isDraggingRef = useRef(false);
  const isThemeModalOpenRef = useRef(false);
  const isInputFocusedRef = useRef(false);

  // Sync isThemeModalOpen state to ref and handle window mouse pass-through
  useEffect(() => {
    isThemeModalOpenRef.current = isThemeModalOpen;
    if (isThemeModalOpen) {
      window.dockApi.setIgnoreMouseEvents(false);
    } else if (!isDraggingRef.current && !isInputFocusedRef.current) {
      window.dockApi.setIgnoreMouseEvents(true, true);
    }
  }, [isThemeModalOpen]);

  // Global focus listener to keep mouse events enabled while editing widget inputs/notes
  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        isInputFocusedRef.current = true;
        window.dockApi.setIgnoreMouseEvents(false);
      }
    };

    const handleFocusOut = () => {
      setTimeout(() => {
        const active = document.activeElement as HTMLElement | null;
        if (!active || (active.tagName !== 'INPUT' && active.tagName !== 'TEXTAREA' && !active.isContentEditable)) {
          isInputFocusedRef.current = false;
        }
      }, 50);
    };

    window.addEventListener('focusin', handleFocusIn);
    window.addEventListener('focusout', handleFocusOut);

    return () => {
      window.removeEventListener('focusin', handleFocusIn);
      window.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  // Set click-through transparent background on initial launch & listen for Copilot key toggle
  useEffect(() => {
    window.dockApi.setIgnoreMouseEvents(true, true);

    const cleanup = window.dockApi.onToggleWidgetsMenu(() => {
      setShowControlBar((prev) => {
        const next = !prev;
        if (next) {
          window.dockApi.setIgnoreMouseEvents(false);
        }
        return next;
      });
    });

    return () => {
      cleanup();
    };
  }, []);

  const enableMouseEvents = () => {
    window.dockApi.setIgnoreMouseEvents(false);
  };

  const disableMouseEvents = () => {
    if (!isDraggingRef.current && !isThemeModalOpenRef.current && !isInputFocusedRef.current) {
      window.dockApi.setIgnoreMouseEvents(true, true);
    }
  };

  const handleMouseEnterWidget = () => {
    enableMouseEvents();
  };

  const handleMouseLeaveWidget = () => {
    disableMouseEvents();
  };

  const handleDragStart = () => {
    isDraggingRef.current = true;
    enableMouseEvents();
  };

  const handleDragEnd = (key: string, info: PanInfo) => {
    isDraggingRef.current = false;
    setWidgets((prev) => {
      const current = prev[key];
      if (!current) return prev;
      const updated = {
        ...prev,
        [key]: {
          ...current,
          x: Math.max(0, current.x + info.offset.x),
          y: Math.max(0, current.y + info.offset.y)
        }
      };
      persistWidgetSettings(theme, updated);
      return updated;
    });

    setTimeout(() => {
      disableMouseEvents();
    }, 50);
  };

  // Load saved widget layout & theme settings on launch
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const saved = await window.dockApi.getSettings();
        if (saved) {
          if (saved.theme) {
            setTheme(saved.theme);
          }
          if (saved.widgets) {
            setWidgets((prev) => ({ ...prev, ...saved.widgets }));
          }
        }
      } catch (err) {
        console.error('Failed to load saved dock settings:', err);
      }
    };
    loadSettings();
  }, []);

  // Persist theme & widget state changes to store (dock_config.json)
  const persistWidgetSettings = useCallback(
    async (updatedTheme: WidgetThemeSettings, updatedWidgets: Record<string, WidgetState>) => {
      try {
        const current = await window.dockApi.getSettings();
        await window.dockApi.saveSettings({
          ...current,
          theme: updatedTheme,
          widgets: updatedWidgets
        });
      } catch (err) {
        console.error('Failed to save widget settings:', err);
      }
    },
    []
  );

  const handleTasksChange = useCallback(
    (tasks: TaskItem[]) => {
      setWidgets((prev) => {
        const current = prev.tasks;
        if (!current) return prev;
        const updated = {
          ...prev,
          tasks: {
            ...current,
            tasks
          }
        };
        persistWidgetSettings(theme, updated);
        return updated;
      });
    },
    [theme, persistWidgetSettings]
  );

  const handleNoteChange = useCallback(
    (noteText: string) => {
      setWidgets((prev) => {
        const current = prev.note;
        if (!current) return prev;
        const updated = {
          ...prev,
          note: {
            ...current,
            noteText
          }
        };
        persistWidgetSettings(theme, updated);
        return updated;
      });
    },
    [theme, persistWidgetSettings]
  );

  const handleThemeChange = (newTheme: WidgetThemeSettings) => {
    setTheme(newTheme);
    persistWidgetSettings(newTheme, widgets);
  };

  const toggleWidget = (key: string) => {
    setWidgets((prev) => {
      const updated = {
        ...prev,
        [key]: {
          ...prev[key],
          visible: !prev[key].visible
        }
      };
      persistWidgetSettings(theme, updated);
      return updated;
    });
    disableMouseEvents();
  };

  const handleExport = async () => {
    await persistWidgetSettings(theme, widgets);
    await window.dockApi.exportConfig();
  };

  const handleImport = async () => {
    const imported = await window.dockApi.importConfig();
    if (imported) {
      const newWidgets = (imported as any).widgets || widgets;
      const newTheme = (imported as any).theme || theme;
      setWidgets(newWidgets);
      setTheme(newTheme);
      await persistWidgetSettings(newTheme, newWidgets);
    }
  };

  return (
    <div className="w-screen h-screen overflow-hidden relative select-none pointer-events-none">
      {/* Top Floating Widget Control Bar Toggle */}
      <div
        className="absolute top-2 left-1/2 -translate-x-1/2 z-50 pointer-events-auto"
        onMouseEnter={handleMouseEnterWidget}
        onMouseLeave={handleMouseLeaveWidget}
      >
        <button
          onClick={() => setShowControlBar(!showControlBar)}
          className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-900/90 text-gray-200 hover:text-white border border-white/20 backdrop-blur-2xl rounded-full text-xs font-semibold shadow-2xl transition-all"
        >
          <LayoutGrid className="w-4 h-4 text-blue-400" />
          <span>Widgets Menu</span>
        </button>

        {showControlBar && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-10 left-1/2 -translate-x-1/2 bg-slate-900/95 border border-white/20 backdrop-blur-2xl rounded-2xl shadow-2xl p-3 w-80 flex flex-col gap-3 text-xs"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="font-semibold text-white">Chakresh Widgets Manager</span>
              <button
                onClick={() => {
                  setShowControlBar(false);
                  disableMouseEvents();
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Widget Toggles */}
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(widgets).map((key) => {
                const w = widgets[key];
                return (
                  <button
                    key={key}
                    onClick={() => toggleWidget(key)}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl border capitalize font-medium transition-all ${
                      w.visible
                        ? 'bg-blue-600/30 border-blue-400 text-white'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    <span>{key}</span>
                    {w.visible ? <X className="w-3 h-3 text-red-400" /> : <Plus className="w-3 h-3 text-emerald-400" />}
                  </button>
                );
              })}
            </div>

            {/* Customize Widget Theme Button */}
            <button
              onClick={() => {
                setIsThemeModalOpen(true);
                setShowControlBar(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl font-semibold text-white shadow-md transition-all"
            >
              <Palette className="w-4 h-4" />
              <span>Customize Widget Theme...</span>
            </button>

            {/* Export & Import */}
            <div className="border-t border-white/10 pt-2 flex justify-between gap-2">
              <button
                onClick={handleExport}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-white/5 hover:bg-white/15 border border-white/10 rounded-xl text-gray-300 font-medium"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export</span>
              </button>
              <button
                onClick={handleImport}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-white/5 hover:bg-white/15 border border-white/10 rounded-xl text-gray-300 font-medium"
              >
                <Upload className="w-3.5 h-3.5 text-blue-400" />
                <span>Import</span>
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Draggable Desktop Widgets Canvas */}

      {/* Clock Widget */}
      {widgets.clock.visible && (
        <motion.div
          drag
          dragMomentum={false}
          onDragStart={handleDragStart}
          onDragEnd={(_, info) => handleDragEnd('clock', info)}
          onMouseEnter={handleMouseEnterWidget}
          onMouseLeave={handleMouseLeaveWidget}
          style={{ x: widgets.clock.x, y: widgets.clock.y }}
          className="absolute z-20 pointer-events-auto cursor-grab active:cursor-grabbing"
        >
          <ClockWidget theme={theme} onClose={() => toggleWidget('clock')} />
        </motion.div>
      )}

      {/* Calendar Widget */}
      {widgets.calendar.visible && (
        <motion.div
          drag
          dragMomentum={false}
          onDragStart={handleDragStart}
          onDragEnd={(_, info) => handleDragEnd('calendar', info)}
          onMouseEnter={handleMouseEnterWidget}
          onMouseLeave={handleMouseLeaveWidget}
          style={{ x: widgets.calendar.x, y: widgets.calendar.y }}
          className="absolute z-20 pointer-events-auto cursor-grab active:cursor-grabbing"
        >
          <CalendarWidget theme={theme} onClose={() => toggleWidget('calendar')} />
        </motion.div>
      )}

      {/* Timer / Stopwatch Widget */}
      {widgets.timer.visible && (
        <motion.div
          drag
          dragMomentum={false}
          onDragStart={handleDragStart}
          onDragEnd={(_, info) => handleDragEnd('timer', info)}
          onMouseEnter={handleMouseEnterWidget}
          onMouseLeave={handleMouseLeaveWidget}
          style={{ x: widgets.timer.x, y: widgets.timer.y }}
          className="absolute z-20 pointer-events-auto cursor-grab active:cursor-grabbing"
        >
          <TimerWidget theme={theme} onClose={() => toggleWidget('timer')} />
        </motion.div>
      )}

      {/* Countdown Widget */}
      {widgets.countdown.visible && (
        <motion.div
          drag
          dragMomentum={false}
          onDragStart={handleDragStart}
          onDragEnd={(_, info) => handleDragEnd('countdown', info)}
          onMouseEnter={handleMouseEnterWidget}
          onMouseLeave={handleMouseLeaveWidget}
          style={{ x: widgets.countdown.x, y: widgets.countdown.y }}
          className="absolute z-20 pointer-events-auto cursor-grab active:cursor-grabbing"
        >
          <CountdownWidget theme={theme} onClose={() => toggleWidget('countdown')} />
        </motion.div>
      )}

      {/* Tasks Widget */}
      {widgets.tasks.visible && (
        <motion.div
          drag
          dragMomentum={false}
          onDragStart={handleDragStart}
          onDragEnd={(_, info) => handleDragEnd('tasks', info)}
          onMouseEnter={handleMouseEnterWidget}
          onMouseLeave={handleMouseLeaveWidget}
          style={{ x: widgets.tasks.x, y: widgets.tasks.y }}
          className="absolute z-20 pointer-events-auto cursor-grab active:cursor-grabbing"
        >
          <TasksWidget
            tasks={widgets.tasks.tasks}
            onChange={handleTasksChange}
            theme={theme}
            onClose={() => toggleWidget('tasks')}
          />
        </motion.div>
      )}

      {/* Network Activity Widget */}
      {widgets.network.visible && (
        <motion.div
          drag
          dragMomentum={false}
          onDragStart={handleDragStart}
          onDragEnd={(_, info) => handleDragEnd('network', info)}
          onMouseEnter={handleMouseEnterWidget}
          onMouseLeave={handleMouseLeaveWidget}
          style={{ x: widgets.network.x, y: widgets.network.y }}
          className="absolute z-20 pointer-events-auto cursor-grab active:cursor-grabbing"
        >
          <NetworkWidget theme={theme} onClose={() => toggleWidget('network')} />
        </motion.div>
      )}

      {/* Battery Status Widget */}
      {widgets.battery.visible && (
        <motion.div
          drag
          dragMomentum={false}
          onDragStart={handleDragStart}
          onDragEnd={(_, info) => handleDragEnd('battery', info)}
          onMouseEnter={handleMouseEnterWidget}
          onMouseLeave={handleMouseLeaveWidget}
          style={{ x: widgets.battery.x, y: widgets.battery.y }}
          className="absolute z-20 pointer-events-auto cursor-grab active:cursor-grabbing"
        >
          <BatteryWidget theme={theme} onClose={() => toggleWidget('battery')} />
        </motion.div>
      )}

      {/* Note Widget */}
      {widgets.note.visible && (
        <motion.div
          drag
          dragMomentum={false}
          onDragStart={handleDragStart}
          onDragEnd={(_, info) => handleDragEnd('note', info)}
          onMouseEnter={handleMouseEnterWidget}
          onMouseLeave={handleMouseLeaveWidget}
          style={{ x: widgets.note.x, y: widgets.note.y }}
          className="absolute z-20 pointer-events-auto cursor-grab active:cursor-grabbing"
        >
          <NoteWidget
            noteText={widgets.note.noteText}
            onTextChange={handleNoteChange}
            theme={theme}
            onClose={() => toggleWidget('note')}
          />
        </motion.div>
      )}

      {/* System Monitor Widget */}
      {widgets.system.visible && (
        <motion.div
          drag
          dragMomentum={false}
          onDragStart={handleDragStart}
          onDragEnd={(_, info) => handleDragEnd('system', info)}
          onMouseEnter={handleMouseEnterWidget}
          onMouseLeave={handleMouseLeaveWidget}
          style={{ x: widgets.system.x, y: widgets.system.y }}
          className="absolute z-20 pointer-events-auto cursor-grab active:cursor-grabbing"
        >
          <SystemMonitorWidget theme={theme} onClose={() => toggleWidget('system')} />
        </motion.div>
      )}

      {/* Live macOS Theme Customizer Modal */}
      {isThemeModalOpen && (
        <WidgetThemeModal
          theme={theme}
          onThemeChange={handleThemeChange}
          onClose={() => setIsThemeModalOpen(false)}
        />
      )}
    </div>
  );
};