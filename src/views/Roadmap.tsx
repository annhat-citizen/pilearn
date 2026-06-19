import React, { useState, useEffect } from 'react';
import { 
  Lock, Unlock, CheckCircle, SearchCode, Sparkles, 
  Layers, Info, ChevronRight, Award, Terminal, Search, Filter, 
  BookOpen, Eye, Check, Play, BookOpenCheck, ArrowRight, CornerDownRight,
  Crown, Download
} from 'lucide-react';
import { useAppContext } from '../store';
import { motion, AnimatePresence } from 'motion/react';
import { ProgressState } from '../types';

// Deterministic vector-illustration renderer for chapter thumbnails
const renderChapterIllustration = (index: number) => {
  const themes = [
    {
      bg: "from-blue-600 to-indigo-700",
      textColor: "text-blue-100",
      accentColor: "text-blue-300",
      icon: " [x] ",
      elements: (
        <>
          <rect x="15" y="25" width="70" height="50" rx="6" fill="#1e1e2e" stroke="#3b82f6" strokeWidth="2" />
          <circle cx="25" cy="35" r="2" fill="#ef4444" />
          <circle cx="31" cy="35" r="2" fill="#eab308" />
          <circle cx="37" cy="35" r="2" fill="#22c55e" />
          <text x="25" y="55" fill="#f8f8f2" fontSize="7" fontFamily="monospace" fontWeight="bold">print("Hi Python")</text>
          <text x="25" y="65" fill="#a78bfa" fontSize="6" fontFamily="monospace">&gt; Hello World!</text>
          <path d="M80,65 L85,75 L90,60" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )
    },
    {
      bg: "from-amber-500 to-orange-600",
      textColor: "text-amber-100",
      accentColor: "text-amber-300",
      icon: " { } ",
      elements: (
        <>
          <rect x="20" y="20" width="40" height="28" rx="4" fill="#0f172a" stroke="#f59e0b" strokeWidth="1.5" />
          <text x="26" y="36" fill="#60a5fa" fontSize="6" fontFamily="monospace" fontWeight="bold">x = 100</text>
          <rect x="45" y="45" width="40" height="28" rx="4" fill="#1e293b" stroke="#f97316" strokeWidth="1.5" />
          <text x="51" y="61" fill="#34d399" fontSize="6" fontFamily="monospace" fontWeight="bold">y = "AI"</text>
          <path d="M38,48 L52,43" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3,3" />
          <polygon points="54,43 49,40 50,45" fill="#f59e0b" />
        </>
      )
    },
    {
      bg: "from-emerald-500 to-teal-600",
      textColor: "text-emerald-100",
      accentColor: "text-teal-200",
      icon: " ( ) ",
      elements: (
        <>
          <circle cx="50" cy="50" r="22" stroke="#10b981" strokeWidth="3" fill="none" strokeDasharray="4,4" />
          <circle cx="50" cy="50" r="14" stroke="#06b6d4" strokeWidth="2.5" fill="none" />
          <rect x="42" y="42" width="16" height="16" rx="3" fill="#111827" />
          <path d="M47,50 L53,50 M50,47 L50,53" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" />
          <text x="15" y="82" fill="#10b981" fontSize="5.5" fontFamily="monospace" fontWeight="bold">for i in range(5):</text>
        </>
      )
    },
    {
      bg: "from-indigo-500 to-violet-600",
      textColor: "text-indigo-100",
      accentColor: "text-indigo-300",
      icon: " [ ] ",
      elements: (
        <>
          <rect x="15" y="30" width="22" height="18" rx="3" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1.5" />
          <rect x="41" y="30" width="22" height="18" rx="3" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1.5" />
          <rect x="67" y="30" width="22" height="18" rx="3" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1.5" />
          <text x="22" y="41" fill="#f3f4f6" fontSize="7" fontFamily="monospace">"A"</text>
          <text x="48" y="41" fill="#f3f4f6" fontSize="7" fontFamily="monospace">"B"</text>
          <text x="74" y="41" fill="#f3f4f6" fontSize="7" fontFamily="monospace">"C"</text>
          <path d="M26,48 Q50,68 76,48" stroke="#a78bfa" strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      )
    },
    {
      bg: "from-rose-500 to-pink-600",
      textColor: "text-rose-100",
      accentColor: "text-pink-300",
      icon: " f(x) ",
      elements: (
        <>
          <path d="M15,50 L85,50 M50,15 L50,85" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2,2" />
          <path d="M15,70 Q40,15 50,50 T85,30" stroke="#f43f5e" strokeWidth="3" fill="none" strokeLinecap="round" />
          <rect x="58" y="18" width="24" height="15" rx="3" fill="#1e1115" stroke="#f43f5e" strokeWidth="1.5" />
          <text x="62" y="27" fill="#fda4af" fontSize="5.5" fontFamily="monospace">def f(x)</text>
        </>
      )
    },
    {
      bg: "from-cyan-500 to-blue-600",
      textColor: "text-cyan-100",
      accentColor: "text-blue-300",
      icon: " &lt;&gt; ",
      elements: (
        <>
          <path d="M20,20 L80,20 L75,80 L25,80 Z" fill="#082f49" stroke="#0ea5e9" strokeWidth="2" />
          <line x1="30" y1="35" x2="70" y2="35" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
          <line x1="30" y1="48" x2="60" y2="48" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
          <line x1="30" y1="61" x2="50" y2="61" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
          <circle cx="68" cy="62" r="8" fill="#10b981" />
          <path d="M65,62 L67,64 L72,59" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )
    }
  ];

  const currentTheme = themes[index % themes.length];

  return (
    <div className={`relative w-full h-32 bg-gradient-to-br ${currentTheme.bg} overflow-hidden flex items-center justify-center shrink-0`}>
      <div className="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
      
      {/* Absolute floating micro decoration */}
      <div className="absolute top-2.5 left-2.5 text-[9px] uppercase tracking-wider font-extrabold bg-black/20 text-white px-2 py-0.5 rounded backdrop-blur-xs font-mono">
        {currentTheme.icon}
      </div>

      <svg className="w-24 h-24 relative select-none drop-shadow-md" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {currentTheme.elements}
      </svg>
    </div>
  );
};

