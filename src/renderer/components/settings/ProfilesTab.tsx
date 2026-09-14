import React, { useState } from 'react';
import { DockSettings } from '../../types/dock';
import { UserCheck, Plus, Copy, Trash2, Download, Upload, RotateCcw } from 'lucide-react';

interface ProfilesTabProps {
  settings: DockSettings;
  onSaveSettings: (settings: DockSettings) => void;
}

export const ProfilesTab: React.FC<ProfilesTabProps> = ({ settings, onSaveSettings }) => {
  const [newProfileName, setNewProfileName] = useState('');

  const activeId = settings.activeProfileId;
  const profiles = settings.profiles;

  const handleSwitchProfile = (id: string) => {
    onSaveSettings({
      ...settings,
      activeProfileId: id
    });
  };

  const handleCreateProfile = () => {
    if (!newProfileName) return;
    const newId = `profile_${Date.now()}`;
    const activeProf = profiles[activeId];

    const newProfiles = {
      ...profiles,
      [newId]: {
        ...activeProf,
        id: newId,
        name: newProfileName
      }
    };

    onSaveSettings({
      ...settings,
      activeProfileId: newId,
      profiles: newProfiles
    });
    setNewProfileName('');
  };

  const handleDeleteProfile = (id: string) => {
    if (Object.keys(profiles).length <= 1) return;
    const newProfiles = { ...profiles };
    delete newProfiles[id];
    const fallbackId = Object.keys(newProfiles)[0];

    onSaveSettings({
      activeProfileId: activeId === id ? fallbackId : activeId,
      profiles: newProfiles
    });
  };

  const handleExport = async () => {
    await window.dockApi.exportConfig();
  };

  const handleImport = async () => {
    const imported = await window.dockApi.importConfig();
    if (imported) {
      onSaveSettings(imported);
    }
  };

  return (
    <div className="flex flex-col gap-6 text-sm text-gray-200">
      {/* Profiles List */}
      <div>
        <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-blue-400" />
          <span>Active Profiles</span>
        </h4>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {Object.values(profiles).map((prof) => (
            <div
              key={prof.id}
              onClick={() => handleSwitchProfile(prof.id)}
              className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                activeId === prof.id
                  ? 'bg-blue-600/30 border-blue-400 text-white shadow-lg'
                  : 'bg-white/5 border-white/10 hover:bg-white/15 text-gray-300'
              }`}
            >
              <div className="flex flex-col">
                <span className="font-semibold text-sm">{prof.name}</span>
                <span className="text-[10px] text-gray-400">{prof.items.length} Dock items</span>
              </div>

              {Object.keys(profiles).length > 1 && prof.id !== 'default' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteProfile(prof.id);
                  }}
                  className="p-1 text-red-400 hover:text-red-300 hover:bg-white/10 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Create Profile */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="New Profile Name (e.g. Gaming)"
            value={newProfileName}
            onChange={(e) => setNewProfileName(e.target.value)}
            className="flex-1 px-3 py-2 bg-gray-950 border border-white/10 rounded-xl text-xs text-white"
          />
          <button
            onClick={handleCreateProfile}
            className="flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-semibold text-white"
          >
            <Plus className="w-4 h-4" />
            <span>Create Profile</span>
          </button>
        </div>
      </div>

      {/* Export / Import */}
      <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
        <h4 className="font-semibold text-white">Backup & Portability</h4>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-2 p-3 bg-white/5 hover:bg-white/15 border border-white/10 rounded-xl font-medium text-xs text-gray-200 transition-all"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export Configuration</span>
          </button>

          <button
            onClick={handleImport}
            className="flex items-center justify-center gap-2 p-3 bg-white/5 hover:bg-white/15 border border-white/10 rounded-xl font-medium text-xs text-gray-200 transition-all"
          >
            <Upload className="w-4 h-4 text-blue-400" />
            <span>Import Configuration</span>
          </button>
        </div>
      </div>
    </div>
  );
};
