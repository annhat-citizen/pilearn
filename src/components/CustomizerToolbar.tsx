import React from 'react';
import { NoCodeBlock, NoCodeAppearance } from '../lib/nocode_store';
import { audioService } from '../utils/audio';

interface CustomizerToolbarProps {
  activeBlock: NoCodeBlock;
  appearance: NoCodeAppearance;
  onUpdate: (updatedFields: Partial<NoCodeBlock>) => void;
  onClose: () => void;
}

export function CustomizerToolbar({ activeBlock, appearance, onUpdate, onClose }: CustomizerToolbarProps) {
  return (
    <div className="fixed top-20 left-1/2 -ml-[300px] w-[600px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 z-[100] shadow-2xl font-sans select-none rounded-2xl flex flex-col gap-2 text-slate-700 dark:text-slate-200">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-bold uppercase text-slate-500">Đang Sửa Khối: {activeBlock.type}</span>
        <button onClick={onClose} className="text-xs text-slate-400 hover:text-red-500">Đóng</button>
      </div>

      {/* ROW 1: Typography, Alignment & Rotation */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Font Family Dropdown */}
        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 shadow-2xs">
          <span className="text-[10.5px] text-slate-500 dark:text-slate-400 font-extrabold uppercase">Phông:</span>
          <select
            value={activeBlock.fontFamily || 'sans'}
            onChange={(e) => {
              audioService.playClick();
              onUpdate({ fontFamily: e.target.value });
            }}
            className="text-xs bg-transparent border-0 font-bold focus:outline-none focus:ring-0 max-w-[130px] dark:text-white pointer-events-auto cursor-pointer"
          >
            <option value="sans">Mặc định (Inter)</option>
            <option value="grotesk">Space Grotesk 🌌</option>
            <option value="serif">Playfair Display ✍️</option>
            <option value="mono">JetBrains Mono 💻</option>
            <option value="Arial">Arial</option>
            {appearance.customUploadedFonts?.map(f => (
              <option key={f.name} value={f.name}>{f.name} (Tải lên) 🚀</option>
            ))}
          </select>
        </div>
        
        {/* ... (Include other toolbar controls from lines 521-600) ... */}
      </div>
    </div>
  );
}
