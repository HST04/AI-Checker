
import { ProviderRegistry } from '../providers/registry';
import { Exam, Submission, Question, Answer } from '../types';
import { Database } from '../db';

export class GradingAgent {
  static async gradeAllForQuestion(exam: Exam, question: Question): Promise<void> {
    const submissions = Database.getSubmissions(exam.id);
    const gradingProvider = ProviderRegistry.getGrading();

    const tasks = submissions.map(async (sub) => {
      if (!sub.extractedText) return;

      const result = await gradingProvider.gradeAnswer(
        question.text,
        sub.extractedText,
        question.rubric,
        question.gradingPolicy,
        sub.visualSummary
      );

      const answer: Answer = {
        id: `${sub.id}_${question.id}`,
        submissionId: sub.id,
        questionId: question.id,
        marks: result.marks,
        rationale: result.rationale,
        confidence: result.confidence,
        isOverride: false,
        gradedAt: Date.now()
      };

      Database.saveAnswer(answer);
    });

    await Promise.all(tasks);
  }
}
