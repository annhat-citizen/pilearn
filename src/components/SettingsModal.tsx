import React from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { motion, AnimatePresence } from 'motion/react';
import { Key, X, Server, Shield, CheckCircle2, Music } from 'lucide-react';

export function SettingsModal() {
  const { geminiApiKey, setGeminiApiKey, isSettingsOpen, setIsSettingsOpen } = useSettings();

  const [studentBgMusicEnabled, setStudentBgMusicEnabled] = React.useState(() => {
    return localStorage.getItem('pilearn_student_bg_music_muted') !== 'true';
  });

  // Re-read local state when modal opens
  React.useEffect(() => {
    if (isSettingsOpen) {
      setStudentBgMusicEnabled(localStorage.getItem('pilearn_student_bg_music_muted') !== 'true');
    }
  }, [isSettingsOpen]);

  const handleToggleBgMusic = (checked: boolean) => {
    setStudentBgMusicEnabled(checked);
    localStorage.setItem('pilearn_student_bg_music_muted', (!checked).toString());
    window.dispatchEvent(new Event('pilearn_config_sync'));
  };

  if (!isSettingsOpen) return null;

  return (
    <AnimatePresence>
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSettingsOpen(false)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/40 rounded-xl">
                  <Server className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">
                  Cài đặt học viên
                </h3>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 dark:hover:text-slate-300 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* API Section */}
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-4 rounded-2xl text-xs sm:text-sm leading-relaxed border border-blue-100 dark:border-blue-800">
                  <p>
                    Hệ thống Gia Sư AI của chúng tôi rất đông người dùng và đôi khi máy chủ bị quá tải (báo lỗi hết Quota). 
                    Bạn có thể <strong>nhập Gemini API Key cá nhân</strong> của bạn để ứng dụng chạy mượt mà không lo nghẽn mạng!
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Key className="w-4 h-4 text-emerald-500" />
                    Gemini API Key (Chạy trên máy cá nhân)
                  </label>
                  <input
                    type="password"
                    value={geminiApiKey}
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                    placeholder="Nhập API Key bắt đầu bằng AIzaSy..."
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white dark:placeholder-slate-500 font-mono text-xs sm:text-sm transition-all"
                  />
                  
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-2">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Key của bạn chỉ được lưu trên trình duyệt máy bạn (localStorage) để truyền trực tiếp.</span>
                  </div>
                </div>

                {geminiApiKey && (
                  <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-400 text-sm font-medium">
                    <CheckCircle2 className="w-5 h-5" />
                    Chúng tôi sẽ ưu tiên dùng Key này thay vì trạm Server gốc.
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-slate-100 dark:border-slate-700/60 my-2" />

              {/* Background Music Section */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Music className="w-4 h-4 text-indigo-500" />
                  Nhạc nền Website
                </label>
                
                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl flex items-center justify-between transition-all hover:bg-slate-100/50 dark:hover:bg-slate-900/50">
                  <div className="text-left mr-4">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Bật nhạc nền hệ thống</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">Tự động phát bài hát nhẹ thư giãn trong khi học bài.</p>
                  </div>
                  
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={studentBgMusicEnabled}
                      onChange={(e) => handleToggleBgMusic(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-colors text-xs sm:text-sm"
              >
                Lưu và Đóng
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
