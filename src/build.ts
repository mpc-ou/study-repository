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
} from "./types";

const ROOT_DIR = process.cwd();
const DATA_DIR = path.join(ROOT_DIR, "data");
const OUTPUT_DIR = process.env.OUTPUT_DIR || path.join(ROOT_DIR, ".dist");

function build(): void {
  console.log("🔨 Building study repository...");
  console.log(`   Data:   ${DATA_DIR}`);
  console.log(`   Output: ${OUTPUT_DIR}\n`);

  // Clean output
  if (fs.existsSync(OUTPUT_DIR)) {
    fs.rmSync(OUTPUT_DIR, { recursive: true });
  }
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.mkdirSync(path.join(OUTPUT_DIR, "courses"), { recursive: true });

  const mainEntries: MainEntry[] = [];

  // Get faculties (skip _ prefixed like _ExamMajor)
  const faculties = getSubdirectories(DATA_DIR).filter((f) => !shouldSkip(f));

  for (const faculty of faculties) {
    const facultyDir = path.join(DATA_DIR, faculty);
    const courses = getSubdirectories(facultyDir);

    for (const course of courses) {
      const courseDir = path.join(facultyDir, course);

      // Must have info/info.json to be a valid course
      const infoPath = path.join(courseDir, "info", "info.json");
      if (!fs.existsSync(infoPath)) {
        console.log(`   ⏭️  Skipping ${faculty}/${course} (no info.json)`);
        continue;
      }

      console.log(`   📖 ${faculty}/${course}`);

      const infoContent = fs.readFileSync(infoPath, "utf-8");
      const info = parseJsonSafe(infoContent);

      // Find thumbnail
      const infoDir = path.join(courseDir, "info");
      const thumbnailFile = findThumbnail(infoDir);
      const thumbnailPath = thumbnailFile
        ? `data/${faculty}/${course}/info/${thumbnailFile}`
        : "";

      // ----- Process docs -----
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

      // ----- Process exams -----
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

      // ----- Process QA -----
      const qaDir = path.join(courseDir, "qa");
      const qaFiles = getFiles(qaDir, [".json"]);
      const qa: QAEntry[] = [];

      for (const qaFile of qaFiles) {
        const qaContent = fs.readFileSync(path.join(qaDir, qaFile), "utf-8");
        const qaData = parseJsonSafe(qaContent);
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

      // ----- Build course detail -----
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

      // Write courses/{Course}.json
      const courseJsonPath = path.join(OUTPUT_DIR, "courses", `${course}.json`);
      fs.writeFileSync(
        courseJsonPath,
        JSON.stringify(courseDetail, null, 2),
        "utf-8"
      );

      // Add to main index
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

  // Write main.json
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "main.json"),
    JSON.stringify(mainEntries, null, 2),
    "utf-8"
  );

  // Copy data/ to output (skip _ prefixed dirs, strip INFO from markdowns)
  console.log("\n   📂 Copying data...");
  copyDir(DATA_DIR, path.join(OUTPUT_DIR, "data"), {
    transformMarkdown: true,
  });

  console.log(`\n✅ Build complete!`);
  console.log(`   📄 main.json: ${mainEntries.length} course(s)`);
  console.log(`   📂 courses/: ${mainEntries.length} file(s)`);
}

build();
