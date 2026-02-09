const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

export interface YouTubeVideoDetails {
    id: string;
    title: string;
    description: string;
    thumbnailUrl: string;
    channelTitle: string;
    channelId: string;
    publishedAt: string;
    viewCount: number;
    duration: string; // ISO 8601
    durationMinutes: number; // Parsed
    categoryId: string;
}

export interface YouTubeSearchResult {
    videoId: string;
    title: string;
    channelId: string;
    publishedAt: string;
}

export interface YouTubeChannelDetails {
    id: string;
    subscriberCount: number;
    videoCount: number;
}

// Helper: Parse ISO 8601 Duration (PT1H2M10S)
function parseDuration(duration: string): number {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return 0;
    const hours = (parseInt(match[1]) || 0);
    const minutes = (parseInt(match[2]) || 0);
    const seconds = (parseInt(match[3]) || 0);
    return (hours * 60) + minutes + (seconds / 60);
}

// 1. Get Single Video Details (For Revenue & Diagnosis)
export async function getVideoDetails(videoId: string): Promise<YouTubeVideoDetails | null> {
    const res = await getVideosDetails([videoId]);
    return res[0] || null;
}

// 1.1 Get Multiple Video Details (Batch)
export async function getVideosDetails(videoIds: string[]): Promise<YouTubeVideoDetails[]> {
    if (!API_KEY || videoIds.length === 0) return [];

    try {
        const uniqueIds = Array.from(new Set(videoIds));
        const url = `${BASE_URL}/videos?part=snippet,contentDetails,statistics&id=${uniqueIds.join(',')}&key=${API_KEY}`;
        const res = await fetch(url);
        const data = await res.json();

        if (!data.items) return [];

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return data.items.map((item: any) => ({
            id: item.id,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnailUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
            channelTitle: item.snippet.channelTitle,
            channelId: item.snippet.channelId,
            publishedAt: item.snippet.publishedAt,
            viewCount: parseInt(item.statistics.viewCount || "0"),
            duration: item.contentDetails.duration,
            durationMinutes: parseDuration(item.contentDetails.duration),
            categoryId: item.snippet.categoryId
        }));
    } catch (error) {
        console.error("YouTube API Error (getVideosDetails):", error);
        return [];
    }
}

// 1.2 Search and Get Details (Helper)
export async function getTopVideos(query: string, maxResults: number = 3): Promise<YouTubeVideoDetails[]> {
    const { results } = await searchVideos(query, maxResults, 'viewCount'); // Order by viewCount for "Top Videos"
    if (results.length === 0) return [];

    const videoIds = results.map(r => r.videoId);
    return await getVideosDetails(videoIds);
}

// 2. Search Videos (For Market Supply)
export async function searchVideos(query: string, maxResults: number = 20, order: 'relevance' | 'viewCount' = 'relevance'): Promise<{
    results: YouTubeSearchResult[],
    totalResults: number
}> {
    if (!API_KEY) return { results: [], totalResults: 0 };

    try {
        // type=video to filter only videos
        const url = `${BASE_URL}/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=${maxResults}&order=${order}&key=${API_KEY}`;
        const res = await fetch(url);
        if (!res.ok) {
            console.error(`YouTube Search API Error: ${res.status}`);
            return { results: [], totalResults: 0 };
        }
        const text = await res.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.error("YouTube Search JSON Parse Error:", e, text);
            return { results: [], totalResults: 0 };
        }

        if (!data.items) return { results: [], totalResults: 0 };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const results = data.items.map((item: any) => ({
            videoId: item.id.videoId,
            title: item.snippet.title,
            channelId: item.snippet.channelId,
            publishedAt: item.snippet.publishedAt
        }));

        // pageInfo.totalResults is an estimation
        return {
            results,
            totalResults: data.pageInfo?.totalResults || 0
        };
    } catch (error) {
        console.error("YouTube API Error (searchVideos):", error);
        return { results: [], totalResults: 0 };
    }
}

