import React from 'react';
import { FootnoteCMSPage } from '../components/FootnoteCMSPage';

const defaultHelpContent = `
## Câu hỏi thường gặp (FAQs)

### 1. Làm thế nào để tải IDE cho máy tính?
Pilearn cung cấp trình biên dịch Python và IDE tích hợp sẵn vào ngay chính hệ thống. Bạn chỉ cần mở trình duyệt và làm bài, kể cả trên điện thoại di động hay PC mà không cần cài đặt thêm phần mềm nào.

### 2. Làm sao để khôi phục lớp học của mình nếu vô tình bị thoát?
Tài khoản của bạn gắn kết tự động bằng Google, khi đăng nhập lại, hệ thống sẽ bảo lưu toàn bộ tiến độ lớp học mà bạn từng vào. Bạn cũng có thể liên hệ với giáo viên chủ nhiệm nếu bạn không thể nhìn thấy lớp học đó nữa.

### 3. Điểm thưởng thực hành dùng để làm gì?
Bên cạnh thành tích khoe trong bảng tổng sắp, trong tương lai số điểm này dùng để gia nhập vào các nhóm cao cấp, và mở khóa học phần chứng chỉ đặc biệt của nền tảng.

---

## Các Cương Vị Liên Hệ Hỗ Trợ Khác

* **Hỗ trợ qua thư (Email):** Nhắn tin vấn đề của bạn qua hòm thư điện tử: **support@pilearn.com**, chúng tôi sẽ phản hồi trong 24 giờ làm việc.
* **Nhóm cộng đồng Zalo/Facebook:** Vui lòng nhấn truy cập Fanpage Facebook của Pilearn hoặc liên hệ Group Zalo lớp học của giáo viên chủ nhiệm cấp để tương tác cùng học sinh khác!
`;

export function HelpCenter() {
  return (
    <FootnoteCMSPage 
      pageId="help"
      defaultTitle="Trung tâm Trợ giúp"
      defaultDescription="Cần hỗ trợ học tập? Đội ngũ Pilearn luôn sẵn sàng giải đáp mọi thắc mắc của các bạn học viên."
      defaultContent={defaultHelpContent}
    />
  );
}
