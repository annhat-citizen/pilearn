import { useState } from 'react';
import { useAppContext } from '../store';
import { Search, Filter, ChevronRight, BookOpen, Award, Clock, Users, Star, Lock, CheckCircle, PlayCircle } from 'lucide-react';

const chapters = [
  { id: 1, title: 'Nhập môn lập trình', desc: 'Làm quen với tư duy lập trình và các khái niệm cơ bản.', lessons: 12, duration: '4 giờ', level: 'Cơ bản', progress: 80, color: 'blue', icon: '💻' },
  { id: 2, title: 'Biến và kiểu dữ liệu', desc: 'Tìm hiểu về biến, hằng số và các kiểu dữ liệu trong lập trình.', lessons: 10, duration: '3 giờ', level: 'Cơ bản', progress: 60, color: 'emerald', icon: '📊' },
  { id: 3, title: 'Câu điều kiện', desc: 'Học cách sử dụng cấu trúc rẽ nhánh if-else trong chương trình.', lessons: 8, duration: '2.5 giờ', level: 'Cơ bản', progress: 20, color: 'purple', icon: '🧩' },
  { id: 4, title: 'Vòng lặp', desc: 'Làm chủ các vòng lặp for, while để xử lý dữ liệu lặp lại.', lessons: 10, duration: '3 giờ', level: 'Trung bình', progress: 0, color: 'amber', icon: '🔄' },
  { id: 5, title: 'Hàm và tham số', desc: 'Xây dựng các hàm để tái sử dụng code hiệu quả.', lessons: 12, duration: '3.5 giờ', level: 'Trung bình', progress: 0, color: 'rose', icon: '⚙️' },
  { id: 6, title: 'Mảng và danh sách', desc: 'Lưu trữ và xử lý dữ liệu với mảng và danh sách.', lessons: 10, duration: '3 giờ', level: 'Trung bình', progress: 0, color: 'cyan', icon: '📚' },
  { id: 7, title: 'Đồ án cuối khóa', desc: 'Áp dụng tất cả kiến thức để xây dựng dự án hoàn chỉnh.', lessons: 5, duration: '6 giờ', level: 'Nâng cao', progress: 0, color: 'primary', icon: '🚀' },
];

const levelColors: Record<string, string> = {
  'Cơ bản': 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400',
  'Trung bình': 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400',
  'Nâng cao': 'bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400',
};

const statItems = [
  { label: 'Bài học', value: '67', icon: BookOpen, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30' },
  { label: 'Giờ học', value: '25h', icon: Clock, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30' },
  { label: 'Học sinh', value: '1,234', icon: Users, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/30' },
  { label: 'Chứng chỉ', value: '6', icon: Award, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30' },
];

export function Roadmap() {
  const { setView } = useAppContext();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string | null>(null);

  const levels = ['Tất cả', 'Cơ bản', 'Trung bình', 'Nâng cao'];
  const filtered = chapters.filter(c => {
    if (filter && filter !== 'Tất cả' && c.level !== filter) return false;
    if (search && !c.title.toLowerCase().includes(search.toLowerCase()) && !c.desc.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalProgress = Math.round(chapters.reduce((s, c) => s + c.progress, 0) / chapters.length);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-primary-500">Lộ trình</span>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">Lộ trình học tập</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1.5">Học lập trình từ cơ bản đến nâng cao</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setView('student-dashboard')} className="cl-btn cl-btn-outline text-sm">Dashboard</button>
          <button onClick={() => setView('practice')} className="cl-btn cl-btn-primary text-sm">Thực hành</button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {statItems.map((s, i) => (
          <div key={i} className="cl-card p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color} shrink-0`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-extrabold text-gray-900 dark:text-white">{s.value}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="cl-card p-5 mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-gray-900 dark:text-white">Tiến độ tổng quan</span>
          <span className="text-sm font-bold text-primary-500">{totalProgress}%</span>
        </div>
        <div className="w-full h-2.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary-500 to-blue-500 rounded-full transition-all" style={{ width: `${totalProgress}%` }} />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm kiếm chương..."
            className="cl-input pl-10" />
        </div>
        <div className="flex gap-1 overflow-x-auto pb-1">
          {levels.map(l => (
            <button key={l} onClick={() => setFilter(l === 'Tất cả' ? null : l)}
              className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                (filter === null && l === 'Tất cả') || filter === l
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700'
              }`}
            >{l === 'Tất cả' ? <Filter className="w-3.5 h-3.5 inline mr-1 -mt-0.5" /> : null}{l}</button>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {filtered.map(ch => (
          <div key={ch.id} className="cl-card p-5 hover:border-primary-200 dark:hover:border-primary-700 transition-colors cursor-pointer group"
            onClick={() => setView('lesson')}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
                {ch.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="font-bold text-gray-900 dark:text-white">{ch.title}</h3>
                  <span className={`cl-badge ${levelColors[ch.level] || 'bg-gray-50 text-gray-600'}`}>{ch.level}</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{ch.desc}</p>
                <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
                  <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> {ch.lessions} bài học</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {ch.duration}</span>
                </div>
                {ch.progress > 0 && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-500 dark:text-gray-400">Tiến độ</span>
                      <span className="font-semibold text-primary-500">{ch.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${ch.progress}%` }} />
                    </div>
                  </div>
                )}
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all shrink-0 mt-2" />
            </div>
          </div>
        ))}
      </div>

      {filtered.length > 8 && (
        <div className="text-center mt-8">
          <button className="cl-btn cl-btn-outline">Xem thêm <ChevronRight className="w-4 h-4 ml-1" /></button>
        </div>
      )}

      <div className="cl-card mt-8 p-6 bg-gradient-to-br from-primary-500 to-blue-700 text-white text-center border-0">
        <Star className="w-8 h-8 mx-auto mb-3 fill-amber-400 text-amber-400" />
        <h3 className="text-lg font-bold mb-2">Bạn muốn học nâng cao?</h3>
        <p className="text-sm text-blue-100 mb-4 max-w-sm mx-auto">Đăng ký gói PRO để truy cập tất cả khóa học và bài tập nâng cao.</p>
        <button className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-black/20 active:scale-[0.97]">
          Nâng cấp PRO
        </button>
      </div>
    </div>
  );
}
