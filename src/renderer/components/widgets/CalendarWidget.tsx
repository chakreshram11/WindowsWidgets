import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { WidgetThemeSettings, getWidgetCardStyle } from '../../types/theme';

interface CalendarWidgetProps {
  theme?: WidgetThemeSettings;
  onClose?: () => void;
}

export const CalendarWidget: React.FC<CalendarWidgetProps> = ({ theme, onClose }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const days: { day: number; isCurrentMonth: boolean; isToday?: boolean }[] = [];

  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    days.push({ day: prevMonthDays - i, isCurrentMonth: false });
  }

  const today = new Date();
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
    days.push({ day: d, isCurrentMonth: true, isToday });
  }

  const remainingCells = 42 - days.length;
  for (let n = 1; n <= remainingCells; n++) {
    days.push({ day: n, isCurrentMonth: false });
  }

  const textColor = theme?.textColor || '#ffffff';
  const subtextColor = theme?.subtextColor || '#9ca3af';
  const accentColor = theme?.accentColor || '#007AFF';

  const cardStyle = getWidgetCardStyle(theme);

  return (
    <div
      style={cardStyle}
      className="text-white shadow-2xl p-4 w-72 flex flex-col select-none transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold" style={{ color: subtextColor }}>Calendar</span>
        {onClose && (
          <button onClick={onClose} className="p-1 rounded-md hover:bg-white/10" style={{ color: subtextColor }}>
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Month/Year Navigation */}
      <div className="flex items-center justify-between bg-white/5 rounded-xl px-2 py-1 mb-3">
        <button onClick={handlePrevMonth} className="p-1 hover:bg-white/10 rounded-lg" style={{ color: textColor }}>
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-xs font-semibold" style={{ color: textColor }}>
          {monthNames[month]} {year}
        </span>
        <button onClick={handleNextMonth} className="p-1 hover:bg-white/10 rounded-lg" style={{ color: textColor }}>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Days of Week */}
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold mb-1" style={{ color: subtextColor }}>
        <span className="text-red-400">Sun</span>
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span className="text-red-400">Sat</span>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {days.map((item, index) => {
          const isSunday = index % 7 === 0;
          return (
            <div
              key={index}
              style={item.isToday ? { backgroundColor: accentColor, color: '#ffffff' } : {}}
              className={`py-1 rounded-lg font-medium transition-all ${
                item.isToday
                  ? 'font-bold shadow-md'
                  : !item.isCurrentMonth
                  ? 'opacity-30'
                  : isSunday
                  ? 'text-red-400 hover:bg-white/10'
                  : 'hover:bg-white/10'
              }`}
            >
              {item.day}
            </div>
          );
        })}
      </div>
    </div>
  );
};
