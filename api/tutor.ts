import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';
import Groq from 'groq-sdk';

let keyIndex = 0;
function getGroqKey(customKeyStr?: string) {
  let keys: string[] = [];
  if (customKeyStr && customKeyStr.includes('gsk_')) {
    keys = customKeyStr.split(',').map(k => k.trim()).filter(Boolean);
  } else if (customKeyStr) {
    return customKeyStr;
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
  const geminiEnvKey = (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY')
    ? process.env.GEMINI_API_KEY
    : undefined;

  const finalGeminiKey = (apiKey && !apiKey.startsWith('gsk_') && apiKey !== 'MY_GEMINI_API_KEY')
    ? apiKey
    : geminiEnvKey;

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
      console.warn("Primary Gemini execution failed:", geminiErr?.message);
    }
  }

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

  throw new Error("No valid configured API Key (Gemini or Groq) found.");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Gemini-API-Key');

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
- Tính năng: Học No-Code thông qua các khối kéo thả trực quan, tích hợp phòng thi thử thách, trò chơi lập trình, kiểm tra tự động và Gia Sư Trí Tuệ Nhân Tạo hỗ trợ 24/7.
- Để tham gia học miễn phí: Nhấp vào nút "Đăng ký ngay" hoặc "Bắt đầu học".

QUY TẮC PHẢN HỒI BẮT BUỘC:
1. TRẢ LỜI CỰC KỲ CÔ ĐỌNG: Chỉ trả lời trong tối đa 2-3 câu ngắn.
2. CHỈ TRẢ LỜI PHẠM VI WEBSITE.
3. NGÔN NGỮ: Tiếng Việt chuẩn mực, ấm áp, lịch sự.

Câu hỏi/Lời nhắn từ khách hàng: ${studentMessage}
`;
    } else {
      promptText = `Bạn là Gia Sư Trí Tuệ Nhân Tạo (AI Tutor) dạy lập trình Python cho học sinh học Tin học lớp 10 trên nền tảng PiLearn.
Giải thích với ngôn từ đơn giản, phù hợp trình độ: ${level}.

QUY TẮC PHẢN HỒI BẮT BUỘC:
1. TRẢ LỜI CỰC KỲ NGẮN GỌN: Chỉ trả lời trong tối đa 3-4 câu ngắn.
2. THẤU HIỂU BẢN CHẤT: Đi thẳng vào bản chất kỹ thuật cốt lõi.
3. TUYỆT ĐỐI KHÔNG CHO SẴN ĐÁP ÁN CODE.
4. NGÔN NGỮ: Thân thiện, khích lệ tự học.

Ngữ cảnh hiện tại: ${context || "Trải nghiệm học Python"}
Mã nguồn Python:
\`\`\`python
${code || ''}
\`\`\`
Lỗi phát hiện (nếu có): ${error || 'Không có'}
Câu hỏi của học sinh: ${studentMessage}
`;
    }

    const responseText = await callAI(promptText, gkey, false);
    res.json({ reply: responseText || 'Xin lỗi, Gia Sư AI không có phản hồi.' });
  } catch (err: any) {
    console.error('Tutor API error:', err?.message || err);
    res.json({ reply: "Xin lỗi bạn, Gia Sư AI tạm thời bận rộn. Bạn hãy thử lại sau vài giây nhé!" });
  }
}
