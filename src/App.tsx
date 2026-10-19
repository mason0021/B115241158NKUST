/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { DailyLog, MaterialItem } from './types/construction';
import { StorageService, SYNC_EVENT_NAME } from './services/storage';
import { SAMPLE_TODAY_DATE } from './mock/initialData';
import { Header, ActiveTab } from './components/Header';
import { BasicInfo } from './components/DailyLogForm/BasicInfo';
import { WorkItemsSection } from './components/DailyLogForm/WorkItemsSection';
import { WorkerCraftSection } from './components/DailyLogForm/WorkerCraftSection';
import { MaterialSection } from './components/DailyLogForm/MaterialSection';
import { PhotoSection } from './components/DailyLogForm/PhotoSection';
import { ApprovalSection } from './components/DailyLogForm/ApprovalSection';
import { MaterialMasterTable } from './components/MaterialMasterTable';
import { MonthlyReportView } from './components/MonthlyReportView';
import { PdfExportView } from './components/PdfExportView';
import { BackupView } from './components/BackupView';
import { MaterialTestModal } from './components/Modals/MaterialTestModal';

export default function App() {
  const [currentDate, setCurrentDate] = useState<string>(SAMPLE_TODAY_DATE);
  const [log, setLog] = useState<DailyLog>(() => StorageService.getLogByDate(SAMPLE_TODAY_DATE));
  const [activeTab, setActiveTab] = useState<ActiveTab>('log');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTestMaterial, setActiveTestMaterial] = useState<MaterialItem | null>(null);

  // Load log whenever currentDate changes
  useEffect(() => {
    const loaded = StorageService.getLogByDate(currentDate);
    setLog(loaded);
  }, [currentDate]);

  // Listen to external sync updates or resets
  useEffect(() => {
    const handleSync = () => {
      setLog(StorageService.getLogByDate(currentDate));
    };
    window.addEventListener(SYNC_EVENT_NAME, handleSync);
    return () => window.removeEventListener(SYNC_EVENT_NAME, handleSync);
  }, [currentDate]);

  const handleLogChange = (updated: Partial<DailyLog>) => {
    setLog((prev) => {
      const next = { ...prev, ...updated };
      return next;
    });
  };

  const handleSave = useCallback(() => {
    setIsSaving(true);
    StorageService.saveLog(log);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    }, 200);
  }, [log]);

  const handleSaveMaterialTest = (updatedMat: MaterialItem) => {
    StorageService.updateMaterialTestRecords(
      updatedMat.name,
      updatedMat.samplingRecords,
      updatedMat.testStatus
    );
    // Also update current log state if present
    setLog((prev) => ({
      ...prev,
      materials: prev.materials.map((m) =>
        m.name.trim() === updatedMat.name.trim() ? updatedMat : m
      ),
    }));
    setActiveTestMaterial(null);
  };

  const allMaterials = StorageService.getAllMaterials();

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      {/* Top Navigation Bar */}
      <Header
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSave={handleSave}
        isSaving={isSaving}
        saveSuccess={saveSuccess}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab 1: Daily Log Form */}
        {activeTab === 'log' && (
          <div className="space-y-6">
            {/* 1. Basic Info & Weather & Progress */}
            <BasicInfo log={log} onChange={handleLogChange} />

            {/* 2. Work Items Section */}
            <WorkItemsSection
              workItems={log.workItems}
              onChange={(workItems) => handleLogChange({ workItems })}
            />

            {/* 3. Worker Crafts Section (Drag-and-Drop Reordering) */}
            <WorkerCraftSection
              crafts={log.workerCrafts}
              onChange={(workerCrafts) => handleLogChange({ workerCrafts })}
            />

            {/* 4. Materials Delivered & Sampling Link */}
            <MaterialSection
              materials={log.materials}
              onChange={(materials) => handleLogChange({ materials })}
              onOpenTestModal={(mat) => setActiveTestMaterial(mat)}
              onNavigateToMasterTable={() => setActiveTab('material_master')}
            />

            {/* 5. Photos Upload & Display (Work item name asked before upload & shown below) */}
            <PhotoSection
              photos={log.photos}
              workItems={log.workItems}
              onChange={(photos) => handleLogChange({ photos })}
            />

            {/* 6. Approval & Digital Signatures */}
            <ApprovalSection log={log} onChange={handleLogChange} />

            {/* Bottom Save Bar */}
            <div className="no-print bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <span className="text-xs text-slate-500">
                施工日誌填報完成後，請點擊「儲存日誌」以保留最新修改 (離線時自動快取，聯網後自動同步)
              </span>
              <button
                type="button"
                onClick={handleSave}
                className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
              >
                {saveSuccess ? '✓ 已成功儲存當日日誌' : '儲存當日日誌'}
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Material Master Table */}
        {activeTab === 'material_master' && (
          <MaterialMasterTable
            materials={allMaterials}
            onRefresh={() => setLog(StorageService.getLogByDate(currentDate))}
          />
        )}

        {/* Tab 3: Monthly Summary & Charts */}
        {activeTab === 'monthly' && (
          <MonthlyReportView
            currentDate={currentDate}
            onSelectDate={(newDate) => {
              setCurrentDate(newDate);
              setActiveTab('log');
            }}
          />
        )}

        {/* Tab 4: PDF Export Preview */}
        {activeTab === 'pdf' && (
          <PdfExportView log={log} onBack={() => setActiveTab('log')} />
        )}

        {/* Tab 5: Backup & Offline Storage */}
        {activeTab === 'backup' && (
          <BackupView
            onRefresh={() => setLog(StorageService.getLogByDate(currentDate))}
          />
        )}
      </main>

      {/* Global Material Sampling Test Modal */}
      {activeTestMaterial && (
        <MaterialTestModal
          isOpen={true}
          material={activeTestMaterial}
          onClose={() => setActiveTestMaterial(null)}
          onSave={handleSaveMaterialTest}
        />
      )}
    </div>
  );
}
