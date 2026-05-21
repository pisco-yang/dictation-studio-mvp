import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { Readable } from "node:stream";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lesson = await prisma.lesson.findUnique({ where: { id } });

  if (!lesson?.audioFilePath) {
    return NextResponse.json({ error: "Audio not found." }, { status: 404 });
  }

  const fileStat = await stat(lesson.audioFilePath);
  const stream = Readable.toWeb(createReadStream(lesson.audioFilePath));

  return new Response(stream as BodyInit, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Content-Length": String(fileStat.size),
      "Accept-Ranges": "bytes"
    }
  });
}
