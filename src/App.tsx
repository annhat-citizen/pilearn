/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { AppProvider, useAppContext } from './store';
import { audioService } from './utils/audio';
import { SettingsProvider } from './contexts/SettingsContext';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { GlobalAppearanceEditor } from './components/GlobalAppearanceEditor';
import { Home } from './views/Home';
import { Roadmap } from './views/Roadmap';
import { LessonView } from './views/LessonView';
import { Practice } from './views/Practice';
import { ExamCenter } from './views/ExamCenter';
import { StudentDashboard } from './views/StudentDashboard';
import { TeacherDashboard } from './views/TeacherDashboard';
import { AdminDashboard } from './views/AdminDashboard';
import { GameDeveloperDashboard } from './views/GameDeveloperDashboard';
import { AboutUs } from './views/AboutUs';
import { CompleteProfileModal } from './components/CompleteProfileModal';
import { SettingsModal } from './components/SettingsModal';
import { Story } from './views/Story';
import { Privacy } from './views/Privacy';
import { Terms } from './views/Terms';
import { HelpCenter } from './views/HelpCenter';
import { Shop } from './views/Shop';
import { BossBattle } from './views/BossBattle';
import { Docs } from './views/Docs';
import { Safety } from './views/Safety';
import { LevelUpPopup } from './components/LevelUpPopup';
import { StreakPopup } from './components/StreakPopup';
import { CommandPalette } from './components/CommandPalette';
import { BackgroundMusicPlayer } from './components/BackgroundMusicPlayer';
import { motion, AnimatePresence } from 'motion/react';
import { Sun, Moon } from 'lucide-react';
import { PromoBanner } from './components/PromoBanner';

