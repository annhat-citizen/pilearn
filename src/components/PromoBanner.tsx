import { useAppContext } from "../store";
import { getLocalNoCodeConfig, NoCodeConfig } from "../lib/nocode_store";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

export function PromoBanner() {
  const [localConfig, setLocalConfig] = useState<NoCodeConfig>(() => getLocalNoCodeConfig());
  const [dismissed, setDismissed] = useState(() => localStorage.getItem("promo_dismissed") === "true");

  useEffect(() => {
    const handler = () => setLocalConfig(getLocalNoCodeConfig());
    window.addEventListener("storage", handler);
    window.addEventListener("pilearn_config_sync", handler);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("pilearn_config_sync", handler);
    };
  }, []);

  if (dismissed) return null;

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-primary-500 via-primary-600 to-blue-700">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/20 text-white text-xs font-bold uppercase tracking-wider">
            Mới
          </span>
          <p className="text-sm text-white/90 font-medium truncate">
            {localConfig.promo?.mainText || "Giảm 50% học phí khóa học lập trình - Chỉ áp dụng cho tháng này!"}
          </p>
          <button className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-white bg-white/20 hover:bg-white/30 px-4 py-1.5 rounded-md transition-colors shrink-0 whitespace-nowrap">
            {localConfig.promo?.ctaText || "Tìm hiểu ngay"}
            <span className="text-lg leading-none">→</span>
          </button>
        </div>
        <button onClick={() => { setDismissed(true); localStorage.setItem("promo_dismissed", "true"); }}
          className="shrink-0 p-1 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-colors"
        ><X className="w-4 h-4" /></button>
      </div>
    </div>
  );
}
