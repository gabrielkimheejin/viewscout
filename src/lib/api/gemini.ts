
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface VideoIdea {
    type: "Viral Hit" | "Search-Optimized" | "Creative Twist";
    title: string;
    reason: string;
}

export async function generateVideoIdeas(
    keyword: string,
    relatedKeywords: string[],
    topVideoTitles: string[]
): Promise<VideoIdea[]> {
    if (!process.env.GEMINI_API_KEY) {
        console.warn("GEMINI_API_KEY is missing");
        return [
            { type: "Viral Hit", title: "[ERROR] GEMINI_API_KEY가 설정되지 않음", reason: \`환경변수 목록: \${Object.keys(process.env).filter(k => k.includes('GEMINI') || k.includes('API')).join(', ')}\` },
            { type: "Search-Optimized", title: "환경변수 누락", reason: "Vercel 대시보드에서 GEMINI_API_KEY를 확인하세요" },
            { type: "Creative Twist", title: "디버그", reason: "process.env.GEMINI_API_KEY is falsy" }
        ];
    }

    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-3-flash-preview",
            generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = `You are an expert YouTube Strategist. Your goal is to generate 3 high-performing video ideas by combining User Search Intent and Market Success Patterns.
        
        KEYWORD: '${keyword}'

        DATA SOURCES:
        1. User Search Intent (Naver Related Keywords): ${relatedKeywords.slice(0, 10).join(', ') || "None provided"}
           - Insight: This tells you what people are specifically curious about right now.
        
        2. Market Success Patterns (Top 10 Videos by Views): ${topVideoTitles.slice(0, 10).join(', ') || "None provided"}
           - Insight: This tells you what formats (e.g., Mukbang, Vlog, Tutorial) are getting the most views.

        STRATEGY:
        1. Analyze the "Search Intent" to find the core need (e.g., "Recipe", "Price", "Review").
        2. Analyze the "Market Pattern" to find the winning format (e.g., "vs Comparison", "Shorts", "ASMR").
        3. Combine them to create a "Killer Title".
        
        TASK:
        Generate 3 distinct video ideas based on this synthesis:
        1. Viral Hit (Focus on high click-through rate, curiosity gap).
        2. Search-Optimized (Focus on exact keyword match and solving specific problems).
        3. Creative Twist (A unique angle that stands out from the competition).
        
        CRITICAL INSTRUCTION:
        - Output strictly in KOREAN (Hangul).
        - The title must be natural and catchy for a Korean audience.
        
        Output Constraint: Return ONLY a raw JSON array. Do not use Markdown formatting (\`\`\`json).
        
        JSON Schema: [ { "type": "Viral Hit", "title": "한국어 제목", "reason": "이 제목이 왜 효과적인지 트렌드 기반으로 한국어로 설명" }, ... ]`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Cleaning Logic: Remove Markdown code blocks if present
        const cleanedText = text.replace(/```json|```/g, '').trim();

        // Parse JSON
        const ideas: VideoIdea[] = JSON.parse(cleanedText);

        // Validate Structure (Simple check)
        if (!Array.isArray(ideas) || ideas.length === 0) {
            throw new Error("Invalid JSON structure returned");
        }

        return ideas.slice(0, 3);

    } catch (error: unknown) {
        const errMsg = error instanceof Error ? error.message : String(error);
        console.error("Gemini Generation Error:", errMsg);
        return [
            { type: "Viral Hit", title: `[ERROR] ${errMsg.slice(0, 80)}`, reason: `GEMINI_API_KEY exists: ${!!process.env.GEMINI_API_KEY}, key prefix: ${(process.env.GEMINI_API_KEY || '').slice(0, 10)}...` },
            { type: "Search-Optimized", title: "Gemini API 호출 실패", reason: errMsg.slice(0, 200) },
            { type: "Creative Twist", title: "디버그 정보", reason: \`model: gemini-3-flash-preview, env keys: \${Object.keys(process.env).filter(k => k.includes('GEMINI')).join(', ')}\` }
        ];
    }
}

function fallbackIdeas(keyword: string): VideoIdea[] {
    return [
        { type: "Viral Hit", title: `Shocking Truth About ${keyword}`, reason: "High curiosity gap." },
        { type: "Search-Optimized", title: `${keyword} Complete Guide 2024`, reason: "Matches search intent." },
        { type: "Creative Twist", title: `I tried ${keyword} for 30 Days`, reason: "Personal challenge format." }
    ];
}

export interface AIQualityAnalysis {
    metadata: { score: number; reason: string };
    script: { score: number; reason: string };
    relevance: { score: number; reason: string };
    feedback: string[];
    summary: string;
}

export async function analyzeVideoQuality(
    title: string,
    keyword: string,
    transcript: string
): Promise<AIQualityAnalysis | null> {
    if (!process.env.GEMINI_API_KEY) return null;

    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-3-flash-preview",
            generationConfig: { responseMimeType: "application/json" }
        });

        // Truncate transcript to avoid token limits (approx 5-10 mins needed)
        const safeTranscript = transcript.slice(0, 15000);

        const prompt = `You are a strict YouTube Content Auditor. Analyze this video data against the keyword '${keyword}'.

        Data:
        - Title: "${title}"
        - Transcript (First 5k chars): "${safeTranscript}..."
        
        TASK:
        Evaluate 3 metrics (0-100 scale) and provide specific feedback in KOREAN.
        
        1. Metadata Score (Title/Thumbnail potential): Is the title click-baity? Does it use strong power words?
        2. Script Score (Structure/Hook): Is the first 60s gripping? Is there logical structure?
        3. Relevance Score: Does the content actually deliver on the keyword's promise?
        
        CRITICAL:
        - Be critical. Don't give high scores easily.
        - Feedback strings must be actionable advice in Korean.

        JSON Schema:
        {
            "metadata": { "score": 85, "reason": "Evaluated based on..." },
            "script": { "score": 70, "reason": "Evaluated based on..." },
            "relevance": { "score": 90, "reason": "Evaluated based on..." },
            "feedback": ["Title is good but...", "Script needs more...", "Keyword density is..."],
            "summary": "3-sentence summary of the video content in Korean."
        }`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().replace(/```json|```/g, '').trim();

        return JSON.parse(text) as AIQualityAnalysis;

    } catch (error) {
        console.error("Gemini Diagnosis Error:", error);
        return null;

    }
}

export async function extractBestKeyword(title: string, transcript: string): Promise<string | null> {
    if (!process.env.GEMINI_API_KEY) return null;

    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash-exp",
            generationConfig: { responseMimeType: "text/plain" }
        });

        const prompt = `
        Analyze the following YouTube video data and identify the SINGLE most important "Search Keyword" (Core Topic).
        
        Input:
        - Title: "${title}"
        - Transcript Start: "${transcript.slice(0, 5000)}..."

        Criteria for Keyword:
        1. Must be a high-volume search term in Korea (Naver/YouTube).
        2. Must represent the core topic of the video accurately.
        3. Prefer short, compound nouns (e.g., "아이폰15 후기" instead of "아이폰15를 써봤는데").
        4. Strict Output: Return ONLY the keyword text. No quotes, no explanations.

        Example:
        Input Title: "How to make Kimchi Jjigae" -> Output: 김치찌개 레시피
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const keyword = response.text().trim();

        return keyword;

    } catch (error) {
        console.error("Gemini Keyword Extraction Error:", error);
        return null; // Fallback to Title heuristic
    }
}

