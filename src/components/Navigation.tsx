import React, { useEffect, useState } from 'react';
import { useAppContext } from '../store';
import { UserCircle, Swords, Settings, Menu, X } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { getLocalNoCodeConfig, NoCodeConfig } from '../lib/nocode_store';
import { audioService } from '../utils/audio';

const Logo = () => (
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
);

export function Navigation() {
  const { view, setView, profile, progress } = useAppContext();
  const { setIsSettingsOpen } = useSettings();
  const [noCodeLayout, setNoCodeLayout] = useState<NoCodeConfig>(() => getLocalNoCodeConfig());
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setNoCodeLayout(getLocalNoCodeConfig());
    const handleStorage = () => setNoCodeLayout(getLocalNoCodeConfig());
    window.addEventListener('storage', handleStorage);
    window.addEventListener('pilearn_config_sync', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('pilearn_config_sync', handleStorage);
    };
  }, []);

  const sysSettings = noCodeLayout?.systemSettings;

  const handleDashboard = () => {
    setView('student-dashboard');
  };

  const navLinks = noCodeLayout?.menus?.length > 0
    ? noCodeLayout.menus.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    : [
        { label: 'Lộ trình', viewAlias: 'roadmap', order: 0 },
        { label: 'Bài học', viewAlias: 'student-dashboard', order: 1 },
        { label: 'Thực hành', viewAlias: 'practice', order: 2 },
        { label: 'Kiểm tra', viewAlias: 'exams', order: 3 },
      ];

  const isActive = (alias: string) => view === alias;

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-2.5 cursor-pointer select-none shrink-0"
              onClick={() => { audioService.playClick(); setView('home'); setMobileOpen(false); }}
            >
              {sysSettings?.headerLogoImage ? (
                <img src={sysSettings.headerLogoImage} alt="" className="h-8 w-8 rounded-lg object-cover" />
              ) : <Logo />}
              <span className="font-bold text-lg text-gray-900 dark:text-white tracking-tight">
                {sysSettings?.headerLogoText || <>PiLearn</>}
              </span>
            </div>

            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((m, i) => (
                <button key={i}
                  onClick={() => { audioService.playClick(); if (m.url) window.open(m.url, '_blank'); else setView(m.viewAlias as any); }}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive(m.viewAlias)
                      ? 'text-primary-500 bg-primary-50 dark:bg-primary-900/30'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {m.viewAlias === 'boss-battle' && <Swords className="w-4 h-4 inline mr-1.5 -mt-0.5" />}
                  {m.label}
                </button>
              ))}
              <button onClick={() => { audioService.playClick(); setView('boss-battle'); }}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                  isActive('boss-battle')
                    ? 'text-amber-600 bg-amber-50 dark:bg-amber-900/30'
                    : 'text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50/50 dark:hover:bg-amber-900/20'
                }`}
              >
                <Swords className="w-4 h-4" /> Đánh Boss
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <button onClick={() => { audioService.playClick(); handleDashboard(); }}
                className="hidden sm:inline-flex cl-btn cl-btn-primary text-sm"
              >Dashboard</button>

              <div className="hidden sm:flex items-center gap-2 mr-1">
                <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-orange-50 text-orange-600 select-none text-xs font-bold">
                  <span>🔥</span>
                  <span>{progress?.streak || 0}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-bold text-amber-500 leading-none">LV{Math.floor((progress?.xp || 0) / 100) + 1}</span>
                  <div className="w-10 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(progress?.xp || 0) % 100}%` }} />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <span className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-gray-700 px-3 py-1.5 rounded-lg bg-gray-50">
                  <UserCircle className="w-4 h-4 text-gray-400" />
                  <span className="max-w-[80px] truncate">{profile?.displayName || 'Học viên'}</span>
                </span>
                <button onClick={() => { audioService.playClick(); setIsSettingsOpen(true); }}
                  className="p-2 text-gray-400 hover:text-primary-500 rounded-lg hover:bg-gray-50 transition-colors" title="Cài đặt">
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>

            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-gray-100 dark:border-slate-800 pt-3">
            <div className="flex flex-col gap-1">
              {navLinks.map((m, i) => (
                <button key={i} onClick={() => { audioService.playClick(); if (m.url) window.open(m.url, '_blank'); else setView(m.viewAlias as any); setMobileOpen(false); }}
                  className={`px-3 py-2.5 text-sm font-medium rounded-lg text-left transition-colors ${
                    isActive(m.viewAlias) ? 'text-primary-500 bg-primary-50 dark:bg-primary-900/30' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                  }`}
                >{m.label}</button>
              ))}
              <button onClick={() => { audioService.playClick(); setView('boss-battle'); setMobileOpen(false); }}
                className={`px-3 py-2.5 text-sm font-medium rounded-lg text-left flex items-center gap-2 ${
                  isActive('boss-battle') ? 'text-amber-600 bg-amber-50' : 'text-gray-600 hover:bg-gray-50'
                }`}
              ><Swords className="w-4 h-4" /> Đánh Boss</button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
