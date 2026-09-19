import os from 'os';
import fs from 'fs';
import koffi from 'koffi';

export interface SystemMetrics {
  cpu: number;
  ram: number;
  disk: number;
}

export interface MemoryStats {
  totalBytes: number;
  usedBytes: number;
  availableBytes: number;
  usagePercent: number;
}

export interface MemoryCleanupResult {
  success: boolean;
  before: MemoryStats;
  after: MemoryStats;
  reclaimedBytes: number;
  processesTrimmed: number;
  error?: string;
}

export interface BatteryMetrics {
  percentage: number;
  isCharging: boolean;
  statusText: string;
}

export interface NetworkMetrics {
  downloadBps: number;
  uploadBps: number;
  downloadText: string;
  uploadText: string;
}

let prevCpuTimes: { idle: number; total: number } | null = null;

/**
 * Calculates CPU load percentage using Node's os.cpus() tick differences.
 */
function getCpuUsage(): number {
  const cpus = os.cpus();
  if (!cpus || cpus.length === 0) return 10;

  let idle = 0;
  let total = 0;

  for (const cpu of cpus) {
    for (const type in cpu.times) {
      total += (cpu.times as Record<string, number>)[type];
    }
    idle += cpu.times.idle;
  }

  if (!prevCpuTimes) {
    prevCpuTimes = { idle, total };
    return 12.5;
  }

  const idleDiff = idle - prevCpuTimes.idle;
  const totalDiff = total - prevCpuTimes.total;
  prevCpuTimes = { idle, total };

  if (totalDiff === 0) return 0;
  const usage = 100 - (100 * idleDiff) / totalDiff;
  return Number(Math.min(100, Math.max(0, usage)).toFixed(1));
}

/**
 * Calculates RAM usage percentage using Node's os.totalmem() & os.freemem().
 */
function getRamUsage(): number {
  const memory = getMemoryStats();
  return memory.totalBytes > 0 ? memory.usagePercent : 50;
}

/**
 * Reads physical memory totals from Windows/Node's operating-system memory
 * counters. These are real values; cached and standby lists are intentionally
 * not reported because this implementation does not query them reliably.
 */
export function getMemoryStats(): MemoryStats {
  const totalBytes = os.totalmem();
  const availableBytes = Math.min(totalBytes, Math.max(0, os.freemem()));
  const usedBytes = Math.max(0, totalBytes - availableBytes);
  const usagePercent = totalBytes > 0
    ? Number(((usedBytes / totalBytes) * 100).toFixed(1))
    : 0;

  return {
    totalBytes,
    usedBytes,
    availableBytes,
    usagePercent
  };
}

/**
 * Calculates primary C: drive usage percentage using Node's native fs.statfsSync.
 */
function getDiskUsage(): number {
  try {
    if (typeof fs.statfsSync === 'function') {
      const stats = fs.statfsSync('C:\\');
      const total = stats.blocks * stats.bsize;
      const free = stats.bfree * stats.bsize;
      if (total > 0) {
        const usedRatio = ((total - free) / total) * 100;
        return Number(usedRatio.toFixed(1));
      }
    }
  } catch (err) {
    // Fallback if drive not accessible
  }
  return 55.0;
}

/**
 * Native, zero-overhead read of CPU %, RAM %, and primary Disk %
 */
export async function getSystemMetrics(): Promise<SystemMetrics> {
  return {
    cpu: getCpuUsage(),
    ram: getRamUsage(),
    disk: getDiskUsage()
  };
}

// EmptyWorkingSet is a documented Windows API that trims reclaimable pages
// from a process working set. It does not terminate processes or close apps.
let EnumProcesses: any = null;
let OpenProcess: any = null;
let EmptyWorkingSet: any = null;
let CloseHandle: any = null;

try {
  const psapi = koffi.load('psapi.dll');
  const kernel32ForMemory = koffi.load('kernel32.dll');

  EnumProcesses = psapi.func('bool EnumProcesses(_Out_ uint32 *lpidProcess, uint32 cb, _Out_ uint32 *lpcbNeeded)');
  EmptyWorkingSet = psapi.func('bool EmptyWorkingSet(uintptr_t hProcess)');
  OpenProcess = kernel32ForMemory.func('uintptr_t OpenProcess(uint32 dwDesiredAccess, bool bInheritHandle, uint32 dwProcessId)');
  CloseHandle = kernel32ForMemory.func('bool CloseHandle(uintptr_t hObject)');
} catch (err) {
  console.error('Failed to load Win32 memory cleanup bindings:', err);
}

