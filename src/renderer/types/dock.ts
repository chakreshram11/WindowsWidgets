import { WidgetThemeSettings } from './theme';

export type DockPosition = 'bottom' | 'left' | 'right';

export interface WidgetState {
  id: string;
  visible: boolean;
  x: number;
  y: number;
}

export type ItemType =
  | 'app'
  | 'folder'
  | 'file'
  | 'url'
  | 'separator'
  | 'spacer'
  | 'trash';

export type StackDisplayMode = 'fan' | 'grid' | 'list';
export type HoverEffectType = 'none' | 'magnification' | 'scale' | 'glow' | 'bounce' | 'lift';
export type ClickAnimationType = 'none' | 'bounce' | 'pulse' | 'zoom' | 'shake';
export type AutoHideMode = 'never' | 'always' | 'intelligent';
export type WindowHideMode = 'never' | 'auto' | 'fullscreen_only';

export interface DockItemConfig {
  id: string;
  type: ItemType;
  label: string;
  tooltip?: string;
  icon?: string; // base64 or path or custom icon
  executablePath?: string;
  arguments?: string;
  folderPath?: string;
  url?: string;
  stackMode?: StackDisplayMode;
  isPinned?: boolean;
}

export interface DockAppearance {
  preset: 'macOS Dark' | 'macOS Light' | 'Clear Glass' | 'Frosted' | 'Minimal' | 'Custom';
  backgroundType: 'glass' | 'frosted' | 'solid' | 'gradient' | 'transparent';
  backgroundColor: string;
  transparency: number; // 0 to 100
  blur: number; // 0 to 50
  saturation: number; // 0 to 200
  brightness: number; // 0 to 200
  borderEnabled: boolean;
  borderThickness: number; // 0 to 10
  borderColor: string;
  borderOpacity: number; // 0 to 100
  borderRadius: number; // 0 to 40
  shadowEnabled: boolean;
  shadowBlur: number;
  shadowSpread: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
  shadowColor: string;
  iconEffect: 'none' | 'glow' | 'shadow' | 'reflection' | 'glass_reflection';
  iconEffectIntensity: number;
}

export interface DockMagnificationSettings {
  enabled: boolean;
  baseIconSize: number; // 24 to 96
  maxIconSize: number; // 48 to 160
  radius: number; // 80 to 300
  strength: number; // 1 to 3
  animationSpeed: number; // 100 to 500ms
  easing: string;
}

export interface DockLayoutSettings {
  position: DockPosition;
  monitorIndex: number;
  iconSpacing: number; // 2 to 24
  dockPadding: number; // 4 to 20
  bottomOffset?: number; // -20 to 60px
  showLabels: boolean;
  fontSize: number;
  fontWeight: string;
  labelPosition: 'top' | 'bottom' | 'side';
  showRunningIndicators: boolean;
  indicatorSize: number;
  indicatorColor: string;
  indicatorPosition: 'bottom' | 'top' | 'side';
}

export interface DockBehaviorSettings {
  autoHide: AutoHideMode;
  hideDelay: number; // ms
  revealSensitivity: number; // px edge offset
  hideOnMaximize: WindowHideMode;
  hoverEffect: HoverEffectType;
  clickAnimation: ClickAnimationType;
  startWithWindows: boolean;
}

export interface DockBadgeSettings {
  enabled: boolean;
  size: number;
  fontSize: number;
  position: 'top-right' | 'top-left';
  maxCount: number;
}

export interface DockProfile {
  id: string;
  name: string;
  items: DockItemConfig[];
  appearance: DockAppearance;
  magnification: DockMagnificationSettings;
  layout: DockLayoutSettings;
  behavior: DockBehaviorSettings;
  badges: DockBadgeSettings;
}

export interface DockSettings {
  activeProfileId: string;
  profiles: Record<string, DockProfile>;
  theme?: WidgetThemeSettings;
  widgets?: Record<string, WidgetState>;
}

export interface RunningAppInfo {
  pid: number;
  processName: string;
  executablePath?: string;
  mainWindowTitle?: string;
  windowCount: number;
  windows: Array<{
    hwnd: number;
    title: string;
    isMinimized: boolean;
  }>;
}

export interface RecycleBinStatus {
  isEmpty: boolean;
  itemCount: number;
  totalSize: number;
}

export interface FolderItemEntry {
  name: string;
  path: string;
  isDirectory: boolean;
  icon?: string;
  size?: number;
}
