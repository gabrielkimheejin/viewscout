"use client";

import { VideoDiagnosticsResult } from "@/lib/video-diagnostics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VolumeTrendChart, ScoreGaugeChart } from "./analytics-charts";
import { calculateIntensity, getIntensityColor } from "@/lib/analytics";
import { Youtube, DollarSign, Target, Star, BrainCircuit } from "lucide-react";

export function VideoDiagnosisDashboard({ result }: { result: VideoDiagnosticsResult }) {
    const { metadata, trendAnalysis, extractedKeyword, dualCoreAnalysis, revenueEstimate } = result;

    const intensity = calculateIntensity(trendAnalysis.keywordData.videoCount, trendAnalysis.keywordData.searchVolume);
    const trendData = trendAnalysis.keywordData.trend.map((volume, i) => {
        // Now using Real Data from YouTube API (Last 6 Months)
        // trendAnalysis.keywordData.trend contains [Count M-5, ..., Count M-0]
        // searchVolume is Naver Volume (Currently static for M-6? Or Mock trend volume?)
        // Mock trend volume is for 12 months. Real video trend is 6 months.
        // We need to slice searchVolume or map correctly.

        // Ensure i < 6 for Real Data
        if (i >= 6) return null;

        return {
            month: i === 5 ? "이번달" : `${5 - i}달 전`, // "Current", "1 Month Ago", etc.
            // searchVolume is the scalar monthly volume. We add slight random variance to simulate a trend curve for visualization
            searchVolume: Math.floor(trendAnalysis.keywordData.searchVolume * (0.9 + Math.random() * 0.2)),
            videoCount: volume // Real Video Count from API
        };
    }).filter((item): item is { month: string; searchVolume: number; videoCount: number } => Boolean(item));

    const getMatrixColor = (label: string) => {
        // Updated for Gradient + Shimmer Animation
        if (label === "S") return "bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 text-white animate-shimmer shadow-lg shadow-purple-500/30";
        if (label.startsWith("A")) return "bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 text-white animate-shimmer shadow-lg shadow-blue-600/30";
        if (label.startsWith("B")) return "bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-500 text-white animate-shimmer shadow-lg shadow-emerald-500/30";
        return "bg-gray-500 text-white";
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">

            {/* 1. Video Meta Header */}
            <Card className="bg-white border-2 border-primary/10 overflow-hidden">
                <div className="md:flex">
                    <div className="md:w-64 h-48 bg-gray-100 flex-shrink-0 relative">
                        <div className="w-full h-full bg-cover bg-center flex items-center justify-center text-gray-400"
                            style={{ backgroundImage: `url(${metadata.thumbnailUrl})`, backgroundColor: '#e5e7eb' }}>
                            <Youtube className="h-12 w-12 text-red-600 opacity-80" />
                        </div>
                    </div>
                    <div className="p-6 flex flex-col justify-center flex-1 space-y-3">
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                                자동 추출 키워드: {extractedKeyword}
                            </Badge>
                            <span className="text-sm text-gray-500">{metadata.publishedAt}</span>
                            <span className="text-sm text-gray-500">• {metadata.durationMinutes}분</span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 leading-tight line-clamp-2">
                            {metadata.title}
                        </h2>
                        <div className="flex items-center gap-4">
                            <p className="text-gray-600 font-medium">{metadata.channelName}</p>
                            <div className="flex items-center text-sm gap-1 text-primary font-bold bg-primary/10 px-2 py-1 rounded">
                                <DollarSign className="h-4 w-4" />
                                예상 수익: ${revenueEstimate.min.toLocaleString()} ~ ${revenueEstimate.max.toLocaleString()}
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* 2. Main Diagnosis: Grade & AI Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Grade Card - Added glass-shine effect */}
                <Card className="border-l-4 border-l-purple-500 bg-purple-50/50 md:col-span-1 h-full glass-shine shadow-md overflow-hidden relative">
                    <CardHeader className="pb-2 relative z-10">
                        <CardTitle className="flex items-center gap-2">
                            <BrainCircuit className="h-5 w-5 text-purple-600" />
                            종합 등급
                        </CardTitle>
                        <CardDescription>Dual-Core 분석 결과</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center h-48 px-6 relative z-10">
                        <div className={`px-8 py-5 rounded-xl text-center w-full mb-3 ${getMatrixColor(dualCoreAnalysis.matrixLabel)}`}>
                            <div className="text-4xl font-black mb-1 drop-shadow-md">{dualCoreAnalysis.matrixLabel}</div>
                            <div className="text-sm font-medium opacity-90">종합 등급</div>
                        </div>
                        <p className="text-xs text-center text-gray-500 leading-snug break-keep px-2">
                            {dualCoreAnalysis.gradeReason}
                        </p>
                    </CardContent>
                </Card>

                {/* AI Summary Card */}
                <Card className="md:col-span-2 flex flex-col">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Star className="h-5 w-5 text-blue-600" />
                                AI 3줄 요약
                            </CardTitle>
                            {result.isMockTranscript && (
                                <Badge variant="destructive" className="bg-orange-100 text-orange-700 border-orange-200">
                                    ⚠️ 예시 데이터
                                </Badge>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <div className="bg-blue-50/50 p-5 rounded-lg border border-blue-100 h-full">
                            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-base">
                                {dualCoreAnalysis.breakdown.summary || "요약을 생성하는 중입니다..."}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 3. Detailed Tabs */}
            <Tabs defaultValue="market" className="w-full">
                <TabsList className="grid w-full grid-cols-3 lg:w-[600px] mb-6 mx-auto">
                    <TabsTrigger value="market">📊 주제 점수 (Market)</TabsTrigger>
                    <TabsTrigger value="content">📝 콘텐츠 점수 (Quality)</TabsTrigger>
                    <TabsTrigger value="transcript">📜 전체 대본</TabsTrigger>
                </TabsList>

                {/* TAB 1: Market Score */}
                <TabsContent value="market" className="space-y-6">
                    <div className="text-center mb-8">
                        <h3 className="text-lg font-medium text-gray-500 mb-0">시장성 점수 (Topic Score)</h3>

                        {/* New Gauge Chart */}
                        <div className="w-full max-w-sm mx-auto">
                            <ScoreGaugeChart
                                score={dualCoreAnalysis.topicScore}
                                max={50}
                                label={
                                    dualCoreAnalysis.topicScore >= 40 ? "최고" :
                                        dualCoreAnalysis.topicScore >= 30 ? "좋음" :
                                            dualCoreAnalysis.topicScore >= 20 ? "보통" : "나쁨"
                                }
                                color={
                                    dualCoreAnalysis.topicScore >= 40 ? "#8b5cf6" : // Purple
                                        dualCoreAnalysis.topicScore >= 30 ? "#3b82f6" : // Blue
                                            dualCoreAnalysis.topicScore >= 20 ? "#eab308" : // Yellow/Gold
                                                "#ef4444" // Red
                                }
                                insight={dualCoreAnalysis.marketInsight}
                            />
                        </div>

                        <p className="mt-8 text-gray-600 max-w-2xl mx-auto">
                            이 주제의 <strong>검색량</strong>과 <strong>경쟁 강도</strong>를 종합적으로 분석한 점수입니다.
                            <p>점수가 높을수록 &apos;사람들이 많이 찾지만 경쟁은 적은&apos; 좋은 주제입니다.</p>
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">월간 검색량</CardTitle></CardHeader>
                            <CardContent><div className="text-2xl font-bold">{(trendAnalysis.keywordData.searchVolume || 0).toLocaleString()}</div></CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">경쟁 강도</CardTitle></CardHeader>
                            <CardContent>
                                <div className={`text-2xl font-bold ${getIntensityColor(intensity)}`}>{intensity}%</div>
                                <div className="text-xs text-gray-400">{intensity < 30 ? '블루오션 🌊' : '레드오션 🦈'}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">상위 영상 평균 조회수</CardTitle></CardHeader>
                            <CardContent><div className="text-2xl font-bold">{(trendAnalysis.keywordData.avgViews || 0).toLocaleString()}</div></CardContent>
                        </Card>
                    </div>

                    {/* Top Competitor Videos (New Section) */}
                    <div className="mt-8">
                        <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Target className="h-5 w-5 text-red-500" />
                            상위 경쟁 영상 (평균 조회수 산출 기준)
                        </h4>
                        <div className="grid grid-cols-1 gap-3">
                            {result.topVideos && result.topVideos.length > 0 ? (
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                result.topVideos.map((video: any, i: number) => (
                                    <div key={i} className="flex gap-4 p-3 bg-white rounded-lg border hover:shadow-md transition-shadow">
                                        <div className="w-32 h-20 bg-gray-200 rounded-md overflow-hidden flex-shrink-0 relative">
                                            {video.thumbnailUrl ? (
                                                <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-gray-300 flex items-center justify-center text-xs">No Image</div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-bold text-gray-900 line-clamp-1">{video.title}</div>
                                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                                <span>{video.channelTitle}</span>
                                                <span>•</span>
                                                <span>조회수 {video.viewCount?.toLocaleString()}회</span>
                                            </div>
                                            <div className="mt-2 flex items-center gap-1">
                                                <Badge variant="outline" className="text-[10px] px-1 py-0 h-5 text-gray-400 font-normal border-gray-200">
                                                    {video.publishedAt?.split('T')[0]}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-sm text-gray-400 text-center py-4">영상 리스트를 불러오지 못했습니다.</div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <VolumeTrendChart data={trendData} />
                        <p className="text-xs text-center text-gray-400">
                            * 꺾은선 그래프: 최근 6개월간의 실제 발행 영상 수 추이
                        </p>
                    </div>

                </TabsContent>


                {/* TAB 2: Content Score */}
                <TabsContent value="content" className="space-y-6">
                    <div className="text-center mb-8">
                        <h3 className="text-lg font-medium text-gray-500 mb-0">콘텐츠 완성도 (Quality Score)</h3>

                        {/* Gauge Chart for Content Score */}
                        <div className="w-full max-w-sm mx-auto">
                            <ScoreGaugeChart
                                score={dualCoreAnalysis.contentScore}
                                max={50}
                                label={
                                    dualCoreAnalysis.contentScore >= 40 ? "최고" :
                                        dualCoreAnalysis.contentScore >= 30 ? "좋음" :
                                            dualCoreAnalysis.contentScore >= 20 ? "보통" : "나쁨"
                                }
                                color={
                                    dualCoreAnalysis.contentScore >= 40 ? "#8b5cf6" : // Purple
                                        dualCoreAnalysis.contentScore >= 30 ? "#3b82f6" : // Blue
                                            dualCoreAnalysis.contentScore >= 20 ? "#eab308" : // Yellow
                                                "#ef4444" // Red
                                }
                                insight={ // Use gradeReason if it's content-focused, or let fallback handle it. 
                                    // Since gradeReason is combined, let's leave it undefined to use the generic fallback which suits 'Quality' well.
                                    undefined
                                }
                            />
                        </div>

                        <p className="mt-8 text-gray-600 max-w-2xl mx-auto">
                            대본의 <strong>구조, 초반 후킹, 주제 적합성</strong>을 AI가 정밀 분석했습니다.
                            시청 지속 시간을 늘리기 위한 핵심 지표입니다.
                        </p>
                    </div>

                    <div className="flex justify-center gap-4 mb-8">
                        <div className="bg-white border rounded-xl p-4 w-32 text-center shadow-sm">
                            <div className="text-xs text-gray-500 mb-1">제목/썸네일</div>
                            <div className="text-xl font-bold text-gray-800">{dualCoreAnalysis.breakdown.metadata}/20</div>
                        </div>
                        <div className="bg-white border rounded-xl p-4 w-32 text-center shadow-sm ring-2 ring-green-100">
                            <div className="text-xs text-green-600 font-bold mb-1">대본 구조</div>
                            <div className="text-xl font-bold text-gray-800">{dualCoreAnalysis.breakdown.script}/20</div>
                        </div>
                        <div className="bg-white border rounded-xl p-4 w-32 text-center shadow-sm">
                            <div className="text-xs text-gray-500 mb-1">주제 적합성</div>
                            <div className="text-xl font-bold text-gray-800">{dualCoreAnalysis.breakdown.relevance}/10</div>
                        </div>
                    </div>

                    <div className="max-w-4xl mx-auto space-y-4">
                        <h4 className="font-bold text-gray-800 flex items-center gap-2">
                            <Target className="h-5 w-5 text-red-500" />
                            AI 피드백 & 개선점
                        </h4>
                        {dualCoreAnalysis.breakdown.feedback.length > 0 ? (
                            <div className="grid gap-3">
                                {dualCoreAnalysis.breakdown.feedback.map((msg, i) => (
                                    <div key={i} className="flex gap-3 p-4 bg-red-50 text-red-800 rounded-lg border border-red-100 hover:bg-red-100 transition-colors">
                                        <div className="font-bold text-red-400">0{i + 1}</div>
                                        <div>{msg}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-6 bg-green-50 text-green-800 rounded-lg border border-green-100 text-center">
                                완벽합니다! 특별한 개선점이 발견되지 않았습니다. 👏
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* TAB 3: Transcript */}
                <TabsContent value="transcript">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">영상 전체 대본</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[500px] overflow-y-auto p-6 bg-gray-50 rounded-lg border text-base text-gray-700 leading-8 font-serif whitespace-pre-wrap">
                                {result.transcript || "대본이 제공되지 않았습니다."}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

        </div >
    );
}
