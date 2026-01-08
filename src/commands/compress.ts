import { Command } from "commander";
import type { CompressOpts, ScanConfig, CompressConfig } from "../lib/types.js";
import { runScan } from "./_shared/runScan.js";
import { executeCompress } from "./_shared/executeCompress.js";
import {
  normalizeCompressOpts,
  scanConfigFromOpts,
} from "./_shared/normalize.js";

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
    .action(compressAction);

  return cmd;
}

async function compressAction(dir: string, opts: CompressOpts): Promise<void> {
  const scanRules: ScanConfig = scanConfigFromOpts(opts);
  const compressRules: CompressConfig = normalizeCompressOpts(opts);

  const scan = await runScan(dir, scanRules);

  const result = await executeCompress(compressRules, scan, scan.oversized);

  process.exitCode = result.errors.length ? 2 : 0;
}
