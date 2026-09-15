import React, { useState, useEffect } from 'react';
import { X, Edit3 } from 'lucide-react';
import { WidgetThemeSettings, getWidgetCardStyle } from '../../types/theme';

interface NoteWidgetProps {
  noteText?: string;
  onTextChange?: (text: string) => void;
  theme?: WidgetThemeSettings;
  onClose?: () => void;
}

export const NoteWidget: React.FC<NoteWidgetProps> = ({
  noteText = 'Stay curious. Keep building.',
  onTextChange,
  theme,
  onClose
}) => {
  const [text, setText] = useState(noteText);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (noteText !== undefined && !isEditing) {
      setText(noteText);
    }
  }, [noteText, isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    onTextChange?.(text);
  };

  const handleToggleEdit = () => {
    if (isEditing) {
      setIsEditing(false);
      onTextChange?.(text);
    } else {
      setIsEditing(true);
    }
  };

  const textColor = theme?.textColor || '#fef08a';
  const subtextColor = theme?.subtextColor || '#9ca3af';

  const cardStyle = getWidgetCardStyle(theme);

  return (
    <div
      style={cardStyle}
      className="text-white shadow-2xl p-4 w-64 flex flex-col justify-between select-none transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold" style={{ color: subtextColor }}>Note</span>
        <div className="flex items-center gap-1">
          <button
            onClick={handleToggleEdit}
            className="p-1 rounded-md hover:bg-white/10"
            style={{ color: subtextColor }}
            title="Edit Note"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          {onClose && (
            <button onClick={onClose} className="p-1 rounded-md hover:bg-white/10" style={{ color: subtextColor }}>
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="my-3 flex items-center justify-center text-center">
        {isEditing ? (
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={handleBlur}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            rows={3}
            style={{ color: textColor }}
            className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-sm italic font-serif text-center focus:outline-none focus:border-amber-400 resize-none cursor-text select-text pointer-events-auto"
            autoFocus
          />
        ) : (
          <p
            onClick={() => setIsEditing(true)}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            style={{ color: textColor }}
            className="text-sm italic font-serif cursor-pointer hover:opacity-80 transition-colors px-2 leading-relaxed"
          >
            "{text}"
          </p>
        )}
      </div>
    </div>
  );
};
