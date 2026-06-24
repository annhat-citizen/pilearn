import React, { useState, useEffect } from 'react';
import { 
  Lock, Unlock, CheckCircle, Sparkles, 
  Info, ChevronRight, Award, Terminal, Search, 
  BookOpen, ArrowRight, CornerDownRight,
  Crown, Download
} from 'lucide-react';
import { useAppContext } from '../store';
import { motion, AnimatePresence } from 'motion/react';
import { ProgressState } from '../types';

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
      <div className="absolute top-2.5 left-2.5 text-[9px] uppercase tracking-wider font-bold bg-black/20 text-white px-2 py-0.5 rounded backdrop-blur-xs font-mono">
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
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unstarted' | 'inprogress' | 'completed'>('all');
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});

  const totalLessons = syllabus.reduce((acc, chapter) => acc + chapter.lessons.length, 0);
  const completedCount = (progress.completedLessons || []).filter(id => id.startsWith('l')).length;
  const completionPercentage = Math.round((completedCount / Math.max(1, totalLessons)) * 100);

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

  useEffect(() => {
    const handleNextChapter = () => {
      if (!syllabus || syllabus.length === 0) return;
      const activeId = Object.keys(expandedChapters).find(key => expandedChapters[key] === true);
      const activeIdx = activeId ? syllabus.findIndex(c => c.id === activeId) : -1;
      let nextIdx = 0;
      if (activeIdx > -1 && activeIdx + 1 < syllabus.length) nextIdx = activeIdx + 1;
      const nextChapter = syllabus[nextIdx];
      const nextState: Record<string, boolean> = {};
      nextState[nextChapter.id] = true;
      setExpandedChapters(nextState);
      setTimeout(() => {
        const el = document.getElementById(`chapter-card-${nextChapter.id}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
    };

    const handlePrevChapter = () => {
      if (!syllabus || syllabus.length === 0) return;
      const activeId = Object.keys(expandedChapters).find(key => expandedChapters[key] === true);
      const activeIdx = activeId ? syllabus.findIndex(c => c.id === activeId) : -1;
      let prevIdx = syllabus.length - 1;
      if (activeIdx > 0) prevIdx = activeIdx - 1;
      const prevChapter = syllabus[prevIdx];
      const nextState: Record<string, boolean> = {};
      nextState[prevChapter.id] = true;
      setExpandedChapters(nextState);
      setTimeout(() => {
        const el = document.getElementById(`chapter-card-${prevChapter.id}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
    setExpandedChapters(prev => ({ ...prev, [chapterId]: !prev[chapterId] }));
  };

  const filteredChapters = syllabus.map((chapter, index) => {
    const completedCountInChapter = chapter.lessons.filter(lesson => (progress.completedLessons || []).includes(lesson.id)).length;
    const isCompleted = chapter.lessons.length > 0 && completedCountInChapter === chapter.lessons.length;
    const isInProgress = completedCountInChapter > 0 && completedCountInChapter < chapter.lessons.length;
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
    const textToSearch = `${chapter.title} ${chapter.description || ''}`.toLowerCase();
    const matchesSearch = textToSearch.includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (statusFilter === 'unstarted') return chapter.status === 'unstarted';
    if (statusFilter === 'inprogress') return chapter.status === 'inprogress';
    if (statusFilter === 'completed') return chapter.status === 'completed';
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6 text-sans">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 text-[#0052cc] text-xs font-bold tracking-wide border border-blue-100">
          <Sparkles size={12} className="shrink-0" />
          <span>Chủ đề F: Tin học 10 - Lập trình Python</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          Lộ Trình Học Lập Trình Python
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          Nội dung trực quan bám sát chương trình GDPT Tin học 10. Luyện tương tác từ câu hỏi cơ bản đến thực hành viết code.
        </p>
      </div>

      <div className="card p-5 flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="flex-1 w-full">
          <span className="text-[10px] uppercase tracking-wider font-bold text-[#0052cc]">Tiến trình học tập</span>
          <div className="mt-3 bg-slate-100 dark:bg-slate-700 w-full h-2.5 rounded-full overflow-hidden">
            <div 
              className="bg-[#0052cc] h-full transition-all duration-1000 ease-out rounded-full"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-xs font-medium mt-1.5 text-slate-500">
            <span>Đã hoàn thành <strong className="text-[#0052cc]">{completedCount}</strong> / {totalLessons} bài học</span>
            <span className="text-[#0052cc] font-bold">{completionPercentage}%</span>
          </div>
        </div>
        <div className="flex gap-6 shrink-0 bg-slate-50 dark:bg-slate-900 p-3.5 rounded-xl w-full md:w-auto justify-around">
          <div className="text-center px-4">
            <div className="text-2xl font-bold text-amber-500">{progress.points}</div>
            <div className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Xu tích lũy</div>
          </div>
          <div className="w-px bg-slate-200 dark:bg-slate-700" />
          <div className="text-center px-4">
            <div className="text-2xl font-bold text-[#0052cc]">{progress.xp}</div>
            <div className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Kinh nghiệm</div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#1e1b4b] via-slate-900 to-[#111827] text-white p-6 rounded-2xl border border-indigo-500/20 shadow-sm">
        {!progress.isPro ? (
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-left flex-1">
              <div className="inline-flex items-center gap-1 bg-yellow-400/20 text-yellow-300 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                <Crown size={12} className="fill-current" />
                <span>Gói Toàn Diện (PRO)</span>
              </div>
              <h3 className="text-lg font-bold text-white">Tải Trọn Bộ Giáo Trình PDF Nâng Cao & Nhận Chứng Chỉ</h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
                Tài khoản PRO mở khóa tải File PDF giáo trình, bài tập OOP và chứng chỉ số GDPT 10 danh giá! 
                Tặng kèm <strong className="text-yellow-300">3 ngày dùng thử miễn phí</strong>.
              </p>
            </div>
            <button
              onClick={() => { if (updateProgress) { updateProgress((prev: ProgressState) => ({ ...prev, isPro: true })); alert("Hoan nghênh bạn nâng cấp! Bạn đã được kích hoạt 3 ngày trải nghiệm miễn phí."); } }}
              className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-amber-500 hover:brightness-110 active:scale-95 text-slate-950 text-xs font-bold rounded-xl shadow-xl transition cursor-pointer"
            >
              Kích Hoạt PRO - Dùng thử Free 3 ngày
            </button>
          </div>
        ) : (
          <div className="space-y-6 text-left">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <div className="inline-flex items-center gap-1 bg-yellow-400 text-slate-950 px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide">
                  Gói PRO Đã Kích hoạt
                </div>
                <h3 className="text-xl font-bold mt-2">Học Liệu & Chứng Nhận</h3>
              </div>
              <button onClick={() => { if (updateProgress) updateProgress((prev: ProgressState) => ({ ...prev, isPro: false })); }}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-[10px] font-bold rounded-xl border border-white/10 transition"
              >
                Trở lại bản Free
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-900/60 p-5 rounded-2xl border border-white/5 space-y-3">
                <span className="text-[10px] uppercase tracking-wider font-bold text-indigo-300">Tập bài giảng PDF độc quyền</span>
                <div className="space-y-2">
                  {['Đệ quy & Kỹ thuật viết Hàm nâng cao', 'Tuyển tập 50 Thuật Toán sắp xếp', 'OOP Python đại cương'].map((title, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                      <span className="font-bold text-slate-200">{i + 1}. {title}.pdf</span>
                      <button onClick={() => alert("Đang tải tài liệu...")} className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 rounded text-[10px] font-bold text-white flex items-center gap-1 cursor-pointer">
                        <Download size={10} /> Tải PDF
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-slate-900/60 p-5 rounded-2xl border border-white/5 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-amber-300">Chứng thư số hóa</span>
                  <p className="text-xs text-slate-400 mt-1">Đạt 100% lộ trình các bài giảng để nhận văn bằng:</p>
                </div>
                {completionPercentage < 100 ? (
                  <div className="bg-slate-950/90 border border-slate-800 p-4 rounded-xl text-xs space-y-2 mt-3">
                    <div className="flex justify-between font-bold">
                      <span className="text-yellow-400">Trạng thái: Đang học ({completionPercentage}%)</span>
                      <span className="text-slate-500">Yêu cầu: 100%</span>
                    </div>
                    <button onClick={() => { if (updateProgress) { const allLessonIds = syllabus.flatMap(ch => ch.lessons.map(l => l.id)); updateProgress((prev: ProgressState) => ({ ...prev, completedLessons: allLessonIds })); alert("Đã kích hoạt hoàn thành 100% bài học để test!"); } }}
                      className="w-full text-center py-1 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded text-[10px] font-bold transition"
                    >
                      Nhận nhanh 100% để test bằng tốt nghiệp
                    </button>
                  </div>
                ) : (
                  <div className="bg-slate-950 p-4 rounded-2xl border-2 border-yellow-500/40 text-center space-y-3 shadow shadow-yellow-500/10 mt-3">
                    <p className="text-[10px] text-yellow-400 font-bold uppercase tracking-widest">Văn Bằng Tốt Nghiệp</p>
                    <div>
                      <h4 className="text-base font-bold text-white">HỌC VIÊN PYTHON</h4>
                      <p className="text-[10px] text-gray-300 mt-1">Học viên: <strong className="text-white">Bạn Học Bản Lĩnh</strong></p>
                    </div>
                    <button onClick={() => alert("Đang tải chứng chỉ PDF...")} className="w-full py-2 bg-gradient-to-r from-yellow-400 to-amber-500 hover:brightness-110 active:scale-95 text-slate-950 font-bold text-xs rounded-xl shadow-md transition">
                      Tải Chứng Chỉ (PDF)
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-white dark:bg-slate-800 p-3 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            placeholder="Tìm kiếm chương học..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0052cc] text-slate-800 dark:text-slate-100 placeholder-slate-400"
          />
        </div>
        <div className="flex items-center gap-1 overflow-x-auto shrink-0">
          <button onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              statusFilter === 'all' ? 'bg-[#0052cc] text-white' : 'bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >Tất cả</button>
          <button onClick={() => setStatusFilter('unstarted')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              statusFilter === 'unstarted' ? 'bg-slate-600 text-white' : 'bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >Chưa học</button>
          <button onClick={() => setStatusFilter('inprogress')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              statusFilter === 'inprogress' ? 'bg-amber-600 text-white' : 'bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >Đang học</button>
          <button onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              statusFilter === 'completed' ? 'bg-green-600 text-white' : 'bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >Đã xong</button>
        </div>
      </div>

      {filteredChapters.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 p-12 rounded-2xl text-center border-2 border-dashed border-gray-200 dark:border-slate-700">
          <p className="text-slate-400 text-sm font-medium">Không tìm thấy chương nào trùng khớp.</p>
          <button onClick={() => { setSearchQuery(''); setStatusFilter('all'); }} className="mt-3 px-4 py-2 bg-[#0052cc] hover:bg-[#0041a3] text-white font-bold text-xs rounded-lg transition">
            Reset tìm kiếm
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredChapters.map((chapter) => {
            const isExpanded = !!expandedChapters[chapter.id];
            return (
              <motion.div 
                key={chapter.id}
                id={`chapter-card-${chapter.id}`}
                layoutId={`chapter-card-${chapter.id}`}
                className="card bg-white dark:bg-slate-800 flex flex-col justify-between overflow-hidden"
              >
                <div>
                  {chapter.imageUrl ? (
                    <div className="w-full h-[120px] bg-slate-100 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700">
                      <img src={chapter.imageUrl} alt={chapter.title} className="w-full h-full object-cover" />
                    </div>
                  ) : renderChapterIllustration(chapter.originalIndex)}

                  <div className="p-5 text-left space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#0052cc] bg-blue-50 dark:bg-blue-950/30 px-2 py-0.5 rounded">
                        Chương {chapter.originalIndex + 1}
                      </span>
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                        chapter.completedCount === chapter.lessons.length
                          ? 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400'
                          : chapter.completedCount > 0
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
                            : 'bg-slate-50 text-slate-500 dark:bg-slate-900/60 dark:text-slate-400'
                      }`}>
                        {chapter.completedCount === chapter.lessons.length ? 'Hoàn thành' : chapter.completedCount > 0 ? `${chapter.completionPercent}%` : 'Chưa học'}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-sm md:text-base text-slate-900 dark:text-white">{chapter.title}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{chapter.description}</p>
                    </div>
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-[10px] font-medium text-slate-400"><span>{chapter.completedCount}/{chapter.lessons.length} bài học</span><span>{chapter.completionPercent}%</span></div>
                      <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full transition-all duration-300" style={{ width: `${chapter.completionPercent}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 dark:border-slate-700">
                  <button onClick={() => toggleChapter(chapter.id)}
                    className="w-full px-4 py-3 bg-slate-50/50 hover:bg-slate-100 dark:bg-slate-900/40 dark:hover:bg-slate-900/80 font-bold text-xs text-slate-600 dark:text-slate-300 transition flex items-center justify-between"
                  >
                    <span className="flex items-center gap-1.5">
                      <BookOpen size={13} className="text-slate-400 shrink-0" />
                      <span>{isExpanded ? 'Thu gọn' : `Xem ${chapter.lessons.length} bài học`}</span>
                    </span>
                    <ChevronRight size={13} className={`transform transition duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                  </button>
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22, ease: "easeInOut" }}
                        className="overflow-hidden bg-slate-50/20 dark:bg-slate-900/10 divide-y divide-gray-100 dark:divide-slate-800"
                      >
                        {chapter.lessons.map((lesson) => {
                          const isCompleted = (progress.completedLessons || []).includes(lesson.id);
                          const isUnlocked = !!lessonUnlockMap[lesson.id];
                          return (
                            <motion.div key={lesson.id} whileHover={isUnlocked ? { x: 3 } : {}}
                              className={`px-4 py-3 flex items-center justify-between text-left transition-colors ${
                                isUnlocked ? 'hover:bg-slate-50 dark:hover:bg-slate-900/60 cursor-pointer' : 'opacity-50 cursor-not-allowed bg-slate-50/30 dark:bg-slate-950/10'
                              }`}
                              onClick={() => { if (isUnlocked) { setSelectedLesson(lesson); setView('lesson'); } }}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="shrink-0">
                                  {isCompleted ? (
                                    <div className="p-0.5 rounded-full bg-green-100 text-green-600 dark:bg-green-950/30 dark:text-green-400">
                                      <CheckCircle className="w-3.5 h-3.5" />
                                    </div>
                                  ) : isUnlocked ? (
                                    <div className="p-0.5 rounded-full bg-blue-50 text-blue-500 dark:bg-blue-950/30 dark:text-blue-400">
                                      <Unlock className="w-3.5 h-3.5" />
                                    </div>
                                  ) : (
                                    <div className="p-0.5 rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                                      <Lock className="w-3.5 h-3.5" />
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <h4 className={`text-xs font-bold truncate ${isUnlocked ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500'}`}>{lesson.title}</h4>
                                  <span className="text-[10px] text-slate-400 block truncate">
                                    {isCompleted ? 'Đã hoàn tất' : isUnlocked ? 'Sẵn sàng học' : 'Bị khóa'}
                                  </span>
                                </div>
                              </div>
                              {isUnlocked && (
                                <button className="px-3 py-1 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-[10px] font-bold text-[#0052cc] border border-gray-200 dark:border-slate-700 rounded-lg shrink-0 flex items-center gap-1 transition">
                                  <span>{isCompleted ? 'Học lại' : 'Học'}</span>
                                  <ArrowRight size={10} />
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
