import React, { useState } from 'react';
import { useAppContext } from '../store';
import { audioService } from '../utils/audio';
import { motion } from 'motion/react';
import { Sword, Shield, Zap, Heart, Coins, ArrowLeft, Star, Crown } from 'lucide-react';
import { ProgressState } from '../types';

const iconMap: Record<string, any> = {
  Sword, Shield, Zap, Heart, Star
};

export function Shop() {
  const { progress, buyItem, setView, shopItems, updateProgress } = useAppContext();
  const [activeCategory, setActiveCategory] = useState<'all' | 'weapon' | 'armor' | 'potion'>('all');
  
  const isPro = progress.isPro || false;

  // Let's categorize items based on ID prefixes
  const getCategory = (itemId: string) => {
    if (itemId.startsWith('sword_') || itemId.startsWith('wand_')) return 'weapon';
    if (itemId.startsWith('armor_')) return 'armor';
    if (itemId.startsWith('potion_')) return 'potion';
    return 'weapon';
  };

  const filteredItems = shopItems.filter(item => {
    if (activeCategory === 'all') return true;
    return getCategory(item.id) === activeCategory;
  });

  const handleBuy = (itemId: string, price: number) => {
    if (progress.points < price) {
      audioService.playError();
      return;
    }

    // Check custom pro requirements
    const isProItem = itemId.endsWith('_dragon') || itemId.endsWith('_god');
    if (isProItem && !isPro) {
      audioService.playError();
      alert("⚠️ Thiết bị này thuộc danh mục đặc quyền tối thượng của Gói Toàn Diện PRO! Vui lòng nâng cấp gói PRO của bạn ở mục Trận chiến Boss để mở khoá tậu ngay!");
      return;
    }

    audioService.playSuccess();
    buyItem(itemId, price);
  };

  const toggleProTest = () => {
    audioService.playClick();
    if (updateProgress) {
      updateProgress((prev: ProgressState) => ({
        ...prev,
        isPro: !prev.isPro
      }));
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setView('boss-battle')}
            className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors dark:bg-slate-800 dark:hover:bg-slate-700 cursor-pointer"
          >
            <ArrowLeft className="w-6 h-6 text-slate-700 dark:text-slate-300" />
          </button>
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Cửa Hàng Vật Phẩm</h1>
            <p className="text-xs text-slate-500 font-medium">Trang bị các thần khí, áo giáp và tiên dược chuẩn bị chiến đấu</p>
          </div>
        </div>

        {/* Currency Display & Pro status Toggle */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Pro Switcher inside shop */}
          <button
            onClick={toggleProTest}
            className={`px-4 py-2 rounded-2xl font-black text-xs transition flex items-center gap-1 border ${isPro ? 'bg-yellow-100 text-yellow-800 border-yellow-300' : 'bg-slate-150 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700'}`}
          >
            <Crown size={14} className={isPro ? 'text-yellow-500 fill-current' : ''} />
            {isPro ? 'GÓI PRO ĐÃ MỞ ⭐' : 'NÂNG PRO [TEST]'}
          </button>

          <div className="flex items-center gap-2 bg-amber-100 text-amber-700 px-5 py-2.5 rounded-2xl font-black text-lg border border-amber-200 shadow-xs">
            <Coins className="w-6 h-6 text-amber-500" />
            <span>{progress.points || 0} xu</span>
          </div>
        </div>
      </div>

      {/* Category Tabs inside shop */}
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl gap-2 mb-10 max-w-md">
        <button
          onClick={() => {
            audioService.playClick();
            setActiveCategory('all');
          }}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black transition ${activeCategory === 'all' ? 'bg-white dark:bg-slate-700 text-slate-950 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          🔮 Tất Cả
        </button>
        <button
          onClick={() => {
            audioService.playClick();
            setActiveCategory('weapon');
          }}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black transition ${activeCategory === 'weapon' ? 'bg-white dark:bg-slate-700 text-slate-950 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          🗡️ Vũ Khí
        </button>
        <button
          onClick={() => {
            audioService.playClick();
            setActiveCategory('armor');
          }}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black transition ${activeCategory === 'armor' ? 'bg-white dark:bg-slate-700 text-slate-950 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          🛡️ Giáp Bộ
        </button>
        <button
          onClick={() => {
            audioService.playClick();
            setActiveCategory('potion');
          }}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black transition ${activeCategory === 'potion' ? 'bg-white dark:bg-slate-700 text-slate-950 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          🧪 Tiêu Thụ
        </button>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredItems.map(item => {
          const IconComponent = iconMap[item.icon as string] || Sword;
          const category = getCategory(item.id);
          const isLmsProItem = item.id.endsWith('_dragon') || item.id.endsWith('_god');
          const isPowerLocked = isLmsProItem && !isPro;

          return (
            <div 
              key={item.id} 
              className={`bg-white dark:bg-slate-800 rounded-[30px] p-6 shadow-sm border hover:shadow-lg transition flex flex-col relative overflow-hidden ${isLmsProItem ? 'border-amber-300 dark:border-yellow-950' : 'border-slate-200/60 dark:border-slate-700'}`}
            >
              {/* Pro Badge */}
              {isLmsProItem && (
                <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 font-black px-2.5 py-0.5 rounded-full text-[9px] tracking-widest uppercase flex items-center gap-1">
                  <Crown size={8} /> Pro Only
                </div>
              )}

              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 shadow-inner ${item.color} text-white font-extrabold text-2xl`}>
                <IconComponent className="w-7 h-7 text-white" />
              </div>

              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2 leading-snug">
                {item.name}
              </h3>
              
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 font-medium leading-relaxed flex-1">
                {item.description}
              </p>
              
              <div className="flex items-center justify-between mt-auto">
                <span className="font-extrabold text-amber-600 dark:text-amber-400 flex items-center gap-1 text-sm">
                  <Coins className="w-4 h-4" /> {item.price}
                </span>
                
                <button 
                  onClick={() => handleBuy(item.id, item.price)}
                  disabled={(progress.points || 0) < item.price}
                  className={`font-black text-xs px-4 py-2.5 rounded-xl transition shadow-xs cursor-pointer ${
                    isPowerLocked 
                      ? 'bg-amber-100 text-amber-800 hover:brightness-105 border border-amber-300' 
                      : 'bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:dark:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed text-white'
                  }`}
                >
                  {isPowerLocked ? 'Mở khoá [PRO]' : 'Mua ngay'}
                </button>
              </div>
              
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 text-[10px] font-bold text-slate-400">
                 Đang có sẵn: {progress.inventory?.[item.id] || 0} cái
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
