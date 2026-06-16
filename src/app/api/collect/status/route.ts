import { NextResponse } from "next/server";

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ jobs: [], stats: { totalVideos: 0, totalChunks: 0, lastRun: null } });
  }
  const { prisma } = await import("@/lib/prisma");
  const [jobs, totalVideos, totalChunks] = await Promise.all([
    prisma.collectionJob.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
    prisma.video.count(),
    prisma.transcriptChunk.count(),
  ]);
  const lastRun = jobs[0]?.finishedAt ?? null;
  return NextResponse.json({ jobs, stats: { totalVideos, totalChunks, lastRun } });
}
