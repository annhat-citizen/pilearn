import React, { useEffect, useState, useRef } from 'react';
import { useAppContext } from '../store';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy } from 'lucide-react';
import Confetti from 'react-confetti';

export function LevelUpPopup() {
  const { progress } = useAppContext();
  const [show, setShow] = useState(false);
  const [level, setLevel] = useState(1);
  const prevXpRef = useRef(progress?.xp || 0);

  useEffect(() => {
    const currentXp = progress?.xp || 0;
    const prevLevel = Math.floor(prevXpRef.current / 100) + 1;
    const currentLevel = Math.floor(currentXp / 100) + 1;

    if (currentLevel > prevLevel) {
      setLevel(currentLevel);
      setShow(true);
      setTimeout(() => setShow(false), 5000);
    }
    
    prevXpRef.current = currentXp;
  }, [progress?.xp]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} />
          
          <motion.div 
            className="bg-white p-8 rounded-[40px] shadow-2xl border-4 border-amber-400 flex flex-col items-center gap-4 pointer-events-auto"
            initial={{ scale: 0.5, y: 100 }}
            animate={{ scale: 1, y: 0, rotate: [-2, 2, -1, 1, 0] }}
            transition={{ 
              type: 'spring', 
              bounce: 0.5, 
              duration: 1,
              rotate: { type: 'tween', ease: 'easeInOut', duration: 1 }
            }}
          >
            <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center">
               <Trophy className="w-12 h-12 text-amber-500" />
            </div>
            <h2 className="text-3xl font-black text-slate-800 text-center">Chúc Mừng!</h2>
            <p className="text-xl font-bold text-amber-500 text-center">Bạn đã thăng lên Level {level}! 🎉</p>
            <button 
              onClick={() => setShow(false)}
              className="mt-4 px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-full transition-colors"
            >
              Tiếp tục học
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
