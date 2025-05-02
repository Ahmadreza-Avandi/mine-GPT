// server.ts
import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const PORT = 3001;

const reversed = process.env.GITHUB_AI_KEY_REVERSED!;
const apiKey = reversed.split('').reverse().join('');


const client = new OpenAI({
  baseURL: "https://models.github.ai/inference",  // ← برگشتیم
  apiKey
});

async function askGitHubAI(text: string) {
  const res = await client.chat.completions.create({
    messages: [
      { role: "system", content: "You are GitHub AI." },
      { role: "user", content: text }
    ],
    model: "gpt-4o",
    temperature: 1,
    max_tokens: 4096,
    top_p: 1,
    // @ts-ignore: publisher is allowed by the API but not in SDK types
    publisher: "openai"  // ← ناشر واقعی
  });
  return res.choices[0].message.content;
}

app.use(cors());
app.use(express.json());

app.post('/proxy', async (req, res) => {
  const text = req.body.text;
  if (!text) return res.status(400).json({ error: "پارامتر text الزامی‌ست" });
  try {
    const answer = await askGitHubAI(text);
    res.json({ ok: true, answer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "خطای داخلی" });
  }
});

app.get('/proxy', async (req, res) => {
  const text = req.query.text as string;
  if (!text) return res.status(400).json({ error: "پارامتر text الزامی‌ست" });
  try {
    const answer = await askGitHubAI(text);
    res.json({ ok: true, answer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "خطای داخلی" });
  }
});

app.listen(PORT, () => console.log(`✅ Server on http://localhost:${PORT}`));
