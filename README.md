# WindowsWidgets (Chakresh Widgets) 🪟✨

**WindowsWidgets** is a sleek, highly customizable, lightweight desktop widget suite designed natively for Windows 11. Built with **Electron**, **React 18**, **TypeScript**, **Tailwind CSS**, and **Framer Motion**, it brings macOS-inspired glassmorphism desktop widgets directly to your Windows workspace with zero desktop interference.

---

## 🌟 Key Features

- 🖥️ **Desktop Layer Pinning & Anti-Minimize**: Pinned directly above the Windows desktop layer. Intercepts `Win + D` (Show Desktop) and `Win + M` minimize events so widgets stay permanently visible on your desktop without cluttering your taskbar.
- 🖱️ **Smart Mouse Pass-Through**: Full click-through transparency for empty desktop areas. Hover over any widget to interact, edit, drag, or configure seamlessly.
- 🎨 **Live macOS Theme Customizer**: Real-time styling support with presets like *macOS Sonoma Dark*, custom glassmorphism blur, border opacity, rounded corners, and dynamic accent colors.
- 🚀 **Ultra-Low CPU & RAM Footprint**: Native system monitoring (`os.cpus()`, `os.freemem()`, `fs.statfsSync()`) without heavy polling processes, guaranteeing crisp performance and low resource utilization.
- 📂 **Import & Export Configuration**: Save, share, or backup your widget layout, custom position coordinates, and theme settings via JSON (`dock_config.json`).

---

## 🧩 Included Widgets

1. ⏰ **Clock Widget**: Real-time digital clock with custom date & timezone options.
2. 📅 **Calendar Widget**: Interactive monthly calendar viewer.
3. ⏱️ **Timer / Stopwatch Widget**: Precise countdown timer & lap stopwatch.
4. ⏳ **Countdown Widget**: Event countdown tracker with customizable targets.
5. 📝 **Sticky Notes Widget**: Quick note taking with instant persistence and focus-lock protection.
6. ✅ **Tasks Widget**: Interactive To-Do list with task completion toggles.
7. 📊 **System Monitor Widget**: Live CPU utilization, Memory usage, and Disk storage metrics.
8. 📶 **Network Activity Widget**: Live network upload & download traffic monitor.
9. 🔋 **Battery Status Widget**: Real-time battery percentage, charging state, and remaining duration.

---

## 🛠️ Tech Stack

- **Framework**: [Electron 33](https://www.electronjs.org/) & [Vite 5](https://vitejs.dev/)
- **UI Core**: [React 18](https://react.dev/) & [TypeScript 5](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 3](https://tailwindcss.com/) & [Lucide React](https://lucide.dev/)
- **Animations & Interactivity**: [Framer Motion 11](https://www.framer.com/motion/)
- **State & Storage**: [Electron Store](https://github.com/sindresorhus/electron-store)

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18.x or later)
- npm or yarn
- Windows 10/11 operating system

### Installation & Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/chakreshram11/WindowsWidgets.git
   cd WindowsWidgets
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start in Development Mode**:
   ```bash
   npm run dev
   ```

4. **Build & Test Electron App**:
   ```bash
   npm run start
   ```

---

## 📦 Packaging & Building

To generate production binaries and Windows NSIS installers:

- **Unpacked Directory Build**:
  ```bash
  npm run pack
  ```
  *Output directory: `release/win-unpacked/Chakresh Widgets.exe`*

- **NSIS Setup Installer**:
  ```bash
  npm run dist
  ```
  *Output installer: `release/Chakresh Widgets Setup 1.0.0.exe`*

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for details.
