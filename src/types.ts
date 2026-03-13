// ========== Course Info (info.json) ==========

export interface CourseInfo {
  courseName: string;
  courseCode: string;
  courseCredit: string;
  courseType: "GENERAL" | "MAJOR" | "ELECTIVE";
  courseDescription: string;
}

// ========== Markdown INFO metadata ==========

export interface MarkdownMeta {
  title: string;
  author: string;
  date: string;
  summary: string;
  keywords: string[];
  thumbnail?: string;
}

// ========== QA structures ==========

export interface QAQuestion {
  question: string;
  options: string[];
  answer: number;
  explanation?: string;
}

export interface QAFile {
  title: string;
  author: string;
  description: string;
  keywords: string[];
  category: string;
  difficulty: string;
  data: QAQuestion[];
}

// ========== Output: entries in courses/*.json ==========

export interface DocEntry {
  slug: string;
  title: string;
  description?: string;
  author: string;
  authors: string[];
  date: string;
  keywords: string[];
  info: string;
  content: string;
  contentType: "md" | "pdf";
  attachments: string[];
}

export interface ExamEntry {
  slug: string;
  title: string;
  description?: string;
  author: string;
  authors: string[];
  date: string;
  keywords: string[];
  info: string;
  content: string;
  contentType: "md" | "pdf";
  attachments: string[];
}

export interface QAEntry {
  slug: string;
  title: string;
  author: string;
  authors?: string[];
  description: string;
  keywords: string[];
  category: string;
  difficulty: string;
  file?: string;
  format: "json" | "content";
  info?: string;
  content?: string;
  contentType?: "md" | "pdf";
  attachments?: string[];
  questionCount?: number;
}

// ========== Output: main.json entry ==========

export interface MainEntry {
  courseName: string;
  courseCode: string;
  courseCredit: string;
  courseType: string;
  courseDescription: string;
  thumbnail: string;
  faculty: string;
  include: string;
}

// ========== Output: courses/{Course}.json ==========

export interface CourseDetail {
  courseName: string;
  courseCode: string;
  courseCredit: string;
  courseType: string;
  courseDescription: string;
  thumbnail: string;
  faculty: string;
  docs: DocEntry[];
  exams: ExamEntry[];
  qa: QAEntry[];
}

// ========== Output: stats.json ==========

export interface CourseStats {
  name: string;
  courseName: string;
  courseCode: string;
  docs: number;
  exams: number;
  qaSets: number;
  qaQuestions: number;
}

export interface FacultyStats {
  name: string;
  totalCourses: number;
  totalDocs: number;
  totalExams: number;
  totalQaSets: number;
  totalQaQuestions: number;
  courses: CourseStats[];
}

export interface Stats {
  generatedAt: string;
  totalFaculties: number;
  totalCourses: number;
  totalDocs: number;
  totalExams: number;
  totalQaSets: number;
  totalQaQuestions: number;
  totalAuthors: number;
  totalKeywords: number;
  coursesByType: Record<string, number>;
  qaByDifficulty: Record<string, number>;
  authors: string[];
  faculties: FacultyStats[];
}

// ========== Search Index ==========

export interface SearchEntry {
  id: number;
  type: "doc" | "exam" | "qa";
  slug: string;
  title: string;
  author: string;
  date?: string;
  summary?: string;
  description?: string;
  keywords: string[];
  category?: string;
  difficulty?: string;
  faculty: string;
  course: string;
  courseName: string;
  courseCode: string;
  file: string;
}

// ========== Lint ==========

export interface LintError {
  path: string;
  message: string;
  severity: "error" | "warning";
}
