import type { VercelRequest, VercelResponse } from '@vercel/node';
import Groq from 'groq-sdk';

let keyIndex = 0;
function getGroqKey(customKeyStr?: string) {
  let keys: string[] = [];
  if (customKeyStr && customKeyStr.startsWith('gsk_')) {
    keys = customKeyStr.split(',').map(k => k.trim()).filter(Boolean);
  } else {
    const envKeys = process.env.GROQ_API_KEYS || '';
    keys = envKeys.split(',').map(k => k.trim()).filter(Boolean);
  }
  if (keys.length === 0) return null;
  const key = keys[keyIndex % keys.length];
  keyIndex++;
  return key;
}

async function callGroq(systemPrompt: string, apiKey: string, jsonResponse: boolean = false) {
  const client = new Groq({ apiKey });
  const response = await client.chat.completions.create({
    messages: [{ role: 'user', content: systemPrompt }],
    model: 'llama-3.1-8b-instant',
    ...(jsonResponse ? { response_format: { type: 'json_object' } } : {})
  });
  return response.choices[0]?.message?.content;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');

  try {
    const { code, expectedCode, prompt, level = 'Lớp 10 - 12' } = req.body;
    const gkey = getGroqKey(req.headers['x-api-key'] as string);
    if (!gkey) return res.json({ hasError: false, line: 0, explanation: "", suggestion: "", wrong: "", right: "" });

    const systemPrompt = `Bạn là một trợ lý ảo phát hiện lỗi cú pháp và logic Python tự động cho học sinh trình độ: ${level}.
Kiểm tra xem code của học sinh có lỗi chính tả, cú pháp, thụt dòng, hoặc lỗi logic không.

Yêu cầu bài tập: ${prompt || "Không có yêu cầu cụ thể"}
Mã nguồn của học sinh:
\`\`\`python
${code || ''}
\`\`\`
Mã nguồn đáp án tham khảo (nếu có):
\`\`\`python
${expectedCode || ''}
\`\`\`

Trả về JSON chuẩn:
Nếu có lỗi: {"hasError":true,"line":<số dòng>,"explanation":"❌ giải thích lỗi","suggestion":"✓ gợi ý sửa","wrong":"dòng lệnh sai","right":"dòng lệnh đúng"}
Nếu đúng: {"hasError":false,"line":0,"explanation":"","suggestion":"","wrong":"","right":""}`;

    const responseText = await callGroq(systemPrompt, gkey, true);
    const result = JSON.parse(responseText || '{"hasError": false}');
    res.json(result);
  } catch (err: any) {
    console.error('Analyzer error:', err?.message);
    res.json({ hasError: false, line: 0, explanation: "", suggestion: "", wrong: "", right: "" });
  }
}
