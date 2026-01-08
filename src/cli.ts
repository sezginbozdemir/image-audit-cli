import { Command } from "commander";
import { scan } from "./commands/scan.js";
import { compress } from "./commands/compress.js";
import { move } from "./commands/move.js";
import { ensureMagickOrExit } from "./tools/ensureMagick.js";

const program = new Command();

program
  .name("img-audit")
  .description(
    "Scan images for size issues and duplicate names; optionally compress with ImageMagick.",
  )
  .version("0.1.0");

program.addCommand(scan());
program.addCommand(compress());
program.addCommand(move());

ensureMagickOrExit();

program.parseAsync(process.argv);
