import { contextBridge, ipcRenderer } from 'electron';
import { DockSettings, DockProfile, RunningAppInfo, RecycleBinStatus, FolderItemEntry } from '../renderer/types/dock';
import { SystemMetrics, BatteryMetrics, NetworkMetrics } from './win32/systemSensors';

const dockApi = {
  getSettings: (): Promise<DockSettings> => ipcRenderer.invoke('dock:get-settings'),
  saveSettings: (settings: DockSettings): Promise<boolean> => ipcRenderer.invoke('dock:save-settings', settings),
  saveProfile: (profile: Partial<DockProfile>): Promise<DockSettings> => ipcRenderer.invoke('dock:save-profile', profile),

  hideTaskbar: (): Promise<boolean> => ipcRenderer.invoke('dock:hide-taskbar'),
  showTaskbar: (): Promise<boolean> => ipcRenderer.invoke('dock:show-taskbar'),

  getRecycleBinStatus: (): Promise<RecycleBinStatus> => ipcRenderer.invoke('dock:get-recycle-bin-status'),
  emptyRecycleBin: (): Promise<boolean> => ipcRenderer.invoke('dock:empty-recycle-bin'),

  getRunningApps: (): Promise<RunningAppInfo[]> => ipcRenderer.invoke('dock:get-running-apps'),
  windowAction: (hwnd: number, action: 'activate' | 'minimize' | 'close'): Promise<boolean> =>
    ipcRenderer.invoke('dock:window-action', hwnd, action),

  extractIcon: (filePath: string): Promise<string | null> => ipcRenderer.invoke('dock:extract-icon', filePath),

  getSystemMetrics: (): Promise<SystemMetrics> => ipcRenderer.invoke('dock:get-system-metrics'),
  getBatteryMetrics: (): Promise<BatteryMetrics> => ipcRenderer.invoke('dock:get-battery-metrics'),
  getNetworkMetrics: (): Promise<NetworkMetrics> => ipcRenderer.invoke('dock:get-network-metrics'),

  launchApp: (pathOrCmd: string, args?: string): Promise<boolean> =>
    ipcRenderer.invoke('dock:launch-app', pathOrCmd, args),

  openFolder: (folderPath: string): Promise<boolean> =>
    ipcRenderer.invoke('dock:open-folder', folderPath),

  openUrl: (url: string): Promise<boolean> =>
    ipcRenderer.invoke('dock:open-url', url),

  readFolderContents: (folderPath: string): Promise<FolderItemEntry[]> =>
    ipcRenderer.invoke('dock:read-folder-contents', folderPath),

  pickFile: (filters?: { name: string; extensions: string[] }[]): Promise<string | null> =>
    ipcRenderer.invoke('dock:pick-file', filters),

  pickFolder: (): Promise<string | null> =>
    ipcRenderer.invoke('dock:pick-folder'),

  pickIconImage: (): Promise<string | null> =>
    ipcRenderer.invoke('dock:pick-icon-image'),

  exportConfig: (): Promise<boolean> => ipcRenderer.invoke('dock:export-config'),
  importConfig: (): Promise<DockSettings | null> => ipcRenderer.invoke('dock:import-config'),

  setIgnoreMouseEvents: (ignore: boolean, forward: boolean = false): void =>
    ipcRenderer.send('dock:set-ignore-mouse-events', ignore, forward),

  setWindowSize: (width: number, height: number): void =>
    ipcRenderer.send('dock:set-window-size', width, height),

  setWindowPosition: (x: number, y: number): void =>
    ipcRenderer.send('dock:set-window-position', x, y),

  onToggleWidgetsMenu: (callback: () => void): (() => void) => {
    const listener = () => callback();
    ipcRenderer.on('dock:toggle-widgets-menu', listener);
    return () => {
      ipcRenderer.removeListener('dock:toggle-widgets-menu', listener);
    };
  }
};

contextBridge.exposeInMainWorld('dockApi', dockApi);

export type DockApi = typeof dockApi;
