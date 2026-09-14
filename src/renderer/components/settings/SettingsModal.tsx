import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DockSettings, DockProfile } from '../../types/dock';
import { AppearanceTab } from './AppearanceTab';
import { LayoutTab } from './LayoutTab';
import { MagnificationTab } from './MagnificationTab';
import { BehaviorTab } from './BehaviorTab';
import { ItemsTab } from './ItemsTab';
import { ProfilesTab } from './ProfilesTab';
import { X, Palette, Layout, Maximize2, MousePointer, List, Users, ShieldAlert } from 'lucide-react';

interface SettingsModalProps {
  settings: DockSettings;
  activeProfile: DockProfile;
  onClose: () => void;
  onSaveProfile: (profile: Partial<DockProfile>) => void;
  onSaveSettings: (settings: DockSettings) => void;
}

type TabType = 'appearance' | 'layout' | 'magnification' | 'behavior' | 'items' | 'profiles';

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  activeProfile,
  onClose,
  onSaveProfile,
  onSaveSettings
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('appearance');

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'appearance', label: 'Appearance', icon: <Palette className="w-4 h-4" /> },
    { id: 'layout', label: 'Position & Size', icon: <Layout className="w-4 h-4" /> },
    { id: 'magnification', label: 'Magnification', icon: <Maximize2 className="w-4 h-4" /> },
    { id: 'behavior', label: 'Behavior', icon: <MousePointer className="w-4 h-4" /> },
    { id: 'items', label: 'Dock Items', icon: <List className="w-4 h-4" /> },
    { id: 'profiles', label: 'Profiles & Backup', icon: <Users className="w-4 h-4" /> }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md pointer-events-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-gray-900/95 text-white border border-white/20 rounded-2xl shadow-2xl w-[720px] h-[520px] flex flex-col overflow-hidden"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-red-500 cursor-pointer" onClick={onClose} />
              <div className="w-3 h-3 rounded-full bg-amber-500 cursor-pointer" />
              <div className="w-3 h-3 rounded-full bg-emerald-500 cursor-pointer" />
              <span className="font-semibold text-sm ml-2">Dock Settings</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Main Body */}
          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar Navigation */}
            <div className="w-48 bg-gray-950/60 border-r border-white/10 p-3 flex flex-col gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 p-6 overflow-y-auto">
              {activeTab === 'appearance' && (
                <AppearanceTab
                  appearance={activeProfile.appearance}
                  onChange={(app) => onSaveProfile({ appearance: app })}
                />
              )}
              {activeTab === 'layout' && (
                <LayoutTab
                  layout={activeProfile.layout}
                  onChange={(lay) => onSaveProfile({ layout: lay })}
                />
              )}
              {activeTab === 'magnification' && (
                <MagnificationTab
                  magnification={activeProfile.magnification}
                  onChange={(mag) => onSaveProfile({ magnification: mag })}
                />
              )}
              {activeTab === 'behavior' && (
                <BehaviorTab
                  behavior={activeProfile.behavior}
                  onChange={(beh) => onSaveProfile({ behavior: beh })}
                />
              )}
              {activeTab === 'items' && (
                <ItemsTab
                  items={activeProfile.items}
                  onChange={(items) => onSaveProfile({ items })}
                />
              )}
              {activeTab === 'profiles' && (
                <ProfilesTab
                  settings={settings}
                  onSaveSettings={onSaveSettings}
                />
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
