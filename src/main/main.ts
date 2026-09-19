import { app, BrowserWindow, ipcMain, dialog, screen, globalShortcut } from 'electron';
import path from 'path';
import fs from 'fs';
import { store } from './store';
import { showWindowsTaskbar } from './win32/taskbar';
import { pinWindowToDesktop } from './win32/desktopPin';
import {
  getSystemMetrics,
  getMemoryStats,
  cleanMemory,
  getBatteryMetrics,
  getNetworkMetrics
} from './win32/systemSensors';
import { DockSettings } from '../renderer/types/dock';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.bounds;

  mainWindow = new BrowserWindow({
    width: width,
    height: height,
    x: 0,
    y: 0,
    type: 'toolbar',
    frame: false,
    transparent: true,
    alwaysOnTop: false,
    skipTaskbar: true,
    resizable: false,
    minimizable: false,
    focusable: true,
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    }
  });

  // Pin window to Windows Desktop WorkerW layer so Win+D ("Show Desktop") and Win+M do not minimize it
  if (process.platform === 'win32') {
    const handle = mainWindow.getNativeWindowHandle();
    const hwndStr = process.arch === 'x64'
      ? handle.readBigInt64LE(0).toString()
      : handle.readInt32LE(0).toString();
    pinWindowToDesktop(hwndStr).catch((err) => {
      console.error('Failed pinning window to desktop:', err);
    });
  }

  // Prevent window from minimizing when Win+D (Show Desktop) or Win+M is pressed
  (mainWindow as any).on('minimize', (e: any) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    setTimeout(() => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.restore();
        mainWindow.showInactive();
      }
    }, 50);
  });

  mainWindow.on('hide', () => {
    setTimeout(() => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.showInactive();
      }
    }, 50);
  });

  // Keep transparent overlay click-through by default
  mainWindow.setIgnoreMouseEvents(true, { forward: true });

  // Ensure Windows 11 Taskbar remains visible as usual
  showWindowsTaskbar();

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    showWindowsTaskbar();
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  // Automatically launch app when Windows starts up
  if (process.platform === 'win32') {
    app.setLoginItemSettings({
      openAtLogin: true,
      path: app.getPath('exe')
    });
  }

  createWindow();

  // Register global shortcuts for Windows Copilot Key (Win+Shift+F23) to toggle Widgets Menu
  const copilotShortcuts = [
    'Super+Shift+F23',
    'Meta+Shift+F23',
    'Win+Shift+F23',
    'CommandOrControl+Shift+F23',
    'F23',
    'F24',
    'CommandOrControl+Shift+W'
  ];

  copilotShortcuts.forEach((shortcut) => {
    try {
      globalShortcut.register(shortcut, () => {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('dock:toggle-widgets-menu');
        }
      });
    } catch (err) {
      // Ignored if shortcut is not supported on current environment
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  showWindowsTaskbar();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  showWindowsTaskbar();
  globalShortcut.unregisterAll();
});

// IPC Handlers
ipcMain.handle('dock:get-settings', () => {
  return store.getSettings();
});

ipcMain.handle('dock:save-settings', (_, settings: DockSettings) => {
  store.save(settings);
  return true;
});

ipcMain.handle('dock:get-system-metrics', async () => {
  return await getSystemMetrics();
});

ipcMain.handle('memory:get-stats', () => {
  return getMemoryStats();
});

ipcMain.handle('memory:clean', async () => {
  return await cleanMemory();
});

ipcMain.handle('dock:get-battery-metrics', async () => {
  return await getBatteryMetrics();
});

ipcMain.handle('dock:get-network-metrics', async () => {
  return await getNetworkMetrics();
});

ipcMain.handle('dock:export-config', async () => {
  if (!mainWindow) return false;
  const result = await dialog.showSaveDialog(mainWindow, {
    title: 'Export Widget Configuration',
    defaultPath: 'widget-config.json',
    filters: [{ name: 'JSON Config', extensions: ['json'] }]
  });
  if (result.canceled || !result.filePath) return false;
  fs.writeFileSync(result.filePath, JSON.stringify(store.getSettings(), null, 2), 'utf-8');
  return true;
});

ipcMain.handle('dock:import-config', async () => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [{ name: 'JSON Config', extensions: ['json'] }]
  });
  if (result.canceled || result.filePaths.length === 0) return null;
  try {
    const content = fs.readFileSync(result.filePaths[0], 'utf-8');
    const parsed = JSON.parse(content);
    store.save(parsed);
    return parsed;
  } catch (e) {
    return null;
  }
});

ipcMain.on('dock:set-ignore-mouse-events', (_, ignore: boolean, forward: boolean) => {
  if (mainWindow) {
    mainWindow.setIgnoreMouseEvents(ignore, { forward });
  }
});