export function Roadmap() {
  const { progress, setSelectedLesson, setView, syllabus, role, updateProgress } = useAppContext();
  
  // State for search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unstarted' | 'inprogress' | 'completed'>('all');
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});

  // Compute precise global Python syllabus progress
  const totalLessons = syllabus.reduce((acc, chapter) => acc + chapter.lessons.length, 0);
  const completedCount = (progress.completedLessons || []).filter(id => id.startsWith('l')).length;
  const completionPercentage = Math.round((completedCount / Math.max(1, totalLessons)) * 100);

  // Pre-calculate precise sequential unlocked maps globally to prevent dependency breaks on filter
  const lessonUnlockMap: Record<string, boolean> = {};
  let globalCompletedPrev = true;
  syllabus.forEach(chapter => {
    chapter.lessons.forEach(lesson => {
      const isCompleted = (progress.completedLessons || []).includes(lesson.id);
      const roleBasedUnlock = role === 'admin' || role === 'teacher';
      lessonUnlockMap[lesson.id] = isCompleted || globalCompletedPrev || roleBasedUnlock;
      globalCompletedPrev = isCompleted || roleBasedUnlock;
    });
  });

  // Expand matching active chapters automatically on first load
  useEffect(() => {
    const initialExpanded: Record<string, boolean> = {};
    syllabus.forEach((chapter, idx) => {
      const completedCount = chapter.lessons.filter(lesson => (progress.completedLessons || []).includes(lesson.id)).length;
      const inProgress = completedCount > 0 && completedCount < chapter.lessons.length;
      if (inProgress || idx === 0) {
        initialExpanded[chapter.id] = true;
      }
    });
    setExpandedChapters(initialExpanded);
  }, [syllabus, progress.completedLessons]);

  // Keyboard listeners for next/prev chapter expanding inside Roadmap view
  useEffect(() => {
    const handleNextChapter = () => {
      if (!syllabus || syllabus.length === 0) return;
      
      const activeId = Object.keys(expandedChapters).find(key => expandedChapters[key] === true);
      const activeIdx = activeId ? syllabus.findIndex(c => c.id === activeId) : -1;
      
      let nextIdx = 0;
      if (activeIdx > -1 && activeIdx + 1 < syllabus.length) {
        nextIdx = activeIdx + 1;
      }
      
      const nextChapter = syllabus[nextIdx];
      const nextState: Record<string, boolean> = {};
      nextState[nextChapter.id] = true;
      setExpandedChapters(nextState);
      
      setTimeout(() => {
        const el = document.getElementById(`chapter-card-${nextChapter.id}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 50);
    };

    const handlePrevChapter = () => {
      if (!syllabus || syllabus.length === 0) return;
      
      const activeId = Object.keys(expandedChapters).find(key => expandedChapters[key] === true);
      const activeIdx = activeId ? syllabus.findIndex(c => c.id === activeId) : -1;
      
      let prevIdx = syllabus.length - 1;
      if (activeIdx > 0) {
        prevIdx = activeIdx - 1;
      }
      
      const prevChapter = syllabus[prevIdx];
      const nextState: Record<string, boolean> = {};
      nextState[prevChapter.id] = true;
      setExpandedChapters(nextState);
      
      setTimeout(() => {
        const el = document.getElementById(`chapter-card-${prevChapter.id}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 50);
    };

    window.addEventListener('command:next-chapter', handleNextChapter);
    window.addEventListener('command:prev-chapter', handlePrevChapter);
    return () => {
      window.removeEventListener('command:next-chapter', handleNextChapter);
      window.removeEventListener('command:prev-chapter', handlePrevChapter);
    };
  }, [syllabus, expandedChapters, setExpandedChapters]);

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters(prev => ({
      ...prev,
      [chapterId]: !prev[chapterId]
    }));
  };

  // Perform filtering & searching logic on chapters
  const filteredChapters = syllabus.map((chapter, index) => {
    const completedCountInChapter = chapter.lessons.filter(lesson => (progress.completedLessons || []).includes(lesson.id)).length;
    const isCompleted = chapter.lessons.length > 0 && completedCountInChapter === chapter.lessons.length;
    const isInProgress = completedCountInChapter > 0 && completedCountInChapter < chapter.lessons.length;
    const isUnstarted = completedCountInChapter === 0;

    const chapterStatus: 'unstarted' | 'inprogress' | 'completed' = 
      isCompleted ? 'completed' : isInProgress ? 'inprogress' : 'unstarted';

    return {
      ...chapter,
      originalIndex: index,
      completedCount: completedCountInChapter,
      completionPercent: chapter.lessons.length > 0 ? Math.round((completedCountInChapter / chapter.lessons.length) * 100) : 0,
      status: chapterStatus
    };
  }).filter(chapter => {
    // Search match
    const textToSearch = `${chapter.title} ${chapter.description || ''}`.toLowerCase();
    const matchesSearch = textToSearch.includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    // Status filter match
    if (statusFilter === 'unstarted') return chapter.status === 'unstarted';
    if (statusFilter === 'inprogress') return chapter.status === 'inprogress';
    if (statusFilter === 'completed') return chapter.status === 'completed';
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-6 md:py-8 space-y-6 md:space-y-8 animate-fade-in text-sans">
      
      {/* Upper Title Banner (Compact spacing on PC, readable layout) */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 text-[10px] sm:text-xs font-black uppercase tracking-wider border border-blue-100 dark:border-blue-900/30">
          <Sparkles size={12} className="text-amber-500 animate-pulse shrink-0" /> 
          <span>Chủ đề F: Tin học 10 · Lập trình Python</span>
        </div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">
          Lộ Trình Học Lập Trình Python Của Bạn
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          Nội dung trực quan bám sát chương trình GDPT Tin học 10. Luyện tương tác từ câu hỏi cơ bản, thẻ gợi nhớ đến thực hành viết code chuẩn IDE trực quan.
        </p>
      </div>

      {/* Modern Compact Progress Stats Banner (Compact Desktop first padding rules) */}
      <div className="bg-gradient-to-br from-white to-[#fafbfd] dark:from-slate-800 dark:to-slate-800/90 border border-slate-200/60 dark:border-slate-700/80 rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="flex-1 w-full text-left">
          <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-extrabold text-blue-600 dark:text-blue-400">Tiến trình học tập</span>
          <h4 className="text-base sm:text-lg font-extrabold text-slate-850 dark:text-gray-100 mt-0.5 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-blue-550 shrink-0" />
            <span>Chinh phục thử thách viết code tự động</span>
          </h4>
          
          {/* Real-time fluid Progress Bar */}
          <div className="mt-3 bg-gray-150 dark:bg-slate-700 w-full h-2.5 rounded-full overflow-hidden relative border border-gray-100 dark:border-slate-800 shadow-inner">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full transition-all duration-1000 ease-out"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[11px] font-bold mt-1.5 text-slate-500 dark:text-slate-450">
            <span>Đã hoàn thành <strong className="text-blue-600 dark:text-blue-400">{completedCount}</strong> / {totalLessons} bài học</span>
            <span className="text-indigo-600 dark:text-indigo-400">{completionPercentage}%</span>
          </div>
        </div>

        {/* Level Stats Accumulator Block */}
        <div className="flex gap-4 shrink-0 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-xs w-full md:w-auto justify-around">
          <div className="text-center px-4">
            <div className="text-xl sm:text-2xl font-black text-amber-500">{progress.points}</div>
            <div className="text-[9px] uppercase font-extrabold text-gray-400 tracking-wider">Xu tích lũy</div>
          </div>
          <div className="w-px bg-slate-200 dark:bg-slate-850" />
          <div className="text-center px-4">
            <div className="text-xl sm:text-2xl font-black text-indigo-500">{progress.xp}</div>
            <div className="text-[9px] uppercase font-extrabold text-gray-400 tracking-wider">Kinh nghiệm</div>
          </div>
        </div>
      </div>

      {/* PRO PDF Study Guides & Graduation Certificates Block */}
      <div className="bg-gradient-to-br from-[#1e1b4b] via-slate-900 to-[#111827] text-white p-6 rounded-[32px] border border-indigo-500/20 shadow-md">
        {!progress.isPro ? (
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-left flex-1">
              <div className="inline-flex items-center gap-1 bg-yellow-400/20 text-yellow-300 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                <Crown size={12} className="fill-current animate-pulse" />
                <span>Gói Toàn Diện (PRO)</span>
              </div>
              <h3 className="text-lg font-black text-white">📚 Tải Trọn Bộ Giáo Trình PDF Nâng Cao & Nhận Chứng Chỉ</h3>
              <p className="text-xs text-slate-300 font-medium leading-relaxed max-w-xl">
                Tài khoản PRO mở khóa tải File PDF giáo trình 50 thuật toán, Lập trình Hàm Chương 5, bài tập OOP và chứng chỉ số GDPT 10 danh giá! Tặng kèm <strong className="text-yellow-300">3 ngày dùng thử miễn phí</strong>.
              </p>
            </div>
            <button
              onClick={() => {
                if (updateProgress) {
                  updateProgress((prev: ProgressState) => ({ ...prev, isPro: true }));
                  alert("🎉 Hoan nghênh bạn nâng cấp! Bạn đã được kích hoạt 3 ngày trải nghiệm miễn phí quyền lợi MAX VIP.");
                }
              }}
              className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-amber-500 hover:brightness-110 active:scale-95 text-slate-950 text-xs font-black rounded-2xl shadow-xl transition cursor-pointer"
            >
              ⭐ Kích Hoạt PRO [Dùng thử Free 3 ngày]
            </button>
          </div>
        ) : (
          <div className="space-y-6 text-left">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <div className="inline-flex items-center gap-1 bg-yellow-400 text-slate-950 px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wide">
                  ⭐ Gói PRO Đã Kích hoạt
                </div>
                <h3 className="text-xl font-black mt-2">Học Liệu & Biên Bản Chứng Nhận Sinh Viên Tinh Anh</h3>
              </div>
              <button
                onClick={() => {
                  if (updateProgress) {
                    updateProgress((prev: ProgressState) => ({ ...prev, isPro: false }));
                  }
                }}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-[10px] font-extrabold rounded-xl border border-white/10 transition"
              >
                🔄 Trở lại bản Free test
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Materials PDF Downloads lists */}
              <div className="bg-slate-900/60 p-5 rounded-2xl border border-white/5 space-y-3">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-indigo-300">📁 Tập bài giảng PDF độc quyền nâng cao</span>
                <p className="text-[11px] text-slate-400 mb-2 font-medium">Bản in kỹ thuật số dung lượng chuẩn biên soạn trực thuộc GDPT 10 hsg:</p>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                    <span className="font-extrabold text-slate-200">1. Đệ quy & Kỹ thuật viết Hàm nâng cao.pdf</span>
                    <button 
                      onClick={() => alert("💾 Đang tiến hành tải Tài liệu: Đệ quy & Kỹ thuật viết Hàm nâng cao.pdf...")} 
                      className="p-1 px-2.5 bg-indigo-600 hover:bg-indigo-700 rounded text-[10px] font-bold text-white flex items-center gap-0.5 cursor-pointer"
                    >
                      <Download size={10} /> Tải PDF
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                    <span className="font-extrabold text-slate-200">2. Tuyển tập 50 Thuật Toán sắp xếp thực chiến.pdf</span>
                    <button 
                      onClick={() => alert("💾 Đang tiến hành tải Đề cương: Tuyển tập 50 Thuật Toán sắp xếp thực chiến.pdf...")} 
                      className="p-1 px-2.5 bg-indigo-600 hover:bg-indigo-700 rounded text-[10px] font-bold text-white flex items-center gap-0.5 cursor-pointer"
                    >
                      <Download size={10} /> Tải PDF
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                    <span className="font-extrabold text-slate-200">3. OOP Python đại cương hướng đối tượng xịn.pdf</span>
                    <button 
                      onClick={() => alert("💾 Đang tiến hành tải Đề tài: OOP Python đại cương hướng đối tượng xịn.pdf...")} 
                      className="p-1 px-2.5 bg-indigo-600 hover:bg-indigo-700 rounded text-[10px] font-bold text-white flex items-center gap-0.5 cursor-pointer"
                    >
                      <Download size={10} /> Tải PDF
                    </button>
                  </div>
                </div>
              </div>

              {/* Graduation Certificate dynamic renderer */}
              <div className="bg-slate-900/60 p-5 rounded-2xl border border-white/5 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-300">🎖️ Chứng thư số hóa chính thức</span>
                  <p className="text-[11px] text-slate-400 mt-1 mb-2">Đạt 100% lộ trình các bài giảng để nhận văn bằng vinh danh tự động:</p>
                </div>

                {completionPercentage < 100 ? (
                  <div className="bg-slate-950/90 border border-slate-800 p-4 rounded-xl text-xs space-y-2">
                    <div className="flex justify-between font-bold">
                      <span className="text-yellow-400 font-extrabold">Trạng thái: Đang học ({completionPercentage}%)</span>
                      <span className="text-slate-500">Yêu cầu: 100%</span>
                    </div>
                    <p className="text-[10px] text-slate-400">Bạn còn một số bài học chưa hoàn tất. Hãy chăm chỉ ôn bài tiếp tục nhé!</p>
                    
                    {/* Bypass Cheat Button for easy grading testing */}
                    <button
                      onClick={() => {
                        if (updateProgress) {
                          // Complete all lessons to 100%
                          updateProgress((prev: ProgressState) => {
                            const allLessonIds = syllabus.flatMap(ch => ch.lessons.map(l => l.id));
                            return {
                              ...prev,
                              completedLessons: allLessonIds
                            };
                          });
                          alert("🎮 Chế độ thử dùng PRO: Đã tự động kích hoạt hoàn thành 100% bài học để bạn test thử văn bằng tốt nghiệp cực xịn!");
                        }
                      }}
                      className="w-full text-center py-1 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded text-[10px] uppercase font-bold transition"
                    >
                      ⚡ Nhận nhanh 100% để test bằng tốt nghiệp
                    </button>
                  </div>
                ) : (
                  <div className="bg-slate-950 p-4 rounded-2xl border-2 border-yellow-500/40 text-center space-y-3 shadow shadow-yellow-500/10">
                     <p className="text-[10px] text-yellow-400 font-extrabold uppercase tracking-widest leading-none">Văn Bằng Tốt Nghiệp Vàng</p>
                     
                     <div>
                       <h4 className="text-base font-black text-white">HỌC VIÊN PYTHON TỔNG TOÀN DIỆN</h4>
                       <p className="text-[10px] text-gray-300 mt-1">Học viên: <strong className="text-white">Bạn Học Bản Lĩnh</strong></p>
                       <p className="text-[9px] text-gray-500">Đạt thành tích Xuất sắc chương trình lập trình Python GDPT 10 Lớp Học Sư</p>
                     </div>

                     <button
                       onClick={() => alert("🏆 Đang khởi tạo bản in chất lượng cao mã số CERT-PY-10-OK và tải PDF Chứng chỉ về máy của bạn...")}
                       className="w-full py-2 bg-gradient-to-r from-yellow-400 to-amber-500 hover:brightness-110 active:scale-95 text-slate-950 font-black text-xs rounded-xl shadow-md transition"
                     >
                       🥇 Tải Chứng Chỉ Chất Lượng Tuyệt Đối (PDF)
                     </button>
                  </div>
                )}
              </div>

            </div>

          </div>
        )}
      </div>

      {/* Advanced Filter, Search Toolbar (Compact layout, dense UI fields) */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-slate-50 dark:bg-slate-900/40 p-3 rounded-2xl border border-slate-200/50">
        
        {/* Search Field */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            placeholder="Tìm kiếm chương học..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-250 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-100 placeholder-slate-400 shadow-xs"
          />
        </div>

        {/* Filter Pills with motion feedback */}
        <div className="flex items-center gap-1 overflow-x-auto self-start sm:self-auto shrink-0 pb-1 sm:pb-0 scrollbar-none max-w-full">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                statusFilter === 'all' 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'bg-white dark:bg-slate-800 border border-slate-250 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100/50'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setStatusFilter('unstarted')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                statusFilter === 'unstarted' 
                  ? 'bg-slate-550 dark:bg-slate-700 text-white shadow-xs' 
                  : 'bg-white dark:bg-slate-800 border border-slate-250 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100/50'
              }`}
            >
              Chưa học
            </button>
            <button
              onClick={() => setStatusFilter('inprogress')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                statusFilter === 'inprogress' 
                  ? 'bg-amber-600 text-white shadow-xs' 
                  : 'bg-white dark:bg-slate-800 border border-slate-250 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100/50'
              }`}
            >
              Đang học
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                statusFilter === 'completed' 
                  ? 'bg-green-600 text-white shadow-xs' 
                  : 'bg-white dark:bg-slate-800 border border-slate-250 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100/50'
              }`}
            >
              Đã hoàn thành
            </button>
          </div>
        </div>

      </div>

      {/* Chapters Card grid structure */}
      {filteredChapters.length === 0 ? (
        <div className="bg-slate-50 dark:bg-slate-900/20 p-12 rounded-3xl text-center border-2 border-dashed border-slate-200 dark:border-slate-850">
          <p className="text-slate-400 dark:text-slate-500 font-sans text-sm font-medium">
            Không tìm thấy chương nào trùng khớp với từ khóa hoặc bộ lọc đã chọn.
          </p>
          <button 
            onClick={() => { setSearchQuery(''); setStatusFilter('all'); }} 
            className="mt-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl"
          >
            Reset tìm kiếm
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          {filteredChapters.map((chapter) => {
            const isExpanded = !!expandedChapters[chapter.id];
            
            return (
              <motion.div 
                key={chapter.id}
                id={`chapter-card-${chapter.id}`}
                layoutId={`chapter-card-${chapter.id}`}
                className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-gray-800 rounded-2xl overflow-hidden shadow-xs hover:border-blue-500/60 dark:hover:border-blue-500/50 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Chapter Header Cover Illustration */}
                  {chapter.imageUrl ? (
                    <div className="w-full h-[120px] bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                      <img src={chapter.imageUrl} alt={chapter.title} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    renderChapterIllustration(chapter.originalIndex)
                  )}

                  {/* Body Content */}
                  <div className="p-4 sm:p-5 text-left space-y-3">
                    
                    {/* Status Badge & index */}
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded">
                        Chương {chapter.originalIndex + 1}
                      </span>

                      {/* Completed percentage status */}
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                        chapter.completedCount === chapter.lessons.length
                          ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-800/20'
                          : chapter.completedCount > 0
                            ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/20'
                            : 'bg-slate-50 text-slate-500 border border-slate-200 dark:bg-slate-900/60 dark:text-slate-400 dark:border-slate-800'
                      }`}>
                        {chapter.completedCount === chapter.lessons.length 
                          ? 'Đã hoàn thành' 
                          : chapter.completedCount > 0 
                            ? `Đang học: ${chapter.completionPercent}%` 
                            : 'Chưa học'
                        }
                      </span>
                    </div>

                    {/* Chapter Texts */}
                    <div className="space-y-1">
                      <h3 className="font-extrabold text-sm sm:text-base text-slate-850 dark:text-white leading-snug">
                        {chapter.title}
                      </h3>
                      <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {chapter.description}
                      </p>
                    </div>

                    {/* Progress Bar inside specific card context */}
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 dark:text-slate-500">
                        <span>{chapter.completedCount} / {chapter.lessons.length} Bài học hoàn tất</span>
                        <span>{chapter.completionPercent}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-full transition-all duration-300"
                          style={{ width: `${chapter.completionPercent}%` }}
                        />
                      </div>
                    </div>

                  </div>
                </div>

                {/* Expanding Lesson List area and button controller */}
                <div className="border-t border-slate-100 dark:border-slate-750">
                  <button 
                    onClick={() => toggleChapter(chapter.id)}
                    className="w-full px-4 py-3 bg-slate-50/50 hover:bg-slate-100/60 dark:bg-slate-850/40 dark:hover:bg-slate-850/80 font-bold text-[11px] sm:text-xs text-slate-600 dark:text-slate-350 transition flex items-center justify-between"
                  >
                    <span className="flex items-center gap-1.5">
                      <BookOpen size={13} className="text-slate-400 shrink-0" />
                      <span>{isExpanded ? 'Thu gọn bài học' : `Xem chi tiết ${chapter.lessons.length} bài học`}</span>
                    </span>
                    <ChevronRight size={13} className={`transform transition duration-200 ${isExpanded ? 'rotate-90' : 'rotate-0'}`} />
                  </button>

                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: "easeInOut" }}
                        className="overflow-hidden bg-slate-50/20 dark:bg-slate-900/10 divide-y divide-slate-100 dark:divide-slate-800"
                      >
                        {chapter.lessons.map((lesson) => {
                          const isCompleted = (progress.completedLessons || []).includes(lesson.id);
                          const isUnlocked = !!lessonUnlockMap[lesson.id];

                          return (
                            <motion.div 
                              key={lesson.id}
                              whileHover={isUnlocked ? { x: 3 } : {}}
                              className={`px-4.5 py-3 flex items-center justify-between text-left transition-colors duration-150 ${
                                isUnlocked 
                                  ? 'hover:bg-slate-50 dark:hover:bg-slate-900/60 cursor-pointer text-slate-800' 
                                  : 'opacity-55 cursor-not-allowed bg-slate-100/30 dark:bg-slate-950/10'
                              }`}
                              onClick={() => {
                                if (isUnlocked) {
                                  setSelectedLesson(lesson);
                                  setView('lesson');
                                }
                              }}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                {/* Lesson Completion check indicators */}
                                <div className="shrink-0">
                                  {isCompleted ? (
                                    <div className="p-1 rounded-full bg-green-100 text-green-600 dark:bg-green-950/40 dark:text-green-400 border border-green-200 dark:border-green-900/30">
                                      <CheckCircle className="w-3.5 h-3.5 stroke-[3]" />
                                    </div>
                                  ) : isUnlocked ? (
                                    <div className="p-1 rounded-full bg-blue-50 text-blue-500 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30">
                                      <Unlock className="w-3.5 h-3.5" />
                                    </div>
                                  ) : (
                                    <div className="p-1 rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                                      <Lock className="w-3.5 h-3.5" />
                                    </div>
                                  )}
                                </div>

                                {/* Texts */}
                                <div className="min-w-0">
                                  <h4 className={`text-xs font-bold truncate leading-snug ${isUnlocked ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 dark:text-slate-550'}`}>
                                    {lesson.title}
                                  </h4>
                                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block truncate">
                                    {isCompleted 
                                      ? 'Đã học hoàn tất' 
                                      : isUnlocked 
                                        ? 'Nhập bài tự học' 
                                        : 'Bài trước đang dở dang'
                                    }
                                  </span>
                                </div>
                              </div>

                              {/* Desktop / mobile action button */}
                              {isUnlocked && (
                                <button className="px-3 py-1 bg-white hover:bg-slate-150 dark:bg-slate-800 dark:hover:bg-slate-750 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700 rounded-lg shrink-0 flex items-center gap-1 transition">
                                  <span>{isCompleted ? 'Học lại' : 'Nhập học'}</span>
                                  <ArrowRight size={10} className="stroke-[2.5]" />
                                </button>
                              )}
                            </motion.div>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

              </motion.div>
            );
          })}
        </div>
      )}

    </div>
  );
}
