import React, { useState } from 'react';
import { Camera, Trash2, Eye, Download, Tag, MapPin, Clock, Plus, Image as ImageIcon, X } from 'lucide-react';
import { ConstructionPhoto, WorkItem } from '../../types/construction';
import { PhotoUploadModal } from '../Modals/PhotoUploadModal';

interface PhotoSectionProps {
  photos: ConstructionPhoto[];
  workItems: WorkItem[];
  onChange: (photos: ConstructionPhoto[]) => void;
}

export const PhotoSection: React.FC<PhotoSectionProps> = ({ photos, workItems, onChange }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activePreviewPhoto, setActivePreviewPhoto] = useState<ConstructionPhoto | null>(null);

  const handleAddPhoto = (photo: ConstructionPhoto) => {
    onChange([...photos, photo]);
  };

  const handleDeletePhoto = (id: string) => {
    if (confirm('確定要移除此張施工照片嗎？')) {
      onChange(photos.filter((p) => p.id !== id));
    }
  };

  const handleDownload = (photo: ConstructionPhoto) => {
    const a = document.createElement('a');
    a.href = photo.dataUrl;
    a.download = `施工照片-${photo.workItemName}-${photo.timestamp.replace(/[: ]/g, '-')}.png`;
    a.click();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="w-2.5 h-6 bg-amber-500 rounded-full inline-block"></span>
            施工照片查驗與存證
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-300">
              {photos.length} 張相片
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            上傳照片前系統將先詢問所屬施作工項，並於相片卡片下方清晰標示工項名稱與查驗資訊
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-colors"
        >
          <Camera className="w-4 h-4" />
          上傳工項照片 (附工項標註)
        </button>
      </div>

      {photos.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-300 rounded-xl">
          <Camera className="w-12 h-12 text-slate-400 mx-auto mb-2 opacity-50" />
          <p className="text-sm font-bold text-slate-700">本日尚未上傳施工照片</p>
          <p className="text-xs text-slate-500 mt-1">點擊上方按鈕，選擇施作工項後上傳相片存證</p>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="mt-3 px-4 py-1.5 text-xs font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-lg inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> 立即新增第一張照片
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col hover:shadow-md transition-shadow"
            >
              {/* Photo Image Frame */}
              <div className="relative aspect-4/3 bg-slate-900 overflow-hidden group">
                <img
                  src={photo.dataUrl}
                  alt={photo.workItemName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Overlay Action Buttons */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setActivePreviewPhoto(photo)}
                    className="p-2 bg-white/90 hover:bg-white text-slate-900 rounded-full shadow-md transition-colors"
                    title="放大檢視"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownload(photo)}
                    className="p-2 bg-white/90 hover:bg-white text-slate-900 rounded-full shadow-md transition-colors"
                    title="下載照片"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeletePhoto(photo.id)}
                    className="p-2 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-md transition-colors"
                    title="刪除照片"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Crucial requirement: Work Item Name displayed directly below the photo! */}
              <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between bg-slate-50/50">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                      施作工項名稱：
                    </span>
                  </div>
                  <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg">
                    <span className="text-xs font-bold text-amber-950 block leading-tight">
                      {photo.workItemName}
                    </span>
                  </div>
                </div>

                <div className="space-y-1 text-xs text-slate-600 pt-1 border-t border-slate-200">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-semibold">{photo.location}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                    <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{photo.timestamp}</span>
                    {photo.photographer && <span>• {photo.photographer}</span>}
                  </div>

                  {photo.description && (
                    <p className="text-[11px] text-slate-600 bg-white p-2 rounded border border-slate-100 mt-1 italic">
                      {photo.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for asking work item name & uploading photo */}
      <PhotoUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        workItems={workItems}
        onUpload={handleAddPhoto}
      />

      {/* Fullscreen Preview Lightbox */}
      {activePreviewPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setActivePreviewPhoto(null)}
        >
          <div
            className="max-w-4xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-amber-400" />
                <h4 className="font-bold text-sm">{activePreviewPhoto.workItemName}</h4>
              </div>
              <button
                type="button"
                onClick={() => setActivePreviewPhoto(null)}
                className="p-1 hover:bg-slate-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-slate-950 flex items-center justify-center max-h-[70vh]">
              <img
                src={activePreviewPhoto.dataUrl}
                alt={activePreviewPhoto.workItemName}
                className="max-h-[70vh] object-contain w-auto mx-auto"
              />
            </div>
            <div className="p-4 bg-slate-50 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-800">{activePreviewPhoto.location}</span>
                <span className="text-slate-500 ml-2">({activePreviewPhoto.timestamp})</span>
                <p className="text-slate-600 mt-0.5">{activePreviewPhoto.description}</p>
              </div>
              <button
                type="button"
                onClick={() => handleDownload(activePreviewPhoto)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
              >
                <Download className="w-3.5 h-3.5" /> 下載原始相片
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
