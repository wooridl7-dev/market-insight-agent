"use client";

import { TrendingUp, TrendingDown, Minus, Clock, ExternalLink, RefreshCw } from "lucide-react";

const keywords = [
  { word: "반도체", count: 48, trend: "up" },
  { word: "금리", count: 37, trend: "down" },
  { word: "엔비디아", count: 29, trend: "up" },
  { word: "달러", count: 24, trend: "neutral" },
  { word: "코스피", count: 21, trend: "down" },
  { word: "AI", count: 19, trend: "up" },
];

const recentVideos = [
  { title: "아직 API 연동 전입니다", date: "—", views: "—" },
  { title: "Settings에서 API 키를 등록하세요", date: "—", views: "—" },
];

export default function BriefPage() {
  const now = new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric", weekday: "long" });

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <p className="text-xs text-neutral-400 mb-1">{now}</p>
          <h1 className="text-2xl font-bold text-black">오늘의 시장 브리프</h1>
          <p className="text-sm text-neutral-500 mt-1">슈카월드 최신 영상 기반 경제 키워드 요약</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-neutral-200 text-sm text-neutral-600 hover:bg-neutral-50 transition-colors">
          <RefreshCw className="w-4 h-4" />업데이트
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="col-span-2 p-6 rounded-2xl border border-neutral-100 bg-white">
          <h2 className="text-sm font-semibold text-black mb-4">주요 키워드</h2>
          <div className="flex flex-wrap gap-2">
            {keywords.map(({ word, count, trend }) => (
              <div key={word} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-50 border border-neutral-100">
                {trend === "up" && <TrendingUp className="w-3 h-3 text-emerald-500" />}
                {trend === "down" && <TrendingDown className="w-3 h-3 text-red-400" />}
                {trend === "neutral" && <Minus className="w-3 h-3 text-neutral-400" />}
                <span className="text-sm font-medium text-black">{word}</span>
                <span className="text-xs text-neutral-400">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-neutral-100 bg-white">
          <h2 className="text-sm font-semibold text-black mb-4">수집 현황</h2>
          <div className="space-y-3">
            {[["오늘 영상", "0개"], ["전체 영상", "0개"], ["마지막 수집", "미설정"]].map(([k, v]) => (
              <div key={k} className="flex justify-between items-center">
                <span className="text-xs text-neutral-400">{k}</span>
                <span className="text-xs font-medium text-black">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl border border-neutral-100 bg-white">
        <h2 className="text-sm font-semibold text-black mb-4">최근 분석 영상</h2>
        <div className="space-y-3">
          {recentVideos.map((v, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-neutral-50 last:border-0">
              <div>
                <p className="text-sm text-neutral-700">{v.title}</p>
                <p className="text-xs text-neutral-400 mt-0.5">{v.date}</p>
              </div>
              <span className="text-xs text-neutral-400">{v.views}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
