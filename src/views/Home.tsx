import { useEffect, useState } from 'react';
import { useAppContext } from '../store';
import { getLocalNoCodeConfig, NoCodeConfig } from '../lib/nocode_store';
import { NoCodeRenderer } from '../components/NoCodeRenderer';
import { ArrowRight, Sparkles, Shield, Code2, Users, BookOpen, Cpu, GraduationCap, Rocket } from 'lucide-react';

export function Home() {
  const { view, setView, isDataLoaded } = useAppContext();
  const [localConfig, setLocalConfig] = useState<NoCodeConfig>(() => getLocalNoCodeConfig());

  useEffect(() => {
    const handler = () => setLocalConfig(getLocalNoCodeConfig());
    window.addEventListener('storage', handler);
    window.addEventListener('pilearn_config_sync', handler);
    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener('pilearn_config_sync', handler);
    };
  }, []);

  if (!isDataLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (localConfig?.page?.home?.sections?.length > 0) {
    return <NoCodeRenderer page="home" />;
  }

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-500 via-primary-600 to-blue-800">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTQwIDM4djQtSDI0di00aDE2ek00MCAyNHY0SDI0di00aDE2eiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
        <div className="max-w-7xl mx-auto px-6 py-20 md:py-32 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 text-white text-sm font-medium mb-6 backdrop-blur-sm">
              <Sparkles className="w-4 h-4" /> Nền tảng học lập trình số 1 cho học sinh
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-6 tracking-tight">
              Học Lập Trình{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-200">Dễ Dàng</span>
              <br />Cùng PiLearn
            </h1>
            <p className="text-lg md:text-xl text-blue-100 max-w-xl mb-8 leading-relaxed">
              Nền tảng học lập trình trực tuyến thân thiện, vui nhộn và hiệu quả. 
              Phù hợp cho học sinh từ lớp 10 đến lớp 12.
            </p>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => setView('roadmap')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 active:scale-[0.97]"
              >Bắt đầu ngay <ArrowRight className="w-4 h-4" /></button>
              <button onClick={() => setView('roadmap')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/15 hover:bg-white/25 text-white font-semibold rounded-xl backdrop-blur-sm transition-all"
              >Xem lộ trình</button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 dark:from-slate-950 to-transparent" />
      </section>

      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-primary-500">Tính năng</span>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-2">Tại sao chọn PiLearn?</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-3 max-w-lg mx-auto">Nền tảng được thiết kế dành riêng cho học sinh phổ thông</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: BookOpen, title: 'Lộ trình học', desc: 'Bài học từ cơ bản đến nâng cao, phù hợp với mọi trình độ.', color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30' },
            { icon: Code2, title: 'Thực hành ngay', desc: 'Viết code trực tiếp trên trình duyệt với IDE tích hợp sẵn.', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30' },
            { icon: Cpu, title: 'AI hỗ trợ', desc: 'Trợ lý AI thông minh giúp giải đáp thắc mắc 24/7.', color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/30' },
            { icon: Shield, title: 'An toàn', desc: 'Môi trường học tập an toàn, lành mạnh cho học sinh.', color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/30' },
            { icon: Users, title: 'Cộng đồng', desc: 'Kết nối với bạn bè, cùng nhau học tập và phát triển.', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30' },
            { icon: GraduationCap, title: 'Chứng chỉ', desc: 'Nhận chứng chỉ sau mỗi khóa học hoàn thành.', color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950/30' },
          ].map((f, i) => (
            <div key={i} className="cl-card p-6 group cursor-default">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${f.color} mb-4 group-hover:scale-110 transition-transform`}>
                <f.icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-primary-50 dark:bg-primary-950/20 border-y border-primary-100 dark:border-primary-900/30">
        <div className="max-w-7xl mx-auto px-6 py-16 text-center">
          <Rocket className="w-10 h-10 text-primary-500 mx-auto mb-4" />
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-3">Sẵn sàng bắt đầu hành trình?</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">Hàng ngàn học sinh đã bắt đầu học lập trình cùng PiLearn. Bạn còn chờ gì nữa?</p>
          <button onClick={() => setView('roadmap')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl transition-all active:scale-[0.97]"
          >Đăng ký miễn phí <ArrowRight className="w-4 h-4" /></button>
        </div>
      </section>
    </div>
  );
}
