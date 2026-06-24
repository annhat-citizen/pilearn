-- ============================================================
-- PiLearn Seed Data
-- Run AFTER supabase-schema.sql in Supabase SQL Editor
-- ============================================================

-- Shop Items
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

-- Bosses (4 Lands)
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

-- Achievements
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
