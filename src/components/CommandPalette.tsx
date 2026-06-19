import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../store';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Keyboard, Search, HelpCircle, EyeOff, Sparkles, 
  Flame, Award, Code2, MousePointer, Cpu, CheckCircle2, ChevronRight, X, Play, RefreshCw, Send, Focus
} from 'lucide-react';

interface KeyboardStats {
  mouseClicks: number;
  keyboardKeystrokes: number;
  shortcutsUsed: number;
}

export function CommandPalette() {
  const { view, setView, selectedLesson, setSelectedLesson, syllabus } = useAppContext();
  
  // Dialog Open States
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isCheatSheetOpen, setIsCheatSheetOpen] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  
  // Search state inside Palettes
  const [searchQuery, setSearchQuery] = useState('');
  const [sheetSearchQuery, setSheetSearchQuery] = useState('');
  const [selectedCmdIndex, setSelectedCmdIndex] = useState(0);
  
  // Active Tab in Cheat Sheet ('shortcuts' | 'stats' | 'lesson')
  const [sheetTab, setSheetTab] = useState<'shortcuts' | 'stats' | 'lesson'>('shortcuts');
  
  // Keyboard master simulation state
  const [editorValue, setEditorValue] = useState('name = "Python"\nprint(name)\n\n# BÀI TẬP: Hãy sửa giá trị "Python" thành "Pilearn"!');
  const [editorResult, setEditorResult] = useState('');
  
  // Interactive mini-lessons for Shortcut Practice
  const [miniChallengeIdx, setMiniChallengeIdx] = useState(0);
  const miniChallenges = [
    {
      instructions: '1. Nhả chuột máy tính ra.\n2. Di chuyển con trỏ vào khung soạn thảo bằng cách nhấn Tab.\n3. Thao tác xóa dòng hoặc đổi "Python" thành "Pilearn" mà không dùng chuột.\n4. Nhấn Ctrl + Enter để chạy kiểm tra thành quả!',
      code: 'print("Chào mừng")\nprint("Python")\n# Đề bài: Xóa dòng dưới cùng và bấm Ctrl+Enter\nprint("Dòng thừa thãi cần xóa")',
      expectedOutput: 'Chào mừng\nPython',
      successMsg: 'Xuất sắc! Bạn đã vượt qua Thử Thách 1 mà không dùng Chuột máy tính! 🎉'
    },
    {
      instructions: 'Sử dụng phím tắt nhân bản dòng Shift+Alt+Mũi tên xuống để nhân dải lệnh in ra dưới đây 3 lần, rồi nhấn Ctrl+Enter để kiểm tra.',
      code: 'print("Lặp lại tôi")',
      expectedOutput: 'Lặp lại tôi\nLặp lại tôi\nLặp lại tôi\nLặp lại tôi',
      successMsg: 'Tuyệt đỉnh! Phím tắt sao chép nhân đôi giúp bạn tối ưu hóa 350% tốc độ code! 🚀'
    }
  ];

  // Global Keyboard statistics states
  const [stats, setStats] = useState<KeyboardStats>(() => {
    try {
      const saved = localStorage.getItem('keyboard_learning_stats');
      if (saved) return JSON.parse(saved);
    } catch {}
    return { mouseClicks: 0, keyboardKeystrokes: 0, shortcutsUsed: 0 };
  });

  // Save stats to localStorage
  useEffect(() => {
    localStorage.setItem('keyboard_learning_stats', JSON.stringify(stats));
  }, [stats]);

  // Compute stats ratio
  const totalActions = stats.mouseClicks + stats.keyboardKeystrokes;
  const keyboardRatio = totalActions > 0 ? Math.round((stats.keyboardKeystrokes / totalActions) * 100) : 0;

  // Track Badges Statuses
  const badges = [
    {
      id: 'rookie',
      name: 'Keyboard Rookie 👶',
      desc: 'Sử dụng bàn phím hơn 30 lần',
      unlocked: stats.keyboardKeystrokes >= 30,
      icon: Keyboard,
      color: 'text-sky-500 bg-sky-50 dark:bg-sky-950/20'
    },
    {
      id: 'explorer',
      name: 'Shortcut Explorer 🧭',
      desc: 'Sử dụng phím tắt thành thạo trên 15 lần',
      unlocked: stats.shortcutsUsed >= 15,
      icon: Sparkles,
      color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20'
    },
    {
      id: 'fast_coder',
      name: 'Fast Coder ⚡',
      desc: 'Sử dụng phím tắt thành thạo trên 25 lần',
      unlocked: stats.shortcutsUsed >= 25,
      icon: Cpu,
      color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20'
    },
    {
      id: 'master',
      name: 'Keyboard Master 👑',
      desc: 'Sử dụng bàn phím hơn 150 lần',
      unlocked: stats.keyboardKeystrokes >= 150,
      icon: Award,
      color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20'
    }
  ];

  // Set up mouse click listeners for diagnostics
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      // Exclude dialog itself clicking if possible to be fair, but simpler is fine
      setStats(prev => ({
        ...prev,
        mouseClicks: prev.mouseClicks + 1
      }));
    };
    window.addEventListener('mouseup', handleGlobalClick);
    return () => window.removeEventListener('mouseup', handleGlobalClick);
  }, []);

  // Track keyboard focus changes & stats
  useEffect(() => {
    const handleGlobalKeyDownStats = (e: KeyboardEvent) => {
      // Exclude simple keys if typing inside input boxes unless they are shortcut candidates
      const isInputFocused = ['INPUT', 'TEXTAREA'].includes((document.activeElement?.tagName || ''));
      
      const isModifier = e.ctrlKey || e.metaKey || e.altKey || e.shiftKey;
      
      // Keystroke count
      setStats(prev => {
        let sc = prev.shortcutsUsed;
        if (isModifier) {
          sc += 1;
        }
        return {
          ...prev,
          keyboardKeystrokes: prev.keyboardKeystrokes + 1,
          shortcutsUsed: sc
        };
      });
    };
    window.addEventListener('keydown', handleGlobalKeyDownStats);
    return () => window.removeEventListener('keydown', handleGlobalKeyDownStats);
  }, []);

  // Core Command Actions List
  const commands = [
    { name: 'Run Code (Chạy thử dòng Code)', shortcut: 'Ctrl + Enter', action: () => {
      window.dispatchEvent(new CustomEvent('command:run-code'));
      showFeedbackOverlay('Chạy Code thành công!');
    }},
    { name: 'Stop Code (Dừng chương trình)', shortcut: 'Ctrl + Shift + Enter', action: () => {
      window.dispatchEvent(new CustomEvent('command:stop-code'));
      showFeedbackOverlay('Đã dừng chạy!');
    }},
    { name: 'Reset Exercise (Làm lại bài thực hành)', shortcut: 'Ctrl + R', action: () => {
      window.dispatchEvent(new CustomEvent('command:reset-code'));
    }},
    { name: 'Submit Program (Nộp bài tập/Đống bài)', shortcut: 'Ctrl + Shift + S', action: () => {
      window.dispatchEvent(new CustomEvent('command:submit-code'));
    }},
    { name: 'Hỏi Trợ lý AI (Ask AI Tutor)', shortcut: 'Ctrl + I', action: () => {
      window.dispatchEvent(new CustomEvent('command:ask-ai'));
    }},
    { name: 'AI Giải thích mã nguồn (Explain Code)', shortcut: 'Ctrl + Shift + E', action: () => {
      window.dispatchEvent(new CustomEvent('command:explain-code'));
    }},
    { name: 'AI Tìm kiếm gỡ lỗi Bug (Debug Code)', shortcut: 'Ctrl + Shift + D', action: () => {
      window.dispatchEvent(new CustomEvent('command:debug-code'));
    }},
    { name: 'AI Xin gợi ý bước kế tiếp (Step Hint)', shortcut: 'Ctrl + Shift + H', action: () => {
      window.dispatchEvent(new CustomEvent('command:hint-code'));
    }},
    { name: 'Chuyển Chế độ tập trung (Toggle Focus Mode)', shortcut: 'F11 / Ctrl+Shift+F', action: () => {
      toggleFocusMode();
    }},
    { name: 'Bài tiếp theo (Next Lesson)', shortcut: 'N', action: () => {
      window.dispatchEvent(new CustomEvent('command:next-lesson'));
    }},
    { name: 'Bài trước đó (Prev Lesson)', shortcut: 'P', action: () => {
      window.dispatchEvent(new CustomEvent('command:prev-lesson'));
    }},
    { name: 'Chương tiếp theo (Next Chapter)', shortcut: 'Ctrl + ArrowRight', action: () => {
      window.dispatchEvent(new CustomEvent('command:next-chapter'));
    }},
    { name: 'Chương trước đó (Prev Chapter)', shortcut: 'Ctrl + ArrowLeft', action: () => {
      window.dispatchEvent(new CustomEvent('command:prev-chapter'));
    }},
    { name: 'Về Trang chủ Roadmap (Open Roadmap)', shortcut: 'H', action: () => {
      setView('roadmap');
      showFeedbackOverlay('Mở Lộ trình');
    }},
    { name: 'Chuyển tab Lý Thuyết (Go to Theory)', shortcut: 'L', action: () => {
      window.dispatchEvent(new CustomEvent('command:tab-theory'));
    }},
    { name: 'Chuyển tab Trắc Nghiệm (Go to Quiz)', shortcut: 'T', action: () => {
      window.dispatchEvent(new CustomEvent('command:tab-quiz'));
    }},
    { name: 'Chuyển tab Thực Hành (Go to Practice)', shortcut: 'E', action: () => {
      window.dispatchEvent(new CustomEvent('command:tab-practice'));
    }},
    { name: 'Bảng Phím tắt Cheat Sheet', shortcut: '?', action: () => {
      setIsCheatSheetOpen(true);
    }},
    { name: 'Thống kê Keyboard-First Stats', shortcut: 'Ctrl + Shift + K', action: () => {
      setSheetTab('stats');
      setIsCheatSheetOpen(true);
    }},
    { name: 'Mở cửa hàng vật phẩm (Open Shop)', shortcut: 'S', action: () => {
      setView('shop');
    }},
    { name: 'Quyết chiến Boss (Boss Battle)', shortcut: 'B', action: () => {
      setView('boss-battle');
    }},
    { name: 'Mở danh sách Bài thực hành chung (Practice View)', shortcut: 'V', action: () => {
      setView('practice');
    }},
    { name: 'Mở Trung tâm kiểm tra (Exams)', shortcut: 'X', action: () => {
      setView('exams');
    }}
  ];

  // Visual Overlay Feedback when standard commands execute
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const showFeedbackOverlay = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(''), 1500);
  };

  const toggleFocusMode = () => {
    setIsFocusMode(prev => {
      const next = !prev;
      if (next) {
        document.body.classList.add('focus-mode-active');
        showFeedbackOverlay('Đã BẬT Chế độ tập trung (Focus Mode) 🎯');
      } else {
        document.body.classList.remove('focus-mode-active');
        showFeedbackOverlay('Đã TẮT Chế độ tập trung');
      }
      return next;
    });
  };

  // Keyboard Event Hub for Global Hotkeys
  useEffect(() => {
    const handleKeyDownGlobalEvents = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput = activeEl && ['INPUT', 'TEXTAREA'].includes(activeEl.tagName || '') || activeEl?.getAttribute('contenteditable') === 'true';

      // 1. Esc key closes everything
      if (e.key === 'Escape') {
        setIsPaletteOpen(false);
        setIsCheatSheetOpen(false);
        return;
      }

      // 2. Open Command Palette: Ctrl + Shift + P or Ctrl + K
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setIsPaletteOpen(prev => !prev);
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsPaletteOpen(prev => !prev);
        return;
      }

      // 3. Open Shortcut Cheat Sheet: '?' (when NOT typing in input)
      if (e.key === '?' && !isInput) {
        e.preventDefault();
        setSheetTab('shortcuts');
        setIsCheatSheetOpen(prev => !prev);
        return;
      }

      // 4. Focus Mode shortcut: F11 (or Ctrl+Shift+F)
      if ((e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'f') || (e.key === 'F11' && !isInput)) {
        // Prevent default screen F11 if requested, or co-exist
        e.preventDefault();
        toggleFocusMode();
        return;
      }

      // 5. If typing, do not run navigation keys or single character commands
      if (isInput) return;

      // 6. Navigation Actions: N, P, H, L, T, E
      const keyUpper = e.key.toUpperCase();
      if (keyUpper === 'N' && !e.ctrlKey) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('command:next-lesson'));
        showFeedbackOverlay('Bài tiếp theo ➔');
      } else if (keyUpper === 'P' && !e.ctrlKey) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('command:prev-lesson'));
        showFeedbackOverlay('← Bài trước đó');
      } else if (keyUpper === 'H' && !e.ctrlKey) {
        e.preventDefault();
        setView('roadmap');
        showFeedbackOverlay('Xem Lộ Trình 🗺️');
      } else if (keyUpper === 'L' && !e.ctrlKey) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('command:tab-theory'));
        showFeedbackOverlay('Xem Lý Thuyết 📖');
      } else if (keyUpper === 'T' && !e.ctrlKey) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('command:tab-quiz'));
        showFeedbackOverlay('Vào Trắc Nghiệm ✍️');
      } else if (keyUpper === 'E' && !e.ctrlKey) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('command:tab-practice'));
        showFeedbackOverlay('Vào Thực Hành 💻');
      }

      // 7. Roadmap view chapter shortcuts: Ctrl + ArrowRight, Ctrl + ArrowLeft
      if (e.ctrlKey && e.key === 'ArrowRight') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('command:next-chapter'));
        showFeedbackOverlay('Chương tiếp theo');
      } else if (e.ctrlKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('command:prev-chapter'));
        showFeedbackOverlay('Chương trước đó');
      }
    };

    window.addEventListener('keydown', handleKeyDownGlobalEvents);
    return () => window.removeEventListener('keydown', handleKeyDownGlobalEvents);
  }, [setView]);

  // Command Palette List search filter
  const filteredCommands = commands.filter(cmd => 
    cmd.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const executeCmd = (index: number) => {
    if (filteredCommands[index]) {
      filteredCommands[index].action();
      setIsPaletteOpen(false);
      setSearchQuery('');
    }
  };

  const handlePaletteKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedCmdIndex(prev => (prev + 1) % filteredCommands.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedCmdIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      executeCmd(selectedCmdIndex);
    }
  };

  // Mini-challenge validator for Keybinds Lesson
  const runMiniChallenge = () => {
    const cur = miniChallenges[miniChallengeIdx];
    // Simple mock execution wrapper to test expected outputs
    let output = '';
    if (miniChallengeIdx === 0) {
      if (editorValue.includes('Xóa dòng dưới cùng') && !editorValue.includes('Dòng thừa thãi cần xóa')) {
        output = 'Chào mừng\nPython';
      } else {
        output = 'Chào mừng\nPython\nDòng thừa thãi cần xóa';
      }
    } else {
      // Check multiple prints
      const matches = editorValue.match(/print\("Lặp lại tôi"\)/g);
      if (matches && matches.length >= 4) {
        output = 'Lặp lại tôi\nLặp lại tôi\nLặp lại tôi\nLặp lại tôi';
      } else {
        output = 'Lặp lại tôi';
      }
    }

    setEditorResult(output);
  };

  useEffect(() => {
    if (editorResult === miniChallenges[miniChallengeIdx].expectedOutput) {
      showFeedbackOverlay('Thử thách hoàn tất! 🎉');
    }
  }, [editorResult, miniChallengeIdx]);

  return (
    <>
      {/* Floating Status Bar / Button on lower left for quick keyboard dashboard access */}
      <div className="fixed bottom-6 left-6 z-50 flex items-center gap-2">
        <motion.button
          onClick={() => {
            setSheetTab('shortcuts');
            setIsCheatSheetOpen(true);
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white shadow-lg border border-slate-700/50 cursor-pointer text-xs font-bold font-mono transition-transform"
          title="Bảng Phím Tắt Tiện Ích & Thống Kê (Phím tắt: ?)"
        >
          <Keyboard size={15} className="text-blue-400 animate-pulse" />
          <span className="hidden sm:inline">Phím tắt</span>
        </motion.button>

        {isFocusMode && (
          <motion.button
            onClick={toggleFocusMode}
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-1 px-3.5 py-2.5 rounded-full bg-red-650 hover:bg-red-700 text-white shadow-lg cursor-pointer text-xs font-bold"
            title="Thoát chế độ tập trung"
          >
            <EyeOff size={14} />
            <span>Thoát Focus</span>
          </motion.button>
        )}
      </div>

      {/* Interactive Floating feedback overlay screen flashing */}
      <AnimatePresence>
        {feedbackMsg && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-55 px-5 py-3 bg-blue-600 dark:bg-indigo-650 font-black text-xs sm:text-sm text-white rounded-2xl shadow-xl flex items-center gap-2 border border-blue-400/30"
          >
            <Sparkles size={14} className="text-amber-300 animate-bounce" />
            <span>{feedbackMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. VS Code Style Command Palette (Ctrl+Shift+P / Ctrl+K) */}
      <AnimatePresence>
        {isPaletteOpen && (
          <div className="fixed inset-0 z-55 flex items-start justify-center pt-[10vh] px-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPaletteOpen(false)}
              className="fixed inset-0 bg-slate-950"
            />

            {/* Panel */}
            <motion.div 
              initial={{ y: -30, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -30, opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden focus:outline-none flex flex-col font-mono"
              onKeyDown={handlePaletteKeyDown}
            >
              {/* Header input wrapper */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 dark:border-slate-800">
                <Search className="text-slate-400 w-5 h-5 shrink-0" />
                <input 
                  autoFocus
                  type="text" 
                  placeholder="Gõ lệnh tìm kiếm nhanh... (Ví dụ: 'Run', 'Roadmap')"
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setSelectedCmdIndex(0); }}
                  className="flex-1 bg-transparent text-slate-850 dark:text-gray-100 focus:outline-none text-sm font-sans"
                />
                <button 
                  onClick={() => setIsPaletteOpen(false)}
                  className="p-1 rounded-md text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Quick instructions bar */}
              <div className="bg-slate-50 dark:bg-slate-950/40 px-4 py-1.5 text-[10px] text-slate-450 border-b border-gray-100 dark:border-slate-800 flex justify-between">
                <span>Dùng ↑↓ để chọn, Enter để chạy</span>
                <span>ESC để thoát</span>
              </div>

              {/* Commands List scroll area */}
              <div className="max-h-[320px] overflow-y-auto py-2">
                {filteredCommands.length === 0 ? (
                  <div className="px-6 py-8 text-center text-slate-400 font-sans text-xs">
                    Không tìm thấy lệnh nào khớp với "{searchQuery}"
                  </div>
                ) : (
                  filteredCommands.map((cmd, idx) => {
                    const isSelected = idx === selectedCmdIndex;
                    return (
                      <div 
                        key={cmd.name}
                        onClick={() => executeCmd(idx)}
                        onMouseEnter={() => setSelectedCmdIndex(idx)}
                        className={`px-4 py-2.5 flex items-center justify-between text-xs cursor-pointer select-none transition-colors ${
                          isSelected 
                            ? 'bg-blue-600 text-white font-bold' 
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        <span className="font-sans font-medium">{cmd.name}</span>
                        <kbd className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                          isSelected ? 'bg-blue-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}>
                          {cmd.shortcut}
                        </kbd>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Global Accessibility Shortcut Cheat Sheet Dialog (loaded on ?) */}
      <AnimatePresence>
        {isCheatSheetOpen && (
          <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCheatSheetOpen(false)}
              className="fixed inset-0 bg-slate-950"
            />

            {/* Sheet Box */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-3xl overflow-hidden flex flex-col h-[85vh] sm:h-[80vh] font-sans"
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                    <Keyboard size={22} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 dark:text-white text-base">Hệ thống Keyboard-First Platform</h3>
                    <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
                      Tự động hóa toàn bộ thao tác học & viết code không cần chạm Chuột máy tính
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => setIsCheatSheetOpen(false)}
                  className="p-1 px-2 text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full font-bold transition flex items-center gap-1"
                >
                  <span>Mất tiêu</span>
                  <X size={12} />
                </button>
              </div>

              {/* Sub navbar tabs */}
              <div className="flex border-b border-slate-100 dark:border-slate-800 text-xs font-bold font-mono">
                <button 
                  onClick={() => setSheetTab('shortcuts')}
                  className={`flex-1 py-3 text-center border-b-2 transition-colors flex justify-center items-center gap-1.5 ${
                    sheetTab === 'shortcuts'
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-extrabold'
                      : 'border-transparent text-slate-500 hover:text-slate-850'
                  }`}
                >
                  <Search size={13} />
                  <span>Cẩm nang Phím tắt</span>
                </button>
                <button 
                  onClick={() => setSheetTab('stats')}
                  className={`flex-1 py-3 text-center border-b-2 transition-colors flex justify-center items-center gap-1.5 ${
                    sheetTab === 'stats'
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-extrabold'
                      : 'border-transparent text-slate-500 hover:text-slate-850'
                  }`}
                >
                  <Cpu size={13} />
                  <span>Kiểm định Thống kê & Huy hiệu</span>
                </button>
                <button 
                  onClick={() => setSheetTab('lesson')}
                  className={`flex-1 py-3 text-center border-b-2 transition-colors flex justify-center items-center gap-1.5 ${
                    sheetTab === 'lesson'
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-extrabold'
                      : 'border-transparent text-slate-500 hover:text-slate-850'
                  }`}
                >
                  <Flame size={13} />
                  <span>Học viện Keyboard Pro ({miniChallengeIdx + 1}/2)</span>
                </button>
              </div>

              {/* Content Panel Area */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-slate-50/20 dark:bg-slate-900/10">
                {sheetTab === 'shortcuts' && (
                  <div className="space-y-5 text-left">
                    {/* Search block in cheat sheet */}
                    <div className="relative mb-2">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text"
                        placeholder="Tìm phím tắt... (Ví dụ: 'AI', 'Code', 'Menu')"
                        value={sheetSearchQuery}
                        onChange={e => setSheetSearchQuery(e.target.value)}
                        className="w-full text-xs pl-8.5 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-850 text-slate-800 dark:text-slate-100"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Nav Shortcuts Section */}
                      <div className="bg-white dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800 shadow-xs space-y-3">
                        <h4 className="font-extrabold text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1.5 uppercase tracking-wide">
                          <Code2 size={13} />
                          <span>Điều hướng Website</span>
                        </h4>
                        <div className="space-y-2 text-xs font-medium">
                          {[
                            { label: 'Bài học tiếp theo', keys: ['N'] },
                            { label: 'Bài học trước đó', keys: ['P'] },
                            { label: 'Về Lộ trình học', keys: ['H'] },
                            { label: 'Chương tiếp (Roadmap)', keys: ['Ctrl', '➔'] },
                            { label: 'Chương trước (Roadmap)', keys: ['Ctrl', '←'] },
                            { label: 'Đóng cửa sổ hiện tại', keys: ['Esc'] },
                            { label: 'Bảng Phím tắt Cheat Sheet', keys: ['?'] },
                          ]
                          .filter(itm => itm.label.toLowerCase().includes(sheetSearchQuery.toLowerCase()))
                          .map((item, id) => (
                            <div key={id} className="flex justify-between items-center py-1 border-b border-dotted border-gray-100 dark:border-slate-700/50">
                              <span className="text-slate-650 dark:text-slate-350">{item.label}</span>
                              <div className="flex gap-1">
                                {item.keys.map((k, kId) => (
                                  <kbd key={kId} className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-750 text-[10px] font-bold border border-slate-200 dark:border-slate-700 rounded-md text-slate-550">{k}</kbd>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Code Execution section */}
                      <div className="bg-white dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800 shadow-xs space-y-3">
                        <h4 className="font-extrabold text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 uppercase tracking-wide">
                          <Cpu size={13} />
                          <span>Thao tác Thực hành & IDE</span>
                        </h4>
                        <div className="space-y-2 text-xs font-medium">
                          {[
                            { label: 'Chạy Code (Run Code)', keys: ['Ctrl', 'Enter'] },
                            { label: 'Dừng chạy (Stop Run)', keys: ['Ctrl', 'Shift', 'Enter'] },
                            { label: 'Reset bài tập làm lại', keys: ['Ctrl', 'R'] },
                            { label: 'Gửi bài tập (Submit)', keys: ['Ctrl', 'Shift', 'S'] },
                            { label: 'Chú thích Code (Comment)', keys: ['Ctrl', '/'] },
                            { label: 'Mở Command Palette', keys: ['Ctrl', 'Shift', 'P'] },
                            { label: 'Chế độ Focus Mode', keys: ['F11'] },
                          ]
                          .filter(itm => itm.label.toLowerCase().includes(sheetSearchQuery.toLowerCase()))
                          .map((item, id) => (
                            <div key={id} className="flex justify-between items-center py-1 border-b border-dotted border-gray-100 dark:border-slate-700/50">
                              <span className="text-slate-650 dark:text-slate-350">{item.label}</span>
                              <div className="flex gap-1">
                                {item.keys.map((k, kId) => (
                                  <kbd key={kId} className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-750 text-[10px] font-bold border border-slate-200 dark:border-slate-700 rounded-md text-slate-550">{k}</kbd>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* AI integration hotkeys */}
                      <div className="bg-white dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800 shadow-xs space-y-3 md:col-span-2">
                        <h4 className="font-extrabold text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 uppercase tracking-wide">
                          <Sparkles size={13} className="text-amber-500 animate-bounce" />
                          <span>Phím Tắt Triệu hồi Gia sư AI (AI-First Actions)</span>
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium">
                          {[
                            { label: 'Hỏi AI ngay lập tức (Ask Chat)', keys: ['Ctrl', 'I'] },
                            { label: 'Giải thích đoạn mã đã chọn', keys: ['Ctrl', 'Shift', 'E'] },
                            { label: 'Phân tích gỡ lỗi Bug (Auto Debug)', keys: ['Ctrl', 'Shift', 'D'] },
                            { label: 'Xin gợi ý bước kế tiếp (Step Hint)', keys: ['Ctrl', 'Shift', 'H'] },
                          ]
                          .filter(itm => itm.label.toLowerCase().includes(sheetSearchQuery.toLowerCase()))
                          .map((item, id) => (
                            <div key={id} className="flex justify-between items-center py-1 border-b border-dotted border-gray-150 dark:border-slate-700/50">
                              <span className="text-slate-650 dark:text-slate-350">{item.label}</span>
                              <div className="flex gap-1 shrink-0">
                                {item.keys.map((k, kId) => (
                                  <kbd key={kId} className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-750 text-[10px] font-bold border border-slate-200 dark:border-slate-700 rounded-md text-slate-550">{k}</kbd>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Keyboard stats and unlocked badges */}
                {sheetTab === 'stats' && (
                  <div className="space-y-6 text-left">
                    {/* Live Stats dashboard card */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-white dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl mr-3">
                          <MousePointer size={22} />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-black text-slate-400">Số Cú Click Chuột</p>
                          <p className="text-xl font-extrabold text-slate-800 dark:text-white leading-none mt-1">{stats.mouseClicks}</p>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl mr-3">
                          <Keyboard size={22} />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-black text-slate-400">Gõ Phím & Lệnh</p>
                          <p className="text-xl font-extrabold text-slate-800 dark:text-white leading-none mt-1">{stats.keyboardKeystrokes}</p>
                        </div>
                      </div>
                    </div>

                    {/* Badge gallery */}
                    <div className="space-y-3">
                      <h4 className="font-extrabold text-xs text-slate-800 dark:text-white uppercase tracking-wider">Huy hiệu coder chuyên nghiệp đã kích hoạt</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {badges.map((b) => {
                          const Icon = b.icon;
                          return (
                            <div 
                              key={b.id}
                              className={`p-3 rounded-2xl border transition flex items-center gap-3.5 relative ${
                                b.unlocked 
                                  ? 'bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700' 
                                  : 'bg-slate-50 border-slate-100 opacity-40 dark:bg-slate-900/40 dark:border-slate-850'
                              }`}
                            >
                              <div className={`p-2 rounded-xl shrink-0 ${b.color}`}>
                                <Icon size={20} />
                              </div>

                              <div className="min-w-0">
                                <h5 className={`text-xs font-bold truncate ${b.unlocked ? 'text-slate-850 dark:text-white' : 'text-slate-400'}`}>
                                  {b.name}
                                </h5>
                                <p className="text-[10px] text-slate-450 truncate mt-0.5 font-normal">{b.desc}</p>
                              </div>

                              {b.unlocked && (
                                <div className="absolute top-2 right-2.5">
                                  <CheckCircle2 size={14} className="text-emerald-500 fill-emerald-100" />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Specialized Class "Keyboard Master for Coders" */}
                {sheetTab === 'lesson' && (
                  <div className="space-y-5 text-left font-sans">
                    <div className="bg-orange-50 border border-orange-200/50 dark:bg-orange-950/20 dark:border-orange-900/30 p-4 rounded-2xl space-y-2">
                      <h4 className="text-xs font-black uppercase text-orange-700 dark:text-orange-400 flex items-center gap-1">
                        <Flame size={13} />
                        <span>Bài đào tạo: Keyboard Master for Coders</span>
                      </h4>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">
                        Làm quen kỹ năng làm việc tuyệt mật của các kỹ sư cấp cao. Sử dụng 100% bàn phím để nâng tốc độ xử lý phần mềm lên tầm cao mới!
                      </p>
                    </div>

                    {/* Interactive Arena block */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                      <div className="md:col-span-5 bg-white dark:bg-slate-800/60 p-4 border rounded-2xl space-y-3 shadow-xs">
                        <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-700">Yêu cầu bài tự học</span>
                        <p className="text-xs text-slate-700 dark:text-slate-300 font-bold leading-relaxed whitespace-pre-wrap">{miniChallenges[miniChallengeIdx].instructions}</p>
                        
                        {editorResult === miniChallenges[miniChallengeIdx].expectedOutput ? (
                          <div className="bg-green-50 border border-green-200 p-3 rounded-xl text-green-800 font-bold text-xs flex flex-col items-center gap-2">
                            <span>{miniChallenges[miniChallengeIdx].successMsg}</span>
                            {miniChallengeIdx < miniChallenges.length - 1 && (
                              <button 
                                onClick={() => { setMiniChallengeIdx(prev => prev + 1); setEditorValue(miniChallenges[miniChallengeIdx + 1].code); setEditorResult(''); }}
                                className="px-3.5 py-1.5 bg-green-600 hover:bg-green-700 active:scale-95 text-white text-[10px] font-extrabold rounded-lg transition"
                              >
                                Bài tiếp theo ➔
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-400 leading-relaxed dark:text-slate-400 pt-1.5 border-t border-slate-100">
                            * Gợi ý phím tắt soạn thảo nâng cao:<br/>
                            - <strong>Xóa dòng hiện tại</strong>: Ctrl + Shift + K<br/>
                            - <strong>Nhân đôi dòng</strong>: Shift + Alt + Mũi tên xuống<br/>
                            - <strong>Di chuyển dòng lên/xuống</strong>: Alt + Mũi tên lên/xuống
                          </div>
                        )}
                      </div>

                      {/* Small mock scratchpad */}
                      <div className="md:col-span-7 flex flex-col gap-2">
                        <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs flex-1">
                          <div className="bg-slate-900 px-3.5 py-2 text-[10px] text-slate-400 font-mono flex items-center justify-between border-b border-slate-800">
                            <span>Mã nguồn luyện tập (Python)</span>
                            <span className="animate-pulse flex items-center gap-1 text-[9px] text-indigo-400"><Code2 size={10} /> Keyboard input active</span>
                          </div>
                          
                          <div className="p-1.5 bg-slate-950 font-mono text-xs text-left min-h-[140px]">
                            <textarea 
                              ref={null}
                              value={editorValue}
                              onChange={e => setEditorValue(e.target.value)}
                              className="w-full min-h-[130px] bg-transparent text-slate-200 focus:outline-none font-mono text-xs leading-relaxed resize-none p-2 border-0"
                              placeholder="# Viết mã nguồn Python tại đây..."
                              onKeyDown={e => {
                                // Block mouse up/down, simulate basic editor shortcuts
                                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                                  e.preventDefault();
                                  runMiniChallenge();
                                }
                              }}
                            />
                          </div>

                          <div className="p-3.5 bg-slate-900 border-t border-slate-850 font-mono text-[10px] text-left">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-slate-500">KẾT QUẢ IN RA TERMINAL:</span>
                              <button 
                                onClick={runMiniChallenge}
                                className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 active:scale-95 text-[9px] font-black tracking-wider rounded-lg text-white font-mono"
                              >
                                <Play size={9} fill="currentColor" /> RUN (Ctrl+Enter)
                              </button>
                            </div>
                            <pre className="text-emerald-400 select-text max-h-[80px] overflow-y-auto min-h-[40px] font-mono leading-relaxed bg-slate-955 p-2 rounded-lg">{editorResult || '(Trống - nhấn Run để xuất ra kết quả)'}</pre>
                          </div>

                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer tip */}
              <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-450 dark:text-slate-500 font-mono flex flex-col sm:flex-row justify-between gap-1">
                <span>* Mẹo nhỏ: Bạn có thể mở công cụ tìm kiếm lệnh nhanh bất kỳ đâu với phím <strong>Ctrl + Shift + P</strong>.</span>
                <span>Thích ứng GDPT Tin học 10</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
