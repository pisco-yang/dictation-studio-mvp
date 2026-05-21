import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { v4 as uuid } from "uuid";
import { acceptedExtensions, acceptedMimeTypes, appConfig } from "@/lib/config";

export function sanitizeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
}

export function assertAcceptedUpload(file: File) {
  const extension = path.extname(file.name).toLowerCase();
  if (!acceptedExtensions.has(extension)) {
    throw new Error("Unsupported file type. Please upload mp3, wav, m4a, or mp4.");
  }

  if (file.type && !acceptedMimeTypes.has(file.type)) {
    throw new Error("Unsupported media MIME type.");
  }

  const maxBytes = appConfig.maxUploadMb * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error(`File is too large. Max upload size is ${appConfig.maxUploadMb} MB.`);
  }
}

export async function saveUploadedFile(file: File) {
  assertAcceptedUpload(file);
  await mkdir(appConfig.uploadDir, { recursive: true });

  const extension = path.extname(file.name).toLowerCase();
  const safeName = `${uuid()}-${sanitizeFilename(file.name || `upload${extension}`)}`;
  const filePath = path.join(appConfig.uploadDir, safeName);
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, bytes);

  return filePath;
}

export function isVideoPath(filePath: string) {
  return path.extname(filePath).toLowerCase() === ".mp4";
}

export function titleFromFilename(name: string) {
  const parsed = path.parse(name);
  return parsed.name.replace(/[_-]+/g, " ").trim() || "Untitled lesson";
}
