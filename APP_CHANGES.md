# Project Architecture & Optimization Changes Log

This document serves as the master record of all structural optimizations, window management fixes, performance enhancements, and cursor/interaction updates made to **Chakresh Widgets**. Any future code changes or feature additions must respect, build upon, and preserve the architecture detailed here.

---

## 1. Resource & Performance Optimization (CPU & RAM)
- **File Modified:** `src/main/win32/systemSensors.ts`
- **Problem:** Previously, the app spawned heavy external `powershell.exe` child processes via `child_process.exec` every 2 to 3 seconds for CPU, RAM, Disk, Network, and Battery metric queries. Spawning 20–30 PowerShell processes per minute caused high CPU spikes (~15–30%), heavy memory allocation, and process churn.
- **Changes Applied:**
  - **CPU Metrics:** Calculated using Node's native `os.cpus()` tick deltas with zero process creation and <1ms latency.
  - **RAM Metrics:** Calculated natively using `os.totalmem()` and `os.freemem()`.
  - **Disk Metrics:** Queried via Node's native `fs.statfsSync('C:\\')` without spawning child processes.
  - **Throttling & Caching:** Battery and Network queries are cached and throttled (battery cached for 15s, network throttled to 3s) to prevent repetitive process executions.
- **Rule for Future Work:** Do NOT re-introduce continuous process execution or unthrottled PowerShell polling for system metric monitoring. Always leverage native Node.js/Electron APIs or cached throttled queries.

---

## 2. Window Minimization & Desktop Layer Pinning
- **Files Modified:** `src/main/main.ts` and `src/main/win32/desktopPin.ts`
- **Problem:** Pressing `Win+D` (Show Desktop), `Win+M`, or interacting with top-level windows caused the transparent widget overlay window to minimize or hide.
- **Changes Applied:**
  - `BrowserWindow` parameters updated in `main.ts` (`type: 'toolbar'`, `minimizable: false`, `skipTaskbar: true`, `transparent: true`, `frame: false`).
  - Added event listeners to intercept window minimize and hide events:
    ```ts
    (mainWindow as any).on('minimize', (e: any) => {
      if (e && typeof e.preventDefault === 'function') e.preventDefault();
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.restore();
        mainWindow.showInactive();
      }
    });

    mainWindow.on('hide', () => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.showInactive();
      }
    });
    ```
- **Rule for Future Work:** Maintain the minimize interception and desktop layer overlay behavior. Do NOT remove `showInactive()` or allow Windows DWM minimize events to hide the overlay.

---

## 3. Cursor Interaction, Mouse Pass-Through, & Text Editing in Widgets
- **Files Modified:**
  - `src/renderer/App.tsx`
  - `src/renderer/components/widgets/NoteWidget.tsx`
  - `src/renderer/components/widgets/TasksWidget.tsx`
- **Problem:** When editing text inside widgets (e.g. `NoteWidget` or `TasksWidget`), moving the cursor slightly off the widget element triggered `onMouseLeave`, which invoked `window.dockApi.setIgnoreMouseEvents(true, true)`. This caused mouse clicks to pass through to desktop windows behind the widget, losing focus and making text editing impossible. Furthermore, Framer Motion drag handlers on widget containers hijacked pointer events when users tried to select text or click input fields.
- **Changes Applied:**
  - In `App.tsx`: Implemented global `focusin` and `focusout` event listeners to track `isInputFocusedRef`. While any `<input>`, `<textarea>`, or `isContentEditable` element is focused, `disableMouseEvents()` is blocked from calling `setIgnoreMouseEvents(true, true)`, keeping mouse interaction 100% active while typing/editing.
  - In `NoteWidget.tsx` & `TasksWidget.tsx`: Added `onPointerDown={(e) => e.stopPropagation()}` and `onMouseDown={(e) => e.stopPropagation()}` on input fields, buttons, and textareas so clicking or selecting text does not trigger widget container dragging. Added `cursor-text`, `select-text`, and `pointer-events-auto` Tailwind classes.
- **Rule for Future Work:** Any new widget with interactive inputs or editable fields MUST include `onPointerDown={(e) => e.stopPropagation()}` and `onMouseDown={(e) => e.stopPropagation()}` on editable elements to prevent Framer Motion drag interference, and must rely on the global focus tracker in `App.tsx` to maintain mouse event focus.

---

## Summary of Binaries Built
- **Executable Directory:** `release/win-unpacked/Chakresh Widgets.exe`
- **Setup Installer:** `release/Chakresh Widgets Setup 1.0.0.exe`
- **Build Status:** Verified clean build (`npm run pack` and `npm run dist` succeed with zero TypeScript or Vite errors).
