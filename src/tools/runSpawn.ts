import { spawn } from "node:child_process";
import type { RunResult } from "../lib/types.js";

type SpawnOpts = {
  timeoutMs?: number;
  maxBuffer?: number;
  encoding?: BufferEncoding;
};

export function runSpawn(
  cmd: string,
  args: string[],
  opts: SpawnOpts = {},
): Promise<RunResult> {
  const timeoutMs = opts.timeoutMs ?? 60_000;
  const maxBuffer = opts.maxBuffer ?? 10 * 1024 * 1024;
  const encoding = opts.encoding ?? "utf8";

  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    let stdoutBytes = 0;
    let stderrBytes = 0;

    const killTimer =
      timeoutMs > 0
        ? setTimeout(() => {
            child.kill("SIGKILL");
            reject(
              new Error(
                `Command timed out after ${timeoutMs}ms: ${cmd} ${args.join(" ")}`,
              ),
            );
          }, timeoutMs)
        : null;

    const onData = (which: "stdout" | "stderr") => (chunk: Buffer) => {
      if (which === "stdout") {
        stdoutBytes += chunk.length;
        if (stdoutBytes > maxBuffer) {
          child.kill("SIGKILL");
          reject(new Error(`stdout exceeded maxBuffer (${maxBuffer} bytes)`));
          return;
        }
        stdout += chunk.toString(encoding);
      } else {
        stderrBytes += chunk.length;
        if (stderrBytes > maxBuffer) {
          child.kill("SIGKILL");
          reject(new Error(`stderr exceeded maxBuffer (${maxBuffer} bytes)`));
          return;
        }
        stderr += chunk.toString(encoding);
      }
    };

    child.stdout?.on("data", onData("stdout"));
    child.stderr?.on("data", onData("stderr"));

    child.on("error", (err) => {
      if (killTimer) clearTimeout(killTimer);
      reject(err);
    });

    child.on("close", (code, signal) => {
      if (killTimer) clearTimeout(killTimer);

      if (code === 0) {
        resolve({ out: stdout, err: stderr });
      } else {
        reject(
          new Error(
            (stderr && stderr.trim()) ||
              `Command failed (${code ?? signal}): ${cmd} ${args.join(" ")}`,
          ),
        );
      }
    });
  });
}
