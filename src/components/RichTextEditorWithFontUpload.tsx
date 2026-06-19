import React, { useRef, useState, useEffect } from 'react';

interface Props {
  initialContent: string;
  onChange: (html: string) => void;
  fontList: { name: string; url: string }[];
  onAddFont: (name: string, url: string) => void;
  onSave: () => void;
}

export function RichTextEditorWithFontUpload({ initialContent, onChange, fontList, onAddFont, onSave }: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== initialContent) {
      if (document.activeElement !== editorRef.current) {
        editorRef.current.innerHTML = initialContent || '';
      }
    }
  }, [initialContent]);

  const exec = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
    editorRef.current?.focus();
    handleChange();
  };

  const handleChange = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleFontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File phông chữ quá lớn (dưới 5MB).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      const fontName = file.name.replace(/\.[^/.]+$/, "");
      
      const newStyle = document.createElement('style');
      newStyle.appendChild(document.createTextNode(`
        @font-face {
            font-family: "${fontName}";
            src: url("${dataUrl}");
        }
      `));
      document.head.appendChild(newStyle);
      
      onAddFont(fontName, dataUrl);
      exec('fontName', fontName);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="border border-slate-300 rounded-lg bg-white overflow-hidden flex flex-col font-sans">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 border-b border-slate-200 text-slate-700">
        <button onClick={() => exec('bold')} className="p-1 px-2 hover:bg-slate-200 rounded font-bold" title="In đậm (Bold)">B</button>
        <button onClick={() => exec('italic')} className="p-1 px-2 hover:bg-slate-200 rounded italic" title="ĐIn nghiêng (Italic)">I</button>
        <button onClick={() => exec('underline')} className="p-1 px-2 hover:bg-slate-200 rounded underline" title="Gạch chân (Underline)">U</button>
        <button onClick={() => exec('strikeThrough')} className="p-1 px-2 hover:bg-slate-200 rounded line-through" title="Gạch chéo (Strikethrough)">S</button>
        
        <div className="w-px h-5 bg-slate-300 mx-1"></div>
        
        <input 
          type="color" 
          onChange={(e) => exec('foreColor', e.target.value)} 
          className="w-6 h-6 p-0 border-0 cursor-pointer"
          title="Màu chữ (Text Color)"
        />

        <div className="w-px h-5 bg-slate-300 mx-1"></div>

        <select 
          onChange={(e) => exec('fontName', e.target.value)}
          className="text-xs bg-white border border-slate-300 rounded px-1 min-w-[100px] h-7"
          title="Chọn kiểu chữ"
        >
          <option value="Arial">Arial</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Courier New">Courier New</option>
          <option value="Georgia">Georgia</option>
          <option value="Verdana">Verdana</option>
          {fontList.map(f => (
            <option key={f.name} value={f.name} style={{ fontFamily: `"${f.name}"` }}>
              {f.name} (Tải lên)
            </option>
          ))}
        </select>

        <button 
          onClick={() => fileInputRef.current?.click()} 
          className="text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded font-semibold"
          title="Tải lên phông chữ mà bạn thích"
        >
          + Tải Font
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept=".ttf,.otf,.woff,.woff2" 
          onChange={handleFontUpload} 
        />

        <div className="flex-1"></div>

        <button 
          onClick={onSave}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-1.5 rounded shadow"
        >
          Lưu Vào Web
        </button>
      </div>

      {/* Editable Content */}
      <div 
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleChange}
        onBlur={handleChange}
        className="min-h-[150px] max-h-[300px] overflow-y-auto p-4 focus:outline-none"
        style={{ minHeight: "150px" }}
      />
    </div>
  );
}
