"use server";

import { processYoutubeUrl, VideoDiagnosticsResult } from "@/lib/video-diagnostics";

/**
 * Server Action to process YouTube Video Diagnosis.
 * This runs on the server, ensuring access to private API keys (SupaData, Gemini, etc).
 */
export async function analyzeVideoAction(url: string): Promise<VideoDiagnosticsResult> {
    try {
        console.log(`[ServerAction] Analyzing URL: ${url}`);
        const result = await processYoutubeUrl(url);
        return result;
    } catch (error) {
        console.error("Analysis Failed:", error);
        throw new Error("Failed to analyze video. Please check the URL and try again.");
    }
}
