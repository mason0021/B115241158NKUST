import React, { useState } from 'react';
import { Plus, Trash2, CheckCircle, Wrench, Layers, AlertCircle, Sparkles } from 'lucide-react';
import { WorkItem } from '../../types/construction';

interface WorkItemsSectionProps {
  workItems: WorkItem[];
  onChange: (items: WorkItem[]) => void;
}

const COMMON_PRESETS: Partial<WorkItem>[] = [
  { name: '4F 梁柱接頭與樓板鋼筋綁紮', location: 'A棟 4F (X1-X5軸)', unit: '噸', contractQty: 45, todayQty: 8.5, qualityStatus: '合格', notes: '主筋錨定與搭接長度查驗合格' },
  { name: '4F 梁底及側模組立支撐作業', location: 'A棟 4F 梁位', unit: 'm²', contractQty: 420, todayQty: 80, qualityStatus: '良好', notes: '雷射水平儀複核無變形' },
  { name: '結構混凝土澆置 (4000psi)', location: 'A棟 3F 樓板及柱', unit: 'm³', contractQty: 220, todayQty: 145, qualityStatus: '合格', notes: '坍度與氯離子檢測合格' },
  { name: '地下二層外牆自黏式防水毯鋪設', location: 'B棟 B2F 外壁', unit: 'm²', contractQty: 180, todayQty: 45, qualityStatus: '合格', notes: '搭接10cm熱風壓實無氣泡' },
  { name: '給排水及電氣消防管路預埋', location: '3F 梯廳走道', unit: '處', contractQty: 40, todayQty: 10, qualityStatus: '合格', notes: '管路避震與固定卡箍牢固' },
  { name: '室內輕隔間牆骨架立柱組立', location: '2F 辦公區', unit: 'm²', contractQty: 350, todayQty: 60, qualityStatus: '良好', notes: '垂直平整度誤差小於3mm' },
];

export const WorkItemsSection: React.FC<WorkItemsSectionProps> = ({ workItems, onChange }) => {
  const [showPresets, setShowPresets] = useState(false);

  const handleAddItem = (preset?: Partial<WorkItem>) => {
    const newItem: WorkItem = {
      id: `w-${Date.now()}`,
      name: preset?.name || '',
      location: preset?.location || '',
      unit: preset?.unit || 'm²',
      contractQty: preset?.contractQty || 100,
      todayQty: preset?.todayQty || 10,
      accumulatedQty: preset?.todayQty || 10,
      progressPercent: 20,
      qualityStatus: preset?.qualityStatus || '合格',
      notes: preset?.notes || '',
    };
    onChange([...workItems, newItem]);
    setShowPresets(false);
  };

  const handleUpdateItem = (id: string, field: keyof WorkItem, value: any) => {
    const updated = workItems.map((item) => {
      if (item.id === id) {
        const next = { ...item, [field]: value };
        // Auto compute progress percent if contractQty is valid
        if (field === 'accumulatedQty' || field === 'contractQty') {
          const acc = field === 'accumulatedQty' ? Number(value) : item.accumulatedQty;
          const total = field === 'contractQty' ? Number(value) : item.contractQty;
          if (total > 0) {
            next.progressPercent = Math.min(100, Math.round((acc / total) * 100));
          }
        }
        return next;
      }
      return item;
    });
    onChange(updated);
  };

  const handleDeleteItem = (id: string) => {
    onChange(workItems.filter((item) => item.id !== id));
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="w-2.5 h-6 bg-blue-600 rounded-full inline-block"></span>
            施作工項與工程進度
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200">
              {workItems.length} 個工項
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            登載本日各施工工作面、完成數量、累積進度與品質自主檢查狀態
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowPresets(!showPresets)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> 常用工項範本
            </button>

            {showPresets && (
              <div className="absolute right-0 top-9 z-20 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-2 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 px-2 py-1 block">點擊快速加入施作工項：</span>
                {COMMON_PRESETS.map((preset, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleAddItem(preset)}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-blue-50 hover:text-blue-700 font-medium transition-colors"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => handleAddItem()}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" /> 新增工項
          </button>
        </div>
      </div>

      {workItems.length === 0 ? (
        <div className="text-center py-10 bg-slate-50 border border-dashed border-slate-300 rounded-xl">
          <Layers className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-50" />
          <p className="text-xs font-medium text-slate-600">本日尚未登載施作工項</p>
          <button
            type="button"
            onClick={() => handleAddItem()}
            className="mt-2 text-xs font-bold text-blue-600 hover:underline"
          >
            + 立即新增施作工項
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {workItems.map((item, index) => (
            <div
              key={item.id}
              className="p-4 bg-slate-50/80 hover:bg-slate-50 border border-slate-200 rounded-xl space-y-3 transition-colors relative group"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleUpdateItem(item.id, 'name', e.target.value)}
                    placeholder="施作工項名稱 (例：4F 樓板結構混凝土澆置)"
                    className="w-full max-w-md px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={item.qualityStatus}
                    onChange={(e) => handleUpdateItem(item.id, 'qualityStatus', e.target.value)}
                    className={`text-xs font-bold px-2.5 py-1 rounded-lg border outline-none ${
                      item.qualityStatus === '合格' || item.qualityStatus === '良好' || item.qualityStatus === '複查合格'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-rose-50 text-rose-800 border-rose-300'
                    }`}
                  >
                    <option value="良好">自主檢查：優良</option>
                    <option value="合格">自主檢查：合格</option>
                    <option value="待改善">自主檢查：待改善</option>
                    <option value="複查合格">自主檢查：複查合格</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="刪除工項"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Progress & Quantities Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">施工位置</label>
                  <input
                    type="text"
                    value={item.location}
                    onChange={(e) => handleUpdateItem(item.id, 'location', e.target.value)}
                    placeholder="例：A棟 4F"
                    className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">單位</label>
                  <input
                    type="text"
                    value={item.unit}
                    onChange={(e) => handleUpdateItem(item.id, 'unit', e.target.value)}
                    placeholder="m², 噸, 處"
                    className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">契約設計量</label>
                  <input
                    type="number"
                    value={item.contractQty}
                    onChange={(e) => handleUpdateItem(item.id, 'contractQty', Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">本日施作量</label>
                  <input
                    type="number"
                    value={item.todayQty}
                    onChange={(e) => handleUpdateItem(item.id, 'todayQty', Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg font-bold text-blue-700"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">累計施作量</label>
                  <input
                    type="number"
                    value={item.accumulatedQty}
                    onChange={(e) => handleUpdateItem(item.id, 'accumulatedQty', Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    完成度: {item.progressPercent}%
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={item.progressPercent}
                      onChange={(e) => handleUpdateItem(item.id, 'progressPercent', Number(e.target.value))}
                      className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <input
                  type="text"
                  value={item.notes}
                  onChange={(e) => handleUpdateItem(item.id, 'notes', e.target.value)}
                  placeholder="施作備註說明 (例：現場查驗主筋搭接長度合格，墊塊保護層足夠)"
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 placeholder:text-slate-400"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
