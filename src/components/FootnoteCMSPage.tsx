import React, { useState, useEffect } from 'react';
import { useAppContext } from '../store';
import { db, handleFirestoreError } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { FootnotePage, FootnoteArticle } from '../types';
import { 
  Edit, Save, Plus, Trash2, Calendar, User, 
  ArrowLeft, CheckCircle, RotateCcw, FileText, ChevronDown, Check, X, Sparkles, HelpCircle 
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import remarkBreaks from 'remark-breaks';

interface FootnoteCMSPageProps {
  pageId: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultContent: string;
}

export function FootnoteCMSPage({ pageId, defaultTitle, defaultDescription, defaultContent }: FootnoteCMSPageProps) {
  const { role, authUser, profile } = useAppContext();
  const [page, setPage] = useState<FootnotePage | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Editing buffer states
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editContent, setEditContent] = useState('');
  const [articles, setArticles] = useState<FootnoteArticle[]>([]);

  // Article creation/editing dialog state
  const [isAddingArticle, setIsAddingArticle] = useState(false);
  const [newArticleTitle, setNewArticleTitle] = useState('');
  const [newArticleContent, setNewArticleContent] = useState('');
  const [newArticleId, setNewArticleId] = useState('');

  // Load from firestore
  useEffect(() => {
    async function loadPage() {
      setLoading(true);
      try {
        const pageRef = doc(db, 'footnote_pages', pageId);
        const pageSnap = await getDoc(pageRef);
        
        if (pageSnap.exists()) {
          const data = pageSnap.data() as FootnotePage;
          setPage(data);
          setEditTitle(data.title);
          setEditDescription(data.description || '');
          setEditContent(data.content);
          setArticles(data.articles || []);
        } else {
          // Initialize using defaults
          const initialPage: FootnotePage = {
            id: pageId,
            title: defaultTitle,
            description: defaultDescription,
            content: defaultContent,
            articles: []
          };
          setPage(initialPage);
          setEditTitle(defaultTitle);
          setEditDescription(defaultDescription);
          setEditContent(defaultContent);
          setArticles([]);
        }
      } catch (err: any) {
        console.error('Failed loading footnote page CMS content:', err);
        setErrMsg('Không thể tải dữ liệu từ máy chủ.');
      } finally {
        setLoading(false);
      }
    }
    loadPage();
  }, [pageId, defaultTitle, defaultDescription, defaultContent]);

  const handlePublishSettings = async () => {
    if (!editTitle || !editContent) {
      setErrMsg('Vui lòng nhập tiêu đề trang và lý thuyết/nội dung bắt buộc.');
      return;
    }
    
    setErrMsg('');
    setSuccessMsg('');
    try {
      const pageRef = doc(db, 'footnote_pages', pageId);
      const updatedPage: FootnotePage = {
        id: pageId,
        title: editTitle,
        description: editDescription,
        content: editContent,
        articles
      };

      await setDoc(pageRef, updatedPage);
      setPage(updatedPage);
      setIsEditing(false);
      setSuccessMsg('Đã đăng tải trang chính thức thành công!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      console.error(err);
      setErrMsg('Lỗi phân quyền hoặc kết nối Firestore khi cập nhật!');
    }
  };

  // Article management
  const handleAddArticle = () => {
    if (!newArticleTitle || !newArticleContent) {
      alert('Vui lòng viết tiêu đề và nội dung bài viết!');
      return;
    }

    const created: FootnoteArticle = {
      id: newArticleId || `post_${Date.now()}`,
      title: newArticleTitle,
      content: newArticleContent,
      author: profile?.displayName || 'Quản trị viên',
      createdAt: new Date().toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    setArticles(prev => [created, ...prev]);
    setIsAddingArticle(false);
    setNewArticleTitle('');
    setNewArticleContent('');
    setNewArticleId('');
  };

  const handleDeleteArticle = (articleId: string) => {
    if (!confirm('Bạn có chắc muốn xóa bài phát biểu/bài đăng này không?')) return;
    setArticles(prev => prev.filter(a => a.id !== articleId));
  };

  const isAdminOrSuper = role === 'admin' || role === 'super_admin';

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto px-6 py-20 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-slate-500 font-bold text-xs uppercase tracking-wider">Đang khởi tạo các trang footnote...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1000px] mx-auto px-4 sm:px-8 py-12 animate-in fade-in duration-300 space-y-8">
      
      {/* Alert Notifications */}
      {successMsg && (
        <div className="bg-emerald-500 text-white font-extrabold text-xs px-4 py-3 rounded-2xl shadow-md flex items-center gap-2">
          <CheckCircle size={16} />
          <span>{successMsg}</span>
        </div>
      )}
      {errMsg && (
        <div className="bg-red-500 text-white font-extrabold text-xs px-4 py-3 rounded-2xl shadow-md flex items-center gap-2">
          <HelpCircle size={16} />
          <span>{errMsg}</span>
        </div>
      )}

      {isEditing ? (
        // EDITOR MODE
        <div className="bg-white dark:bg-slate-850 p-6 sm:p-10 rounded-[36px] border-2 border-dashed border-blue-300 dark:border-blue-900 shadow-xl space-y-6 text-left">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h1 className="text-xl font-black text-blue-600">Bản Thảo Quản Trị: {editTitle}</h1>
              <p className="text-slate-400 text-xs">Cấu trúc các trang footnote dễ dàng bằng Markdown.</p>
            </div>
            <button 
              onClick={() => setIsEditing(false)}
              className="text-slate-400 hover:text-red-500 font-bold text-xs"
            >
              Hủy bỏ bản nháp
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-500 mb-1">TIÊU ĐỀ TRANG CHÂN TRANG</label>
              <input 
                type="text" 
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                className="w-full text-base font-extrabold px-4 py-2 border rounded-2xl dark:bg-slate-800"
                placeholder="Nhập tiêu đề trang..."
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-500 mb-1">MÔ TẢ NGẮN (MỤC ĐÍCH TRANG)</label>
              <input 
                type="text" 
                value={editDescription}
                onChange={e => setEditDescription(e.target.value)}
                className="w-full text-xs font-bold px-4 py-2 border rounded-2xl dark:bg-slate-800"
                placeholder="Nhập tóm tắt..."
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-500 mb-1">NỘI DUNG CHÍNH (Hỗ trợ Markdown phong phú)</label>
              <textarea 
                rows={12}
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                className="w-full text-xs font-bold px-4 py-3 border rounded-3xl dark:bg-slate-800 font-mono"
                placeholder="## Tiêu đề bài viết... \n\nNội dung văn bản..."
              />
            </div>
          </div>

          {/* ARTICLE / POST EDITOR RAIL */}
          <div className="pt-6 border-t border-dashed border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-extrabold text-sm text-slate-700">Viết Bài Đăng & Tin Tức Nội Bộ</h3>
                <p className="text-[10px] text-slate-400">Các bài đăng kéo dài chân trang sẽ hiển thị bên dưới thân chính của trang này.</p>
              </div>
              {!isAddingArticle && (
                <button 
                  onClick={() => setIsAddingArticle(true)}
                  className="flex items-center gap-1 text-[11px] font-bold bg-slate-100 hover:bg-slate-250 border px-3 py-1.5 rounded-xl transition"
                >
                  <Plus size={12} />
                  <span>Viết bài mới</span>
                </button>
              )}
            </div>

            {isAddingArticle && (
              <div className="bg-slate-50 p-4 rounded-2xl border mb-4 space-y-3">
                <div className="flex justify-between items-center pb-2">
                  <span className="font-extrabold text-xs text-slate-700">Soạn Bài Viết Mới</span>
                  <button onClick={() => setIsAddingArticle(false)} className="text-slate-400 hover:text-red-500"><X size={14} /></button>
                </div>
                <div>
                  <input 
                    type="text" 
                    placeholder="Tiêu đề bài viết..."
                    value={newArticleTitle}
                    onChange={e => setNewArticleTitle(e.target.value)}
                    className="w-full text-xs font-extrabold px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <textarea 
                    rows={4} 
                    placeholder="Nội dung chi tiết viết bằng văn bản thô hoặc Markdown..."
                    value={newArticleContent}
                    onChange={e => setNewArticleContent(e.target.value)}
                    className="w-full text-xs font-medium px-3 py-2 border rounded-xl font-mono"
                  />
                </div>
                <div className="flex justify-end gap-1.5">
                  <button onClick={() => setIsAddingArticle(false)} className="px-2.5 py-1.5 border hover:bg-white text-[10px] font-bold rounded-lg text-slate-400">Hủy</button>
                  <button onClick={handleAddArticle} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black rounded-lg">Thêm bài</button>
                </div>
              </div>
            )}

            {/* Existing articles list for sorting/deleting inside drafting */}
            <div className="space-y-2">
              {articles.map((art, idx) => (
                <div key={art.id || idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-dashed">
                  <div className="text-left">
                    <span className="block font-bold text-xs text-slate-700">{art.title}</span>
                    <span className="text-[9px] text-slate-400">Tác giả: {art.author} — {art.createdAt}</span>
                  </div>
                  <button 
                    onClick={() => handleDeleteArticle(art.id)}
                    className="text-red-500 hover:bg-red-50 p-1 rounded-lg"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
              {articles.length === 0 && (
                <p className="text-center py-4 text-[11px] text-slate-400 italic">Trang này chưa có bài viết đính kèm.</p>
              )}
            </div>
          </div>

          {/* Save Action */}
          <div className="flex justify-end gap-2 border-t pt-5">
            <button 
              onClick={() => setIsEditing(false)}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 font-bold text-xs rounded-xl text-slate-500"
            >
              Hủy bỏ thay đổi
            </button>
            <button 
              onClick={handlePublishSettings}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-750 font-black text-xs text-white rounded-xl shadow-md hover:scale-103 active:scale-97 transition flex items-center gap-1.5"
            >
              <Save size={14} />
              <span>Đăng Tải Trực Tuyến</span>
            </button>
          </div>
        </div>
      ) : (
        // VISITOR MODE
        <div className="space-y-8">
          {/* Main banner block */}
          <div 
            data-aos="fade-up"
            data-aos-duration="1800"
            className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-[32px] p-8 sm:p-12 shadow-sm text-center relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-[50px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/5 rounded-full blur-[50px] pointer-events-none" />

            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
              {page?.title || defaultTitle}
            </h1>
            {page?.description && (
              <p className="text-slate-500 text-xs sm:text-sm max-w-2xl mx-auto mt-2 font-medium">
                {page.description}
              </p>
            )}

            {/* Markdown rendered area */}
            <div className="prose prose-blue dark:prose-invert max-w-none text-slate-700 dark:text-slate-200 mt-10 pt-8 border-t border-slate-100 dark:border-slate-800/80 text-left leading-relaxed font-sans space-y-6">
              <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} rehypePlugins={[rehypeRaw]}>
                {page?.content || defaultContent}
              </ReactMarkdown>
            </div>
          </div>

          {/* Sub-Articles sections (renders if exists) */}
          {(page?.articles && page.articles.length > 0) && (
            <div className="space-y-6">
              <h2 className="text-lg font-extrabold text-slate-800 dark:text-white text-left border-b pb-2 flex items-center gap-1.5">
                <FileText className="text-indigo-500 shrink-0" size={18} />
                <span>Hoạt Động / Bài Viết Đăng Thêm</span>
                <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">{page.articles.length} bài</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {page.articles.map((art, index) => (
                  <div 
                    key={art.id || index}
                    data-aos="fade-up"
                    data-aos-delay={index * 100}
                    className="bg-white dark:bg-slate-900 p-6 rounded-[28px] border border-slate-200/60 dark:border-slate-850 shadow-xs flex flex-col justify-between hover:shadow-md transition text-left"
                  >
                    <div className="space-y-4">
                      {/* Meta */}
                      <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <span className="flex items-center gap-1">
                          <User size={10} className="text-indigo-500" />
                          <span>{art.author}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar size={10} className="text-slate-400" />
                          <span>{art.createdAt}</span>
                        </span>
                      </div>

                      <h3 className="font-extrabold text-sm sm:text-base text-slate-800 dark:text-gray-100 leading-snug">
                        {art.title}
                      </h3>

                      <div className="prose prose-sm dark:prose-invert text-slate-600 dark:text-slate-300 border-t pt-3 font-medium text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                        <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} rehypePlugins={[rehypeRaw]}>
                          {art.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CMS panel at the very bottom for Super Admin and Admin editing */}
          {isAdminOrSuper && (
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-250 dark:border-amber-900/60 p-5 rounded-[24px] flex flex-col sm:flex-row items-center justify-between text-left shadow-xs mt-12 gap-4">
              <div>
                <span className="font-extrabold text-amber-800 dark:text-amber-400 text-xs flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                  <span>Khu vực Quản trị CMS ({role})</span>
                </span>
                <p className="text-[11px] text-amber-600 dark:text-amber-300 font-medium">Bạn đang đăng nhập với tư cách Quản trị viên/Super Admin. Bạn có toàn quyền cấu trúc, sửa đổi tiêu đề và nội dung trang Footnote này.</p>
              </div>
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 text-xs font-black bg-amber-500 hover:bg-amber-600 text-slate-900 px-5 py-2.5 rounded-xl transition cursor-pointer shrink-0"
              >
                <Edit size={14} />
                <span>Sửa đổi nội dung Footnote</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
