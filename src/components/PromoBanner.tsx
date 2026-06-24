import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';

export function PromoBanner() {
  const [isVisible, setIsVisible] = useState(() => {
    return localStorage.getItem('pilearn_promo_banner_closed') !== 'true';
  });

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-[#0052cc] via-[#0066ee] to-[#00b4ff] text-white py-2.5 px-4 text-center text-xs sm:text-sm font-medium relative z-[100] flex items-center justify-between shadow-sm">
      <div className="flex-1 flex items-center justify-center gap-2.5">
        <Sparkles className="w-4 h-4 shrink-0 text-yellow-200" />
        <span className="hidden md:inline">
          Mở khóa toàn bộ lộ trình Python Pro và nhận trợ giúp Sư Phụ AI 24/7!
        </span>
        <span className="md:hidden">
          Python Pro & Sư phụ AI - Ưu đãi đặc biệt!
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
          className="ml-2 bg-white text-[#0052cc] hover:bg-slate-100 font-bold px-3.5 py-1.5 rounded-lg text-xs transition-all active:scale-95 inline-flex items-center gap-1"
        >
          Đăng ký ngay
          <span className="text-xs">→</span>
        </a>
      </div>
      <button
        onClick={() => {
          setIsVisible(false);
          localStorage.setItem('pilearn_promo_banner_closed', 'true');
        }}
        className="text-white/70 hover:text-white transition-colors p-1 ml-2"
        aria-label="Đóng"
      >
        <X size={14} />
      </button>
    </div>
  );
}
