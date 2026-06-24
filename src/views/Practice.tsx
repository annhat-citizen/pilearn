import { useState } from 'react';
import { useAppContext } from '../store';
import { Search, Filter, ChevronRight, Code2, Star, Clock, Users, PlayCircle, Terminal, Award, Sparkles } from 'lucide-react';

const projects = [
  { id: 1, title: 'Máy tính cơ bản', desc: 'Xây dựng máy tính với các phép toán cơ bản.', lang: 'Python', level: 'Dễ', lessons: 3, time: '30 phút', stars: 4.5, students: 234, color: 'blue' },
  { id: 2, title: 'Quiz game', desc: 'Tạo trò chơi đố vui với câu hỏi trắc nghiệm.', lang: 'Python', level: 'Dễ', lessons: 4, time: '45 phút', stars: 4.8, students: 189, color: 'emerald' },
  { id: 3, title: 'Quản lý sinh viên', desc: 'Hệ thống quản lý thông tin sinh viên với CRUD.', lang: 'JavaScript', level: 'Trung bình', lessons: 6, time: '1.5 giờ', stars: 4.3, students: 156, color: 'purple' },
  { id: 4, title: 'Web bán hàng', desc: 'Xây dựng trang web bán hàng đơn giản.', lang: 'HTML/CSS', level: 'Trung bình', lessons: 8, time: '2 giờ', stars: 4.6, students: 198, color: 'amber' },
  { id: 5, title: 'Snake game', desc: 'Lập trình game rắn săn mồi cổ điển.', lang: 'Python', level: 'Khó', lessons: 5, time: '2 giờ', stars: 4.9, students: 312, color: 'rose' },
  { id: 6, title: 'API RESTful', desc: 'Xây dựng RESTful API với Express và Node.js.', lang: 'JavaScript', level: 'Khó', lessons: 7, time: '2.5 giờ', stars: 4.2, students: 87, color: 'cyan' },
];

const levelBadges: Record<string, string> = {
  'Dễ': 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400',
  'Trung bình': 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400',
  'Khó': 'bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400',
};

const langColors: Record<string, string> = {
  'Python': 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400',
  'JavaScript': 'bg-yellow-50 text-yellow-600 dark:bg-yellow-950/30 dark:text-yellow-400',
  'HTML/CSS': 'bg-orange-50 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400',
};

export function Practice() {
  const { setView } = useAppContext();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string | null>(null);

  const filters = ['Tất cả', 'Dễ', 'Trung bình', 'Khó'];
  const filtered = projects.filter(p => {
    if (filter && filter !== 'Tất cả' && p.level !== filter) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.desc.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-primary-500">Thực hành</span>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">Dự án thực hành</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1.5">Áp dụng kiến thức vào các dự án thực tế</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setView('roadmap')} className="cl-btn cl-btn-outline text-sm">Lộ trình</button>
          <button onClick={() => setView('lesson')} className="cl-btn cl-btn-primary text-sm flex items-center gap-1">
            <PlayCircle className="w-4 h-4" /> Học ngay
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm kiếm dự án..."
            className="cl-input pl-10" />
        </div>
        <div className="flex gap-1 overflow-x-auto pb-1">
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f === 'Tất cả' ? null : f)}
              className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                (filter === null && f === 'Tất cả') || filter === f
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700'
              }`}
            >{f === 'Tất cả' ? <Filter className="w-3.5 h-3.5 inline mr-1 -mt-0.5" /> : null}{f}</button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(p => (
          <div key={p.id} className="cl-card overflow-hidden group cursor-pointer hover:border-primary-200 dark:hover:border-primary-700 transition-all"
            onClick={() => setView('lesson')}>
            <div className={`h-2 bg-gradient-to-r ${
              p.color === 'blue' ? 'from-blue-400 to-blue-600' :
              p.color === 'emerald' ? 'from-emerald-400 to-emerald-600' :
              p.color === 'purple' ? 'from-purple-400 to-purple-600' :
              p.color === 'amber' ? 'from-amber-400 to-amber-600' :
              p.color === 'rose' ? 'from-rose-400 to-rose-600' :
              'from-cyan-400 to-cyan-600'
            }`} />
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`cl-badge ${langColors[p.lang] || 'bg-gray-50 text-gray-600'}`}>{p.lang}</span>
                  <span className={`cl-badge ${levelBadges[p.level] || 'bg-gray-50 text-gray-600'}`}>{p.level}</span>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-amber-400" /> {p.stars}
                </div>
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1.5">{p.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{p.desc}</p>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1"><Code2 className="w-3.5 h-3.5" /> {p.lessons} bài</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {p.time}</span>
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {p.students}</span>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-800">
                <button className="w-full cl-btn cl-btn-outline text-xs group-hover:cl-btn-primary transition-all">
                  <Terminal className="w-3.5 h-3.5 mr-1.5" /> Bắt đầu thực hành
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Terminal className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Không tìm thấy dự án phù hợp</p>
          <button onClick={() => { setSearch(''); setFilter(null); }} className="cl-btn cl-btn-ghost text-sm mt-2">Xóa bộ lọc</button>
        </div>
      )}

      <div className="mt-8 cl-card p-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0">
        <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-amber-400" />
            <div>
              <h3 className="font-bold">Bạn muốn thử thách bản thân?</h3>
              <p className="text-sm text-gray-400">Tham gia cuộc thi lập trình hàng tuần với các bạn học sinh khác</p>
            </div>
          </div>
          <button className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-xl transition-all whitespace-nowrap shrink-0 active:scale-[0.97]">
            Tham gia ngay
          </button>
        </div>
      </div>
    </div>
  );
}
