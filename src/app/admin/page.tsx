"use client";

import { useState } from "react";
import { Play, RefreshCw, CheckCircle, XCircle, Clock, Database, AlertCircle, BarChart3 } from "lucide-react";

const logs = [
  { id: 1, status: "success", started: "—", videos: 0, chunks: 0, error: null },
];

export default function AdminPage() {
  const [running, setRunning] = useState(false);

  const runCollect = async () => {
    setRunning(true);
    await new Promise(r => setTimeout(r, 2000));
    setRunning(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-black mb-1">Admin</h1>
        <p className="text-sm text-neutral-500">수집 에이전트 및 RAG 관리</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { icon: Database, label: "RAG 인덱스 상태", value: "미초기화", color: "text-amber-500" },
          { icon: BarChart3, label: "전체 청크 수", value: "0개" },
          { icon: Clock, label: "마지막 수집", value: "미실행" },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="p-5 rounded-2xl border border-neutral-100 bg-white">
            <div className="flex items-center gap-2 mb-3">
              <Icon className={`w-4 h-4 ${color || "text-neutral-500"}`} />
              <span className="text-xs text-neutral-400">{label}</span>
            </div>
            <p className={`text-lg font-bold ${color || "text-black"}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Collection Control */}
      <div className="p-6 rounded-2xl border border-neutral-100 bg-white mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-black">YouTube 수집 에이전트</h2>
            <p className="text-xs text-neutral-400 mt-0.5">채널: @syukaworld · 매일 04:00 자동 실행</p>
          </div>
          <button onClick={runCollect} disabled={running}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl text-sm font-medium hover:bg-neutral-800 disabled:bg-neutral-300 transition-colors">
            {running ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {running ? "수집 중..." : "수동 실행"}
          </button>
        </div>

        {running && (
          <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-100">
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <RefreshCw className="w-4 h-4 animate-spin" />
              슈카월드 채널 영상 목록 확인 중...
            </div>
          </div>
        )}
      </div>

      {/* Logs */}
      <div className="p-6 rounded-2xl border border-neutral-100 bg-white">
        <h2 className="text-sm font-semibold text-black mb-4">수집 로그</h2>
        <div className="space-y-2">
          {logs.map(log => (
            <div key={log.id} className="flex items-center gap-4 py-3 border-b border-neutral-50 last:border-0">
              {log.status === "success"
                ? <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                : <XCircle className="w-4 h-4 text-red-400 shrink-0" />}
              <span className="text-xs text-neutral-400 w-32 shrink-0">{log.started}</span>
              <span className="text-xs text-neutral-600">영상 {log.videos}개 · 청크 {log.chunks}개</span>
              {log.error && <span className="text-xs text-red-400 ml-auto">{log.error}</span>}
            </div>
          ))}
        </div>
        <p className="text-xs text-neutral-400 text-center mt-4">
          API 키 등록 후 첫 수집을 실행하면 로그가 기록됩니다.
        </p>
      </div>
    </div>
  );
}
