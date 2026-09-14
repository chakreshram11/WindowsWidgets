import { useState, useCallback, useEffect } from 'react';
import { DockSettings, DockProfile } from '../types/dock';

declare global {
  interface Window {
    dockApi: import('../../main/preload').DockApi;
  }
}

export function useDockSettings() {
  const [settings, setSettings] = useState<DockSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const data = await window.dockApi.getSettings();
      setSettings(data);
    } catch (err) {
      console.error('Failed to load dock settings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const saveSettings = useCallback(async (newSettings: DockSettings) => {
    setSettings(newSettings);
    await window.dockApi.saveSettings(newSettings);
  }, []);

  const updateActiveProfile = useCallback(async (partialProfile: Partial<DockProfile>) => {
    const updated = await window.dockApi.saveProfile(partialProfile);
    setSettings(updated);
  }, []);

  return {
    settings,
    loading,
    fetchSettings,
    saveSettings,
    updateActiveProfile
  };
}
