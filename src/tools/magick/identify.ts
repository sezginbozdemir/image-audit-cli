import { runSpawn } from "../runSpawn.js";
import { IdentifyResult } from "../../lib/types.js";

export async function magickIdentify(file: string): Promise<IdentifyResult> {
  const { out } = await runSpawn("magick", [
    "identify",
    "-format",
    "%w\t%h\t%[EXIF:DateTimeOriginal]",
    file,
  ]);
  const [w, h, d] = out.trim().split("\t");
  const width = Number(w);
  const height = Number(h);

  if (!Number.isFinite(width) || !Number.isFinite(height)) {
    throw new Error(`Could not parse dimensions: "${out.trim()}"`);
  }
  return { width, height, dateOriginal: d };
}
