
import { ProviderRegistry } from '../providers/registry';
import { Submission, SubmissionStatus } from '../types';
import { Database } from '../db';

export class InitialCheckAgent {
  static async run(submission: Submission): Promise<void> {
    try {
      submission.status = SubmissionStatus.PROCESSING;

      const ocr = ProviderRegistry.getOCR();
      const vision = ProviderRegistry.getVision();

      // Step 1: Extract Text
      const ocrResult = await ocr.extractText(submission.imageUrl, submission.mimeType);
      submission.extractedText = ocrResult.text;
      submission.ocrConfidence = ocrResult.confidence;
      submission.unreadableRatio = ocrResult.unreadable_ratio;

      // Step 2: Visual Check
      // If we detect diagram keywords or low confidence in text
      if (ocrResult.text.toLowerCase().includes('diagram') || ocrResult.text.toLowerCase().includes('chart') || ocrResult.unreadable_ratio > 0.2) {
        const visionResult = await vision.analyzeVisual(submission.imageUrl, submission.mimeType, 'diagram');
        submission.visualSummary = visionResult.summary;
      }

      // Step 3: Flagging
      if (submission.ocrConfidence < 0.6 || submission.unreadableRatio > 0.4) {
        submission.needsReview = true;
        submission.status = SubmissionStatus.NEEDS_REVIEW;
      } else {
        submission.needsReview = false;
        submission.status = SubmissionStatus.UPLOADED;
      }

      submission.processedAt = Date.now();
      Database.saveSubmission(submission);
    } catch (error) {
      console.error("Initial Check Failed:", error);
      submission.status = SubmissionStatus.ERROR;
      Database.saveSubmission(submission);
    }
  }
}
