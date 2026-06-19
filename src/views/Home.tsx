import React, { useEffect, useState } from 'react';
import { useAppContext } from '../store';
import { motion, AnimatePresence } from 'motion/react';
import { 
  getLocalNoCodeConfig, 
  saveNoCodeConfigDb, 
  NoCodeConfig, 
  fetchNoCodeConfigDb 
} from '../lib/nocode_store';
import { NoCodeRenderer } from '../components/NoCodeRenderer';
import { 
  Sparkles, Save, X, Edit3, ShieldAlert, 
  Smartphone, Tablet, Monitor, Info, Bell 
} from 'lucide-react';

interface HomeProps {
  previewAlias?: string;
}

export function Home({ previewAlias = 'home' }: HomeProps) {
  const { setView, role, authUser, profile, isEditMode, setIsEditMode } = useAppContext();
  
  const [config, setConfig] = useState<NoCodeConfig>(() => getLocalNoCodeConfig());
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Sync with Firestore on mount
  useEffect(() => {
    const syncDb = async () => {
      setLoading(true);
      const dbConfig = await fetchNoCodeConfigDb();
      setConfig(dbConfig);
      setLoading(false);
    };
    syncDb();

    // Listen to changes from Admin Dashboard
    const handleConfigSync = () => setConfig(getLocalNoCodeConfig());
    window.addEventListener('pilearn_config_sync', handleConfigSync);
    return () => window.removeEventListener('pilearn_config_sync', handleConfigSync);
  }, []);

  const activePage = config.pages.find(p => p.alias === previewAlias) || config.pages[0];

  const handleBlockUpdate = (blockId: string, updatedBlock: any) => {
    setConfig(prev => {
      const updatedPages = prev.pages.map(page => {
        if (page.alias === activePage.alias) {
          return {
            ...page,
            blocks: page.blocks.map(b => b.id === blockId ? { ...b, ...updatedBlock } : b)
          };
        }
        return page;
      });
      return { ...prev, pages: updatedPages };
    });
  };

  const handleSaveLiveChanges = async () => {
    setLoading(true);
    setSaveStatus('Đang đồng bộ hóa dữ liệu lên Firestore...');
    try {
      await saveNoCodeConfigDb(config, profile?.email || 'admin@pilearn.com', `Chỉnh sửa trực tiếp (Live Edit) trang ${activePage.name}`);
      window.dispatchEvent(new Event('pilearn_config_sync'));
      setSaveStatus('🎉 Đã xuất bản mọi thay đổi trực tiếp lên website thành công!');
      setTimeout(() => setSaveStatus(null), 4000);
      setIsEditMode(false);
    } catch (e) {
      setSaveStatus('❌ Lỗi lưu dữ liệu. Đã sao lưu bản nháp tại Local Storage.');
      setTimeout(() => setSaveStatus(null), 4000);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelLiveChanges = () => {
    setConfig(getLocalNoCodeConfig());
    setIsEditMode(false);
  };

  return (
    <div className="w-full relative min-h-screen">
      {/* 1. Dynamic System Announcement Banner (If checked by admin) */}
      {config.systemSettings.showNotificationOnHome && config.systemSettings.systemNotification && (
        <div className="bg-amber-500 text-slate-900 font-bold py-2.5 px-4 text-center text-xs sm:text-sm flex items-center justify-center gap-2 animate-pulse relative z-20">
          <Bell size={14} className="shrink-0" />
          <span>{config.systemSettings.systemNotification}</span>
        </div>
      )}

      {/* 2. Floating Admin Bar for Live Inline Editing */}
      {role === 'super_admin' && (
        <div className="sticky top-20 z-50 max-w-5xl mx-auto px-4 mt-2">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-4 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                <Sparkles size={16} className="text-white" />
              </div>
              <div>
                <h4 className="text-xs font-black tracking-wide uppercase text-blue-400">Trình Chỉnh Sửa Trực Tiếp (Live Builder)</h4>
                <p className="text-[10px] text-slate-400">Bạn đang xem với quyền Admin. Click trực tiếp lên bất kỳ văn bản nào để sửa.</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button 
                onClick={() => setIsEditMode(!isEditMode)}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer select-none ${
                  isEditMode 
                    ? 'bg-amber-500 text-slate-950 font-black scale-105' 
                    : 'bg-slate-800 text-slate-200 hover:bg-slate-755'
                }`}
              >
                <Edit3 size={13} />
                <span>{isEditMode ? '⏸️ Tắt Chỉnh Sửa' : '⚡ Bật Click Sửa Trực Tiếp'}</span>
              </button>

              {isEditMode && (
                <div className="flex items-center gap-2.5 border-l border-slate-800 pl-2.5">
                  <button 
                    onClick={handleSaveLiveChanges}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer"
                  >
                    <Save size={13} />
                    <span>Lưu Trực Tiếp</span>
                  </button>
                  <button 
                    onClick={handleCancelLiveChanges}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl flex items-center gap-1 cursor-pointer"
                  >
                    <X size={13} />
                    <span>Hủy</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <AnimatePresence>
            {saveStatus && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-yellow-500 text-slate-950 text-xs font-black px-4 py-2.5 rounded-xl mt-2 text-center shadow-md border border-amber-600/20"
              >
                {saveStatus}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* 3. Core dynamic page renderer */}
      <div className="relative z-10 w-full">
        {loading && !config ? (
          <div className="py-24 text-center text-sm font-semibold text-slate-500">
             Đang đồng bộ giao diện No-Code...
          </div>
        ) : (
          <NoCodeRenderer 
            blocks={activePage.blocks}
            appearance={{ ...config.appearance, ...(activePage?.appearance || {}) }}
            isLiveEditing={isEditMode}
            onBlockUpdate={handleBlockUpdate}
            onMoveBlock={(id, dir) => {
              setConfig(prev => {
                const updatedPages = prev.pages.map(p => {
                  if (p.alias === activePage.alias) {
                    const blockIdx = p.blocks.findIndex(b => b.id === id);
                    if (blockIdx === -1) return p;
                    const nextIdx = dir === 'up' ? blockIdx - 1 : blockIdx + 1;
                    if (nextIdx < 0 || nextIdx >= p.blocks.length) return p;
                    
                    const newBlocks = [...p.blocks];
                    const temp = newBlocks[blockIdx];
                    newBlocks[blockIdx] = newBlocks[nextIdx];
                    newBlocks[nextIdx] = temp;
                    return { ...p, blocks: newBlocks };
                  }
                  return p;
                });
                return { ...prev, pages: updatedPages };
              });
            }}
            onDeleteBlock={(id) => {
              if(!confirm('Bạn chắc chắn muốn xóa khối nội dung này?')) return;
              setConfig(prev => {
                const updatedPages = prev.pages.map(p => {
                  if (p.alias === activePage.alias) {
                    return { ...p, blocks: p.blocks.filter(b => b.id !== id) };
                  }
                  return p;
                });
                return { ...prev, pages: updatedPages };
              });
            }}
            onAddBlockClick={(insertIdx) => {
              const types: any[] = ['banner', 'text', 'video', 'cta', 'testimonial', 'ai', 'quiz', 'game', 'faq', 'pricing'];
              const chosen = prompt(`Chọn loại khối bạn muốn thêm mới: \n\n${types.join(', ')} \n\nVí dụ: text`);
              if (!chosen || !types.includes(chosen.trim().toLowerCase())) {
                alert('Loại khối không hợp lệ!');
                return;
              }
              const newType = chosen.trim().toLowerCase() as any;

              // Draft template layouts
              const newBlockMap: Record<string, Partial<any>> = {
                banner: { title: 'Dòng tiêu đề Banner mới', subtitle: 'Phụ đề banner tinh gọn...', buttonText: 'Đăng ký học', imageUrl: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=2070&auto=format&fit=crop' },
                text: { title: 'Văn bản hướng dẫn', content: 'Nội dung khối văn bản mới của bạn.' },
                video: { title: 'Khám phá bài giảng', videoUrl: 'https://youtube.com' },
                cta: { title: 'Bắt đầu lập trình cùng Pilearn!', subtitle: 'Nhận vô vàn điểm thưởng và săn Boss quái vật.', buttonText: 'Bắt đầu ngay' },
                testimonial: { title: 'Phản Hồi Mới', subtitle: 'Những nhận xét chân tình tuyệt hảo', testimonials: [{ name: 'Học sinh ẩn danh', school: 'THPT Việt Đức', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256', quote: 'LMS tốt nhất cả khu vực!', rating: 5 }] },
                ai: { title: 'Trợ Lý Trí Tuệ Nhân Tạo Gia Sư', subtitle: 'Hãy đặt câu hỏi khó về Python cho AI' },
                quiz: { title: 'Câu hỏi kích thích suy luận', quizQuestions: [{ prompt: 'Ký hiệu bình phương (mũ) trong Python là gì?', options: ['^', '**', '*'], answer: 1 }] },
                game: { title: 'Thử thách lập trình nhỏ', subtitle: 'Viết biến kết quả', gameText: 'x = 10\ny = 20\nans = _____ # Điền x + y \nprint(ans)', gameExpectedAnswer: 'x + y', gameHint: 'Nghĩ cách cộng x và y lại với nhau' },
                faq: { title: 'Giải đáp thắc mắc', faqItems: [{ question: 'Tôi có thể tải code về máy nhà không?', answer: 'Hoàn toàn được! Bạn có thể copy trực tiếp code từ trình IDE của Pilearn.' }] },
                pricing: { title: 'Bảng phí thành viên', pricingTiers: [{ name: 'Trường học liên danh', price: 'Vui lòng liên hệ', period: 'Tháng', features: ['Quản lý toàn trường', 'Xuất excel học lực', 'Cấp chứng chỉ ký số'], highlight: true }] }
              };

              const createdBlock = {
                id: `block-${Date.now()}`,
                type: newType,
                ...newBlockMap[newType],
                align: 'left' as any,
                paddingY: 10
              };

              setConfig(prev => {
                const updatedPages = prev.pages.map(page => {
                  if (page.alias === activePage.alias) {
                    const newBlocks = [...page.blocks];
                    newBlocks.splice(insertIdx, 0, createdBlock);
                    return { ...page, blocks: newBlocks };
                  }
                  return page;
                });
                return { ...prev, pages: updatedPages };
              });
            }}
          />
        )}
      </div>
    </div>
  );
}
