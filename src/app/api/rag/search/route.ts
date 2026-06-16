import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  query: z.string().min(1),
  topK: z.number().min(1).max(20).default(5),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, topK } = schema.parse(body);

    if (!process.env.DATABASE_URL || !process.env.OPENAI_API_KEY) {
      return NextResponse.json({ chunks: [], total: 0 });
    }

    const { createEmbedding } = await import("@/lib/openai");
    const { prisma } = await import("@/lib/prisma");

    const embedding = await createEmbedding(query);
    const embStr = `[${embedding.join(",")}]`;

    const result = await prisma.$queryRawUnsafe<
      { id: string; text: string; summary: string | null; keywords: string[]; video_title: string; published_at: Date; start_time: string | null; url: string; similarity: number }[]
    >(`
      SELECT tc.id, tc.text, tc.summary, tc.keywords, tc.start_time,
             v.title as video_title, v.published_at, v.url,
             1 - (tc.embedding <=> '${embStr}'::vector) as similarity
      FROM transcript_chunks tc
      JOIN videos v ON v.id = tc.video_id
      ORDER BY similarity DESC
      LIMIT ${topK}
    `);

    type RawRow = { id: string; text: string; summary: string | null; keywords: string[]; video_title: string; published_at: Date; start_time: string | null; url: string; similarity: number };
    const chunks = result.map((r: RawRow) => ({
      id: r.id,
      text: r.text,
      summary: r.summary,
      keywords: r.keywords,
      title: r.video_title,
      date: new Date(r.published_at).toLocaleDateString("ko-KR"),
      startTime: r.start_time || "00:00:00",
      url: r.url,
      similarity: Number(r.similarity),
    }));

    return NextResponse.json({ chunks, total: chunks.length });
  } catch (err) {
    console.error("[rag/search]", err);
    return NextResponse.json({ chunks: [], total: 0 }, { status: 500 });
  }
}
