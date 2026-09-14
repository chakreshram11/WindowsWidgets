import { runPowerShell } from './powershellHelper';
import fs from 'fs';
import path from 'path';
import os from 'os';

const iconCache = new Map<string, string>();

/**
 * Resolves a shorthand executable name (e.g. explorer.exe, cmd.exe) to a full system path.
 */
function resolvePath(filePath: string): string {
  if (fs.existsSync(filePath)) return filePath;

  const winDir = process.env.WINDIR || 'C:\\Windows';
  const sys32 = path.join(winDir, 'System32');

  const candidates = [
    path.join(winDir, filePath),
    path.join(sys32, filePath)
  ];

  for (const cand of candidates) {
    if (fs.existsSync(cand)) return cand;
  }

  return filePath;
}

/**
 * Extracts high-resolution icon from an executable or shortcut (.exe, .lnk)
 * and returns it as a Base64 Data URL (image/png).
 */
export async function extractIcon(rawPath: string): Promise<string | null> {
  if (!rawPath) return null;
  const filePath = resolvePath(rawPath);

  if (!fs.existsSync(filePath)) return null;

  if (iconCache.has(filePath)) {
    return iconCache.get(filePath)!;
  }

  const tempIconPath = path.join(os.tmpdir(), `dock_icon_${Date.now()}_${Math.random().toString(36).substring(7)}.png`);

  const script = `
    Add-Type -AssemblyName System.Drawing
    $path = "${filePath.replace(/\\/g, '\\\\')}"
    $icon = [System.Drawing.Icon]::ExtractAssociatedIcon($path)
    if ($icon -ne $null) {
      $bitmap = $icon.ToBitmap()
      $bitmap.Save("${tempIconPath.replace(/\\/g, '\\\\')}", [System.Drawing.Imaging.ImageFormat]::Png)
      $bitmap.Dispose()
      $icon.Dispose()
    }
  `;

  try {
    await runPowerShell(script);
    if (fs.existsSync(tempIconPath)) {
      const buffer = fs.readFileSync(tempIconPath);
      const base64 = `data:image/png;base64,${buffer.toString('base64')}`;
      fs.unlinkSync(tempIconPath);
      iconCache.set(filePath, base64);
      return base64;
    }
  } catch (err) {
    console.error('Icon extraction error for:', filePath, err);
  }

  return null;
}
