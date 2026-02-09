
// require('dotenv').config({ path: '.env.local' });

async function testSupaData() {
    const videoId = "2MnF0sqnZ2w"; // User provided video
    const apiKey = process.env.SUPADATA_API_KEY;

    if (!apiKey) {
        console.error("No API Key in .env.local");
        return;
    }

    console.log(`Testing SupaData for Video ID: ${videoId} with Key: ${apiKey.slice(0, 5)}...`);

    const url = `https://api.supadata.ai/v1/youtube/transcript?videoId=${videoId}`;
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "x-api-key": apiKey
            }
        });

        if (!response.ok) {
            console.error("API Error:", response.status, response.statusText);
            const text = await response.text();
            console.error("Body:", text);
            return;
        }

        const data = await response.json();
        console.log("✅ Use Success!");
        if (data.content && Array.isArray(data.content)) {
            console.log("First 5 Segments:");
            console.log(data.content.slice(0, 5));
        } else {
            console.log("No content array found.");
        }
        console.log("Available Langs:", data.availableLangs);

    } catch (e) {
        console.error("Fetch Error:", e);
    }
}

testSupaData();
