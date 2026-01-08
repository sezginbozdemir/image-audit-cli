import ora from "ora";
import { ScanConfig, ScanResult } from "../../lib/types.js";
import { c } from "../../utils/color.js";
import { scanImages } from "../../lib/scan.js";
import {
  generateReports,
  printScanReport,
  printScanSummary,
} from "../../utils/report.js";

export async function runScan(
  dir: string,
  rules: ScanConfig,
): Promise<ScanResult> {
  if (rules.yes) {
    console.log(`${c("Skipping confirm prompts", "cyan")}\n`);
  }

  if (rules.group) {
    console.log(`${c(`Grouping: ${rules.group}`, "cyan")}\n`);
  }

  const patterns = rules.extensions.map((ext) => `**/*.${ext}`);
  console.log(`${c(`Using patterns for fast-glob: ${patterns}`, "cyan")}\n`);

  const spinner = ora(c("Scanning images...", "dim")).start();
  try {
    const result = await scanImages(dir, rules);
    spinner.succeed(c(`Scan complete (${result.total} file(s))`, "dim"));
    printScanSummary(result);

    await generateReports(result, printScanReport, rules.yes);

    return result;
  } catch (err) {
    spinner.fail(c("Scan failed", "error"));
    throw err;
  }
}
