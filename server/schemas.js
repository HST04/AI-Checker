const { z } = require('zod');

const OCRBlockSchema = z.object({ text: z.string(), confidence: z.number().min(0).max(1) });
const OCRResultSchema = z.object({
  text: z.string(),
  confidence: z.number().min(0).max(1),
  unreadable_ratio: z.number().min(0).max(1),
  blocks: z.array(OCRBlockSchema)
});

const VisionResultSchema = z.object({
  summary: z.string(),
  labels: z.array(z.string()),
  confidence: z.number().min(0).max(1).optional()
});

const GradingResultSchema = z.object({
  marks: z.number(),
  rationale: z.string(),
  confidence: z.number().min(0).max(1)
});

module.exports = { OCRResultSchema, VisionResultSchema, GradingResultSchema };
