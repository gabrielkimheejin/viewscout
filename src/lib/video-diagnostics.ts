import { getMockData, MockResponse, MOCK_SCRIPTS } from "./mockData";
import { analyzeScript, AnalysisResult } from "./scriptAnalysis";
import {
    analyzeMarket,
    diagnoseVideo,
    estimateRevenue,
    calculateViralVelocity,
    DualCoreResult,
    RevenueEstimate
} from "./algorithms";
import {
    getVideoDetails,
    searchVideos,
    getChannelsDetails,
    fetchVideoCount,
    fetchMonthlyTrend
} from "./api/youtube";
import { getKeywordVolume } from "./api/naver";
import { analyzeVideoQuality, extractBestKeyword } from "./api/gemini";
import { getSupaDataTranscript } from "./api/supadata";

export interface VideoMetadata {
    videoId: string;
    title: string;
    thumbnailUrl: string;
    channelName: string;
    publishedAt: string;
    durationMinutes: number;
    viewCount: number;
}

export interface VideoDiagnosticsResult {
    metadata: VideoMetadata;
    transcript: string;
    extractedKeyword: string;
    scriptAnalysis: AnalysisResult;
    trendAnalysis: MockResponse;

    // New Core Algorithm Outputs
    dualCoreAnalysis: DualCoreResult;
    revenueEstimate: RevenueEstimate;
    isMockTranscript?: boolean;
    topVideos?: any[]; // For displaying reference videos
}

// Helper: Extract valid keyword
function extractKeywordFromTitle(title: string): string {
    const words = title.split(' ').filter(w => w.length >= 2);
    const bracketMatch = title.match(/[\[\(]([^\]\)]+)[\]\)]/);
    if (bracketMatch) return bracketMatch[1];
    return words[0] || "유튜브";
}

// Helper: Get ISO Date for query
function getDaysAgoISO(days: number): string {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString();
}

