import React from 'react';
import { useAppContext } from '../store';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { SYLLABUS } from '../data';
import { Trophy, Star, CheckCircle, Flame, Info, Sparkles, Clock } from 'lucide-react';

const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export function StudentDashboard() {
  const { progress, recordStudyActivity } = useAppContext();
  const todayStr = getTodayDateString();
  const isCheckedInToday = progress.lastActiveDate === todayStr || (progress.streakHistory?.includes(todayStr) ?? false);

  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    const dayOfWeek = d.getDay();
    const dayLabel = dayOfWeek === 0 ? 'CN' : `T${dayOfWeek + 1}`;
    return { dateStr, dayLabel, shortLabel: `${day}/${month}`, isToday: dateStr === todayStr, studied: progress.streakHistory?.includes(dateStr) || false };
  });

  const getStreakWarning = () => {
    if (!progress.lastActiveDate) return null;
    const [y, m, d] = progress.lastActiveDate.split('-').map(Number);
    const lastActive = new Date(y, m - 1, d);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lastActive.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 0 && diffDays <= 3) return `Bạn đã không học ${diffDays} ngày. Hãy học ngay để giữ chuỗi! (Giới hạn: 3 ngày)`;
    if (diffDays > 3) return 'Chuỗi ngày học tập đã tắt do quá 3 ngày không học bài. Học ngay để thắp lại lửa!';
    return null;
  };

  const streakWarning = getStreakWarning();

  const timelineData = [
    { day: 'Khởi đầu', points: 0 },
    { day: 'Tuần 1', points: 20 },
    { day: 'Tuần 2', points: 70 },
    { day: 'Hiện tại', points: progress.points }
  ];

  const totalLessons = SYLLABUS.reduce((acc, c) => acc + c.lessons.length, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
        Tiến độ học tập
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <div className="card p-5 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-cyan-100 dark:bg-cyan-950/30 text-cyan-600 dark:text-cyan-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Thời gian học</p>
            <p className="text-xl font-bold text-slate-800 dark:text-white">{Math.floor((progress.studyTime || 0) / 60)} phút</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-950/30 text-[#0052cc]">
            <Star className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Tổng điểm</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{progress.points}</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <div className={`p-3 rounded-lg ${progress.streak && progress.streak > 0 ? 'bg-orange-100 dark:bg-orange-950/30 text-orange-500' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}>
            <Flame className={`w-6 h-6 ${progress.streak && progress.streak > 0 ? 'animate-bounce' : ''}`} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Streak</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{progress.streak || 0} ngày</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Bài học hoàn thành</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{Math.min(progress.completedLessons?.length || 0, totalLessons)} / {totalLessons}</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-950/30 text-purple-600">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Chứng chỉ</p>
            <p className="text-base font-bold text-slate-800 dark:text-white">{(progress.examScores?.['midterm_1'] || 0) >= 70 ? 'Đã Tốt Nghiệp' : 'Chưa đạt'}</p>
          </div>
        </div>
      </div>

      {streakWarning && (
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl flex items-center gap-3 text-amber-800 dark:text-amber-300">
          <Info className="w-5 h-5 shrink-0" />
          <span className="text-sm font-medium">{streakWarning}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 card p-6 border-orange-200/50 dark:border-orange-900/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
                Duy trì ngọn lửa học tập
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Một ngày học tập là thắp sáng một chuỗi.</p>
            </div>
            <button onClick={recordStudyActivity} disabled={isCheckedInToday}
              className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${
                isCheckedInToday 
                  ? 'bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-sm active:scale-95'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              {isCheckedInToday ? 'Đã điểm danh hôm nay' : 'Điểm danh thắp lửa!'}
            </button>
          </div>
          <div className="grid grid-cols-7 gap-2 sm:gap-3 py-3">
            {last7Days.map((v) => (
              <div key={v.dateStr} className={`flex flex-col items-center p-3 rounded-xl border transition-all ${
                v.studied ? 'bg-orange-50 border-orange-300 dark:bg-orange-950/20 dark:border-orange-800' :
                v.isToday ? 'bg-blue-50/50 border-blue-200 dark:bg-blue-950/10 dark:border-blue-900 border-dashed animate-pulse' :
                'bg-slate-50 border-slate-100 dark:bg-slate-900/30 dark:border-slate-800'
              }`}>
                <span className="text-xs font-bold text-slate-500 mb-2">{v.dayLabel}</span>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                  v.studied ? 'bg-gradient-to-tr from-orange-500 to-amber-400 shadow-sm' : 'bg-slate-100 dark:bg-slate-700 text-slate-300'
                }`}>
                  {v.studied ? <span className="text-base animate-bounce">🔥</span> : <span className="text-sm font-bold text-slate-400">{v.isToday ? '?' : '•'}</span>}
                </div>
                <span className="text-[10px] font-medium text-slate-400 mt-1.5">{v.shortLabel}</span>
                {v.isToday && <span className="absolute -top-2 px-1.5 py-0.5 rounded bg-[#0052cc] text-[8px] font-bold text-white uppercase">H.Nay</span>}
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-[#0052cc]" />
              Cơ chế bảo vệ ngọn lửa
            </h3>
            <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-orange-500 font-bold bg-orange-100 dark:bg-orange-950/40 px-1.5 py-0.5 rounded shrink-0">1</span>
                <span><strong>Tích lũy theo ngày:</strong> Hoàn thành bài học hoặc nộp kiểm tra tự động thắp sáng chuỗi.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 font-bold bg-orange-100 dark:bg-orange-950/40 px-1.5 py-0.5 rounded shrink-0">2</span>
                <span><strong>Hạn chót 3 ngày:</strong> Nếu vắng mặt quá 3 ngày, ngọn lửa sẽ tắt và chuỗi về 0.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 font-bold bg-orange-100 dark:bg-orange-950/40 px-1.5 py-0.5 rounded shrink-0">3</span>
                <span><strong>Thắp lại:</strong> Học bài hoặc điểm danh để thắp sáng lại ngay lập tức!</span>
              </li>
            </ul>
          </div>
          <div className="text-[10px] text-slate-400 pt-4 border-t border-gray-100 dark:border-slate-700 mt-4">
            * Thời gian dựa trên giờ hệ thống địa phương.
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-base font-bold text-slate-800 dark:text-white mb-5">Biểu đồ Tích lũy điểm cá nhân</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 13 }} dy={10} />
              <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF' }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Line type="monotone" dataKey="points" stroke="#0052cc" strokeWidth={3} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
