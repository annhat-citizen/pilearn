import React, { useState, useEffect } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import 'prismjs/themes/prism-twilight.css';
import { 
  Play, Bot, Sparkles, Loader2, Send, 
  ChevronRight, RefreshCw, Layers, Brain, 
  AlertCircle, HelpCircle, Code, Eye, RefreshCcw, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSettings } from '../contexts/SettingsContext';
import { audioService } from '../utils/audio';

interface InteractiveTheoryIDEProps {
  initialCode: string;
  contextTitle?: string;
  lessonId?: string;
}

export function InteractiveTheoryIDE({ initialCode, contextTitle = 'Lý thuyết minh họa', lessonId }: InteractiveTheoryIDEProps) {
  const { groqApiKey } = useSettings();
  const trimmedInitial = initialCode.trim();
  
  const [code, setCode] = useState(trimmedInitial);
  const [isEditing, setIsEditing] = useState(false);
  const [output, setOutput] = useState('');
  const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [gradeLevel, setGradeLevel] = useState('Lớp 10 - 12');
  
  // AI Explanations and Chat
  const [userQuestion, setUserQuestion] = useState('');
  const [aiAnswers, setAiAnswers] = useState<{ q: string; a: string }[]>([]);
  const [isAsking, setIsAsking] = useState(false);

  // Use a stable reference to track the content we've already initialized
  const lastLoadedContent = React.useRef(trimmedInitial);
  const lastLessonId = React.useRef(lessonId);

  // Sync state only when moving to a DIFFERENT lesson or DIFFERENT code block content
  useEffect(() => {
    if (trimmedInitial !== lastLoadedContent.current || lessonId !== lastLessonId.current) {
      setCode(trimmedInitial);
      setOutput('');
      setStatus('idle');
      setAiAnswers([]);
      setUserQuestion('');
      setIsEditing(false);
      lastLoadedContent.current = trimmedInitial;
      lastLessonId.current = lessonId;
    }
  }, [trimmedInitial, lessonId]);

  // Clean python code indentation for Prism
  const formattedCode = code.trim();

  const simulatePython = (codeStr: string): { output: string; success: boolean } => {
    let outputLines: string[] = [];
    const printFn = (...args: any[]) => {
      outputLines.push(args.map(arg => {
        if (typeof arg === 'boolean') return arg ? 'True' : 'False';
        if (arg === null || arg === undefined) return 'None';
        if (Array.isArray(arg)) {
          return '[' + arg.map(x => typeof x === 'string' ? `'${x}'` : String(x)).join(', ') + ']';
        }
        return String(arg);
      }).join(' '));
    };

    try {
      const lines = codeStr.split('\n');
      let jsCode = '';
      let indentStack: number[] = [0];

      for (let rawLine of lines) {
        const trimmed = rawLine.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;

        const indentMatch = rawLine.match(/^([ \t]*)/);
        const indent = indentMatch ? indentMatch[1].length : 0;

        while (indentStack.length > 1 && indent < indentStack[indentStack.length - 1]) {
          jsCode += '}\n';
          indentStack.pop();
        }

        let lineCode = trimmed;
        if (trimmed.startsWith('if ') && trimmed.endsWith(':')) {
          const cond = trimmed.substring(3, trimmed.length - 1)
            .replace(/\band\b/g, '&&')
            .replace(/\bor\b/g, '||')
            .replace(/\bnot\b/g, '!')
            .replace(/\bTrue\b/g, 'true')
            .replace(/\bFalse\b/g, 'false');
          lineCode = `if (${cond}) {`;
          indentStack.push(indent + 1);
        } else if (trimmed.startsWith('elif ') && trimmed.endsWith(':')) {
          const cond = trimmed.substring(5, trimmed.length - 1)
            .replace(/\band\b/g, '&&')
            .replace(/\bor\b/g, '||')
            .replace(/\bnot\b/g, '!')
            .replace(/\bTrue\b/g, 'true')
            .replace(/\bFalse\b/g, 'false');
          lineCode = `} else if (${cond}) {`;
        } else if (trimmed === 'else:') {
          lineCode = `} else {`;
        } else if (trimmed.startsWith('for ') && trimmed.endsWith(':')) {
          const forBody = trimmed.substring(4, trimmed.length - 1);
          const parts = forBody.split(' in ');
          if (parts.length === 2) {
            const item = parts[0].trim();
            const iter = parts[1].trim();
            if (iter.startsWith('range(')) {
              const rangeArgs = iter.substring(6, iter.length - 1).split(',').map(x => x.trim());
              let start = '0', end = '0', step = '1';
              if (rangeArgs.length === 1) end = rangeArgs[0];
              else if (rangeArgs.length === 2) { start = rangeArgs[0]; end = rangeArgs[1]; };
              lineCode = `for (let ${item} = ${start}; ${item} < ${end}; ${item} += ${step}) {`;
              indentStack.push(indent + 1);
            } else {
              lineCode = `for (let ${item} of ${iter}) {`;
              indentStack.push(indent + 1);
            }
          }
        } else {
          // Robust print replacement handling spaces print( vs print (
          lineCode = lineCode.replace(/\bprint\s*\(/g, 'printFn(');
          
          if (trimmed.includes('=') && !trimmed.includes('==') && !trimmed.includes('!=') && !trimmed.includes('<=') && !trimmed.includes('>=')) {
            const lValue = trimmed.split('=')[0].trim();
            if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(lValue)) {
              lineCode = `var ${lineCode}`;
            }
          }
        }
        jsCode += lineCode + '\n';
      }

      while (indentStack.length > 1) {
        jsCode += '}\n';
        indentStack.pop();
      }

      const runner = new Function('printFn', 'int', 'float', 'str', 'len', 'input', 'try { ' + jsCode + ' } catch(e) { throw e; }');
      runner(
        printFn, 
        (x: any) => {
          let cleaned = String(x).replace(/^["']|["']$/g, '');
          let val = parseInt(cleaned, 10);
          return isNaN(val) ? 0 : val;
        }, 
        (x: any) => {
          let cleaned = String(x).replace(/^["']|["']$/g, '');
          let val = parseFloat(cleaned);
          return isNaN(val) ? 0.0 : val;
        }, 
        (x: any) => String(x), 
        (x: any) => x ? x.length : 0,
        (p: any) => "15"
      );

      return { output: outputLines.join('\n'), success: true };
    } catch (err: any) {
      return { output: `Lỗi thông dịch Python: ${err.message}`, success: false };
    }
  };

  const runCode = () => {
    if (status === 'running') return;
    audioService.playRunCode();
    setStatus('running');
    setOutput('');

    // Small delay for visual feedback that it's "computing"
    setTimeout(() => {
      try {
        const res = simulatePython(code);
        if (res.success) {
          audioService.playSuccess();
          setOutput(res.output || '>>> Chương trình chạy hoàn tất.\n(Mẹo: Dùng lệnh print() để in kết quả ra màn hình này nhé!)');
          setStatus('success');
        } else {
          audioService.playError();
          setOutput(res.output); // Error message
          setStatus('error');
        }
      } catch (err: any) {
        audioService.playError();
        setOutput(`Lỗi hệ thống: ${err.message}`);
        setStatus('error');
      }
    }, 300);
  };

  const handleAskQuestion = async () => {
    if (!userQuestion.trim()) return;
    audioService.playClick();
    setIsAsking(true);
    const question = userQuestion.trim();
    setUserQuestion('');
    try {
      const response = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(groqApiKey ? { 'X-API-Key': groqApiKey } : {})
        },
        body: JSON.stringify({
          code,
          studentMessage: question,
          context: contextTitle,
          level: gradeLevel
        })
      });
      const data = await response.json();
      
      if (data.reply) {
        setAiAnswers(prev => [...prev, { q: question, a: data.reply }]);
      } else {
        setAiAnswers(prev => [...prev, { 
          q: question, 
          a: "🤖 Mẹo nhỏ từ PiLearn:\nTớ là Trợ lý AI sẵn sàng sát cánh cùng bạn! Để kích hoạt tính năng chat trực tiếp thông minh với Gemini, bạn vui lòng bấm Thùng cài đặt góc trên rồi dán Gemini API Key nhé.\nHệ thống chạy mô phỏng Python ngoại tuyến phía trên vẫn chạy cực kỳ mượt mà để bạn học tập!" 
        }]);
      }
    } catch (e) {
      setAiAnswers(prev => [...prev, { 
        q: question, 
        a: "🤖 Mẹo nhỏ từ PiLearn:\nTớ là Trợ lý AI sẵn sàng sát cánh cùng bạn! Để kích hoạt tính năng chat trực tiếp thông minh với Gemini, bạn vui lòng bấm Thùng cài đặt góc trên rồi dán Gemini API Key nhé.\nHệ thống chạy mô phỏng Python ngoại tuyến phía trên vẫn chạy cực kỳ mượt mà để bạn học tập!" 
      }]);
    } finally {
      setIsAsking(false);
    }
  };

  // Reset code to original
  const handleReset = () => {
    audioService.playClick();
    setCode(initialCode.trim());
    setStatus('idle');
    setOutput('');
  };

  return (
    <div className="my-8 border-2 border-slate-800 bg-slate-900 shadow-xl rounded-2xl overflow-hidden font-sans">
      
      {/* Visual Terminal Bar Top Header */}
      <div className="bg-slate-950 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between text-slate-100 border-b border-slate-800 gap-3">
        <div className="flex items-center space-x-3">
          {/* Mock Window buttons */}
          <div className="hidden md:flex space-x-1.5 shrink-0">
            <span className="w-3.5 h-3.5 rounded-full bg-rose-500 inline-block shadow"></span>
            <span className="w-3.5 h-3.5 rounded-full bg-amber-500 inline-block shadow"></span>
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 inline-block shadow"></span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 tracking-wide uppercase flex items-center gap-2">
              <span className="bg-emerald-950 text-emerald-400 p-1 rounded">📟</span>
              PHÒNG THỬ NGHIỆM CONSOLE - {contextTitle.split(':')[0]}
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">Bấm lệnh chạy thử trực quan, tự do học tập không lỗi nhảy màn hình!</p>
          </div>
        </div>
        
        {/* Toggle View and Edit Mode */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              audioService.playClick();
              setIsEditing(false);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${!isEditing ? 'bg-indigo-600 text-white shadow' : 'bg-slate-800 text-slate-350 hover:bg-slate-700'}`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Xem Code</span>
          </button>
          
          <button
            onClick={() => {
              audioService.playClick();
              setIsEditing(true);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${isEditing ? 'bg-indigo-600 text-white shadow' : 'bg-slate-800 text-slate-350 hover:bg-slate-700'}`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Sửa Sách</span>
          </button>

          <button 
            onClick={handleReset}
            title="Khôi phục code gốc"
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg transition"
            aria-label="Khôi phục code"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Container Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[300px]">
        
        {/* Left Side (Lg: 7 columns) - Code Display or Text Area (No-jump) */}
        <div className="lg:col-span-7 flex flex-col bg-[#141820] border-r border-slate-800">
          <div className="py-2.5 px-4 bg-[#0e1117] flex justify-between items-center border-b border-slate-800.5 text-xs text-slate-450 font-mono">
            <span className="text-emerald-400 font-bold">📂 lesson_code.py</span>
            <span className="text-slate-500 font-medium">{isEditing ? "📝 Chế độ Sửa (Gõ tự do)" : "🔍 Chế độ Xem"}</span>
          </div>

          <div className="flex-1 flex flex-col relative">
            {isEditing ? (
              /* Stable simple custom Text Area with no scroll hijacking */
              <textarea
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setStatus('idle');
                }}
                className="w-full flex-1 p-4 bg-[#11141b] text-slate-100 font-mono text-sm leading-relaxed focus:outline-none resize-none border-none min-h-[220px]"
                placeholder="# Nhập code Python của bạn tại đây để kiểm tra..."
                style={{ fontFamily: '"JetBrains Mono", "Fira Code", monospace' }}
              />
            ) : (
              /* Purely static HTML to prevent absolute zero cursor scrolling jumps */
              <div className="p-4 overflow-auto font-mono text-sm leading-relaxed text-slate-100 min-h-[220px]">
                <pre 
                  className="bg-transparent text-emerald-300 font-medium select-text" 
                  style={{ fontFamily: '"JetBrains Mono", "Fira Code", monospace', margin: 0 }}
                  dangerouslySetInnerHTML={{
                    __html: Prism.highlight(formattedCode, Prism.languages.python || {}, 'python')
                  }}
                />
              </div>
            )}
            
            {/* Inline Helpful Advice */}
            <div className="p-3 bg-indigo-950/40 border-t border-slate-850 flex items-start gap-2 text-xs text-indigo-300">
              <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-indigo-400" />
              <p>
                {isEditing 
                  ? "Bạn đang tự do sửa đổi! Hãy bấm nút 'Chạy Thử Code' màu xanh trên Console để xem ngay kết quả."
                  : "Mẹo nhỏ: Chọn tab 'Sửa Sách' ở góc trên nếu bạn muốn đổi tham số hoặc tự viết thêm dòng code nhé!"}
              </p>
            </div>
          </div>
        </div>

        {/* Right Side (Lg: 5 columns) - The Console terminal outputs */}
        <div className="lg:col-span-5 flex flex-col bg-slate-950">
          <div className="py-2.5 px-4 bg-slate-900 border-b border-slate-805 flex items-center justify-between">
            <span className="text-slate-400 font-bold text-xs font-mono uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              Terminal Output
            </span>
            <button 
              onClick={runCode}
              disabled={status === 'running'}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-black transition flex items-center gap-1 cursor-pointer shrink-0"
            >
              {status === 'running' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-white text-white" />
              )}
              <span>Chạy Thử Code</span>
            </button>
          </div>

          <div className="flex-1 p-4 font-mono text-xs text-emerald-400 bg-slate-950 overflow-y-auto min-h-[160px] flex flex-col">
            <div className="text-slate-500 mb-1.5 select-none font-medium">{"\u003e\u003e\u003e Running main.py ..."}</div>
            {output ? (
              <div className={`whitespace-pre-wrap select-text leading-relaxed font-semibold ${status === 'error' ? 'text-rose-400' : 'text-emerald-400'}`}>
                {output}
              </div>
            ) : (
              <div className="text-slate-600 italic select-none">
                Chưa có dữ liệu in ra. Hãy nhấp nút "Chạy Thử Code" ở phía trên để hệ thống nạp và thực thi Python ảo nhé!
              </div>
            )}
            
            <div className="text-slate-700 animate-pulse mt-auto font-bold font-mono">_</div>
          </div>
        </div>

      </div>

      {/* AI Tutor Support Sidebar Block  */}
      <div className="p-4 bg-slate-900/40 border-t border-slate-800 font-sans">
        <div className="flex items-center space-x-2 text-indigo-400 mb-3 ml-1">
          <Sparkles className="w-4 h-4 fill-indigo-950 animate-pulse" />
          <h4 className="font-extrabold text-xs tracking-wider uppercase">Hỏi Đáp Giáo Viên Trí Tuệ Nhân Tạo (AI Support)</h4>
        </div>

        {/* Previous Answer List bubble layout */}
        {aiAnswers.length > 0 && (
          <div className="space-y-3 mb-4">
            {aiAnswers.map((ans, idx) => (
              <div key={idx} className="bg-slate-950 rounded-xl border border-slate-800 p-3.5 text-xs transition shadow-inner">
                <div className="font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <span className="p-0.5 bg-indigo-950 text-indigo-400 rounded">🧑‍🎓</span>
                  <span>Bạn hỏi: "{ans.q}"</span>
                </div>
                <div className="text-slate-300 bg-slate-900 p-3 rounded-lg border-l-2 border-indigo-500 whitespace-pre-wrap leading-relaxed font-sans text-xs">
                  {ans.a}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Input box */}
        <div className="flex gap-2 items-center bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 focus-within:ring-2 focus-within:ring-indigo-500 shadow-inner">
          <input 
            type="text" 
            value={userQuestion} 
            onChange={e => setUserQuestion(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAskQuestion()}
            placeholder={`Đặt câu hỏi (VD: "Ép kiểu float khác int như thế nào?")`}
            className="flex-1 bg-transparent border-none text-slate-100 text-xs focus:outline-none focus:ring-0 leading-relaxed font-sans"
            disabled={isAsking}
          />
          <button 
            type="button" 
            onClick={handleAskQuestion}
            disabled={isAsking || !userQuestion.trim()}
            className="p-1.5 bg-indigo-600 disabled:opacity-50 text-white rounded-lg hover:bg-indigo-700 transition cursor-pointer"
          >
            {isAsking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

    </div>
  );
}
