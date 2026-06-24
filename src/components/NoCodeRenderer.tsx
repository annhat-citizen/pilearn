import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NoCodeBlock, NoCodeAppearance } from '../lib/nocode_store';
import { useSettings } from '../contexts/SettingsContext';
import { useAppContext } from '../store';
import { audioService } from '../utils/audio';
import { 
  Sparkles, Keyboard, Award, CheckCircle2, 
  HelpCircle, ChevronDown, MessageSquare, Play, 
  Check, PlayCircle, Star, Award as BadgeIcon,
  Share2, Megaphone, ShoppingCart, Film, User, 
  Presentation, Building2, MapPin, Music, LayoutGrid, 
  Terminal, Repeat, ShoppingBag, GitFork, BookOpen, Swords, Code
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import remarkBreaks from 'remark-breaks';
import { RichTextEditorWithFontUpload } from './RichTextEditorWithFontUpload';
import { IDE } from './IDE';

interface NoCodeRendererProps {
  blocks: NoCodeBlock[];
  appearance: NoCodeAppearance;
  isLiveEditing?: boolean;
  onBlockUpdate?: (blockId: string, updatedBlock: Partial<NoCodeBlock>) => void;
  onAddBlockClick?: (insertIndex: number) => void;
  onMoveBlock?: (id: string, direction: 'up' | 'down') => void;
  onDeleteBlock?: (id: string) => void;
  onReorderBlocks?: (reorderedBlocks: NoCodeBlock[]) => void;
}

export function NoCodeRenderer({
  blocks,
  appearance,
  isLiveEditing = false,
  onBlockUpdate,
  onAddBlockClick,
  onMoveBlock,
  onDeleteBlock,
  onReorderBlocks
}: NoCodeRendererProps) {
  const { groqApiKey } = useSettings();
  const { setView } = useAppContext();

  const handleRegisterClick = () => {
    audioService.playClick();
    setView('roadmap');
  };

  // AI block state
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Quiz state: blockId -> active index answer
  const [quizAnswers, setQuizAnswers] = useState<Record<string, Record<number, number>>>({});
  const [quizFeedback, setQuizFeedback] = useState<Record<string, Record<number, string>>>({});

  // Game state: blockId -> answer input string
  const [gameInputs, setGameInputs] = useState<Record<string, string>>({});
  const [gameSuccess, setGameSuccess] = useState<Record<string, boolean>>({});

  // FAQ open states: blockId-index -> boolean
  const [faqOpen, setFaqOpen] = useState<Record<string, boolean>>({});

  // Interactive Hero Dashboard states
  const [heroTab, setHeroTab] = useState<'ai' | 'code' | 'game'>('ai');
  const [heroAiInput, setHeroAiInput] = useState('');
  const [heroAiResponse, setHeroAiResponse] = useState('');
  const [heroAiLoading, setHeroAiLoading] = useState(false);
  const [heroCode, setHeroCode] = useState('name = "Pilearn"\nprint("Xin chào " + name + "! Bạn đã sẵn sàng học Python chưa?")');
  const [heroGameInput, setHeroGameInput] = useState('');
  const [heroGameSuccess, setHeroGameSuccess] = useState<boolean | null>(null);
  const [heroSelectedModel, setHeroSelectedModel] = useState('Gemini 3.5 Flash');

  // Canva Style PageBuilder Selection controls
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  
  // Local edit buffer for the active block to allow full Cancel and Save
  const [editingBlock, setEditingBlock] = useState<NoCodeBlock | null>(null);

  // When selected block changes, initialize or reset editingBlock state
  useEffect(() => {
    if (selectedBlockId) {
      const orig = blocks.find(b => b.id === selectedBlockId);
      if (orig) {
        setEditingBlock(JSON.parse(JSON.stringify(orig)));
      } else {
        setEditingBlock(null);
      }
    } else {
      setEditingBlock(null);
    }
  }, [selectedBlockId, blocks]);

  // Initialize AOS (Animate On Scroll) for dynamic scroll animations
  useEffect(() => {
    if (typeof (window as any).AOS !== 'undefined') {
      (window as any).AOS.init({
        duration: 1800,
        once: false,
        mirror: true,
        offset: 120,
      });
    }
  }, []);

  // Refresh AOS when blocks re-render so new elements animate properly
  useEffect(() => {
    if (typeof (window as any).AOS !== 'undefined') {
      const timer = setTimeout(() => {
        (window as any).AOS.refresh();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [blocks]);

  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    if (!isLiveEditing) return;
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
    audioService.playClick();
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    if (!isLiveEditing || draggedId === id) return;
    e.preventDefault();
    setDragOverId(id);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    if (!isLiveEditing || !draggedId || draggedId === targetId) return;
    e.preventDefault();

    const fromIdx = blocks.findIndex(b => b.id === draggedId);
    const toIdx = blocks.findIndex(b => b.id === targetId);
    if (fromIdx === -1 || toIdx === -1) return;

    const newBlocks = [...blocks];
    const [removed] = newBlocks.splice(fromIdx, 1);
    newBlocks.splice(toIdx, 0, removed);

    audioService.playSuccess();
    if (onReorderBlocks) {
      onReorderBlocks(newBlocks);
    }

    setDraggedId(null);
    setDragOverId(null);
  };

  const updateEditingBlockField = (field: keyof NoCodeBlock, value: any) => {
    if (editingBlock) {
      setEditingBlock(prev => {
        if (!prev) return null;
        return {
          ...prev,
          [field]: value
        };
      });
    }
  };

  const handleActiveBlockUpdate = (updatedFields: Partial<NoCodeBlock>) => {
    if (editingBlock) {
      setEditingBlock(prev => {
        if (!prev) return null;
        return {
          ...prev,
          ...updatedFields
        };
      });
    } else if (selectedBlockId && onBlockUpdate) {
      onBlockUpdate(selectedBlockId, updatedFields);
    }
  };

  const activeBlock = (isLiveEditing && editingBlock && editingBlock.id === selectedBlockId) 
    ? editingBlock 
    : (selectedBlockId ? blocks.find(b => b.id === selectedBlockId) : null);

  const handleScaleDragStart = (e: React.MouseEvent, block: NoCodeBlock) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const startScale = block.scale || 100;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const direction = (deltaX + deltaY) > 0 ? 1 : -1;
      const change = Math.round(distance / 2) * direction;
      const newScale = Math.max(30, Math.min(300, startScale + change));
      if (isLiveEditing && selectedBlockId === block.id) {
        updateEditingBlockField('scale', newScale);
      } else if (onBlockUpdate) {
        onBlockUpdate(block.id, { scale: newScale });
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleRotateDragStart = (e: React.MouseEvent, block: NoCodeBlock) => {
    e.preventDefault();
    e.stopPropagation();
    // Compute block center to find rotation vector
    const rect = e.currentTarget.parentElement?.getBoundingClientRect();
    if (!rect) return;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const angle = Math.atan2(moveEvent.clientY - centerY, moveEvent.clientX - centerX);
      const degrees = Math.round(angle * (180 / Math.PI)) - 90;
      if (isLiveEditing && selectedBlockId === block.id) {
        updateEditingBlockField('rotation', degrees);
      } else if (onBlockUpdate) {
        onBlockUpdate(block.id, { rotation: degrees });
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const getBlockStyle = (block: NoCodeBlock): React.CSSProperties => {
    const style: React.CSSProperties = {
      transition: 'all 0.15s ease-out'
    };
    if (block.fontSize) {
      style.fontSize = `${block.fontSize}px`;
    }
    
    const scaleFactor = block.scale ? block.scale / 100 : 1;
    const rotDegrees = block.rotation || 0;
    
    let transformStr = '';
    
    if (rotDegrees !== 0) {
      transformStr += `rotate(${rotDegrees}deg) `;
    }
    
    if (transformStr) {
      style.transform = transformStr.trim();
      style.transformOrigin = 'center center';
    }
    
    if (block.fontFamily) {
      style.fontFamily = `"${block.fontFamily}", sans-serif`;
    }
    if (block.fontWeight) {
      style.fontWeight = block.fontWeight;
    }
    if (block.fontStyle) {
      style.fontStyle = block.fontStyle;
    }
    if (block.textDecoration) {
      style.textDecoration = block.textDecoration;
    }
    if (block.textColor) {
      style.color = block.textColor;
    }
    if (block.textTransform) {
      style.textTransform = block.textTransform;
    }
    if (block.align) {
      style.textAlign = block.align;
    }
    if (block.isHidden) {
      style.opacity = isLiveEditing ? 0.45 : 0;
    }

    // Advanced block visual styling overrides
    if (block.blockBgColor) {
      style.backgroundColor = block.blockBgColor;
    }
    if (block.blockBgGradient) {
      style.backgroundImage = block.blockBgGradient;
    }
    
    if (block.blockShadow) {
      if (block.blockShadow === 'sm') style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
      else if (block.blockShadow === 'md') style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
      else if (block.blockShadow === 'lg') style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
      else if (block.blockShadow === 'xl') style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
      else if (block.blockShadow === '2xl') style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
      else if (block.blockShadow === 'inner') style.boxShadow = 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)';
    }

    if (block.blockBorderRadius !== undefined) {
      style.borderRadius = `${block.blockBorderRadius}px`;
    } else if (block.borderRadius !== undefined) {
      style.borderRadius = `${block.blockBorderRadius !== undefined ? block.blockBorderRadius : block.borderRadius}px`;
    }

    if (block.blockBorderWidth !== undefined) {
      style.borderWidth = `${block.blockBorderWidth}px`;
      style.borderStyle = 'solid';
      style.borderColor = block.blockBorderColor || '#e2e8f0';
    }

    if (block.blockPaddingY !== undefined) {
      style.paddingTop = `${block.blockPaddingY}px`;
      style.paddingBottom = `${block.blockPaddingY}px`;
    }
    if (block.blockPaddingX !== undefined) {
      style.paddingLeft = `${block.blockPaddingX}px`;
      style.paddingRight = `${block.blockPaddingX}px`;
    }

    return style;
  };

  // Styles computed from appearance settings
  const fontClass = 
    appearance.fontFamily === 'mono' ? 'font-mono' :
    appearance.fontFamily === 'serif' ? 'font-serif' :
    appearance.fontFamily === 'grotesk' ? 'font-sans tracking-tight' : 
    (appearance.fontFamily && !['sans', 'mono', 'serif', 'grotesk'].includes(appearance.fontFamily)) ? '' : 'font-sans';

  const customFontStyle = (appearance.fontFamily && !['sans', 'mono', 'serif', 'grotesk'].includes(appearance.fontFamily))
    ? { fontFamily: `"${appearance.fontFamily}", sans-serif` }
    : {};

  const sizeClass = 
    appearance.fontSize === 'sm' ? 'text-sm' :
    appearance.fontSize === 'lg' ? 'text-lg' :
    appearance.fontSize === 'xl' ? 'text-xl' :
    appearance.fontSize === '2xl' ? 'text-2xl' : 'text-base';
  
  const rootStyle = {
    ...customFontStyle,
    ...(appearance.customFontUrl ? { '--custom-font-url': `url(${appearance.customFontUrl})` } as any : {}),
    zoom: appearance.fontScale ? `${appearance.fontScale}%` : '100%'
  };

  const roundClass = 
    appearance.borderRadius === 'none' ? 'rounded-none' :
    appearance.borderRadius === 'sm' ? 'rounded-sm' :
    appearance.borderRadius === 'md' ? 'rounded-md' :
    appearance.borderRadius === 'lg' ? 'rounded-lg' : 'rounded-3xl';

  const pYClass = 
    appearance.spacing === 'compact' ? 'py-8' :
    appearance.spacing === 'spacious' ? 'py-20' : 'py-14';

  const CustomFontsRenderer = () => {
    if (!appearance.customUploadedFonts || appearance.customUploadedFonts.length === 0) return null;
    return (
      <style>
        {appearance.customUploadedFonts.map(f => `
          @font-face {
            font-family: "${f.name}";
            src: url("${f.url}");
          }
        `).join('\n')}
      </style>
    );
  };

  // Handler for Live Inline Editing of elements
  const handleTextChange = (blockId: string, field: keyof NoCodeBlock, value: string) => {
    if (isLiveEditing && selectedBlockId === blockId) {
      updateEditingBlockField(field, value);
    } else if (onBlockUpdate) {
      onBlockUpdate(blockId, { [field]: value });
    }
  };

  const MemoizedBlockItem = React.memo(({ block, index }: { block: NoCodeBlock, index: number }) => {
    return (
      <div 
        key={block.id}
        draggable={isLiveEditing}
        onDragStart={(e) => handleDragStart(e, block.id)}
        onDragOver={(e) => handleDragOver(e, block.id)}
        onDragEnd={handleDragEnd}
        onDrop={(e) => handleDrop(e, block.id)}
        onClick={() => {
          if (isLiveEditing) {
            setSelectedBlockId(block.id);
            audioService.playClick();
          }
        }}
        className={`relative ${isLiveEditing ? 'cursor-pointer hover:ring-2 hover:ring-blue-400' : ''} ${selectedBlockId === block.id ? 'ring-2 ring-blue-500' : ''}`}
        style={getBlockStyle(block)}
      >
        <div className="relative group/edit">
          {isLiveEditing && selectedBlockId === block.id && block.type === 'text' && (
            <div className="absolute top-2 right-2 z-50">
               <button 
                 onClick={() => {
                   // This would ideally open a modal, but for now I'll just keep the block content editable structure but improved
                 }}
                 className="bg-blue-600 text-white text-[10px] px-2 py-1 rounded"
               >
                 Chỉnh Sửa Văn Bản
               </button>
            </div>
          )}
          {/* Block Content Rendering (Existing) */}
          {block.type === 'text' ? (
             <div 
               contentEditable={isLiveEditing}
               suppressContentEditableWarning
               onBlur={(e) => handleTextChange(block.id, 'content', e.currentTarget.innerHTML)}                
               className="outline-none"
               dangerouslySetInnerHTML={{ __html: block.content || '' }} 
             />
          ) : (
                <div className="block-content">Block {block.id} Content</div>
          )}
        </div>
      </div>
    );
  });

  const handleFAQChange = (blockId: string, blockItem: NoCodeBlock, index: number, field: string, value: any) => {
    const isEditingThis = isLiveEditing && selectedBlockId === blockId;
    const currentBlock = isEditingThis && editingBlock ? editingBlock : blockItem;
    if (!currentBlock.faqItems) return;
    const items = [...currentBlock.faqItems];
    items[index] = { ...items[index], [field]: value };
    
    if (isEditingThis) {
      updateEditingBlockField('faqItems', items);
    } else if (onBlockUpdate) {
      onBlockUpdate(blockId, { faqItems: items });
    }
  };

  const handlePricingChange = (blockId: string, blockItem: NoCodeBlock, index: number, field: string, value: any) => {
    const isEditingThis = isLiveEditing && selectedBlockId === blockId;
    const currentBlock = isEditingThis && editingBlock ? editingBlock : blockItem;
    if (!currentBlock.pricingTiers) return;
    const items = [...currentBlock.pricingTiers];
    items[index] = { ...items[index], [field]: value };
    
    if (isEditingThis) {
      updateEditingBlockField('pricingTiers', items);
    } else if (onBlockUpdate) {
      onBlockUpdate(blockId, { pricingTiers: items });
    }
  };

  // Run mock AI request (using gemini if key is available, or fall back immediately to an epic helpful simulated AI reply)
  const runAISample = async (promptText: string) => {
    if (!promptText.trim()) return;
    audioService.playClick();
    setAiLoading(true);
    setAiResponse('');
    setAiPrompt('');
    
    try {
      // Create real request to server API endpoint with current settings
      const response = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(groqApiKey ? { 'X-API-Key': groqApiKey } : {})
        },
        body: JSON.stringify({
          studentMessage: promptText,
          context: 'Trợ lý học lập trình Tuyệt Đỉnh (Home AI Block)',
          level: 'Lớp 10 - 12'
        })
      });

      const data = await response.json();
      const replyText = data.reply || '';

      if (replyText) {
        // Stream the live response beautifully word by word / char by char
        let written = '';
        for (let i = 0; i < replyText.length; i += 4) {
          written += replyText.substring(i, i + 4);
          setAiResponse(written);
          await new Promise(r => setTimeout(r, 8));
        }
      } else {
        throw new Error('Nút thắt kết nối');
      }
    } catch (e) {
      // Safe, educational curated offline response simulator fallback
      const replies = [
        `Xin chào! Rất tuyệt khi được hỗ trợ bạn học Python. Về câu hỏi của bạn, đây là ví dụ mã nguồn cực kỳ dễ hiểu:

\`\`\`python
# Khai báo một danh sách (list)
mon_hoc = ["Toán", "Văn", "Tin Học 10"]

# Thêm môn Python vào danh sách
mon_hoc.append("Lập Trình Python 🐍")

# Dùng vòng lặp in ra màn hình
for mon in mon_hoc:
    print("Tôi yêu thích học môn:", mon)
\`\`\`

Bạn có thể chạy thử đoạn mã trên ngay trong mục **Thực hành** của Pilearn đấy! Hãy ghi nhớ phím tắt \`Ctrl+Enter\` để tối ưu tốc độ sấm sét nhé!`,
        `Tuyệt vời! Hàm \`print()\` trong Python dùng để in dữ liệu ra cửa sổ màn hình (Terminal). Ví dụ:
\`\`\`python
ten = "Pilearn"
tuoi = 16
print(f"Chào bạn, tôi là {ten}, năm nay tôi {tuoi} tuổi!")
\`\`\`
Dấu \`f\` trước chuỗi viết tắt cho "Formatted string", giúp gắn các biến trực tiếp vào chuỗi văn bản vô cùng gọn gàng!`,
        `Thầy cô giáo và học sinh thường nhầm lẫn giữa vòng lặp \`for\` và \`while\`:
- \`for\`: Dùng khi biết trước số lần lặp (ví dụ lặp qua danh sách 5 bài học).
- \`while\`: Dùng khi muốn lặp liên tục cho tới khi một điều kiện sai đi (ví dụ game chạy đến khi người dùng chọn thoát).`
      ];
      // Random response
      const chosen = replies[Math.floor(Math.random() * replies.length)];
      
      let written = '';
      for (let i = 0; i < chosen.length; i += 4) {
        written += chosen.substring(i, i + 4);
        setAiResponse(written);
        await new Promise(r => setTimeout(r, 10));
      }
    } finally {
      setAiLoading(false);
    }
  };

  const CanvaTopToolbar = () => {
    if (!isLiveEditing) return null;

    return (
      <div className="fixed top-20 left-1/2 -ml-[300px] w-[600px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 z-[1000] shadow-2xl font-sans select-none rounded-2xl flex flex-col gap-2 text-slate-700 dark:text-slate-200">
        {activeBlock ? (
          <>
            {/* ROW 1: Typography, Alignment & Rotation */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Font Family Dropdown */}
              <div className="relative flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 shadow-2xs">
                <span className="text-[10.5px] text-slate-500 dark:text-slate-400 font-extrabold uppercase whitespace-nowrap">Phông:</span>
                <div className="relative group">
                  <button
                    className="text-xs font-bold focus:outline-none dark:text-white pointer-events-auto cursor-pointer flex items-center gap-1"
                    onClick={(e) => {
                      audioService.playClick();
                      (e.currentTarget.nextElementSibling as HTMLElement).classList.toggle('hidden');
                    }}
                  >
                    {activeBlock.fontFamily === 'sans' ? 'Mặc định (Inter)' : 
                     activeBlock.fontFamily === 'grotesk' ? 'Space Grotesk' :
                     activeBlock.fontFamily === 'serif' ? 'Playfair' :
                     activeBlock.fontFamily === 'mono' ? 'JetBrains Mono' : 
                     (activeBlock.fontFamily || 'Mặc định')}
                    <span className="text-[8px] opacity-50">▼</span>
                  </button>
                  <div className="hidden absolute top-full left-0 mt-1 w-[180px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-[2000] max-h-[200px] overflow-y-auto">
                    {[
                      { v: 'sans', l: 'Mặc định (Inter)' },
                      { v: 'grotesk', l: 'Space Grotesk 🌌' },
                      { v: 'serif', l: 'Playfair Display ✍️' },
                      { v: 'mono', l: 'JetBrains Mono 💻' },
                      { v: 'Arial', l: 'Arial' },
                      { v: 'Georgia', l: 'Georgia' },
                      { v: 'Times New Roman', l: 'Times New Roman' },
                      { v: 'Impact', l: 'Impact (Retro) 💥' },
                      { v: 'Passion One', l: 'Passion One 🔥' },
                    ].map(f => (
                      <button
                        key={f.v}
                        className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-white"
                        onClick={() => {
                          audioService.playClick();
                          handleActiveBlockUpdate({ fontFamily: f.v });
                          (document.activeElement as HTMLElement)?.closest('.relative')?.querySelector('.hidden')?.classList.add('hidden');
                        }}
                      >
                        {f.l}
                      </button>
                    ))}
                    {appearance.customUploadedFonts?.map(f => (
                      <button
                        key={f.name}
                        className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-white"
                        onClick={() => {
                          audioService.playClick();
                          handleActiveBlockUpdate({ fontFamily: f.name });
                          (document.activeElement as HTMLElement)?.closest('.relative')?.querySelector('.hidden')?.classList.add('hidden');
                        }}
                      >
                        {f.name} (Tải lên) 🚀
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Scale / Zoom Font Size adjustment */}
              <div className="flex items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xs overflow-hidden h-9">
                <button
                  onClick={() => {
                    audioService.playClick();
                    const currentScale = activeBlock.scale || 100;
                    handleActiveBlockUpdate({ scale: Math.max(30, currentScale - 5) });
                  }}
                  className="px-3 h-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-extrabold text-sm transition pointer-events-auto cursor-pointer"
                  title="Thu nhỏ block"
                >
                  －
                </button>
                <div className="px-3.5 font-mono text-xs font-black text-slate-800 dark:text-white border-x border-slate-200 dark:border-slate-800 h-full flex items-center min-w-[55px] justify-center bg-white dark:bg-slate-950">
                  {activeBlock.scale || 100}%
                </div>
                <button
                  onClick={() => {
                    audioService.playClick();
                    const currentScale = activeBlock.scale || 100;
                    handleActiveBlockUpdate({ scale: Math.min(300, currentScale + 5) });
                  }}
                  className="px-3 h-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-extrabold text-sm transition pointer-events-auto cursor-pointer"
                  title="Phóng to block"
                >
                  ＋
                </button>
              </div>

              <div className="w-px h-5 bg-slate-300 dark:bg-slate-700 mx-1 animate-pulse" />

              {/* Typography Styles */}
              <div className="flex bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xs p-0.5">
                {/* Text Color button */}
                <div className="relative flex items-center p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer transition pointer-events-auto">
                  <input
                    type="color"
                    value={activeBlock.textColor || '#1e293b'}
                    onChange={(e) => {
                      handleActiveBlockUpdate({ textColor: e.target.value });
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    title="Chọn màu chữ"
                  />
                  <div className="flex flex-col items-center">
                    <span className="font-bold text-xs leading-none">A</span>
                    <div 
                      className="w-4 h-1 rounded-full mt-0.5" 
                      style={{ backgroundColor: activeBlock.textColor || '#1e293b' }} 
                    />
                  </div>
                </div>

                <button
                  onClick={() => {
                    audioService.playClick();
                    handleActiveBlockUpdate({ fontWeight: activeBlock.fontWeight === 'bold' ? 'normal' : 'bold' });
                  }}
                  className={`p-1.5 px-3 rounded font-bold text-xs transition pointer-events-auto ${activeBlock.fontWeight === 'bold' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 shadow-3xs' : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                  title="In đậm"
                >
                  B
                </button>

                <button
                  onClick={() => {
                    audioService.playClick();
                    handleActiveBlockUpdate({ fontStyle: activeBlock.fontStyle === 'italic' ? 'normal' : 'italic' });
                  }}
                  className={`p-1.5 px-3 rounded italic text-xs transition pointer-events-auto ${activeBlock.fontStyle === 'italic' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 shadow-3xs' : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                  title="In nghiêng"
                >
                  I
                </button>

                <button
                  onClick={() => {
                    audioService.playClick();
                    const current = activeBlock.textDecoration || 'none';
                    const isUnderlined = current.includes('underline');
                    const isStriked = current.includes('line-through');
                    let next: NoCodeBlock['textDecoration'] = 'none';
                    if (!isUnderlined && isStriked) next = 'underline line-through';
                    else if (!isUnderlined && !isStriked) next = 'underline';
                    else if (isUnderlined && isStriked) next = 'line-through';
                    handleActiveBlockUpdate({ textDecoration: next });
                  }}
                  className={`p-1.5 px-3 rounded underline text-xs transition pointer-events-auto ${(activeBlock.textDecoration || 'none').includes('underline') ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 shadow-3xs' : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                  title="Gạch chân"
                >
                  U
                </button>

                <button
                  onClick={() => {
                    audioService.playClick();
                    const current = activeBlock.textDecoration || 'none';
                    const isUnderlined = current.includes('underline');
                    const isStriked = current.includes('line-through');
                    let next: NoCodeBlock['textDecoration'] = 'none';
                    if (!isStriked && isUnderlined) next = 'underline line-through';
                    else if (!isStriked && !isUnderlined) next = 'line-through';
                    else if (isStriked && isUnderlined) next = 'underline';
                    handleActiveBlockUpdate({ textDecoration: next });
                  }}
                  className={`p-1.5 px-3 rounded line-through text-xs transition pointer-events-auto ${(activeBlock.textDecoration || 'none').includes('line-through') ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 shadow-3xs' : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                  title="Gạch chéo"
                >
                  S
                </button>

                <button
                  onClick={() => {
                    audioService.playClick();
                    handleActiveBlockUpdate({ textTransform: activeBlock.textTransform === 'uppercase' ? 'none' : 'uppercase' });
                  }}
                  className={`p-1.5 px-2.5 rounded text-xs transition pointer-events-auto ${activeBlock.textTransform === 'uppercase' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 shadow-3xs' : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                  title="Chữ in hoa (aA)"
                >
                  aA
                </button>
              </div>

              {/* Alignments */}
              <div className="flex bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xs p-0.5">
                {(['left', 'center', 'right'] as const).map((align) => (
                  <button
                    key={align}
                    onClick={() => {
                      audioService.playClick();
                      handleActiveBlockUpdate({ align });
                    }}
                    className={`p-1.5 px-3 rounded text-[10px] uppercase font-black transition pointer-events-auto ${activeBlock.align === align || (!activeBlock.align && align === 'left') ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 shadow-3xs' : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                  >
                    {align === 'left' ? '← Trái' : align === 'center' ? '↔ Giữa' : '→ Phải'}
                  </button>
                ))}
              </div>

              {/* Fine Rotation Scale Slider */}
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 h-9 shadow-2xs text-xs font-bold">
                <span className="text-slate-400">Xoay:</span>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  value={activeBlock.rotation || 0}
                  onChange={(e) => handleActiveBlockUpdate({ rotation: parseInt(e.target.value) })}
                  className="w-16 accent-blue-600 h-1 pointer-events-auto cursor-pointer"
                />
                <span className="font-mono text-[10.5px] w-8 text-right text-indigo-500 font-extrabold">{activeBlock.rotation || 0}°</span>
              </div>

              <div className="flex-1" />

              {/* Unselect button */}
              <button
                onClick={() => {
                  audioService.playClick();
                  setSelectedBlockId(null);
                }}
                className="text-[10px] font-black uppercase text-slate-400 hover:text-slate-600 bg-slate-100 dark:bg-slate-950 px-2.5 py-1.5 rounded pointer-events-auto transition active:scale-95"
              >
                Bỏ chọn ✕
              </button>
            </div>

            {/* ROW 2: Advanced Block Visual CSS (Canva-Style) */}
            <div className="w-full flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/50 mt-1">
              {/* Background Color Picker */}
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 shadow-2xs">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase">🎨 MÀU NỀN:</span>
                <div className="relative flex items-center cursor-pointer">
                  <input
                    type="color"
                    value={activeBlock.blockBgColor || '#ffffff'}
                    onChange={(e) => handleActiveBlockUpdate({ blockBgColor: e.target.value, blockBgGradient: undefined })}
                    className="w-5 h-5 rounded cursor-pointer border border-slate-300 dark:border-slate-650 bg-transparent"
                    title="Chọn màu nền tự do"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleActiveBlockUpdate({ blockBgColor: undefined, blockBgGradient: undefined })}
                  className="text-[9px] font-black text-slate-450 hover:text-red-500 bg-white dark:bg-slate-950 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-805 transition"
                  title="Xử lý trong suốt"
                >
                  Xoá Nền
                </button>
              </div>

              {/* Pre-set CSS Gradients Dropdown */}
              <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 shadow-2xs">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase">🌈 GRADIENT:</span>
                <select
                  value={activeBlock.blockBgGradient || ''}
                  onChange={(e) => {
                    handleActiveBlockUpdate({ 
                      blockBgGradient: e.target.value || undefined, 
                      blockBgColor: e.target.value ? undefined : activeBlock.blockBgColor 
                    });
                  }}
                  className="text-[11px] bg-transparent border-0 font-extrabold focus:outline-none focus:ring-0 text-slate-700 dark:text-white pointer-events-auto cursor-pointer max-w-[125px]"
                >
                  <option value="">Không dùng</option>
                  <option value="linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)">Hồng đào 🍑</option>
                  <option value="linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)">Trời xanh 🌤️</option>
                  <option value="linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)">Bạc hà xanh 🍃</option>
                  <option value="linear-gradient(135deg, #f6d365 0%, #fda085 100%)">Hoàng hôn vàng 🌅</option>
                  <option value="linear-gradient(135deg, #30cfd0 0%, #330867 100%)">Biển huyền diệu 🌌</option>
                  <option value="linear-gradient(135deg, #0f172a 0%, #1e293b 100%)">Ngân hà đêm 🌃</option>
                  <option value="linear-gradient(135deg, #7417ad 0%, #ae11dc 100%)">Tím phượng hoàng 🔮</option>
                  <option value="linear-gradient(135deg, #ff0844 0%, #ffb199 100%)">Lửa ấm rực 🔥</option>
                  <option value="linear-gradient(135deg, #a8ff78 0%, #78ffd6 100%)">Hào quang xanh 🔋</option>
                </select>
              </div>

              {/* Border Radius Select Picker (Bo viền) */}
              <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 shadow-2xs">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase">🔘 BO VIỀN:</span>
                <select
                  value={activeBlock.blockBorderRadius !== undefined ? activeBlock.blockBorderRadius : ''}
                  onChange={(e) => {
                    handleActiveBlockUpdate({ blockBorderRadius: e.target.value !== '' ? parseInt(e.target.value) : undefined });
                  }}
                  className="text-[11px] bg-transparent border-0 font-extrabold focus:outline-none focus:ring-0 text-slate-700 dark:text-white pointer-events-auto cursor-pointer"
                >
                  <option value="">Mặc định</option>
                  <option value="0">0px (Góc vuông)</option>
                  <option value="8">8px (Nhẹ)</option>
                  <option value="16">16px (Vừa phải)</option>
                  <option value="24">24px (Lớn thanh lịch)</option>
                  <option value="36">36px (Tròn mạnh)</option>
                  <option value="48">48px (Độc đáo Canva)</option>
                </select>
              </div>

              {/* Box Shadow Options Select Picker (Đổ bóng) */}
              <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 shadow-2xs">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase">👥 ĐỔ BÓNG:</span>
                <select
                  value={activeBlock.blockShadow || ''}
                  onChange={(e) => {
                    handleActiveBlockUpdate({ blockShadow: e.target.value || undefined });
                  }}
                  className="text-[11px] bg-transparent border-0 font-extrabold focus:outline-none focus:ring-0 text-slate-700 dark:text-white pointer-events-auto cursor-pointer"
                >
                  <option value="">Không đổ bóng</option>
                  <option value="sm">Mờ nhẹ (sm)</option>
                  <option value="md">Trung chuẩn (md)</option>
                  <option value="lg">Nổi bật (lg)</option>
                  <option value="xl">Sâu hoành tráng (xl)</option>
                  <option value="2xl">Bồng bềnh 🌌 (2xl)</option>
                  <option value="inner">Lõm ngược back (inner)</option>
                </select>
              </div>

              {/* Border Width and Border Color slider */}
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 h-9 shadow-2xs text-xs font-bold">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase">📏 ĐỘ DÀY VIỀN:</span>
                <input
                  type="range"
                  min="0"
                  max="12"
                  value={activeBlock.blockBorderWidth || 0}
                  onChange={(e) => handleActiveBlockUpdate({ blockBorderWidth: parseInt(e.target.value) || undefined })}
                  className="w-14 accent-blue-600 h-1 pointer-events-auto cursor-pointer"
                />
                <span className="font-mono text-[10px] text-indigo-500 font-black">{activeBlock.blockBorderWidth || 0}px</span>
                
                {activeBlock.blockBorderWidth && activeBlock.blockBorderWidth > 0 ? (
                  <input
                    type="color"
                    value={activeBlock.blockBorderColor || '#e2e8f0'}
                    onChange={(e) => handleActiveBlockUpdate({ blockBorderColor: e.target.value })}
                    className="w-4 h-4 rounded cursor-pointer border border-slate-350 bg-transparent ml-1"
                    title="Màu viền"
                  />
                ) : null}
              </div>

              {/* Padding Y vertical slider */}
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 h-9 shadow-2xs text-xs font-bold">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase">↕️ ĐỆM TRÊN/DƯỚI:</span>
                <input
                  type="range"
                  min="0"
                  max="180"
                  step="5"
                  value={activeBlock.blockPaddingY !== undefined ? activeBlock.blockPaddingY : 56}
                  onChange={(e) => handleActiveBlockUpdate({ blockPaddingY: parseInt(e.target.value) })}
                  className="w-14 accent-blue-600 h-1 pointer-events-auto cursor-pointer"
                />
                <span className="font-mono text-[10px] text-indigo-500 font-black">{activeBlock.blockPaddingY !== undefined ? activeBlock.blockPaddingY : 56}px</span>
              </div>

              {/* Padding X horizontal slider */}
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 h-9 shadow-2xs text-xs font-bold">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase">↔️ ĐỆM TRÁI/PHẢI:</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={activeBlock.blockPaddingX !== undefined ? activeBlock.blockPaddingX : 24}
                  onChange={(e) => handleActiveBlockUpdate({ blockPaddingX: parseInt(e.target.value) })}
                  className="w-14 accent-blue-600 h-1 pointer-events-auto cursor-pointer"
                />
                <span className="font-mono text-[10px] text-indigo-500 font-black">{activeBlock.blockPaddingX !== undefined ? activeBlock.blockPaddingX : 24}px</span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 w-full justify-center py-1 bg-blue-50/70 dark:bg-slate-900/60 rounded-lg border border-dashed border-blue-200 dark:border-slate-700">
            <span className="animate-pulse text-blue-500 text-sm">✨</span>
            <span>Bấm vào khối bất kỳ để mở thanh thiết kế <b>Canva Page Builder</b> sấm sét (Đổ bóng, Bo góc, Nền Gradient, Đệm lề...)</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`w-full ${fontClass} ${sizeClass} transition-all`} style={rootStyle}>
      <CanvaTopToolbar />
      <CustomFontsRenderer />
      {appearance.customFontUrl && (
        <style dangerouslySetInnerHTML={{ __html: `@import url('${appearance.customFontUrl}');` }} />
      )}
      {blocks.map((origBlock, idx) => {
        const isLastBlock = idx === blocks.length - 1;
        const isEditingActive = isLiveEditing && selectedBlockId === origBlock.id && editingBlock;
        const block = isEditingActive ? editingBlock! : origBlock;

        return (
          <div 
            key={block.id} 
            onClick={(e) => {
              if (isLiveEditing) {
                // Prevent unselecting this block by other clicks
                setSelectedBlockId(block.id);
              }
            }}
            draggable={isLiveEditing}
            onDragStart={(e) => handleDragStart(e, block.id)}
            onDragOver={(e) => handleDragOver(e, block.id)}
            onDragEnd={handleDragEnd}
            onDrop={(e) => handleDrop(e, block.id)}
            className={`relative group/block border-y border-transparent transition-all duration-300 overflow-hidden
              ${isLiveEditing ? 'p-1 hover:bg-slate-50/10 dark:hover:bg-slate-800/5 cursor-grab active:cursor-grabbing' : ''} 
              ${isLiveEditing && selectedBlockId === block.id ? 'bg-blue-50/10 dark:bg-slate-800/20 border-2 border-dashed border-blue-500/50 rounded-2xl shadow-lg' : ''}
              ${draggedId === block.id ? 'opacity-30 border-2 border-dashed border-indigo-400 bg-slate-100 dark:bg-slate-900/40 scale-[0.98]' : ''}
              ${dragOverId === block.id ? 'border-t-4 border-t-indigo-600 dark:border-t-indigo-400 bg-indigo-50/10' : ''}
            `}
          >
            {/* Full-bleed background video for Banner/Hero blocks if videoUrl is specified */}
            {block.type === 'banner' && block.videoUrl && (
              <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <video
                  src={block.videoUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover select-none"
                  style={{ objectFit: 'cover' }}
                />
                {/* Visual filter overlay (darken contrast so text displays elegantly) */}
                <div className="absolute inset-0 bg-slate-950/50 dark:bg-slate-950/75 z-[1]" />
              </div>
            )}

            {/* Floating Save and Cancel Actions Bar for Inline Block Editing */}
            {isEditingActive && (
              <div 
                className="absolute top-2 right-4 z-50 bg-slate-950 text-white text-[11px] font-extrabold py-2 px-4 rounded-xl flex items-center gap-3 shadow-2xl border border-blue-500/50 backdrop-blur-md animate-in slide-in-from-right-3 duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="bg-blue-600 px-2 py-0.5 rounded text-[9px] uppercase text-white font-black tracking-wider">
                  Đang sửa ({block.type === 'text' ? 'Khối chữ' : block.type === 'html-rich-text' ? 'Khối văn bản' : block.type})
                </span>
                
                {/* Block local Font Select picker */}
                <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5">
                  <span className="text-[9px] text-slate-400">Phông:</span>
                  <select
                    value={block.fontFamily || 'sans'}
                    onChange={(e) => {
                      audioService.playClick();
                      updateEditingBlockField('fontFamily', e.target.value);
                    }}
                    className="text-[10px] bg-transparent border-0 font-bold focus:outline-none focus:ring-0 max-w-[100px] text-white cursor-pointer"
                  >
                    <option value="sans" className="text-slate-900">Mặc định (Inter)</option>
                    <option value="grotesk" className="text-slate-900">Space Grotesk 🌌</option>
                    <option value="serif" className="text-slate-900">Playfair Display ✍️</option>
                    <option value="mono" className="text-slate-900">JetBrains Mono 💻</option>
                    <option value="Arial" className="text-slate-900">Arial</option>
                    <option value="Georgia" className="text-slate-900">Georgia</option>
                    <option value="Times New Roman" className="text-slate-900">Times New Roman</option>
                    <option value="Impact" className="text-slate-900">Impact 💥</option>
                    {appearance.customUploadedFonts?.map(f => (
                      <option key={f.name} value={f.name} className="text-slate-900">{f.name}</option>
                    ))}
                  </select>
                </div>

                <div className="h-4 w-px bg-slate-800" />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    audioService.playClick();
                    setSelectedBlockId(null);
                  }}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 hover:text-red-400 text-slate-300 rounded-lg cursor-pointer transition flex items-center gap-1"
                >
                  ✕ Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    audioService.playClick();
                    if (editingBlock && onBlockUpdate) {
                      onBlockUpdate(block.id, editingBlock);
                    }
                    setSelectedBlockId(null);
                  }}
                  className="px-3.5 py-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg cursor-pointer transition shadow-md shadow-green-500/20 font-black flex items-center gap-1"
                >
                  ✓ Lưu thay đổi
                </button>
              </div>
            )}

            {/* Admin Block overlay settings */}
            {isLiveEditing && !isEditingActive && (
              <div className="absolute top-2 right-4 z-45 bg-slate-900/90 text-white text-[10px] font-bold py-1.5 px-3 rounded-full flex items-center gap-2 shadow-lg backdrop-blur-md opacity-35 group-hover/block:opacity-100 transition-opacity">
                <span className="uppercase text-blue-400">{block.type}</span>
                <div className="h-3 w-px bg-slate-700" />
                <button 
                  onClick={(e) => { e.stopPropagation(); onMoveBlock && onMoveBlock(block.id, 'up'); }}
                  disabled={idx === 0}
                  className="hover:text-blue-300 disabled:opacity-30 cursor-pointer"
                  title="Di chuyển lên"
                >
                  ▲
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onMoveBlock && onMoveBlock(block.id, 'down'); }}
                  disabled={isLastBlock}
                  className="hover:text-blue-300 disabled:opacity-30 cursor-pointer"
                  title="Di chuyển xuống"
                >
                  ▼
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onDeleteBlock && onDeleteBlock(block.id); }}
                  className="hover:text-red-400 text-red-300 cursor-pointer ml-1 font-bold"
                  title="Xóa block"
                >
                  Xóa
                </button>
              </div>
            )}

            {/* CANVA SELECTION RING & GRAB HANDLES */}
            {isLiveEditing && selectedBlockId === block.id && (
              <>
                {/* Thin purple/blue bounding box */}
                <div className="absolute inset-0 border-2 border-dashed border-blue-500 pointer-events-none z-30 rounded-xl" />

                {/* Circular corner handles */}
                <div 
                  onMouseDown={(e) => handleScaleDragStart(e, block)}
                  className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-blue-500 rounded-full cursor-nwse-resize pointer-events-auto shadow-md z-40 active:scale-125 transition-transform"
                  title="Kéo góc để phóng to/thu nhỏ"
                />
                <div 
                  onMouseDown={(e) => handleScaleDragStart(e, block)}
                  className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-blue-500 rounded-full cursor-nesw-resize pointer-events-auto shadow-md z-40 active:scale-125 transition-transform"
                  title="Kéo góc để phóng to/thu nhỏ"
                />
                <div 
                  onMouseDown={(e) => handleScaleDragStart(e, block)}
                  className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-blue-500 rounded-full cursor-nesw-resize pointer-events-auto shadow-md z-40 active:scale-125 transition-transform"
                  title="Kéo góc để phóng to/thu nhỏ"
                />
                <div 
                  onMouseDown={(e) => handleScaleDragStart(e, block)}
                  className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-blue-500 rounded-full cursor-nwse-resize pointer-events-auto shadow-md z-40 active:scale-125 transition-transform"
                  title="Kéo góc để phóng to/thu nhỏ"
                />

                {/* Rotation handles */}
                <div 
                  onMouseDown={(e) => handleRotateDragStart(e, block)}
                  className="absolute -bottom-7 left-1/2 -translate-x-1/2 w-7 h-7 bg-white dark:bg-slate-800 border-2 border-blue-600 rounded-full flex items-center justify-center cursor-alias pointer-events-auto shadow-lg z-40 hover:bg-blue-50 active:scale-110 transition-transform animate-bounce"
                  title="Kéo xoay tương đối"
                >
                  🔄
                </div>

                {/* Left vertical quick settings rail */}
                <div className="absolute -left-14 top-1/2 -translate-y-1/2 z-45 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-1.5 rounded-2xl flex flex-col gap-2.5 shadow-2xl animate-in fade-in slide-in-from-left-3 duration-200">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveBlock && onMoveBlock(block.id, 'up');
                    }}
                    disabled={idx === 0}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 disabled:opacity-20 cursor-pointer"
                    title="Di chuyển lên"
                  >
                    ▲
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveBlock && onMoveBlock(block.id, 'down');
                    }}
                    disabled={isLastBlock}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 disabled:opacity-20 cursor-pointer"
                    title="Di chuyển xuống"
                  >
                    ▼
                  </button>
                  <div className="h-px bg-slate-200 dark:bg-slate-800 mx-1" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      audioService.playClick();
                      onBlockUpdate?.(block.id, { isHidden: !block.isHidden });
                    }}
                    className={`p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition ${block.isHidden ? 'text-red-500 font-bold bg-red-50 dark:bg-red-950/20' : 'text-slate-500'}`}
                    title={block.isHidden ? "Đang ẩn - Click để hiện" : "Đang hiện - Click để ẩn học sinh"}
                  >
                    {block.isHidden ? "👁️‍🗨️" : "👁️"}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      audioService.playClick();
                      onBlockUpdate?.(block.id, { isLocked: !block.isLocked });
                    }}
                    className={`p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition ${block.isLocked ? 'text-amber-500 font-bold bg-amber-50 dark:bg-amber-955/20' : 'text-slate-500'}`}
                    title={block.isLocked ? "Bị Khóa - Bấm để mở" : "Chưa khóa - Bấm để khóa nội dung"}
                  >
                    {block.isLocked ? "🔒" : "🔓"}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      audioService.playClick();
                      window.dispatchEvent(new CustomEvent('NCT_DUPLICATE_BLOCK', { detail: { blockId: block.id } }));
                    }}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer transition"
                    title="Nhân bản khối này"
                  >
                    📄
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      audioService.playClick();
                      if (onDeleteBlock) onDeleteBlock(block.id);
                    }}
                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-905/30 text-red-500 cursor-pointer transition font-black"
                    title="Xóa khối"
                  >
                    🗑️
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      audioService.playClick();
                      window.dispatchEvent(new CustomEvent('NCT_ADD_BLOCK_BELOW', { detail: { index: idx + 1 } }));
                    }}
                    className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 cursor-pointer font-bold text-center transition animate-pulse"
                    title="Chèn thêm khối phía dưới"
                  >
                    ➕
                  </button>
                </div>

                {/* Floating Quick Action Bar Below */}
                <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 z-45 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-850 py-2 px-4 rounded-full flex items-center gap-3 shadow-2xl text-xs whitespace-nowrap backdrop-blur-md pointer-events-auto">
                  <span className="text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold px-2 py-0.5 rounded-md uppercase">
                    Khối {block.type}
                  </span>
                  <div className="w-px h-3 bg-slate-250 dark:bg-slate-755" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      audioService.playClick();
                      const key = prompt("Nhập tiêu đề học phần hoặc tựa đề khối mới:");
                      if (key) {
                        onBlockUpdate?.(block.id, { title: key });
                      }
                    }}
                    className="hover:text-blue-600 dark:hover:text-blue-400 font-bold text-slate-600 dark:text-slate-200 flex items-center gap-1"
                  >
                    ✏️ Sửa nhanh tiêu đề
                  </button>
                  <div className="w-px h-3 bg-slate-250 dark:bg-slate-755" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      audioService.playClick();
                      const scaleVal = prompt("Điều chỉnh trực tiếp tỉ lệ phần trăm zoom (Vd: 120):", `${block.scale || 100}`);
                      if (scaleVal) {
                        const parsed = parseInt(scaleVal);
                        if (!isNaN(parsed)) {
                          onBlockUpdate?.(block.id, { scale: parsed });
                        }
                      }
                    }}
                    className="text-slate-500 hover:text-slate-700 font-semibold"
                  >
                    🎚️ Thiết lập tỉ lệ
                  </button>
                  <div className="w-px h-3 bg-slate-250 dark:bg-slate-755" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      audioService.playClick();
                      if (onDeleteBlock) onDeleteBlock(block.id);
                    }}
                    className="text-red-500 hover:text-red-755 font-bold"
                  >
                    🗑️ Xóa đi
                  </button>
                </div>
              </>
            )}

            {/* Block Body rendering wrapper */}
            <div 
              style={getBlockStyle(block)}
              className={`max-w-7xl mx-auto px-6 ${pYClass} relative`}
              data-aos="fade-up"
              data-aos-duration="1800"
              data-aos-delay="100"
            >
              {block.type === 'banner' && (
                <div className="relative w-full py-16 sm:py-24 flex flex-col items-center justify-center text-center overflow-hidden">
                  
                  {/* Ambient Glows */}
                  <div className="absolute top-[10%] left-[20%] w-[35rem] h-[35rem] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
                  <div className="absolute bottom-[20%] right-[10%] w-[30rem] h-[30rem] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
                  
                  <div className="relative z-10 w-full max-w-5xl px-4 flex flex-col items-center">
                    
                    {/* Purple Pill Badge */}
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-purple-900/40 via-indigo-950/40 to-purple-900/40 border border-purple-500/30 text-purple-300 text-xs font-bold mb-6 animate-pulse shadow-lg shadow-purple-950/20">
                      <Sparkles size={13} className="text-amber-400" />
                      <span>Sư Phụ AI Python 3.5 Flash | Thử thách 10 giây chạy code nhận 50 EXP</span>
                    </div>

                    {/* Headline */}
                    <h1 
                      contentEditable={isLiveEditing}
                      suppressContentEditableWarning
                      onBlur={(e) => handleTextChange(block.id, 'title', e.currentTarget.innerText)}
                      className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-4 outline-none drop-shadow-md max-w-4xl"
                    >
                      {block.title}
                    </h1>
                    
                    {/* Subtitle */}
                    <p 
                      contentEditable={isLiveEditing}
                      suppressContentEditableWarning
                      onBlur={(e) => handleTextChange(block.id, 'subtitle', e.currentTarget.innerText)}
                      className="text-base sm:text-lg lg:text-xl text-slate-400 font-medium leading-relaxed mb-10 max-w-3xl"
                    >
                      {block.subtitle}
                    </p>

                    {/* Central Interactive Dashboard Card */}
                    <div className="w-full max-w-4xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl rounded-[28px] p-5 sm:p-7 shadow-2xl text-left shadow-slate-950/50 mb-8 relative">
                      
                      {/* Tabs Header */}
                      <div className="flex items-center gap-6 border-b border-slate-800 pb-4 mb-5 text-sm overflow-x-auto no-scrollbar">
                        <button
                          onClick={() => { audioService.playClick(); setHeroTab('ai'); }}
                          className={`font-bold transition-all duration-150 pb-2 border-b-2 whitespace-nowrap ${
                            heroTab === 'ai' 
                              ? 'border-blue-500 text-white font-extrabold scale-105' 
                              : 'border-transparent text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          💬 Trợ Lý Sư Phụ AI
                        </button>
                        <button
                          onClick={() => { audioService.playClick(); setHeroTab('code'); }}
                          className={`font-bold transition-all duration-150 pb-2 border-b-2 whitespace-nowrap ${
                            heroTab === 'code' 
                              ? 'border-blue-500 text-white font-extrabold scale-105' 
                              : 'border-transparent text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          💻 Chạy Thử Code Python
                        </button>
                        <button
                          onClick={() => { audioService.playClick(); setHeroTab('game'); }}
                          className={`font-bold transition-all duration-150 pb-2 border-b-2 whitespace-nowrap ${
                            heroTab === 'game' 
                              ? 'border-blue-500 text-white font-extrabold scale-105' 
                              : 'border-transparent text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          🎮 Trò Chơi Code Nhanh
                        </button>
                      </div>

                      {/* Tab Content 1: AI Assistant */}
                      {heroTab === 'ai' && (
                        <div className="space-y-4">
                          <div className="relative bg-slate-950/80 border border-slate-850 rounded-2xl p-3 focus-within:border-blue-500/50 transition-colors">
                            <textarea
                              rows={4}
                              value={heroAiInput}
                              onChange={(e) => setHeroAiInput(e.target.value)}
                              placeholder="Nhập câu hỏi về Python hoặc dán đoạn code lỗi của bạn ở đây để Sư Phụ AI hướng dẫn cách sửa lỗi nhé..."
                              className="w-full bg-transparent border-none text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-0 resize-none p-1.5 font-medium leading-relaxed"
                            />
                            
                            <div className="flex items-center justify-between border-t border-slate-850 pt-3 mt-2 text-xs">
                              {/* Left attachments placeholder */}
                              <div className="flex items-center gap-2">
                                <button className="p-2 rounded-full hover:bg-slate-900 text-slate-400 transition" title="Đính kèm file/ảnh">
                                  ➕
                                </button>
                                <span className="text-slate-500 font-medium">Hỗ trợ bởi Gemini 3.5 Flash</span>
                              </div>
                              
                              {/* Right Model Selection Dropdown and Send button */}
                              <div className="flex items-center gap-3">
                                <select
                                  value={heroSelectedModel}
                                  onChange={(e) => setHeroSelectedModel(e.target.value)}
                                  className="bg-slate-900 border border-slate-850 text-slate-300 text-xs px-2.5 py-1.5 rounded-full outline-none focus:border-slate-700"
                                >
                                  <option value="Gemini 3.5 Flash">Gemini 3.5 Flash (Nhanh)</option>
                                  <option value="Gemini 3.5 Pro">Gemini 3.5 Pro (Thông minh)</option>
                                </select>
                                
                                <button
                                  onClick={async () => {
                                    if (!heroAiInput.trim()) return;
                                    setHeroAiLoading(true);
                                    setHeroAiResponse('');
                                    const prompt = heroAiInput;
                                    setHeroAiInput('');
                                    audioService.playClick();
                                    
                                    try {
                                      // Call real tutor API
                                      const response = await fetch('/api/tutor', {
                                        method: 'POST',
                                        headers: {
                                          'Content-Type': 'application/json',
                                          ...(groqApiKey ? { 'X-API-Key': groqApiKey } : {})
                                        },
                                        body: JSON.stringify({
                                          studentMessage: prompt,
                                          context: 'Giao diện tương tác AI tại trang chủ',
                                          level: 'Lớp 10'
                                        })
                                      });
                                      const data = await response.json();
                                      const reply = data.reply || '';
                                      if (reply) {
                                        let written = '';
                                        for (let i = 0; i < reply.length; i += 3) {
                                          written += reply.substring(i, i + 3);
                                          setHeroAiResponse(written);
                                          await new Promise(r => setTimeout(r, 6));
                                        }
                                      } else {
                                        throw new Error();
                                      }
                                    } catch (e) {
                                      // Fallback mock stream
                                      const fallback = `Sư Phụ AI đã tiếp nhận câu hỏi của bạn! Python là một ngôn ngữ lập trình tuyệt vời. Để giải quyết vấn đề "${prompt}", đây là lời khuyên dành cho bạn:
  
\`\`\`python
# Khởi tạo biến lưu trữ thông tin
ten_nguoi_dung = "Chiến Binh Pilearn"
print("Chào mừng " + ten_nguoi_dung + " đến với hành trình Python!")
\`\`\`

Bạn có thể chuyển sang tab **"Chạy Thử Code Python"** ngay bên cạnh để gõ thử câu lệnh trên và ấn chạy thử xem kết quả nhé!`;
                                      let written = '';
                                      for (let i = 0; i < fallback.length; i += 3) {
                                        written += fallback.substring(i, i + 3);
                                        setHeroAiResponse(written);
                                        await new Promise(r => setTimeout(r, 8));
                                      }
                                    } finally {
                                      setHeroAiLoading(false);
                                    }
                                  }}
                                  disabled={heroAiLoading || !heroAiInput.trim()}
                                  className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center transition disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 cursor-pointer"
                                  title="Gửi câu hỏi"
                                >
                                  {heroAiLoading ? (
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <span>↑</span>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* AI Streaming Response output card */}
                          <AnimatePresence>
                            {(heroAiResponse || heroAiLoading) && (
                              <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="bg-slate-950/70 border border-slate-850 rounded-2xl p-5 mt-3 text-slate-200 text-sm leading-relaxed relative overflow-hidden"
                              >
                                <div className="absolute top-2 right-3 text-[10px] text-slate-500 font-extrabold uppercase flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                                  <span>Phản hồi từ Sư Phụ AI</span>
                                </div>
                                <div className="prose prose-invert prose-sm max-w-none">
                                  <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} rehypePlugins={[rehypeRaw]}>
                                    {heroAiResponse || 'Sư Phụ AI đang suy nghĩ câu trả lời... ⏳'}
                                  </ReactMarkdown>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}

                      {/* Tab Content 2: Python Practice IDE */}
                      {heroTab === 'code' && (
                        <div className="space-y-4">
                          <p className="text-xs text-slate-400 font-medium mb-1">
                            💡 Viết mã nguồn Python bất kỳ vào khung dưới và bấm <b>Run Code</b> để xem kết quả biên dịch ở terminal ảo.
                          </p>
                          <div className="rounded-xl overflow-hidden shadow-xl border border-slate-800">
                            <IDE
                              initialCode={heroCode}
                              onChange={(newCode) => setHeroCode(newCode)}
                              hideAITutor={true}
                              contextTitle="IDE trang chủ"
                            />
                          </div>
                        </div>
                      )}

                      {/* Tab Content 3: Coding Mini Game */}
                      {heroTab === 'game' && (
                        <div className="space-y-5">
                          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-250 text-xs sm:text-sm font-semibold flex items-center gap-2">
                            <span>🎮</span>
                            <span>Thử Thách Lập Trình 10 Giây: Hãy giúp nhân vật in ra dòng chữ bằng cách điền đúng cú pháp!</span>
                          </div>
                          
                          <div className="bg-slate-950 text-slate-200 font-mono text-left p-5 rounded-2xl text-xs sm:text-sm border border-slate-850 relative overflow-hidden">
                            <div className="absolute top-1.5 right-2 text-[9px] font-bold text-slate-600">CHƯƠNG TRÌNH PYTHON</div>
                            <pre className="whitespace-pre-wrap">
{`# Điền từ thích hợp vào biến để in ra "Xin chào chiến binh Pilearn"
ten = "______"
print("Xin chào chiến binh " + ten)`}
                            </pre>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-3 pt-1">
                            <input 
                              type="text" 
                              placeholder="Nhập giá trị điền vào... (Ví dụ: Pilearn)"
                              value={heroGameInput}
                              onChange={(e) => setHeroGameInput(e.target.value)}
                              className="px-4 py-3 bg-slate-950 border border-slate-850 focus:border-blue-500/50 rounded-xl text-xs sm:text-sm font-mono text-white flex-1 focus:outline-none focus:ring-0"
                            />
                            <button 
                              onClick={() => {
                                audioService.playClick();
                                const isCorrect = heroGameInput.trim().toLowerCase() === 'pilearn';
                                if (isCorrect) {
                                  audioService.playSuccess();
                                  heroGameSuccess !== true && progress && (progress.xp = (progress.xp || 0) + 50);
                                  setHeroGameSuccess(true);
                                } else {
                                  audioService.playError();
                                  setHeroGameSuccess(false);
                                }
                              }}
                              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow-lg shadow-emerald-950/20"
                            >
                              <Play size={13} fill="currentColor" />
                              <span>Chạy & Kiểm tra</span>
                            </button>
                          </div>

                          {heroGameSuccess !== null && (
                            <div className={`p-4 rounded-2xl text-xs sm:text-sm font-bold leading-relaxed border transition-all ${
                              heroGameSuccess 
                                ? 'bg-green-500/10 border-green-500/20 text-green-300' 
                                : 'bg-red-500/10 border-red-500/20 text-red-300'
                            }`}>
                              {heroGameSuccess 
                                ? '🎉 Tuyệt vời! Bạn đã điền chính xác cú pháp gán biến Python và được cộng thêm +50 EXP!' 
                                : '❌ Chưa chính xác rồi! Gợi ý: Hãy nhập chữ "Pilearn" (chữ P viết hoa) để ghép thành câu hoàn chỉnh.'
                              }
                            </div>
                          )}
                        </div>
                      )}

                    </div>

                    {/* Topview Styled Circular Toolbar */}
                    <div className="w-full max-w-4xl mx-auto mt-8 mb-6">
                      <div className="flex items-center justify-between overflow-x-auto no-scrollbar gap-4 py-2 px-1">
                        {[
                          { label: 'Trợ Lý AI', icon: Sparkles, color: '#ec4899', tab: 'ai', prompt: 'Hãy viết ví dụ đơn giản giải thích cấu trúc lập trình Python cho người mới bắt đầu.' },
                          { label: 'Luyện Tập', icon: Terminal, color: '#ef4444', tab: 'code', code: 'print("Chào mừng bạn đến với Môi trường IDE thực chiến!")' },
                          { label: 'Đường Đua', icon: MapPin, color: '#f59e0b', action: 'roadmap' },
                          { label: 'Bài Học', icon: BookOpen, color: '#f97316', action: 'student-dashboard' },
                          { label: 'Đấu Boss', icon: Swords, color: '#8b5cf6', action: 'boss-battle' },
                          { label: 'Biến Số', icon: Code, color: '#6366f1', tab: 'code', code: 'x = 10\ny = 20\ntong = x + y\nprint(tong)' },
                          { label: 'Điều Kiện', icon: GitFork, color: '#3b82f6', tab: 'ai', prompt: 'Giải thích lệnh if-else trong Python bằng hình ảnh ẩn dụ thực tế.' },
                          { label: 'Vòng Lặp', icon: Repeat, color: '#10b981', tab: 'ai', prompt: 'Làm sao để dừng một vòng lặp vô chậm (infinite loop) trong Python?' },
                          { label: 'Cửa Hàng', icon: ShoppingBag, color: '#111827', action: 'shop' },
                          { label: 'Thi Thử', icon: Award, color: '#4b5563', action: 'exams' }
                        ].map((tool, tIdx) => {
                          const IconComponent = tool.icon;
                          return (
                            <button
                              key={tIdx}
                              onClick={() => {
                                audioService.playClick();
                                if (tool.tab) {
                                  setHeroTab(tool.tab as any);
                                  if (tool.tab === 'ai' && tool.prompt) setHeroAiInput(tool.prompt);
                                  if (tool.tab === 'code' && tool.code) setHeroCode(tool.code);
                                } else if (tool.action) {
                                  setView(tool.action as any);
                                }
                              }}
                              className="flex flex-col items-center gap-2 cursor-pointer active:scale-95 transition group min-w-[70px] shrink-0"
                            >
                              <div 
                                className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-transform duration-205 group-hover:scale-115"
                                style={{ backgroundColor: tool.color }}
                              >
                                <IconComponent size={20} className="stroke-[2.5]" />
                              </div>
                              <span className="text-[10px] font-bold text-slate-400 group-hover:text-white transition whitespace-nowrap">
                                {tool.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Category Pills beneath */}
                    <div className="w-full flex items-center justify-center gap-2.5 overflow-x-auto no-scrollbar py-1">
                      {[
                        { label: '🔎 Tìm Lỗi Code', tab: 'ai', prompt: 'Đoạn code Python này báo lỗi SyntaxError: invalid syntax, hãy sửa giúp mình với:\nx = 10\nif x = 10:\n    print("x la 10")' },
                        { label: 'Variables / Biến Số', tab: 'code', code: 'x = 15\ny = 25\ntong = x + y\nprint("Tổng của x và y là:", tong)' },
                        { label: 'Loops / Vòng Lặp', tab: 'ai', prompt: 'Hãy viết ví dụ đơn giản giải thích vòng lặp while trong Python và cho biết khi nào nó bị lặp vô tận.' },
                        { label: '🐉 Đấu Boss Rồng', tab: 'game', input: 'Pilearn' },
                        { label: '📚 Giải Sách Lớp 10', tab: 'ai', prompt: 'Tóm tắt các kiến thức trọng tâm về danh sách (List) trong Python sách Tin học 10 Cánh Diều giúp mình.' }
                      ].map((pill, pIdx) => (
                        <button
                          key={pIdx}
                          onClick={() => {
                            audioService.playClick();
                            setHeroTab(pill.tab as any);
                            if (pill.tab === 'ai' && pill.prompt) {
                              setHeroAiInput(pill.prompt);
                            } else if (pill.tab === 'code' && pill.code) {
                              setHeroCode(pill.code);
                            } else if (pill.tab === 'game' && pill.input) {
                              setHeroGameInput(pill.input);
                            }
                          }}
                          className="whitespace-nowrap px-4 py-2 text-xs font-bold rounded-full bg-slate-900 border border-slate-800 text-slate-350 hover:text-white hover:border-slate-700 transition active:scale-95 cursor-pointer shadow-sm hover:bg-slate-850"
                        >
                          {pill.label}
                        </button>
                      ))}
                    </div>

                    {/* Topview Styled Skills Grid */}
                    <div className="w-full max-w-4xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                      {[
                        {
                          title: 'Trợ Lý Gia Sư AI',
                          icon: Sparkles,
                          action: 'student-dashboard',
                          subItems: [
                            { title: 'Hỏi đáp lý thuyết', desc: 'Giải thích nhanh chóng các khái niệm Python khó nhằn.' },
                            { title: 'Ví dụ trực quan', desc: 'Cung cấp code mẫu ngắn gọn kèm giải thích chi tiết.' },
                            { title: 'Tóm tắt bài học', desc: 'Cô đọng kiến thức trọng tâm bám sát SGK Tin học 10.' },
                            { title: 'Lộ trình cá nhân', desc: 'Gợi ý bài học tiếp theo dựa trên tiến độ học tập.' }
                          ]
                        },
                        {
                          title: 'Phân Tích Lỗi Code AI',
                          icon: Terminal,
                          action: 'practice',
                          subItems: [
                            { title: 'Phát hiện bug', desc: 'Quét cú pháp và chỉ ra dòng code bị lỗi trong 1 giây.' },
                            { title: 'Giải thích tiếng Việt', desc: 'Dịch lỗi cú pháp tiếng Anh khó hiểu sang tiếng Việt.' },
                            { title: 'Gợi ý sửa code', desc: 'Đưa ra định hướng tư duy logic thay vì cho sẵn đáp án.' },
                            { title: 'Tối ưu thuật toán', desc: 'Gợi ý cách viết code Pythonic gọn gàng, hiệu quả.' }
                          ]
                        },
                        {
                          title: 'Game & Đấu Boss Lập Trình',
                          icon: Swords,
                          action: 'boss-battle',
                          subItems: [
                            { title: 'Đấu Boss Rồng Lửa', desc: 'Viết code đúng để vượt ải và đánh bại quái vật.' },
                            { title: 'Đấu trường Arena', desc: 'Tranh tài lập trình với các học sinh trong lớp học.' },
                            { title: 'Tích lũy Vàng & EXP', desc: 'Đổi điểm thưởng lấy vật phẩm trang bị độc quyền.' },
                            { title: 'Cửa hàng trang bị', desc: 'Sắm Kiếm Lửa, Khiên Thần gia tăng sức mạnh của bạn.' }
                          ]
                        },
                        {
                          title: 'Chấm Điểm Tự Động (AI)',
                          icon: Award,
                          action: 'exams',
                          subItems: [
                            { title: 'Chấm bài siêu tốc', desc: 'Trả kết quả đánh giá tự động trong vòng tích tắc.' },
                            { title: 'Đánh giá đa chiều', desc: 'Kiểm tra qua nhiều bộ test case khác nhau.' },
                            { title: 'Thi thử trắc nghiệm', desc: 'Luyện tập đề kiểm tra học kỳ Tin học 10 chính xác.' },
                            { title: 'Văn bằng số hóa', desc: 'Nhận chứng nhận học viên xuất sắc khi đạt 100% lộ trình.' }
                          ]
                        }
                      ].map((skill, sIdx) => {
                        const SkillIcon = skill.icon;
                        return (
                          <div 
                            key={sIdx} 
                            className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-md rounded-3xl p-5 flex flex-col justify-between shadow-lg"
                            data-aos="fade-up"
                            data-aos-delay={sIdx * 100}
                          >
                            <div className="flex items-center justify-between mb-5">
                              <div className="flex items-center gap-2.5">
                                <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                                  <SkillIcon size={20} className="stroke-[2.5]" />
                                </div>
                                <h3 className="text-sm sm:text-base font-extrabold text-white">{skill.title}</h3>
                              </div>
                              <button 
                                onClick={() => { audioService.playClick(); setView(skill.action as any); }}
                                className="text-[10px] font-bold px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-full transition cursor-pointer"
                              >
                                Xem thêm
                              </button>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              {skill.subItems.map((item, iIdx) => (
                                <div key={iIdx} className="bg-slate-950/40 border border-slate-900/40 rounded-xl p-3 hover:border-slate-800 transition flex flex-col text-left">
                                  <h4 className="text-[11px] font-black text-slate-205 mb-1">{item.title}</h4>
                                  <p className="text-[10px] text-slate-400 leading-relaxed">{item.desc}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                  </div>
                </div>
              )}

              {/* 2. TEXT BLOCK (Markdown simulation) */}
              {block.type === 'text' && (
                <div className={`max-w-3xl mx-auto text-${block.align || 'left'}`}>
                  <h2 
                    contentEditable={isLiveEditing}
                    suppressContentEditableWarning
                    onBlur={(e) => handleTextChange(block.id, 'title', e.currentTarget.innerText)}
                    className="text-3xl font-extrabold text-slate-900 dark:text-white mb-6 outline-none focus:bg-yellow-50 focus:text-slate-900 p-1"
                  >
                    {block.title}
                  </h2>
                  <div 
                    className={`prose prose-blue dark:prose-invert text-slate-700 dark:text-slate-300 text-base sm:text-lg leading-relaxed outline-none p-2 border-2 ${isLiveEditing ? 'border-dashed border-blue-400 rounded-xl bg-yellow-50/50' : 'border-transparent'}`}
                  >
                    {isLiveEditing ? (
                      <textarea
                        value={block.content}
                        onChange={(e) => handleTextChange(block.id, 'content', e.target.value)}
                        className="w-full bg-transparent outline-none resize-none min-h-[120px] font-mono text-sm text-slate-900"
                        placeholder="Nhập nội dung (hỗ trợ Markdown)..."
                      />
                    ) : (
                      <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} rehypePlugins={[rehypeRaw]}>
                        {block.content || ''}
                      </ReactMarkdown>
                    )}
                  </div>
                </div>
              )}

              {/* 2.5 HTML-RICH-TEXT BLOCK */}
              {block.type === 'html-rich-text' && (
                <div className={`max-w-4xl mx-auto text-${block.align || 'left'}`}>
                  <h2 
                    contentEditable={isLiveEditing}
                    suppressContentEditableWarning
                    onBlur={(e) => handleTextChange(block.id, 'title', e.currentTarget.innerText)}
                    className="text-3xl font-extrabold text-slate-900 dark:text-white mb-6 outline-none focus:bg-yellow-50 focus:text-slate-900 p-1"
                  >
                    {block.title}
                  </h2>
                  <div className={`p-2 ${isLiveEditing ? 'border-2 border-dashed border-green-400 rounded-xl bg-green-50/50' : 'border-transparent'}`}>
                    {isLiveEditing ? (
                      <RichTextEditorWithFontUpload 
                        initialContent={block.content || ''}
                        onChange={(html) => handleTextChange(block.id, 'content', html)}
                        fontList={appearance.customUploadedFonts || []}
                        onAddFont={(name, url) => {
                          // Broadcast the newly added font to be saved globally in AdminDashboard
                          window.dispatchEvent(new CustomEvent('NCT_ADD_FONT', { detail: { name, url } }));
                        }}
                        onSave={() => alert("Đã lưu. Những thay đổi hiện tại nằm ở Preview. Vui lòng bấm LƯU thay đổi ở góc trên bên phải để áp dụng chính thức!")}
                      />
                    ) : (
                      <div 
                        className="prose prose-blue dark:prose-invert text-slate-700 dark:text-slate-300 max-w-none text-base sm:text-lg leading-relaxed" 
                        dangerouslySetInnerHTML={{ __html: block.content || '' }} 
                      />
                    )}
                  </div>
                </div>
              )}

              {/* 3. SIMULATED VIDEO EMBED BLOCK */}
              {block.type === 'video' && (
                <div className="max-w-4xl mx-auto text-center space-y-6">
                  <h2 className="text-2xl font-bold">{block.title || 'Video Hướng Dẫn Kỹ Thuật'}</h2>
                  <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-lg border-4 border-white dark:border-slate-800 bg-slate-950 flex flex-col items-center justify-center relative">
                    <PlayCircle className="w-16 h-16 text-blue-500 mb-2 cursor-pointer hover:scale-110 transition-transform" />
                    <span className="text-white font-bold text-sm">Xem Video Trực Quan Lớp Học Pilearn</span>
                    <span className="text-xs text-slate-500 mt-1">Simulated Embed Player</span>
                    {isLiveEditing && (
                      <div className="absolute inset-x-0 bottom-0 bg-slate-900/95 p-3 text-white flex items-center justify-between text-xs font-mono">
                        <span>Video URL:</span>
                        <input 
                          type="text" 
                          value={block.videoUrl || ''} 
                          placeholder="Nhập link Youtube embed..."
                          onChange={(e) => handleTextChange(block.id, 'videoUrl', e.target.value)}
                          className="bg-slate-800 px-3 py-1 rounded border border-slate-700 flex-1 ml-3"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 4. CALL TO ACTION (CTA) REGISTER BUTTON */}
              {block.type === 'cta' && (
                <div className={`p-8 sm:p-12 bg-blue-600 text-white rounded-[32px] shadow-xl text-center flex flex-col items-center max-w-4xl mx-auto overflow-hidden relative`}>
                  <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-xl" />
                  <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-white/10 rounded-full blur-xl" />
                  <h2 
                    contentEditable={isLiveEditing}
                    suppressContentEditableWarning
                    onBlur={(e) => handleTextChange(block.id, 'title', e.currentTarget.innerText)}
                    className="text-2xl sm:text-3xl font-black mb-4 outline-none"
                  >
                    {block.title || 'Tham gia học tập ngay hôm nay!'}
                  </h2>
                  <p 
                    contentEditable={isLiveEditing}
                    suppressContentEditableWarning
                    onBlur={(e) => handleTextChange(block.id, 'subtitle', e.currentTarget.innerText)}
                    className="text-white/80 max-w-lg mb-8 text-sm sm:text-base outline-none"
                  >
                    {block.subtitle || 'Nhận ngay 100 điểm khởi động để so tài cùng các học sinh Tin Học 10 cả vùng.'}
                  </p>
                  <button 
                    onClick={handleRegisterClick}
                    className="bg-white text-blue-600 font-extrabold text-sm sm:text-base px-8 py-3.5 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all"
                  >
                    {block.buttonText || 'Đăng Ký Thành Viên'}
                  </button>
                </div>
              )}

              {/* 5. STUDENT TESTIMONIALS */}
              {block.type === 'testimonial' && (
                <div className="space-y-10">
                  <div className="text-center">
                    <h2 
                      contentEditable={isLiveEditing}
                      suppressContentEditableWarning
                      onBlur={(e) => handleTextChange(block.id, 'title', e.currentTarget.innerText)}
                      className="text-3xl font-extrabold text-slate-900 dark:text-white outline-none"
                    >
                      {block.title}
                    </h2>
                    <p 
                      contentEditable={isLiveEditing}
                      suppressContentEditableWarning
                      onBlur={(e) => handleTextChange(block.id, 'subtitle', e.currentTarget.innerText)}
                      className="text-slate-500 mt-2 text-sm outline-none"
                    >
                      {block.subtitle}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {block.testimonials?.map((t, tIdx) => (
                      <div 
                        key={tIdx} 
                        data-aos="fade-up"
                        data-aos-delay={tIdx * 120}
                        className="bg-slate-900/45 border border-slate-800 backdrop-blur-md p-6 rounded-3xl shadow-2xl flex flex-col justify-between relative group/item hover:border-slate-700 hover:scale-[1.02] transition-all duration-300"
                      >
                        <div>
                          <div className="flex gap-1 text-amber-400 mb-4">
                            {[...Array(t.rating || 5)].map((_, i) => (
                              <Star key={i} size={15} fill="currentColor" />
                            ))}
                          </div>
                          <p 
                            contentEditable={isLiveEditing}
                            suppressContentEditableWarning
                            onBlur={(e) => handleTestimonialChange(block.id, block, tIdx, 'quote', e.currentTarget.innerText)}
                            className="text-slate-350 italic text-sm leading-relaxed mb-6 outline-none"
                          >
                            "{t.quote}"
                          </p>
                        </div>

                        <div className="flex items-center gap-4">
                          <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full object-cover border border-slate-800" />
                          <div>
                            <h4 
                              contentEditable={isLiveEditing}
                              suppressContentEditableWarning
                              onBlur={(e) => handleTestimonialChange(block.id, block, tIdx, 'name', e.currentTarget.innerText)}
                              className="font-bold text-white text-sm outline-none"
                            >
                              {t.name}
                            </h4>
                            <p 
                              contentEditable={isLiveEditing}
                              suppressContentEditableWarning
                              onBlur={(e) => handleTestimonialChange(block.id, block, tIdx, 'school', e.currentTarget.innerText)}
                              className="text-xs text-slate-400 outline-none"
                            >
                              {t.school}
                            </p>
                          </div>
                        </div>

                        {/* Fast image override in edit mode */}
                        {isLiveEditing && (
                          <div className="absolute bottom-1 right-2 bg-slate-800/80 px-2 py-0.5 rounded text-[8px] text-white opacity-0 group-hover/item:opacity-100 transition-opacity">
                            Avatar: <input type="text" value={t.avatar} onChange={(e) => handleTestimonialChange(block.id, block, tIdx, 'avatar', e.target.value)} className="bg-slate-900 border-0 text-[10px] py-0.5 px-1 rounded text-white" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 6. AI INTERACTIVE CHATBOT ACCELERATOR */}
              {block.type === 'ai' && (
                <div className="max-w-3xl mx-auto bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden relative">
                  <div className="absolute top-2 right-2 flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black border border-white/15">
                    <Sparkles size={11} className="text-amber-300 animate-pulse" />
                    <span>Live AI Tutor</span>
                  </div>

                  <h3 
                    contentEditable={isLiveEditing}
                    suppressContentEditableWarning
                    onBlur={(e) => handleTextChange(block.id, 'title', e.currentTarget.innerText)}
                    className="text-xl sm:text-2xl font-black leading-tight mb-2 outline-none"
                  >
                    {block.title}
                  </h3>
                  <p 
                    contentEditable={isLiveEditing}
                    suppressContentEditableWarning
                    onBlur={(e) => handleTextChange(block.id, 'subtitle', e.currentTarget.innerText)}
                    className="text-slate-300 text-xs sm:text-sm mb-6 outline-none"
                  >
                    {block.subtitle}
                  </p>

                  <div className="space-y-4">
                    {/* Simulated screen conversation logs */}
                    <div className="bg-slate-950/60 rounded-2xl p-4 sm:p-5 min-h-[150px] max-h-[260px] overflow-y-auto font-sans text-sm sm:text-base leading-relaxed text-left text-slate-100 border border-white/5">
                      {aiResponse ? (
                        <div className="prose prose-sm prose-invert max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} rehypePlugins={[rehypeRaw]}>
                            {aiResponse}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs sm:text-sm font-sans block py-2">✍️ Em có thể gõ câu hỏi lập trình của mình ở ô bên dưới (Ví dụ: "Hàm print() dùng để làm gì?", "Làm sao để tạo một danh sách?",...) để được Trợ lý AI tuyệt đỉnh đồng hành, giải thích cặn kẽ nhé!</span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Em muốn học hàm append..."
                        value={aiPrompt}
                        onChange={e => setAiPrompt(e.target.value)}
                        onKeyDown={e => {if(e.key === 'Enter') runAISample(aiPrompt);}}
                        className="flex-1 bg-slate-950/80 outline-none border border-white/10 rounded-xl px-4 py-3 text-sm sm:text-base text-white focus:ring-1 focus:ring-indigo-400"
                      />
                      <button 
                        onClick={() => runAISample(aiPrompt)}
                        disabled={aiLoading}
                        className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 font-bold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                        style={{ minHeight: '44px' }}
                      >
                        {aiLoading ? 'Đang trả lời...' : 'Hỏi AI'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 7. QUIZ CHALLENGE UNIT */}
              {block.type === 'quiz' && (
                <div className="max-w-2xl mx-auto bg-white dark:bg-slate-850 border border-slate-250 dark:border-slate-800 p-6 sm:p-8 rounded-[28px] shadow-sm">
                  <div className="flex items-center gap-2 text-rose-500 border border-rose-200/50 bg-rose-50 dark:bg-rose-950/20 px-3 py-1 rounded-full text-[10px] font-bold w-fit mb-4">
                    <HelpCircle size={12} />
                    <span>Hộp Trắc Nghiệm Bài Học</span>
                  </div>

                  <h3 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">Kiểm tra ngay kiến thức chuẩn</h3>
                  
                  {/* Render questions list */}
                  <div className="space-y-4 text-left">
                    {(block.quizQuestions || [
                      { prompt: 'Lệnh gán nào sau đây là hợp lệ trong Python?', options: ['x = 10', '10 = x', 'x == 10'], answer: 0 }
                    ]).map((q, qIndex) => {
                      const selectedAns = quizAnswers[block.id]?.[qIndex];
                      const correctAns = q.answer;
                      return (
                        <div key={qIndex} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 space-y-3">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{qIndex + 1}. {q.prompt}</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {q.options.map((opt, optIndex) => {
                              const isSelected = selectedAns === optIndex;
                              const isCorrect = optIndex === correctAns;
                              let buttonStyle = 'bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300';
                              if (selectedAns !== undefined) {
                                if (isCorrect) buttonStyle = 'bg-green-500 text-white font-bold';
                                else if (isSelected) buttonStyle = 'bg-red-500 text-white';
                              }
                              return (
                                <button
                                  key={optIndex}
                                  onClick={() => {
                                    audioService.playClick();
                                    const isCorrect = optIndex === correctAns;
                                    if (isCorrect) audioService.playSuccess();
                                    else audioService.playError();
                                    setQuizAnswers(prev => ({
                                      ...prev,
                                      [block.id]: { ...(prev[block.id] || {}), [qIndex]: optIndex }
                                    }));
                                  }}
                                  className={`p-3 text-[11px] rounded-xl text-left border transition-all ${buttonStyle}`}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 8. MINI LEARNING GAME (Interactive Code blocks fill in blank) */}
              {block.type === 'game' && (
                <div className="max-w-2xl mx-auto border border-amber-200/60 bg-amber-50/20 dark:bg-amber-950/10 p-6 sm:p-8 rounded-[32px] text-center space-y-4">
                  <h3 className="text-lg font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest">{block.title || 'Thử Thách Khởi Động'}</h3>
                  <p className="text-xs text-slate-500">{block.subtitle}</p>

                  <div className="bg-slate-950 text-slate-200 font-mono text-left p-4 rounded-2xl text-xs overflow-hidden relative border border-slate-850">
                    <div className="absolute top-1.5 right-2 text-[9px] text-slate-600">INPUT AREA</div>
                    <pre className="whitespace-pre-wrap">{block.gameText || 'name = "_____"\nprint("Xin chào " + name)'}</pre>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
                    <input 
                      type="text" 
                      placeholder="Gõ đáp án... (Ví dụ: Pilearn)"
                      value={gameInputs[block.id] || ''}
                      onChange={(e) => setGameInputs({ ...gameInputs, [block.id]: e.target.value })}
                      className="px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-mono"
                    />
                    <button 
                      onClick={() => {
                        audioService.playClick();
                        const answerCorrect = (gameInputs[block.id] || '').trim() === (block.gameExpectedAnswer || 'Pilearn');
                        if (answerCorrect) audioService.playSuccess();
                        else audioService.playError();
                        setGameSuccess({ ...gameSuccess, [block.id]: answerCorrect });
                      }}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Play size={12} fill="currentColor" />
                      <span>Chạy thử</span>
                    </button>
                  </div>

                  {gameSuccess[block.id] !== undefined && (
                    <div className={`p-3 rounded-xl text-xs font-bold leading-relaxed transition ${gameSuccess[block.id] ? 'bg-green-500/10 text-green-300' : 'bg-red-500/10 text-red-300'}`}>
                      {gameSuccess[block.id] 
                        ? '🎉 Nhúng chương trình thành công! Trả lời chính xác. Bạn đạt +50 XP.' 
                        : `❌ Sai rồi! Hoặc chưa chính xác chữ in hoa/thường. Gợi ý: ${block.gameHint || 'Nhập từ Pilearn'}`}
                    </div>
                  )}
                </div>
              )}

              {/* 9. FAQ ACCORDION BLOCK */}
              {block.type === 'faq' && (
                <div className="max-w-3xl mx-auto space-y-6 text-left">
                  <div className="text-center">
                    <h2 
                      contentEditable={isLiveEditing}
                      suppressContentEditableWarning
                      onBlur={(e) => handleTextChange(block.id, 'title', e.currentTarget.innerText)}
                      className="text-3xl font-extrabold text-white outline-none"
                    >
                      {block.title || 'FAQ'}
                    </h2>
                  </div>

                  <div className="space-y-3">
                    {block.faqItems?.map((faq, fIdx) => {
                      const isOpen = faqOpen[`${block.id}-${fIdx}`];
                      return (
                        <div 
                          key={fIdx} 
                          data-aos="fade-up"
                          data-aos-delay={fIdx * 60}
                          className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden shadow-xl transition-colors hover:border-slate-700/80"
                        >
                          <button 
                            onClick={() => {
                              audioService.playClick();
                              setFaqOpen({ ...faqOpen, [`${block.id}-${fIdx}`]: !isOpen });
                            }}
                            className="w-full p-4 flex items-center justify-between font-bold text-white hover:text-slate-200 transition text-xs sm:text-sm text-left gap-4"
                          >
                            <span 
                              contentEditable={isLiveEditing}
                              suppressContentEditableWarning
                              onBlur={(e) => handleFAQChange(block.id, block, fIdx, 'question', e.currentTarget.innerText)}
                              className="outline-none"
                            >
                              {faq.question}
                            </span>
                            <ChevronDown size={16} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                          </button>
                          
                          <AnimatePresence>
                            {isOpen && (
                              <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="border-t border-slate-800/80 px-4 py-3 text-xs leading-relaxed text-slate-350"
                              >
                                <p 
                                  contentEditable={isLiveEditing}
                                  suppressContentEditableWarning
                                  onBlur={(e) => handleFAQChange(block.id, block, fIdx, 'answer', e.currentTarget.innerText)}
                                  className="outline-none"
                                >
                                  {faq.answer}
                                </p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 10. PRICING TIERS BLOCK */}
              {block.type === 'pricing' && (
                <div className="space-y-10">
                  <div className="text-center">
                    <h2 
                      contentEditable={isLiveEditing}
                      suppressContentEditableWarning
                      onBlur={(e) => handleTextChange(block.id, 'title', e.currentTarget.innerText)}
                      className="text-3xl font-extrabold text-slate-900 dark:text-white outline-none"
                    >
                      {block.title || 'Gói Dịch Vụ'}
                    </h2>
                    <p 
                      contentEditable={isLiveEditing}
                      suppressContentEditableWarning
                      onBlur={(e) => handleTextChange(block.id, 'subtitle', e.currentTarget.innerText)}
                      className="text-slate-500 mt-2 text-sm outline-none"
                    >
                      {block.subtitle}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
                    {block.pricingTiers?.map((tier, pIdx) => (
                      <div 
                        key={pIdx} 
                        data-aos="fade-up"
                        data-aos-delay={pIdx * 180}
                        className={`p-8 rounded-[32px] border flex flex-col justify-between transition relative ${
                          tier.highlight 
                            ? 'bg-blue-600 text-white border-blue-500 shadow-xl scale-105 z-10' 
                            : 'bg-slate-900/40 border-slate-800 text-white shadow-xl hover:border-slate-700 transition duration-300'
                        }`}
                      >
                        {tier.highlight && (
                          <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[9px] font-black tracking-widest uppercase px-3 py-1 rounded-full shadow-md">
                            Khuyên Dùng
                          </span>
                        )}

                        <div className="space-y-4">
                          <h3 
                            contentEditable={isLiveEditing}
                            suppressContentEditableWarning
                            onBlur={(e) => handlePricingChange(block.id, block, pIdx, 'name', e.currentTarget.innerText)}
                            className="font-black text-lg outline-none"
                          >
                            {tier.name}
                          </h3>
                          <div className="flex items-baseline gap-1">
                            <span 
                              contentEditable={isLiveEditing}
                              suppressContentEditableWarning
                              onBlur={(e) => handlePricingChange(block.id, block, pIdx, 'price', e.currentTarget.innerText)}
                              className="text-3xl font-black outline-none"
                            >
                              {tier.price}
                            </span>
                            <span 
                              contentEditable={isLiveEditing}
                              suppressContentEditableWarning
                              onBlur={(e) => handlePricingChange(block.id, block, pIdx, 'period', e.currentTarget.innerText)}
                              className="text-[10px] font-medium opacity-80 outline-none"
                            >
                              /{tier.period}
                            </span>
                          </div>

                          <div className="h-px bg-current opacity-20 my-4" />

                          <ul className="space-y-3.5 text-xs text-left">
                            {tier.features.map((feat, fId) => (
                              <li key={fId} className="flex items-center gap-2">
                                <CheckCircle2 size={14} className={tier.highlight ? 'text-amber-300' : 'text-blue-500'} />
                                <span>{feat}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <button 
                          onClick={handleRegisterClick}
                          className={`w-full py-3.5 rounded-full font-bold text-xs sm:text-sm mt-8 transition-all active:scale-95 ${
                            tier.highlight 
                              ? 'bg-white text-blue-600 hover:bg-slate-100 shadow-md font-extrabold' 
                              : 'bg-indigo-600 text-white hover:bg-indigo-500 font-extrabold'
                          }`}
                        >
                          Đăng ký ngay
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick in-between Block Insert Handle for premium WordPress style */}
            {isLiveEditing && onAddBlockClick && (
              <div className="w-full flex justify-center py-2 relative z-40 opacity-0 hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => onAddBlockClick(idx + 1)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black rounded-full px-4 py-1.5 flex items-center gap-1 shadow-md hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <span>+ Chèn Khối tại đây</span>
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
