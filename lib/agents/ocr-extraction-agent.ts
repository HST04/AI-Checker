import { ProviderRegistry } from '../providers/registry';
import { Submission } from '../types';
import { Database } from '../db';

export class OCRExtractionAgent {
  static async run(submission: Submission): Promise<void> {
    try {
      const ocr = ProviderRegistry.getOCR();
      const result = await ocr.extractText(submission.imageUrl, submission.mimeType);

      submission.extractedText = result.text;
      submission.ocrConfidence = result.confidence;
      submission.unreadableRatio = result.unreadable_ratio;
      submission.processedAt = Date.now();

      // Mark as needs review if extraction is poor
      if (submission.ocrConfidence && submission.ocrConfidence < 0.6) {
        submission.needsReview = true;
        submission.status = (submission.status || 0) as any; // keep existing status elsewhere
      }

      Database.saveSubmission(submission);
      Database.logActivity(`OCR run for submission: ${submission.id}`);
    } catch (err) {
      console.error('OCRExtractionAgent error', err);
      submission.status = submission.status || submission.status;
      Database.saveSubmission(submission);
    }
  }
}
