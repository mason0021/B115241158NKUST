import React, { useState } from 'react';
import { GripVertical, Plus, Trash2, Users, ArrowUp, ArrowDown, HardHat, Sparkles } from 'lucide-react';
import { WorkerCraft } from '../../types/construction';

interface WorkerCraftSectionProps {
  crafts: WorkerCraft[];
  onChange: (crafts: WorkerCraft[]) => void;
}

const COMMON_CRAFT_PRESETS = [
  { name: '鋼筋工 (Rebar)', category: '結構工程' },
  { name: '模板工 (Formwork)', category: '結構工程' },
  { name: '混凝土澆置工 (Concrete)', category: '結構工程' },
  { name: '鋼構組裝與銲接工 (Welder)', category: '結構工程' },
  { name: '水電及弱電配管工 (MEP)', category: '機電工程' },
  { name: '泥作粉刷工 (Plasterer)', category: '裝修工程' },
  { name: '磁磚鋪貼工 (Tiler)', category: '裝修工程' },
  { name: '防水隔熱工 (Waterproofing)', category: '裝修工程' },
  { name: '塔吊及起重機操作手 (Operator)', category: '其他' },
  { name: '職業安全衛生管理員 (Safety)', category: '安衛管理' },
  { name: '品管查驗工程師 (QA/QC)', category: '安衛管理' },
  { name: '放樣測量工程師 (Surveyor)', category: '其他' },
  { name: '普通工與工地清潔工 (General Worker)', category: '其他' },
];

