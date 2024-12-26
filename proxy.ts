import express, { Request, Response } from 'express'; // ایمپورت تایپ‌ها
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// استفاده از fetch داخلی Node.js
app.get('/proxy', async (req: Request, res: Response) => {
  try {
    const { license, chatId, text } = req.query;

    // بررسی تایپ و تبدیل query به رشته
    if (typeof license !== 'string' || typeof chatId !== 'string' || typeof text !== 'string') {
      return res.status(400).json({ error: 'پارامترهای ورودی نادرست هستند' });
    }

    const apiResponse = await fetch(
      `https://haji-api.ir/chatgpt-3.5/?license=${license}&chatId=${chatId}&text=${encodeURIComponent(text)}`,
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
    res.json(responseData);
  } catch (error) {
    console.error('خطا در ارتباط با API:', error);
    res.status(500).json({ error: 'خطای داخلی سرور پروکسی' });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server is running on http://localhost:${PORT}`);
});
