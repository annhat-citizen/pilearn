import React, { useState } from 'react';
import { Question } from '../types';
import { useAppContext } from '../store';
import { motion, AnimatePresence } from 'motion/react';
import { Lightbulb, CheckCircle2, XCircle } from 'lucide-react';
import { audioService } from '../utils/audio';

export function MiniQuiz({ questions }: { questions: Question[] }) {
  const { addXP } = useAppContext();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | boolean | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [score, setScore] = useState(0);

  if (!questions || questions.length === 0) return null;

  const currentQ = questions[currentIdx];
  const isLast = currentIdx === questions.length - 1;
  const isFinished = currentIdx >= questions.length;

  const handleCheck = () => {
    let isCorrect = false;
    if (currentQ.type === 'multiple_choice' && selectedAnswer === currentQ.correctOptionIndex) {
      isCorrect = true;
    } else if (currentQ.type === 'true_false' && selectedAnswer === currentQ.correctAnswerBool) {
      isCorrect = true;
    }

    if (isCorrect) {
      audioService.playSuccess();
      setScore(s => s + 1);
      addXP(5); // +5 XP per correct
    } else {
      audioService.playError();
    }
    setIsChecked(true);
  };

  const handleNext = () => {
    setCurrentIdx(i => i + 1);
    setSelectedAnswer(null);
    setIsChecked(false);
  };

  if (isFinished) {
    return (
      <div className="bg-amber-50 p-8 rounded-3xl text-center border border-amber-200">
        <h3 className="text-xl font-bold text-amber-900 mb-4">Kết Quả Bài Tập Nhanh</h3>
        <p className="text-amber-700 font-medium text-lg">Bạn đúng {score} / {questions.length} câu!</p>
        <p className="text-amber-600 mt-2">Đã nhận {score * 5} XP.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 mt-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-slate-100">
        <div className="h-full bg-amber-500 transition-all duration-300" style={{ width: `${(currentIdx / questions.length) * 100}%` }}></div>
      </div>
      
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-amber-100/50 rounded-xl text-amber-600">
           <Lightbulb className="w-6 h-6" />
        </div>
        <div>
           <h3 className="text-lg font-bold text-slate-800">Mini Quiz Tích Luỹ XP</h3>
           <p className="text-sm font-medium text-slate-500">Câu {currentIdx + 1}/{questions.length} • +5 XP mỗi câu đúng</p>
        </div>
      </div>

      <h4 className="text-xl font-bold text-slate-800 mb-6">
        {currentQ.prompt.split('\n').map((line, i) => (
          <React.Fragment key={i}>
            {line}
            <br />
          </React.Fragment>
        ))}
      </h4>

      <div className="space-y-3">
        {currentQ.type === 'multiple_choice' && currentQ.options?.map((opt, idx) => {
          let style = "border-slate-200 bg-white hover:border-amber-400 hover:bg-amber-50 text-slate-700";
          if (selectedAnswer === idx) style = "border-amber-500 bg-amber-50 text-amber-900 shadow-sm";
          
          if (isChecked) {
             if (idx === currentQ.correctOptionIndex) {
               style = "border-green-500 bg-green-50 text-green-900";
             } else if (selectedAnswer === idx) {
               style = "border-red-500 bg-red-50 text-red-900";
             } else {
               style = "border-slate-200 bg-white text-slate-400 opacity-50";
             }
          }

          return (
            <button 
              key={idx}
              disabled={isChecked}
              onClick={() => setSelectedAnswer(idx)}
              className={`w-full text-left p-4 rounded-xl border-2 font-medium transition-all duration-150 hover:scale-[1.01] active:scale-[0.98] flex items-start justify-between cursor-pointer ${style}`}
            >
              <span className="flex-1 mt-0.5 whitespace-pre-wrap">{opt.replace(/\\n/g, '\n')}</span>
              {isChecked && idx === currentQ.correctOptionIndex && <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 ml-4 mt-0.5" />}
              {isChecked && selectedAnswer === idx && idx !== currentQ.correctOptionIndex && <XCircle className="w-5 h-5 text-red-500 shrink-0 ml-4 mt-0.5" />}
            </button>
          )
        })}

        {currentQ.type === 'true_false' && [true, false].map((val) => {
          let style = "border-slate-200 bg-white hover:border-amber-400 hover:bg-amber-50 text-slate-700";
          if (selectedAnswer === val) style = "border-amber-500 bg-amber-50 text-amber-900 shadow-sm";
          
          if (isChecked) {
             if (val === currentQ.correctAnswerBool) {
               style = "border-green-500 bg-green-50 text-green-900";
             } else if (selectedAnswer === val) {
               style = "border-red-500 bg-red-50 text-red-900";
             } else {
               style = "border-slate-200 bg-white text-slate-400 opacity-50";
             }
          }

          return (
            <button 
              key={val.toString()}
              disabled={isChecked}
              onClick={() => setSelectedAnswer(val)}
              className={`w-full text-left p-4 rounded-xl border-2 font-medium transition-all duration-150 hover:scale-[1.01] active:scale-[0.98] cursor-pointer ${style}`}
            >
              {val ? 'Đúng' : 'Sai'}
            </button>
          )
        })}
      </div>

      <div className="mt-8 flex justify-end">
        {!isChecked ? (
          <button 
             disabled={selectedAnswer === null}
             onClick={handleCheck}
             className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 active:scale-95 disabled:scale-100 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all duration-150 cursor-pointer shadow-sm"
          >
             Kiểm tra
          </button>
        ) : (
          <button 
             onClick={handleNext}
             className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold rounded-xl transition-all duration-150 cursor-pointer shadow-sm"
          >
             {isLast ? 'Hoàn thành' : 'Tiếp theo'}
          </button>
        )}
      </div>
    </div>
  );
}
