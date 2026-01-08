import fs from "node:fs/promises";
import FastGlob from "fast-glob";
import path from "node:path";
import pLimit from "p-limit";
import { magickIdentify } from "../tools/magick/identify.js";
import { ImageInfo, FileError, ScanResult, ScanConfig } from "./types.js";
import ora from "ora";
import { c } from "../utils/color.js";
import {
  findDuplicateFilenames,
  groupByDate,
  findSimiliar,
  findOversized,
} from "./groups.js";
import { magickPhash } from "../tools/magick/phash.js";
import { getCacheEntry, loadCache, saveCache, setCacheEntry } from "./cache.js";

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

  const fgOpts = {
    cwd: rootDir,
    onlyFiles: true,
    dot: false,
    unique: false,
    followSymbolicLinks: false,
    absolute: true,
    caseSensitiveMatch: false,
  };

  const entries = await FastGlob(patterns, fgOpts);

  const cache = await loadCache();
  let cacheDirty = false;

  const limit = pLimit(6);
  const errors: FileError[] = [];

  const files = await Promise.all(
    entries.map((file) =>
      limit(async (): Promise<ImageInfo | null> => {
        try {
          const st = await fs.stat(file);
          const cached = getCacheEntry(cache, file, st.size, st.mtimeMs);
          let changed = false;
          let width = cached?.width ?? null;
          let height = cached?.height ?? null;
          let date = cached?.date ?? null;
          let phash = cached?.phash ?? null;

          const wantsIdent = rules.group === "all" || rules.group === "day";
          const wantsPhash =
            rules.group === "all" || rules.group === "similiar";

          if (wantsIdent && (width == null || height == null)) {
            const ident = await magickIdentify(file);

            width = ident.width;
            height = ident.height;
            date = normalizeExif(ident.dateOriginal);
            changed = true;
          }

          if (wantsPhash && phash == null) {
            phash = await magickPhash(file);
            changed = true;
          }

          const info: ImageInfo = {
            path: file,
            name: path.basename(file),
            mTime: st.mtimeMs,
            bytes: st.size,
            width,
            height,
            date,
            phash,
          };
          if (!cached || changed) {
            setCacheEntry(cache, file, info);
            cacheDirty = true;
          }

          return info;
        } catch (e: any) {
          errors.push({ path: file, error: e?.message ?? String(e) });
          return null;
        }
      }),
    ),
  );

  if (cacheDirty) {
    await saveCache(cache);
  }

  const okFiles: ImageInfo[] = files.filter((x): x is ImageInfo => x !== null);
  const duplicates =
    rules.group === "all" || rules.group === "duplicate-name"
      ? findDuplicateFilenames(okFiles)
      : [];

  const dayGroups =
    rules.group === "all" || rules.group === "day" ? groupByDate(okFiles) : [];

  const similiars =
    rules.group === "all" || rules.group === "similiar"
      ? findSimiliar(okFiles)
      : [];
  const oversized = findOversized(okFiles, rules);

  return {
    total: okFiles.length,
    oversized,
    duplicates,
    dayGroups,
    similiars,
    errors,
  };
}
