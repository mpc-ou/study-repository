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
  title: string;
  author: string;
  date: string;
  summary: string;
  keywords: string[];
  thumbnail?: string;
  file: string;
}

export interface ExamEntry {
  title: string;
  author: string;
  date: string;
  summary: string;
  keywords: string[];
  file: string;
}

export interface QAEntry {
  title: string;
  author: string;
  description: string;
  keywords: string[];
  category: string;
  difficulty: string;
  file: string;
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
