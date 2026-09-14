import { runPowerShell } from './powershellHelper';

let isTaskbarHidden = false;

/**
 * Hides the native Windows 11 Taskbar using PowerShell Win32 API calls.
 */
export async function hideWindowsTaskbar(): Promise<boolean> {
  const script = `
    $code = @"
    using System;
    using System.Runtime.InteropServices;
    public class Taskbar {
      [DllImport("user32.dll")]
      public static extern IntPtr FindWindow(string lpClassName, string lpWindowName);
      [DllImport("user32.dll")]
      public static extern int ShowWindow(IntPtr hWnd, int nCmdShow);
      [DllImport("user32.dll")]
      public static extern bool SetWindowPos(IntPtr hWnd, IntPtr hWndInsertAfter, int X, int Y, int cx, int cy, uint uFlags);
    }
"@
    Add-Type -TypeDefinition $code -ErrorAction SilentlyContinue
    $hwnd = [Taskbar]::FindWindow("Shell_TrayWnd", $null)
    if ($hwnd -ne [IntPtr]::Zero) {
      [Taskbar]::ShowWindow($hwnd, 0)
    }
  `;

  try {
    await runPowerShell(script);
    isTaskbarHidden = true;
    return true;
  } catch (err) {
    console.error('Failed to hide Windows Taskbar:', err);
    return false;
  }
}

/**
 * Restores the native Windows 11 Taskbar.
 */
export async function showWindowsTaskbar(): Promise<boolean> {
  const script = `
    $code = @"
    using System;
    using System.Runtime.InteropServices;
    public class Taskbar {
      [DllImport("user32.dll")]
      public static extern IntPtr FindWindow(string lpClassName, string lpWindowName);
      [DllImport("user32.dll")]
      public static extern int ShowWindow(IntPtr hWnd, int nCmdShow);
    }
"@
    Add-Type -TypeDefinition $code -ErrorAction SilentlyContinue
    $hwnd = [Taskbar]::FindWindow("Shell_TrayWnd", $null)
    if ($hwnd -ne [IntPtr]::Zero) {
      [Taskbar]::ShowWindow($hwnd, 5)
    }
  `;

  try {
    await runPowerShell(script);
    isTaskbarHidden = false;
    return true;
  } catch (err) {
    console.error('Failed to show Windows Taskbar:', err);
    return false;
  }
}

export function getIsTaskbarHidden(): boolean {
  return isTaskbarHidden;
}
