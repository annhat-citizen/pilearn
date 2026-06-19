import React from 'react';
import { useAppContext } from '../store';
import { saveLocalNoCodeConfig, saveNoCodeConfigDb } from '../lib/nocode_store';

export function GlobalAppearanceEditor({ onClose }: { onClose: () => void }) {
  const { nocodeConfig } = useAppContext();

  const handleUpdate = (updates: any) => {
    const newConfig = {
      ...nocodeConfig,
      appearance: { ...nocodeConfig.appearance, ...updates }
    };
    saveNoCodeConfigDb(newConfig, 'admin@pilearn.com', 'Update global appearance');
    window.dispatchEvent(new Event('pilearn_config_sync'));
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-[450px] shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 font-sans">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold tracking-tight">Cài đặt giao diện toàn trang 🎨</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold">×</button>
        </div>
        
        <div className="space-y-4">
          {/* Colors section */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase text-slate-500 mb-1.5">Màu chính (Primary)</label>
              <div className="flex items-center gap-2 border border-slate-200 dark:border-slate-700 rounded-xl p-2 bg-slate-50 dark:bg-slate-800">
                <input 
                  type="color"
                  value={nocodeConfig.appearance.primaryColor}
                  onChange={(e) => handleUpdate({ primaryColor: e.target.value })}
                  className="w-10 h-10 rounded-lg cursor-pointer border-0"
                />
                <span className="text-xs font-mono font-bold">{nocodeConfig.appearance.primaryColor}</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-slate-500 mb-1.5">Màu nền trang (Bg)</label>
              <div className="flex items-center gap-2 border border-slate-200 dark:border-slate-700 rounded-xl p-2 bg-slate-50 dark:bg-slate-800">
                <input 
                  type="color"
                  value={nocodeConfig.appearance.backgroundColor}
                  onChange={(e) => handleUpdate({ backgroundColor: e.target.value })}
                  className="w-10 h-10 rounded-lg cursor-pointer border-0"
                />
                <span className="text-xs font-mono font-bold">{nocodeConfig.appearance.backgroundColor}</span>
              </div>
            </div>
          </div>

          {/* Font Family selection */}
          <div>
            <label className="block text-xs font-black uppercase text-slate-500 mb-1.5">Phông chữ toàn trang</label>
            <select
              value={nocodeConfig.appearance.fontFamily || 'sans'}
              onChange={(e) => handleUpdate({ fontFamily: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer text-slate-800 dark:text-white"
            >
              <option value="sans">Mặc định (Quicksand & Fredoka)  🧒</option>
              <option value="grotesk">Space Grotesk (Công nghệ)  🌌</option>
              <option value="serif">Playfair Display (Thư pháp cổ điển)  ✍️</option>
              <option value="mono">JetBrains Mono (Lập trình viên)  💻</option>
            </select>
          </div>

          {/* Border Radius Selection */}
          <div>
            <label className="block text-xs font-black uppercase text-slate-500 mb-1.5">Bo tròn góc (Giao diện chung)</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'Không bo', value: 'none' },
                { label: 'Nhẹ', value: 'md' },
                { label: 'Tròn vừa', value: '2xl' },
                { label: 'Cực tròn', value: '3xl' }
              ].map((radius) => (
                <button
                  key={radius.value}
                  type="button"
                  onClick={() => handleUpdate({ borderRadius: radius.value })}
                  className={`py-2 text-[11px] font-bold rounded-xl border transition ${
                    nocodeConfig.appearance.borderRadius === radius.value
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {radius.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex gap-2">
            <button 
              onClick={() => {
                // Reset to default
                handleUpdate({
                  primaryColor: '#fa6d55',
                  backgroundColor: '#fffbf0',
                  borderRadius: '3xl',
                  fontFamily: 'sans'
                });
              }}
              className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl"
            >
              Đặt lại mặc định
            </button>
            <button 
              onClick={onClose}
              className="w-1/2 py-2.5 bg-[#fa6d55] hover:opacity-90 text-white text-xs font-bold rounded-xl shadow-lg shadow-coral-500/10"
            >
              Áp dụng & Lưu 💾
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
