"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, CheckCircle, AlertCircle, Key, Volume2, Loader2, TestTube } from "lucide-react";

interface KeyField { label: string; key: string; placeholder: string; }

const apiFields: KeyField[] = [
  { label: "OpenAI API Key", key: "openai", placeholder: "sk-..." },
  { label: "ElevenLabs API Key", key: "elevenlabs", placeholder: "el-..." },
  { label: "YouTube API Key", key: "youtube", placeholder: "AIza..." },
  { label: "Database URL", key: "database", placeholder: "postgresql://..." },
];

const STORAGE_KEY = "mia_api_keys";

export default function SettingsPage() {
  const [keys, setKeys] = useState<Record<string, string>>({});
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [testing, setTesting] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, boolean | null>>({});

  // Load saved keys from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setKeys(JSON.parse(stored));
    } catch {}
  }, []);

  const save = async () => {
    setSaving(true);
    setStatus("idle");
    setErrorMsg("");

    try {
      // Save to localStorage first (always works)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));

      // Also try server-side save (requires DB)
      const res = await fetch("/api/settings/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(keys),
      });

      if (!res.ok) {
        const data = await res.json();
        // Server save failed but localStorage worked — still usable
        if (res.status === 503) {
          setStatus("success"); // localStorage saved, DB not connected yet
        } else {
          throw new Error(data.error || "저장 실패");
        }
      } else {
        setStatus("success");
      }
    } catch (err) {
      // If server unreachable but localStorage worked, treat as partial success
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMsg(err instanceof Error ? err.message : "저장 중 오류 발생");
      }
    } finally {
      setSaving(false);
      if (status !== "error") setTimeout(() => setStatus("idle"), 3000);
    }
  };

  const testKey = async (provider: string) => {
    const key = keys[provider];
    if (!key) return;
    setTesting(provider);
    setTestResults(p => ({ ...p, [provider]: null }));

    try {
      const res = await fetch("/api/settings/test-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, key }),
      });
      const data = await res.json();
      setTestResults(p => ({ ...p, [provider]: data.valid }));
    } catch {
      setTestResults(p => ({ ...p, [provider]: false }));
    } finally {
      setTesting(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-black mb-1">Settings</h1>
        <p className="text-sm text-neutral-500">API 키 및 서비스 설정</p>
      </div>

      {/* API Keys */}
      <div className="p-6 rounded-2xl border border-neutral-100 bg-white mb-6">
        <div className="flex items-center gap-2 mb-6">
          <Key className="w-4 h-4 text-neutral-500" />
          <h2 className="text-sm font-semibold text-black">API 키 관리</h2>
        </div>

        <div className="space-y-4">
          {apiFields.map(({ label, key, placeholder }) => (
            <div key={key}>
              <label className="text-xs font-medium text-neutral-500 mb-1.5 block">{label}</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 focus-within:border-neutral-400 focus-within:bg-white transition-all">
                  <input
                    type={visible[key] ? "text" : "password"}
                    value={keys[key] || ""}
                    onChange={e => setKeys(p => ({ ...p, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="flex-1 text-sm bg-transparent outline-none text-neutral-800 placeholder:text-neutral-400"
                  />
                  <button
                    onClick={() => setVisible(p => ({ ...p, [key]: !p[key] }))}
                    className="text-neutral-400 hover:text-neutral-600 transition-colors shrink-0"
                  >
                    {visible[key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  {testResults[key] === true && <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />}
                  {testResults[key] === false && <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />}
                </div>
                {(key === "openai" || key === "elevenlabs") && keys[key] && (
                  <button
                    onClick={() => testKey(key)}
                    disabled={testing === key}
                    className="px-3 py-2.5 rounded-xl border border-neutral-200 text-xs text-neutral-500 hover:border-neutral-400 hover:text-black transition-all flex items-center gap-1.5 shrink-0"
                  >
                    {testing === key
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : <TestTube className="w-3.5 h-3.5" />}
                    테스트
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {status === "error" && (
          <div className="mt-4 flex items-start gap-2 px-3 py-2.5 rounded-xl bg-red-50 border border-red-100">
            <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
            <p className="text-xs text-red-600">{errorMsg}</p>
          </div>
        )}

        <button
          onClick={save}
          disabled={saving}
          className="mt-6 w-full py-2.5 bg-black text-white rounded-xl text-sm font-medium hover:bg-neutral-800 disabled:bg-neutral-300 transition-colors flex items-center justify-center gap-2"
        >
          {saving ? (
            <><Loader2 className="w-4 h-4 animate-spin" />저장 중...</>
          ) : status === "success" ? (
            <><CheckCircle className="w-4 h-4" />저장됨</>
          ) : (
            "API 키 저장"
          )}
        </button>
      </div>

      {/* Voice Settings */}
      <div className="p-6 rounded-2xl border border-neutral-100 bg-white">
        <div className="flex items-center gap-2 mb-6">
          <Volume2 className="w-4 h-4 text-neutral-500" />
          <h2 className="text-sm font-semibold text-black">음성 설정</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-neutral-500 mb-1.5 block">기본 TTS 음성</label>
            <select className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 text-sm text-neutral-700 outline-none">
              <option>남성 1 (기본)</option>
              <option>여성 1</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-neutral-500 mb-1.5 block">음성 재생 속도</label>
            <input type="range" min="0.5" max="2" step="0.1" defaultValue="1" className="w-full accent-black" />
            <div className="flex justify-between text-xs text-neutral-400 mt-1">
              <span>0.5x</span><span>1.0x</span><span>2.0x</span>
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-neutral-400 text-center mt-6">
        API 키는 브라우저 로컬스토리지에 저장되며, DB 연결 시 서버에도 암호화 저장됩니다.
      </p>
    </div>
  );
}
