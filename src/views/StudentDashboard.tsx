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

  // Calculate 7 days list for the streak timeline
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    const dayOfWeek = d.getDay();
    const dayLabel = dayOfWeek === 0 ? 'CN' : `T${dayOfWeek + 1}`;
    
    return {
      dateStr,
      dayLabel,
      shortLabel: `${day}/${month}`,
      isToday: dateStr === todayStr,
      studied: progress.streakHistory?.includes(dateStr) || false
    };
  });

  // Calculate days since last active to show warning
  const getStreakWarning = () => {
    if (!progress.lastActiveDate) return null;
    const [y, m, d] = progress.lastActiveDate.split('-').map(Number);
    const lastActive = new Date(y, m - 1, d);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lastActive.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0 && diffDays <= 3) {
      return `Bạn đã không học ${diffDays} ngày. Ngọn lửa sắp tắt! Hãy học hoặc điểm danh ngay để giữ chuỗi! (Giới hạn: 3 ngày)`;
    }
    if (diffDays > 3) {
      return 'Chuỗi ngày học tập đã tắt do quá 3 ngày không học bài. Điểm danh/học ngay để thắp lại lửa! 🔥';
    }
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
    <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12">
      <h1 className="text-3xl font-extrabold text-slate-950 dark:text-white mb-8 tracking-tight">
        Tiến độ học tập của tôi
      </h1>
      
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-6 mb-8 animate-fade-in">
         {/* Study Time */}
         <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm flex items-center">
            <div className="p-4 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 mr-4">
              <Clock className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Thời gian học</p>
              <p className="text-2xl font-black text-slate-800 dark:text-white">
                {Math.floor((progress.studyTime || 0) / 60)} phút
              </p>
            </div>
         </div>

         {/* Points */}
         <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm flex items-center">
            <div className="p-4 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 mr-4">
              <Star className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Tổng điểm Tích lũy</p>
              <p className="text-3xl font-black text-slate-800 dark:text-white">{progress.points}</p>
            </div>
         </div>

         {/* Streak Card */}
         <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm flex items-center">
            <div className={`p-4 rounded-full mr-4 ${progress.streak && progress.streak > 0 ? 'bg-orange-100 dark:bg-orange-950/50 text-orange-600' : 'bg-slate-100 dark:bg-slate-705 text-slate-400'}`}>
              <Flame className={`w-8 h-8 ${progress.streak && progress.streak > 0 ? 'animate-bounce text-orange-500' : 'text-slate-400'}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Chuỗi liên tiếp (Streak)</p>
              <p className="text-3xl font-black text-slate-800 dark:text-white">
                {progress.streak || 0} ngày
              </p>
            </div>
         </div>

         {/* Completed Lessons */}
         <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm flex items-center">
            <div className="p-4 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mr-4">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Bài học hoàn thành</p>
              <p className="text-3xl font-black text-slate-800 dark:text-white">
                {Math.min(progress.completedLessons?.length || 0, totalLessons)} / {totalLessons}
              </p>
            </div>
         </div>

         {/* Certificate */}
         <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm flex items-center">
            <div className="p-4 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 mr-4">
              <Trophy className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Chứng chỉ</p>
              <p className="text-lg font-extrabold text-slate-800 dark:text-white">
                {(progress.examScores?.['midterm_1'] || 0) >= 70 ? 'Đã Tốt Nghiệp' : 'Chưa đạt'}
              </p>
            </div>
         </div>
      </div>

      {/* Warnings & Reminders */}
      {streakWarning && (
        <div className="mb-8 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-2xl flex items-center gap-3 text-amber-800 dark:text-amber-300">
          <Info className="w-5 h-5 shrink-0 text-amber-600" />
          <span className="text-sm font-bold">{streakWarning}</span>
        </div>
      )}

      {/* Gamified Weekly Streak & Check-in Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        {/* Streak Board widget */}
        <div className="lg:col-span-2 bg-gradient-to-br from-white to-[#fffcf5] dark:from-slate-800 dark:to-slate-800/80 p-8 rounded-3xl border border-orange-200/60 dark:border-slate-700 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                <Flame className="w-6 h-6 text-orange-500 fill-orange-500 animate-pulse" />
                Duy trì ngọn lửa học tập của bạn
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Một ngày học tập là thắp sáng một chuỗi. Nhận thêm XP khi học hằng ngày!
              </p>
            </div>
            
            <button
              onClick={recordStudyActivity}
              disabled={isCheckedInToday}
              className={`px-6 py-2.5 rounded-full font-bold text-sm shadow-sm transition-all duration-200 flex items-center gap-2 ${
                isCheckedInToday 
                  ? 'bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400 cursor-not-allowed border border-orange-200/20' 
                  : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white transform hover:-translate-y-0.5 shadow-md active:translate-y-0'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              {isCheckedInToday ? 'Đã thắp lửa hôm nay' : 'Nhấn điểm danh thắp lửa! 🔥'}
            </button>
          </div>

          {/* 7 Days Grid */}
          <div className="grid grid-cols-7 gap-2 sm:gap-4 py-4">
            {last7Days.map((v) => {
              return (
                <div 
                  key={v.dateStr}
                  className={`flex flex-col items-center p-3 rounded-2xl border transition-all duration-300 relative ${
                    v.studied
                      ? 'bg-orange-50 border-orange-300 dark:bg-orange-950/20 dark:border-orange-850 shadow-sm shadow-orange-100/50'
                      : v.isToday
                        ? 'bg-blue-50/50 border-blue-200 dark:bg-blue-950/10 dark:border-blue-900 border-dashed animate-pulse'
                        : 'bg-gray-50/50 border-gray-100 dark:bg-slate-900/30 dark:border-slate-800'
                  }`}
                >
                  <span className="text-xs font-black tracking-wider text-slate-500 dark:text-slate-450 mb-2">
                    {v.dayLabel}
                  </span>
                  
                  {/* Flame bubble indicator */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                    v.studied
                      ? 'bg-gradient-to-tr from-orange-500 to-amber-400 shadow-md shadow-orange-200 dark:shadow-none'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-300'
                  }`}>
                    {v.studied ? (
                      <span className="text-xl animate-bounce">🔥</span>
                    ) : (
                      <span className="text-base font-black text-slate-400 dark:text-slate-550">
                        {v.isToday ? '?' : '•'}
                      </span>
                    )}
                  </div>
                  
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-2">
                    {v.shortLabel}
                  </span>

                  {v.isToday && (
                    <span className="absolute -top-2.5 px-1.5 py-0.5 rounded-full bg-blue-600 text-[8px] font-black tracking-widest text-white uppercase shadow-sm">
                      H.Nay
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Rules Card */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-gray-200 dark:border-slate-700 shadow-md flex flex-col justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
              <Info className="w-5 h-5 text-blue-500" />
              Cơ chế bảo vệ ngọn lửa
            </h3>
            <ul className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-start gap-2.5">
                <span className="text-orange-500 font-extrabold bg-orange-100 dark:bg-orange-950/40 px-2 py-0.5 rounded-md shrink-0">1</span>
                <span><strong>Tích lũy theo ngày:</strong> Một ngày bạn hoàn thành <strong>Bài học</strong> hoặc nộp <strong>Kiểm tra</strong> đều tự động thắp sáng chuỗi.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-orange-500 font-extrabold bg-orange-100 dark:bg-orange-950/40 px-2 py-0.5 rounded-md shrink-0">2</span>
                <span><strong>Hạn chót 3 ngày:</strong> Nếu vắng mặt quá 3 ngày không học bài, ngọn lửa vàng sẽ bị tắt hoàn toàn và chuỗi trở về <strong>0 ngày</strong>.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-orange-500 font-extrabold bg-orange-100 dark:bg-orange-950/40 px-2 py-0.5 rounded-md shrink-0">3</span>
                <span><strong>Kích hoạt thắp lại:</strong> Ngay khi học bài hoặc điểm danh trở lại, chuỗi ngọn lửa sẽ lập tức được <strong>thắp sáng lại</strong> cực kỳ rực rỡ! 🔥</span>
              </li>
            </ul>
          </div>
          
          <div className="text-[10px] text-slate-400 dark:text-slate-500 pt-4 border-t border-gray-100 dark:border-slate-700 mt-4">
            * Thời gian dựa trên giờ hệ thống địa phương của học viên.
          </div>
        </div>
      </div>

      {/* Recharts Personal Accumulated Points timeline chart */}
      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Biểu đồ Tích lũy điểm cá nhân</h3>
        <div className="h-80 w-full">
           <ResponsiveContainer width="100%" height="100%">
             <LineChart data={timelineData}>
               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
               <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 13 }} dy={10} />
               <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF' }} />
               <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
               <Line type="monotone" dataKey="points" stroke="#2563EB" strokeWidth={4} activeDot={{ r: 8 }} />
             </LineChart>
           </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
