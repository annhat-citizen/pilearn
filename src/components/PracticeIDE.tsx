import React, { useState, useEffect } from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import 'prismjs/themes/prism-twilight.css';
import { Play, Bot, CheckCircle, AlertTriangle, HelpCircle, Loader2, KeyRound, Lightbulb, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSettings } from '../contexts/SettingsContext';
import { audioService } from '../utils/audio';

interface PracticeIDEProps {
  prompt: string;
  expectedContent?: string;
  onSuccess?: () => void;
  contextTitle?: string;
  hints?: string;
  exampleInputOutput?: string;
}

export function PracticeIDE({
  prompt,
  expectedContent = '',
  onSuccess,
  contextTitle = 'Luyện tập',
  hints = '',
  exampleInputOutput = ''
}: PracticeIDEProps) {
  const { geminiApiKey } = useSettings();
  const [code, setCode] = useState(() => {
    // Try to pre-populate with common python scaffolding if empty
    return '# Gõ code của bạn tại đây\n\n';
  });
  const [output, setOutput] = useState('');
  const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [gradeLevel, setGradeLevel] = useState('Lớp 10 - 12');
  
  // Real-time AI Analysis
  const [aiError, setAiError] = useState<{
    hasError: boolean;
    line: number;
    explanation: string;
    suggestion: string;
    wrong?: string;
    right?: string;
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Step-by-step guidance AI
  const [aiTutorPrompt, setAiTutorPrompt] = useState('');
  const [isTutorLoading, setIsTutorLoading] = useState(false);
  const [tutorMessages, setTutorMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [showTutorChat, setShowTutorChat] = useState(false);
  const [showSolutionRevealed, setShowSolutionRevealed] = useState(false);

  // Sync state when lesson/challenge prompt changes
  useEffect(() => {
    setCode('# Gõ code của bạn tại đây\n\n');
    setOutput('');
    setStatus('idle');
    setAiError(null);
    setTutorMessages([]);
    setShowTutorChat(false);
    setShowSolutionRevealed(false);
  }, [prompt, expectedContent]);

  // Python simulator inside Javascript environment
  const simulatePython = (codeStr: string): { output: string; success: boolean; errorLine?: number; errorMsg?: string } => {
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

      for (let i = 0; i < lines.length; i++) {
        const rawLine = lines[i];
        const trimmed = rawLine.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;

        const indentMatch = rawLine.match(/^([ \t]*)/);
        const indent = indentMatch ? indentMatch[1].length : 0;

        while (indentStack.length > 1 && indent < indentStack[indentStack.length - 1]) {
          jsCode += '}\n';
          indentStack.pop();
        }

        let lineCode = trimmed;
        
        // Simple error pre-processor (captures basic spelling mistakes)
        if (trimmed.startsWith('prin(') && trimmed.endsWith(')')) {
          throw new Error('Hàm "prin" không tồn tại. Có phải bạn muốn dùng "print"?');
        }

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
          lineCode = lineCode.replace(/\bprint\((.*?)\)/g, 'printFn($1)');
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

      const runner = new Function('printFn', 'int', 'float', 'str', 'len', 'input', `
        var int = function(x) {
          if (typeof x === 'string') {
            x = x.replace(/^["']|["']$/g, '');
          }
          let val = parseInt(x, 10);
          return isNaN(val) ? 0 : val;
        };
        var float = function(x) {
          if (typeof x === 'string') {
            x = x.replace(/^["']|["']$/g, '');
          }
          let val = parseFloat(x);
          return isNaN(val) ? 0.0 : val;
        };
        var str = function(x) { return String(x); };
        var len = function(x) { return x && typeof x.length !== 'undefined' ? x.length : 0; };
        var input = function(p) { return "15"; };
        try {
          ${jsCode}
        } catch(e) {
          throw e;
        }
      `);
      runner(
        printFn, 
        (x: any) => parseInt(String(x).replace(/^["']|["']$/g, ''), 10), 
        (x: any) => parseFloat(String(x).replace(/^["']|["']$/g, '')), 
        (x: any) => String(x), 
        (x: any) => x ? x.length : 0,
        (p: any) => "15"
      );

      return { output: outputLines.join('\n'), success: true };
    } catch (err: any) {
      // Find the probable error line in simulation
      return { output: `SyntaxError: Lỗi cú pháp Python.\nChi tiết: ${err.message}`, success: false, errorMsg: err.message };
    }
  };

  const handleAnalyzeErrors = async (currentCode: string) => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/analyze-code', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(geminiApiKey ? { 'X-Gemini-API-Key': geminiApiKey } : {})
        },
        body: JSON.stringify({
          code: currentCode,
          expectedCode: expectedContent,
          prompt: prompt,
          level: gradeLevel
        })
      });
      const data = await response.json();
      if (data && data.hasError) {
        setAiError({
          hasError: true,
          line: Number(data.line) || 1,
          explanation: data.explanation,
          suggestion: data.suggestion,
          wrong: data.wrong || '',
          right: data.right || ''
        });
        setStatus('error');
      } else {
        setAiError({ hasError: false, line: 0, explanation: '', suggestion: '', wrong: '', right: '' });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    const handleRunCode = () => {
      runCode();
    };
    const handleStopCode = () => {
      setStatus('idle');
      setOutput('⚙ Đã nhận lệnh dừng chương trình.');
    };
    const handleResetCode = () => {
      setCode('# Gõ code của bạn tại đây\n\n');
      setOutput('');
      setStatus('idle');
      setAiError(null);
    };
    const handleExplainCode = () => {
      if (!code || code.trim() === '# Gõ code của bạn tại đây') return;
      setShowTutorChat(true);
      askTutorMessage('Hãy giải thích chi tiết ý nghĩa và logic của chương trình Python tôi đang viết.');
    };
    const handleDebugCode = () => {
      handleAnalyzeErrors(code);
    };
    const handleHintCode = () => {
      getTutorStepByStep();
    };

    window.addEventListener('command:run-code', handleRunCode);
    window.addEventListener('command:stop-code', handleStopCode);
    window.addEventListener('command:reset-code', handleResetCode);
    window.addEventListener('command:explain-code', handleExplainCode);
    window.addEventListener('command:debug-code', handleDebugCode);
    window.addEventListener('command:hint-code', handleHintCode);

    return () => {
      window.removeEventListener('command:run-code', handleRunCode);
      window.removeEventListener('command:stop-code', handleStopCode);
      window.removeEventListener('command:reset-code', handleResetCode);
      window.removeEventListener('command:explain-code', handleExplainCode);
      window.removeEventListener('command:debug-code', handleDebugCode);
      window.removeEventListener('command:hint-code', handleHintCode);
    };
  }, [code, expectedContent, prompt, gradeLevel, aiError, isAnalyzing]);

  const runCode = () => {
    setStatus('running');
    setOutput('');
    setAiError(null);
    audioService.playRunCode();
    
    setTimeout(() => {
      const userResult = simulatePython(code);
      
      if (!userResult.success) {
        const out = userResult.output;
        setOutput(out);
        setStatus('error');
        audioService.playError();
        // Instantly invoke AI Error analysis for full explanation
        handleAnalyzeErrors(code);
        return;
      }

      let testOutput = userResult.output;
      let pass = true;

      if (expectedContent) {
        const expectedResult = simulatePython(expectedContent);
        if (expectedResult.success) {
          const userNorm = userResult.output.trim().replace(/\s+/g, ' ');
          const expNorm = expectedResult.output.trim().replace(/\s+/g, ' ');
          if (userNorm !== expNorm && !userNorm.includes(expNorm)) {
            pass = false;
          }
        }
      }

      if (pass) {
        setOutput((testOutput ? testOutput + "\n\n" : "") + "✓ Chúc mừng! Chương trình đã chạy chính xác và khớp với kết quả yêu cầu.");
        setStatus('success');
        audioService.playSuccess();
        if (onSuccess) onSuccess();
      } else {
        const expectedResult = simulatePython(expectedContent);
        setOutput((testOutput ? testOutput + "\n\n" : "") + `⚠ Lỗi Logic: Kết quả in ra màn hình chưa chính xác.\n\nKết quả mong muốn:\n${expectedResult.output || "(Phù hợp với yêu cầu bài học)"}`);
        setStatus('error');
        audioService.playError();
        // Call AI error analyzer
        handleAnalyzeErrors(code);
      }
    }, 500);
  };

  const askTutorMessage = async (msgText: string) => {
    if (!msgText.trim()) return;
    setIsTutorLoading(true);
    const userMsg = msgText.trim();
    setTutorMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setAiTutorPrompt('');
    
    try {
      const response = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 
           'Content-Type': 'application/json',
           ...(geminiApiKey ? { 'X-Gemini-API-Key': geminiApiKey } : {})
        },
        body: JSON.stringify({
          code: code,
          studentMessage: userMsg,
          context: `Bài thực hành: ${contextTitle}\nĐề bài: ${prompt}`,
          level: gradeLevel
        })
      });
      const data = await response.json();
      setTutorMessages(prev => [...prev, { role: 'assistant', content: data.reply || 'Gia sư AI đang bận.' }]);
    } catch (e) {
      setTutorMessages(prev => [...prev, { role: 'assistant', content: 'Gặp sự cố kết nối tới Gia sư AI.' }]);
    } finally {
      setIsTutorLoading(false);
    }
  };

  const getTutorStepByStep = () => {
    setShowTutorChat(true);
    askTutorMessage('Tôi đang làm bài thực hành này nhưng gặp khó khăn, hãy gợi ý cho tôi từng bước giải quyết nhé.');
  };

  return (
    <div className="w-full grid grid-cols-1 xl:grid-cols-12 gap-5 text-sans">
      {/* Col Left (5/12): Prompt & Requirements */}
      <div className="xl:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5 flex flex-col shadow-sm">
        <div className="flex items-center gap-2 text-blue-600 mb-2">
          <Sparkles className="w-4 h-4 fill-blue-150 animate-pulse" />
          <h3 className="font-bold text-xs tracking-wide uppercase">Yêu cầu Thực hành</h3>
        </div>

        <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2.5">{contextTitle}</h4>
        
        {/* Core Prompt */}
        <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/50 p-3 sm:p-4 rounded-xl text-slate-700 dark:text-slate-200 text-xs sm:text-sm leading-relaxed mb-4 whitespace-pre-wrap select-text">
          {prompt}
        </div>

        {/* Example Input / Output standard table/boxes */}
        {exampleInputOutput && (
          <div className="mb-4">
            <h5 className="font-extrabold text-[10px] uppercase text-slate-450 mb-1.5">Ví dụ Minh Họa (Input/Output)</h5>
            <div className="bg-slate-100 dark:bg-slate-800 font-mono text-[11px] p-2.5 rounded-lg text-slate-800 dark:text-slate-100 whitespace-pre-wrap overflow-x-auto w-full select-text leading-relaxed">
              {exampleInputOutput}
            </div>
          </div>
        )}

        {/* Dynamic Hints Accordion */}
        {hints && (
          <div className="mt-auto border-t border-slate-100 dark:border-slate-700/50 pt-3 bg-amber-50/50 p-3.5 border border-amber-200/50 rounded-xl">
            <h5 className="font-bold text-xs text-amber-900 flex items-center gap-1.5 mb-1 text-left">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500 fill-amber-100" />
              <span>Gợi ý hướng dẫn từ Giáo viên</span>
            </h5>
            <p className="text-[11px] sm:text-xs text-amber-850 leading-relaxed whitespace-pre-wrap select-text text-left">
              {hints}
            </p>
          </div>
        )}

        {/* AI step guides buttons */}
        <div className="flex flex-col gap-1.5 mt-4">
          <button 
            type="button" 
            onClick={getTutorStepByStep}
            className="w-full py-2.5 px-4 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100/50 active:scale-[0.99] text-indigo-700 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-xs cursor-pointer select-none"
            style={{ minHeight: '44px' }}
          >
            <Bot className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>AI Hướng Dẫn Từng Bước (Không cho đáp án)</span>
          </button>
          
          <div className="flex justify-between items-center text-[10px] sm:text-xs mt-1.5 self-center text-slate-400 font-sans">
            <span>Mức giải thích hiện tại: <strong>{gradeLevel}</strong></span>
          </div>
        </div>
      </div>

      {/* Col Right (7/12): Code Workspace & Terminal */}
      <div className="xl:col-span-7 flex flex-col space-y-4">
        
        {/* Editor Box */}
        <div className="bg-[#1e1e1e] rounded-2xl border border-slate-800 overflow-hidden shadow-xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-[#2d2d2d] border-b border-gray-800">
            <div className="flex items-center space-x-2 text-gray-400 font-mono text-[11px]">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
              <span className="ml-1 pl-1 text-slate-350">workspace.py</span>
            </div>

            {/* Level selector */}
            <div className="flex items-center space-x-2">
              <select 
                value={gradeLevel} 
                onChange={e => setGradeLevel(e.target.value)} 
                className="bg-slate-850 text-[10px] sm:text-[11px] text-gray-300 border border-slate-700 rounded-lg px-2 py-0.5 cursor-pointer focus:ring-1 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Lớp 6 - 9">Lớp 6 - 9</option>
                <option value="Lớp 10 - 12">Lớp 10 - 12</option>
                <option value="Đại học / Đi làm">Đại học / Đi làm</option>
              </select>
            </div>
          </div>

          {/* Interactive Source editor with native inline scrollbars */}
          <div className="relative leading-relaxed w-full overflow-x-auto bg-[#1e1e1e]" style={{ minHeight: '260px', maxHeight: '400px', overflowY: 'auto' }}>
            <Editor
              value={code}
              onValueChange={newCode => {
                setCode(newCode);
                setStatus('idle');
                setAiError(null);
              }}
              highlight={highlightedCode => {
                try {
                  const lang = Prism.languages.python || Prism.languages.clike || {};
                  let htmlOut = Prism.highlight(highlightedCode, lang, 'python');
                  
                  // Real-time: If AI tells us exactly what line is incorrect, highlight that line row!
                  if (aiError && aiError.hasError && aiError.line > 0) {
                    const lines = highlightedCode.split('\n');
                    const targetIdx = aiError.line - 1;
                    if (targetIdx < lines.length) {
                      // Inject custom background styling or red indicator to highlight precise line
                      const updatedLines = lines.map((l, i) => {
                        const hlLine = Prism.highlight(l, lang, 'python');
                        if (i === targetIdx) {
                          return `<span class="bg-red-950/50 border-l-4 border-red-500 block -mx-4 px-4 pl-3" title="${aiError.explanation}">${hlLine || '&nbsp;'}</span>`;
                        }
                        return hlLine;
                      });
                      return updatedLines.join('\n');
                    }
                  }
                  return htmlOut;
                } catch (e) {
                  return highlightedCode;
                }
              }}
              padding={16}
              style={{
                fontFamily: '"JetBrains Mono", "Fira Code", "Consolas", monospace',
                fontSize: 12,
                color: '#d4d4d4',
                backgroundColor: 'transparent',
                width: '100%',
                minWidth: '550px' // Ensure horizontal scrollable block inside narrow mobile layout
              }}
            />
          </div>

          {/* Integrated terminal inside matching specification layout (Requirement 5) */}
          <div className="border-t border-slate-800 bg-black p-3 font-mono text-xs flex flex-col justify-between" style={{ minHeight: '120px' }}>
            <div className="flex items-center justify-between text-slate-500 border-b border-slate-900 pb-1.5 mb-2">
              <span className="flex items-center text-blue-400 gap-1 text-[10px] sm:text-xs"><span className="text-blue-550 font-bold">$</span> TERMINAL / OUTPUT</span>
              <button 
                onClick={runCode}
                disabled={status === 'running'}
                className="bg-green-600 hover:bg-green-500 active:scale-[0.98] disabled:opacity-50 text-white font-bold px-4 py-1.5 rounded-lg text-xs transition flex items-center gap-1 cursor-pointer select-none"
                style={{ minHeight: '36px' }}
              >
                <Play className="w-3.5 h-3.5 text-white" />
                <span>{status === 'running' ? 'Đang chạy...' : 'Run & Chạy thử'}</span>
              </button>
            </div>
            <div className="flex-1 whitespace-pre-wrap leading-relaxed overflow-x-auto overflow-y-auto max-h-40 min-h-[50px] w-full text-[11px] sm:text-xs">
              {output ? (
                <div className={status === 'error' ? 'text-rose-400 font-mono' : 'text-emerald-450 font-mono'}>
                  {output}
                </div>
              ) : (
                <div className="text-slate-650 italic">Nhấn nút [Run & Chạy thử] để thực thi code Python và giám sát lỗi...</div>
              )}
            </div>
          </div>
        </div>

        {/* AI Error feedback panels (Requirement 4 check panel) */}
        <AnimatePresence>
          {aiError && aiError.hasError && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="bg-red-50/95 border-2 border-red-200 p-4 rounded-2xl shadow-sm text-sm"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-bold text-red-900 flex items-center gap-1">
                    <span>AI phát hiện lỗi tại dòng {aiError.line}:</span>
                  </div>
                  <div className="mt-1 text-slate-700 dark:text-slate-200 font-medium whitespace-pre-wrap">
                    {aiError.explanation}
                  </div>
                  
                  {/* Visual Side-by-Side compare boxes (Requirement 15) */}
                  {aiError.wrong && aiError.right && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-3">
                      <div className="bg-white dark:bg-slate-900 border-2 border-red-100 p-3 rounded-xl">
                        <span className="text-[10px] uppercase font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full block w-max mb-1.5">❌ Code dải bị sai</span>
                        <pre className="font-mono text-xs text-red-650 bg-red-50/30 p-2 rounded-lg line-through whitespace-pre-wrap select-text">{aiError.wrong}</pre>
                      </div>
                      <div className="bg-white dark:bg-slate-900 border-2 border-emerald-200 p-3 rounded-xl">
                        <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full block w-max mb-1.5">✅ Sửa đúng như sau</span>
                        <pre className="font-mono text-xs text-emerald-800 bg-emerald-50/30 p-2 rounded-lg font-bold whitespace-pre-wrap select-text">{aiError.right}</pre>
                      </div>
                    </div>
                  )}

                  {aiError.suggestion && (
                    <div className="mt-2 bg-white dark:bg-slate-900 border border-red-105 p-2.5 rounded-lg font-sans text-xs text-slate-600 dark:text-slate-400">
                      <span className="font-bold text-emerald-700 block mb-0.5">Lời khuyên sửa đổi từ Gia sư:</span>
                      <span className="font-medium whitespace-pre-wrap select-text">{aiError.suggestion}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading Indicator */}
        {isAnalyzing && (
          <div className="bg-slate-100 dark:bg-slate-800 text-slate-500 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-center text-xs animate-pulse font-medium">
            <Loader2 className="w-4 h-4 animate-spin inline-block mr-1 text-blue-600" /> AI đang kiểm tra chi tiết thụt lề và chính tả của code...
          </div>
        )}

        {/* AI step chat sidebar inside the block (Requirement 6 helper) */}
        {showTutorChat && (
          <div className="bg-indigo-50/50 p-4 border border-indigo-200 rounded-2xl flex flex-col shadow-sm">
            <div className="flex items-center justify-between border-b border-indigo-200/60 pb-2 mb-3">
              <span className="font-bold text-sm text-indigo-900 flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-indigo-600" /> Gia Sư Gợi Ý Từng Bước
              </span>
              <button 
                type="button" 
                onClick={() => setShowSolutionRevealed(!showSolutionRevealed)}
                className="text-[10px] bg-indigo-200/50 hover:bg-indigo-200 text-indigo-900 px-2 py-0.5 rounded font-bold transition"
              >
                {showSolutionRevealed ? 'Ẩn mã tham khảo' : 'Xem mã tham khảo'}
              </button>
            </div>

            {/* Response messages stream */}
            <div className="space-y-3.5 max-h-64 overflow-y-auto mb-3 bg-white dark:bg-slate-900 border border-indigo-100 rounded-xl p-3">
              {tutorMessages.map((m, i) => (
                <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <span className="text-[10px] text-slate-400 font-bold mb-0.5">{m.role === 'user' ? 'Bạn' : 'AI Tutor'}</span>
                  <div className={`p-2.5 rounded-xl text-sm leading-relaxed max-w-[90%] whitespace-pre-wrap ${m.role === 'user' ? 'bg-indigo-600 text-white animate-in fade-in' : 'bg-slate-50 dark:bg-slate-800/80 text-slate-750 border border-slate-100 dark:border-slate-700/50 font-medium'}`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {isTutorLoading && (
                <div className="flex items-center gap-1.5 text-sm text-indigo-500 italic">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> AI Tutor đang phân tích...
                </div>
              )}
            </div>

            {/* Input questions inside step builder */}
            <div className="flex gap-2">
              <input 
                type="text" 
                value={aiTutorPrompt}
                onChange={e => setAiTutorPrompt(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && askTutorMessage(aiTutorPrompt)}
                placeholder="Hỏi tiếp gia sư (ví dụ: 'Hãy gợi ý bước tiếp theo của vòng lặp')"
                className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm rounded-xl px-3 h-9 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                disabled={isTutorLoading}
              />
              <button 
                type="button" 
                onClick={() => askTutorMessage(aiTutorPrompt)}
                disabled={isTutorLoading || !aiTutorPrompt.trim()}
                className="bg-indigo-600 text-white px-4 rounded-xl text-xs sm:text-sm font-bold hover:bg-slate-900 transition"
              >
                Gửi
              </button>
            </div>

            {/* Hidden answer references */}
            {showSolutionRevealed && expectedContent && (
              <div className="mt-3 bg-slate-900 text-slate-300 p-3 rounded-lg text-xs font-mono border border-indigo-500 animate-in fade-in duration-300">
                <span className="text-amber-500 font-bold block mb-1">Mã tham chiếu thực tế:</span>
                <pre>{expectedContent}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
