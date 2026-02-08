"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

export function TrendTicker() {
    const [trends, setTrends] = useState<string[]>([
        "🔥 데이터 불러오는 중...",
        "🚀 잠시만 기다려주세요..."
    ]);

    useEffect(() => {
        const fetchTrends = async () => {
            try {
                // Dynamic Import or simple fetch if it was an API route, but we have a Server Action.
                // However, we can't import server action directly into client component easily in all setups without 'use server' properly set up.
                // Let's assume standard Next.js Server Action usage.
                // If direct import fails often, we might use an API route, but actions are preferred in Next.js 14.
                // We need to import the action.
                const { getRealtimeTrends } = await import("@/app/actions");
                const data = await getRealtimeTrends();
                if (data && data.length > 0) {
                    const formattedDetails = data.map(item => `🔥 ${item.title} (${item.traffic}+)`);
                    setTrends(formattedDetails);
                }
            } catch (error) {
                console.error("Failed to load trends", error);
                // Fallback to static if fail
                setTrends([
                    "🔥 AI 디지털 교과서 도입 논란 (+450%)",
                    "🚀 갤럭시 S25 울트라 사전예약 (+200%)",
                    "💰 2025 최저임금 협상 (+85%)",
                    "📺 넷플릭스 오징어게임2 공개일 (+500%)",
                    "⚽ 아시안컵 대한민국 일정 (+320%)",
                    "🤖 생성형 AI 저작권 법안 (+150%)"
                ]);
            }
        };

        fetchTrends();
    }, []);

    // duplicate for seamless loop
    const marqueeItems = [...trends, ...trends, ...trends, ...trends];

    return (
        <div className="bg-gray-900 text-white overflow-hidden py-2 flex items-center relative z-40">
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-900 to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-900 to-transparent z-10" />

            <div className="flex-shrink-0 px-4 font-bold text-green-400 flex items-center gap-1 z-20 bg-gray-900 pr-6">
                <TrendingUp className="h-4 w-4" /> LIVE
            </div>

            <motion.div
                className="flex gap-8 whitespace-nowrap"
                animate={{ x: [0, -1000] }}
                transition={{
                    repeat: Infinity,
                    ease: "linear",
                    duration: Math.max(30, trends.length * 5) // Adjust speed based on content length
                }}
            >
                {marqueeItems.map((text, i) => (
                    <span key={i} className="text-sm font-medium flex items-center gap-2">
                        {text}
                    </span>
                ))}
            </motion.div>
        </div>
    );
}