/**
 * Trims accessible process working sets using EmptyWorkingSet. Access-denied
 * processes are skipped by Windows; no process is terminated or modified.
 */
export async function cleanMemory(): Promise<MemoryCleanupResult> {
  const before = getMemoryStats();
  let processesTrimmed = 0;

  if (!EnumProcesses || !OpenProcess || !EmptyWorkingSet || !CloseHandle) {
    return {
      success: false,
      before,
      after: before,
      reclaimedBytes: 0,
      processesTrimmed,
      error: 'Windows memory cleanup is unavailable.'
    };
  }

  try {
    const processIds = new Uint32Array(4096);
    const bytesNeeded = [0];
    const enumerated = EnumProcesses(processIds, processIds.byteLength, bytesNeeded);

    if (!enumerated) {
      throw new Error('EnumProcesses failed');
    }

    const processCount = Math.min(
      processIds.length,
      Math.floor(Number(bytesNeeded[0]) / Uint32Array.BYTES_PER_ELEMENT)
    );

    // PROCESS_QUERY_INFORMATION | PROCESS_SET_QUOTA. These rights are the
    // documented minimum required by EmptyWorkingSet.
    const processAccess = 0x0400 | 0x0100;
    for (let index = 0; index < processCount; index += 1) {
      const processId = processIds[index];
      if (!processId) continue;

      const processHandle = OpenProcess(processAccess, false, processId);
      if (!processHandle) continue;

      try {
        if (EmptyWorkingSet(processHandle)) {
          processesTrimmed += 1;
        }
      } finally {
        CloseHandle(processHandle);
      }
    }
  } catch (err) {
    console.error('Windows memory cleanup failed:', err);
    return {
      success: false,
      before,
      after: getMemoryStats(),
      reclaimedBytes: 0,
      processesTrimmed,
      error: 'Memory cleanup failed. Try again.'
    };
  }

  // Give Windows a moment to account for pages trimmed back to the standby
  // list before taking the comparison reading.
  await new Promise<void>((resolve) => setTimeout(resolve, 150));
  const after = getMemoryStats();
  const reclaimedBytes = Math.max(0, after.availableBytes - before.availableBytes);

  return {
    success: processesTrimmed > 0,
    before,
    after,
    reclaimedBytes,
    processesTrimmed,
    error: processesTrimmed > 0 ? undefined : 'No accessible process working sets could be trimmed.'
  };
}

// Native Win32 definitions via koffi (zero child-process overhead)
let GetSystemPowerStatus: any = null;
let GetIfTable2: any = null;
let FreeMibTable: any = null;
let MIB_IF_ROW2: any = null;

try {
  const kernel32 = koffi.load('kernel32.dll');
  koffi.struct('SYSTEM_POWER_STATUS', {
    ACLineStatus: 'uint8',
    BatteryFlag: 'uint8',
    BatteryLifePercent: 'uint8',
    SystemStatusFlag: 'uint8',
    BatteryLifeTime: 'uint32',
    BatteryFullLifeTime: 'uint32'
  });
  GetSystemPowerStatus = kernel32.func('bool GetSystemPowerStatus(_Out_ SYSTEM_POWER_STATUS *lpSystemPowerStatus)');

  const iphlpapi = koffi.load('iphlpapi.dll');
  GetIfTable2 = iphlpapi.func('uint32 GetIfTable2(_Out_ uintptr_t *Table)');
  FreeMibTable = iphlpapi.func('void FreeMibTable(uintptr_t Table)');

  MIB_IF_ROW2 = koffi.struct('MIB_IF_ROW2', {
    InterfaceLuid: 'uint64',
    InterfaceIndex: 'uint32',
    InterfaceGuid: koffi.array('uint8', 16),
    Alias: koffi.array('uint16', 257),
    Description: koffi.array('uint16', 257),
    PhysicalAddressLength: 'uint32',
    PhysicalAddress: koffi.array('uint8', 32),
    PermanentPhysicalAddress: koffi.array('uint8', 32),
    Mtu: 'uint32',
    Type: 'uint32',
    TunnelType: 'uint32',
    MediaType: 'uint32',
    PhysicalMediumType: 'uint32',
    AccessType: 'uint32',
    DirectionType: 'uint32',
    InterfaceAndOperStatusFlags: 'uint8',
    OperStatus: 'uint32',
    AdminStatus: 'uint32',
    MediaConnectState: 'uint32',
    NetworkGuid: koffi.array('uint8', 16),
    ConnectionType: 'uint32',
    TransmitLinkSpeed: 'uint64',
    ReceiveLinkSpeed: 'uint64',
    InOctets: 'uint64',
    InUcastPkts: 'uint64',
    InNUcastPkts: 'uint64',
    InDiscards: 'uint64',
    InErrors: 'uint64',
    InUnknownProtos: 'uint64',
    InUcastOctets: 'uint64',
    InMulticastOctets: 'uint64',
    InBroadcastOctets: 'uint64',
    OutOctets: 'uint64',
    OutUcastPkts: 'uint64',
    OutNUcastPkts: 'uint64',
    OutDiscards: 'uint64',
    OutErrors: 'uint64',
    OutUcastOctets: 'uint64',
    OutMulticastOctets: 'uint64',
    OutBroadcastOctets: 'uint64',
    OutQLen: 'uint64'
  });
} catch (err) {
  console.error('Failed to load Win32 sensors koffi bindings:', err);
}

function formatBatteryTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  return `${minutes}m`;
}

/**
 * Reads battery percentage & status natively via GetSystemPowerStatus (0 process spawns)
 */
export async function getBatteryMetrics(): Promise<BatteryMetrics> {
  if (!GetSystemPowerStatus) {
    return { percentage: 100, isCharging: true, statusText: 'Plugged In' };
  }

  try {
    const status: any = {};
    if (GetSystemPowerStatus(status)) {
      const pct = status.BatteryLifePercent === 255 ? 100 : status.BatteryLifePercent;
      const isCharging = status.ACLineStatus === 1;
      const secs = status.BatteryLifeTime === 4294967295 ? -1 : status.BatteryLifeTime;

      let statusText = '';
      if (isCharging) {
        statusText = pct >= 100 ? 'Fully Charged' : 'Charging';
      } else {
        if (secs > 0 && secs < 86400 * 7) {
          const mins = Math.round(secs / 60);
          statusText = `Discharging (${formatBatteryTime(mins)} left)`;
        } else {
          statusText = pct >= 100 ? 'Fully Charged' : 'Discharging';
        }
      }
      return { percentage: pct, isCharging, statusText };
    }
  } catch (err) {
    // Fallback default
  }

  return { percentage: 100, isCharging: true, statusText: 'Discharging' };
}

let lastNetworkCheckTime = 0;
let lastBytesReceived = 0n;
let lastBytesSent = 0n;
let cachedNetwork: NetworkMetrics = {
  downloadBps: 0,
  uploadBps: 0,
  downloadText: '0 B/s',
  uploadText: '0 B/s'
};

/**
 * Reads Network Download & Upload activity speeds natively via GetIfTable2 (0 process spawns)
 */
export async function getNetworkMetrics(): Promise<NetworkMetrics> {
  const now = Date.now();

  let currentRecv = 0n;
  let currentSent = 0n;

  if (GetIfTable2 && FreeMibTable && MIB_IF_ROW2) {
    try {
      const ptrHolder = [0n];
      if (GetIfTable2(ptrHolder) === 0) {
        const tablePtr = BigInt(ptrHolder[0]);
        const numEntries = koffi.decode(tablePtr, 'uint32');
        const rowSize = BigInt(koffi.sizeof(MIB_IF_ROW2));
        for (let i = 0n; i < BigInt(numEntries); i++) {
          const rowPtr = tablePtr + 8n + i * rowSize;
          const row = koffi.decode(rowPtr, MIB_IF_ROW2);
          if (row.OperStatus === 1 && row.Type !== 24) {
            currentRecv += BigInt(row.InOctets);
            currentSent += BigInt(row.OutOctets);
          }
        }
        FreeMibTable(tablePtr);
      }
    } catch (err) {
      // Fallback
    }
  }

  let downBps = 0;
  let upBps = 0;

  if (lastNetworkCheckTime > 0) {
    const timeDiff = (now - lastNetworkCheckTime) / 1000;
    if (timeDiff > 0) {
      downBps = Math.max(0, Math.round(Number(currentRecv - lastBytesReceived) / timeDiff));
      upBps = Math.max(0, Math.round(Number(currentSent - lastBytesSent) / timeDiff));
    }
  }

  lastNetworkCheckTime = now;
  lastBytesReceived = currentRecv;
  lastBytesSent = currentSent;

  const formatSpeed = (bps: number) => {
    if (bps > 1024 * 1024) return `${(bps / (1024 * 1024)).toFixed(1)} MB/s`;
    if (bps > 1024) return `${(bps / 1024).toFixed(0)} KB/s`;
    return `${bps} B/s`;
  };

  cachedNetwork = {
    downloadBps: downBps,
    uploadBps: upBps,
    downloadText: formatSpeed(downBps),
    uploadText: formatSpeed(upBps)
  };

  return cachedNetwork;
}
