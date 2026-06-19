import React, { useState, useEffect } from 'react';
import { useAppContext } from '../store';
import { collection, query, getDocs, doc, setDoc, where, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { User, PlusCircle, Trash, Plus, Download, FileText, Type, MousePointer2, Map, Sparkles, Swords } from 'lucide-react';
import { Classroom } from '../types';
import { Editor } from '../components/Editor';

// Helper function to synthesize flexible block sequences dynamically for backward compatibility
function getLessonBlocks(lesson: any) {
  if (lesson.blocks && lesson.blocks.length > 0) {
    return lesson.blocks;
  }
  
  const blocks: any[] = [];
  
  if (lesson.theory) {
    blocks.push({
      id: 'legacy-theory',
      type: 'theory',
      title: 'Lý thuyết minh họa',
      content: typeof lesson.theory === 'string' ? lesson.theory : JSON.stringify(lesson.theory)
    });
  }
  
  if (lesson.mindmapUrl) {
    blocks.push({
      id: 'legacy-mindmap',
      type: 'mindmap',
      title: 'Sơ Đồ Tư Duy (Mindmap)',
      url: lesson.mindmapUrl
    });
  }
  
  if (lesson.simulationUrl) {
    blocks.push({
      id: 'legacy-simulation',
      type: 'simulation',
      title: 'Mô phỏng thực quan',
      url: lesson.simulationUrl
    });
  }
  
  if (lesson.interactiveGames && lesson.interactiveGames.length > 0) {
    lesson.interactiveGames.forEach((g: any, idx: number) => {
      blocks.push({
        id: `legacy-game-${idx}`,
        type: 'game',
        title: g.title || `Trò chơi tương tác ${idx + 1}`,
        game: g
      });
    });
  }
  
  if (lesson.flashcards && lesson.flashcards.length > 0) {
    blocks.push({
      id: 'legacy-flashcards',
      type: 'flashcards',
      title: 'Thẻ Ghi Nhớ (Flashcards)',
      flashcards: lesson.flashcards
    });
  }
  
  if (lesson.miniQuiz && lesson.miniQuiz.length > 0) {
    blocks.push({
      id: 'legacy-miniquiz',
      type: 'miniquiz',
      title: 'Trắc Nghiệm Nhanh',
      miniQuiz: lesson.miniQuiz
    });
  }
  
  if (lesson.labs && lesson.labs.length > 0) {
    lesson.labs.forEach((lab: any, idx: number) => {
      blocks.push({
        id: lab.id || `legacy-lab-${idx}`,
        type: 'practice',
        title: `Thực hành Lab ${idx + 1}`,
        prompt: lab.prompt,
        expectedCode: lab.expectedCode
      });
    });
  } else if (lesson.labPrompt) {
    blocks.push({
      id: 'legacy-lab',
      type: 'practice',
      title: 'Thực hành Lab',
      prompt: lesson.labPrompt,
      expectedCode: lesson.labExpectedCode
    });
  }
  
  if (lesson.challengePrompt) {
    blocks.push({
      id: 'legacy-challenge',
      type: 'challenge',
      title: 'Thử Thách Nâng Cao',
      prompt: lesson.challengePrompt,
      expectedCode: lesson.challengeExpectedCode
    });
  }
  
  return blocks;
}

const GameTextEditor = ({ game, updateContent }: { game: any, updateContent: (val: string) => void }) => {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const insertTag = (startTag: string, endTag: string) => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const current = textareaRef.current.value;
    const selected = current.substring(start, end);
    const textToWrap = selected || 'từ_khóa';
    const newText = current.substring(0, start) + startTag + textToWrap + endTag + current.substring(end);
    updateContent(newText);
    
    setTimeout(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(start + startTag.length, start + startTag.length + textToWrap.length);
    }, 0);
  };

  return (
    <div className="border border-slate-300 rounded-lg overflow-hidden bg-white shadow-sm mt-3">
      {game.type !== 'sort_paragraphs' && (
        <div className="bg-slate-100 border-b border-slate-200 p-2 flex flex-wrap gap-2 items-center">
          <span className="text-xs font-bold text-slate-500 mr-2">Công cụ:</span>
          {game.type === 'fill_blanks' && (
             <button type="button" onClick={() => insertTag('[', ']')} className="text-xs bg-white border border-slate-300 px-3 py-1.5 rounded text-blue-700 font-bold hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 flex items-center gap-1 shadow-sm transition"><Type className="w-3 h-3 text-blue-500" /> Bôi đen chữ & bấm để tạo Ô Điền Từ [ ]</button>
          )}
          {game.type === 'drag_words' && (
             <button type="button" onClick={() => insertTag('[*', '*]')} className="text-xs bg-white border border-slate-300 px-3 py-1.5 rounded text-amber-700 font-bold hover:bg-amber-50 hover:border-amber-300 flex items-center gap-1 shadow-sm transition"><MousePointer2 className="w-3 h-3 text-amber-500" /> Bôi đen chữ & bấm để tạo Ô Kéo Thả [* *]</button>
          )}
        </div>
      )}
      <textarea
        ref={textareaRef}
        value={game.content || ''}
        onChange={(e) => updateContent(e.target.value)}
        rows={6}
        placeholder={game.type === 'sort_paragraphs' ? "Nhập mỗi đoạn trên 1 dòng theo trật tự ĐÚNG.\nVí dụ:\nĐoạn 1\nĐoạn 2\nĐoạn 3" : "Nhập văn bản. Bôi đen từ quan trọng và bấm nút trên thanh công cụ để tạo ô trống..."}
        className="w-full px-4 py-3 text-sm focus:outline-none focus:bg-slate-50 font-mono resize-y leading-relaxed"
        required
      />
    </div>
  );
};

