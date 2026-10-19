export type WeatherType = '晴' | '多雲' | '陰' | '小雨' | '大雨' | '豪雨' | '颱風';

export interface WeatherInfo {
  morning: WeatherType;
  afternoon: WeatherType;
  temperatureMin: number;
  temperatureMax: number;
  windLevel?: string;
  isImpactedByWeather: boolean;
  impactReason?: string;
}

export interface WorkItem {
  id: string;
  name: string;
  location: string;
  unit: string;
  contractQty: number;
  todayQty: number;
  accumulatedQty: number;
  progressPercent: number; // 0 - 100
  qualityStatus: '良好' | '合格' | '待改善' | '複查合格';
  notes: string;
}

export interface WorkerCraft {
  id: string;
  craftName: string; // e.g. 鋼筋工, 模板工, 泥作工, 水電工, 混凝土工, 機具操作手, 勞安管理員, 雜工
  order: number;
  todayCount: number;
  accumulatedCount: number;
  craftCategory?: '結構工程' | '裝修工程' | '機電工程' | '安衛管理' | '其他';
  contractorName?: string;
}

export interface SamplingTestRecord {
  id: string;
  date: string;
  sampleLotNumber: string; // 取樣批號
  sampleQuantity: string; // 代表數量，如 100m³, 50噸
  samplerName: string; // 取樣人員
  testItem: string; // 檢試驗項目，如 28天抗壓強度、鋼筋抗拉試驗、氯離子、坍度
  testingAgency: string; // 試驗單位，如 SGS、TAF認證實驗室、原廠
  reportNumber: string; // 試驗報告編號
  result: '合格' | '不合格' | '檢驗中' | '待試驗';
  measuredValue?: string; // 實測值，如 32.5 MPa, 480 N/mm²
  standardValue?: string; // 設計標準，如 ≧28 MPa (4000psi)
  notes?: string;
}

export interface MaterialItem {
  id: string;
  name: string; // e.g. 4000psi 預拌混凝土, SD420W D25鋼筋, 防水隔熱毯
  spec: string; // 規格尺寸
  unit: string; // m³, 噸, 支, 卷
  todayQuantity: number;
  accumulatedQuantity: number;
  storageLocation: string; // 存放位置
  supplier: string; // 協力廠商 / 供應商
  testStatus: '免驗' | '待取樣' | '取樣送驗中' | '試驗合格' | '試驗不合格';
  samplingRecords: SamplingTestRecord[];
}

export interface ConstructionPhoto {
  id: string;
  workItemName: string; // 必填：該工項名稱
  location: string; // 拍攝位置
  timestamp: string; // 拍攝時間
  description: string; // 施工說明
  dataUrl: string; // Base64 or URL
  photographer?: string; // 拍攝人
}

export interface SignatureData {
  name: string;
  signatureImage?: string; // Data URL of drawn signature
  signedAt?: string;
}

export interface DailyLog {
  id: string; // usually YYYY-MM-DD
  date: string; // YYYY-MM-DD
  projectTitle: string;
  contractor: string;
  supervisingAgency: string;
  clientAgency: string;
  contractDays: number;
  accumulatedDays: number;
  remainingDays: number;
  
  weather: WeatherInfo;
  
  // 進度
  plannedProgress: number; // 累計預定進度 %
  actualProgress: number; // 累計實際進度 %
  todayPlannedProgress?: number; // 今日預定 %
  todayActualProgress?: number; // 今日實際 %
  progressAnalysis?: string; // 進度分析與追趕對策
  
  // 工項與出工
  workItems: WorkItem[];
  workerCrafts: WorkerCraft[];
  
  // 材料與照片
  materials: MaterialItem[];
  photos: ConstructionPhoto[];
  
  // 重要記事 / 工地安全查驗
  safetyNotes: string;
  machineryEquipment: string; // 出動機具 (如：50T吊車 1台、挖掘機 2台)
  generalNotes: string; // 施工協調、主管指示事項
  
  // 簽核
  reportedBy: SignatureData;
  reviewedBy: SignatureData;
  reviewStatus: '草稿' | '待簽核' | '已核准' | '需修正';
  reviewComments?: string;
  
  // 同步狀態
  syncStatus: 'synced' | 'pending' | 'conflict';
  updatedAt: string;
}

export interface MonthlySummary {
  month: string; // YYYY-MM
  totalDays: number;
  workDays: number;
  rainDays: number;
  totalWorkerCount: number;
  avgDailyWorkerCount: number;
  startProgress: number;
  endProgress: number;
  progressGained: number;
  totalMaterialsCount: number;
  dailyStats: {
    date: string;
    plannedProgress: number;
    actualProgress: number;
    workerCount: number;
    weather: string;
    workItemsCount: number;
  }[];
  craftBreakdown: {
    craftName: string;
    totalManDays: number;
  }[];
}
