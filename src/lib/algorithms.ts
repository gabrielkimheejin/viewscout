/**
 * ViewScout Core Algorithms Library
 * Contains logic for Market Analysis, Video Diagnostics, and Revenue Estimation.
 */

import { AIQualityAnalysis } from "./api/gemini";

// --- Interfaces ---

export interface MarketAnalysis {
    saturationIndex: number; // C_sat
    opportunityScore: number; // O_score (0-100)
    isBlueOcean: boolean;
    compIntensity: string; // "Red", "Blue"
    nicheScore: number; // R_niche (0-100)
    monthlyVolume: number;
    marketInsight: string;
}

export interface ContentScoreDetail {
    metadata: number; // Max 20
    script: number;   // Max 20
    relevance: number; // Max 10
    feedback: string[];
    summary?: string;
}

export interface DualCoreResult {
    topicScore: number;   // Max 50
    contentScore: number; // Max 50
    totalScore: number;   // Max 100
    matrixLabel: string;  // S, A, B, C
    gradeReason: string;  // Explanation of the grade
    marketInsight: string; // New: Specific market insight
    breakdown: ContentScoreDetail;
}

export interface RevenueFactors {
    rpmUsed: string;
    lengthBoost: boolean;
    seasonScore: number;
}

export interface RevenueEstimate {
    min: number;
    max: number;
    currency: string;
    factors?: RevenueFactors;
}

// --- Constants ---

// 1. RPM Constants (KRW)
export const RPM_RANGES_KRW: Record<string, [number, number]> = {
    finance: [15000, 35000], // Updated: Max 35000
    tech: [6000, 12000],
    vlog: [1500, 4000],
    entertainment: [1500, 4000],
    news: [1000, 2500], // Added News
    shorts: [10, 30],
    default: [2000, 5000]
};

// --- Functions ---

/**
 * Helper: Calculate Viral Velocity (A_viral)
 * Aviral = Views / (Hours ^ 1.5)
 */
export function calculateViralVelocity(views: number, hoursSinceUpload: number): number {
    const hours = Math.max(1, hoursSinceUpload); // Minimum 1h
    return views / Math.pow(hours, 1.5);
}

/**
 * Module 1: Market Analysis (Updated based on Excel)
 * C_sat = New Videos / Monthly Search Volume
 * O_score = (1 - C_norm) * 0.6 + V_gap * 0.4
 * R_niche = 1 - (Big YouTuber Ratio)
 */
export function analyzeMarket(
    monthlySearchVolume: number,
    competitorVideoCount: number,
    topVideoAvgViews: number,
    bigChannelRatio: number = 0.5 // Default 50% big channels if unknown
): MarketAnalysis {
    if (monthlySearchVolume === 0) return {
        saturationIndex: 999,
        opportunityScore: 0,
        isBlueOcean: false,
        compIntensity: "Red",
        nicheScore: 0,
        monthlyVolume: 0,
        marketInsight: "데이터가 부족하여 분석할 수 없습니다."
    };

    // 1. Saturation Index (Csat)
    // Formula: Recent Videos / Search Volume
    const saturationIndex = competitorVideoCount / monthlySearchVolume;

    // Normalize Saturation (Cnorm): 0.0 ~ 1.0 (Lower is better)
    // 0.05 -> 0.0 (Best), 5.0 -> 1.0 (Worst)
    let cNorm = 0;
    if (saturationIndex <= 0.05) cNorm = 0;
    else if (saturationIndex >= 5.0) cNorm = 1;
    else cNorm = (saturationIndex - 0.05) / (5.0 - 0.05);

    // 2. View Gap Score (Vgap) - Normalized View Potential
    // 100k views -> 1.0 (Max Score)
    const vGap = Math.min(1.0, topVideoAvgViews / 100000);

    // 3. Niche Rate (Rniche)
    // 1 - Big Channel Ratio (Higher is better for newbies)
    const nicheScore = (1 - bigChannelRatio) * 100;

    // 4. Opportunity Score (Oscore)
    // Formula: (1 - Cnorm) * 60 + Vgap * 40
    const invCNorm = 1 - cNorm; // 1.0 is best (low saturation)
    const opportunityScore = (invCNorm * 60) + (vGap * 40);

    // 5. Generate Market Insight Text
    let marketInsight = "";
    if (monthlySearchVolume < 1000) {
        marketInsight = "⚠️ 사람들이 거의 찾지 않는 주제입니다. 검색량이 너무 적습니다.";
    } else if (saturationIndex > 2.0) {
        marketInsight = "⚠️ 검색량에 비해 이미 발행된 영상이 너무 많습니다. (레드오션)";
    } else if (saturationIndex > 1.0) {
        marketInsight = "⚡ 경쟁이 다소 치열합니다. 차별화된 콘텐츠가 필수입니다.";
    } else if (saturationIndex < 0.1) {
        marketInsight = "🎉 경쟁자가 거의 없는 완벽한 블루오션입니다! 지금 바로 진입하세요.";
    } else {
        marketInsight = "✅ 적절한 수준의 경쟁 강도입니다. 퀄리티로 승부할 수 있습니다.";
    }

    return {
        saturationIndex,
        opportunityScore: Math.floor(Math.max(0, opportunityScore)),
        isBlueOcean: saturationIndex < 0.5,
        compIntensity: saturationIndex < 0.5 ? "Blue" : "Red",
        nicheScore: Math.floor(nicheScore),
        monthlyVolume: monthlySearchVolume,
        marketInsight
    };
}

