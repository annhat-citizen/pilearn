import React from 'react';
import { FootnoteCMSPage } from '../components/FootnoteCMSPage';

const defaultStoryContent = `
## Khởi đầu tự nhiên
Pilearn được sáng lập bởi một nhóm các nhà phát triển trẻ tại Vũng Tàu, với niềm đam mê cháy bỏng là chia sẻ kiến thức Python thực tiễn đến cộng đồng. Nhận thấy sự thiếu thốn về một không gian học lập trình bằng Tiếng Việt có tính tương tác cao và bám sát lộ trình, chúng tôi đã đặt nền móng đầu tiên cho Pilearn.

## Tầm nhìn và Sứ mệnh
Sứ mệnh của chúng tôi là biến việc học lập trình trở thành một hành trình thú vị, trực quan và dễ tiếp cận với tất cả mọi người, từ những bạn học sinh trung học phổ thông, sinh viên, cho đến những ai muốn chinh phục tri thức mới. Chúng tôi tin rằng bất cứ ai cũng có thể làm chủ Python nếu được dẫn dắt bằng một phương pháp đúng đắn.

## Tại sao lại là Pilearn?
Pilearn là sự giao thoa hài hòa giữa **Python** và **Learn**. Chữ **Pi (π)** đại diện cho một hằng số toán học vô hạn, thú vị và chứa đựng nhiều điều cần khám phá. Chúng tôi tin rằng quá trình học tập của mỗi con người cũng là một chuyến phiêu lưu bất tận không có lúc dừng lại.
`;

export function Story() {
  return (
    <FootnoteCMSPage 
      pageId="story"
      defaultTitle="Câu chuyện Pilearn"
      defaultDescription="Lịch sử sáng lập, tầm nhìn vô hạn và hành trình thắp sáng ngọn lửa lập trình Python dành cho học sinh Việt Nam."
      defaultContent={defaultStoryContent}
    />
  );
}
