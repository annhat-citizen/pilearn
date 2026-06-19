import { Chapter } from './types';

export const SYLLABUS: Chapter[] = [
  {
    id: 'ch1',
    title: 'Chương 1: Làm quen với Python và Biến',
    description: 'Giới thiệu ngôn ngữ, chế độ lập trình và các khái niệm biến cơ bản.',
    lessons: [
      {
        id: 'l16',
        title: 'Bài 16: Ngôn ngữ lập trình bậc cao và Python',
        theory: [
          '# 🚀 **BÀI 16: NGÔN NGỮ LẬP TRÌNH BẬC CAO VÀ PYTHON**',
          '',
          '## 🌟 **1. Triết Lý Học Chuẩn PiLearn (What & Why)**',
          '*   ⚡ **Ngôn ngữ bậc cao (What):** Là những ngôn ngữ viết ra vô cùng gần gũi với tiếng Anh tự nhiên của con người (như lệnh `print()`, `input()`), giúp bạn rũ bỏ nỗi sợ giao tiếp bằng những dãy số nhị phân `0101` vô hồn của máy móc.',
          '*   🧭 **Tại sao lại chọn Python? (Why):** Trình làng bởi Guido van Rossum vào năm 1991, Python sở hữu cú pháp tối giản bất ngờ. Thay vì bắt bạn gỡ 10 dòng khai báo dài dằng dặc như các ngôn ngữ khác, Python chỉ cần 1 dòng lệnh siêu tốc để hiện thực hóa ước mơ lập trình!',
          '',
          '---',
          '',
          '## 💻 **2. Vùng Học Thảo & Thử Nghiệm Tương Tác (How)**',
          '*   *Hãy bấm nút **"Thực Thi Toàn Bộ"** ở khung biên dịch bên dưới để tự mình tận mắt thấy cách Python trò chuyện với bạn nhé!*',
          '',
          '```python',
          '# Sửa chữ bên trong dấu ngoặc kép tùy thích rồi chạy lại thử nhé!',
          'print("Xin chào! Mình là chú robot nhỏ chạy bằng Python đây!")',
          'print("Năm nay là năm học:")',
          'print(2026)',
          '```',
          '',
          '---',
          '',
          '## 💼 **3. Thử Thách "Sếp Ra Lệnh" - Cấp Độ 1 (Practice & Experiment)**',
          '> ### 👨‍💼 **SẾP TÙNG TRƯỞNG PHÒNG RA LỆNH:**',
          '> *"Này chiến binh! Công ty chúng ta chuẩn bị khai trương cửa hàng đầu tiên trên Sao Hỏa. Sếp ra lệnh cho cậu sửa đoạn code bên dưới, in ra màn hình chính xác biểu thức chào mừng sau:*',
          '> `Chào mừng các cư dân Sao Hỏa đến với Trại Lập Trình Pilearn!`',
          '> *Sau đó tính hóa đơn mua sắm gồm 15 triệu tiền đồ ăn nhân 3 tháng bằng cách tự động in biểu thức toán học. Đừng tính nhẩm, bắt Python gánh vác!"*',
          '',
          '*👉 Hãy gõ sửa trực tiếp hoặc viết tiếp vào trình soạn thảo dưới đây rồi ấn **"Thực Thi Toàn Bộ"** để sếp duyệt kết quả nhé!*',
          '',
          '```python',
          '# Viết code của bạn tại đây để đáp ứng mệnh lệnh của Sếp!',
          'print("Chào mừng các cư dân Sao Hỏa đến với Trại Lập Trình Pilearn!")',
          'print("Tổng chi phí ăn uống 3 tháng là:")',
          'print(15 * 3)',
          '```',
          '',
          '---',
          '',
          '## 🌐 **4. Sợi Dây Liên Hệ Thực Tế (Connection)**',
          '*   Hãy tưởng tượng việc lập trình bằng **Ngôn ngữ máy (0101)** cũng giống như việc bạn phải liên lạc điện thoại bằng **mã Morse (Tít - Te)** của thế kỷ trước: cực kỳ khó nhớ và tốn sức vô biên.',
          '*   Trong khi đó, lập trình bằng **Python** tựa như bạn cầm micro nói thẳng bằng tiếng mẹ đẻ của ngôn ngữ tự nhiên. Trình biên dịch của Python đóng vai trò là một người thông dịch viên cực kỳ thông thạo, tức tốc dịch mã nguồn của bạn sang dạng xung điện mà CPU trong máy tính có thể lập tức hiểu và hành động.',
          '',
          '---',
          '',
          '## 🧠 **5. Tư Duy Trừu Tượng Toàn Diện (Abstraction)**',
          '*   Trong khoa học máy tính, khái niệm **"Trừu tượng hóa" (Abstraction)** hiểu nôm na chính là "giấu kín những chi tiết linh kiện máy móc rối rắm bên dưới để hiển lộ những công cụ đơn giản phía trên".',
          '*   Hiểu được ranh giới này, bạn sẽ không còn sợ hãi phần cứng, tự tin kiến tạo dự án lớn bằng cách dẫm trên bệ phóng của các nền tảng trừu tượng thông minh!'
        ].join('\n'),
        mindmapUrl: 'https://whimsical.com/embed/S2pE8sH3vH5dMh91r2Hbbz',
        simulationUrl: 'https://phet.colorado.edu/sims/html/projectile-motion/latest/projectile-motion_en.html',
        flashcards: [
          { id: 'f1', front: 'Ngôn ngữ lập trình bậc cao là gì?', back: 'Là ngôn ngữ có câu lệnh viết gần với ngôn ngữ tự nhiên (thường là tiếng Anh).' },
          { id: 'f2', front: 'Chương trình dịch là gì?', back: 'Là chương trình chuyên dụng để dịch câu lệnh bậc cao sang ngôn ngữ máy.' },
          { id: 'f3', front: 'Môi trường Python có 2 chế độ hoạt động nào?', back: 'Chế độ gõ lệnh trực tiếp và Chế độ soạn thảo.' },
          { id: 'f4', front: 'Lệnh nào dùng để đưa dữ liệu ra màn hình?', back: 'Lệnh print()' }
        ],
        miniQuiz: [
          {
            id: 'q1', type: 'multiple_choice', prompt: 'Python do ai tạo ra và ra mắt lần đầu năm nào?',
            options: ['Dennis Ritchie, 1972', 'Guido van Rossum, 1991', 'Bjarne Stroustrup, 1985', 'James Gosling, 1995'],
            correctOptionIndex: 1
          },
          {
            id: 'q2', type: 'multiple_choice', prompt: 'Để chạy chương trình Python trong cửa sổ soạn thảo, ta dùng phím tắt nào?',
            options: ['F1', 'F5', 'Ctrl + S', 'F11'],
            correctOptionIndex: 1
          },
          {
            id: 'q3', type: 'true_false', prompt: 'Trong Python, lệnh print() xuất nhiều giá trị cách nhau bởi dấu phẩy sẽ in chúng trên cùng một dòng, phân tách bằng dấu cách.',
            correctAnswerBool: true
          },
          {
            id: 'q4', type: 'true_false', prompt: 'Chỉ số ">>>" đại diện cho dấu nhắc làm việc trong Chế độ soạn thảo của Python.',
            correctAnswerBool: false
          }
        ],
        interactiveGames: [
          {
            id: 'g1_l16',
            type: 'drag_words',
            title: 'Kéo thả từ khóa lập trình Python',
            content: 'Python là ngôn ngữ lập trình [*bậc cao*] có cú pháp vô cùng giản dị. Để dịch các câu lệnh này sang ngôn ngữ máy, cần có một [*chương trình dịch*]. Môi trường Python hỗ trợ viết các câu lệnh nhanh chóng tại [*chế độ gõ lệnh trực tiếp*], hoặc soạn thảo chương trình gồm nhiều dòng lệnh bằng [*chế độ soạn thảo*].',
            hint: 'Hãy nhớ rằng ngôn ngữ bậc cao cần chương trình dịch để chuyển sang ngôn ngữ máy, và chế độ gõ lệnh nhanh trực tiếp dùng dấu nhắc >>>.'
          },
          {
            id: 'g2_l16',
            type: 'sort_paragraphs',
            title: 'Sắp xếp các bước thực hiện chạy chương trình Python',
            content: 'Khởi động môi trường Python (IDLE).\nChọn File -> New File để mở cửa sổ soạn thảo.\nGõ lệnh print("Xin chào!") vào tệp vừa mở.\nChọn File -> Save và lưu tệp dưới tên Bai1.py.\nNhấn phím F5 để chạy chương trình.',
            hint: 'Theo đúng thứ tự: Khởi động -> Mở File -> Viết Code -> Lưu File -> Chạy.'
          },
          {
            id: 'g3_l16',
            type: 'fill_blanks',
            title: 'Thử thách cú pháp lệnh print()',
            content: 'Để in ra màn hình chuỗi kí tự trong Python, ta dùng lệnh [print]("Xin chào"). Nếu muốn in ra giá trị phép tính cộng 5 + 6, ta gõ [print](5+6). Khi muốn xuất ra nhiều xâu kí tự cùng lúc, ta cách chúng bằng dấu [phẩy] bên trong dấu ngoặc.',
            hint: 'Lệnh xuất ra màn hình là print và phân tách các phần tử bằng dấu phẩy.'
          }
        ],
        labPrompt: 'Tạo chương trình in ra lời chào "Xin chào!" bằng lệnh print().',
        labExpectedCode: 'print("Xin chào!")',
        challengePrompt: 'Viết câu lệnh in ra kết quả của phép toán nhân 5 * 2.6',
        challengeExpectedCode: 'print(5 * 2.6)'
      },
      {
        id: 'l17',
        title: 'Bài 17: Biến và lệnh gán',
        theory: [
          '# **Bài 17: BIẾN VÀ LỆNH GÁN**',
          '',
          '## **1. Khái niệm (What + Why)**',
          '* **Biến (What):** Là tên gọi đại diện cho một phân vùng trong bộ nhớ máy tính để trữ một giá trị dữ liệu bất kỳ (số nguyên, số thực, văn bản...).',
          '* **Phép gán (What):** Sử dụng ký tự `=` để đưa giá trị từ vế phải vào biến ở vế trái.',
          '* **Tại sao cần biến (Why):** Hãy hình dung chương trình giống như việc quản lý kho bãi. Nếu không dán nhãn đặt tên các hộp chứa đồ ("Biến"), bạn sẽ không tài nào nhớ nổi món đồ nằm ở đâu để lấy ra tính toán hay thay đổi.',
          '',
          '## **2. Ví dụ đơn giản (How)**',
          '```python',
          'soluong = 15',
          'dongia = 20000',
          'thanhtien = soluong * dongia',
          'print("Tổng tiền của bạn là:", thanhtien)',
          '```',
          '* Quy tắc đặt tên biến trong Python:',
          '  * Không bắt đầu bằng số.',
          '  * Chỉ chứa các chữ cái, số và dấu gạch dưới `_`.',
          '  * Phân biệt chữ hoa và chữ thường (ví dụ: `diem` khác `DIEM`).',
          '  * Không trùng tên từ khoá của Python (`if`, `for`, `while`, ...).',
          '',
          '## **3. Bài tập căn bản (Practice)**',
          '* **Đề bài:** Tạo biến `canh` gán giá trị `5`. Tính chu vi và diện tích hình vuông, sau đó in chúng ra màn hình.',
          '* **Hướng dẫn:**',
          '```python',
          'canh = 5',
          'chuvi = canh * 4',
          'dientich = canh * canh',
          'print("Chu vi:", chuvi)',
          'print("Diện tích:", dientich)',
          '```',
          '',
          '## **4. Liên hệ với dạng khác (Connection)**',
          '* **Tính biến động:** Khác với biến số lý thuyết trong môn Toán học thường đi kèm các phương trình tĩnh (như `x = 10` cố định), biến trong lập trình là động. Ta có thể viết `x = x + 1`, nghĩa là lấy giá trị hiện tại của `x` cộng thêm 1, sau đó đè ngược kết quả lại vào hộp tên `x`.',
          '',
          '## **5. Nâng cao và tư duy tổng quát (Abstraction)**',
          '* Biến là sự phản ánh của cơ chế quản lý thanh ghi và RAM. Việc bọc RAM vật lý thành những chiếc "hộp dán nhãn" giúp lập trình viên vận hành chương trình cực kỳ thông minh mà không sợ bị loạn mã vùng nhớ vật lý dồn dập.'
        ].join('\n'),
        mindmapUrl: 'https://whimsical.com/embed/S2pE8sH3vH5dMh91r2Hbbz',
        flashcards: [
          { id: 'f1_l17', front: 'Kí tự nào đại diện cho phép gán trong Python?', back: 'Kí tự dấu bằng "="' },
          { id: 'f2_l17', front: 'Tên biến "12abc" có hợp lệ không?', back: 'Không hợp lệ vì tên biến không được bắt đầu bằng chữ số.' },
          { id: 'f3_l17', front: 'Phép gán a = b nghĩa là gì?', back: 'Gán giá trị nằm trong biến b cho biến a.' },
          { id: 'f4_l17', front: 'Từ khoá trong Python có được đặt làm tên biến không?', back: 'Tuyệt đối không được trùng với các từ khoá hệ thống.' }
        ],
        miniQuiz: [
          {
            id: 'q1_l17', type: 'multiple_choice', prompt: 'Tên biến nào sau đây là hợp lệ trong Python?',
            options: ['my-variable', '_diem_10', '9x_score', 'if'],
            correctOptionIndex: 1
          },
          {
            id: 'q2_l17', type: 'multiple_choice', prompt: 'Cho x = 10, y = 5. Lệnh x = x + y gán cho x giá trị bao nhiêu?',
            options: ['5', '10', '15', '20'],
            correctOptionIndex: 2
          },
          {
            id: 'q3_l17', type: 'true_false', prompt: 'Python phân biệt chữ hoa chữ thường khi đặt tên biến nên "a" và "A" là hai biến khác nhau.',
            correctAnswerBool: true
          }
        ],
        interactiveGames: [
          {
            id: 'g1_l17',
            type: 'drag_words',
            title: 'Kéo thả thuật ngữ biến và phép gán',
            content: 'Để lưu một giá trị và tái sử dụng, ta khai báo một [*biến*]. Giá trị bên phải được gán vào biến bên trái thông qua dấu [*bằng*]. TÊN biến không được bắt đầu bằng [*chữ số*] và không được trùng với [*từ khoá*] có sẵn của Python.',
            hint: 'Hãy chú ý đến quy tắc đặt tên biến và kí tự của lệnh gán.'
          },
          {
            id: 'g2_l17',
            type: 'sort_paragraphs',
            title: 'Sắp xếp mã gán và tính toán',
            content: 'a = 12\nb = 4\ntong = a + b\nprint("Tổng bằng:", tong)',
            hint: 'Gán a trước, gán b tiếp theo, sau đó mới tính tổng rồi in ra.'
          }
        ],
        labPrompt: 'Tạo hai biến a = 10, b = 20. Viết lệnh in ra màn hình tổng của a + b.',
        labExpectedCode: 'a = 10\nb = 20\nprint(a + b)',
        challengePrompt: 'Tạo biến xâu name = "Python". In biến name ra màn hình.',
        challengeExpectedCode: 'name = "Python"\nprint(name)'
      }
    ]
  },
  {
    id: 'ch2',
    title: 'Chương 2: Các cấu trúc điều khiển cơ bản',
    description: 'Hàm nhập dữ liệu, cấu trúc rẽ nhánh và vòng lặp.',
    lessons: [
      {
        id: 'l18',
        title: 'Bài 18: Các lệnh vào ra đơn giản và ép kiểu',
        theory: [
          '# 📥 **BÀI 18: CÁC LỆNH VÀO RA ĐƠN GIẢN VÀ ÉP KIỂU**',
          '',
          '## 🌟 **1. Triết Lý Học Chuẩn PiLearn (What & Why)**',
          '*   ⚡ **Lệnh input() & print() (What):** Đây là cổng thông tin giúp người với máy xích lại gần nhau. `input()` để đón nhận dữ liệu người dùng gõ từ bàn phím, còn `print()` để trình diễn thông tin ra ngoài màn hình Console.',
          '*   ⚠️ **Nỗi đau dữ liệu mặc định (Why):** Khi bạn dùng `input()`, bất luận người dùng gõ con số lấp lánh nào, Python cũng **chỉ lưu trữ nó dưới dạng Xâu kí tự (String - chữ viết)**. Nếu cố tình lấy "15" + "30", thay vì ra `45`, Python sẽ xếp dính chúng thành `"1530"`!',
          '*   🛠️ **Ép kiểu dữ liệu (How):** Đó là lý do bạn bắt buộc phải dùng hàm ép kiểu chuyển đổi như `int()` (ép sang số nguyên) hoặc `float()` (ép sang số thực chứa dấu phẩy thập phân) trước khi đưa chúng vào biểu thức toán học.',
          '',
          '---',
          '',
          '## 💻 **2. Vùng Học Thảo & Thử Nghiệm Tương Tác (How)**',
          '*   *Hãy bấm nút **"Thực Thi Toàn Bộ"** ở khung bên dưới để thấy trực diện thảm họa "Cộng nhầm xâu" và cách hàm `int()` trở thành siêu anh hùng giải cứu mã nguồn nhé!*',
          '',
          '```python',
          '# Xem sự khác biệt giữa Chữ viết và Con số thực thụ:',
          'str_a = "15"',
          'str_b = "30"',
          '',
          'print("Khi chưa ép kiểu (chỉ là hai xâu kí tự dính nhau):")',
          'print(str_a + str_b)',
          '',
          '# Sử dụng hàm int() để hô biến xâu kí tự thành số thực thụ:',
          'num_a = int(str_a)',
          'num_b = int(str_b)',
          '',
          'print("Sau khi đã ép kiểu bằng int():")',
          'print(num_a + num_b)',
          '```',
          '',
          '---',
          '',
          '## 💼 **3. Thử Thách "Sếp Ra Lệnh" - Cấp Độ 18 (Practice & Experiment)**',
          '> ### 👨‍💼 **SẾP TÙNG TRƯỞNG PHÒNG RA LỆNH:**',
          '> *"Hỡi lập trình viên ưu tú! Khách hàng VIP báo cáo phần mềm thanh toán quán cafe của ta đang tính hóa đơn sai bét nhè. Họ nhập số lượng là `5` và đơn giá là `20`, phần mềm cứ báo lỗi hoặc in ra giá trị nối chuỗi kì dị.*',
          '> *Sếp ra lệnh cho cậu sửa tệp bên dưới: Nhập số lượng và đơn giá từ bàn phím, ép cả hai giá trị sang kiểu số nguyên `int`, sau đó thực hiện phép nhân tính tổng số tiền và in ra đúng con số chính xác!"*',
          '',
          '*👉 Hãy bổ sung cú pháp ép kiểu `int()` xung quanh câu lệnh `input()` bên dưới rồi kiểm tra bằng **"Thực Thi Toàn Bộ"** nhé!*',
          '',
          '```python',
          '# Mặc định input() trả về xâu ký tự. Hãy bọc ép kiểu int() cứu nguy cho Sếp!',
          'soluong_str = "5"',
          'dongia_str = "20"',
          '',
          '# Gõ code ép kiểu của bạn tại đây:',
          'soluong = int(soluong_str)',
          'dongia = int(dongia_str)',
          '',
          'thanhtien = soluong * dongia',
          'print("Tổng số tiền khách hàng cần thanh toán là:")',
          'print(thanhtien)',
          '```',
          '',
          '---',
          '',
          '## 📊 **4. Thử Thách "Sếp Ra Lệnh" - Cấp Độ Nâng Cao (Float Type)**',
          '> ### 👨‍💼 **SẾP TÙNG TRƯỞNG PHÒNG THỬ THÁCH THÊM:**',
          '> *"Tuyệt vời! Nhưng chưa đủ, bây giờ sếp cần cậu làm chương trình tính điểm trung bình cho học sinh xuất sắc Pilearn.*',
          '> *Điểm Toán là `8.5` và điểm Tin là `9.5`. Sếp yêu cầu cậu gán chúng dưới dạng xâu, sau đó ép kiểu sang số thực `float()`, cộng lại rồi chia đôi để tính điểm trung bình chính xác nhất!"*',
          '',
          '```python',
          'toan_str = "8.5"',
          'tin_str = "9.5"',
          '',
          '# Tiến hành ép kiểu sang float để tính toán số thực:',
          'diem_toan = float(toan_str)',
          'diem_tin = float(tin_str)',
          '',
          'trung_binh = (diem_toan + diem_tin) / 2',
          'print("Điểm trung bình học tập của học kỳ này:")',
          'print(trung_binh)',
          '```',
          '',
          '---',
          '',
          '## 🌐 **5. Sợi Dây Liên Hệ Thực Tế (Connection)**',
          '*   Tìm kiếm sự đồng điệu: Ép kiểu dữ liệu giống như bạn đi qua cửa khẩu sân bay quốc tế. Khi hành lý của bạn còn đóng hộp niêm phong bên ngoài thì không ai được dùng. Bạn phải "khui hộp" và "khai báo" rõ ràng mặt hàng (số hay chữ) thì hải quan mới cho lưu thông hiệu quả!',
          '',
          '---',
          '',
          '## 🧠 **6. Tư Duy Trừu Tượng Toàn Diện (Abstraction)**',
          '*   Hệ thống kiểu dữ liệu (Data Type System) bảo đảm tính nhất quán của vùng nhớ trong bộ vi xử lý máy tính. Việc phân định rạch ròi kiểu dữ liệu giúp ngăn chặn các thảm họa nghiêm trọng trong thực tế như tràn bộ nhớ đệm điều khiển robotics hay sai lệch số dư trên các sổ cái ngân hàng số toàn cầu.'
        ].join('\n'),
        mindmapUrl: 'https://whimsical.com/embed/S2pE8sH3vH5dMh91r2Hbbz',
        flashcards: [
          { id: 'f1_l18', front: 'Lệnh nhập dữ liệu từ bàn phím là lệnh nào?', back: 'Lệnh input()' },
          { id: 'f2_l18', front: 'Dữ liệu trả về từ input() mặc định là kiểu gì?', back: 'Kiểu xâu kí tự (str)' },
          { id: 'f3_l18', front: 'Hàm nào dùng để chuyển xâu kí tự thành số thực?', back: 'Hàm float()' },
          { id: 'f4_l18', front: 'Muốn ép sang kiểu số nguyên ta dùng hàm gì?', back: 'Hàm int()' }
        ],
        miniQuiz: [
          {
            id: 'q1_l18', type: 'multiple_choice', prompt: 'Kết quả của biểu thức: int("15") + 5 trong Python là bao nhiêu?',
            options: ['"155"', '20', 'Lỗi RuntimeError', '15 + 5'],
            correctOptionIndex: 1
          },
          {
            id: 'q2_l18', type: 'true_false', prompt: 'Lệnh input("Lời nhắc") hiển thị lời nhắc và ghi nhận mọi thứ người dùng nhập dưới dạng một chuỗi.',
            correctAnswerBool: true
          }
        ],
        interactiveGames: [
          {
            id: 'g1_l18',
            type: 'drag_words',
            title: 'Kéo thả lệnh nhập dữ liệu',
            content: 'Muốn nhận dữ liệu từ bàn phím ta dùng lệnh [*input*]. Mọi thông tin nhập vào mặc định là kiểu [*xâu ký tự*]. Để tính toán, ta phải ép kiểu sang [*số nguyên*] bằng lệnh int() hoặc [*số thực*] bằng lệnh float().',
            hint: 'Khởi đầu luôn bằng nhập dữ liệu và hiểu đúng kiểu mặc định của nó.'
          }
        ],
        labPrompt: 'Viết gia lập gán biến a là số nguyên từ việc ép xâu "5", sau đó viết print(a) để xuất ra màn hình.',
        labExpectedCode: 'a = int("5")\nprint(a)',
        challengePrompt: 'Ép kiểu xâu "3.14" sang số thực float và in kết quả ra.',
        challengeExpectedCode: 'print(float("3.14"))'
      },
      {
        id: 'l19',
        title: 'Bài 19: Câu lệnh rẽ nhánh if',
        theory: [
          '# **Bài 19: CÂU LỆNH RẼ NHÁNH IF**',
          '',
          '## **1. Khái niệm (What + Why)**',
          '* **Lệnh if (What):** Là cấu trúc cho phép chương trình đưa ra những hướng xử lý khác nhau căn cứ vào một biểu thức so sánh đúng (`True`) hay sai (`False`).',
          '* **Tại sao cần rẽ nhánh (Why):** Thế giới thực tế luôn có điều kiện logic. Ví dụ: Nếu được điểm thi lớn hơn hoặc bằng 8 thì được học sinh giỏi, ngược lại thì không. Nếu không có cấu trúc rẽ nhánh, chương trình máy tính sẽ chỉ là một tuyến tính vô hồn, thiếu hẳn linh hồn đưa quyết định tự động.',
          '',
          '## **2. Ví dụ đơn giản (How)**',
          '```python',
          'diem = float(input("Nhập điểm thi: "))',
          'if diem >= 5.0:',
          '    print("Chúc mừng bạn đã ĐẠT!")',
          'else:',
          '    print("Bạn cần tiếp tục rèn luyện thêm!")',
          '```',
          '* Lưu ý lùi dòng (Indentation): 1 Tab hoặc 4 khoảng trắng là bắt buộc của khối lệnh sau từ khoá `if`/ `else`.',
          '',
          '## **3. Bài tập căn bản (Practice)**',
          '* **Đề bài:** Nhập vào số nguyên `n`. Kiểm tra xem `n` là số chẵn hay số lẻ và in ra.',
          '* **Hướng dẫn:**',
          '```python',
          'n = int(input("Nhập số nguyên n: "))',
          'if n % 2 == 0:',
          '    print("Mã số chẵn")',
          'else:',
          '    print("Mã số lẻ")',
          '```',
          '',
          '## **4. Liên hệ với dạng khác (Connection)**',
          '* Hãy liên hệ phễu chia đường nước chảy hoặc bảng mạch rẽ đường điện. Tại mỗi ngã rẽ lối, chỉ có một đường đi thỏa mãn điều kiện thực sự đón nhận dòng nước chảy thông suốt.',
          '',
          '## **5. Nâng cao và tư duy tổng quát (Abstraction)**',
          '* Các khối óc nhân tạo AI bản chất chính là cấu tạo tinh vi từ hàng triệu cây quyết định cấu trúc rẽ nhánh xếp đè logic liên tục lên nhau để dự toán ra câu trả lời chính xác tối thượng.'
        ].join('\n'),
        mindmapUrl: 'https://whimsical.com/embed/S2pE8sH3vH5dMh91r2Hbbz',
        flashcards: [
          { id: 'f1_l19', front: 'Kí tự nào bắt buộc phải có cuối dòng lệnh của mệnh đề if?', back: 'Dấu hai chấm ":"' },
          { id: 'f2_l19', front: 'Làm thế nào để Python phân biệt khối lệnh con thuộc kiểm soát của lệnh if?', back: 'Lùi đầu dòng (Indentation - thường là lùi 4 khoảng trắng).' },
          { id: 'f3_l19', front: 'Từ khoá biểu diễn cho nhánh phủ định ngược lại của if là gì?', back: 'Mệnh đề else' }
        ],
        miniQuiz: [
          {
            id: 'q1_l19', type: 'multiple_choice', prompt: 'Từ khoá kết hợp giữa else và if dùng để rẽ nhiều mức điều kiện là gì?',
            options: ['elif', 'elseif', 'else if', 'if_else'],
            correctOptionIndex: 0
          },
          {
            id: 'q2_l19', type: 'true_false', prompt: 'Trong Python, lệnh so sánh bằng phải sử dụng ký tự so sánh đôi == chứ không dùng dấu bằng đơn =.',
            correctAnswerBool: true
          }
        ],
        interactiveGames: [
          {
            id: 'g1_l19',
            type: 'drag_words',
            title: 'Kéo thả câu lệnh rẽ nhánh if',
            content: 'Cấu trúc điều khiển rẽ nhánh bắt đầu bằng từ khóa [*if*] theo sau là biểu thức logic và kết thúc bằng dấu [*hai chấm*]. Khối lệnh thực thi của nhánh đó bắt buộc phải [*lùi lề*]. Nhánh xử lý khi điều kiện sai bắt đầu bằng từ khóa [*else*].',
            hint: 'Nhớ cú pháp if <điều kiện>: và lùi lề khối con.'
          }
        ],
        labPrompt: 'Gán biến x = 10, nếu x > 5 thì in ra "Lớn hơn". Hãy viết đoạn code Python chính xác cho thuật toán này.',
        labExpectedCode: 'x = 10\nif x > 5:\n    print("Lớn hơn")',
        challengePrompt: 'Hãy viết đoạn chương trình: nhập n bằng số nguyên. Nếu n chẵn in ra "Chẵn", ngược lại in ra "Lẻ".',
        challengeExpectedCode: 'n = 2\nif n % 2 == 0:\n    print("Chẵn")\nelse:\n    print("Lẻ")'
      },
      {
        id: 'l20',
        title: 'Bài 20: Câu lệnh lặp for và range',
        theory: [
          '# **Bài 20: CÂU LỆNH LẶP FOR VÀ RANGE**',
          '',
          '## **1. Khái niệm (What + Why)**',
          '* **Lặp for (What):** Sử dụng để thực thi một chuỗi các khối lệnh lặp đi lặp lại với số lần biết trước (duyệt một tập hợp).',
          '* **Hàm range(n) (What):** Tạo ra một dãy số chạy tuần tự bắt đầu từ 0 đến sát giá trị kết thúc (bằng `n-1`).',
          '* **Tại sao cần lặp (Why):** Nếu muốn in 100 dòng chữ chúc mừng, không thể chép thủ công 100 lần dòng lệnh `print()`. Máy tính cực kỳ giỏi những hành động lặp liên hồi không biết mệt mỏi, và câu lệnh lặp giải phóng sức lao động vô nghĩa cho con người.',
          '',
          '## **2. Ví dụ đơn giản (How)**',
          '```python',
          '# Khởi chạy in số từ 0 -> 4',
          'for i in range(5):',
          '    print("Lần thứ:", i)',
          '```',
          '* Tìm hiểu `range(start, stop, step)`:',
          '  * `range(1, 6)` tạo ra dãy: 1, 2, 3, 4, 5.',
          '  * `range(1, 10, 2)` tạo dãy số lẻ: 1, 3, 5, 7, 9.',
          '',
          '## **3. Bài tập căn bản (Practice)**',
          '* **Đề bài:** Sử dụng vòng lặp for tính tổng toàn bộ các số nguyên chẵn nhỏ hơn 10 và in kết quả.',
          '* **Hướng dẫn:**',
          '```python',
          'tong = 0',
          'for i in range(0, 10, 2):',
          '    tong = tong + i',
          'print("Tổng chẵn:", tong)',
          '```',
          '',
          '## **4. Liên hệ với dạng khác (Connection)**',
          '* Hãy nghĩ về chiếc đồng hồ đo quãng đường hay hành động lặp đi lặp lại mỗi sáng thức dậy của bạn. Cứ mỗi lần kim giây đập đủ 60 lần, chỉ số phút lại tăng dồn 1 và reset chỉ số giây để đón chuỗi thời gian lặp tiếp nối.',
          '',
          '## **5. Nâng cao và tư duy tổng quát (Abstraction)**',
          '* Sức mạnh tối hậu của xử lý siêu dữ liệu (Big Data Analysis) khởi nguồn từ tốc độ lặp duyệt qua hàng tỷ phần tử cực kỳ nhanh gọn của vòng lặp, giúp máy tính tính toán siêu thanh.'
        ].join('\n'),
        mindmapUrl: 'https://whimsical.com/embed/S2pE8sH3vH5dMh91r2Hbbz',
        flashcards: [
          { id: 'f1_l20', front: 'range(4) tạo ra dãy số nào?', back: 'Mảng số nguyên: 0, 1, 2, 3.' },
          { id: 'f2_l20', front: 'Lệnh range(1, 5) tạo ra dãy số nào?', back: 'Mảng số nguyên từ 1 đến 4 (1, 2, 3, 4).' },
          { id: 'f3_l20', front: 'Vòng lặp for dùng để làm gì?', back: 'Để thực hiện lặp lại khối lệnh với số lần định sẵn.' }
        ],
        miniQuiz: [
          {
            id: 'q1_l20', type: 'multiple_choice', prompt: 'Hàm range(2, 10, 3) bao gồm tập hợp các số nào sau đây?',
            options: ['2, 5, 8', '2, 3, 10', '2, 6, 10', '2, 5, 8, 10'],
            correctOptionIndex: 0
          },
          {
            id: 'q2_l20', type: 'true_false', prompt: 'Khối lệnh sau for cũng đòi hỏi phải lùi đầu dòng để Python hiểu nó là phần thân của vòng lặp.',
            correctAnswerBool: true
          }
        ],
        interactiveGames: [
          {
            id: 'g1_l20',
            type: 'drag_words',
            title: 'Kéo thả tham số vòng lặp for',
            content: 'Vòng lặp [*for*] kết hợp từ khóa in dùng để duyệt danh sách. Hàm [*range*] có thể nhận tham số khởi đầu, tham số [*kết thúc*] và [*bước nhảy*] để tinh chỉnh dãy số sinh ra.',
            hint: 'range(start, stop, step) giúp tinh chỉnh chi tiết mảng tạo ra.'
          }
        ],
        labPrompt: 'Dùng vòng lặp for in ra các số liên tiếp từ 0 đến 2.',
        labExpectedCode: 'for i in range(3):\n    print(i)',
        challengePrompt: 'Tính tổng từ 0 đến 2 bằng vòng lặp for. Lưu và in kết qủa tổng đó.',
        challengeExpectedCode: 'print(3)'
      },
      {
        id: 'l21',
        title: 'Bài 21: Vòng lặp while',
        theory: [
          '# **Bài 21: VÒNG LẶP WHILE**',
          '',
          '## **1. Khái niệm (What + Why)**',
          '* **Lặp while (What):** Thực hiện lặp đi lặp lại khối lệnh con khi biểu thức logic điều kiện đầu vào của nó vẫn còn đánh giá là `True`.',
          '* **Tại sao cần while (Why):** Khi ta không thể biết trước số lần lặp thực sự. Ví dụ: Hãy cho phép người dùng nhập đi nhập lại mật khẩu "cho đến khi chính xác" thì dừng. Ta không thể biết họ sẽ gõ sai 1 lần hay 10 lần, for sẽ bó tay trong trường hợp lặp vô hạn điều kiện này còn while xử lý hoàn hảo.',
          '',
          '## **2. Ví dụ đơn giản (How)**',
          '```python',
          'dem = 1',
          'while dem <= 3:',
          '    print("Giá trị:", dem)',
          '    dem = dem + 1 # Phép tăng điều kiện dừng',
          '```',
          '* **Cực kỳ quan trọng:** Thân vòng lặp while phải có thao tác làm cho điều kiện rẽ sang `False` ở tương lai (ví dụ: tăng dần biến đếm). Nếu thiếu nó, chương trình sẽ ngậm vĩnh viễn ở trạng thái "lặp vô hạn" gây tê liệt bộ vi xử lý!',
          '',
          '## **3. Bài tập căn bản (Practice)**',
          '* **Đề bài:** Tạo một chương trình lặp cộng dồn các giá trị lẻ của biến count tăng từ 1 cho tới khi count đạt 10.',
          '* **Hướng dẫn:**',
          '```python',
          's = 0',
          'count = 1',
          'while count < 10:',
          '    s = s + count',
          '    count = count + 2',
          'print("Kết quả:", s)',
          '```',
          '',
          '## **4. Liên hệ với dạng khác (Connection)**',
          '* Giống chiếc khóa bảo vệ ngắt điện bình đun nước nóng tự động. Bộ gia nhiệt vẫn nấu liên tục khi nhiệt độ nước nhỏ hơn 100 độ C. Ngay khi nước sôi vừa gõ mốc chuyển trạng thái, công tắc ngắt hoạt động bảo an tối đa.',
          '',
          '## **5. Nâng cao và tư duy tổng quát (Abstraction)**',
          '* Thiết kế điều kiện biên và bảo đảm giải tỏa dòng lặp (loop resolution) là nền tảng tối thượng của an toàn cấu trúc chương trình dập tắt sự cố kẹt CPU vĩnh cửu.'
        ].join('\n'),
        mindmapUrl: 'https://whimsical.com/embed/S2pE8sH3vH5dMh91r2Hbbz',
        flashcards: [
          { id: 'f1_l21', front: 'Vòng lặp while dừng lại khi nào?', back: 'Khi điều kiện logic sau while nhận giá trị False.' },
          { id: 'f2_l21', front: 'Lỗi lặp vô hạn (Infinite loop) xảy ra khi nào?', back: 'Khi điều kiện của while luôn luôn True và không bao giờ chuyển sang False.' }
        ],
        miniQuiz: [
          {
            id: 'q1_l21', type: 'multiple_choice', prompt: 'Cho i = 1; while i < 5: print(i); i += 2. Vành lặp in ra những số nào?',
            options: ['1, 3', '1, 3, 5', '1, 2, 3, 4', '1'],
            correctOptionIndex: 0
          },
          {
            id: 'q2_l21', type: 'true_false', prompt: 'Từ khóa "break" có thể dùng để nhảy thoát lập tức ra khỏi vòng lặp đang chạy mà không cần đợi điều kiện chuyển False.',
            correctAnswerBool: true
          }
        ],
        interactiveGames: [
          {
            id: 'g1_l21',
            type: 'drag_words',
            title: 'Kéo thả câu lệnh lặp while',
            content: 'Vòng lặp [*while*] chạy khi biểu thức điều kiện đúng. Nếu quên thay đổi giá trị biến kiểm soát ở thân lặp, chương trình sẽ gặp lỗi lặp [*vô hạn*]. Muốn kết thúc lặp lập tức, ta gõ từ khóa [*break*].',
            hint: 'Khác biệt của while là không biết trước số lần lặp và phụ thuộc điều kiện đúng.'
          }
        ],
        labPrompt: 'Tạo biến i = 0, chạy vòng lặp while i < 2. Bên trong vòng lặp ta viết print(i) và tăng i thêm 1 đơn vị.',
        labExpectedCode: 'i = 0\nwhile i < 2:\n    print(i)\n    i += 1',
        challengePrompt: 'Viết vòng lặp trong đó biến p = True, chuyển p sang False để dừng.',
        challengeExpectedCode: 'p = True\nwhile p:\n    p = False'
      }
    ]
  },
  {
    id: 'ch3',
    title: 'Chương 3: Dữ liệu kiểu Danh sách (List)',
    description: 'Quản lý, truy cập và thao tác với danh sách phần tử.',
    lessons: [
      {
        id: 'l22',
        title: 'Bài 22: Cấu trúc danh sách và phương thức append',
        theory: [
          '# **Bài 22: CẤU TRÚC DANH SÁCH VÀ PHƯƠNG THỨC APPEND**',
          '',
          '## **1. Khái niệm (What + Why)**',
          '* **Danh sách / List (What):** Kiểu dữ liệu cho phép gom một cụm nhiều giá trị lại chung trong một hàng ngũ dài sắp xếp theo thứ tự nhất định, rạch ròi bằng dấu ngoặc vuông `[]`.',
          '* **append() (What):** Phương thức nối thêm một phần tử mời trực tiếp vào góc tận cùng cuối danh sách.',
          '* **Tại sao cần danh sách (Why):** Nếu cần quản lý điểm số của 40 học sinh lớp 10, bạn không thể tạo tay 40 biến đơn lẻ (`diem1`, `diem2`...). List gom hết chung gọn một mối, quản lý chỉ số vô cùng khoa học.',
          '',
          '## **2. Ví dụ đơn giản (How)**',
          '```python',
          'mon_hoc = ["Toán", "Tin học", "Vật lý"]',
          'print("Môn đầu tiên là:", mon_hoc[0]) # Chỉ số bắt đầu từ 0',
          'mon_hoc.append("Hóa học")',
          'print("Danh sách môn đầy đủ là:", mon_hoc)',
          '```',
          '',
          '## **3. Bài tập căn bản (Practice)**',
          '* **Đề bài:** Khởi tạo danh sách rỗng, append lần lượt các số `100`, `200` vào danh sách, sau đó xuất ra danh sách hoàn chỉnh.',
          '* **Hướng dẫn:**',
          '```python',
          'ds = []',
          'ds.append(100)',
          'ds.append(200)',
          'print(ds)',
          '```',
          '',
          '## **4. Liên hệ với dạng khác (Connection)**',
          '* Hãy nghĩ về đoàn tàu hoả đón khách ga nối toa tại cuối, hoặc đơn giản là đoàn người xếp hàng rồng rắn vào mua vé xem phim.',
          '',
          '## **5. Nâng cao và tư duy tổng quát (Abstraction)**',
          '* Danh sách đại diện cho cấu trúc dữ liệu tuyến tính bộ nhớ động (Dynamic Array). Python tự giải phóng và tăng giãn quy mô ô nhớ ngầm tự động để nâng chở khối đồ sộ dữ liệu của lập trình viên nhẹ nhõm.'
        ].join('\n'),
        mindmapUrl: 'https://whimsical.com/embed/S2pE8sH3vH5dMh91r2Hbbz',
        flashcards: [
          { id: 'f1_l22', front: 'Phần tử đầu tiên trong danh sách của Python có chỉ số là mấy?', back: 'Chỉ số là số 0.' },
          { id: 'f2_l22', front: 'Dùng cú pháp nào để tìm chiều dài, số lượng phần tử của danh sách?', back: 'Dùng hàm len(danh_sách)' },
          { id: 'f3_l22', front: 'Phương thức append() thêm phần tử mới vào đâu trong danh sách?', back: 'Vào đuôi (cuối cùng) của danh sách.' }
        ],
        miniQuiz: [
          {
            id: 'q1_l22', type: 'multiple_choice', prompt: 'Cho A = [1, 5, 9]. Giá trị của A[1] là bao nhiêu?',
            options: ['1', '5', '9', 'Lỗi IndexOutRange'],
            correctOptionIndex: 1
          },
          {
            id: 'q2_l22', type: 'true_false', prompt: 'Một danh sách List trong Python có thể chứa các giá trị khác nhau gồm cả xâu kí tự và con số cùng lúc.',
            correctAnswerBool: true
          }
        ],
        interactiveGames: [
          {
            id: 'g1_l22',
            type: 'drag_words',
            title: 'Kéo thả phần tử danh sách',
            content: 'Để trữ nhiều giá trị có thứ tự, ta dùng kiểu dữ liệu [*danh sách*]. Chỉ số phần tử đếm xuất phát từ số [*0*]. Muốn tra độ dài, ta dùng hàm [*len*]. Để bổ sung phần tử vào cuối, hãy sử dụng phương thức [*append*].',
            hint: 'Hãy lướt qua thứ tự chỉ số và cách thêm một thành viên mới ở cuối.'
          }
        ],
        labPrompt: 'Tạo một danh sách A = [1, 2]. Viết lệnh A.append(3) để thêm phần tử 3, sau đó in danh sách A ra màn hình.',
        labExpectedCode: 'A = [1, 2]\nA.append(3)\nprint(A)',
        challengePrompt: 'Khởi tạo danh sách B rỗng. Viết lệnh append nạp chuỗi "Python" vào B rồi in B ra.',
        challengeExpectedCode: 'B = []\nB.append("Python")\nprint(B)'
      },
      {
        id: 'l23',
        title: 'Bài 23: Xoá, chèn và toán tử in',
        theory: [
          '# **Bài 23: XOÁ, CHÈN VÀ TOÁN TỬ IN**',
          '',
          '## **1. Khái niệm (What + Why)**',
          '* **Chèn insert() & Xoá del / remove() (What):** Các phương thức mở rộng tinh chỉnh cấu trúc phần tử ở giữa danh sách.',
          '* **Toán tử in (What):** Kiểm tra xem một phần tử có nằm ở trong danh sách hay không, trả về Boolean `True` hoặc `False`.',
          '* **Tại sao cần quản lý (Why):** Danh sách của chúng ta không thể tĩnh mãi mãi. Giỏ hàng của khách mua có thể xoá bớt hàng, chèn chắp thêm một món quà tặng, hoặc rà xem món đồ chọn mua đã nằm ở giỏ hàng hay chưa để tránh lặp trùng.',
          '',
          '## **2. Ví dụ đơn giản (How)**',
          '```python',
          'trai_cay = ["Cam", "Xoài", "Mận"]',
          '# Chèn "Bưởi" vào vị trí số 1',
          'trai_cay.insert(1, "Bưởi")',
          'print("Có Cam không:", "Cam" in trai_cay) # True',
          'trai_cay.remove("Xoài") # Xoá Xoài khỏi hàng ngũ',
          'print(trai_cay)',
          '```',
          '',
          '## **3. Bài tập căn bản (Practice)**',
          '* **Đề bài:** Kiểm tra và in kết quả kiểm tra xem số `5` có thuộc mảng dữ liệu có sẵn hay không.',
          '* **Hướng dẫn:**',
          '```python',
          'L = [1, 2, 5, 8]',
          'print(5 in L)',
          '```',
          '',
          '## **4. Liên hệ với dạng khác (Connection)**',
          '* Hãy nghĩ về việc bạn quản lý thành viên đội thể thao. Loại bỏ thành viên bị chấn thương, đổi chỗ sắp xếp cầu thủ chạy chính thức và xem xem tên tuyển thủ vàng đã đính chính trong danh sách thi đấu tuyển chọn hay chưa.',
          '',
          '## **5. Nâng cao và tư duy tổng quát (Abstraction)**',
          '* Rà tìm kiếm với toán tử `in` là thuật toán duyệt tuyến tính quét tuần tự từ đầu tới đuôi (Linear Search) có mức độ vận hành tối ưu hoá thuận toán vô cùng quan trọng đối với dữ liệu cực trị.'
        ].join('\n'),
        mindmapUrl: 'https://whimsical.com/embed/S2pE8sH3vH5dMh91r2Hbbz',
        flashcards: [
          { id: 'f1_l23', front: 'Phép so sánh tìm kiếm phần tử trong mảng dùng toán tử gì?', back: 'Toán tử logic "in"' },
          { id: 'f2_l23', front: 'Lệnh remove(x) và del danh_sach[i] khác gì nhau?', back: 'remove(x) xóa phần tử có giá trị là x, còn del xóa phần tử đứng tại chỉ số i.' }
        ],
        miniQuiz: [
          {
            id: 'q1_l23', type: 'multiple_choice', prompt: 'Cho L = [10, 20, 30]. Mệnh đề: 15 in L trả về giá trị kiểu gì?',
            options: ['Lỗi báo đỏ', 'None', 'True', 'False'],
            correctOptionIndex: 3
          }
        ],
        interactiveGames: [
          {
            id: 'g1_l23',
            type: 'drag_words',
            title: 'Kéo thả sắp xếp danh sách nâng cao',
            content: 'Muốn kiểm tra phần tử có mặt trong list ta sử dụng toán tử [*in*]. Nếu cần chèn vào vị trí tùy ý ta dùng [*insert*]. Xóa phần tử theo chỉ số dùng [*del*], còn xóa trực tiếp giá trị ta sử dụng [*remove*].',
            hint: 'Phân biệt kiểm tra (in), chèn giữa (insert) và hai lệnh xóa khác nhau.'
          }
        ],
        labPrompt: 'Tạo danh sách L = [1, 2, 3]. In ra màn hình True hoặc False của phép thế kiểm tra xem 2 có nằm trong L không.',
        labExpectedCode: 'L = [1, 2, 3]\nprint(2 in L)',
        challengePrompt: 'Xóa phần tử đầu tiên tại vị trí số 0 của mảng L = [9, 8] bằng phương thức pop(0) rồi in kết quả kiểm tra.',
        challengeExpectedCode: 'L = [9, 8]\nL.pop(0)\nprint(L)'
      }
    ]
  },
  {
    id: 'ch4',
    title: 'Chương 4: Dữ liệu kiểu Xâu kí tự',
    description: 'Thao tác với văn bản và chuỗi.',
    lessons: [
      {
        id: 'l24',
        title: 'Bài 24: Đặc điểm và vòng lặp qua xâu',
        theory: [
          '# **Bài 24: ĐẶC ĐIỂM VÀ VÒNG LẶP QUA XÂU**',
          '',
          '## **1. Khái niệm (What + Why)**',
          '* **Xâu kí tự / String (What):** Là mảng chuỗi các ký tự bất biến (immutable) xếp nối dài.',
          '* **Tính bất biến (Why):** Tránh việc thay đổi trực tiếp bất cẩn một ký tự lẻ như `s[0] = "A"` (Python cấm làm điều này và sẽ phát lỗi đỏ). Với xâu, ta chỉ có kiến tạo xâu mới hoàn toàn dựa trên xâu cũ để an toàn luồng logic phần mềm.',
          '',
          '## **2. Ví dụ đơn giản (How)**',
          '```python',
          'tinh_chat = "Tính biến động"',
          'print("Độ dài xâu này là:", len(tinh_chat))',
          '# Duyệt in từng chữ một',
          'for chu_cai in "Python":',
          '    print(chu_cai, end="-")',
          '# Kết quả: P-y-t-h-o-n-',
          '```',
          '',
          '## **3. Bài tập căn bản (Practice)**',
          '* **Đề bài:** Viết chương trình duyệt xâu `s = "abc"` bằng vòng lặp và in từng ký tự trên một dòng riêng biệt.',
          '* **Hướng dẫn:**',
          '```python',
          's = "abc"',
          'for c in s:',
          '    print(c)',
          '```',
          '',
          '## **4. Liên hệ với dạng khác (Connection)**',
          '* Xâu tương tự như chiếc vòng ngọc đeo tay. Từng viên ngọc có mã chỉ số từ 0 đến cuối. Bạn chỉ có thể soi ngắm vẻ đẹp từng chuỗi hoa tiết, đong đo độ dài, không được rút lõi đập bể thay thế một viên đơn độc cơ trực tiếp trên vòng ngọc cổ.',
          '',
          '## **5. Nâng cao và tư duy tổng quát (Abstraction)**',
          '* Xâu thực chất là mảng mã hoá chuẩn quốc tế Unicode UTF-8 để máy tính diễn hoạt và tương tác trực quan với thế giới con người đa ngôn ngữ văn hoá.'
        ].join('\n'),
        mindmapUrl: 'https://whimsical.com/embed/S2pE8sH3vH5dMh91r2Hbbz',
        flashcards: [
          { id: 'f1_l24', front: 'Phép gán s[0] = "S" có hợp lệ với xâu không?', back: 'Không, vì xâu kí tự bất biến (immutable) không thể thay đổi giá trị từng phần tử.' },
          { id: 'f2_l24', front: 'Làm sao quét qua từng chữ cái của xâu?', back: 'Dùng cấu trúc vòng lặp for char in xau:' }
        ],
        miniQuiz: [
          {
            id: 'q1_l24', type: 'multiple_choice', prompt: 'Độ dài của xâu "C@fe" trả về bởi len là mấy?',
            options: ['3', '4', '5', 'Báo lỗi đỏ'],
            correctOptionIndex: 1
          }
        ],
        interactiveGames: [
          {
            id: 'g1_l24',
            type: 'drag_words',
            title: 'Kéo thả từ khóa biến xâu',
            content: 'Chuỗi văn bản trong Python được định danh là [*xâu ký tự*]. Tính chất đặc biệt là không thể sửa đổi từng ký tự đơn lẻ, gọi là tính [*bất biến*]. Ta có thể duyệt từng ký tự bằng [*vòng lặp for*] và xem kích cỡ xâu bằng lệnh [*len*].',
            hint: 'Duyệt xâu cực giống duyệt list và nó không thể gán đè trực tiếp s[i] = ...'
          }
        ],
        labPrompt: 'Duyệt qua xâu s = "abc" bằng vòng lặp for và in từng kí tự ra màn hình.',
        labExpectedCode: 's = "abc"\nfor c in s:\n    print(c)',
        challengePrompt: 'Hãy in chiều dài chuẩn xác của xâu dữ liệu học thuật "Python" bằng len().',
        challengeExpectedCode: 'print(len("Python"))'
      },
      {
        id: 'l25',
        title: 'Bài 25: Các phương thức xử lý xâu chính',
        theory: [
          '# **Bài 25: CÁC PHƯƠNG THỨC XỬ LÝ XÂU CHÍNH**',
          '',
          '## **1. Khái niệm (What + Why)**',
          '* **find(), split() & join() (What):** Bộ ba ngự lâm quân giải quyết bài toán tìm kiếm, phân rã cắt lát xâu lớn thành mảnh mảng nhỏ và ghép dán chúng trở lại.',
          '* **Tại sao cần xử lý sâu (Why):** Trực giác lập trình máy luôn đối mặt với những khối dữ liệu định dạng phức tạp như logfile hệ thống hay chuỗi file danh sách học sinh rải rác: "Lê Minh, 5, 10". Ta cần cắt nhỏ để quản lý riêng, tìm kiếm nhanh và xuất tệp rành mạch.',
          '',
          '## **2. Ví dụ đơn giản (How)**',
          '```python',
          '# find() tìm vị trí xuất hiện (nếu không thấy trả về -1)',
          'xau_goc = "Chào Python lớp 10"',
          'print(xau_goc.find("Python")) # Vị trí: 5',
          '',
          '# split() băm cắt xâu thành list qua kí tự phân rã',
          'danh_sach = "Cam-Xoài-Quýt".split("-")',
          'print(danh_sach) # ["Cam", "Xoài", "Quýt"]',
          '',
          '# join() ghép mảng thành xâu bằng kí tự đính',
          'print(", ".join(danh_sach)) # "Cam, Xoài, Quýt"',
          '```',
          '',
          '## **3. Bài tập căn bản (Practice)**',
          '* **Đề bài:** Có xâu chuỗi thông tin: "A B". Phân tách xâu này bằng split() và in kết quả mảng ra màn hình.',
          '* **Hướng dẫn:**',
          '```python',
          'print("A B".split())',
          '```',
          '',
          '## **4. Liên hệ với dạng khác (Connection)**',
          '* Hãy nghĩ về việc ghép nối từng lát bánh mì, hoặc xé nhỏ chiếc bánh quy ra thành những mẩu bánh con vụn bánh gọn gàng.',
          '',
          '## **5. Nâng cao và tư duy tổng quát (Abstraction)**',
          '* Xử lý xâu thô là bước đệm cơ bản mở đường cho ngành tối tân AI: **Xử lý ngôn ngữ tự nhiên (NLP - Natural Language Processing)** dập dịch thuật chính xác tiếng nói của con người toàn cầu.'
        ].join('\n'),
        mindmapUrl: 'https://whimsical.com/embed/S2pE8sH3vH5dMh91r2Hbbz',
        flashcards: [
          { id: 'f1_l25', front: 'Nếu find(x) không phát hiện thấy x thì trả về giá trị bao nhiêu?', back: 'Trả về giá trị là -1.' },
          { id: 'f2_l25', front: 'Phương thức split() trả về dữ liệu kiểu gì?', back: 'Trả về một danh sách (List) chứa các mảnh xâu con.' }
        ],
        miniQuiz: [
          {
            id: 'q1_l25', type: 'multiple_choice', prompt: 'Hàm nào giúp nối nối tập hợp chuỗi trong danh sách thành một xâu duy nhất?',
            options: ['join()', 'split()', 'find()', 'append()'],
            correctOptionIndex: 0
          }
        ],
        interactiveGames: [
          {
            id: 'g1_l25',
            type: 'drag_words',
            title: 'Kéo thả kỹ thuật chuỗi xâu',
            content: 'Muốn rà tìm vị trí xâu con, hãy dùng phương thức [*find*]. Để cắt xâu thành một danh sách có ranh giới phân tách, ta dùng [*split*]. Khi muốn nối kết gom các phần tử trong danh sách lại với nhau ta gọi [*join*].',
            hint: 'find để định vị trí, split dùng chặt đứt, join dùng khâu gắn lại.'
          }
        ],
        labPrompt: 'Tách xâu "A B" bằng split() không tham số phân tách rồi in ra danh sách kết quả.',
        labExpectedCode: 'print("A B".split())',
        challengePrompt: 'Nối hai phần tử trong danh sách ["X", "Y"] lại với nhau bằng dấu nối gạch ngang (-) nhờ phương thức join() và in kết quả.',
        challengeExpectedCode: 'print("-".join(["X", "Y"]))'
      }
    ]
  },
  {
    id: 'ch5',
    title: 'Chương 5: Lập trình với Chương trình con (Hàm)',
    description: 'Cách định nghĩa và gọi hàm tối ưu mã.',
    lessons: [
      {
        id: 'l26',
        title: 'Bài 26: Xây dựng chương trình con và hàm mới',
        theory: [
          '# **Bài 26: XÂY DỰNG CHƯƠNG TRÌNH CON VÀ HÀM MỚI**',
          '',
          '## **1. Khái niệm (What + Why)**',
          '* **Hàm / Function (What):** Là một khối lệnh con có tên gọi riêng, được bọc đóng gói gọn gàng để xử lý một công năng chuyên trách.',
          '* **Tại sao cần hàm (Why):** Triết lý **DRY (Don\'t Repeat Yourself)**: Không lặp lại chính mình. Thay vì sao chép 10 dòng mã tinh vi tính thuế ở 50 chốn khác nhau trong phần mềm, ta gom chúng vào một hàm duy nhất tên là `tinh_thue()` rồi triệu gọi bất cứ khi nào cần. Dễ sửa, cực kỳ tiện lợi và mã nguồn bóng bẩy.',
          '',
          '## **2. Ví dụ đơn giản (How)**',
          '```python',
          '# Khai báo định nghĩa hàm bằng def',
          'def loi_chao():',
          '    print("-------------------------")',
          '    print("Hệ thống Học tập LMS Python")',
          '    print("-------------------------")',
          '',
          '# Triệu gọi hàm hoạt động',
          'loi_chao()',
          'loi_chao()',
          '```',
          '',
          '## **3. Bài tập căn bản (Practice)**',
          '* **Đề bài:** Hãy viết một hàm mới tên là `say_hi()` thực thi in ra chữ `Hi` trên màn hình và thực hành gọi chạy hàm đó.',
          '* **Hướng dẫn:**',
          '```python',
          'def say_hi():',
          '    print("Hi")',
          'say_hi()',
          '```',
          '',
          '## **4. Liên hệ với dạng khác (Connection)**',
          '* Hãy nghĩ về các phím chức năng trên tay cầm điều khiển điều hòa hay tivi. Thay vì tháo vỏ nhựa, can thiệp linh kiện điện bên trong tủ lạnh để đổi cơ mức nhiệt độ, bạn chỉ cần bấm nút tích hợp "Làm lạnh nhanh" (hãy quy ước đó là một hàm gọi tắt của hệ thống vi vi mạch).',
          '',
          '## **5. Nâng cao và tư duy tổng quát (Abstraction)**',
          '* Cơ chế bọc khép mã nguồn hàm là biểu trưng của thiết kế hệ thống có tính độc lập cao chống lỗi tràn thông tin (Encapsulation logic).'
        ].join('\n'),
        mindmapUrl: 'https://whimsical.com/embed/S2pE8sH3vH5dMh91r2Hbbz',
        flashcards: [
          { id: 'f1_l26', front: 'Từ khóa nào bắt đầu cho việc khai báo định nghĩa hàm trong Python?', back: 'Từ khóa "def"' },
          { id: 'f2_l26', front: 'Làm thế nào để triệu gọi gọi một hàm hoạt động?', back: 'Viết tên hàm kèm theo cặp dấu ngoặc tròn, ví dụ: ten_ham()' }
        ],
        miniQuiz: [
          {
            id: 'q1_l26', type: 'multiple_choice', prompt: 'Dòng lệnh: def test(): in ra "ok" định nghĩa cái gì?',
            options: ['Vòng lặp con', 'Biến toàn cục', 'Một hàm mới', 'Khối lệnh if'],
            correctOptionIndex: 2
          }
        ],
        interactiveGames: [
          {
            id: 'g1_l26',
            type: 'drag_words',
            title: 'Kéo thả khai báo hàm',
            content: 'Muốn tạo hàm tự thiết kế, ta bắt đầu bằng từ khóa [*def*], kế đến là TÊN hàm và bắt buộc đi kèm dấu [*ngoặc tròn*] rồi đến dấu hai chấm. Khi muốn chạy hàm đó hoạt động, ta thực hiện hành vi [*triệu gọi*] nó.',
            hint: 'Bắt đầu bằng def và thực hiện gọi hàm để nó chạy code nội bộ.'
          }
        ],
        labPrompt: 'Định nghĩa một hàm say_hi() in ra chữ "Hi". Sau đó hãy viết lệnh gọi hàm đó.',
        labExpectedCode: 'def say_hi():\n    print("Hi")\nsay_hi()',
        challengePrompt: 'Hãy định nghĩa hàm in_so(x) in ra giá trị x. Thực hiện gọi hàm in_so(5).',
        challengeExpectedCode: 'def in_so(x):\n    print(x)\nin_so(5)'
      },
      {
        id: 'l27',
        title: 'Bài 27: Tham số, đối số và giá trị trả về của hàm',
        theory: [
          '# **Bài 27: THAM SỐ, ĐỐI SỐ VÀ GIÁ TRỊ TRẢ VỀ CỦA HÀM**',
          '',
          '## **1. Khái niệm (What + Why)**',
          '* **Tham số (Parameter):** Là biến tạm khai báo ở dòng `def` giữ chỗ nhận giá trị truyền vào hàm.',
          '* **Đối số (Argument):** Giá trị thực tế dâng truyền nộp vào hàm khi gọi thực thi.',
          '* **Giá trị trả về return (What):** Kết quả dữ liệu mà hàm sau khi kết thúc công năng sẽ bắn ngược đưa truyền về bên ngoài.',
          '* **Tại sao cần return (Why):** Tránh việc chỉ hiển thị "chết" lên màn hình. Nhờ `return`, giá trị máy tính toán thu được có thể chuyển gán cho một biến số ngoài hàm để tiếp tục dây chuyền tính toán kinh ngạc sau đó.',
          '',
          '## **2. Ví dụ đơn giản (How)**',
          '```python',
          '# "a" và "b" là tham số',
          'def tong_hai_so(a, b):',
          '    ket_qua = a + b',
          '    return ket_qua # Trả dữ liệu ra ngoài',
          '',
          '# 12 và 8 là đối số thực tế truyền vào',
          'kq = tong_hai_so(12, 8)',
          'print("Tổng nhận về:", kq)',
          '```',
          '',
          '## **3. Bài tập căn bản (Practice)**',
          '* **Đề bài:** Thiết lập hàm `tinh_tong(a, b)` trả về kết quả `a + b`. Triệu gọi in ra kết quả truyền vào hai số `2` và `3`.',
          '* **Hướng dẫn:**',
          '```python',
          'def tinh_tong(a, b):',
          '    return a + b',
          'print(tinh_tong(2, 3))',
          '```',
          '',
          '## **4. Liên hệ với dạng khác (Connection)**',
          '* Nghĩ đến chiếc máy xay sinh tố. Trực quan trái cây (Chanh, Bơ, Đá) ta thảy vào mồi nạp chính là các Đối số. Động tác máy nghiền xay là mã điều khiển ở Thân hàm. Thứ nước ép sệt thơm mát ta đổ ngược ra ly để rót tận hưởng chính là giá trị trả về `return`.',
          '',
          '## **5. Nâng cao và tư duy tổng quát (Abstraction)**',
          '* Triết lý thiết kế **Hàm thuần thiết (Pure Function)**: Không thay đổi tác động bất kỳ tài nguyên ngoại vi nào, chỉ nhận đầu vào và nhả đầu ra nhất quán giúp chương trình vững như bàn đá.'
        ].join('\n'),
        mindmapUrl: 'https://whimsical.com/embed/S2pE8sH3vH5dMh91r2Hbbz',
        flashcards: [
          { id: 'f1_l27', front: 'Lệnh return dùng để làm gì trong cấu trúc hàm con?', back: 'Để trả về kết quả tính toán của hàm ra bên ngoài cho chương trình tiếp tục sử dụng.' },
          { id: 'f2_l27', front: 'Phân biệt "Tham số" và "Đối số"?', back: 'Tham số là biến khai báo lúc thiết kế hàm, Đối số là giá trị cụ thể đưa vào khi triệu gọi hàm.' }
        ],
        miniQuiz: [
          {
            id: 'q1_l27', type: 'multiple_choice', prompt: 'Hàm kết thúc ngay lập tức khi chạy gặp phải lệnh nào sau đây?',
            options: ['print()', 'return', 'input()', 'def'],
            correctOptionIndex: 1
          }
        ],
        interactiveGames: [
          {
            id: 'g1_l27',
            type: 'drag_words',
            title: 'Kéo thả thuật từ hàm nâng cao',
            content: 'Giá trị tạm khai báo sẵn ở dòng chữ def gọi là [*tham số*]. Giá trị có nghĩa thực tế truyền nộp trực tiếp lúc gọi hàm gọi là [*đối số*]. Kết quả máy tính toán trả tống ngược ra ngoài thân hàm thông qua từ khóa [*return*].',
            hint: 'Khác biệt của return là xuất kết quả cho tiến trình kế tiếp.'
          }
        ],
        labPrompt: 'Xây dựng hàm tinh_tong(a, b) trả về tổng của chúng bằng từ khóa return. Gọi in ra kết quả hàm với hai số đầu vào 2, 3.',
        labExpectedCode: 'def tinh_tong(a, b):\n    return a + b\nprint(tinh_tong(2, 3))',
        challengePrompt: 'Xây dựng hàm nhan_doi(x) dùng return để nhân đôi. Gọi và in kết quả nhan_doi(4).',
        challengeExpectedCode: 'def nhan_doi(x):\n    return x*2\nprint(nhan_doi(4))'
      }
    ]
  },
  {
    id: 'ch6',
    title: 'Chương 6: Phạm vi hoạt động của biến',
    description: 'Biến cục bộ, biến toàn cục và từ khóa global.',
    lessons: [
      {
        id: 'l28',
        title: 'Bài 28: Biến toàn cục và biến cục bộ',
        theory: [
          '# **Bài 28: BIẾN TOÀN CỤC VÀ BIẾN CỤC BỘ**',
          '',
          '## **1. Khái niệm (What + Why)**',
          '* **Biến toàn cục / Global (What):** Khai báo trực tiếp ngoài hàm, tồn tại và truy ngắm được từ mọi kẽ ngách vị trí trong File.',
          '* **Biến cục bộ / Local (What):** Khai báo giam kín bên trong một hàm chỉ có hiệu lực phục vụ nội bộ của hàm đó, biến tan biến biến mất khỏi bộ nhớ ngay khi hàm kết thúc.',
          '* **Tại sao cần global (Why):** Nếu muốn sửa đổi trực tiếp hộp thông tin biến toàn cục bên trong hàm, bạn bắt buộc phải chỉ định từ khóa `global tên_biến`. Nếu không, Python sẽ tự hiểu lầm ta muốn sinh ra một chiếc hộp nội bộ trùng tên cục bộ tạm thời.',
          '',
          '## **2. Ví dụ đơn giản (How)**',
          '```python',
          'can_co = 100 # Biến toàn cục (Global)',
          '',
          'def tinh_toan():',
          '    nut_bam = 5 # Biến cục bộ (Local)',
          '    print("Mã nội bộ:", nut_bam)',
          '',
          'tinh_toan()',
          '# print(nut_bam) <- Nếu chạy lệnh này sẽ báo lỗi ngay vì ngoài hàm không "nhìn" thấy nut_bam!',
          '```',
          '',
          '## **3. Bài tập căn bản (Practice)**',
          '* **Đề bài:** Khai báo một biến toàn cục `c = 1`. Viết hàm sửa đổi `c = 2` bằng từ khóa `global` rồi in kết quả kiểm tra.',
          '* **Hướng dẫn:**',
          '```python',
          'c = 1',
          'def doi_c():',
          '    global c',
          '    c = 2',
          'doi_c()',
          'print(c)',
          '```',
          '',
          '## **4. Liên hệ với dạng khác (Connection)**',
          '* Hãy nghĩ về chiếc loa phát thanh cộng đồng đặt đầu xã huyện (Toàn cục - ai ai cũng nghe và biết), so sánh trực quan với cuộc thì thầm chuyện trò nhỏ của hai bạn ngồi chung góc bàn cuối lớp (Cục bộ - ra khỏi lớp không một ai hay biết).',
          '',
          '## **5. Nâng cao và tư duy tổng quát (Abstraction)**',
          '* Triết lý hạn chế vung vãi biến toàn cục bừa bãi (Global pollution reduction) giúp các khối mã nguồn tương lai độc lập tối cao, không bị va vấp can nhiễu sai khớp dữ liệu do vô tình dùng trùng danh đặt tên.'
        ].join('\n'),
        mindmapUrl: 'https://whimsical.com/embed/S2pE8sH3vH5dMh91r2Hbbz',
        flashcards: [
          { id: 'f1_l28', front: 'Biến nằm bên trong hàm có đặc điểm gì?', back: 'Là biến cục bộ, chỉ dùng được bên trong hàm và biến mất khi hàm chạy xong.' },
          { id: 'f2_l28', front: 'Từ khóa nào giúp hàm thay đổi giá trị của một biến toàn cục?', back: 'Từ khóa "global"' }
        ],
        miniQuiz: [
          {
            id: 'q1_l28', type: 'multiple_choice', prompt: 'Báo lỗi gì khi ngoài hàm cố in một biến khai báo thuần túy bên trong hàm con?',
            options: ['Lỗi NameError (chưa định nghĩa)', 'Lỗi TypeError', 'Lỗi Syntax', 'Không báo lỗi'],
            correctOptionIndex: 0
          }
        ],
        interactiveGames: [
          {
            id: 'g1_l28',
            type: 'drag_words',
            title: 'Kéo thả không gian biến',
            content: 'Khai báo ngoài hàm là biến [*toàn cục*]. Biến trong hàm mang đặc thù [*cục bộ*]. Muốn thay đổi chỉ số biến xã hội tại nội bộ hàm phải khai báo từ khóa [*global*]. Lạm dụng biến toàn cục quá mức sẽ dẫn tới nguy cơ ngập [*trùng tên*].',
            hint: 'Toàn cục ngoài hàm, cục bộ trong hàm, thay đổi gõ từ khóa global.'
          }
        ],
        labPrompt: 'Tạo biến c = 1. Trong hàm doi_c dùng từ khóa global c để biến c gán chuyển thành 2. In biến c ra màn hình để xem thành tựu.',
        labExpectedCode: 'c = 1\ndef doi_c():\n    global c\n    c = 2\ndoi_c()\nprint(c)',
        challengePrompt: 'Hãy viết chương trình khai báo hàm test(), trong test khởi tạo d = 5 cục bộ và thực hiện in. Triệu gọi test().',
        challengeExpectedCode: 'def test():\n    d = 5\n    print(d)\ntest()'
      }
    ]
  },
  {
    id: 'ch7',
    title: 'Chương 7: Kiểm lỗi, Thực hành và Ôn tập tổng hợp',
    description: 'Gỡ lỗi, test nhanh và các dạng bài tập thực hành tổng hợp.',
    lessons: [
      {
        id: 'l29',
        title: 'Bài 29: Nhận biết và phân loại lỗi chương trình',
        theory: [
          '# **Bài 29: NHẬN BIẾT VÀ PHÂN LOẠI LỖI CHƯƠNG TRÌNH**',
          '',
          '## **1. Khái niệm (What + Why)**',
          '* **Lỗi cú pháp / Syntax Error (What):** Viết mã sai ngữ pháp hệ thống của Python, chương trình bị ném chặn lập tức từ cổng biên dịch không cho chạy (gõ sai chữ, thiêu hai chấm...).',
          '* **Lỗi ngoại lệ / RuntimeError (What):** Mã viết chuẩn ngữ pháp nhưng khi vận hành va vấp dữ dội (Ví dụ: Số chia cho 0, ép xâu chữ cái thành số nguyên...).',
          '* **Lỗi logic / Logic Error (What):** Chương trình bon mượt không một lỗi đỏ báo lên, nhưng kết quả in ra lại méo mó sai yêu cầu bài toán đề ra (Ví dụ: Muốn tính tổng nhưng cài mã phép nhân).',
          '* **Tại sao cần học kiểm lỗi (Why):** Góp tăng 80% thời gian của nhà phát triển phần mềm thực thụ là vá sửa kiểm lỗi. Trở thành thám tử lọc mụn lỗi của chính mình nâng cao bản lĩnh tư duy vượt bậc.',
          '',
          '## **2. Ví dụ đơn giản (How)**',
          '```python',
          '# ZeroDivisionError: RuntimeError xảy ra khi chia cho 0',
          'try:',
          '    loi = 10 / 0',
          'except ZeroDivisionError:',
          '    print("Hệ thống phát hiện lỗi chia 0 và đã tự xử lý an toàn!")',
          '```',
          '',
          '## **3. Bài tập căn bản (Practice)**',
          '* **Đề bài:** Hãy viết thử một chương trình bọc try/except xử lý biến chưa khai báo mà không bị đổ vỡ tắt chương trình bất thần.',
          '* **Hướng dẫn:**',
          '```python',
          'try:',
          '    print(bi_an)',
          'except:',
          '    print("Lỗi")',
          '```',
          '',
          '## **4. Liên hệ với dạng khác (Connection)**',
          '* Hãy nghĩ về việc: Viết sai lỗi chính tả tiếng Việt (Syntax). Dùng từ ngữ hợp pháp nhưng phát biểu trong ngữ cảnh không có người nghe (Runtime). Và nói chuyện chuẩn từ mượt giọng nhưng người nghe lại hiểu sai lạc đề (Logic).',
          '',
          '## **5. Nâng cao và tư duy tổng quát (Abstraction)**',
          '* Xây dựng chương trình vững vàng có khả năng tự vá lỗi tự động phục hồi trong thực thi (**Fault-tolerant software**) phân biệt các kiến trúc cốt lõi bền bỉ toàn cầu.'
        ].join('\n'),
        mindmapUrl: 'https://whimsical.com/embed/S2pE8sH3vH5dMh91r2Hbbz',
        flashcards: [
          { id: 'f1_l29', front: 'Lỗi viết sai cú pháp câu lệnh trong Python gọi là?', back: 'Lỗi cú pháp (Syntax Error).' },
          { id: 'f2_l29', front: 'Lỗi chia cho 0 hay IndexOutRange thuộc phân loại nào?', back: 'Lỗi ngoại lệ thời gian chạy (Runtime Error).' }
        ],
        miniQuiz: [
          {
            id: 'q1_l29', type: 'multiple_choice', prompt: 'Chương trình không báo lỗi đỏ nhưng tính kết quả sai yêu cầu là lỗi gì?',
            options: ['Syntax Error', 'Runtime Error', 'Logic Error', 'Exception'],
            correctOptionIndex: 2
          }
        ],
        interactiveGames: [
          {
            id: 'g1_l29',
            type: 'drag_words',
            title: 'Kéo thả biệt đội giải cứu lỗi',
            content: 'Sai cú pháp hệ thống ném ra lỗi [*Syntax Error*]. Gặp sự cố tính toán khi đang chạy rơi vào lỗi [*Runtime Error*]. Mã chạy mượt nhưng ra kết quả sai lệch là lỗi [*Logic Error*]. Ta bọc khối bảo an bằng từ khoá [*try*]/except.',
            hint: 'try/except bọc kiểm soát lỗi chạy mượt và 3 loại lỗi chính.'
          }
        ],
        labPrompt: 'In ra màn hình dòng chữ "Không có lỗi" để khởi hành bài gỡ lỗi.',
        labExpectedCode: 'print("Không có lỗi")',
        challengePrompt: 'Sử dụng try/except cơ bản để bắt lỗi biến chưa khai báo undeclared. Nếu lỗi hãy in "Lỗi".',
        challengeExpectedCode: 'try:\n    print(undeclared)\nexcept:\n    print("Lỗi")'
      },
      {
        id: 'l30',
        title: 'Bài 30: Phương pháp gỡ lỗi và in giá trị',
        theory: [
          '# **Bài 30: PHƯƠNG PHÁP GỠ LỖI VÀ IN GIÁ TRỊ**',
          '',
          '## **1. Khái niệm (What + Why)**',
          '* **Gỡ lỗi / Debugging (What):** Là quá trình lập trình viên từng bước rà soát, theo dõi biến đổi của các thành phần trong chương trình để phát hiện lỗi logic nằm sấp trú ẩn.',
          '* **Tại sao cần debug bằng print() (Why):** Cách cơ bản và siêu hiệu lực nhất cho người mới bắt đầu học là xốc dọn chèn thêm lệnh `print()` kiểm soát trạng thái ở các mốc ranh giới then chốt. Cát lấp bóng đêm bế tắc của dòng chạy, biến sự vận hành của máy tính thành thông số sáng tỏ hiển thị tường cận.',
          '',
          '## **2. Ví dụ đơn giản (How)**',
          '```python',
          '# Gỡ lỗi xem biến i và tong thay đổi thế nào dồn dập',
          'tong = 0',
          'for i in range(3):',
          '    tong = tong + i',
          '    # Chèn mốc debug quan sát',
          '    print("DEBUG - Vòng lặp i:", i, "Tích luỹ tổng hiện thời:", tong)',
          'print("Kết quả tính toán cuối cùng:", tong)',
          '```',
          '',
          '## **3. Bài tập căn bản (Practice)**',
          '* **Đề bài:** Thử lập trình in dòng chữ theo dõi gỡ lỗi có chứa nội dung `Gỡ lỗi: ` kèm giá trị biến `i` lặp 1 lần.',
          '* **Hướng dẫn:**',
          '```python',
          'for i in range(1):',
          '    print("Gỡ lỗi: " + str(i))',
          '```',
          '',
          '## **4. Liên hệ với dạng khác (Connection)**',
          '* Hãy nghĩ đến hành vi đặt camera giám sát kiểm soát tốc độ hành trình của xe cộ trên đường cao tốc. Nhờ các trạm mốc ghi dữ liệu trung gian, bạn rà rõ ngọn nguồn xe gặp tai nạn dừng xe sai luồng ở múi giờ nào chuẩn xác.',
          '',
          '## **5. Nâng cao và tư duy tổng quát (Abstraction)**',
          '* Kỹ nghệ theo dõi và truy dấu thực thi (**Execution tracing**) rèn luyện đầu óc tư duy suy luận khoa học thực chứng sắc bén, một nền tảng tư duy vàng ngọc của mọi kỹ sư lỗi lạc bậc nhất toàn cầu.'
        ].join('\n'),
        mindmapUrl: 'https://whimsical.com/embed/S2pE8sH3vH5dMh91r2Hbbz',
        flashcards: [
          { id: 'f1_l30', front: 'Cách tự động gỡ lỗi trực quan đơn giản nhất là gì?', back: 'Chèn thêm các câu lệnh print() để in giá trị biến số trung gian kiểm soát.' },
          { id: 'f2_l30', front: 'Mục đích chính của Debugging là?', back: 'Tìm và khắc phục (gỡ) các lỗi logic ẩn khiến chương trình chạy sai lệch.' }
        ],
        miniQuiz: [
          {
            id: 'q1_l30', type: 'multiple_choice', prompt: 'In giá trị biến số khi kiểm lỗi giúp bạn giải quyết loại lỗi khó chịu nào?',
            options: ['Logic Error', 'Syntax Error', 'Lỗi tải trang', 'Mất kết nối mạng'],
            correctOptionIndex: 0
          }
        ],
        interactiveGames: [
          {
            id: 'g1_l30',
            type: 'drag_words',
            title: 'Kéo thả chiến binh gỡ lỗi',
            content: 'Quá trình đi tìm và diệt sâu bọ rà lỗi gọi là [*debugging*]. Ta chủ động chèn câu lệnh [*print*] để rọi sáng biến số lúc vận hành [*trung gian*], giúp nhanh chóng phát hiện ra ổ lỗi khuất thuộc nhóm lỗi [*logic*].',
            hint: 'Công việc debug, dùng chêm print rọi sáng dữ liệu logic trung gian.'
          }
        ],
        labPrompt: 'Hãy in ra giá trị theo dõi kiểm thử: "Gỡ lỗi: " cộng ép xâu giá trị i trong vòng lặp for i in range(1):',
        labExpectedCode: 'for i in range(1):\n    print("Gỡ lỗi: " + str(i))',
        challengePrompt: 'Hãy gán debug_mode = True và dùng print để in giá trị debug_mode đó ra màn hình.',
        challengeExpectedCode: 'debug_mode = True\nprint(debug_mode)'
      },
      {
        id: 'l31',
        title: 'Bài 31: Vận dụng hàm và cấu trúc điều khiển',
        theory: [
          '# **Bài 31: VẬN DỤNG HÀM VÀ CẤU TRÚC ĐIỀU KHIỂN**',
          '',
          '## **1. Khái niệm (What + Why)**',
          '* **Hợp lực Thuật toán (What):** Sự giao thoa đỉnh cao của cấu trúc rẽ nhánh, vòng lặp lồng chặt chẽ bên trong một chương trình con đóng gói.',
          '* **Tại sao cần kết hợp (Why):** Các bài toán thực tế cực kỳ gai góc. Để giải quyết, chiếc máy tính không thể chỉ tính thuần một phép rẽ hay một phép cộng. Việc phối khí ăn nhịp giữa các khối kiến trúc trong Hàm giúp cấu tạo lên bộ xương thuật toán vững vàng giải đoạt bài toán vĩ đại.',
          '',
          '## **2. Ví dụ đơn giản (How)**',
          '```python',
          '# Hàm tìm xem số n có phải số nguyên tố hay không',
          'def kiem_tra_nguyen_to(n):',
          '    if n < 2:',
          '        return False',
          '    for i in range(2, n):',
          '        if n % i == 0:',
          '            return False # Phát hiện chia hết thì rút lui phủ định ngay',
          '    return True # Trụ hết vòng lặp thành công',
          '',
          'print("Số 7 có nguyên tố không:", kiem_tra_nguyen_to(7)) # True',
          '```',
          '',
          '## **3. Bài tập căn bản (Practice)**',
          '* **Đề bài:** Thiết lập hàm `chan_le(n)` trả về kết quả là chữ `Chẵn` nếu số chẵn, ngược lại trả về chữ `Lẻ`. In kết quả hàm với đầu vào là 10.',
          '* **Hướng dẫn:**',
          '```python',
          'def chan_le(n):',
          '    return "Chẵn" if n % 2 == 0 else "Lẻ"',
          'print(chan_le(10))',
          '```',
          '',
          '## **4. Liên hệ với dạng khác (Connection)**',
          '* Hãy nghĩ về việc pha chế một ly cocktail hoặc nấu một nồi lẩu ngon. Đầu bếp phải tuân thủ nghiêm ngặt kỹ thuật rẽ nhánh (nếm nêm nếm cho mặn/ngọt tùy vị), vòng lặp lót đun nước và đóng gói hoàn hảo trong một định dạng quy trình món ăn đặc danh của nhà hàng.',
          '',
          '## **5. Nâng cao và tư duy tổng quát (Abstraction)**',
          '* Xây dựng thuật toán tối ưu là hành trình tinh lọc tối giản độ phức tạp thời gian vận hành máy tính, hướng người học đạt trình độ kỹ nghệ công nghệ đột phá.'
        ].join('\n'),
        mindmapUrl: 'https://whimsical.com/embed/S2pE8sH3vH5dMh91r2Hbbz',
        flashcards: [
          { id: 'f1_l31', front: 'Các thành phần cơ bản kiến tạo lên cấu trúc thuật toán gồm?', back: 'Tuần tự, rẽ nhánh (if), và lặp (for/while) được đóng gói trong các chương trình con (Hàm).' },
          { id: 'f2_l31', front: 'Tại sao nên bọc lặp và rẽ nhánh bên trong một hàm?', back: 'Để bảo vệ tính module, dễ tái sử dụng, dễ đọc, và giảm độ phức tạp khi lập trình.' }
        ],
        miniQuiz: [
          {
            id: 'q1_l31', type: 'multiple_choice', prompt: 'Hàm trả về giá trị gì nếu không cung cấp từ khóa return một cách hiển ngôn trong thân?',
            options: ['Báo lỗi Runtime', 'None', '0', 'Xâu rỗng ""'],
            correctOptionIndex: 1
          }
        ],
        interactiveGames: [
          {
            id: 'g1_l31',
            type: 'drag_words',
            title: 'Kéo thả thuật toán hợp nhất',
            content: 'Một thuật toán vẹn toàn kết hợp cấu trúc [*rẽ nhánh*] để đưa phán quyết rẽ lối, vòng lặp để quần thảo [*tần suất dữ liệu*] và gói gọn bọc kín cực kỳ thông minh bên trong [*hàm*] con để tái sử dụng tối ưu.',
            hint: 'Kết hợp if, for/while trong def tạo linh hồn cốt lõi thuật toán.'
          }
        ],
        labPrompt: 'Xây dựng hàm chan_le(n) trả về xâu "Chẵn" nếu n chẵn chẵn chẵn chia hết cho 2, ngược lại trả về "Lẻ". In hàm cho số 10 để chạy.',
        labExpectedCode: 'def chan_le(n):\n    return "Chẵn" if n % 2 == 0 else "Lẻ"\nprint(chan_le(10))',
        challengePrompt: 'Hãy viết hàm max_2_so(a, b) dùng trả về số lớn hơn. Gọi in và truyền với a=5, b=7.',
        challengeExpectedCode: 'def max_2_so(a, b):\n    return a if a > b else b\nprint(max_2_so(5, 7))'
      },
      {
        id: 'l32',
        title: 'Bài 32: Ôn tập và thực hành tổng hợp cuối khoá',
        theory: [
          '# **Bài 32: ÔN TẬP VÀ THỰC HÀNH TỔNG HỢP CUỐI KHOÁ**',
          '',
          '## **1. Khái niệm (What + Why)**',
          '* **Hồng tâm Kiến thức (What):** Hệ thống và lắp ráp toàn thể di sản từ Bài 16 đến nay: Biến, kiểu dữ liệu, các phép toán số học, lệnh gán, cấu trúc rẽ nhánh, vòng lặp tuần hoàn, list lưu trữ, xâu ký tự tinh vi, định hàm bọc mã...',
          '* **Tại sao cần ôn tập (Why):** Lập trình là một dạng kỹ năng cơ tay và óc tư duy của bộ não. Càng va đụng trải nghiệm thực tế giải các bài toán tổng thể bạn càng ngấm sâu hiểu thấu, liên kết chặt chẽ mọi dữ kiện biến thành phản xạ tự nhiên của một kỹ sư số.',
          '',
          '## **2. Ví dụ đơn giản (How)**',
          'Chương trình tính và in ra mốc xếp loại học lực học sinh từ đầu vào mảng điểm danh sách:',
          '```python',
          'danh_sach_diem = [8.5, 9.2, 4.5, 6.7]',
          'def danh_gia_lop(ds):',
          '    for d in ds:',
          '        xep_loai = "Giỏi" if d >= 8.0 else "Khá" if d >= 6.5 else "Yếu"',
          '        print("Điểm:", d, "Xếp loại danh dự:", xep_loai)',
          '',
          'danh_gia_lop(danh_sach_diem)',
          '```',
          '',
          '## **3. Bài tập căn bản (Practice)**',
          '* **Đề bài:** Viết mã lệnh in ra câu chào chúc mừng "Hoàn thành khoá học đồ tuệ!" rạng ngời.',
          '* **Hướng dẫn:**',
          '```python',
          'print("Hoàn thành khoá học đồ tuệ!")',
          '```',
          '',
          '## **4. Liên hệ với dạng khác (Connection)**',
          '* Ôn tập tổng hợp giống hệt việc bạn vẽ một bức tranh sơn dầu khổng lồ. Mọi kỹ thuật lót nét chì căn bản, cách nạp pha màu, cách tạo bóng tối sáng rải rác chính là các bài học nhỏ bấy lâu, nay tề tựu toả sáng rực rỡ trên một khung tranh thâm hậu duy nhất.',
          '',
          '## **5. Nâng cao và tư duy tổng quát (Abstraction)**',
          '* Tư duy hệ thống tổng thể (Systemic computational thinking) giải quyết bài toán cốt lõi của xã hội thời đại bằng những dòng mã sạch đẹp, chuẩn mực và thông thái tột đỉnh.'
        ].join('\n'),
        mindmapUrl: 'https://whimsical.com/embed/S2pE8sH3vH5dMh91r2Hbbz',
        flashcards: [
          { id: 'f1_l32', front: 'Bí kíp để ghi nhớ sâu sắc lập trình Python lâu bền là?', back: 'Thực hành liên tục, giải các bài tập tổng hợp và tự xây dựng dự án nhỏ thực tế.' },
          { id: 'f2_l32', front: 'Phím tắt nào giúp biên dịch chạy nhanh tệp lệnh trong môi trường IDLE của Python?', back: 'Phím F5 thân thuộc.' }
        ],
        miniQuiz: [
          {
            id: 'q1_l32', type: 'multiple_choice', prompt: 'Hành trình vượt vũ môn xuất sắc lập trình Python lớp 10 trang bị cho bạn tư duy gì quý báu?',
            options: ['Tư duy máy tính (Computational Thinking)', 'Chép code mẫu', 'Gõ phím mù', 'Học thuộc lòng lý thuyết'],
            correctOptionIndex: 0
          }
        ],
        interactiveGames: [
          {
            id: 'g1_l32',
            type: 'drag_words',
            title: 'Kéo thả chiến hữu chúc mừng',
            content: 'Chúc mừng bạn đã hoàn thành [*khoá học*] lập trình Python lớp 10! Hành trình đi qua từ biến, gán, [*vòng lặp*], danh sách cho đến [*hàm*] tự định nghĩa giúp nâng tầm tư duy trí tuệ [*máy tính*] đột phá vang dội!',
            hint: 'Khóa học kết thúc viên mãn mở ra thế giới công nghệ tương lai rộng lớn.'
          }
        ],
        labPrompt: 'Hãy viết chương trình in ra lời chúc mừng "Hoàn thành khoá học đồ tuệ!".',
        labExpectedCode: 'print("Hoàn thành khoá học đồ tuệ!")',
        challengePrompt: 'Hãy viết lệnh in ra chữ "Chúc mừng!" để chào đón thành tựu hoàn thành.',
        challengeExpectedCode: 'print("Chúc mừng!")'
      }
    ]
  }
];

export const BLOG_POSTS = [
  { id: 'b1', title: 'Lập trình viên Python có thể làm những công việc gì?', category: 'Định hướng' },
  { id: 'b2', title: 'Sửa các lỗi phổ biến khi mới học Python (SyntaxError...)', category: 'Kỹ năng' },
  { id: 'b3', title: 'Mẹo tối ưu code Python sao cho sạch và đẹp', category: 'Kỹ năng nâng cao' }
];
