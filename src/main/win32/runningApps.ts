import koffi from 'koffi';
import { RunningAppInfo } from '../../renderer/types/dock';

let user32: any = null;
let kernel32: any = null;

let EnumWindowsProc: any = null;
let EnumWindows: any = null;
let IsWindowVisible: any = null;
let GetWindowTextW: any = null;
let GetWindowThreadProcessId: any = null;
let IsIconic: any = null;
let SetForegroundWindow: any = null;
let ShowWindow: any = null;
let SendMessageW: any = null;
let OpenProcess: any = null;
let QueryFullProcessImageNameW: any = null;
let CloseHandle: any = null;

try {
  user32 = koffi.load('user32.dll');
  kernel32 = koffi.load('kernel32.dll');

  EnumWindowsProc = koffi.proto('bool EnumWindowsProc(uintptr_t hwnd, intptr_t lParam)');
  EnumWindows = user32.func('bool EnumWindows(EnumWindowsProc *lpEnumFunc, intptr_t lParam)');
  IsWindowVisible = user32.func('bool IsWindowVisible(uintptr_t hwnd)');
  GetWindowTextW = user32.func('int GetWindowTextW(uintptr_t hwnd, _Out_ uint16 *lpString, int nMaxCount)');
  GetWindowThreadProcessId = user32.func('uint32 GetWindowThreadProcessId(uintptr_t hwnd, _Out_ uint32 *lpdwProcessId)');
  IsIconic = user32.func('bool IsIconic(uintptr_t hwnd)');
  SetForegroundWindow = user32.func('bool SetForegroundWindow(uintptr_t hwnd)');
  ShowWindow = user32.func('bool ShowWindow(uintptr_t hwnd, int nCmdShow)');
  SendMessageW = user32.func('uintptr_t SendMessageW(uintptr_t hwnd, uint32 Msg, uintptr_t wParam, uintptr_t lParam)');

  OpenProcess = kernel32.func('uintptr_t OpenProcess(uint32 dwDesiredAccess, bool bInheritHandle, uint32 dwProcessId)');
  QueryFullProcessImageNameW = kernel32.func('bool QueryFullProcessImageNameW(uintptr_t hProcess, uint32 dwFlags, _Out_ uint16 *lpExeName, _Inout_ uint32 *lpdwSize)');
  CloseHandle = kernel32.func('bool CloseHandle(uintptr_t hObject)');
} catch (err) {
  console.error('Failed to initialize Win32 runningApps koffi bindings:', err);
}

/**
 * Enumerates currently active running GUI applications natively with ZERO process spawns.
 */
export async function getRunningApps(): Promise<RunningAppInfo[]> {
  if (!EnumWindows || !IsWindowVisible) return [];

  const windowMap = new Map<number, {
    pid: number;
    processName: string;
    executablePath?: string;
    mainWindowTitle?: string;
    windows: { hwnd: number; title: string; isMinimized: boolean }[];
  }>();

  try {
    const enumCb = koffi.register((hwnd: number, lParam: number) => {
      if (IsWindowVisible(hwnd)) {
        const titleBuf = new Uint16Array(256);
        const len = GetWindowTextW(hwnd, titleBuf, 256);
        if (len > 0) {
          const title = String.fromCharCode(...titleBuf.slice(0, len)).trim();
          if (
            title &&
            title !== 'Program Manager' &&
            title !== 'Settings' &&
            title !== 'Windows Input Experience' &&
            title !== 'NVIDIA GeForce Overlay'
          ) {
            const pidBuf = [0];
            GetWindowThreadProcessId(hwnd, pidBuf);
            const pid = pidBuf[0];
            const isMinimized = Boolean(IsIconic(hwnd));

            if (!windowMap.has(pid)) {
              let exePath = '';
              let procName = '';

              const hProc = OpenProcess(0x1000 /* PROCESS_QUERY_LIMITED_INFORMATION */, false, pid);
              if (hProc) {
                const exeBuf = new Uint16Array(1024);
                const sizeBuf = [1024];
                if (QueryFullProcessImageNameW(hProc, 0, exeBuf, sizeBuf)) {
                  exePath = String.fromCharCode(...exeBuf.slice(0, sizeBuf[0]));
                  const parts = exePath.split('\\');
                  procName = parts[parts.length - 1].replace(/\.exe$/i, '');
                }
                CloseHandle(hProc);
              }

              windowMap.set(pid, {
                pid,
                processName: procName || 'App',
                executablePath: exePath || undefined,
                mainWindowTitle: title,
                windows: []
              });
            }

            const entry = windowMap.get(pid)!;
            entry.windows.push({ hwnd, title, isMinimized });
          }
        }
      }
      return true;
    }, koffi.pointer(EnumWindowsProc));

    EnumWindows(enumCb, 0);
    koffi.unregister(enumCb);
  } catch (e) {
    console.error('Error during EnumWindows:', e);
  }

  return Array.from(windowMap.values()).map((item) => ({
    pid: item.pid,
    processName: item.processName,
    executablePath: item.executablePath,
    mainWindowTitle: item.mainWindowTitle,
    windowCount: item.windows.length,
    windows: item.windows
  }));
}

/**
 * Activates, restores, minimizes, or closes a specific window HWND natively.
 */
export async function windowAction(hwnd: number, action: 'activate' | 'minimize' | 'close'): Promise<boolean> {
  if (!ShowWindow || !SetForegroundWindow || !SendMessageW) return false;

  try {
    if (action === 'activate') {
      ShowWindow(hwnd, 9 /* SW_RESTORE */);
      SetForegroundWindow(hwnd);
    } else if (action === 'minimize') {
      ShowWindow(hwnd, 6 /* SW_MINIMIZE */);
    } else if (action === 'close') {
      SendMessageW(hwnd, 0x0010 /* WM_CLOSE */, 0, 0);
    }
    return true;
  } catch (err) {
    return false;
  }
}
