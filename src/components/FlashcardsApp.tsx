import React, { useState, useEffect } from 'react';
import { Flashcard as FlashcardType, Lesson } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Layers, Pencil, Grid2x2, FileCheck, ArrowLeft } from 'lucide-react';
import { useAppContext } from '../store';
import { Flashcard as FlashcardComponent } from './Flashcard';

type Mode = 'menu' | 'flashcards' | 'match' | 'write' | 'test';

export function FlashcardsApp({ lesson }: { lesson: Lesson }) {
  const { addXP } = useAppContext();
  const [mode, setMode] = useState<Mode>('menu');

  if (!lesson.flashcards || lesson.flashcards.length === 0) return null;

  return (
    <div className="w-full max-w-4xl mx-auto py-8">
      {mode !== 'menu' && (
        <button 
          onClick={() => setMode('menu')}
          className="mb-8 flex items-center text-slate-500 hover:text-slate-800 font-bold transition px-4 py-2 hover:bg-slate-100 rounded-full"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Trở lại danh sách Game
        </button>
      )}

      <AnimatePresence mode="wait">
        {mode === 'menu' && (
           <motion.div key="menu" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
              <MenuMode onSelect={setMode} />
           </motion.div>
        )}
        {mode === 'flashcards' && (
           <motion.div key="flashcards" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <FlashcardsMode cards={lesson.flashcards} onComplete={() => { addXP(50); setMode('menu') }} />
           </motion.div>
        )}
        {mode === 'match' && (
           <motion.div key="match" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <MatchMode cards={lesson.flashcards} onComplete={() => { addXP(50); setMode('menu') }} />
           </motion.div>
        )}
        {mode === 'write' && (
           <motion.div key="write" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <WriteMode cards={lesson.flashcards} onComplete={() => { addXP(50); setMode('menu') }} />
           </motion.div>
        )}
        {mode === 'test' && (
           <motion.div key="test" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <TestMode cards={lesson.flashcards} onComplete={() => { addXP(50); setMode('menu') }} />
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuMode({ onSelect }: { onSelect: (m: Mode) => void }) {
  const modes = [
    { id: 'flashcards', name: 'Lật Thẻ', desc: 'Học thuộc với flashcards', icon: Layers, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' },
    { id: 'match', name: 'Ghép Thẻ', desc: 'Tìm nhanh đúng cặp', icon: Grid2x2, color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-200' },
    { id: 'write', name: 'Viết', desc: 'Gõ để trả lời chính xác', icon: Pencil, color: 'text-teal-500', bg: 'bg-teal-50', border: 'border-teal-200' },
    { id: 'test', name: 'Kiểm Tra', desc: 'Quiz ngẫu nhiên tự tạo', icon: FileCheck, color: 'text-indigo-500', bg: 'bg-indigo-50', border: 'border-indigo-200' },
  ];

  return (
    <div>
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-slate-800">Bộ Công Cụ Ôn Tập (4 Game)</h3>
        <p className="text-slate-500">Giáo viên đã tạo bộ thuật ngữ cho bạn. Chọn một cách để học thuật ngữ dưới đây!</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {modes.map(m => (
          <button
            key={m.id}
            onClick={() => onSelect(m.id as Mode)}
            className={`flex flex-col items-center justify-center p-6 rounded-3xl border-2 ${m.border} bg-white hover:${m.bg} hover:shadow-lg transition-all hover:-translate-y-1 active:scale-95 group`}
          >
            <div className={`p-4 rounded-full ${m.bg} group-hover:scale-110 transition-transform mb-4`}>
                <m.icon className={`w-8 h-8 ${m.color}`} />
            </div>
            <span className="font-bold text-slate-800 text-lg">{m.name}</span>
            <span className="text-xs text-slate-500 mt-1 font-medium">{m.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function FlashcardsMode({ cards, onComplete }: { cards: FlashcardType[], onComplete: () => void }) {
  const [queue, setQueue] = useState<FlashcardType[]>(cards);
  const [completed, setCompleted] = useState<FlashcardType[]>([]);
  const [isDone, setIsDone] = useState(false);

  const currentCard = queue[0];

  const handleResult = (learned: boolean) => {
    if (learned) {
      setCompleted([...completed, currentCard]);
      const newQueue = queue.slice(1);
      if (newQueue.length === 0) setIsDone(true);
      else setQueue(newQueue);
    } else {
      setQueue([...queue.slice(1), currentCard]);
    }
  };

  if (!currentCard && !isDone) return null;

  if (isDone) {
    return (
       <div className="text-center py-12 bg-white rounded-3xl border border-blue-100 shadow-sm">
           <Sparkles className="w-16 h-16 text-blue-500 mx-auto mb-4" />
           <h3 className="text-3xl font-black text-slate-800 mb-2">Quá Đỉnh!</h3>
           <p className="text-slate-500 font-medium mb-8">Bạn đã lật xong toàn bộ bộ thẻ.</p>
           <button onClick={onComplete} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition-colors">+50 XP & Trở Về</button>
       </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
      <div className="text-center font-bold text-sm text-slate-400 mb-6 bg-slate-100 py-1.5 px-4 rounded-full">
        Tiến độ thẻ lật: {completed.length} / {cards.length}
      </div>
      <FlashcardComponent card={currentCard} onResult={handleResult} />
    </div>
  )
}

function MatchMode({ cards, onComplete }: { cards: FlashcardType[], onComplete: () => void }) {
  type CardItem = { id: string, text: string, type: 'front' | 'back', pairId: string };
  const [items, setItems] = useState<CardItem[]>([]);
  const [selected, setSelected] = useState<CardItem | null>(null);
  const [matchedIds, setMatchedIds] = useState<Set<string>>(new Set());
  const [errorId, setErrorId] = useState<string | null>(null);

  useEffect(() => {
    const list: CardItem[] = [];
    cards.forEach(c => {
      list.push({ id: c.id + '_f', text: c.front, type: 'front', pairId: c.id });
      list.push({ id: c.id + '_b', text: c.back, type: 'back', pairId: c.id });
    });
    setItems(list.sort(() => Math.random() - 0.5));
  }, [cards]);

  const handleClick = (item: CardItem) => {
    if (matchedIds.has(item.pairId) || item.id === selected?.id) return;
    
    if (!selected) {
      setSelected(item);
      return;
    }

    if (selected.pairId === item.pairId) {
      const next = new Set(matchedIds);
      next.add(item.pairId);
      setMatchedIds(next);
      setSelected(null);
      if (next.size === cards.length) {
         setTimeout(onComplete, 1000); 
      }
    } else {
      setErrorId(item.id);
      setTimeout(() => {
         setSelected(null);
         setErrorId(null);
      }, 500);
    }
  };

  if (matchedIds.size === cards.length && cards.length > 0) {
      return (
         <div className="text-center py-12 bg-white rounded-3xl border border-purple-100 shadow-sm animate-in fade-in zoom-in duration-500">
             <div className="w-20 h-20 bg-purple-100 flex items-center justify-center rounded-full mx-auto mb-6">
                 <Grid2x2 className="w-10 h-10 text-purple-600" />
             </div>
             <h3 className="text-3xl font-black text-slate-800 mb-2">Thần Tốc!</h3>
             <p className="text-slate-500 font-medium mb-8">Bạn đã ghép xong mọi cặp từ chính xác.</p>
             <button onClick={onComplete} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full transition">+50 XP & Trở Về</button>
         </div>
      );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-6 rounded-3xl border border-slate-200">
      {items.map(item => {
        const isMatched = matchedIds.has(item.pairId);
        const isSelected = selected?.id === item.id;
        const isError = errorId === item.id || (errorId && isSelected);
        
        let style = "bg-white text-slate-700 border-slate-200 hover:border-purple-400 hover:shadow-md cursor-pointer";
        if (isSelected) style = "bg-purple-500 border-purple-600 text-white shadow-lg scale-105";
        if (isError) style = "bg-red-500 border-red-600 text-white shake-animation";
        if (isMatched) style = "opacity-0 pointer-events-none scale-75";

        return (
          <button 
            key={item.id}
            onClick={() => handleClick(item)}
            className={`p-4 rounded-xl border-2 font-bold min-h-[120px] flex items-center justify-center text-center transition-all duration-300 ${style}`}
          >
            {item.text}
          </button>
        )
      })}
    </div>
  )
}

function WriteMode({ cards, onComplete }: { cards: FlashcardType[], onComplete: () => void }) {
  const [queue, setQueue] = useState<FlashcardType[]>([]);
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
     setQueue([...cards].sort(() => Math.random() - 0.5));
  }, [cards]);

  const current = queue[0];

  const check = (e: React.FormEvent) => {
    e.preventDefault();
    if (!current) return;
    if (input.trim().toLowerCase() === current.front.trim().toLowerCase()) {
      setError(false);
      setInput('');
      const nq = queue.slice(1);
      if (nq.length === 0) setIsDone(true);
      else setQueue(nq);
    } else {
      setError(true);
    }
  };

  if (isDone) {
    return (
       <div className="text-center py-12 bg-white rounded-3xl border border-teal-100 shadow-sm">
           <div className="w-20 h-20 bg-teal-100 flex items-center justify-center rounded-full mx-auto mb-6">
               <Pencil className="w-10 h-10 text-teal-600" />
           </div>
           <h3 className="text-3xl font-black text-slate-800 mb-2">Tay phím vàng!</h3>
           <p className="text-slate-500 font-medium mb-8">Bạn đã gõ chính xác toàn bộ từ vựng.</p>
           <button onClick={onComplete} className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-8 rounded-full transition">+50 XP & Trở Về</button>
       </div>
    )
  }

  if (!current) return null;

  return (
    <div className="max-w-md mx-auto text-center animate-in slide-in-from-bottom-4 duration-500">
       <div className="text-sm font-bold text-slate-400 mb-4 bg-slate-100 py-1.5 px-4 rounded-full inline-block">Còn lại: {queue.length} chữ</div>
       <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-200 mb-8 min-h-[200px] flex flex-col justify-center">
          <span className="text-xs uppercase font-bold text-teal-500 tracking-wider mb-4">Gõ lại từ tương ứng với nghĩa này</span>
          <h3 className="text-2xl font-bold text-slate-800 leading-tight">{current.back}</h3>
       </div>
       <form onSubmit={check} className="relative">
          <input 
             value={input} 
             onChange={e => { setInput(e.target.value); setError(false); }}
             className={`w-full px-8 py-5 rounded-full border-2 text-xl font-bold text-center outline-none shadow-sm transition-colors ${error ? 'border-red-500 bg-red-50 text-red-900 focus:border-red-500' : 'border-slate-200 focus:border-teal-500'}`}
             placeholder="Nhập thuật ngữ vào đây..."
             autoFocus
          />
       </form>
       {error && <p className="text-red-500 font-bold mt-4 animate-in slide-in-from-bottom-2">Chưa chính xác, hãy thử lại nhé!</p>}
    </div>
  )
}

function TestMode({ cards, onComplete }: { cards: FlashcardType[], onComplete: () => void }) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    if (cards.length < 2) return;
    const qs = cards.map(c => {
       const wrongAnswers = cards.filter(o => o.id !== c.id).map(o => o.front).sort(() => Math.random() - 0.5).slice(0, 3);
       const options = [c.front, ...wrongAnswers].sort(() => Math.random() - 0.5);
       return { prompt: c.back, correct: c.front, options }
    });
    setQuestions(qs.sort(() => Math.random() - 0.5));
  }, [cards]);

  if (cards.length < 2) return <div className="text-center p-8 bg-slate-50 text-slate-500 rounded-xl font-bold">Cần ít nhất 2 thẻ ghi nhớ để tạo trắc nghiệm.</div>;

  const current = questions[idx];
  
  if (!current && !isDone) return null;

  if (isDone) {
    return (
       <div className="text-center py-12 bg-white rounded-3xl border border-indigo-100 shadow-sm animate-in zoom-in duration-500">
           <div className="w-24 h-24 bg-indigo-100 flex items-center justify-center rounded-full mx-auto mb-6">
               <FileCheck className="w-12 h-12 text-indigo-600" />
           </div>
           <h3 className="text-4xl font-black text-slate-800 mb-2">Đạt {score} / {questions.length} điểm</h3>
           <p className="text-slate-500 font-medium mb-8">Bạn vừa hoàn thành bài Quiz tự random từ thẻ.</p>
           <button onClick={onComplete} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-full transition">+50 XP & Trở Về</button>
       </div>
    )
  }

  const check = () => {
    if (current.options[selected!] === current.correct) {
       setScore(s => s + 1);
    }
    setShowAnswer(true);
  };

  const next = () => {
    setShowAnswer(false);
    setSelected(null);
    if (idx < questions.length - 1) setIdx(idx + 1);
    else setIsDone(true);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
         <span className="text-sm font-bold bg-slate-100 px-4 py-2 rounded-full text-slate-600 uppercase tracking-wider">Câu hỏi {idx + 1} / {questions.length}</span>
         <span className="text-sm font-bold text-indigo-600">Mini Quiz</span>
      </div>
      
      <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-200 mb-6 text-center min-h-[200px] flex items-center justify-center">
         <h3 className="text-3xl font-bold text-slate-800 leading-tight">{current.prompt}</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         {current.options.map((opt: string, i: number) => {
            let style = "bg-white border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 hover:shadow-sm";
            if (selected === i) style = "bg-indigo-100 border-indigo-500 text-indigo-900";
            if (showAnswer) {
              if (opt === current.correct) style = "bg-green-100 border-green-500 text-green-900";
              else if (selected === i) style = "bg-red-100 border-red-500 text-red-900";
              else style = "opacity-50 pointer-events-none";
            }
            return (
              <button 
                 key={i}
                 disabled={showAnswer}
                 onClick={() => setSelected(i)}
                 className={`p-6 rounded-2xl border-2 font-bold text-lg text-center transition-all duration-200 ${style}`}
              >
                 {opt}
              </button>
            )
         })}
      </div>
      <div className="mt-8 flex justify-end">
        {!showAnswer ? (
          <button disabled={selected === null} onClick={check} className="bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 text-white font-bold py-4 px-12 rounded-full transition-colors">Kiểm tra</button>
        ) : (
          <button onClick={next} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-12 rounded-full transition-colors">{idx === questions.length - 1 ? 'Xem kết quả' : 'Câu tiếp theo'}</button>
        )}
      </div>
    </div>
  )
}

