import { Command } from "commander";
import type { ScanOpts, ScanConfig } from "../lib/types.js";
import { confirm } from "../utils/confirm.js";
import { runScan } from "./_shared/runScan.js";
import { executeMove } from "./_shared/executeMove.js";
import { scanConfigFromOpts } from "./_shared/normalize.js";

export function move(): Command {
  const cmd = new Command("move");

  cmd
    .argument("<dir>", "Directory to scan")
    .option("-y, --yes", "Skip confirmation prompt", false)
    .requiredOption(
      "--group <type>",
      "Which grouping to run: duplicate-name | day | similiar",
    )

    .option(
      "--extensions <list>",
      "Comma-separated extensions (default: jpg,jpeg,png,webp)",
      "jpg,jpeg,png,webp",
    )
    .action(moveAction);

  return cmd;
}

async function moveAction(dir: string, opts: ScanOpts): Promise<void> {
  const scanRules: ScanConfig = scanConfigFromOpts(opts);
  const result = await runScan(dir, scanRules);

  if (scanRules.yes) {
    await executeMove(dir, opts, result);
  } else {
    const wantsArranged = await confirm("Proceed ?");

    if (wantsArranged) {
      await executeMove(dir, opts, result);
    }
  }

  process.exitCode = result.errors.length ? 2 : 0;
}
