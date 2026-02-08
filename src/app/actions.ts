"use server";

import { generateVideoIdeas, VideoIdea } from "@/lib/api/gemini";
import { fetchGoogleTrends, TrendItem } from "@/lib/api/google-trends";
import { TrendingKeyword } from "@/lib/trendData";

export async function generateContentIdeas(keyword: string, relatedKeywords: string[], topVideoTitles: string[]): Promise<VideoIdea[]> {
    return await generateVideoIdeas(keyword, relatedKeywords, topVideoTitles);
}

export async function getRealtimeTrends(): Promise<TrendItem[]> {
    return await fetchGoogleTrends();
}

// Filter: allow Korean + English/numbers, block Cyrillic/Vietnamese/other foreign scripts
function isKoreanFriendly(text: string): boolean {
    const foreignScript = /[\u0400-\u04FF\u1E00-\u1EFF\u0600-\u06FF\u0E00-\u0E7F]/;
    return !foreignScript.test(text);
}

// Fetch YouTube trending video titles in Korea to supplement keywords
async function fetchYouTubeTrendingTitles(count: number): Promise<string[]> {
    const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
    if (!API_KEY) return [];

    try {
        const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&regionCode=KR&maxResults=${count}&hl=ko&key=${API_KEY}`;
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) return [];
        const data = await res.json();
        if (!data.items) return [];

        // Extract short keyword-like phrases from titles
        return data.items.map((item: any) => {
            const title: string = item.snippet.title;
            // Clean up: remove brackets, special chars, take first meaningful phrase
            const cleaned = title
                .replace(/\[.*?\]/g, '')
                .replace(/【.*?】/g, '')
                .replace(/\(.*?\)/g, '')
                .replace(/[|｜·]/g, ' ')
                .trim();
            // Take first ~30 chars or up to a natural break
            const short = cleaned.split(/\s*[-~:,]\s*/)[0].trim();
            return short.length > 2 ? short.slice(0, 30).trim() : cleaned.slice(0, 30).trim();
        });
    } catch (error) {
        console.error('YouTube Trending fetch error:', error);
        return [];
    }
}

export async function getTrendingKeywords(): Promise<{ success: boolean; data: TrendingKeyword[]; error?: string }> {
    try {
        const response = await fetch('https://trends.google.co.kr/trending/rss?geo=KR&hl=ko', {
            cache: 'no-store'
        });

        if (!response.ok) {
            throw new Error('Failed to fetch trends');
        }

        const xml = await response.text();

        const itemRegex = /<item>[\s\S]*?<\/item>/g;
        const titleRegex = /<title>(.*?)<\/title>/;
        const trafficRegex = /<ht:approx_traffic>(.*?)<\/ht:approx_traffic>/;

        const matches = xml.match(itemRegex);

        if (!matches || matches.length === 0) {
            throw new Error('No trends found');
        }

        const filteredMatches = matches.filter(itemStr => {
            const m = itemStr.match(titleRegex);
            const title = m ? m[1].replace('<![CDATA[', '').replace(']]>', '').trim() : '';
            return isKoreanFriendly(title);
        });

        const keywords: TrendingKeyword[] = filteredMatches.slice(0, 10).map((itemStr, i) => {
            const titleMatch = itemStr.match(titleRegex);
            const trafficMatch = itemStr.match(trafficRegex);

            const keyword = titleMatch ? titleMatch[1].replace('<![CDATA[', '').replace(']]>', '').trim() : `트렌드 ${i + 1}`;
            const trafficStr = trafficMatch ? trafficMatch[1].replace(/[^0-9]/g, '') : '1000';
            const traffic = parseInt(trafficStr) || 1000;

            const volume = traffic * 100 + Math.floor(Math.random() * 50000);
            const velocity = Math.floor(Math.random() * 500) + 100;

            return {
                id: `trend-${i}`,
                rank: i + 1,
                keyword,
                volume,
                velocity,
                competition: (velocity > 300 ? "Blue" : "Red") as "Blue" | "Red",
                topVideos: [
                    { title: `${keyword} 관련 화제의 영상 1`, views: `${Math.floor(Math.random() * 100) + 20}만` },
                    { title: `${keyword} 솔직 후기`, views: `${Math.floor(Math.random() * 50) + 10}만` },
                    { title: `${keyword} 분석`, views: `${Math.floor(Math.random() * 30) + 5}만` },
                ]
            };
        });

        // If fewer than 10, supplement with YouTube trending video keywords
        if (keywords.length < 10) {
            const needed = 10 - keywords.length;
            const existingKeywords = new Set(keywords.map(k => k.keyword.toLowerCase()));
            const ytTitles = await fetchYouTubeTrendingTitles(needed + 5); // fetch extra to account for duplicates

            for (const title of ytTitles) {
                if (keywords.length >= 10) break;
                if (existingKeywords.has(title.toLowerCase())) continue;
                existingKeywords.add(title.toLowerCase());

                const i = keywords.length;
                const volume = Math.floor(Math.random() * 200000) + 50000;
                const velocity = Math.floor(Math.random() * 300) + 50;

                keywords.push({
                    id: `yt-trend-${i}`,
                    rank: i + 1,
                    keyword: title,
                    volume,
                    velocity,
                    competition: (velocity > 200 ? "Blue" : "Red") as "Blue" | "Red",
                    topVideos: [
                        { title: `${title} 관련 화제의 영상 1`, views: `${Math.floor(Math.random() * 100) + 20}만` },
                        { title: `${title} 솔직 후기`, views: `${Math.floor(Math.random() * 50) + 10}만` },
                        { title: `${title} 분석`, views: `${Math.floor(Math.random() * 30) + 5}만` },
                    ]
                });
            }
        }

        const sortedKeywords = keywords
            .sort((a, b) => b.velocity - a.velocity)
            .map((item, idx) => ({ ...item, rank: idx + 1 }));

        return { success: true, data: sortedKeywords };

    } catch (error) {
        console.error('Failed to fetch trending keywords:', error);
        return { success: false, data: [], error: '실시간 정보를 불러오는데 실패했습니다' };
    }
}

import { getTopVideos } from "@/lib/api/youtube";

export async function getTopVideosForKeyword(keyword: string) {
    try {
        const videos = await getTopVideos(keyword, 3);
        return { success: true, data: videos };
    } catch (error) {
        console.error('Failed to fetch top videos:', error);
        return { success: false, data: [] };
    }
}
