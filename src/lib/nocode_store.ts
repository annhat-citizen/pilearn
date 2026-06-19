import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface NoCodeBlock {
  id: string;
  type: 'banner' | 'text' | 'html-rich-text' | 'video' | 'cta' | 'testimonial' | 'ai' | 'quiz' | 'game' | 'faq' | 'pricing';
  title?: string;
  subtitle?: string;
  content?: string;
  imageUrl?: string;
  videoUrl?: string;
  background?: string;
  buttonText?: string;
  // Testimonials list
  testimonials?: { name: string; school: string; avatar: string; quote: string; rating: number }[];
  // Quiz items
  quizQuestions?: { prompt: string; options: string[]; answer: number }[];
  // Game elements
  gameText?: string;
  gameExpectedAnswer?: string;
  gameHint?: string;
  // FAQ accordion
  faqItems?: { question: string; answer: string }[];
  // Pricing tiers
  pricingTiers?: { name: string; price: string; period: string; features: string[]; highlight: boolean }[];
  // Sizes / styling overrides
  align?: 'left' | 'center' | 'right';
  paddingY?: number;
  borderRadius?: number;
  fontSize?: number;
  scale?: number;
  fontFamily?: string;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline' | 'line-through' | 'underline line-through';
  textColor?: string;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  isLocked?: boolean;
  isHidden?: boolean;
  rotation?: number;
  blockBgColor?: string;
  blockBgGradient?: string;
  blockShadow?: string;
  blockBorderRadius?: number;
  blockBorderWidth?: number;
  blockBorderColor?: string;
  blockPaddingY?: number;
  blockPaddingX?: number;
}

export interface NoCodePage {
  id: string;
  name: string; // Tên trang tiếng Việt
  alias: string; // view alias (e.g., 'home', 'about')
  isPublished: boolean;
  publishSchedule?: string; // ISO date string
  blocks: NoCodeBlock[];
  appearance?: Partial<NoCodeAppearance>; // page-specific overrides
}

export interface NoCodeAppearance {
  primaryColor: string;
  backgroundColor: string;
  borderRadius: string; // 'none' | 'sm' | 'md' | 'lg' | 'full' | 'xl' | '2xl' | '3xl'
  fontSize: string; // text-sm, text-base, text-lg, text-xl, text-2xl, etc.
  fontFamily: string; // 'sans', 'mono', 'serif', 'grotesk', or custom font name
  customFontUrl?: string; // allow external font URL
  spacing: 'compact' | 'relaxed' | 'spacious';
  fontScale?: number; // accessibility zoom scale, default 100
  customUploadedFonts?: { name: string; url: string }[];
}

export interface SocialLink {
  id: string;
  platform: 'facebook' | 'twitter' | 'youtube' | 'instagram' | 'github' | 'tiktok' | 'custom';
  url: string;
  label?: string; // used for custom name/custom icon text
}

export interface CustomAudioEffect {
  url: string;
  volume: number; // 0 to 100
}

export interface AudioSettings {
  masterVolume?: number; // 0 to 100
  click?: CustomAudioEffect;
  success?: CustomAudioEffect;
  error?: CustomAudioEffect;
  levelUp?: CustomAudioEffect;
  xp?: CustomAudioEffect;
  hooray?: CustomAudioEffect;
  bgMusicUrl?: string;
  bgMusicVolume?: number; // 0 to 100
  bgMusicLoop?: boolean;
  bgMusicEnabled?: boolean;
  studyMusicUrl?: string;
  studyMusicVolume?: number; // 0 to 100
  studyMusicLoop?: boolean;
  studyMusicEnabled?: boolean;
  bossMusicUrl?: string;
  bossMusicVolume?: number; // 0 to 100
  bossMusicLoop?: boolean;
  bossMusicEnabled?: boolean;
}

