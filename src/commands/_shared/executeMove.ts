import { backup } from "../../lib/backup.js";
import { moveFiles } from "../../lib/move.js";
import { ScanOpts, ScanResult } from "../../lib/types.js";
import { c } from "../../utils/color.js";
import {
  generateReports,
  printMoveReport,
  printMoveSummary,
} from "../../utils/report.js";

export async function executeMove(
  dir: string,
  opts: ScanOpts,
  result: ScanResult,
): Promise<void> {
  try {
    await backup(dir);
  } catch (err: any) {
    console.log(
      c("Backup failed:", "error"),
      c(err.message || String(err), "dim"),
    );
    console.log(c("Aborting arrangement to protect your files.", "cyan"));
    return;
  }
  const groups =
    opts.group === "day"
      ? result.dayGroups
      : opts.group === "duplicate-name"
        ? result.duplicates
        : result.similiars;

  const move = await moveFiles(dir, opts.group, groups);
  printMoveSummary(move);
  await generateReports(move, printMoveReport, opts.yes);
}
