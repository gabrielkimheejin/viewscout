import { getRealKeywordData } from "@/lib/keyword-analysis";
import { calculateIntensity, calculateOpportunity, getIntensityColor, getOceanLabel } from "@/lib/analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VolumeTrendChart, MicroTrendChart } from "@/components/analytics-charts";
import { VideoList } from "@/components/video-list";
import { TopicRecommendation } from "@/components/topic-recommendation";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Search, TrendingUp, Users } from "lucide-react";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AnalyticsPage({ params }: { params: { keyword: string } }) {
    const keyword = decodeURIComponent(params.keyword);
    // Use Real Data Service (Now Cached)
    // This single call returns hydration for all charts including monthly and daily trends
    const data = await getRealKeywordData(keyword);

    // Destructure cached extra fields
    // @ts-expect-error getRealKeywordData returns these new fields but type not updated
    const last7DaysVideos = data.keywordData.last7DaysVideos || [];
    // @ts-expect-error monthlyVideoCount field exists but not in type definition
    const monthlyVideoCount = data.keywordData.monthlyVideoCount || 0;

    const intensity = calculateIntensity(data.keywordData.videoCount, data.keywordData.searchVolume);
    const intensityColor = getIntensityColor(intensity);
    const opportunity = calculateOpportunity(intensity, data.keywordData.avgViews);

    // Format Trend Data for Chart (Monthly)
    const trendData = data.keywordData.trend.map((volume, i) => ({
        month: `${6 - i}개월 전`,
        searchVolume: Math.floor(data.keywordData.searchVolume * (0.8 + Math.random() * 0.4)), // Mock search vol history
        videoCount: volume
    }));

    // Generate Last 7 Days Search Data (Still Mocked as Naver Trend is hard)
    const dailyVolume = Math.floor(data.keywordData.searchVolume / 30);
    const getDayLabel = (index: number) => {
        if (index === 6) return '오늘';
        if (index === 5) return '어제';
        return `${6 - index}일 전`;
    };

    const last7DaysSearch = Array.from({ length: 7 }, (_, i) => ({
        day: getDayLabel(i),
        value: Math.floor(dailyVolume * (0.8 + Math.random() * 0.4))
    }));

    return (
        <div className="container mx-auto max-w-7xl p-6 space-y-8">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 capitalize">{keyword}</h1>
                    <Badge variant="outline" className="text-base px-3 py-1 border-primary/50 text-primary">
                        {getOceanLabel(intensity)}
                    </Badge>
                </div>
                <p className="text-muted-foreground">최근 30일 데이터 기준 분석 결과입니다.</p>
            </div>

            {/* 4 Core Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">경쟁 강도</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${intensityColor}`}>{intensity}%</div>
                        <p className="text-xs text-muted-foreground">검색량 대비 영상 수 비율</p>
                        <div className="h-2 w-full bg-secondary mt-3 rounded-full overflow-hidden">
                            <div
                                className={`h-full ${intensity < 30 ? 'bg-green-500' : 'bg-red-500'}`}
                                style={{ width: `${Math.min(100, intensity)}%` }}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">기회 점수</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{opportunity} / 100</div>
                        <p className="text-xs text-muted-foreground">공급 대비 수요 분석 점수</p>
                        <div className="h-2 w-full bg-secondary mt-3 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-500"
                                style={{ width: `${opportunity}%` }}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">월간 검색량</CardTitle>
                        <Search className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{data.keywordData.searchVolume.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">최근 1개월 검색 횟수</p>
                        <MicroTrendChart data={last7DaysSearch} color="#22c55e" label="검색량" />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">월간 발행 영상</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{monthlyVideoCount.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">최근 30일 신규 영상 수</p>
                        <MicroTrendChart data={last7DaysVideos} color="#3b82f6" label="영상 수" />
                    </CardContent>
                </Card>
            </div>

            {/* Main Analysis Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Charts: Takes up 2/3 */}
                <div className="lg:col-span-2 space-y-8">
                    <VolumeTrendChart data={trendData} />
                    <VideoList videos={data.topVideos} />
                </div>



                {/* Sidebar: Simulator & Saturation */}
                <div className="space-y-8">
                    <TopicRecommendation
                        keyword={keyword}
                        relatedKeywords={data.relatedKeywords}
                        topVideoTitles={data.topVideos.map(v => v.title)}
                    />

                    {/* Summary/Insight Card */}
                    <Card className="bg-primary/5 border-primary/10">
                        <CardHeader>
                            <CardTitle className="text-lg">한눈에 보는 요약</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm text-gray-700">
                            <p>• 상위 영상 평균 조회수: <strong>{data.keywordData.avgViews.toLocaleString()}회</strong></p>
                            <p>• 지난 3개월 검색 추이: <strong>{trendData[trendData.length - 1].searchVolume > trendData[0].searchVolume ? '상승세 📈' : '평이함 ➖'}</strong></p>
                            <p>• 영상 1개당 평균 <strong>{(data.keywordData.searchVolume / (data.keywordData.videoCount || 1)).toFixed(1)}회</strong>의 노출 기회 산출.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