export interface NoCodeSystemSettings {
  headerLogoText: string;
  headerLogoImage?: string;
  aboutText?: string;
  footerText: string;
  footerColumns: {
    id: string;
    title: string;
    links: { label: string; viewAlias: string; url?: string }[];
  }[];
  socialLinks?: SocialLink[];
  emailWelcomeSubject: string;
  emailWelcomeBody: string;
  systemNotification: string;
  showNotificationOnHome: boolean;
  galleryImages: string[];
  audioSettings?: AudioSettings;
  customUploadedFonts?: { name: string; url: string }[];
}

export interface RevisionHistory {
  id: string;
  updatedBy: string;
  updatedAt: string;
  changeDesc: string;
  savedPages: NoCodePage[];
  savedAppearance: NoCodeAppearance;
}

export interface SidebarSettings {
  position: 'left' | 'right';
  textColor: string;
  fontFamily: string;
}

export interface NoCodeConfig {
  pages: NoCodePage[];
  appearance: NoCodeAppearance;
  systemSettings: NoCodeSystemSettings;
  menus: { label: string; viewAlias: string; url?: string; order: number }[];
  sidebarSettings: SidebarSettings;
}

// Outstanding design defaults
export const DEFAULT_APPEARANCE: NoCodeAppearance = {
  primaryColor: '#F59E0B', // Amber 500 (more vibrant and kid friendly)
  backgroundColor: '#F8FAFC', // Slate 50 (cleaner, more modern)
  borderRadius: '3xl',
  fontSize: 'lg',
  fontFamily: 'grotesk',
  spacing: 'spacious',
};

export const DEFAULT_SYSTEM_SETTINGS: NoCodeSystemSettings = {
  headerLogoText: 'Pilearn NCT',
  aboutText: 'Nền tảng học lập trình thân thiện, vui nhộn và vô cùng hiệu quả dành cho mọi lứa tuổi học sinh, đồng hành bởi trợ lý AI siêu cấp.',
  footerText: '© 2026 Pilearn. Bản quyền thuộc về Đội ngũ GDPT Tin học 10.',
  footerColumns: [
    {
      id: 'col-1',
      title: 'Giới thiệu & Lộ trình',
      links: [
        { label: 'Câu chuyện Pilearn', viewAlias: 'about' },
        { label: 'Lộ trình Tin Học 10', viewAlias: 'roadmap' },
        { label: 'Tài nguyên Lớp học', viewAlias: 'student-dashboard' }
      ]
    },
    {
      id: 'col-2',
      title: 'Tài nguyên Python',
      links: [
        { label: 'Tài liệu hướng dẫn', viewAlias: 'docs' },
        { label: 'Luyện tập lập trình', viewAlias: 'practice' },
        { label: 'Môi trường IDE ảo', viewAlias: 'practice' }
      ]
    },
    {
      id: 'col-3',
      title: 'Chính sách & Pháp lý',
      links: [
        { label: 'Chính sách bảo mật', viewAlias: 'privacy' },
        { label: 'Điều khoản dịch vụ', viewAlias: 'terms' },
        { label: 'An toàn học đường', viewAlias: 'safety' }
      ]
    }
  ],
  socialLinks: [
    { id: 'fb-1', platform: 'facebook', url: 'https://facebook.com/pilearn' },
    { id: 'yt-1', platform: 'youtube', url: 'https://youtube.com/pilearn' },
    { id: 'gh-1', platform: 'github', url: 'https://github.com' }
  ],
  galleryImages: [
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=2022&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256'
  ],
  emailWelcomeSubject: 'Chúc mừng bạn gia nhập Học viện Pilearn! 🚀',
  emailWelcomeBody: 'Chào mừng người hùng mới! Hãy sẵn sàng khám phá thế giới lập trình Python tuyệt hảo cùng Trợ lý AI và hệ thống game thú vị.',
  systemNotification: 'Thông báo: Cuộc thi Hackathon dành cho học sinh THPT năm 2026 sắp diễn ra! ⏳',
  showNotificationOnHome: true,
  audioSettings: {
    masterVolume: 100,
    bgMusicVolume: 20,
    studyMusicVolume: 20,
    bossMusicVolume: 30,
    bossMusicLoop: true,
    bossMusicEnabled: true,
    bossMusicUrl: 'https://vincensolo.github.io/music/fight_boss.mp3', // A default fight music resource url (or similar) or SoundHelix or other free test mp3
  },
  customUploadedFonts: [],
};

