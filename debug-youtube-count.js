require('dotenv').config({ path: '.env.local' });
const axios = require('axios');

const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

async function fetchVideoCount(query, publishedAfter, publishedBefore) {
    if (!API_KEY) {
        console.log("No API KEY");
        return 0;
    }
    try {
        const url = `${BASE_URL}/search?part=id&q=${encodeURIComponent(query)}&type=video&publishedAfter=${publishedAfter}&publishedBefore=${publishedBefore}&maxResults=1&key=${API_KEY}`;
        console.log(`Fetching: ${url}`);
        const res = await axios.get(url);

        console.log("Full Data:", JSON.stringify(res.data, null, 2));
        return parseInt(res.data.pageInfo?.totalResults || "0");
    } catch (e) {
        console.error("YouTube Count Fetch Error:", e.response ? e.response.data : e.message);
        return 0;
    }
}

async function run() {
    const keyword = "단식";
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const count = await fetchVideoCount(keyword, thirtyDaysAgo.toISOString(), now.toISOString());
    console.log(`Monthly Video Count for '${keyword}': ${count}`);
}

run();
