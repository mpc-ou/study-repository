import * as fs from "fs";
import * as path from "path";
import {
  parseJsonSafe,
  findThumbnail,
  getSubdirectories,
  getFiles,
  copyDir,
  shouldSkip,
} from "./utils";
import type {
  MainEntry,
  CourseDetail,
  DocEntry,
  ExamEntry,
  QAEntry,
  Stats,
  FacultyStats,
  CourseStats,
  SearchEntry,
} from "./types";
import { buildSearchIndex } from "./search";

interface ItemInfo {
  title: string;
  description?: string;
  date?: string;
  keywords: string[];
  authors: string[];
  category?: string;
  difficulty?: string;
  questionCount?: number;
}

const ROOT_DIR = process.cwd();
const DATA_DIR = path.join(ROOT_DIR, "data");
const OUTPUT_DIR = process.env.OUTPUT_DIR || path.join(ROOT_DIR, ".dist");

function normalizeAuthors(raw: any): string[] {
  if (Array.isArray(raw?.authors)) {
    return raw.authors.map(String).filter(Boolean);
  }
  if (typeof raw?.author === "string" && raw.author.trim()) {
    return [raw.author.trim()];
  }
  return [];
}

function parseItemInfo(infoPath: string): ItemInfo {
  const infoContent = fs.readFileSync(infoPath, "utf-8");
  const raw = parseJsonSafe(infoContent);

  return {
    title: String(raw.title || ""),
    description: raw.description ? String(raw.description) : undefined,
    date: raw.date ? String(raw.date) : undefined,
    keywords: Array.isArray(raw.keywords)
      ? raw.keywords.map(String).filter(Boolean)
      : [],
    authors: normalizeAuthors(raw),
    category: raw.category ? String(raw.category) : undefined,
    difficulty: raw.difficulty ? String(raw.difficulty) : undefined,
    questionCount:
      typeof raw.questionCount === "number" ? raw.questionCount : undefined,
  };
}

function getSingleContentFile(itemDir: string): {
  fileName: string;
  contentType: "md" | "pdf";
} | null {
  const canonicalCandidates = fs
    .readdirSync(itemDir, { withFileTypes: true })
    .filter((d) => d.isFile() && /^content\.(md|pdf)$/i.test(d.name))
    .map((d) => d.name)
    .sort();

  if (canonicalCandidates.length === 1) {
    const fileName = canonicalCandidates[0];
    const ext = path.extname(fileName).toLowerCase();
    const contentType = ext === ".pdf" ? "pdf" : "md";
    return { fileName, contentType };
  }

  // Transitional support: allow exactly one md/pdf file even if not named content.*
  const anyContentCandidates = fs
    .readdirSync(itemDir, { withFileTypes: true })
    .filter((d) => d.isFile() && /\.(md|pdf)$/i.test(d.name) && d.name !== "info.json")
    .map((d) => d.name)
    .sort();

  if (anyContentCandidates.length !== 1) return null;

  const fileName = anyContentCandidates[0];
  const ext = path.extname(fileName).toLowerCase();
  const contentType = ext === ".pdf" ? "pdf" : "md";

  return { fileName, contentType };
}

function getAttachments(itemDir: string, selectedContentFile: string): string[] {
  return fs
    .readdirSync(itemDir, { withFileTypes: true })
    .filter((d) => d.isFile())
    .map((d) => d.name)
    .filter((name) => name !== "info.json" && name !== selectedContentFile)
    .sort();
}

