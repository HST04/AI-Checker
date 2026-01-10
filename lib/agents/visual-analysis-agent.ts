import { ProviderRegistry } from '../providers/registry';
import { Submission } from '../types';
import { Database } from '../db';

export class VisualAnalysisAgent {
  static async analyze(submission: Submission, type: 'diagram' | 'graph' = 'diagram'): Promise<void> {
    try {
      const vision = ProviderRegistry.getVision();
      const res = await vision.analyzeVisual(submission.imageUrl, submission.mimeType, type);

      submission.visualSummary = res.summary;
      submission.processedAt = Date.now();

      Database.saveSubmission(submission);
      Database.logActivity(`Visual analysis (${type}) for submission: ${submission.id}`);
    } catch (err) {
      console.error('VisualAnalysisAgent error', err);
      Database.saveSubmission(submission);
    }
  }
}
