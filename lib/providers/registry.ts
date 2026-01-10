
import { IOCRProvider, IVisionAgent, IGradingProvider } from './interfaces';
import { GeminiOCRProvider, GeminiVisionAgent, GeminiGradingProvider } from './gemini-providers';
import { MockOCRProvider, MockVisionAgent, MockGradingProvider } from './mock-providers';
import { HttpOCRProvider, HttpVisionAgent, HttpGradingProvider } from './http-providers';

export class ProviderRegistry {
  private static apiKey = process.env.API_KEY || "";

  static getOCR(): IOCRProvider {
    // In browser, use HTTP proxy endpoints; on server use Gemini provider when API key present
    if (typeof window !== 'undefined') return new HttpOCRProvider();
    return this.apiKey ? new GeminiOCRProvider(this.apiKey) : new MockOCRProvider();
  }

  static getVision(): IVisionAgent {
    if (typeof window !== 'undefined') return new HttpVisionAgent();
    return this.apiKey ? new GeminiVisionAgent(this.apiKey) : new MockVisionAgent();
  }

  static getGrading(): IGradingProvider {
    if (typeof window !== 'undefined') return new HttpGradingProvider();
    return this.apiKey ? new GeminiGradingProvider(this.apiKey) : new MockGradingProvider();
  }
}
