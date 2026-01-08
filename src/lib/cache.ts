import fs from "fs/promises";
import path from "path";
import os from "os";
import { ImageInfo } from "./types.js";

type CacheFile = Record<string, ImageInfo>;

function defaultCachePath() {
  return path.join(os.homedir(), ".cache", "image-audit", "cache.json");
}

export async function loadCache(
  cachePath = defaultCachePath(),
): Promise<CacheFile> {
  await fs.mkdir(path.dirname(cachePath), { recursive: true });

  try {
    const raw = await fs.readFile(cachePath, "utf8");
    const data = JSON.parse(raw) as CacheFile;

    if (!data || typeof data !== "object") {
      return {};
    }
    return data;
  } catch {
    return {};
  }
}

export async function saveCache(
  cache: CacheFile,
  cachePath = defaultCachePath(),
): Promise<void> {
  await fs.mkdir(path.dirname(cachePath), { recursive: true });

  await fs.writeFile(cachePath, JSON.stringify(cache), "utf8");
}

export function getCacheEntry(
  cache: CacheFile,
  path: string,
  size: number,
  mTime: number,
): ImageInfo | null {
  const e = cache[path];
  if (!e) return null;
  if (e.bytes !== size || e.mTime !== mTime) return null;
  return e;
}

export function setCacheEntry(
  cache: CacheFile,
  path: string,
  entry: ImageInfo,
): void {
  cache[path] = entry;
}
