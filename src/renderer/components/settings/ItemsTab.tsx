import React, { useState } from 'react';
import { DockItemConfig } from '../../types/dock';
import { Plus, FolderPlus, Globe, Minus, Trash2, Edit2, MoveUp, MoveDown } from 'lucide-react';

interface ItemsTabProps {
  items: DockItemConfig[];
  onChange: (items: DockItemConfig[]) => void;
}

export const ItemsTab: React.FC<ItemsTabProps> = ({ items, onChange }) => {
  const [urlInput, setUrlInput] = useState('');
  const [urlLabel, setUrlLabel] = useState('');
  const [showUrlForm, setShowUrlForm] = useState(false);

  const handleAddApp = async () => {
    const file = await window.dockApi.pickFile();
    if (!file) return;
    const name = file.split('\\').pop()?.replace('.exe', '').replace('.lnk', '') || 'Application';
    const icon = await window.dockApi.extractIcon(file);

    const newItem: DockItemConfig = {
      id: String(Date.now()),
      type: 'app',
      label: name,
      executablePath: file,
      icon: icon || undefined
    };
    onChange([...items, newItem]);
  };

  const handleAddFolder = async () => {
    const folder = await window.dockApi.pickFolder();
    if (!folder) return;
    const name = folder.split('\\').pop() || 'Folder';

    const newItem: DockItemConfig = {
      id: String(Date.now()),
      type: 'folder',
      label: name,
      folderPath: folder,
      stackMode: 'fan'
    };
    onChange([...items, newItem]);
  };

  const handleAddSeparator = () => {
    const newItem: DockItemConfig = {
      id: String(Date.now()),
      type: 'separator',
      label: 'Separator'
    };
    onChange([...items, newItem]);
  };

  const handleAddUrl = () => {
    if (!urlInput) return;
    const newItem: DockItemConfig = {
      id: String(Date.now()),
      type: 'url',
      label: urlLabel || urlInput,
      url: urlInput.startsWith('http') ? urlInput : `https://${urlInput}`
    };
    onChange([...items, newItem]);
    setUrlInput('');
    setUrlLabel('');
    setShowUrlForm(false);
  };

  const handleRemove = (id: string) => {
    onChange(items.filter((i) => i.id !== id));
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    const updated = [...items];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    onChange(updated);
  };

  return (
    <div className="flex flex-col gap-6 text-sm text-gray-200">
      {/* Action Buttons */}
      <div className="grid grid-cols-4 gap-2">
        <button
          onClick={handleAddApp}
          className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-all shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Add App</span>
        </button>

        <button
          onClick={handleAddFolder}
          className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs transition-all shadow-md"
        >
          <FolderPlus className="w-4 h-4" />
          <span>Add Folder</span>
        </button>

        <button
          onClick={() => setShowUrlForm(!showUrlForm)}
          className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs transition-all shadow-md"
        >
          <Globe className="w-4 h-4" />
          <span>Add URL</span>
        </button>

        <button
          onClick={handleAddSeparator}
          className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-medium text-xs transition-all shadow-md"
        >
          <Minus className="w-4 h-4" />
          <span>Separator</span>
        </button>
      </div>

      {/* Add URL Form */}
      {showUrlForm && (
        <div className="flex flex-col gap-2 p-3 bg-white/5 rounded-xl border border-white/10">
          <input
            type="text"
            placeholder="URL (e.g. https://github.com)"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="px-3 py-1.5 bg-gray-950 border border-white/10 rounded-lg text-xs text-white"
          />
          <input
            type="text"
            placeholder="Label (e.g. GitHub)"
            value={urlLabel}
            onChange={(e) => setUrlLabel(e.target.value)}
            className="px-3 py-1.5 bg-gray-950 border border-white/10 rounded-lg text-xs text-white"
          />
          <button
            onClick={handleAddUrl}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-semibold text-white self-end"
          >
            Save Shortcut
          </button>
        </div>
      )}

      {/* Current Dock Items List */}
      <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-all"
          >
            <div className="flex items-center gap-3">
              {item.icon ? (
                <img src={item.icon} alt="" className="w-6 h-6 object-contain" />
              ) : (
                <div className="w-6 h-6 rounded bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs">
                  {item.label.charAt(0)}
                </div>
              )}
              <div className="flex flex-col">
                <span className="font-medium text-white text-xs">{item.label}</span>
                <span className="text-[10px] text-gray-400 capitalize">{item.type}</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => handleMove(index, 'up')}
                disabled={index === 0}
                className="p-1 text-gray-400 hover:text-white disabled:opacity-30"
              >
                <MoveUp className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleMove(index, 'down')}
                disabled={index === items.length - 1}
                className="p-1 text-gray-400 hover:text-white disabled:opacity-30"
              >
                <MoveDown className="w-3.5 h-3.5" />
              </button>
              {item.type !== 'trash' && (
                <button
                  onClick={() => handleRemove(item.id)}
                  className="p-1 text-red-400 hover:text-red-300 ml-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
