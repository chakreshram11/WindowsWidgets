import koffi from 'koffi';

export interface RecycleBinStatus {
  isEmpty: boolean;
  itemCount: number;
  totalSize: number;
}

let SHQueryRecycleBinW: any = null;
let SHEmptyRecycleBinW: any = null;
let SHQUERYRBINFO: any = null;

try {
  const shell32 = koffi.load('shell32.dll');

  SHQUERYRBINFO = koffi.struct('SHQUERYRBINFO', {
    cbSize: 'uint32',
    i64Size: 'int64',
    i64NumItems: 'int64'
  });

  SHQueryRecycleBinW = shell32.func('int SHQueryRecycleBinW(const uint16 *pszRootPath, _Inout_ SHQUERYRBINFO *pSHQueryRBInfo)');
  SHEmptyRecycleBinW = shell32.func('int SHEmptyRecycleBinW(uintptr_t hwnd, const uint16 *pszRootPath, uint32 dwFlags)');
} catch (err) {
  console.error('Failed to load Win32 recycleBin koffi bindings:', err);
}

/**
 * Queries real Windows Recycle Bin status natively with 0 process spawns.
 */
export async function getRecycleBinStatus(): Promise<RecycleBinStatus> {
  if (!SHQueryRecycleBinW || !SHQUERYRBINFO) {
    return { isEmpty: true, itemCount: 0, totalSize: 0 };
  }

  try {
    const rootPath = Buffer.from('C:\\\0', 'utf16le');
    const info = {
      cbSize: koffi.sizeof(SHQUERYRBINFO),
      i64Size: 0n,
      i64NumItems: 0n
    };

    const res = SHQueryRecycleBinW(rootPath, info);
    if (res === 0) {
      const count = Number(info.i64NumItems);
      const size = Number(info.i64Size);
      return {
        isEmpty: count === 0,
        itemCount: count,
        totalSize: size
      };
    }
  } catch (err) {
    console.error('Recycle Bin status error:', err);
  }

  return { isEmpty: true, itemCount: 0, totalSize: 0 };
}

/**
 * Empties the Windows Recycle Bin natively with 0 process spawns.
 */
export async function emptyRecycleBin(): Promise<boolean> {
  if (!SHEmptyRecycleBinW) return false;

  try {
    const rootPath = Buffer.from('C:\\\0', 'utf16le');
    // SHERB_NOCONFIRMATION = 0x00000001, SHERB_NOPROGRESSUI = 0x00000002, SHERB_NOSOUND = 0x00000004
    SHEmptyRecycleBinW(0, rootPath, 0x00000001 | 0x00000002 | 0x00000004);
    return true;
  } catch (err) {
    console.error('Failed to empty Recycle Bin:', err);
    return false;
  }
}