function MainLayout() {
  const { view, updateStudyTime, nocodeConfig, isEditMode } = useAppContext();
  const [isAppearanceEditorOpen, setIsAppearanceEditorOpen] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  
  // Apply Appearance
  useEffect(() => {
    const appearance = nocodeConfig?.appearance;
    if (!appearance) return;

    let styleTag = document.getElementById('dynamic-nocode-style-tag') as HTMLStyleElement;
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'dynamic-nocode-style-tag';
      document.head.appendChild(styleTag);
    }

    const fontValue = 
      appearance.fontFamily === 'mono' ? '"JetBrains Mono", monospace' : 
      appearance.fontFamily === 'grotesk' ? '"Space Grotesk", sans-serif' :
      appearance.fontFamily === 'serif' ? '"Playfair Display", serif' :
      '"Quicksand", sans-serif';

    const borderRadiusValue = 
      appearance.borderRadius === 'none' ? '0px' :
      appearance.borderRadius === 'md' ? '8px' :
      appearance.borderRadius === '2xl' ? '16px' :
      '24px'; // 3xl / default

    styleTag.innerHTML = `
      :root {
        --color-blue-600: ${appearance.primaryColor} !important;
        --color-blue-700: ${appearance.primaryColor}d0 !important;
        --color-blue-500: ${appearance.primaryColor}ef !important;
        --font-sans: ${fontValue} !important;
        --font-bold: ${appearance.fontFamily === 'sans' ? '"Fredoka", sans-serif' : fontValue} !important;
      }
      body {
        background: linear-gradient(135deg, #d8b4fe 0%, #ffccaa 50%, #fef08a 100%) !important;
        background-attachment: fixed !important;
        font-family: ${fontValue} !important;
      }
      .bg-white, .dark .bg-white {
        background-color: ${appearance.backgroundColor === '#fffbf0' ? '#ffffff' : appearance.backgroundColor}ef !important;
      }
      .rounded-xl, .rounded-2xl, .rounded-3xl {
        border-radius: ${borderRadiusValue} !important;
      }
    `;
  }, [nocodeConfig.appearance]);

  useEffect(() => {
    const interval = setInterval(() => {
      updateStudyTime(60);
    }, 60000);
    return () => clearInterval(interval);
  }, [updateStudyTime]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      setMousePos({ x, y });
    };
    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => window.removeEventListener('mousemove', handleGlobalMouseMove);
  }, []);

  // Initialize AOS (Animate On Scroll) globally via CDN scripts defined in index.html
  useEffect(() => {
    if (typeof (window as any).AOS !== 'undefined') {
      (window as any).AOS.init({
        duration: 1800,
        once: false,
        mirror: true,
        offset: 80,
      });
    }
  }, []);

  // Refresh AOS elements whenever user switches views / pages
  useEffect(() => {
    if (typeof (window as any).AOS !== 'undefined') {
      const timer = setTimeout(() => {
        (window as any).AOS.refresh();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [view]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  // Define layout colors based on theme and view
  const baseLayoutClass = view === 'home' 
    ? 'bg-[#030712] text-slate-100 dark:bg-[#030712] dark:text-gray-100' 
    : 'bg-[#fffbf0] dark:bg-slate-900 text-slate-900 dark:text-gray-100';

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Heuristic to detect button-like elements
      if (
        target.tagName === 'BUTTON' || 
        target.closest('button') || 
        target.classList.contains('cursor-pointer') ||
        target.dataset.interactive === 'true' // Optional: allow explicit marking
      ) {
        audioService.playClick();
      }
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  return (
    <div className={`min-h-[100vh] flex flex-col font-sans transition-colors duration-500 relative overflow-hidden ${baseLayoutClass}`}>
      <PromoBanner />
      {/* Dark Mode Toggle Button */}
      <button 
        onClick={toggleDarkMode}
        className="tutorial-step-4 fixed bottom-6 right-6 z-50 p-3 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-md text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 shadow-lg hover:scale-110 transition-transform"
        aria-label="Toggle Dark Mode"
      >
        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      {/* Interactive Global Background (only visible when not on home video) */}
      {view !== 'home' && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
           {/* Soft base gradients */}
           <div className="absolute -top-[20%] -right-[10%] w-[50rem] h-[50rem] bg-pink-100/30 dark:bg-pink-900/10 rounded-full blur-[100px]" />
           <div className="absolute -bottom-[20%] -left-[10%] w-[60rem] h-[60rem] bg-blue-100/30 dark:bg-blue-900/10 rounded-full blur-[120px]" />
           
           {/* Active mouse follower glow */}
           <div 
             className="absolute w-[40rem] h-[40rem] bg-blue-300/10 dark:bg-blue-400/5 rounded-full blur-[80px] transition-transform duration-200 ease-out z-0" 
             style={{ transform: `translate(calc(${mousePos.x}vw - 20rem), calc(${mousePos.y}vh - 20rem))` }}
           />
           <div 
             className="absolute w-[30rem] h-[30rem] bg-indigo-300/10 dark:bg-indigo-400/5 rounded-full blur-[80px] transition-transform duration-500 ease-out z-0" 
             style={{ transform: `translate(calc(${mousePos.x}vw - 15rem), calc(${mousePos.y}vh - 15rem))` }}
           />
        </div>
      )}

      <div className="relative z-10 flex flex-col flex-1 min-h-screen">
        <Navigation />
        <main className="flex-1 relative pb-24 flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="w-full h-full flex flex-col flex-1"
            >
              {view === 'home' && <Home />}
              {view === 'roadmap' && <Roadmap />}
              {view === 'lesson' && <LessonView />}
              {view === 'practice' && <Practice />}
              {view === 'exams' && <ExamCenter />}
              {view === 'student-dashboard' && <StudentDashboard />}
              {view === 'teacher-dashboard' && <TeacherDashboard />}
              {view === 'admin-dashboard' && <AdminDashboard />}
              {view === 'game-developer-dashboard' && <GameDeveloperDashboard />}
              {view === 'about' && <AboutUs />}
              {view === 'story' && <Story />}
              {view === 'privacy' && <Privacy />}
              {view === 'terms' && <Terms />}
              {view === 'help' && <HelpCenter />}
              {view === 'shop' && <Shop />}
              {view === 'boss-battle' && <BossBattle />}
              {view === 'docs' && <Docs />}
              {view === 'safety' && <Safety />}
            </motion.div>
          </AnimatePresence>
        </main>
        {view !== 'home' && (
          <div className="mt-20"></div>
        )}
        <Footer />
      </div>
      {isAppearanceEditorOpen && <GlobalAppearanceEditor onClose={() => setIsAppearanceEditorOpen(false)} />}
      <CompleteProfileModal />
      <LevelUpPopup />
      <StreakPopup />
      <CommandPalette />
      <BackgroundMusicPlayer />
    </div>
  );
}


export default function App() {
  return (
    <SettingsProvider>
      <AppProvider>
        <MainLayout />
        <SettingsModal />
      </AppProvider>
    </SettingsProvider>
  );
}