/**
 * Module 2: Generic Video Diagnosis (V2.0 Dual Core)
 * Topic Score (50) + Content Score (50)
 */
export function diagnoseVideo(
    transcript: string,
    title: string,
    keyword: string,
    marketStats: MarketAnalysis,
    viralVelocity: number, // Keeps signature compatible with caller, but unused in V2 logic
    aiQuality?: AIQualityAnalysis
): DualCoreResult {
    // --- A. Topic Score (Max 50) ---
    // 1. Volume Score (Max 25): Min(Vol/10000 * 25, 25)
    // 10,000 searches = 25 pts.
    const volPoints = Math.min((marketStats.monthlyVolume / 10000) * 25, 25);

    // 2. Blue Ocean Score (Max 25)
    // Saturation based. If < 0.5 (Blue Ocean) -> High Score.
    // Simple linear decay: Saturation 0.0 -> 25pts, 1.0 -> 0pts
    const sat = marketStats.saturationIndex;
    let bluePoints = 0;
    if (sat < 0.1) bluePoints = 25;
    else if (sat > 2.0) bluePoints = 0;
    else bluePoints = 25 * (1 - (sat / 2.0)); // Rough decay

    const topicScore = Math.min(50, Math.floor(volPoints + bluePoints));

    // --- B. Content Score (Max 50) ---
    let metaScore = 0;
    let scriptScore = 0;
    let relScore = 0;
    let feedback: string[] = [];
    let summary: string | undefined = undefined;

    if (aiQuality) {
        // AI Override Logic
        metaScore = Math.min(20, Math.floor(aiQuality.metadata.score * 0.2));
        scriptScore = Math.min(20, Math.floor(aiQuality.script.score * 0.2));
        relScore = Math.min(10, Math.floor(aiQuality.relevance.score * 0.1));
        feedback = aiQuality.feedback;
        summary = aiQuality.summary;
    } else {
        // Fallback Heuristic Logic
        // 1. Metadata (Max 20)
        // Title Length (15-40 chars): +5
        if (title.length >= 15 && title.length <= 40) metaScore += 5;
        else feedback.push("제목 길이가 너무 짧거나 깁니다. (15~40자 권장)");

        // Power Words (Question, Exclamation, Specific words): +5
        if (/[?!]/.test(title) || /이유|방법|충격|공개|비밀/.test(title)) metaScore += 5;
        else feedback.push("제목에 '충격, 공개, 이유' 등의 훅킹 키워드를 추가해보세요.");

        // Thumbnail (Mocked as true for now): +5
        metaScore += 5;
        // Thumb Text Ratio (Mocked as true): +5
        metaScore += 5;

        // 2. Script (Max 20)
        const first60s = transcript.slice(0, 300); // Approx 60s
        // Hooking (+10): Question, Pain, Promise
        let hookPoints = 0;
        if (/[?]/.test(first60s)) hookPoints += 3; // Question
        if (/손해|위험|조심|절대/.test(first60s)) hookPoints += 4; // Pain
        if (/공개|알려|해결|방법/.test(first60s)) hookPoints += 3; // Promise

        if (hookPoints < 5) feedback.push("초반 60초 내에 시청자의 고통(Pain)이나 이득(Benefit)을 더 강력하게 언급하세요.");
        scriptScore += Math.min(10, hookPoints);

        // Structure (+5): Logical markers
        if (/첫째|두번째|결론|요약/.test(transcript)) scriptScore += 5;
        else feedback.push("대본에 '첫째, 둘째'와 같은 논리적 구조(Numbering)를 사용하면 이탈률이 줄어듭니다.");

        // Readability (+5): Sentences < 50 chars avg (Mock check)
        scriptScore += 5;

        // 3. Relevance (Max 10)
        // Density (+5): Keyword / Total Words approx 0.5% - 2.0%
        // Mocking density check as true if keyword exists
        if (transcript.includes(keyword)) relScore += 5;
        else feedback.push(`영상 본문에 타겟 키워드 '${keyword}' 언급이 부족합니다.`);

        // Early Mention (+5): Keyword in first 30s
        if (first60s.includes(keyword)) relScore += 5;
        else feedback.push(`영상 시작 후 30초 이내에 주제어 '${keyword}'를 언급하는 것이 좋습니다.`);
    }

    const contentScore = metaScore + scriptScore + relScore;

    // --- Total & Matrix ---
    const totalScore = topicScore + contentScore; // Max 100

    // Matrix Classification (6 Levels: S, A+, A-, B+, B-, C)
    let matrixLabel = "C";
    if (totalScore >= 90) matrixLabel = "S";
    else if (totalScore >= 80) matrixLabel = "A+";
    else if (totalScore >= 70) matrixLabel = "A-";
    else if (totalScore >= 60) matrixLabel = "B+";
    else if (totalScore >= 50) matrixLabel = "B-";
    else matrixLabel = "C";

    // Generate Reason
    let gradeReason = "분석 결과가 없습니다.";
    const gap = topicScore - contentScore;

    if (totalScore >= 90) {
        gradeReason = "주제 선정과 콘텐츠 품질이 완벽한 조화를 이루고 있습니다. 떡상 가능성이 매우 높습니다!";
    } else if (totalScore >= 80) {
        gradeReason = "매우 우수한 영상입니다. 아주 작은 디테일만 보완하면 S등급 도달이 가능합니다.";
    } else if (gap >= 15) {
        gradeReason = "주제(키워드)는 훌륭하게 선정했으나, 콘텐츠의 몰입도나 구성이 아쉽습니다. 대본 품질을 높여보세요.";
    } else if (gap <= -15) {
        gradeReason = "영상 퀄리티는 매우 좋으나, 사람들이 많이 찾지 않거나 경쟁이 너무 치열한 주제입니다. 시장성을 더 고려해보세요.";
    } else if (totalScore >= 60) {
        gradeReason = "전반적으로 무난하지만, 확실한 강점이 부족합니다. 썸네일이나 초반 후킹을 더 강화해보세요.";
    } else {
        gradeReason = "주제 선정부터 콘텐츠 구성까지 전면적인 재검토가 필요합니다.";
    }

    return {
        topicScore,
        contentScore,
        totalScore,
        matrixLabel,
        gradeReason,
        marketInsight: marketStats.marketInsight, // Pass through
        breakdown: {
            metadata: metaScore,
            script: scriptScore,
            relevance: relScore,
            feedback,
            summary
        }
    };
}

