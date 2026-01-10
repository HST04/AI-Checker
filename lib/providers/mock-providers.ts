
import { IOCRProvider, IVisionAgent, ILLMProvider, IGradingProvider, IOCRResult, IVisionResult, IGradingResult } from './interfaces';

export class MockOCRProvider implements IOCRProvider {
  async extractText(base64Data: string, mimeType: string): Promise<IOCRResult> {
    return {
      text: "This is mock extracted student text. Q1: The capital of France is Paris. Q2: photosynthesis is the process used by plants to convert light energy into chemical energy.",
      confidence: 0.95,
      blocks: [{ text: "Student name: John Doe", confidence: 0.99 }],
      unreadable_ratio: 0.05
    };
  }
}

export class MockVisionAgent implements IVisionAgent {
  async analyzeVisual(base64Data: string, mimeType: string, type: 'graph' | 'diagram'): Promise<IVisionResult> {
    return {
      summary: "A mock analysis of the student's diagram.",
      labels: ["sun", "leaf", "chlorophyll"],
      confidence: 0.92
    };
  }
}

export class MockLLMProvider implements ILLMProvider {
  async generateJson<T>(prompt: string, schema: any): Promise<T> {
    if (prompt.includes("split into questions")) {
      return { 
        questions: [
          { q: "Q1", text: "The capital of France is Paris." },
          { q: "Q2", text: "photosynthesis is the process used by plants..." }
        ]
      } as unknown as T;
    }
    return {} as T;
  }
}

export class MockGradingProvider implements IGradingProvider {
  async gradeAnswer(question: string, studentAnswer: string, rubric: string, policy: string): Promise<IGradingResult> {
    return {
      marks: 4,
      rationale: "Answer is correct but lacks technical terminology as per the rubric.",
      confidence: 0.88
    };
  }

  async refinePolicy(currentPolicy: string, instruction: string): Promise<string> {
    return `${currentPolicy} (Refined: ${instruction})`;
  }
}
