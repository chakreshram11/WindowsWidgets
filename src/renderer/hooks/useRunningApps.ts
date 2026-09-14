import { useState, useEffect } from 'react';
import { RunningAppInfo } from '../types/dock';

export function useRunningApps(enabled: boolean = true, intervalMs: number = 2000) {
  const [runningApps, setRunningApps] = useState<RunningAppInfo[]>([]);

  useEffect(() => {
    if (!enabled) return;

    let isMounted = true;

    const checkRunningApps = async () => {
      try {
        const apps = await window.dockApi.getRunningApps();
        if (isMounted) {
          setRunningApps(apps);
        }
      } catch (err) {
        console.error('Failed to fetch running apps:', err);
      }
    };

    checkRunningApps();
    const interval = setInterval(checkRunningApps, intervalMs);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [enabled, intervalMs]);

  return runningApps;
}
