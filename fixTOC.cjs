const fs = require('fs');
let content = fs.readFileSync('src/views/LessonView.tsx', 'utf-8');
content = content.replace(/hover:scale-105/g, '');
content = content.replace(/active:scale-95/g, '');
content = content.replace(/active:scale-98/g, '');
fs.writeFileSync('src/views/LessonView.tsx', content);
