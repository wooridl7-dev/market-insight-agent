"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, FileSpreadsheet, Loader2, AlertCircle, CheckCircle,
  ExternalLink, ChevronDown, ChevronUp, Sparkles, X, Send, RotateCcw,
} from "lucide-react";

interface RagSource {
  title: string;
  date: string;
  startTime: string;
  url: string;
  similarity: number;
}

interface Metadata {
  fileName: string;
  sheet: string;
  allSheets: string[];
  columns: string[];
  totalRows: number;
  sampleRows: Record<string, string | number | null>[];
  ragSourcesUsed: number;
  ragSources: RagSource[];
}

interface AnalysisResult {
  analysis: string;
  metadata: Metadata;
}

const SAMPLE_PROMPTS = [
  "이 데이터에서 주목할 종목과 위험 요인을 분석해줘",
  "슈카월드 영상 내용과 연결해서 시장 맥락을 설명해줘",
  "수익률 상위 종목의 공통점과 최근 뉴스 연관성을 찾아줘",
  "포트폴리오 리밸런싱 관점에서 데이터를 분석해줘",
];

export default function AnalyzePage() {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSources, setShowSources] = useState(false);
  const [showData, setShowData] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    const validTypes = [".xlsx", ".xls", ".csv"];
    if (dropped && validTypes.some((t) => dropped.name.endsWith(t))) {
      setFile(dropped);
      setResult(null);
      setError(null);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { setFile(f); setResult(null); setError(null); }
  };

  const analyze = async (customPrompt?: string) => {
    if (!file) return;
    const finalPrompt = customPrompt || prompt || "이 데이터를 종합적으로 분석해줘";
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const storedKeys = (() => { try { return JSON.parse(localStorage.getItem("mia_api_keys") || "{}"); } catch { return {}; } })();
      const form = new FormData();
      form.append("file", file);
      form.append("prompt", finalPrompt);
      if (storedKeys.openai) form.append("openaiKey", storedKeys.openai);
      if (storedKeys.anthropic) form.append("anthropicKey", storedKeys.anthropic);

      const res = await fetch("/api/analyze", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "분석 실패");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setFile(null); setResult(null); setError(null); setPrompt(""); };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs font-medium text-neutral-500 bg-neutral-100 px-2 py-1 rounded-full">
              Excel × RAG 분석
            </span>
          </div>
          <h1 className="text-2xl font-bold text-black mb-1">엑셀 데이터 분석</h1>
          <p className="text-sm text-neutral-500">
            엑셀 파일을 업로드하면 슈카월드 영상 인사이트를 참고하여 AI가 종합 분석합니다.
          </p>
        </div>

        {/* Upload Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => !file && fileInputRef.current?.click()}
          className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 mb-6 ${
            file
              ? "border-neutral-200 bg-neutral-50 cursor-default"
              : dragOver
              ? "border-black bg-neutral-50 cursor-copy"
              : "border-neutral-200 hover:border-neutral-400 cursor-pointer hover:bg-neutral-50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            className="hidden"
          />
          {file ? (
            <div className="flex items-center justify-between px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-black">{file.name}</p>
                  <p className="text-xs text-neutral-400">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); reset(); }}
                className="w-7 h-7 rounded-lg hover:bg-neutral-200 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-neutral-400" />
              </button>
            </div>
          ) : (
            <div className="py-14 flex flex-col items-center gap-3 text-center px-6">
              <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center">
                <Upload className="w-5 h-5 text-neutral-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-black mb-1">
                  엑셀 파일을 드래그하거나 클릭하여 업로드
                </p>
                <p className="text-xs text-neutral-400">.xlsx · .xls · .csv 지원</p>
              </div>
            </div>
          )}
        </div>

        {/* Prompt Input */}
        <AnimatePresence>
          {file && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 space-y-3"
            >
              <div className="flex items-end gap-2 px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50 focus-within:border-neutral-400 focus-within:bg-white transition-all">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); analyze(); }
                  }}
                  placeholder="분석 질문을 입력하세요 (비워두면 종합 분석)..."
                  rows={2}
                  className="flex-1 bg-transparent text-sm resize-none outline-none text-neutral-800 placeholder:text-neutral-400"
                />
                <button
                  onClick={() => analyze()}
                  disabled={loading}
                  className="w-8 h-8 rounded-lg bg-black disabled:bg-neutral-200 text-white flex items-center justify-center transition-colors shrink-0"
                >
                  {loading
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : <Send className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => analyze(p)}
                    disabled={loading}
                    className="text-xs px-3 py-1.5 rounded-full border border-neutral-200 text-neutral-500 hover:border-neutral-400 hover:text-black transition-all disabled:opacity-40"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="rounded-2xl border border-neutral-100 bg-neutral-50 p-10 flex flex-col items-center gap-4 mb-6"
            >
              <div className="w-10 h-10 rounded-2xl bg-black flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-black mb-1">분석 중...</p>
                <p className="text-xs text-neutral-400">슈카월드 RAG 검색 → GPT-4o 종합 분석</p>
              </div>
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-neutral-300 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        {error && (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-5 flex items-start gap-3 mb-6">
            <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {/* Metadata bar */}
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-100 flex-wrap">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="text-xs font-medium text-black">{result.metadata.fileName}</span>
                <span className="text-xs text-neutral-400">시트: {result.metadata.sheet}</span>
                <span className="text-xs text-neutral-400">{result.metadata.totalRows.toLocaleString()}행 · {result.metadata.columns.length}열</span>
                {result.metadata.ragSourcesUsed > 0 && (
                  <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />슈카월드 {result.metadata.ragSourcesUsed}개 영상 참조
                  </span>
                )}
                <button onClick={() => analyze(prompt)} className="ml-auto">
                  <RotateCcw className="w-3.5 h-3.5 text-neutral-400 hover:text-black transition-colors" />
                </button>
              </div>

              {/* Analysis text */}
              <div className="rounded-2xl border border-neutral-100 bg-white p-7">
                <div className="flex items-center gap-2 mb-5">
                  <Sparkles className="w-4 h-4 text-black" />
                  <h2 className="text-sm font-semibold text-black">AI 분석 결과</h2>
                </div>
                <div className="text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap">
                  {result.analysis}
                </div>
                <p className="mt-5 pt-4 border-t border-neutral-100 text-xs text-neutral-400 flex items-start gap-1.5">
                  <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                  본 분석은 정보 제공 목적이며 투자 권유가 아닙니다. 투자 판단은 추가 검토 후 직접 결정하세요.
                </p>
              </div>

              {/* RAG Sources */}
              {result.metadata.ragSources.length > 0 && (
                <div className="rounded-2xl border border-neutral-100 bg-white overflow-hidden">
                  <button
                    onClick={() => setShowSources((v) => !v)}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-neutral-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-neutral-400" />
                      <span className="text-sm font-medium text-black">참조된 슈카월드 영상</span>
                      <span className="text-xs bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-full">
                        {result.metadata.ragSources.length}개
                      </span>
                    </div>
                    {showSources
                      ? <ChevronUp className="w-4 h-4 text-neutral-400" />
                      : <ChevronDown className="w-4 h-4 text-neutral-400" />}
                  </button>
                  {showSources && (
                    <div className="border-t border-neutral-100 divide-y divide-neutral-50">
                      {result.metadata.ragSources.map((src, i) => (
                        <div key={i} className="px-5 py-3.5 flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm text-neutral-700 font-medium">{src.title}</p>
                            <p className="text-xs text-neutral-400 mt-0.5">{src.date} · {src.startTime}</p>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-xs text-neutral-400">
                              유사도 {(src.similarity * 100).toFixed(0)}%
                            </span>
                            <a
                              href={src.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-7 h-7 rounded-lg border border-neutral-200 flex items-center justify-center hover:bg-neutral-50 transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Data preview */}
              {result.metadata.sampleRows.length > 0 && (
                <div className="rounded-2xl border border-neutral-100 bg-white overflow-hidden">
                  <button
                    onClick={() => setShowData((v) => !v)}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-neutral-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-neutral-400" />
                      <span className="text-sm font-medium text-black">데이터 미리보기</span>
                      <span className="text-xs bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-full">
                        {result.metadata.totalRows}행 중 3행
                      </span>
                    </div>
                    {showData
                      ? <ChevronUp className="w-4 h-4 text-neutral-400" />
                      : <ChevronDown className="w-4 h-4 text-neutral-400" />}
                  </button>
                  {showData && (
                    <div className="border-t border-neutral-100 overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-neutral-50">
                            {result.metadata.columns.map((col) => (
                              <th key={col} className="px-4 py-2.5 text-left font-medium text-neutral-500 whitespace-nowrap border-b border-neutral-100">
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {result.metadata.sampleRows.map((row, i) => (
                            <tr key={i} className="border-b border-neutral-50 hover:bg-neutral-50">
                              {result.metadata.columns.map((col) => (
                                <td key={col} className="px-4 py-2.5 text-neutral-600 whitespace-nowrap">
                                  {row[col] !== null && row[col] !== undefined ? String(row[col]) : "—"}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
