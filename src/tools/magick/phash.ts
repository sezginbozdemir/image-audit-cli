import { runSpawn } from "../runSpawn.js";

export async function magickPhash(file: string): Promise<string> {
  const { out } = await runSpawn("magick", [
    file,
    "-define",
    "phash:colorspaces=sRGB",
    "-format",
    "%#",
    "info:",
  ]);

  return out.trim();
}
