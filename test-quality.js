
const { GoogleGenerativeAI } = require("@google/generative-ai");
// require('dotenv').config({ path: '.env.local' });

async function testQualityAnalysis() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("No API Key found");
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: "gemini-3-flash-preview",
        generationConfig: { responseMimeType: "application/json" }
    });

    const title = "갤럭시 S24 울트라 1달 사용기! 아이폰에서 넘어갈만 한가?";
    const keyword = "갤럭시 S24 울트라";
    const transcript = "안녕하세요 여러분! 오늘은 갤럭시 S24 울트라를 1달 동안 사용해본 솔직한 후기를 들려드리려고 합니다. 결론부터 말씀드리면... 카메라가 정말 미쳤습니다. 하지만 아쉬운 점도 분명히 있었는데요. 아이폰 15 프로맥스와 비교해서 어떤 점이 좋고 나쁜지 낱낱이 파헤쳐 보겠습니다. 첫째, 디자인입니다. 티타늄 프레임이 적용되면서 무게가...";

    console.log("Testing AI Quality Analysis...");

    const prompt = `You are a strict YouTube Content Auditor. Analyze this video data against the keyword '${keyword}'.

    Data:
    - Title: "${title}"
    - Transcript (First 5k chars): "${transcript}..."
    
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
        "feedback": ["Title is good but...", "Script needs more...", "Keyword density is..."] 
    }`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().replace(/```json|```/g, '').trim();

        console.log("Raw Response:", text);
        const json = JSON.parse(text);
        console.log("Parsed JSON:", JSON.stringify(json, null, 2));
        console.log("✅ Test Passed: Valid JSON returned");
    } catch (e) {
        console.error("❌ Test Failed:", e);
    }
}

testQualityAnalysis();
