const express = require('express');
const bodyParser = require('body-parser');
const { GoogleGenAI, Type } = require('@google/genai');
const { z } = require('zod');

// Reuse local schemas for consistency (server-side copy)
const { OCRResultSchema, VisionResultSchema, GradingResultSchema } = require('./schemas');

const app = express();
app.use(bodyParser.json({ limit: '10mb' }));

const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
if (!apiKey) console.warn('GEMINI_API_KEY not set; endpoints will fail without a key.');

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

app.post('/api/ocr', async (req, res) => {
  try {
    const { base64Data, mimeType } = req.body;
    if (!ai) return res.status(500).json({ error: 'AI client not configured' });
    const data = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          { inlineData: { data, mimeType } },
          { text: "Extract all handwritten and printed text from this document. Provide JSON with text, confidence (0-1), unreadable_ratio (0-1), and blocks [{text,confidence}]." }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT
        }
      }
    });

    const jsonStr = response.text?.trim() || '{}';
    const parsed = JSON.parse(jsonStr);
    const validation = OCRResultSchema.safeParse(parsed);
    if (!validation.success) {
      console.error('OCR schema validation failed', validation.error.format());
      return res.status(500).json({ error: 'Invalid OCR response from AI' });
    }
    return res.json(validation.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
});

app.post('/api/vision', async (req, res) => {
  try {
    const { base64Data, mimeType, type } = req.body;
    if (!ai) return res.status(500).json({ error: 'AI client not configured' });
    const data = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          { inlineData: { data, mimeType } },
          { text: `Analyze the visual content of this ${type}. Identify key labels, summarize what it depicts, and provide a confidence score.` }
        ]
      },
      config: { responseMimeType: 'application/json' }
    });

    const jsonStr = response.text?.trim() || '{}';
    const parsed = JSON.parse(jsonStr);
    const validation = VisionResultSchema.safeParse(parsed);
    if (!validation.success) {
      console.error('Vision schema validation failed', validation.error.format());
      return res.status(500).json({ error: 'Invalid vision response from AI' });
    }
    return res.json(validation.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
});

app.post('/api/grade', async (req, res) => {
  try {
    const { question, studentAnswer, rubric, policy, context } = req.body;
    if (!ai) return res.status(500).json({ error: 'AI client not configured' });

    const prompt = `Act as an expert teacher. Grade the following student answer and return JSON with marks (number), rationale (string), confidence (0-1).\nQUESTION: ${question}\nSTUDENT ANSWER: ${studentAnswer}\nRUBRIC: ${rubric}\nPOLICY: ${policy}\n${context ? `ADDITIONAL CONTEXT: ${context}` : ''}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    const jsonStr = response.text?.trim() || '{}';
    const parsed = JSON.parse(jsonStr);
    const validation = GradingResultSchema.safeParse(parsed);
    if (!validation.success) {
      console.error('Grading schema validation failed', validation.error.format());
      return res.status(500).json({ error: 'Invalid grading response from AI' });
    }
    return res.json(validation.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
});

const port = process.env.PORT || 3978;
app.listen(port, () => console.log(`AI proxy server listening on http://localhost:${port}`));
