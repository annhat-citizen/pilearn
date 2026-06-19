import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, BookOpen, Code2, Trophy, ArrowDownToLine, 
  Zap, Volume2, VolumeX, Bot, Sparkles, HelpCircle,
  Menu, X, ChevronRight, ChevronDown, Play, Lock, Unlock, CheckCircle,
  Lightbulb, Terminal, Layers, Swords, Pin, PinOff, AlignLeft
} from 'lucide-react';
import { useAppContext } from '../store';
import { IDE } from '../components/IDE';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import remarkBreaks from 'remark-breaks';
import { InteractiveGamePlayer } from '../components/InteractiveGamePlayer';
import { FlashcardsApp } from '../components/FlashcardsApp';
import { MiniQuiz } from '../components/MiniQuiz';
import { motion, AnimatePresence } from 'motion/react';
import { BlockViewer } from '../components/BlockViewer';
import { InteractiveTheoryIDE } from '../components/InteractiveTheoryIDE';
import { PracticeIDE } from '../components/PracticeIDE';
import { AIAssistant } from '../components/AIAssistant';
import { audioService } from '../utils/audio';

// Helper function to synthesize flexible block sequences dynamically for backward compatibility
function getLessonBlocks(lesson: any) {
  if (lesson.blocks && lesson.blocks.length > 0) {
    return lesson.blocks;
  }
  
  const blocks: any[] = [];
  
  if (lesson.theory) {
    blocks.push({
      id: 'legacy-theory',
      type: 'theory',
      title: 'Lý thuyết minh họa',
      content: typeof lesson.theory === 'string' ? lesson.theory : JSON.stringify(lesson.theory)
    });
  }
  
  if (lesson.mindmapUrl) {
    blocks.push({
      id: 'legacy-mindmap',
      type: 'mindmap',
      title: 'Sơ Đồ Tư Duy (Mindmap)',
      url: lesson.mindmapUrl
    });
  }
  
  if (lesson.simulationUrl) {
    blocks.push({
      id: 'legacy-simulation',
      type: 'simulation',
      title: 'Mô phỏng thực quan',
      url: lesson.simulationUrl
    });
  }
  
  if (lesson.interactiveGames && lesson.interactiveGames.length > 0) {
    lesson.interactiveGames.forEach((g: any, idx: number) => {
      blocks.push({
        id: `legacy-game-${idx}`,
        type: 'game',
        title: g.title || `Trò chơi tương tác ${idx + 1}`,
        game: g
      });
    });
  }
  
  if (lesson.flashcards && lesson.flashcards.length > 0) {
    blocks.push({
      id: 'legacy-flashcards',
      type: 'flashcards',
      title: 'Thẻ Ghi Nhớ (Flashcards)',
      flashcards: lesson.flashcards
    });
  }
  
  if (lesson.miniQuiz && lesson.miniQuiz.length > 0) {
    blocks.push({
      id: 'legacy-miniquiz',
      type: 'miniquiz',
      title: 'Trắc Nghiệm Nhanh',
      miniQuiz: lesson.miniQuiz
    });
  }
  
  if (lesson.labs && lesson.labs.length > 0) {
    lesson.labs.forEach((lab: any, idx: number) => {
      blocks.push({
        id: lab.id || `legacy-lab-${idx}`,
        type: 'practice',
        title: `Thực hành Lab ${idx + 1}`,
        prompt: lab.prompt,
        expectedCode: lab.expectedCode
      });
    });
  } else if (lesson.labPrompt) {
    blocks.push({
      id: 'legacy-lab',
      type: 'practice',
      title: 'Thực hành Lab',
      prompt: lesson.labPrompt,
      expectedCode: lesson.labExpectedCode
    });
  }
  
  if (lesson.challengePrompt) {
    blocks.push({
      id: 'legacy-challenge',
      type: 'challenge',
      title: 'Thử Thách Nâng Cao',
      prompt: lesson.challengePrompt,
      expectedCode: lesson.challengeExpectedCode
    });
  }
  
  return blocks;
}

