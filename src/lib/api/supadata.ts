
const SUPADATA_API_URL = "https://api.supadata.ai/v1/youtube/transcript";

export interface SupaDataSegment {
    text: string;
    offset: number;
    duration: number;
    lang: string;
}

export interface SupaDataTranscriptResponse {
    id: string;
    url: string;
    content: SupaDataSegment[]; // Correct field name from test
    lang: string;
    availableLangs: string[];
}

export async function getSupaDataTranscript(videoId: string): Promise<string | null> {
    const apiKey = process.env.SUPADATA_API_KEY;
    if (!apiKey) {
        console.warn("SupaData API Key is missing.");
        return null;
    }

    try {
        // Request Korean preference
        const url = `${SUPADATA_API_URL}?videoId=${videoId}&lang=ko`;
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "x-api-key": apiKey
            }
        });

        if (!response.ok) {
            console.error(`SupaData API Error: ${response.status} ${response.statusText}`);
            return null;
        }

        const data: SupaDataTranscriptResponse = await response.json();

        if (data.content && Array.isArray(data.content)) {
            // Join all segment texts into one string
            return data.content.map(seg => seg.text).join(" ");
        }

        return null;

    } catch (error) {
        console.error("SupaData Fetch Error:", error);
        return null;
    }
}
