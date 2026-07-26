import React from 'react';
import { X, Download, ExternalLink } from 'lucide-react';

interface ImageViewerModalProps {
  imageUrl: string;
  onClose: () => void;
}

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
  imageUrl,
  onClose,
}) => {
  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in select-none"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-4xl max-h-[90vh] bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
      >
        <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300">Image Viewer</span>
          <div className="flex items-center gap-2">
            <a
              href={imageUrl}
              download="chat_image.jpg"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              title="Download Image"
            >
              <Download className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-2 flex items-center justify-center bg-black/50 overflow-hidden">
          <img
            src={imageUrl}
            alt="Expanded view"
            className="max-h-[80vh] max-w-full object-contain rounded-2xl"
          />
        </div>
      </div>
    </div>
  );
};
