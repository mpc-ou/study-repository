import * as fs from "fs";
import * as path from "path";
import type { MarkdownMeta } from "./types";

export function parseJsonSafe(content: string): any {
  const firstBrace = content.indexOf("{");
  const lastBrace = content.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1) {
    const firstBracket = content.indexOf("[");
    const lastBracket = content.lastIndexOf("]");
    if (firstBracket === -1 || lastBracket === -1) {
      throw new Error("No JSON object or array found");
    }
    return JSON.parse(content.substring(firstBracket, lastBracket + 1));
  }
  return JSON.parse(content.substring(firstBrace, lastBrace + 1));
}

export function findThumbnail(dir: string): string | null {
  const extensions = [".jpg", ".jpeg", ".png", ".webp"];
  for (const ext of extensions) {
    const filePath = path.join(dir, `thumbnail${ext}`);
    if (fs.existsSync(filePath)) {
      return `thumbnail${ext}`;
    }
  }
  return null;
}

export function parseMarkdownInfo(
  content: string
): { meta: MarkdownMeta; content: string } | null {
  const infoMatch = content.match(
    /<!--\s*INFO\s*-->([\s\S]*?)<!--\s*CONTENT\s*-->/
  );
  if (!infoMatch) return null;

  const infoBlock = infoMatch[1];
  const meta: Partial<MarkdownMeta> = {};

  const titleMatch = infoBlock.match(/-\s*title:\s*"([^"]*)"/);
  const authorMatch = infoBlock.match(/-\s*author:\s*"([^"]*)"/);
  const dateMatch = infoBlock.match(/-\s*date:\s*"([^"]*)"/);
  const summaryMatch = infoBlock.match(/-\s*summary:\s*"([^"]*)"/);
  const keywordsMatch = infoBlock.match(/-\s*keywords:\s*\[([^\]]*)\]/);
  const thumbnailMatch = infoBlock.match(/-\s*thumbnail:\s*"([^"]*)"/);

  meta.title = titleMatch?.[1] ?? "";
  meta.author = authorMatch?.[1] ?? "";
  meta.date = dateMatch?.[1] ?? "";
  meta.summary = summaryMatch?.[1] ?? "";
  meta.keywords = keywordsMatch
    ? keywordsMatch[1]
        .split(",")
        .map((k) => k.trim().replace(/^"|"$/g, ""))
        .filter(Boolean)
    : [];

  if (thumbnailMatch) {
    meta.thumbnail = thumbnailMatch[1];
  }

  const contentIdx = content.indexOf("<!-- CONTENT -->");
  const cleanContent =
    contentIdx !== -1
      ? content.substring(contentIdx + "<!-- CONTENT -->".length).trimStart()
      : content;

  return { meta: meta as MarkdownMeta, content: cleanContent };
}

export function shouldSkip(name: string): boolean {
  return name.startsWith("_");
}

export function getSubdirectories(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
}

export function getFiles(dir: string, extensions: string[]): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter(
      (f) => f.isFile() && extensions.some((ext) => f.name.endsWith(ext))
    )
    .map((f) => f.name)
    .sort();
}

export function copyDir(
  src: string,
  dest: string,
  options?: {
    skipDirNames?: string[];
    transformMarkdown?: boolean;
  }
): void {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      if (shouldSkip(entry.name)) continue;
      if (options?.skipDirNames?.includes(entry.name)) continue;
      copyDir(srcPath, destPath, options);
    } else if (entry.isFile()) {
      if (options?.transformMarkdown && entry.name.endsWith(".md")) {
        const content = fs.readFileSync(srcPath, "utf-8");
        const parsed = parseMarkdownInfo(content);
        if (parsed) {
          fs.writeFileSync(destPath, parsed.content, "utf-8");
        } else {
          fs.copyFileSync(srcPath, destPath);
        }
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
}
