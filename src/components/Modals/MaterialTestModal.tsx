import React, { useState } from 'react';
import { X, Plus, CheckCircle2, AlertTriangle, Clock, FlaskConical, Trash2, FileCheck2, BarChart2 } from 'lucide-react';
import { MaterialItem, SamplingTestRecord } from '../../types/construction';

interface MaterialTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  material: MaterialItem | null;
  onSave: (updatedMaterial: MaterialItem) => void;
}

export const MaterialTestModal: React.FC<MaterialTestModalProps> = ({
  isOpen,
  onClose,
  material,
  onSave,
}) => {
  if (!isOpen || !material) return null;

  const [testStatus, setTestStatus] = useState<MaterialItem['testStatus']>(material.testStatus);
  const [records, setRecords] = useState<SamplingTestRecord[]>(material.samplingRecords || []);
  const [showAddForm, setShowAddForm] = useState(false);

  // New record form state
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newLotNumber, setNewLotNumber] = useState('');
  const [newQuantity, setNewQuantity] = useState('');
  const [newSampler, setNewSampler] = useState('品管工程師');
  const [newTestItem, setNewTestItem] = useState('');
  const [newAgency, setNewAgency] = useState('SGS 台灣檢驗 (TAF實驗室)');
  const [newReportNum, setNewReportNum] = useState('');
  const [newResult, setNewResult] = useState<SamplingTestRecord['result']>('合格');
  const [newMeasured, setNewMeasured] = useState('');
  const [newStandard, setNewStandard] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Stats
  const totalTests = records.length;
  const passedTests = records.filter((r) => r.result === '合格').length;
  const failedTests = records.filter((r) => r.result === '不合格').length;
  const pendingTests = records.filter((r) => r.result === '檢驗中' || r.result === '待試驗').length;
  const passRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 100;

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTestItem.trim()) {
      alert('請填寫檢試驗項目');
      return;
    }

    const newRecord: SamplingTestRecord = {
      id: `sr-${Date.now()}`,
      date: newDate,
      sampleLotNumber: newLotNumber.trim() || `LOT-${Date.now().toString().slice(-6)}`,
      sampleQuantity: newQuantity.trim() || '依規定抽樣數量',
      samplerName: newSampler.trim() || '品管人員',
      testItem: newTestItem.trim(),
      testingAgency: newAgency.trim() || 'TAF 認證檢驗機構',
      reportNumber: newReportNum.trim() || `REP-${Date.now().toString().slice(-6)}`,
      result: newResult,
      measuredValue: newMeasured.trim() || '符合設計規範',
      standardValue: newStandard.trim() || '依工程施工規範標準',
      notes: newNotes.trim(),
    };

    const updated = [newRecord, ...records];
    setRecords(updated);

    // Auto set overall test status if needed
    if (newResult === '不合格') {
      setTestStatus('試驗不合格');
    } else if (newResult === '檢驗中') {
      if (testStatus !== '試驗不合格') setTestStatus('取樣送驗中');
    } else if (newResult === '合格' && testStatus !== '試驗不合格') {
      setTestStatus('試驗合格');
    }

    // Reset form
    setNewLotNumber('');
    setNewQuantity('');
    setNewTestItem('');
    setNewReportNum('');
    setNewMeasured('');
    setNewStandard('');
    setNewNotes('');
    setShowAddForm(false);
  };

  const handleDeleteRecord = (id: string) => {
    if (confirm('確定要刪除這筆檢試驗紀錄嗎？')) {
      const updated = records.filter((r) => r.id !== id);
      setRecords(updated);
    }
  };

  const handleSaveAll = () => {
    onSave({
      ...material,
      testStatus,
      samplingRecords: records,
    });
    onClose();
  };

  // Helper presets for quick construction testing entries
  const handleApplyPreset = (type: string) => {
    if (type === 'concrete_28d') {
      setNewTestItem('28天混凝土圓柱試體抗壓強度試驗 (ASTM C39)');
      setNewStandard('≧ 28.0 MPa (4000 psi)');
      setNewMeasured('平均 33.2 MPa (118.5% 設計強度)');
      setNewResult('合格');
      setNewAgency('TAF 認證材料實驗室');
    } else if (type === 'rebar_tensile') {
      setNewTestItem('鋼筋抗拉伸、降伏點強度及冷彎試驗 (CNS 560)');
      setNewStandard('降伏 420-540 MPa / 抗拉 ≧550 MPa');
      setNewMeasured('降伏 462 MPa / 抗拉 615 MPa (強降比1.33)');
      setNewResult('合格');
      setNewAgency('金屬工業研究中心 (MIRDC)');
    } else if (type === 'slump_chloride') {
      setNewTestItem('現場預拌車混凝土坍度與水溶性氯離子試驗');
      setNewStandard('坍度 15±3.8cm / 氯離子 ≦0.15 kg/m³');
      setNewMeasured('坍度 15.0 cm / 氯離子 0.038 kg/m³');
      setNewResult('合格');
      setNewAgency('工區品管人員會同監造工程師');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden my-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
              <FlaskConical className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg">{material.name}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  規格：{material.spec || '標準規格'}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                歷次取樣與檢試驗結果設定 (品質試驗履歷管理)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Material Meta & Status Banner */}
        <div className="p-6 bg-slate-50 border-b border-slate-200 shrink-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 block">供應商 / 協力廠</span>
              <span className="text-sm font-bold text-slate-800 truncate block">{material.supplier || '未填寫'}</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 block">累積進場總量</span>
              <span className="text-sm font-bold text-slate-800 block">
                {material.accumulatedQuantity} {material.unit}
              </span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 block">存放地點</span>
              <span className="text-sm font-bold text-slate-800 truncate block">{material.storageLocation || '工區現場'}</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 block">整體品管判定</span>
              <select
                value={testStatus}
                onChange={(e) => setTestStatus(e.target.value as MaterialItem['testStatus'])}
                className={`text-xs font-bold px-2 py-1 rounded-md border mt-0.5 outline-none w-full ${
                  testStatus === '試驗合格'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : testStatus === '試驗不合格'
                    ? 'bg-rose-50 text-rose-700 border-rose-300'
                    : testStatus === '取樣送驗中'
                    ? 'bg-amber-50 text-amber-700 border-amber-300'
                    : 'bg-slate-100 text-slate-700 border-slate-300'
                }`}
              >
                <option value="試驗合格">🟢 試驗合格 (准予施工)</option>
                <option value="取樣送驗中">🟡 取樣送驗中</option>
                <option value="待取樣">⏳ 待取樣</option>
                <option value="試驗不合格">🔴 試驗不合格 (退料管制)</option>
                <option value="免驗">⚪ 免驗 (出廠證明)</option>
              </select>
            </div>
          </div>

          {/* Statistics Bar */}
          <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200">
            <div className="flex items-center gap-6 text-xs">
              <div>
                <span className="text-slate-500">取樣總批次：</span>
                <span className="font-bold text-slate-800 ml-1">{totalTests} 批</span>
              </div>
              <div>
                <span className="text-slate-500">合格批數：</span>
                <span className="font-bold text-emerald-600 ml-1">{passedTests} 批</span>
              </div>
              {failedTests > 0 && (
                <div>
                  <span className="text-slate-500">不合格：</span>
                  <span className="font-bold text-rose-600 ml-1">{failedTests} 批</span>
                </div>
              )}
              {pendingTests > 0 && (
                <div>
                  <span className="text-slate-500">檢驗中：</span>
                  <span className="font-bold text-amber-600 ml-1">{pendingTests} 批</span>
                </div>
              )}
              <div>
                <span className="text-slate-500">合格率：</span>
                <span className={`font-bold ml-1 ${passRate === 100 ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {passRate}%
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              {showAddForm ? '取消新增' : '新增取樣試驗紀錄'}
            </button>
          </div>
        </div>

        {/* Content Section (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Add New Record Sub-Form */}
          {showAddForm && (
            <form onSubmit={handleAddRecord} className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                  <FileCheck2 className="w-4 h-4 text-indigo-600" />
                  填寫新取樣及試驗報告數據
                </h4>
                <div className="flex items-center gap-1 text-[11px]">
                  <span className="text-slate-500">快速填入範例：</span>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('concrete_28d')}
                    className="px-2 py-0.5 bg-white border border-indigo-200 rounded text-indigo-700 hover:bg-indigo-100"
                  >
                    混凝土抗壓
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('rebar_tensile')}
                    className="px-2 py-0.5 bg-white border border-indigo-200 rounded text-indigo-700 hover:bg-indigo-100"
                  >
                    鋼筋拉伸冷彎
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('slump_chloride')}
                    className="px-2 py-0.5 bg-white border border-indigo-200 rounded text-indigo-700 hover:bg-indigo-100"
                  >
                    坍度與氯離子
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">取樣日期</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">取樣批號 / 爐號</label>
                  <input
                    type="text"
                    value={newLotNumber}
                    onChange={(e) => setNewLotNumber(e.target.value)}
                    placeholder="例：LOT-20261019"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">代表數量</label>
                  <input
                    type="text"
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(e.target.value)}
                    placeholder="例：150 m³ 或 50噸"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">取樣人員</label>
                  <input
                    type="text"
                    value={newSampler}
                    onChange={(e) => setNewSampler(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">檢試驗項目名稱 *</label>
                  <input
                    type="text"
                    value={newTestItem}
                    onChange={(e) => setNewTestItem(e.target.value)}
                    placeholder="例：28天混凝土圓柱試體抗壓強度試驗 (fc28)"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">檢試驗單位 / 實驗室</label>
                  <input
                    type="text"
                    value={newAgency}
                    onChange={(e) => setNewAgency(e.target.value)}
                    placeholder="例：SGS 台灣檢驗科技"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">試驗報告編號</label>
                  <input
                    type="text"
                    value={newReportNum}
                    onChange={(e) => setNewReportNum(e.target.value)}
                    placeholder="例：SGS-2026-CT4891"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">設計標準值 (規範)</label>
                  <input
                    type="text"
                    value={newStandard}
                    onChange={(e) => setNewStandard(e.target.value)}
                    placeholder="例：≧ 28 MPa"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">實測數值 (試驗值)</label>
                  <input
                    type="text"
                    value={newMeasured}
                    onChange={(e) => setNewMeasured(e.target.value)}
                    placeholder="例：平均 33.6 MPa"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                <div className="md:col-span-3">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">備註說明 / 處置方式</label>
                  <input
                    type="text"
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="例：符合規範准予使用，報告存查"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">判定結果</label>
                  <select
                    value={newResult}
                    onChange={(e) => setNewResult(e.target.value as SamplingTestRecord['result'])}
                    className={`w-full px-2.5 py-1.5 border rounded-lg text-xs font-bold outline-none ${
                      newResult === '合格'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : newResult === '不合格'
                        ? 'bg-rose-50 text-rose-800 border-rose-300'
                        : 'bg-amber-50 text-amber-800 border-amber-300'
                    }`}
                  >
                    <option value="合格">合格 (Passed)</option>
                    <option value="不合格">不合格 (Failed)</option>
                    <option value="檢驗中">檢驗中 (Testing)</option>
                    <option value="待試驗">待試驗 (Scheduled)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs"
                >
                  確認新增此筆試驗
                </button>
              </div>
            </form>
          )}

          {/* List of Records */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>歷次取樣檢試驗履歷清單 ({records.length} 筆)</span>
              <span className="text-[11px] font-normal text-slate-500">依取樣日期排序</span>
            </h4>

            {records.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 border border-dashed border-slate-300 rounded-xl">
                <FlaskConical className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-medium text-slate-600">尚無歷次取樣試驗紀錄</p>
                <p className="text-[11px] text-slate-400 mt-1">點擊上方「新增取樣試驗紀錄」按鈕開始登記</p>
              </div>
            ) : (
              records.map((rec, index) => (
                <div
                  key={rec.id}
                  className="p-4 bg-white border border-slate-200 hover:border-slate-300 rounded-xl shadow-xs transition-shadow space-y-2 relative"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center">
                        {index + 1}
                      </span>
                      <h5 className="font-bold text-sm text-slate-900">{rec.testItem}</h5>
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                          rec.result === '合格'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : rec.result === '不合格'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}
                      >
                        {rec.result === '合格' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {rec.result === '不合格' && <AlertTriangle className="w-3.5 h-3.5" />}
                        {rec.result === '檢驗中' && <Clock className="w-3.5 h-3.5" />}
                        {rec.result}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteRecord(rec.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                      title="刪除此紀錄"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <div>
                      <span className="text-slate-400 block text-[10px]">取樣日期</span>
                      <span className="font-semibold text-slate-700">{rec.date}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">批號 / 代表量</span>
                      <span className="font-semibold text-slate-700 truncate block">
                        {rec.sampleLotNumber} ({rec.sampleQuantity})
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">試驗單位</span>
                      <span className="font-semibold text-slate-700 truncate block">{rec.testingAgency}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">報告編號</span>
                      <span className="font-semibold text-slate-700 truncate block">{rec.reportNumber || '待提供'}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs px-1 text-slate-600">
                    {rec.standardValue && (
                      <div>
                        <span className="text-slate-400">標準要求：</span>
                        <span className="font-medium text-slate-800">{rec.standardValue}</span>
                      </div>
                    )}
                    {rec.measuredValue && (
                      <div>
                        <span className="text-slate-400">實測數據：</span>
                        <span className="font-bold text-blue-700">{rec.measuredValue}</span>
                      </div>
                    )}
                    {rec.notes && (
                      <div className="w-full text-slate-500 italic mt-0.5">
                        備註說明：{rec.notes}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200 shrink-0">
          <span className="text-xs text-slate-500">
            變更將同步更新至工程材料總表與當日日誌
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg"
            >
              關閉
            </button>
            <button
              type="button"
              onClick={handleSaveAll}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
            >
              儲存歷次試驗設定
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