export function TeacherDashboard() {
  const { role, profile, syllabus, setView } = useAppContext();
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'examBuilder' | 'studentsManager' | 'gradeManagement' | 'practiceBuilder' | 'roadmapBuilder'>('overview');
  
  // Grade Management State
  const [weights, setWeights] = useState({ homework: 20, midterm: 30, project: 50 });

  // Mark form
  const [studentId, setStudentId] = useState('');
  const [points, setPoints] = useState('');

  // Course addition form
  const [lessonTitle, setLessonTitle] = useState('');
  const [chapterId, setChapterId] = useState('ch1');
  const [theory, setTheory] = useState<any>('');
  const [labPrompt, setLabPrompt] = useState('');
  const [labs, setLabs] = useState<any[]>([]);
  const [interactiveGames, setInteractiveGames] = useState<any[]>([]);
  const [mindmapUrl, setMindmapUrl] = useState('');
  const [simulationUrl, setSimulationUrl] = useState('');
  const [showMindmap, setShowMindmap] = useState(false);
  const [showSimulation, setShowSimulation] = useState(false);
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [miniQuiz, setMiniQuiz] = useState<any[]>([]);
  const [editingLessonId, setEditingLessonId] = useState('');
  const [lessonTargetClassIds, setLessonTargetClassIds] = useState<string[]>([]);
  const [lessonBlocks, setLessonBlocks] = useState<any[]>([]);

  // Block management actions
  const addBlock = (type: string) => {
    let initialFields: any = {
      id: Math.random().toString(36).substring(7),
      type,
      title: '',
    };
    
    if (type === 'theory') {
      initialFields.content = '';
    } else if (type === 'miniquiz') {
      initialFields.questions = [];
    } else if (type === 'game') {
      initialFields.game = { type: 'sort_paragraphs', title: '', content: '' };
    } else if (type === 'flashcards') {
      initialFields.flashcards = [];
    } else if (type === 'practice' || type === 'challenge') {
      initialFields.prompt = '';
      initialFields.expectedCode = '';
    }
    
    setLessonBlocks([...lessonBlocks, initialFields]);
  };

  const updateBlockField = (index: number, fields: any) => {
    const updated = [...lessonBlocks];
    updated[index] = { ...updated[index], ...fields };
    setLessonBlocks(updated);
  };

  const deleteBlock = (index: number) => {
    setLessonBlocks(lessonBlocks.filter((_, idx) => idx !== index));
  };

  const duplicateBlock = (index: number) => {
    const target = lessonBlocks[index];
    const duplicated = { 
      ...target, 
      id: Math.random().toString(36).substring(7),
      title: target.title ? `${target.title} (Bản sao)` : '(Bản sao)' 
    };
    const updated = [...lessonBlocks];
    updated.splice(index + 1, 0, duplicated);
    setLessonBlocks(updated);
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === lessonBlocks.length - 1) return;
    
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const updated = [...lessonBlocks];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setLessonBlocks(updated);
  };

  const getBlockTypeName = (type: string) => {
    switch (type) {
      case 'theory': return 'Lý thuyết';
      case 'mindmap': return 'Sơ đồ tư duy';
      case 'simulation': return 'Mô phỏng';
      case 'flashcards': return 'Trò chơi ôn tập';
      case 'miniquiz': return 'Trắc nghiệm nhanh';
      case 'game': return 'Thử thách logic';
      case 'practice': return 'Luyện tập thực hành';
      case 'challenge': return 'Thử thách nâng cao';
      default: return 'Khối bài học';
    }
  };

  // Sub-quiz nested controllers inside miniquiz blocks
  const addQuestionToQuizBlock = (blockIdx: number, type: 'multiple_choice' | 'true_false') => {
    const block = lessonBlocks[blockIdx];
    const questions = block.questions ? [...block.questions] : [];
    
    const newQ = type === 'multiple_choice' 
      ? { type, prompt: '', options: ['', '', '', ''], correctOptionIndex: 0 }
      : { type, prompt: '', correctAnswerBool: true };
      
    questions.push(newQ);
    updateBlockField(blockIdx, { questions });
  };

  const updateQuestionInQuizBlock = (blockIdx: number, qIdx: number, data: any) => {
    const block = lessonBlocks[blockIdx];
    const questions = [...(block.questions || [])];
    questions[qIdx] = { ...questions[qIdx], ...data };
    updateBlockField(blockIdx, { questions });
  };

  const removeQuestionFromQuizBlock = (blockIdx: number, qIdx: number) => {
    const block = lessonBlocks[blockIdx];
    const questions = (block.questions || []).filter((_: any, idx: number) => idx !== qIdx);
    updateBlockField(blockIdx, { questions });
  };

  // Sub-cards nested controllers inside flashcard blocks
  const addCardToFlashcardBlock = (blockIdx: number) => {
    const block = lessonBlocks[blockIdx];
    const cards = block.flashcards ? [...block.flashcards] : [];
    cards.push({ front: '', back: '' });
    updateBlockField(blockIdx, { flashcards: cards });
  };

  const updateCardInFlashcardBlock = (blockIdx: number, cardIdx: number, data: any) => {
    const block = lessonBlocks[blockIdx];
    const cards = [...(block.flashcards || [])];
    cards[cardIdx] = { ...cards[cardIdx], ...data };
    updateBlockField(blockIdx, { flashcards: cards });
  };

  const removeCardFromFlashcardBlock = (blockIdx: number, cardIdx: number) => {
    const block = lessonBlocks[blockIdx];
    const cards = (block.flashcards || []).filter((_: any, idx: number) => idx !== cardIdx);
    updateBlockField(blockIdx, { flashcards: cards });
  };

  // Exam addition form
  const [examTitle, setExamTitle] = useState('');
  const [examDescription, setExamDescription] = useState('');
  const [examQuestions, setExamQuestions] = useState<any[]>([]);
  const [examTargetClassIds, setExamTargetClassIds] = useState<string[]>([]);
  
  // Practice addition form
  const [practiceTitle, setPracticeTitle] = useState('');
  const [practiceLevel, setPracticeLevel] = useState('Bạc');
  const [practicePoints, setPracticePoints] = useState(20);
  const [practiceDescription, setPracticeDescription] = useState('');
  const [practiceExpectedCode, setPracticeExpectedCode] = useState('');

  // Chapter (Roadmap) form
  const [editingChapterId, setEditingChapterId] = useState('');
  const [chapterTitle, setChapterTitle] = useState('');
  const [chapterDescription, setChapterDescription] = useState('');
  const [chapterImageUrl, setChapterImageUrl] = useState('');
  
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (role === 'teacher' || role === 'admin') {
      fetchStudentsAndClasses();
    }
  }, [role]);

  const fetchStudentsAndClasses = async () => {
    try {
      setLoading(true);
      const userQ = query(collection(db, 'users'));
      const classQ = query(collection(db, 'classes'));
      
      const [studentSnap, classSnap] = await Promise.all([getDocs(userQ), getDocs(classQ)]);
      
      const fetchedStudents: any[] = [];
      studentSnap.forEach((doc) => {
        fetchedStudents.push({ id: doc.id, ...doc.data() });
      });
      setStudents(fetchedStudents);
      if(fetchedStudents.length > 0) setStudentId(fetchedStudents[0].id);

      const fetchedClasses: Classroom[] = [];
      classSnap.forEach((doc) => {
        fetchedClasses.push({ id: doc.id, name: doc.data().name } as Classroom);
      });
      setClasses(fetchedClasses);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'teacher_data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStudentField = async (userId: string, field: 'displayName' | 'points' | 'projectScore' | 'role', value: any) => {
    try {
       await updateDoc(doc(db, 'users', userId), { [field]: value });
       setStudents(students.map(u => u.id === userId ? { ...u, [field]: value } : u));
    } catch (err) {
       handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`);
    }
  };

  const handleGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
       const userDoc = students.find(s => s.id === studentId);
       if(userDoc) {
          await setDoc(doc(db, 'users', studentId), { points: (userDoc.points || 0) + Number(points) }, { merge: true });
          setShowToast(true);
          setPoints('');
          setTimeout(() => setShowToast(false), 3000);
          fetchStudentsAndClasses();
       }
    } catch(err) {
       handleFirestoreError(err, OperationType.UPDATE, `users/${studentId}`);
    }
  };

  const handleSelectLessonToEdit = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lessonId = e.target.value;
    setEditingLessonId(lessonId);
    if (!lessonId) {
      setLessonTitle('');
      setChapterId('ch1');
      setTheory('');
      setLabPrompt('');
      setInteractiveGames([]);
      setMindmapUrl('');
      setSimulationUrl('');
      setShowMindmap(false);
      setShowSimulation(false);
      setFlashcards([]);
      setMiniQuiz([]);
      setLessonTargetClassIds([]);
      setLessonBlocks([]);
      return;
    }

    // Find lesson
    let foundLesson: any = null;
    let foundChapter = null;
    syllabus.forEach(ch => {
      const l = ch.lessons.find((les: any) => les.id === lessonId);
      if (l) {
        foundLesson = l;
        foundChapter = ch;
      }
    });

    if (foundLesson) {
      setLessonTitle(foundLesson.title);
      setChapterId((foundChapter as any).id);
      setTheory(foundLesson.theory);
      setLabPrompt(foundLesson.labPrompt || '');
      if (foundLesson.labs && foundLesson.labs.length > 0) {
        setLabs(foundLesson.labs);
      } else if (foundLesson.labPrompt) {
        setLabs([{ id: Math.random().toString(36).substring(7), prompt: foundLesson.labPrompt, expectedCode: foundLesson.labExpectedCode || '' }]);
      } else {
        setLabs([]);
      }
      setInteractiveGames(foundLesson.interactiveGames || []);
      setMindmapUrl(foundLesson.mindmapUrl || '');
      setSimulationUrl(foundLesson.simulationUrl || '');
      setShowMindmap(!!foundLesson.mindmapUrl);
      setShowSimulation(!!foundLesson.simulationUrl);
      setFlashcards(foundLesson.flashcards || []);
      setMiniQuiz(foundLesson.miniQuiz || []);
      setLessonTargetClassIds(foundLesson.targetClassIds || []);
      
      if (foundLesson.blocks && foundLesson.blocks.length > 0) {
        setLessonBlocks(foundLesson.blocks);
      } else {
        setLessonBlocks(getLessonBlocks(foundLesson));
      }
    }
  };

  const handleClassSelection = (classId: string, isLesson: boolean) => {
    if (isLesson) {
      setLessonTargetClassIds(prev => prev.includes(classId) ? prev.filter(id => id !== classId) : [...prev, classId]);
    } else {
      setExamTargetClassIds(prev => prev.includes(classId) ? prev.filter(id => id !== classId) : [...prev, classId]);
    }
  };

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    try {
      if (editingLessonId) {
        const lessonRef = doc(db, 'lessons', editingLessonId);
        const snap = await getDoc(lessonRef);
        
        // Sync legacy 'theory' strictly to its mapped visual block before saving
        let updatedBlocks = [...lessonBlocks];
        const legacyTheoryIdx = updatedBlocks.findIndex(b => b.id === 'legacy-theory' || b.type === 'theory');
        if (legacyTheoryIdx > -1) {
          updatedBlocks[legacyTheoryIdx] = { ...updatedBlocks[legacyTheoryIdx], content: theory };
        } else if (theory.trim()) {
          updatedBlocks.unshift({ id: 'legacy-theory', type: 'theory', title: 'Lý thuyết minh họa', content: theory });
        }
        
        if (snap.exists()) {
           // Update existing custom lesson
           await updateDoc(lessonRef, {
             title: lessonTitle,
             chapterId: chapterId,
             theory: theory,
             labPrompt: labs.length > 0 ? labs[0].prompt : labPrompt,
             labExpectedCode: labs.length > 0 ? labs[0].expectedCode || '' : '',
             labs: labs,
             interactiveGames: interactiveGames,
             mindmapUrl: mindmapUrl,
             simulationUrl: simulationUrl,
             flashcards: flashcards,
             miniQuiz: miniQuiz,
             targetClassIds: lessonTargetClassIds,
             blocks: updatedBlocks
           });
        } else {
           // Create new override for built-in lesson
           await setDoc(lessonRef, {
             title: lessonTitle,
             chapterId: chapterId,
             theory: theory,
             labPrompt: labs.length > 0 ? labs[0].prompt : labPrompt,
             labExpectedCode: labs.length > 0 ? labs[0].expectedCode || '' : '',
             labs: labs,
             interactiveGames: interactiveGames,
             mindmapUrl: mindmapUrl,
             simulationUrl: simulationUrl,
             flashcards: flashcards,
             miniQuiz: miniQuiz,
             targetClassIds: lessonTargetClassIds,
             createdBy: profile.uid,
             createdAt: serverTimestamp(),
             blocks: updatedBlocks
           });
        }
        alert("Đã cập nhật bài học thành công!");
      } else {
        // Sync legacy 'theory' strictly to its mapped visual block before saving
        let updatedBlocks = [...lessonBlocks];
        const legacyTheoryIdx = updatedBlocks.findIndex(b => b.id === 'legacy-theory' || b.type === 'theory');
        if (legacyTheoryIdx > -1) {
          updatedBlocks[legacyTheoryIdx] = { ...updatedBlocks[legacyTheoryIdx], content: theory };
        } else if (theory.trim()) {
          updatedBlocks.unshift({ id: 'legacy-theory', type: 'theory', title: 'Lý thuyết minh họa', content: theory });
        }
        
        const lessonRef = doc(collection(db, 'lessons'));
        await setDoc(lessonRef, {
          title: lessonTitle,
          chapterId: chapterId,
          theory: theory,
          labPrompt: labs.length > 0 ? labs[0].prompt : labPrompt,
          labExpectedCode: labs.length > 0 ? labs[0].expectedCode || '' : '',
          labs: labs,
          interactiveGames: interactiveGames,
          mindmapUrl: mindmapUrl,
          simulationUrl: simulationUrl,
          flashcards: flashcards,
          miniQuiz: miniQuiz,
          targetClassIds: lessonTargetClassIds,
          createdBy: profile.uid,
          createdAt: serverTimestamp(),
          blocks: updatedBlocks
        });
        alert("Đã thêm bài học thành công!");
      }
      setEditingLessonId('');
      setLessonTitle('');
      setTheory('');
      setLabPrompt('');
      setInteractiveGames([]);
      setMindmapUrl('');
      setSimulationUrl('');
      setShowMindmap(false);
      setShowSimulation(false);
      setFlashcards([]);
      setMiniQuiz([]);
      setLessonTargetClassIds([]);
      setLessonBlocks([]);
    } catch (err) {
       handleFirestoreError(err, OperationType.UPDATE, `lessons`);
    }
  };
  
  const addInteractiveGame = (type: string) => {
    setInteractiveGames([...interactiveGames, { id: Math.random().toString(36).substring(7), type, title: '', content: '' }]);
  };

  const updateInteractiveGame = (index: number, data: any) => {
    const updated = [...interactiveGames];
    updated[index] = { ...updated[index], ...data };
    setInteractiveGames(updated);
  };
  
  const removeInteractiveGame = (index: number) => {
    const updated = [...interactiveGames];
    updated.splice(index, 1);
    setInteractiveGames(updated);
  };

  const addLab = () => {
    setLabs([...labs, { id: Math.random().toString(36).substring(7), prompt: '', expectedCode: '' }]);
  };

  const updateLab = (index: number, data: any) => {
    const updated = [...labs];
    updated[index] = { ...updated[index], ...data };
    setLabs(updated);
  };

  const removeLab = (index: number) => {
    const updated = [...labs];
    updated.splice(index, 1);
    setLabs(updated);
  };

  const addFlashcard = () => {
    setFlashcards([...flashcards, { id: Math.random().toString(36).substring(7), front: '', back: '' }]);
  };

  const updateFlashcard = (index: number, data: any) => {
    const updated = [...flashcards];
    updated[index] = { ...updated[index], ...data };
    setFlashcards(updated);
  };

  const removeFlashcard = (index: number) => {
    const updated = [...flashcards];
    updated.splice(index, 1);
    setFlashcards(updated);
  };

  const addLessonMiniQuiz = (type: string) => {
    const defaultQ = { type, prompt: '', id: Math.random().toString(36).substring(7) };
    if (type === 'multiple_choice') {
      setMiniQuiz([...miniQuiz, { ...defaultQ, options: ['', '', '', ''], correctOptionIndex: 0 }]);
    } else if (type === 'true_false') {
      setMiniQuiz([...miniQuiz, { ...defaultQ, correctAnswerBool: true }]);
    }
  };

  const updateLessonMiniQuiz = (index: number, data: any) => {
    const updated = [...miniQuiz];
    updated[index] = { ...updated[index], ...data };
    setMiniQuiz(updated);
  };
  
  const removeLessonMiniQuiz = (index: number) => {
    const updated = [...miniQuiz];
    updated.splice(index, 1);
    setMiniQuiz(updated);
  };

  const addQuestion = (type: string) => {
    const defaultQ = { type, prompt: '', id: Math.random().toString(36).substring(7) };
    if (type === 'multiple_choice') {
      setExamQuestions([...examQuestions, { ...defaultQ, options: ['', '', '', ''], correctOptionIndex: 0 }]);
    } else if (type === 'true_false') {
      setExamQuestions([...examQuestions, { ...defaultQ, correctAnswerBool: true }]);
    } else if (type === 'coding') {
      setExamQuestions([...examQuestions, { ...defaultQ, expectedOutput: '' }]);
    }
  };

  const updateQuestion = (index: number, data: any) => {
    const updated = [...examQuestions];
    updated[index] = { ...updated[index], ...data };
    setExamQuestions(updated);
  };

  const handleAddExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    try {
      const examRef = doc(collection(db, 'exams'));
      await setDoc(examRef, {
        title: examTitle,
        description: examDescription,
        questions: examQuestions,
        targetClassIds: examTargetClassIds,
        createdBy: profile.uid,
        createdAt: serverTimestamp()
      });
      alert("Đã tạo bài kiểm tra thành công!");
      setExamTitle('');
      setExamDescription('');
      setExamQuestions([]);
      setExamTargetClassIds([]);
    } catch (err) {
       handleFirestoreError(err, OperationType.CREATE, `exams`);
    }
  };

  const handleAddPractice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    try {
      const practiceRef = doc(collection(db, 'practices'));
      await setDoc(practiceRef, {
        title: practiceTitle,
        level: practiceLevel,
        points: practicePoints,
        description: practiceDescription,
        expectedCode: practiceExpectedCode,
        createdBy: profile.uid,
        createdAt: serverTimestamp()
      });
      alert("Đã thêm bài thực hành thành công!");
      setPracticeTitle('');
      setPracticeLevel('Bạc');
      setPracticePoints(20);
      setPracticeDescription('');
      setPracticeExpectedCode('');
    } catch (err) {
       handleFirestoreError(err, OperationType.CREATE, `practices`);
    }
  };

  const handleSelectChapterToEdit = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const chId = e.target.value;
    setEditingChapterId(chId);
    if (!chId) {
      setChapterTitle('');
      setChapterDescription('');
      setChapterImageUrl('');
      return;
    }
    const foundChapter = syllabus.find(ch => ch.id === chId);
    if (foundChapter) {
      setChapterTitle(foundChapter.title);
      setChapterDescription(foundChapter.description);
      setChapterImageUrl(foundChapter.imageUrl || '');
    }
  };

  const handleAddChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    try {
      if (editingChapterId) {
        const chapterRef = doc(db, 'chapters', editingChapterId);
        await setDoc(chapterRef, {
          title: chapterTitle,
          description: chapterDescription,
          imageUrl: chapterImageUrl,
          updatedBy: profile.uid,
          updatedAt: serverTimestamp()
        }, { merge: true });
         alert("Đã cập nhật chương thành công!");
      } else {
        const newChapterId = 'ch' + (syllabus.length + 1) + '_' + Math.random().toString(36).substring(7);
        const chapterRef = doc(db, 'chapters', newChapterId);
        await setDoc(chapterRef, {
          title: chapterTitle,
          description: chapterDescription,
          imageUrl: chapterImageUrl,
          createdBy: profile.uid,
          createdAt: serverTimestamp()
        });
        alert("Đã thêm chương thành công!");
      }
      setEditingChapterId('');
      setChapterTitle('');
      setChapterDescription('');
    } catch (err) {
       handleFirestoreError(err, OperationType.UPDATE, `chapters`);
    }
  };

  if (role !== 'teacher' && role !== 'admin' && role !== 'super_admin') {
     return <div className="p-8 text-center text-red-500 font-bold">Không có quyền truy cập</div>;
  }

  const classData = [
    { name: 'Bài 1', diemTB: 85 },
    { name: 'Bài 2', diemTB: 70 },
    { name: 'Bài 3', diemTB: 65 },
    { name: 'Bài 4', diemTB: 80 },
    { name: 'Midterm', diemTB: 75 }
  ];

  const trendData = [
    { month: 'Tháng 1', diem: 60, diemDuAn: 65 },
    { month: 'Tháng 2', diem: 68, diemDuAn: 70 },
    { month: 'Tháng 3', diem: 75, diemDuAn: 72 },
    { month: 'Tháng 4', diem: 72, diemDuAn: 80 },
    { month: 'Tháng 5', diem: 82, diemDuAn: 85 },
    { month: 'Tháng 6', diem: 88, diemDuAn: 90 },
  ];

  const exportToCSV = () => {
    const header = ['Học sinh', 'Email', 'Lớp', 'Điểm Hệ Thống', 'Điểm Dự Án (Tùy chọn)'];
    const rows = students.map(s => [
      s.displayName || '', 
      s.email || '', 
      s.classId ? classes.find(c => c.id === s.classId)?.name || 'N/A' : 'N/A', 
      s.points || 0,
      s.projectScore || 0
    ]);
    const csvContent = "\uFEFF" + [header, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "bang-diem.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto px-6 sm:px-8 py-12">
      <div className="flex flex-col mb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Bảng Quản Lý Giáo Viên</h1>
            <p className="text-gray-500 mt-2">Theo dõi tiến độ, chấm điểm và biên soạn bài giảng/bài kiểm tra</p>
          </div>
          <button 
            onClick={() => setView('boss-battle')} 
            className="flex items-center gap-2 self-start md:self-auto text-sm font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 px-5 py-3 rounded-full shadow-md transition active:scale-95 cursor-pointer shrink-0 animate-in fade-in zoom-in-95 duration-200"
          >
            <Swords size={16} className="text-slate-950" />
            <span>Thử chiến đấu Boss</span>
          </button>
        </div>
        <div className="flex space-x-4 border-b border-gray-200">
           <button 
             onClick={() => setActiveTab('overview')} 
             className={`py-3 px-6 font-medium text-sm transition ${activeTab === 'overview' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-800'}`}
           >
             Tổng Quan & Soạn Bài Học
           </button>
           <button 
             onClick={() => setActiveTab('examBuilder')} 
             className={`py-3 px-6 font-medium text-sm transition ${activeTab === 'examBuilder' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-800'}`}
           >
             Soạn Bài Kiểm Tra
           </button>
           <button 
             onClick={() => setActiveTab('studentsManager')} 
             className={`py-3 px-6 font-medium text-sm transition ${activeTab === 'studentsManager' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-800'}`}
           >
             Quản Lý Người Dùng
           </button>
           <button 
             onClick={() => setActiveTab('gradeManagement')} 
             className={`py-3 px-6 font-medium text-sm transition ${activeTab === 'gradeManagement' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-800'}`}
           >
             Quản Lý Bảng Điểm
           </button>
           <button 
             onClick={() => setActiveTab('roadmapBuilder')} 
             className={`py-3 px-6 font-medium text-sm transition ${activeTab === 'roadmapBuilder' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-800'}`}
           >
             Soạn Lộ Trình / Chương
           </button>
        </div>
      </div>
      
      {activeTab === 'gradeManagement' && (
        <div className="space-y-8 animate-fade-in print:m-0 print:space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 print:hidden">
            {/* Trend Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
                Biểu đồ xu hướng học tập
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 13 }} dy={10} />
                    <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF' }} />
                    <Tooltip cursor={{fill: '#F3F4F6'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: 20 }} />
                    <Line type="monotone" name="Trung bình Hệ thống" dataKey="diem" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4, fill: '#3B82F6' }} activeDot={{ r: 6 }} />
                    <Line type="monotone" name="Trung bình Dự án" dataKey="diemDuAn" stroke="#10B981" strokeWidth={3} dot={{ r: 4, fill: '#10B981' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Weights Configurations */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Tùy chỉnh trọng số điểm số (%)</h3>
              <p className="text-sm text-gray-500 mb-6">Cấu hình cách tính tổng điểm trung bình từ các nguồn điểm khác nhau.</p>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-sm font-medium text-slate-700">Bài tập & Hệ thống</label>
                    <span className="text-sm text-gray-500 font-medium">{weights.homework}%</span>
                  </div>
                  <input type="range" min="0" max="100" value={weights.homework} onChange={e => setWeights({...weights, homework: Number(e.target.value)})} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-sm font-medium text-slate-700">Thi Giữa Kỳ / Trắc nghiệm</label>
                    <span className="text-sm text-gray-500 font-medium">{weights.midterm}%</span>
                  </div>
                  <input type="range" min="0" max="100" value={weights.midterm} onChange={e => setWeights({...weights, midterm: Number(e.target.value)})} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-sm font-medium text-slate-700">Bài Thi Dự Án</label>
                    <span className="text-sm text-gray-500 font-medium">{weights.project}%</span>
                  </div>
                  <input type="range" min="0" max="100" value={weights.project} onChange={e => setWeights({...weights, project: Number(e.target.value)})} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                </div>
              </div>
              <div className="mt-8 flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                 <span className="text-sm font-medium text-slate-800">Tổng trọng số:</span>
                 <span className={`text-lg font-bold ${weights.homework + weights.midterm + weights.project === 100 ? 'text-green-600' : 'text-red-500'}`}>
                   {weights.homework + weights.midterm + weights.project}%
                 </span>
              </div>
              {weights.homework + weights.midterm + weights.project !== 100 && (
                <p className="text-xs text-red-500 mt-2 font-medium">Lưu ý: Tổng trọng số phải bằng đúng 100%.</p>
              )}
            </div>
          </div>

          {/* Grades Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden print:shadow-none print:border-gray-300">
            <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50 print:bg-white print:border-b-2 print:border-gray-500">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Chi tiết Bảng Điểm Học Sinh</h2>
                <p className="text-sm text-gray-500 print:hidden">Nhập điểm bài thi dự án thủ công và xuất báo cáo.</p>
              </div>
              <div className="flex space-x-3 print:hidden">
                <button onClick={exportToCSV} className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition shadow-sm">
                  <Download className="w-4 h-4 mr-2" />
                  Xuất Excel/CSV
                </button>
                <button onClick={exportToPDF} className="flex items-center px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-lg text-sm font-medium text-indigo-700 hover:bg-indigo-100 transition shadow-sm">
                  <FileText className="w-4 h-4 mr-2" />
                  Xuất PDF
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-12 text-center text-gray-500">Đang tải biểu điểm...</div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white text-sm text-gray-500 border-b border-gray-200 print:bg-gray-100 print:text-black">
                      <th className="px-6 py-4 font-medium">Học sinh</th>
                      <th className="px-6 py-4 font-medium">Lớp</th>
                      <th className="px-6 py-4 font-medium">Điểm Quá Trình (Hệ thống)</th>
                      <th className="px-6 py-4 font-medium text-blue-700 bg-blue-50/50 print:bg-transparent">Điểm Bài Dự Án</th>
                      <th className="px-6 py-4 font-medium text-right">Tổng Kết (Quy Đổi)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 print:divide-gray-300">
                    {students.map(u => {
                      const computedScore = ((u.points || 0) * (weights.homework / 100)) + ((u.projectScore || 0) * (weights.project / 100)); // simplified mock calc
                      return (
                      <tr key={u.id} className="hover:bg-gray-50 transition-colors print:hover:bg-transparent">
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-900">{u.displayName}</div>
                          <div className="text-xs text-gray-500">{u.email}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {u.classId ? classes.find(c => c.id === u.classId)?.name || 'N/A' : 'N/A'}
                        </td>
                        <td className="px-6 py-4 font-mono text-sm text-gray-600">
                          {u.points || 0} đ
                        </td>
                        <td className="px-6 py-4 bg-blue-50/50 print:bg-transparent border-x border-blue-50 print:border-none">
                          <div className="flex items-center space-x-2 max-w-[120px]">
                            <input 
                              type="number" 
                              value={u.projectScore || 0}
                              onChange={(e) => setStudents(students.map(user => user.id === u.id ? { ...user, projectScore: Number(e.target.value) } : user))}
                              onBlur={(e) => handleUpdateStudentField(u.id, 'projectScore', Number(e.target.value))}
                              className="w-full px-2 py-1.5 text-sm font-medium border border-blue-200 rounded bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none print:border-none print:bg-transparent print:p-0"
                            />
                            <span className="text-xs text-blue-600 font-medium print:hidden">đ</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-800 print:bg-transparent print:text-black">
                            {computedScore.toFixed(1)}
                          </span>
                        </td>
                      </tr>
                    )})}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'studentsManager' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
             <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
               <h2 className="text-lg font-bold text-slate-900">Danh Sách Người Dùng (Phân quyền)</h2>
               <button onClick={fetchStudentsAndClasses} className="text-sm font-medium text-blue-600 hover:text-blue-800">
                 Làm mới
               </button>
             </div>
             {loading ? (
               <div className="p-12 text-center text-gray-500">Đang tải...</div>
             ) : (
               <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                   <thead>
                     <tr className="bg-white text-sm text-gray-500 border-b border-gray-200">
                       <th className="px-6 py-4 font-medium">Người dùng</th>
                       <th className="px-6 py-4 font-medium">Email</th>
                       <th className="px-6 py-4 font-medium">Lớp</th>
                       <th className="px-6 py-4 font-medium">Vai trò</th>
                       <th className="px-6 py-4 font-medium">Điểm số</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                     {students.map(u => (
                       <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                         <td className="px-6 py-4">
                           <div className="flex items-center space-x-3">
                             <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                               <User className="w-4 h-4" />
                             </div>
                             <input 
                               type="text"
                               value={u.displayName}
                               onChange={(e) => setStudents(students.map(user => user.id === u.id ? { ...user, displayName: e.target.value } : user))}
                               onBlur={(e) => handleUpdateStudentField(u.id, 'displayName', e.target.value)}
                               className="font-medium text-slate-900 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 py-1 focus:outline-none"
                             />
                           </div>
                         </td>
                         <td className="px-6 py-4 text-sm text-gray-500">{u.email}</td>
                         <td className="px-6 py-4 text-sm text-gray-500">
                           {u.classId ? classes.find(c => c.id === u.classId)?.name || 'N/A' : 'Chưa phân lớp'}
                         </td>
                         <td className="px-6 py-4">
                            <select 
                               value={u.role || 'student'}
                               onChange={(e) => {
                                  setStudents(students.map(user => user.id === u.id ? { ...user, role: e.target.value } : user));
                                  handleUpdateStudentField(u.id, 'role', e.target.value);
                               }}
                               disabled={role !== 'admin' && profile?.uid !== u.id}
                               className="text-sm border border-gray-300 rounded px-2 py-1 bg-white focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                            >
                               <option value="student">Học sinh</option>
                               <option value="teacher">Giáo viên</option>
                               <option value="admin">Quản trị viên</option>
                            </select>
                         </td>
                         <td className="px-6 py-4">
                           <div className="flex items-center space-x-2">
                              <input 
                                type="number" 
                                value={u.points || 0}
                                onChange={(e) => setStudents(students.map(user => user.id === u.id ? { ...user, points: Number(e.target.value) } : user))}
                                onBlur={(e) => handleUpdateStudentField(u.id, 'points', Number(e.target.value))}
                                className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                              />
                              <span className="text-xs text-gray-500">điểm</span>
                           </div>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             )}
        </div>
      )}

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Biểu đồ xu hướng */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Biểu đồ xu hướng học tập (Điểm TB lớp)</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 13 }} dy={10} />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF' }} />
                  <Tooltip cursor={{fill: '#F3F4F6'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="diemTB" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-slate-800 flex items-center mb-4"><PlusCircle className="mr-2" /> Quản lý bài học</h3>
            
            <div className="mb-6">
               <label className="block text-sm font-medium text-slate-700 mb-1">Chế độ biên soạn</label>
               <select value={editingLessonId} onChange={handleSelectLessonToEdit} className="w-full px-4 py-2 border border-blue-300 rounded-lg bg-blue-50 text-blue-800 font-medium font-sans">
                  <option value="">-- Tạo bài học mới --</option>
                  {syllabus.map(ch => (
                     <optgroup key={ch.id} label={ch.title}>
                        {ch.lessons.map(les => (
                           <option key={les.id} value={les.id}>{les.title}</option>
                        ))}
                     </optgroup>
                  ))}
               </select>
            </div>

            <form onSubmit={handleAddLesson} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tên bài học</label>
                  <input required value={lessonTitle} onChange={e => setLessonTitle(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="VD: Vòng lặp For" />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Chương</label>
                   <select value={chapterId} onChange={e => setChapterId(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                      {syllabus.map(ch => (
                        <option key={ch.id} value={ch.id}>{ch.title}</option>
                      ))}
                   </select>
                </div>
              </div>
              <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Nội dung bài học (Sử dụng "/" để mở menu lệnh)</label>
                 <p className="text-xs text-gray-500 mb-2">Hỗ trợ các phím tắt như Ctrl+B (in đậm), Ctrl+I (in nghiêng), tạo danh sách, và tuỳ chỉnh nâng cao.</p>
                 <Editor key={editingLessonId || 'new-editor'} initialContent={theory} onChange={setTheory} />
              </div>
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-800">Bài tập Lab Thực Hành</label>
                    <p className="text-xs text-slate-500 mt-0.5">Thêm các bài tập viết code liên quan đến bài học.</p>
                  </div>
                  <button type="button" onClick={addLab} className="text-xs bg-blue-50 font-medium text-blue-700 py-1 px-3 rounded hover:bg-blue-100 transition flex items-center"><Plus className="w-3 h-3 mr-1" /> Thêm Bài Lab</button>
                </div>
                {labs.length === 0 && (
                  <div className="text-sm text-gray-500 italic">Chưa có bài tập lab nào.</div>
                )}
                {labs.map((lab, idx) => (
                  <div key={idx} className="bg-blue-50/40 p-4 border border-blue-200 rounded-xl relative mb-4">
                     <button type="button" onClick={() => removeLab(idx)} className="absolute top-2 right-2 text-red-400 hover:text-red-600"><Trash className="w-4 h-4"/></button>
                     <label className="block text-xs font-bold text-slate-600 mb-1">Yêu cầu bài toán</label>
                     <textarea value={lab.prompt} onChange={e => updateLab(idx, { prompt: e.target.value })} placeholder="VD: Hãy in ra Hello World" className="w-full px-3 py-2 mb-3 text-sm border border-blue-300 rounded" required rows={2} />
                     <label className="block text-xs font-bold text-slate-600 mb-1">Mã tham khảo (Tùy chọn)</label>
                     <textarea value={lab.expectedCode || ''} onChange={e => updateLab(idx, { expectedCode: e.target.value })} placeholder="Nếu học sinh bí, sẽ hiện mã này..." className="w-full px-3 py-2 text-sm border border-blue-300 rounded font-mono" rows={3} />
                  </div>
                ))}
              </div>
              
              <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                 <div className="flex flex-wrap gap-3 items-center justify-between">
                    <span className="text-sm font-bold text-slate-700">Tài nguyên bổ sung (Sơ đồ tư duy & Mô phỏng):</span>
                    <div className="flex gap-2">
                       {!showMindmap && (
                          <button type="button" onClick={() => setShowMindmap(true)} className="text-xs bg-sky-50 font-medium text-sky-700 py-1.5 px-3 rounded-lg border border-sky-200 hover:bg-sky-100 transition flex items-center">
                             <Plus className="w-3.5 h-3.5 mr-1" /> Thêm sơ đồ tư duy
                          </button>
                       )}
                       {!showSimulation && (
                          <button type="button" onClick={() => setShowSimulation(true)} className="text-xs bg-teal-50 font-medium text-teal-700 py-1.5 px-3 rounded-lg border border-teal-200 hover:bg-teal-100 transition flex items-center">
                             <Plus className="w-3.5 h-3.5 mr-1" /> Thêm mô phỏng
                          </button>
                       )}
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {showMindmap && (
                       <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm relative animate-in fade-in duration-200">
                          <div className="flex justify-between items-center mb-1.5">
                             <label className="block text-xs font-bold text-slate-600">URL Sơ Đồ Tư Duy (Mindmap embed src)</label>
                             <button 
                                type="button" 
                                onClick={() => { setMindmapUrl(''); setShowMindmap(false); }} 
                                className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-1.5 py-0.5 rounded transition flex items-center font-medium"
                             >
                                <Trash className="w-3 h-3 mr-1" /> Xoá sơ đồ
                             </button>
                          </div>
                          <input 
                             type="text" 
                             required={showMindmap}
                             value={mindmapUrl} 
                             onChange={e => setMindmapUrl(e.target.value)} 
                             className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-xs font-sans" 
                             placeholder="VD: https://whimsical.com/embed/..." 
                          />
                       </div>
                    )}

                    {showSimulation && (
                       <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm relative animate-in fade-in duration-200">
                          <div className="flex justify-between items-center mb-1.5">
                             <label className="block text-xs font-bold text-slate-600">URL Mô Phỏng (PhET/Thí nghiệm embed src)</label>
                             <button 
                                type="button" 
                                onClick={() => { setSimulationUrl(''); setShowSimulation(false); }} 
                                className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-1.5 py-0.5 rounded transition flex items-center font-medium"
                             >
                                <Trash className="w-3 h-3 mr-1" /> Xoá mô phỏng
                             </button>
                          </div>
                          <input 
                             type="text" 
                             required={showSimulation}
                             value={simulationUrl} 
                             onChange={e => setSimulationUrl(e.target.value)} 
                             className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-xs font-sans" 
                             placeholder="VD: https://phet.colorado.edu/sims/html/..." 
                          />
                        </div>
                     )}
                  </div>
               </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-800">Bộ Thuật Ngữ / Thẻ Ghi Nhớ (Tự động 4 Game)</label>
                    <p className="text-xs text-slate-500 mt-0.5">Hệ thống sẽ tự tạo các game: Lật Thẻ, Ghép Từ, Viết, Kiểm Tra chỉ từ danh sách này.</p>
                  </div>
                  <button type="button" onClick={addFlashcard} className="text-xs bg-indigo-50 font-medium text-indigo-700 py-1 px-3 rounded hover:bg-indigo-100 transition flex items-center"><Plus className="w-3 h-3 mr-1" /> Thêm Thẻ</button>
                </div>
                {flashcards.map((card, idx) => (
                  <div key={idx} className="flex gap-4 mb-2 items-start bg-indigo-50/30 p-3 rounded-lg relative group">
                     <button type="button" onClick={() => removeFlashcard(idx)} className="absolute -right-2 -top-2 bg-red-100 text-red-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition shadow-sm"><Trash className="w-3 h-3"/></button>
                     <input value={card.front} onChange={e => updateFlashcard(idx, { front: e.target.value })} placeholder="Thuật ngữ (VD: Apple)" className="flex-1 px-3 py-2 text-sm border border-indigo-200 rounded focus:ring-1 focus:ring-indigo-500 font-bold" required />
                     <input value={card.back} onChange={e => updateFlashcard(idx, { back: e.target.value })} placeholder="Định nghĩa (VD: Quả táo)" className="flex-1 px-3 py-2 text-sm border border-indigo-200 rounded focus:ring-1 focus:ring-indigo-500" required />
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-bold text-slate-800">Mini Quiz Tích XP</label>
                  <div className="flex space-x-2">
                     <button type="button" onClick={() => addLessonMiniQuiz('multiple_choice')} className="text-xs bg-amber-50 font-medium text-amber-700 py-1 px-3 rounded hover:bg-amber-100 transition flex items-center"><Plus className="w-3 h-3 mr-1" /> Trắc nghiệm</button>
                     <button type="button" onClick={() => addLessonMiniQuiz('true_false')} className="text-xs bg-amber-50 font-medium text-amber-700 py-1 px-3 rounded hover:bg-amber-100 transition flex items-center"><Plus className="w-3 h-3 mr-1" /> Đúng/Sai</button>
                  </div>
                </div>
                <div className="space-y-4">
                {miniQuiz.map((q, idx) => (
                  <div key={idx} className="bg-amber-50/40 p-4 border border-amber-200 rounded-xl relative">
                     <button type="button" onClick={() => removeLessonMiniQuiz(idx)} className="absolute top-2 right-2 text-red-400 hover:text-red-600"><Trash className="w-4 h-4"/></button>
                     <label className="block text-xs font-bold text-slate-600 mb-1">{q.type === 'multiple_choice' ? 'Câu hỏi Trắc nghiệm' : 'Câu hỏi Đúng / Sai'}</label>
                     <input value={q.prompt} onChange={e => updateLessonMiniQuiz(idx, { prompt: e.target.value })} placeholder="Nội dung câu hỏi" className="w-full px-3 py-2 mb-2 text-sm border border-amber-300 rounded" required />
                     
                     {q.type === 'multiple_choice' && (
                        <div className="pl-2 border-l-2 border-amber-300 space-y-2 mt-2">
                           {q.options.map((opt: string, optIdx: number) => (
                             <div key={optIdx} className="flex items-center gap-2">
                                <input type="radio" name={`mini_q_${idx}`} checked={q.correctOptionIndex === optIdx} onChange={() => updateLessonMiniQuiz(idx, { correctOptionIndex: optIdx })} className="text-amber-500 focus:ring-amber-500" />
                                <input value={opt} onChange={e => {
                                   const newOpts = [...q.options];
                                   newOpts[optIdx] = e.target.value;
                                   updateLessonMiniQuiz(idx, { options: newOpts });
                                }} placeholder={`Lựa chọn ${optIdx+1}`} className="text-sm px-2 py-1 border border-amber-200 rounded flex-1" required />
                             </div>
                           ))}
                        </div>
                     )}
                     
                     {q.type === 'true_false' && (
                        <div className="flex gap-4 mt-2">
                           <label className="flex items-center gap-2 text-sm font-bold bg-white px-3 py-1.5 rounded border border-amber-200 cursor-pointer">
                              <input type="radio" name={`mini_tf_${idx}`} checked={q.correctAnswerBool} onChange={() => updateLessonMiniQuiz(idx, { correctAnswerBool: true })} className="text-amber-500 focus:ring-amber-500" /> Đúng
                           </label>
                           <label className="flex items-center gap-2 text-sm font-bold bg-white px-3 py-1.5 rounded border border-amber-200 cursor-pointer">
                              <input type="radio" name={`mini_tf_${idx}`} checked={!q.correctAnswerBool} onChange={() => updateLessonMiniQuiz(idx, { correctAnswerBool: false })} className="text-amber-500 focus:ring-amber-500" /> Sai
                           </label>
                        </div>
                     )}
                  </div>
                ))}
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-bold text-slate-800">Trò chơi tương tác (Tùy chọn)</label>
                  <div className="flex space-x-2">
                    <button type="button" onClick={() => addInteractiveGame('sort_paragraphs')} className="text-xs bg-slate-100 font-medium text-slate-700 py-1 px-3 rounded hover:bg-slate-200 transition flex items-center"><Plus className="w-3 h-3 mr-1" /> Sắp xếp đoạn</button>
                    <button type="button" onClick={() => addInteractiveGame('fill_blanks')} className="text-xs bg-slate-100 font-medium text-slate-700 py-1 px-3 rounded hover:bg-slate-200 transition flex items-center"><Plus className="w-3 h-3 mr-1" /> Điền từ</button>
                    <button type="button" onClick={() => addInteractiveGame('drag_words')} className="text-xs bg-slate-100 font-medium text-slate-700 py-1 px-3 rounded hover:bg-slate-200 transition flex items-center"><Plus className="w-3 h-3 mr-1" /> Kéo thả từ</button>
                  </div>
                </div>

                {interactiveGames.map((game, idx) => (
                  <div key={idx} className="mb-4 bg-slate-50 border border-slate-200 p-4 rounded-xl relative">
                    <button type="button" onClick={() => removeInteractiveGame(idx)} className="absolute top-4 right-4 text-red-500 hover:text-red-700"><Trash className="w-4 h-4"/></button>
                    <div className="mb-3">
                      <label className="block text-xs font-bold text-slate-600 mb-1">Loại: {game.type === 'sort_paragraphs' ? 'Sắp xếp đoạn' : game.type === 'fill_blanks' ? 'Điền từ' : 'Kéo thả từ'}</label>
                      <input 
                        value={game.title} 
                        onChange={(e) => updateInteractiveGame(idx, { title: e.target.value })}
                        placeholder={
                          game.type === 'sort_paragraphs' ? 'Tiêu đề (VD: Sắp xếp các đoạn code sau)'
                          : game.type === 'fill_blanks' ? 'Tiêu đề (VD: Điền từ còn thiếu vào chỗ trống)'
                          : 'Tiêu đề (VD: Kéo thả từ vào đúng vị trí)'
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 mb-2 font-bold"
                        required
                      />
                      <GameTextEditor game={game} updateContent={(val) => updateInteractiveGame(idx, { content: val })} />
                      <input 
                        value={game.hint || ''} 
                        onChange={(e) => updateInteractiveGame(idx, { hint: e.target.value })}
                        placeholder="Gợi ý / Hướng dẫn giải cho trò chơi này (Tùy chọn - Giúp ích cho học viên)"
                        className="w-full px-3 py-1.5 mt-2 bg-white text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 font-sans text-slate-700"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Course Sequence Blocks Editor (Sắp xếp chuỗi khối bài học) */}
              <div className="bg-white p-6 rounded-2xl border-2 border-indigo-600/30 shadow-sm space-y-6 mt-8">
                <div className="border-b border-indigo-150 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="text-base font-extrabold text-indigo-900 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-indigo-505 animate-pulse" />
                      <span>Sắp xếp bài học theo chuỗi khối linh hoạt</span>
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">Tiến trình học tích hợp. Kéo thả, lặp lại hoặc di chuyển khối bất kỳ của bài học ở mọi vị trí.</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5 self-end md:self-auto">
                    <button 
                      type="button" 
                      onClick={() => addBlock('theory')}
                      className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg border border-blue-200 transition"
                    >
                      + Lý thuyết
                    </button>
                    <button 
                      type="button" 
                      onClick={() => addBlock('miniquiz')}
                      className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold rounded-lg border border-amber-200 transition"
                    >
                      + Trắc nghiệm
                    </button>
                    <button 
                      type="button" 
                      onClick={() => addBlock('game')}
                      className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 transition"
                    >
                      + Trò chơi
                    </button>
                    <button 
                      type="button" 
                      onClick={() => addBlock('flashcards')}
                      className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-200 transition"
                    >
                      + Flashcards
                    </button>
                    <button 
                      type="button" 
                      onClick={() => addBlock('practice')}
                      className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200 transition"
                    >
                      + Thực hành Lab
                    </button>
                    <button 
                      type="button" 
                      onClick={() => addBlock('challenge')}
                      className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-lg border border-rose-200 transition"
                    >
                      + Thử thách
                    </button>
                  </div>
                </div>

                {lessonBlocks.length === 0 ? (
                  <div className="bg-slate-50 p-8 rounded-xl text-center border border-dashed border-slate-300 text-slate-400 font-sans text-sm">
                    Chưa có khối nội dung được sắp xếp. Bấm nút phía trên để bắt đầu thêm chuỗi khối bài học!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {lessonBlocks.map((block, idx) => (
                      <div key={block.id || idx} className="bg-slate-50/50 p-4 border border-slate-200 rounded-2xl relative space-y-4">
                        
                        <div className="flex items-center justify-between border-b border-slate-150 pb-2.5">
                          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                            <span className="w-5.5 h-5.5 rounded-full bg-indigo-100 text-indigo-800 font-extrabold flex items-center justify-center text-xs shrink-0">{idx + 1}</span>
                            <span className="text-[10px] uppercase font-extrabold text-slate-600 bg-slate-200/80 px-2.5 py-0.5 rounded shrink-0">
                              {getBlockTypeName(block.type)}
                            </span>
                            <input 
                              type="text"
                              required
                              placeholder="Tiêu đề khối nội dung..."
                              value={block.title || ''}
                              onChange={e => updateBlockField(idx, { title: e.target.value })}
                              className="px-3 py-1 font-bold text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 w-44 sm:w-64"
                            />
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <button 
                              type="button" 
                              onClick={() => moveBlock(idx, 'up')}
                              disabled={idx === 0}
                              className="px-1.5 py-0.5 bg-white border border-slate-200 text-[10px] text-slate-500 hover:text-slate-800 rounded disabled:opacity-30"
                            >
                              Lên
                            </button>
                            <button 
                              type="button" 
                              onClick={() => moveBlock(idx, 'down')}
                              disabled={idx === lessonBlocks.length - 1}
                              className="px-1.5 py-0.5 bg-white border border-slate-200 text-[10px] text-slate-500 hover:text-slate-800 rounded disabled:opacity-30"
                            >
                              Xuống
                            </button>
                            <button 
                              type="button" 
                              onClick={() => duplicateBlock(idx)}
                              className="px-1.5 py-0.5 text-[10px] bg-blue-50 text-blue-700 font-bold hover:bg-blue-105 rounded transition"
                            >
                              Lặp lại
                            </button>
                            <button 
                              type="button" 
                              onClick={() => deleteBlock(idx)}
                              className="px-1.5 py-0.5 text-[10px] bg-red-50 text-red-600 font-bold hover:bg-red-105 rounded transition"
                            >
                              Xóa
                            </button>
                          </div>
                        </div>

                        {block.type === 'theory' && (
                          <div className="space-y-1.5 animate-in fade-in duration-200">
                            <textarea 
                              value={block.content || ''}
                              onChange={e => updateBlockField(idx, { content: e.target.value })}
                              className="w-full text-xs font-mono p-3 border border-slate-300 rounded-xl bg-white h-36"
                              placeholder="VD: Hãy khai báo biến gán trị 5 trong python:&#10;```python&#10;x = 5&#10;print(x)&#10;```"
                            />
                          </div>
                        )}

                        {block.type === 'miniquiz' && (
                          <div className="space-y-4 animate-in fade-in duration-200">
                            <div className="flex justify-between items-center bg-white p-2 rounded-xl border border-slate-200">
                              <span className="text-[11px] font-extrabold text-slate-500 pl-1">Câu hỏi Trắc Nghiệm</span>
                              <div className="flex gap-1.5">
                                <button 
                                  type="button" 
                                  onClick={() => addQuestionToQuizBlock(idx, 'multiple_choice')}
                                  className="text-[10px] bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold px-2 py-0.5 rounded-lg transition"
                                >
                                  + Lựa chọn
                                </button>
                                <button 
                                  type="button" 
                                  onClick={() => addQuestionToQuizBlock(idx, 'true_false')}
                                  className="text-[10px] bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold px-2 py-0.5 rounded-lg transition"
                                >
                                  + Đúng / Sai
                                </button>
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              {(!block.questions || block.questions.length === 0) && (
                                <span className="text-slate-400 italic text-[11px] block pl-1">Chưa có câu hỏi trong khối trắc nghiệm này.</span>
                              )}
                              {(block.questions || []).map((q: any, qIdx: number) => (
                                <div key={qIdx} className="bg-white p-3.5 border border-amber-200 rounded-xl relative space-y-2 pb-4">
                                  <button 
                                    type="button" 
                                    onClick={() => removeQuestionFromQuizBlock(idx, qIdx)}
                                    className="absolute top-2 right-2 text-[10px] text-red-500 hover:text-red-700 font-medium bg-red-50 px-2 py-0.5 rounded"
                                  >
                                    Xóa câu {qIdx + 1}
                                  </button>
                                  <label className="block text-[10px] font-extrabold text-amber-700 uppercase tracking-wide">
                                    Mục {qIdx + 1}: {q.type === 'multiple_choice' ? 'Nhiều lựa chọn' : 'Đúng hay Sai'}
                                  </label>
                                  <input 
                                    value={q.prompt}
                                    onChange={e => updateQuestionInQuizBlock(idx, qIdx, { prompt: e.target.value })}
                                    placeholder="Nội dung câu hỏi..."
                                    className="w-full text-xs font-sans px-3 py-1.5 border border-slate-300 rounded bg-white"
                                    required
                                  />
                                  
                                  {q.type === 'multiple_choice' && (
                                    <div className="space-y-1.5 pl-3 border-l-2 border-amber-300 mt-2">
                                      {q.options?.map((opt: string, optIdx: number) => (
                                        <div key={optIdx} className="flex items-center gap-2">
                                          <input 
                                            type="radio" 
                                            name={`block_q_${idx}_${qIdx}`}
                                            checked={q.correctOptionIndex === optIdx}
                                            onChange={() => updateQuestionInQuizBlock(idx, qIdx, { correctOptionIndex: optIdx })}
                                            className="text-amber-500 focus:ring-amber-550"
                                          />
                                          <input 
                                            value={opt}
                                            onChange={e => {
                                              const newOpts = [...(q.options || [])];
                                              newOpts[optIdx] = e.target.value;
                                              updateQuestionInQuizBlock(idx, qIdx, { options: newOpts });
                                            }}
                                            placeholder={`Đáp án ${optIdx + 1}`}
                                            className="flex-1 text-xs px-2.5 py-0.5 border border-slate-200 rounded"
                                            required
                                          />
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  
                                  {q.type === 'true_false' && (
                                    <div className="flex gap-4 mt-2">
                                      <label className="flex items-center gap-1.5 bg-slate-50 border border-slate-250 p-1 px-3.5 rounded font-bold text-xs cursor-pointer">
                                        <input 
                                          type="radio" 
                                          name={`block_tf_${idx}_${qIdx}`}
                                          checked={q.correctAnswerBool === true}
                                          onChange={() => updateQuestionInQuizBlock(idx, qIdx, { correctAnswerBool: true })}
                                        /><span>Đúng</span>
                                      </label>
                                      <label className="flex items-center gap-1.5 bg-slate-50 border border-slate-250 p-1 px-3.5 rounded font-bold text-xs cursor-pointer">
                                        <input 
                                          type="radio" 
                                          name={`block_tf_${idx}_${qIdx}`}
                                          checked={q.correctAnswerBool === false}
                                          onChange={() => updateQuestionInQuizBlock(idx, qIdx, { correctAnswerBool: false })}
                                        /><span>Sai</span>
                                      </label>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {block.type === 'game' && (
                          <div className="space-y-3 animate-in fade-in duration-200">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[11px] font-bold text-slate-600 mb-1">Kiểu trò chơi tương tác</label>
                                <select 
                                  value={block.game?.type || 'sort_paragraphs'}
                                  onChange={e => updateBlockField(idx, { game: { ...(block.game || {}), type: e.target.value } })}
                                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white"
                                >
                                  <option value="sort_paragraphs">Sắp xếp dòng mã</option>
                                  <option value="fill_blanks">Điền từ vào ô trống</option>
                                  <option value="drag_words">Kéo thả khối từ vựng</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-[11px] font-bold text-slate-600 mb-1">Hiển thị tiêu đề game</label>
                                <input 
                                  type="text" 
                                  value={block.game?.title || ''}
                                  onChange={e => updateBlockField(idx, { game: { ...(block.game || {}), title: e.target.value } })}
                                  placeholder="VD: Sắp xếp các đoạn mã Python"
                                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white font-bold"
                                  required
                                />
                              </div>
                            </div>
                            
                            <div>
                              <GameTextEditor 
                                game={block.game || { type: 'sort_paragraphs', content: '' }} 
                                updateContent={content => updateBlockField(idx, { game: { ...(block.game || {}), content } })} 
                              />
                            </div>
                            
                            <div>
                              <input 
                                type="text" 
                                value={block.game?.hint || ''}
                                onChange={e => updateBlockField(idx, { game: { ...(block.game || {}), hint: e.target.value } })}
                                placeholder="Gợi ý/Nội dung hỗ trợ giải cho học sinh (Tùy chọn)"
                                className="w-full px-3 py-1 border border-slate-300 rounded text-xs bg-white text-slate-500"
                              />
                            </div>
                          </div>
                        )}

                        {block.type === 'flashcards' && (
                          <div className="space-y-3 animate-in fade-in duration-200">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[11px] font-bold text-slate-500">Mục Thẻ Ghi Nhớ</span>
                              <button 
                                type="button" 
                                onClick={() => addCardToFlashcardBlock(idx)}
                                className="text-[10px] bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold px-2 py-0.5 rounded-lg"
                              >
                                + Thêm Thuật Ngữ
                              </button>
                            </div>
                            
                            <div className="space-y-2">
                              {(!block.flashcards || block.flashcards.length === 0) && (
                                <span className="text-slate-400 italic text-xs pl-1">Chưa có thuật ngữ nào được liệt kê.</span>
                              )}
                              {(block.flashcards || []).map((card: any, cardIdx: number) => (
                                <div key={cardIdx} className="flex gap-2 items-center bg-white p-2 border border-slate-200 rounded-xl">
                                  <input 
                                    value={card.front || ''}
                                    onChange={e => updateCardInFlashcardBlock(idx, cardIdx, { front: e.target.value })}
                                    placeholder="Thuật ngữ viết code Python"
                                    className="flex-1 text-xs px-2.5 py-1.5 border border-slate-200 rounded-md font-bold"
                                    required
                                  />
                                  <input 
                                    value={card.back || ''}
                                    onChange={e => updateCardInFlashcardBlock(idx, cardIdx, { back: e.target.value })}
                                    placeholder="Diễn đạt ý nghĩa"
                                    className="flex-1 text-xs px-2.5 py-1.5 border border-slate-200 rounded-md"
                                    required
                                  />
                                  <button 
                                    type="button" 
                                    onClick={() => removeCardFromFlashcardBlock(idx, cardIdx)}
                                    className="text-xs bg-red-50 text-red-500 hover:text-red-700 px-2 py-1 rounded"
                                  >
                                    Xóa
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {(block.type === 'practice' || block.type === 'challenge') && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-emerald-50/50 border border-emerald-200 rounded-2xl animate-in fade-in duration-200">
                            <div className="space-y-1.5">
                              <label className="block text-[11px] font-bold text-emerald-800">Yêu cầu bài tập (Prompt)</label>
                              <textarea 
                                value={block.prompt || ''}
                                onChange={e => updateBlockField(idx, { prompt: e.target.value })}
                                placeholder="VD: Hãy in ra kết quả số 15"
                                className="w-full text-xs font-sans p-2.5 border border-slate-350 rounded-xl bg-white"
                                rows={3}
                                required
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="block text-[11px] font-bold text-emerald-800">Mã đáp án Python để so khớp (Expected)</label>
                              <textarea 
                                value={block.expectedCode || ''}
                                onChange={e => updateBlockField(idx, { expectedCode: e.target.value })}
                                placeholder="VD: print(15)"
                                className="w-full text-xs font-mono p-2.5 border border-slate-350 rounded-xl bg-white"
                                rows={3}
                                required
                              />
                            </div>
                          </div>
                        )}

                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-200">
                 <label className="block text-sm font-bold text-slate-800 mb-2">Chỉ định lớp học (Tuỳ chọn)</label>
                 <div className="flex flex-wrap gap-3">
                   {classes.map(c => (
                     <label key={c.id} className="flex items-center space-x-2 bg-slate-50 border border-gray-200 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-slate-100">
                       <input 
                         type="checkbox" 
                         checked={lessonTargetClassIds.includes(c.id)}
                         onChange={() => handleClassSelection(c.id, true)}
                         className="rounded text-blue-600 focus:ring-blue-500"
                       />
                       <span className="text-sm font-medium text-slate-700">{c.name}</span>
                     </label>
                   ))}
                   {classes.length === 0 && <span className="text-sm text-gray-500">Chưa có lớp nào được tạo.</span>}
                 </div>
              </div>

              <button type="submit" className="bg-blue-600 w-full text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition">
                {editingLessonId ? 'Cập Nhật Bài Học' : 'Lưu Bài Học & Các Trò Chơi'}
              </button>
            </form>
          </div>
        </div>

        {/* Form chấm điểm */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-fit">
          <h3 className="text-lg font-bold text-slate-800 mb-1">Nhập điểm thủ công</h3>
          <p className="text-xs text-gray-500 mb-6">Dành cho Mini Projects hoặc hỏi đáp</p>
          
          <form className="space-y-4" onSubmit={handleGrade}>
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Học Viên</label>
               <select value={studentId} onChange={e => setStudentId(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
                 {loading ? <option>Đang tải...</option> : students.map(s => (
                   <option key={s.id} value={s.id}>{s.displayName} ({s.email})</option>
                 ))}
               </select>
             </div>
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Điểm cộng thêm</label>
               <input value={points} onChange={e => setPoints(e.target.value)} required type="number" placeholder="Ví dụ: 30" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
             </div>
             <button type="submit" className="w-full bg-slate-900 border border-transparent text-white font-semibold py-2.5 rounded-lg hover:bg-slate-800 transition">
               Cộng điểm
             </button>
             {showToast && <p className="text-green-600 text-sm font-medium text-center mt-2">Đã cộng điểm thành công!</p>}
          </form>

          <div className="mt-8">
             <h4 className="font-bold text-sm mb-2 text-slate-700">Top Học Sinh</h4>
             <ul className="space-y-2">
                {students.sort((a,b) => (b.points || 0) - (a.points || 0)).slice(0, 5).map(s => (
                  <li key={s.id} className="flex justify-between items-center text-sm border-b py-2 text-slate-600">
                    <span className="flex items-center"><User className="w-4 h-4 mr-2"/> {s.displayName}</span>
                    <strong className="text-blue-600">{s.points || 0} đ</strong>
                  </li>
                ))}
             </ul>
          </div>
        </div>
      {/* End of overview tab */}
      </div>)}

      {activeTab === 'examBuilder' && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-slate-800 flex items-center mb-6"><PlusCircle className="mr-2" /> Soạn Bài Kiểm Tra (Trắc nghiệm & Code)</h3>
          <form onSubmit={handleAddExam} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Tên bài kiểm tra</label>
                 <input required value={examTitle} onChange={e => setExamTitle(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="VD: Thi Giữa Kỳ Python" />
              </div>
              <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả ngắn</label>
                 <input required value={examDescription} onChange={e => setExamDescription(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="VD: Gồm 10 câu trắc nghiệm và 1 bài code" />
              </div>
            </div>

            <div className="space-y-6 border-t border-gray-100 pt-6">
              <h4 className="font-bold text-slate-800">Danh sách câu hỏi:</h4>
              {examQuestions.map((q, idx) => (
                <div key={q.id} className="p-4 border border-blue-100 bg-blue-50/30 rounded-lg relative">
                   <button type="button" onClick={() => setExamQuestions(examQuestions.filter((_, i) => i !== idx))} className="absolute top-4 right-4 text-red-500 hover:text-red-700">
                     <Trash className="w-5 h-5"/>
                   </button>
                   <div>
                     <span className="text-xs font-bold uppercase text-blue-600 hidden md:inline-block mb-2">
                       {q.type === 'multiple_choice' ? 'Trắc nghiệm' : q.type === 'true_false' ? 'Đúng/Sai' : 'Viết Code'}
                     </span>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Câu {idx + 1}: Yêu cầu/Câu hỏi</label>
                     <textarea required value={q.prompt} onChange={e => updateQuestion(idx, { prompt: e.target.value })} rows={2} className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4" />
                   </div>
                   
                   {q.type === 'multiple_choice' && (
                     <div className="space-y-2 pl-4">
                       {q.options.map((opt: string, optIdx: number) => (
                         <div key={optIdx} className="flex items-center space-x-3">
                           <input type="radio" name={`correct_${idx}`} checked={q.correctOptionIndex === optIdx} onChange={() => updateQuestion(idx, { correctOptionIndex: optIdx })} />
                           <input required placeholder={`Lựa chọn ${optIdx + 1}`} value={opt} onChange={e => {
                             const newOpts = [...q.options];
                             newOpts[optIdx] = e.target.value;
                             updateQuestion(idx, { options: newOpts });
                           }} className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm"/>
                         </div>
                       ))}
                     </div>
                   )}
                   
                   {q.type === 'true_false' && (
                     <div className="flex space-x-6 pl-4 font-medium text-sm">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input type="radio" name={`tf_${idx}`} checked={q.correctAnswerBool} onChange={() => updateQuestion(idx, { correctAnswerBool: true })} />
                          <span>Đúng</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input type="radio" name={`tf_${idx}`} checked={!q.correctAnswerBool} onChange={() => updateQuestion(idx, { correctAnswerBool: false })} />
                          <span>Sai</span>
                        </label>
                     </div>
                   )}

                   {q.type === 'coding' && (
                     <div className="pl-4">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Kết quả in ra mong đợi (Expected Output)</label>
                        <input required value={q.expectedOutput} onChange={e => updateQuestion(idx, { expectedOutput: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Ví dụ: Xin chào Python" />
                     </div>
                   )}
                </div>
              ))}

              <div className="flex flex-wrap gap-3 pt-2">
                 <button type="button" onClick={() => addQuestion('multiple_choice')} className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-slate-700 text-sm font-medium rounded-lg transition"><Plus className="w-4 h-4 mr-1"/> Thêm Trắc nghiệm</button>
                 <button type="button" onClick={() => addQuestion('true_false')} className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-slate-700 text-sm font-medium rounded-lg transition"><Plus className="w-4 h-4 mr-1"/> Thêm Đúng/Sai</button>
                 <button type="button" onClick={() => addQuestion('coding')} className="flex items-center px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 text-sm font-medium rounded-lg transition"><Plus className="w-4 h-4 mr-1"/> Thêm Viết Code</button>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
               <label className="block text-sm font-bold text-slate-800 mb-2">Chỉ định lớp học tiếp nhận (Tuỳ chọn)</label>
               <div className="flex flex-wrap gap-3">
                 {classes.map(c => (
                   <label key={c.id} className="flex items-center space-x-2 bg-slate-50 border border-gray-200 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-slate-100">
                     <input 
                       type="checkbox" 
                       checked={examTargetClassIds.includes(c.id)}
                       onChange={() => handleClassSelection(c.id, false)}
                       className="rounded text-blue-600 focus:ring-blue-500"
                     />
                     <span className="text-sm font-medium text-slate-700">{c.name}</span>
                   </label>
                 ))}
                 {classes.length === 0 && <span className="text-sm text-gray-500">Chưa có lớp nào được tạo.</span>}
               </div>
            </div>

            <button type="submit" className="w-full mt-6 bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition">Lưu Bài Kiểm Tra</button>
          </form>
        </div>
      )}
      {activeTab === 'practiceBuilder' && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-slate-800 flex items-center mb-6"><PlusCircle className="mr-2" /> Soạn Bài Thực Hành (Dự án Lab)</h3>
          <p className="text-sm text-gray-500 mb-6">Bạn có thể sử dụng Markdown, thẻ HTML iframe và img để chèn video gợi ý, hình ảnh, mã nguồn chạy thử, và các bảng dữ liệu.</p>
          <form onSubmit={handleAddPractice} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Tên Dự Án Lập Trình</label>
                 <input required value={practiceTitle} onChange={e => setPracticeTitle(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="VD: Máy tính bỏ túi Python" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Cấp Độ</label>
                   <select value={practiceLevel} onChange={e => setPracticeLevel(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                      <option value="Đồng">Đồng (Dễ)</option>
                      <option value="Bạc">Bạc (Trung bình)</option>
                      <option value="Vàng">Vàng (Khó)</option>
                      <option value="Kim Cương">Kim Cương (Cực khó)</option>
                   </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Điểm thưởng</label>
                  <input required type="number" min="0" value={practicePoints} onChange={e => setPracticePoints(Number(e.target.value))} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
              </div>
            </div>

            <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Nội dung yêu cầu (Hỗ trợ Markdown rèn luyện, HTML iframe video, img, code block)</label>
               <p className="text-xs text-gray-500 mb-2">Gợi ý: Dùng bảng (Table) `| Cột 1 | Cột 2 |`, chèn Video `&lt;iframe src='youtube_url' ...&gt;&lt;/iframe&gt;`, chèn khối mã ` \`\`\`python ... \`\`\` `.</p>
               <textarea required value={practiceDescription} onChange={e => setPracticeDescription(e.target.value)} rows={8} className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm" placeholder="Mô tả chi tiết dự án, đầu vào đầu ra..." />
            </div>

            <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Mã nguồn chạy thử (Expected Code cho Hệ thống chấm tự động)</label>
               <p className="text-xs text-gray-500 mb-2">Đoạn code Python cơ sở hoặc đáp án gốc để hệ thống gợi ý cho học viên.</p>
               <textarea required value={practiceExpectedCode} onChange={e => setPracticeExpectedCode(e.target.value)} rows={6} className="w-full px-4 py-2 border border-blue-200 bg-slate-900 text-blue-300 rounded-lg font-mono text-sm" placeholder="def solution():\n    ..." />
            </div>

            <button type="submit" className="w-full mt-6 bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition">Thêm Dự Án Thực Hành Mới</button>
          </form>
        </div>
      )}

      {activeTab === 'roadmapBuilder' && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 animate-fade-in print:hidden">
          <h3 className="text-lg font-bold text-slate-800 flex items-center mb-6"><Map className="mr-2 text-slate-500" /> Soạn Lộ Trình Học Tập (Chương)</h3>
          
          <div className="mb-6 border-b border-gray-200 pb-6">
             <label className="block text-sm font-medium text-slate-700 mb-2">Chế độ biên soạn</label>
             <select value={editingChapterId} onChange={handleSelectChapterToEdit} className="w-full px-4 py-2 border border-blue-300 rounded-lg bg-blue-50 text-blue-800 font-medium font-sans focus:ring-2 focus:ring-blue-500 focus:outline-none">
                <option value="">-- Tạo Lộ trình / Chương mới --</option>
                {syllabus.map(ch => (
                   <option key={ch.id} value={ch.id}>{ch.title}</option>
                ))}
             </select>
          </div>

          <form onSubmit={handleAddChapter} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tên Chương / Lộ trình</label>
              <input required value={chapterTitle} onChange={e => setChapterTitle(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none" placeholder="VD: Chương 1: Hành trang cơ bản" />
            </div>
            <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả định hướng</label>
               <textarea required value={chapterDescription} onChange={e => setChapterDescription(e.target.value)} rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none" placeholder="Mục tiêu của chặng đường này là gì... Dành cho giáo viên vạch định chi tiết." />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Ảnh minh họa (URL tùy chọn)</label>
              <input value={chapterImageUrl} onChange={e => setChapterImageUrl(e.target.value)} type="url" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none" placeholder="https://example.com/image.png" />
            </div>

            <button type="submit" className="w-full mt-8 bg-green-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-green-700 shadow-md transition-transform hover:scale-[1.01] flex justify-center items-center">
              {editingChapterId ? 'Cập Nhật Lộ Trình Hiện Tại' : 'Thêm Lộ Trình / Chương Mới'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
