import React, { useState, useEffect } from "react";
import {
  Github,
  Facebook,
  Twitter,
  Youtube,
  Code2,
  Instagram,
  Music,
  Globe,
  Mail,
  Phone,
} from "lucide-react";
import { useAppContext } from "../store";
import {
  getLocalNoCodeConfig,
  NoCodeSystemSettings,
  saveNoCodeConfigDb,
} from "../lib/nocode_store";

export function Footer() {
  const [showToast, setShowToast] = useState(false);
  const { setView, role, isEditMode, authUser } = useAppContext();
  const [sysSettings, setSysSettings] = useState<NoCodeSystemSettings | null>(null);

  const handleUpdateSettings = (updates: Partial<NoCodeSystemSettings>) => {
    const cfg = getLocalNoCodeConfig();
    const updated = { ...cfg, systemSettings: { ...cfg.systemSettings, ...updates } };
    saveNoCodeConfigDb(updated, authUser?.email || 'admin@pilearn.com', 'Update footer/system settings');
    setSysSettings(updated.systemSettings);
    window.dispatchEvent(new Event('pilearn_config_sync'));
  };

  useEffect(() => {
    const cfg = getLocalNoCodeConfig();
    setSysSettings(cfg.systemSettings);
    const handleStorage = () => setSysSettings(getLocalNoCodeConfig().systemSettings);
    window.addEventListener("storage", handleStorage);
    window.addEventListener("pilearn_config_sync", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("pilearn_config_sync", handleStorage);
    };
  }, []);

  const handleLinkClick = (viewAlias?: string, url?: string) => {
    if (viewAlias) { setView(viewAlias as any); return; }
    if (url) { window.open(url, "_blank"); return; }
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <footer className="relative bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 mt-20 pt-16 pb-8 text-slate-700 dark:text-slate-300">
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-amber-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm font-bold">
          Tính năng đang được phát triển. Vui lòng quay lại sau!
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              {sysSettings?.headerLogoImage ? (
                <img src={sysSettings.headerLogoImage} alt="Brand" className="h-8 w-8 shrink-0 object-cover rounded-lg" />
              ) : (
                <svg width="28" height="28" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                  <rect x="15" y="15" width="35" height="30" fill="#0052cc" />
                  <path d="M50 15 H65 A30 30 0 0 1 65 75 H50 V45 H65 A15 15 0 0 0 65 30 H50 V15 Z" fill="#00b4ff" />
                  <rect x="35" y="28" width="40" height="28" rx="14" fill="white" />
                  <path d="M46 36 L40 42 L46 48 M64 36 L70 42 L64 48" stroke="#0052cc" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  <rect x="15" y="48" width="32" height="42" rx="6" fill="#0a192f" />
                  <rect x="20" y="55" width="8" height="3" rx="1.5" fill="#00b4ff" />
                  <rect x="30" y="55" width="8" height="3" rx="1.5" fill="white" />
                  <rect x="20" y="63" width="14" height="3" rx="1.5" fill="#00b4ff" />
                  <rect x="36" y="63" width="6" height="3" rx="1.5" fill="#00b4ff" />
                  <path d="M22 75 L28 80 L22 85 M32 85 L40 85" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
                {sysSettings?.headerLogoText || <><span className="text-[#0052cc]">Pi</span>Learn</>}
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-xs leading-relaxed">
              {sysSettings?.aboutText || "Nền tảng học lập trình thân thiện, vui nhộn và vô cùng hiệu quả dành cho mọi lứa tuổi."}
            </p>
            <div className="flex flex-wrap gap-2">
              {sysSettings?.socialLinks?.length > 0 ? (
                sysSettings.socialLinks.map((link) => {
                  let Icon = Globe;
                  let hoverClass = "hover:text-[#0052cc]";
                  if (link.platform === "facebook") { Icon = Facebook; hoverClass = "hover:text-blue-600"; }
                  else if (link.platform === "twitter") { Icon = Twitter; hoverClass = "hover:text-sky-500"; }
                  else if (link.platform === "youtube") { Icon = Youtube; hoverClass = "hover:text-red-600"; }
                  else if (link.platform === "github") { Icon = Github; hoverClass = "hover:text-slate-900"; }
                  else if (link.platform === "instagram") { Icon = Instagram; hoverClass = "hover:text-pink-600"; }
                  else if (link.platform === "tiktok") { Icon = Music; hoverClass = "hover:text-slate-900"; }

                  return (
                    <button
                      key={link.id}
                      type="button"
                      onClick={() => handleLinkClick(undefined, link.url)}
                      className={`w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 ${hoverClass} transition-colors`}
                      title={link.label || link.platform}
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  );
                })
              ) : (
                <>
                  <button type="button" onClick={() => handleLinkClick(undefined, "https://facebook.com")} className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-blue-600 transition-colors">
                    <Facebook className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => handleLinkClick(undefined, "https://youtube.com")} className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-red-600 transition-colors">
                    <Youtube className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => handleLinkClick(undefined, "https://github.com")} className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors">
                    <Github className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          {sysSettings?.footerColumns?.slice(0, 3).map((col, colIdx) => (
            <div key={col.id}>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">{col.title}</h3>
              <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
                {col.links.map((link, idx) => (
                  <li key={idx}>
                    <button
                      onClick={() => handleLinkClick(link.viewAlias, link.url)}
                      className="hover:text-[#0052cc] dark:hover:text-blue-400 transition-colors"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {(!sysSettings?.footerColumns || sysSettings.footerColumns.length === 0) && (
            <>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Tính năng</h3>
                <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
                  <li><button onClick={() => handleLinkClick('roadmap')} className="hover:text-[#0052cc] transition-colors">Lộ trình học</button></li>
                  <li><button onClick={() => handleLinkClick('practice')} className="hover:text-[#0052cc] transition-colors">Thực hành</button></li>
                  <li><button onClick={() => handleLinkClick('exams')} className="hover:text-[#0052cc] transition-colors">Kiểm tra</button></li>
                  <li><button onClick={() => handleLinkClick('boss-battle')} className="hover:text-[#0052cc] transition-colors">Đánh Boss</button></li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Về chúng tôi</h3>
                <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
                  <li><button onClick={() => handleLinkClick('about')} className="hover:text-[#0052cc] transition-colors">Giới thiệu</button></li>
                  <li><button onClick={() => handleLinkClick('terms')} className="hover:text-[#0052cc] transition-colors">Điều khoản</button></li>
                  <li><button onClick={() => handleLinkClick('privacy')} className="hover:text-[#0052cc] transition-colors">Bảo mật</button></li>
                  <li><button onClick={() => handleLinkClick('help')} className="hover:text-[#0052cc] transition-colors">Trợ giúp</button></li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Liên hệ</h3>
                <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
                  <li className="flex items-center gap-2"><Mail className="w-4 h-4 shrink-0" /> hotro@pilearn.vn</li>
                  <li className="flex items-center gap-2"><Phone className="w-4 h-4 shrink-0" /> 0987.654.321</li>
                  <li className="flex items-center gap-2"><Code2 className="w-4 h-4 shrink-0" /> Kid-Friendly & AI Powered</li>
                </ul>
              </div>
            </>
          )}
        </div>

        <div className="border-t border-gray-100 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <span>{sysSettings?.footerText || "© 2026 Pilearn. Bản quyền thuộc về Đội ngũ GDPT Tin học 10."}</span>
          <div className="text-xs text-slate-400">
            Made with ❤️ for Vietnamese students
          </div>
        </div>
      </div>
    </footer>
  );
}
