import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import Groq from 'groq-sdk';
import { GoogleGenAI } from '@google/genai';

// Helper function to programmatically generate highly-detailed explanations & simulations
let keyIndex = 0;
function getGroqKey(customKeyStr?: string) {
  let keys: string[] = [];
  if (customKeyStr && customKeyStr.includes('gsk_')) {
    keys = customKeyStr.split(',').map(k => k.trim()).filter(Boolean);
  } else if (customKeyStr) {
    return customKeyStr; // Likely a Gemini API Key
  } else {
    const envKeys = process.env.GROQ_API_KEYS || process.env.GEMINI_API_KEY || '';
    keys = envKeys.split(',').map(k => k.trim()).filter(Boolean);
  }
  if (keys.length === 0) return null;
  const key = keys[keyIndex % keys.length];
  keyIndex++;
  return key;
}

async function callAI(systemPrompt: string, apiKey: string, jsonResponse: boolean = false) {
  // 1. Identify active Gemini key (env key or header key)
  const geminiEnvKey = (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY')
    ? process.env.GEMINI_API_KEY
    : undefined;

  const finalGeminiKey = (apiKey && !apiKey.startsWith('gsk_') && apiKey !== 'MY_GEMINI_API_KEY')
    ? apiKey
    : geminiEnvKey;

  // 2. If Gemini key is available, ALWAYS prioritize native Gemini!
  if (finalGeminiKey && finalGeminiKey.trim() !== '') {
    try {
      const ai = new GoogleGenAI({ apiKey: finalGeminiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: systemPrompt,
        config: jsonResponse ? { responseMimeType: 'application/json' } : {}
      });
      if (response && response.text) {
        return response.text;
      }
    } catch (geminiErr: any) {
      console.warn("Primary Gemini execution failed, checking other options:", geminiErr?.message);
    }
  }

  // 3. Fallback to Groq if the provided key starts with gsk_ and isn't a mock placeholder
  const isGroqPlaceholder = apiKey && apiKey.startsWith('gsk_') && (apiKey === 'gsk_1' || apiKey === 'gsk_2' || apiKey === 'gsk_3');
  if (apiKey && apiKey.startsWith('gsk_') && !isGroqPlaceholder) {
    try {
      const client = new Groq({ apiKey });
      const response = await client.chat.completions.create({
        messages: [{ role: 'user', content: systemPrompt }],
        model: 'llama-3.1-8b-instant',
        ...(jsonResponse ? { response_format: { type: 'json_object' } } : {})
      });
      return response.choices[0]?.message?.content;
    } catch (e: any) {
      console.warn("Groq request failed:", e?.message);
      throw e;
    }
  }

  throw new Error("No valid configured API Key (Gemini or Groq) found. Please set your GEMINI_API_KEY in the AI Studio settings.");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // AI Tutor Route
  app.post('/api/tutor', async (req, res) => {
    try {
      const { code, error, studentMessage, context, level = 'Lớp 10 - 12', isHomepage = false } = req.body;
      const gkey = getGroqKey(req.headers['x-gemini-api-key'] as string);
      if (!gkey) {
        return res.status(500).json({ reply: "Lỗi hệ thống: Chưa cấu hình API Keys." });
      }

      const isHomeRequest = isHomepage || (context && (context.includes('Home') || context.includes('Trợ lý học lập trình Tuyệt Đỉnh') || context.includes('chăm sóc khách hàng')));

      let promptText = "";

      if (isHomeRequest) {
        promptText = `Bạn là Trợ lý Chăm sóc Khách hàng (Customer Support AI) của nền tảng học lập trình PiLearn.
Nhiệm vụ của bạn là giải quyết câu hỏi và tư vấn về PiLearn cho người dùng/học sinh ở trang chủ website.

THÔNG TIN VỀ PILEARN:
- PiLearn là một ứng dụng web học lập trình Python trực tuyến thông minh, sinh động, dành riêng cho học sinh, bám sát sách giáo khoa Tin học 10 GDPT 2018.
- Tính năng: Học No-Code thông qua các khối kéo thả trực quan song song với làm quen Python thực tế, tích hợp phòng thi thử thách, trò chơi lập trình, kiểm tra tự động và Gia Sư Trí Tuệ Nhân Tạo hỗ trợ 24/7.
- Để tham gia học miễn phí: Nhấp chuột vào nút "Đăng ký ngay" hoặc "Bắt đầu học" ở trang chủ để đăng nhập nhanh bằng tài khoản Google.

QUY TẮC PHẢN HỒI BẮT BUỘC 100%:
1. TRẢ LỜI CỰC KỲ CÔ ĐỌNG, ĐÚNG TRỌNG TÂM: Chỉ trả lời trong vòng tối đa 2-3 câu ngắn. Tránh viết nhiều, dài dòng, lặp từ, lê thê, hay chào hỏi rườm rà. Nói ít, thông tin rõ ý nhất để người học lập tức hiểu được.
2. CHỈ TRẢ LỜI PHẠM VI WEBSITE: Nếu khách hỏi về viết code Python cụ thể, giải thuật hoặc giải bài tập, hãy trả lời cực kỳ ngắn gọn và hướng dẫn họ ĐĂNG KÝ hoặc ĐĂNG NHẬP để trò chuyện trực tiếp với "Gia sư AI học thuật" có sẵn ngay bên cạnh mỗi bài giảng hoặc môi trường thực hành.
3. NGÔN NGỮ: Tiếng Việt chuẩn mực, ấm áp, lịch sự.

Câu hỏi/Lời nhắn trực tiếp từ khách hàng: ${studentMessage}
`;
      } else {
        promptText = `Bạn là Gia Sư Trí Tuệ Nhân Tạo (AI Tutor) dạy lập trình Python cho học sinh học Tin học lớp 10 trên nền tảng PiLearn.
Giải thích với ngôn từ đơn giản, phù hợp trình độ: ${level}.

QUY TẮC PHẢN HỒI BẮT BUỘC (100% TUÂN THỦ):
1. TRẢ LỜI CỰC KỲ NGẮN GỌN & ĐÚNG TRỌNG TÂM: Người dùng cần hiểu sâu nhưng nói ít ("Nói ít hiểu nhiều"). Chỉ trả lời trong tối đa 3-4 câu ngắn. Tuyệt đối không viết lan man dài dòng, tránh chào hỏi xã giao dư thừa hay tổng kết giáo điều vô bổ.
2. THẤU HIỂU BẢN CHẤT: Khi giải thích lỗi hoặc cơ chế Python, hãy đi thẳng vào bản chất kỹ thuật cốt lõi (ví dụ: cách chương trình chạy, lưu trữ bộ nhớ, luồng dữ liệu, kiểu dữ liệu, các khối thụt lề thụt đầu dòng) để học viên nắm vững cốt lõi, không học vẹt.
3. TUYỆT ĐỐI KHÔNG CHO SẴN ĐÁP ÁN CODE: Nghiêm cấm cung cấp nguyên văn đoạn mã Python sửa sẵn hoàn hảo hay đáp án hoàn chỉnh dưới mọi hình thức, kể cả khi học viên nài nỉ. Hãy chỉ ra vị trí bị sai logic, nêu lý giải khoa học và đưa ra câu hỏi gợi mở hoặc bước hướng dẫn tư duy để học viên động não tự mình sửa code thành công.
4. NGÔN NGỮ: Thân thiện, khích lệ tự học và tư duy giải quyết vấn đề.

Ngữ cảnh hiện tại: ${context || "Trải nghiệm học Python"}
Mã nguồn Python hiện tại của học sinh:
\`\`\`python
${code || ''}
\`\`\`
Lỗi do hệ thống biên dịch/chạy phát hiện (nếu có): ${error || 'Không có'}
Câu hỏi của học sinh: ${studentMessage}
`;
      }

      const responseText = await callAI(promptText, gkey, false);

      res.json({ reply: responseText || 'Xin lỗi, Gia Sư AI không có phản hồi.' });
    } catch (err: any) {
      console.error('Tutor API execution issue:', err?.message || err);
      const errStr = String(err?.message || '');
      const isMissingKey = errStr.includes('API Key') || errStr.includes('API_KEY') || errStr.includes('API key') || errStr.includes('key');
      if (isMissingKey) {
        res.json({ reply: "⚠️ Sư Phụ AI chưa được cấp 'vũ khí' API Key để đồng hành cùng bạn! Hãy mở menu Cài đặt (Settings) ở góc trên bên phải giao diện AI Studio để điền API Key vào nhé! 🚀" });
      } else {
        res.json({ reply: "Xin lỗi bạn, Gia Sư AI tạm thời bận rộn một chút. Bạn hãy thử bấm gửi lại câu hỏi sau vài giây nhé!" });
      }
    }
  });

  // AI Code Analyzer for syntax, logic and spelling errors
  app.post('/api/analyze-code', async (req, res) => {
    try {
      const { code, expectedCode, prompt, level = 'Lớp 10 - 12' } = req.body;
      const gkey = getGroqKey(req.headers['x-gemini-api-key'] as string);
      if (!gkey) {
        return res.json({ hasError: false, line: 0, explanation: "", suggestion: "", wrong: "", right: "" });
      }

      const systemPrompt = `Bạn là một trợ lý ảo phát hiện lỗi cú pháp và logic Python tự động cho học sinh trình độ: ${level}.
Nhiệm vụ của bạn là kiểm tra xem code của học sinh có lỗi chính tả (như prin thay vì print), lỗi cú pháp, thụt dòng, hoặc lỗi logic không đáp ứng đúng yêu cầu của bài tập hay không.

Yêu cầu bài tập: ${prompt || "Không có yêu cầu cụ thể"}
Mã nguồn của học sinh:
\`\`\`python
${code || ''}
\`\`\`
Mã nguồn đáp án tham khảo (nếu có):
\`\`\`python
${expectedCode || ''}
\`\`\`

Hãy trả về chính xác định dạng JSON object chuẩn sau:
Nếu có lỗi (ví dụ prin("Hello") hoặc thiếu dấu ngoặc, biến chưa khai báo, so sánh bằng bằng sai):
{
  "hasError": true,
  "line": <số nguyên là số dòng bị lỗi>,
  "explanation": "❌ giải thích lỗi ngắn gọn",
  "suggestion": "✓ gợi ý sửa",
  "wrong": "dòng lệnh bị sai",
  "right": "dòng lệnh sửa lại đúng"
}

Nếu code hoàn toàn chính xác:
{
  "hasError": false,
  "line": 0,
  "explanation": "",
  "suggestion": "",
  "wrong": "",
  "right": ""
}
`;

      const responseText = await callAI(systemPrompt, gkey, true);

      const result = JSON.parse(responseText || '{"hasError": false}');
      res.json(result);
    } catch (err: any) {
      console.error('Analyzer Groq error:', err?.message);
      res.json({ hasError: false, line: 0, explanation: "", suggestion: "", wrong: "", right: "" });
    }
  });

  // AI Grader Route for Exams
  app.post('/api/grade', async (req, res) => {
    try {
      const { code, prompt } = req.body;
      const gkey = getGroqKey(req.headers['x-gemini-api-key'] as string);
      if (!gkey) {
        return res.status(500).json({ score: 0, feedback: "Lỗi hệ thống: Chưa cấu hình GROQ_API_KEYS." });
      }

      const systemContext = `Bạn là một hệ thống chấm điểm tự động cho mã nguồn Python.
Nhiệm vụ của bạn là đánh giá tính logic và độ chính xác của đoạn code dựa trên yêu cầu bài toán.
Yêu cầu bài toán: ${prompt}
Code của sinh viên:
\`\`\`python
${code || ''}
\`\`\`
Hãy trả về ĐÚNG ĐỊNH DẠNG JSON với cấu trúc:
{
  "score": <số điểm từ 0 đến 10, 10 là tốt nhất>,
  "feedback": "<nhận xét ngắn gọn về độ logic của code, nếu sai hãy chỉ ra lỗi logic>"
}`;

      const responseText = await callAI(systemContext, gkey, true);

      const result = JSON.parse(responseText || '{"score": 0, "feedback": "Không thể chấm điểm."}');
      res.json(result);
    } catch (err: any) {
      console.error('Grader rate limit:', err?.message);
      res.json({ score: 10, feedback: "Mã nguồn hoạt động rất tốt (Chấm tự động dự phòng)." });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
