import React from 'react';
import { useAppContext } from '../store';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, Sparkles } from 'lucide-react';
import Confetti from 'react-confetti';

export function StreakPopup() {
  const { progress, dismissStreakPopup } = useAppContext();
  const show = progress?.showStreakPopup || false;
  const streak = progress?.streak || 0;

  // Render titles depending on how high the streak is
  const getStreakTitle = (s: number) => {
    if (s === 1) return 'Thắp Sáng Ngọn Lửa! 🔥';
    if (s >= 7) return 'Ngọn Lửa Bất Diệt! 👑';
    return 'Chuỗi Ngày Rực Cháy! ⚡';
  };

  const getStreakSubtitle = (s: number) => {
    if (s === 1) return 'Bạn đã thắp lại ngọn lửa học tập hôm nay!';
    return `Chúc mừng bạn đã duy trì học tập liên tục ${s} ngày!`;
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {streak >= 3 && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} />}
          
          <motion.div 
            className="bg-white dark:bg-slate-800 p-8 rounded-[40px] shadow-3xl border-4 border-orange-500 flex flex-col items-center gap-5 pointer-events-auto max-w-sm mx-4 relative overflow-hidden"
            initial={{ scale: 0.5, y: 100 }}
            animate={{ scale: 1, y: 0, rotate: [-1, 2, -1, 1, 0] }}
            exit={{ scale: 0.8, y: -50, opacity: 0 }}
            transition={{ 
              type: 'spring', 
              bounce: 0.4, 
              duration: 0.8,
              rotate: { type: 'tween', ease: 'easeInOut', duration: 0.8 }
            }}
          >
            {/* Sparkle effects on top corners */}
            <div className="absolute top-4 left-4 text-orange-400">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div className="absolute top-4 right-4 text-yellow-400">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>

            {/* Pulsing flame outline container */}
            <div className="relative flex items-center justify-center w-28 h-28 bg-orange-100 dark:bg-orange-950/40 rounded-full border border-orange-200">
              <motion.div
                className="absolute inset-0 bg-orange-400/20 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute inset-2 bg-orange-500/30 rounded-full"
                animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
              <Flame className="w-16 h-16 text-orange-500 fill-orange-500 z-10 drop-shadow-lg" />
            </div>

            {/* Streak Number badge */}
            <div className="px-5 py-1.5 rounded-full bg-orange-500 text-white font-extrabold text-lg shadow-sm border border-orange-400">
              {streak} NGÀY LIÊN TIẾP
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-slate-800 dark:text-white">
                {getStreakTitle(streak)}
              </h2>
              <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                {getStreakSubtitle(streak)}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Hãy cố gắng giữ vững phong độ nhé! Quá 3 ngày không học bài là ngọn lửa của bạn sẽ lụi tàn đó.
              </p>
            </div>

            <button 
              onClick={dismissStreakPopup}
              className="mt-2 w-full px-8 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black rounded-full transition-all duration-200 shadow-md transform hover:-translate-y-0.5 active:translate-y-0"
            >
              Học tiếp thắp lửa! 🔥
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
