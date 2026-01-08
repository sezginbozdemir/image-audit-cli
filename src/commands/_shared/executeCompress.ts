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

export async function executeCompress(
  compressRules: CompressConfig,
  scan: ScanResult,
  candidates: ImageInfo[],
) {
  if (compressRules.yes || compressRules.dryRun) {
    return await compressImages(compressRules, scan);
  }
  const ok = await confirm(`Compress/replace ${candidates.length} file(s) ?`);

  if (!ok) {
    return createCanceledResult(candidates, scan.errors);
  }

  const result = await compressImages(compressRules, scan);
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
