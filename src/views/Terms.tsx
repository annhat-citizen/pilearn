import React from 'react';
import { FootnoteCMSPage } from '../components/FootnoteCMSPage';

const defaultTermsContent = `
Bằng việc đăng nhập và sử dụng dịch vụ của Pilearn, bạn xác nhận đã đọc, hiểu rõ và đồng ý với các điều khoản dưới đây.

## 1. Đăng ký & Tài khoản
Bạn phải cung cấp thông tin trung thực dựa trên tài khoản Google và chịu hoàn toàn trách nhiệm đối với các hoạt động diễn ra thông qua tài khoản cá nhân của bạn. Không được phép mượn hoặc chia sẻ tài khoản cho mục đích làm hộ bài thi hay gian lận học tập.

## 2. Bản quyền nội dung
Phần lớn nội dung, bài giảng và tài nguyên thuộc bản quyền của Pilearn. Việc sao chép, làm lại hay thực hiện hoạt động phân phối nhằm mục đích thương mại riêng tư khi chưa có sự cho phép bằng văn bản là vi phạm điều khoản.

## 3. Chuẩn mực cộng đồng & Hệ thống
Học viên phải tuân thủ chuẩn mực khi tương tác trong môi trường lớp học. Không sử dụng mã nguồn có chứa vi-rút, mã độc nhằm mục đích tấn công hệ thống chấm tự động (IDE) của chúng tôi. Hệ thống xử lý mã nguồn Python trong môi trường giới hạn (Sandboxed), mọi hành vi cố ý phá vỡ đều sẽ bị đóng băng tài khoản vĩnh viễn.

## 4. Thay đổi dịch vụ
Chúng tôi có quyền cập nhật, thay đổi hoặc ngừng hoạt động một số tính năng của dịch vụ bất cứ lúc nào để phục vụ việc bảo dưỡng, nâng cấp nền tảng mà không phải chịu trách nhiệm trước người dùng, dù đã có thể thông báo trước.

---
*Bản cập nhật gần nhất: Tháng 6, 2026*
`;

export function Terms() {
  return (
    <FootnoteCMSPage 
      pageId="terms"
      defaultTitle="Điều khoản sử dụng"
      defaultDescription="Sử dụng dịch vụ đúng cách, tuân thủ liêm chính học thuật và bảo vệ an toàn bảo mật hệ thống học lập trình."
      defaultContent={defaultTermsContent}
    />
  );
}
