import { ProviderRegistry } from '../providers/registry';
import { Submission, Question, Answer } from '../types';
import { Database } from '../db';

export class ExpertGradingAgent {
  static async gradeSubmissionForQuestion(submission: Submission, question: Question): Promise<Answer | null> {
    try {
      if (!submission.extractedText) return null;

      const grader = ProviderRegistry.getGrading();
      const result = await grader.gradeAnswer(
        question.text,
        submission.extractedText,
        question.rubric,
        question.gradingPolicy,
        submission.visualSummary
      );

      const answer: Answer = {
        id: `${submission.id}_${question.id}`,
        submissionId: submission.id,
        questionId: question.id,
        marks: result.marks,
        rationale: result.rationale,
        confidence: result.confidence,
        isOverride: false,
        gradedAt: Date.now()
      };

      Database.saveAnswer(answer);
      Database.logActivity(`Expert graded: ${submission.id} -> ${question.id}`);
      return answer;
    } catch (err) {
      console.error('ExpertGradingAgent error', err);
      return null;
    }
  }
}
