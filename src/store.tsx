import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { ViewState, Role, ProgressState, Lesson, Chapter, ShopItem, Boss } from './types';
import { SYLLABUS as defaultSyllabus } from './data';
import { audioService } from './utils/audio';
import { NoCodeConfig, getLocalNoCodeConfig } from './lib/nocode_store';
import * as sb from './lib/supabase';

interface AppContextType {
  view: ViewState;
  setView: (view: ViewState) => void;
  role: Role;
  authUser: null;
  profile: { id: string; display_name: string; avatar_url: string; role: Role; xp: number };
  login: () => void;
  logout: () => void;
  
  selectedLesson: Lesson | null;
  setSelectedLesson: (lesson: Lesson | null) => void;
  progress: ProgressState;
  completeLesson: (lessonId: string, points: number) => void;
  addXP: (amount: number) => void;
  submitExam: (examId: string, score: number) => void;
  buyItem: (itemId: string, price: number) => void;
  attackBoss: (bossId: string, itemId: string, damage: number) => void;
  teacherAdjustPoints: (studentId: string, projectId: string, points: number, note: string) => void;
  isDataLoaded: boolean;
  syllabus: Chapter[];
  
  shopItems: ShopItem[];
  bosses: Boss[];
  updateGameData: (items: ShopItem[], bosses: Boss[]) => Promise<void>;
  recordStudyActivity: () => void;
  dismissStreakPopup: () => void;
  updateStudyTime: (seconds: number) => void;
  updateProgress?: (updater: (prev: ProgressState) => ProgressState) => void;
  isEditMode: boolean;
  setIsEditMode: (mode: boolean) => void;
  nocodeConfig: NoCodeConfig;
}

const defaultProgress: ProgressState = {
  completedLessons: [],
  points: 0,
  xp: 0,
  inventory: {},
  bossHp: {},
  examScores: {},
  teacherAdjustments: [],
  streak: 0,
  lastActiveDate: '',
  streakHistory: [],
  showStreakPopup: false,
  studyTime: 0,
};

