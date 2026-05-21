import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    sentenceId?: string;
    typedText?: string;
    score?: number;
  };

  if (!body.sentenceId || typeof body.typedText !== "string" || typeof body.score !== "number") {
    return NextResponse.json({ error: "Invalid attempt payload." }, { status: 400 });
  }

  await prisma.attempt.create({
    data: {
      sentenceId: body.sentenceId,
      typedText: body.typedText,
      score: body.score
    }
  });

  return NextResponse.json({ ok: true });
}
