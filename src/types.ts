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

// ========== Lint ==========

export interface LintError {
  path: string;
  message: string;
  severity: "error" | "warning";
}
