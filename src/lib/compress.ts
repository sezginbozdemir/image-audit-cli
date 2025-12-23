import fs from "node:fs/promises";
import path from "node:path";
import { confirm } from "../utils/confirm.js";
import { scanImages } from "./scan.js";
import { magickCompress } from "../tools/magick.js";
import {
  CompressConfig,
  CompressResult,
  ScanConfig,
  FileChange,
  FileSkip,
} from "./types.js";
import ora from "ora";
import { printScanSummary } from "../utils/report.js";
import { c } from "../utils/color.js";

export async function compressImages(
  rootDir: string,
  scanRules: ScanConfig,
  compressRules: CompressConfig,
): Promise<CompressResult> {
  const scan = await scanImages(rootDir, scanRules);
  printScanSummary(scan);
  const candidates = scan.tooBig;
  const changed: FileChange[] = [];
  const skipped: FileSkip[] = [];

  if (!compressRules.yes && !compressRules.dryRun) {
    const ok = await confirm(`Compress/replace ${candidates.length} file(s) ?`);

    if (!ok) {
      for (const f of candidates)
        skipped.push({ path: f.path, reason: "canceled" });
      return {
        candidates: candidates.length,
        compressed: 0,
        skipped,
        changed: [],
        errors: scan.errors,
      };
    }
  }
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
