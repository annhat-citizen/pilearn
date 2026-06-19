import React, { useState, useEffect } from 'react';
import { Play, CheckCircle, XCircle, Bot } from 'lucide-react';
import { motion } from 'motion/react';
import { audioService } from '../utils/audio';
import { AIAssistant } from './AIAssistant';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import 'prismjs/themes/prism-twilight.css'; // or any dark theme

interface IDEProps {
  initialCode?: string;
  expectedContent?: string;
  onSuccess?: () => void;
  readOnly?: boolean;
  contextTitle?: string;
  onChange?: (code: string) => void;
  hideAITutor?: boolean;
}

export function IDE({ initialCode = '', expectedContent, onSuccess, readOnly = false, contextTitle = '', onChange, hideAITutor = false }: IDEProps) {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState('');
  const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [isAIOpen, setIsAIOpen] = useState(false);

  // Simple simulator for basic Python execution in Javascript
  const simulatePython = (codeStr: string): { output: string; success: boolean; errorDetail?: string } => {
    let outputLines: string[] = [];
    const printFn = (...args: any[]) => {
      outputLines.push(args.map(arg => {
        if (typeof arg === 'boolean') {
          return arg ? 'True' : 'False';
        }
        if (arg === null || arg === undefined) {
          return 'None';
        }
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
        if (!trimmed || trimmed.startsWith('#')) {
          continue;
        }

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
            .replace(/\bFalse\b/g, 'false')
            .replace(/([a-zA-Z0-9_\'"\[\]\(\)\s]+)\s+in\s+([a-zA-Z0-9_\'"\[\]\(\)\s]+)/g, '$2.includes($1)');
          lineCode = `if (${cond}) {`;
          indentStack.push(indent + 1);
        }
        else if (trimmed.startsWith('elif ') && trimmed.endsWith(':')) {
          const cond = trimmed.substring(5, trimmed.length - 1)
            .replace(/\band\b/g, '&&')
            .replace(/\bor\b/g, '||')
            .replace(/\bnot\b/g, '!')
            .replace(/\bTrue\b/g, 'true')
            .replace(/\bFalse\b/g, 'false')
            .replace(/([a-zA-Z0-9_\'"\[\]\(\)\s]+)\s+in\s+([a-zA-Z0-9_\'"\[\]\(\)\s]+)/g, '$2.includes($1)');
          lineCode = `} else if (${cond}) {`;
        }
        else if (trimmed === 'else:') {
          lineCode = `} else {`;
        }
        else if (trimmed.startsWith('for ') && trimmed.endsWith(':')) {
          const forBody = trimmed.substring(4, trimmed.length - 1);
          const parts = forBody.split(' in ');
          if (parts.length === 2) {
            const item = parts[0].trim();
            const iter = parts[1].trim();
            if (iter.startsWith('range(')) {
              const rangeArgs = iter.substring(6, iter.length - 1).split(',').map(x => x.trim());
              let start = '0', end = '0', step = '1';
              if (rangeArgs.length === 1) {
                end = rangeArgs[0];
              } else if (rangeArgs.length === 2) {
                start = rangeArgs[0];
                end = rangeArgs[1];
              } else if (rangeArgs.length === 3) {
                start = rangeArgs[0];
                end = rangeArgs[1];
                step = rangeArgs[2];
              }
              lineCode = `for (let ${item} = ${start}; ${item} < ${end}; ${item} += ${step}) {`;
              indentStack.push(indent + 1);
            } else {
              lineCode = `for (let ${item} of ${iter}) {`;
              indentStack.push(indent + 1);
            }
          }
        }
        else if (trimmed.startsWith('while ') && trimmed.endsWith(':')) {
          const cond = trimmed.substring(6, trimmed.length - 1)
            .replace(/\band\b/g, '&&')
            .replace(/\bor\b/g, '||')
            .replace(/\bTrue\b/g, 'true')
            .replace(/\bFalse\b/g, 'false');
          lineCode = `while (${cond}) {`;
          indentStack.push(indent + 1);
        }
        else {
          lineCode = lineCode.replace(/\.append\((.*?)\)/g, '.push($1)');
          lineCode = lineCode.replace(/\.pop\(\s*0\s*\)/g, '.shift()');
          lineCode = lineCode.replace(/\.pop\((.*?)\)/g, '.splice($1, 1)');
          
          lineCode = lineCode.replace(/\bTrue\b/g, 'true');
          lineCode = lineCode.replace(/\bFalse\b/g, 'false');
          lineCode = lineCode.replace(/\band\b/g, '&&');
          lineCode = lineCode.replace(/\bor\b/g, '||');
          lineCode = lineCode.replace(/\bnot\b/g, '!');

          lineCode = lineCode.replace(/([a-zA-Z0-9_\'"\[\]\(\)\s]+)\s+in\s+([a-zA-Z0-9_\'"\[\]\(\)\s]+)/g, '$2.includes($1)');
          lineCode = lineCode.replace(/\binput\((.*?)\)/g, '"5"');
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
          if (typeof x === 'string') x = x.replace(/^["']|["']$/g, '');
          let val = parseInt(x, 10);
          return isNaN(val) ? 0 : val;
        };
        var float = function(x) { 
          if (typeof x === 'string') x = x.replace(/^["']|["']$/g, '');
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

      return {
        output: outputLines.join('\n'),
        success: true
      };
    } catch (err: any) {
      return {
        output: `SyntaxError / TypeError: Lỗi cú pháp Python hoặc lỗi thực thi.\nChi tiết: ${err.message}`,
        success: false,
        errorDetail: err.message
      };
    }
  };

  // (Code handler removed because it is now inline in onValueChange)
  
  const runCode = () => {
    audioService.playClick();
    setStatus('running');
    setOutput('');
    
    setTimeout(() => {
      const userResult = simulatePython(code);
      
      if (!userResult.success) {
        audioService.playError();
        setOutput(userResult.output);
        setStatus('error');
        setIsAIOpen(true); // Open AI tutor on error
        return;
      }

      // Code simulation succeeded. Display the actual printed output of student's program!
      let displayOutput = userResult.output;
      
      // Let's perform grading if expectedContent exists
      if (expectedContent) {
        const expectedResult = simulatePython(expectedContent);
        
        let gradePassed = false;
        if (expectedResult.success) {
          const userNorm = userResult.output.trim().replace(/\s+/g, ' ');
          const expNorm = expectedResult.output.trim().replace(/\s+/g, ' ');
          if (userNorm === expNorm || userNorm.includes(expNorm)) {
            gradePassed = true;
          }
        } else {
          // fallback string inclusion in code
          if (code.includes('print')) {
            const cleanExpected = expectedContent.trim();
            if (cleanExpected.includes('Xin chào')) {
              gradePassed = code.includes('Xin chào');
            } else {
              gradePassed = true;
            }
          }
        }

        if (gradePassed) {
          audioService.playSuccess();
          displayOutput += (displayOutput ? "\n\n" : "") + "✓ Chúc mừng! Chương trình đã chạy chính xác và khớp với kết quả yêu cầu.";
          setOutput(displayOutput);
          setStatus('success');
          setIsAIOpen(false); // Close AI helper on success
          if (onSuccess) onSuccess();
        } else {
          audioService.playError();
          displayOutput += (displayOutput ? "\n\n" : "") + `⚠ Lỗi Logic: Kết quả in ra màn hình chưa đúng yêu cầu.\n\nKết quả mong muốn:\n${expectedResult.output || "(Kết quả đúng tương ứng của bài thực hành)"}`;
          setOutput(displayOutput);
          setStatus('error');
          setIsAIOpen(true); // Open AI helper on error
        }
      } else {
        // Simple sandbox run - no grading needed
        audioService.playSuccess();
        displayOutput = displayOutput || "Đã chạy xong chương trình (Không có dữ liệu nào được in ra màn hình).";
        setOutput(displayOutput);
        setStatus('success');
      }
    }, 800);
  };

  return (
    <div className="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-2xl border border-gray-800 text-sm relative">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-gray-800">
        <div className="flex items-center space-x-2 text-gray-400 font-mono text-xs">
          <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
          <span className="ml-2">main.py</span>
        </div>
        <div className="flex items-center space-x-3">
          {!hideAITutor && (
            <button
              onClick={() => {
                // Open AI tutor and simulate a first message
                setIsAIOpen(true);
              }}
              className="flex items-center space-x-1 px-3 py-1 bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 text-xs font-medium rounded transition-colors"
              title="Giải thích mã nguồn"
            >
              <Bot className="w-4 h-4" />
              <span>Explain answer</span>
            </button>
          )}
          {!hideAITutor && (
            <button
              onClick={() => setIsAIOpen(!isAIOpen)}
              className="flex items-center space-x-1 px-3 py-1 text-slate-200 hover:text-blue-400 text-xs font-medium transition-colors"
              title="Hỏi AI Tutor"
            >
              <Bot className="w-4 h-4" />
              <span>AI Tutor</span>
            </button>
          )}
          {!readOnly && (
            <button
              onClick={runCode}
              disabled={status === 'running'}
              className="flex items-center space-x-1 px-3 py-1 bg-green-600 hover:bg-green-500 text-white rounded text-xs font-medium transition-colors disabled:opacity-50"
            >
              <Play className="w-3 h-3" />
              <span>{status === 'running' ? 'Đang chạy...' : 'Run Code'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Editor Body */}
      <div className={`bg-[#1e1e1e] font-mono p-2 overflow-auto transition-colors duration-300 ${status === 'error' ? 'bg-red-950/20' : ''}`} style={{ minHeight: '400px', maxHeight: '500px' }}>
        <Editor
          value={code}
          onValueChange={newCode => {
            setCode(newCode);
            if (onChange) onChange(newCode);
            setStatus('idle'); // Clear error status on typing
          }}
          highlight={code => {
            try {
              let highlighted = Prism.highlight(code, Prism.languages.python || Prism.languages.clike || {}, 'python');
              return highlighted;
            } catch (e) {
              return code;
            }
          }}
          padding={15}
          style={{
            fontFamily: '"JetBrains Mono", "Fira Code", monospace',
            fontSize: 14,
            backgroundColor: 'transparent',
            outline: 'none',
            border: 'none',
            color: '#d4d4d4',
            minHeight: '100%',
          }}
          textareaClassName="focus:outline-none"
          disabled={readOnly}
        />
      </div>

      {/* Terminal Output */}
      {output && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="border-t border-gray-800 bg-[#171717] p-4 font-mono text-xs"
        >
          <div className="flex items-center text-gray-400 mb-2">
            <span className="text-blue-400 mr-2">$</span> Terminal
          </div>
          <div className={`whitespace-pre-wrap ${status === 'error' ? 'text-red-400' : 'text-green-400'}`}>
            {output}
          </div>
        </motion.div>
      )}

      {/* AI Assistant Floating Over IDE */}
      {!hideAITutor && (
        <AIAssistant 
          currentCode={code} 
          errorMsg={status === 'error' ? output : ''}
          context={contextTitle}
          isOpen={isAIOpen} 
          onClose={() => setIsAIOpen(false)} 
        />
      )}
    </div>
  );
}
