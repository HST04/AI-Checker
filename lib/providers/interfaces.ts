
import { OCRBlock } from '../types';

export interface IOCRResult {
  text: string;
  confidence: number;
  blocks: OCRBlock[];
  unreadable_ratio: number;
}

export interface IVisionResult {
  summary: string;
  labels: string[];
  trends?: string;
  confidence: number;
}

export interface IGradingResult {
  marks: number;
  rationale: string;
  confidence: number;
}

export interface IOCRProvider {
  extractText(base64Data: string, mimeType: string): Promise<IOCRResult>;
}

export interface IVisionAgent {
  analyzeVisual(base64Data: string, mimeType: string, type: 'graph' | 'diagram'): Promise<IVisionResult>;
}

export interface ILLMProvider {
  generateJson<T>(prompt: string, schema: any): Promise<T>;
}

export interface IGradingProvider {
  gradeAnswer(
    question: string,
    studentAnswer: string,
    rubric: string,
    policy: string,
    context?: string
  ): Promise<IGradingResult>;
  
  refinePolicy(
    currentPolicy: string,
    instruction: string,
    questionText: string
  ): Promise<string>;
}
