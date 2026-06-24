import { useState } from 'react';
import { useAppContext } from '../store';
import { motion } from 'motion/react';
import { BookOpen, Flame, Zap, Target, Clock, TrendingUp, Code2, Star, ChevronRight, Medal, Trophy } from 'lucide-react';

const mockChartData = [30, 45, 35, 50, 55, 65, 70, 60, 75, 80, 90, 85];

export function StudentDashboard() {
  const { progress, profile, setView } = useAppContext();
  const [timeRange, setTimeRange] = useState('week');

  const streakDays = progress?.streak || 2;
  const xp = progress?.xp || 450;
  const level = Math.floor(xp / 100) + 1;
  const xpInLevel = xp % 100;

  const metrics = [
    { label: 'Bài đã học', value: '24', icon: BookOpen, change: '+3', color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30' },
    { label: 'Streak', value: `${streakDays} ngày`, icon: Flame, change: '🔥', color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/30' },
    { label: 'XP hôm nay', value: `${xp} XP`, icon: Zap, change: '+120', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30' },
    { label: 'Thời gian', value: '12.5h', icon: Clock, change: '+2h', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30' },
    { label: 'Độ chính xác', value: '85%', icon: Target, change: '+5%', color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/30' },
    { label: 'Xếp hạng', value: '#12', icon: TrendingUp, change: '↑3', color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/30' },
  ];

  const recentActivity = [
    { label: 'Hoàn thành bài 5 - Câu điều kiện', time: '2 giờ trước', type: 'lesson', xp: '+25 XP' },
    { label: 'Đạt 3 sao bài tập Vòng lặp', time: '4 giờ trước', type: 'practice', xp: '+50 XP' },
    { label: 'Hoàn thành kiểm tra giữa kỳ', time: '1 ngày trước', type: 'exam', xp: '+100 XP' },
    { label: 'Mở khóa chương 4 - Vòng lặp', time: '2 ngày trước', type: 'unlock', xp: '' },
  ];

  const achievements = [
    { label: 'Code Master', icon: Code2, desc: 'Hoàn thành 20 bài tập', progress: 75, color: 'text-blue-500' },
    { label: 'Streak Warrior', icon: Flame, desc: 'Streak 7 ngày liên tiếp', progress: 42, color: 'text-orange-500' },
    { label: 'Top Performer', icon: Trophy, desc: 'Top 10 bảng xếp hạng', progress: 90, color: 'text-amber-500' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-primary-500">Dashboard</span>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
            Xin chào, {profile?.displayName || 'Học viên'} 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Hãy tiếp tục hành trình học tập của bạn!</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setView('roadmap')} className="cl-btn cl-btn-primary text-sm flex items-center gap-1">
            <BookOpen className="w-4 h-4" /> Học tiếp
          </button>
        </div>
      </div>

      <div className="cl-card p-5 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center text-white font-extrabold text-xl shrink-0">
            {level}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-gray-900 dark:text-white">Cấp độ {level}</h3>
              <span className="text-sm font-medium text-amber-500">{xp} XP</span>
            </div>
            <div className="w-full max-w-md h-2.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all" style={{ width: `${xpInLevel}%` }} />
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{100 - xpInLevel} XP đến cấp tiếp theo</p>
          </div>
          <div className="flex items-center gap-3 text-sm shrink-0">
            <div className="text-center">
              <div className="text-lg font-extrabold text-amber-500">🔥 {streakDays}</div>
              <div className="text-xs text-gray-400">Ngày</div>
            </div>
            <div className="w-px h-8 bg-gray-200 dark:bg-slate-700" />
            <div className="text-center">
              <div className="text-lg font-extrabold text-primary-500">#{progress?.rank || '-'}</div>
              <div className="text-xs text-gray-400">Xếp hạng</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {metrics.map((m, i) => (
          <div key={i} className="cl-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${m.color}`}>
                <m.icon className="w-4 h-4" />
              </div>
              <span className={`text-xs font-bold ${m.change.startsWith('+') ? 'text-emerald-500' : ''}`}>{m.change}</span>
            </div>
            <div className="text-lg font-extrabold text-gray-900 dark:text-white">{m.value}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{m.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 cl-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 dark:text-white">Hoạt động học tập</h3>
            <div className="flex gap-1">
              {['week', 'month', 'year'].map(r => (
                <button key={r} onClick={() => setTimeRange(r)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    timeRange === r ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200'
                  }`}
                >{r === 'week' ? 'Tuần' : r === 'month' ? 'Tháng' : 'Năm'}</button>
              ))}
            </div>
          </div>
          <div className="flex items-end gap-2" style={{ height: 160 }}>
            {mockChartData.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                <motion.div initial={{ height: 0 }} animate={{ height: `${v}%` }}
                  className="w-full max-w-[32px] rounded-md bg-primary-500/80 hover:bg-primary-500 transition-colors cursor-pointer relative"
                  style={{ height: `${v}%` }}
                >
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-gray-900 dark:text-white opacity-0 group-hover:opacity-100 transition-opacity">{v} XP</div>
                </motion.div>
                <span className="text-[10px] text-gray-400 dark:text-gray-600">{['T2','T3','T4','T5','T6','T7','CN','T2','T3','T4','T5','T6'][i]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="cl-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 dark:text-white">Thành tích</h3>
            <Star className="w-4 h-4 text-amber-400" />
          </div>
          <div className="space-y-4">
            {achievements.map((a, i) => (
              <div key={i}>
                <div className="flex items-center gap-3 mb-1.5">
                  <a.icon className={`w-4 h-4 ${a.color}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">{a.label}</div>
                    <div className="text-xs text-gray-400">{a.desc}</div>
                  </div>
                  <span className="text-xs font-bold text-gray-500">{a.progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${a.color.replace('text-', 'bg-')}/80`} style={{ width: `${a.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="cl-card p-5">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">Hoạt động gần đây</h3>
          <div className="space-y-3">
            {recentActivity.map((a, i) => (
              <div key={i} className="flex items-start gap-3 pb-3 border-b border-gray-100 dark:border-slate-800 last:border-0">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  a.type === 'lesson' ? 'bg-blue-50 text-blue-500 dark:bg-blue-950/30' :
                  a.type === 'practice' ? 'bg-emerald-50 text-emerald-500 dark:bg-emerald-950/30' :
                  a.type === 'exam' ? 'bg-purple-50 text-purple-500 dark:bg-purple-950/30' :
                  'bg-amber-50 text-amber-500 dark:bg-amber-950/30'
                }`}>
                  {a.type === 'lesson' ? <BookOpen className="w-4 h-4" /> :
                   a.type === 'practice' ? <Code2 className="w-4 h-4" /> :
                   a.type === 'exam' ? <Trophy className="w-4 h-4" /> : <Star className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{a.label}</div>
                  <div className="text-xs text-gray-400">{a.time}</div>
                </div>
                {a.xp && <span className="text-xs font-bold text-emerald-500 shrink-0">{a.xp}</span>}
              </div>
            ))}
          </div>
        </div>

        <div className="cl-card p-5 bg-gradient-to-br from-primary-500 to-blue-700 text-white border-0">
          <Medal className="w-8 h-8 mb-3" />
          <h3 className="font-bold text-lg mb-2">Thử thách hôm nay</h3>
          <p className="text-sm text-blue-100 mb-4">Hoàn thành 3 bài tập để nhận 50 XP thưởng!</p>
          <div className="flex items-center gap-2 mb-4">
            {[1, 2, 3].map(i => (
              <div key={i} className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold ${
                i <= 1 ? 'bg-amber-500 text-white' : 'bg-white/20 text-white/60'
              }`}>{i}</div>
            ))}
          </div>
          <button className="px-5 py-2 bg-white text-primary-600 font-bold rounded-xl hover:bg-amber-50 transition-colors text-sm">
            Bắt đầu thử thách
          </button>
        </div>
      </div>
    </div>
  );
}