export async function processYoutubeUrl(url: string): Promise<VideoDiagnosticsResult> {
    const videoId = extractVideoId(url);
    if (!videoId) throw new Error("Invalid URL");

    // 1. Fetch Target Video Details
    const videoData = await getVideoDetails(videoId);

    if (!videoData) {
        console.warn("API Failed, using Mock Data");
        return processMockUrl(videoId);
    }

    // 2. Fetch Transcript
    let transcript = "";
    let isMockTranscript = false;
    try {
        console.log(`Fetching SupaData for ${videoId}...`);
        const supaText = await getSupaDataTranscript(videoId);
        if (supaText) {
            transcript = supaText;
        } else {
            console.warn("SupaData null, fallback mock");
            transcript = MOCK_SCRIPTS["good"];
            isMockTranscript = true;
        }
    } catch (e) {
        console.warn("Transcript error", e);
        transcript = MOCK_SCRIPTS["good"];
        isMockTranscript = true;
    }

    // 3. Extract Keyword
    let keyword = extractKeywordFromTitle(videoData.title);
    const aiKeyword = await extractBestKeyword(videoData.title, transcript);
    if (aiKeyword) {
        keyword = aiKeyword;
    }

    // 4. Market Analysis Data Preparation
    // 4.1 Demand: Search Volume (Naver)
    const naverStats = await getKeywordVolume(keyword);
    const monthlySearchVolume = naverStats ? naverStats.total : 5000;

    // 4.2 Supply: New Videos in last 30 Days (For C_sat)
    const thirtyDaysAgo = getDaysAgoISO(30);
    const nowISO = new Date().toISOString();
    const newVideoCount30d = await fetchVideoCount(keyword, thirtyDaysAgo, nowISO);

    // 4.3 Performance: Top 10 Videos Analysis
    const searchRes = await searchVideos(keyword, 10, 'relevance');
    const competitorCount = searchRes.totalResults;

    // Calculate Top Video Avg Views & Niche Ratio
    let topAvgViews = 10000;
    let smallChannelRatio = 0.3; // Default
    let topVideosList: any[] = [];

    if (searchRes.results.length > 0) {
        const topVideoIds = searchRes.results.map(r => r.videoId);
        let totalViews = 0;

        const videoDetailsPromises = topVideoIds.map(id => getVideoDetails(id));
        const videoDetailsList = await Promise.all(videoDetailsPromises);

        const validDetails = videoDetailsList.filter(v => v !== null) as any[];
        topVideosList = validDetails.slice(0, 5); // Store top 5 for UI

        if (validDetails.length > 0) {
            totalViews = validDetails.reduce((sum, v) => sum + v.viewCount, 0);
            topAvgViews = totalViews / validDetails.length;
        }

        // Calculate Niche Ratio (Rniche)
        const channelIds = validDetails.map(v => v.channelId);
        const channelDetailsMap = await getChannelsDetails(channelIds);

        let top1Subscribers = 0;
        if (channelIds.length > 0) {
            const top1Id = channelIds[0];
            const ch = channelDetailsMap.get(top1Id);
            if (ch) top1Subscribers = ch.subscriberCount;
        }

        let smallChannelCount = 0;
        validDetails.forEach(v => {
            const ch = channelDetailsMap.get(v.channelId);
            if (ch) {
                const subs = ch.subscriberCount;
                // Definition: < 50,000 OR < 10% of Top 1
                const isSmall = (subs < 50000) || (top1Subscribers > 0 && subs < (top1Subscribers * 0.1));
                if (isSmall) smallChannelCount++;
            }
        });

        smallChannelRatio = validDetails.length > 0 ? (smallChannelCount / validDetails.length) : 0;
    }

    // 5. Run Algorithms
    // 5.1 Market Analysis
    const marketStats = analyzeMarket(
        monthlySearchVolume,
        newVideoCount30d,
        topAvgViews,
        smallChannelRatio
    );

    // 5.2 Viral Velocity
    const uploadDate = new Date(videoData.publishedAt);
    const hoursSinceUpload = getStringDiffInHours(videoData.publishedAt);
    const viralVelocity = calculateViralVelocity(videoData.viewCount, hoursSinceUpload);

    // 6. AI Content Diagnosis
    let aiQuality = null;
    if (process.env.GEMINI_API_KEY) {
        try {
            aiQuality = await analyzeVideoQuality(
                videoData.title,
                keyword,
                transcript || "No Transcript"
            );
        } catch (e) {
            console.warn("AI Quality Analysis Failed", e);
        }
    }

    const dualCoreAnalysis = diagnoseVideo(
        transcript,
        videoData.title,
        keyword,
        marketStats,
        viralVelocity,
        aiQuality || undefined
    );

    const revenueEstimate = estimateRevenue(
        videoData.viewCount,
        mapCategory(videoData.categoryId, videoData.title),
        videoData.durationMinutes,
        videoData.publishedAt
    );

    // 7. Trend Data
    let trendData: number[] = [];
    try {
        if (keyword) {
            trendData = await fetchMonthlyTrend(keyword);
        } else {
            trendData = [0, 0, 0, 0, 0, 0];
        }
    } catch (e) {
        const mock = await getMockData(keyword);
        trendData = mock.keywordData.trend.slice(0, 6);
    }

    // Construct Result
    const trendAnalysis = {
        keywordData: {
            keyword: keyword,
            searchVolume: monthlySearchVolume,
            pcVolume: naverStats ? naverStats.pc : 0,
            mobileVolume: naverStats ? naverStats.mobile : 0,
            videoCount: newVideoCount30d, // Show New for 'saturation' calculation context
            trend: trendData,
            competitionIntensity: marketStats.saturationIndex,
            avgViews: Math.round(topAvgViews)
        },
        topVideos: [],
        relatedKeywords: []
    };

    const scriptAnalysis = analyzeScript(transcript);

    return {
        metadata: {
            videoId: videoData.id,
            title: videoData.title,
            thumbnailUrl: videoData.thumbnailUrl,
            channelName: videoData.channelTitle,
            publishedAt: videoData.publishedAt.split('T')[0],
            durationMinutes: videoData.durationMinutes,
            viewCount: videoData.viewCount
        },
        transcript,
        extractedKeyword: keyword,
        scriptAnalysis,
        trendAnalysis: trendAnalysis as any,
        dualCoreAnalysis,
        revenueEstimate,
        isMockTranscript,
        topVideos: topVideosList
    };
}

// Helper
function getStringDiffInHours(dateStr: string): number {
    const uploadDate = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - uploadDate.getTime();
    return diffMs / (1000 * 60 * 60);
}

// Fallback Mock Logic (Updated)
async function processMockUrl(videoId: string): Promise<VideoDiagnosticsResult> {
    const mockMetadata: VideoMetadata = {
        videoId,
        title: "Mock Video Title (API Limit/Error)",
        thumbnailUrl: "https://via.placeholder.com/320x180",
        channelName: "Mock Channel",
        publishedAt: "2024-01-01",
        durationMinutes: 10,
        viewCount: 50000
    };

    const keyword = "MockKeyword";
    const transcript = MOCK_SCRIPTS["good"];

    // Simulate Data
    const market = analyzeMarket(10000, 50, 50000, 0.4);
    const diag = diagnoseVideo(transcript, mockMetadata.title, keyword, market, 100);
    const rev = estimateRevenue(50000, "vlog", 10, "2024-01-01");
    const trend = await getMockData(keyword);

    return {
        metadata: mockMetadata,
        transcript,
        extractedKeyword: keyword,
        scriptAnalysis: analyzeScript(transcript),
        trendAnalysis: trend,
        dualCoreAnalysis: diag,
        revenueEstimate: rev
    };
}

function mapCategory(catIdStr: string, title: string): string {
    const catId = parseInt(catIdStr);
    let category = "vlog";
    if (catId === 20 || catId === 24) category = "entertainment";
    if (catId === 28) category = "tech";
    if (catId === 27) category = "education";
    if (catId === 25) category = "news"; // News/Politics

    if (title.includes("주식") || title.includes("투자") || title.includes("코인")) category = "finance";
    if (title.includes("아이폰") || title.includes("갤럭시")) category = "tech";

    return category;
}

function extractVideoId(url: string) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}
