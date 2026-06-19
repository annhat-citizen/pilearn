import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { ViewState, Role, ProgressState, Lesson, Chapter, ShopItem, Boss } from './types';
import { auth, db, handleFirestoreError, OperationType } from './lib/firebase';
import { onAuthStateChanged, User, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp, updateDoc, collection, query, getDocs } from 'firebase/firestore';
import { SYLLABUS as defaultSyllabus } from './data';
import { audioService } from './utils/audio';
import { NoCodeConfig, getLocalNoCodeConfig } from './lib/nocode_store';

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: Role;
  points: number;
  classId?: string;
}

interface AppContextType {
  view: ViewState;
  setView: (view: ViewState) => void;
  role: Role;
  authUser: User | null;
  profile: UserProfile | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  
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
  isAppearanceEditorOpen: boolean;
  setIsAppearanceEditorOpen: (open: boolean) => void;
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
  studyTime: 0
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

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [view, setView] = useState<ViewState>('home');
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
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
    { id: 'potion_rage', name: 'Nước Tăng Lực Cuồng Nộ', description: 'Nhân gấp 2.0x sát thương cú chém vũ khí tiếp theo.', price: 70, damage: 0, icon: 'Star', color: 'bg-purple-600' }
  ]);
  const [bosses, setBosses] = useState<Boss[]>([
    { id: 'boss_1', name: 'Quái Vật Lười Biếng', maxHp: 500, image: '👾' },
    { id: 'boss_2', name: 'Rồng Mất Tập Trung', maxHp: 1500, image: '🐉' },
    { id: 'boss_3', name: 'Chúa Tể Bug', maxHp: 5000, image: '🐛' },
    { id: 'boss_pro', name: 'Trợ Lý AI Hắc Ám', maxHp: 10000, image: '🧙‍♂️' }
  ]);

  const role: Role = profile?.role || 'student';

  // Load local progress for now (later can be migrated to Firestore)
  const [progress, setProgress] = useState<ProgressState>(() => {
    try {
      const saved = localStorage.getItem('python_lms_progress');
      if (saved) return JSON.parse(saved);
    } catch {}
    return defaultProgress;
  });

  const [isEditMode, setIsEditMode] = useState(false);
  const [isAppearanceEditorOpen, setIsAppearanceEditorOpen] = useState(false);
  const [nocodeConfig, setNocodeConfig] = useState<NoCodeConfig>(() => getLocalNoCodeConfig());

  useEffect(() => {
    const handleSync = () => setNocodeConfig(getLocalNoCodeConfig());
    window.addEventListener('pilearn_config_sync', handleSync);
    return () => window.removeEventListener('pilearn_config_sync', handleSync);
  }, []);

  useEffect(() => {
    localStorage.setItem('python_lms_progress', JSON.stringify(progress));
  }, [progress]);

  // Level up sound effect
  const lastLevel = useRef(Math.floor((progress.xp || 0) / 100) + 1);
  useEffect(() => {
    const currentLevel = Math.floor((progress.xp || 0) / 100) + 1;
    if (currentLevel > lastLevel.current) {
      audioService.playLevelUp();
    }
    lastLevel.current = currentLevel;
  }, [progress.xp]);

  useEffect(() => {
    const today = getTodayDateString();
    if (progress.lastActiveDate && progress.streak && progress.streak > 0) {
      const diff = getDaysDifference(progress.lastActiveDate, today);
      if (diff > 3) {
        setProgress(prev => ({
          ...prev,
          streak: 0
        }));
      }
    }
  }, []);

  useEffect(() => {
    if (!authUser) {
      setSyllabus(JSON.parse(JSON.stringify(defaultSyllabus)));
      return;
    }

    let unsubscribeLessons = () => {};
    let unsubscribeChapters = () => {};

    const qLessons = query(collection(db, 'lessons'));
    const qChapters = query(collection(db, 'chapters'));

    const loadData = () => {
       unsubscribeChapters = onSnapshot(qChapters, (chapterSnap) => {
          const customChapters: any[] = [];
          chapterSnap.forEach(doc => customChapters.push({ id: doc.id, ...doc.data(), lessons: [] }));
          
          unsubscribeLessons = onSnapshot(qLessons, (lessonSnap) => {
             const customLessons: any[] = [];
             lessonSnap.forEach(doc => {
               const data = doc.data();
               if (role === 'student' && data.targetClassIds && data.targetClassIds.length > 0) {
                 if (!profile?.classId || !data.targetClassIds.includes(profile.classId)) {
                   return; // Skip this lesson for this student
                 }
               }
               customLessons.push({ id: doc.id, ...data });
             });

             const cloned = JSON.parse(JSON.stringify(defaultSyllabus)) as Chapter[];
             
             // Merge custom chapters
             customChapters.forEach(cc => {
                const existingIdx = cloned.findIndex(c => c.id === cc.id);
                if (existingIdx > -1) {
                   cloned[existingIdx].title = cc.title || cloned[existingIdx].title;
                   cloned[existingIdx].description = cc.description || cloned[existingIdx].description;
                } else {
                   cloned.push(cc as Chapter);
                }
             });

             // Merge or append custom lessons
             customLessons.forEach(cl => {
               const chapter = cloned.find(c => c.id === cl.chapterId);
               if (chapter) {
                 const existingIndex = chapter.lessons.findIndex(l => l.id === cl.id);
                 if (existingIndex > -1) {
                   // Prevent outdated database overrides for l16 & l18 from hiding the interactive PiLearn layout
                   const isLegacyOutdatedOverride = (cl.id === 'l16' || cl.id === 'l18') && 
                     (!cl.theory || typeof cl.theory !== 'string' || !cl.theory.includes('Triết Lý Học Chuẩn PiLearn'));

                   if (isLegacyOutdatedOverride) {
                     chapter.lessons[existingIndex] = { 
                       ...chapter.lessons[existingIndex], 
                       ...cl, 
                       theory: chapter.lessons[existingIndex].theory,
                       blocks: chapter.lessons[existingIndex].blocks 
                     } as Lesson;
                   } else {
                     chapter.lessons[existingIndex] = { ...chapter.lessons[existingIndex], ...cl } as Lesson;
                   }
                 } else {
                   chapter.lessons.push(cl as Lesson);
                 }
               }
             });
             setSyllabus(cloned);
          }, (err) => console.error(err));
       }, (err) => console.error(err));
    };

    loadData();

    return () => {
       unsubscribeChapters();
       unsubscribeLessons();
    };
  }, [role, profile?.classId, authUser]);

  useEffect(() => {
    let unsubProfile = () => {};
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      setAuthUser(user);
      if (user) {
        // Read user profile
        const userRef = doc(db, 'users', user.uid);
        try {
          const snap = await getDoc(userRef);
          if (!snap.exists()) {
            await setDoc(userRef, {
              email: user.email,
              displayName: user.displayName || 'Học viên',
              role: 'student',
              points: 0,
              createdAt: serverTimestamp()
            });
          }
          
          // Listen to updates
          unsubProfile = onSnapshot(userRef, async (docSnap) => {
             if (docSnap.exists()) {
               const data = docSnap.data();
               const currentProfile = { uid: docSnap.id, ...data } as UserProfile;
               
               setProfile(currentProfile);
             } else {
               setProfile(null);
             }
             setIsDataLoaded(true);
          }, (err) => {
             handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
             setIsDataLoaded(true);
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
          setIsDataLoaded(true);
        }
      } else {
        unsubProfile();
        setProfile(null);
        setIsDataLoaded(true);
      }
    });

    return () => {
      unsubAuth();
      unsubProfile();
    };
  }, []);

  const login = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (e) {
      console.error(e);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const completeLesson = (lessonId: string, pointsEarned: number) => {
    setProgress(prev => {
      const today = getTodayDateString();
      const lastActive = prev.lastActiveDate || '';
      
      const updatedHistory = prev.streakHistory ? [...prev.streakHistory] : [];
      if (!updatedHistory.includes(today)) {
        updatedHistory.push(today);
      }

      let newStreak = (prev.streak || 0);
      let showPopup = false;
      if (!lastActive) {
        newStreak = 1;
        showPopup = true;
      } else if (lastActive !== today) {
        const diff = getDaysDifference(lastActive, today);
        if (diff > 3) {
          newStreak = 1;
        } else {
          newStreak += 1;
        }
        showPopup = true;
      }

      const safeCompletedLessons = prev.completedLessons || [];
      const alreadyCompleted = safeCompletedLessons.includes(lessonId);

      return {
        ...prev,
        completedLessons: alreadyCompleted ? safeCompletedLessons : [...safeCompletedLessons, lessonId],
        points: (prev.points || 0) + (alreadyCompleted ? 0 : pointsEarned),
        xp: (prev.xp || 0) + (alreadyCompleted ? 0 : pointsEarned * 10),
        streak: newStreak,
        lastActiveDate: today,
        streakHistory: updatedHistory,
        showStreakPopup: showPopup
      };
    });
  };

  const addXP = (amount: number) => {
    setProgress(prev => ({
      ...prev,
      xp: (prev.xp || 0) + amount
    }));
  };

  const submitExam = (examId: string, score: number) => {
    setProgress(prev => {
      const today = getTodayDateString();
      const lastActive = prev.lastActiveDate || '';
      
      const updatedHistory = prev.streakHistory ? [...prev.streakHistory] : [];
      if (!updatedHistory.includes(today)) {
        updatedHistory.push(today);
      }

      let newStreak = (prev.streak || 0);
      let showPopup = false;
      if (!lastActive) {
        newStreak = 1;
        showPopup = true;
      } else if (lastActive !== today) {
        const diff = getDaysDifference(lastActive, today);
        if (diff > 3) {
          newStreak = 1;
        } else {
          newStreak += 1;
        }
        showPopup = true;
      }

      return {
        ...prev,
        examScores: { ...prev.examScores, [examId]: score },
        points: (prev.points || 0) + Math.floor(score / 5),
        xp: (prev.xp || 0) + score,
        streak: newStreak,
        lastActiveDate: today,
        streakHistory: updatedHistory,
        showStreakPopup: showPopup
      };
    });
  };

  const recordStudyActivity = () => {
    setProgress(prev => {
      const today = getTodayDateString();
      const lastActive = prev.lastActiveDate || '';
      
      const updatedHistory = prev.streakHistory ? [...prev.streakHistory] : [];
      if (!updatedHistory.includes(today)) {
        updatedHistory.push(today);
      }

      if (!lastActive) {
        return {
          ...prev,
          streak: 1,
          lastActiveDate: today,
          streakHistory: updatedHistory,
          showStreakPopup: true
        };
      }

      if (lastActive === today) {
        return {
          ...prev,
          streakHistory: updatedHistory
        };
      }

      const diff = getDaysDifference(lastActive, today);
      let newStreak = (prev.streak || 0);

      if (diff > 3) {
        newStreak = 1;
      } else {
        newStreak += 1;
      }

      return {
        ...prev,
        streak: newStreak,
        lastActiveDate: today,
        streakHistory: updatedHistory,
        showStreakPopup: true
      };
    });
  };

  const dismissStreakPopup = () => {
    setProgress(prev => ({
      ...prev,
      showStreakPopup: false
    }));
  };

  const updateStudyTime = (seconds: number) => {
    setProgress(prev => ({
      ...prev,
      studyTime: (prev.studyTime || 0) + seconds
    }));
  };

  const buyItem = (itemId: string, price: number) => {
    setProgress(prev => {
      if ((prev.points || 0) < price) return prev;
      return {
        ...prev,
        points: prev.points - price,
        inventory: {
          ...prev.inventory,
          [itemId]: (prev.inventory?.[itemId] || 0) + 1
        }
      };
    });
  };

  const attackBoss = (bossId: string, itemId: string, damage: number) => {
    setProgress(prev => {
      if (!prev.inventory || !prev.inventory[itemId]) return prev;
      return {
        ...prev,
        inventory: {
          ...prev.inventory,
          [itemId]: prev.inventory[itemId] - 1
        },
        bossHp: {
          ...prev.bossHp,
          [bossId]: Math.max(0, (prev.bossHp?.[bossId] ?? 1000) - damage) // Assume 1000 default if not set, handled later
        }
      };
    });
  };

  const teacherAdjustPoints = (studentId: string, projectId: string, points: number, note: string) => {
    setProgress(prev => ({
      ...prev,
      points: prev.points + points,
      teacherAdjustments: [...(prev.teacherAdjustments || []), { studentId, projectId, points, note }]
    }));
  };

  const updateProgress = (updater: (prev: ProgressState) => ProgressState) => {
    setProgress(prev => updater(prev));
  };

  const updateGameData = async (items: ShopItem[], newBosses: Boss[]) => {
    try {
      await setDoc(doc(db, 'config', 'game_data'), { shopItems: items, bosses: newBosses });
      setShopItems(items);
      setBosses(newBosses);
    } catch (e) {
      console.error('Failed to update game data', e);
      throw e;
    }
  };

  useEffect(() => {
    const fetchGameData = async () => {
      try {
        const snap = await getDoc(doc(db, 'config', 'game_data'));
        if (snap.exists()) {
          const data = snap.data();
          if (data.shopItems) setShopItems(data.shopItems);
          if (data.bosses) setBosses(data.bosses);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchGameData();
  }, []);

  return (
    <AppContext.Provider
      value={{
        view, setView, role, authUser, profile, login, logout,
        selectedLesson, setSelectedLesson,
        progress, completeLesson, addXP, submitExam, buyItem, attackBoss, teacherAdjustPoints,
        updateProgress,
        isDataLoaded, syllabus,
        shopItems, bosses, updateGameData,
        recordStudyActivity, dismissStreakPopup, updateStudyTime, isEditMode, setIsEditMode,
        isAppearanceEditorOpen, setIsAppearanceEditorOpen,
        nocodeConfig
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
