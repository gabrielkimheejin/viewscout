
async function testUrls() {
    const urls = [
        'https://trends.google.co.kr/trends/trendingsearches/daily/rss?geo=KR',
        'https://trends.google.com/trends/trendingsearches/daily/rss?geo=KR', // Failed
        'https://trends.google.com/trending/rss?geo=KR',
        'https://trends.google.co.kr/trending/rss?geo=KR'
    ];

    for (const url of urls) {
        try {
            console.log(`Testing: ${url}`);
            const response = await fetch(url);
            if (response.ok) {
                console.log(`SUCCESS: ${url}`);
                const xml = await response.text();
                // Check if it's real XML/RSS
                if (xml.includes('<rss') || xml.includes('<feed')) {
                    console.log("Valid RSS/Feed found.");
                    const itemMatch = xml.match(/<item>[\s\S]*?<\/item>/);
                    if (itemMatch) {
                        console.log("Found item:", itemMatch[0].match(/<title>(.*?)<\/title>/)[1]);
                    }
                    return; // Stop after first success
                } else {
                    console.log("Response OK but not RSS/XML.");
                }
            } else {
                console.log(`FAILED: ${response.status}`);
            }
        } catch (e) {
            console.log(`ERROR: ${e.message}`);
        }
    }
}

testUrls();
