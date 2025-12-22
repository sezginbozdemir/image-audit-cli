import { Command } from "commander";
import { scanImages } from "../lib/scan.js";
import type { ScanOpts, ScanResult, ScanConfig } from "../lib/types.js";
import { confirm } from "../utils/confirm.js";
import { printScanReport, printScanSummary } from "../utils/report.js";

export function normalizeScanOpts(
  opts: Pick<ScanOpts, "maxMb" | "extensions" | "maxW" | "maxH">,
): ScanConfig {
  const exts = String(opts.extensions)
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  return {
    maxBytes: Math.round(Number(opts.maxMb) * 1024 * 1024),
    maxWidth: opts.maxW ? Number(opts.maxW) : null,
    maxHeight: opts.maxH ? Number(opts.maxH) : null,
    extensions: exts,
  };
}

export function scan(): Command {
  const cmd = new Command("scan");

  cmd
    .argument("<dir>", "Directory to scan")
    .option("--max-mb <n>", "Flag images larger than N MB (default: 2)", "2")
    .option("--max-width <n>", "Flag images wider than N px (optional)")
    .option("--max-height <n>", "Flag images taller than N px (optional)")
    .option(
      "--extensions <list>",
      "Comma-separated extensions (default: jpg,jpeg,png,webp)",
      "jpg,jpeg,png,webp",
    )
    .action(async (dir: string, opts: ScanOpts) => {
      const result: ScanResult = await scanImages(dir, normalizeScanOpts(opts));

      printScanSummary(result);

      const ok = await confirm("Do you want to generate full report?");

      if (ok) printScanReport(result);

      process.exitCode = result.errors.length ? 2 : 0;
    });

  return cmd;
}
