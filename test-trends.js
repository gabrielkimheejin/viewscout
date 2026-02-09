
async function fetchGoogleTrends() {
    const urls = [
        'https://trends.google.com/trends/hottrends/atom/feed?pn=p23', // p23 = South Korea
        'https://trends.google.co.kr/trends/hottrends/atom/feed?pn=p23'
    ];

    for (const url of urls) {
        try {
            console.log(`Trying URL: ${url}`);
            const response = await fetch(url);

            if (response.ok) {
                console.log(`Success with: ${url}`);
                const xml = await response.text();
                // console.log("Partial XML:", xml.substring(0, 200));
                const items = [];
                const itemRegex = /<item>[\s\S]*?<\/item>/g;
                const titleRegex = /<title>(.*?)<\/title>/;
                const trafficRegex = /<ht:approx_traffic>(.*?)<\/ht:approx_traffic>/;

                const matches = xml.match(itemRegex);

                if (matches) {
                    matches.slice(0, 5).forEach(itemStr => {
                        const titleMatch = itemStr.match(titleRegex);
                        const trafficMatch = itemStr.match(trafficRegex);
                        if (titleMatch) {
                            items.push({
                                title: titleMatch[1],
                                traffic: trafficMatch ? trafficMatch[1] : '?'
                            });
                        }
                    });
                }
                return items;
            } else {
                console.log(`Failed: ${url} - Status: ${response.status}`);
            }
        } catch (e) {
            console.log(`Error with ${url}: ${e.message}`);
        }
    }
    return [];
}

async function test() {
    console.log("Fetching trends with Node fetch...");
    const trends = await fetchGoogleTrends();
    console.log("Trends Result:", trends);
}

test();
