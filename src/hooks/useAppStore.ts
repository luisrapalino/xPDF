import { useSyncExternalStore } from 'react';
import { appStore } from '@/store/AppStore';

export function useAppStore() {
  return useSyncExternalStore(
    (callback) => appStore.subscribe(callback),
    () => appStore.getState(),
    () => appStore.getState(),
  );
}
