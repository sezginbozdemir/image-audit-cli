import { c } from "./color.js";

export function confirm(question: string): Promise<boolean> {
  const { stdin, stdout } = process;
  const input = c("? ", "cyan") + question;

  return new Promise((resolve) => {
    stdout.write(`\n${input} (y/N)  `);
    stdin.setEncoding("utf8");
    stdin.resume();
    stdin.once("data", (d: string) => {
      const s = d.trim().toLowerCase();
      const ok = s === "y" || s === "yes";
      stdout.write("\x1b[1A");
      stdout.write("\x1b[2K");
      stdout.write(`${input} ${ok ? c("Yes", "cyan") : c("No", "cyan")}\n\n`);
      stdin.pause();
      resolve(ok);
    });
  });
}
