import React, { useEffect, useState } from 'react';
import { useAppContext } from '../store';
import { ViewState } from '../types';
import { UserCircle, LogOut, Swords, Settings } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { getLocalNoCodeConfig, NoCodeConfig, saveNoCodeConfigDb } from '../lib/nocode_store';
import { audioService } from '../utils/audio';

const Logo = () => (
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
);

export function Navigation() {
  const { view, setView, role, authUser, profile, login, logout, progress, isDataLoaded, isEditMode, setIsEditMode, isAppearanceEditorOpen, setIsAppearanceEditorOpen } = useAppContext();
  const { setIsSettingsOpen } = useSettings();
  const [noCodeLayout, setNoCodeLayout] = useState<NoCodeConfig>(() => getLocalNoCodeConfig());
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setNoCodeLayout(getLocalNoCodeConfig());
    const handleStorage = () => {
      setNoCodeLayout(getLocalNoCodeConfig());
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('pilearn_config_sync', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('pilearn_config_sync', handleStorage);
    };
  }, []);

  const sysSettings = noCodeLayout?.systemSettings;

  const handleCTA = () => {
    if (!authUser) {
      login();
    } else {
      if (role === 'admin' || role === 'super_admin') setView('admin-dashboard');
      else if (role === 'teacher') setView('teacher-dashboard');
      else if (role === 'game_developer') setView('game-developer-dashboard');
      else setView('student-dashboard');
    }
  };

  const navLinks = noCodeLayout?.menus?.length > 0
    ? noCodeLayout.menus.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    : [
        { label: 'Bài học', viewAlias: 'student-dashboard', order: 0 },
        { label: 'Lộ trình', viewAlias: 'roadmap', order: 1 },
        { label: 'Thực hành', viewAlias: 'practice', order: 2 },
        { label: 'Kiểm tra', viewAlias: 'exams', order: 3 },
      ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-gray-200/60 dark:border-slate-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <div
              className="flex items-center gap-2.5 cursor-pointer select-none"
              onClick={() => { audioService.playClick(); setView('home'); setMobileOpen(false); }}
            >
              {sysSettings?.headerLogoImage ? (
                <img src={sysSettings.headerLogoImage} alt="Brand" className="h-8 w-8 shrink-0 object-cover rounded-lg" />
              ) : (
                <Logo />
              )}
              <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
                {sysSettings?.headerLogoText || <><span className="text-[#0052cc]">Pi</span>Learn</>}
              </span>
            </div>

            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((m, i) => (
                <button
                  key={i}
                  onClick={() => { audioService.playClick(); if (m.url) window.open(m.url, '_blank'); else setView(m.viewAlias as any); }}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    view === m.viewAlias
                      ? 'text-[#0052cc] bg-blue-50 dark:bg-blue-900/30'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {m.viewAlias === 'boss-battle' && <Swords className="w-4 h-4 inline mr-1.5" />}
                  {m.label}
                </button>
              ))}
              <button
                onClick={() => { audioService.playClick(); setView('boss-battle'); }}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                  view === 'boss-battle'
                    ? 'text-amber-600 bg-amber-50 dark:bg-amber-900/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50/50 dark:hover:bg-amber-900/20'
                }`}
              >
                <Swords className="w-4 h-4" />
                Đánh Boss
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isDataLoaded ? (
              !authUser ? (
                <div className="flex items-center gap-2">
                  <button onClick={() => { audioService.playClick(); login(); }} className="btn-ghost text-sm">
                    Đăng nhập
                  </button>
                  <button onClick={() => { audioService.playClick(); login(); }} className="btn-primary text-sm px-5 py-2.5">
                    Đăng ký miễn phí
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  {role !== 'student' && (
                    <button onClick={() => { audioService.playClick(); handleCTA(); }}
                      className={`hidden sm:block text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
                        ['admin-dashboard', 'teacher-dashboard', 'student-dashboard', 'game-developer-dashboard'].includes(view)
                          ? 'text-[#0052cc] bg-blue-50 dark:bg-blue-900/30'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Dashboard
                    </button>
                  )}

                  {role === 'student' && (
                    <div className="hidden sm:flex items-center gap-2">
                      <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 cursor-pointer select-none" title="Chuỗi học tập">
                        <span className="text-xs">🔥</span>
                        <span className="text-xs font-bold">{progress?.streak || 0}</span>
                      </div>
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-[10px] font-bold text-amber-500 leading-none">LV {Math.floor((progress?.xp || 0) / 100) + 1}</span>
                        <div className="w-10 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(progress?.xp || 0) % 100}%` }} />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-1">
                    <span className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800">
                      <UserCircle className="w-4 h-4 text-slate-400" />
                      <span className="max-w-[80px] truncate">{profile?.displayName || 'User'}</span>
                    </span>
                    <button onClick={() => { audioService.playClick(); setIsSettingsOpen(true); }}
                      className="p-2 text-slate-400 hover:text-[#0052cc] rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      title="Cài đặt"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                    <button onClick={() => { audioService.playClick(); logout(); }}
                      className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      title="Đăng xuất"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            ) : (
              <div className="h-8 w-24 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
            )}

            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-gray-100 dark:border-slate-800 pt-3">
            <div className="flex flex-col gap-1">
              {navLinks.map((m, i) => (
                <button
                  key={i}
                  onClick={() => { audioService.playClick(); if (m.url) window.open(m.url, '_blank'); else setView(m.viewAlias as any); setMobileOpen(false); }}
                  className={`px-3 py-2.5 text-sm font-medium rounded-lg text-left transition-colors ${
                    view === m.viewAlias ? 'text-[#0052cc] bg-blue-50 dark:bg-blue-900/30' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {m.label}
                </button>
              ))}
              <button
                onClick={() => { audioService.playClick(); setView('boss-battle'); setMobileOpen(false); }}
                className={`px-3 py-2.5 text-sm font-medium rounded-lg text-left transition-colors flex items-center gap-2 ${
                  view === 'boss-battle' ? 'text-amber-600 bg-amber-50' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Swords className="w-4 h-4" />
                Đánh Boss
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
