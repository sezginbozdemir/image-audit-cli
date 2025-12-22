import { execFile } from "node:child_process";
import { RunResult, IdentifyResult, CompressTask } from "../lib/types.js";
import { promisify } from "node:util";

const exec = promisify(execFile);

async function run(cmd: string, args: string[]): Promise<RunResult> {
  try {
    const { stdout, stderr } = await exec(cmd, args, {
      windowsHide: true,
      timeout: 60_000,
      maxBuffer: 10 * 1024 * 1024,
    });

    return { out: stdout, err: stderr };
  } catch (e: any) {
    throw new Error(e.stderr || `Command failed: ${cmd} ${args}`);
  }
}

export async function magickIdentify(file: string): Promise<IdentifyResult> {
  const { out } = await run("magick", [
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

export async function magickCompress({
  input,
  output,
  ext,
  jpgQuality,
  pngLevel,
}: CompressTask): Promise<void> {
  const e = ext.toLowerCase();

  if (e === "jpg" || e === "jpeg") {
    await run("magick", [
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
    await run("magick", [
      input,
      "-define",
      `png:compression-level=${pngLevel}`,
      output,
    ]);
    return;
  }
  if (e === "webp") {
    await run("magick", [input, "-quality", String(jpgQuality), output]);
    return;
  }

  await run("magick", [input, output]);
}
