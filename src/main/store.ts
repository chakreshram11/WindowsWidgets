import fs from 'fs';
import path from 'path';
import { app } from 'electron';
import { DockSettings, DockProfile, WidgetState } from '../renderer/types/dock';
import { MACOS_THEME_PRESETS } from '../renderer/types/theme';

const defaultWidgets: Record<string, WidgetState> = {
  clock: { id: 'clock', visible: true, x: 30, y: 30 },
  calendar: { id: 'calendar', visible: true, x: 310, y: 30 },
  timer: { id: 'timer', visible: true, x: 610, y: 30 },
  countdown: { id: 'countdown', visible: true, x: 890, y: 30 },
  tasks: { id: 'tasks', visible: true, x: 30, y: 230 },
  network: { id: 'network', visible: true, x: 610, y: 230 },
  battery: { id: 'battery', visible: true, x: 310, y: 440 },
  note: { id: 'note', visible: true, x: 610, y: 430 },
  system: { id: 'system', visible: true, x: 30, y: 670 }
};

const defaultProfile: DockProfile = {
  id: 'default',
  name: 'Default',
  items: [
    { id: '1', type: 'app', label: 'File Explorer', executablePath: 'explorer.exe', isPinned: true },
    { id: '2', type: 'app', label: 'Microsoft Edge', executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', isPinned: true },
    { id: '3', type: 'app', label: 'CMD Terminal', executablePath: 'cmd.exe', isPinned: true },
    { id: '4', type: 'separator', label: 'Separator' },
    { id: '5', type: 'folder', label: 'Downloads', folderPath: path.join(app.getPath('desktop') || 'C:\\', '..', 'Downloads'), stackMode: 'fan', isPinned: true },
    { id: '6', type: 'trash', label: 'Recycle Bin', isPinned: true }
  ],
  appearance: {
    preset: 'macOS Dark',
    backgroundType: 'glass',
    backgroundColor: 'rgba(28, 28, 30, 0.75)',
    transparency: 25,
    blur: 30,
    saturation: 140,
    brightness: 100,
    borderEnabled: true,
    borderThickness: 1,
    borderColor: '#ffffff',
    borderOpacity: 18,
    borderRadius: 22,
    shadowEnabled: true,
    shadowBlur: 30,
    shadowSpread: 0,
    shadowOffsetX: 0,
    shadowOffsetY: 15,
    shadowColor: 'rgba(0, 0, 0, 0.45)',
    iconEffect: 'none',
    iconEffectIntensity: 50
  },
  magnification: {
    enabled: true,
    baseIconSize: 52,
    maxIconSize: 92,
    radius: 180,
    strength: 1.8,
    animationSpeed: 200,
    easing: 'cubic-bezier(0.25, 1, 0.5, 1)'
  },
  layout: {
    position: 'bottom',
    monitorIndex: 0,
    iconSpacing: 8,
    dockPadding: 10,
    bottomOffset: -6,
    showLabels: true,
    fontSize: 12,
    fontWeight: '500',
    labelPosition: 'top',
    showRunningIndicators: true,
    indicatorSize: 4,
    indicatorColor: '#007AFF',
    indicatorPosition: 'bottom'
  },
  behavior: {
    autoHide: 'never',
    hideDelay: 300,
    revealSensitivity: 10,
    hideOnMaximize: 'never',
    hoverEffect: 'magnification',
    clickAnimation: 'bounce',
    startWithWindows: false
  },
  badges: {
    enabled: true,
    size: 18,
    fontSize: 11,
    position: 'top-right',
    maxCount: 99
  }
};

const workProfile: DockProfile = {
  ...defaultProfile,
  id: 'work',
  name: 'Work',
  items: [
    { id: 'w1', type: 'app', label: 'VS Code', executablePath: 'code.exe', isPinned: true },
    { id: 'w2', type: 'app', label: 'Terminal', executablePath: 'wt.exe', isPinned: true },
    { id: 'w3', type: 'url', label: 'GitHub', url: 'https://github.com', isPinned: true },
    { id: 'w4', type: 'separator', label: 'Separator' },
    { id: 'w5', type: 'folder', label: 'Documents', folderPath: app.getPath('documents'), stackMode: 'grid', isPinned: true },
    { id: 'w6', type: 'trash', label: 'Recycle Bin', isPinned: true }
  ]
};

const defaultSettings: DockSettings = {
  activeProfileId: 'default',
  profiles: {
    default: defaultProfile,
    work: workProfile
  },
  theme: MACOS_THEME_PRESETS['macOS Sonoma Dark'],
  widgets: defaultWidgets
};

export class StoreManager {
  private filePath: string;
  private settings: DockSettings;

  constructor() {
    const userDataPath = app.getPath('userData');
    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath, { recursive: true });
    }
    this.filePath = path.join(userDataPath, 'dock_config.json');
    this.settings = this.load();
  }

  private load(): DockSettings {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          ...defaultSettings,
          ...parsed,
          theme: parsed.theme ? { ...defaultSettings.theme, ...parsed.theme } : defaultSettings.theme,
          widgets: parsed.widgets ? { ...defaultSettings.widgets, ...parsed.widgets } : defaultSettings.widgets
        };
      }
    } catch (err) {
      console.error('Failed to read config file, resetting to default:', err);
    }
    return defaultSettings;
  }

  public save(newSettings: DockSettings): void {
    this.settings = newSettings;
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.settings, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save config file:', err);
    }
  }

  public getSettings(): DockSettings {
    return this.settings;
  }

  public getActiveProfile(): DockProfile {
    const profile = this.settings.profiles[this.settings.activeProfileId];
    return profile || this.settings.profiles['default'];
  }

  public updateActiveProfile(profile: Partial<DockProfile>): DockSettings {
    const current = this.getActiveProfile();
    const updated = { ...current, ...profile };
    this.settings.profiles[this.settings.activeProfileId] = updated;
    this.save(this.settings);
    return this.settings;
  }
}

export const store = new StoreManager();
