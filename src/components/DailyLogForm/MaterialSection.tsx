import React, { useState } from 'react';
import { PackageCheck, Plus, Trash2, FlaskConical, CheckCircle2, AlertTriangle, Clock, ArrowRight, ExternalLink } from 'lucide-react';
import { MaterialItem } from '../../types/construction';

interface MaterialSectionProps {
  materials: MaterialItem[];
  onChange: (materials: MaterialItem[]) => void;
  onOpenTestModal: (material: MaterialItem) => void;
  onNavigateToMasterTable?: () => void;
}

const COMMON_MATERIAL_PRESETS: Partial<MaterialItem>[] = [
  { name: 'CNS 4000psi 卜特蘭I型預拌混凝土', spec: 'fc=28 MPa, 坍度15±3cm', unit: 'm³', todayQuantity: 120, storageLocation: '現澆柱樑樓板', supplier: '台灣水泥', testStatus: '試驗合格' },
  { name: '熱軋竹節鋼筋 SD420W D25 (#8)', spec: '高拉力抗震螺紋鋼筋', unit: '噸', todayQuantity: 30, storageLocation: '工區南側鋼筋堆置場', supplier: '東和鋼鐵', testStatus: '試驗合格' },
  { name: '自黏性改質瀝青防水毯 (4mm)', spec: '聚酯抗裂複合胎 1m x 10m', unit: '卷', todayQuantity: 50, storageLocation: 'B1F 庫房', supplier: '國碳材料', testStatus: '試驗合格' },
  { name: '高強度無收縮水泥砂漿', spec: '25kg/包, 最終強度 ≧60MPa', unit: '包', todayQuantity: 60, storageLocation: '1F 防雨棧板區', supplier: '漢高台灣', testStatus: '取樣送驗中' },
  { name: 'PVC 電氣導管 (2英吋)', spec: '厚度4.0mm 耐衝擊型', unit: '支', todayQuantity: 200, storageLocation: 'B2F 水電材料間', supplier: '南亞塑膠', testStatus: '免驗' },
];

