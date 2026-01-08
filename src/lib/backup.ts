import path from "node:path";
import fs from "fs/promises";
import ora from "ora";
import { c } from "../utils/color.js";

export async function backup(dir: string): Promise<void> {
  const spinner = ora(`${c("Creating backup...", "dim")}\n`);
  spinner.start();

  const p = path.resolve(dir);
  const backupPath = `${p}_backup`;

  try {
    await fs.access(backupPath);
    spinner.fail();
    throw new Error(`Backup already exists: ${backupPath}`);
  } catch (err: any) {
    if (err?.code !== "ENOENT") {
      spinner.fail();
      throw err;
    }
  }

  await fs.cp(dir, backupPath, { recursive: true });
  spinner.succeed();
}
