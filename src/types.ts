export type ViewState = 
  | 'home' 
  | 'roadmap' 
  | 'lesson' 
  | 'practice' 
  | 'exams' 
  | 'student-dashboard' 
  | 'teacher-dashboard' 
  | 'admin-dashboard'
  | 'game-developer-dashboard'
  | 'cheatsheet' 
  | 'blog'
  | 'about'
  | 'story'
  | 'privacy'
  | 'terms'
  | 'help'
  | 'shop'
  | 'boss-battle'
  | 'docs'
  | 'safety';

export type Role = 'student' | 'teacher' | 'admin' | 'super_admin' | 'game_developer';

export type GameType = 'sort_paragraphs' | 'fill_blanks' | 'drag_words';

export interface InteractiveGame {
  id: string;
  type: GameType;
  title: string;
  content: string; // The raw content defined by teacher
  hint?: string; // Hint for the game
  options?: string[]; // Used for drag_words bank or extra config
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
}

export interface LabExercise {
  id: string;
  prompt: string;
  expectedCode?: string;
}

export interface LessonBlock {
  id: string;
  type: 'theory' | 'mindmap' | 'simulation' | 'flashcards' | 'miniquiz' | 'game' | 'practice' | 'challenge';
  title?: string;
  content?: string; // For theory (markdown text)
  url?: string;     // For mindmap or simulation URLs
  // Nested data for specific block kinds
  flashcards?: Flashcard[];
  miniQuiz?: Question[];
  game?: InteractiveGame;
  prompt?: string;        // For practice/challenge
  expectedCode?: string;  // For practice/challenge
}

export interface Lesson {
  id: string;
  title: string;
  theory: string | any[]; // Markdown or simple HTML snippet, or JSON blocks
  mindmapUrl?: string; // Optional embedded mindmap URL (iframe src)
  simulationUrl?: string; // Optional embedded interactive simulation (PhET, etc.)
  flashcards?: Flashcard[]; // Optional flashcards for active recall
  miniQuiz?: Question[]; // Optional mini quiz inside the lesson
  labPrompt?: string;
  labExpectedCode?: string;
  labs?: LabExercise[];
  challengePrompt: string;
  challengeExpectedCode?: string;
  interactiveGames?: InteractiveGame[];
  targetClassIds?: string[];
  blocks?: LessonBlock[]; // Flexible arranged lesson content
}


export interface Classroom {
  id: string;
  name: string;
  createdAt: string;
}

export interface Chapter {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  imageUrl?: string;
}

export interface TeacherAdjustment {
  studentId: string;
  projectId: string;
  points: number;
  note: string;
}

export interface ProgressState {
  completedLessons: string[];
  points: number; // Used as coins
  xp: number; // Used for leveling up
  inventory: Record<string, number>; // item_id -> count
  bossHp: Record<string, number>; // boss_id -> current hp
  examScores: Record<string, number>; // examId -> score (0-100)
  teacherAdjustments: TeacherAdjustment[];
  streak?: number;
  lastActiveDate?: string;
  streakHistory?: string[];
  showStreakPopup?: boolean;
  studyTime?: number; // Total study time in seconds
  isPro?: boolean; // dynamic plan: true = PRO, false or undefined = FREE
  playerHp?: number;
  playerMaxHp?: number;
  guildId?: string;
  guildName?: string;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  damage: number;
  icon: any; // We'll use lucide-react icons or emoji strings
  color: string;
}

export interface Boss {
  id: string;
  name: string;
  maxHp: number;
  image: string;
  level?: number;
  rewardStr?: string;
  bgColor?: string;
}

export type QuestionType = 'multiple_choice' | 'true_false' | 'coding';

export interface Question {
  id: string;
  type: QuestionType;
  prompt: string;
  options?: string[]; // for multiple choice
  correctOptionIndex?: number; // for multiple choice
  correctAnswerBool?: boolean; // for true/false
  expectedOutput?: string; // for coding
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  createdBy: string;
  createdAt: any;
}

export interface FootnoteArticle {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
}

export interface FootnotePage {
  id: string;
  title: string;
  description: string;
  content: string;
  articles?: FootnoteArticle[];
}
