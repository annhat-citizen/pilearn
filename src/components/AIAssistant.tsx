import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSettings } from '../contexts/SettingsContext';

interface AIAssistantProps {
  currentCode: string;
  errorMsg: string;
  context: string;
  isOpen: boolean;
  onClose: () => void;
  initialLevel?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function AIAssistant({ currentCode, errorMsg, context, isOpen, onClose, initialLevel = 'Lớp 10 - 12' }: AIAssistantProps) {
  const { groqApiKey } = useSettings();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [level, setLevel] = useState(initialLevel);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // If error appears, maybe auto-trigger a greeting about the error if there are no messages
  useEffect(() => {
    if (isOpen && errorMsg && errorMsg !== '' && messages.length === 0) {
      setMessages([
        { role: 'assistant', content: 'Chào bạn! Mình là AI Tutor. Mình thấy bạn đang gặp lỗi sau: \n`' + errorMsg + '`\nBạn cần mình gợi ý hay giải thích điểm nào không?' }
      ]);
    }
    if (isOpen && !errorMsg && messages.length === 0) {
      setMessages([
        { role: 'assistant', content: 'Chào bạn! Mình là AI Tutor. Mình có thể giúp bạn giải thích code hoặc đưa ra gợi ý nếu bạn gặp khó khăn. Bạn muốn hỏi gì nào?' }
      ]);
    }
  }, [isOpen, errorMsg, messages.length]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(groqApiKey ? { 'X-API-Key': groqApiKey } : {})
        },
        body: JSON.stringify({
          code: currentCode,
          error: errorMsg,
          studentMessage: userMsg,
          context: context,
          level: level
        })
      });

      const data = await response.json();
      if (data.reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Xin lỗi, có lỗi xảy ra khi gọi AI.' }]);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Xin lỗi, mình đang gặp sự cố kết nối. Vui lòng thử lại sau.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="fixed bottom-4 right-4 w-80 sm:w-96 h-[520px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden z-50 text-sans"
        >
          {/* Header */}
          <div className="bg-slate-900 px-4 py-3 flex items-center justify-between text-white">
            <div className="flex items-center space-x-2">
              <Bot className="w-5 h-5 text-blue-400" />
              <div>
                <span className="font-bold text-sm block">AI Tutor</span>
                <span className="text-[10px] text-gray-400 block -mt-0.5">Trợ lý học lập trình 24/7</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* Level Dropdown */}
              <select 
                value={level} 
                onChange={(e) => setLevel(e.target.value)}
                className="bg-slate-800 text-[11px] text-gray-200 border border-slate-700 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans cursor-pointer"
                title="Thay đổi trình độ giải thích của AI"
              >
                <option value="Lớp 6 - 9">Lớp 6 - 9 (Dễ hiểu)</option>
                <option value="Lớp 10 - 12">Lớp 10 - 12 (Thực tế)</option>
                <option value="Đại học / Đi làm">Đại học / Đi làm (Chuyên sâu)</option>
              </select>
              <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-[14px] sm:text-base leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-white border border-gray-200 text-slate-800 rounded-bl-none shadow-sm'
                }`}>
                  {msg.content.split('\\n').map((line, j) => (
                    <React.Fragment key={j}>
                      {line}<br/>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none px-4 py-2 shadow-sm text-blue-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-gray-200 flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Bạn muốn hỏi gì?"
              className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button 
              onClick={sendMessage} 
              disabled={isLoading || !input.trim()}
              className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
