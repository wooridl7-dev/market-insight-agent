"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, Mic, Volume2, AlertCircle, ExternalLink, RotateCcw } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: { title: string; date: string; timestamp: string }[];
}

const SAMPLES = [
  "최근 슈카월드에서 반도체 관련해서 어떤 얘기가 나왔어?",
  "엔비디아에 대해 긍정적 내용과 부정적 내용을 나눠서 정리해줘.",
  "최근 금리 관련 영상에서 주식시장에 중요한 내용만 뽑아줘.",
  "코스피에 영향을 줄 만한 글로벌 이슈를 요약해줘.",
  "오늘 장 시작 전에 봐야 할 경제 이슈 알려줘.",
];

export default function AgentPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    setMessages(p => [...p, { role: "user", content: text }]);
    setInput("");
    setLoading(true);
    await new Promise(r => setTimeout(r, 1400));
    setMessages(p => [...p, {
      role: "assistant",
      content: "Settings 메뉴에서 OpenAI API 키를 등록하면 슈카월드 영상 기반 실제 답변이 생성됩니다. 현재는 데모 모드입니다.",
      sources: [],
    }]);
    setLoading(false);
  };

  return (
    <div className="h-[calc(100vh-64px)] flex bg-white">
      {/* Sidebar */}
      <div className="w-72 border-r border-neutral-100 flex flex-col p-4 gap-2">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-black">질문 예시</h2>
          <button onClick={() => setMessages([])} className="text-xs text-neutral-400 hover:text-black flex items-center gap-1 transition-colors">
            <RotateCcw className="w-3 h-3" />초기화
          </button>
        </div>
        {SAMPLES.map(q => (
          <button key={q} onClick={() => send(q)}
            className="text-left text-xs px-3 py-2.5 rounded-xl border border-neutral-100 hover:border-neutral-200 hover:bg-neutral-50 text-neutral-600 transition-all leading-relaxed">
            {q}
          </button>
        ))}
        <div className="mt-auto p-3 rounded-xl bg-amber-50 border border-amber-100">
          <p className="text-xs text-amber-700 leading-relaxed flex items-start gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            본 서비스는 투자자문이 아닌 정보 제공 도구입니다.
          </p>
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center gap-3">
          <div className="w-9 h-9 bg-black rounded-xl flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-sm text-black">Market Insight Agent</p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-xs text-neutral-400">슈카월드 RAG 연동 대기 중</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center">
                <Bot className="w-8 h-8 text-neutral-400" />
              </div>
              <div>
                <p className="font-semibold text-black mb-1">AI 에이전트에게 물어보세요</p>
                <p className="text-sm text-neutral-400">왼쪽 예시 질문을 클릭하거나 직접 입력하세요</p>
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[70%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-black text-white rounded-br-sm"
                  : "bg-neutral-50 border border-neutral-100 text-neutral-800 rounded-bl-sm"
              }`}>
                {msg.content}
                {msg.role === "assistant" && (
                  <p className="mt-3 pt-3 text-xs text-neutral-400 border-t border-neutral-200 flex items-start gap-1">
                    <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                    투자 판단은 사용자의 추가 검토가 필요합니다.
                  </p>
                )}
              </div>
            </motion.div>
          ))}

          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="bg-neutral-50 border border-neutral-100 rounded-2xl rounded-bl-sm px-5 py-3.5">
                <div className="flex gap-1.5 items-center">
                  <span className="text-xs text-neutral-400 mr-1">분석 중</span>
                  {[0,1,2].map(i => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full bg-neutral-300 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-6 py-4 border-t border-neutral-100">
          <div className="flex items-end gap-3 bg-neutral-50 rounded-2xl border border-neutral-200 px-4 py-3">
            <textarea value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }}}
              placeholder="시장·종목·거시경제에 대해 질문하세요..." rows={1}
              className="flex-1 bg-transparent text-sm resize-none outline-none text-neutral-800 placeholder:text-neutral-400 max-h-32" />
            <div className="flex items-center gap-2 shrink-0">
              <button className="w-8 h-8 rounded-lg hover:bg-neutral-200 flex items-center justify-center transition-colors">
                <Mic className="w-4 h-4 text-neutral-400" />
              </button>
              <button onClick={() => send(input)} disabled={!input.trim() || loading}
                className="w-8 h-8 rounded-lg bg-black disabled:bg-neutral-200 text-white flex items-center justify-center transition-colors">
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
