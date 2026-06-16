import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

interface SheetRow {
  [key: string]: string | number | boolean | null | undefined;
}

interface RagChunk {
  title: string;
  text: string;
  date: string;
  startTime: string;
  url: string;
  similarity: number;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const userPrompt = (formData.get("prompt") as string) || "이 데이터를 분석해줘";
    const sheetName = (formData.get("sheet") as string) || undefined;
    const clientKey = (formData.get("openaiKey") as string) || "";

    const apiKey = process.env.OPENAI_API_KEY || clientKey;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API 키가 설정되지 않았습니다. Settings 메뉴에서 등록해주세요." },
        { status: 503 }
      );
    }

    if (!file) {
      return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });
    }

    // Parse Excel
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const targetSheet = sheetName || workbook.SheetNames[0];
    const worksheet = workbook.Sheets[targetSheet];

    if (!worksheet) {
      return NextResponse.json({ error: `시트 '${targetSheet}'를 찾을 수 없습니다.` }, { status: 400 });
    }

    const rows: SheetRow[] = XLSX.utils.sheet_to_json(worksheet, { defval: null });
    const allSheets = workbook.SheetNames;

    if (rows.length === 0) {
      return NextResponse.json({ error: "시트에 데이터가 없습니다." }, { status: 400 });
    }

    // Extract column names and sample data for context
    const columns = Object.keys(rows[0]);
    const sampleRows = rows.slice(0, 5);
    const totalRows = rows.length;

    // Build summary of Excel content for RAG query
    const excelSummary = buildExcelSummary(rows, columns);

    // RAG search based on Excel content
    let ragChunks: RagChunk[] = [];
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
      const ragRes = await fetch(`${baseUrl}/api/rag/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: `${userPrompt} ${excelSummary}`, topK: 6 }),
      });
      if (ragRes.ok) {
        const data = await ragRes.json();
        ragChunks = data.chunks || [];
      }
    } catch {
      // RAG unavailable - proceed without it
    }

    const ragContext = ragChunks.length > 0
      ? ragChunks
          .map((c) => `[슈카월드 | ${c.title} | ${c.date} | ${c.startTime}]\n${c.text}`)
          .join("\n\n---\n\n")
      : "슈카월드 RAG 데이터가 아직 수집되지 않았습니다. 엑셀 데이터만으로 분석합니다.";

    // Build Excel data context
    const excelContext = JSON.stringify({ columns, totalRows, sampleRows, fullData: rows.slice(0, 100) }, null, 2);

    const systemPrompt = `당신은 주식·경제 데이터 분석 전문가입니다. 사용자가 업로드한 엑셀 데이터를 분석하고, 슈카월드 유튜브 콘텐츠의 경제 인사이트를 참고하여 종합적인 분석을 제공합니다.

분석 원칙:
- 엑셀 데이터의 수치와 패턴을 정확히 파악합니다.
- 슈카월드 RAG 데이터의 관련 발언·전망과 연결합니다.
- 투자 판단을 직접 지시하지 않고 인사이트와 맥락을 제공합니다.
- 한국어로 명확하고 구조화된 답변을 제공합니다.

슈카월드 RAG 컨텍스트:
${ragContext}

엑셀 데이터:
${excelContext}`;

    // Anthropic key from env or client form
    const anthropicKey = process.env.ANTHROPIC_API_KEY || (formData.get("anthropicKey") as string) || "";

    const analysis = await runWithFallback({
      openaiKey: apiKey,
      anthropicKey,
      systemPrompt,
      userPrompt,
    });

    return NextResponse.json({
      analysis,
      metadata: {
        fileName: file.name,
        sheet: targetSheet,
        allSheets,
        columns,
        totalRows,
        sampleRows: sampleRows.slice(0, 3),
        ragSourcesUsed: ragChunks.length,
        ragSources: ragChunks.map((c) => ({
          title: c.title,
          date: c.date,
          startTime: c.startTime,
          url: c.url,
          similarity: c.similarity,
        })),
      },
    });
  } catch (err: unknown) {
    console.error("[analyze]", err);
    const status = (err as { status?: number }).status;
    const message = (err as { message?: string }).message || "";

    if (status === 429 || message.includes("429")) {
      return NextResponse.json(
        { error: "OpenAI API 요청 한도를 초과했습니다. 잠시 후 다시 시도하거나 OpenAI 계정의 크레딧을 확인해주세요." },
        { status: 429 }
      );
    }
    if (status === 401 || message.includes("401") || message.includes("Incorrect API key")) {
      return NextResponse.json(
        { error: "OpenAI API 키가 유효하지 않습니다. Settings에서 키를 다시 확인해주세요." },
        { status: 401 }
      );
    }
    if (status === 403 || message.includes("403")) {
      return NextResponse.json(
        { error: "OpenAI API 접근 권한이 없습니다. 계정 플랜 또는 키 권한을 확인해주세요." },
        { status: 403 }
      );
    }
    return NextResponse.json({ error: `분석 중 오류가 발생했습니다: ${message || "알 수 없는 오류"}` }, { status: 500 });
  }
}

// Model cascade: gpt-4o → gpt-4o-mini → gpt-3.5-turbo → claude-sonnet-4-5 → claude-haiku-4-5
async function runWithFallback({
  openaiKey,
  anthropicKey,
  systemPrompt,
  userPrompt,
}: {
  openaiKey: string;
  anthropicKey: string;
  systemPrompt: string;
  userPrompt: string;
}): Promise<string> {
  const isRateLimit = (err: unknown) => {
    const e = err as { status?: number; message?: string };
    return e.status === 429 || e.status === 403 || (e.message || "").includes("429");
  };

  // OpenAI cascade
  if (openaiKey) {
    const OpenAI = (await import("openai")).default;
    const client = new OpenAI({ apiKey: openaiKey });
    const openaiModels = ["gpt-4o", "gpt-4o-mini", "gpt-3.5-turbo"];

    for (const model of openaiModels) {
      try {
        const res = await client.chat.completions.create({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.3,
          max_tokens: 2000,
        });
        return res.choices[0].message.content || "";
      } catch (err) {
        if (isRateLimit(err)) continue; // try next model
        throw err;
      }
    }
  }

  // Claude fallback
  if (anthropicKey) {
    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const client = new Anthropic({ apiKey: anthropicKey });
    const claudeModels = ["claude-sonnet-4-5", "claude-haiku-4-5-20251001"];

    for (const model of claudeModels) {
      try {
        const res = await client.messages.create({
          model,
          max_tokens: 2000,
          system: systemPrompt,
          messages: [{ role: "user", content: userPrompt }],
        });
        const block = res.content[0];
        return block.type === "text" ? block.text : "";
      } catch (err) {
        if (isRateLimit(err)) continue;
        throw err;
      }
    }
  }

  throw Object.assign(
    new Error("모든 AI 모델에서 요청 한도를 초과했습니다. OpenAI 또는 Anthropic 크레딧을 확인해주세요."),
    { status: 429 }
  );
}

function buildExcelSummary(rows: SheetRow[], columns: string[]): string {
  // Extract ticker/stock names and numeric columns for RAG query
  const textValues: string[] = [];

  columns.forEach((col) => {
    const colLower = col.toLowerCase();
    if (
      colLower.includes("종목") ||
      colLower.includes("ticker") ||
      colLower.includes("stock") ||
      colLower.includes("company") ||
      colLower.includes("기업") ||
      colLower.includes("섹터") ||
      colLower.includes("sector")
    ) {
      rows.slice(0, 20).forEach((row) => {
        const val = row[col];
        if (val && typeof val === "string") textValues.push(val);
      });
    }
  });

  return textValues.slice(0, 10).join(" ") || columns.join(" ");
}
