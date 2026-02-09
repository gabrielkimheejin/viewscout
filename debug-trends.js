const axios = require('axios');
const xml2js = require('xml2js');

async function debugTrends() {
    try {
        console.log("[Debug] Fetching via Axios...");

        const response = await axios.get('https://trends.google.com/trending/rss?geo=KR', {
            headers: {
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Cache-Control": "no-cache",
                "Pragma": "no-cache"
            },
            timeout: 5000
        });

        console.log(`[Debug] Status: ${response.status}`);
        const xml = response.data;
        console.log(`[Debug] XML received (${xml.length} chars)`);

        const result = await xml2js.parseStringPromise(xml);

        const rssItems = result?.rss?.channel?.[0]?.item;

        if (!rssItems) {
            console.log("No items found in parsed XML.");
            console.log(JSON.stringify(result, null, 2));
            return;
        }

        console.log(`[Debug] Parsed ${rssItems.length} items`);
        rssItems.slice(0, 3).forEach(item => {
            console.log("Title:", item.title?.[0]);
            console.log("Traffic:", item['ht:approx_traffic']?.[0]);
        });

    } catch (error) {
        console.error("Error:", error.message);
        if (error.response) {
            console.error("Response data:", error.response.data);
        }
    }
}

debugTrends();
