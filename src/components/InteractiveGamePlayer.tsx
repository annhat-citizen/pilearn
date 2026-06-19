import React, { useState, useEffect } from 'react';
import { motion, Reorder } from 'motion/react';
import { InteractiveGame } from '../types';
import { CheckCircle, XCircle, Lightbulb } from 'lucide-react';

export function InteractiveGamePlayer({ game }: { game: InteractiveGame }) {
  const [status, setStatus] = useState<'idle' | 'success' | 'fail'>('idle');
  const [showHint, setShowHint] = useState(false);

  return (
    <div className="my-8 bg-white border border-gray-200 shadow-sm rounded-xl p-6 relative">
      <div className="flex justify-between items-start gap-4 mb-4">
        <h3 className="text-lg font-bold text-slate-800">{game.title}</h3>
        {game.hint && (
          <button 
            type="button" 
            onClick={() => setShowHint(!showHint)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-full border border-amber-200 font-semibold transition shrink-0"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-500 fill-amber-200" />
            {showHint ? 'Ẩn gợi ý' : 'Xem gợi ý'}
          </button>
        )}
      </div>

      {game.hint && showHint && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-amber-50 border border-amber-200 text-slate-705 text-xs rounded-lg flex items-start gap-2"
        >
          <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 fill-amber-200" />
          <div>
            <span className="font-bold text-amber-805">Gợi ý dành cho bạn:</span> {game.hint}
          </div>
        </motion.div>
      )}

      {game.type === 'sort_paragraphs' && <SortParagraphsGame game={game} status={status} setStatus={setStatus} />}
      {game.type === 'fill_blanks' && <FillBlanksGame game={game} status={status} setStatus={setStatus} />}
      {game.type === 'drag_words' && <DragWordsGame game={game} status={status} setStatus={setStatus} />}
      
      {status === 'success' && (
        <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-lg flex items-center font-medium">
          <CheckCircle className="w-5 h-5 mr-2" /> Chính xác! Bạn đã hoàn thành tốt.
        </div>
      )}
      {status === 'fail' && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center font-medium">
          <XCircle className="w-5 h-5 mr-2" /> Chưa chính xác. Vui lòng thử lại!
        </div>
      )}
    </div>
  );
}

// 1. Sort Paragraphs
function SortParagraphsGame({ game, status, setStatus }: { game: InteractiveGame, status: string, setStatus: (s: any) => void }) {
  const originalOrder = game.content.split('\n').filter(l => l.trim() !== '');
  const [items, setItems] = useState<string[]>([]);
  
  useEffect(() => {
    // Shuffle
    const shuffled = [...originalOrder].sort(() => Math.random() - 0.5);
    setItems(shuffled);
  }, [game]);

  const checkSort = () => {
    const isCorrect = items.every((val, index) => val === originalOrder[index]);
    setStatus(isCorrect ? 'success' : 'fail');
  };

  return (
    <div>
      <p className="text-slate-600 mb-4 text-sm">Hãy kéo thả để sắp xếp các câu lại theo đúng thứ tự logic.</p>
      <Reorder.Group axis="y" values={items} onReorder={setItems} className="space-y-2">
        {items.map((item) => (
          <Reorder.Item key={item} value={item} className="p-4 bg-slate-50 border border-slate-200 rounded cursor-grab active:cursor-grabbing hover:bg-slate-100">
            {item}
          </Reorder.Item>
        ))}
      </Reorder.Group>
      <button onClick={checkSort} className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700">Kiểm tra</button>
    </div>
  );
}

