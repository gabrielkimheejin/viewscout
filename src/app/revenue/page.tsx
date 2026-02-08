"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { estimateRevenue, RevenueEstimate } from "@/lib/algorithms";
import { getVideoDetails, YouTubeVideoDetails } from "@/lib/api/youtube"; // Real API
import { Search, Loader2, PlayCircle, Calendar, Clock, DollarSign, TrendingUp, AlertCircle } from "lucide-react";
import { LottieLoader } from "@/components/ui/lottie-loader";
import { motion, AnimatePresence } from "framer-motion";

// --- Helpers ---

function extractVideoId(url: string) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

// --- Page Component ---

export default function RevenueSpyPage() {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{
        data: YouTubeVideoDetails; // Using Real Type
        revenue: RevenueEstimate;
        durationMins: number;
        rpmApplied: string;
        seasonFactor: number;
    } | null>(null);

    const handleAnalyze = async () => {
        if (!url.trim()) return;

        const videoId = extractVideoId(url);
        if (!videoId) {
            alert("올바른 YouTube URL을 입력해주세요.");
            return;
        }

        setLoading(true);
        setResult(null);

        try {
            // 1. Fetch Real Data
            const data = await getVideoDetails(videoId);

            if (!data) {
                alert("영상 정보를 가져올 수 없습니다. API 키를 확인하거나 존재하지 않는 영상입니다.");
                setLoading(false);
                return;
            }

            // 2. Map Category (Simple mapping for MVP)
            // YouTube Category IDs: 22=Blogs, 20=Gaming, 27=Education, 24=Entertainment etc.
            // Converting to our internal string keys: 'finance', 'tech', 'vlog', etc.
            // For now, we default to 'vlog' or detect keywords in title as a simple heuristic fallback + basic catID mapping
            let category = "default";
            const catId = parseInt(data.categoryId);

            // Basic Mapping
            if (catId === 20 || catId === 24) category = "entertainment";
            if (catId === 22) category = "vlog";
            if (catId === 28) category = "tech"; // Science & Tech
            if (catId === 27) category = "education";

            // Keyword Override (Stronger than generic catID)
            if (data.title.includes("주식") || data.title.includes("투자") || data.title.includes("코인")) category = "finance";
            if (data.title.includes("아이폰") || data.title.includes("갤럭시")) category = "tech";

            // 3. Calculate Revenue (V2.0: KRW)
            const revenue = estimateRevenue(data.viewCount, category, data.durationMinutes, data.publishedAt);

            // Extract factors
            const factors = revenue.factors || {
                rpmUsed: "N/A",
                lengthBoost: false,
                seasonScore: 1.0
            };

            setResult({
                data,
                revenue,
                durationMins: data.durationMinutes,
                rpmApplied: factors.rpmUsed,
                seasonFactor: factors.seasonScore
            });

        } catch (error) {
            console.error(error);
            alert("분석 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-12 px-4 max-w-4xl space-y-12">

            {/* Hero Section */}
            <div className="text-center space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight">
                    유투브 영상 <span className="text-primary">예상 수익금 계산</span> 🕵️‍♂️
                </h1>
                <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                    유튜브 링크만 넣으세요. 조회수, 영상 길이, 업로드 시기를 분석해 <br />
                    숨겨진 수익을 추적해드립니다.
                </p>

                <Card className="max-w-2xl mx-auto border-4 border-primary/20 shadow-2xl overflow-hidden mt-8">
                    <div className="flex flex-col md:flex-row p-2 bg-white">
                        <div className="relative flex-1">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                <Search className="h-5 w-5" />
                            </div>
                            <Input
                                className="pl-12 h-14 text-lg border-0 shadow-none focus-visible:ring-0"
                                placeholder="https://www.youtube.com/watch?v=..."
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                            />
                        </div>
                        <Button
                            className="h-14 px-8 text-lg font-bold bg-primary hover:bg-primary/90 text-white md:rounded-l-none"
                            onClick={handleAnalyze}
                            disabled={loading || !url}
                        >
                            {loading ? <div className="flex items-center justify-center w-full"><LottieLoader width={50} height={50} /></div> : "수익 분석하기"}
                        </Button>
                    </div>
                    {/* Mock validation hint */}
                    <div className="bg-gray-50 px-6 py-2 text-left text-xs text-gray-400 border-t">
                        지원 형식: YouTube 동영상 URL (Shorts 미지원)
                    </div>
                </Card>
            </div>

            {/* Result Section */}
            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center gap-2 text-xl font-bold text-gray-800 border-l-4 border-primary pl-4">
                            분석 결과 리포트
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                            {/* Video Card */}
                            <Card className="md:col-span-5 overflow-hidden border-2 h-fit">
                                <div className="aspect-video bg-gray-100 relative group">
                                    {/* Use regular img for mock */}
                                    <img
                                        src={result.data.thumbnailUrl}
                                        alt="thumb"
                                        className="w-full h-full object-cover"
                                        style={{ backgroundColor: '#ddd' }} // fallback color if mock url fails
                                    />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded font-mono">
                                        {result.data.duration.replace("PT", "").replace("H", ":").replace("M", ":").replace("S", "")}
                                    </div>
                                </div>
                                <CardContent className="p-4 space-y-2">
                                    <h3 className="font-bold text-lg leading-tight line-clamp-2">{result.data.title}</h3>
                                    <div className="flex justify-between items-center text-sm text-gray-600">
                                        <span>{result.data.channelTitle}</span>
                                        <span>{result.data.publishedAt.split('T')[0]}</span>
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600 flex items-center gap-1">
                                            <PlayCircle className="h-3 w-3" /> {result.data.viewCount.toLocaleString()} 조회
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Revenue Details */}
                            <Card className="md:col-span-7 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-white">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-gray-500 text-sm font-medium uppercase tracking-wider flex items-center gap-2">
                                        <DollarSign className="h-4 w-4" />
                                        추정 수익 (Estimated Revenue)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">

                                    {/* Big Number */}
                                    <div>
                                        <div className="text-4xl md:text-5xl font-black text-primary tracking-tight">
                                            약 {(result.revenue.min / 10000).toLocaleString()}만 ~ {(result.revenue.max / 10000).toLocaleString()}만원
                                        </div>
                                        <p className="text-sm text-gray-400 mt-1">
                                            *구글 애드센스 기준 (협찬/PPL 제외)
                                        </p>
                                    </div>

                                    <hr className="border-primary/20" />

                                    {/* Impact Factors */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="bg-white p-3 rounded-lg border shadow-sm">
                                            <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                                                <TrendingUp className="h-3 w-3" /> 적용 RPM
                                            </div>
                                            <div className="font-bold text-gray-800">
                                                {result.rpmApplied} KRW
                                            </div>
                                            <div className="text-xs text-primary mt-1">
                                                카테고리: {result.data.categoryId}
                                            </div>
                                        </div>

                                        <div className="bg-white p-3 rounded-lg border shadow-sm">
                                            <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                                                <Clock className="h-3 w-3" /> 길이 보너스
                                            </div>
                                            <div className="font-bold text-gray-800">
                                                {result.durationMins >= 8 ? "적용됨 (x1.8)" : "미적용"}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {result.durationMins.toFixed(1)}분 영상
                                            </div>
                                        </div>

                                        <div className="bg-white p-3 rounded-lg border shadow-sm sm:col-span-2">
                                            <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                                                <Calendar className="h-3 w-3" /> 시기적 요인 (Seasonality)
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="font-bold text-gray-800">
                                                    {result.seasonFactor >= 1 ? "성수기/평수기 프리미엄" : "비수기 할인"} (x{result.seasonFactor})
                                                </div>
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {result.data.publishedAt.split('T')[0]} 업로드 기준
                                            </div>
                                        </div>
                                    </div>

                                </CardContent>
                            </Card>

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {!result && !loading && (
                <div className="mt-20 opacity-30 flex flex-col items-center justify-center text-center">
                    <DollarSign className="h-24 w-24 mb-4" />
                    <p>궁금한 영상의 링크를 입력하면 분석이 시작됩니다.</p>
                </div>
            )}

        </div>
    );
}
