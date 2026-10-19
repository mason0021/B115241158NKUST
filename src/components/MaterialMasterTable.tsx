import React, { useState } from 'react';
import { PackageCheck, Search, Filter, FlaskConical, Plus, CheckCircle2, AlertTriangle, Clock, ArrowRight, Layers } from 'lucide-react';
import { MaterialItem } from '../types/construction';
import { MaterialTestModal } from './Modals/MaterialTestModal';
import { StorageService } from '../services/storage';

interface MaterialMasterTableProps {
  materials: MaterialItem[];
  onRefresh: () => void;
}

export const MaterialMasterTable: React.FC<MaterialMasterTableProps> = ({ materials, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Material form state
  const [newName, setNewName] = useState('');
  const [newSpec, setNewSpec] = useState('');
  const [newUnit, setNewUnit] = useState('m³');
  const [newSupplier, setNewSupplier] = useState('');
  const [newLocation, setNewLocation] = useState('工區現場');

  // Filtered materials
  const filtered = materials.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.spec.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || m.testStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Aggregate stats
  const totalItems = materials.length;
  let totalSamplingRecords = 0;
  let totalPassedRecords = 0;
  let totalFailedRecords = 0;

  materials.forEach((m) => {
    totalSamplingRecords += m.samplingRecords?.length || 0;
    totalPassedRecords += m.samplingRecords?.filter((r) => r.result === '合格').length || 0;
    totalFailedRecords += m.samplingRecords?.filter((r) => r.result === '不合格').length || 0;
  });

  const overallPassRate = totalSamplingRecords > 0 ? Math.round((totalPassedRecords / totalSamplingRecords) * 100) : 100;

  const handleSaveMaterialTest = (updated: MaterialItem) => {
    StorageService.updateMaterialTestRecords(updated.name, updated.samplingRecords, updated.testStatus);
    onRefresh();
  };

  const handleAddNewMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newMat: MaterialItem = {
      id: `m-master-${Date.now()}`,
      name: newName.trim(),
      spec: newSpec.trim(),
      unit: newUnit.trim(),
      todayQuantity: 0,
      accumulatedQuantity: 0,
      storageLocation: newLocation.trim(),
      supplier: newSupplier.trim(),
      testStatus: '待取樣',
      samplingRecords: [],
    };

    // Save into current active log so it exists in store
    const today = new Date().toISOString().split('T')[0];
    const log = StorageService.getLogByDate(today);
    log.materials.push(newMat);
    StorageService.saveLog(log);

    onRefresh();
    setNewName('');
    setNewSpec('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-6 bg-emerald-600 rounded-full inline-block"></span>
              全工程材料進場及自主檢試驗總表 (Material Master Table)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              彙整全案各分包材料之規格、累積進場數量、自主取樣頻率與歷次試驗履歷
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" /> 建立新材料品項
          </button>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-xs font-medium text-slate-500 block">管制材料品項</span>
            <span className="text-2xl font-bold text-slate-900 mt-1 block">{totalItems} 項</span>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-xs font-medium text-slate-500 block">歷次取樣送驗批次</span>
            <span className="text-2xl font-bold text-blue-700 mt-1 block">{totalSamplingRecords} 批</span>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-xs font-medium text-slate-500 block">試驗合格率</span>
            <span className="text-2xl font-bold text-emerald-600 mt-1 block">{overallPassRate}%</span>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-xs font-medium text-slate-500 block">不合格批數</span>
            <span className={`text-2xl font-bold mt-1 block ${totalFailedRecords > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
              {totalFailedRecords} 批
            </span>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜尋材料名稱、規格、廠商..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-500">檢驗狀態：</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
            >
              <option value="ALL">全部狀態 ({materials.length})</option>
              <option value="試驗合格">🟢 試驗合格</option>
              <option value="取樣送驗中">🟡 取樣送驗中</option>
              <option value="待取樣">⏳ 待取樣</option>
              <option value="試驗不合格">🔴 試驗不合格</option>
              <option value="免驗">⚪ 免驗</option>
            </select>
          </div>
        </div>
      </div>

      {/* Materials Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900 text-white font-bold border-b border-slate-800">
                <th className="p-3.5 pl-5">項次</th>
                <th className="p-3.5">材料名稱 / 規格型號</th>
                <th className="p-3.5">計量單位</th>
                <th className="p-3.5">累積進場總量</th>
                <th className="p-3.5">協力廠商 / 供應商</th>
                <th className="p-3.5">存放地點</th>
                <th className="p-3.5">自主檢試驗狀態</th>
                <th className="p-3.5">歷次取樣次數</th>
                <th className="p-3.5 pr-5 text-right">操作設定</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    <PackageCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    查無符合條件的工程材料
                  </td>
                </tr>
              ) : (
                filtered.map((mat, idx) => {
                  const recordsCount = mat.samplingRecords?.length || 0;
                  const passedCount = mat.samplingRecords?.filter((r) => r.result === '合格').length || 0;

                  return (
                    <tr
                      key={mat.id || idx}
                      className="hover:bg-slate-50 transition-colors group cursor-pointer"
                      onClick={() => setSelectedMaterial(mat)}
                    >
                      <td className="p-3.5 pl-5 font-bold text-slate-400">{idx + 1}</td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 text-sm">{mat.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">{mat.spec || '依設計規範'}</div>
                      </td>
                      <td className="p-3.5 font-medium text-slate-600">{mat.unit}</td>
                      <td className="p-3.5 font-bold text-slate-900">
                        {mat.accumulatedQuantity} {mat.unit}
                      </td>
                      <td className="p-3.5 font-medium text-slate-700">{mat.supplier || '未填寫'}</td>
                      <td className="p-3.5 text-slate-600">{mat.storageLocation || '工區現場'}</td>
                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            mat.testStatus === '試驗合格'
                              ? 'bg-emerald-100 text-emerald-800'
                              : mat.testStatus === '試驗不合格'
                              ? 'bg-rose-100 text-rose-800'
                              : mat.testStatus === '取樣送驗中'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {mat.testStatus === '試驗合格' && <CheckCircle2 className="w-3 h-3" />}
                          {mat.testStatus === '試驗不合格' && <AlertTriangle className="w-3 h-3" />}
                          {mat.testStatus === '取樣送驗中' && <Clock className="w-3 h-3" />}
                          {mat.testStatus}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="font-bold text-indigo-700">
                          {recordsCount} 批
                        </span>
                        {recordsCount > 0 && (
                          <span className="text-[10px] text-slate-400 ml-1">
                            ({passedCount} 合格)
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 pr-5 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMaterial(mat);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg transition-colors border border-indigo-200"
                        >
                          <FlaskConical className="w-3.5 h-3.5" />
                          <span>設定歷次檢驗</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Material Test History Modal */}
      {selectedMaterial && (
        <MaterialTestModal
          isOpen={true}
          material={selectedMaterial}
          onClose={() => setSelectedMaterial(null)}
          onSave={handleSaveMaterialTest}
        />
      )}

      {/* Add New Material Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 border border-slate-200">
            <h4 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <PackageCheck className="w-5 h-5 text-emerald-600" />
              建立新工程材料品項
            </h4>

            <form onSubmit={handleAddNewMaterial} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  材料名稱 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="例：CNS 4000psi 預拌混凝土、高抗滲防水毯"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">規格型號</label>
                <input
                  type="text"
                  value={newSpec}
                  onChange={(e) => setNewSpec(e.target.value)}
                  placeholder="例：fc=28 MPa、耐震SD420"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">計量單位</label>
                  <input
                    type="text"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    placeholder="m³, 噸, 支, 卷"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">協力廠商</label>
                  <input
                    type="text"
                    value={newSupplier}
                    onChange={(e) => setNewSupplier(e.target.value)}
                    placeholder="例：台灣水泥股份有限公司"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">存放地點</label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="例：工區南側堆置場"
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
                  className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
                >
                  確認建立品項
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
