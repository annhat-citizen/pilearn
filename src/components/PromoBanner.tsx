import React, { useState } from 'react';
import { X } from 'lucide-react';

export function PromoBanner() {
  const [isVisible, setIsVisible] = useState(() => {
    return localStorage.getItem('pilearn_promo_banner_closed') !== 'true';
  });

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-purple-800 via-indigo-700 to-purple-800 text-white py-2 px-4 text-center text-xs sm:text-sm font-bold relative z-[100] flex items-center justify-between shadow-md">
      <div className="flex-1 flex items-center justify-center gap-2">
        <span className="bg-amber-400 text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
          LIMITED OFFER - 67% OFF
        </span>
        <span className="text-slate-100 font-bold hidden md:inline">
          Mở khóa toàn bộ lộ trình Python Pro 10 và nhận trợ giúp Sư Phụ AI 24/7!
        </span>
        <span className="text-slate-100 font-bold md:hidden">
          Python Pro & Sư phụ AI giảm 67%!
        </span>
        <a 
          href="#pricing"
          onClick={(e) => {
            const pricingEl = document.getElementById('pricing-block') || document.querySelector('[class*="pricing"]');
            if (pricingEl) {
              e.preventDefault();
              pricingEl.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          className="ml-2 bg-white text-indigo-700 hover:bg-slate-100 font-extrabold px-3 py-1 rounded-full text-xs transition-all shadow-sm active:scale-95 flex items-center gap-1"
        >
          <span>Đăng ký ngay</span>
          <span className="text-[10px]">→</span>
        </a>
      </div>
      <button
        onClick={() => {
          setIsVisible(false);
          localStorage.setItem('pilearn_promo_banner_closed', 'true');
        }}
        className="text-white/60 hover:text-white transition-colors p-1"
        aria-label="Đóng"
      >
        <X size={14} />
      </button>
    </div>
  );
}
