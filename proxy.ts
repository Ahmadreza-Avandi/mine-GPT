import express, { Request, Response } from 'express';
import cors from 'cors';
import { OpenAI } from 'openai';

const app = express();
const PORT = 3001;

// کلید API جدید رو وارد کنید
const openai = new OpenAI({
  apiKey: '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',
  baseURL: 'https://openrouter.ai/api/v1',
});

app.use(cors({ origin: '*', methods: ['GET', 'POST'], allowedHeaders: ['Content-Type', 'Accept'] }));
app.use(express.json());

app.get('/proxy', async (req: Request, res: Response) => {
  try {
    const text = req.query.text as string;
    if (!text) return res.status(400).json({ error: 'پارامتر text الزامی‌ه' });

    const completion = await openai.chat.completions.create({
      model: 'deepseek/deepseek-r1:free',
      messages: [{ role: 'user', content: text }],
    });

    const answer = completion.choices?.[0]?.message?.content;
    return res.json({ ok: true, answer });
  } catch (err: any) {
    console.error(err);
    const msg = err?.response?.statusText || err.message;
    return res.status(500).json({ error: `خطای API: ${msg}` });
  }
});

app.listen(PORT, () => console.log(`✅ Proxy running on http://localhost:${PORT}`));