// 2. Fill Blanks
function FillBlanksGame({ game, status, setStatus }: { game: InteractiveGame, status: string, setStatus: (s: any) => void }) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showAnswers, setShowAnswers] = useState(false);
  
  const regex = /\[(.*?)\]/g;
  const parts: { type: 'text' | 'blank', value: string, id?: number }[] = [];
  
  let match;
  let lastIndex = 0;
  let blankCount = 0;
  const matches = [...game.content.matchAll(regex)];
  
  matches.forEach((m) => {
    if (m.index !== undefined && m.index > lastIndex) {
      parts.push({ type: 'text', value: game.content.slice(lastIndex, m.index) });
    }
    parts.push({ type: 'blank', value: m[1], id: blankCount++ });
    lastIndex = (m.index || 0) + m[0].length;
  });
  if (lastIndex < game.content.length) {
    parts.push({ type: 'text', value: game.content.slice(lastIndex) });
  }

  const isAllBlanksFilled = parts.filter(p => p.type === 'blank').every(p => (answers[p.id!] || '').trim().length > 0);

  const checkAnswers = () => {
    let allCorrect = true;
    parts.forEach(p => {
      if (p.type === 'blank') {
        if ((answers[p.id!] || '').trim().toLowerCase() !== p.value.trim().toLowerCase()) {
           allCorrect = false;
        }
      }
    });
    setStatus(allCorrect ? 'success' : 'fail');
    if (allCorrect) setShowAnswers(false);
  };

  return (
    <div>
      <p className="text-slate-600 mb-4 text-sm">Điền từ thích hợp vào chỗ trống.</p>
      <div className="leading-loose text-lg font-medium text-slate-800 relative">
        {parts.map((p, i) => {
          if (p.type === 'text') return <span key={i}>{p.value}</span>;
          
          const isWrong = status === 'fail' && (answers[p.id!] || '').trim().toLowerCase() !== p.value.trim().toLowerCase();
          
          return (
            <span key={i} className="relative inline-block mx-2">
              <input 
                type="text" 
                value={showAnswers ? p.value : (answers[p.id!] || '')}
                onChange={(e) => {
                  setAnswers({...answers, [p.id!]: e.target.value});
                  setStatus('idle');
                  setShowAnswers(false);
                }}
                disabled={showAnswers}
                className={`px-2 py-1 bg-blue-50 border-b-2 focus:outline-none w-32 text-center font-bold transition-colors ${
                  showAnswers 
                    ? 'border-green-500 text-green-700 bg-green-50' 
                    : isWrong ? 'border-red-400 text-red-600 bg-red-50' : 'border-blue-400 focus:border-blue-600 text-blue-800'
                }`}
              />
            </span>
          );
        })}
      </div>
      <div className="mt-6 flex flex-wrap gap-4 items-center">
        <button onClick={checkAnswers} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 active:scale-95 transition-all">Kiểm tra</button>
        {status === 'fail' && isAllBlanksFilled && (
          <button onClick={() => setShowAnswers(!showAnswers)} className="text-blue-600 bg-blue-50 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 flex items-center gap-2 transition-all">
            {showAnswers ? 'Che đáp án' : 'Xem đáp án'}
          </button>
        )}
      </div>
    </div>
  );
}

