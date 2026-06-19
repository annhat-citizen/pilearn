import React from 'react';
import { FootnoteCMSPage } from '../components/FootnoteCMSPage';

const defaultSafetyContent = `
Môi trường Không gian mạng an toàn là ưu tiên tuyệt đối nhằm đem lại một trải nghiệm học tập trong sáng, văn minh cho thế hệ tương lai.

## 1. Hệ thống Ngôn từ Tích cực
Pilearn luôn tuân thủ nguyên tắc ngăn chặn các hành vi sử dụng ngôn từ bạo lực, xúc phạm hay kích động trong phần trò chuyện cộng đồng, thông tin trường, lớp hay bình luận trên bài giải mã. 
Một hệ thống kiểm duyệt tin nhắn (AI-Powered Filter) liên tục được triển khai, mọi tin nhắn vi phạm sẽ không được hiển thị. 

## 2. Bảo mật Độ tuổi
Không gian phần mềm được thiết kế vô cùng đơn giản, các liên kết bên thứ ba nếu có luôn hướng tới mục đích giáo dục. Chúng tôi hạn chế thu thập và phân loại người dùng (hồ sơ học viên) một cách công khai ra các nền tảng khác để tránh nguy cơ theo dõi, theo dõi dấu vết qua cookie thương mại.

## 3. Lên Án & Xử Lý Bắt Nạt Trực Tuyến
Pilearn không khoan nhượng với bất cứ dấu hiệu nào của bạo lực, tẩy chay hoặc quấy rối gián tiếp qua môi trường học tập điện tử.
Học sinh và Giáo viên có thể trực tiếp Báo cáo những hành vi không chuẩn mực gửi đến chúng tôi để đội ngũ Ban Quản Trị xem xét, đình chỉ hoặc xoá bỏ tài khoản vi phạm một cách ngay lập tức.
`;

export function Safety() {
  return (
    <FootnoteCMSPage 
      pageId="safety"
      defaultTitle="An toàn học đường"
      defaultDescription="Kiến tạo môi trường học điện tử lành mạnh, trong sáng và văn minh tuyệt đối cho thế hệ tương lai."
      defaultContent={defaultSafetyContent}
    />
  );
}
