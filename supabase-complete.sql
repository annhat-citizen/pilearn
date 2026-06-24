-- ============================================================
-- PiLearn Complete Schema (safe to run multiple times)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABLES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  display_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT DEFAULT '',
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student','teacher','admin','super_admin','game_developer')),
  xp INTEGER NOT NULL DEFAULT 0,
  streak INTEGER NOT NULL DEFAULT 0,
  last_active_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.chapters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  icon TEXT DEFAULT '📚',
  level TEXT NOT NULL DEFAULT 'Cơ bản' CHECK (level IN ('Cơ bản','Trung bình','Nâng cao')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chapter_id UUID NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  theory TEXT DEFAULT '',
  lab_prompt TEXT DEFAULT '',
  lab_expected_code TEXT DEFAULT '',
  challenge_prompt TEXT DEFAULT '',
  challenge_expected_code TEXT DEFAULT '',
  duration_minutes INTEGER DEFAULT 30,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  completed BOOLEAN NOT NULL DEFAULT false,
  score INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS public.exams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  duration_minutes INTEGER DEFAULT 45,
  questions JSONB DEFAULT '[]'::jsonb,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.exam_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  answers JSONB DEFAULT '[]'::jsonb,
  score INTEGER DEFAULT 0,
  passed BOOLEAN DEFAULT false,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.shop_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  type TEXT NOT NULL CHECK (type IN ('weapon','armor','consumable')),
  price INTEGER NOT NULL DEFAULT 0,
  damage INTEGER DEFAULT 0,
  defense INTEGER DEFAULT 0,
  heal_amount INTEGER DEFAULT 0,
  image_url TEXT DEFAULT '',
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.shop_items(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  equipped BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, item_id)
);

