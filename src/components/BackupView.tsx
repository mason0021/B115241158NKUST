import React, { useState } from 'react';
import { Database, Download, Upload, RotateCcw, ShieldCheck, CheckCircle2, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { StorageService } from '../services/storage';

interface BackupViewProps {
  onRefresh: () => void;
}

export const BackupView: React.FC<BackupViewProps> = ({ onRefresh }) => {
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const logs = StorageService.getLogs();
  const pendingCount = StorageService.getPendingSyncCount();
  const lastSync = StorageService.getLastSyncTime();

  const handleExport = () => {
    const data = StorageService.exportBackupJson();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `營建工程日誌資料庫備份-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = StorageService.importBackupJson(content);
      if (success) {
        setImportStatus('✅ 備份資料庫已成功匯入還原！');
        onRefresh();
      } else {
        setImportStatus('❌ 匯入失敗，請確認 JSON 檔案格式是否正確。');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (confirm('確定要重置為預設的台北信義雙星工程範例資料嗎？本機自訂填報的日誌將被取代。')) {
      StorageService.resetToDefault();
      onRefresh();
      setImportStatus('✅ 已成功重置為標準示範工程日誌！');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="p-3 bg-slate-900 text-white rounded-xl">
            <Database className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              工程資料庫備份與離線儲存管理 (Local DB & Sync Management)
            </h2>
            <p className="text-xs text-slate-500">
              本系統支援無網路環境全離線作業，所有施工數據皆本機安全快取並於聯網後自動同步至雲端伺服器
            </p>
          </div>
        </div>

        {/* Database Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500 font-medium block">已存日誌天數</span>
            <span className="text-2xl font-bold text-slate-900 mt-1 block">{logs.length} 篇日誌</span>
            <span className="text-[11px] text-slate-400 mt-1 block">本機離線持久化儲存</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500 font-medium block">待同步雲端佇列</span>
            <span className={`text-2xl font-bold mt-1 block ${pendingCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {pendingCount} 筆
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">
              {pendingCount > 0 ? '網路連通時將自動背景同步' : '所有資料皆已與雲端同步'}
            </span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500 font-medium block">最近同步時間</span>
            <span className="text-sm font-bold text-slate-800 mt-2 block truncate">
              {lastSync ? new Date(lastSync).toLocaleString() : '本日已同步'}
            </span>
            <span className="text-[11px] text-emerald-600 mt-1 block font-medium">✓ 自動同步通道待命中</span>
          </div>
        </div>

        {importStatus && (
          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs font-bold text-blue-800 flex items-center justify-between">
            <span>{importStatus}</span>
            <button
              type="button"
              onClick={() => setImportStatus(null)}
              className="text-blue-500 hover:text-blue-800"
            >
              關閉
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold text-slate-700">資料庫備份與還原功能：</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-xs text-slate-800 block flex items-center gap-1.5">
                <Download className="w-4 h-4 text-blue-600" />
                匯出全案日誌備份檔 (.json)
              </span>
              <p className="text-[11px] text-slate-500">
                將全部天數施工日誌、工種出工數據、材料歷次取樣與檢驗報告、照片標註封裝成 JSON 檔下載至電腦。
              </p>
              <button
                type="button"
                onClick={handleExport}
                className="w-full mt-2 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs"
              >
                下載完整資料庫備份檔
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-xs text-slate-800 block flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-emerald-600" />
                匯入還原工程日誌資料庫
              </span>
              <p className="text-[11px] text-slate-500">
                從先前下載的備份 JSON 檔案中還原工程日誌與材料檢驗資料。
              </p>
              <label className="block w-full mt-2 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold text-center cursor-pointer transition-colors shadow-2xs">
                選擇備份 JSON 檔案進行匯入
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Reset Section */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-700 block">回復至預設示範工程日誌</span>
            <span className="text-[11px] text-slate-400">
              包含台北信義雙星工程、預載出工排序、材料檢驗與 S-Curve 曲線範例
            </span>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 hover:border-rose-600 rounded-xl transition-colors font-semibold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            重置為示範資料
          </button>
        </div>
      </div>
    </div>
  );
};
