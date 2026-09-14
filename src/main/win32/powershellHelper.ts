import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Executes a PowerShell script safely using UTF-16LE Base64 -EncodedCommand.
 * This preserves multiline strings, C# Add-Type definitions, and complex quotes cleanly.
 */
export async function runPowerShell(script: string): Promise<string> {
  const buffer = Buffer.from(script, 'utf16le');
  const base64 = buffer.toString('base64');
  const { stdout } = await execAsync(`powershell -NoProfile -ExecutionPolicy Bypass -EncodedCommand ${base64}`);
  return stdout;
}
