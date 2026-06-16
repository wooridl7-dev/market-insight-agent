import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  provider: z.enum(["openai", "elevenlabs"]),
  key: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const { provider, key } = schema.parse(await req.json());

    if (provider === "openai") {
      const res = await fetch("https://api.openai.com/v1/models", {
        headers: { Authorization: `Bearer ${key}` },
      });
      return NextResponse.json({ valid: res.ok });
    }

    if (provider === "elevenlabs") {
      const res = await fetch("https://api.elevenlabs.io/v1/user", {
        headers: { "xi-api-key": key },
      });
      return NextResponse.json({ valid: res.ok });
    }

    return NextResponse.json({ valid: false });
  } catch {
    return NextResponse.json({ valid: false });
  }
}
