import React, { useState, useEffect } from "react";
import { Github, Facebook, Youtube, Code2, Globe, Mail, Phone, ChevronRight } from "lucide-react";
import { useAppContext } from "../store";
import { getLocalNoCodeConfig, NoCodeSystemSettings } from "../lib/nocode_store";

export function Footer() {
  const [showToast, setShowToast] = useState(false);
  const { setView } = useAppContext();
  const [sysSettings, setSysSettings] = useState<NoCodeSystemSettings | null>(null);

  useEffect(() => {
    setSysSettings(getLocalNoCodeConfig().systemSettings);
    const handleStorage = () => setSysSettings(getLocalNoCodeConfig().systemSettings);
    window.addEventListener("storage", handleStorage);
    window.addEventListener("pilearn_config_sync", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("pilearn_config_sync", handleStorage);
    };
  }, []);

  const handleLink = (viewAlias?: string, url?: string) => {
    if (viewAlias) { setView(viewAlias as any); return; }
    if (url) { window.open(url, "_blank"); return; }
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const columns = sysSettings?.footerColumns?.slice(0, 3) || [
    {
      id: 'features', title: 'Tính năng',
      links: [
        { label: 'Lộ trình học', viewAlias: 'roadmap' },
        { label: 'Bài học', viewAlias: 'student-dashboard' },
        { label: 'Thực hành', viewAlias: 'practice' },
        { label: 'Kiểm tra', viewAlias: 'exams' },
        { label: 'Đánh Boss', viewAlias: 'boss-battle' },
      ]
    },
    {
      id: 'about', title: 'Về chúng tôi',
      links: [
        { label: 'Giới thiệu', viewAlias: 'about' },
        { label: 'Điều khoản', viewAlias: 'terms' },
        { label: 'Chính sách bảo mật', viewAlias: 'privacy' },
        { label: 'Trợ giúp', viewAlias: 'help' },
      ]
    },
    {
      id: 'contact', title: 'Liên hệ',
      links: [
        { label: 'Email: hotro@pilearn.vn', url: 'mailto:hotro@pilearn.vn' },
        { label: 'Hotline: 0987.654.321', url: 'tel:0987654321' },
      ]
    }
  ];

  return (
    <footer className="bg-gray-50 dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 mt-16">
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-amber-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm font-medium">
          Tính năng đang phát triển. Vui lòng quay lại sau!
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              {sysSettings?.headerLogoImage ? (
                <img src={sysSettings.headerLogoImage} alt="" className="h-8 w-8 rounded-lg object-cover" />
              ) : (
                <svg width="28" height="28" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                  <rect x="15" y="15" width="35" height="30" fill="#034ea2" />
                  <path d="M50 15 H65 A30 30 0 0 1 65 75 H50 V45 H65 A15 15 0 0 0 65 30 H50 V15 Z" fill="#51b848" />
                  <rect x="35" y="28" width="40" height="28" rx="14" fill="white" />
                  <path d="M46 36 L40 42 L46 48 M64 36 L70 42 L64 48" stroke="#034ea2" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  <rect x="15" y="48" width="32" height="42" rx="6" fill="#111827" />
                  <rect x="20" y="55" width="8" height="3" rx="1.5" fill="#51b848" />
                  <rect x="30" y="55" width="8" height="3" rx="1.5" fill="white" />
                  <rect x="20" y="63" width="14" height="3" rx="1.5" fill="#51b848" />
                  <rect x="36" y="63" width="6" height="3" rx="1.5" fill="#51b848" />
                  <path d="M22 75 L28 80 L22 85 M32 85 L40 85" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              <span className="font-bold text-lg text-gray-900 dark:text-white">PiLearn</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 leading-relaxed max-w-xs">
              {sysSettings?.aboutText || "Nền tảng học lập trình thân thiện, vui nhộn và hiệu quả dành cho mọi lứa tuổi."}
            </p>
            <div className="flex gap-2">
              {[
                { icon: Facebook, url: 'https://facebook.com', hover: 'hover:text-blue-600' },
                { icon: Youtube, url: 'https://youtube.com', hover: 'hover:text-red-600' },
                { icon: Github, url: 'https://github.com', hover: 'hover:text-gray-900 dark:hover:text-white' },
              ].map((s, i) => (
                <button key={i} onClick={() => handleLink(undefined, s.url)}
                  className={`w-9 h-9 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex items-center justify-center text-gray-500 dark:text-gray-400 ${s.hover} transition-colors`}
                ><s.icon className="w-4 h-4" /></button>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.id}>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">{col.title}</h3>
              <ul className="space-y-3">
                {col.links.map((link, i) => (
                  <li key={i}>
                    <button onClick={() => handleLink(link.viewAlias, link.url)}
                      className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors flex items-center gap-1"
                    >
                      {col.id === 'contact' ? null : <ChevronRight className="w-3 h-3 shrink-0 opacity-0 -ml-4 group-hover:opacity-100" />}
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-200 dark:border-slate-800 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <span>{sysSettings?.footerText || "© 2026 PiLearn. Được phát triển bởi đội ngũ GDPT Tin học 10."}</span>
          <span className="flex items-center gap-1.5 text-xs">
            <Code2 className="w-4 h-4" /> Học lập trình cùng PiLearn
          </span>
        </div>
      </div>
    </footer>
  );
}
