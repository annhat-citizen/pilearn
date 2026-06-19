import React, { useState, useEffect } from 'react';
import { useAppContext } from '../store';
import { doc, getDocs, collection, query, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Classroom } from '../types';

export function CompleteProfileModal() {
  const { profile, role, authUser, isDataLoaded } = useAppContext();
  const [classes, setClasses] = useState<Classroom[]>([]);
  const [name, setName] = useState('');
  const [classId, setClassId] = useState('');
  const [loading, setLoading] = useState(false);

  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (profile && role === 'student' && !profile.classId) {
      setName(profile.displayName === 'Học viên' ? '' : profile.displayName);
      const getClasses = async () => {
         const q = query(collection(db, 'classes'));
         const snap = await getDocs(q);
         const c: Classroom[] = [];
         snap.forEach(d => c.push({ id: d.id, name: d.data().name } as Classroom));
         
         setClasses(c);
      };
      getClasses();
    }
  }, [profile, role]);

  if (!isDataLoaded || !authUser || !profile) return null;
  // If not student, or if they already have a classId field defined (even if empty string), they don't need this step
  if (role !== 'student' || profile.classId !== undefined || isDismissed) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (classes.length > 0 && !classId) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', profile.uid), {
        displayName: name.trim(),
        classId: classId || ''
      });
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
      alert('Có lỗi xảy ra: ' + (error as Error).message);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Hoàn tất hồ sơ học sinh</h2>
        <p className="text-slate-500 mb-6">Xin vui lòng nhập đúng thông tin để giáo viên có thể quản lý điểm số.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Họ và tên</label>
            <input 
              type="text" 
              required
              placeholder="VD: Nguyễn Văn A"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Chọn lớp học</label>
            <select 
              required={classes.length > 0}
              value={classId}
              onChange={e => setClassId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
              disabled={classes.length === 0}
            >
              <option value="">-- Chọn lớp --</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {classes.length === 0 && (
              <p className="text-xs text-amber-600 mt-2">Chưa có lớp nào được tạo. Bạn có thể lưu hồ sơ trước, quản trị viên sẽ xếp lớp cho bạn sau.</p>
            )}
          </div>
          <div className="flex gap-3">
            <button 
              type="button"
              onClick={() => setIsDismissed(true)}
              className="w-1/3 py-3 px-4 bg-gray-200 text-slate-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
            >
              Bỏ qua
            </button>
            <button 
              type="submit" 
              disabled={loading || !name.trim() || (classes.length > 0 && !classId)}
              className="w-2/3 py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang lưu...' : 'Lưu lại'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
