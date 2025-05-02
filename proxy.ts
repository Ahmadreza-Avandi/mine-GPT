// server.ts
import express, { Request, Response } from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = 3001;

// ——————————————
// ۱) تنظیم CORS و JSONت
app.use(cors());
app.use(express.json());

// ——————————————
// ۲) کلاینت GitHub AI
const apiKey = process.env.GITHUB_AI_KEY;
if (!apiKey) {
  throw new Error('GITHUB_AI_KEY environment variable is not set');
}
const client = new OpenAI({
  baseURL: "https://models.github.ai/inference",
  apiKey
});

// ——————————————
// ۳) فانکشن مشترک ارسال درخواست
async function askGitHubAI(text: string) {
  const res = await client.chat.completions.create({
    messages: [
      { role: "system", content: "You are GitHub AI." },
      { role: "user",   content: text }
    ],
    model: "gpt-4o",
    temperature: 1,
    max_tokens: 4096,
    top_p: 1,
    // @ts-ignore: publisher is allowed by the API but not in SDK types
    publisher: "openai"  // ←‌ ناشر مدل رو اینجا بذار
  });
  return res.choices[0].message.content;
}

// ——————————————
// ۴a) POST /proxy
app.post('/proxy', async (req: Request, res: Response) => {
  const text = req.body.text as string;
  if (!text) {
    return res.status(400).json({ error: "پارامتر text الزامی‌ست" });
  }
  try {
    const answer = await askGitHubAI(text);
    res.json({ ok: true, answer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "خطای داخلی" });
  }
});

// ——————————————
// ۴b) GET /proxy
// مثال: GET /proxy?text=سلام
app.get('/proxy', async (req: Request, res: Response) => {
  const text = req.query.text as string;
  if (!text) {
    return res.status(400).json({ error: "پارامتر text الزامی‌ست" });
  }
  try {
    const answer = await askGitHubAI(text);
    res.json({ ok: true, answer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "خطای داخلی" });
  }
});

// ——————————————
// ۵) استارت سرور
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
