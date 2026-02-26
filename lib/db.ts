
import { AppDB, Course, Submission, Answer, AgentConfig, ActivityLog, StudentInfo } from './types';
import { generateId } from './utils';

const STORAGE_KEY = 'exam_checker_db_v3';

const INITIAL_AGENTS: AgentConfig[] = [
  {
    id: 'ocr-agent',
    name: 'OCR Extraction Agent',
    systemInstruction: "Extract all handwritten and printed text from this exam paper. Focus on legibility and structure.",
    model: 'gemini-3-pro-preview',
    active: true
  },
  {
    id: 'vision-agent',
    name: 'Visual Analysis Agent',
    systemInstruction: "Analyze visual diagrams, charts, and drawings. Identify labels and summarize scientific processes depicted.",
    model: 'gemini-3-pro-preview',
    active: true
  },
  {
    id: 'grading-agent',
    name: 'Expert Grading Agent',
    systemInstruction: "Act as an expert teacher. Grade student answers based on the provided rubric and policy.",
    model: 'gemini-3-pro-preview',
    active: true
  }
];

const INITIAL_DB: AppDB = {
  courses: [],
  submissions: [],
  answers: [],
  globalAgentConfigs: INITIAL_AGENTS,
  activityLogs: []
};

export class Database {
  static currentUser = {
    id: 'teacher-1',
    name: 'Prof. Sarah Jenkins',
    role: 'Senior Examiner',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'
  };

  private static load(): AppDB {
    if (typeof window === 'undefined') return INITIAL_DB;
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : INITIAL_DB;
  }

  private static save(db: AppDB) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  }

  static getCourses(): Course[] {
    return this.load().courses.filter(c => c.teacherId === this.currentUser.id);
  }

  static getCourseById(id: string): Course | undefined {
    return this.load().courses.find(c => c.id === id);
  }

  static saveCourse(course: Course) {
    const db = this.load();
    const index = db.courses.findIndex(c => c.id === course.id);
    if (index >= 0) db.courses[index] = course;
    else db.courses.push({ ...course, teacherId: this.currentUser.id });
    this.save(db);
    this.logActivity(`Configuration updated for course: ${course.title}`);
  }

  // Fix: Added getGlobalAgents to support loading default AI agent configurations
  static getGlobalAgents(): AgentConfig[] {
    return this.load().globalAgentConfigs;
  }

  // Fix: Added saveGlobalAgent to support updating global default AI configurations
  static saveGlobalAgent(agent: AgentConfig) {
    const db = this.load();
    const index = db.globalAgentConfigs.findIndex(a => a.id === agent.id);
    if (index >= 0) db.globalAgentConfigs[index] = agent;
    else db.globalAgentConfigs.push(agent);
    this.save(db);
    this.logActivity(`Global agent configuration updated: ${agent.name}`);
  }

  static getSubmissions(courseId?: string): Submission[] {
    const db = this.load();
    const subs = courseId ? db.submissions.filter(s => s.examId === courseId) : db.submissions;
    
    // Enrich with total marks for leaderboard
    return subs.map(sub => {
      const subAnswers = db.answers.filter(a => a.submissionId === sub.id);
      const totalMarks = subAnswers.reduce((sum, a) => sum + a.marks, 0);
      return { ...sub, totalMarks };
    });
  }

  static saveSubmission(submission: Submission) {
    const db = this.load();
    const index = db.submissions.findIndex(s => s.id === submission.id);
    if (index >= 0) db.submissions[index] = submission;
    else db.submissions.push(submission);
    this.save(db);
  }

  static getAnswersByQuestion(questionId: string): Answer[] {
    return this.load().answers.filter(a => a.questionId === questionId);
  }

  static saveAnswer(answer: Answer) {
    const db = this.load();
    const index = db.answers.findIndex(a => a.submissionId === answer.submissionId && a.questionId === answer.questionId);
    if (index >= 0) db.answers[index] = answer;
    else db.answers.push(answer);
    this.save(db);
  }

  static logActivity(action: string) {
    const db = this.load();
    db.activityLogs.unshift({
      id: generateId(),
      teacherId: this.currentUser.id,
      action,
      timestamp: Date.now()
    });
    db.activityLogs = db.activityLogs.slice(0, 20);
    this.save(db);
  }

  static getActivityLogs(): ActivityLog[] {
    return this.load().activityLogs.filter(l => l.teacherId === this.currentUser.id);
  }

  static matchStudentName(courseId: string, rollNumber: string): string {
    const course = this.getCourseById(courseId);
    const match = course?.studentRoster?.find(r => r.rollNumber === rollNumber);
    return match?.name || "Unknown Student";
  }
}
