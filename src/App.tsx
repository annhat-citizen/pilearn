import { useEffect } from 'react';
import { AppProvider, useAppContext } from './store';
import { audioService } from './utils/audio';
import { SettingsProvider } from './contexts/SettingsContext';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
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
import { PromoBanner } from './components/PromoBanner';

function MainLayout() {
  const { view, updateStudyTime } = useAppContext();

  useEffect(() => {
    const id = setInterval(() => updateStudyTime(60), 60000);
    return () => clearInterval(id);
  }, [updateStudyTime]);

  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (t.tagName === 'BUTTON' || t.closest('button') || t.classList.contains('cursor-pointer') || t.dataset.interactive === 'true') {
        audioService.playClick();
      }
    };
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      <PromoBanner />

      <div className="flex flex-col flex-1">
        <Navigation />
        <main className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div key={view}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
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
