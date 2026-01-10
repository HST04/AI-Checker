
import { IOCRProvider, IVisionAgent, IGradingProvider } from './interfaces';
import { GeminiOCRProvider, GeminiVisionAgent, GeminiGradingProvider } from './gemini-providers';
import { MockOCRProvider, MockVisionAgent, MockGradingProvider } from './mock-providers';

export class ProviderRegistry {
  private static apiKey = process.env.API_KEY || "";

  static getOCR(): IOCRProvider {
    return this.apiKey ? new GeminiOCRProvider(this.apiKey) : new MockOCRProvider();
  }

  static getVision(): IVisionAgent {
    return this.apiKey ? new GeminiVisionAgent(this.apiKey) : new MockVisionAgent();
  }

  static getGrading(): IGradingProvider {
    return this.apiKey ? new GeminiGradingProvider(this.apiKey) : new MockGradingProvider();
  }
}