export function LessonView() {
  const { selectedLesson, setSelectedLesson, syllabus, setView, completeLesson, progress, addXP, role } = useAppContext();
  const [readingProgress, setReadingProgress] = useState(0);
  const [hasReceivedReadingXP, setHasReceivedReadingXP] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'theory' | 'practice' | 'challenge'>('theory');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Table of Contents mobile drawer and desktop expand state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [sidebarExpandedChapters, setSidebarExpandedChapters] = useState<Record<string, boolean>>({});
  const [isSidebarPinned, setIsSidebarPinned] = useState(true);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);

  // Pre-calculate precise sequential unlocked maps globally in LessonView
  const lessonUnlockMap: Record<string, boolean> = {};
  let globalCompletedPrev = true;
  if (syllabus) {
    syllabus.forEach(chapter => {
      chapter.lessons.forEach(lesson => {
        const isCompleted = (progress.completedLessons || []).includes(lesson.id);
        const roleBasedUnlock = role === 'admin' || role === 'teacher';
        lessonUnlockMap[lesson.id] = isCompleted || globalCompletedPrev || roleBasedUnlock;
        globalCompletedPrev = isCompleted || roleBasedUnlock;
      });
    });
  }

  // Auto-expand current lesson's chapter in the sidebar
  useEffect(() => {
    if (selectedLesson && syllabus) {
      const activeChapter = syllabus.find(ch => 
        ch.lessons.some(l => l.id === selectedLesson.id)
      );
      if (activeChapter) {
        setSidebarExpandedChapters(prev => ({
          ...prev,
          [activeChapter.id]: true
        }));
      }
    }
  }, [selectedLesson, syllabus]);

  const toggleSidebarChapter = (chapterId: string) => {
    setSidebarExpandedChapters(prev => ({
      ...prev,
      [chapterId]: !prev[chapterId]
    }));
  };

  const renderSyllabusTOC = () => {
    if (!syllabus) return null;
    return (
      <div className="space-y-4 font-sans text-left bg-transparent h-full flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-slate-150 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-extrabold text-sm sm:text-base text-slate-800 dark:text-white">
              Mục lục bài học
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] sm:text-xs font-black text-slate-500 bg-slate-100 dark:bg-slate-805 dark:text-slate-400 px-2.5 py-0.5 rounded-full">
              {(progress.completedLessons || []).length} / {syllabus.reduce((sum, ch) => sum + ch.lessons.length, 0)} Đã xong
            </span>
            <button 
              onClick={() => setIsSidebarPinned(!isSidebarPinned)}
              className="hidden lg:flex items-center justify-center p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 focus:outline-none rounded-lg transition-colors"
              title={isSidebarPinned ? "Bỏ ghim thanh bên" : "Ghim thanh bên"}
            >
              {isSidebarPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-2.5 overflow-y-auto max-h-[calc(100vh-240px)] pr-1 no-scrollbar">
          {syllabus.map((chapter, chIdx) => {
            const isChapterExpanded = !chapter.id || !!sidebarExpandedChapters[chapter.id];
            const activeChapter = chapter.lessons.some(l => l.id === selectedLesson.id);
            const chapterCompletedCount = chapter.lessons.filter(l => (progress.completedLessons || []).includes(l.id)).length;
            const completionPercent = Math.round((chapterCompletedCount / chapter.lessons.length) * 100);

            return (
              <div key={chapter.id} className="border border-slate-200/60 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50/40 dark:bg-slate-900/10">
                <button
                  onClick={() => toggleSidebarChapter(chapter.id)}
                  className={`w-full text-left p-3 flex items-start justify-between gap-2 hover:bg-slate-100/50 dark:hover:bg-slate-850/40 transition-colors ${
                    activeChapter ? 'border-l-4 border-blue-500 bg-blue-50/20 dark:bg-blue-950/10' : ''
                  }`}
                >
                  <div className="min-w-0 pr-1 flex-1">
                    <span className="text-[9px] uppercase font-black text-slate-400 dark:text-slate-550 block tracking-wider">
                      Chương {chIdx + 1}
                    </span>
                    <h4 className="font-extrabold text-xs text-slate-705 dark:text-slate-200 mt-0.5 truncate leading-snug">
                      {chapter.title}
                    </h4>
                    
                    {/* Progress slider */}
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <div className="w-20 h-1 bg-slate-250 dark:bg-slate-800 rounded-full overflow-hidden shrink-0">
                        <div className="h-full bg-emerald-500" style={{ width: `${completionPercent}%` }}></div>
                      </div>
                      <span className="text-[9px] font-black text-slate-450 dark:text-slate-500">{completionPercent}%</span>
                    </div>
                  </div>
                  {isChapterExpanded ? (
                    <ChevronDown size={14} className="text-slate-400 shrink-0 mt-0.5" />
                  ) : (
                    <ChevronRight size={14} className="text-slate-400 shrink-0 mt-0.5" />
                  )}
                </button>

                {isChapterExpanded && (
                  <div className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 divide-y divide-slate-105 dark:divide-slate-800/80">
                    {chapter.lessons.map((lesson, lIdx) => {
                      const isActive = selectedLesson.id === lesson.id;
                      const isCompleted = (progress.completedLessons || []).includes(lesson.id);
                      const isUnlocked = !!lessonUnlockMap[lesson.id];

                      return (
                        <div
                          key={lesson.id}
                          onClick={() => {
                            if (isUnlocked) {
                              setSelectedLesson(lesson);
                              setIsDrawerOpen(false);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }
                          }}
                          className={`p-2.5 px-3.5 flex items-center justify-between text-left gap-2.5 transition-colors cursor-pointer select-none ${
                            isActive 
                              ? 'bg-blue-50/70 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300 font-extrabold border-l-2 border-blue-600' 
                              : isUnlocked
                                ? 'hover:bg-slate-50 dark:hover:bg-slate-850/30 text-slate-600 dark:text-slate-350'
                                : 'opacity-40 cursor-not-allowed bg-slate-105'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="shrink-0 mt-0.5">
                              {isCompleted ? (
                                <CheckCircle className="w-3.5 h-3.5 text-green-500 fill-green-500/10 stroke-[2.5]" />
                              ) : isActive ? (
                                <Play className="w-3 h-3 text-blue-600 fill-blue-600 shrink-0 animate-pulse" />
                              ) : isUnlocked ? (
                                <Unlock className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                              ) : (
                                <Lock className="w-3 h-3 text-slate-350 dark:text-slate-600" />
                              )}
                            </div>
                            <span className={`text-[11px] truncate leading-snug ${isActive ? 'font-black text-blue-600 dark:text-blue-400' : 'font-bold'}`}>
                              {lesson.title}
                            </span>
                          </div>

                          {isUnlocked && !isActive && (
                            <ChevronRight size={10} className="text-slate-350 shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (!selectedLesson) return null;

  const blocks = getLessonBlocks(selectedLesson);

  const getTabForBlock = (type: string) => {
    if (['theory', 'mindmap', 'simulation'].includes(type)) return 'theory';
    if (['game', 'flashcards', 'miniquiz'].includes(type)) return 'practice';
    if (['practice', 'challenge'].includes(type)) return 'challenge';
    return 'theory';
  };

  const activeBlocks = blocks.filter((b: any) => getTabForBlock(b.type) === activeTab);

  const getBlockTypeName = (type: string) => {
    switch (type) {
      case 'theory': return 'Lý thuyết';
      case 'mindmap': return 'Sơ đồ tư duy';
      case 'simulation': return 'Mô phỏng';
      case 'flashcards': return 'Trò chơi ôn tập';
      case 'miniquiz': return 'Trắc nghiệm nhanh';
      case 'game': return 'Thử thách logic';
      case 'practice': return 'Luyện tập thực hành';
      case 'challenge': return 'Thử thách nâng cao';
      default: return 'Khối bài học';
    }
  };

  const handleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    let textToRead = '';
    blocks.forEach(b => {
      if (b.type === 'theory' && b.content) {
        textToRead += b.content.replace(/<[^>]*>?/gm, '').replace(/[#*`_]/g, '') + ' ';
      }
    });

    if (!textToRead.trim()) {
      textToRead = selectedLesson.title;
    }
    
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = 'vi-VN';

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const voices = window.speechSynthesis.getVoices();
      const adamVoice = voices.find(v => v.name.toLowerCase().includes('adam'));
      if (adamVoice) {
        utterance.voice = adamVoice;
      }
    }

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // Keyboard shortcut event registration inside active Lesson View
  useEffect(() => {
    const handleNextLesson = () => {
      if (!selectedLesson || !syllabus) return;
      let currentChapterIdx = -1;
      let currentLessonIdx = -1;
      
      for (let c = 0; c < syllabus.length; c++) {
        const lIdx = syllabus[c].lessons.findIndex(l => l.id === selectedLesson.id);
        if (lIdx > -1) {
          currentChapterIdx = c;
          currentLessonIdx = lIdx;
          break;
        }
      }
      
      if (currentChapterIdx === -1 || currentLessonIdx === -1) return;
      
      const currentChapter = syllabus[currentChapterIdx];
      if (currentLessonIdx + 1 < currentChapter.lessons.length) {
        setSelectedLesson(currentChapter.lessons[currentLessonIdx + 1]);
      } else if (currentChapterIdx + 1 < syllabus.length) {
        setSelectedLesson(syllabus[currentChapterIdx + 1].lessons[0]);
      }
    };

    const handlePrevLesson = () => {
      if (!selectedLesson || !syllabus) return;
      let currentChapterIdx = -1;
      let currentLessonIdx = -1;
      
      for (let c = 0; c < syllabus.length; c++) {
        const lIdx = syllabus[c].lessons.findIndex(l => l.id === selectedLesson.id);
        if (lIdx > -1) {
          currentChapterIdx = c;
          currentLessonIdx = lIdx;
          break;
        }
      }
      
      if (currentChapterIdx === -1 || currentLessonIdx === -1) return;
      
      const currentChapter = syllabus[currentChapterIdx];
      if (currentLessonIdx > 0) {
        setSelectedLesson(currentChapter.lessons[currentLessonIdx - 1]);
      } else if (currentChapterIdx > 0) {
        const prevChapter = syllabus[currentChapterIdx - 1];
        setSelectedLesson(prevChapter.lessons[prevChapter.lessons.length - 1]);
      }
    };

    const handleAskAIEvent = () => {
      setIsAIOpen(true);
    };

    const handleScrollToBlock = (type: string) => {
      // First switch to the correct tab
      if (['theory', 'mindmap', 'simulation'].includes(type)) {
        setActiveTab('theory');
      } else if (['game', 'flashcards', 'miniquiz'].includes(type)) {
        setActiveTab('practice');
      } else if (['practice', 'challenge'].includes(type)) {
        setActiveTab('challenge');
      }
      
      // Allow react to render the tab, then scroll
      setTimeout(() => {
        const idx = blocks.findIndex(b => {
          if (type === 'practice') return b.type === 'practice' || b.type === 'challenge';
          return b.type === type;
        });
        if (idx > -1) {
          const block = blocks[idx];
          const el = document.getElementById(`block-${block.id || idx}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }, 50);
    };

    window.addEventListener('command:next-lesson', handleNextLesson);
    window.addEventListener('command:prev-lesson', handlePrevLesson);
    window.addEventListener('command:ask-ai', handleAskAIEvent);
    
    // Scrollers bindings
    const goTheory = () => handleScrollToBlock('theory');
    const goQuiz = () => handleScrollToBlock('miniquiz');
    const goPractice = () => handleScrollToBlock('practice');

    window.addEventListener('command:tab-theory', goTheory);
    window.addEventListener('command:tab-quiz', goQuiz);
    window.addEventListener('command:tab-practice', goPractice);

    return () => {
      window.removeEventListener('command:next-lesson', handleNextLesson);
      window.removeEventListener('command:prev-lesson', handlePrevLesson);
      window.removeEventListener('command:ask-ai', handleAskAIEvent);
      window.removeEventListener('command:tab-theory', goTheory);
      window.removeEventListener('command:tab-quiz', goQuiz);
      window.removeEventListener('command:tab-practice', goPractice);
    };
  }, [selectedLesson, syllabus, setSelectedLesson, blocks]);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (totalHeight <= 0) return;
      const progressValue = (window.scrollY / totalHeight) * 100;
      setReadingProgress(Math.min(100, progressValue));

      if (progressValue > 90 && !hasReceivedReadingXP) {
        setHasReceivedReadingXP(true);
        audioService.playXp();
        addXP(15);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasReceivedReadingXP, addXP]);

  // Memoize markdown components to prevent re-mounting of InteractiveTheoryIDE during parent re-renders
  const markdownComponents = React.useMemo(() => ({
    code(props: any) {
      const { className, children, ...rest } = props || {};
      const match = /language-(\w+)/.exec(className || '');
      const isPython = match && match[1] === 'python';
      const isInline = !match && typeof children === 'string' && !children.includes('\n');
      
      if (isPython && typeof children === 'string') {
        const trimmedCode = children.trim();
        return (
          <InteractiveTheoryIDE 
            // Use a key that is stable for the specific code block but avoids re-mounting on every render
            key={`ide-${trimmedCode.substring(0, 128)}`}
            initialCode={children} 
            lessonId={selectedLesson.id}
            contextTitle={`Bài học: ${selectedLesson.title}`} 
          />
        );
      }
      
      return !isInline ? (
        <div className="bg-[#1e1e1e] p-4 rounded-xl font-mono text-sm my-4 text-slate-100 overflow-x-auto border border-slate-800 shadow-sm">
          <code className={className} {...rest}>
            {children}
          </code>
        </div>
      ) : (
        <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-xs sm:text-sm text-slate-800 font-semibold" {...rest}>
          {children}
        </code>
      );
    }
  }), [selectedLesson.id, selectedLesson.title]);

  const renderBlockContent = (block: any) => {
    switch (block.type) {
      case 'theory':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Core Theory Markdown */}
            <div className="prose prose-blue max-w-none text-slate-700 font-sans leading-relaxed">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm, remarkBreaks]} 
                rehypePlugins={[rehypeRaw]}
                components={markdownComponents as any}
              >
                {block.content || block.theoryValue || ''}
              </ReactMarkdown>
            </div>

            {/* Python Tricks & Cheat Sheet */}
            <div className="mt-12 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-900 px-6 py-4 flex items-center gap-3">
                <Zap className="w-6 h-6 text-amber-400" />
                <h3 className="text-lg font-black text-white m-0">Bí kíp & Trick Python (Cheat Sheet)</h3>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Column 1 */}
                <div className="space-y-8">
                  <div>
                    <h4 className="flex items-center gap-2 text-blue-700 font-bold mb-4 border-b border-blue-100 pb-2">
                      <Terminal className="w-5 h-5" /> Các hàm thường dùng nhất
                    </h4>
                    <ul className="space-y-4 text-sm">
                      <li className="flex flex-col gap-1">
                        <code className="bg-blue-50 text-blue-700 px-2 py-1 rounded w-fit font-bold border border-blue-100 text-xs">int(x), float(x), str(x)</code>
                        <span className="text-slate-600">Ép kiểu dữ liệu (chuyển đổi chữ thành số và ngược lại).</span>
                      </li>
                      <li className="flex flex-col gap-1">
                        <code className="bg-blue-50 text-blue-700 px-2 py-1 rounded w-fit font-bold border border-blue-100 text-xs">len(s)</code>
                        <span className="text-slate-600">Đếm số lượng phần tử của danh sách (List) hoặc độ dài xâu (String).</span>
                      </li>
                      <li className="flex flex-col gap-1">
                        <code className="bg-blue-50 text-blue-700 px-2 py-1 rounded w-fit font-bold border border-blue-100 text-xs">range(start, stop, step)</code>
                        <span className="text-slate-600">Tạo ra dãy số liên tiếp, cực kỳ hữu ích cho vòng lặp <code>for</code>.</span>
                      </li>
                      <li className="flex flex-col gap-1">
                        <code className="bg-blue-50 text-blue-700 px-2 py-1 rounded w-fit font-bold border border-blue-100 text-xs">type(x)</code>
                        <span className="text-slate-600">Kiểm tra xem dữ liệu cụ thể đó thuộc kiểu gì.</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="flex items-center gap-2 text-indigo-700 font-bold mb-4 border-b border-indigo-100 pb-2">
                      <Layers className="w-5 h-5" /> Mẹo xử lý List (Danh sách)
                    </h4>
                    <ul className="space-y-4 text-sm">
                      <li className="flex items-start gap-3">
                        <code className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded font-bold shrink-0 text-xs">.append(x)</code>
                        <span className="text-slate-600">Thêm 1 phần tử vào cuối danh sách.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <code className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded font-bold shrink-0 text-xs">.insert(i, x)</code>
                        <span className="text-slate-600">Chèn giá trị <code>x</code> vào vị trí số <code>i</code>.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <code className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded font-bold shrink-0 text-xs">.sort()</code>
                        <span className="text-slate-600">Sắp xếp tăng dần. Thêm <code>reverse=True</code> để xếp giảm dần.</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Column 2 */}
                <div className="space-y-6">
                  <div>
                    <h4 className="flex items-center gap-2 text-amber-600 font-bold mb-4 border-b border-amber-100 pb-2">
                      <Code2 className="w-5 h-5" /> Trick viết Code cực ngầu (Pythonic)
                    </h4>
                    
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4 hover:border-amber-300 hover:shadow-md transition-all">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">1. Đổi giá trị 2 biến siêu tốc</span>
                      <code className="block bg-slate-900 border border-slate-700 text-green-400 p-2.5 rounded-lg text-sm mb-2 font-mono">
                        a, b = b, a
                      </code>
                      <span className="text-sm text-slate-600">Không cần tạo thêm biến trung gian <code>temp</code> rườm rà.</span>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4 hover:border-amber-300 hover:shadow-md transition-all">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">2. Cấu trúc IF-ELSE gộp 1 dòng (Ternary)</span>
                      <code className="block bg-slate-900 border border-slate-700 text-green-400 p-2.5 rounded-lg text-sm mb-2 font-mono">
                        kq = "Chẵn" if n % 2 == 0 else "Lẻ"
                      </code>
                      <span className="text-sm text-slate-600">Rút ngắn 4 dòng if-else xuống chỉ còn 1 dòng duy nhất, cực ngầu.</span>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 hover:border-amber-300 hover:shadow-md transition-all">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">3. In mảng sạch đẹp bằng dấu sao *</span>
                      <code className="block bg-slate-900 border border-slate-700 text-green-400 p-2.5 rounded-lg text-sm mb-2 font-mono">
                        arr = [1, 2, 3]<br/>
                        <span className="text-sky-400">print</span>(*arr) <span className="text-slate-500 italic"># Output: 1 2 3</span>
                      </code>
                      <span className="text-sm text-slate-600">Tự động bỏ đi dấu ngoặc vuông và dấu phẩy khi in list ra. Dùng đi thi HSG thì nhàn tênh!</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        );
        
      case 'mindmap':
        return (
          <div className="w-full h-[500px] bg-white rounded-2xl overflow-hidden border border-slate-150 shadow-inner">
            <iframe src={block.url || block.mindmapUrl} width="100%" height="100%" frameBorder="0" allowFullScreen></iframe>
          </div>
        );
        
      case 'simulation':
        return (
          <div className="w-full h-[550px] bg-white rounded-2xl overflow-hidden border border-slate-150 shadow-inner flex flex-col">
            <iframe className="flex-1" src={block.url || block.simulationUrl} width="100%" height="100%" frameBorder="0" allowFullScreen></iframe>
          </div>
        );
        
      case 'game':
        return (
          <div className="p-1">
            {block.game ? (
              <InteractiveGamePlayer game={block.game} />
            ) : (
              <div className="text-slate-400 italic">Trò chơi thiết lập chưa đầy đủ.</div>
            )}
          </div>
        );
        
      case 'flashcards':
        return (
          <div className="p-1">
            <FlashcardsApp lesson={{ ...selectedLesson, flashcards: block.flashcards || selectedLesson.flashcards }} />
          </div>
        );
        
      case 'miniquiz':
        return (
          <div className="p-1">
            <MiniQuiz questions={block.questions || block.miniQuiz || selectedLesson.miniQuiz || []} />
          </div>
        );
        
      case 'practice':
      case 'challenge':
        return (
          <div className="p-1">
            <PracticeIDE 
              prompt={block.prompt || block.labPrompt || ''}
              expectedContent={block.expectedCode || block.labExpectedCode || ''}
              hints={block.hints || block.labPrompt ? `Hãy bám sát các câu lệnh Python in dữ liệu ra Terminal.` : ''}
              onSuccess={() => {
                if (block.type === 'challenge') {
                  completeLesson(selectedLesson.id + '_challenge', 20);
                } else {
                  completeLesson(selectedLesson.id, 10);
                }
              }}
              contextTitle={block.title || `Thực hành: ${selectedLesson.title}`}
            />
          </div>
        );
        
      default:
        return <div className="text-slate-400 italic">Khối nội dung chưa được hỗ trợ tốt nhất.</div>;
    }
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 py-8">
      {/* Navigation and Top Progress Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <button 
          onClick={() => setView('roadmap')}
          className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors self-start"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          <span>Quay lại Lộ trình</span>
        </button>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleSpeak}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              isSpeaking 
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span>{isSpeaking ? 'Dừng đọc' : 'Đọc Lý Thuyết'}</span>
          </button>

          <button 
            onClick={() => setIsAIOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-xs font-bold transition-all shadow-sm"
          >
            <Bot className="w-4 h-4 text-white" />
            <span>AI Tutor</span>
          </button>
        </div>
      </div>

      <div className="bg-slate-50/50 rounded-3xl border border-slate-200 p-4 sm:p-6 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[10px] sm:text-xs uppercase font-extrabold tracking-widest text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">Bài học Lập trình</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">{selectedLesson.title}</h1>
        </div>
        
        {/* Continuous Flow progress bar */}
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="flex flex-col items-end shrink-0">
             <span className="text-xs font-bold text-slate-500 mb-1">Đọc hiểu bài viết ({Math.round(readingProgress)}%)</span>
             <div className="w-32 h-2.5 bg-slate-200 rounded-full overflow-hidden border border-slate-300 shadow-inner">
                <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${readingProgress}%` }}></div>
             </div>
          </div>
          {hasReceivedReadingXP && (
             <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-1 text-amber-600 font-bold text-sm bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
               <Zap className="w-4.5 h-4.5 fill-amber-500 text-amber-500 animate-bounce" /> <span>+15 XP</span>
             </motion.div>
          )}
        </div>
      </div>

      {/* Horizontal Tabs for Tiến trình tự học */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-8 overflow-hidden flex">
        <button 
          onClick={() => {
            audioService.playClick();
            setActiveTab('theory');
          }}
          className={`flex-1 py-4 flex flex-col sm:flex-row items-center justify-center gap-2 transition-all ${activeTab === 'theory' ? 'bg-blue-50 border-b-2 border-blue-600 text-blue-700' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <BookOpen className="w-5 h-5 shrink-0" />
          <span className="font-bold text-sm">1. Lý thuyết</span>
        </button>
        <button 
          onClick={() => {
            audioService.playClick();
            setActiveTab('practice');
          }}
          className={`flex-1 py-4 flex flex-col sm:flex-row items-center justify-center gap-2 transition-all ${activeTab === 'practice' ? 'bg-blue-50 border-b-2 border-blue-600 text-blue-700' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <Code2 className="w-5 h-5 shrink-0" />
          <span className="font-bold text-sm">2. Thực hành</span>
        </button>
        <button 
          onClick={() => {
            audioService.playClick();
            setActiveTab('challenge');
          }}
          className={`flex-1 py-4 flex flex-col sm:flex-row items-center justify-center gap-2 transition-all ${activeTab === 'challenge' ? 'bg-blue-50 border-b-2 border-blue-600 text-blue-700' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <Trophy className="w-5 h-5 shrink-0" />
          <span className="font-bold text-sm">3. Thử thách</span>
        </button>
      </div>

      {/* Mobile-only Table of Contents Ribbon banner */}
      <div className="block lg:hidden mb-8">
        <button 
          onClick={() => setIsDrawerOpen(true)}
          className="w-full bg-blue-50/70 border border-blue-200 hover:bg-blue-100/80 text-blue-700 py-3.5 px-4 rounded-2xl flex items-center justify-between font-black text-xs  transition shadow-xs"
        >
          <div className="flex items-center gap-2">
            <BookOpen className="w-4.5 h-4.5 text-blue-600 animate-pulse" />
            <span>📖 XEM MỤC LỤC & DANH SÁCH BÀI HỌC (TẬP BẢN ĐỒ)</span>
          </div>
          <ChevronRight className="w-4.5 h-4.5 shrink-0" />
        </button>
      </div>

      {/* Main Content Area with Desktop Sidebar & Mobile drawer layout */}
      <div className={`relative lg:grid ${isSidebarPinned ? 'lg:grid-cols-12' : 'lg:grid-cols-1'} lg:gap-8 items-start`}>
        {/* Trigger zone for hover */}
        {!isSidebarPinned && (
          <div 
            className="hidden lg:flex fixed left-0 top-1/3 z-40 bg-white/95 dark:bg-slate-800/95 hover:bg-blue-50 dark:hover:bg-slate-700 border-y border-r border-slate-200 dark:border-slate-700 rounded-r-2xl shadow-xl cursor-pointer transition-all duration-300 pr-2.5 pl-1.5 py-5 items-center justify-center flex-col gap-2 group border-l-0"
            onMouseEnter={() => setIsSidebarHovered(true)}
            onClick={() => setIsSidebarPinned(true)}
            title="Mở Mục Lục Bài Học"
          >
            <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-all duration-300" />
            <span className="text-[10px] font-black text-slate-500 dark:text-slate-300 [writing-mode:vertical-lr] uppercase tracking-wider py-1 select-none">Mục lục bài học</span>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        )}
        
        {/* Desktop Left Sidebar (Mục lục/Dock) */}
        <aside 
          onMouseEnter={() => setIsSidebarHovered(true)}
          onMouseLeave={() => setIsSidebarHovered(false)}
          className={`
            hidden lg:block 
            ${isSidebarPinned ? 'lg:col-span-3 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sticky top-28 shadow-sm transition-all duration-300' : ''}
            ${!isSidebarPinned ? `
              fixed top-28 left-4 bottom-8 w-[340px] 
              bg-white/95 backdrop-blur-xl dark:bg-slate-900/95 
              border border-slate-200/50 dark:border-slate-800/50 
              rounded-3xl p-5 shadow-2xl z-50 
              transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
              ${isSidebarHovered ? 'translate-x-0 opacity-100' : '-translate-x-[110%] opacity-0 pointer-events-none'}
            ` : ''}
          `}
        >
          {renderSyllabusTOC()}
        </aside>

        {/* Right main learning content area */}
        <div className={`${isSidebarPinned ? 'lg:col-span-9' : 'max-w-5xl mx-auto w-full'} space-y-8 transition-all duration-500`}>
          {activeBlocks.length === 0 && (
            <div className="text-center py-12 text-slate-500 italic bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              Không có nội dung cho phần này.
            </div>
          )}
          {activeBlocks.map((block: any, idx: number) => (
            <div 
              id={`block-${block.id || idx}`}
              key={block.id || idx} 
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 hover:shadow-md transition-all shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300 text-left"
            >
              {/* Block Accent Heading */}
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                <span className="text-[10px] uppercase font-extrabold tracking-widest bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 px-3 py-1 rounded-full border border-blue-100 dark:border-slate-750">
                  Phần {blocks.indexOf(block) + 1}: {getBlockTypeName(block.type)}
                </span>
                {block.title && (
                  <h4 className="text-base sm:text-lg font-extrabold text-slate-800 dark:text-slate-100">{block.title}</h4>
                )}
              </div>
              
              {/* Render content directly */}
              {renderBlockContent(block)}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Table of Contents button & slide-over Drawer */}
      <div className="lg:hidden text-left">
        {/* Floating Table of Contents Trigger Button */}
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="fixed bottom-6 left-6 z-40 flex items-center gap-2 px-5 py-3.5 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-full shadow-2xl   transition-all duration-200 border border-white/10 dark:border-slate-200"
        >
          <Menu size={16} />
          <span className="text-xs font-black tracking-wide uppercase">Mục lục bài học</span>
        </button>

        {/* Backdrop for open drawer */}
        <AnimatePresence>
          {isDrawerOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsDrawerOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 pointer-events-auto"
              />
              
              {/* Actual Drawer Slide Panel */}
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 26, stiffness: 220 }}
                className="fixed inset-y-0 left-0 w-[85%] max-w-sm bg-white dark:bg-slate-900 z-50 shadow-2xl p-5 flex flex-col h-full border-r border-slate-200 dark:border-slate-800"
              >
                {/* Header of Drawer */}
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <span className="text-sm font-black text-slate-800 dark:text-white">Danh sách bài học</span>
                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 dark:bg-slate-800 dark:hover:bg-slate-750 dark:text-slate-300 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* TOC Content */}
                <div className="flex-1 overflow-y-auto no-scrollbar">
                  {renderSyllabusTOC()}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Global AI Tutor overlay */}
      <AIAssistant 
        currentCode="" 
        errorMsg=""
        context={`Học sinh đang đọc bài học: ${selectedLesson.title}`}
        isOpen={isAIOpen} 
        onClose={() => setIsAIOpen(false)} 
      />
    </div>
  );
}
