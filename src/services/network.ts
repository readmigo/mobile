import { useEffect, useState } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

function isOnline(state: NetInfoState | null): boolean {
  if (!state) return false;
  // isInternetReachable can be null while still being checked — treat null as "assume online if connected"
  if (state.isConnected === false) return false;
  return state.isInternetReachable !== false;
}

export function useIsOnline(): boolean {
  const [online, setOnline] = useState<boolean>(true);
  useEffect(() => {
    let mounted = true;
    NetInfo.fetch().then((s) => {
      if (mounted) setOnline(isOnline(s));
    });
    const unsubscribe = NetInfo.addEventListener((s) => {
      if (mounted) setOnline(isOnline(s));
    });
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);
  return online;
}

/**
 * Subscribe to transitions from offline → online. Callback fires on the rising edge only.
 * Returns an unsubscribe function. Used by future sync engine to trigger pushDirty().
 */
export function onOnline(callback: () => void): () => void {
  let prevOnline: boolean | null = null;
  return NetInfo.addEventListener((state) => {
    const now = isOnline(state);
    if (prevOnline === false && now) {
      callback();
    }
    prevOnline = now;
  });
}
