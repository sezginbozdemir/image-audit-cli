import { execFile, ExecFileOptions } from "node:child_process";
import { RunResult } from "../lib/types.js";
import { promisify } from "node:util";

const exec = promisify(execFile);
const execOpts: ExecFileOptions = {
  windowsHide: true,
  timeout: 60_000,
  maxBuffer: 10 * 1024 * 1024,
  encoding: "utf8",
};

export async function runExec(cmd: string, args: string[]): Promise<RunResult> {
  try {
    const { stdout, stderr } = await exec(cmd, args, execOpts);

    return { out: String(stdout), err: String(stderr) };
  } catch (e: any) {
    throw new Error(e.stderr || `Command failed: ${cmd} ${args}`);
  }
}
