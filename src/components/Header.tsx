import React from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Layers,
  BarChart2,
  FileText,
  Save,
  HardHat,
  Database,
  Check,
} from 'lucide-react';
import { OfflineSyncIndicator } from './OfflineSyncIndicator';

export type ActiveTab = 'log' | 'material_master' | 'monthly' | 'pdf' | 'backup';

interface HeaderProps {
  currentDate: string;
  onDateChange: (newDate: string) => void;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onSave: () => void;
  isSaving: boolean;
  saveSuccess: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentDate,
  onDateChange,
  activeTab,
  onTabChange,
  onSave,
  isSaving,
  saveSuccess,
}) => {
  const handlePrevDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 1);
    onDateChange(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 1);
    onDateChange(d.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    onDateChange(new Date().toISOString().split('T')[0]);
  };

  return (
    <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* Top Banner Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Project Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-sm shrink-0">
              <HardHat className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-slate-900 text-base sm:text-lg tracking-tight">
                  營建工程施工日誌系統
                </h1>
                <span className="hidden sm:inline-block text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  公共工程標準版
                </span>
              </div>
              <p className="hidden md:block text-[11px] text-slate-500">
                出工排序 • 材料檢驗歷程 • 照片工項標註 • PDF 匯出 • S-Curve 曲線 • 離線自動同步
              </p>
            </div>
          </div>

          {/* Date Selector Navigation */}
          <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={handlePrevDay}
              className="p-1 hover:bg-white rounded-lg text-slate-600 transition-colors"
              title="前一天"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5 px-2">
              <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
              <input
                type="date"
                value={currentDate}
                onChange={(e) => onDateChange(e.target.value)}
                className="bg-transparent font-bold text-xs sm:text-sm text-slate-800 outline-none cursor-pointer"
              />
            </div>

            <button
              type="button"
              onClick={handleNextDay}
              className="p-1 hover:bg-white rounded-lg text-slate-600 transition-colors"
              title="後一天"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleToday}
              className="ml-1 px-2.5 py-1 text-[11px] font-bold bg-white hover:bg-amber-500 hover:text-white text-slate-700 rounded-lg shadow-2xs border border-slate-200 transition-colors"
            >
              今天
            </button>
          </div>

          {/* Right Action: Sync Status & Save Button */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:block">
              <OfflineSyncIndicator />
            </div>

            <button
              type="button"
              disabled={isSaving}
              onClick={onSave}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all ${
                saveSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-600 hover:bg-amber-700 text-white active:scale-95'
              }`}
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>已儲存</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? '儲存中...' : '儲存日誌'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tab Navigation Row */}
        <div className="flex items-center justify-between border-t border-slate-100 overflow-x-auto py-1 scrollbar-none">
          <nav className="flex space-x-1 sm:space-x-2">
            <button
              type="button"
              onClick={() => onTabChange('log')}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                activeTab === 'log'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ClipboardList className="w-4 h-4 text-amber-400" />
              <span>施工日誌填報</span>
            </button>

            <button
              type="button"
              onClick={() => onTabChange('material_master')}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                activeTab === 'material_master'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>材料進場及總表</span>
            </button>

            <button
              type="button"
              onClick={() => onTabChange('monthly')}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                activeTab === 'monthly'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BarChart2 className="w-4 h-4 text-blue-400" />
              <span>統計月報與圖表</span>
            </button>

            <button
              type="button"
              onClick={() => onTabChange('pdf')}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                activeTab === 'pdf'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-4 h-4 text-rose-400" />
              <span>匯出 PDF 報表</span>
            </button>

            <button
              type="button"
              onClick={() => onTabChange('backup')}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                activeTab === 'backup'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>工程資料庫</span>
            </button>
          </nav>

          <div className="lg:hidden pl-2">
            <OfflineSyncIndicator />
          </div>
        </div>
      </div>
    </header>
  );
};
