import * as fs from "fs";
import * as path from "path";
import { parseJsonSafe, findThumbnail, getSubdirectories, getFiles, shouldSkip } from "./utils";
import type { LintError } from "./types";

const ROOT_DIR = process.cwd();
const DATA_DIR = path.join(ROOT_DIR, "data");

const VALID_COURSE_TYPES = ["GENERAL", "MAJOR", "ELECTIVE"];
const REQUIRED_COURSE_DIRS = ["[docs]", "[exams]", "[qa]"];
const REQUIRED_COURSE_INFO_FIELDS = [
  "courseName",
  "courseCode",
  "courseCredit",
  "courseType",
  "courseDescription",
];

function pushError(
  errors: LintError[],
  pathStr: string,
  message: string,
  severity: "error" | "warning" = "error"
): void {
  errors.push({ path: pathStr, message, severity });
}

function validateCourseInfo(
  errors: LintError[],
  courseRoot: string,
  prefix: string
): void {
  const courseInfoPath = path.join(courseRoot, "info.json");
  if (!fs.existsSync(courseInfoPath)) {
    pushError(errors, `${prefix}/`, "Missing course info.json at course root");
    return;
  }

  try {
    const raw = parseJsonSafe(fs.readFileSync(courseInfoPath, "utf-8"));
    for (const field of REQUIRED_COURSE_INFO_FIELDS) {
      if (!raw[field]) {
        pushError(errors, `${prefix}/info.json`, `Missing required field: \"${field}\"`);
      }
    }

    if (raw.courseType && !VALID_COURSE_TYPES.includes(raw.courseType)) {
      pushError(
        errors,
        `${prefix}/info.json`,
        `Invalid courseType: \"${raw.courseType}\". Must be one of: ${VALID_COURSE_TYPES.join(", ")}`
      );
    }
  } catch (e: any) {
    pushError(errors, `${prefix}/info.json`, `Invalid JSON: ${e.message}`);
  }

  const thumbnail = findThumbnail(courseRoot);
  if (!thumbnail) {
    pushError(
      errors,
      `${prefix}/`,
      "Missing thumbnail image at course root (expected: thumbnail.jpg/.jpeg/.png/.webp)"
    );
  }
}

function validateItemFolder(
  errors: LintError[],
  basePrefix: string,
  sectionName: "[docs]" | "[exams]" | "[qa]",
  itemName: string,
  itemDir: string
): void {
  const itemPrefix = `${basePrefix}/${sectionName}/${itemName}`;
  const infoPath = path.join(itemDir, "info.json");

  if (!fs.existsSync(infoPath)) {
    pushError(errors, `${itemPrefix}/`, "Missing info.json");
    return;
  }

  try {
    const raw = parseJsonSafe(fs.readFileSync(infoPath, "utf-8"));
    if (!raw.title) {
      pushError(errors, `${itemPrefix}/info.json`, 'Missing required field: "title"');
    }
    if (!raw.date) {
      pushError(errors, `${itemPrefix}/info.json`, 'Missing recommended field: "date"', "warning");
    }
    if (!raw.keywords || !Array.isArray(raw.keywords)) {
      pushError(errors, `${itemPrefix}/info.json`, 'Missing/invalid field: "keywords" (array)', "warning");
    }
  } catch (e: any) {
    pushError(errors, `${itemPrefix}/info.json`, `Invalid JSON: ${e.message}`);
  }

  const files = fs
    .readdirSync(itemDir, { withFileTypes: true })
    .filter((d) => d.isFile())
    .map((d) => d.name);
  const canonicalContentFiles = files.filter((name) => /^content\.(md|pdf)$/i.test(name));

  if (canonicalContentFiles.length > 1) {
    pushError(errors, `${itemPrefix}/`, "Too many content files: only one of content.md or content.pdf is allowed");
    return;
  }

  if (canonicalContentFiles.length === 1) {
    return;
  }

  const fallbackContentFiles = files.filter(
    (name) => /\.(md|pdf)$/i.test(name) && name !== "info.json"
  );

  if (fallbackContentFiles.length === 1) {
    pushError(
      errors,
      `${itemPrefix}/`,
      `Legacy content filename detected (\"${fallbackContentFiles[0]}\"). Please rename to content.${path.extname(fallbackContentFiles[0]).replace('.', '')}`,
      "warning"
    );
    return;
  }

  if (fallbackContentFiles.length === 0) {
    pushError(errors, `${itemPrefix}/`, "Missing content file: expected exactly one content.md or content.pdf");
  } else {
    pushError(errors, `${itemPrefix}/`, "Too many content candidates: keep only one markdown/pdf file as content");
  }
}

