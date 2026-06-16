import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "ElevenLabs API 키가 설정되지 않았습니다." }, { status: 503 });
    }

    const formData = await req.formData();
    const audio = formData.get("audio") as File;
    if (!audio) return NextResponse.json({ error: "오디오 파일이 없습니다." }, { status: 400 });

    const elForm = new FormData();
    elForm.append("audio", audio);
    elForm.append("model_id", "scribe_v1");

    const res = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
      method: "POST",
      headers: { "xi-api-key": apiKey },
      body: elForm,
    });

    if (!res.ok) throw new Error(`ElevenLabs STT error: ${res.status}`);
    const data = await res.json();
    return NextResponse.json({ text: data.text });
  } catch (err) {
    console.error("[stt]", err);
    return NextResponse.json({ error: "STT 변환 실패" }, { status: 500 });
  }
}
