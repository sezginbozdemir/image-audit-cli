import { runExec } from "./runExec.js";

export async function ensureMagickOrExit() {
  try {
    const r = await runExec("magick", ["-version"]);
    const out = r.out + r.err;
    if (!/ImageMagick/i.test(out)) {
      throw new Error("`magick` was found but did not report ImageMagick.");
    }
  } catch {
    console.error(
      `ImageMagick is required but 'magick' was not found in PATH.

Install:
  macOS:   brew install imagemagick
  Ubuntu:  sudo apt-get update && sudo apt-get install -y imagemagick
  Windows: winget install ImageMagick.ImageMagick
`,
    );
    process.exit(1);
  }
}
