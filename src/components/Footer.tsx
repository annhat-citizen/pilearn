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
  const [sysSettings, setSysSettings] = useState<NoCodeSystemSettings | null>(
    null,
  );

  const handleUpdateSettings = (updates: Partial<NoCodeSystemSettings>) => {
    const cfg = getLocalNoCodeConfig();
    const updated = {
      ...cfg,
      systemSettings: {
        ...cfg.systemSettings,
        ...updates
      }
    };
    saveNoCodeConfigDb(updated, authUser?.email || 'admin@pilearn.com', 'Update footer/system settings');
    setSysSettings(updated.systemSettings);
    window.dispatchEvent(new Event('pilearn_config_sync'));
  };

  useEffect(() => {
    const cfg = getLocalNoCodeConfig();
    setSysSettings(cfg.systemSettings);

    // Listen to localStorage modifications
    const handleStorage = () => {
      setSysSettings(getLocalNoCodeConfig().systemSettings);
    };
    window.addEventListener("storage", handleStorage);
    window.addEventListener("pilearn_config_sync", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("pilearn_config_sync", handleStorage);
    };
  }, []);

  const handleLinkClick = (viewAlias?: string, url?: string) => {
    if (viewAlias) {
      setView(viewAlias as any);
      return;
    }
    if (url) {
      window.open(url, "_blank");
      return;
    }
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  return (
    <footer className="relative bg-slate-100 dark:bg-slate-900 mt-20 pt-20 pb-10 text-slate-800 dark:text-slate-200 overflow-hidden">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-amber-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm font-bold animate-in fade-in slide-in-from-bottom-4">
          Tính năng đang được phát triển. Vui lòng quay lại sau!
        </div>
      )}

      {/* Decorative Wavy Top Divider */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-none rotate-180 transform translate-y-[1px]">
        <svg
          className="relative block w-full h-[60px]"
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
            className="fill-white dark:fill-slate-800"
          ></path>
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Logo Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              {sysSettings?.headerLogoImage ? (
                <img
                  src={sysSettings.headerLogoImage}
                  alt="Brand"
                  className="h-10 w-10 shrink-0 object-cover rounded-full border border-slate-100 dark:border-slate-700 shadow-sm"
                />
              ) : (
                <div className="flex items-center justify-center shrink-0">
                  <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                    <rect x="15" y="15" width="35" height="30" fill="#0052cc" />
                    <path d="M50 15 H65 A30 30 0 0 1 65 75 H50 V45 H65 A15 15 0 0 0 65 30 H50 V15 Z" fill="#00b4ff" />
                    <rect x="35" y="28" width="40" height="28" rx="14" fill="white" />
                    <path d="M46 36 L40 42 L46 48 M64 36 L70 42 L64 48" stroke="#0a192f" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    <rect x="15" y="48" width="32" height="42" rx="6" fill="#0a192f" />
                    <rect x="20" y="55" width="8" height="3" rx="1.5" fill="#00b4ff" />
                    <rect x="30" y="55" width="8" height="3" rx="1.5" fill="white" />
                    <rect x="20" y="63" width="14" height="3" rx="1.5" fill="#00b4ff" />
                    <rect x="36" y="63" width="6" height="3" rx="1.5" fill="#00b4ff" />
                    <path d="M22 75 L28 80 L22 85 M32 85 L40 85" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
              {role === 'admin' && isEditMode ? (
                <input
                  type="text"
                  value={sysSettings?.headerLogoText || 'Pilearn NCT'}
                  onChange={(e) => handleUpdateSettings({ headerLogoText: e.target.value })}
                  className="bg-transparent border-b border-dashed border-sky-400 font-extrabold tracking-tight text-2xl text-slate-900 dark:text-white focus:outline-none focus:ring-0 rounded-none w-48"
                />
              ) : (
                <span className="font-extrabold tracking-tight text-2xl text-[#0a192f] dark:text-white ml-0.5">
                  {sysSettings?.headerLogoText ? (
                    sysSettings.headerLogoText
                  ) : (
                    <><span className="text-[#0052cc]">P<span className="text-[#00b4ff]">i</span></span>Learn</>
                  )}
                </span>
              )}
            </div>
            {role === 'admin' && isEditMode ? (
              <textarea
                value={sysSettings?.aboutText || "Nền tảng học lập trình thân thiện, vui nhộn và vô cùng hiệu quả dành cho mọi lứa tuổi."}
                onChange={(e) => handleUpdateSettings({ aboutText: e.target.value })}
                rows={3}
                className="text-slate-500 text-sm mb-6 max-w-xs leading-relaxed bg-white border border-dashed border-sky-400 p-2 rounded-xl focus:outline-none focus:ring-0 w-full dark:bg-slate-800 dark:text-slate-300"
              />
            ) : (
              <p className="text-slate-500 text-sm mb-6 max-w-xs leading-relaxed">
                {sysSettings?.aboutText ||
                  "Nền tảng học lập trình thân thiện, vui nhộn và vô cùng hiệu quả dành cho mọi lứa tuổi."}
              </p>
            )}
            <div className="flex flex-wrap gap-2 text-slate-400">
              {sysSettings?.socialLinks &&
              sysSettings.socialLinks.length > 0 ? (
                sysSettings.socialLinks.map((link) => {
                  let Icon = Globe;
                  let hoverClass = "hover:bg-amber-500 hover:text-white";
                  if (link.platform === "facebook") {
                    Icon = Facebook;
                    hoverClass = "hover:bg-blue-600 hover:text-white";
                  } else if (link.platform === "twitter") {
                    Icon = Twitter;
                    hoverClass = "hover:bg-sky-500 hover:text-white";
                  } else if (link.platform === "youtube") {
                    Icon = Youtube;
                    hoverClass = "hover:bg-red-600 hover:text-white";
                  } else if (link.platform === "github") {
                    Icon = Github;
                    hoverClass = "hover:bg-black hover:text-white";
                  } else if (link.platform === "instagram") {
                    Icon = Instagram;
                    hoverClass =
                      "hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white";
                  } else if (link.platform === "tiktok") {
                    Icon = Music;
                    hoverClass = "hover:bg-slate-950 hover:text-white";
                  }

                  const isCustom = link.platform === "custom";
                  return (
                    <button
                      key={link.id}
                      type="button"
                      onClick={() => handleLinkClick(undefined, link.url)}
                      className={`h-9 flex items-center justify-center transition-all duration-300 ${
                        isCustom
                          ? "px-3 text-xs font-bold rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-500 hover:text-white"
                          : `w-9 rounded-full bg-slate-200 dark:bg-slate-800 ${hoverClass}`
                      }`}
                      title={link.label || link.platform}
                    >
                      {isCustom ? (
                        <span className="text-[11px] font-bold tracking-tight">
                          {link.label || "Liên kết"}
                        </span>
                      ) : (
                        <Icon className="w-4 h-4" />
                      )}
                    </button>
                  );
                })
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      handleLinkClick(undefined, "https://facebook.com")
                    }
                    className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all duration-300"
                  >
                    <Facebook className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleLinkClick(undefined, "https://twitter.com")
                    }
                    className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center hover:bg-sky-500 hover:text-white transition-all duration-300"
                  >
                    <Twitter className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleLinkClick(undefined, "https://youtube.com")
                    }
                    className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all duration-300"
                  >
                    <Youtube className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Dynamic Columns */}
          {sysSettings?.footerColumns?.slice(0, 3).map((col, colIdx) => (
            <div key={col.id}>
              {role === 'admin' && isEditMode ? (
                <input
                  type="text"
                  value={col.title}
                  onChange={(e) => {
                    const val = e.target.value;
                    const updatedCols = (sysSettings.footerColumns || []).map((c, idx) => 
                      idx === colIdx ? { ...c, title: val } : c
                    );
                    handleUpdateSettings({ footerColumns: updatedCols });
                  }}
                  className="text-lg font-bold mb-4 bg-transparent border-b border-dashed border-sky-400 text-slate-800 dark:text-white focus:outline-none focus:ring-0 rounded-none w-full"
                />
              ) : (
                <h3 className="text-xl font-bold mb-6">{col.title}</h3>
              )}
              <ul className="space-y-4 text-sm text-slate-500 dark:text-slate-400 font-medium col-links-list">
                {col.links.map((link, idx) => (
                  <li key={idx} className="flex items-center gap-1.5">
                    {role === 'admin' && isEditMode ? (
                      <input
                        type="text"
                        value={link.label}
                        onChange={(e) => {
                          const val = e.target.value;
                          const updatedLinks = col.links.map((li, lIdx) => 
                            lIdx === idx ? { ...li, label: val } : li
                          );
                          const updatedCols = (sysSettings.footerColumns || []).map((c, cIdx) => 
                            cIdx === colIdx ? { ...c, links: updatedLinks } : c
                          );
                          handleUpdateSettings({ footerColumns: updatedCols });
                        }}
                        className="bg-transparent text-xs hover:text-blue-500 transition border-b border-dashed border-sky-300 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-0 rounded-none w-full"
                      />
                    ) : (
                      <button
                        onClick={() => handleLinkClick(link.viewAlias, link.url)}
                        className="hover:text-blue-500 transition text-left"
                      >
                        {link.label}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-2 mb-2 md:mb-0 w-full md:w-auto">
            {role === 'admin' && isEditMode ? (
              <input
                type="text"
                value={sysSettings?.footerText || "© 2026 Pilearn. Bản quyền thuộc về Đội ngũ GDPT Tin học 10."}
                onChange={(e) => handleUpdateSettings({ footerText: e.target.value })}
                className="bg-transparent border-b border-dashed border-sky-400 text-sm text-slate-700 dark:text-white focus:outline-none focus:ring-0 rounded-none w-full"
              />
            ) : (
              <span>
                {sysSettings?.footerText ||
                  "© 2026 Pilearn. Bản quyền thuộc về Đội ngũ GDPT Tin học 10."}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
             <span className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-indigo-400" /> hotro@pilearn.vn</span>
             <span className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-indigo-400" /> 0987.654.321</span>
          </div>
          <div className="flex items-center text-xs opacity-70">
            <Code2 className="w-4 h-4 mr-2" />
            Kid-Friendly & AI Powered
          </div>
        </div>
      </div>
    </footer>
  );
}
