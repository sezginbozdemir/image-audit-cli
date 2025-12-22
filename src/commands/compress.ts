import { Command } from "commander";
import { compressImages } from "../lib/compress.js";
import type {
  CompressOpts,
  CompressResult,
  ScanConfig,
  CompressConfig,
} from "../lib/types.js";
import { confirm } from "../utils/confirm.js";
import { printCompressReport, printCompressSummary } from "../utils/report.js";
import { normalizeScanOpts } from "./scan.js";

export function compress(): Command {
  const cmd = new Command("compress");

  cmd
    .argument("<dir>", "Directory to scan and compress")
    .option(
      "--max-mb <n>",
      "Compress images larger than N MB (default: 2)",
      "2",
    )
    .option(
      "--extensions <list>",
      "Comma-separated extensions (default: jpg,jpeg,png,webp)",
      "jpg,jpeg,png,webp",
    )
    .option("--quality <n>", "JPEG quality (default: 88)", "88")
    .option("--level <n>", "PNG compression level 0-9 (default: 9)", "9")
    .option(
      "--dry-run",
      "Show what would be done but don’t change files",
      false,
    )
    .option("-y, --yes", "Skip confirmation prompt", false)
    .action(async (dir: string, opts: CompressOpts) => {
      const scanRules: ScanConfig = normalizeScanOpts(opts);
      const compressRules: CompressConfig = normalizeCompressOpts(opts);

      const result: CompressResult = await compressImages(
        dir,
        scanRules,
        compressRules,
      );
      printCompressSummary(result);
      const ok = await confirm("Do you want to generate full report?");

      if (ok) printCompressReport(result);

      process.exitCode = result.errors.length ? 2 : 0;
    });

  return cmd;
}

function normalizeCompressOpts(opts: CompressOpts): CompressConfig {
  return {
    maxMb: Math.round(Number(opts.maxMb) * 1024 * 1024),
    quality: Number(opts.quality),
    pngLevel: Number(opts.pngLevel),
    extensions: opts.extensions,
    dryRun: opts.dryRun,
    yes: opts.yes,
  };
}
