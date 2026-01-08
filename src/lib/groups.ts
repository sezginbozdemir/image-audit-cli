import ora from "ora";
import { ImageInfo, ScanConfig, FileGroup } from "./types.js";
import { c } from "../utils/color.js";

export function findDuplicateFilenames(files: ImageInfo[]): FileGroup[] {
  const spinner = ora(`${c("Detecting duplicate filenames...", "dim")}\n`);
  spinner.start();
  const map = new Map<string, string[]>();
  for (const f of files) {
    const arr = map.get(f.name) ?? [];
    arr.push(f.path);
    map.set(f.name, arr);
  }

  const duplicates = [...map.entries()]
    .filter(([_, paths]) => paths.length > 1)
    .map(([name, paths]) => ({ name, paths: paths.sort() }))
    .sort(
      (a, b) => b.paths.length - a.paths.length || a.name.localeCompare(b.name),
    );

  spinner.succeed();
  return duplicates;
}

export function groupByDate(files: ImageInfo[]): FileGroup[] {
  const spinner = ora(`${c("Grouping images by capture date...", "dim")}\n`);
  spinner.start();

  const map = new Map<string, string[]>();

  for (const f of files) {
    if (!f.date) continue;
    const arr = map.get(f.date) ?? [];
    arr.push(f.path);
    map.set(f.date, arr);
  }

  const dayGroups: FileGroup[] = [...map.entries()]
    //    .filter(([_, paths]) => paths.length > 1)
    .map(([name, paths]) => ({ name, paths: paths.sort() }))
    .sort(
      (a, b) => b.paths.length - a.paths.length || a.name.localeCompare(b.name),
    );
  spinner.succeed();

  return dayGroups;
}

export function findOversized(
  files: ImageInfo[],
  rules: ScanConfig,
): ImageInfo[] {
  const spinner = ora(
    `${c("Finding images exceeding size limit...", "dim")}\n`,
  );
  spinner.start();

  const tooBig = files.filter((f) => f.bytes > rules.maxBytes);
  spinner.succeed();
  return tooBig;
}

function hammingHex(a: string, b: string) {
  if (a.length !== b.length) throw new Error("len mismatch");

  const pop4 = [0, 1, 1, 2, 1, 2, 2, 3, 1, 2, 2, 3, 2, 3, 3, 4];
  let d = 0;
  for (let i = 0; i < a.length; i++) {
    d += pop4[parseInt(a[i], 16) ^ parseInt(b[i], 16)];
  }
  return d;
}

export function findSimiliar(files: ImageInfo[]): FileGroup[] {
  const spinner = ora(`${c("Clustering similiar images (phash)...", "dim")}\n`);
  spinner.start();

  const map = new Map<string, Set<string>>();
  for (const f of files) map.set(f.path, new Set());

  for (let i = 0; i < files.length; i++) {
    for (let j = i + 1; j < files.length; j++) {
      const d = hammingHex(files[i].phash!, files[j].phash!);
      if (d <= 30) {
        map.get(files[i].path)!.add(files[j].path);
        map.get(files[j].path)!.add(files[i].path);
      }
    }
  }

  const visited = new Set<string>();
  const groups: FileGroup[] = [];

  for (const f of files) {
    const start = f.path;
    if (visited.has(start)) continue;
    if (map.get(start)?.size === 0) continue;

    const stack = [start];
    const component: string[] = [];

    visited.add(start);

    while (stack.length) {
      const cur = stack.pop()!;

      component.push(cur);

      for (const nxt of map.get(cur) ?? []) {
        if (!visited.has(nxt)) {
          visited.add(nxt);
          stack.push(nxt);
        }
      }
    }

    groups.push({ name: `group-${groups.length + 1}`, paths: component });
  }

  spinner.succeed();

  return groups;
}
