import { DailyLog, MonthlySummary, MaterialItem, WorkerCraft } from '../types/construction';
import { INITIAL_LOGS, DEFAULT_PROJECT_INFO, DEFAULT_CRAFTS } from '../mock/initialData';

const STORAGE_KEY = 'construction_daily_logs_v2';
const PENDING_SYNC_KEY = 'construction_pending_sync_v2';
const LAST_SYNC_KEY = 'construction_last_sync_timestamp';

// Broadcast channel or custom event for cross-component sync reactivity
export const SYNC_EVENT_NAME = 'construction_sync_state_changed';

export class StorageService {
  private static logsCache: DailyLog[] | null = null;

  public static getLogs(): DailyLog[] {
    if (this.logsCache) return this.logsCache;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.logsCache = JSON.parse(stored);
        return this.logsCache!;
      }
    } catch (e) {
      console.warn('Failed to read logs from localStorage', e);
    }

    // Default to mock initial logs
    this.logsCache = [...INITIAL_LOGS];
    this.saveLogs(this.logsCache, false);
    return this.logsCache;
  }

  public static getLogByDate(date: string): DailyLog {
    const logs = this.getLogs();
    const existing = logs.find((l) => l.date === date);
    if (existing) return existing;

    // Create a new blank or template log based on previous day or defaults
    const prevLog = logs.sort((a, b) => b.date.localeCompare(a.date))[0];
    const newLog: DailyLog = {
      id: date,
      date,
      projectTitle: DEFAULT_PROJECT_INFO.title,
      contractor: DEFAULT_PROJECT_INFO.contractor,
      supervisingAgency: DEFAULT_PROJECT_INFO.supervisingAgency,
      clientAgency: DEFAULT_PROJECT_INFO.clientAgency,
      contractDays: DEFAULT_PROJECT_INFO.contractDays,
      accumulatedDays: prevLog ? prevLog.accumulatedDays + 1 : 216,
      remainingDays: prevLog ? Math.max(0, prevLog.remainingDays - 1) : 504,
      weather: {
        morning: '晴',
        afternoon: '多雲',
        temperatureMin: 23,
        temperatureMax: 29,
        isImpactedByWeather: false,
      },
      plannedProgress: prevLog ? Number((prevLog.plannedProgress + 0.18).toFixed(2)) : 37.0,
      actualProgress: prevLog ? Number((prevLog.actualProgress + 0.18).toFixed(2)) : 37.0,
      todayPlannedProgress: 0.18,
      todayActualProgress: 0.18,
      progressAnalysis: '今日各工作面持續按進度推展。',
      workItems: prevLog ? prevLog.workItems.map((w, idx) => ({ ...w, id: `w-new-${idx}-${Date.now()}`, todayQty: 0 })) : [],
      workerCrafts: prevLog ? prevLog.workerCrafts.map(c => ({ ...c })) : DEFAULT_CRAFTS.map(c => ({ ...c })),
      materials: prevLog ? prevLog.materials.map(m => ({ ...m, todayQuantity: 0 })) : [],
      photos: [],
      safetyNotes: '每日例行工具箱會議與高架作業防墜措施檢點。全日無工安意外。',
      machineryEquipment: '50T 塔吊1台、發電機1台。',
      generalNotes: '依進度推展各工項施作。',
      reportedBy: { name: '林志豪 (工地主任)' },
      reviewedBy: { name: '張國榮 (專任工程人員)' },
      reviewStatus: '草稿',
      syncStatus: navigator.onLine ? 'synced' : 'pending',
      updatedAt: new Date().toISOString(),
    };

    return newLog;
  }

  public static saveLog(log: DailyLog): { success: boolean; syncStatus: 'synced' | 'pending' } {
    const isOnline = navigator.onLine;
    const syncStatus: 'synced' | 'pending' = isOnline ? 'synced' : 'pending';

    const updatedLog: DailyLog = {
      ...log,
      syncStatus,
      updatedAt: new Date().toISOString(),
    };

    const logs = this.getLogs();
    const index = logs.findIndex((l) => l.date === log.date);
    if (index >= 0) {
      logs[index] = updatedLog;
    } else {
      logs.unshift(updatedLog);
      logs.sort((a, b) => b.date.localeCompare(a.date));
    }

    this.saveLogs(logs, true);

    if (!isOnline) {
      this.addToPendingQueue(updatedLog.id);
    } else {
      this.removeFromPendingQueue(updatedLog.id);
      this.updateLastSyncTime();
    }

    window.dispatchEvent(new CustomEvent(SYNC_EVENT_NAME, { detail: { syncStatus, logId: log.id } }));
    return { success: true, syncStatus };
  }

  public static deleteLog(date: string): boolean {
    const logs = this.getLogs();
    const filtered = logs.filter((l) => l.date !== date);
    this.saveLogs(filtered, true);
    this.removeFromPendingQueue(date);
    window.dispatchEvent(new CustomEvent(SYNC_EVENT_NAME, { detail: { action: 'delete', date } }));
    return true;
  }

  private static saveLogs(logs: DailyLog[], persist = true) {
    this.logsCache = logs;
    if (persist) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
      } catch (e) {
        console.error('Failed to save logs to localStorage', e);
      }
    }
  }

  // Pending queue management
  public static getPendingSyncCount(): number {
    try {
      const q = localStorage.getItem(PENDING_SYNC_KEY);
      if (!q) return 0;
      const ids: string[] = JSON.parse(q);
      return ids.length;
    } catch {
      return 0;
    }
  }

  private static addToPendingQueue(id: string) {
    try {
      const q = localStorage.getItem(PENDING_SYNC_KEY);
      const ids: string[] = q ? JSON.parse(q) : [];
      if (!ids.includes(id)) {
        ids.push(id);
        localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(ids));
      }
    } catch (e) {
      console.warn(e);
    }
  }

  private static removeFromPendingQueue(id: string) {
    try {
      const q = localStorage.getItem(PENDING_SYNC_KEY);
      if (!q) return;
      const ids: string[] = JSON.parse(q);
      const filtered = ids.filter((item) => item !== id);
      localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(filtered));
    } catch (e) {
      console.warn(e);
    }
  }

  public static updateLastSyncTime() {
    localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
  }

  public static getLastSyncTime(): string | null {
    return localStorage.getItem(LAST_SYNC_KEY);
  }

  // Auto-sync process when network is restored
  public static async syncPendingLogs(): Promise<{ syncedCount: number }> {
    if (!navigator.onLine) {
      return { syncedCount: 0 };
    }

    const logs = this.getLogs();
    let syncedCount = 0;

    // Simulate network round-trip latency (e.g. 300ms)
    await new Promise((resolve) => setTimeout(resolve, 400));

    logs.forEach((log) => {
      if (log.syncStatus === 'pending') {
        log.syncStatus = 'synced';
        syncedCount++;
        this.removeFromPendingQueue(log.id);
      }
    });

    if (syncedCount > 0) {
      this.saveLogs(logs, true);
    }
    this.updateLastSyncTime();

    window.dispatchEvent(
      new CustomEvent(SYNC_EVENT_NAME, {
        detail: { action: 'sync_completed', syncedCount },
      })
    );

    return { syncedCount };
  }

  // Get aggregated material master list across all logs
  public static getAllMaterials(): MaterialItem[] {
    const logs = this.getLogs();
    const materialMap = new Map<string, MaterialItem>();

    logs.forEach((log) => {
      log.materials.forEach((mat) => {
        const key = mat.name.trim();
        if (!materialMap.has(key)) {
          materialMap.set(key, {
            ...mat,
            todayQuantity: 0,
            samplingRecords: [...mat.samplingRecords],
          });
        } else {
          const existing = materialMap.get(key)!;
          // merge sampling records without duplicates by ID
          const existingIds = new Set(existing.samplingRecords.map((r) => r.id));
          mat.samplingRecords.forEach((rec) => {
            if (!existingIds.has(rec.id)) {
              existing.samplingRecords.push(rec);
              existingIds.add(rec.id);
            }
          });
        }
      });
    });

    return Array.from(materialMap.values());
  }

  // Save/Update sampling test record into all matching materials across logs
  public static updateMaterialTestRecords(materialName: string, records: MaterialItem['samplingRecords'], testStatus: MaterialItem['testStatus']) {
    const logs = this.getLogs();
    logs.forEach((log) => {
      log.materials.forEach((mat) => {
        if (mat.name.trim() === materialName.trim()) {
          mat.samplingRecords = [...records];
          mat.testStatus = testStatus;
        }
      });
    });
    this.saveLogs(logs, true);
    window.dispatchEvent(new CustomEvent(SYNC_EVENT_NAME, { detail: { action: 'material_updated', materialName } }));
  }

  // Generate Monthly Aggregations
  public static getMonthlySummary(yearMonth: string): MonthlySummary {
    const logs = this.getLogs().filter((l) => l.date.startsWith(yearMonth));
    logs.sort((a, b) => a.date.localeCompare(b.date));

    const totalDays = logs.length;
    let rainDays = 0;
    let workDays = 0;
    let totalWorkerCount = 0;
    const craftMap = new Map<string, number>();

    logs.forEach((l) => {
      const isRain = l.weather.morning.includes('雨') || l.weather.afternoon.includes('雨');
      if (isRain) rainDays++;
      if (!l.weather.isImpactedByWeather) workDays++;

      const dailyWorkers = l.workerCrafts.reduce((sum, c) => sum + (Number(c.todayCount) || 0), 0);
      totalWorkerCount += dailyWorkers;

      l.workerCrafts.forEach((c) => {
        const count = craftMap.get(c.craftName) || 0;
        craftMap.set(c.craftName, count + (Number(c.todayCount) || 0));
      });
    });

    const startProgress = logs.length > 0 ? logs[0].actualProgress : 0;
    const endProgress = logs.length > 0 ? logs[logs.length - 1].actualProgress : 0;
    const progressGained = Number((endProgress - startProgress).toFixed(2));

    const dailyStats = logs.map((l) => ({
      date: l.date,
      plannedProgress: l.plannedProgress,
      actualProgress: l.actualProgress,
      workerCount: l.workerCrafts.reduce((s, c) => s + (Number(c.todayCount) || 0), 0),
      weather: `${l.weather.morning}/${l.weather.afternoon}`,
      workItemsCount: l.workItems.length,
    }));

    const craftBreakdown = Array.from(craftMap.entries()).map(([craftName, totalManDays]) => ({
      craftName,
      totalManDays,
    })).sort((a, b) => b.totalManDays - a.totalManDays);

    return {
      month: yearMonth,
      totalDays,
      workDays,
      rainDays,
      totalWorkerCount,
      avgDailyWorkerCount: totalDays > 0 ? Math.round(totalWorkerCount / totalDays) : 0,
      startProgress,
      endProgress,
      progressGained,
      totalMaterialsCount: this.getAllMaterials().length,
      dailyStats,
      craftBreakdown,
    };
  }

  // Backup & Restore
  public static exportBackupJson(): string {
    return JSON.stringify(this.getLogs(), null, 2);
  }

  public static importBackupJson(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed)) {
        this.saveLogs(parsed, true);
        window.dispatchEvent(new CustomEvent(SYNC_EVENT_NAME, { detail: { action: 'backup_restored' } }));
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  }

  public static resetToDefault() {
    this.saveLogs([...INITIAL_LOGS], true);
    localStorage.removeItem(PENDING_SYNC_KEY);
    this.updateLastSyncTime();
    window.dispatchEvent(new CustomEvent(SYNC_EVENT_NAME, { detail: { action: 'reset' } }));
  }
}
