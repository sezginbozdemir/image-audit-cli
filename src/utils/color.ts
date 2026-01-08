const ANSI = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",

  red: "\x1b[31m",
  green: "\x1b[32m",
  cyan: "\x1b[36m",
};

export function c(
  text: string,
  style: "error" | "ok" | "cyan" | "dim",
): string {
  if (style === "error") {
    return ANSI.bold + ANSI.red + text + ANSI.reset;
  }
  if (style === "ok") {
    return ANSI.bold + ANSI.green + text + ANSI.reset;
  }
  if (style === "cyan") {
    return ANSI.cyan + text + ANSI.reset;
  }
  if (style === "dim") {
    return ANSI.dim + text + ANSI.reset;
  }
  return text;
}
