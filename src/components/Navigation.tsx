import React, { useEffect, useState } from 'react';
import { useAppContext } from '../store';
import { ViewState } from '../types';
import { UserCircle, LogOut, Swords, Settings } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { getLocalNoCodeConfig, NoCodeConfig, saveNoCodeConfigDb } from '../lib/nocode_store';
import { audioService } from '../utils/audio';

const Logo = ({ fill = 'rgb(84, 84, 84)' }: { fill?: string }) => (
  <svg width="28" height="28" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
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
);

export function Navigation() {
  const { view, setView, role, authUser, profile, login, logout, progress, isDataLoaded, isEditMode, setIsEditMode, isAppearanceEditorOpen, setIsAppearanceEditorOpen } = useAppContext();
  const { setIsSettingsOpen } = useSettings();
  const [noCodeLayout, setNoCodeLayout] = useState<NoCodeConfig>(() => getLocalNoCodeConfig());

  useEffect(() => {
    setNoCodeLayout(getLocalNoCodeConfig());
    
    // Listen to localStorage modifications
    const handleStorage = () => {
      setNoCodeLayout(getLocalNoCodeConfig());
    };
    window.addEventListener('storage', handleStorage);
    // Custom sync event
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

  return (
    <nav className="relative z-50 w-full pt-4 sticky top-0 px-3 sm:px-6">
      <div className={`mx-auto flex items-center justify-between px-5 py-3 sm:px-7 transition-all duration-300 max-w-7xl rounded-full shadow-md ${
        view === 'home' 
          ? 'bg-slate-950/80 border border-slate-900 backdrop-blur-md text-white shadow-xl shadow-slate-950/50' 
          : 'bg-white border border-gray-200/50 dark:bg-slate-800 dark:border-slate-700 text-slate-850 dark:text-gray-100'
      }`}>
        {role === 'super_admin' && (
          <div className="flex gap-2">
            <button 
              onClick={() => setIsEditMode(!isEditMode)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition ${isEditMode ? 'bg-red-500 text-white' : 'bg-blue-100 text-blue-700'}`}
            >
              {isEditMode ? 'Tắt Sửa...' : 'Bật Sửa...'}
            </button>
            {isEditMode && (
              <button
                onClick={() => setIsAppearanceEditorOpen(true)}
                className="px-4 py-2 rounded-full text-xs font-bold transition bg-green-100 text-green-700 hover:bg-green-200"
              >
                Giao Diện...
              </button>
            )}
          </div>
        )}
        {/* Logo */}
        <div 
          className="flex items-center gap-2 cursor-pointer group select-none active:scale-[0.97] transition-all duration-150" 
          onClick={() => {
            audioService.playClick();
            setView('home');
          }}
        >
          {sysSettings?.headerLogoImage ? (
            <div className="flex items-center gap-2">
              <img 
                src={sysSettings.headerLogoImage} 
                alt="Brand" 
                className="h-9 w-9 shrink-0 object-cover rounded-full border border-slate-100 dark:border-slate-700 shadow-xs" 
              />
              <span className="font-extrabold tracking-tight text-2xl hidden sm:block text-slate-900 dark:text-white">
                {sysSettings?.headerLogoText ? (
                  sysSettings.headerLogoText
                ) : (
                  <><span className="text-[#0052cc]">Pi</span>Learn</>
                )}
              </span>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Logo fill="rgb(255,255,255)" />
              </div>
              <span className={`font-extrabold tracking-tight text-2xl hidden sm:block ml-1 ${view === 'home' ? 'text-white' : 'text-[#0a192f] dark:text-white'}`}>
                {sysSettings?.headerLogoText ? (
                  sysSettings.headerLogoText
                ) : (
                  <><span className="text-blue-500">P<span className="text-sky-400">i</span></span>Learn</>
                )}
              </span>
            </>
          )}
        </div>
        
        {/* Links */}
        <div className="flex flex-wrap lg:flex-nowrap items-center justify-center gap-3 sm:gap-6 overflow-x-auto no-scrollbar">
          {noCodeLayout?.menus && noCodeLayout.menus.length > 0 ? (
            <>
              {noCodeLayout.menus
                .slice()
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                .map((m, mIdx) => {
                  let activeColorClass = 'text-blue-600';
                  let hoverColorClass = 'hover:text-blue-500';
                  if (m.viewAlias === 'roadmap') {
                    activeColorClass = 'text-green-600';
                    hoverColorClass = 'hover:text-green-500';
                  } else if (m.viewAlias === 'boss-battle') {
                    activeColorClass = 'text-amber-500';
                    hoverColorClass = 'hover:text-amber-500';
                  }

                  // Boss Battle view is now accessible to all roles


                  let tutorialClass = '';
                  if (m.viewAlias === 'student-dashboard') {
                    tutorialClass = 'tutorial-step-1';
                  } else if (m.viewAlias === 'roadmap') {
                    tutorialClass = 'tutorial-step-2';
                  }

                  if (role === 'admin' && isEditMode) {
                    return (
                      <div key={mIdx} className="flex items-center gap-1 bg-sky-50 dark:bg-slate-900 border border-dashed border-sky-400 px-1.5 py-0.5 rounded-full">
                        <input
                          type="text"
                          value={m.label}
                          onChange={(e) => {
                            const val = e.target.value;
                            const updated = noCodeLayout.menus.map((item, idx) => 
                              idx === mIdx ? { ...item, label: val } : item
                            );
                            const updatedConfig = { ...noCodeLayout, menus: updated };
                            setNoCodeLayout(updatedConfig);
                            saveNoCodeConfigDb(updatedConfig, authUser?.email || 'admin@pilearn.com', 'Update menu link label');
                            window.dispatchEvent(new Event('pilearn_config_sync'));
                          }}
                          className="bg-transparent text-xs font-bold w-16 text-slate-800 dark:text-gray-100 border-none focus:outline-none focus:ring-0 p-0 text-center"
                        />
                        <button
                          onClick={() => {
                            audioService.playClick();
                            const updated = noCodeLayout.menus.filter((_, idx) => idx !== mIdx);
                            const updatedConfig = { ...noCodeLayout, menus: updated };
                            setNoCodeLayout(updatedConfig);
                            saveNoCodeConfigDb(updatedConfig, authUser?.email || 'admin@pilearn.com', 'Delete menu link');
                            window.dispatchEvent(new Event('pilearn_config_sync'));
                          }}
                          className="text-red-500 hover:text-red-700 text-xs font-extrabold focus:outline-none px-1"
                          title="Xóa"
                        >
                          ×
                        </button>
                      </div>
                    );
                  }

                  return (
                    <button
                      key={mIdx}
                      onClick={() => {
                        audioService.playClick();
                        if (m.url) {
                          window.open(m.url, '_blank');
                        } else {
                          setView(m.viewAlias as any);
                        }
                      }}
                      className={`${tutorialClass} whitespace-nowrap text-xs sm:text-sm font-bold transition-all duration-150 cursor-pointer active:scale-95 ${
                        view === m.viewAlias 
                          ? activeColorClass 
                          : (view === 'home' 
                              ? 'text-slate-350 hover:text-white' 
                              : `text-slate-600 dark:text-slate-300 ${hoverColorClass}`)
                      }`}
                    >
                      {m.viewAlias === 'boss-battle' && <Swords className="w-4 h-4 inline shrink-0 mr-1 align-middle" />}
                      <span className="align-middle">{m.label}</span>
                    </button>
                  );
                })}
              {isEditMode && role === 'admin' && (
                <button
                  onClick={() => {
                    audioService.playClick();
                    const newMenu = {
                      label: 'Menu Mới',
                      viewAlias: 'home',
                      order: noCodeLayout.menus.length
                    };
                    const updated = [...noCodeLayout.menus, newMenu];
                    const updatedConfig = { ...noCodeLayout, menus: updated };
                    setNoCodeLayout(updatedConfig);
                    saveNoCodeConfigDb(updatedConfig, authUser?.email || 'admin@pilearn.com', 'Add menu link');
                    window.dispatchEvent(new Event('pilearn_config_sync'));
                  }}
                  className="whitespace-nowrap px-3 py-1 bg-sky-100 text-sky-700 hover:bg-sky-200 text-xs font-bold rounded-full transition-all"
                >
                  + Thêm Menu
                </button>
              )}
              {!isEditMode && !noCodeLayout.menus.some(m => m.viewAlias === 'boss-battle') && (
                <button 
                  onClick={() => {
                    audioService.playClick();
                    setView('boss-battle');
                  }} 
                  className={`whitespace-nowrap flex items-center shrink-0 gap-1 text-xs sm:text-sm font-bold transition-all duration-150 cursor-pointer active:scale-95 ${view === 'boss-battle' ? 'text-amber-500' : 'text-slate-600 hover:text-amber-500 dark:text-slate-300'}`}
                >
                  <Swords className="w-4 h-4 shrink-0" />
                  Đánh Boss
                </button>
              )}
            </>
          ) : (
            <>
              <button 
                onClick={() => {
                  audioService.playClick();
                  setView('student-dashboard');
                }} 
                className={`tutorial-step-1 whitespace-nowrap text-xs sm:text-sm font-bold transition-all duration-150 cursor-pointer active:scale-95 ${view === 'student-dashboard' ? 'text-blue-600' : 'text-slate-600 hover:text-blue-500 dark:text-slate-300'}`}
              >
                Bài học
              </button>
              <button 
                onClick={() => {
                  audioService.playClick();
                  setView('roadmap');
                }} 
                className={`tutorial-step-2 whitespace-nowrap text-xs sm:text-sm font-bold transition-all duration-150 cursor-pointer active:scale-95 ${view === 'roadmap' ? 'text-green-600' : 'text-slate-600 hover:text-green-500 dark:text-slate-300'}`}
              >
                Lộ trình
              </button>
              <button 
                onClick={() => {
                  audioService.playClick();
                  setView('practice');
                }} 
                className={`whitespace-nowrap text-xs sm:text-sm font-bold transition-all duration-150 cursor-pointer active:scale-95 ${view === 'practice' ? 'text-blue-600' : 'text-slate-600 hover:text-blue-500 dark:text-slate-300'}`}
              >
                Thực hành
              </button>
              <button 
                onClick={() => {
                  audioService.playClick();
                  setView('exams');
                }} 
                className={`whitespace-nowrap text-xs sm:text-sm font-bold transition-all duration-150 cursor-pointer active:scale-95 ${view === 'exams' ? 'text-blue-600' : 'text-slate-600 hover:text-blue-500 dark:text-slate-300'}`}
              >
                Kiểm tra
              </button>
              
              <button 
                onClick={() => {
                  audioService.playClick();
                  setView('boss-battle');
                }} 
                className={`whitespace-nowrap flex items-center shrink-0 gap-1 text-xs sm:text-sm font-bold transition-all duration-150 cursor-pointer active:scale-95 ${view === 'boss-battle' ? 'text-amber-500' : 'text-slate-600 hover:text-amber-500 dark:text-slate-300'}`}
              >
                <Swords className="w-4 h-4 shrink-0" />
                Đánh Boss
              </button>
            </>
          )}
        </div>

        {/* Auth / Profile */}
        <div className="flex items-center">
          {isDataLoaded ? (
            !authUser ? (
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => {
                    audioService.playClick();
                    login();
                  }} 
                  className={`text-xs sm:text-sm font-bold px-3 py-2 transition-colors duration-150 active:scale-95 cursor-pointer ${
                    view === 'home' 
                      ? 'text-slate-300 hover:text-white' 
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  Đăng nhập
                </button>
                <button 
                  onClick={() => {
                    audioService.playClick();
                    login();
                  }} 
                  className="text-xs sm:text-sm font-bold px-5 py-2.5 rounded-full transition-all duration-150 shadow-md text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-indigo-500 active:scale-95 cursor-pointer shadow-indigo-600/10 hover:shadow-indigo-600/30"
                >
                  Đăng ký miễn phí!
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 sm:gap-4">
                {role !== 'student' && (
                  <button 
                    onClick={() => {
                      audioService.playClick();
                      handleCTA();
                    }}
                    className={`tutorial-step-3 text-xs sm:text-sm font-bold transition-all duration-150 cursor-pointer active:scale-95 ${['admin-dashboard', 'teacher-dashboard', 'student-dashboard', 'game-developer-dashboard'].includes(view) ? 'text-blue-600' : 'text-slate-600 hover:text-blue-500 dark:text-slate-300'}`}
                  >
                    Dashboard
                  </button>
                )}
                
                <div className="h-4 w-px bg-slate-200 dark:bg-slate-700"></div>
                
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-xs font-bold flex items-center gap-1 px-3 py-1.5 rounded-full bg-sky-50 text-slate-700 border border-sky-100 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200">
                    <UserCircle className="w-4.5 h-4.5 text-sky-500 shrink-0" />
                    <span className="hidden md:inline max-w-[80px] truncate">{profile?.displayName || 'User'}</span>
                  </span>
                  
                  {role === 'student' && (
                    <div className="flex items-center gap-2 mr-1">
                       {/* Streak Indicator */}
                       <div className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-orange-50 border border-orange-100 dark:bg-orange-950/20 dark:border-orange-900/30 text-orange-600 dark:text-orange-400 cursor-pointer select-none active:scale-95 transition-transform" title="Chuỗi học tập hàng ngày - Đọc bài hoặc làm kiểm tra để thắp lửa!">
                         <span className={`text-[11px] ${(progress?.streak || 0) > 0 ? 'animate-bounce inline-block' : 'grayscale opacity-50'}`}>🔥</span>
                         <span className="text-[10px] font-black">{progress?.streak || 0}N</span>
                       </div>

                       {/* Level / XP */}
                       <div className="flex flex-col items-center justify-center shrink-0">
                          <div className="text-[9px] font-black text-amber-500 leading-none">
                            LV {Math.floor((progress?.xp || 0) / 100) + 1}
                          </div>
                          <div className="w-10 h-1 bg-slate-100 rounded-full overflow-hidden mt-0.5">
                             <div className="h-full bg-amber-500 animate-pulse" style={{ width: `${(progress?.xp || 0) % 100}%` }}></div>
                          </div>
                       </div>
                    </div>
                  )}

                  <button onClick={() => {
                    audioService.playClick();
                    setIsSettingsOpen(true);
                  }} className="p-1.5 transition-all duration-150 text-slate-400 hover:text-indigo-500 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/20 active:scale-90" title="Cài đặt (Dùng API Key cá nhân)">
                    <Settings className="w-4 h-4" />
                  </button>
                  <button onClick={() => {
                    audioService.playClick();
                    logout();
                  }} className="p-1.5 transition-all duration-150 text-slate-400 hover:text-red-500 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 active:scale-90" title="Đăng xuất">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          ) : (
            <div className="h-8 w-20 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700"></div>
          )}
        </div>
      </div>
    </nav>
  );
}