export const MaterialSection: React.FC<MaterialSectionProps> = ({
  materials,
  onChange,
  onOpenTestModal,
  onNavigateToMasterTable,
}) => {
  const [showAddPreset, setShowAddPreset] = useState(false);

  const handleAddMaterial = (preset?: Partial<MaterialItem>) => {
    const newMat: MaterialItem = {
      id: `m-${Date.now()}`,
      name: preset?.name || '',
      spec: preset?.spec || '',
      unit: preset?.unit || 'm³',
      todayQuantity: preset?.todayQuantity || 0,
      accumulatedQuantity: preset?.todayQuantity || 0,
      storageLocation: preset?.storageLocation || '現場工區指定庫房',
      supplier: preset?.supplier || '',
      testStatus: preset?.testStatus || '待取樣',
      samplingRecords: [],
    };
    onChange([...materials, newMat]);
    setShowAddPreset(false);
  };

  const handleUpdate = (id: string, field: keyof MaterialItem, val: any) => {
    const updated = materials.map((m) => (m.id === id ? { ...m, [field]: val } : m));
    onChange(updated);
  };

  const handleDelete = (id: string) => {
    onChange(materials.filter((m) => m.id !== id));
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="w-2.5 h-6 bg-emerald-600 rounded-full inline-block"></span>
            材料進場與自主檢試驗
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
              {materials.length} 項進場材料
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            登載今日進場材料數量；<span className="text-emerald-700 font-semibold">點選任一材料可設定歷次取樣與檢試驗結果</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateToMasterTable && (
            <button
              type="button"
              onClick={onNavigateToMasterTable}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors border border-emerald-200"
            >
              <ExternalLink className="w-3.5 h-3.5" /> 查看全工程材料總表
            </button>
          )}

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowAddPreset(!showAddPreset)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              常用材料帶入
            </button>

            {showAddPreset && (
              <div className="absolute right-0 top-9 z-20 w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-2 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 px-2 py-1 block">選擇快速帶入進場材料：</span>
                {COMMON_MATERIAL_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddMaterial(p)}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-emerald-50 hover:text-emerald-800 font-medium transition-colors"
                  >
                    {p.name} ({p.unit})
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => handleAddMaterial()}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" /> 新增進場材料
          </button>
        </div>
      </div>

      {materials.length === 0 ? (
        <div className="text-center py-10 bg-slate-50 border border-dashed border-slate-300 rounded-xl">
          <PackageCheck className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-50" />
          <p className="text-xs font-medium text-slate-600">本日無材料進場登載</p>
          <button
            type="button"
            onClick={() => handleAddMaterial()}
            className="mt-2 text-xs font-bold text-emerald-600 hover:underline"
          >
            + 立即新增材料進場
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {materials.map((mat) => {
            const recordsCount = mat.samplingRecords?.length || 0;
            const passedCount = mat.samplingRecords?.filter((r) => r.result === '合格').length || 0;

            return (
              <div
                key={mat.id}
                className="p-4 bg-slate-50/70 hover:bg-slate-50 border border-slate-200 rounded-xl transition-all space-y-3 group"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      value={mat.name}
                      onChange={(e) => handleUpdate(mat.id, 'name', e.target.value)}
                      placeholder="材料名稱 (例：CNS 4000psi 預拌混凝土)"
                      className="w-full max-w-sm px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    <input
                      type="text"
                      value={mat.spec}
                      onChange={(e) => handleUpdate(mat.id, 'spec', e.target.value)}
                      placeholder="規格 / 型號"
                      className="hidden sm:block w-48 px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>

                  {/* Test Modal Trigger Button & Badges */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenTestModal(mat)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold transition-colors"
                      title="點進該材料後可以設定歷次取樣及檢試驗的結果"
                    >
                      <FlaskConical className="w-3.5 h-3.5 text-indigo-600" />
                      <span>
                        設定歷次取樣檢試驗 ({recordsCount} 筆)
                      </span>
                      <ArrowRight className="w-3 h-3 text-indigo-500" />
                    </button>

                    <span
                      className={`text-xs font-bold px-2 py-1 rounded-lg border ${
                        mat.testStatus === '試驗合格'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : mat.testStatus === '試驗不合格'
                          ? 'bg-rose-50 text-rose-800 border-rose-300'
                          : mat.testStatus === '取樣送驗中'
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : 'bg-slate-100 text-slate-700 border-slate-300'
                      }`}
                    >
                      {mat.testStatus}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleDelete(mat.id)}
                      className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="刪除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Material fields row */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">單位</label>
                    <input
                      type="text"
                      value={mat.unit}
                      onChange={(e) => handleUpdate(mat.id, 'unit', e.target.value)}
                      placeholder="m³, 噸, 支"
                      className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">今日進場數量</label>
                    <input
                      type="number"
                      value={mat.todayQuantity}
                      onChange={(e) => handleUpdate(mat.id, 'todayQuantity', Number(e.target.value))}
                      className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg font-bold text-emerald-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">累計進場量</label>
                    <input
                      type="number"
                      value={mat.accumulatedQuantity}
                      onChange={(e) => handleUpdate(mat.id, 'accumulatedQuantity', Number(e.target.value))}
                      className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg font-bold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">存放地點</label>
                    <input
                      type="text"
                      value={mat.storageLocation}
                      onChange={(e) => handleUpdate(mat.id, 'storageLocation', e.target.value)}
                      placeholder="例：工區南側堆置場"
                      className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">供應商 / 協力廠</label>
                    <input
                      type="text"
                      value={mat.supplier}
                      onChange={(e) => handleUpdate(mat.id, 'supplier', e.target.value)}
                      placeholder="例：台灣水泥"
                      className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                {/* Sampling summary strip */}
                {recordsCount > 0 && (
                  <div className="flex items-center justify-between text-xs bg-indigo-50/50 px-3 py-1.5 rounded-lg border border-indigo-100">
                    <span className="text-indigo-900 font-medium">
                      🧪 取樣試驗歷程：共 {recordsCount} 批次紀錄，合格 {passedCount} 批
                    </span>
                    <button
                      type="button"
                      onClick={() => onOpenTestModal(mat)}
                      className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline"
                    >
                      檢視歷次試驗報告 &gt;
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
