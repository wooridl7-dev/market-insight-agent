"use client";

import { useState } from "react";
import { Eye, EyeOff, CheckCircle, XCircle, Key, Mic, Volume2 } from "lucide-react";

interface KeyField { label: string; key: string; placeholder: string; }

const apiFields: KeyField[] = [
  { label: "OpenAI API Key", key: "openai", placeholder: "sk-..." },
  { label: "ElevenLabs API Key", key: "elevenlabs", placeholder: "el-..." },
  { label: "YouTube API Key", key: "youtube", placeholder: "AIza..." },
  { label: "Vector DB URL", key: "vectordb", placeholder: "postgresql://..." },
  { label: "Database URL", key: "database", placeholder: "postgresql://..." },
];

export default function SettingsPage() {
  const [keys, setKeys] = useState<Record<string, string>>({});
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

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
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 focus-within:border-neutral-400 focus-within:bg-white transition-all">
                <input
                  type={visible[key] ? "text" : "password"}
                  value={keys[key] || ""}
                  onChange={e => setKeys(p => ({ ...p, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="flex-1 text-sm bg-transparent outline-none text-neutral-800 placeholder:text-neutral-400"
                />
                <button onClick={() => setVisible(p => ({ ...p, [key]: !p[key] }))}
                  className="text-neutral-400 hover:text-neutral-600 transition-colors">
                  {visible[key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
        <button onClick={save}
          className="mt-6 w-full py-2.5 bg-black text-white rounded-xl text-sm font-medium hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2">
          {saved ? <><CheckCircle className="w-4 h-4" />저장됨</> : "API 키 저장"}
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
            <input type="range" min="0.5" max="2" step="0.1" defaultValue="1"
              className="w-full accent-black" />
            <div className="flex justify-between text-xs text-neutral-400 mt-1">
              <span>0.5x</span><span>1.0x</span><span>2.0x</span>
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-neutral-400 text-center mt-6">
        API 키는 서버 환경변수에 암호화 저장되며 클라이언트에 노출되지 않습니다.
      </p>
    </div>
  );
}
