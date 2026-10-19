import React from 'react';
import { Sun, Cloud, CloudRain, CloudLightning, Thermometer, Calendar, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { DailyLog, WeatherType } from '../../types/construction';

interface BasicInfoProps {
  log: DailyLog;
  onChange: (updated: Partial<DailyLog>) => void;
}

const WEATHER_OPTIONS: { label: WeatherType; icon: React.ReactNode }[] = [
  { label: '晴', icon: <Sun className="w-4 h-4 text-amber-500" /> },
  { label: '多雲', icon: <Cloud className="w-4 h-4 text-slate-400" /> },
  { label: '陰', icon: <Cloud className="w-4 h-4 text-slate-500" /> },
  { label: '小雨', icon: <CloudRain className="w-4 h-4 text-blue-400" /> },
  { label: '大雨', icon: <CloudRain className="w-4 h-4 text-blue-600" /> },
  { label: '豪雨', icon: <CloudLightning className="w-4 h-4 text-purple-500" /> },
  { label: '颱風', icon: <CloudLightning className="w-4 h-4 text-rose-600" /> },
];

export const BasicInfo: React.FC<BasicInfoProps> = ({ log, onChange }) => {
  const diff = Number((log.actualProgress - log.plannedProgress).toFixed(2));
  const isLagging = diff < 0;

  const handleWeatherChange = (key: 'morning' | 'afternoon', value: WeatherType) => {
    onChange({
      weather: {
        ...log.weather,
        [key]: value,
      },
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="w-2.5 h-6 bg-amber-500 rounded-full inline-block"></span>
            工程基本資料與進度管制
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">{log.projectTitle}</p>
        </div>

        {/* Contract Days Pill */}
        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px]">核定工期</span>
            <span className="font-bold text-slate-700">{log.contractDays} 天</span>
          </div>
          <div className="h-6 w-px bg-slate-200"></div>
          <div>
            <span className="text-slate-400 block text-[10px]">已施工</span>
            <span className="font-bold text-blue-600">{log.accumulatedDays} 天</span>
          </div>
          <div className="h-6 w-px bg-slate-200"></div>
          <div>
            <span className="text-slate-400 block text-[10px]">剩餘工期</span>
            <span className="font-bold text-emerald-600">{log.remainingDays} 天</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 日期與主辦機關 */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-600" /> 日誌日期
            </label>
            <input
              type="date"
              value={log.date}
              onChange={(e) => onChange({ date: e.target.value, id: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-500 block text-[11px] mb-1">主辦機關 / 業主</span>
              <input
                type="text"
                value={log.clientAgency}
                onChange={(e) => onChange({ clientAgency: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <div>
              <span className="text-slate-500 block text-[11px] mb-1">監造單位</span>
              <input
                type="text"
                value={log.supervisingAgency}
                onChange={(e) => onChange({ supervisingAgency: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>
        </div>

        {/* 天氣條件 */}
        <div className="space-y-3 bg-slate-50/70 p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-amber-500" /> 當日天候狀況
            </span>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Thermometer className="w-3.5 h-3.5 text-rose-500" />
              <span>氣溫：</span>
              <input
                type="number"
                value={log.weather.temperatureMin}
                onChange={(e) =>
                  onChange({
                    weather: { ...log.weather, temperatureMin: Number(e.target.value) },
                  })
                }
                className="w-11 px-1 py-0.5 bg-white border border-slate-300 rounded text-center text-xs"
              />
              <span>~</span>
              <input
                type="number"
                value={log.weather.temperatureMax}
                onChange={(e) =>
                  onChange({
                    weather: { ...log.weather, temperatureMax: Number(e.target.value) },
                  })
                }
                className="w-11 px-1 py-0.5 bg-white border border-slate-300 rounded text-center text-xs"
              />
              <span>°C</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">上午天氣</label>
              <select
                value={log.weather.morning}
                onChange={(e) => handleWeatherChange('morning', e.target.value as WeatherType)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium"
              >
                {WEATHER_OPTIONS.map((w) => (
                  <option key={w.label} value={w.label}>
                    {w.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">下午天氣</label>
              <select
                value={log.weather.afternoon}
                onChange={(e) => handleWeatherChange('afternoon', e.target.value as WeatherType)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium"
              >
                {WEATHER_OPTIONS.map((w) => (
                  <option key={w.label} value={w.label}>
                    {w.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="weatherImpact"
              checked={log.weather.isImpactedByWeather}
              onChange={(e) =>
                onChange({
                  weather: { ...log.weather, isImpactedByWeather: e.target.checked },
                })
              }
              className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
            />
            <label htmlFor="weatherImpact" className="text-xs text-slate-700 font-medium">
              天候影響施工 (例如大雨停工或無法施作室外要徑)
            </label>
          </div>
        </div>

        {/* 預定與實際進度 */}
        <div className="space-y-3 bg-gradient-to-br from-slate-50 to-blue-50/40 p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-blue-600" /> 累計工程進度 (%)
            </span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                isLagging
                  ? 'bg-rose-100 text-rose-700 border border-rose-300'
                  : 'bg-emerald-100 text-emerald-700 border border-emerald-300'
              }`}
            >
              {isLagging ? (
                <>
                  <AlertCircle className="w-3.5 h-3.5" /> 落後 {Math.abs(diff)}%
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" /> 超前 +{diff}%
                </>
              )}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                預定累計進度 (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={log.plannedProgress}
                  onChange={(e) => onChange({ plannedProgress: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-800 pr-8"
                />
                <span className="absolute right-2.5 top-2 text-xs text-slate-400 font-semibold">%</span>
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                實際累計進度 (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={log.actualProgress}
                  onChange={(e) => onChange({ actualProgress: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-bold text-blue-700 pr-8"
                />
                <span className="absolute right-2.5 top-2 text-xs text-slate-400 font-semibold">%</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              進度分析說明 / 追趕對策
            </label>
            <input
              type="text"
              value={log.progressAnalysis || ''}
              onChange={(e) => onChange({ progressAnalysis: e.target.value })}
              placeholder="例：實際進度超前，各工種動線協調良好"
              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
