import { useEffect, useRef, useCallback } from 'react';

/**
 * Polling Hook - Belirli aralıklarla API'dan veri çeker
 * @param {Function} fetchFn - Veri çekme fonksiyonu
 * @param {number} interval - Polling aralığı (ms) - Default: 10000 (10 saniye)
 * @param {boolean} immediate - İlk çağrıyı hemen yap - Default: true
 * @param {Array} deps - Bağımlılık dizisi
 */
export function usePolling(fetchFn, interval = 10000, immediate = true, deps = []) {
  const savedCallback = useRef(fetchFn);
  const intervalRef = useRef(null);

  // Callback'i güncelle
  useEffect(() => {
    savedCallback.current = fetchFn;
  }, [fetchFn]);

  // Polling'i başlat/durdur
  useEffect(() => {
    // İlk çağrı
    if (immediate) {
      savedCallback.current();
    }

    // Interval oluştur
    intervalRef.current = setInterval(() => {
      savedCallback.current();
    }, interval);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [interval, immediate, ...deps]);
}

/**
 * Otomatik yenileme hook'u - Sayfa görünür olduğunda aktif olur
 */
export function useAutoRefresh(fetchFn, interval = 10000) {
  const savedCallback = useRef(fetchFn);
  const intervalRef = useRef(null);

  useEffect(() => {
    savedCallback.current = fetchFn;
  }, [fetchFn]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Sayfa görünür olduğunda hemen çek
        savedCallback.current();
        
        // Interval'i başlat
        intervalRef.current = setInterval(() => {
          savedCallback.current();
        }, interval);
      } else {
        // Sayfa gizli olduğunda durdur
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }
    };

    // İlk kontrol
    handleVisibilityChange();

    // Event listener
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [interval]);
}

/**
 * Manuel refresh fonksiyonu döndüren hook
 */
export function useManualRefresh(fetchFn) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await fetchFn();
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchFn]);

  return { refresh, isRefreshing };
}

// React import ekle
import { useState } from 'react';
