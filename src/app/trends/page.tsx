"use client";

import { useState, useEffect } from "react";
import { TrendTicker } from "@/components/trend-ticker";
import { KeywordRankTable } from "@/components/keyword-rank-table";
import { fetchDarkHorseVideos, TrendingKeyword, DarkHorseVideo } from "@/lib/trendData";
import { getTrendingKeywords, getTopVideosForKeyword } from "@/app/actions";
import { TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Flame, Activity, Zap, ArrowRight, User, Eye, Rocket } from "lucide-react";
import Link from "next/link";
import Image from "next/image"; // Mock images use external URLs, so we might need img or configured Image

const CATEGORIES = [
    { id: "all", label: "전체" },
    { id: "beauty", label: "뷰티/패션" },
    { id: "tech", label: "IT/테크" },
    { id: "money", label: "재테크" },
    { id: "vlog", label: "브이로그" },
    { id: "entertainment", label: "엔터" },
];

export default function TrendsPage() {
    const [activeCategory, setActiveCategory] = useState("all");
    const [isWeekly, setIsWeekly] = useState(false); // Daily vs Weekly

    const [trendingKeywords, setTrendingKeywords] = useState<TrendingKeyword[]>([]);
    const [darkHorses, setDarkHorses] = useState<DarkHorseVideo[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [selectedKeyword, setSelectedKeyword] = useState<TrendingKeyword | null>(null);
    const [selectedVideos, setSelectedVideos] = useState<any[]>([]);
    const [videosLoading, setVideosLoading] = useState(false);
    const [videoCache, setVideoCache] = useState<Record<string, any[]>>({}); // Cache for visited keywords

    // Client-side only time update to avoid hydration mismatch
    useEffect(() => {
        setCurrentTime(new Date().toLocaleTimeString('ko-KR'));
    }, []);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);

            // Fetch trending keywords via server action
            const keywordsResult = await getTrendingKeywords();
            if (keywordsResult.success) {
                setTrendingKeywords(keywordsResult.data);
            } else {
                setError(keywordsResult.error || '실시간 정보를 불러오는데 실패했습니다');
                setTrendingKeywords([]);
            }

            // Fetch dark horse videos
            const videos = await fetchDarkHorseVideos(activeCategory);
            setDarkHorses(videos);

            setLoading(false);
            setCurrentTime(new Date().toLocaleTimeString('ko-KR'));
        };
        loadData();
    }, [activeCategory, isWeekly]);

    const handleKeywordSelect = async (kw: TrendingKeyword) => {
        if (selectedKeyword?.id === kw.id) return; // Prevent re-fetching same keyword if already selected

        setSelectedKeyword(kw);

        // 1. Check Cache
        if (videoCache[kw.keyword]) {
            setSelectedVideos(videoCache[kw.keyword]);
            return;
        }

        // 2. Fetch API if not in cache
        setVideosLoading(true);
        const result = await getTopVideosForKeyword(kw.keyword);

        if (result.success) {
            const limitedData = result.data.slice(0, 3); // Ensure max 3
            setSelectedVideos(limitedData);
            setVideoCache(prev => ({ ...prev, [kw.keyword]: limitedData })); // Save to cache
        } else {
            setSelectedVideos([]);
        }
        setVideosLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* 1. Ticker */}
            <TrendTicker />

            {/* 2. Header & Filters */}
            <div className="bg-white border-b sticky top-16 z-30 shadow-sm">
                <div className="container mx-auto px-4 py-4 space-y-4">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Activity className="text-red-500 h-6 w-6" />
                            실시간 급상승 트렌드
                        </h1>
                        <div className="flex items-center gap-2">
                            <Label className={`text-sm ${!isWeekly ? "font-bold text-gray-900" : "text-gray-400"}`}>일간</Label>
                            <Switch checked={isWeekly} onCheckedChange={setIsWeekly} />
                            <Label className={`text-sm ${isWeekly ? "font-bold text-gray-900" : "text-gray-400"}`}>주간</Label>
                        </div>
                    </div>

                    {/* Category Pills */}
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {CATEGORIES.map(cat => (
                            <Button
                                key={cat.id}
                                variant={activeCategory === cat.id ? "default" : "outline"}
                                className={`rounded-full px-5 ${activeCategory === cat.id ? "bg-black hover:bg-black/80" : "border-gray-200"}`}
                                size="sm"
                                onClick={() => setActiveCategory(cat.id)}
                            >
                                {cat.label}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-10">

                {/* Section A: Trending Ranking (Left Col) */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Flame className="text-orange-500 h-5 w-5" />
                            급상승 키워드 랭킹
                        </h2>
                        <span className="text-xs text-gray-500">
                            {currentTime ? `${currentTime} 기준 업데이트` : '업데이트 중...'}
                        </span>
                    </div>

                    {loading ? (
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-16 bg-gray-200 animate-pulse rounded-lg" />
                            ))}
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                            <p className="text-red-600 font-medium">{error}</p>
                            <p className="text-sm text-red-400 mt-2">잠시 후 다시 시도해주세요</p>
                        </div>
                    ) : (
                        <KeywordRankTable
                            keywords={trendingKeywords}
                            onKeywordSelect={handleKeywordSelect}
                            selectedKeywordId={selectedKeyword?.id}
                        />
                    )}
                </div>

                {/* Section B: 선택된 키워드 인기 영상 (Right Col) */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <TrendingUp className="text-red-500 h-5 w-5" />
                            {selectedKeyword ? `"${selectedKeyword.keyword}" 인기 영상` : '키워드를 선택하세요'}
                        </h2>
                        {selectedKeyword && (
                            <Badge variant="outline" className="text-xs border-dashed border-gray-400 font-normal">
                                최근 인기 영상 TOP 3
                            </Badge>
                        )}
                    </div>

                    {!selectedKeyword ? (
                        <div className="bg-gray-100 rounded-xl p-8 text-center">
                            <p className="text-gray-500">좌측 리스트에서 키워드를 클릭하면</p>
                            <p className="text-gray-500">해당 키워드 관련 인기 영상이 표시됩니다</p>
                        </div>
                    ) : videosLoading ? (
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-xl" />
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {selectedVideos.length > 0 ? selectedVideos.map((video, idx) => (
                                <Card key={video.id || idx} className="overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer border-0 shadow-sm relative">
                                    <div className="aspect-video bg-gray-100 relative">
                                        {video.thumbnailUrl ? (
                                            <img
                                                src={video.thumbnailUrl}
                                                alt={video.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-6xl">🎬</div>
                                        )}
                                        <div className="absolute top-2 left-2 bg-gradient-to-r from-red-600 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded shadow-lg flex items-center gap-1">
                                            <Rocket className="h-3 w-3" />
                                            TOP {idx + 1}
                                        </div>
                                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">
                                            {video.duration ? video.duration.replace('PT', '').replace('H', ':').replace('M', ':').replace('S', '') : ''}
                                        </div>
                                    </div>
                                    <CardContent className="p-4 relative">
                                        <h3 className="font-bold text-gray-900 line-clamp-2 leading-tight mb-2 group-hover:text-primary transition-colors">
                                            {video.title}
                                        </h3>
                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <Eye className="h-3 w-3" /> {video.viewCount?.toLocaleString()} 조회
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <User className="h-3 w-3" /> {video.channelTitle}
                                            </div>
                                        </div>

                                        <div className="mt-4">
                                            <Link href={`/analytics/${encodeURIComponent(selectedKeyword!.keyword)}`}>
                                                <Button className="w-full h-8 text-xs bg-gray-900 hover:bg-gray-800">
                                                    이 키워드 분석하기 <ArrowRight className="h-3 w-3 ml-1" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            )) : (
                                <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg border border-dashed">
                                    <TrendingUp className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                                    <p>관련 영상을 찾을 수 없습니다</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
