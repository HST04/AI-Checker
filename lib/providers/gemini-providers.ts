
import { GoogleGenAI, Type } from "@google/genai";
import { 
  IOCRProvider, 
  IVisionAgent, 
  ILLMProvider, 
  IGradingProvider, 
  IOCRResult, 
  IVisionResult, 
  IGradingResult 
} from './interfaces';

export class GeminiOCRProvider implements IOCRProvider {
  private ai: GoogleGenAI;
  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  async extractText(base64Data: string, mimeType: string): Promise<IOCRResult> {
    const data = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
    
    const response = await this.ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          { inlineData: { data, mimeType } },
          { text: "Extract all handwritten and printed text from this document. Provide the output in JSON format with fields: text, confidence (0-1), unreadable_ratio (0-1), and blocks (array of objects with 'text' and 'confidence')." }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            unreadable_ratio: { type: Type.NUMBER },
            blocks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING },
                  confidence: { type: Type.NUMBER }
                },
                propertyOrdering: ["text", "confidence"]
              }
            }
          },
          propertyOrdering: ["text", "confidence", "unreadable_ratio", "blocks"]
        }
      }
    });

    const jsonStr = response.text?.trim() || '{}';
    return JSON.parse(jsonStr) as IOCRResult;
  }
}

export class GeminiVisionAgent implements IVisionAgent {
  private ai: GoogleGenAI;
  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  async analyzeVisual(base64Data: string, mimeType: string, type: 'graph' | 'diagram'): Promise<IVisionResult> {
    const data = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;

    const response = await this.ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          { inlineData: { data, mimeType } },
          { text: `Analyze the visual content of this ${type}. Identify key labels, summarize what it depicts, and provide a confidence score.` }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            labels: { type: Type.ARRAY, items: { type: Type.STRING } },
            confidence: { type: Type.NUMBER }
          },
          propertyOrdering: ["summary", "labels", "confidence"]
        }
      }
    });

    const jsonStr = response.text?.trim() || '{}';
    return JSON.parse(jsonStr) as IVisionResult;
  }
}

export class GeminiGradingProvider implements IGradingProvider {
  private ai: GoogleGenAI;
  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  async gradeAnswer(question: string, studentAnswer: string, rubric: string, policy: string, context?: string): Promise<IGradingResult> {
    const prompt = `
      Act as an expert teacher. Grade the following student answer based on the question, rubric, and specific grading policy provided.
      
      QUESTION: ${question}
      STUDENT ANSWER: ${studentAnswer}
      RUBRIC: ${rubric}
      POLICY: ${policy}
      ${context ? `ADDITIONAL CONTEXT (VISUAL): ${context}` : ''}
      
      Return JSON with 'marks' (number), 'rationale' (string), and 'confidence' (number 0-1).
    `;

    const response = await this.ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            marks: { type: Type.NUMBER },
            rationale: { type: Type.STRING },
            confidence: { type: Type.NUMBER }
          },
          propertyOrdering: ["marks", "rationale", "confidence"]
        }
      }
    });

    const jsonStr = response.text?.trim() || '{}';
    return JSON.parse(jsonStr) as IGradingResult;
  }

  async refinePolicy(currentPolicy: string, instruction: string, questionText: string): Promise<string> {
    const prompt = `
      You are an AI Grading Architect. The user (a teacher) wants to update the grading policy for a specific question.
      
      QUESTION: "${questionText}"
      CURRENT POLICY: "${currentPolicy}"
      TEACHER INSTRUCTION: "${instruction}"
      
      Update the policy strictly based on the instruction. Keep the tone professional and structured. 
      Return ONLY the new policy text. Do not add conversational filler.
    `;

    const response = await this.ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt
    });

    return response.text?.trim() || currentPolicy;
  }
}
