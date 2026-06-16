import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  text: z.string().min(1).max(5000),
  voiceId: z.string().default("21m00Tcm4TlvDq8ikWAM"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, voiceId } = schema.parse(body);

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "ElevenLabs API 키가 설정되지 않았습니다." }, { status: 503 });
    }

    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ text, model_id: "eleven_multilingual_v2", voice_settings: { stability: 0.5, similarity_boost: 0.75 } }),
    });

    if (!res.ok) throw new Error(`ElevenLabs error: ${res.status}`);

    const audio = await res.arrayBuffer();
    return new NextResponse(audio, { headers: { "Content-Type": "audio/mpeg" } });
  } catch (err) {
    console.error("[tts]", err);
    return NextResponse.json({ error: "TTS 변환 실패" }, { status: 500 });
  }
}
