import React, { useState, useEffect } from 'react';
import { Award, Star, Diamond, Shield } from 'lucide-react';
import { useAppContext } from '../store';
import { audioService } from '../utils/audio';
import { IDE } from '../components/IDE';
import { collection, query, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

const defaultProjects = [
  {
    id: 'p_bronze',
    title: 'Đảo ngược chuỗi (Căn bản)',
    level: 'Bạc',
    points: 20,
    description: 'Nhập vào tên của bạn và in ra tên đó theo thứ tự ngược lại (gợi ý: slicing `[::-1]`).',
    expectedCode: 'name = "Python"\\nprint(name[::-1])'
  },
  {
    id: 'p_gold',
    title: 'Máy tính bò sữa (Nâng cao)',
    level: 'Vàng',
    points: 50,
    description: 'Viết logic kiểm tra 1 số nguyên. Nếu chia hết cho 3 in "Bò", chia hết cho 5 in "Sữa", chia hết cho cả 3 và 5 in "Bò Sữa".',
    expectedCode: 'n = 15\\nif n % 3 == 0 and n % 5 == 0:\\n    print("Bò Sữa")\\nelif n % 3 == 0:\\n    print("Bò")\\nelif n % 5 == 0:\\n    print("Sữa")'
  }
];

export function Practice() {
  const { progress, completeLesson } = useAppContext();
  const [activeProject, setActiveProject] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>(defaultProjects);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPractices = async () => {
      try {
        const q = query(collection(db, 'practices'));
        const snap = await getDocs(q);
        const fetched: any[] = [];
        snap.forEach(doc => {
          fetched.push({ id: doc.id, ...doc.data() });
        });
        setProjects([...defaultProjects, ...fetched]);
      } catch (e) {
        console.error("Lỗi khi tải bài thực hành", e);
        try {
          handleFirestoreError(e, OperationType.GET, 'practices');
        } catch (wrappedError) {
          // Wrapped error is logged and rethrown
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPractices();
  }, []);

  const getLevelColor = (level: string) => {
    switch(level) {
      case 'Đồng': return 'bg-orange-100 text-orange-700';
      case 'Bạc': return 'bg-slate-200 text-slate-700';
      case 'Vàng': return 'bg-amber-100 text-amber-600';
      case 'Kim Cương': return 'bg-blue-100 text-blue-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const getLevelIcon = (level: string) => {
    switch(level) {
      case 'Đồng': return <Shield className="w-6 h-6" />;
      case 'Bạc': return <Star className="w-6 h-6" />;
      case 'Vàng': return <Award className="w-6 h-6" />;
      case 'Kim Cương': return <Diamond className="w-6 h-6" />;
      default: return <Star className="w-6 h-6" />;
    }
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto px-6 sm:px-8 py-12">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Kho Bài tập & Dự án</h1>
      <p className="text-gray-500 mb-10">Thực hành tư duy logic với các dự án thực tế. Code đúng sẽ nhận thêm điểm.</p>
      
      {loading ? (
        <div className="p-12 text-center text-gray-500">Đang tải biểu điểm...</div>
      ) : !activeProject ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map(p => (
            <div 
              key={p.id} 
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col items-start cursor-pointer hover:border-blue-300 hover:shadow-md transition-all" 
              onClick={() => {
                audioService.playClick();
                setActiveProject(p);
              }}
            >
              <div className={`p-2 rounded-lg mb-4 ${getLevelColor(p.level)}`}>
                {getLevelIcon(p.level)}
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">{p.title}</h3>
              <div className="text-sm text-gray-500 flex-1 line-clamp-3 mb-4 prose prose-sm prose-slate">
                 <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{p.description}</ReactMarkdown>
              </div>
              <div className="mt-auto flex w-full items-center justify-between text-sm pt-4 border-t border-gray-100">
                <span className="font-medium text-blue-600">+{p.points} Điểm (Cấp {p.level})</span>
                <span className="font-medium text-slate-400">
                  {(progress.completedLessons || []).includes(p.id) ? 'Đã hoàn thành' : 'Chưa làm'}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
           <button 
             onClick={() => {
               audioService.playClick();
               setActiveProject(null);
             }} 
             className="text-gray-500 hover:text-gray-900 font-medium text-sm mb-6"
           >
             ← Quay lại danh sách
           </button>
           <div className="flex items-center space-x-3 mb-4">
              <div className={`p-1.5 rounded-lg ${getLevelColor(activeProject.level)}`}>
                {getLevelIcon(activeProject.level)}
              </div>
              <h2 className="text-2xl font-bold">{activeProject.title}</h2>
           </div>
           
           <div className="prose prose-blue max-w-none text-slate-700 mb-8 border border-slate-100 bg-slate-50 p-6 rounded-xl">
             <ReactMarkdown 
                remarkPlugins={[remarkGfm]} 
                rehypePlugins={[rehypeRaw]}
             >
               {activeProject.description}
             </ReactMarkdown>
           </div>
           
           <IDE 
             expectedContent={activeProject.expectedCode} 
             onSuccess={() => completeLesson(activeProject.id, activeProject.points)}
             contextTitle={`Dự án thực hành: ${activeProject.title}`}
           />
        </div>
      )}
    </div>
  );
}