export const DEFAULT_MENUS = [
  { label: 'Trang chủ', viewAlias: 'home', order: 0 },
  { label: 'Lộ trình', viewAlias: 'roadmap', order: 1 },
  { label: 'Bài học', viewAlias: 'student-dashboard', order: 2 },
  { label: 'Thực hành', viewAlias: 'practice', order: 3 },
  { label: 'Kiểm tra', viewAlias: 'exams', order: 4 },
];

export const INITIAL_NO_CODE_PAGES: NoCodePage[] = [
  {
    id: 'home',
    name: 'Trang chủ',
    alias: 'home',
    isPublished: true,
    blocks: [
      {
        id: 'hero-banner',
        type: 'banner',
        title: 'Học Python Lớp 10 Đầy Hứng Thú: Viết Dòng Code Đầu Tiên Sau 60 Giây!',
        subtitle: 'Chẳng cần giỏi Toán, không cần biết trước về máy tính. Bạn sẽ tự tay lập trình thông qua các màn "vượt ải" trực quan cực kỳ cuốn hút, tự tin rinh điểm 10 Tin học mà không phải ghi nhớ bài học một cách máy móc.',
        buttonText: 'Thử Gõ Code Ngay — Hoàn Toàn Miễn Phí',
        imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=2022&auto=format&fit=crop',
        align: 'left',
        paddingY: 16
      },
      {
        id: 'intro-text',
        type: 'text',
        title: '⚡ Sự Thật Cực Sốc: 95% Học Sinh Từng Sợ Tin Lớp 10 Đã Thay Đổi Nhờ Pilearn NCT!',
        content: `**Lập trình không phải cho thiên tài Toán học:** Bản chất của Python chỉ đơn thuần là việc xếp hình Lego bằng ngôn từ cực kỳ dễ hiểu. Nếu bạn biết soạn tin nhắn điện thoại để trò chuyện với bạn bè, bạn hoàn toàn đủ khả năng tự gõ và chạy code Python mượt mà ngay lập tức.\n\n**Không sợ lỗi đỏ lòm nhờ Sư Phụ AI bảo trợ 24/7:** Quên đi nỗi lo sợ gõ code báo lỗi dài dằng dặc bằng tiếng Anh mà không biết hỏi ai! Chỉ với 1 chạm, Sư Phụ AI cực kỳ thông thái của Pilearn sẽ chỉ ra chính xác vị trí lỗi bằng giọng văn siêu thân thiện, hướng dẫn bạn cách sửa đúng ngay tức khắc.\n\n**Chơi game nhập vai, học vui tích quà cực đỉnh:** Mỗi bài học Tin học 10 nay được thiết kế như một màn chinh phục thám hiểm. Bạn chỉ cần hoàn thành các câu đố ngắn để nhận Vàng tích lũy, sắm Kiếm Lửa và Khiên Thần tại Cửa Hàng, sẵn sàng đấu Boss lười biếng để thăng hoa điểm số!`,
        align: 'center',
        paddingY: 10
      },
      {
        id: 'learning-method',
        type: 'text',
        title: '💡 Phương Pháp Học Bản Chất & Trực Quan Tại Pilearn NCT',
        content: `**Học sâu bằng triết lý What - Why - How - Connection - Abstraction:**\n\n*   **Hiểu bản chất cốt lõi (What & Why):** Trực quan hóa mọi khái niệm bằng tiếng Việt quen thuộc, mộc mạc nhất. Giúp bạn nắm bắt vì sao máy tính lại chạy và hoạt động như vậy mà không cần học vẹt lý thuyết.\n*   **Thực hành mộc (How):** Mỗi bài giảng tích hợp ngay một **Vùng Học Thảo & Thử Nghiệm Tương Tác (IDE)**. Bạn có thể tự tay sửa chữ, chạy thử và khám phá kết quả hiển thị của code ngay tức thì.\n*   **Liên hệ thực tế (Connection):** Gắn kết những câu lệnh lập trình khô khan với các mô hình quen thuộc trong cuộc sống thực tế xung quanh bạn.\n*   **Tư duy khái quát (Abstraction):** Rèn luyện tư duy máy tính tinh tường để giải quyết những thách thức lớn thú vị và nâng tầm năng lực tư duy.`,
        align: 'left',
        paddingY: 10
      },
      {
        id: 'features-pricing',
        type: 'pricing',
        title: 'Chọn "Vũ Khí" Phù Hợp Để Chinh Phục Vũ Trụ Python Lớp 10',
        subtitle: 'Bắt đầu nhẹ nhàng không tốn một xu, hoặc nâng cấp lên gói Python Pro để bứt phá bảng xếp hạng và làm chủ tuyệt đối môn Tin học.',
        pricingTiers: [
          {
            name: 'Sơn Lâm Tập Sự (Miễn Phí)',
            price: 'Khởi đầu miễn phí',
            period: 'Trọn đời',
            features: [
              'Trải nghiệm trọn vẹn 2 chương nền tảng nhập môn siêu trực quan',
              'Được thực hành thực tế với 50+ câu đố code tương tác sinh động',
              'Săn Boss Rồng Tập Sự tích lũy điểm EXP thăng cấp',
              'Nhận sự hỗ trợ và sửa lỗi từ Trợ lý AI ở cấp độ căn bản'
            ],
            highlight: false
          },
          {
            name: 'Python Pro (Tháng)',
            price: '49k VND',
            period: 'Từng tháng linh hoạt',
            features: [
              'Mở khóa toàn bộ nội dung Lập trình Python (Chủ đề F) chuyên sâu',
              'Sư Phụ AI Python cao cấp hỗ trợ gỡ lỗi và thuật toán 24/7',
              'Nhận bộ rương báu: Kiếm Lửa & Gậy Thần hạ gục Boss',
              'Tham gia Đấu Trường code Python liên trường sôi động',
              'Chứng chỉ Coder Python danh giá được ký số tại Pilearn'
            ],
            highlight: false
          },
          {
            name: 'Python Pro (Năm)',
            price: '169k VND',
            period: 'Trọn gói một năm (Tiết kiệm nhất)',
            features: [
              'Tất cả quyền lợi của gói tháng',
              'Tiết kiệm hơn 70% so với mua lẻ từng tháng',
              'Ưu tiên trải nghiệm các tính năng lập trình mới nhất',
              'Hỗ trợ đặc biệt 1-1 từ đội ngũ chuyên gia Python',
              'Tặng Huy hiệu "Chiến Binh Rồng" vĩnh viễn trên trang cá nhân'
            ],
            highlight: true
          }
        ]
      },
      {
        id: 'tutor-ai-live',
        type: 'ai',
        title: '🤖 Bạn Gõ Code Báo Lỗi? Có Sẵn Trợ Lý AI "Viết Lại Tiếng Việt" Sau 1 Giây!',
        subtitle: 'Không còn cảm giác bế tắc trước những thông báo lỗi tiếng Anh học thuật khô khan. Hãy nhập dòng code bị lỗi của bạn ngay bên dưới, Sư Phụ AI sẽ dịch nghĩa mộc mạc và bày cách xử lý lý thú nhất!'
      },
      {
        id: 'learning-game',
        type: 'game',
        title: '🎮 Thử Thách 10 Giây: Tự Tay Tạo Ra Phép Thuật Python Đầu Tiên',
        subtitle: 'Chỉ cần điền tên của bạn vào phần gạch dưới để chạy chương trình Python thực tế. Trải nghiệm cảm giác chạy code thành công và lấy gọn điểm thưởng EXP đầu tiên!',
        gameText: 'name = "_____"\nprint("Xin chào chiến binh " + name)',
        gameExpectedAnswer: 'Pilearn',
        gameHint: 'Gõ chữ "Pilearn" thay cho dấu gạch dưới để in ra "Xin chào chiến binh Pilearn"'
      },
      {
        id: 'faq-block',
        type: 'faq',
        title: '🤔 Những Lăn Tăn Thường Gặp Nhất Của Các "Tân Binh"',
        faqItems: [
          {
            question: 'Em siêu dốt Toán và kém Ngoại ngữ thì có học lập trình được không?',
            answer: 'Hoàn toàn được em nha! Python tại Pilearn sử dụng các câu lệnh cực kỳ ngắn gọn và giống như tiếng Anh giao tiếp thông thường. Bản chất của việc code ở đây rất trực quan qua sơ đồ kéo thả và các khối màu, em không cần học lý thuyết toán hay tiếng Anh nâng cao vẫn có thể tự hào viết code ngon ơ.'
          },
          {
            question: 'Trang web có giúp em đạt điểm cao môn Tin học 10 trên lớp thực tế?',
            answer: 'Chắc chắn rồi! Nội dung tại Pilearn được đội ngũ chuyên gia biên soạn, bám sát 100% khung chương trình sách giáo khoa Tin học 10 mới (Cánh Diều, Kết Nối Tri Thức, Chân Trời Sáng Tạo). Em sẽ được cọ xát đầy đủ cả trắc nghiệm lẫn tự luận thực hành viết code chuẩn chỉ.'
          },
          {
            question: 'Tại sao việc rèn luyện của Pilearn lại gắn liền với diệt Boss hay Cửa Hàng?',
            answer: 'Để xóa tan đi sự nhàm chán của việc học chép tay truyền thống, Pilearn áp dụng cơ chế game nhập vai (RPG). Việc giải câu đố code giống như làm nhiệm vụ tích Vàng mua đạo cụ Kiếm Lửa, Khiên Thần trong Shop, giúp tinh thần tự học của em được kích thích cực kỳ sướng mắt và tăng dần động lực tiến bộ ngày qua ngày.'
          }
        ]
      },
      {
        id: 'students-testimonials',
        type: 'testimonial',
        title: '💬 Sự Thay Đổi Kỳ Diệu Từ Cộng Đồng Người Học',
        subtitle: 'Cùng nghe các chia sẻ chân tình, thực thụ từ các bạn học sinh lớp 10 đã lấy lại hoàn toàn sự tự tin với môn Tin học.',
        testimonials: [
          {
            name: 'Nguyễn Minh Quân',
            school: 'Lớp 10 Tin, THPT Chuyên Nguyễn Huệ',
            avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=256',
            quote: 'Ngày trước em sợ phát khiếp mỗi lần đến tiết Tin 10 vì nhiều chữ khô khan quá. Từ ngày cày ải giải đố trên Pilearn, em tự tin tự làm được game bắn chim mini cho bạn bè chơi cùng! Kỳ thi cuối kỳ em đạt điểm 9.8 đứng top lớp luôn!',
            rating: 5
          },
          {
            name: 'Cô Trần Mai Lan',
            school: 'Giáo viên Tin Học, THPT Phan Đình Phùng, Hà Nội',
            avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=256',
            quote: 'Lần đầu tiên trong đời học sinh tự giác thúc giục nhau nộp bài tập lập trình! Thiết kế trò chơi hóa tuyệt đỉnh kết hợp Trợ lý AI của Pilearn đã giúp tôi bớt tới 80% áp lực chuẩn bị giáo án và mang lại hiệu ứng học tập tuyệt vời cho lớp.',
            rating: 5
          }
        ]
      }
    ]
  },
  {
    id: 'about',
    name: 'Giới thiệu',
    alias: 'about',
    isPublished: true,
    blocks: [
      {
        id: 'about-banner',
        type: 'banner',
        title: 'Khơi Dậy Cảm Hứng Lập Trình Cho Thế Hệ Mới',
        subtitle: 'Sứ mệnh của chúng tôi là biến giáo dục công nghệ trở nên tiếp cận được, dễ thương và hứng khởi hơn với mọi học sinh Việt Nam.',
        imageUrl: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=2070&auto=format&fit=crop',
        paddingY: 10
      },
      {
        id: 'about-content',
        type: 'text',
        title: 'Động Lực Đằng Sau Pilearn',
        content: `Chúng tôi nhận thấy học sinh THPT thường gặp khủng hoảng trước lập trình vì cách dạy truyền thống quá nặng nề lý thuyết khô khan. 

Vì vậy, bằng phương pháp **Game hóa (Gamification)** tinh tế, chúng tôi xây dựng Pilearn để mỗi giờ học lập trình trôi qua như một chuyến phiêu lưu giải trí thú vị, đồng thời hỗ trợ tối lực cho định hướng Tin Học phổ thông lớp 10.`,
        align: 'left'
      }
    ]
  }
];

function getStringHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return `h${Math.abs(hash)}`;
}

function getMediaVault(): Record<string, string> {
  try {
    const saved = localStorage.getItem('pilearn_media_vault');
    return saved ? JSON.parse(saved) : {};
  } catch (e) {
    return {};
  }
}

function saveMediaVault(vault: Record<string, string>) {
  try {
    localStorage.setItem('pilearn_media_vault', JSON.stringify(vault));
  } catch (e) {
    console.error('Error saving media vault to localStorage:', e);
  }
}

export function sanitizeObjectForFirestore(obj: any): any {
  const vault = getMediaVault();
  let changed = false;

  function recurse(val: any): any {
    if (val === null || val === undefined) return val;

    if (typeof val === 'string') {
      // If a string is a giant base64 or data URL (image, font, audio), extract to local vault and truncate for cloud DB
      if (val.length > 50000 && (val.startsWith('data:') || val.includes(';base64,'))) {
        const hash = getStringHash(val);
        if (!vault[hash]) {
          vault[hash] = val;
          changed = true;
        }
        return `[TRUNCATED_BASE64:${hash}:${val.substring(0, 40)}...]`;
      }
      return val;
    }

    if (Array.isArray(val)) {
      return val.map(item => recurse(item));
    }

    if (typeof val === 'object') {
      const copy: any = {};
      for (const key of Object.keys(val)) {
        copy[key] = recurse(val[key]);
      }
      return copy;
    }

    return val;
  }

  const result = recurse(obj);
  if (changed) {
    saveMediaVault(vault);
  }
  return result;
}

