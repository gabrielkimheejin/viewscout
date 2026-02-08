import { splitScript } from "./transcription";

export interface HighlightRange {
    start: number;
    end: number;
    type: "positive" | "negative" | "structure" | "hook";
    label: string;
}

export interface AnalysisResult {
    hookScore: number;
    structureScore: number;
    hookFeedback: string[];
    structureFeedback: string[];
    highlights: HighlightRange[];
}

// Keywords for Hook Analysis (Intro)
const NEGATIVE_WORDS = ["주의", "실수", "절대", "손해", "위험", "망하는", "비밀", "경고", "최악"];
const DIRECT_ADDRESS = ["당신", "여러분", "너", "구독자님", "시청자"];

// Keywords for Structure Analysis (Body)
const LOGICAL_MARKERS = ["첫째", "둘째", "셋째", "첫 번째", "두 번째", "세 번째", "우선", "결론적으로", "요약하면", "예를 들어", "하지만", "반면"];
const OPEN_LOOPS = ["잠시 후에", "영상 끝까지", "마지막에", "뒤에서", "공개합니다", "알려드릴게요"];

export function analyzeScript(fullText: string): AnalysisResult {
    const segments = splitScript(fullText);
    const { intro, body } = segments;

    const hookAnalysis = calculateHookScore(intro);
    const structureAnalysis = calculateStructureScore(fullText, body);

    return {
        hookScore: hookAnalysis.score,
        structureScore: structureAnalysis.score,
        hookFeedback: hookAnalysis.feedback,
        structureFeedback: structureAnalysis.feedback,
        highlights: [...hookAnalysis.highlights, ...structureAnalysis.highlights], // In a real app we'd map offsets correctly
    };
}

function calculateHookScore(introText: string) {
    let score = 50; // Base score
    const feedback: string[] = [];
    const highlights: HighlightRange[] = [];

    // 1. Questions (+10)
    if (introText.includes("?")) {
        score += 10;
    } else {
        feedback.push("초반 15% 내에 시청자에게 질문을 던져 참여를 유도해보세요. (?)");
    }

    // 2. Negative Words (+10)
    const foundNegatives = NEGATIVE_WORDS.filter(w => introText.includes(w));
    if (foundNegatives.length > 0) {
        score += 10;
    } else {
        feedback.push("손실 회피 본능을 자극하는 부정적 키워드('주의', '실수', '절대' 등)를 사용해보세요.");
    }

    // 3. Direct Address (+5 per instance, max 10)
    const foundDirect = DIRECT_ADDRESS.filter(w => introText.includes(w));
    if (foundDirect.length > 0) {
        score += Math.min(10, foundDirect.length * 5);
    } else {
        feedback.push("시청자를 '여러분'이나 '당신'으로 직접 지칭하여 몰입감을 높이세요.");
    }

    // 4. Pacing (Length check - Mock heuristic)
    if (introText.length >= 100) { // Assuming 100 chars is decent intro length
        score += 5;
    }

    return {
        score: Math.min(100, Math.max(0, score)),
        feedback,
        highlights
    };
}

function calculateStructureScore(fullText: string, bodyText: string) {
    let score = 40; // Base score
    const feedback: string[] = [];
    const highlights: HighlightRange[] = [];

    // 1. Logical Markers (+20 if found multiple)
    const foundMarkers = LOGICAL_MARKERS.filter(w => bodyText.includes(w));
    if (foundMarkers.length >= 2) {
        score += 20;
    } else if (foundMarkers.length === 1) {
        score += 10;
        feedback.push("논리적 연결어('첫째', '하지만' 등)를 더 사용하여 내용을 구조화하세요.");
    } else {
        feedback.push("본문에 '첫째', '둘째' 같은 순서나 대조를 나타내는 접속사가 부족합니다.");
    }

    // 2. Open Loops (+20)
    const foundLoops = OPEN_LOOPS.filter(w => bodyText.includes(w));
    if (foundLoops.length > 0) {
        score += 20;
    } else {
        feedback.push("영상의 지속 시청을 유도하는 '오픈 루프'('잠시 후에 공개됩니다' 등) 멘트를 추가해보세요.");
    }

    // 3. Length check normalization
    if (fullText.length > 500) score += 20;

    return {
        score: Math.min(100, Math.max(0, score)),
        feedback,
        highlights
    };
}
