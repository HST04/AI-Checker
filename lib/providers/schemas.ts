import { z } from 'zod';

export const OCRBlockSchema = z.object({
  text: z.string(),
  confidence: z.number().min(0).max(1)
});

export const OCRResultSchema = z.object({
  text: z.string(),
  confidence: z.number().min(0).max(1),
  unreadable_ratio: z.number().min(0).max(1),
  blocks: z.array(OCRBlockSchema)
});

export const VisionResultSchema = z.object({
  summary: z.string(),
  labels: z.array(z.string()),
  confidence: z.number().min(0).max(1).optional()
});

export const GradingResultSchema = z.object({
  marks: z.number(),
  rationale: z.string(),
  confidence: z.number().min(0).max(1)
});

export type OCRResult = z.infer<typeof OCRResultSchema>;
export type VisionResult = z.infer<typeof VisionResultSchema>;
export type GradingResult = z.infer<typeof GradingResultSchema>;
