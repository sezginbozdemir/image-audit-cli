export type RunResult = {
  out: string;
  err: string;
};

export type IdentifyResult = {
  width: number;
  height: number;
  dateOriginal: string | null;
};

export type ScanConfig = {
  maxBytes: number;
  maxWidth: number | null;
  maxHeight: number | null;
  extensions: string[];
};

export type ScanOpts = {
  maxMb: string;
  maxW?: string;
  maxH?: string;
  extensions: string;
};
export type ScanResult = {
  total: number;
  tooBig: ImageInfo[];
  duplicates: DuplicateNameGroup[];
  dayGroups: ImagesByDay[];
  errors: FileError[];
};

export type ImageInfo = {
  path: string;
  name: string;
  bytes: number;
  width: number;
  height: number;
  date: string | null;
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
  extensions: string;
};

export type CompressOpts = {
  maxMb: string;
  quality: string;
  pngLevel: string;
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

export type DuplicateNameGroup = { name: string; paths: string[] };

export type ImagesByDay = { day: string; paths: string[] };

export type FileSkip = { path: string; reason: SkipReason; error?: string };

export type FileError = { path: string; error: string };

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
