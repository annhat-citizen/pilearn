import React from 'react';
import { FootnoteCMSPage } from '../components/FootnoteCMSPage';

const defaultDocsContent = `
Đây là kho tàng tài liệu, hướng dẫn chi tiết dành cho học sinh và giáo viên khi tham gia nền tảng Pilearn.

## 1. Dành cho Học sinh (Người học)
- **Bắt đầu như thế nào:** Mở mục **"Thực hành"**, chọn bài tập cơ bản và trải nghiệm việc học theo hình thức "No-Code" kết hợp kéo thả.
- **Tiến trình bài học:** Tại Tab **"Lộ trình Tin 10"**, mỗi bài học cung cấp lý thuyết song song với code thực tế. Hệ thống tự động chấm điểm và đánh dấu "Hoàn thành" cho mỗi chặng (checkpoints).
- **Trợ lý AI siêu tốc:** Khi mắc lỗi sai trong code ở môi trường IDE thu nhỏ, bạn chỉ việc gọi ngay nút "Debug với AI" – trợ lý ảo phân tích trực tiếp dòng mã sai sót và gợi ý giải phẫu lỗi mà bạn có thể đang gặp phải.

## 2. Dành cho Giáo viên (Quản lý)
- **Tạo phân lớp:** Sử dụng Menu **Trang Quản Trị Giáo Viên** để thêm học sinh qua Email và sắp xếp các lớp.
- **Tạo bài tập tự luận / trắc nghiệm:** Biên tập cấu trúc, tham số đầu vào và đầu ra để hệ thống chấm code tự động cho học sinh của mình.
- **Theo dõi thống kê học tập:** Nhận báo cáo năng suất, số giờ học, cũng điểm của học sinh tại các lớp phụ trách.

## 3. Kiến thức Bổ sung
Chúng tôi hỗ trợ hàng loạt thư viện trực quan trong Python. Hướng dẫn lập trình Game 2D với **Pygame Zero**, thư viện đồ họa Turtle hay tích hợp tương tác với AI.
`;

export function Docs() {
  return (
    <FootnoteCMSPage 
      pageId="docs"
      defaultTitle="Tài liệu hướng dẫn"
      defaultDescription="Cẩm nang sử dụng chi tiết hệ thống học và luyện lập trình Python."
      defaultContent={defaultDocsContent}
    />
  );
}