export function restoreObjectFromVault(obj: any): any {
  const vault = getMediaVault();

  function recurse(val: any): any {
    if (val === null || val === undefined) return val;

    if (typeof val === 'string') {
      if (val.startsWith('[TRUNCATED_BASE64:')) {
        const match = val.match(/^\[TRUNCATED_BASE64:([^:]+):/);
        if (match && match[1]) {
          const hash = match[1];
          if (vault[hash]) {
            return vault[hash];
          }
        }
      }
      return val;
    }

    if (Array.isArray(val)) {
      return val.map(item => recurse(item));
    }

    if (typeof val === 'object') {
      const copy: any = {};
      for (const key of Object.keys(val)) {
        copy[key] = recurse(val[key]);
      }
      return copy;
    }

    return val;
  }

  return recurse(obj);
}

export const DEFAULT_SIDEBAR_SETTINGS: SidebarSettings = {
  position: 'left',
  textColor: '#475569',
  fontFamily: 'sans'
};

export function getLocalNoCodeConfig(): NoCodeConfig {
  try {
    const saved = localStorage.getItem('pilearn_nocode_layout_config');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error parsing local nocode config:', e);
  }

  return {
    pages: INITIAL_NO_CODE_PAGES,
    appearance: DEFAULT_APPEARANCE,
    systemSettings: DEFAULT_SYSTEM_SETTINGS,
    menus: DEFAULT_MENUS,
    sidebarSettings: DEFAULT_SIDEBAR_SETTINGS
  };
}

export function saveLocalNoCodeConfig(config: NoCodeConfig) {
  try {
    localStorage.setItem('pilearn_nocode_layout_config', JSON.stringify(config));
    window.dispatchEvent(new Event('pilearn_config_sync'));
  } catch (e) {
    console.error('Error saving local config', e);
  }
}

export async function fetchNoCodeConfigDb(): Promise<NoCodeConfig> {
  const localConfig = getLocalNoCodeConfig();
  try {
    const docRef = doc(db, 'config', 'nocode_layout');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const dbData = snap.data() as Partial<NoCodeConfig>;
      
      const mergedConfig = {
        pages: dbData.pages || localConfig.pages,
        appearance: dbData.appearance || localConfig.appearance,
        systemSettings: dbData.systemSettings || localConfig.systemSettings,
        menus: dbData.menus || localConfig.menus,
        sidebarSettings: dbData.sidebarSettings || localConfig.sidebarSettings
      };
      const restoredConfig = restoreObjectFromVault(mergedConfig);
      saveLocalNoCodeConfig(restoredConfig); // keep in sync
      return restoredConfig;
    } else {
      // If no document exists in the remote database, populate it for the first time
      const initMerged: NoCodeConfig = {
        pages: INITIAL_NO_CODE_PAGES,
        appearance: DEFAULT_APPEARANCE,
        systemSettings: DEFAULT_SYSTEM_SETTINGS,
        menus: DEFAULT_MENUS,
        sidebarSettings: DEFAULT_SIDEBAR_SETTINGS
      };
      setDoc(docRef, initMerged).catch(err => console.error('Error seeding DB on first fetch:', err));
      saveLocalNoCodeConfig(initMerged);
      return initMerged;
    }
  } catch (e) {
    console.warn('DB read failed, fallback to local:', e);
  }
  return localConfig;
}

