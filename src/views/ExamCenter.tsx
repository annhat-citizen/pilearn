import React, { useState, useEffect } from 'react';
import { useAppContext } from '../store';
import { CheckCircle, ArrowRight, Loader } from 'lucide-react';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { IDE } from '../components/IDE';
import { useSettings } from '../contexts/SettingsContext';
import { audioService } from '../utils/audio';

export function ExamCenter() {
  const { progress, submitExam, profile, role } = useAppContext();
  const { geminiApiKey } = useSettings();
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeExam, setActiveExam] = useState<any | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  
  // Storage for student answers
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const q = query(collection(db, 'exams'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const fetched: any[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (role === 'student' && data.targetClassIds && data.targetClassIds.length > 0) {
            if (!profile?.classId || !data.targetClassIds.includes(profile.classId)) {
               return;
            }
          }
          fetched.push({ id: doc.id, ...data });
        });
        setExams(fetched);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'exams');
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, [role, profile?.classId]);

  const handleStart = (exam: any) => {
    setActiveExam(exam);
    setScore(null);
    setAnswers({});
    setFeedback('');
  };

  const handleAnswerChange = (qIndex: number, value: any) => {
    setAnswers(prev => ({ ...prev, [qIndex]: value }));
  };

  const handleFinish = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!activeExam) return;
    setIsSubmitting(true);
    setScore(null);
    setFeedback('');

    const questions = activeExam.questions || [];
    let correctMC = 0;
    const mcTotal = questions.filter((q: any) => q.type !== 'coding').length;
    let codingTotal = questions.filter((q: any) => q.type === 'coding').length;
    let codingScoreTotal = 0;
    let codingFeedbacks: string[] = [];

    // Evaluate MC / TF
    for (let i = 0; i < questions.length; i++) {
       const q = questions[i];
       const ans = answers[i];
       if (q.type === 'multiple_choice') {
         if (ans !== undefined && parseInt(ans) === q.correctOptionIndex) correctMC++;
       } else if (q.type === 'true_false') {
         if (ans !== undefined && ans === q.correctAnswerBool.toString()) correctMC++;
       }
    }

    // Evaluate Coding Questions via Grade API
    for (let i = 0; i < questions.length; i++) {
       const q = questions[i];
       const ans = answers[i];
       if (q.type === 'coding') {
          if (!ans || String(ans).trim() === '') {
             codingFeedbacks.push(`Câu ${i+1}: Không có code.`);
             continue;
          }
          try {
             const res = await fetch('/api/grade', {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  ...(geminiApiKey ? { 'X-Gemini-API-Key': geminiApiKey } : {})
                },
                body: JSON.stringify({ code: ans, prompt: q.prompt, expectedOutput: q.expectedOutput })
             });
             const data = await res.json();
             codingScoreTotal += (data.score || 0); // score out of 10
             codingFeedbacks.push(`Câu ${i+1}: ${data.feedback} (Điểm code: ${data.score}/10)`);
          } catch(err) {
             codingFeedbacks.push(`Câu ${i+1}: Lỗi chấm điểm.`);
          }
       }
    }

    // Combine score: MC is 50%, Coding is 50%
    let mcPercent = mcTotal > 0 ? (correctMC / mcTotal) * 100 : 100;
    let codingPercent = codingTotal > 0 ? (codingScoreTotal / (codingTotal * 10)) * 100 : 100;
    
    // If no coding questions, score is just MC percent. Inverse if no MC.
    let finalScore = 0;
    if (mcTotal > 0 && codingTotal > 0) finalScore = Math.round((mcPercent + codingPercent) / 2);
    else if (mcTotal > 0) finalScore = Math.round(mcPercent);
    else if (codingTotal > 0) finalScore = Math.round(codingPercent);
    else finalScore = 100;

    setScore(finalScore);
    if (codingFeedbacks.length > 0) {
       setFeedback(codingFeedbacks.join('\\n'));
    }
    submitExam(activeExam.id, finalScore);
    setIsSubmitting(false);

    // Play appropriate score sound effects
    if (finalScore >= 80) {
      audioService.playHooray();
    } else if (finalScore >= 50) {
      audioService.playSuccess();
    } else {
      audioService.playError();
    }
  };

  if (loading) {
     return <div className="p-12 text-center text-gray-500"><Loader className="w-8 h-8 animate-spin mx-auto mb-4"/> Đang tải danh sách bài thi...</div>;
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto px-6 sm:px-8 py-12">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Trung Tâm Kiểm Tra & Đánh Giá</h1>

      {!activeExam ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {exams.length === 0 ? (
              <p className="text-gray-500 col-span-2">Chưa có bài thi nào được tạo.</p>
           ) : (
              exams.map(exam => (
                 <div key={exam.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition">
                    <div>
                       <h2 className="text-xl font-bold mb-2">{exam.title}</h2>
                       <p className="text-slate-600 mb-4 text-sm">{exam.description}</p>
                       {progress.examScores?.[exam.id] !== undefined && (
                         <div className="mb-4 inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-bold">
                           Điểm cao nhất: {progress.examScores[exam.id]}/100
                         </div>
                       )}
                    </div>
                    <button onClick={() => handleStart(exam)} className="mt-4 bg-slate-900 text-white font-bold py-2 px-4 rounded hover:bg-slate-800 transition flex items-center justify-center">
                      Bắt đầu làm bài <ArrowRight className="ml-2 w-4 h-4"/>
                    </button>
                 </div>
              ))
           )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <div className="flex justify-between items-center mb-6 border-b pb-4">
             <h2 className="text-xl font-bold">{activeExam.title}</h2>
             <button onClick={() => setActiveExam(null)} className="text-sm font-medium text-gray-500 hover:text-gray-900">Quay lại</button>
          </div>
          
          {score !== null ? (
            <div className="text-center py-8">
               <div className={`p-6 rounded-2xl mb-6 inline-block w-full max-w-md ${score >= 70 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <h3 className={`text-2xl font-bold mb-2 ${score >= 70 ? 'text-green-800' : 'text-red-800'}`}>
                     Điểm của bạn: {score}/100
                  </h3>
                  <p className="font-medium text-gray-700">{score >= 70 ? 'Tuyệt vời! Bạn đã vượt qua bài kiểm tra.' : 'Chưa đạt 70 điểm. Hãy cố gắng ôn tập và làm lại nhé!'}</p>
               </div>
               
               {feedback && (
                  <div className="mt-6 text-left max-w-2xl mx-auto bg-blue-50 border border-blue-200 p-6 rounded-xl">
                     <h4 className="font-bold text-blue-900 mb-3 block">Nhận xét logic code từ hệ thống:</h4>
                     <pre className="text-blue-800 whitespace-pre-wrap font-mono text-sm leading-relaxed">{feedback}</pre>
                  </div>
               )}
               
               <div className="mt-8">
                 <button onClick={() => setActiveExam(null)} className="bg-slate-900 text-white font-bold py-3 px-8 rounded-full hover:bg-slate-800 transition shadow-lg">
                   Về danh sách bài thi
                 </button>
               </div>
            </div>
          ) : (
            <form onSubmit={handleFinish} className="space-y-8">
              {activeExam.questions?.map((q: any, idx: number) => (
                 <div key={idx} className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                   <p className="font-medium text-slate-900 mb-4 text-lg">Câu {idx + 1}: {q.prompt}</p>
                   
                   {q.type === 'multiple_choice' && (
                     <div className="space-y-3">
                       {q.options?.map((opt: string, oIdx: number) => (
                         <label key={oIdx} className="flex items-center space-x-3 text-slate-700 bg-white p-3 rounded-lg border border-gray-200 hover:bg-blue-50 cursor-pointer">
                           <input type="radio" name={`q_${idx}`} value={oIdx} onChange={(e) => handleAnswerChange(idx, e.target.value)} required className="text-blue-600" />
                           <span>{opt}</span>
                         </label>
                       ))}
                     </div>
                   )}

                   {q.type === 'true_false' && (
                     <div className="space-y-3">
                        <label className="flex items-center space-x-3 text-slate-700 bg-white p-3 rounded-lg border border-gray-200 hover:bg-blue-50 cursor-pointer">
                           <input type="radio" name={`q_${idx}`} value="true" onChange={(e) => handleAnswerChange(idx, e.target.value)} required className="text-blue-600" />
                           <span>Đúng</span>
                        </label>
                        <label className="flex items-center space-x-3 text-slate-700 bg-white p-3 rounded-lg border border-gray-200 hover:bg-blue-50 cursor-pointer">
                           <input type="radio" name={`q_${idx}`} value="false" onChange={(e) => handleAnswerChange(idx, e.target.value)} required className="text-blue-600" />
                           <span>Sai</span>
                        </label>
                     </div>
                   )}

                   {q.type === 'coding' && (
                     <div className="mt-2">
                        <p className="text-xs text-red-500 font-bold mb-2 uppercase">Lưu ý: Không có AI Tutor hỗ trợ trong lúc làm bài</p>
                        <IDE 
                           hideAITutor={true} 
                           contextTitle="Bài Thi - Viết Code" 
                           onChange={(code) => handleAnswerChange(idx, code)}
                        />
                     </div>
                   )}
                 </div>
              ))}
              
              <button disabled={isSubmitting} type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition flex justify-center items-center">
                 {isSubmitting ? <Loader className="w-5 h-5 animate-spin mr-2"/> : null}
                 {isSubmitting ? 'Đang chấm điểm...' : 'Nộp bài & Chấm điểm'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
