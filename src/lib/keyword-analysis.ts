import { getKeywordVolume } from "./api/naver";
import { searchVideos, getVideoDetails, getChannelsDetails, fetchMonthlyTrend, fetchLast7DaysVolume, fetchVideoCount } from "./api/youtube";
import { getMockData } from "./mockData"; // Fallback
import { getCachedData, setCachedData } from "./cache";



export async function getRealKeywordData(keyword: string) {
    // 0. Check Cache
    const cached = await getCachedData(keyword);
    if (cached) {
        // console.log(`[Cache Hit] Serving ${keyword}`);
        return cached;
    }

    try {
        console.log(`[Cache Miss] Fetching fresh data for ${keyword}... (Expected Cost: ~1300 quota)`);

        // 1. Demand (Naver Search Volume)
        const naverStats = await getKeywordVolume(keyword);

        // 2. Supply (YouTube Competitors - Relevance)
        const youtubeSearch = await searchVideos(keyword, 10, 'relevance');

        // If API fails completely, fallback to mock
        if (!naverStats && youtubeSearch.totalResults === 0) {
            console.warn("Real Data Fetch Failed, using Mock");
            return await getMockData(keyword);
        }

        const searchVolume = naverStats ? naverStats.total : (youtubeSearch.totalResults * 10); // Fallback estimate
        const videoCount = youtubeSearch.totalResults;

        // 3. Performance (Top Videos Analysis - ViewCount)
        // Fetch top 10 videos by ViewCount for better benchmarking
        const topHitSearch = await searchVideos(keyword, 10, 'viewCount');
        const topVideoPromises = topHitSearch.results.slice(0, 6).map(item => getVideoDetails(item.videoId));
        const topVideosDetails = await Promise.all(topVideoPromises);

        const validDetails = topVideosDetails.filter(v => v !== null);

        // 4. Fetch Channel Details (Subscribers)
        const channelIds = validDetails.map(v => v!.channelId);
        const channelMap = await getChannelsDetails(channelIds);

        const topVideos = validDetails.map(v => ({
            id: v!.id,
            title: v!.title,
            thumbnail: v!.thumbnailUrl,
            channelName: v!.channelTitle,
            views: v!.viewCount,
            publishedAt: v!.publishedAt,
            subscriberCount: channelMap.get(v!.channelId)?.subscriberCount || 0,
        }));

        // Calculate Average Views of Top 5
        const validViews = topVideos.map(v => v.views);
        const avgViews = validViews.length > 0
            ? validViews.reduce((a, b) => a + b, 0) / validViews.length
            : 0;

        // 5. Fetch Real Monthly Trend (Last 6 Months)
        let trend: number[] = [];
        try {
            trend = await fetchMonthlyTrend(keyword);
        } catch (e) {
            console.warn("Real Monthly Trend Fetch Failed, defaulting to 0s", e);
            trend = Array(6).fill(0);
        }

        // 6. Fetch Daily Trend (Last 7 Days) - MOVED HERE FOR CACHING
        let last7DaysVideos: { day: string, value: number }[] = [];
        try {
            last7DaysVideos = await fetchLast7DaysVolume(keyword);
        } catch (e) {
            console.warn("Real Daily Trend Fetch Failed", e);
            last7DaysVideos = [];
        }

        // 7. Fetch Recent Monthly Count (Last 30 Days) - MOVED HERE FOR CACHING
        let monthlyVideoCount = 0;
        try {
            const now = new Date();
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(now.getDate() - 30);
            monthlyVideoCount = await fetchVideoCount(keyword, thirtyDaysAgo.toISOString(), now.toISOString());
        } catch (e) {
            console.warn("Real Monthly Count Fetch Failed", e);
            monthlyVideoCount = 0;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const relatedKeywords = naverStats?.keywordList?.map((k: any) => k.relKeyword) || [];

        const result = {
            keywordData: {
                searchVolume,
                videoCount,
                avgViews,
                saturationIndex: videoCount / (searchVolume || 1),
                trend,
                monthlyVideoCount, // New Field
                last7DaysVideos    // New Field
            },
            topVideos,
            relatedKeywords: relatedKeywords.slice(0, 10)
        };

        // SAVE TO CACHE
        await setCachedData(keyword, result);
        return result;

    } catch (error) {
        console.error("Keyword Analysis Error:", error);
        return await getMockData(keyword);
    }
}
