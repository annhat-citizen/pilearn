-- ============================================================
-- Fix missing policies & indexes (run after schema created with errors)
-- ============================================================

-- Missing CREATE POLICY statements (lines 304+)
ALTER TABLE public.boss_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own attempts" ON public.boss_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own attempts" ON public.boss_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.guilds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read guilds" ON public.guilds FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create guilds" ON public.guilds FOR INSERT WITH CHECK (auth.uid() = leader_id);
CREATE POLICY "Guild leader can update guild" ON public.guilds FOR UPDATE USING (auth.uid() = leader_id);

ALTER TABLE public.guild_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read guild members" ON public.guild_members FOR SELECT USING (true);
CREATE POLICY "Users can join guilds" ON public.guild_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave guilds" ON public.guild_members FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read achievements" ON public.achievements FOR SELECT USING (true);

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own achievements" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can unlock achievements" ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_lessons_chapter_id ON public.lessons(chapter_id);
CREATE INDEX IF NOT EXISTS idx_lessons_sort_order ON public.lessons(sort_order);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_id ON public.lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson_id ON public.lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_inventory_user_id ON public.inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_boss_attempts_user_id ON public.boss_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_boss_attempts_boss_id ON public.boss_attempts(boss_id);
CREATE INDEX IF NOT EXISTS idx_guild_members_user_id ON public.guild_members(user_id);
CREATE INDEX IF NOT EXISTS idx_guild_members_guild_id ON public.guild_members(guild_id);
CREATE INDEX IF NOT EXISTS idx_profiles_xp ON public.profiles(xp DESC);
CREATE INDEX IF NOT EXISTS idx_chapters_sort_order ON public.chapters(sort_order);