function build(): void {
  console.log("Building study repository...");
  console.log(`  Data:   ${DATA_DIR}`);
  console.log(`  Output: ${OUTPUT_DIR}\n`);

  if (fs.existsSync(OUTPUT_DIR)) {
    fs.rmSync(OUTPUT_DIR, { recursive: true });
  }
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.mkdirSync(path.join(OUTPUT_DIR, "courses"), { recursive: true });

  const mainEntries: MainEntry[] = [];
  const facultyStatsMap: Record<string, FacultyStats> = {};
  const allAuthors = new Set<string>();
  const allKeywords = new Set<string>();
  const courseTypeCount: Record<string, number> = {};
  const difficultyCount: Record<string, number> = {};
  let totalDocs = 0;
  let totalExams = 0;
  let totalQaSets = 0;
  let totalQaQuestions = 0;
  const searchEntries: SearchEntry[] = [];
  let searchId = 0;

  const faculties = getSubdirectories(DATA_DIR).filter((f) => !shouldSkip(f));

  for (const faculty of faculties) {
    const facultyDir = path.join(DATA_DIR, faculty);
    const courses = getSubdirectories(facultyDir);

    if (!facultyStatsMap[faculty]) {
      facultyStatsMap[faculty] = {
        name: faculty,
        totalCourses: 0,
        totalDocs: 0,
        totalExams: 0,
        totalQaSets: 0,
        totalQaQuestions: 0,
        courses: [],
      };
    }

    for (const course of courses) {
      const courseDir = path.join(facultyDir, course);
      const courseInfoPath = path.join(courseDir, "info.json");

      if (!fs.existsSync(courseInfoPath)) {
        console.log(`  Skipping ${faculty}/${course} (no info.json at course root)`);
        continue;
      }

      const infoContent = fs.readFileSync(courseInfoPath, "utf-8");
      const info = parseJsonSafe(infoContent);
      console.log(`  Processing ${faculty}/${course}`);

      const thumbnailFile = findThumbnail(courseDir);
      const thumbnailPath = thumbnailFile
        ? `data/${faculty}/${course}/${thumbnailFile}`
        : "";

      const docs: DocEntry[] = [];
      const exams: ExamEntry[] = [];
      const qa: QAEntry[] = [];

      const docsDir = path.join(courseDir, "[docs]");
      const examDir = path.join(courseDir, "[exams]");
      const qaDir = path.join(courseDir, "[qa]");

      const docSlugs = getSubdirectories(docsDir);
      for (const slug of docSlugs) {
        const itemDir = path.join(docsDir, slug);
        const itemInfoPath = path.join(itemDir, "info.json");
        if (!fs.existsSync(itemInfoPath)) {
          console.log(`    Skip doc ${slug}: missing info.json`);
          continue;
        }

        const content = getSingleContentFile(itemDir);
        if (!content) {
          console.log(`    Skip doc ${slug}: missing/invalid content.(md|pdf)`);
          continue;
        }

        const itemInfo = parseItemInfo(itemInfoPath);
        const authors = itemInfo.authors;
        const author = authors[0] || "Unknown";
        const relBase = `data/${faculty}/${course}/[docs]/${slug}`;

        const docEntry: DocEntry = {
          slug,
          title: itemInfo.title,
          description: itemInfo.description,
          author,
          authors,
          date: itemInfo.date || "",
          keywords: itemInfo.keywords,
          info: `${relBase}/info.json`,
          content: `${relBase}/${content.fileName}`,
          contentType: content.contentType,
          attachments: getAttachments(itemDir, content.fileName).map(
            (f) => `${relBase}/${f}`
          ),
        };

        docs.push(docEntry);

        searchEntries.push({
          id: searchId++,
          type: "doc",
          slug,
          title: docEntry.title,
          author,
          date: docEntry.date,
          summary: docEntry.description,
          keywords: docEntry.keywords,
          faculty,
          course,
          courseName: info.courseName,
          courseCode: info.courseCode,
          file: docEntry.content,
        });
      }

      const examSlugs = getSubdirectories(examDir);
      for (const slug of examSlugs) {
        const itemDir = path.join(examDir, slug);
        const itemInfoPath = path.join(itemDir, "info.json");
        if (!fs.existsSync(itemInfoPath)) {
          console.log(`    Skip exam ${slug}: missing info.json`);
          continue;
        }

        const content = getSingleContentFile(itemDir);
        if (!content) {
          console.log(`    Skip exam ${slug}: missing/invalid content.(md|pdf)`);
          continue;
        }

        const itemInfo = parseItemInfo(itemInfoPath);
        const authors = itemInfo.authors;
        const author = authors[0] || "Unknown";
        const relBase = `data/${faculty}/${course}/[exams]/${slug}`;

        const examEntry: ExamEntry = {
          slug,
          title: itemInfo.title,
          description: itemInfo.description,
          author,
          authors,
          date: itemInfo.date || "",
          keywords: itemInfo.keywords,
          info: `${relBase}/info.json`,
          content: `${relBase}/${content.fileName}`,
          contentType: content.contentType,
          attachments: getAttachments(itemDir, content.fileName).map(
            (f) => `${relBase}/${f}`
          ),
        };

        exams.push(examEntry);

        searchEntries.push({
          id: searchId++,
          type: "exam",
          slug,
          title: examEntry.title,
          author,
          date: examEntry.date,
          summary: examEntry.description,
          keywords: examEntry.keywords,
          faculty,
          course,
          courseName: info.courseName,
          courseCode: info.courseCode,
          file: examEntry.content,
        });
      }

      if (fs.existsSync(qaDir)) {
        const qaJsonFiles = getFiles(qaDir, [".json"]);
        for (const qaFile of qaJsonFiles) {
          const qaContent = fs.readFileSync(path.join(qaDir, qaFile), "utf-8");
          const qaData = parseJsonSafe(qaContent);
          const questionCount = Array.isArray(qaData.data) ? qaData.data.length : 0;

          totalQaQuestions += questionCount;
          if (qaData.difficulty) {
            const key = String(qaData.difficulty);
            difficultyCount[key] = (difficultyCount[key] || 0) + 1;
          }

          const entry: QAEntry = {
            slug: path.basename(qaFile, ".json"),
            title: String(qaData.title || ""),
            author: String(qaData.author || "Unknown"),
            description: String(qaData.description || ""),
            keywords: Array.isArray(qaData.keywords)
              ? qaData.keywords.map(String).filter(Boolean)
              : [],
            category: String(qaData.category || ""),
            difficulty: String(qaData.difficulty || ""),
            file: `data/${faculty}/${course}/[qa]/${qaFile}`,
            format: "json",
            questionCount,
          };

          qa.push(entry);

          searchEntries.push({
            id: searchId++,
            type: "qa",
            slug: entry.slug,
            title: entry.title,
            author: entry.author,
            summary: entry.description,
            keywords: entry.keywords,
            category: entry.category,
            difficulty: entry.difficulty,
            faculty,
            course,
            courseName: info.courseName,
            courseCode: info.courseCode,
            file: entry.file || "",
          });
        }

        const qaSlugs = getSubdirectories(qaDir);
        for (const slug of qaSlugs) {
          const itemDir = path.join(qaDir, slug);
          const itemInfoPath = path.join(itemDir, "info.json");
          if (!fs.existsSync(itemInfoPath)) {
            continue;
          }

          const content = getSingleContentFile(itemDir);
          if (!content) {
            continue;
          }

          const itemInfo = parseItemInfo(itemInfoPath);
          const author = itemInfo.authors[0] || "Unknown";
          const relBase = `data/${faculty}/${course}/[qa]/${slug}`;
          const questionCount = itemInfo.questionCount || 0;

          totalQaQuestions += questionCount;
          if (itemInfo.difficulty) {
            difficultyCount[itemInfo.difficulty] =
              (difficultyCount[itemInfo.difficulty] || 0) + 1;
          }

          const entry: QAEntry = {
            slug,
            title: itemInfo.title,
            author,
            authors: itemInfo.authors,
            description: itemInfo.description || "",
            keywords: itemInfo.keywords,
            category: itemInfo.category || "",
            difficulty: itemInfo.difficulty || "",
            format: "content",
            info: `${relBase}/info.json`,
            content: `${relBase}/${content.fileName}`,
            contentType: content.contentType,
            attachments: getAttachments(itemDir, content.fileName).map(
              (f) => `${relBase}/${f}`
            ),
            questionCount,
          };

          qa.push(entry);

          searchEntries.push({
            id: searchId++,
            type: "qa",
            slug,
            title: entry.title,
            author: entry.author,
            summary: entry.description,
            keywords: entry.keywords,
            category: entry.category,
            difficulty: entry.difficulty,
            faculty,
            course,
            courseName: info.courseName,
            courseCode: info.courseCode,
            file: entry.content || entry.info || "",
          });
        }
      }

      totalDocs += docs.length;
      totalExams += exams.length;
      totalQaSets += qa.length;
      courseTypeCount[String(info.courseType)] =
        (courseTypeCount[String(info.courseType)] || 0) + 1;

      for (const d of docs) {
        if (d.author) allAuthors.add(d.author);
        d.keywords.forEach((k) => allKeywords.add(k));
      }
      for (const e of exams) {
        if (e.author) allAuthors.add(e.author);
        e.keywords.forEach((k) => allKeywords.add(k));
      }
      for (const q of qa) {
        if (q.author) allAuthors.add(q.author);
        q.keywords.forEach((k) => allKeywords.add(k));
      }

      const courseQaQuestions = qa.reduce(
        (sum, item) => sum + (item.questionCount || 0),
        0
      );
      const courseStat: CourseStats = {
        name: course,
        courseName: String(info.courseName || ""),
        courseCode: String(info.courseCode || ""),
        docs: docs.length,
        exams: exams.length,
        qaSets: qa.length,
        qaQuestions: courseQaQuestions,
      };

      facultyStatsMap[faculty].totalCourses++;
      facultyStatsMap[faculty].totalDocs += docs.length;
      facultyStatsMap[faculty].totalExams += exams.length;
      facultyStatsMap[faculty].totalQaSets += qa.length;
      facultyStatsMap[faculty].totalQaQuestions += courseQaQuestions;
      facultyStatsMap[faculty].courses.push(courseStat);

      const courseDetail: CourseDetail = {
        courseName: String(info.courseName || ""),
        courseCode: String(info.courseCode || ""),
        courseCredit: String(info.courseCredit || ""),
        courseType: String(info.courseType || ""),
        courseDescription: String(info.courseDescription || ""),
        thumbnail: thumbnailPath,
        faculty,
        docs,
        exams,
        qa,
      };

      const courseJsonPath = path.join(OUTPUT_DIR, "courses", `${course}.json`);
      fs.writeFileSync(courseJsonPath, JSON.stringify(courseDetail, null, 2), "utf-8");

      mainEntries.push({
        courseName: String(info.courseName || ""),
        courseCode: String(info.courseCode || ""),
        courseCredit: String(info.courseCredit || ""),
        courseType: String(info.courseType || ""),
        courseDescription: String(info.courseDescription || ""),
        thumbnail: thumbnailPath,
        faculty,
        include: `courses/${course}.json`,
      });
    }
  }

  fs.writeFileSync(
    path.join(OUTPUT_DIR, "main.json"),
    JSON.stringify(mainEntries, null, 2),
    "utf-8"
  );

  console.log("\n  Copying data...");
  copyDir(DATA_DIR, path.join(OUTPUT_DIR, "data"));

  const stats: Stats = {
    generatedAt: new Date().toISOString(),
    totalFaculties: faculties.length,
    totalCourses: mainEntries.length,
    totalDocs,
    totalExams,
    totalQaSets,
    totalQaQuestions,
    totalAuthors: allAuthors.size,
    totalKeywords: allKeywords.size,
    coursesByType: courseTypeCount,
    qaByDifficulty: difficultyCount,
    authors: [...allAuthors].sort(),
    faculties: Object.values(facultyStatsMap),
  };

  fs.writeFileSync(
    path.join(OUTPUT_DIR, "stats.json"),
    JSON.stringify(stats, null, 2),
    "utf-8"
  );

  console.log("\n  Building search index...");
  buildSearchIndex(searchEntries, OUTPUT_DIR);

  const lastUpdate = {
    timestamp: new Date().toISOString(),
    epoch: Date.now(),
    totalCourses: mainEntries.length,
    totalDocs,
    totalExams,
    totalQaSets,
    totalSearchEntries: searchEntries.length,
  };

  fs.writeFileSync(
    path.join(OUTPUT_DIR, "last_update.json"),
    JSON.stringify(lastUpdate, null, 2),
    "utf-8"
  );

  console.log("\nBuild complete.");
  console.log(`  main.json: ${mainEntries.length} course(s)`);
  console.log(`  courses/: ${mainEntries.length} file(s)`);
  console.log(
    `  stats.json: ${faculties.length} faculties, ${mainEntries.length} courses, ${totalDocs} docs, ${totalExams} exams, ${totalQaSets} qa sets (${totalQaQuestions} questions)`
  );
  console.log(`  search-index.json: ${searchEntries.length} entries indexed`);
  console.log(`  last_update.json: ${lastUpdate.timestamp}`);
}

build();
