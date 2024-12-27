import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// استفاده از fetch داخلی Node.js
app.get('/proxy', async (req: Request, res: Response) => {
  try {
    const { text } = req.query; // فقط پارامتر text نیاز است

    // بررسی وجود پارامتر text
    if (typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'پارامترهای ورودی نادرست هستند' });
    }

    // ارسال درخواست به API اصلی
    const apiResponse = await fetch(
      `https://req.wiki-api.ir/apis-1/ChatGPT?q=${encodeURIComponent(text)}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      }
    );

    if (!apiResponse.ok) {
      return res.status(apiResponse.status).json({ error: `خطا از سمت سرور API: ${apiResponse.statusText}` });
    }

    const responseData = await apiResponse.json();
    res.json(responseData); // بازگرداندن پاسخ API به کلاینت
  } catch (error) {
    console.error('خطا در ارتباط با API:', error);
    res.status(500).json({ error: 'خطای داخلی سرور پروکسی' });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server is running on http://localhost:${PORT}`);
});

