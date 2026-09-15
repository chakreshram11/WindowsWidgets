import React, { useState, useEffect } from 'react';
import { X, Plus, Check } from 'lucide-react';
import { WidgetThemeSettings, getWidgetCardStyle } from '../../types/theme';
import { TaskItem } from '../../types/dock';

interface TasksWidgetProps {
  tasks?: TaskItem[];
  onChange?: (tasks: TaskItem[]) => void;
  theme?: WidgetThemeSettings;
  onClose?: () => void;
}

const defaultInitialTasks: TaskItem[] = [
  { id: '1', text: 'CRTA', completed: false },
  { id: '2', text: 'Security +', completed: false },
  { id: '3', text: 'ISC2', completed: false }
];

export const TasksWidget: React.FC<TasksWidgetProps> = ({ tasks: propTasks, onChange, theme, onClose }) => {
  const [tasks, setTasks] = useState<TaskItem[]>(propTasks || defaultInitialTasks);

  useEffect(() => {
    if (propTasks) {
      setTasks(propTasks);
    }
  }, [propTasks]);

  const [newTaskText, setNewTaskText] = useState('');

  const handleAddTask = () => {
    if (!newTaskText.trim()) return;
    const item: TaskItem = {
      id: String(Date.now()),
      text: newTaskText.trim(),
      completed: false
    };
    const updated = [...tasks, item];
    setTasks(updated);
    setNewTaskText('');
    onChange?.(updated);
  };

  const handleToggleTask = (id: string) => {
    const updated = tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
    setTasks(updated);
    onChange?.(updated);
  };

  const handleDeleteTask = (id: string) => {
    const updated = tasks.filter((t) => t.id !== id);
    setTasks(updated);
    onChange?.(updated);
  };

  const textColor = theme?.textColor || '#ffffff';
  const subtextColor = theme?.subtextColor || '#9ca3af';
  const accentColor = theme?.accentColor || '#007AFF';

  const cardStyle = getWidgetCardStyle(theme);

  const uncompletedTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);
  const sortedTasks = [...uncompletedTasks, ...completedTasks];

  return (
    <div
      style={cardStyle}
      className="text-white shadow-2xl p-4 w-64 flex flex-col select-none transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold" style={{ color: subtextColor }}>Tasks</span>
        {onClose && (
          <button onClick={onClose} className="p-1 rounded-md hover:bg-white/10" style={{ color: subtextColor }}>
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Input row */}
      <div className="flex gap-1.5 mb-3">
        <input
          type="text"
          placeholder="Add a task..."
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          style={{ color: textColor }}
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs placeholder-gray-500 focus:outline-none focus:border-blue-500 cursor-text select-text pointer-events-auto"
        />
        <button
          onClick={handleAddTask}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          style={{ backgroundColor: accentColor }}
          className="text-white rounded-xl px-2.5 py-1.5 flex items-center justify-center transition-colors shadow-md hover:opacity-90"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Task items list */}
      <div className="flex flex-col gap-2">
        {sortedTasks.map((task) => (
          <div
            key={task.id}
            onClick={() => handleToggleTask(task.id)}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            className="flex items-center justify-between p-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 cursor-pointer group transition-all"
          >
            <div className="flex items-center gap-2">
              <div
                style={task.completed ? { backgroundColor: accentColor, borderColor: accentColor } : {}}
                className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                  task.completed ? 'text-white' : 'border-gray-500 bg-transparent'
                }`}
              >
                {task.completed && <Check className="w-3 h-3" />}
              </div>
              <span style={{ color: task.completed ? subtextColor : textColor }} className={`text-xs ${task.completed ? 'line-through opacity-60' : ''}`}>
                {task.text}
              </span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteTask(task.id);
              }}
              className="text-gray-400 hover:text-red-400 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
