import fs from "node:fs/promises";
import FastGlob from "fast-glob";
import path from "node:path";
import pLimit from "p-limit";
import { magickIdentify } from "../tools/magick.js";
import {
  ImagesByDay,
  DuplicateNameGroup,
  ImageInfo,
  FileError,
  ScanResult,
  ScanConfig,
} from "./types.js";
import ora from "ora";
import { c } from "../utils/color.js";

function normalizeExif(exif: string | null): string | null {
  if (exif == null) return null;
  const s = exif.trim();

  if (!s) return null;

  const parts = s.split(/\s+/);

  if (parts.length != 2) return null;

  const [d, _] = parts;

  const date = d.replaceAll(":", "-");

  return date;
}

export async function scanImages(
  rootDir: string,
  rules: ScanConfig,
): Promise<ScanResult> {
  const patterns = rules.extensions.map((ext) => `**/*.${ext}`);

  console.log(`${c(`Using patterns for fast-glob: ${patterns}`, "cyan")}\n`);

  const entries = await FastGlob(patterns, {
    cwd: rootDir,
    onlyFiles: true,
    dot: false,
    unique: false,
    followSymbolicLinks: false,
    absolute: true,
    caseSensitiveMatch: false,
  });

  console.log(`${c(`${entries.length} entrie(s) found.`, "cyan")}\n`);

  const spinner = ora(`${c("Gathering metadata... Please wait.", "dim")}\n`);
  spinner.start();

  const limit = pLimit(6);
  const errors: FileError[] = [];

  const files = await Promise.all(
    entries.map((file) =>
      limit(async (): Promise<ImageInfo | null> => {
        try {
          const st = await fs.stat(file);
          const { width, height, dateOriginal } = await magickIdentify(file);
          const date = normalizeExif(dateOriginal);
          return {
            path: file,
            name: path.basename(file),
            bytes: st.size,
            width,
            height,
            date,
          };
        } catch (e: any) {
          errors.push({ path: file, error: e?.message ?? String(e) });
          return null;
        }
      }),
    ),
  );

  const okFiles: ImageInfo[] = files.filter((x): x is ImageInfo => x !== null);

  const tooBig = okFiles.filter((f) => {
    const sizeTooBig = f.bytes > rules.maxBytes;
    const tooWide = rules.maxWidth !== null && f.width > rules.maxWidth;
    const tooTall = rules.maxHeight !== null && f.height > rules.maxHeight;
    return sizeTooBig || tooWide || tooTall;
  });

  const duplicateMap = new Map<string, string[]>();
  for (const f of okFiles) {
    const arr = duplicateMap.get(f.name) ?? [];
    arr.push(f.path);
    duplicateMap.set(f.name, arr);
  }

  const duplicates: DuplicateNameGroup[] = [...duplicateMap.entries()]
    .filter(([_, paths]) => paths.length > 1)
    .map(([name, paths]) => ({ name, paths: paths.sort() }))
    .sort(
      (a, b) => b.paths.length - a.paths.length || a.name.localeCompare(b.name),
    );

  const dayMap = new Map<string, string[]>();

  for (const f of okFiles) {
    if (!f.date) continue;
    const arr = dayMap.get(f.date) ?? [];
    arr.push(f.path);
    dayMap.set(f.date, arr);
  }

  const dayGroups: ImagesByDay[] = [...dayMap.entries()]
    .filter(([_, paths]) => paths.length > 1)
    .map(([day, paths]) => ({ day, paths: paths.sort() }))
    .sort(
      (a, b) => b.paths.length - a.paths.length || a.day.localeCompare(b.day),
    );

  spinner.succeed();

  return {
    total: okFiles.length,
    tooBig,
    duplicates,
    dayGroups,
    errors,
  };
}
