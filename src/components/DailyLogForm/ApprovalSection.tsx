import React, { useState } from 'react';
import { PenTool, CheckCircle, ShieldAlert, Truck, MessageSquare, AlertCircle, CheckCircle2 } from 'lucide-react';
import { DailyLog, SignatureData } from '../../types/construction';
import { SignatureModal } from '../Modals/SignatureModal';

interface ApprovalSectionProps {
  log: DailyLog;
  onChange: (updated: Partial<DailyLog>) => void;
}

export const ApprovalSection: React.FC<ApprovalSectionProps> = ({ log, onChange }) => {
  const [activeModal, setActiveModal] = useState<'reporter' | 'supervisor' | null>(null);

  const handleSaveSignature = (type: 'reporter' | 'supervisor', data: { name: string; signatureImage: string }) => {
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    if (type === 'reporter') {
      onChange({
        reportedBy: {
          name: data.name,
          signatureImage: data.signatureImage || log.reportedBy.signatureImage,
          signedAt: timeStr,
        },
      });
    } else {
      onChange({
        reviewedBy: {
          name: data.name,
          signatureImage: data.signatureImage || log.reviewedBy.signatureImage,
          signedAt: timeStr,
        },
        reviewStatus: '已核准',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* 工地重要記事與安衛機具 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
          <span className="w-2.5 h-6 bg-slate-700 rounded-full inline-block"></span>
          工地重要記事、出動機具與安全衛生自主檢點
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* 安全衛生檢點 */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-emerald-600" />
              職業安全衛生管理與自主查驗紀錄
            </label>
            <textarea
              rows={4}
              value={log.safetyNotes}
              onChange={(e) => onChange({ safetyNotes: e.target.value })}
              placeholder="例：今日工具箱會議(TBM)針對高架作業防墜繩宣導；開口部護欄完好，全天無工安事故。"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none resize-none"
            />
          </div>

          {/* 出動施工機具 */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-blue-600" />
              本日出動主要施工機具
            </label>
            <textarea
              rows={4}
              value={log.machineryEquipment}
              onChange={(e) => onChange({ machineryEquipment: e.target.value })}
              placeholder="例：50T 塔式起重機 1 台、預拌混凝土壓送車 1 台、鋼筋彎曲機 2 台。"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none resize-none"
            />
          </div>

          {/* 協調指示記事 */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              施工協調、監造指示與重要記事
            </label>
            <textarea
              rows={4}
              value={log.generalNotes}
              onChange={(e) => onChange({ generalNotes: e.target.value })}
              placeholder="例：預定明日辦理 A棟4F 樓板結構澆置前查驗；下週鋼構吊裝交維計畫已核備。"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none resize-none"
            />
          </div>
        </div>
      </div>

      {/* 簽核流程：填報人及簽核主管 */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl shadow-md p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-700">
          <div>
            <h3 className="text-base font-bold flex items-center gap-2 text-white">
              <PenTool className="w-5 h-5 text-amber-400" />
              工程電子簽核流程 (填報人 & 簽核主管)
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              具備法律依據與公共工程規範之電子簽名及審查意見紀錄
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-300">審核狀態：</span>
            <select
              value={log.reviewStatus}
              onChange={(e) => onChange({ reviewStatus: e.target.value as DailyLog['reviewStatus'] })}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold outline-none border ${
                log.reviewStatus === '已核准'
                  ? 'bg-emerald-600 text-white border-emerald-400'
                  : log.reviewStatus === '待簽核'
                  ? 'bg-amber-600 text-white border-amber-400'
                  : log.reviewStatus === '需修正'
                  ? 'bg-rose-600 text-white border-rose-400'
                  : 'bg-slate-700 text-slate-200 border-slate-600'
              }`}
            >
              <option value="草稿">📝 草稿 (Draft)</option>
              <option value="待簽核">⏳ 待主管簽核 (Pending)</option>
              <option value="已核准">✅ 主管已核准 (Approved)</option>
              <option value="需修正">⚠️ 需退回修正 (Revise)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1. 填報人 (工地主任 / 現場工程師) */}
          <div className="bg-slate-800/80 p-5 rounded-xl border border-slate-700 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                <span className="text-sm font-bold text-slate-100">填報人 (工地主任 / 主任技師)</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal('reporter')}
                className="px-3 py-1 bg-blue-600/80 hover:bg-blue-600 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <PenTool className="w-3.5 h-3.5" /> 進行手寫簽名
              </button>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                value={log.reportedBy.name}
                onChange={(e) => onChange({ reportedBy: { ...log.reportedBy, name: e.target.value } })}
                placeholder="填報人姓名 (例：林志豪 工地主任)"
                className="w-full px-3 py-2 bg-slate-900/80 border border-slate-600 rounded-lg text-xs font-bold text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />

              {/* Signature Display Box */}
              <div className="h-20 bg-slate-900 rounded-lg border border-slate-700 flex items-center justify-center overflow-hidden p-2 relative">
                {log.reportedBy.signatureImage ? (
                  <img
                    src={log.reportedBy.signatureImage}
                    alt="填報人簽名"
                    className="max-h-full object-contain filter invert contrast-200"
                  />
                ) : (
                  <span className="text-xs text-slate-500 italic">尚未進行電子簽名</span>
                )}
                {log.reportedBy.signedAt && (
                  <span className="absolute bottom-1 right-2 text-[10px] text-slate-400">
                    簽署時間: {log.reportedBy.signedAt}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 2. 簽核主管 (專任工程人員 / 監造建築師 / 業主工程師) */}
          <div className="bg-slate-800/80 p-5 rounded-xl border border-slate-700 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="text-sm font-bold text-slate-100">簽核主管 (專任工程人員 / 監造單位)</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal('supervisor')}
                className="px-3 py-1 bg-emerald-600/80 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <PenTool className="w-3.5 h-3.5" /> 主管簽核
              </button>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                value={log.reviewedBy.name}
                onChange={(e) => onChange({ reviewedBy: { ...log.reviewedBy, name: e.target.value } })}
                placeholder="簽核主管姓名 (例：張國榮 結構技師)"
                className="w-full px-3 py-2 bg-slate-900/80 border border-slate-600 rounded-lg text-xs font-bold text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />

              {/* Signature Display Box */}
              <div className="h-20 bg-slate-900 rounded-lg border border-slate-700 flex items-center justify-center overflow-hidden p-2 relative">
                {log.reviewedBy.signatureImage ? (
                  <img
                    src={log.reviewedBy.signatureImage}
                    alt="主管簽名"
                    className="max-h-full object-contain filter invert contrast-200"
                  />
                ) : (
                  <span className="text-xs text-slate-500 italic">尚未進行主管電子簽名</span>
                )}
                {log.reviewedBy.signedAt && (
                  <span className="absolute bottom-1 right-2 text-[10px] text-slate-400">
                    簽核時間: {log.reviewedBy.signedAt}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 主管審核意見欄 */}
        <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-700 space-y-2">
          <label className="text-xs font-bold text-slate-300 block">主管審核意見與裁示：</label>
          <input
            type="text"
            value={log.reviewComments || ''}
            onChange={(e) => onChange({ reviewComments: e.target.value })}
            placeholder="例：本日進度與品質查驗合格，准予次日進行樓板混凝土澆置作業。"
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:ring-2 focus:ring-amber-500 outline-none"
          />
        </div>
      </div>

      {/* Signature Modal */}
      {activeModal && (
        <SignatureModal
          isOpen={true}
          title={activeModal === 'reporter' ? '填報人數位簽核' : '簽核主管審定簽署'}
          defaultName={activeModal === 'reporter' ? log.reportedBy.name : log.reviewedBy.name}
          onClose={() => setActiveModal(null)}
          onSave={(data) => {
            handleSaveSignature(activeModal, data);
            setActiveModal(null);
          }}
        />
      )}
    </div>
  );
};
