import {
  CompressConfig,
  CompressOpts,
  ScanConfig,
  ScanOpts,
} from "../../lib/types.js";

export function scanConfigFromOpts(opts: ScanOpts | CompressOpts): ScanConfig {
  const exts = String(opts.extensions)
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const mb = opts.maxMb || 2;

  return {
    maxBytes: Math.round(Number(mb) * 1024 * 1024),
    group: "group" in opts ? (opts.group ?? null) : null,
    extensions: exts,
    yes: opts.yes,
  };
}

export function normalizeCompressOpts(opts: CompressOpts): CompressConfig {
  return {
    maxMb: Math.round(Number(opts.maxMb) * 1024 * 1024),
    quality: Number(opts.quality),
    pngLevel: Number(opts.level),
    dryRun: opts.dryRun,
    yes: opts.yes,
  };
}
