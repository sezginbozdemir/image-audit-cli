import { CompressResult, ReportSection, ScanResult } from "../lib/types.js";
import { c } from "./color.js";

function print(summary?: string[], sections?: ReportSection[]): void {
  if (summary) {
    for (const sum of summary) console.log(sum);
  }

  if (sections) {
    for (const sec of sections) {
      const lines = sec.lines.flat().filter((x): x is string => Boolean(x));
      if (!lines.length) continue;

      console.log(`\n${c(sec.title, "ok")}:`);
      for (const line of lines) console.log(c(line, "cyan"));
    }
  }
}

export function printScanSummary(result: ScanResult): void {
  const summary = [
    `${c("Scanned:", "ok")} ${c(`${result.total} images`, "cyan")}`,
    `${c("Too big:", "ok")} ${c(String(result.tooBig.length), "cyan")}`,
    `${c("Duplicate name groups:", "ok")} ${c(String(result.duplicates.length), "cyan")}`,
    `${c("Day groups:", "ok")} ${c(String(result.dayGroups.length), "cyan")}`,
    ...(result.errors.length
      ? [`${c("Errors:", "error")} ${c(String(result.errors.length), "cyan")}`]
      : []),
  ];

  print(summary);
}

export function printScanReport(result: ScanResult): void {
  const sections: ReportSection[] = [
    {
      title: "Too big images",
      lines: result.tooBig.map((f) => [
        `- ${f.path}`,
        `  size=${(f.bytes / 1024 / 1024).toFixed(2)}MB dims=${f.width}x${f.height}`,
      ]),
    },
    {
      title: "Duplicate names",
      lines: result.duplicates.map((g) => [
        `- ${g.name} (${g.paths.length})`,
        ...g.paths.map((p) => `  ${p}`),
      ]),
    },
    {
      title: "Day groups",
      lines: result.dayGroups.map((g) => [
        `- ${g.day} (${g.paths.length})`,
        ...g.paths.map((p) => `  ${p}`),
      ]),
    },
    {
      title: "Errors",
      lines: result.errors.map((e) => `- ${e.path}: ${e.error}`),
    },
  ];

  print(undefined, sections);
}

export function printCompressSummary(result: CompressResult): void {
  const summary = [
    `${c("Candidates:", "ok")} ${c(String(result.candidates), "cyan")}`,
    `${c("Compressed:", "ok")} ${c(String(result.compressed), "cyan")}`,
    `${c("Skipped:", "ok")} ${c(String(result.skipped.length), "cyan")}`,
    ...(result.errors.length
      ? [`${c("Errors:", "error")} ${c(String(result.errors.length), "cyan")}`]
      : [`${c("Errors:", "ok")} ${c("0", "dim")}`]),
  ];

  print(summary);
}
export function printCompressReport(result: CompressResult): void {
  const sections: ReportSection[] = [
    {
      title: "Changed files",
      lines: result.changed.map((c) => [
        `- ${c.path}`,
        `  ${(c.beforeBytes / 1024 / 1024).toFixed(2)}MB -> ${(c.afterBytes / 1024 / 1024).toFixed(2)}MB`,
      ]),
    },
    {
      title: "Skipped files",
      lines: result.skipped.map((s) => {
        const note = s.error ? `: ${s.error}` : "";
        return `- ${s.path} (${s.reason})${note}`;
      }),
    },
    {
      title: "Errors",
      lines: result.errors.map((e) => `- ${e.path}: ${e.error}`),
    },
  ];

  print(undefined, sections);
}