/**
 * Module 3: Revenue Estimation (V2.0 KRW)
 * Logic:
 * 1. Shorts (<1min): (Views/1000) * 10~30 KRW. No multipliers.
 * 2. Regular: (Views/1000) * CategoryRPM * LengthMult * SeasonMult.
 *    - Length: >=8min (1.8x)
 *    - Season: Dec(1.3x), Jan-Feb(0.7x)
 */
export function estimateRevenue(
    predictedViews: number,
    category: string,
    durationMinutes: number,
    uploadDateStr?: string // e.g. "2024-03-15" or ISO
): RevenueEstimate {
    const isShorts = durationMinutes < 1.0;

    // 1. Select RPM Range
    let rpmMin = 0, rpmMax = 0;

    if (isShorts) {
        [rpmMin, rpmMax] = RPM_RANGES_KRW.shorts;
    } else {
        const catKey = category.toLowerCase();
        // Fallback for known keys, else default
        const range = RPM_RANGES_KRW[catKey]
            || (catKey.includes('vlog') ? RPM_RANGES_KRW.vlog : RPM_RANGES_KRW.default);
        [rpmMin, rpmMax] = range;
    }

    // 2. Multipliers (Regular only)
    let lengthMult = 1.0;
    let seasonMult = 1.0;

    if (!isShorts) {
        // Length Boost
        if (durationMinutes >= 8.0) lengthMult = 1.8;

        // Seasonality
        if (uploadDateStr) {
            const date = new Date(uploadDateStr);
            if (!isNaN(date.getTime())) {
                const month = date.getMonth() + 1; // 1-12
                if (month === 12) seasonMult = 1.3;
                else if (month >= 1 && month <= 2) seasonMult = 0.7;
            }
        }
    }

    // 3. Calculation
    // Revenue = (Views / 1000) * RPM * Multipliers
    const calc = (rpm: number) => (predictedViews / 1000) * rpm * lengthMult * seasonMult;

    return {
        min: Math.floor(calc(rpmMin)),
        max: Math.floor(calc(rpmMax)),
        currency: "KRW",
        factors: {
            rpmUsed: `${rpmMin.toLocaleString()} ~ ${rpmMax.toLocaleString()}`,
            lengthBoost: lengthMult > 1.0,
            seasonScore: seasonMult
        }
    };
}
