export interface TrendingKeyword {
    id: string;
    rank: number;
    keyword: string;
    volume: number;
    velocity: number; // Growth %
    competition: "Blue" | "Red";
    topVideos: { title: string; views: string }[];
}

export interface DarkHorseVideo {
    id: string;
    title: string;
    thumbnail: string;
    channelName: string;
    subscribers: number;
    viewCount: number;
    uploadDate: string;
    performanceRatio: number; // (Views / Subs) * 100
    url: string;
}

const MOCK_KEYWORDS: Record<string, string[]> = {
    all: ["탕후루 오마카세", "GPT-5 기능", "아이폰 16 유출", "비트코인 반감기", "푸바오 근황", "봄 코디 추천", "다이어트 식단"],
    beauty: ["물광 피부법", "올리브영 세일", "퍼스널 컬러 자가진단", "봄 웜톤 립스틱", "겟레디윗미"],
    tech: ["갤럭시 S24 울트라", "AI 영상 편집", "코딩 독학", "맥북 프로 M3", "테크 유튜버 장비"],
    money: ["삼성전자 주가", "공모주 청약", "부동산 전망", "비트코인 ETF", "세액공제 팁"],
};

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

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return data.items.map((item: any) => {
            const title: string = item.snippet.title;
            const cleaned = title
                .replace(/\[.*?\]/g, '')
                .replace(/【.*?】/g, '')
                .replace(/\(.*?\)/g, '')
                .replace(/[|｜·]/g, ' ')
                .trim();
            const short = cleaned.split(/\s*[-~:,]\s*/)[0].trim();
            return short.length > 2 ? short.slice(0, 30).trim() : cleaned.slice(0, 30).trim();
        });
    } catch (error) {
        console.error('YouTube Trending fetch error:', error);
        return [];
    }
}

export async function fetchTrendingKeywords(category: string = "all"): Promise<TrendingKeyword[]> {
    try {
        // Fetch real Google Trends data
        const response = await fetch('https://trends.google.co.kr/trending/rss?geo=KR&hl=ko', {
            cache: 'no-store' // Always get fresh data
        });

        if (!response.ok) {
            throw new Error('Failed to fetch trends');
        }

        const xml = await response.text();

        // Parse the RSS XML
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

            // Generate realistic-looking volume and velocity based on traffic
            const volume = traffic * 100 + Math.floor(Math.random() * 50000);
            const velocity = Math.floor(Math.random() * 500) + 100; // 100% ~ 600%

            return {
                id: `trend-${i}`,
                rank: i + 1,
                keyword,
                volume,
                velocity,
                competition: velocity > 300 ? "Blue" : "Red", // High growth = Blue Ocean opportunity
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
            const ytTitles = await fetchYouTubeTrendingTitles(needed + 5);

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

        // Sort by velocity (growth) descending and re-assign ranks
        return keywords
            .sort((a, b) => b.velocity - a.velocity)
            .map((item, idx) => ({ ...item, rank: idx + 1 }));

    } catch (error) {
        console.error('Failed to fetch trending keywords:', error);

        // Fallback to mock data if API fails
        const keys = MOCK_KEYWORDS[category] || MOCK_KEYWORDS["all"];
        return keys.map((k, i) => {
            const velocity = Math.floor(Math.random() * 500) + 50;
            const volume = Math.floor(Math.random() * 500000) + 10000;
            return {
                id: `k-${i}`,
                rank: i + 1,
                keyword: k,
                volume,
                velocity,
                competition: (Math.random() > 0.6 ? "Red" : "Blue") as "Blue" | "Red",
                topVideos: [
                    { title: `${k} 관련 화제의 영상 1`, views: "120만" },
                    { title: `${k} 솔직 후기`, views: "85만" },
                    { title: `${k} 절대 하지 마세요`, views: "45만" },
                ]
            };
        }).sort((a, b) => b.velocity - a.velocity)
            .map((item, idx) => ({ ...item, rank: idx + 1 }));
    }
}

export async function fetchDarkHorseVideos(category: string = "all"): Promise<DarkHorseVideo[]> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    return Array.from({ length: 6 }).map((_, i) => {
        const subs = Math.floor(Math.random() * 5000) + 500; // 500 ~ 5500 subs (Small channel)
        const views = subs * (Math.floor(Math.random() * 20) + 5); // 5x ~ 25x views

        return {
            id: `dh-${i}`,
            title: category === "tech" ? `구독자 ${subs}명인데 조회수 ${views}회 터진 리뷰` : `알고리즘이 선택한 의문의 영상 #${i + 1}`,
            thumbnail: `https://source.unsplash.com/random/800x450?sig=${i}&${category}`, // Random placeholder
            channelName: `하꼬 채널 ${i + 1}`,
            subscribers: subs,
            viewCount: views,
            uploadDate: "2일 전",
            performanceRatio: Math.floor((views / subs) * 100),
            url: "https://www.youtube.com/watch?v=mock"
        };
    });
}
