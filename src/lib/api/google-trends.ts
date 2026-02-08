export interface TrendItem {
    title: string;
    traffic: string;
    pubDate: string;
}

export async function fetchGoogleTrends(): Promise<TrendItem[]> {
    try {
        const response = await fetch('https://trends.google.co.kr/trending/rss?geo=KR&hl=ko', {
            next: { revalidate: 3600 } // Cache for 1 hour
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch trends: ${response.status}`);
        }

        const xml = await response.text();
        const items: TrendItem[] = [];

        // Simple Regex to extract items (No external XML parser needed for this simple structure)
        // Structure: <item><title>...</title>...<ht:approx_traffic>...</ht:approx_traffic>...</item>
        const itemRegex = /<item>[\s\S]*?<\/item>/g;
        const titleRegex = /<title>(.*?)<\/title>/;
        const trafficRegex = /<ht:approx_traffic>(.*?)<\/ht:approx_traffic>/;
        const pubDateRegex = /<pubDate>(.*?)<\/pubDate>/;

        const matches = xml.match(itemRegex);

        // Filter: allow Korean + English/numbers, block Cyrillic/Vietnamese/other scripts
        const isKoreanFriendly = (text: string) => {
            const foreignScript = /[\u0400-\u04FF\u1E00-\u1EFF\u0600-\u06FF\u0E00-\u0E7F]/;
            return !foreignScript.test(text);
        };

        if (matches) {
            const filteredMatches = matches.filter(itemStr => {
                const m = itemStr.match(titleRegex);
                const title = m ? m[1].replace('<![CDATA[', '').replace(']]>', '').trim() : '';
                return isKoreanFriendly(title);
            });
            filteredMatches.slice(0, 10).forEach(itemStr => {
                const titleMatch = itemStr.match(titleRegex);
                const trafficMatch = itemStr.match(trafficRegex);
                const pubDateMatch = itemStr.match(pubDateRegex);

                if (titleMatch && trafficMatch) {
                    items.push({
                        title: titleMatch[1].replace('<![CDATA[', '').replace(']]>', ''),
                        traffic: trafficMatch[1].replace('+', ''), // "20,000+" -> "20,000"
                        pubDate: pubDateMatch ? pubDateMatch[1] : ''
                    });
                }
            });
        }

        return items;

    } catch (error) {
        console.error("Google Trends Fetch Error:", error);
        return [];
    }
}
