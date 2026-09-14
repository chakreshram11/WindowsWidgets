import { runPowerShell } from './powershellHelper';

/**
 * Configures top-level window styles and reparents to WorkerW desktop layer
 * so Win+D ("Show Desktop") and Win+M do not minimize the desktop overlay.
 */
export async function pinWindowToDesktop(hwnd: number | string): Promise<boolean> {
  const script = `
    $code = @"
    using System;
    using System.Runtime.InteropServices;

    public class WindowStyleHelper {
        [DllImport("user32.dll", SetLastError = true)]
        public static extern IntPtr FindWindow(string lpClassName, string lpWindowName);

        [DllImport("user32.dll", SetLastError = true)]
        public static extern IntPtr FindWindowEx(IntPtr hwndParent, IntPtr hwndChildAfter, string lpszClass, string lpszWindow);

        [DllImport("user32.dll", SetLastError = true)]
        public static extern IntPtr SendMessageTimeout(IntPtr hWnd, uint Msg, IntPtr wParam, IntPtr lParam, uint fuFlags, uint uTimeout, out IntPtr lpdwResult);

        [DllImport("user32.dll", SetLastError = true)]
        public static extern IntPtr SetParent(IntPtr hWndChild, IntPtr hWndNewParent);

        [DllImport("user32.dll")]
        public static extern int GetWindowLong(IntPtr hWnd, int nIndex);

        [DllImport("user32.dll")]
        public static extern int SetWindowLong(IntPtr hWnd, int nIndex, int dwNewLong);

        [DllImport("user32.dll")]
        public static extern bool SetWindowPos(IntPtr hWnd, IntPtr hWndInsertAfter, int X, int Y, int cx, int cy, uint uFlags);

        public delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);

        [DllImport("user32.dll")]
        public static extern bool EnumWindows(EnumWindowsProc lpEnumFunc, IntPtr lParam);

        private const int GWL_EXSTYLE = -20;
        private const int WS_EX_TOOLWINDOW = 0x00000080;
        private const int WS_EX_NOACTIVATE = 0x08000000;
        private const int WS_EX_APPWINDOW = 0x00040000;

        private const uint SWP_NOSIZE = 0x0001;
        private const uint SWP_NOMOVE = 0x0002;
        private const uint SWP_NOACTIVATE = 0x0010;
        private const uint SWP_SHOWWINDOW = 0x0040;

        public static void ApplyStyle(long handle) {
            IntPtr hWnd = new IntPtr(handle);

            int exStyle = GetWindowLong(hWnd, GWL_EXSTYLE);
            exStyle = (exStyle | WS_EX_TOOLWINDOW | WS_EX_NOACTIVATE) & ~WS_EX_APPWINDOW;
            SetWindowLong(hWnd, GWL_EXSTYLE, exStyle);

            IntPtr progman = FindWindow("Progman", null);
            IntPtr result = IntPtr.Zero;
            SendMessageTimeout(progman, 0x052C, new IntPtr(0x0D), IntPtr.Zero, 0x0000, 1000, out result);

            IntPtr workerw = IntPtr.Zero;
            EnumWindows((tWnd, lParam) => {
                IntPtr p = FindWindowEx(tWnd, IntPtr.Zero, "SHELLDLL_DefView", null);
                if (p != IntPtr.Zero) {
                    workerw = FindWindowEx(IntPtr.Zero, tWnd, "WorkerW", null);
                }
                return true;
            }, IntPtr.Zero);

            if (workerw == IntPtr.Zero) {
                workerw = progman;
            }

            if (workerw != IntPtr.Zero) {
                SetParent(hWnd, workerw);
            }

            SetWindowPos(hWnd, IntPtr.Zero, 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE | SWP_NOACTIVATE | SWP_SHOWWINDOW);
        }
    }
"@
    Add-Type -TypeDefinition $code -ErrorAction SilentlyContinue
    [WindowStyleHelper]::ApplyStyle(${hwnd})
  `;

  try {
    await runPowerShell(script);
    return true;
  } catch (err) {
    console.error('Failed to set window style and pin to WorkerW:', err);
    return false;
  }
}


