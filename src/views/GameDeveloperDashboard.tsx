import React from 'react';
import { GameDeveloperPanel } from '../components/GameDeveloperPanel';
import { LayoutGrid, Sparkles, LogOut, Code2, Swords } from 'lucide-react';
import { useAppContext } from '../store';

export function GameDeveloperDashboard() {
  const { setView, logout, profile } = useAppContext();

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Dev Header Panel */}
      <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-[36px] text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-92 h-92 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-500 to-red-600 flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-12 duration-200">
            <Code2 size={28} className="text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
              <span>Trạm Sáng Tạo Trực Tuyến</span>
              <span className="text-[10px] uppercase font-black bg-white/20 px-2.5 py-0.5 rounded-md border border-white/10 tracking-widest text-amber-300">
                Sandbox
              </span>
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm font-medium mt-1">
              Người sáng tạo: <span className="text-amber-400 font-extrabold">{profile?.displayName || 'Nhà phát triển'}</span> (Mã vai trò: game_developer)
            </p>
          </div>
        </div>

        {/* Action Button Links for quick switching */}
        <div className="flex items-center gap-2.5 relative z-10">
          <button 
            onClick={() => setView('boss-battle')} 
            className="flex items-center gap-1 text-xs font-black bg-amber-500 hover:bg-amber-600 text-slate-900 px-4 py-2.5 rounded-full shadow-lg transition active:scale-95 cursor-pointer"
          >
            <Swords size={13} />
            <span>Thử chiến đấu Boss</span>
          </button>
          <button 
            onClick={() => setView('student-dashboard')} 
            className="flex items-center gap-1 text-xs font-black bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-full border border-white/5 shadow-md transition active:scale-95 cursor-pointer"
          >
            <LayoutGrid size={13} />
            <span>Xem lớp của học sinh</span>
          </button>
        </div>
      </div>

      {/* Main Dev Controls component */}
      <GameDeveloperPanel />
    </div>
  );
}
