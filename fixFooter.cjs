const fs = require('fs');

let storeContent = fs.readFileSync('src/lib/nocode_store.ts', 'utf-8');

const regex = /footerColumns:\s*\[[\s\S]*?\]\n    \},/g;

const replacement = `footerColumns: [
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
  socialLinks:`;

storeContent = storeContent.replace(/footerColumns:\s*\[[\s\S]*?socialLinks:/, replacement);
fs.writeFileSync('src/lib/nocode_store.ts', storeContent);
