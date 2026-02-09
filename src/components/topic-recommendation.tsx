"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Zap, Search, Lightbulb } from "lucide-react";
import { generateContentIdeas } from "@/app/actions";
import { VideoIdea } from "@/lib/api/gemini";
import { LottieLoader } from "@/components/ui/lottie-loader";
import { Badge } from "@/components/ui/badge";

export function TopicRecommendation({ keyword, relatedKeywords = [], topVideoTitles = [] }: { keyword: string, relatedKeywords?: string[], topVideoTitles?: string[] }) {
    const [loading, setLoading] = useState(false);
    const [ideas, setIdeas] = useState<VideoIdea[] | null>(null);

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const result = await generateContentIdeas(keyword, relatedKeywords, topVideoTitles);
            setIdeas(result);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case "Viral Hit": return "bg-pink-100 text-pink-700 border-pink-200";
            case "Search-Optimized": return "bg-blue-100 text-blue-700 border-blue-200";
            case "Creative Twist": return "bg-purple-100 text-purple-700 border-purple-200";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "Viral Hit": return <Zap className="w-4 h-4" />;
            case "Search-Optimized": return <Search className="w-4 h-4" />;
            case "Creative Twist": return <Lightbulb className="w-4 h-4" />;
            default: return <Sparkles className="w-4 h-4" />;
        }
    };

    return (
        <Card className="relative overflow-hidden bg-white border-none shadow-sm rounded-3xl group hover:shadow-md transition-all duration-300">
            {/* Background Pattern - Concentric Circles */}
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <svg width="200" height="200" viewBox="0 0 200 200" className="text-indigo-500 fill-current">
                    <circle cx="150" cy="50" r="100" className="opacity-20" />
                    <circle cx="150" cy="50" r="70" className="opacity-40" />
                    <circle cx="150" cy="50" r="40" className="opacity-60" />
                </svg>
            </div>

            <CardHeader className="relative z-10 pb-2">
                <div className="flex items-center gap-2 mb-1">
                    <CardTitle className="text-2xl font-bold text-gray-900 tracking-tight">AI 아이디어 추천</CardTitle>
                    <span className="flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-red-500 rounded-full">N</span>
                </div>
                <p className="text-sm text-gray-500 font-medium">
                    빅데이터 분석 기반 맞춤형 기획안 제안
                </p>
            </CardHeader>
            <CardContent className="relative z-10 space-y-6 pt-2">
                {!ideas && (
                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-start gap-3">
                            <div className="p-2 bg-white rounded-xl shadow-sm">
                                <Sparkles className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-semibold text-gray-900">무엇을 도와드릴까요?</p>
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    현재 트렌드와 경쟁 콘텐츠를 분석하여<br />
                                    조회수가 터질 수 있는 주제 3가지를 알려드려요.
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={loading}
                            className="w-full py-4 flex items-center justify-center gap-2 text-base font-bold text-white bg-indigo-600 rounded-2xl hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <LottieLoader width={28} height={28} /> : <Sparkles className="w-5 h-5 fill-white/20" />}
                            {loading ? "트렌드 분석 중..." : "AI 아이디어 추천받기"}
                        </button>
                    </div>
                )}

                {ideas && (
                    <div className="grid gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {ideas.map((idea, i) => (
                            <div key={i} className="group/item bg-gray-50 hover:bg-white p-5 rounded-2xl border border-transparent hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-100/50 transition-all cursor-default">
                                <div className="flex items-center justify-between mb-2">
                                    <Badge variant="outline" className={`${getTypeColor(idea.type)} border-0 px-2 py-1 text-xs font-semibold rounded-md`}>
                                        {getTypeIcon(idea.type)}
                                        <span className="ml-1">{idea.type}</span>
                                    </Badge>
                                </div>
                                <h4 className="font-bold text-gray-900 text-lg mb-2 group-hover/item:text-indigo-700 transition-colors">{idea.title}</h4>
                                <p className="text-sm text-gray-500 leading-relaxed">{idea.reason}</p>
                            </div>
                        ))}
                        <button
                            onClick={handleGenerate}
                            disabled={loading}
                            className="w-full py-3 mt-2 text-sm font-semibold text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                        >
                            <span className="flex items-center justify-center gap-2">
                                <Search className="w-4 h-4" />
                                다른 아이디어 다시 찾기
                            </span>
                        </button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
