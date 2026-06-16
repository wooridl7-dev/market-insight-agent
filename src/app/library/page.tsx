"use client";

import { useState } from "react";
import { Search, Play, Calendar, Tag, Filter } from "lucide-react";

const mockVideos = [
  { id: "1", title: "API 키를 등록하면 실제 영상 목록이 표시됩니다", date: "—", keywords: ["설정 필요"], chunks: 0 },
  { id: "2", title: "Settings 메뉴에서 YouTube API 키를 입력하세요", date: "—", keywords: ["가이드"], chunks: 0 },
];

export default function LibraryPage() {
  const [query, setQuery] = useState("");

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-black mb-1">RAG 라이브러리</h1>
        <p className="text-sm text-neutral-500">수집된 슈카월드 영상 전사 텍스트 검색</p>
      </div>

      <div className="flex gap-3 mb-8">
        <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl border border-neutral-200 bg-white focus-within:border-neutral-400 transition-colors">
          <Search className="w-4 h-4 text-neutral-400 shrink-0" />
          <input value={query} onChange={e => setQuery(e.target.value)}
            placeholder="종목명, 키워드, 날짜로 검색..." className="flex-1 text-sm outline-none text-neutral-800 placeholder:text-neutral-400" />
        </div>
        <button className="flex items-center gap-2 px-4 py-3 rounded-xl border border-neutral-200 text-sm text-neutral-600 hover:bg-neutral-50 transition-colors">
          <Filter className="w-4 h-4" />필터
        </button>
      </div>

      <div className="space-y-3">
        {mockVideos.map(video => (
          <div key={video.id} className="p-5 rounded-2xl border border-neutral-100 bg-white hover:border-neutral-200 hover:shadow-sm transition-all">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-medium text-black text-sm mb-2">{video.title}</h3>
                <div className="flex items-center gap-3 text-xs text-neutral-400">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{video.date}</span>
                  <span>{video.chunks} 청크</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {video.keywords.map(kw => (
                    <span key={kw} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-neutral-100 text-xs text-neutral-500">
                      <Tag className="w-2.5 h-2.5" />{kw}
                    </span>
                  ))}
                </div>
              </div>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black text-white text-xs hover:bg-neutral-800 transition-colors shrink-0">
                <Play className="w-3 h-3" />보기
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
