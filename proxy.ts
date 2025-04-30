import express, { Request, Response } from 'express';
import cors from 'cors';
import fetch from 'node-fetch'; // npm install node-fetch@2

const app = express();
const PORT = 3001;

// کلید OpenRouter API (امنیت پایینه ولی برات مهم نیست)
const OPENROUTER_KEY = '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';
const OPENROUTER_BASE = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL_ID = 'deepseek/deepseek-coder:free'; // یا هر مدلی که فعال می‌بینی

// تنظیم CORS
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Accept'],
  })
);

app.use(express.json());

app.post('/proxy', async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'پارامتر text الزامی و باید رشته باشه' });
    }

    // آماده‌سازی درخواست برای OpenRouter
    const payload = {
      model: MODEL_ID,
      messages: [
        { role: 'user', content: text }
      ]
    };

    const apiResponse = await fetch(OPENROUTER_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_KEY}`
      },
      body: JSON.stringify(payload),
    });

    if (!apiResponse.ok) {
      const textErr = await apiResponse.text();
      return res.status(apiResponse.status).json({ error: `خطای API: ${apiResponse.status} — ${textErr}` });
    }

    const data = await apiResponse.json();
    const answer = data.choices?.[0]?.message?.content;
    if (!answer) {
      return res.status(500).json({ error: 'پاسخ نامعتبر از OpenRouter' });
    }

    res.json({ ok: true, answer });
  } catch (err: any) {
    console.error('خطای سرور:', err);
    res.status(500).json({ error: 'خطای داخلی سرور' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Proxy server is running on http://localhost:${PORT}`);
});
