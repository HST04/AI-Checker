import { IOCRProvider, IVisionAgent, IGradingProvider, IOCRResult, IVisionResult, IGradingResult } from './interfaces';
import { OCRResultSchema, VisionResultSchema, GradingResultSchema } from './schemas';

async function postJson(path: string, body: any) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  return res.json();
}

export class HttpOCRProvider implements IOCRProvider {
  async extractText(base64Data: string, mimeType: string): Promise<IOCRResult> {
    const res = await postJson('/api/ocr', { base64Data, mimeType });
    const parsed = OCRResultSchema.parse(res);
    return parsed as IOCRResult;
  }
}

export class HttpVisionAgent implements IVisionAgent {
  async analyzeVisual(base64Data: string, mimeType: string, type: 'graph' | 'diagram'): Promise<IVisionResult> {
    const res = await postJson('/api/vision', { base64Data, mimeType, type });
    const parsed = VisionResultSchema.parse(res);
    return parsed as IVisionResult;
  }
}

export class HttpGradingProvider implements IGradingProvider {
  async gradeAnswer(question: string, studentAnswer: string, rubric: string, policy: string, context?: string): Promise<IGradingResult> {
    const res = await postJson('/api/grade', { question, studentAnswer, rubric, policy, context });
    const parsed = GradingResultSchema.parse(res);
    return parsed as IGradingResult;
  }

  async refinePolicy(currentPolicy: string, instruction: string, questionText: string): Promise<string> {
    const res = await postJson('/api/refinePolicy', { currentPolicy, instruction, questionText });
    return res.policy || currentPolicy;
  }
}
