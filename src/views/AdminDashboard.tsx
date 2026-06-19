import React, { useEffect, useState, useRef } from "react";
import { useAppContext } from "../store";
import {
  collection,
  query,
  getDocs,
  doc,
  updateDoc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import {
  getLocalNoCodeConfig,
  saveNoCodeConfigDb,
  NoCodeConfig,
  NoCodePage,
  NoCodeBlock,
  getLocalRevisionHistories,
  RevisionHistory,
  DEFAULT_APPEARANCE,
  DEFAULT_SYSTEM_SETTINGS,
  DEFAULT_MENUS,
  fetchNoCodeConfigDb,
} from "../lib/nocode_store";
import { NoCodeRenderer } from "../components/NoCodeRenderer";
import { audioService } from "../utils/audio";
import { GameDeveloperPanel } from "../components/GameDeveloperPanel";
import {
  Loader2,
  Shield,
  ShieldCheck,
  User,
  PlusCircle,
  Layout,
  Palette,
  Smartphone,
  Tablet,
  Monitor,
  Settings,
  History,
  Check,
  Undo,
  Trash2,
  Copy,
  Save,
  Menu,
  ChevronUp,
  ChevronDown,
  CheckCircle,
  Sliders,
  Image as ImageIcon,
  Sparkles,
  MessageSquare,
  Plus,
  Bell,
  RefreshCw,
  Mail,
  HelpCircle,
  Eye,
  Gamepad2,
  Swords,
  Database,
  Download,
  Play,
  Pause,
  Volume2,
} from "lucide-react";

interface UserData {
  id: string;
  email: string;
  displayName: string;
  role: string;
  points: number;
  classId?: string;
}

interface Classroom {
  id: string;
  name: string;
}

export function AdminDashboard() {
  const { role, profile, setView } = useAppContext();
  const [users, setUsers] = useState<UserData[]>([]);
  const [classes, setClasses] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "users" | "classes" | "nocode" | "gamedev" | "export"
  >("nocode");

  // Admin Background Music Preview
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isAdminPreviewPlaying, setIsAdminPreviewPlaying] = useState(false);

  // Admin Study Music Preview
  const studyPreviewAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isStudyPreviewPlaying, setIsStudyPreviewPlaying] = useState(false);

  // Admin Boss Music Preview
  const bossPreviewAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isBossPreviewPlaying, setIsBossPreviewPlaying] = useState(false);

  useEffect(() => {
    // Stop and clean up previews on unmount
    return () => {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
        previewAudioRef.current = null;
      }
      if (studyPreviewAudioRef.current) {
        studyPreviewAudioRef.current.pause();
        studyPreviewAudioRef.current = null;
      }
      if (bossPreviewAudioRef.current) {
        bossPreviewAudioRef.current.pause();
        bossPreviewAudioRef.current = null;
      }
    };
  }, []);

  // Export database states
  const [exportStats, setExportStats] = useState<Record<string, { count: number; status: "idle" | "loading" | "loaded" | "error"; error?: string }>>({
    classes: { count: 0, status: "idle" },
    config: { count: 0, status: "idle" },
    footnote_pages: { count: 0, status: "idle" },
    lessons: { count: 0, status: "idle" },
    nocode_revisions: { count: 0, status: "idle" },
    users: { count: 0, status: "idle" },
  });
  const [exportLoading, setExportLoading] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStatusText, setExportStatusText] = useState("");
  const [exportedPreview, setExportedPreview] = useState<any>(null);

  const [newClassName, setNewClassName] = useState("");

  // No-Code Editor Settings
  const [noCodeConfig, setNoCodeConfig] = useState<NoCodeConfig>(() =>
    getLocalNoCodeConfig(),
  );
  const [activePageId, setActivePageId] = useState<string>("home");
  const [previewDevice, setPreviewDevice] = useState<
    "pc" | "tablet" | "mobile"
  >("pc");
  const [editorSubTab, setEditorSubTab] = useState<
    "pages" | "blocks" | "styling" | "images" | "menu" | "sounds" | "history" | "roles"
  >("pages");
  const [appearanceScope, setAppearanceScope] = useState<"global" | "local">(
    "global",
  );

  const handleToggleAdminPreview = () => {
    const bgUrl = noCodeConfig.systemSettings?.audioSettings?.bgMusicUrl;
    if (!bgUrl) {
      alert("Chưa cấu hình liên kết nhạc nền để nghe thử!");
      return;
    }

    if (isAdminPreviewPlaying) {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
      setIsAdminPreviewPlaying(false);
    } else {
      // Create new audio or update existing src
      if (!previewAudioRef.current) {
        previewAudioRef.current = new Audio(bgUrl);
      } else if (previewAudioRef.current.src !== bgUrl) {
        previewAudioRef.current.src = bgUrl;
      }

      const audio = previewAudioRef.current;
      const volume = noCodeConfig.systemSettings?.audioSettings?.bgMusicVolume ?? 20;
      audio.volume = Math.max(0, Math.min(1, volume / 100));
      audio.loop = noCodeConfig.systemSettings?.audioSettings?.bgMusicLoop ?? true;

      audio.play()
        .then(() => {
          setIsAdminPreviewPlaying(true);
        })
        .catch(err => {
          console.error("Lỗi phát thử nhạc nền:", err);
          alert("Không thể phát nhạc nền nghe thử. Vui lòng kiểm tra lại liên kết nhạc!");
        });

      audio.onended = () => {
        setIsAdminPreviewPlaying(false);
      };
    }
  };

  const handleToggleStudyPreview = () => {
    const studyUrl = noCodeConfig.systemSettings?.audioSettings?.studyMusicUrl;
    if (!studyUrl) {
      alert("Chưa cấu hình liên kết nhạc học tập để nghe thử!");
      return;
    }

    if (isStudyPreviewPlaying) {
      if (studyPreviewAudioRef.current) {
        studyPreviewAudioRef.current.pause();
      }
      setIsStudyPreviewPlaying(false);
    } else {
      // Create new audio or update existing src
      if (!studyPreviewAudioRef.current) {
        studyPreviewAudioRef.current = new Audio(studyUrl);
      } else if (studyPreviewAudioRef.current.src !== studyUrl) {
        studyPreviewAudioRef.current.src = studyUrl;
      }

      const audio = studyPreviewAudioRef.current;
      const volume = noCodeConfig.systemSettings?.audioSettings?.studyMusicVolume ?? 20;
      audio.volume = Math.max(0, Math.min(1, volume / 100));
      audio.loop = noCodeConfig.systemSettings?.audioSettings?.studyMusicLoop ?? true;

      audio.play()
        .then(() => {
          setIsStudyPreviewPlaying(true);
        })
        .catch(err => {
          console.error("Lỗi phát thử nhạc học tập:", err);
          alert("Không thể phát nhạc học tập nghe thử. Vui lòng kiểm tra lại liên kết nhạc!");
        });

      audio.onended = () => {
        setIsStudyPreviewPlaying(false);
      };
    }
  };

  // Sync volume of preview player in real-time when the slider is dragged
  useEffect(() => {
    if (previewAudioRef.current) {
      const volume = noCodeConfig.systemSettings?.audioSettings?.bgMusicVolume ?? 20;
      previewAudioRef.current.volume = Math.max(0, Math.min(1, volume / 100));
    }
  }, [noCodeConfig.systemSettings?.audioSettings?.bgMusicVolume]);

  // Sync volume of study preview player in real-time when the slider is dragged
  useEffect(() => {
    if (studyPreviewAudioRef.current) {
      const volume = noCodeConfig.systemSettings?.audioSettings?.studyMusicVolume ?? 20;
      studyPreviewAudioRef.current.volume = Math.max(0, Math.min(1, volume / 100));
    }
  }, [noCodeConfig.systemSettings?.audioSettings?.studyMusicVolume]);

  const handleToggleBossPreview = () => {
    const bossUrl = noCodeConfig.systemSettings?.audioSettings?.bossMusicUrl;
    if (!bossUrl) {
      alert("Chưa cấu hình liên kết nhạc đánh boss để nghe thử!");
      return;
    }

    if (isBossPreviewPlaying) {
      if (bossPreviewAudioRef.current) {
        bossPreviewAudioRef.current.pause();
      }
      setIsBossPreviewPlaying(false);
    } else {
      // Create new audio or update existing src
      if (!bossPreviewAudioRef.current) {
        bossPreviewAudioRef.current = new Audio(bossUrl);
      } else if (bossPreviewAudioRef.current.src !== bossUrl) {
        bossPreviewAudioRef.current.src = bossUrl;
      }

      const audio = bossPreviewAudioRef.current;
      const volume = noCodeConfig.systemSettings?.audioSettings?.bossMusicVolume ?? 30;
      audio.volume = Math.max(0, Math.min(1, volume / 100));
      audio.loop = noCodeConfig.systemSettings?.audioSettings?.bossMusicLoop ?? true;

      audio.play()
        .then(() => {
          setIsBossPreviewPlaying(true);
        })
        .catch(err => {
          console.error("Lỗi phát thử nhạc đánh boss:", err);
          alert("Không thể phát nhạc đánh boss nghe thử. Vui lòng kiểm tra lại liên kết nhạc!");
        });

      audio.onended = () => {
        setIsBossPreviewPlaying(false);
      };
    }
  };

  // Sync volume of boss preview player in real-time when the slider is dragged
  useEffect(() => {
    if (bossPreviewAudioRef.current) {
      const volume = noCodeConfig.systemSettings?.audioSettings?.bossMusicVolume ?? 30;
      bossPreviewAudioRef.current.volume = Math.max(0, Math.min(1, volume / 100));
    }
  }, [noCodeConfig.systemSettings?.audioSettings?.bossMusicVolume]);

  // Revision History
  const [revisions, setRevisions] = useState<RevisionHistory[]>(() =>
    getLocalRevisionHistories(),
  );
  const [selectedRevisionId, setSelectedRevisionId] = useState<string | null>(
    null,
  );

  // New Page creation
  const [newPageName, setNewPageName] = useState("");
  const [newPageAlias, setNewPageAlias] = useState("");
  const [newPageAddToMenu, setNewPageAddToMenu] = useState(false);
  const [newPageAddToFooterCol, setNewPageAddToFooterCol] = useState("none");
  const [newPageNewFooterHeading, setNewPageNewFooterHeading] = useState("");

  // Image Cropping simulation state
  const [selectedImageBlockId, setSelectedImageBlockId] = useState<
    string | null
  >(null);
  const [cropZoom, setCropZoom] = useState<number>(100);
  const [cropRotation, setCropRotation] = useState<number>(0);
  const [cropAspectRatio, setCropAspectRatio] = useState<string>("4:3");
  const [selectedGalleryPic, setSelectedGalleryPic] = useState<string>(
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=2022&auto=format&fit=crop",
  );

  // Logo specialized image crop state
  const [logoUploadSrc, setLogoUploadSrc] = useState<string | null>(null);
  const [logoCropZoom, setLogoCropZoom] = useState<number>(100);
  const [logoCropX, setLogoCropX] = useState<number>(0);
  const [logoCropY, setLogoCropY] = useState<number>(0);
  const [isDraggingLogo, setIsDraggingLogo] = useState(false);
  const [logoDragStart, setLogoDragStart] = useState({ pointerX: 0, pointerY: 0, offsetX: 0, offsetY: 0 });

  const [confirmModal, setConfirmModal] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const sampleGallery = [
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=2022&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2070&auto=format&fit=crop",
  ];

  const fetchData = async () => {
    try {
      setLoading(true);
      const userQ = query(collection(db, "users"));
      const classQ = query(collection(db, "classes"));

      const [userSnap, classSnap] = await Promise.all([
        getDocs(userQ),
        getDocs(classQ),
      ]);

      const fetchedUsers: UserData[] = [];
      userSnap.forEach((doc) => {
        const data = doc.data();
        fetchedUsers.push({
          id: doc.id,
          email: data.email,
          displayName: data.displayName || "",
          role: data.role,
          points: data.points || 0,
          classId: data.classId,
        });
      });
      setUsers(fetchedUsers);

      const fetchedClasses: Classroom[] = [];
      classSnap.forEach((doc) => {
        fetchedClasses.push({ id: doc.id, name: doc.data().name });
      });
      setClasses(fetchedClasses);

      // Fetch NoCode layout configuration to ensure synchronization with Firestore
      try {
        const dbConfig = await fetchNoCodeConfigDb();
        setNoCodeConfig(dbConfig);
      } catch (e) {
        console.warn("Lỗi tải cấu hình NoCode hành trình từ Firestore:", e);
      }
    } catch (err) {
      console.warn(
        "Firebase sync users err (using mock fallback where applicable):",
        err,
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role === "admin") {
      fetchData();
    }
  }, [role]);

  useEffect(() => {
    const handleAddFont = (e: any) => {
      const { name, url } = e.detail;
      setNoCodeConfig(prev => ({
        ...prev,
        appearance: {
          ...prev.appearance,
          customUploadedFonts: [
            ...(prev.appearance.customUploadedFonts || []),
            { name, url }
          ]
        }
      }));
    };

    const handleDuplicateBlock = (e: any) => {
      const { blockId } = e.detail;
      setNoCodeConfig(prev => {
        const updatedPages = prev.pages.map(p => {
          if (p.id === activePageId) {
            const idx = p.blocks.findIndex(b => b.id === blockId);
            if (idx === -1) return p;
            const sourceBlock = p.blocks[idx];
            const duplicatedBlock = {
              ...sourceBlock,
              id: `block_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
              title: sourceBlock.title ? `${sourceBlock.title} (Bản sao)` : undefined
            };
            const newBlocks = [...p.blocks];
            newBlocks.splice(idx + 1, 0, duplicatedBlock);
            return { ...p, blocks: newBlocks };
          }
          return p;
        });
        return { ...prev, pages: updatedPages };
      });
    };

    const handleAddBlockBelow = (e: any) => {
      const { index } = e.detail;
      setNoCodeConfig(prev => {
        const updatedPages = prev.pages.map(p => {
          if (p.id === activePageId) {
            const newBlock = {
              id: `block-${Date.now()}`,
              type: 'text' as const,
              title: "Khối văn bản mới",
              content: "Hãy kích hoạt thanh công cụ Canva-like phía trên để thỏa thích thay đổi kích thước, màu sắc chữ, phông chữ tải lên!",
              align: "left" as const,
              paddingY: 12,
            };
            const newBlocks = [...p.blocks];
            newBlocks.splice(index, 0, newBlock);
            return { ...p, blocks: newBlocks };
          }
          return p;
        });
        return { ...prev, pages: updatedPages };
      });
    };

    window.addEventListener('NCT_ADD_FONT', handleAddFont);
    window.addEventListener('NCT_DUPLICATE_BLOCK', handleDuplicateBlock);
    window.addEventListener('NCT_ADD_BLOCK_BELOW', handleAddBlockBelow);
    return () => {
      window.removeEventListener('NCT_ADD_FONT', handleAddFont);
      window.removeEventListener('NCT_DUPLICATE_BLOCK', handleDuplicateBlock);
      window.removeEventListener('NCT_ADD_BLOCK_BELOW', handleAddBlockBelow);
    };
  }, [activePageId]);

  // Helper to serialize complex Firestore structures (like Timestamps) to plain JSON
  const serializeFirestoreData = (obj: any): any => {
    if (obj === null || obj === undefined) return obj;

    if (typeof obj === "object") {
      // If it is a Firestore Timestamp with toDate function
      if (typeof obj.toDate === "function") {
        return obj.toDate().toISOString();
      }

      // Alternate system date signature checking
      if ("seconds" in obj && "nanoseconds" in obj && Object.keys(obj).length === 2) {
        try {
          return new Date(obj.seconds * 1000 + obj.nanoseconds / 1000000).toISOString();
        } catch (e) {
          // Ignore conversion error
        }
      }

      // If it is a Javascript Date
      if (obj instanceof Date) {
        return obj.toISOString();
      }

      // If it is an Array
      if (Array.isArray(obj)) {
        return obj.map((item) => serializeFirestoreData(item));
      }

      // If it is a generic object
      const serialized: any = {};
      for (const key of Object.keys(obj)) {
        serialized[key] = serializeFirestoreData(obj[key]);
      }
      return serialized;
    }

    return obj;
  };

  const fetchCollectionStats = async () => {
    const collectionsToExport = ["classes", "config", "footnote_pages", "lessons", "nocode_revisions", "users"];
    
    setExportStats(prev => {
      const copy = { ...prev };
      collectionsToExport.forEach(c => {
        copy[c] = { ...copy[c], status: "loading" };
      });
      return copy;
    });

    for (const collName of collectionsToExport) {
      try {
        const snap = await getDocs(collection(db, collName));
        setExportStats(prev => ({
          ...prev,
          [collName]: { count: snap.size, status: "loaded" }
        }));
      } catch (err) {
        console.error(`Fetch collections stats error for ${collName}:`, err);
        setExportStats(prev => ({
          ...prev,
          [collName]: { count: 0, status: "error", error: err instanceof Error ? err.message : String(err) }
        }));
      }
    }
  };

  useEffect(() => {
    if (activeTab === "export") {
      fetchCollectionStats();
    }
  }, [activeTab]);

  const handleExportDatabase = async () => {
    setExportLoading(true);
    setExportProgress(5);
    setExportStatusText("Khởi động kết nối dịch vụ Firestore...");
    
    const collectionsToExport = ["classes", "config", "footnote_pages", "lessons", "nocode_revisions", "users"];
    const exportedData: Record<string, any[]> = {};
    
    try {
      let step = 0;
      for (const collName of collectionsToExport) {
        step++;
        const percent = Math.floor(5 + (step / collectionsToExport.length) * 80);
        setExportProgress(percent);
        setExportStatusText(`Đang đồng bộ hóa tải dữ liệu từ collection "${collName}"...`);
        
        const qSnap = await getDocs(collection(db, collName));
        const items: any[] = [];
        qSnap.forEach(docSnap => {
          items.push({
            id: docSnap.id,
            ...docSnap.data()
          });
        });
        
        exportedData[collName] = serializeFirestoreData(items);
      }
      
      setExportProgress(90);
      setExportStatusText("Đang tạo và cấu trúc file JSON...");
      
      const jsonString = JSON.stringify(exportedData, null, 2);
      setExportedPreview(exportedData);
      
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "firestore-export.json";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setExportProgress(100);
      setExportStatusText("Hoàn tất tải xuống file 'firestore-export.json' thành công!");
    } catch (err) {
      console.error("Database export failed:", err);
      setExportStatusText(`Lỗi xuất dữ liệu: ${err instanceof Error ? err.message : String(err)}`);
      setExportProgress(0);
    } finally {
      setExportLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      await updateDoc(doc(db, "users", userId), { role: newRole });
      setUsers(
        users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`);
    }
  };

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;
    try {
      const classRef = doc(collection(db, "classes"));
      await setDoc(classRef, {
        name: newClassName.trim(),
        createdAt: new Date().toISOString(),
      });
      setClasses([...classes, { id: classRef.id, name: newClassName.trim() }]);
      setNewClassName("");
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, "classes");
    }
  };

  const assignUserToClass = async (
    userId: string,
    classId: string | undefined,
  ) => {
    try {
      await updateDoc(doc(db, "users", userId), { classId: classId || "" });
      setUsers(
        users.map((u) => (u.id === userId ? { ...u, classId: classId } : u)),
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    setConfirmModal({
      title: "Xóa tài khoản học sinh",
      message:
        "Bạn có chắc chắn muốn xóa tài khoản này? Học sinh sẽ phải tạo lại!",
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, "users", userId));
          setUsers(users.filter((u) => u.id !== userId));
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `users/${userId}`);
        }
      },
    });
  };

  const handleUpdateUserField = async (
    userId: string,
    field: "displayName" | "points",
    value: any,
  ) => {
    try {
      await updateDoc(doc(db, "users", userId), { [field]: value });
      setUsers(
        users.map((u) => (u.id === userId ? { ...u, [field]: value } : u)),
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`);
    }
  };

  // No-Code Layout modification handlers
  const activePage =
    noCodeConfig.pages.find((p) => p.id === activePageId) ||
    noCodeConfig.pages[0];

  const handleSaveNoCodeLayout = async (changeDesc: string) => {
    setLoading(true);
    setSaveStatus("Đang lưu trữ dữ liệu lên Cloud Firestore...");
    try {
      const currentAuthor = profile?.email || "admin@pilearn.com";
      await saveNoCodeConfigDb(noCodeConfig, currentAuthor, changeDesc);

      // Update local revision logs immediately
      const updatedRev: RevisionHistory = {
        id: `rev-${Date.now()}`,
        updatedBy: currentAuthor,
        updatedAt: new Date().toISOString(),
        changeDesc,
        savedPages: noCodeConfig.pages,
        savedAppearance: noCodeConfig.appearance,
      };
      setRevisions((prev) => [updatedRev, ...prev]);

      // Notify other components (like Navigation, Footer, NoCodeViewer) to reload config
      window.dispatchEvent(new Event("pilearn_config_sync"));

      setSaveStatus("🎉 Lưu và đồng bộ hóa thành công! Đã ghi log lịch sử.");
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (e) {
      setSaveStatus("❌ Thất bại lưu lên Firestore. Đã lưu Local Backup.");
      setTimeout(() => setSaveStatus(null), 3500);
    } finally {
      setLoading(false);
    }
  };

  // Blocks organizer
  const moveBlock = (blockId: string, direction: "up" | "down") => {
    const updatedPages = noCodeConfig.pages.map((p) => {
      if (p.id === activePageId) {
        const idx = p.blocks.findIndex((b) => b.id === blockId);
        if (idx === -1) return p;
        const targetIdx = direction === "up" ? idx - 1 : idx + 1;
        if (targetIdx < 0 || targetIdx >= p.blocks.length) return p;

        const newBlocks = [...p.blocks];
        const temp = newBlocks[idx];
        newBlocks[idx] = newBlocks[targetIdx];
        newBlocks[targetIdx] = temp;
        return { ...p, blocks: newBlocks };
      }
      return p;
    });

    setNoCodeConfig((prev) => ({ ...prev, pages: updatedPages }));
  };

  const deleteBlock = (blockId: string) => {
    setConfirmModal({
      title: "Xóa khối nội dung",
      message: "Bạn có chắc chắn muốn xóa khối hiển thị này khỏi trang?",
      onConfirm: () => {
        setNoCodeConfig((prev) => {
          const updatedPages = prev.pages.map((p) => {
            if (p.id === activePageId) {
              return { ...p, blocks: p.blocks.filter((b) => b.id !== blockId) };
            }
            return p;
          });
          return { ...prev, pages: updatedPages };
        });
      },
    });
  };

  const handleAddBlock = (type: NoCodeBlock["type"]) => {
    // Generate mock blocks by type
    const blockTemplates: Record<NoCodeBlock["type"], Partial<NoCodeBlock>> = {
      banner: {
        title: "Dòng tiêu đề Banner mượt mà",
        subtitle: "Phụ đề ngắn gọn, lôi cuốn bạn đọc.",
        buttonText: "Đăng ký ngay",
        imageUrl: sampleGallery[1],
      },
      text: {
        title: "Ví dụ tiêu đề văn bản",
        content:
          "Pilearn mang tới trình soạn thảo sinh động. Bạn có thể sử dụng markdown hoặc chữ thông thường.",
      },
      video: {
        title: "Tại sao nên học Python?",
        videoUrl: "https://youtube.com/embed/sample",
      },
      cta: {
        title: "Đăng Ký Học Thử Miễn Phí",
        subtitle: "Hơn 5000 học sinh đang thắp lửa học hàng ngày trên Pilearn.",
        buttonText: "Nhận Tài Khoản Free",
      },
      testimonial: {
        title: "Đánh Giá Học Viên",
        testimonials: [
          {
            name: "Trần Đăng Khoa",
            school: "Chuyên Hà Nội Amsterdam",
            avatar: sampleGallery[2],
            quote: "Trang web đẹp quá, em học Python không còn thấy chán!",
            rating: 5,
          },
        ],
      },
      ai: {
        title: "Hỏi chuyên gia AI Pilearn",
        subtitle:
          "Độ phản hồi cực kỳ chuẩn xác cho chương trình Tin học cấp 3.",
      },
      quiz: {
        title: "Bài trắc nghiệm logic",
        quizQuestions: [
          {
            prompt: "Giá trị của biểu thức 13 // 5 là?",
            options: ["2.6", "2", "3"],
            answer: 1,
          },
        ],
      },
      game: {
        title: "Chinh phục dòng Python",
        gameText: "a = 15\nb = 10\nprint(a _ b) # Điền dấu để in ra 5",
        gameExpectedAnswer: "-",
        gameHint: "Phép trừ biến số đơn giản.",
      },
      faq: {
        title: "FAQ học tập",
        faqItems: [
          {
            question: "Lớp học có giáo viên chấm tự động không?",
            answer:
              "Có, hệ thống IDE của Pilearn phân tích lỗi code bằng AI xịn sò.",
          },
        ],
      },
      pricing: {
        title: "Bảng giá linh động",
        pricingTiers: [
          {
            name: "Gói Trường Trung Học",
            price: "Liên hệ",
            period: "Năm",
            features: [
              "Quản trị lớp không giới hạn",
              "Dashboard học vụ toàn trường",
              "Hỗ trợ kỹ thuật 24/7",
            ],
            highlight: true,
          },
        ],
      },
      "html-rich-text": {
        title: "Văn bản tuỳ biến đa phông chữ",
        content: "Đây là nội dung.",
      },
    };

    const newBlock: NoCodeBlock = {
      id: `block-${Date.now()}`,
      type,
      ...blockTemplates[type],
      align: "left",
      paddingY: 12,
    };

    const updatedPages = noCodeConfig.pages.map((p) => {
      if (p.id === activePageId) {
        return { ...p, blocks: [...p.blocks, newBlock] };
      }
      return p;
    });

    setNoCodeConfig((prev) => ({ ...prev, pages: updatedPages }));
  };

  // Add Dynamic Menu Item
  const handleAddMenuItem = () => {
    const label = prompt("Nhập tên Menu mới:");
    if (!label) return;
    const viewAlias =
      prompt("Nhập View Alias (Vd: student-dashboard, roadmap, practice):") ||
      "home";

    setNoCodeConfig((prev) => ({
      ...prev,
      menus: [...prev.menus, { label, viewAlias, order: prev.menus.length }],
    }));
  };

  // Create Custom Page
  const handleCreatePage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageName || !newPageAlias) return;

    // Check conflict
    if (noCodeConfig.pages.find((p) => p.alias === newPageAlias)) {
      alert("Alias này đã tồn tại!");
      return;
    }

    const newPage: NoCodePage = {
      id: `page-${Date.now()}`,
      name: newPageName,
      alias: newPageAlias,
      isPublished: true,
      blocks: [
        {
          id: `block-init-${Date.now()}`,
          type: "banner",
          title: `Trang ${newPageName} Mới`,
          subtitle:
            "Hãy kích hoạt trình kéo thả để tùy biến nội dung đẹp mắt của bạn tại đây.",
          buttonText: "Tìm hiểu ngay",
          imageUrl: sampleGallery[3],
        },
      ],
    };

    setNoCodeConfig((prev) => {
      const updatedMenus = newPageAddToMenu
        ? [
            ...prev.menus,
            {
              label: newPageName,
              viewAlias: newPageAlias,
              order: prev.menus.length,
            },
          ]
        : prev.menus;

      let updatedFooter = [...(prev.systemSettings.footerColumns || [])];

      if (
        newPageAddToFooterCol === "new_heading" &&
        newPageNewFooterHeading.trim() !== ""
      ) {
        updatedFooter.push({
          id: `col-${Date.now()}`,
          title: newPageNewFooterHeading.trim(),
          links: [{ label: newPageName, viewAlias: newPageAlias }],
        });
      } else if (
        newPageAddToFooterCol !== "none" &&
        newPageAddToFooterCol !== "new_heading"
      ) {
        updatedFooter = updatedFooter.map((col) => {
          if (col.id === newPageAddToFooterCol) {
            return {
              ...col,
              links: [
                ...col.links,
                { label: newPageName, viewAlias: newPageAlias },
              ],
            };
          }
          return col;
        });
      }

      return {
        ...prev,
        pages: [...prev.pages, newPage],
        menus: updatedMenus,
        systemSettings: {
          ...prev.systemSettings,
          footerColumns: updatedFooter,
        },
      };
    });

    setActivePageId(newPage.id);
    setNewPageName("");
    setNewPageAlias("");
    setNewPageAddToMenu(false);
    setNewPageAddToFooterCol("none");
    setNewPageNewFooterHeading("");
  };

  const handleDuplicatePage = (pageId: string) => {
    const target = noCodeConfig.pages.find((p) => p.id === pageId);
    if (!target) return;

    const cloned: NoCodePage = {
      ...target,
      id: `page-clone-${Date.now()}`,
      name: `${target.name} (Bản sao)`,
      alias: `${target.alias}-copy`,
      isPublished: false,
    };

    setNoCodeConfig((prev) => ({
      ...prev,
      pages: [...prev.pages, cloned],
    }));
  };

  const handleDeletePage = (pageId: string) => {
    if (pageId === "home") {
      alert("Không thể xóa Trang chủ mặc định.");
      return;
    }
    setConfirmModal({
      title: "Xóa trang web",
      message:
        "Bạn có chắc chắn muốn xóa trang này cùng toàn bộ các khối nội dung bên trong nó?",
      onConfirm: () => {
        setNoCodeConfig((prev) => ({
          ...prev,
          pages: prev.pages.filter((p) => p.id !== pageId),
        }));
        setActivePageId("home");
      },
    });
  };

  // Image crop simulation save
  const handleApplyImageSettings = () => {
    if (!selectedImageBlockId) return;

    // Update active image block with selected pic and simulate crop scaling
    const updatedPages = noCodeConfig.pages.map((p) => {
      if (p.id === activePageId) {
        return {
          ...p,
          blocks: p.blocks.map((b) => {
            if (b.id === selectedImageBlockId) {
              return {
                ...b,
                imageUrl: selectedGalleryPic,
                content: `Zoom: ${cropZoom}%, Aspect: ${cropAspectRatio}, Rotation: ${cropRotation}°`,
              };
            }
            return b;
          }),
        };
      }
      return p;
    });

    setNoCodeConfig((prev) => ({ ...prev, pages: updatedPages }));
    alert("Đã áp dụng thông số và cắt xén ảnh mẫu!");
    setSelectedImageBlockId(null);
  };

  const restoreRevision = (rev: RevisionHistory) => {
    setConfirmModal({
      title: "Khôi phục lịch sử giao diện",
      message: `Bạn có chắc muốn khôi phục giao diện về trạng thái: "${rev.changeDesc}" vào lúc ${new Date(rev.updatedAt).toLocaleTimeString()}?`,
      onConfirm: () => {
        setNoCodeConfig((prev) => ({
          ...prev,
          pages: rev.savedPages,
          appearance: rev.savedAppearance,
        }));
        alert(
          'Khôi phục bản ghi lịch sử thành công! Vui lòng ấn "Lưu Lại Tất Cả" để áp dụng chính thức lên website.',
        );
      },
    });
  };

  if (role !== "admin" && role !== "super_admin") {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-red-600">Truy cập bị từ chối</h1>
        <p className="text-gray-500 mt-2">
          Bạn không có quyền quản trị tối cao để xem trang này.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 py-8">
      {/* HEADER RAIL */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200/60 pb-6 mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg text-white">
            <ShieldCheck className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              Hệ Thống Quản Trị No-Code Toàn Diện
              <span className="text-xs font-bold px-2 py-0.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-md">
                SUPER ADMIN
              </span>
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm font-medium">
              Lấy cảm hứng từ WordPress + Webflow + Notion: Thay đổi giao diện,
              khối kéo thả trực quan không chạm mã nguồn.
            </p>
          </div>
        </div>

        {/* TOP STATUS AND SAVING TRIGGERS */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setView("boss-battle")}
            className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-extrabold text-sm px-6 py-3 rounded-full flex items-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer"
          >
            <Swords size={16} />
            <span>THỬ CHIẾN ĐẤU BOSS</span>
          </button>

          <button
            onClick={() =>
              handleSaveNoCodeLayout("Lưu thay đổi từ Dashboard Quản Trị")
            }
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold text-sm px-6 py-3 rounded-full flex items-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            <span>LƯU LẠI TẤT CẢ (PUBLISH TO SITE)</span>
          </button>
        </div>
      </div>

      {saveStatus && (
        <div className="bg-amber-500 text-slate-900 font-extrabold p-3 text-center rounded-xl mb-6 text-sm flex items-center justify-center gap-2 animate-in slide-in-from-top-2">
          <Sparkles className="w-5 h-5 animate-spin" />
          <span>{saveStatus}</span>
        </div>
      )}

      {/* CORE NAVIGATION TABS */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 mb-8 bg-slate-50 p-1 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab("nocode")}
          className={`px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl flex items-center gap-2 transition ${activeTab === "nocode" ? "bg-white shadow-xs text-blue-600" : "text-slate-500 hover:text-slate-800"}`}
        >
          <Layout size={16} />
          <span>Thiết Kế No-Code Builder</span>
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl flex items-center gap-2 transition ${activeTab === "users" ? "bg-white shadow-xs text-blue-600" : "text-slate-500 hover:text-slate-800"}`}
        >
          <User size={16} />
          <span>Tài Khoản & Phân Quyền</span>
        </button>
        <button
          onClick={() => setActiveTab("classes")}
          className={`px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl flex items-center gap-2 transition ${activeTab === "classes" ? "bg-white shadow-xs text-blue-600" : "text-slate-500 hover:text-slate-800"}`}
        >
          <Sliders size={16} />
          <span>Gắn Lớp Kéo Thả</span>
        </button>
        <button
          onClick={() => setActiveTab("gamedev")}
          className={`px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl flex items-center gap-2 transition ${activeTab === "gamedev" ? "bg-white shadow-xs text-blue-600" : "text-slate-500 hover:text-slate-800"}`}
        >
          <Gamepad2 size={16} />
          <span>Phát Triển Game (Shop & Boss)</span>
        </button>
        <button
          onClick={() => setActiveTab("export")}
          className={`px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl flex items-center gap-2 transition ${activeTab === "export" ? "bg-white shadow-xs text-blue-600" : "text-slate-500 hover:text-slate-800"}`}
        >
          <Database size={16} />
          <span>Xuất Dữ Liệu (Export)</span>
        </button>
      </div>

      {/* ======================================= */}
      {/* 1. NO-CODE WEBSITE BUILDER TAB (CORE)    */}
      {/* ======================================= */}
      {activeTab === "nocode" && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          {/* LEFT CHROME SIDEBAR CONTROLS (5 Cols) */}
          <div className="xl:col-span-4 bg-white rounded-[32px] border border-slate-200/70 shadow-sm p-6 space-y-6">
            {/* SUB-TABS TO MANAGE SECTION CONTROLS */}
            <div className="grid grid-cols-6 gap-1.5 bg-slate-100 p-1 rounded-2xl text-[10px] font-bold text-center">
              <button
                onClick={() => setEditorSubTab("pages")}
                className={`py-2 rounded-xl transition ${editorSubTab === "pages" ? "bg-white text-blue-600 shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
              >
                Trang & Khối
              </button>
              <button
                onClick={() => setEditorSubTab("styling")}
                className={`py-2 rounded-xl transition ${editorSubTab === "styling" ? "bg-white text-blue-600 shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
              >
                Giao Diện
              </button>
              <button
                onClick={() => setEditorSubTab("images")}
                className={`py-2 rounded-xl transition ${editorSubTab === "images" ? "bg-white text-blue-600 shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
              >
                Ảnh
              </button>
              <button
                onClick={() => setEditorSubTab("menu")}
                className={`py-2 rounded-xl transition ${editorSubTab === "menu" ? "bg-white text-blue-600 shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
              >
                Logo & Menu
              </button>
              <button
                onClick={() => setEditorSubTab("sounds")}
                className={`py-2 rounded-xl transition ${editorSubTab === "sounds" ? "bg-white text-blue-600 shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
              >
                Âm Thanh
              </button>
              <button
                onClick={() => setEditorSubTab("history")}
                className={`py-2 rounded-xl transition ${editorSubTab === "history" ? "bg-white text-blue-600 shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
              >
                Lịch Sử
              </button>
            </div>

            {/* A. PAGES MANAGER */}
            {editorSubTab === "pages" && (
              <div className="space-y-6">
                {/* Logo Change Quick Banner */}
                <div 
                  onClick={() => setEditorSubTab("menu")}
                  className="p-3 bg-amber-50 dark:bg-amber-950/20 hover:bg-amber-100/50 dark:hover:bg-amber-950/30 border border-amber-200/50 dark:border-amber-900/30 rounded-2xl flex items-center justify-between cursor-pointer group transition-all duration-150"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">🎨</span>
                    <div className="text-left">
                      <p className="text-[10px] sm:text-xs font-bold text-amber-900 dark:text-amber-200">Bạn muốn đổi Logo thương hiệu?</p>
                      <p className="text-[9px] text-amber-700/80 dark:text-amber-400/80 font-normal">Kích thước 1:1, chỉnh hiển thị dạng tròn như Facebook.</p>
                    </div>
                  </div>
                  <span className="text-amber-500 font-bold text-xs group-hover:translate-x-1 transition-transform">→ THỬ NGAY</span>
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 border-b pb-2 mb-3 flex items-center justify-between">
                    <span>Danh Sách Trang Web</span>
                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-bold">
                      {noCodeConfig.pages.length} trang
                    </span>
                  </h3>

                  <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                    {noCodeConfig.pages.map((p) => (
                      <div key={p.id} className="group flex flex-col gap-1.5">
                        <div
                          onClick={() => setActivePageId(p.id)}
                          className={`p-3 rounded-2xl cursor-pointer flex items-center justify-between border transition ${
                            p.id === activePageId
                              ? "bg-blue-50/50 border-blue-400 text-blue-900 shadow-sm"
                              : "border-slate-100 hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <CheckCircle
                              size={14}
                              className={
                                p.isPublished
                                  ? "text-green-500"
                                  : "text-slate-350"
                              }
                            />
                            <span className="font-bold text-xs">{p.name}</span>
                            <span className="text-[10px] font-mono opacity-60">
                              ({p.alias})
                            </span>
                          </div>

                          <div
                            className="flex items-center gap-1.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => handleDuplicatePage(p.id)}
                              className="p-1 hover:bg-slate-200 rounded text-slate-600"
                              title="Nhân bản trang"
                            >
                              <Copy size={12} />
                            </button>
                            <button
                              onClick={() => handleDeletePage(p.id)}
                              className="p-1 hover:bg-slate-200 text-red-500 rounded"
                              title="Xóa trang"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>

                        {p.id === activePageId && (
                          <div className="ml-6 pl-4 border-l-2 border-dashed border-blue-200 space-y-2 mt-1 mb-3 relative">
                            <span className="absolute -left-1.5 top-2 w-3 h-0 border-t-2 border-dashed border-blue-200"></span>
                            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1 mb-2">
                              Cấu trúc khối ({p.blocks.length})
                            </h4>

                            <div className="space-y-1.5">
                              {p.blocks.map((b, bIdx) => (
                                <div
                                  key={b.id}
                                  className="p-2 bg-white border border-slate-100 rounded-xl flex items-center justify-between text-xs hover:border-blue-300 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition"
                                >
                                  <div className="flex items-center gap-2 truncate pr-2">
                                    <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-black uppercase shrink-0">
                                      {b.type}
                                    </span>
                                    <span className="truncate text-[10px] font-semibold text-slate-700">
                                      {b.title || "Block không tên"}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      onClick={() => moveBlock(b.id, "up")}
                                      disabled={bIdx === 0}
                                      className="w-5 h-5 flex items-center justify-center hover:bg-slate-200 rounded disabled:opacity-20 text-[10px]"
                                    >
                                      ▲
                                    </button>
                                    <button
                                      onClick={() => moveBlock(b.id, "down")}
                                      disabled={bIdx === p.blocks.length - 1}
                                      className="w-5 h-5 flex items-center justify-center hover:bg-slate-200 rounded disabled:opacity-20 text-[10px]"
                                    >
                                      ▼
                                    </button>
                                    <button
                                      onClick={() => deleteBlock(b.id)}
                                      className="w-5 h-5 flex items-center justify-center hover:bg-red-50 text-red-500 rounded text-[10px]"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 mt-2">
                              <button
                                onClick={() => handleAddBlock("banner")}
                                className="py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-[9px] font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                              >
                                + Hero / Banner
                              </button>
                              <button
                                onClick={() => handleAddBlock("text")}
                                className="py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-[9px] font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                              >
                                + Bài viết
                              </button>
                              <button
                                onClick={() => handleAddBlock("html-rich-text")}
                                className="py-1.5 px-2 bg-green-50 border border-green-200 rounded-lg text-[9px] font-bold text-green-600 hover:bg-green-100 transition shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                              >
                                + Văn bản đa phông chữ
                              </button>
                              <button
                                onClick={() => handleAddBlock("testimonial")}
                                className="py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-[9px] font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                              >
                                + Đánh giá
                              </button>
                              <button
                                onClick={() => handleAddBlock("faq")}
                                className="py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-[9px] font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                              >
                                + FAQ
                              </button>
                              <button
                                onClick={() => handleAddBlock("pricing")}
                                className="py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-[9px] font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                              >
                                + Giá cả
                              </button>
                              <button
                                onClick={() => handleAddBlock("cta")}
                                className="py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-[9px] font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                              >
                                + Liên hệ / CTA
                              </button>
                              <button
                                onClick={() => handleAddBlock("video")}
                                className="py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-[9px] font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                              >
                                + Video Youtube
                              </button>
                              <button
                                onClick={() => handleAddBlock("ai")}
                                className="py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-[9px] font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                              >
                                + Trợ lý AI
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* CREATE NEW PAGE FORM */}
                <form
                  onSubmit={handleCreatePage}
                  className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3.5"
                >
                  <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider">
                    Tạo trang mẫu mới
                  </h4>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">
                      Tên trang (Tiếng Việt)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Trang Liên Hệ"
                      value={newPageName}
                      onChange={(e) => setNewPageName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">
                      Alias đường dẫn (slug)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: contact"
                      value={newPageAlias}
                      onChange={(e) => setNewPageAlias(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1.5 mt-2 p-2 bg-white rounded border border-slate-200">
                    <label className="flex items-center gap-1.5 text-[10px] text-slate-700 font-bold mb-2">
                      Liên kết tự động
                    </label>
                    <label className="flex items-center gap-1.5 text-[10px]">
                      <input
                        type="checkbox"
                        checked={newPageAddToMenu}
                        onChange={(e) => setNewPageAddToMenu(e.target.checked)}
                      />
                      Thêm vào thanh menu điều hướng
                    </label>
                    <div className="flex flex-col gap-1.5 mt-1">
                      <div className="flex items-center gap-1.5 text-[10px]">
                        <span>Thêm vào Footer (Footnote):</span>
                        <select
                          value={newPageAddToFooterCol}
                          onChange={(e) =>
                            setNewPageAddToFooterCol(e.target.value)
                          }
                          className="bg-slate-100 border rounded py-0.5 px-1 ml-1 flex-1 min-w-[120px]"
                        >
                          <option value="none">Không thêm</option>
                          <option value="new_heading">
                            + Thêm Heading Mới...
                          </option>
                          {noCodeConfig.systemSettings.footerColumns?.map(
                            (col) => (
                              <option key={col.id} value={col.id}>
                                {col.title}
                              </option>
                            ),
                          )}
                        </select>
                      </div>
                      {newPageAddToFooterCol === "new_heading" && (
                        <input
                          type="text"
                          required
                          placeholder="Tên Heading mới (v.d: Hỗ trợ, Học tập...)"
                          value={newPageNewFooterHeading}
                          onChange={(e) =>
                            setNewPageNewFooterHeading(e.target.value)
                          }
                          className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-[10px]"
                        />
                      )}
                    </div>
                  </div>

                  <button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer">
                    <Plus size={12} />
                    <span>Thêm Trang Ngay</span>
                  </button>
                </form>

                {/* FOOTER EDITOR (Moved from Menu tab) */}
                <div className="pt-4 border-t border-slate-200 mt-6">
                  <h3 className="font-extrabold text-slate-900 border-b pb-2 mb-3 flex items-center justify-between text-xs">
                    <span>Cấu Hình Footnote (Danh Sách Trang)</span>
                    <button
                      onClick={() => {
                        setNoCodeConfig((prev) => ({
                          ...prev,
                          systemSettings: {
                            ...prev.systemSettings,
                            footerColumns: [
                              ...(prev.systemSettings.footerColumns || []),
                              {
                                id: `col-${Date.now()}`,
                                title: "Cột mới",
                                links: [],
                              },
                            ],
                          },
                        }));
                      }}
                      className="text-blue-500 hover:text-blue-700 font-bold flex items-center gap-0.5"
                    >
                      + Thêm Cột
                    </button>
                  </h3>

                  <div className="space-y-4 max-h-[300px] overflow-y-auto">
                    {noCodeConfig.systemSettings.footerColumns?.map(
                      (col, colIdx) => (
                        <div
                          key={col.id}
                          className="p-3 bg-slate-50 border rounded-xl"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <input
                              type="text"
                              value={col.title}
                              placeholder="Headline cột..."
                              onChange={(e) =>
                                setNoCodeConfig((prev) => {
                                  const fCols = prev.systemSettings
                                    .footerColumns
                                    ? [...prev.systemSettings.footerColumns]
                                    : [];
                                  fCols[colIdx] = {
                                    ...fCols[colIdx],
                                    title: e.target.value,
                                  };
                                  return {
                                    ...prev,
                                    systemSettings: {
                                      ...prev.systemSettings,
                                      footerColumns: fCols,
                                    },
                                  };
                                })
                              }
                              className="font-black bg-white border rounded px-2 py-1 text-xs"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  const alias = prompt(
                                    "Nhập alias hoặc link URL:",
                                  );
                                  if (!alias) return;
                                  const label =
                                    prompt("Nhập tên hiển thị khoản mục:") ||
                                    "Mục mới";
                                  setNoCodeConfig((prev) => {
                                    const fCols = prev.systemSettings
                                      .footerColumns
                                      ? [...prev.systemSettings.footerColumns]
                                      : [];
                                    const newLinks = [
                                      ...fCols[colIdx].links,
                                      {
                                        label,
                                        viewAlias: alias.startsWith("http")
                                          ? ""
                                          : alias,
                                        url: alias.startsWith("http")
                                          ? alias
                                          : "",
                                      },
                                    ];
                                    fCols[colIdx] = {
                                      ...fCols[colIdx],
                                      links: newLinks,
                                    };
                                    return {
                                      ...prev,
                                      systemSettings: {
                                        ...prev.systemSettings,
                                        footerColumns: fCols,
                                      },
                                    };
                                  });
                                }}
                                className="text-[10px] text-blue-500 font-bold"
                              >
                                + Thêm link
                              </button>
                              <button
                                onClick={() =>
                                  setNoCodeConfig((prev) => {
                                    const fCols = prev.systemSettings
                                      .footerColumns
                                      ? [...prev.systemSettings.footerColumns]
                                      : [];
                                    fCols.splice(colIdx, 1);
                                    return {
                                      ...prev,
                                      systemSettings: {
                                        ...prev.systemSettings,
                                        footerColumns: fCols,
                                      },
                                    };
                                  })
                                }
                                className="text-red-500 font-bold ml-2"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                          <div className="space-y-1.5 pl-2 border-l-2 border-slate-200">
                            {col.links.map((link, linkIdx) => (
                              <div
                                key={linkIdx}
                                className="flex justify-between items-center text-[10px] bg-white border rounded p-1.5"
                              >
                                <input
                                  title="Label"
                                  className="w-24 bg-transparent outline-none font-bold"
                                  value={link.label}
                                  onChange={(e) =>
                                    setNoCodeConfig((prev) => {
                                      const fCols = prev.systemSettings
                                        .footerColumns
                                        ? [...prev.systemSettings.footerColumns]
                                        : [];
                                      const newLinks = [...fCols[colIdx].links];
                                      newLinks[linkIdx] = {
                                        ...newLinks[linkIdx],
                                        label: e.target.value,
                                      };
                                      fCols[colIdx] = {
                                        ...fCols[colIdx],
                                        links: newLinks,
                                      };
                                      return {
                                        ...prev,
                                        systemSettings: {
                                          ...prev.systemSettings,
                                          footerColumns: fCols,
                                        },
                                      };
                                    })
                                  }
                                />
                                <span
                                  className="text-slate-400 font-mono truncate px-1 max-w-[80px]"
                                  title={link.viewAlias || link.url}
                                >
                                  {link.viewAlias || link.url}
                                </span>
                                <div className="flex gap-1">
                                  <button
                                    onClick={() =>
                                      setNoCodeConfig((prev) => {
                                        if (linkIdx === 0) return prev;
                                        const fCols = prev.systemSettings
                                          .footerColumns
                                          ? [
                                              ...prev.systemSettings
                                                .footerColumns,
                                            ]
                                          : [];
                                        const newLinks = [
                                          ...fCols[colIdx].links,
                                        ];
                                        const tmp = newLinks[linkIdx - 1];
                                        newLinks[linkIdx - 1] =
                                          newLinks[linkIdx];
                                        newLinks[linkIdx] = tmp;
                                        fCols[colIdx] = {
                                          ...fCols[colIdx],
                                          links: newLinks,
                                        };
                                        return {
                                          ...prev,
                                          systemSettings: {
                                            ...prev.systemSettings,
                                            footerColumns: fCols,
                                          },
                                        };
                                      })
                                    }
                                    className="flex items-center justify-center w-5 h-5 text-slate-400 hover:text-black"
                                  >
                                    ▲
                                  </button>
                                  <button
                                    onClick={() =>
                                      setNoCodeConfig((prev) => {
                                        if (linkIdx === col.links.length - 1)
                                          return prev;
                                        const fCols = prev.systemSettings
                                          .footerColumns
                                          ? [
                                              ...prev.systemSettings
                                                .footerColumns,
                                            ]
                                          : [];
                                        const newLinks = [
                                          ...fCols[colIdx].links,
                                        ];
                                        const tmp = newLinks[linkIdx + 1];
                                        newLinks[linkIdx + 1] =
                                          newLinks[linkIdx];
                                        newLinks[linkIdx] = tmp;
                                        fCols[colIdx] = {
                                          ...fCols[colIdx],
                                          links: newLinks,
                                        };
                                        return {
                                          ...prev,
                                          systemSettings: {
                                            ...prev.systemSettings,
                                            footerColumns: fCols,
                                          },
                                        };
                                      })
                                    }
                                    className="flex items-center justify-center w-5 h-5 text-slate-400 hover:text-black"
                                  >
                                    ▼
                                  </button>
                                  <button
                                    onClick={() =>
                                      setNoCodeConfig((prev) => {
                                        const fCols = prev.systemSettings
                                          .footerColumns
                                          ? [
                                              ...prev.systemSettings
                                                .footerColumns,
                                            ]
                                          : [];
                                        const newLinks = [
                                          ...fCols[colIdx].links,
                                        ];
                                        newLinks.splice(linkIdx, 1);
                                        fCols[colIdx] = {
                                          ...fCols[colIdx],
                                          links: newLinks,
                                        };
                                        return {
                                          ...prev,
                                          systemSettings: {
                                            ...prev.systemSettings,
                                            footerColumns: fCols,
                                          },
                                        };
                                      })
                                    }
                                    className="flex items-center justify-center w-5 h-5 text-red-500 hover:bg-red-50 rounded ml-1"
                                  >
                                    ✕
                                  </button>
                                </div>
                              </div>
                            ))}
                            {col.links.length === 0 && (
                              <span className="text-[10px] text-slate-400">
                                Chưa có link nào.
                              </span>
                            )}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
                {/* WEBSITE INTRO EDITOR *}
            <div className="pt-4 border-t border-slate-250 mt-6 text-left">
              <h3 className="font-extrabold text-slate-900 pb-1.5 mb-2 flex items-center justify-between text-[11px] uppercase tracking-wider text-slate-500">
                <span>Mô Tả Giới Thiệu Chân Trang</span>
              </h3>
              <textarea
                rows={2}
                value={noCodeConfig.systemSettings.aboutText || ''}
                onChange={(e) => setNoCodeConfig(prev => ({
                   ...prev,
                   systemSettings: { ...prev.systemSettings, aboutText: e.target.value }
                }))}
                placeholder="Ví dụ: Nền tảng học lập trình thân thiện, vui nhộn và vô cùng hiệu quả dành cho mọi lứa tuổi học sinh THPT, đồng hành bởi trợ lý AI siêu cấp."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* SOCIAL MEDIA CONNECTIONS MANAGER */}
                <div className="pt-4 border-t border-slate-200 mt-6 text-left">
                  <h3 className="font-extrabold text-slate-900 pb-2 mb-3 flex items-center justify-between text-xs">
                    <span>Quản Lý Mạng Xã Hội (Footnote Icon)</span>
                    <button
                      type="button"
                      onClick={() =>
                        setNoCodeConfig((prev) => {
                          const sLinks = prev.systemSettings.socialLinks
                            ? [...prev.systemSettings.socialLinks]
                            : [];
                          return {
                            ...prev,
                            systemSettings: {
                              ...prev.systemSettings,
                              socialLinks: [
                                ...sLinks,
                                {
                                  id: `social-${Date.now()}`,
                                  platform: "facebook",
                                  url: "https://facebook.com/pilearn",
                                  label: "",
                                },
                              ],
                            },
                          };
                        })
                      }
                      className="text-blue-500 hover:text-blue-700 font-bold flex items-center gap-0.5"
                    >
                      + Thêm Mới
                    </button>
                  </h3>

                  <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                    {(noCodeConfig.systemSettings.socialLinks || []).map(
                      (link, linkIdx) => (
                        <div
                          key={link.id || linkIdx}
                          className="p-3 bg-white border border-slate-200 rounded-xl space-y-2 text-xs relative shadow-[0_2px_8px_rgba(0,0,0,0.02)] border-l-4 border-l-blue-500"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sidebar-divider pb-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-bold text-slate-400">
                                Nền tảng:
                              </span>
                              <select
                                value={link.platform}
                                onChange={(e) =>
                                  setNoCodeConfig((prev) => {
                                    const sLinks = prev.systemSettings
                                      .socialLinks
                                      ? [...prev.systemSettings.socialLinks]
                                      : [];
                                    sLinks[linkIdx] = {
                                      ...sLinks[linkIdx],
                                      platform: e.target.value as any,
                                    };
                                    return {
                                      ...prev,
                                      systemSettings: {
                                        ...prev.systemSettings,
                                        socialLinks: sLinks,
                                      },
                                    };
                                  })
                                }
                                className="bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-[10px] font-bold text-slate-700"
                              >
                                <option value="facebook">Facebook</option>
                                <option value="twitter">X / Twitter</option>
                                <option value="youtube">YouTube</option>
                                <option value="instagram">Instagram</option>
                                <option value="github">GitHub</option>
                                <option value="tiktok">TikTok</option>
                                <option value="custom">
                                  Tuỳ chỉnh (Custom Text)
                                </option>
                              </select>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-auto">
                              <button
                                type="button"
                                onClick={() => {
                                  setNoCodeConfig((prev) => {
                                    const sLinks = prev.systemSettings
                                      .socialLinks
                                      ? [...prev.systemSettings.socialLinks]
                                      : [];
                                    if (sLinks[linkIdx].platform === "custom") {
                                      sLinks[linkIdx] = {
                                        ...sLinks[linkIdx],
                                        platform: "facebook",
                                        label: "",
                                      };
                                    } else {
                                      sLinks[linkIdx] = {
                                        ...sLinks[linkIdx],
                                        platform: "custom",
                                        label: "Mạng xã hội",
                                      };
                                    }
                                    return {
                                      ...prev,
                                      systemSettings: {
                                        ...prev.systemSettings,
                                        socialLinks: sLinks,
                                      },
                                    };
                                  });
                                }}
                                className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded transition ${
                                  link.platform === "custom"
                                    ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                              >
                                {link.platform === "custom"
                                  ? "Hiện Icon"
                                  : "✕ Xoá Icon"}
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  setNoCodeConfig((prev) => {
                                    const sLinks = prev.systemSettings
                                      .socialLinks
                                      ? [...prev.systemSettings.socialLinks]
                                      : [];
                                    sLinks.splice(linkIdx, 1);
                                    return {
                                      ...prev,
                                      systemSettings: {
                                        ...prev.systemSettings,
                                        socialLinks: sLinks,
                                      },
                                    };
                                  })
                                }
                                className="text-red-500 hover:bg-red-50 px-1.5 py-0.5 rounded text-[10px] font-black"
                              >
                                Xoá
                              </button>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 block">
                              Đường dẫn liên kết (URL):
                            </label>
                            <input
                              type="text"
                              value={link.url}
                              placeholder="https://..."
                              onChange={(e) =>
                                setNoCodeConfig((prev) => {
                                  const sLinks = prev.systemSettings.socialLinks
                                    ? [...prev.systemSettings.socialLinks]
                                    : [];
                                  sLinks[linkIdx] = {
                                    ...sLinks[linkIdx],
                                    url: e.target.value,
                                  };
                                  return {
                                    ...prev,
                                    systemSettings: {
                                      ...prev.systemSettings,
                                      socialLinks: sLinks,
                                    },
                                  };
                                })
                              }
                              className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[11px] font-mono"
                            />
                          </div>

                          {link.platform === "custom" && (
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 block">
                                Tên hiển thị nhãn (Thế chỗ Icon):
                              </label>
                              <input
                                type="text"
                                value={link.label || ""}
                                placeholder="Ví dụ: Zalo, Viber, Website..."
                                onChange={(e) =>
                                  setNoCodeConfig((prev) => {
                                    const sLinks = prev.systemSettings
                                      .socialLinks
                                      ? [...prev.systemSettings.socialLinks]
                                      : [];
                                    sLinks[linkIdx] = {
                                      ...sLinks[linkIdx],
                                      label: e.target.value,
                                    };
                                    return {
                                      ...prev,
                                      systemSettings: {
                                        ...prev.systemSettings,
                                        socialLinks: sLinks,
                                      },
                                    };
                                  })
                                }
                                className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[11px]"
                              />
                            </div>
                          )}
                        </div>
                      ),
                    )}
                    {(noCodeConfig.systemSettings.socialLinks || []).length ===
                      0 && (
                      <span className="text-[10px] text-slate-500 block text-center py-2 bg-slate-50 border border-dashed rounded-xl">
                        Chưa có liên kết mạng xã hội nào.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {editorSubTab === "styling" && (
              <div className="space-y-6 text-xs text-left">
                {/* Logo Change Quick Banner */}
                <div 
                  onClick={() => setEditorSubTab("menu")}
                  className="p-3 bg-amber-50 dark:bg-amber-950/20 hover:bg-amber-100/50 dark:hover:bg-amber-950/30 border border-amber-200/50 dark:border-amber-900/30 rounded-2xl flex items-center justify-between cursor-pointer group transition-all duration-150"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">🎨</span>
                    <div className="text-left">
                      <p className="text-[10px] sm:text-xs font-bold text-amber-900 dark:text-amber-200">Bạn muốn đổi Logo thương hiệu?</p>
                      <p className="text-[9px] text-amber-700/80 dark:text-amber-400/80 font-normal">Kích thước 1:1, chỉnh hiển thị dạng tròn như Facebook.</p>
                    </div>
                  </div>
                  <span className="text-amber-500 font-bold text-xs group-hover:translate-x-1 transition-transform">→ THỬ NGAY</span>
                </div>

                <div className="flex items-center justify-between border-b pb-2 mb-3">
                  <h3 className="font-extrabold text-slate-900">
                    Tùy Biến Giao Diện Không Cần CSS
                  </h3>
                  <div className="flex bg-slate-100 rounded-full p-0.5 border">
                    <button
                      onClick={() => setAppearanceScope("global")}
                      className={`px-2 py-1 rounded-full text-[10px] font-bold transition ${appearanceScope === "global" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                    >
                      Toàn Trang
                    </button>
                    <button
                      onClick={() => setAppearanceScope("local")}
                      className={`px-2 py-1 rounded-full text-[10px] font-bold transition ${appearanceScope === "local" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                    >
                      Riêng Trang {activePage?.alias}
                    </button>
                  </div>
                </div>

                {/* Brand Colors */}
                <div className="space-y-2">
                  <label className="font-bold text-slate-700 block text-[10px] uppercase">
                    Màu Sắc Thương Hiệu Chủ Đạo
                  </label>
                  <div className="flex gap-2">
                    {[
                      { hex: "#2563EB", label: "Xanh dương" },
                      { hex: "#059669", label: "Xanh lục" },
                      { hex: "#D97706", label: "Cam Amber" },
                      { hex: "#DC2626", label: "Đỏ tươi" },
                      { hex: "#7C3AED", label: "Tím mộng mơ" },
                    ].map((clr) => {
                      const activeColor =
                        appearanceScope === "local" &&
                        activePage?.appearance?.primaryColor
                          ? activePage.appearance.primaryColor
                          : noCodeConfig.appearance.primaryColor;
                      return (
                        <button
                          key={clr.hex}
                          onClick={() => {
                            if (appearanceScope === "global") {
                              setNoCodeConfig((prev) => ({
                                ...prev,
                                appearance: {
                                  ...prev.appearance,
                                  primaryColor: clr.hex,
                                },
                              }));
                            } else {
                              setNoCodeConfig((prev) => ({
                                ...prev,
                                pages: prev.pages.map((p) =>
                                  p.id === activePageId
                                    ? {
                                        ...p,
                                        appearance: {
                                          ...p.appearance,
                                          primaryColor: clr.hex,
                                        },
                                      }
                                    : p,
                                ),
                              }));
                            }
                          }}
                          className={`w-7 h-7 rounded-full border-2 transition ${activeColor === clr.hex ? "border-slate-850 scale-110 shadow-md" : "border-slate-200"}`}
                          style={{ backgroundColor: clr.hex }}
                          title={clr.label}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Typography font picker */}
                <div className="space-y-2 mb-2 p-3 bg-slate-50 rounded-xl border">
                  <label className="font-bold text-slate-700 block text-[10px] uppercase col-span-1 border-b border-slate-200 pb-1 mb-2">
                    Quản Lý Phông Chữ & Kích Thước (To Học Sinh Xem Rõ Hơn)
                  </label>
                  <div className="space-y-3">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 block mb-1">
                        Kiểu Phông Chữ
                      </span>
                      <div className="grid grid-cols-1 gap-2">
                        <select
                          value={
                            ["sans", "grotesk", "serif", "mono"].includes(
                              (appearanceScope === "local"
                                ? activePage?.appearance?.fontFamily
                                : noCodeConfig.appearance.fontFamily) || "sans",
                            )
                              ? (appearanceScope === "local"
                                  ? activePage?.appearance?.fontFamily
                                  : noCodeConfig.appearance.fontFamily) ||
                                "sans"
                              : "custom"
                          }
                          onChange={(e) => {
                            const v = e.target.value;
                            if (v !== "custom") {
                              if (appearanceScope === "global") {
                                setNoCodeConfig((prev) => ({
                                  ...prev,
                                  appearance: {
                                    ...prev.appearance,
                                    fontFamily: v,
                                    customFontUrl: "",
                                  },
                                }));
                              } else {
                                setNoCodeConfig((prev) => ({
                                  ...prev,
                                  pages: prev.pages.map((p) =>
                                    p.id === activePageId
                                      ? {
                                          ...p,
                                          appearance: {
                                            ...p.appearance,
                                            fontFamily: v,
                                            customFontUrl: "",
                                          },
                                        }
                                      : p,
                                  ),
                                }));
                              }
                            } else {
                              if (appearanceScope === "global") {
                                setNoCodeConfig((prev) => ({
                                  ...prev,
                                  appearance: {
                                    ...prev.appearance,
                                    fontFamily: "Roboto",
                                  },
                                }));
                              } else {
                                setNoCodeConfig((prev) => ({
                                  ...prev,
                                  pages: prev.pages.map((p) =>
                                    p.id === activePageId
                                      ? {
                                          ...p,
                                          appearance: {
                                            ...p.appearance,
                                            fontFamily: "Roboto",
                                          },
                                        }
                                      : p,
                                  ),
                                }));
                              }
                            }
                          }}
                          className="bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs w-full"
                        >
                          <option value="sans">
                            Inter (Trơn không chân, đa dạng)
                          </option>
                          <option value="grotesk">
                            Space Grotesk (Tech tối tân)
                          </option>
                          <option value="serif">
                            Playfair Display (Thiết kế cổ điển)
                          </option>
                          <option value="mono">
                            JetBrains Mono (Kỹ sư công nghệ)
                          </option>
                          <option value="custom">
                            -- Font tùy biến (Nhập tay) --
                          </option>
                        </select>

                        {!["sans", "grotesk", "serif", "mono"].includes(
                          (appearanceScope === "local"
                            ? activePage?.appearance?.fontFamily
                            : noCodeConfig.appearance.fontFamily) || "sans",
                        ) && (
                          <div className="grid grid-cols-2 gap-2 mt-1 p-2 bg-slate-100 rounded-lg border border-slate-200">
                            <div>
                              <label className="text-[9px] text-slate-500 font-bold block mb-0.5">
                                Tên Phông (Ví dụ: Roboto)
                              </label>
                              <input
                                type="text"
                                placeholder="Tên phông"
                                className="bg-white border border-slate-300 rounded px-2 py-1 text-[10px] w-full"
                                value={
                                  (appearanceScope === "local"
                                    ? activePage?.appearance?.fontFamily
                                    : noCodeConfig.appearance.fontFamily) || ""
                                }
                                onChange={(e) => {
                                  const v = e.target.value;
                                  if (appearanceScope === "global") {
                                    setNoCodeConfig((prev) => ({
                                      ...prev,
                                      appearance: {
                                        ...prev.appearance,
                                        fontFamily: v,
                                      },
                                    }));
                                  } else {
                                    setNoCodeConfig((prev) => ({
                                      ...prev,
                                      pages: prev.pages.map((p) =>
                                        p.id === activePageId
                                          ? {
                                              ...p,
                                              appearance: {
                                                ...p.appearance,
                                                fontFamily: v,
                                              },
                                            }
                                          : p,
                                      ),
                                    }));
                                  }
                                }}
                              />
                            </div>
                            <div>
                              <label className="text-[9px] text-slate-500 font-bold block mb-0.5">
                                URL @import (Google Fonts)
                              </label>
                              <input
                                type="text"
                                placeholder="https://fonts.googleapis.com/... "
                                className="bg-white border border-slate-300 rounded px-2 py-1 text-[10px] w-full"
                                title="Ví dụ: import css tag từ Google Fonts"
                                value={
                                  (appearanceScope === "local"
                                    ? activePage?.appearance?.customFontUrl
                                    : noCodeConfig.appearance.customFontUrl) ||
                                  ""
                                }
                                onChange={(e) => {
                                  const v = e.target.value;
                                  if (appearanceScope === "global") {
                                    setNoCodeConfig((prev) => ({
                                      ...prev,
                                      appearance: {
                                        ...prev.appearance,
                                        customFontUrl: v,
                                      },
                                    }));
                                  } else {
                                    setNoCodeConfig((prev) => ({
                                      ...prev,
                                      pages: prev.pages.map((p) =>
                                        p.id === activePageId
                                          ? {
                                              ...p,
                                              appearance: {
                                                ...p.appearance,
                                                customFontUrl: v,
                                              },
                                            }
                                          : p,
                                      ),
                                    }));
                                  }
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold text-slate-500 block">
                          Tương phản & Tỉ lệ (Zoom Size)
                        </span>
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">
                          {appearanceScope === "local"
                            ? activePage?.appearance?.fontScale || 100
                            : noCodeConfig.appearance.fontScale || 100}
                          %
                        </span>
                      </div>
                      <input
                        type="range"
                        min="80"
                        max="150"
                        step="5"
                        value={
                          appearanceScope === "local"
                            ? activePage?.appearance?.fontScale || 100
                            : noCodeConfig.appearance.fontScale || 100
                        }
                        onChange={(e) => {
                          const v = parseInt(e.target.value);
                          if (appearanceScope === "global") {
                            setNoCodeConfig((prev) => ({
                              ...prev,
                              appearance: { ...prev.appearance, fontScale: v },
                            }));
                          } else {
                            setNoCodeConfig((prev) => ({
                              ...prev,
                              pages: prev.pages.map((p) =>
                                p.id === activePageId
                                  ? {
                                      ...p,
                                      appearance: {
                                        ...p.appearance,
                                        fontScale: v,
                                      },
                                    }
                                  : p,
                              ),
                            }));
                          }
                        }}
                        className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        title="Tăng giảm kích thước hiển thị chữ trên trang. Chỉnh cao sẽ sinh ra font to dễ nhìn."
                      />
                    </div>
                  </div>
                </div>

                {/* Custom Font Uploader & Manager */}
                <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl relative">
                  <div className="flex items-center gap-1.5 border-b border-slate-250 pb-2">
                    <span className="text-sm">🎯</span>
                    <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-tight">
                      QUẢN LÝ PHÔNG CHỮ TẢI LÊN (TTF/OTF/WOFF)
                    </h4>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] text-slate-500 font-bold block mb-1">Tên Phông Chữ (Ví dụ: FlexyFont)</label>
                      <input 
                        type="text" 
                        id="new-font-name-input"
                        placeholder="Nhập tên phông chữ..."
                        className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs w-full focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    
                    <div>
                      <label className="text-[10px] text-slate-500 font-bold block mb-1">Chọn Tệp Phông Chữ (.ttf, .otf, .woff, .woff2)</label>
                      <input 
                        type="file" 
                        id="new-font-file-input"
                        accept=".ttf,.otf,.woff,.woff2"
                        className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs w-full cursor-pointer"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        audioService.playClick();
                        const nameInput = document.getElementById('new-font-name-input') as HTMLInputElement;
                        const fileInput = document.getElementById('new-font-file-input') as HTMLInputElement;
                        
                        const fontName = nameInput?.value?.trim();
                        const file = fileInput?.files?.[0];
                        
                        if (!fontName) {
                          alert("Vui lòng nhập tên phông chữ.");
                          return;
                        }
                        if (!file) {
                          alert("Vui lòng chọn một tệp phông chữ.");
                          return;
                        }
                        
                        if (file.size > 5 * 1024 * 1024) {
                          alert("Kích thước tệp vượt quá 5MB. Vui lòng thử tệp nhỏ hơn.");
                          return;
                        }

                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          if (ev.target?.result) {
                            setNoCodeConfig(prev => {
                              const list = prev.appearance.customUploadedFonts || [];
                              const cleanedList = list.filter(f => f.name !== fontName);
                              return {
                                ...prev,
                                appearance: {
                                  ...prev.appearance,
                                  customUploadedFonts: [
                                    ...cleanedList,
                                    { name: fontName, url: ev.target!.result as string }
                                  ]
                                }
                              };
                            });
                            audioService.playSuccess();
                            nameInput.value = '';
                            fileInput.value = '';
                            alert(`Đã tải lên phông chữ "${fontName}" thành công! Bây giờ bạn có thể áp dụng cho bất kỳ khối chữ nào.`);
                          }
                        };
                        reader.readAsDataURL(file);
                      }}
                      className="w-full mt-1.5 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-[10px] transition duration-150 flex items-center justify-center gap-1 cursor-pointer shadow-md shadow-blue-500/10 hover:animate-none"
                    >
                      🚀 TẢI LÊN PHÔNG CHỮ MỚI
                    </button>
                  </div>

                  {/* List of current custom fonts */}
                  {(noCodeConfig.appearance.customUploadedFonts || []).length > 0 && (
                    <div className="mt-3.5 space-y-2 pt-3 border-t border-slate-200">
                      <p className="text-[10px] text-slate-500 font-bold block">DANH SÁCH PHÔNG ĐÃ TẢI LÊN:</p>
                      <div className="grid grid-cols-1 gap-1.5 max-h-[160px] overflow-y-auto">
                        {(noCodeConfig.appearance.customUploadedFonts || []).map(f => (
                          <div key={f.name} className="flex items-center justify-between bg-white px-2.5 py-2 rounded-xl border border-slate-200 hover:shadow-2xs transition animate-fade-in">
                            <span className="font-semibold text-slate-800 text-xs" style={{ fontFamily: `"${f.name}"` }}>{f.name}</span>
                            <button
                              type="button"
                              onClick={() => {
                                audioService.playClick();
                                if (confirm(`Bạn chắc chắn muốn xóa phông chữ "${f.name}" không?`)) {
                                  setNoCodeConfig(prev => ({
                                    ...prev,
                                    appearance: {
                                      ...prev.appearance,
                                      customUploadedFonts: (prev.appearance.customUploadedFonts || []).filter(font => font.name !== f.name)
                                    }
                                  }));
                                  audioService.playSuccess();
                                }
                              }}
                              className="text-red-500 hover:text-red-700 font-extrabold text-[10px] uppercase bg-red-50 hover:bg-red-100 p-1 rounded-md"
                            >
                              Xóa
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Border Radius rounded corner scale */}
                <div className="space-y-2">
                  <label className="font-bold text-slate-700 block text-[10px] uppercaseCol flex justify-between">
                    <span>Độ bo góc (Border Radius)</span>
                    <span className="font-mono text-blue-500 font-bold">
                      {noCodeConfig.appearance.borderRadius}
                    </span>
                  </label>
                  <div className="grid grid-cols-5 gap-1.5 bg-slate-100 p-1 rounded-xl text-center">
                    {["none", "sm", "md", "lg", "xl"].map((sz) => (
                      <button
                        key={sz}
                        onClick={() =>
                          setNoCodeConfig((prev) => ({
                            ...prev,
                            appearance: {
                              ...prev.appearance,
                              borderRadius: sz,
                            },
                          }))
                        }
                        className={`py-1 rounded text-[10px] font-bold ${noCodeConfig.appearance.borderRadius === sz ? "bg-white text-slate-800 shadow-xs" : "text-slate-400"}`}
                      >
                        {sz.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Spacing alignment layout scales */}
                <div className="space-y-2">
                  <label className="font-bold text-slate-700 block text-[10px] uppercase flex justify-between">
                    <span>Khoảng cách padding (Spacing)</span>
                    <span className="font-mono text-blue-500 font-bold">
                      {noCodeConfig.appearance.spacing}
                    </span>
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-xl text-center">
                    {["compact", "relaxed", "spacious"].map((sp) => (
                      <button
                        key={sp}
                        onClick={() =>
                          setNoCodeConfig((prev) => ({
                            ...prev,
                            appearance: {
                              ...prev.appearance,
                              spacing: sp as any,
                            },
                          }))
                        }
                        className={`py-1 rounded text-[10px] font-bold ${noCodeConfig.appearance.spacing === sp ? "bg-white text-slate-800 shadow-xs" : "text-slate-400"}`}
                      >
                        {sp.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* D. IMAGE MANAGEMENT CENTRE (CROP & REPLACE SIMULATORS) */}
            {editorSubTab === "images" && (
               <div className="space-y-6 text-xs text-left">
                {/* Logo Change Quick Banner */}
                <div 
                  onClick={() => setEditorSubTab("menu")}
                  className="p-3 bg-amber-50 dark:bg-amber-950/20 hover:bg-amber-100/50 dark:hover:bg-amber-950/30 border border-amber-200/50 dark:border-amber-900/30 rounded-2xl flex items-center justify-between cursor-pointer group transition-all duration-150"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">🎨</span>
                    <div className="text-left">
                      <p className="text-[10px] sm:text-xs font-bold text-amber-900 dark:text-amber-200">Bạn muốn đổi Logo thương hiệu?</p>
                      <p className="text-[9px] text-amber-700/80 dark:text-amber-400/80 font-normal">Kích thước 1:1, chỉnh hiển thị dạng tròn như Facebook.</p>
                    </div>
                  </div>
                  <span className="text-amber-500 font-bold text-xs group-hover:translate-x-1 transition-transform">→ THỬ NGAY</span>
                </div>

                <h3 className="font-extrabold text-slate-900 border-b pb-2 mb-3">
                  Trung Tâm Quản Lý Hình Ảnh (Sizing & Crop)
                </h3>
                <p className="text-[10px] text-slate-500">
                  Chọn một block ảnh trực tiếp bên phải hoặc thiết lập nhanh
                  thuộc tính cắt xén tiêu chuẩn cho trang bên dưới:
                </p>

                {/* Sizing, Zoom slider */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                  <div>
                    <label className="font-bold text-slate-700 block text-[10px] uppercase flex justify-between mb-1">
                      <span>Thu Phóng Ảnh (Zoom)</span>
                      <span>{cropZoom}%</span>
                    </label>
                    <input
                      type="range"
                      min="50"
                      max="180"
                      value={cropZoom}
                      onChange={(e) => setCropZoom(Number(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                  </div>

                  {/* Rotation slider */}
                  <div>
                    <label className="font-bold text-slate-700 block text-[10px] uppercase flex justify-between mb-1">
                      <span>Xoay ảnh mẫu (Rotate angle)</span>
                      <span>{cropRotation}°</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={cropRotation}
                      onChange={(e) => setCropRotation(Number(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                  </div>

                  {/* Aspect Ratio picker */}
                  <div>
                    <label className="font-bold text-slate-700 block text-[10px] mb-1.5 uppercase">
                      Tỉ lệ khung hình (Aspect crop option)
                    </label>
                    <div className="grid grid-cols-4 gap-1.5 rounded bg-slate-200 p-0.5 text-center">
                      {["1:1", "4:3", "16:9", "21:9"].map((ar) => (
                        <button
                          key={ar}
                          onClick={() => setCropAspectRatio(ar)}
                          className={`py-1 text-[10px] font-bold rounded ${cropAspectRatio === ar ? "bg-white text-slate-800" : "text-slate-400"}`}
                        >
                          {ar}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Stock gallery image picker */}
                <div className="space-y-2">
                  <label className="font-bold text-slate-700 block text-[10px] uppercase flex justify-between">
                    <span>Thư Viện Ảnh Tương Tác</span>
                    <label className="text-blue-500 cursor-pointer hover:underline flex items-center gap-1">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setNoCodeConfig((prev) => ({
                                ...prev,
                                systemSettings: {
                                  ...prev.systemSettings,
                                  galleryImages: [
                                    ...(prev.systemSettings.galleryImages ||
                                      []),
                                    reader.result as string,
                                  ],
                                },
                              }));
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      + Tải ảnh lên
                    </label>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {noCodeConfig.systemSettings.galleryImages?.map(
                      (pic, pIdx) => (
                        <div
                          key={pIdx}
                          onClick={() => setSelectedGalleryPic(pic)}
                          className={`w-16 h-16 rounded-lg overflow-hidden border-2 cursor-pointer shadow-sm relative group ${selectedGalleryPic === pic ? "border-blue-600 scale-105" : "border-transparent"}`}
                        >
                          <img
                            src={pic}
                            alt="Stock option"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setNoCodeConfig((prev) => {
                                const arr = [
                                  ...(prev.systemSettings.galleryImages || []),
                                ];
                                arr.splice(pIdx, 1);
                                return {
                                  ...prev,
                                  systemSettings: {
                                    ...prev.systemSettings,
                                    galleryImages: arr,
                                  },
                                };
                              });
                            }}
                            className="absolute top-0 right-0 bg-red-500 text-white w-4 h-4 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 rounded-bl transition"
                          >
                            ✕
                          </button>
                        </div>
                      ),
                    )}
                  </div>
                </div>

                {/* Mock target mapping */}
                <div className="space-y-2">
                  <label className="font-bold text-slate-700 block text-[10px] uppercase">
                    Gắn mục tiêu ảnh cần thay thế
                  </label>
                  <select
                    value={selectedImageBlockId || ""}
                    onChange={(e) =>
                      setSelectedImageBlockId(e.target.value || null)
                    }
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                  >
                    <option value="">-- Click chọn khối ảnh áp dụng --</option>
                    {activePage.blocks
                      .filter(
                        (b) => b.type === "banner" || b.type === "testimonial",
                      )
                      .map((b) => (
                        <option key={b.id} value={b.id}>
                          [{b.type.toUpperCase()}] - {b.title || "Khối sơ bộ"}
                        </option>
                      ))}
                  </select>
                </div>

                <button
                  onClick={handleApplyImageSettings}
                  disabled={!selectedImageBlockId}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-30 text-white font-extrabold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  <ImageIcon size={14} />
                  <span>Cắt Ảnh & Áp Dụng Cho Trang</span>
                </button>
              </div>
            )}

            {/* E. FOOTER/HEADER SYSTEM SETTINGS & NAVIGATION MENUS */}
            {editorSubTab === "menu" && (
              <div className="space-y-6 text-xs text-left">
                {/* Visual Navigation links list */}
                <div>
                  <h3 className="font-extrabold text-slate-900 border-b pb-2 mb-3 flex items-center justify-between">
                    <span>Menu Điều Hướng</span>
                    <button
                      onClick={handleAddMenuItem}
                      className="text-blue-500 hover:text-blue-700 font-bold flex items-center gap-0.5"
                    >
                      + Thêm Menu
                    </button>
                  </h3>

                  <div className="space-y-1.5">
                    {noCodeConfig.menus.map((m, mIdx) => (
                      <div
                        key={mIdx}
                        className="p-2.5 bg-slate-50 border rounded-xl flex flex-col gap-2 text-xs font-bold font-sans"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            value={m.label}
                            onChange={(e) =>
                              setNoCodeConfig((prev) => {
                                const newMenus = [...prev.menus];
                                newMenus[mIdx].label = e.target.value;
                                return { ...prev, menus: newMenus };
                              })
                            }
                            className="bg-white border rounded px-2 py-1 flex-1 font-bold"
                          />
                          <span className="text-[10px] text-slate-400 font-mono w-24 truncate">
                            ({m.viewAlias})
                          </span>

                          {/* Reordering buttons (▲ and ▼ Chevrons) */}
                          <div className="flex items-center gap-1 shrink-0 bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
                            <button
                              onClick={() => {
                                if (mIdx === 0) return;
                                setNoCodeConfig((prev) => {
                                  const newMenus = [...prev.menus];
                                  const temp = newMenus[mIdx];
                                  newMenus[mIdx] = newMenus[mIdx - 1];
                                  newMenus[mIdx - 1] = temp;
                                  newMenus.forEach((menu, i) => {
                                    menu.order = i;
                                  });
                                  return { ...prev, menus: newMenus };
                                });
                              }}
                              disabled={mIdx === 0}
                              className="p-1 text-slate-500 hover:text-blue-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:text-slate-500 disabled:hover:bg-transparent rounded transition cursor-pointer"
                              title="Di chuyển lên"
                            >
                              <ChevronUp size={14} />
                            </button>
                            <button
                              onClick={() => {
                                if (mIdx === noCodeConfig.menus.length - 1) return;
                                setNoCodeConfig((prev) => {
                                  const newMenus = [...prev.menus];
                                  const temp = newMenus[mIdx];
                                  newMenus[mIdx] = newMenus[mIdx + 1];
                                  newMenus[mIdx + 1] = temp;
                                  newMenus.forEach((menu, i) => {
                                    menu.order = i;
                                  });
                                  return { ...prev, menus: newMenus };
                                });
                              }}
                              disabled={mIdx === noCodeConfig.menus.length - 1}
                              className="p-1 text-slate-500 hover:text-blue-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:text-slate-500 disabled:hover:bg-transparent rounded transition cursor-pointer"
                              title="Di chuyển xuống"
                            >
                              <ChevronDown size={14} />
                            </button>
                          </div>

                          <button
                            onClick={() =>
                              setNoCodeConfig((prev) => ({
                                ...prev,
                                menus: prev.menus.filter((_, i) => i !== mIdx),
                              }))
                            }
                            className="text-red-500 hover:text-red-700 text-xs font-bold shrink-0 w-6 h-6 flex items-center justify-center hover:bg-red-50 rounded-lg transition"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* FOOTER EDITOR IS MOVED TO PAGES SUB-TAB. WE KEEP REST HERE. */}
                {/* Header / Footer custom branding labels */}
                <div className="p-4 bg-slate-50 border rounded-2xl space-y-3">
                  <h4 className="text-xs font-black uppercase text-slate-700 flex items-center gap-1">
                    <Settings size={13} />
                    <span>Nội Dung Trực Tiếp Khác</span>
                  </h4>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">
                      Chữ Logo Thương Hiệu
                    </label>
                    <input
                      type="text"
                      className="w-full bg-white border rounded-lg p-2 font-black text-xs"
                      value={noCodeConfig.systemSettings.headerLogoText}
                      onChange={(e) =>
                        setNoCodeConfig((prev) => ({
                          ...prev,
                          systemSettings: {
                            ...prev.systemSettings,
                            headerLogoText: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">
                      Tải Ảnh Logo Thương Hiệu (Cắt Xén 1:1)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      className="w-full bg-slate-100 border rounded-lg p-1.5 text-[10px] cursor-pointer"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setLogoUploadSrc(reader.result as string);
                            setLogoCropZoom(100);
                            setLogoCropX(0);
                            setLogoCropY(0);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    {noCodeConfig.systemSettings.headerLogoImage && (
                      <div className="mt-2 flex items-center justify-between bg-white border border-slate-100 p-2 rounded-xl">
                        <div className="flex items-center gap-2">
                          <img
                            src={noCodeConfig.systemSettings.headerLogoImage}
                            alt="Logo"
                            className="w-8 h-8 object-cover bg-white rounded-full shadow-xs border p-0.5"
                          />
                          <span className="text-[9px] text-slate-500 font-mono">Đã cắt 1:1</span>
                        </div>
                        <button
                          onClick={() =>
                            setNoCodeConfig((prev) => ({
                              ...prev,
                              systemSettings: {
                                ...prev.systemSettings,
                                headerLogoImage: "",
                              },
                            }))
                          }
                          className="text-[10px] text-red-500 hover:underline font-bold"
                        >
                          Xóa ảnh logo
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">
                      Thông Báo Toàn Trang Chủ
                    </label>
                    <textarea
                      rows={2}
                      className="w-full bg-white border rounded-lg p-2 font-mono text-xs"
                      value={noCodeConfig.systemSettings.systemNotification}
                      onChange={(e) =>
                        setNoCodeConfig((prev) => ({
                          ...prev,
                          systemSettings: {
                            ...prev.systemSettings,
                            systemNotification: e.target.value,
                          },
                        }))
                      }
                    />
                    <label className="flex items-center gap-1.5 mt-1 font-bold text-[10px] text-slate-600">
                      <input
                        type="checkbox"
                        checked={
                          noCodeConfig.systemSettings.showNotificationOnHome
                        }
                        onChange={(e) =>
                          setNoCodeConfig((prev) => ({
                            ...prev,
                            systemSettings: {
                              ...prev.systemSettings,
                              showNotificationOnHome: e.target.checked,
                            },
                          }))
                        }
                      />
                      Hiển thị trên Trang chủ
                    </label>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">
                      Footer Bản Quyền
                    </label>
                    <input
                      type="text"
                      className="w-full bg-white border rounded-lg p-2 text-xs font-semibold text-slate-600"
                      value={noCodeConfig.systemSettings.footerText}
                      onChange={(e) =>
                        setNoCodeConfig((prev) => ({
                          ...prev,
                          systemSettings: {
                            ...prev.systemSettings,
                            footerText: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>
                </div>

                {/* Email welcoming edit */}
                <div className="p-4 bg-slate-50 border rounded-2xl space-y-2">
                  <h4 className="text-xs font-black uppercase text-slate-700 flex items-center gap-1.5">
                    <Mail size={13} />
                    <span>Email Gửi Chào Mừng (Welcome Mail)</span>
                  </h4>

                  <input
                    type="text"
                    placeholder="Tiêu đề email..."
                    value={noCodeConfig.systemSettings.emailWelcomeSubject}
                    onChange={(e) =>
                      setNoCodeConfig((prev) => ({
                        ...prev,
                        systemSettings: {
                          ...prev.systemSettings,
                          emailWelcomeSubject: e.target.value,
                        },
                      }))
                    }
                    className="w-full bg-white border p-2 rounded-lg font-bold"
                  />
                  <textarea
                    rows={3}
                    placeholder="Nội dung email chào mừng..."
                    value={noCodeConfig.systemSettings.emailWelcomeBody}
                    onChange={(e) =>
                      setNoCodeConfig((prev) => ({
                        ...prev,
                        systemSettings: {
                          ...prev.systemSettings,
                          emailWelcomeBody: e.target.value,
                        },
                      }))
                    }
                    className="w-full bg-white border p-2 rounded-lg font-sans"
                  />
                </div>
              </div>
            )}

            {/* F. SOUNDS */}
            {editorSubTab === "sounds" && (
              <div className="space-y-4 text-xs text-left">
                <h3 className="font-extrabold text-slate-900 border-b pb-2 mb-3">
                  Tùy chỉnh Âm Thanh Hệ Thống
                </h3>
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 mb-3">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Âm lượng tổng (Master Volume)</label>
                    <div className="flex gap-2 items-center cursor-pointer">
                      <input 
                        type="range" min="0" max="100"
                        value={noCodeConfig.systemSettings?.audioSettings?.masterVolume ?? 100}
                        onChange={(e) => setNoCodeConfig(prev => ({
                          ...prev,
                          systemSettings: {
                            ...prev.systemSettings,
                            audioSettings: {
                              ...prev.systemSettings?.audioSettings,
                              masterVolume: Number(e.target.value)
                            }
                          }
                        }))}
                        className="flex-1 accent-blue-600"
                      />
                      <span className="font-mono text-xs w-8 text-right bg-white px-1.5 py-0.5 rounded border border-slate-200">{noCodeConfig.systemSettings?.audioSettings?.masterVolume ?? 100}%</span>
                    </div>
                  </div>

                  {/* BACKGROUND MUSIC SETTINGS */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800/50 dark:to-indigo-950/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/40 mb-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-black text-indigo-700 dark:text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                        📻 NHẠC NỀN WEBSITE (BACKGROUND MUSIC)
                      </label>
                      <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={noCodeConfig.systemSettings?.audioSettings?.bgMusicEnabled ?? false}
                          onChange={(e) => setNoCodeConfig(prev => ({
                            ...prev,
                            systemSettings: {
                              ...prev.systemSettings,
                              audioSettings: {
                                ...prev.systemSettings?.audioSettings,
                                bgMusicEnabled: e.target.checked
                              }
                            }
                          }))}
                          className="rounded text-blue-600 focus:ring-blue-500 bg-white"
                        />
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">Kích hoạt nhạc nền</span>
                      </label>
                    </div>

                    <div className="flex gap-2 w-full">
                      <input
                        type="text"
                        placeholder="Nhập URL liên kết nhạc nền (.mp3, .wav...) hoặc tải lên"
                        value={noCodeConfig.systemSettings?.audioSettings?.bgMusicUrl || ""}
                        onChange={(e) => setNoCodeConfig(prev => ({
                          ...prev,
                          systemSettings: {
                            ...prev.systemSettings,
                            audioSettings: {
                              ...prev.systemSettings?.audioSettings,
                              bgMusicUrl: e.target.value
                            }
                          }
                        }))}
                        className="flex-1 min-w-0 text-xs p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-indigo-400 dark:text-white"
                      />
                      <div className="flex gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={handleToggleAdminPreview}
                          className={`px-3 py-2 rounded-lg font-bold transition text-xs flex items-center gap-1.5 ${
                            isAdminPreviewPlaying
                              ? "bg-red-500 hover:bg-red-600 text-white"
                              : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/10"
                          }`}
                          title={isAdminPreviewPlaying ? "Dừng thử nhạc" : "Nghe thử nhạc"}
                        >
                          {isAdminPreviewPlaying ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}
                          {isAdminPreviewPlaying ? "Dừng" : "Nghe thử"}
                        </button>
                        <label className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-300 dark:hover:bg-slate-650 transition text-xs flex items-center justify-center">
                          Tải lên
                          <input 
                            type="file" 
                            accept="audio/*" 
                            className="hidden" 
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                if (file.size > 8 * 1024 * 1024) {
                                  alert("File nhạc nền quá lớn, vui lòng chọn file dưới 8MB.");
                                  return;
                                }
                                const reader = new FileReader();
                                reader.onload = (ev) => {
                                  if (ev.target?.result) {
                                    setNoCodeConfig(prev => ({
                                      ...prev,
                                      systemSettings: {
                                        ...prev.systemSettings,
                                        audioSettings: {
                                          ...prev.systemSettings?.audioSettings,
                                          bgMusicUrl: ev.target!.result as string
                                        }
                                      }
                                    }));
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }} 
                          />
                        </label>
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal bg-white/50 dark:bg-slate-900/30 p-2 rounded-lg border border-indigo-100/30 dark:border-slate-800">
                      💡 <b>Lưu ý chia sẻ:</b> Do giới hạn Cloud Firestore (1MB/tài liệu), tệp nhạc tải lên trực tiếp sẽ được lưu cục bộ và chỉ phát trên trình duyệt này. Để <b>tất cả học sinh</b> đều nghe thấy nhạc nền khi truy cập, vui lòng dán đường dẫn <b>liên kết URL trực tuyến (HTTP/HTTPS)</b> của bài hát vào ô nhập trên nhé!
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      <div className="flex gap-2 items-center">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 w-24">Âm lượng nhạc:</span>
                        <input 
                          type="range" min="0" max="100"
                          value={noCodeConfig.systemSettings?.audioSettings?.bgMusicVolume ?? 20}
                          onChange={(e) => setNoCodeConfig(prev => ({
                            ...prev,
                            systemSettings: {
                              ...prev.systemSettings,
                              audioSettings: {
                                ...prev.systemSettings?.audioSettings,
                                bgMusicVolume: Number(e.target.value)
                              }
                            }
                          }))}
                          className="flex-1 accent-indigo-600"
                        />
                        <span className="font-mono text-[10px] font-extrabold w-8 text-right bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 px-1 rounded text-indigo-600 dark:text-indigo-400">
                          {noCodeConfig.systemSettings?.audioSettings?.bgMusicVolume ?? 20}%
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={noCodeConfig.systemSettings?.audioSettings?.bgMusicLoop ?? true}
                            onChange={(e) => setNoCodeConfig(prev => ({
                              ...prev,
                              systemSettings: {
                                ...prev.systemSettings,
                                audioSettings: {
                                  ...prev.systemSettings?.audioSettings,
                                  bgMusicLoop: e.target.checked
                                }
                              }
                            }))}
                            className="rounded text-indigo-600 focus:ring-indigo-500 bg-white"
                          />
                          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Tự động phát lại khi hết (Loop)</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* STUDY MUSIC SETTINGS */}
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-slate-800/50 dark:to-teal-950/20 p-4 rounded-2xl border border-emerald-100 dark:border-teal-900/40 mb-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-black text-emerald-700 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                        📚 NHẠC HỌC TẬP (STUDY MUSIC - CHỈ PHÁT KHI HỌC)
                      </label>
                      <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={noCodeConfig.systemSettings?.audioSettings?.studyMusicEnabled ?? false}
                          onChange={(e) => setNoCodeConfig(prev => ({
                            ...prev,
                            systemSettings: {
                              ...prev.systemSettings,
                              audioSettings: {
                                ...prev.systemSettings?.audioSettings,
                                studyMusicEnabled: e.target.checked
                              }
                            }
                          }))}
                          className="rounded text-emerald-600 focus:ring-emerald-500 bg-white"
                        />
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">Kích hoạt nhạc học tập</span>
                      </label>
                    </div>

                    <div className="flex gap-2 w-full">
                      <input
                        type="text"
                        placeholder="Nhập URL liên kết nhạc học tập (.mp3, .wav...) hoặc tải lên"
                        value={noCodeConfig.systemSettings?.audioSettings?.studyMusicUrl || ""}
                        onChange={(e) => setNoCodeConfig(prev => ({
                          ...prev,
                          systemSettings: {
                            ...prev.systemSettings,
                            audioSettings: {
                              ...prev.systemSettings?.audioSettings,
                              studyMusicUrl: e.target.value
                            }
                          }
                        }))}
                        className="flex-1 min-w-0 text-xs p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-emerald-400 dark:text-white"
                      />
                      <div className="flex gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={handleToggleStudyPreview}
                          className={`px-3 py-2 rounded-lg font-bold transition text-xs flex items-center gap-1.5 ${
                            isStudyPreviewPlaying
                              ? "bg-red-500 hover:bg-red-600 text-white"
                              : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/10"
                          }`}
                          title={isStudyPreviewPlaying ? "Dừng thử nhạc" : "Nghe thử nhạc"}
                        >
                          {isStudyPreviewPlaying ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}
                          {isStudyPreviewPlaying ? "Dừng" : "Nghe thử"}
                        </button>
                        <label className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-300 dark:hover:bg-slate-650 transition text-xs flex items-center justify-center">
                          Tải lên
                          <input 
                            type="file" 
                            accept="audio/*" 
                            className="hidden" 
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                if (file.size > 8 * 1024 * 1024) {
                                  alert("File nhạc học tập quá lớn, vui lòng chọn file dưới 8MB.");
                                  return;
                                }
                                const reader = new FileReader();
                                reader.onload = (ev) => {
                                  if (ev.target?.result) {
                                    setNoCodeConfig(prev => ({
                                      ...prev,
                                      systemSettings: {
                                        ...prev.systemSettings,
                                        audioSettings: {
                                          ...prev.systemSettings?.audioSettings,
                                          studyMusicUrl: ev.target!.result as string
                                        }
                                      }
                                    }));
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }} 
                          />
                        </label>
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal bg-white/50 dark:bg-slate-900/30 p-2 rounded-lg border border-emerald-100/30 dark:border-slate-800">
                      💡 <b>Lưu ý:</b> Nhạc học tập chỉ tự động phát thay thế nhạc nền khi học sinh nhấn vào <b>bài học thử thách</b> để rèn luyện tập trung. Tệp nhạc tải lên trực tiếp sẽ được lưu cục bộ. Để tất cả học sinh đều nghe thấy nhạc khi truy cập, vui lòng dán đường dẫn <b>liên kết URL trực tuyến (HTTP/HTTPS)</b> của bài hát nhé!
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      <div className="flex gap-2 items-center">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 w-24">Âm lượng nhạc:</span>
                        <input 
                          type="range" min="0" max="100"
                          value={noCodeConfig.systemSettings?.audioSettings?.studyMusicVolume ?? 20}
                          onChange={(e) => setNoCodeConfig(prev => ({
                            ...prev,
                            systemSettings: {
                              ...prev.systemSettings,
                              audioSettings: {
                                ...prev.systemSettings?.audioSettings,
                                studyMusicVolume: Number(e.target.value)
                              }
                            }
                          }))}
                          className="flex-1 accent-emerald-600"
                        />
                        <span className="font-mono text-[10px] font-extrabold w-8 text-right bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 px-1 rounded text-emerald-600 dark:text-emerald-400">
                          {noCodeConfig.systemSettings?.audioSettings?.studyMusicVolume ?? 20}%
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={noCodeConfig.systemSettings?.audioSettings?.studyMusicLoop ?? true}
                            onChange={(e) => setNoCodeConfig(prev => ({
                              ...prev,
                              systemSettings: {
                                ...prev.systemSettings,
                                audioSettings: {
                                  ...prev.systemSettings?.audioSettings,
                                  studyMusicLoop: e.target.checked
                                }
                              }
                            }))}
                            className="rounded text-emerald-600 focus:ring-emerald-500 bg-white"
                          />
                          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Tự động phát lại khi hết (Loop)</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* BOSS FIGHT MUSIC SETTINGS */}
                  <div className="bg-gradient-to-r from-red-50 to-amber-50 dark:from-slate-800/60 dark:to-amber-950/20 p-4 rounded-2xl border border-red-100 dark:border-red-900/40 mb-4 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-black text-rose-700 dark:text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                        ⚔️ NHẠC QUYẾT CHIẾN BOSS (BOSS GAME MUSIC)
                      </label>
                      <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={noCodeConfig.systemSettings?.audioSettings?.bossMusicEnabled ?? true}
                          onChange={(e) => setNoCodeConfig(prev => ({
                            ...prev,
                            systemSettings: {
                              ...prev.systemSettings,
                              audioSettings: {
                                ...prev.systemSettings?.audioSettings,
                                bossMusicEnabled: e.target.checked
                              }
                            }
                          }))}
                          className="rounded text-rose-600 focus:ring-rose-500 bg-white"
                        />
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">Kích hoạt nhạc đánh Boss</span>
                      </label>
                    </div>

                    <div className="flex gap-2 w-full">
                      <input
                        type="text"
                        placeholder="Nhập URL liên kết nhạc đánh Boss (.mp3, .wav...) hoặc tải lên"
                        value={noCodeConfig.systemSettings?.audioSettings?.bossMusicUrl || ""}
                        onChange={(e) => setNoCodeConfig(prev => ({
                          ...prev,
                          systemSettings: {
                            ...prev.systemSettings,
                            audioSettings: {
                              ...prev.systemSettings?.audioSettings,
                              bossMusicUrl: e.target.value
                            }
                          }
                        }))}
                        className="flex-1 min-w-0 text-xs p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-rose-400 dark:text-white"
                      />
                      <div className="flex gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={handleToggleBossPreview}
                          className={`px-3 py-2 rounded-lg font-bold transition text-xs flex items-center gap-1.5 ${
                            isBossPreviewPlaying
                              ? "bg-red-500 hover:bg-red-600 text-white"
                              : "bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/10"
                          }`}
                          title={isBossPreviewPlaying ? "Dừng thử nhạc" : "Nghe thử nhạc"}
                        >
                          {isBossPreviewPlaying ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}
                          {isBossPreviewPlaying ? "Dừng" : "Nghe thử"}
                        </button>
                        <label className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-300 dark:hover:bg-slate-650 transition text-xs flex items-center justify-center">
                          Tải lên
                          <input 
                            type="file" 
                            accept="audio/*" 
                            className="hidden" 
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                  if (file.size > 8 * 1024 * 1024) {
                                    alert("File nhạc đánh Boss quá lớn, vui lòng chọn file dưới 8MB.");
                                    return;
                                  }
                                  const reader = new FileReader();
                                  reader.onload = (ev) => {
                                    if (ev.target?.result) {
                                      setNoCodeConfig(prev => ({
                                        ...prev,
                                        systemSettings: {
                                          ...prev.systemSettings,
                                          audioSettings: {
                                            ...prev.systemSettings?.audioSettings,
                                            bossMusicUrl: ev.target!.result as string
                                          }
                                        }
                                      }));
                                    }
                                  };
                                  reader.readAsDataURL(file);
                              }
                            }} 
                          />
                        </label>
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal bg-white/50 dark:bg-slate-900/30 p-2 rounded-lg border border-red-100/30 dark:border-slate-800">
                      💡 <b>Lưu ý:</b> Nhạc đánh Boss sẽ tự động kích hoạt ngay khi người dùng mở góc <b>Quyết Chiến Boss</b>, đồng thời tất cả nhạc nền khác sẽ tự tắt để tránh chồng kênh. Tự động phát lặp lại (Loop) giúp tối ưu hóa không khí chiến đấu kịch tính!
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      <div className="flex gap-2 items-center">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 w-24">Âm lượng nhạc:</span>
                        <input 
                          type="range" min="0" max="100"
                          value={noCodeConfig.systemSettings?.audioSettings?.bossMusicVolume ?? 30}
                          onChange={(e) => setNoCodeConfig(prev => ({
                            ...prev,
                            systemSettings: {
                              ...prev.systemSettings,
                              audioSettings: {
                                ...prev.systemSettings?.audioSettings,
                                bossMusicVolume: Number(e.target.value)
                              }
                            }
                          }))}
                          className="flex-1 accent-rose-600"
                        />
                        <span className="font-mono text-[10px] font-extrabold w-8 text-right bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 px-1 rounded text-rose-600 dark:text-rose-400">
                          {noCodeConfig.systemSettings?.audioSettings?.bossMusicVolume ?? 30}%
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={noCodeConfig.systemSettings?.audioSettings?.bossMusicLoop ?? true}
                            onChange={(e) => setNoCodeConfig(prev => ({
                              ...prev,
                              systemSettings: {
                                ...prev.systemSettings,
                                audioSettings: {
                                  ...prev.systemSettings?.audioSettings,
                                  bossMusicLoop: e.target.checked
                                }
                              }
                            }))}
                            className="rounded text-rose-600 focus:ring-rose-500 bg-white"
                          />
                          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Tự động phát lại khi hết (Loop)</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="max-h-[400px] overflow-y-auto space-y-3 pr-1">
                    {['click', 'success', 'error', 'levelUp', 'xp', 'hooray', 'runCode'].map((effectType) => {
                       const audioSettings: any = noCodeConfig.systemSettings?.audioSettings || {};
                       const val = audioSettings[effectType] || { url: '', volume: 100 };
                       return (
                        <div key={effectType} className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-2 transition-all hover:border-blue-200 hover:shadow-xs">
                          <label className="block text-xs font-bold text-blue-600 capitalize">
                            Hiệu ứng: {effectType === 'runCode' ? 'Chạy Thử Code 💻' : effectType}
                          </label>
                          <div className="flex gap-2 w-full">
                            <input
                              type="text"
                              placeholder="URL file âm thanh (hoặc tải lên từ máy)"
                              value={val.url}
                              onChange={(e) => setNoCodeConfig(prev => ({
                                ...prev,
                                systemSettings: {
                                  ...prev.systemSettings,
                                  audioSettings: {
                                    ...prev.systemSettings?.audioSettings,
                                    [effectType]: { ...val, url: e.target.value }
                                  }
                                }
                              }))}
                              className="flex-1 min-w-0 text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400"
                            />
                            <div className="flex gap-2 shrink-0">
                              <label className="bg-slate-200 text-slate-700 font-bold px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-300 transition text-xs flex items-center justify-center">
                                Tải lên
                                <input 
                                  type="file" 
                                  accept="audio/*" 
                                  className="hidden" 
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      if (file.size > 2 * 1024 * 1024) {
                                        alert("File quá lớn, vui lòng chọn file dưới 2MB.");
                                        return;
                                      }
                                      const reader = new FileReader();
                                      reader.onload = (ev) => {
                                        if (ev.target?.result) {
                                          setNoCodeConfig(prev => ({
                                            ...prev,
                                            systemSettings: {
                                              ...prev.systemSettings,
                                              audioSettings: {
                                                ...prev.systemSettings?.audioSettings,
                                                [effectType]: { ...val, url: ev.target!.result as string }
                                              }
                                            }
                                          }));
                                        }
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }} 
                                />
                              </label>
                              <button 
                                onClick={() => {
                                  if (val.url) {
                                    const audio = new Audio(val.url);
                                    const master = noCodeConfig.systemSettings?.audioSettings?.masterVolume ?? 100;
                                    const v = val.volume ?? 100;
                                    audio.volume = Math.max(0, Math.min(1, (v / 100) * (master / 100)));
                                    audio.play().catch(e => alert("Không thể phát âm thanh: " + e.message));
                                  } else {
                                    alert("Chưa có file âm thanh để phát.");
                                  }
                                }}
                                className="bg-blue-100 text-blue-700 font-bold px-3 py-2 rounded-lg hover:bg-blue-200 transition text-xs flex items-center justify-center"
                              >
                                Nghe thử
                              </button>
                            </div>
                          </div>
                          <div className="flex gap-2 items-center cursor-pointer">
                            <label className="text-[10px] text-slate-500 w-16 whitespace-nowrap">Âm lượng</label>
                            <input 
                              type="range" min="0" max="100"
                              value={val.volume}
                              onChange={(e) => setNoCodeConfig(prev => ({
                                ...prev,
                                systemSettings: {
                                  ...prev.systemSettings,
                                  audioSettings: {
                                    ...prev.systemSettings?.audioSettings,
                                    [effectType]: { ...val, volume: Number(e.target.value) }
                                  }
                                }
                              }))}
                              className="flex-1 accent-slate-600"
                            />
                            <span className="font-mono text-[10px] w-8 text-right bg-white px-1 rounded border border-slate-100">{val.volume}%</span>
                          </div>
                        </div>
                       );
                    })}
                  </div>
              </div>
            )}

            {/* G. REVISION HISTORY & BACKUP RESTORES */}
            {editorSubTab === "history" && (
              <div className="space-y-4 text-xs text-left">
                <h3 className="font-extrabold text-slate-900 border-b pb-2 mb-3">
                  Lịch Sử Nhãn Chỉnh Sửa
                </h3>
                <p className="text-[10px] text-slate-500">
                  Ghi nhận nhật ký mỗi lần tác vụ lưu được nhấn. Bạn có thể phục
                  dựng các phiên bản mốc giao diện cũ.
                </p>

                <div className="space-y-3 max-h-[360px] overflow-y-auto">
                  {revisions.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-150 rounded-2xl flex flex-col justify-between gap-2.5 transition"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-rose-600 block text-[10px] font-mono uppercase">
                            {rev.updatedBy.split("@")[0]}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium font-mono">
                            {new Date(rev.updatedAt).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-slate-800 font-bold mb-1 leading-tight">
                          {rev.changeDesc}
                        </p>
                        <span className="text-[9px] text-slate-400 font-semibold">
                          {new Date(rev.updatedAt).toLocaleDateString("vi-VN")}
                        </span>
                      </div>

                      <button
                        onClick={() => restoreRevision(rev)}
                        className="py-1 px-3.5 bg-white border border-slate-300 text-slate-800 hover:bg-blue-600 hover:text-white hover:border-transparent font-bold rounded-xl text-[10px] flex items-center justify-center gap-1 cursor-pointer transition shadow-xs"
                      >
                        <Undo size={10} />
                        <span>Khôi Phục Phiên Bản</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT LIVE RESPONSIVE PREVIEW CHROME (8 Cols) */}
          <div className="xl:col-span-8 flex flex-col items-center gap-6">
            {/* Live responsive buttons frame bar */}
            <div className="bg-slate-800 p-2 text-white rounded-full flex items-center gap-3 shadow-lg">
              <span className="text-[10px] font-black uppercase text-slate-400 pl-4">
                Responsive Preview:
              </span>
              <div className="flex bg-slate-900 rounded-full p-0.5 border border-slate-700">
                <button
                  onClick={() => setPreviewDevice("pc")}
                  className={`p-2.5 rounded-full transition cursor-pointer ${previewDevice === "pc" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}
                  title="Máy tính để bàn (PC Full width)"
                >
                  <Monitor size={15} />
                </button>
                <button
                  onClick={() => setPreviewDevice("tablet")}
                  className={`p-2.5 rounded-full transition cursor-pointer ${previewDevice === "tablet" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}
                  title="Máy tính bảng (iPad Portrait)"
                >
                  <Tablet size={15} />
                </button>
                <button
                  onClick={() => setPreviewDevice("mobile")}
                  className={`p-2.5 rounded-full transition cursor-pointer ${previewDevice === "mobile" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}
                  title="Điện thoại di động (iPhone vertical)"
                >
                  <Smartphone size={15} />
                </button>
              </div>

              <div className="h-4 w-px bg-slate-700" />

              <div className="flex items-center gap-1.5 pr-4 text-xs font-semibold bg-slate-900 px-3 py-1.5 rounded-full">
                <span className="text-slate-400">Trang chủ động:</span>
                <span className="text-blue-400 font-black">
                  {activePage.name}
                </span>
              </div>
            </div>

            {/* PREVIEW FRAME WITH INTEGRATED SCALES */}
            <div className="w-full flex justify-center items-center transition-all duration-500 relative">
              {/* PC PREVIEW REPRESENTATION */}
              {previewDevice === "pc" && (
                <div className="w-full bg-[#FFFBF0] dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-850 rounded-[28px] overflow-hidden shadow-2xl transition-all duration-300">
                  <div className="bg-slate-200 dark:bg-slate-800 px-4 py-2 flex items-center gap-2 border-b">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                    </div>
                    <div className="bg-white dark:bg-slate-700 text-[10px] text-slate-500 text-center py-0.5 rounded px-12 mx-auto font-mono w-60">
                      https://pilearn.pro/
                      {activePage.alias === "home" ? "" : activePage.alias}
                    </div>
                  </div>
                  <div className="max-h-[640px] overflow-y-auto w-full no-scrollbar">
                    <NoCodeRenderer
                      blocks={activePage.blocks}
                      appearance={{
                        ...noCodeConfig.appearance,
                        ...(activePage?.appearance || {}),
                      }}
                      isLiveEditing={true}
                      onBlockUpdate={(blockId, updatedBlock) => {
                        setNoCodeConfig((prev) => {
                          const newPages = prev.pages.map((page) => {
                            if (page.id === activePageId) {
                              return {
                                ...page,
                                blocks: page.blocks.map((b) =>
                                  b.id === blockId
                                    ? { ...b, ...updatedBlock }
                                    : b,
                                ),
                              };
                            }
                            return page;
                          });
                          return { ...prev, pages: newPages };
                        });
                      }}
                    />
                  </div>
                </div>
              )}

              {/* TABLET PREVIEW REPRESENTATION */}
              {previewDevice === "tablet" && (
                <div className="w-[768px] bg-[#FFFBF0] dark:bg-slate-900 border-[14px] border-slate-950 rounded-[44px] overflow-hidden shadow-2xl transition-all duration-300 scale-90">
                  <div className="bg-slate-200 dark:bg-slate-800 px-4 py-2 text-center text-[10px] text-slate-400 font-bold border-b">
                    iPad Portrait Preview (768px)
                  </div>
                  <div className="max-h-[640px] overflow-y-auto w-full no-scrollbar">
                    <NoCodeRenderer
                      blocks={activePage.blocks}
                      appearance={{
                        ...noCodeConfig.appearance,
                        ...(activePage?.appearance || {}),
                      }}
                      isLiveEditing={true}
                      onBlockUpdate={(blockId, updatedBlock) => {
                        setNoCodeConfig((prev) => {
                          const newPages = prev.pages.map((page) => {
                            if (page.id === activePageId) {
                              return {
                                ...page,
                                blocks: page.blocks.map((b) =>
                                  b.id === blockId
                                    ? { ...b, ...updatedBlock }
                                    : b,
                                ),
                              };
                            }
                            return page;
                          });
                          return { ...prev, pages: newPages };
                        });
                      }}
                    />
                  </div>
                </div>
              )}

              {/* MOBILE PREVIEW REPRESENTATION */}
              {previewDevice === "mobile" && (
                <div className="w-[375px] bg-[#FFFBF0] dark:bg-slate-900 border-[12px] border-slate-950 rounded-[50px] overflow-hidden shadow-2xl transition-all duration-300 relative scale-95">
                  <div className="absolute top-0 inset-x-0 h-6 bg-slate-950 flex justify-center items-end pb-1.5 z-40">
                    <div className="w-24 h-4 bg-slate-950 rounded-full" />{" "}
                    {/* iPhone Notch */}
                  </div>
                  <div className="bg-slate-900 text-white text-center text-[9px] py-1 pt-6 font-bold flex justify-between px-6">
                    <span>9:41</span>
                    <span>5G LTE</span>
                  </div>
                  <div className="max-h-[580px] overflow-y-auto w-full no-scrollbar">
                    <NoCodeRenderer
                      blocks={activePage.blocks}
                      appearance={{
                        ...noCodeConfig.appearance,
                        ...(activePage?.appearance || {}),
                      }}
                      isLiveEditing={true}
                      onBlockUpdate={(blockId, updatedBlock) => {
                        setNoCodeConfig((prev) => {
                          const newPages = prev.pages.map((page) => {
                            if (page.id === activePageId) {
                              return {
                                ...page,
                                blocks: page.blocks.map((b) =>
                                  b.id === blockId
                                    ? { ...b, ...updatedBlock }
                                    : b,
                                ),
                              };
                            }
                            return page;
                          });
                          return { ...prev, pages: newPages };
                        });
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* 2. SECURITY ROLES MANAGER AUDIT VIEW     */}
      {/* ======================================= */}
      {activeTab === "users" && (
        <div className="space-y-8 animate-in fade-in">
          {/* Detailed Roles configuration explanation list */}
          <div className="bg-slate-900 text-white p-6 rounded-[32px] border border-slate-800 grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-1 flex flex-col justify-center">
              <h3 className="font-black text-rose-500 uppercase tracking-wider text-xs">
                CƠ CẤU PHÂN QUYỀN
              </h3>
              <p className="text-slate-400 text-[10px] mt-1">
                Đúc rút 5 nhóm tài khoản chủ chốt của hệ thống Pilearn.
              </p>
            </div>

            {[
              {
                title: "Super Admin",
                color: "text-rose-500",
                desc: "Toàn quyền cấu hình layout, database, gán phân cấp và đánh boss.",
              },
              {
                title: "Admin",
                color: "text-amber-500",
                desc: "Chỉnh sửa trực tiếp nội dung No-Code, cấu trúc trang & menus và đánh boss.",
              },
              {
                title: "Giáo Viên",
                color: "text-green-500",
                desc: "Quản lý bài kiểm tra, tạo lớp, chấm điểm thành tích và đánh boss.",
              },
              {
                title: "Biên Tập Viên",
                color: "text-sky-500",
                desc: "Bổ sung, sửa đổi thông tin các bài học, lý thuyết và đánh boss.",
              },
              {
                title: "Học Sinh",
                color: "text-blue-500",
                desc: "Được vào học, luyện code, mua đồ sinh động và đánh boss.",
              },
            ].map((roleRow, rIdx) => (
              <div
                key={rIdx}
                className="p-4 bg-slate-950/40 rounded-2xl border border-white/5 space-y-1"
              >
                <h4 className={`font-black text-xs ${roleRow.color}`}>
                  {roleRow.title}
                </h4>
                <p className="text-[10px] text-slate-300 leading-relaxed">
                  {roleRow.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-bold text-slate-900">
                Quản Lý Danh Sách Tài Khoản
              </h2>
              <button
                onClick={fetchData}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-white border px-3 py-1.5 rounded-xl shadow-xs"
              >
                <RefreshCw size={12} />
                <span>Đồng bộ lại</span>
              </button>
            </div>
            {loading ? (
              <div className="p-12 flex justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white text-xs font-bold uppercase text-gray-400 border-b">
                      <th className="px-6 py-4">Học viên</th>
                      <th className="px-6 py-4">Nhóm Email</th>
                      <th className="px-6 py-4">Lớp hiện hữu</th>
                      <th className="px-6 py-4">Số điểm tích lũy</th>
                      <th className="px-6 py-4">Vai Trò Hệ Thống</th>
                      <th className="px-6 py-4 text-right">Chuyển đổi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-150 text-xs text-slate-700">
                    {users.map((u) => (
                      <tr
                        key={u.id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                              {u.displayName
                                ? u.displayName.charAt(0).toUpperCase()
                                : "P"}
                            </div>
                            <input
                              type="text"
                              value={u.displayName}
                              onChange={(e) =>
                                setUsers(
                                  users.map((user) =>
                                    user.id === u.id
                                      ? { ...user, displayName: e.target.value }
                                      : user,
                                  ),
                                )
                              }
                              onBlur={(e) =>
                                handleUpdateUserField(
                                  u.id,
                                  "displayName",
                                  e.target.value,
                                )
                              }
                              className="font-bold text-slate-900 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 py-1 focus:outline-none"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-500 font-mono">
                          {u.email}
                        </td>
                        <td className="px-6 py-4">
                          {u.classId ? (
                            classes.find((c) => c.id === u.classId)?.name ||
                            "N/A"
                          ) : (
                            <span className="text-slate-400 italic">
                              Chưa ghép lớp
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              value={u.points}
                              onChange={(e) =>
                                setUsers(
                                  users.map((user) =>
                                    user.id === u.id
                                      ? {
                                          ...user,
                                          points: Number(e.target.value),
                                        }
                                      : user,
                                  ),
                                )
                              }
                              onBlur={(e) =>
                                handleUpdateUserField(
                                  u.id,
                                  "points",
                                  Number(e.target.value),
                                )
                              }
                              className="w-16 px-2 py-1 text-xs border border-gray-350 rounded focus:ring-1 focus:ring-blue-500"
                            />
                            <span className="text-[10px] text-slate-400">
                              Coins
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] border ${
                              u.role === "super_admin"
                                ? "bg-purple-50 text-purple-700 border-purple-200"
                                : u.role === "game_developer"
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : u.role === "admin"
                                    ? "bg-red-50 text-red-700 border-red-200"
                                    : u.role === "teacher"
                                      ? "bg-green-50 text-green-700 border-green-200"
                                      : "bg-blue-50 text-blue-700 border-blue-200"
                            }`}
                          >
                            {u.role === "super_admin"
                              ? "Super Admin"
                              : u.role === "game_developer"
                                ? "Phát triển game"
                                : u.role === "admin"
                                  ? "Quản trị viên"
                                  : u.role === "teacher"
                                    ? "Giáo viên"
                                    : "Học sinh"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right flex items-center justify-end space-x-2">
                          <select
                            value={u.role}
                            onChange={(e) =>
                              updateUserRole(u.id, e.target.value)
                            }
                            className="bg-white border rounded-xl px-2.5 py-1.5 font-bold text-xs"
                          >
                            <option value="student">Học sinh</option>
                            <option value="teacher">Giáo viên</option>
                            <option value="game_developer">
                              Phát triển game
                            </option>
                            <option value="admin">Quản trị viên</option>
                            <option value="super_admin">Super Admin</option>
                          </select>
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="text-red-500 hover:text-red-700 p-2 rounded-xl bg-red-50 hover:bg-red-100"
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* 3. CLASS & STUDENTS MAPPING BOARD       */}
      {/* ======================================= */}
      {activeTab === "gamedev" && (
        <div className="animate-in fade-in">
          <GameDeveloperPanel />
        </div>
      )}

      {activeTab === "classes" && (
        <div className="p-6 bg-white border rounded-[32px] animate-in fade-in">
          <form
            onSubmit={handleAddClass}
            className="flex mb-8 items-end gap-4 bg-slate-50 p-6 border border-gray-200/50 rounded-2xl"
          >
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                Tên lớp học Tin 10 mới
              </label>
              <input
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                required
                placeholder="Vd: Lớp 10A1 chuyên lý"
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl"
              />
            </div>
            <button
              type="submit"
              className="bg-slate-900 hover:bg-slate-850 text-white font-extrabold py-3 px-6 rounded-xl text-xs flex items-center"
            >
              <PlusCircle className="w-4 h-4 mr-2" /> Thêm lớp
            </button>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Panel: Non-mapped students queue */}
            <div
              className="col-span-1"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const userId = e.dataTransfer.getData("userId");
                if (userId) assignUserToClass(userId, undefined);
              }}
            >
              <h3 className="font-black text-slate-800 text-xs mb-3 bg-gray-100 py-2.5 px-4 rounded-xl flex justify-between items-center">
                <span>Chưa phân lớp</span>
                <span className="bg-slate-200 text-slate-700 px-2 rounded-full leading-relaxed">
                  {users.filter((u) => !u.classId).length}
                </span>
              </h3>
              <div className="space-y-2 max-h-[500px] overflow-y-auto no-scrollbar">
                {users
                  .filter((u) => !u.classId)
                  .map((u) => (
                    <div
                      key={u.id}
                      draggable
                      onDragStart={(e) =>
                        e.dataTransfer.setData("userId", u.id)
                      }
                      className="p-3 bg-white border border-gray-200 rounded-xl shadow-xs cursor-grab active:cursor-grabbing hover:bg-slate-50 flex items-center space-x-3 transition"
                    >
                      <User className="w-4 h-4 text-gray-400 shrink-0" />
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-800 leading-tight">
                          {u.displayName || "Tài khoản ẩn danh"}
                        </p>
                        <p className="text-[10px] text-gray-400 leading-tight truncate">
                          {u.email}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Right Panel: Class lists boxes */}
            <div className="col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {classes.map((c) => (
                <div
                  key={c.id}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const userId = e.dataTransfer.getData("userId");
                    if (userId) assignUserToClass(userId, c.id);
                  }}
                  className="border-2 border-dashed border-blue-200/80 bg-blue-50/10 rounded-[28px] p-4 min-h-[220px] transition-colors hover:bg-blue-50/20"
                >
                  <h3 className="font-extrabold text-blue-900 text-xs mb-3 flex items-center justify-between">
                    <span>🏫 {c.name}</span>
                    <span className="bg-blue-100 text-blue-700 font-bold px-2.5 py-0.5 rounded-full text-[10px]">
                      {users.filter((u) => u.classId === c.id).length} học viên
                    </span>
                  </h3>
                  <div className="space-y-1.5 h-full">
                    {users
                      .filter((u) => u.classId === c.id)
                      .map((u) => (
                        <div
                          key={u.id}
                          draggable
                          onDragStart={(e) =>
                            e.dataTransfer.setData("userId", u.id)
                          }
                          className="p-2.5 bg-white border border-blue-100/50 rounded-xl shadow-xs cursor-grab active:cursor-grabbing hover:border-blue-400 transition text-xs flex justify-between items-center"
                        >
                          <span className="font-bold text-slate-800 truncate block max-w-[140px]">
                            {u.displayName || "Học sinh"}
                          </span>
                          <span className="text-[9px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded uppercase font-black">
                            {u.role}
                          </span>
                        </div>
                      ))}
                    {users.filter((u) => u.classId === c.id).length === 0 && (
                      <div className="text-[10px] text-blue-400 text-center py-8 border-2 border-dashed border-blue-200/50 rounded-xl bg-white/40">
                        Kéo học sinh thả vào đây...
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* 4. DATABASE EXPORT PANEL                */}
      {/* ======================================= */}
      {activeTab === "export" && (
        <div className="p-6 md:p-8 bg-white border rounded-[32px] animate-in fade-in space-y-8">
          {/* HEADER SECTION */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200/60">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Database className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  Trích Xuất Cơ Sở Dữ Liệu Admin (Export Data)
                </h2>
                <p className="text-slate-500 text-xs mt-1">
                  Đồng bộ và kết xuất toàn bộ bản ghi Firestore (classes, config, footnote_pages, lessons, nocode_revisions, users) thành một file JSON duy nhất để lưu trữ và phân tách.
                </p>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <button
                type="button"
                onClick={fetchCollectionStats}
                disabled={exportLoading}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw size={14} className={exportLoading ? "animate-spin" : ""} />
                Làm mới thống kê
              </button>

              <button
                type="button"
                onClick={handleExportDatabase}
                disabled={exportLoading}
                className="bg-green-600 hover:bg-green-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-50"
              >
                {exportLoading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Download size={14} />
                )}
                <span>EXPORT DATABASE</span>
              </button>
            </div>
          </div>

          {/* EXECUTING STATUS / PROGRESS */}
          {exportLoading && (
            <div className="p-5 bg-blue-50/50 border border-blue-100 rounded-2xl space-y-3.5 animate-in slide-in-from-top-2 text-left">
              <div className="flex justify-between items-center text-xs">
                <span className="font-extrabold text-blue-900 flex items-center gap-1.5">
                  <Loader2 size={14} className="animate-spin text-blue-600" />
                  {exportStatusText}
                </span>
                <span className="font-bold text-blue-600">{exportProgress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${exportProgress}%` }}
                />
              </div>
            </div>
          )}

          {exportStatusText && !exportLoading && (
            <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-2xl text-xs font-bold text-left animate-in slide-in-from-top-1">
              🎉 {exportStatusText}
            </div>
          )}

          {/* LIST OF COLLECTIONS */}
          <div className="text-left">
            <h3 className="font-extrabold text-[11px] text-slate-400 uppercase tracking-wider mb-4">
              Cơ cấu collections trích xuất ({Object.keys(exportStats).length})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(exportStats).map(([collName, stat]) => {
                const getDesc = (name: string) => {
                  switch (name) {
                    case "classes":
                      return "Danh sách lớp học trực quan.";
                    case "config":
                      return "Cấu hình layout và thiết lập tổng thể.";
                    case "footnote_pages":
                      return "Các trang footnote điều hướng CMS mượt mà.";
                    case "lessons":
                      return "Kho dữ liệu học tập và thử thách Python.";
                    case "nocode_revisions":
                      return "Nhật ký lưu vết thay đổi giao diện builder.";
                    case "users":
                      return "Dữ liệu người dùng, điểm thưởng và phân quyền.";
                    default:
                      return "";
                  }
                };

                return (
                  <div
                    key={collName}
                    className="p-5 border border-slate-100/80 rounded-2xl bg-slate-50/20 flex flex-col justify-between hover:border-slate-200 hover:bg-slate-50/40 transition-all shadow-xs"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-black text-xs text-slate-800 font-mono">
                          {collName}
                        </span>
                        <span>
                          {stat.status === "loading" && (
                            <span className="text-[10px] bg-amber-50 text-amber-600 border border-amber-100 px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                              <Loader2 size={10} className="animate-spin" />
                              Đang quét...
                            </span>
                          )}
                          {stat.status === "loaded" && (
                            <span className="text-[11px] bg-green-50 text-green-700 border border-green-100 px-2.5 py-0.5 rounded-full font-bold font-mono">
                              {stat.count} bản ghi
                            </span>
                          )}
                          {stat.status === "error" && (
                            <span className="text-[10px] bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded-md font-bold">
                              Lỗi tải
                            </span>
                          )}
                          {stat.status === "idle" && (
                            <span className="text-[10px] bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 rounded-md font-bold">
                              Chờ nạp
                            </span>
                          )}
                        </span>
                      </div>
                      <p className="text-slate-500 text-[11px] font-medium leading-relaxed">
                        {getDesc(collName)}
                      </p>
                    </div>

                    {stat.status === "error" && (
                      <p className="text-[9px] text-red-500 font-mono mt-3 max-h-12 overflow-y-auto bg-red-50/50 p-2 rounded">
                        {stat.error}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* EXPORT DATA PREVIEW PANEL */}
          {exportedPreview && (
            <div className="border border-slate-200/60 rounded-[28px] overflow-hidden p-6 bg-slate-50/35 space-y-4 text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-black text-slate-800">
                    Xem trước bản xem dữ liệu (Live JSON Preview)
                  </h4>
                  <p className="text-slate-500 text-[11px]">
                    Dữ liệu đã được định dạng và cấu trúc hóa thành công. Bạn có thể sao chép nhanh sang clipboard.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(exportedPreview, null, 2));
                    alert("Đã sao chép toàn bộ JSON vào Clipboard!");
                  }}
                  className="px-3.5 py-1.5 text-xs bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition cursor-pointer flex items-center justify-center gap-1 shrink-0 self-start sm:self-auto"
                >
                  <Copy size={12} />
                  <span>Sao chép JSON</span>
                </button>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 overflow-hidden shadow-inner">
                <pre className="font-mono text-[11px] text-slate-200 max-h-[300px] overflow-y-auto whitespace-pre-wrap text-left select-text scrollbar-thin">
                  {JSON.stringify(exportedPreview, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PERFECT LOGO 1:1 CROPPER MODAL DESIGN */}
      {logoUploadSrc && (
        <div className="fixed inset-0 z-[100100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setLogoUploadSrc(null)}
          />
          <div className="relative bg-white dark:bg-slate-900 rounded-[28px] max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 text-left">
            <h3 className="font-extrabold text-slate-900 dark:text-blue-100 text-sm mb-1.5 flex items-center gap-1.5">
              <span>🎨</span> Cắt ảnh logo tỉ lệ 1:1
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-[10px] mb-4">
              Kéo thanh trượt để thu phóng và căn chỉnh phần hình ảnh nằm giữa vòng tròn căn chỉnh tỉ lệ 1:1.
            </p>

            {/* Interactive Viewport */}
            <div className="flex flex-col items-center mb-5">
              <div 
                onMouseDown={(e) => {
                  setIsDraggingLogo(true);
                  setLogoDragStart({
                    pointerX: e.clientX,
                    pointerY: e.clientY,
                    offsetX: logoCropX,
                    offsetY: logoCropY,
                  });
                }}
                onMouseMove={(e) => {
                  if (!isDraggingLogo) return;
                  const dx = e.clientX - logoDragStart.pointerX;
                  const dy = e.clientY - logoDragStart.pointerY;
                  const zoomVal = (logoCropZoom / 100) || 1;
                  const newX = logoDragStart.offsetX + (dx / zoomVal);
                  const newY = logoDragStart.offsetY + (dy / zoomVal);
                  // Allow flexible coordinates based on zoom value
                  setLogoCropX(Math.max(-250, Math.min(250, newX)));
                  setLogoCropY(Math.max(-250, Math.min(250, newY)));
                }}
                onMouseUp={() => setIsDraggingLogo(false)}
                onMouseLeave={() => setIsDraggingLogo(false)}
                onTouchStart={(e) => {
                  if (e.touches.length === 1) {
                    setIsDraggingLogo(true);
                    setLogoDragStart({
                      pointerX: e.touches[0].clientX,
                      pointerY: e.touches[0].clientY,
                      offsetX: logoCropX,
                      offsetY: logoCropY,
                    });
                  }
                }}
                onTouchMove={(e) => {
                  if (!isDraggingLogo || e.touches.length !== 1) return;
                  const dx = e.touches[0].clientX - logoDragStart.pointerX;
                  const dy = e.touches[0].clientY - logoDragStart.pointerY;
                  const zoomVal = (logoCropZoom / 100) || 1;
                  const newX = logoDragStart.offsetX + (dx / zoomVal);
                  const newY = logoDragStart.offsetY + (dy / zoomVal);
                  setLogoCropX(Math.max(-250, Math.min(250, newX)));
                  setLogoCropY(Math.max(-250, Math.min(250, newY)));
                }}
                onTouchEnd={() => setIsDraggingLogo(false)}
                className={`relative w-40 h-40 rounded-full border-4 ${isDraggingLogo ? "border-blue-500 ring-4 ring-blue-500/20" : "border-amber-500"} shadow-md bg-slate-50 overflow-hidden flex items-center justify-center select-none touch-none ${isDraggingLogo ? "cursor-grabbing" : "cursor-move"}`}
                title="Kéo thả trực tiếp trên hình ảnh để di chuyển"
              >
                <img
                  src={logoUploadSrc}
                  alt="Logo Crop Tool"
                  style={{
                    transform: `scale(${logoCropZoom / 100}) translate(${logoCropX}px, ${logoCropY}px)`,
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                    transition: "none",
                  }}
                  className="pointer-events-none select-none"
                />
                
                {/* Visual guidelines */}
                <div className="absolute inset-2 border border-dashed border-white/50 rounded-full pointer-events-none" />
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-dashed border-white/20 pointer-events-none" />
                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 border-l border-dashed border-white/20 pointer-events-none" />
              </div>
              <span className="text-[9px] text-slate-400 mt-1.5 font-medium">💡 Chạm/Kéo thả ảnh trực tiếp để căn chỉnh</span>
            </div>

            {/* Adjustment Sliders */}
            <div className="space-y-3 text-[10px] font-sans font-bold">
              <div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400 mb-1">
                  <span>Thu phóng (Zoom): {logoCropZoom}%</span>
                  <span className="text-slate-400">100% - 400%</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="400"
                  value={logoCropZoom}
                  onChange={(e) => setLogoCropZoom(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-1 rounded-lg bg-slate-100 dark:bg-slate-800"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400 mb-1">
                  <span>Trục ngang (X): {Math.round(logoCropX)}px</span>
                  <span className="text-slate-400">-250px đến 250px</span>
                </div>
                <input
                  type="range"
                  min="-250"
                  max="250"
                  value={Math.round(logoCropX)}
                  onChange={(e) => setLogoCropX(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-1 rounded-lg bg-slate-100 dark:bg-slate-800"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400 mb-1">
                  <span>Trục dọc (Y): {Math.round(logoCropY)}px</span>
                  <span className="text-slate-400">-250px đến 250px</span>
                </div>
                <input
                  type="range"
                  min="-250"
                  max="250"
                  value={Math.round(logoCropY)}
                  onChange={(e) => setLogoCropY(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-1 rounded-lg bg-slate-100 dark:bg-slate-800"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 text-xs font-bold font-sans mt-6">
              <button
                type="button"
                className="px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 transition"
                onClick={() => setLogoUploadSrc(null)}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white transition font-extrabold"
                onClick={() => {
                  const img = new Image();
                  img.src = logoUploadSrc;
                  img.onload = () => {
                    const canvas = document.createElement("canvas");
                    canvas.width = 256;
                    canvas.height = 256;
                    const ctx = canvas.getContext("2d");
                    if (ctx) {
                      ctx.clearRect(0, 0, 256, 256);
                      
                      const zoom = logoCropZoom / 100;
                      const w = img.width;
                      const h = img.height;
                      const minDim = Math.min(w, h);
                      
                      const sWidth = minDim / zoom;
                      const sHeight = minDim / zoom;
                      
                      // Proportionally scale the visual offset back to original image coordinates
                      const xShift = (logoCropX / 160) * (minDim / zoom);
                      const yShift = (logoCropY / 160) * (minDim / zoom);
                      
                      const sx = (w - sWidth) / 2 - xShift;
                      const sy = (h - sHeight) / 2 - yShift;
                      
                      ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, 256, 256);
                      
                      const croppedDataUrl = canvas.toDataURL("image/png");
                      setNoCodeConfig((prev) => ({
                        ...prev,
                        systemSettings: {
                          ...prev.systemSettings,
                          headerLogoImage: croppedDataUrl,
                        },
                      }));
                      setLogoUploadSrc(null);
                    }
                  };
                }}
              >
                Áp dụng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PERFECT NON-BLOCKING CUSTOM CONFIRM DIALOG */}
      {confirmModal && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setConfirmModal(null)}
          />
          <div className="relative bg-white dark:bg-slate-900 rounded-[24px] max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 text-left">
            <h3 className="font-bold text-slate-900 dark:text-blue-100 text-sm mb-2 flex items-center gap-1.5">
              <span>⚠️</span> {confirmModal.title || "Xác nhận yêu cầu"}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-xs mb-5 leading-relaxed">
              {confirmModal.message}
            </p>
            <div className="flex justify-end gap-2 text-xs font-bold font-sans">
              <button
                type="button"
                className="px-4 py-2 rounded-xl bg-slate-55 hover:bg-slate-100 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition"
                onClick={() => setConfirmModal(null)}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-extrabold transition"
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal(null);
                }}
              >
                Đồng ý xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
