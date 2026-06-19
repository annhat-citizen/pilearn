import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Check, X } from 'lucide-react';
import { Flashcard as FlashcardType } from '../types';

interface FlashcardProps {
  card: FlashcardType;
  onResult?: (learned: boolean) => void;
}

export function Flashcard({ card, onResult }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="flex flex-col items-center">
      <div 
        className="relative w-full max-w-md h-64 perspective-1000 group cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <motion.div
          className="w-full h-full relative preserve-3d duration-500 rounded-3xl"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Front */}
          <div 
            className="absolute inset-0 backface-hidden w-full h-full bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-700 p-8 flex flex-col items-center justify-center text-center"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <span className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-4">Mặt Trước / Câu Hỏi</span>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{card.front}</h3>
            <p className="mt-8 text-sm text-slate-400 animate-pulse">Nhấp để lật thẻ</p>
          </div>

          {/* Back */}
          <div 
            className="absolute inset-0 backface-hidden w-full h-full bg-blue-50 dark:bg-blue-900/20 rounded-3xl shadow-lg border border-blue-200 dark:border-blue-800 p-8 flex flex-col items-center justify-center text-center"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <span className="text-blue-400 text-sm font-bold uppercase tracking-wider mb-4">Mặt Sau / Trả Lời</span>
            <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-100">{card.back}</h3>
          </div>
        </motion.div>
      </div>

      {isFlipped && onResult && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 flex gap-4"
        >
          <button 
            onClick={() => { setIsFlipped(false); onResult(false); }}
            className="flex items-center gap-2 px-6 py-3 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
            Chưa thuộc
          </button>
          <button 
             onClick={() => onResult(true)}
             className="flex items-center gap-2 px-6 py-3 bg-green-100 hover:bg-green-200 text-green-700 font-bold rounded-full transition-colors"
          >
            <Check className="w-5 h-5" />
            Đã thuộc
          </button>
        </motion.div>
      )}
    </div>
  );
}
