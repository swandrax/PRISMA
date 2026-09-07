import { getAllQueuedMutations, removeQueuedMutation, updateQueuedMutation, enqueueMutation } from './idb-queue';
import { useOfflineStore } from '@/stores/offline.store';
import { getQueryClient } from '@/queries/query-client';
import { queryKeys } from '@/queries/query-keys';

export async function processOfflineQueue() {
  const store = useOfflineStore.getState();
  if (!store.isOnline || store.isSyncing) return;

  const mutations = await getAllQueuedMutations();
  store.setPendingCount(mutations.length);
  if (mutations.length === 0) return;

  store.setSyncing(true);
  const queryClient = getQueryClient();

  for (const item of mutations) {
    try {
      const response = await fetch(item.endpoint, {
        method: item.action === 'CREATE' ? 'POST' : item.action === 'UPDATE' ? 'PUT' : 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-Client-Mutation-ID': item.id,
        },
        body: JSON.stringify(item.payload),
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      await removeQueuedMutation(item.id);
      store.addSyncLog({ id: item.id, entity: item.entity, status: 'SUCCESS' });

      // Invalidate relevant TanStack Query caches based on entity
      if (item.entity === 'LAPORAN_KEAMANAN') {
        queryClient.invalidateQueries({ queryKey: queryKeys.keamanan.all });
      } else if (item.entity === 'SURAT') {
        queryClient.invalidateQueries({ queryKey: queryKeys.surat.all });
      } else if (item.entity === 'ASPIRASI') {
        queryClient.invalidateQueries({ queryKey: queryKeys.aspirasi.all });
      } else if (item.entity === 'IURAN_PAYMENT') {
        queryClient.invalidateQueries({ queryKey: queryKeys.iuran.all });
      }
    } catch (err) {
      item.retryCount += 1;
      item.lastError = err instanceof Error ? err.message : String(err);
      
      // If retried 5 times with failure, log conflict/fail and don't block subsequent items
      if (item.retryCount >= 5) {
        store.addSyncLog({ id: item.id, entity: item.entity, status: 'FAILED' });
        await removeQueuedMutation(item.id);
      } else {
        await updateQueuedMutation(item);
      }
    }
  }

  const remaining = await getAllQueuedMutations();
  store.setPendingCount(remaining.length);
  store.setLastSyncAt(new Date());
  store.setSyncing(false);
}

export function initOfflineSyncListeners() {
  if (typeof window === 'undefined') return;

  const handleOnline = () => {
    useOfflineStore.getState().setOnline(true);
    processOfflineQueue();
  };

  const handleOffline = () => {
    useOfflineStore.getState().setOnline(false);
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Initial check on load
  getAllQueuedMutations().then((items) => {
    useOfflineStore.getState().setPendingCount(items.length);
    if (navigator.onLine && items.length > 0) {
      processOfflineQueue();
    }
  });

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

export { enqueueMutation };
