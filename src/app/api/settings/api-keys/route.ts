import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  openai: z.string().optional(),
  elevenlabs: z.string().optional(),
  youtube: z.string().optional(),
  vectordb: z.string().optional(),
  database: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const keys = schema.parse(body);

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "DB가 연결되지 않아 저장할 수 없습니다." }, { status: 503 });
    }

    const { prisma } = await import("@/lib/prisma");
    const { encrypt } = await import("@/lib/crypto");

    const providers = Object.entries(keys).filter(([, v]) => v);
    await Promise.all(
      providers.map(([provider, value]) =>
        prisma.apiKey.upsert({
          where: { provider },
          create: { provider, encKey: encrypt(value!) },
          update: { encKey: encrypt(value!), isActive: true },
        })
      )
    );

    return NextResponse.json({ saved: providers.map(([p]) => p) });
  } catch (err) {
    console.error("[api-keys]", err);
    return NextResponse.json({ error: "저장 실패" }, { status: 500 });
  }
}

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ providers: [] });
  }
  const { prisma } = await import("@/lib/prisma");
  const keys = await prisma.apiKey.findMany({ select: { provider: true, isActive: true, updatedAt: true } });
  return NextResponse.json({ providers: keys });
}
