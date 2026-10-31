import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '10mb' }));

// Shared Gemini client with telemetry header as required by skill
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Translation Endpoint
app.post('/api/translate', async (req, res) => {
  try {
    const { title, description, targetLang, targetLangName } = req.body;

    if (!title && !description) {
      return res.status(400).json({ error: 'Title or description is required for translation.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ 
        error: 'Translation service is temporarily unavailable (API key not set).',
        translatedTitle: title,
        translatedDescription: description
      });
    }

    const prompt = `Translate the following marketplace listing into ${targetLangName || targetLang} (${targetLang}).
Title: ${title || ''}
Description: ${description || ''}

Maintain technical product names, model numbers, brands (e.g. Apple, Samsung, Nike, Sony), and numbers intact. Provide a fluent, natural marketplace translation.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an expert commerce and marketplace translator. Translate product titles and descriptions accurately and concisely into the requested language.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            translatedTitle: { 
              type: Type.STRING, 
              description: 'The translated product title' 
            },
            translatedDescription: { 
              type: Type.STRING, 
              description: 'The translated product description' 
            },
          },
          required: ['translatedTitle', 'translatedDescription'],
        },
      },
    });

    const resultText = response.text || '{}';
    const parsed = JSON.parse(resultText);

    return res.json({
      translatedTitle: parsed.translatedTitle || title,
      translatedDescription: parsed.translatedDescription || description,
      targetLang,
    });
  } catch (error: any) {
    console.error('Error translating post content:', error);
    return res.status(500).json({ 
      error: error?.message || 'Failed to translate content',
      translatedTitle: req.body.title,
      translatedDescription: req.body.description,
    });
  }
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`VENDA AQUI full-stack server running on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
