import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { v4 as uuid } from "uuid";
import { appConfig } from "@/lib/config";
import { isVideoPath } from "@/lib/files";

function runCommand(command: string, args: string[]) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stderr = "";

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} exited with code ${code}: ${stderr}`));
      }
    });
  });
}

export async function ensureAudioFile(inputPath: string) {
  if (!isVideoPath(inputPath)) {
    return inputPath;
  }

  await mkdir(appConfig.audioDir, { recursive: true });
  const outputPath = path.join(appConfig.audioDir, `${uuid()}.mp3`);
  await runCommand(appConfig.ffmpegPath, [
    "-y",
    "-i",
    inputPath,
    "-vn",
    "-acodec",
    "libmp3lame",
    "-ar",
    "44100",
    "-ac",
    "2",
    outputPath
  ]);

  return outputPath;
}

export async function getAudioDurationSeconds(audioPath: string) {
  return new Promise<number>((resolve) => {
    const child = spawn(appConfig.ffprobePath, [
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "default=noprint_wrappers=1:nokey=1",
      audioPath
    ]);
    let stdout = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.on("close", () => {
      const duration = Number.parseFloat(stdout.trim());
      resolve(Number.isFinite(duration) && duration > 0 ? duration : 0);
    });

    child.on("error", () => resolve(0));
  });
}
