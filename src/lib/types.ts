export type RunResult = {
  out: string;
  err: string;
};

export type IdentifyResult = {
  width: number;
  height: number;
  dateOriginal: string | null;
};
export type GroupType = "duplicate-name" | "day" | "similiar" | "all";
export type ScanConfig = {
  maxBytes: number;
  group: GroupType | null;
  extensions: string[];
  yes: boolean;
};

export type ScanOpts = {
  maxMb?: string;
  group: GroupType;
  extensions: string;
  yes: boolean;
};
export type ScanResult = {
  total: number;
  oversized: ImageInfo[];
  duplicates: FileGroup[];
  dayGroups: FileGroup[];
  similiars: FileGroup[];
  errors: FileError[];
};

export type ImageInfo = {
  path: string;
  name: string;
  bytes: number;
  mTime: number;
  width: number | null;
  height: number | null;
  date: string | null;
  phash: string | null;
};

export type CompressTask = {
  input: string;
  output: string;
  ext: string;
  jpgQuality: number;
  pngLevel: number;
};

export type CompressConfig = {
  maxMb: number;
  quality: number;
  pngLevel: number;
  dryRun: boolean;
  yes: boolean;
};

export type CompressOpts = {
  maxMb: string;
  quality: string;
  level: string;
  dryRun: boolean;
  yes: boolean;
  extensions: string;
};
export type CompressResult = {
  candidates: number;
  compressed: number;
  skipped: FileSkip[];
  changed: FileChange[];
  errors: FileError[];
};

export type FileSkip = { path: string; reason: SkipReason; error?: string };

export type FileError = { path: string; error: string };

export type FileGroup = { name: string; paths: string[] };

export type FileChange = {
  path: string;
  beforeBytes: number;
  afterBytes: number;
};

export type SkipReason = "dry-run" | "not-smaller" | "error" | "canceled";

export type ReportSection = {
  title: string;
  lines: (string | string[])[];
};
export type MoveResult = {
  moved: { from: string; to: string }[];
  failed: { from: string; to: string; err: any }[];
};
