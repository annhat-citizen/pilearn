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
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

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
      '"Inter", sans-serif';

    const borderRadiusValue = 
      appearance.borderRadius === 'none' ? '0px' :
      appearance.borderRadius === 'md' ? '8px' :
      appearance.borderRadius === '2xl' ? '16px' :
      '24px';

    styleTag.innerHTML = `
      :root {
        --color-primary-500: ${appearance.primaryColor} !important;
        --color-primary-600: ${appearance.primaryColor}d0 !important;
        --color-primary-400: ${appearance.primaryColor}ef !important;
        --font-sans: ${fontValue} !important;
        --font-bold: ${appearance.fontFamily === 'sans' ? '"Plus Jakarta Sans", sans-serif' : fontValue} !important;
      }
      body {
        background: #0f172a !important;
        color: #f1f5f9 !important;
        font-family: ${fontValue} !important;
      }
      .bg-white, .dark .bg-white {
        background-color: rgba(15, 23, 42, 0.75) !important;
        backdrop-filter: blur(16px) !important;
        border: 1px solid rgba(255, 255, 255, 0.08) !important;
        color: #f1f5f9 !important;
      }
      .text-slate-900, .text-gray-900, .text-slate-800 {
        color: #f1f5f9 !important;
      }
      .border-gray-200, .border-slate-200, .border-gray-100 {
        border-color: rgba(255, 255, 255, 0.08) !important;
      }
      input, select, textarea {
        background-color: rgba(15, 23, 42, 0.7) !important;
        border-color: rgba(255, 255, 255, 0.1) !important;
        color: #f1f5f9 !important;
      }
      input::placeholder, textarea::placeholder {
        color: #64748b !important;
      }
      .rounded-xl, .rounded-2xl, .rounded-3xl {
        border-radius: ${borderRadiusValue} !important;
      }
    `;
  }, [nocodeConfig.appearance]);

  useEffect(() => {
    const interval = setInterval(() => updateStudyTime(60), 60000);
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

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  const layoutBg = isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-[#f8fafc] text-slate-900';

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'BUTTON' || 
        target.closest('button') || 
        target.classList.contains('cursor-pointer') ||
        target.dataset.interactive === 'true'
      ) {
        audioService.playClick();
      }
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${layoutBg}`}>
      <PromoBanner />
      <button 
        onClick={toggleDarkMode}
        className="fixed bottom-6 right-6 z-50 p-3 rounded-xl bg-white dark:bg-slate-800 shadow-lg border border-gray-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:scale-105 transition-transform"
        aria-label="Toggle Dark Mode"
      >
        {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div className="relative z-10 flex flex-col flex-1">
        <Navigation />
        <main className="flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="flex-1 flex flex-col"
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
        <Footer />
      </div>
      <GlobalAppearanceEditor onClose={() => setIsAppearanceEditorOpen(false)} />
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
