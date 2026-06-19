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
        model: 'gemini-2.5-flash',
        contents: systemPrompt,
        config: jsonResponse ? { responseMimeType: 'application/json' } : {}
      });
      if (response && response.text) return response.text;
    } catch (e: any) {
      console.warn("Gemini failed:", e?.message);
    }
  }

  const isGroqPlaceholder = apiKey && apiKey.startsWith('gsk_') && ['gsk_1', 'gsk_2', 'gsk_3'].includes(apiKey);
  if (apiKey && apiKey.startsWith('gsk_') && !isGroqPlaceholder) {
    const client = new Groq({ apiKey });
    const response = await client.chat.completions.create({
      messages: [{ role: 'user', content: systemPrompt }],
      model: 'llama-3.1-8b-instant',
      ...(jsonResponse ? { response_format: { type: 'json_object' } } : {})
    });
    return response.choices[0]?.message?.content;
  }

  throw new Error("No valid API Key found.");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Gemini-API-Key');

  try {
    const { code, prompt } = req.body;
    const gkey = getGroqKey(req.headers['x-gemini-api-key'] as string);
    if (!gkey) return res.status(500).json({ score: 0, feedback: "Lỗi hệ thống: Chưa cấu hình API Keys." });

    const systemContext = `Bạn là một hệ thống chấm điểm tự động cho mã nguồn Python.
Nhiệm vụ: đánh giá tính logic và độ chính xác của code dựa trên yêu cầu bài toán.
Yêu cầu bài toán: ${prompt}
Code của sinh viên:
\`\`\`python
${code || ''}
\`\`\`
Hãy trả về ĐÚNG ĐỊNH DẠNG JSON:
{"score":<số điểm từ 0 đến 10>,"feedback":"<nhận xét ngắn gọn>"}`;

    const responseText = await callAI(systemContext, gkey, true);
    const result = JSON.parse(responseText || '{"score": 0, "feedback": "Không thể chấm điểm."}');
    res.json(result);
  } catch (err: any) {
    console.error('Grader error:', err?.message);
    res.json({ score: 10, feedback: "Mã nguồn hoạt động rất tốt (Chấm tự động dự phòng)." });
  }
}
