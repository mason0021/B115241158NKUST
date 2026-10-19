import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle, AlertTriangle, Cloud, CloudOff } from 'lucide-react';
import { StorageService, SYNC_EVENT_NAME } from '../services/storage';

export const OfflineSyncIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [pendingCount, setPendingCount] = useState<number>(StorageService.getPendingSyncCount());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(StorageService.getLastSyncTime());
  const [syncToast, setSyncToast] = useState<string | null>(null);

  const checkStatus = () => {
    setIsOnline(navigator.onLine);
    setPendingCount(StorageService.getPendingSyncCount());
    setLastSyncTime(StorageService.getLastSyncTime());
  };

  const performAutoSync = async () => {
    if (!navigator.onLine) return;
    setIsSyncing(true);
    try {
      const res = await StorageService.syncPendingLogs();
      if (res.syncedCount > 0) {
        showToast(`已自動將 ${res.syncedCount} 筆離線填報日誌同步至雲端資料庫！`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
      checkStatus();
    }
  };

  const showToast = (msg: string) => {
    setSyncToast(msg);
    setTimeout(() => {
      setSyncToast(null);
    }, 4000);
  };

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      performAutoSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
      showToast('目前處於離線狀態，系統已切換為本機離線作業模式，待連線時自動同步');
    };

    const handleSyncEvent = (e: Event) => {
      checkStatus();
      const customEvt = e as CustomEvent;
      if (customEvt.detail?.action === 'sync_completed' && customEvt.detail.syncedCount > 0) {
        showToast(`雲端同步完成：共更新 ${customEvt.detail.syncedCount} 筆資料`);
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener(SYNC_EVENT_NAME, handleSyncEvent);

    // Initial check
    checkStatus();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener(SYNC_EVENT_NAME, handleSyncEvent);
    };
  }, []);

  const handleManualSync = async () => {
    if (!isOnline) {
      alert('目前為離線狀態，待網路連線恢復後系統將自動為您同步！');
      return;
    }
    setIsSyncing(true);
    await StorageService.syncPendingLogs();
    setIsSyncing(false);
    checkStatus();
    showToast('雲端伺服器已成功同步最新日誌與材料檢驗資料庫！');
  };

  return (
    <div className="flex items-center gap-2">
      {/* Network Badge */}
      <div
        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
          isOnline
            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
            : 'bg-rose-50 text-rose-700 border-rose-300'
        }`}
        title={isOnline ? '網路連線正常：支援雲端即時同步' : '離線模式：所有填報先儲存於本機，恢復連線時自動同步'}
      >
        {isOnline ? (
          <>
            <Wifi className="w-3.5 h-3.5 text-emerald-600" />
            <span>在線運作</span>
          </>
        ) : (
          <>
            <WifiOff className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
            <span>離線作業中</span>
          </>
        )}
      </div>

      {/* Pending Sync Pill */}
      {pendingCount > 0 && (
        <span
          className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse"
          title={`${pendingCount} 筆日誌等待同步至雲端`}
        >
          <Cloud className="w-3.5 h-3.5 text-amber-600" />
          <span>待同步 {pendingCount} 筆</span>
        </span>
      )}

      {/* Manual Sync Button */}
      <button
        type="button"
        disabled={isSyncing}
        onClick={handleManualSync}
        className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
        title="手動觸發雲端同步"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
        <span>{isSyncing ? '同步中...' : '同步至雲端'}</span>
      </button>

      {/* Toast Notification */}
      {syncToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 text-xs font-medium flex items-center gap-2.5 animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{syncToast}</span>
        </div>
      )}
    </div>
  );
};