function validateQaJsonFile(
  errors: LintError[],
  coursePrefix: string,
  fileName: string,
  filePath: string
): void {
  const p = `${coursePrefix}/[qa]/${fileName}`;
  try {
    const qa = parseJsonSafe(fs.readFileSync(filePath, "utf-8"));

    if (!qa.title) pushError(errors, p, 'Missing "title"');
    if (!qa.author) pushError(errors, p, 'Missing "author"', "warning");
    if (!qa.data || !Array.isArray(qa.data)) {
      pushError(errors, p, 'Missing or invalid "data" array');
      return;
    }

    for (let i = 0; i < qa.data.length; i++) {
      const q = qa.data[i];
      const qPrefix = `Question ${i + 1}`;
      if (!q.question) pushError(errors, p, `${qPrefix}: missing "question" text`);
      if (!q.options || !Array.isArray(q.options)) {
        pushError(errors, p, `${qPrefix}: missing "options" array`);
      }
      if (typeof q.answer !== "number") {
        pushError(errors, p, `${qPrefix}: "answer" must be a number (index)`);
      } else if (q.options && (q.answer < 0 || q.answer >= q.options.length)) {
        pushError(
          errors,
          p,
          `${qPrefix}: "answer" index ${q.answer} out of range (${q.options.length} options)`
        );
      }
    }
  } catch (e: any) {
    pushError(errors, p, `Invalid JSON: ${e.message}`);
  }
}

function lint(): LintError[] {
  const errors: LintError[] = [];

  if (!fs.existsSync(DATA_DIR)) {
    pushError(errors, "data/", "Data directory not found");
    return errors;
  }

  const faculties = getSubdirectories(DATA_DIR).filter((f) => !shouldSkip(f));
  if (faculties.length === 0) {
    pushError(
      errors,
      "data/",
      "No faculty directories found (excluding _ prefixed)",
      "warning"
    );
    return errors;
  }

  for (const faculty of faculties) {
    const facultyDir = path.join(DATA_DIR, faculty);
    const courses = getSubdirectories(facultyDir);

    if (courses.length === 0) {
      pushError(errors, `data/${faculty}/`, "Faculty has no course directories", "warning");
      continue;
    }

    for (const course of courses) {
      const courseRoot = path.join(facultyDir, course);
      const prefix = `data/${faculty}/${course}`;

      const hasStructure =
        fs.existsSync(path.join(courseRoot, "info.json")) ||
        REQUIRED_COURSE_DIRS.some((dir) => fs.existsSync(path.join(courseRoot, dir))) ||
        !!findThumbnail(courseRoot);

      if (!hasStructure) {
        pushError(
          errors,
          `${prefix}/`,
          "Empty course directory placeholder. Skipping.",
          "warning"
        );
        continue;
      }

      validateCourseInfo(errors, courseRoot, prefix);

      for (const dir of REQUIRED_COURSE_DIRS) {
        if (!fs.existsSync(path.join(courseRoot, dir))) {
          pushError(errors, `${prefix}/`, `Missing required directory: ${dir}/`);
        }
      }

      const docsDir = path.join(courseRoot, "[docs]");
      if (fs.existsSync(docsDir)) {
        const docs = getSubdirectories(docsDir);
        for (const item of docs) {
          validateItemFolder(errors, prefix, "[docs]", item, path.join(docsDir, item));
        }
      }

      const examsDir = path.join(courseRoot, "[exams]");
      if (fs.existsSync(examsDir)) {
        const exams = getSubdirectories(examsDir);
        for (const item of exams) {
          validateItemFolder(errors, prefix, "[exams]", item, path.join(examsDir, item));
        }
      }

      const qaDir = path.join(courseRoot, "[qa]");
      if (fs.existsSync(qaDir)) {
        const qaJsonFiles = getFiles(qaDir, [".json"]);
        for (const qaFile of qaJsonFiles) {
          validateQaJsonFile(errors, prefix, qaFile, path.join(qaDir, qaFile));
        }

        const qaFolders = getSubdirectories(qaDir);
        for (const item of qaFolders) {
          validateItemFolder(errors, prefix, "[qa]", item, path.join(qaDir, item));
        }
      }
    }
  }

  return errors;
}

const errors = lint();
const errorCount = errors.filter((e) => e.severity === "error").length;
const warnCount = errors.filter((e) => e.severity === "warning").length;

if (errors.length === 0) {
  console.log("All validations passed.\n");
  process.exit(0);
} else {
  console.log(`Found ${errorCount} error(s) and ${warnCount} warning(s):\n`);

  for (const err of errors) {
    const icon = err.severity === "error" ? "[ERROR]" : "[WARN ]";
    console.log(`  ${icon} ${err.path}`);
    console.log(`         ${err.message}\n`);
  }

  process.exit(errorCount > 0 ? 1 : 0);
}