// 3. Get Channel Details (For Niche Analysis - Subscriber Count)
// 3. Get Channel Details (Single or Batch)
export async function getChannelsDetails(channelIds: string[]): Promise<Map<string, YouTubeChannelDetails>> {
    if (!API_KEY || channelIds.length === 0) return new Map();

    try {
        const uniqueIds = Array.from(new Set(channelIds));
        const url = `${BASE_URL}/channels?part=statistics&id=${uniqueIds.join(',')}&key=${API_KEY}`;
        const res = await fetch(url);
        if (!res.ok) return new Map();

        const data = await res.json();
        if (!data.items) return new Map();

        const resultMap = new Map<string, YouTubeChannelDetails>();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data.items.forEach((item: any) => {
            resultMap.set(item.id, {
                id: item.id,
                subscriberCount: parseInt(item.statistics.subscriberCount || "0"),
                videoCount: parseInt(item.statistics.videoCount || "0")
            });
        });

        return resultMap;
    } catch (error) {
        console.error("YouTube API Error (getChannelsDetails):", error);
        return new Map();
    }
}

// 4. Fetch Video Count for Date Range
export async function fetchVideoCount(query: string, publishedAfter: string, publishedBefore: string): Promise<number> {
    if (!API_KEY) return 0;
    try {
        const url = `${BASE_URL}/search?part=id&q=${encodeURIComponent(query)}&type=video&publishedAfter=${publishedAfter}&publishedBefore=${publishedBefore}&maxResults=1&key=${API_KEY}`;
        const res = await fetch(url);
        if (!res.ok) return 0;
        const data = await res.json();
        return parseInt(data.pageInfo?.totalResults || "0");
    } catch (e) {
        console.error("YouTube Count Fetch Error:", e);
        return 0;
    }
}

// 5. Fetch Monthly Trend (Last 6 Months)
export async function fetchMonthlyTrend(query: string): Promise<number[]> {
    const months = 6;
    const promises = [];
    const now = new Date();

    for (let i = 0; i < months; i++) {
        // Calculate Start/End of each month going backwards
        // M-0: Current Month (Partial) -> e.g. 2024-03-01 to 2024-03-31
        // Actually, "Last 6 Months relative to now".
        // Let's do distinct blocks: [Month-5, Month-4, ..., Month-0]

        const d = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1);
        const start = d.toISOString();

        const nextMonth = new Date(d.getFullYear(), d.getMonth() + 1, 1);
        const end = nextMonth.toISOString();

        promises.push(fetchVideoCount(query, start, end));
    }

    try {
        const results = await Promise.all(promises);
        return results;
    } catch (e) {
        console.error("Trend Fetch Error:", e);
        return Array(months).fill(0);
    }
}

export async function getChannelDetails(channelId: string): Promise<YouTubeChannelDetails | null> {
    const map = await getChannelsDetails([channelId]);
    return map.get(channelId) || null;
}

// Helper to get ISO date string for X days ago
function getIsoDate(daysAgo: number): string {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString();
}

/**
 * Fetch video counts for the last 7 days individually.
 * Warning: Consumes 7 API quotas per call.
 */
export async function fetchLast7DaysVolume(query: string): Promise<{ day: string, value: number }[]> {
    const promises = [];

    // 0 = Today, 1 = Yesterday, ...
    for (let i = 0; i < 7; i++) {
        const start = getIsoDate(i + 1); // e.g. Yesterday start
        const end = getIsoDate(i);     // e.g. Today start (Yesterday end)

        // Use fetchVideoCount for each 24h block
        promises.push(
            fetchVideoCount(query, start, end).then(count => ({
                day: i === 0 ? '오늘' : i === 1 ? '어제' : `${i}일 전`,
                value: count
            }))
        );
    }

    try {
        // Run in parallel
        const results = await Promise.all(promises);
        // Reverse to be [6 days ago, ..., Today]
        return results.reverse();
    } catch (e) {
        console.error("Last 7 Days Fetch Error:", e);
        return [];
    }
}