const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getDaysDifference = (date1Str: string, date2Str: string) => {
  if (!date1Str || !date2Str) return 0;
  const [y1, m1, d1] = date1Str.split('-').map(Number);
  const [y2, m2, d2] = date2Str.split('-').map(Number);
  const date1 = new Date(y1, m1 - 1, d1);
  const date2 = new Date(y2, m2 - 1, d2);
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

const LOCAL_USER_ID = 'local-user-001';
const LOCAL_PROFILE = { id: LOCAL_USER_ID, display_name: 'Học viên', avatar_url: '', role: 'student' as Role, xp: 0 };

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [view, setView] = useState<ViewState>('home');
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [syllabus, setSyllabus] = useState<Chapter[]>(defaultSyllabus);

  const [shopItems, setShopItems] = useState<ShopItem[]>([
    { id: 'sword_wood', name: 'Kiếm Gỗ Tập Sự', description: 'Gây 15 sát thương cơ bản cho quái sơ cấp.', price: 40, damage: 15, icon: 'Sword', color: 'bg-amber-500' },
    { id: 'sword_iron', name: 'Kiếm Sắt Cứng Cáp', description: 'Rèn đúc từ quặng thô, gây 40 sát thương.', price: 120, damage: 40, icon: 'Sword', color: 'bg-slate-400' },
    { id: 'sword_fire', name: 'Kiếm Lửa Hoả Long', description: 'Thiêu rụi Bug tức thì với 120 sát thương cực mạnh.', price: 350, damage: 120, icon: 'Zap', color: 'bg-red-500' },
    { id: 'wand_magic', name: 'Gậy Thần Kỳ Diệu', description: 'Giải phóng phép thuật Python gây 260 sát thương.', price: 650, damage: 260, icon: 'Star', color: 'bg-purple-500' },
    { id: 'sword_dragon', name: 'Thần Kiếm Diệt Rồng [PRO]', description: 'Trang bị Độc tôn dành riêng cho Pro, chém bay 650 HP.', price: 1000, damage: 650, icon: 'Sword', color: 'bg-yellow-500' },
    { id: 'armor_cloth', name: 'Giáp Vải Phổ Thông', description: 'Mũ giáp cơ bản chắn đòn, giảm 15% phản sát thương.', price: 60, damage: 0, icon: 'Shield', color: 'bg-emerald-400' },
    { id: 'armor_iron', name: 'Giáp Thép Kiên Cố', description: 'Dày dặn bảo vệ cơ thể, giảm 40% phản sát thương.', price: 200, damage: 0, icon: 'Shield', color: 'bg-sky-500' },
    { id: 'armor_god', name: 'Long Thần Hải Giáp [PRO]', description: 'Giáp Thần khí tối thượng giảm 80% lực phản công.', price: 500, damage: 0, icon: 'Shield', color: 'bg-orange-500' },
    { id: 'potion_health', name: 'Bình Máu Tái Sinh', description: 'Hồi phục phao cứu sinh +150 HP lập tức khi chiến đấu.', price: 30, damage: 0, icon: 'Heart', color: 'bg-rose-500' },
    { id: 'potion_exp', name: 'Bình EXP Siêu Tốc', description: 'Nạp ngay +120 điểm kinh nghiệm thăng cấp thần tốc.', price: 80, damage: 0, icon: 'Zap', color: 'bg-cyan-500' },
    { id: 'potion_rage', name: 'Nước Tăng Lực Cuồng Nộ', description: 'Nhân gấp 2.0x sát thương cú chém vũ khí tiếp theo.', price: 70, damage: 0, icon: 'Star', color: 'bg-purple-600' },
  ]);
  const [bosses, setBosses] = useState<Boss[]>([
    { id: 'boss_1', name: 'Quái Vật Lười Biếng', maxHp: 500, image: '👾' },
    { id: 'boss_2', name: 'Rồng Mất Tập Trung', maxHp: 1500, image: '🐉' },
    { id: 'boss_3', name: 'Chúa Tể Bug', maxHp: 5000, image: '🐛' },
    { id: 'boss_pro', name: 'Trợ Lý AI Hắc Ám', maxHp: 10000, image: '🧙‍♂️' },
  ]);

  const [progress, setProgress] = useState<ProgressState>(() => {
    try {
      const saved = localStorage.getItem('pilearn_progress');
      if (saved) return JSON.parse(saved);
    } catch {}
    return defaultProgress;
  });

  const [isEditMode, setIsEditMode] = useState(false);
  const [nocodeConfig, setNocodeConfig] = useState<NoCodeConfig>(() => getLocalNoCodeConfig());

  useEffect(() => {
    const handleSync = () => setNocodeConfig(getLocalNoCodeConfig());
    window.addEventListener('pilearn_config_sync', handleSync);
    return () => window.removeEventListener('pilearn_config_sync', handleSync);
  }, []);

  useEffect(() => {
    localStorage.setItem('pilearn_progress', JSON.stringify(progress));
  }, [progress]);

  // Level up sound
  const lastLevel = useRef(Math.floor((progress.xp || 0) / 100) + 1);
  useEffect(() => {
    const currentLevel = Math.floor((progress.xp || 0) / 100) + 1;
    if (currentLevel > lastLevel.current) audioService.playLevelUp();
    lastLevel.current = currentLevel;
  }, [progress.xp]);

  // Streak reset after 3 days inactivity
  useEffect(() => {
    const today = getTodayDateString();
    if (progress.lastActiveDate && progress.streak && progress.streak > 0) {
      if (getDaysDifference(progress.lastActiveDate, today) > 3) {
        setProgress(prev => ({ ...prev, streak: 0 }));
      }
    }
  }, []);

  // Try loading data from Supabase (optional — fallback to defaults if tables don't exist)
  useEffect(() => {
    const load = async () => {
      try {
        const [items, bossesData] = await Promise.all([sb.getShopItems(), sb.getBosses()]);
        if (items.length > 0) {
          setShopItems(items.map(i => ({
            id: i.id, name: i.name, description: i.description, price: i.price, damage: i.damage,
            icon: i.type === 'weapon' ? 'Sword' : i.type === 'armor' ? 'Shield' : 'Heart',
            color: i.type === 'weapon' ? 'bg-red-500' : i.type === 'armor' ? 'bg-blue-500' : 'bg-rose-500',
          })));
        }
        if (bossesData.length > 0) {
          setBosses(bossesData.map(b => ({ id: b.id, name: b.name, maxHp: b.max_hp, image: b.emoji })));
        }
      } catch {}
      setIsDataLoaded(true);
    };
    load();
  }, []);

  // ============================================================
  // Actions
  // ============================================================
  const login = () => {};
  const logout = () => {};

  const completeLesson = (lessonId: string, pointsEarned: number) => {
    setProgress(prev => {
      const today = getTodayDateString();
      const lastActive = prev.lastActiveDate || '';
      const updatedHistory = [...(prev.streakHistory || [])];
      if (!updatedHistory.includes(today)) updatedHistory.push(today);
      let newStreak = prev.streak || 0;
      let showPopup = false;
      if (!lastActive) { newStreak = 1; showPopup = true; }
      else if (lastActive !== today) {
        newStreak = getDaysDifference(lastActive, today) > 3 ? 1 : newStreak + 1;
        showPopup = true;
      }
      const safe = prev.completedLessons || [];
      const done = safe.includes(lessonId);
      return {
        ...prev, completedLessons: done ? safe : [...safe, lessonId],
        points: (prev.points || 0) + (done ? 0 : pointsEarned),
        xp: (prev.xp || 0) + (done ? 0 : pointsEarned * 10),
        streak: newStreak, lastActiveDate: today, streakHistory: updatedHistory,
        showStreakPopup: showPopup,
      };
    });
  };

  const addXP = (amount: number) => setProgress(prev => ({ ...prev, xp: (prev.xp || 0) + amount }));
  const submitExam = (examId: string, score: number) => {
    setProgress(prev => {
      const today = getTodayDateString();
      const lastActive = prev.lastActiveDate || '';
      const updatedHistory = [...(prev.streakHistory || [])];
      if (!updatedHistory.includes(today)) updatedHistory.push(today);
      let newStreak = prev.streak || 0;
      let showPopup = false;
      if (!lastActive) { newStreak = 1; showPopup = true; }
      else if (lastActive !== today) {
        newStreak = getDaysDifference(lastActive, today) > 3 ? 1 : newStreak + 1;
        showPopup = true;
      }
      return {
        ...prev, examScores: { ...prev.examScores, [examId]: score },
        points: (prev.points || 0) + Math.floor(score / 5),
        xp: (prev.xp || 0) + score, streak: newStreak, lastActiveDate: today,
        streakHistory: updatedHistory, showStreakPopup: showPopup,
      };
    });
  };

  const recordStudyActivity = () => {
    setProgress(prev => {
      const today = getTodayDateString();
      const lastActive = prev.lastActiveDate || '';
      const updatedHistory = [...(prev.streakHistory || [])];
      if (!updatedHistory.includes(today)) updatedHistory.push(today);
      if (!lastActive) return { ...prev, streak: 1, lastActiveDate: today, streakHistory: updatedHistory, showStreakPopup: true };
      if (lastActive === today) return { ...prev, streakHistory: updatedHistory };
      return {
        ...prev,
        streak: getDaysDifference(lastActive, today) > 3 ? 1 : (prev.streak || 0) + 1,
        lastActiveDate: today, streakHistory: updatedHistory, showStreakPopup: true,
      };
    });
  };

  const dismissStreakPopup = () => setProgress(prev => ({ ...prev, showStreakPopup: false }));
  const updateStudyTime = (seconds: number) => setProgress(prev => ({ ...prev, studyTime: (prev.studyTime || 0) + seconds }));

  const buyItem = (itemId: string, price: number) => {
    setProgress(prev => {
      if ((prev.points || 0) < price) return prev;
      return { ...prev, points: prev.points - price, inventory: { ...prev.inventory, [itemId]: (prev.inventory?.[itemId] || 0) + 1 } };
    });
  };

  const attackBoss = (bossId: string, itemId: string, damage: number) => {
    setProgress(prev => {
      if (!prev.inventory?.[itemId]) return prev;
      return {
        ...prev,
        inventory: { ...prev.inventory, [itemId]: prev.inventory[itemId] - 1 },
        bossHp: { ...prev.bossHp, [bossId]: Math.max(0, (prev.bossHp?.[bossId] ?? 1000) - damage) },
      };
    });
  };

  const teacherAdjustPoints = (studentId: string, projectId: string, points: number, note: string) => {
    setProgress(prev => ({
      ...prev, points: prev.points + points,
      teacherAdjustments: [...(prev.teacherAdjustments || []), { studentId, projectId, points, note }],
    }));
  };

  const updateProgress = (updater: (prev: ProgressState) => ProgressState) => setProgress(prev => updater(prev));
  const updateGameData = async (items: ShopItem[], newBosses: Boss[]) => { setShopItems(items); setBosses(newBosses); };

  return (
    <AppContext.Provider
      value={{
        view, setView, role: 'student', authUser: null, profile: LOCAL_PROFILE, login, logout,
        selectedLesson, setSelectedLesson,
        progress, completeLesson, addXP, submitExam, buyItem, attackBoss, teacherAdjustPoints,
        updateProgress,
        isDataLoaded, syllabus,
        shopItems, bosses, updateGameData,
        recordStudyActivity, dismissStreakPopup, updateStudyTime, isEditMode, setIsEditMode,
        nocodeConfig,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
