import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://kztvlentmpzjmuwelpqd.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6dHZsZW50bXB6am11d2VscHFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5MDE3MDQsImV4cCI6MjA5NzQ3NzcwNH0.Ed-DPOaRhwnpCeCPa9jm8gCrfFHtYpNXzB9MnpXQyyE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export type Profile = {
  id: string;
  display_name: string;
  avatar_url: string;
  role: 'student' | 'teacher' | 'admin' | 'super_admin' | 'game_developer';
  xp: number;
  streak: number;
  last_active_date: string;
  created_at: string;
  updated_at: string;
};

export type Chapter = {
  id: string;
  title: string;
  description: string;
  icon: string;
  level: string;
  sort_order: number;
  is_published: boolean;
};

export type Lesson = {
  id: string;
  chapter_id: string;
  title: string;
  description: string;
  theory: string;
  lab_prompt: string;
  lab_expected_code: string;
  challenge_prompt: string;
  challenge_expected_code: string;
  duration_minutes: number;
  sort_order: number;
  is_published: boolean;
};

export type LessonProgress = {
  id: string;
  user_id: string;
  lesson_id: string;
  completed: boolean;
  score: number;
  xp_earned: number;
  completed_at: string | null;
};

export type ShopItem = {
  id: string;
  name: string;
  description: string;
  type: 'weapon' | 'armor' | 'consumable';
  price: number;
  damage: number;
  defense: number;
  heal_amount: number;
  image_url: string;
  is_available: boolean;
};

export type Inventory = {
  id: string;
  user_id: string;
  item_id: string;
  quantity: number;
  equipped: boolean;
};

export type Boss = {
  id: string;
  name: string;
  description: string;
  emoji: string;
  max_hp: number;
  current_hp: number;
  damage: number;
  land: string;
  land_order: number;
  is_boss: boolean;
  level_required: number;
  xp_reward: number;
  cooldown_hours: number;
  is_active: boolean;
};

export type BossAttempt = {
  id: string;
  user_id: string;
  boss_id: string;
  damage_dealt: number;
  player_hp_remaining: number;
  won: boolean;
  xp_earned: number;
  items_used: any;
  created_at: string;
};

export type Guild = {
  id: string;
  name: string;
  description: string;
  emoji: string;
  leader_id: string;
  xp: number;
  level: number;
  member_count: number;
  is_active: boolean;
};

export type GuildMember = {
  id: string;
  guild_id: string;
  user_id: string;
  role: 'leader' | 'officer' | 'member';
  joined_at: string;
};

export type Exam = {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  questions: any;
  is_published: boolean;
};

export type ExamAttempt = {
  id: string;
  user_id: string;
  exam_id: string;
  answers: any;
  score: number;
  passed: boolean;
  started_at: string;
  completed_at: string | null;
};

export type Achievement = {
  id: string;
  name: string;
  description: string;
  icon: string;
  xp_reward: number;
  criteria: any;
};

