import { useEffect, useState } from 'react';
import { syncService } from '@/services/syncService';

export function useSync<T>(event: string, initialData?: T) {
  const [data, setData] = useState<T | undefined>(initialData);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    const unsubscribe = syncService.subscribe(event, (newData: T) => {
      setData(newData);
      setLastUpdate(new Date());
    });

    return () => {
      unsubscribe();
    };
  }, [event]);

  return { data, lastUpdate };
}

export function useProductSync() {
  const [shouldRefresh, setShouldRefresh] = useState(false);

  useEffect(() => {
    const unsubscribeCreated = syncService.subscribe('product:created', () => {
      setShouldRefresh(true);
    });

    const unsubscribeUpdated = syncService.subscribe('product:updated', () => {
      setShouldRefresh(true);
    });

    const unsubscribeDeleted = syncService.subscribe('product:deleted', () => {
      setShouldRefresh(true);
    });

    return () => {
      unsubscribeCreated();
      unsubscribeUpdated();
      unsubscribeDeleted();
    };
  }, []);

  const resetRefresh = () => setShouldRefresh(false);

  return { shouldRefresh, resetRefresh };
}

export function useOrderSync() {
  const [shouldRefresh, setShouldRefresh] = useState(false);

  useEffect(() => {
    const unsubscribeCreated = syncService.subscribe('order:created', () => {
      setShouldRefresh(true);
    });

    const unsubscribeUpdated = syncService.subscribe('order:updated', () => {
      setShouldRefresh(true);
    });

    return () => {
      unsubscribeCreated();
      unsubscribeUpdated();
    };
  }, []);

  const resetRefresh = () => setShouldRefresh(false);

  return { shouldRefresh, resetRefresh };
}