CREATE TABLE IF NOT EXISTS public.bosses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  emoji TEXT DEFAULT '👹',
  max_hp INTEGER NOT NULL DEFAULT 100,
  current_hp INTEGER NOT NULL DEFAULT 100,
  damage INTEGER NOT NULL DEFAULT 10,
  land TEXT NOT NULL,
  land_order INTEGER NOT NULL DEFAULT 0,
  is_boss BOOLEAN NOT NULL DEFAULT false,
  level_required INTEGER DEFAULT 1,
  xp_reward INTEGER DEFAULT 50,
  cooldown_hours INTEGER DEFAULT 2,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.boss_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  boss_id UUID NOT NULL REFERENCES public.bosses(id) ON DELETE CASCADE,
  damage_dealt INTEGER NOT NULL DEFAULT 0,
  player_hp_remaining INTEGER NOT NULL DEFAULT 100,
  won BOOLEAN NOT NULL DEFAULT false,
  xp_earned INTEGER DEFAULT 0,
  items_used JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.guilds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  emoji TEXT DEFAULT '🏰',
  leader_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  member_count INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.guild_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guild_id UUID NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('leader','officer','member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(guild_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  icon TEXT DEFAULT '🏆',
  xp_reward INTEGER DEFAULT 0,
  criteria JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- ============================================================
-- ROW LEVEL SECURITY (drop + create for PG < 15 compat)
-- ============================================================
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can read profiles" ON public.profiles;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Anyone can read profiles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can read chapters" ON public.chapters;
DROP POLICY IF EXISTS "Admins can manage chapters" ON public.chapters;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read chapters" ON public.chapters FOR SELECT USING (true);
CREATE POLICY "Admins can manage chapters" ON public.chapters FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','super_admin')));

DROP POLICY IF EXISTS "Anyone can read lessons" ON public.lessons;
DROP POLICY IF EXISTS "Admins can manage lessons" ON public.lessons;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read lessons" ON public.lessons FOR SELECT USING (true);
CREATE POLICY "Admins can manage lessons" ON public.lessons FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','super_admin','teacher')));

DROP POLICY IF EXISTS "Users can read own progress" ON public.lesson_progress;
DROP POLICY IF EXISTS "Users can insert own progress" ON public.lesson_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON public.lesson_progress;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own progress" ON public.lesson_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON public.lesson_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON public.lesson_progress FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can read exams" ON public.exams;
DROP POLICY IF EXISTS "Teachers can manage exams" ON public.exams;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read exams" ON public.exams FOR SELECT USING (true);
CREATE POLICY "Teachers can manage exams" ON public.exams FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','super_admin','teacher')));

DROP POLICY IF EXISTS "Users can read own attempts" ON public.exam_attempts;
DROP POLICY IF EXISTS "Users can insert own attempts" ON public.exam_attempts;
ALTER TABLE public.exam_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own attempts" ON public.exam_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own attempts" ON public.exam_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can read shop items" ON public.shop_items;
DROP POLICY IF EXISTS "Admins can manage shop items" ON public.shop_items;
ALTER TABLE public.shop_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read shop items" ON public.shop_items FOR SELECT USING (true);
CREATE POLICY "Admins can manage shop items" ON public.shop_items FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','super_admin','game_developer')));

DROP POLICY IF EXISTS "Users can read own inventory" ON public.inventory;
DROP POLICY IF EXISTS "Users can manage own inventory" ON public.inventory;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own inventory" ON public.inventory FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own inventory" ON public.inventory FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can read bosses" ON public.bosses;
DROP POLICY IF EXISTS "Admins can manage bosses" ON public.bosses;
ALTER TABLE public.bosses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read bosses" ON public.bosses FOR SELECT USING (true);
CREATE POLICY "Admins can manage bosses" ON public.bosses FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','super_admin','game_developer')));

DROP POLICY IF EXISTS "Users can read own attempts" ON public.boss_attempts;
DROP POLICY IF EXISTS "Users can insert own attempts" ON public.boss_attempts;
ALTER TABLE public.boss_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own attempts" ON public.boss_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own attempts" ON public.boss_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can read guilds" ON public.guilds;
DROP POLICY IF EXISTS "Authenticated users can create guilds" ON public.guilds;
DROP POLICY IF EXISTS "Guild leader can update guild" ON public.guilds;
ALTER TABLE public.guilds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read guilds" ON public.guilds FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create guilds" ON public.guilds FOR INSERT WITH CHECK (auth.uid() = leader_id);
CREATE POLICY "Guild leader can update guild" ON public.guilds FOR UPDATE USING (auth.uid() = leader_id);

DROP POLICY IF EXISTS "Anyone can read guild members" ON public.guild_members;
DROP POLICY IF EXISTS "Users can join guilds" ON public.guild_members;
DROP POLICY IF EXISTS "Users can leave guilds" ON public.guild_members;
ALTER TABLE public.guild_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read guild members" ON public.guild_members FOR SELECT USING (true);
CREATE POLICY "Users can join guilds" ON public.guild_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave guilds" ON public.guild_members FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can read achievements" ON public.achievements;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read achievements" ON public.achievements FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can read own achievements" ON public.user_achievements;
DROP POLICY IF EXISTS "Users can unlock achievements" ON public.user_achievements;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own achievements" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can unlock achievements" ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- INDEXES
-- ============================================================
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

-- ============================================================
-- SEED DATA
-- ============================================================
INSERT INTO public.shop_items (name, description, type, price, damage, defense, heal_amount) VALUES
('Kiếm Gỗ Tập Sự', 'Gây 15 sát thương cơ bản cho quái sơ cấp.', 'weapon', 40, 15, 0, 0),
('Kiếm Sắt Cứng Cáp', 'Rèn đúc từ quặng thô, gây 40 sát thương.', 'weapon', 120, 40, 0, 0),
('Kiếm Lửa Hoả Long', 'Thiêu rụi Bug tức thì với 120 sát thương cực mạnh.', 'weapon', 350, 120, 0, 0),
('Gậy Thần Kỳ Diệu', 'Giải phóng phép thuật Python gây 260 sát thương.', 'weapon', 650, 260, 0, 0),
('Thần Kiếm Diệt Rồng [PRO]', 'Trang bị Độc tôn dành riêng cho Pro, chém bay 650 HP.', 'weapon', 1000, 650, 0, 0),
('Giáp Vải Phổ Thông', 'Mũ giáp cơ bản chắn đòn, giảm 15% phản sát thương.', 'armor', 60, 0, 15, 0),
('Giáp Thép Kiên Cố', 'Dày dặn bảo vệ cơ thể, giảm 40% phản sát thương.', 'armor', 200, 0, 40, 0),
('Long Thần Hải Giáp [PRO]', 'Giáp Thần khí tối thượng giảm 80% lực phản công.', 'armor', 500, 0, 80, 0),
('Bình Máu Tái Sinh', 'Hồi phục phao cứu sinh +150 HP lập tức khi chiến đấu.', 'consumable', 30, 0, 0, 150),
('Bình EXP Siêu Tốc', 'Nạp ngay +120 điểm kinh nghiệm thăng cấp thần tốc.', 'consumable', 80, 0, 0, 0),
('Nước Tăng Lực Cuồng Nộ', 'Nhân gấp 2.0x sát thương cú chém vũ khí tiếp theo.', 'consumable', 70, 0, 0, 0)
ON CONFLICT DO NOTHING;

INSERT INTO public.bosses (name, description, emoji, max_hp, current_hp, damage, land, land_order, is_boss, level_required, xp_reward, cooldown_hours) VALUES
('Slime Lười Biếng', 'Con slime lười biếng không muốn học bài. Đánh bại nó để lấy động lực!', '🟢', 200, 200, 8, 'Syntax Valley', 1, false, 1, 20, 1),
('Bug Cơ Bản', 'Lỗi cú pháp xuất hiện, hãy dùng code để diệt nó!', '🐛', 500, 500, 15, 'Syntax Valley', 2, true, 2, 50, 2),
('Rác Không Gian', 'Những dòng code thừa tạo thành quái vật không gian.', '👾', 300, 300, 12, 'Branching Forest', 1, false, 3, 30, 1),
('Rồng Mất Tập Trung', 'Con rồng hay quên cú pháp, đánh bại để nhớ bài!', '🐉', 1500, 1500, 25, 'Branching Forest', 2, true, 5, 120, 3),
('Vòng Lặp Vô Hạn', 'Quái vật được tạo từ vòng lặp for sai điều kiện.', '🌀', 800, 800, 20, 'Loop Lands', 1, false, 7, 60, 2),
('Chúa Tể Bug', 'Trùm cuối của các lỗi logic, cực kỳ nguy hiểm!', '👹', 5000, 5000, 50, 'Loop Lands', 2, true, 10, 300, 4),
('Thuật Toán Đen Tối', 'Quái vật được sinh ra từ thuật toán độc hại.', '⚡', 2000, 2000, 35, 'Advanced Peak', 1, false, 12, 100, 3),
('Trợ Lý AI Hắc Ám', 'AI điên loạn muốn thống trị thế giới lập trình. Đây là trùm cuối!', '🧙‍♂️', 10000, 10000, 80, 'Advanced Peak', 2, true, 15, 500, 6)
ON CONFLICT DO NOTHING;

INSERT INTO public.achievements (name, description, icon, xp_reward, criteria) VALUES
('Người Mới Bắt Đầu', 'Hoàn thành bài học đầu tiên', '🌟', 50, '{"type": "lessons_completed", "count": 1}'),
('Học Viện Chăm Chỉ', 'Hoàn thành 10 bài học', '📚', 200, '{"type": "lessons_completed", "count": 10}'),
('Bậc Thầy Lập Trình', 'Hoàn thành tất cả bài học', '🏆', 500, '{"type": "lessons_completed", "count": 50}'),
('Chiến Binh Không Ngừng Nghỉ', 'Streak 7 ngày liên tiếp', '🔥', 150, '{"type": "streak", "count": 7}'),
('Thợ Săn Boss', 'Đánh bại boss đầu tiên', '⚔️', 100, '{"type": "boss_defeated", "count": 1}'),
('Trùm Săn Boss', 'Đánh bại tất cả các boss', '👑', 500, '{"type": "boss_defeated", "count": 8}'),
('Người Chơi Hệ PRO', 'Sở hữu vật phẩm PRO', '💎', 200, '{"type": "pro_item"}'),
('Nhà Sưu Tầm', 'Mua tất cả vật phẩm trong shop', '🛍️', 300, '{"type": "shop_items", "count": 11}'),
('Học 8 Ngày 1 Tuần', 'Duy trì streak 30 ngày', '💪', 1000, '{"type": "streak", "count": 30}'),
('Cao Thủ Code', 'Đạt level 10', '🧠', 250, '{"type": "level", "count": 10}')
ON CONFLICT DO NOTHING;
