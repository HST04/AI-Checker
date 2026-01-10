
export enum SubmissionStatus {
  UPLOADED = 'UPLOADED',
  PROCESSING = 'PROCESSING',
  NEEDS_REVIEW = 'NEEDS_REVIEW',
  GRADED = 'GRADED',
  ERROR = 'ERROR'
}

export interface OCRBlock {
  text: string;
  confidence: number;
}

export interface Question {
  id: string;
  text: string;
  maxMarks: number;
  rubric: string;
  gradingPolicy: string;
}

export interface StudentInfo {
  rollNumber: string;
  name: string;
  meta?: string;
}

export interface Course {
  id: string;
  teacherId: string;
  title: string;
  subject: string;
  academicYear: string;
  numStudents: number;
  testCategories: string[];
  createdAt: number;
  questions: Question[];
  agentSettings?: Record<string, AgentConfig>;
  finalReviewCompleted?: boolean;
  // Source Data Fields
  markingSchemeText?: string;
  questionPaperText?: string;
  studentRoster?: StudentInfo[];
  studentRollNumber?: string;
}

export type Exam = Course;

export interface AgentConfig {
  id: string;
  name: string;
  systemInstruction: string;
  model: string;
  active: boolean;
}

export interface ActivityLog {
  id: string;
  teacherId: string;
  action: string;
  timestamp: number;
}

export interface Submission {
  id: string;
  examId: string;
  studentName: string;
  rollNumber?: string;
  examCategory?: string;
  imageUrl: string;
  mimeType: string; // Added to support multiple file types
  status: SubmissionStatus;
  extractedText?: string;
  ocrConfidence?: number;
  unreadableRatio?: number;
  needsReview: boolean;
  visualSummary?: string;
  processedAt?: number;
  directoryPath?: string;
  totalMarks?: number;
}

export interface Answer {
  id: string;
  submissionId: string;
  questionId: string;
  marks: number;
  rationale: string;
  confidence: number;
  isOverride: boolean;
  gradedAt: number;
}

export interface AppDB {
  courses: Course[];
  submissions: Submission[];
  answers: Answer[];
  globalAgentConfigs: AgentConfig[];
  activityLogs: ActivityLog[];
}
