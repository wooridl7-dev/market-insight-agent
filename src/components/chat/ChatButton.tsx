"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, X, Send, Mic, MicOff, Volume2, ExternalLink, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: { title: string; date: string; timestamp: string; url: string }[];
}

const DISCLAIMER = "본 서비스는 투자 판단을 보조하기 위한 정보 제공 도구이며, 매수·매도 추천 또는 투자자문을 제공하지 않습니다.";

const SAMPLE_QUESTIONS = [
  "최근 반도체 관련 어떤 내용이 나왔어?",
  "엔비디아 긍정·부정 내용 정리해줘",
  "오늘 장 전에 봐야 할 이슈는?",
];

export default function ChatButton() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getStoredKeys = () => {
    try { return JSON.parse(localStorage.getItem("mia_api_keys") || "{}"); } catch { return {}; }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const storedKeys = getStoredKeys();
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(storedKeys.openai && { "x-openai-key": storedKeys.openai }),
        },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: data.answer || data.error || "응답을 받지 못했습니다.",
        sources: data.sources || [],
      }]);
    } catch {
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: "네트워크 오류가 발생했습니다. 다시 시도해주세요.",
        sources: [],
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-black text-white rounded-full shadow-2xl flex items-center justify-center relative"
          >
            <span className="absolute inset-0 rounded-full border-2 border-black/30 animate-pulse-ring" />
            <Bot className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-[420px] h-[600px] glass rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-black/8"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-black/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-black">Market Insight Agent</p>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-xs text-neutral-400">준비됨</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-neutral-100 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-neutral-400" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {messages.length === 0 && (
                <div className="space-y-4">
                  <p className="text-xs text-neutral-400 text-center pt-2">
                    슈카월드 영상 기반 경제 인사이트를 물어보세요
                  </p>
                  <div className="space-y-2">
                    {SAMPLE_QUESTIONS.map((q) => (
                      <button
                        key={q}
                        onClick={() => sendMessage(q)}
                        className="w-full text-left text-xs px-3 py-2.5 rounded-xl bg-neutral-50 hover:bg-neutral-100 text-neutral-600 border border-neutral-100 transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-black text-white rounded-br-sm"
                        : "bg-neutral-50 text-neutral-800 border border-neutral-100 rounded-bl-sm"
                    }`}
                  >
                    {msg.content}
                    {msg.role === "assistant" && (
                      <p className="mt-2 text-xs text-neutral-400 border-t border-neutral-200 pt-2 flex items-start gap-1">
                        <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                        {DISCLAIMER}
                      </p>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-neutral-50 border border-neutral-100 rounded-2xl rounded-bl-sm px-4 py-3">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-neutral-300 animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-4 border-t border-black/5">
              <div className="flex items-end gap-2 bg-neutral-50 rounded-xl border border-neutral-200 px-3 py-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage(input);
                    }
                  }}
                  placeholder="질문을 입력하세요..."
                  rows={1}
                  className="flex-1 bg-transparent text-sm resize-none outline-none text-neutral-800 placeholder:text-neutral-400 max-h-24"
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || loading}
                  className="w-7 h-7 rounded-lg bg-black disabled:bg-neutral-200 text-white flex items-center justify-center transition-colors shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
