import React from 'react';
import { FootnoteCMSPage } from '../components/FootnoteCMSPage';

const defaultPrivacyContent = `
Chào mừng bạn đến với Chính sách bảo mật của Pilearn. Việc bảo vệ thông tin cá nhân của bạn là ưu tiên hàng đầu của chúng tôi.

## 1. Thông tin chúng tôi thu thập
Chúng tôi tiến hành thu thập các thông tin bao gồm Tên, Email, Ảnh đại diện từ tài khoản Google của bạn khi bạn đăng nhập sử dụng hệ thống. Ngoài ra, chúng tôi lưu trữ tiến độ học tập, bài tập, điểm số và các hoạt động khác của bạn trên nền tảng nhằm phục vụ cho mục đích theo dõi lộ trình học tập.

## 2. Cách chúng tôi sử dụng thông tin
Thông tin của bạn được sử dụng để cá nhân hóa kết quả học tập, xếp hạng trên bảng điểm và cung cấp sự hỗ trợ dựa trên hoạt động thao tác thực hành của bạn. Điểm số của bạn có thể được hiển thị một cách công khai dưới hình thức xếp hạng trên bảng thi đua.

## 3. Chia sẻ thông tin
Chúng tôi cam kết không bán hoặc chia sẻ thông tin cá nhân cốt lõi của bạn cho bên thứ ba vì mục đích tiếp thị hoặc thương mại. Tuy nhiên, giáo viên và quản trị viên của lớp học mà bạn theo học trên hệ thống sẽ có quyền xem tiến trình, bài làm và điểm số của bạn để phục vụ việc đánh giá năng lực.

## 4. Bảo mật dữ liệu
Chúng tôi sử dụng cơ sở dữ liệu an toàn do Google Firebase cung cấp, được tích hợp với các quy tắc kiểm tra nghiêm ngặt, đảm bảo dữ liệu được mã hoá và lưu trữ một cách an toàn nhất.

---
*Bản cập nhật gần nhất: Tháng 6, 2026*
`;

export function Privacy() {
  return (
    <FootnoteCMSPage 
      pageId="privacy"
      defaultTitle="Chính sách bảo mật"
      defaultDescription="Cam kết bảo vệ tuyệt đối thông tin cá nhân của học sinh và nhà trường khi tham gia học lập trình."
      defaultContent={defaultPrivacyContent}
    />
  );
}
