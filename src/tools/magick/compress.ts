import { runSpawn } from "../runSpawn.js";
import { CompressTask } from "../../lib/types.js";

export async function magickCompress({
  input,
  output,
  ext,
  jpgQuality,
  pngLevel,
}: CompressTask): Promise<void> {
  const e = ext.toLowerCase();

  if (e === "jpg" || e === "jpeg") {
    await runSpawn("magick", [
      input,
      "-interlace",
      "Plane",
      "-quality",
      String(jpgQuality),
      output,
    ]);
    return;
  }

  if (e === "png") {
    await runSpawn("magick", [
      input,
      "-define",
      `png:compression-level=${pngLevel}`,
      output,
    ]);
    return;
  }
  if (e === "webp") {
    await runSpawn("magick", [input, "-quality", String(jpgQuality), output]);
    return;
  }

  await runSpawn("magick", [input, output]);
}