export const WorkerCraftSection: React.FC<WorkerCraftSectionProps> = ({ crafts, onChange }) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCraftName, setNewCraftName] = useState('');
  const [newCraftCategory, setNewCraftCategory] = useState<WorkerCraft['craftCategory']>('結構工程');
  const [newContractor, setNewContractor] = useState('');

  // Total daily workers
  const totalTodayWorkers = crafts.reduce((acc, c) => acc + (Number(c.todayCount) || 0), 0);
  const totalAccumulatedWorkers = crafts.reduce((acc, c) => acc + (Number(c.accumulatedCount) || 0), 0);

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', `${index}`);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const updated = [...crafts];
    const [movedItem] = updated.splice(draggedIndex, 1);
    updated.splice(dropIndex, 0, movedItem);

    // Update orders
    const reordered = updated.map((item, idx) => ({ ...item, order: idx + 1 }));
    onChange(reordered);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Move up/down fallback
  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= crafts.length) return;

    const updated = [...crafts];
    const [item] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, item);

    const reordered = updated.map((c, idx) => ({ ...c, order: idx + 1 }));
    onChange(reordered);
  };

  const handleCountChange = (id: string, count: number) => {
    const val = Math.max(0, count);
    const updated = crafts.map((c) => (c.id === id ? { ...c, todayCount: val } : c));
    onChange(updated);
  };

  const handleStepCount = (id: string, delta: number) => {
    const updated = crafts.map((c) => {
      if (c.id === id) {
        return { ...c, todayCount: Math.max(0, (c.todayCount || 0) + delta) };
      }
      return c;
    });
    onChange(updated);
  };

  const handleDeleteCraft = (id: string) => {
    if (confirm('確定要移除此工種出工欄位嗎？')) {
      const updated = crafts.filter((c) => c.id !== id).map((c, i) => ({ ...c, order: i + 1 }));
      onChange(updated);
    }
  };

  const handleAddNewCraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCraftName.trim()) return;

    const newCraft: WorkerCraft = {
      id: `c-${Date.now()}`,
      craftName: newCraftName.trim(),
      order: crafts.length + 1,
      todayCount: 0,
      accumulatedCount: 0,
      craftCategory: newCraftCategory,
      contractorName: newContractor.trim() || undefined,
    };

    onChange([...crafts, newCraft]);
    setNewCraftName('');
    setNewContractor('');
    setShowAddModal(false);
  };

  const handleAddPreset = (name: string, category: any) => {
    const exists = crafts.some((c) => c.craftName === name);
    if (exists) {
      alert(`「${name}」已存在於工種清單中！`);
      return;
    }
    const newCraft: WorkerCraft = {
      id: `c-${Date.now()}`,
      craftName: name,
      order: crafts.length + 1,
      todayCount: 0,
      accumulatedCount: 0,
      craftCategory: category,
    };
    onChange([...crafts, newCraft]);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="w-2.5 h-6 bg-amber-500 rounded-full inline-block"></span>
            各工種出工人數管理
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-300">
              今日出工總計：{totalTodayWorkers} 人
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            可自由新增自訂工種；<span className="text-amber-600 font-semibold">按住左側 ⠿ 圖示滑鼠拖曳即可自訂排序</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" /> 新增工種
          </button>
        </div>
      </div>

      {/* Quick Add Presets pills */}
      <div className="flex flex-wrap items-center gap-1.5 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
        <span className="text-slate-500 font-semibold flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" /> 常見工種快選：
        </span>
        {COMMON_CRAFT_PRESETS.slice(0, 7).map((p) => {
          const isAdded = crafts.some((c) => c.craftName === p.name);
          return (
            <button
              key={p.name}
              type="button"
              disabled={isAdded}
              onClick={() => handleAddPreset(p.name, p.category)}
              className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors ${
                isAdded
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-white hover:bg-amber-100 text-slate-700 hover:text-amber-900 border border-slate-200'
              }`}
            >
              + {p.name.split(' ')[0]}
            </button>
          );
        })}
      </div>

      {/* Craft List with Mouse Drag-and-Drop */}
      <div className="space-y-2">
        {crafts.map((craft, index) => {
          const isDragging = draggedIndex === index;
          const isOver = dragOverIndex === index;

          return (
            <div
              key={craft.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition-all ${
                isDragging
                  ? 'opacity-40 bg-amber-50 border-amber-400 shadow-lg'
                  : isOver
                  ? 'border-t-2 border-t-amber-500 bg-amber-50/60'
                  : 'bg-white hover:bg-slate-50 border-slate-200'
              }`}
            >
              {/* Drag Handle & Order */}
              <div className="flex items-center gap-3">
                <div
                  className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg cursor-grab active:cursor-grabbing transition-colors"
                  title="按住滑鼠左鍵可上下拖曳排序"
                >
                  <GripVertical className="w-5 h-5" />
                </div>

                <span className="w-5 text-center text-xs font-bold text-slate-400">
                  {index + 1}
                </span>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{craft.craftName}</span>
                    {craft.craftCategory && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold border border-slate-200">
                        {craft.craftCategory}
                      </span>
                    )}
                  </div>
                  {craft.contractorName && (
                    <span className="text-[11px] text-slate-400 block">協力廠商: {craft.contractorName}</span>
                  )}
                </div>
              </div>

              {/* Workers count input & stepper */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => handleStepCount(craft.id, -1)}
                    className="w-7 h-7 flex items-center justify-center text-sm font-bold text-slate-600 hover:bg-white rounded-lg transition-colors"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="0"
                    value={craft.todayCount}
                    onChange={(e) => handleCountChange(craft.id, Number(e.target.value))}
                    className="w-14 text-center font-bold text-sm bg-transparent outline-none text-slate-900"
                  />
                  <span className="text-xs text-slate-400 pr-1">人</span>
                  <button
                    type="button"
                    onClick={() => handleStepCount(craft.id, 1)}
                    className="w-7 h-7 flex items-center justify-center text-sm font-bold text-slate-600 hover:bg-white rounded-lg transition-colors"
                  >
                    +
                  </button>
                </div>

                {/* Arrow move fallbacks */}
                <div className="flex flex-col gap-0.5 text-slate-400">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => handleMove(index, 'up')}
                    className="p-1 hover:text-slate-800 disabled:opacity-20 rounded"
                    title="上移"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={index === crafts.length - 1}
                    onClick={() => handleMove(index, 'down')}
                    className="p-1 hover:text-slate-800 disabled:opacity-20 rounded"
                    title="下移"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => handleDeleteCraft(craft.id)}
                  className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-1"
                  title="移除工種"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Craft Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-5 space-y-4 border border-slate-200">
            <h4 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <HardHat className="w-5 h-5 text-amber-500" />
              新增工程工種
            </h4>

            <form onSubmit={handleAddNewCraft} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  工種名稱 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newCraftName}
                  onChange={(e) => setNewCraftName(e.target.value)}
                  placeholder="例：景觀植栽工、帷幕牆安裝工"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-amber-500 outline-none"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">工程分類</label>
                <select
                  value={newCraftCategory}
                  onChange={(e) => setNewCraftCategory(e.target.value as WorkerCraft['craftCategory'])}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="結構工程">結構工程</option>
                  <option value="裝修工程">裝修工程</option>
                  <option value="機電工程">機電工程</option>
                  <option value="安衛管理">安衛管理</option>
                  <option value="其他">其他</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">協力廠商 (選填)</label>
                <input
                  type="text"
                  value={newContractor}
                  onChange={(e) => setNewContractor(e.target.value)}
                  placeholder="例：宏泰帷幕工程"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg"
                >
                  確認新增
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