export async function saveNoCodeConfigDb(config: NoCodeConfig, authorEmail: string, changeDesc: string) {
  // Always save complete config with full media strings to localStorage
  saveLocalNoCodeConfig(config);
  
  // Create sanitized copy without giant base64 strings for Firestore
  const sanitizedConfig = sanitizeObjectForFirestore(config);
  
  // Write to Firebase Firestore
  try {
    const docRef = doc(db, 'config', 'nocode_layout');
    await setDoc(docRef, sanitizedConfig);
    
    // Add revision history logs entry with slimmed pages/appearance
    const historyCol = doc(db, 'nocode_revisions', `${Date.now()}`);
    await setDoc(historyCol, {
      updatedBy: authorEmail || 'admin@pilearn.com',
      updatedAt: new Date().toISOString(),
      changeDesc: changeDesc || 'Cập nhật giao diện quản trị',
      savedPages: sanitizedConfig.pages,
      savedAppearance: sanitizedConfig.appearance
    });
  } catch (e) {
    console.error('Firebase save error:', e);
    
    // Save locally to custom revisions
    try {
      const savedHistories = localStorage.getItem('pilearn_revisions_history');
      const list = savedHistories ? JSON.parse(savedHistories) : [];
      list.unshift({
        id: `${Date.now()}`,
        updatedBy: authorEmail || 'Local Admin',
        updatedAt: new Date().toISOString(),
        changeDesc: changeDesc || 'Cập nhật giao diện quản trị (Local)',
        savedPages: config.pages,
        savedAppearance: config.appearance
      });
      localStorage.setItem('pilearn_revisions_history', JSON.stringify(list));
    } catch (e2) {}

    // IMPORTANT: Re-throw to inform the UI that the cloud save failed
    throw e;
  }
}

export function getLocalRevisionHistories(): RevisionHistory[] {
  try {
    const saved = localStorage.getItem('pilearn_revisions_history');
    if (saved) return JSON.parse(saved);
  } catch {}
  return [
    {
      id: 'init-rev',
      updatedBy: 'system@pilearn.com',
      updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      changeDesc: 'Khởi tạo bố cục các khối sơ bộ trang web',
      savedPages: INITIAL_NO_CODE_PAGES,
      savedAppearance: DEFAULT_APPEARANCE
    }
  ];
}
