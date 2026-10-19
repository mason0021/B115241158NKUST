import React, { useState, useRef } from 'react';
import { X, Upload, Camera, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { ConstructionPhoto, WorkItem } from '../../types/construction';

interface PhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  workItems: WorkItem[];
  onUpload: (photo: ConstructionPhoto) => void;
}

export const PhotoUploadModal: React.FC<PhotoUploadModalProps> = ({
  isOpen,
  onClose,
  workItems,
  onUpload,
}) => {
  const [selectedWorkItem, setSelectedWorkItem] = useState<string>(workItems[0]?.name || '');
  const [customWorkItem, setCustomWorkItem] = useState<string>('');
  const [useCustomName, setUseCustomName] = useState<boolean>(workItems.length === 0);
  const [location, setLocation] = useState<string>(workItems[0]?.location || '');
  const [description, setDescription] = useState<string>('');
  const [photographer, setPhotographer] = useState<string>('現場品管工程師');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('請選擇標準圖片格式 (JPG, PNG, WebP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
      setErrorMsg('');
    };
    reader.readAsDataURL(file);
  };

  // Helper to use sample photo for quick demo testing if user doesn't have an image on hand
  const handleUseSampleImage = (type: string) => {
    const colors: Record<string, string> = {
      rebar: '#1e293b',
      formwork: '#0f766e',
      concrete: '#334155',
      mep: '#1e3a8a',
    };
    const color = colors[type] || '#1e293b';
    const finalItemName = (useCustomName ? customWorkItem : selectedWorkItem) || '營建工項自主查驗';

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480">
      <rect width="640" height="480" fill="${color}"/>
      <g fill="#ffffff" opacity="0.18">
        <circle cx="120" cy="120" r="90"/>
        <circle cx="500" cy="380" r="140"/>
        <polygon points="50,420 180,240 320,380 460,200 600,420" />
      </g>
      <rect x="25" y="25" width="590" height="430" fill="none" stroke="#f59e0b" stroke-width="3" stroke-dasharray="8 8" opacity="0.7"/>
      <rect x="40" y="330" width="560" height="100" rx="8" fill="#020617" opacity="0.9"/>
      <text x="60" y="368" fill="#fbbf24" font-family="sans-serif" font-size="20" font-weight="bold">【工程查驗照片】${finalItemName.slice(0, 18)}</text>
      <text x="60" y="398" fill="#e2e8f0" font-family="sans-serif" font-size="14">位置: ${location || '現場施工區域'}</text>
      <circle cx="555" cy="380" r="24" fill="#10b981"/>
      <path d="M545 380 L553 388 L567 372" stroke="#ffffff" stroke-width="3.5" fill="none"/>
    </svg>`;
    setPreviewUrl(`data:image/svg+xml;utf8,${encodeURIComponent(svg)}`);
    setErrorMsg('');
  };

  const handleSelectWorkItemChange = (val: string) => {
    if (val === '__custom__') {
      setUseCustomName(true);
    } else {
      setUseCustomName(false);
      setSelectedWorkItem(val);
      const matched = workItems.find((w) => w.name === val);
      if (matched && matched.location) {
        setLocation(matched.location);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalItemName = useCustomName ? customWorkItem.trim() : selectedWorkItem.trim();

    if (!finalItemName) {
      setErrorMsg('施工照片必須指定施作工項名稱！');
      return;
    }

    if (!previewUrl) {
      setErrorMsg('請選擇欲上傳的照片檔案或點擊快速帶入範例圖');
      return;
    }

    const now = new Date();
    const timestampStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newPhoto: ConstructionPhoto = {
      id: `p-${Date.now()}`,
      workItemName: finalItemName,
      location: location.trim() || '施工現場指定區域',
      timestamp: timestampStr,
      description: description.trim() || '施工進度與自主品管查驗拍照存證',
      dataUrl: previewUrl,
      photographer: photographer.trim() || '現場工程師',
    };

    onUpload(newPhoto);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden my-6">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">上傳施工工項照片</h3>
              <p className="text-xs text-slate-300">照片上傳前請先確認施作工項名稱與標註資訊</p>
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. 關鍵詢問：工項名稱 */}
          <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl space-y-2">
            <label className="block text-xs font-bold text-amber-900">
              📌 步驟 1：請問這張照片屬於哪一個「施作工項」？ <span className="text-rose-600">*</span>
            </label>

            {!useCustomName && workItems.length > 0 ? (
              <div className="space-y-2">
                <select
                  value={selectedWorkItem}
                  onChange={(e) => handleSelectWorkItemChange(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-sm font-medium text-slate-800 focus:ring-2 focus:ring-amber-500 outline-none"
                >
                  {workItems.map((item) => (
                    <option key={item.id} value={item.name}>
                      {item.name} ({item.location})
                    </option>
                  ))}
                  <option value="__custom__">➕ 自訂其他工項名稱...</option>
                </select>
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setUseCustomName(true)}
                    className="text-xs text-amber-800 hover:underline font-medium"
                  >
                    或手動輸入新工項名稱
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <input
                  type="text"
                  value={customWorkItem}
                  onChange={(e) => setCustomWorkItem(e.target.value)}
                  placeholder="請輸入工項名稱 (例：3F 柱樑鋼筋綁紮、基礎大底灌漿)"
                  className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-amber-500 outline-none"
                  autoFocus
                />
                {workItems.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setUseCustomName(false)}
                    className="text-xs text-amber-800 hover:underline font-medium"
                  >
                    返回選擇當日已建立之工項
                  </button>
                )}
              </div>
            )}
          </div>

          {/* 2. 施作位置與說明 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                施作具體位置 (Location)
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="例：A棟 4F (X1-X5軸)"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                拍攝人 / 查驗人員
              </label>
              <input
                type="text"
                value={photographer}
                onChange={(e) => setPhotographer(e.target.value)}
                placeholder="例：陳品管工程師"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              照片施工說明 / 查驗重點
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="例：綁紮完成自主查驗，箍筋間距10cm符合規範，無下陷變形"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

          {/* 3. 照片上傳區 */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              📷 選擇照片檔案 <span className="text-rose-600">*</span>
            </label>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {previewUrl ? (
              <div className="relative rounded-xl overflow-hidden border-2 border-amber-400 bg-slate-900 group">
                <img
                  src={previewUrl}
                  alt="預覽照片"
                  className="w-full h-48 object-cover object-center"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-white text-slate-900 text-xs font-bold rounded-lg shadow-sm hover:bg-slate-100"
                  >
                    更換照片
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewUrl('')}
                    className="px-3 py-1.5 bg-rose-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-rose-700"
                  >
                    移除
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-xl p-5 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-amber-50/20"
              >
                <div className="flex flex-col items-center justify-center gap-1.5 text-slate-500">
                  <Upload className="w-8 h-8 text-amber-600" />
                  <span className="text-xs font-bold text-slate-700">點此上傳手機拍照或相簿照片</span>
                  <span className="text-[11px] text-slate-400">支援 JPG, PNG, WEBP 高解析施工查驗相片</span>
                </div>
              </div>
            )}

            {/* Quick Demo Photo Presets */}
            {!previewUrl && (
              <div className="mt-2.5">
                <span className="text-[11px] text-slate-500 font-medium mr-2">快速帶入工區實況範本圖：</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  <button
                    type="button"
                    onClick={() => handleUseSampleImage('rebar')}
                    className="text-[11px] px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium"
                  >
                    鋼筋查驗圖
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUseSampleImage('formwork')}
                    className="text-[11px] px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium"
                  >
                    模板支撐圖
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUseSampleImage('concrete')}
                    className="text-[11px] px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium"
                  >
                    混凝土澆置圖
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Upload className="w-4 h-4" />
              確認儲存照片 (附工項標籤)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