// ============================================================
// Auth
// ============================================================
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${import.meta.env.VITE_APP_URL || window.location.origin}/auth/callback`,
    },
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// ============================================================
// Profiles
// ============================================================
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
  return data;
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
  const { data, error } = await supabase.from('profiles').update(updates).eq('id', userId).select().single();
  if (error) throw error;
  return data;
}

// ============================================================
// Chapters & Lessons
// ============================================================
export async function getChapters(): Promise<Chapter[]> {
  const { data } = await supabase.from('chapters').select('*').order('sort_order');
  return data || [];
}

export async function getLessonsByChapter(chapterId: string): Promise<Lesson[]> {
  const { data } = await supabase.from('lessons').select('*').eq('chapter_id', chapterId).order('sort_order');
  return data || [];
}

export async function getLesson(lessonId: string): Promise<Lesson | null> {
  const { data } = await supabase.from('lessons').select('*').eq('id', lessonId).single();
  return data;
}

// ============================================================
// Progress
// ============================================================
export async function getLessonProgress(userId: string): Promise<LessonProgress[]> {
  const { data } = await supabase.from('lesson_progress').select('*').eq('user_id', userId);
  return data || [];
}

export async function upsertLessonProgress(userId: string, lessonId: string, progress: Partial<LessonProgress>) {
  const { data, error } = await supabase.from('lesson_progress').upsert({
    user_id: userId,
    lesson_id: lessonId,
    ...progress,
  }).select().single();
  if (error) throw error;
  return data;
}

// ============================================================
// Bosses
// ============================================================
export async function getBosses(): Promise<Boss[]> {
  const { data } = await supabase.from('bosses').select('*').eq('is_active', true).order('land_order');
  return data || [];
}

export async function updateBossHp(bossId: string, currentHp: number) {
  const { error } = await supabase.from('bosses').update({ current_hp: currentHp }).eq('id', bossId);
  if (error) throw error;
}

export async function recordBossAttempt(attempt: Partial<BossAttempt>) {
  const { data, error } = await supabase.from('boss_attempts').insert({
    user_id: attempt.user_id,
    boss_id: attempt.boss_id,
    damage_dealt: attempt.damage_dealt || 0,
    player_hp_remaining: attempt.player_hp_remaining || 100,
    won: attempt.won || false,
    xp_earned: attempt.xp_earned || 0,
    items_used: attempt.items_used || [],
  }).select().single();
  if (error) throw error;
  return data;
}

export async function getBossAttempts(userId: string, bossId?: string): Promise<BossAttempt[]> {
  let query = supabase.from('boss_attempts').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  if (bossId) query = query.eq('boss_id', bossId);
  const { data } = await query;
  return data || [];
}

// ============================================================
// Shop & Inventory
// ============================================================
export async function getShopItems(): Promise<ShopItem[]> {
  const { data } = await supabase.from('shop_items').select('*').eq('is_available', true);
  return data || [];
}

export async function getInventory(userId: string): Promise<Inventory[]> {
  const { data } = await supabase.from('inventory').select('*').eq('user_id', userId);
  return data || [];
}

export async function buyItem(userId: string, itemId: string, price: number) {
  const { data: existing } = await supabase.from('inventory').select('*').eq('user_id', userId).eq('item_id', itemId).maybeSingle();
  if (existing) {
    const { error } = await supabase.from('inventory').update({ quantity: existing.quantity + 1 }).eq('id', existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from('inventory').insert({ user_id: userId, item_id: itemId, quantity: 1 });
    if (error) throw error;
  }
  const { error: xpError } = await supabase.from('profiles').update({ xp: supabase.rpc('decrement', { x: price }) }).eq('id', userId);
  // Decrement XP via direct math
  const { data: profile } = await supabase.from('profiles').select('xp').eq('id', userId).single();
  if (profile) {
    await supabase.from('profiles').update({ xp: Math.max(0, profile.xp - price) }).eq('id', userId);
  }
}

export async function equipItem(userId: string, itemId: string, equip: boolean) {
  if (equip) {
    await supabase.from('inventory').update({ equipped: false }).eq('user_id', userId);
  }
  const { error } = await supabase.from('inventory').update({ equipped: equip }).eq('user_id', userId).eq('item_id', itemId);
  if (error) throw error;
}

// ============================================================
// Guilds
// ============================================================
export async function createGuild(name: string, description: string, leaderId: string) {
  const { data: guild, error } = await supabase.from('guilds').insert({
    name, description, leader_id: leaderId,
  }).select().single();
  if (error) throw error;
  await supabase.from('guild_members').insert({ guild_id: guild.id, user_id: leaderId, role: 'leader' });
  return guild;
}

export async function getGuilds(): Promise<Guild[]> {
  const { data } = await supabase.from('guilds').select('*').eq('is_active', true).order('xp', { ascending: false });
  return data || [];
}

export async function joinGuild(guildId: string, userId: string) {
  const { error } = await supabase.from('guild_members').insert({ guild_id: guildId, user_id: userId });
  if (error) throw error;
}

export async function getMyGuild(userId: string) {
  const { data: member } = await supabase.from('guild_members').select('guild_id').eq('user_id', userId).maybeSingle();
  if (!member) return null;
  const { data: guild } = await supabase.from('guilds').select('*').eq('id', member.guild_id).single();
  const { data: members } = await supabase.from('guild_members').select('*, profiles!inner(display_name, avatar_url)').eq('guild_id', member.guild_id);
  return { guild, members };
}

// ============================================================
// Exams
// ============================================================
export async function getExams(): Promise<Exam[]> {
  const { data } = await supabase.from('exams').select('*').eq('is_published', true);
  return data || [];
}

export async function startExam(userId: string, examId: string) {
  const { data, error } = await supabase.from('exam_attempts').insert({
    user_id: userId, exam_id: examId, started_at: new Date().toISOString(),
  }).select().single();
  if (error) throw error;
  return data;
}

export async function submitExam(attemptId: string, answers: any, score: number, passed: boolean) {
  const { error } = await supabase.from('exam_attempts').update({
    answers, score, passed, completed_at: new Date().toISOString(),
  }).eq('id', attemptId);
  if (error) throw error;
}

// ============================================================
// Achievements
// ============================================================
export async function getAchievements(): Promise<Achievement[]> {
  const { data } = await supabase.from('achievements').select('*');
  return data || [];
}

export async function getUserAchievements(userId: string) {
  const { data } = await supabase.from('user_achievements').select('*, achievements(*)').eq('user_id', userId);
  return data || [];
}

export async function unlockAchievement(userId: string, achievementId: string) {
  const { error } = await supabase.from('user_achievements').insert({ user_id: userId, achievement_id: achievementId });
  if (error && error.code !== '23505') throw error; // Ignore duplicate
}

// ============================================================
// Helper: Add XP
// ============================================================
export async function addXp(userId: string, amount: number) {
  const { data: profile } = await supabase.from('profiles').select('xp').eq('id', userId).single();
  if (profile) {
    await supabase.from('profiles').update({ xp: profile.xp + amount }).eq('id', userId);
  }
}
