import React, { useState, useMemo } from 'react';
import { Calendar, BarChart3, TrendingUp, Users, HardHat, Settings2, Download, Printer, ChevronLeft, ChevronRight, Layers, FileSpreadsheet } from 'lucide-react';
import { DailyLog, MonthlySummary } from '../types/construction';
import { StorageService } from '../services/storage';

interface MonthlyReportViewProps {
  currentDate: string;
  onSelectDate: (date: string) => void;
}

export const MonthlyReportView: React.FC<MonthlyReportViewProps> = ({ currentDate, onSelectDate }) => {
  const [selectedMonth, setSelectedMonth] = useState<string>(currentDate.slice(0, 7) || '2026-10');
  const [chartType, setChartType] = useState<'both' | 'scurve' | 'workers'>('both');
  const [curveStyle, setCurveStyle] = useState<'smooth' | 'line' | 'area'>('smooth');
  const [showValues, setShowValues] = useState<boolean>(true);
  const [showDifference, setShowDifference] = useState<boolean>(true);
  const [hoveredPoint, setHoveredPoint] = useState<any | null>(null);

  // Month navigation
  const handlePrevMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const prev = new Date(y, m - 2, 1);
    setSelectedMonth(`${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const next = new Date(y, m, 1);
    setSelectedMonth(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`);
  };

  // Monthly summary
  const summary: MonthlySummary = useMemo(() => {
    return StorageService.getMonthlySummary(selectedMonth);
  }, [selectedMonth]);

  // Compute SVG dimensions and coordinates for S-Curve chart
  const scurveData = summary.dailyStats;
  const chartWidth = 720;
  const chartHeight = 260;
  const padding = { top: 30, right: 30, bottom: 40, left: 50 };

  const minProgress = scurveData.length > 0 ? Math.floor(Math.min(...scurveData.map(d => Math.min(d.plannedProgress, d.actualProgress))) - 1) : 30;
  const maxProgress = scurveData.length > 0 ? Math.ceil(Math.max(...scurveData.map(d => Math.max(d.plannedProgress, d.actualProgress))) + 1) : 40;
  const rangeY = Math.max(1, maxProgress - minProgress);

  const getX = (index: number) => {
    if (scurveData.length <= 1) return padding.left + (chartWidth - padding.left - padding.right) / 2;
    return padding.left + (index / (scurveData.length - 1)) * (chartWidth - padding.left - padding.right);
  };

  const getY = (val: number) => {
    return padding.top + (1 - (val - minProgress) / rangeY) * (chartHeight - padding.top - padding.bottom);
  };

  // Planned Path
  const plannedPoints = scurveData.map((d, i) => `${getX(i)},${getY(d.plannedProgress)}`).join(' ');
  // Actual Path
  const actualPoints = scurveData.map((d, i) => `${getX(i)},${getY(d.actualProgress)}`).join(' ');

  // Area Path
  const areaPath = scurveData.length > 0
    ? `M ${getX(0)},${chartHeight - padding.bottom} ` +
      scurveData.map((d, i) => `L ${getX(i)},${getY(d.actualProgress)}`).join(' ') +
      ` L ${getX(scurveData.length - 1)},${chartHeight - padding.bottom} Z`
    : '';

  // Worker Bar chart max
  const maxWorkers = Math.max(10, ...scurveData.map(d => d.workerCount));

  return (
    <div className="space-y-6">
      {/* Top Banner & Month Selector */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-6 bg-blue-600 rounded-full inline-block"></span>
              工程進度與出工月報表彙整 (Monthly Report & Analytics)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              自動彙整每日工程日誌進度、出工人數、材料統計，支援 S-Curve 曲線圖與出工長條圖客製設定
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 hover:bg-white rounded-lg text-slate-600 transition-colors"
                title="上一個月份"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 text-xs font-bold text-slate-800 tracking-wide">
                {selectedMonth.replace('-', ' 年 ')} 月
              </span>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 hover:bg-white rounded-lg text-slate-600 transition-colors"
                title="下一個月份"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" /> 列印月報
            </button>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50/40 p-4 rounded-xl border border-blue-100">
            <div className="flex items-center justify-between text-blue-700">
              <span className="text-xs font-semibold">當月累積出工人次</span>
              <Users className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-blue-900 mt-1">
              {summary.totalWorkerCount} <span className="text-xs font-normal text-blue-600">人天</span>
            </div>
            <span className="text-[11px] text-blue-600 mt-0.5 block">
              平均每日出工約 {summary.avgDailyWorkerCount} 人
            </span>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-teal-50/40 p-4 rounded-xl border border-emerald-100">
            <div className="flex items-center justify-between text-emerald-700">
              <span className="text-xs font-semibold">本月進度推進</span>
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-emerald-900 mt-1">
              +{summary.progressGained}%
            </div>
            <span className="text-[11px] text-emerald-600 mt-0.5 block">
              {summary.startProgress}% → {summary.endProgress}%
            </span>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-orange-50/40 p-4 rounded-xl border border-amber-100">
            <div className="flex items-center justify-between text-amber-700">
              <span className="text-xs font-semibold">日誌填報天數</span>
              <Calendar className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-amber-900 mt-1">
              {summary.totalDays} <span className="text-xs font-normal text-amber-600">天</span>
            </div>
            <span className="text-[11px] text-amber-700 mt-0.5 block">
              晴朗正常 {summary.workDays} 天 / 雨天 {summary.rainDays} 天
            </span>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50/40 p-4 rounded-xl border border-purple-100">
            <div className="flex items-center justify-between text-purple-700">
              <span className="text-xs font-semibold">管制材料品項數</span>
              <Layers className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-purple-900 mt-1">
              {summary.totalMaterialsCount} <span className="text-xs font-normal text-purple-600">種</span>
            </div>
            <span className="text-[11px] text-purple-700 mt-0.5 block">
              出工主要工種 {summary.craftBreakdown.length} 種
            </span>
          </div>
        </div>

        {/* Chart Customization Settings Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
          <div className="flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-slate-500" />
            <span className="font-bold text-slate-700">圖表設定：</span>

            <div className="flex bg-white rounded-lg border border-slate-200 p-0.5">
              <button
                type="button"
                onClick={() => setChartType('both')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                  chartType === 'both' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                全部圖表
              </button>
              <button
                type="button"
                onClick={() => setChartType('scurve')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                  chartType === 'scurve' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                S-Curve 曲線圖
              </button>
              <button
                type="button"
                onClick={() => setChartType('workers')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                  chartType === 'workers' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                出工長條圖
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">曲線樣式：</span>
              <select
                value={curveStyle}
                onChange={(e) => setCurveStyle(e.target.value as any)}
                className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs outline-none"
              >
                <option value="smooth">平滑曲線</option>
                <option value="line">直線折線</option>
                <option value="area">半透明漸層面積</option>
              </select>
            </div>

            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={showValues}
                onChange={(e) => setShowValues(e.target.checked)}
                className="w-3.5 h-3.5 text-blue-600 rounded"
              />
              <span className="text-slate-600">標註進度點數值</span>
            </label>

            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={showDifference}
                onChange={(e) => setShowDifference(e.target.checked)}
                className="w-3.5 h-3.5 text-blue-600 rounded"
              />
              <span className="text-slate-600">進度超前差距標註</span>
            </label>
          </div>
        </div>
      </div>

      {/* Charts Display Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. S-Curve Progress Line Chart */}
        {(chartType === 'both' || chartType === 'scurve') && (
          <div className={`bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4 ${chartType === 'scurve' ? 'lg:col-span-2' : ''}`}>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  工程進度 S-Curve 累計曲線圖 (預定 vs 實際)
                </h3>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-slate-400 border-t-2 border-dashed border-slate-400"></span>
                  <span className="text-slate-600">預定進度 (%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-1 bg-blue-600 rounded"></span>
                  <span className="text-blue-700 font-bold">實際進度 (%)</span>
                </div>
              </div>
            </div>

            {scurveData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-slate-400 text-xs">
                該月份無施工日誌進度資料
              </div>
            ) : (
              <div className="relative">
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  className="w-full h-auto overflow-visible select-none"
                >
                  {/* Grid Lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                    const yVal = minProgress + (1 - ratio) * rangeY;
                    const yPos = padding.top + ratio * (chartHeight - padding.top - padding.bottom);
                    return (
                      <g key={idx}>
                        <line
                          x1={padding.left}
                          y1={yPos}
                          x2={chartWidth - padding.right}
                          y2={yPos}
                          stroke="#e2e8f0"
                          strokeDasharray="4 4"
                        />
                        <text
                          x={padding.left - 8}
                          y={yPos + 4}
                          textAnchor="end"
                          fill="#94a3b8"
                          fontSize="10"
                        >
                          {yVal.toFixed(1)}%
                        </text>
                      </g>
                    );
                  })}

                  {/* Area fill if enabled */}
                  {curveStyle === 'area' && (
                    <path
                      d={areaPath}
                      fill="url(#progressGradient)"
                      opacity="0.3"
                    />
                  )}

                  <defs>
                    <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563eb" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#2563eb" stopOpacity="0.05" />
                    </linearGradient>
                  </defs>

                  {/* Planned Progress Line (Dashed) */}
                  <polyline
                    fill="none"
                    stroke="#94a3b8"
                    strokeWidth="2.5"
                    strokeDasharray="6 6"
                    points={plannedPoints}
                  />

                  {/* Actual Progress Line (Solid Blue) */}
                  <polyline
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={actualPoints}
                  />

                  {/* Data Points */}
                  {scurveData.map((d, i) => {
                    const cx = getX(i);
                    const cyAct = getY(d.actualProgress);
                    const cyPlan = getY(d.plannedProgress);
                    const diff = (d.actualProgress - d.plannedProgress).toFixed(2);

                    return (
                      <g
                        key={d.date}
                        className="cursor-pointer group"
                        onMouseEnter={() => setHoveredPoint(d)}
                        onMouseLeave={() => setHoveredPoint(null)}
                        onClick={() => onSelectDate(d.date)}
                      >
                        {/* Hover vertical guideline */}
                        <line
                          x1={cx}
                          y1={padding.top}
                          x2={cx}
                          y2={chartHeight - padding.bottom}
                          stroke="#cbd5e1"
                          strokeWidth="1"
                          opacity="0.6"
                        />

                        {/* Planned circle */}
                        <circle cx={cx} cy={cyPlan} r="3.5" fill="#ffffff" stroke="#94a3b8" strokeWidth="2" />

                        {/* Actual circle */}
                        <circle
                          cx={cx}
                          cy={cyAct}
                          r="5"
                          fill="#2563eb"
                          stroke="#ffffff"
                          strokeWidth="2"
                          className="hover:r-7 transition-all"
                        />

                        {/* Value labels */}
                        {showValues && (
                          <text
                            x={cx}
                            y={cyAct - 10}
                            textAnchor="middle"
                            fill="#1e3a8a"
                            fontSize="10"
                            fontWeight="bold"
                          >
                            {d.actualProgress}%
                          </text>
                        )}

                        {/* Date on X axis */}
                        <text
                          x={cx}
                          y={chartHeight - padding.bottom + 18}
                          textAnchor="middle"
                          fill="#64748b"
                          fontSize="10"
                        >
                          {d.date.slice(8)}日
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Hover Tooltip Card */}
                {hoveredPoint && (
                  <div className="absolute top-2 right-2 bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 pointer-events-none z-10">
                    <div className="font-bold text-amber-400">{hoveredPoint.date}</div>
                    <div>實際進度：<span className="font-bold text-blue-300">{hoveredPoint.actualProgress}%</span></div>
                    <div>預定進度：<span className="text-slate-300">{hoveredPoint.plannedProgress}%</span></div>
                    <div>
                      差距：
                      <span className={hoveredPoint.actualProgress >= hoveredPoint.plannedProgress ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                        {hoveredPoint.actualProgress >= hoveredPoint.plannedProgress ? '+' : ''}
                        {(hoveredPoint.actualProgress - hoveredPoint.plannedProgress).toFixed(2)}%
                      </span>
                    </div>
                    <div>當日出工：{hoveredPoint.workerCount} 人 ({hoveredPoint.weather})</div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 2. Worker Attendance Daily Bar Chart */}
        {(chartType === 'both' || chartType === 'workers') && (
          <div className={`bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4 ${chartType === 'workers' ? 'lg:col-span-2' : ''}`}>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-sm text-slate-900">
                  每日出工總人數長條圖 (Daily Workers Bar Chart)
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                單位：人次 / 天
              </span>
            </div>

            {scurveData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-slate-400 text-xs">
                該月份無出工紀錄
              </div>
            ) : (
              <div className="relative pt-4">
                <div className="flex items-end justify-between gap-2 h-52 px-2 border-b border-slate-200">
                  {scurveData.map((d) => {
                    const heightPercent = Math.min(100, Math.max(10, (d.workerCount / maxWorkers) * 100));
                    const isRain = d.weather.includes('雨');

                    return (
                      <div
                        key={d.date}
                        onClick={() => onSelectDate(d.date)}
                        className="flex-1 flex flex-col items-center group cursor-pointer h-full justify-end"
                        title={`${d.date}：出工 ${d.workerCount} 人 (${d.weather})`}
                      >
                        <span className="text-[10px] font-bold text-slate-600 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {d.workerCount}
                        </span>

                        <div
                          style={{ height: `${heightPercent}%` }}
                          className={`w-full max-w-[36px] rounded-t-lg transition-all group-hover:scale-105 ${
                            isRain
                              ? 'bg-gradient-to-t from-blue-400 to-blue-300'
                              : 'bg-gradient-to-t from-amber-500 to-amber-400 hover:from-amber-600 hover:to-amber-500'
                          }`}
                        ></div>

                        <span className="text-[10px] text-slate-500 mt-2 font-medium truncate">
                          {d.date.slice(8)}日
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2">
                  <span>黃色：晴天正常出工</span>
                  <span>藍色：天候下雨</span>
                  <span>點擊長條可切換至該日日誌填報</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Craft Breakdown Progress Bars */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <HardHat className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-sm text-slate-900">
              各工種累計出工工數佔比與人天統計
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            全月合計：{summary.totalWorkerCount} 人天
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {summary.craftBreakdown.map((craft, i) => {
            const pct = summary.totalWorkerCount > 0 ? Math.round((craft.totalManDays / summary.totalWorkerCount) * 100) : 0;
            return (
              <div key={craft.craftName} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">{craft.craftName}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-blue-700">{craft.totalManDays} 人天</span>
                    <span className="text-slate-400 font-medium">({pct}%)</span>
                  </div>
                </div>
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${pct}%` }}
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full"
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Monthly Master Daily Breakdown Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900">
              當月每日施工日誌進度與出工彙整明細表
            </h3>
          </div>
          <span className="text-xs text-slate-400">共 {summary.dailyStats.length} 筆天數記錄</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-bold">
                <th className="p-3 pl-5">日期</th>
                <th className="p-3">天候狀況</th>
                <th className="p-3">預定累計進度</th>
                <th className="p-3">實際累計進度</th>
                <th className="p-3">進度差異</th>
                <th className="p-3">出工人數</th>
                <th className="p-3">登載工項數</th>
                <th className="p-3 pr-5 text-right">動作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {summary.dailyStats.map((d) => {
                const diff = Number((d.actualProgress - d.plannedProgress).toFixed(2));
                return (
                  <tr key={d.date} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 pl-5 font-bold text-slate-900">{d.date}</td>
                    <td className="p-3 text-slate-600">{d.weather}</td>
                    <td className="p-3 font-medium text-slate-700">{d.plannedProgress}%</td>
                    <td className="p-3 font-bold text-blue-700">{d.actualProgress}%</td>
                    <td className="p-3">
                      <span
                        className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                          diff >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {diff >= 0 ? `+${diff}%` : `${diff}%`}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-slate-900">{d.workerCount} 人</td>
                    <td className="p-3 text-slate-600">{d.workItemsCount} 項</td>
                    <td className="p-3 pr-5 text-right">
                      <button
                        type="button"
                        onClick={() => onSelectDate(d.date)}
                        className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg transition-colors"
                      >
                        開啟日誌
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