// 3. Drag Words
function DragWordsGame({ game, status, setStatus }: { game: InteractiveGame, status: string, setStatus: (s: any) => void }) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [words, setWords] = useState<string[]>([]);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  
  const regex = /\[\*(.*?)\*\]/g;
  const parts: { type: 'text' | 'dropzone', value: string, id?: number }[] = [];
  
  let lastIndex = 0;
  let blankCount = 0;
  const matches = [...game.content.matchAll(regex)];
  
  useEffect(() => {
    const allWords = matches.map(m => m[1]);
    setWords([...allWords].sort(() => Math.random() - 0.5));
  }, [game.content]);

  matches.forEach((m) => {
    if (m.index !== undefined && m.index > lastIndex) {
      parts.push({ type: 'text', value: game.content.slice(lastIndex, m.index) });
    }
    parts.push({ type: 'dropzone', value: m[1], id: blankCount++ });
    lastIndex = (m.index || 0) + m[0].length;
  });
  if (lastIndex < game.content.length) {
    parts.push({ type: 'text', value: game.content.slice(lastIndex) });
  }

  const handleDrop = (id: number, word: string) => {
    setAnswers({...answers, [id]: word});
  };

  const handleSelectWord = (word: string) => {
    if (selectedWord === word) {
      setSelectedWord(null);
    } else {
      setSelectedWord(word);
    }
  };

  const handleDropzoneTap = (id: number) => {
    if (selectedWord) {
      setAnswers({...answers, [id]: selectedWord});
      setSelectedWord(null);
    } else if (answers[id]) {
      const updated = { ...answers };
      delete updated[id];
      setAnswers(updated);
    }
  };

  const checkAnswers = () => {
    let allCorrect = true;
    for (const p of parts) {
      if (p.type === 'dropzone') {
        if ((answers[p.id!] || '') !== p.value) {
          allCorrect = false;
        }
      }
    }
    setStatus(allCorrect ? 'success' : 'fail');
  };

  const getAvailableWords = () => {
    const usedWords = Object.values(answers);
    const available: {word: string, originalIndex: number}[] = [];
    const usedCounts: Record<string, number> = {};
    usedWords.forEach(w => { usedCounts[w] = (usedCounts[w] || 0) + 1; });
    
    words.forEach((w, idx) => {
      if (usedCounts[w] > 0) {
        usedCounts[w]--;
      } else {
        available.push({word: w, originalIndex: idx});
      }
    });
    return available;
  };

  return (
    <div>
      <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm">
        Kéo thả các từ hoặc <strong className="text-blue-600 dark:text-blue-400">chạm chọn từ rồi chạm ô trống</strong> để điền vào (Hỗ trợ tốt nhất trên Điện thoại).
      </p>
      
      {/* Word bank */}
      <div className="flex flex-wrap gap-3 mb-8 p-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg min-h-[80px]">
        {getAvailableWords().map((item) => {
          const w = item.word;
          const idx = item.originalIndex;
          const isSelected = selectedWord === w;
          return (
            <div 
              key={idx}
              draggable
              onDragStart={(e) => { e.dataTransfer.setData('text/plain', w); }}
              onClick={() => handleSelectWord(w)}
              className={`px-4 py-2 border rounded shadow-xs cursor-pointer select-none font-bold text-xs sm:text-sm transition-all duration-150 hover:scale-[1.05] active:scale-[0.95] ${
                isSelected 
                  ? 'bg-blue-600 border-blue-700 text-white scale-[1.05] dark:bg-blue-500' 
                  : 'bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-600 text-blue-800 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-slate-800'
              }`}
            >
              {w}
            </div>
          );
        })}
      </div>

      <div className="leading-loose text-slate-800 dark:text-slate-200 text-sm sm:text-base md:text-lg font-medium">
        {parts.map((p, i) => {
          if (p.type === 'text') return <span key={i}>{p.value}</span>;
          const currentAnswer = answers[p.id!];
          const hasAnswer = !!currentAnswer;
          return (
            <span
              key={i}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const word = e.dataTransfer.getData('text/plain');
                if (word) handleDrop(p.id!, word);
              }}
              onClick={() => handleDropzoneTap(p.id!)}
              className={`inline-flex items-center justify-center mx-2 px-3 py-1 md:px-4 md:py-1 min-w-[110px] md:min-w-[120px] rounded border-2 border-dashed cursor-pointer transition-all ${
                hasAnswer 
                  ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-400 text-blue-800 dark:text-blue-300 font-bold' 
                  : 'bg-gray-50 dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-slate-400 hover:border-blue-400'
              }`}
              title={hasAnswer ? "Nhấp chạm để gỡ từ" : "Nhấp chạm để gán từ"}
            >
              {currentAnswer || '...'}
            </span>
          );
        })}
      </div>
      <button 
        onClick={checkAnswers} 
        className="mt-8 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all"
      >
        Kiểm tra đáp án
      </button>
    </div>
  );
}
