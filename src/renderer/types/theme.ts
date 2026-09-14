export type macOSPresetName =
  | 'macOS Sonoma Dark'
  | 'macOS Sonoma Light'
  | 'macOS Vibrant Glass'
  | 'Clear Glass'
  | 'Deep Midnight'
  | 'Custom';

export type ThemeMode = 'dark' | 'light';

export interface WidgetThemeSettings {
  preset: macOSPresetName;
  mode: ThemeMode;
  backgroundColor: string;
  transparency: number; // 0 to 100
  blur: number; // 0 to 50
  borderRadius: number; // 8 to 32
  borderEnabled: boolean;
  borderThickness: number; // 1 to 4
  borderColor: string;
  borderOpacity: number; // 0 to 100
  accentColor: string; // hex
  textColor: string;
  subtextColor: string;
}

export const APPLE_ACCENT_COLORS = [
  { name: 'Apple Blue', hex: '#007AFF' },
  { name: 'Apple Purple', hex: '#AF52DE' },
  { name: 'Apple Pink', hex: '#FF2D55' },
  { name: 'Apple Green', hex: '#34C759' },
  { name: 'Apple Orange', hex: '#FF9500' },
  { name: 'Apple Cyan', hex: '#00C7BE' },
  { name: 'Apple Gold', hex: '#FFCC00' }
];

export const MACOS_THEME_PRESETS: Record<macOSPresetName, WidgetThemeSettings> = {
  'macOS Sonoma Dark': {
    preset: 'macOS Sonoma Dark',
    mode: 'dark',
    backgroundColor: 'rgba(22, 28, 36, 0.85)',
    transparency: 15,
    blur: 30,
    borderRadius: 20,
    borderEnabled: true,
    borderThickness: 1,
    borderColor: '#ffffff',
    borderOpacity: 15,
    accentColor: '#007AFF',
    textColor: '#ffffff',
    subtextColor: '#9ca3af'
  },
  'macOS Sonoma Light': {
    preset: 'macOS Sonoma Light',
    mode: 'light',
    backgroundColor: 'rgba(242, 243, 248, 0.85)',
    transparency: 15,
    blur: 30,
    borderRadius: 20,
    borderEnabled: true,
    borderThickness: 1,
    borderColor: '#000000',
    borderOpacity: 12,
    accentColor: '#007AFF',
    textColor: '#1d1d1f',
    subtextColor: '#6e6e73'
  },
  'macOS Vibrant Glass': {
    preset: 'macOS Vibrant Glass',
    mode: 'dark',
    backgroundColor: 'rgba(35, 25, 55, 0.8)',
    transparency: 20,
    blur: 40,
    borderRadius: 22,
    borderEnabled: true,
    borderThickness: 1,
    borderColor: '#AF52DE',
    borderOpacity: 30,
    accentColor: '#AF52DE',
    textColor: '#ffffff',
    subtextColor: '#d8b4fe'
  },
  'Clear Glass': {
    preset: 'Clear Glass',
    mode: 'dark',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    transparency: 88,
    blur: 15,
    borderRadius: 18,
    borderEnabled: true,
    borderThickness: 1,
    borderColor: '#ffffff',
    borderOpacity: 25,
    accentColor: '#00C7BE',
    textColor: '#ffffff',
    subtextColor: '#cbd5e1'
  },
  'Deep Midnight': {
    preset: 'Deep Midnight',
    mode: 'dark',
    backgroundColor: 'rgba(10, 14, 23, 0.92)',
    transparency: 8,
    blur: 35,
    borderRadius: 24,
    borderEnabled: true,
    borderThickness: 1,
    borderColor: '#38bdf8',
    borderOpacity: 20,
    accentColor: '#38bdf8',
    textColor: '#ffffff',
    subtextColor: '#94a3b8'
  },
  'Custom': {
    preset: 'Custom',
    mode: 'dark',
    backgroundColor: 'rgba(22, 28, 36, 0.85)',
    transparency: 15,
    blur: 30,
    borderRadius: 20,
    borderEnabled: true,
    borderThickness: 1,
    borderColor: '#ffffff',
    borderOpacity: 15,
    accentColor: '#007AFF',
    textColor: '#ffffff',
    subtextColor: '#9ca3af'
  }
};

/**
 * Converts a hex (#fff, #ffffff) or rgb/rgba string into an rgba string with a specific opacity percentage (0-100).
 */
export function parseColorWithAlpha(colorStr: string, opacityPct: number): string {
  if (!colorStr) return `rgba(255, 255, 255, ${opacityPct / 100})`;

  const alpha = Math.max(0, Math.min(1, opacityPct / 100));

  // Match rgba / rgb
  const rgbaMatch = colorStr.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)/i);
  if (rgbaMatch) {
    const [, r, g, b] = rgbaMatch;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  // Match Hex
  if (colorStr.startsWith('#')) {
    let hex = colorStr.slice(1);
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }
    if (hex.length === 6) {
      const num = parseInt(hex, 16);
      if (!isNaN(num)) {
        const r = (num >> 16) & 255;
        const g = (num >> 8) & 255;
        const b = num & 255;
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      }
    }
  }

  return colorStr;
}

/**
 * Returns consistent, reactive card styles for any desktop widget based on the active WidgetThemeSettings.
 */
export function getWidgetCardStyle(theme?: WidgetThemeSettings): React.CSSProperties {
  const currentTheme = theme || MACOS_THEME_PRESETS['macOS Sonoma Dark'];

  // Transparency slider (0% to 90%): calculate background alpha percentage
  const transparency = currentTheme.transparency ?? 15;
  const bgAlphaPct = Math.max(5, 100 - transparency);
  const backgroundColor = parseColorWithAlpha(currentTheme.backgroundColor || 'rgba(22, 28, 36, 0.85)', bgAlphaPct);

  // Border opacity & color
  const borderOpacity = currentTheme.borderOpacity ?? 15;
  const borderColor = parseColorWithAlpha(currentTheme.borderColor || '#ffffff', borderOpacity);

  // Border thickness & enabling
  const borderEnabled = currentTheme.borderEnabled !== false;
  const borderThickness = borderEnabled ? (currentTheme.borderThickness ?? 1) : 0;

  // Squircle Radius & Blur
  const borderRadius = currentTheme.borderRadius ?? 20;
  const blur = currentTheme.blur ?? 30;

  return {
    backgroundColor,
    borderRadius: `${borderRadius}px`,
    backdropFilter: `blur(${blur}px)`,
    WebkitBackdropFilter: `blur(${blur}px)`,
    borderColor: borderThickness > 0 ? borderColor : 'transparent',
    borderWidth: `${borderThickness}px`,
    borderStyle: borderThickness > 0 ? 'solid' : 'none'
  };
}
