"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { TrendingUp, Database, Bot, Clock, ArrowRight, Zap, Shield, BarChart3 } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const } }),
};

const stats = [
  { label: "오늘 수집된 영상", value: "0", unit: "개", icon: TrendingUp },
  { label: "전체 분석 영상", value: "0", unit: "개", icon: Database },
  { label: "주요 키워드", value: "—", unit: "", icon: BarChart3 },
  { label: "최근 업데이트", value: "—", unit: "", icon: Clock },
];

const features = [
  { icon: Database, title: "슈카월드 전체 분석", desc: "2,200여 개 영상의 전사 텍스트를 벡터 DB에 저장하고 실시간 검색이 가능합니다." },
  { icon: Bot, title: "오케스트레이션 에이전트", desc: "질문 의도를 분석하고 관련 콘텐츠를 검색해 근거 기반 인사이트를 제공합니다." },
  { icon: Zap, title: "매일 자동 업데이트", desc: "새벽 4시 자동 수집으로 슈카월드 신규 영상을 당일 반영합니다." },
  { icon: Shield, title: "투자 안전장치", desc: "매수·매도 지시 없이 근거와 맥락 중심의 정보만 제공합니다." },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white overflow-hidden">
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-neutral-100/80 to-transparent rounded-full blur-3xl" />
      </div>

      <section className="max-w-7xl mx-auto px-6 pt-24 pb-20">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div custom={0} variants={fadeUp} initial="hidden" animate="show"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-neutral-200 bg-neutral-50 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-xs text-neutral-500 font-medium">슈카월드 × AI 에이전트</span>
          </motion.div>

          <motion.h1 custom={1} variants={fadeUp} initial="hidden" animate="show"
            className="text-5xl font-bold tracking-tight text-black leading-tight mb-6">
            경제 유튜브 콘텐츠를<br />
            <span className="text-neutral-400">투자 인사이트로</span> 바꾸는<br />
            AI 에이전트
          </motion.h1>

          <motion.p custom={2} variants={fadeUp} initial="hidden" animate="show"
            className="text-lg text-neutral-500 leading-relaxed mb-10">
            슈카월드 영상 전체를 분석해 시장 흐름, 산업 이슈,<br />
            종목 관련 맥락을 대화형으로 제공합니다.
          </motion.p>

          <motion.div custom={3} variants={fadeUp} initial="hidden" animate="show"
            className="flex items-center justify-center gap-3">
            <Link href="/agent" className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl font-medium text-sm hover:bg-neutral-800 transition-colors">
              <Bot className="w-4 h-4" />AI에게 묻기
            </Link>
            <Link href="/brief" className="flex items-center gap-2 px-6 py-3 bg-neutral-50 text-black rounded-xl font-medium text-sm border border-neutral-200 hover:bg-neutral-100 transition-colors">
              오늘의 시장 브리프<ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>

        <motion.div custom={4} variants={fadeUp} initial="hidden" animate="show"
          className="grid grid-cols-4 gap-4 mt-20">
          {stats.map(({ label, value, unit, icon: Icon }) => (
            <div key={label} className="rounded-2xl p-5 border border-neutral-100 bg-neutral-50/50">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-white border border-neutral-100 flex items-center justify-center">
                  <Icon className="w-3.5 h-3.5 text-neutral-500" />
                </div>
                <span className="text-xs text-neutral-400">{label}</span>
              </div>
              <p className="text-2xl font-bold text-black">{value}<span className="text-sm font-normal text-neutral-400 ml-1">{unit}</span></p>
            </div>
          ))}
        </motion.div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-black mb-2">핵심 기능</h2>
          <p className="text-neutral-400 text-sm">정보 수집부터 대화형 분석까지 자동화된 파이프라인</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {features.map(({ icon: Icon, title, desc }, i) => (
            <motion.div key={title} custom={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
              className="p-6 rounded-2xl border border-neutral-100 hover:border-neutral-200 bg-white hover:shadow-sm transition-all">
              <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-black mb-2">{title}</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="border-t border-neutral-100 py-6">
        <p className="text-center text-xs text-neutral-400 max-w-xl mx-auto px-6">
          본 서비스는 투자 판단을 보조하기 위한 정보 제공 도구이며, 매수·매도 추천 또는 투자자문을 제공하지 않습니다.
        </p>
      </div>
    </div>
  );
}
