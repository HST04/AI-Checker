import { IOCRProvider, IVisionAgent, IGradingProvider } from './interfaces';
import { GeminiOCRProvider, GeminiVisionAgent, GeminiGradingProvider } from './gemini-providers';
import { MockOCRProvider, MockVisionAgent, MockGradingProvider } from './mock-providers';

export class ProviderRegistry {
  private static getApiKey(): string {
    return process.env.API_KEY || "";
  }

  static getOCR(): IOCRProvider {
    const apiKey = this.getApiKey();
    return apiKey ? new GeminiOCRProvider(apiKey) : new MockOCRProvider();
  }

  static getVision(): IVisionAgent {
    const apiKey = this.getApiKey();
    return apiKey ? new GeminiVisionAgent(apiKey) : new MockVisionAgent();
  }

  static getGrading(): IGradingProvider {
    const apiKey = this.getApiKey();
    return apiKey ? new GeminiGradingProvider(apiKey) : new MockGradingProvider();
  }
}
