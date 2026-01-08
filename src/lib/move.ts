import path from "path";
import fs from "fs/promises";
import { FileGroup, GroupType, MoveResult } from "./types.js";
import ora from "ora";
import { c } from "../utils/color.js";

export async function moveFiles(
  dir: string,
  type: GroupType,
  groups: FileGroup[],
): Promise<MoveResult> {
  const result: MoveResult = {
    moved: [],
    failed: [],
  };

  const spinner = ora(`${c("Arranging...", "dim")}\n`);

  spinner.start();

  if (type == "duplicate-name") {
    for (const g of groups) {
      const gDir = path.join(dir, "_duplicates_", g.name);
      await fs.mkdir(gDir, { recursive: true });
      for (let i = 0; i < g.paths.length; i++) {
        const p = g.paths[i];
        const base = path.basename(p);
        const ext = path.extname(base);
        const name = path.basename(base, ext);
        const numberedName = `${name}_${i}${ext}`;
        const dest = path.join(gDir, numberedName);
        try {
          await fs.rename(p, dest);
          result.moved.push({ from: p, to: dest });
        } catch (error: any) {
          result.failed.push({ from: p, to: dest, err: error });
        }
      }
    }
    spinner.succeed();
  }

  if (type == "day") {
    for (const g of groups) {
      const gDir = path.join(dir, "_days_", g.name);
      await fs.mkdir(gDir, { recursive: true });
      for (const p of g.paths) {
        const dest = path.join(gDir, path.basename(p));
        try {
          await fs.rename(p, dest);
          result.moved.push({ from: p, to: dest });
        } catch (error: any) {
          result.failed.push({ from: p, to: dest, err: error });
        }
      }
    }
    spinner.succeed();
  }

  if (type == "similiar") {
    let i = 1;
    for (const g of groups) {
      const gDir = path.join(dir, "_similiars_", g.name);
      await fs.mkdir(gDir, { recursive: true });
      for (const p of g.paths) {
        const base = path.basename(p);
        const ext = path.extname(base);
        const stem = path.basename(base, ext);

        const dest = path.join(gDir, `${stem}__${i++}${ext}`);
        try {
          await fs.rename(p, dest);
          result.moved.push({ from: p, to: dest });
        } catch (error: any) {
          result.failed.push({ from: p, to: dest, err: error });
        }
      }
    }
    spinner.succeed();
  }

  return result;
}
