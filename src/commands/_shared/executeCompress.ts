import ora from "ora";
import { compressImages } from "../../lib/compress.js";
import {
  CompressConfig,
  CompressResult,
  FileError,
  FileSkip,
  ImageInfo,
  ScanResult,
} from "../../lib/types.js";
import { confirm } from "../../utils/confirm.js";
import {
  generateReports,
  printCompressReport,
  printCompressSummary,
} from "../../utils/report.js";
import { c } from "../../utils/color.js";

export async function executeCompress(
  compressRules: CompressConfig,
  scan: ScanResult,
  candidates: ImageInfo[],
) {
  const spinner = ora(`${c("Compressing images...", "dim")}\n`);

  if (compressRules.yes || compressRules.dryRun) {
    spinner.start();
    const result = await compressImages(compressRules, scan);
    spinner.succeed();
    return result;
  }
  const ok = await confirm(`Compress/replace ${candidates.length} file(s) ?`);

  if (!ok) {
    return createCanceledResult(candidates, scan.errors);
  }

  spinner.start();

  const result = await compressImages(compressRules, scan);
  spinner.succeed();
  printCompressSummary(result);

  const skipPrompt = compressRules.yes || compressRules.dryRun;
  await generateReports(result, printCompressReport, skipPrompt);

  return result;
}
function createCanceledResult(
  candidates: ImageInfo[],
  errors: FileError[],
): CompressResult {
  const skipped: FileSkip[] = candidates.map((c) => ({
    path: c.path,
    reason: "canceled",
  }));
  const result = {
    candidates: candidates.length,
    compressed: 0,
    skipped,
    changed: [],
    errors: errors,
  };
  printCompressSummary(result);

  return result;
}
