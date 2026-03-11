import * as fs from "fs";
import * as path from "path";
import {
  parseJsonSafe,
  findThumbnail,
  parseMarkdownInfo,
  getSubdirectories,
  getFiles,
  shouldSkip,
} from "./utils";
import type { LintError } from "./types";

const ROOT_DIR = process.cwd();
const DATA_DIR = path.join(ROOT_DIR, "data");

const VALID_COURSE_TYPES = ["GENERAL", "MAJOR", "ELECTIVE"];
const REQUIRED_COURSE_DIRS = ["info", "docs", "exams", "qa"];
const REQUIRED_INFO_FIELDS = [
  "courseName",
  "courseCode",
  "courseCredit",
  "courseType",
  "courseDescription",
];

function lint(): LintError[] {
  const errors: LintError[] = [];

  if (!fs.existsSync(DATA_DIR)) {
    errors.push({
      path: "data/",
      message: "Data directory not found",
      severity: "error",
    });
    return errors;
  }

  const faculties = getSubdirectories(DATA_DIR).filter((f) => !shouldSkip(f));

  if (faculties.length === 0) {
    errors.push({
      path: "data/",
      message: "No faculty directories found (excluding _ prefixed)",
      severity: "warning",
    });
    return errors;
  }

  for (const faculty of faculties) {
    const facultyDir = path.join(DATA_DIR, faculty);
    const courses = getSubdirectories(facultyDir);

    if (courses.length === 0) {
      errors.push({
        path: `data/${faculty}/`,
        message: "Faculty has no course directories",
        severity: "warning",
      });
      continue;
    }

    for (const course of courses) {
      const courseDir = path.join(facultyDir, course);
      const prefix = `data/${faculty}/${course}`;

      // Check required directories
      const existingDirs = REQUIRED_COURSE_DIRS.filter((dir) =>
        fs.existsSync(path.join(courseDir, dir))
      );

      // Completely empty course = placeholder, skip with warning
      if (existingDirs.length === 0) {
        errors.push({
          path: `${prefix}/`,
          message:
            "Empty course directory (no info/, docs/, exams/, qa/ found). Skipping.",
          severity: "warning",
        });
        continue;
      }

      for (const dir of REQUIRED_COURSE_DIRS) {
        if (!fs.existsSync(path.join(courseDir, dir))) {
          errors.push({
            path: `${prefix}/`,
            message: `Missing required directory: ${dir}/`,
            severity: "error",
          });
        }
      }

      // ===== Validate info =====
      const infoDir = path.join(courseDir, "info");
      if (fs.existsSync(infoDir)) {
        const infoJsonPath = path.join(infoDir, "info.json");

        if (!fs.existsSync(infoJsonPath)) {
          errors.push({
            path: `${prefix}/info/`,
            message: "Missing info.json",
            severity: "error",
          });
        } else {
          try {
            const content = fs.readFileSync(infoJsonPath, "utf-8");
            const info = parseJsonSafe(content);

            for (const field of REQUIRED_INFO_FIELDS) {
              if (!info[field]) {
                errors.push({
                  path: `${prefix}/info/info.json`,
                  message: `Missing required field: "${field}"`,
                  severity: "error",
                });
              }
            }

            if (
              info.courseType &&
              !VALID_COURSE_TYPES.includes(info.courseType)
            ) {
              errors.push({
                path: `${prefix}/info/info.json`,
                message: `Invalid courseType: "${info.courseType}". Must be one of: ${VALID_COURSE_TYPES.join(", ")}`,
                severity: "error",
              });
            }
          } catch (e: any) {
            errors.push({
              path: `${prefix}/info/info.json`,
              message: `Invalid JSON: ${e.message}`,
              severity: "error",
            });
          }
        }

        // Check thumbnail
        const thumbnail = findThumbnail(infoDir);
        if (!thumbnail) {
          errors.push({
            path: `${prefix}/info/`,
            message:
              "Missing thumbnail image (expected: thumbnail.jpg, .png, or .webp)",
            severity: "error",
          });
        }
      }

      // ===== Validate docs =====
      const docsDir = path.join(courseDir, "docs");
      if (fs.existsSync(docsDir)) {
        const mdFiles = getFiles(docsDir, [".md"]);
        for (const file of mdFiles) {
          const content = fs.readFileSync(
            path.join(docsDir, file),
            "utf-8"
          );
          const parsed = parseMarkdownInfo(content);

          if (!parsed) {
            errors.push({
              path: `${prefix}/docs/${file}`,
              message:
                "Missing <!-- INFO --> ... <!-- CONTENT --> metadata section",
              severity: "error",
            });
          } else {
            if (!parsed.meta.title)
              errors.push({
                path: `${prefix}/docs/${file}`,
                message: 'Missing "title" in INFO section',
                severity: "error",
              });
            if (!parsed.meta.author)
              errors.push({
                path: `${prefix}/docs/${file}`,
                message: 'Missing "author" in INFO section',
                severity: "error",
              });
            if (!parsed.meta.date)
              errors.push({
                path: `${prefix}/docs/${file}`,
                message: 'Missing "date" in INFO section',
                severity: "error",
              });
            if (!parsed.meta.summary)
              errors.push({
                path: `${prefix}/docs/${file}`,
                message: 'Missing "summary" in INFO section',
                severity: "warning",
              });
          }
        }
      }

      // ===== Validate exams =====
      const examsDir = path.join(courseDir, "exams");
      if (fs.existsSync(examsDir)) {
        const mdFiles = getFiles(examsDir, [".md"]);
        for (const file of mdFiles) {
          const content = fs.readFileSync(
            path.join(examsDir, file),
            "utf-8"
          );
          const parsed = parseMarkdownInfo(content);

          if (!parsed) {
            errors.push({
              path: `${prefix}/exams/${file}`,
              message:
                "Missing <!-- INFO --> ... <!-- CONTENT --> metadata section",
              severity: "error",
            });
          } else {
            if (!parsed.meta.title)
              errors.push({
                path: `${prefix}/exams/${file}`,
                message: 'Missing "title" in INFO section',
                severity: "error",
              });
            if (!parsed.meta.author)
              errors.push({
                path: `${prefix}/exams/${file}`,
                message: 'Missing "author" in INFO section',
                severity: "error",
              });
          }
        }
      }

      // ===== Validate QA =====
      const qaDir = path.join(courseDir, "qa");
      if (fs.existsSync(qaDir)) {
        const jsonFiles = getFiles(qaDir, [".json"]);
        for (const file of jsonFiles) {
          try {
            const content = fs.readFileSync(
              path.join(qaDir, file),
              "utf-8"
            );
            const qa = parseJsonSafe(content);

            if (!qa.title)
              errors.push({
                path: `${prefix}/qa/${file}`,
                message: 'Missing "title"',
                severity: "error",
              });
            if (!qa.author)
              errors.push({
                path: `${prefix}/qa/${file}`,
                message: 'Missing "author"',
                severity: "warning",
              });

            if (!qa.data || !Array.isArray(qa.data)) {
              errors.push({
                path: `${prefix}/qa/${file}`,
                message: 'Missing or invalid "data" array',
                severity: "error",
              });
            } else {
              for (let i = 0; i < qa.data.length; i++) {
                const q = qa.data[i];
                const qPrefix = `Question ${i + 1}`;
                if (!q.question)
                  errors.push({
                    path: `${prefix}/qa/${file}`,
                    message: `${qPrefix}: missing "question" text`,
                    severity: "error",
                  });
                if (!q.options || !Array.isArray(q.options))
                  errors.push({
                    path: `${prefix}/qa/${file}`,
                    message: `${qPrefix}: missing "options" array`,
                    severity: "error",
                  });
                if (typeof q.answer !== "number")
                  errors.push({
                    path: `${prefix}/qa/${file}`,
                    message: `${qPrefix}: "answer" must be a number (index)`,
                    severity: "error",
                  });
                else if (
                  q.options &&
                  (q.answer < 0 || q.answer >= q.options.length)
                )
                  errors.push({
                    path: `${prefix}/qa/${file}`,
                    message: `${qPrefix}: "answer" index ${q.answer} out of range (${q.options.length} options)`,
                    severity: "error",
                  });
              }
            }
          } catch (e: any) {
            errors.push({
              path: `${prefix}/qa/${file}`,
              message: `Invalid JSON: ${e.message}`,
              severity: "error",
            });
          }
        }
      }
    }
  }

  return errors;
}

// ===== Run =====
const errors = lint();
const errorCount = errors.filter((e) => e.severity === "error").length;
const warnCount = errors.filter((e) => e.severity === "warning").length;

if (errors.length === 0) {
  console.log("✅ All validations passed!\n");
  process.exit(0);
} else {
  console.log(
    `Found ${errorCount} error(s) and ${warnCount} warning(s):\n`
  );

  for (const err of errors) {
    const icon = err.severity === "error" ? "❌" : "⚠️ ";
    console.log(`  ${icon} ${err.path}`);
    console.log(`     ${err.message}\n`);
  }

  process.exit(errorCount > 0 ? 1 : 0);
}
