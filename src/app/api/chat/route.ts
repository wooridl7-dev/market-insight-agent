import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  message: z.string().min(1).max(2000),
  sessionId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, sessionId } = schema.parse(body);

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API 키가 설정되지 않았습니다. Settings에서 등록해주세요." },
        { status: 503 }
      );
    }

    // RAG search
    const ragRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/rag/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: message, topK: 5 }),
    });
    const { chunks = [] } = ragRes.ok ? await ragRes.json() : {};

    // Build context from RAG chunks
    const context = chunks.length
      ? chunks
          .map((c: { title: string; text: string; date: string; startTime: string }) =>
            `[${c.title} | ${c.date} | ${c.startTime}]\n${c.text}`
          )
          .join("\n\n---\n\n")
      : "관련 영상 데이터가 없습니다. 수집 에이전트를 실행하거나 영상이 아직 없을 수 있습니다.";

    const OpenAI = (await import("openai")).default;
    const client = new OpenAI({ apiKey });

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `당신은 슈카월드 유튜브 채널의 경제 콘텐츠를 분석하여 주식·시장·거시경제 관련 정보를 제공하는 AI 에이전트입니다.

반드시 지켜야 할 원칙:
- 근거가 있는 내용만 답변하고 출처를 명시합니다.
- "무조건 사세요", "반드시 오릅니다" 같은 단정적 투자 지시를 절대 하지 않습니다.
- 모든 답변 마지막에 투자 판단은 사용자의 추가 검토가 필요하다고 명시합니다.
- 한국어로 답변합니다.

제공된 RAG 컨텍스트:
${context}`,
        },
        { role: "user", content: message },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });

    const answer = completion.choices[0].message.content || "";

    // Save conversation
    if (process.env.DATABASE_URL) {
      const { prisma } = await import("@/lib/prisma");
      const sid = sessionId || crypto.randomUUID();
      await prisma.agentConversation.createMany({
        data: [
          { sessionId: sid, role: "user", message },
          { sessionId: sid, role: "assistant", message: answer, citedChunks: chunks },
        ],
      });
    }

    return NextResponse.json({ answer, sources: chunks });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
    }
    console.error("[chat]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
