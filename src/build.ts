import * as fs from "fs";
import * as path from "path";
import {
  parseJsonSafe,
  findThumbnail,
  parseMarkdownInfo,
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

const ROOT_DIR = process.cwd();
const DATA_DIR = path.join(ROOT_DIR, "data");
const OUTPUT_DIR = process.env.OUTPUT_DIR || path.join(ROOT_DIR, ".dist");

function build(): void {
  console.log("🔨 Building study repository...");
  console.log(`   Data:   ${DATA_DIR}`);
  console.log(`   Output: ${OUTPUT_DIR}\n`);

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

      const infoPath = path.join(courseDir, "info", "info.json");
      if (!fs.existsSync(infoPath)) {
        console.log(`   ⏭️  Skipping ${faculty}/${course} (no info.json)`);
        continue;
      }

      console.log(`   📖 ${faculty}/${course}`);

      const infoContent = fs.readFileSync(infoPath, "utf-8");
      const info = parseJsonSafe(infoContent);

      const infoDir = path.join(courseDir, "info");
      const thumbnailFile = findThumbnail(infoDir);
      const thumbnailPath = thumbnailFile
        ? `data/${faculty}/${course}/info/${thumbnailFile}`
        : "";

      const docsDir = path.join(courseDir, "docs");
      const docFiles = getFiles(docsDir, [".md"]);
      const docs: DocEntry[] = [];

      for (const docFile of docFiles) {
        const content = fs.readFileSync(path.join(docsDir, docFile), "utf-8");
        const parsed = parseMarkdownInfo(content);
        if (parsed) {
          const entry: DocEntry = {
            title: parsed.meta.title,
            author: parsed.meta.author,
            date: parsed.meta.date,
            summary: parsed.meta.summary,
            keywords: parsed.meta.keywords,
            file: `data/${faculty}/${course}/docs/${docFile}`,
          };
          if (parsed.meta.thumbnail) {
            entry.thumbnail = `data/${faculty}/${course}/docs/${parsed.meta.thumbnail.replace(/^\.\//, "")}`;
          }
          docs.push(entry);
        }
      }

      const examsDir = path.join(courseDir, "exams");
      const examFiles = getFiles(examsDir, [".md"]);
      const exams: ExamEntry[] = [];

      for (const examFile of examFiles) {
        const content = fs.readFileSync(
          path.join(examsDir, examFile),
          "utf-8"
        );
        const parsed = parseMarkdownInfo(content);
        if (parsed) {
          exams.push({
            title: parsed.meta.title,
            author: parsed.meta.author,
            date: parsed.meta.date,
            summary: parsed.meta.summary,
            keywords: parsed.meta.keywords,
            file: `data/${faculty}/${course}/exams/${examFile}`,
          });
        }
      }

      const qaDir = path.join(courseDir, "qa");
      const qaFiles = getFiles(qaDir, [".json"]);
      const qa: QAEntry[] = [];

      for (const qaFile of qaFiles) {
        const qaContent = fs.readFileSync(path.join(qaDir, qaFile), "utf-8");
        const qaData = parseJsonSafe(qaContent);
        const questionCount = Array.isArray(qaData.data) ? qaData.data.length : 0;
        totalQaQuestions += questionCount;

        if (qaData.difficulty) {
          difficultyCount[qaData.difficulty] = (difficultyCount[qaData.difficulty] || 0) + 1;
        }
        if (qaData.keywords) {
          qaData.keywords.forEach((k: string) => allKeywords.add(k));
        }
        if (qaData.author) allAuthors.add(qaData.author);

        qa.push({
          title: qaData.title || "",
          author: qaData.author || "",
          description: qaData.description || "",
          keywords: qaData.keywords || [],
          category: qaData.category || "",
          difficulty: qaData.difficulty || "",
          file: `data/${faculty}/${course}/qa/${qaFile}`,
        });
      }

      // ----- Collect search entries -----
      for (const d of docs) {
        searchEntries.push({
          id: searchId++,
          type: "doc",
          title: d.title,
          author: d.author,
          date: d.date,
          summary: d.summary,
          keywords: d.keywords,
          faculty,
          course,
          courseName: info.courseName,
          courseCode: info.courseCode,
          file: d.file,
        });
      }
      for (const e of exams) {
        searchEntries.push({
          id: searchId++,
          type: "exam",
          title: e.title,
          author: e.author,
          date: e.date,
          summary: e.summary,
          keywords: e.keywords,
          faculty,
          course,
          courseName: info.courseName,
          courseCode: info.courseCode,
          file: e.file,
        });
      }
      for (const q of qa) {
        searchEntries.push({
          id: searchId++,
          type: "qa",
          title: q.title,
          author: q.author,
          description: q.description,
          keywords: q.keywords,
          category: q.category,
          difficulty: q.difficulty,
          faculty,
          course,
          courseName: info.courseName,
          courseCode: info.courseCode,
          file: q.file,
        });
      }

      totalDocs += docs.length;
      totalExams += exams.length;
      totalQaSets += qa.length;
      courseTypeCount[info.courseType] = (courseTypeCount[info.courseType] || 0) + 1;

      for (const d of docs) {
        if (d.author) allAuthors.add(d.author);
        d.keywords.forEach((k) => allKeywords.add(k));
      }
      for (const e of exams) {
        if (e.author) allAuthors.add(e.author);
        e.keywords.forEach((k) => allKeywords.add(k));
      }

      const courseStat: CourseStats = {
        name: course,
        courseName: info.courseName,
        courseCode: info.courseCode,
        docs: docs.length,
        exams: exams.length,
        qaSets: qa.length,
        qaQuestions: qa.reduce((sum, q) => {
          const qaContent = fs.readFileSync(path.join(qaDir, q.file.split("/").pop()!), "utf-8");
          const qaData = parseJsonSafe(qaContent);
          return sum + (Array.isArray(qaData.data) ? qaData.data.length : 0);
        }, 0),
      };

      facultyStatsMap[faculty].totalCourses++;
      facultyStatsMap[faculty].totalDocs += docs.length;
      facultyStatsMap[faculty].totalExams += exams.length;
      facultyStatsMap[faculty].totalQaSets += qa.length;
      facultyStatsMap[faculty].totalQaQuestions += courseStat.qaQuestions;
      facultyStatsMap[faculty].courses.push(courseStat);

      const courseDetail: CourseDetail = {
        courseName: info.courseName,
        courseCode: info.courseCode,
        courseCredit: info.courseCredit,
        courseType: info.courseType,
        courseDescription: info.courseDescription,
        thumbnail: thumbnailPath,
        faculty,
        docs,
        exams,
        qa,
      };

      const courseJsonPath = path.join(OUTPUT_DIR, "courses", `${course}.json`);
      fs.writeFileSync(
        courseJsonPath,
        JSON.stringify(courseDetail, null, 2),
        "utf-8"
      );

      mainEntries.push({
        courseName: info.courseName,
        courseCode: info.courseCode,
        courseCredit: info.courseCredit,
        courseType: info.courseType,
        courseDescription: info.courseDescription,
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

  console.log("\n   📂 Copying data...");
  copyDir(DATA_DIR, path.join(OUTPUT_DIR, "data"), {
    transformMarkdown: true,
  });

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

  // ----- Generate search index -----
  console.log("\n   🔍 Building search index...");
  buildSearchIndex(searchEntries, OUTPUT_DIR);

  // ----- Generate last_update.json (cache busting) -----
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

  console.log(`\n✅ Build complete!`);
  console.log(`   📄 main.json: ${mainEntries.length} course(s)`);
  console.log(`   📂 courses/: ${mainEntries.length} file(s)`);
  console.log(`   📊 stats.json: ${faculties.length} faculties, ${mainEntries.length} courses, ${totalDocs} docs, ${totalExams} exams, ${totalQaSets} qa sets (${totalQaQuestions} questions)`);
  console.log(`   🔍 search-index.json: ${searchEntries.length} entries indexed`);
  console.log(`   🕐 last_update.json: ${lastUpdate.timestamp}`);
}

build();
