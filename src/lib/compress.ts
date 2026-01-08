import fs from "node:fs/promises";
import path from "node:path";
import { magickCompress } from "../tools/magick/compress.js";
import {
  CompressConfig,
  CompressResult,
  FileChange,
  FileSkip,
  ScanResult,
} from "./types.js";
import ora from "ora";
import { c } from "../utils/color.js";

export async function compressImages(
  compressRules: CompressConfig,
  scan: ScanResult,
): Promise<CompressResult> {
  const candidates = scan.oversized;
  const changed: FileChange[] = [];
  const skipped: FileSkip[] = [];

  const spinner = ora(`${c("Compressing", "dim")}\n`);
  spinner.start();
  const errors = [...scan.errors];
  let compressed = 0;
  for (const f of candidates) {
    try {
      const ext = path.extname(f.path).slice(1);
      const tmp = f.path + ".tmp";

      if (compressRules.dryRun) {
        skipped.push({ path: f.path, reason: "dry-run" });
        continue;
      }

      await magickCompress({
        input: f.path,
        output: tmp,
        ext,
        jpgQuality: compressRules.quality,
        pngLevel: compressRules.pngLevel,
      });

      const before = (await fs.stat(f.path)).size;
      const after = (await fs.stat(tmp)).size;

      if (after >= before) {
        await fs.unlink(tmp);
        skipped.push({ path: f.path, reason: "not-smaller" });
        continue;
      }

      await fs.rename(tmp, f.path);
      compressed++;
      changed.push({ path: f.path, beforeBytes: before, afterBytes: after });
    } catch (e: any) {
      errors.push({ path: f.path, error: e?.message ?? String(e) });
      skipped.push({
        path: f.path,
        reason: "error",
        error: e?.message ?? String(e),
      });
      try {
        await fs.unlink(f.path + ".tmp");
      } catch {}
    }
  }
  spinner.succeed();

  return {
    candidates: candidates.length,
    compressed,
    skipped,
    changed,
    errors,
  };
}
