import { describe, it, expect, beforeEach, afterEach, mock } from "bun:test";

// Mock @google/genai before any imports that use it
mock.module("@google/genai", () => ({
  GoogleGenAI: class {
    constructor(config: any) {}
    models = {
      generateContent: async () => ({ text: "{}" })
    }
  },
  Type: {
    OBJECT: "OBJECT",
    STRING: "STRING",
    NUMBER: "NUMBER",
    ARRAY: "ARRAY"
  },
}));

// Use dynamic import to ensure mock is applied
const { ProviderRegistry } = await import("./registry");
const { GeminiOCRProvider, GeminiVisionAgent, GeminiGradingProvider } = await import("./gemini-providers");
const { MockOCRProvider, MockVisionAgent, MockGradingProvider } = await import("./mock-providers");

describe("ProviderRegistry", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.API_KEY = "";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe("getOCR", () => {
    it("should return MockOCRProvider when API_KEY is not set", () => {
      process.env.API_KEY = "";
      const ocr = ProviderRegistry.getOCR();
      expect(ocr).toBeInstanceOf(MockOCRProvider);
    });

    it("should return GeminiOCRProvider when API_KEY is set", () => {
      process.env.API_KEY = "test-api-key";
      const ocr = ProviderRegistry.getOCR();
      expect(ocr).toBeInstanceOf(GeminiOCRProvider);
    });
  });

  describe("getVision", () => {
    it("should return MockVisionAgent when API_KEY is not set", () => {
      process.env.API_KEY = "";
      const vision = ProviderRegistry.getVision();
      expect(vision).toBeInstanceOf(MockVisionAgent);
    });

    it("should return GeminiVisionAgent when API_KEY is set", () => {
      process.env.API_KEY = "test-api-key";
      const vision = ProviderRegistry.getVision();
      expect(vision).toBeInstanceOf(GeminiVisionAgent);
    });
  });

  describe("getGrading", () => {
    it("should return MockGradingProvider when API_KEY is not set", () => {
      process.env.API_KEY = "";
      const grading = ProviderRegistry.getGrading();
      expect(grading).toBeInstanceOf(MockGradingProvider);
    });

    it("should return GeminiGradingProvider when API_KEY is set", () => {
      process.env.API_KEY = "test-api-key";
      const grading = ProviderRegistry.getGrading();
      expect(grading).toBeInstanceOf(GeminiGradingProvider);
    });
  });
});
