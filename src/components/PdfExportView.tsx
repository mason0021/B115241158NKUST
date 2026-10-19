import React, { useRef, useState } from 'react';
import { Download, Printer, FileText, CheckCircle2, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { DailyLog } from '../types/construction';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PdfExportViewProps {
  log: DailyLog;
  onBack: () => void;
}

export const PdfExportView: React.FC<PdfExportViewProps> = ({ log, onBack }) => {
  const printRef = useRef<HTMLDivElement | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const totalWorkers = log.workerCrafts.reduce((acc, c) => acc + (Number(c.todayCount) || 0), 0);
  const progressDiff = Number((log.actualProgress - log.plannedProgress).toFixed(2));

  const handleDownloadPdf = async () => {
    if (!printRef.current) return;
    setIsGeneratingPdf(true);

    try {
      const element = printRef.current;
      const canvas = await html2canvas(element, {
        scale: 2, // crisp high DPI
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pdfWidth - 16; // 8mm margins
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 8; // top margin

      pdf.addImage(imgData, 'JPEG', 8, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 8, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(`施工日誌-${log.date}-${log.projectTitle.slice(0, 10)}.pdf`);
    } catch (err) {
      console.error('PDF Generation failed:', err);
      alert('產生 PDF 發生問題，建議您改用「直接列印 / 另存為 PDF」功能！');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar (No-print) */}
      <div className="no-print bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors"
            title="返回日誌填報"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              公共工程標準施工日誌報表 (PDF 格式預覽)
            </h2>
            <p className="text-xs text-slate-500">
              符合行政院公共工程委員會標準格式，可直接下載 PDF 文件或送印
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors"
          >
            <Printer className="w-4 h-4" />
            瀏覽器列印 / 存為PDF
          </button>

          <button
            type="button"
            disabled={isGeneratingPdf}
            onClick={handleDownloadPdf}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm disabled:opacity-50"
          >
            {isGeneratingPdf ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                正在產生高解析 PDF...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                一鍵下載 PDF 報表
              </>
            )}
          </button>
        </div>
      </div>

      {/* Printable Sheet Area */}
      <div className="flex justify-center">
        <div
          ref={printRef}
          className="bg-white p-8 max-w-[850px] w-full shadow-lg border border-slate-300 font-sans text-slate-900 leading-normal"
          style={{ minHeight: '1100px' }}
        >
          {/* Form Header */}
          <div className="text-center pb-4 border-b-2 border-slate-900">
            <h1 className="text-2xl font-black tracking-widest text-slate-900">
              公 共 工 程 施 工 日 誌
            </h1>
            <p className="text-sm font-bold text-slate-700 mt-1">
              {log.projectTitle}
            </p>
          </div>

          {/* Basic Info Table */}
          <table className="w-full border-collapse border border-slate-900 text-xs mt-4">
            <tbody>
              <tr>
                <td className="border border-slate-900 bg-slate-100 p-2 font-bold w-24">填報日期</td>
                <td className="border border-slate-900 p-2 font-bold">{log.date}</td>
                <td className="border border-slate-900 bg-slate-100 p-2 font-bold w-24">天候狀況</td>
                <td className="border border-slate-900 p-2">
                  上午：{log.weather.morning} / 下午：{log.weather.afternoon} ({log.weather.temperatureMin}~{log.weather.temperatureMax}°C)
                </td>
              </tr>
              <tr>
                <td className="border border-slate-900 bg-slate-100 p-2 font-bold">主辦機關</td>
                <td className="border border-slate-900 p-2">{log.clientAgency}</td>
                <td className="border border-slate-900 bg-slate-100 p-2 font-bold">監造單位</td>
                <td className="border border-slate-900 p-2">{log.supervisingAgency}</td>
              </tr>
              <tr>
                <td className="border border-slate-900 bg-slate-100 p-2 font-bold">施工廠商</td>
                <td className="border border-slate-900 p-2">{log.contractor}</td>
                <td className="border border-slate-900 bg-slate-100 p-2 font-bold">工期進度</td>
                <td className="border border-slate-900 p-2">
                  核定 {log.contractDays} 天 / 已施工 {log.accumulatedDays} 天 / 剩餘 {log.remainingDays} 天
                </td>
              </tr>
              <tr>
                <td className="border border-slate-900 bg-slate-100 p-2 font-bold">預定累計進度</td>
                <td className="border border-slate-900 p-2 font-bold">{log.plannedProgress}%</td>
                <td className="border border-slate-900 bg-slate-100 p-2 font-bold">實際累計進度</td>
                <td className="border border-slate-900 p-2 font-bold">
                  {log.actualProgress}% ({progressDiff >= 0 ? `超前 +${progressDiff}%` : `落後 ${progressDiff}%`})
                </td>
              </tr>
            </tbody>
          </table>

          {/* 一、施作工項 */}
          <div className="mt-5">
            <h3 className="text-xs font-bold bg-slate-200 p-1.5 border border-slate-900 border-b-0">
              壹、施作工項與工程進度
            </h3>
            <table className="w-full border-collapse border border-slate-900 text-xs text-center">
              <thead>
                <tr className="bg-slate-100 font-bold">
                  <th className="border border-slate-900 p-1.5 w-10">項次</th>
                  <th className="border border-slate-900 p-1.5 text-left">工項名稱</th>
                  <th className="border border-slate-900 p-1.5 w-24">施工位置</th>
                  <th className="border border-slate-900 p-1.5 w-14">單位</th>
                  <th className="border border-slate-900 p-1.5 w-16">契約數量</th>
                  <th className="border border-slate-900 p-1.5 w-16">本日施作</th>
                  <th className="border border-slate-900 p-1.5 w-16">累計施作</th>
                  <th className="border border-slate-900 p-1.5 w-14">完成%</th>
                  <th className="border border-slate-900 p-1.5 w-20">自主檢查</th>
                </tr>
              </thead>
              <tbody>
                {log.workItems.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="border border-slate-900 p-2 text-slate-500">本日無工項登載</td>
                  </tr>
                ) : (
                  log.workItems.map((w, idx) => (
                    <tr key={w.id}>
                      <td className="border border-slate-900 p-1.5">{idx + 1}</td>
                      <td className="border border-slate-900 p-1.5 text-left font-semibold">{w.name}</td>
                      <td className="border border-slate-900 p-1.5">{w.location}</td>
                      <td className="border border-slate-900 p-1.5">{w.unit}</td>
                      <td className="border border-slate-900 p-1.5">{w.contractQty}</td>
                      <td className="border border-slate-900 p-1.5 font-bold">{w.todayQty}</td>
                      <td className="border border-slate-900 p-1.5">{w.accumulatedQty}</td>
                      <td className="border border-slate-900 p-1.5">{w.progressPercent}%</td>
                      <td className="border border-slate-900 p-1.5 font-bold text-emerald-700">{w.qualityStatus}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 二、各工種出工人數 */}
          <div className="mt-5">
            <h3 className="text-xs font-bold bg-slate-200 p-1.5 border border-slate-900 border-b-0 flex justify-between">
              <span>貳、工地出工人員統計</span>
              <span>本日出工總計：{totalWorkers} 人天</span>
            </h3>
            <table className="w-full border-collapse border border-slate-900 text-xs text-center">
              <thead>
                <tr className="bg-slate-100 font-bold">
                  <th className="border border-slate-900 p-1.5 w-10">項次</th>
                  <th className="border border-slate-900 p-1.5 text-left">工種名稱 (依排序)</th>
                  <th className="border border-slate-900 p-1.5 w-28">工程分類</th>
                  <th className="border border-slate-900 p-1.5 w-24">本日出工人數</th>
                  <th className="border border-slate-900 p-1.5 w-24">累計出工人數</th>
                </tr>
              </thead>
              <tbody>
                {log.workerCrafts.map((c, i) => (
                  <tr key={c.id}>
                    <td className="border border-slate-900 p-1">{i + 1}</td>
                    <td className="border border-slate-900 p-1 text-left font-semibold">{c.craftName}</td>
                    <td className="border border-slate-900 p-1 text-slate-600">{c.craftCategory || '結構工程'}</td>
                    <td className="border border-slate-900 p-1 font-bold">{c.todayCount} 人</td>
                    <td className="border border-slate-900 p-1">{c.accumulatedCount} 人</td>
                  </tr>
                ))}
                <tr className="bg-slate-100 font-bold">
                  <td colSpan={3} className="border border-slate-900 p-1.5 text-right pr-4">本日合計出工人數：</td>
                  <td className="border border-slate-900 p-1.5 font-bold text-blue-900">{totalWorkers} 人</td>
                  <td className="border border-slate-900 p-1.5">
                    {log.workerCrafts.reduce((s, c) => s + (Number(c.accumulatedCount) || 0), 0)} 人
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 三、材料進場及檢驗紀錄 */}
          <div className="mt-5">
            <h3 className="text-xs font-bold bg-slate-200 p-1.5 border border-slate-900 border-b-0">
              參、材料進場及品質檢試驗紀錄
            </h3>
            <table className="w-full border-collapse border border-slate-900 text-xs text-center">
              <thead>
                <tr className="bg-slate-100 font-bold">
                  <th className="border border-slate-900 p-1.5 w-10">項次</th>
                  <th className="border border-slate-900 p-1.5 text-left">材料名稱及規格</th>
                  <th className="border border-slate-900 p-1.5 w-14">單位</th>
                  <th className="border border-slate-900 p-1.5 w-20">本日進場</th>
                  <th className="border border-slate-900 p-1.5 w-20">累計進場</th>
                  <th className="border border-slate-900 p-1.5 w-24">協力廠商</th>
                  <th className="border border-slate-900 p-1.5 w-24">檢試驗結果</th>
                </tr>
              </thead>
              <tbody>
                {log.materials.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="border border-slate-900 p-2 text-slate-500">本日無材料進場</td>
                  </tr>
                ) : (
                  log.materials.map((m, idx) => (
                    <tr key={m.id}>
                      <td className="border border-slate-900 p-1.5">{idx + 1}</td>
                      <td className="border border-slate-900 p-1.5 text-left">
                        <div className="font-semibold">{m.name}</div>
                        <div className="text-[10px] text-slate-500">{m.spec}</div>
                      </td>
                      <td className="border border-slate-900 p-1.5">{m.unit}</td>
                      <td className="border border-slate-900 p-1.5 font-bold">{m.todayQuantity}</td>
                      <td className="border border-slate-900 p-1.5">{m.accumulatedQuantity}</td>
                      <td className="border border-slate-900 p-1.5">{m.supplier}</td>
                      <td className="border border-slate-900 p-1.5 font-bold text-emerald-700">{m.testStatus}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 四、施工照片 (附工項名稱標註) */}
          <div className="mt-5 page-break">
            <h3 className="text-xs font-bold bg-slate-200 p-1.5 border border-slate-900 border-b-0">
              肆、施工現場工項查驗照片紀錄 (照片下方皆標記所屬工項名稱)
            </h3>
            <div className="border border-slate-900 p-4">
              {log.photos.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">本日無附相片</div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {log.photos.map((photo) => (
                    <div key={photo.id} className="border border-slate-300 p-2 rounded bg-slate-50 text-xs">
                      <div className="aspect-4/3 overflow-hidden bg-slate-200 border border-slate-300">
                        <img
                          src={photo.dataUrl}
                          alt={photo.workItemName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {/* Critical label below photo */}
                      <div className="mt-2 space-y-0.5">
                        <div className="font-bold text-slate-900 text-xs">
                          【工項】：{photo.workItemName}
                        </div>
                        <div className="text-[11px] text-slate-600">
                          位置：{photo.location} ({photo.timestamp})
                        </div>
                        <div className="text-[10px] text-slate-500 italic">
                          說明：{photo.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 五、記事與安衛 */}
          <div className="mt-5">
            <table className="w-full border-collapse border border-slate-900 text-xs">
              <tbody>
                <tr>
                  <td className="border border-slate-900 bg-slate-100 p-2 font-bold w-28">安衛自主檢點</td>
                  <td className="border border-slate-900 p-2 whitespace-pre-line">{log.safetyNotes}</td>
                </tr>
                <tr>
                  <td className="border border-slate-900 bg-slate-100 p-2 font-bold">出動施工機具</td>
                  <td className="border border-slate-900 p-2 whitespace-pre-line">{log.machineryEquipment}</td>
                </tr>
                <tr>
                  <td className="border border-slate-900 bg-slate-100 p-2 font-bold">施工重要記事</td>
                  <td className="border border-slate-900 p-2 whitespace-pre-line">{log.generalNotes}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 表尾：填報人及簽核主管 */}
          <div className="mt-6 border border-slate-900">
            <div className="grid grid-cols-2 divide-x divide-slate-900">
              {/* 填報人 */}
              <div className="p-3 space-y-2">
                <span className="font-bold text-xs block">填報人 (工地主任 / 現場工程師)：</span>
                <div className="h-16 flex items-center justify-center">
                  {log.reportedBy.signatureImage ? (
                    <img
                      src={log.reportedBy.signatureImage}
                      alt="簽名"
                      className="max-h-full object-contain"
                    />
                  ) : (
                    <span className="text-xs text-slate-400 italic">（已由 {log.reportedBy.name} 簽章）</span>
                  )}
                </div>
                <div className="text-[11px] text-slate-600 flex justify-between">
                  <span>姓名：{log.reportedBy.name}</span>
                  <span>時間：{log.reportedBy.signedAt || log.date}</span>
                </div>
              </div>

              {/* 簽核主管 */}
              <div className="p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs">簽核主管 (專任工程人員 / 監造單位)：</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    狀態：{log.reviewStatus}
                  </span>
                </div>
                <div className="h-16 flex items-center justify-center">
                  {log.reviewedBy.signatureImage ? (
                    <img
                      src={log.reviewedBy.signatureImage}
                      alt="主管簽核"
                      className="max-h-full object-contain"
                    />
                  ) : (
                    <span className="text-xs text-slate-400 italic">（已由 {log.reviewedBy.name} 核准）</span>
                  )}
                </div>
                <div className="text-[11px] text-slate-600 flex justify-between">
                  <span>姓名：{log.reviewedBy.name}</span>
                  <span>時間：{log.reviewedBy.signedAt || log.date}</span>
                </div>
                {log.reviewComments && (
                  <div className="text-[10px] text-slate-500 border-t border-slate-200 pt-1">
                    核示意見：{log.reviewComments}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="text-right text-[10px] text-slate-400 mt-2">
            公共工程監造與施工資訊系統 • 產生時間：{new Date().toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};
