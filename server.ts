import express, { Request, Response } from 'express';
import http from 'http';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Body parsing with 25MB limit for document image scans
app.use(express.json({ limit: '25mb' }));

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', app: 'Muqeem PWA', timestamp: new Date().toISOString() });
});

// Gemini Client initialization with recommended telemetry User-Agent header
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.warn('Could not initialize GoogleGenAI client:', err);
  }
}

// 1. AI Document Parsing Endpoint
app.post('/api/gemini/parse-document', async (req: Request, res: Response) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      res.status(400).json({ error: 'imageBase64 is required' });
      return;
    }

    if (!ai) {
      res.status(503).json({ error: 'Gemini API not configured on server' });
      return;
    }

    // Clean base64 data URL prefix if present
    const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

    const prompt = `Analyze this official document from Saudi Arabia (or expatriate passport/license).
Extract the following information accurately in JSON format:
- type: one of ["iqama", "passport", "driving_license", "health_insurance", "ejar_contract", "vehicle_istimara", "other"]
- title: Document name (e.g. "Saudi Residence Identity (Iqama)")
- documentNumber: string ID number (e.g. 10 digits starting with 2 for Iqama)
- holderName: full name of document holder in English or Arabic
- issueDate: YYYY-MM-DD (Gregorian) if found, otherwise null
- expiryDate: YYYY-MM-DD (Gregorian) expiry date. (If only Hijri date 14xx-xx-xx is given, convert it accurately to Gregorian YYYY-MM-DD)
- expiryHijri: Hijri date (e.g. 1448-02-15) if visible, otherwise null
- sponsorName: Kafeel or employer company name if visible
- profession: Job title or profession in Arabic/English if visible
- confidence: number between 0.0 and 1.0

Return ONLY the raw JSON object without markdown fences.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: base64Data,
              },
            },
          ],
        },
      ],
    });

    const responseText = response.text?.trim() || '{}';
    const cleanJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(cleanJson);

    res.json({ success: true, data: parsedData });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error in /api/gemini/parse-document:', message);
    res.status(500).json({ error: 'Failed to parse document with Gemini', details: message });
  }
});

// 2. Expat Advisor Endpoint
app.post('/api/gemini/advisor', async (req: Request, res: Response) => {
  const { question, lang } = req.body || {};
  if (!question) {
    res.status(400).json({ error: 'question is required' });
    return;
  }

  try {

    if (!ai) {
      res.status(503).json({ error: 'Gemini API not configured on server' });
      return;
    }

    const languageInstruction = 
      lang === 'ur' ? 'Answer clearly in simple, polite Urdu (اردو) for expatriates in Saudi Arabia.' :
      lang === 'ar' ? 'Answer clearly in polite Arabic (العربية) according to official Saudi terminology.' :
      'Answer clearly in friendly, precise English for expatriates in Saudi Arabia.';

    const systemPrompt = `You are "Muqeem AI Advisor", an expert legal and practical assistant for foreign expatriates living in the Kingdom of Saudi Arabia (specifically focused on Jeddah and Western province).
You are an authority on:
1. Saudi Residence (Iqama) rules, renewal grace period (3 days), late penalty fines (500 SAR 1st time, 1000 SAR 2nd time), and Absher Individuals portal.
2. Qiwa platform labor reforms: transferring sponsorship without current employer consent (e.g. unpaid wages for 3 months, expired Iqama, end of contract term).
3. Ejar tenancy electronic lease registration and SADAD rental payments.
4. Driving licenses via Dallah Driving School and Efada medical checkups.
5. Cooperative Health Insurance Council (CCHI) policies (Bupa, Tawuniya).
6. Jeddah emergency helplines: 911 Unified Emergency, 997 Ambulance, 199033 Najm for car accidents, 19911 Qiwa.

${languageInstruction}
Keep answers structured with bullet points where helpful. Be concise, reassuring, and always mention that official confirmation can be verified via Absher or Qiwa portals.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: `${systemPrompt}\n\nExpat User Question: ${question}` }
          ]
        }
      ]
    });

    res.json({ success: true, answer: response.text?.trim() });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.warn('Gemini advisor API notice, falling back to built-in expat advisory rules:', message);
    
    // Fallback response for expatriate inquiries
    const fallbackAnswer = 
      lang === 'ur'
        ? 'معلومات: سعودی قوانین کے مطابق رہائشی دستاویزات (اقامہ، ایجار، انشورنس) کی معلومات ابشر (Absher) اور قویٰ (Qiwa) سے براہ راست تصدیق کی جا سکتی ہیں۔ کسی بھی ہنگامی صورتحال میں جدہ و مکہ ریجن کے لیے 911 پر رابطہ کریں۔'
        : lang === 'ar'
          ? 'إفادة نظامية: وفقاً للأنظمة واللوائح السعودية المعتمدة، يمكنك متابعة وتجديد كافة وثائق الإقامة وعقود العمل عبر منصتي أبشر وقوى. للأمور الطارئة في منطقة مكة المكرمة وجدة يرجى الاتصال بمركز العمليات الأمنية الموحد (911).'
          : 'Official guidance: In accordance with Saudi Ministry regulations, residency verification and employment transfers are processed through Absher and Qiwa portals. For any emergency assistance in Jeddah and Makkah region, call 911 directly.';

    res.json({ success: true, answer: fallbackAnswer });
  }
});

// Dev vs Production static mounting
async function startServer() {
  const httpServer = http.createServer(app);

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Muqeem PWA server listening on port ${PORT}`);
  });
}

startServer();
