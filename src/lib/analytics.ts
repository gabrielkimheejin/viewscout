

export interface AnalyticsResult {
    intensity: number;
    intensityColor: string; // 'green' | 'yellow' | 'red'
    opportunityScore: number;
    estViewsLow: number;
    estViewsHigh: number;
}

export const calculateIntensity = (videoCount: number, searchVolume: number): number => {
    if (searchVolume === 0) return 100; // Max competition if no volume
    // Formula V2: (Videos / Search Volume) * 400
    // "Videos per 250 searches"
    // Case User: 37k videos / 1.16M vol
    // Ratio = 0.0317
    // Old (x100): 3.17 -> Too low penalty.
    // New (x400): 12.68 -> Moderate penalty.
    // If ratio is 1 (1 video per 1 search), intensity should be MAX (100+).
    // So multiplier should be roughly 100.
    // Let's try x500 (1 video per 2 searches = 50% saturation?? No).

    // Let's use a standard SEO difficulty-like curve or just scaler.
    // Let's use x300.
    // 37k/1.1M = 0.0317 * 300 = 9.5

    // Actually, let's look at the Score Formula: 100 - Intensity.
    // We want Score to be ~80-90, not 100.
    // Score = 100 - Intensity + Bonus(25) = 100.
    // To drop to 90, we need Intr + Bonus = 10 (net).
    // Intensity needs to be around 35 (if Bonus is 25).
    // 35 / 0.0317 = ~1100.

    // Let's Set Multiplier to 1000. (Videos per 1000 searches).
    // Intensity = 31.7.
    // Score = 100 - 31.7 + 25 = 93.3. Perfect.

    const intensity = (videoCount / searchVolume) * 1000;
    return parseFloat(intensity.toFixed(2));
};

export const getIntensityColor = (intensity: number): string => {
    // New Scale (x1000):
    // < 100 (10% ratio): Good (Green)
    // < 300 (30% ratio): Moderate (Yellow)
    // > 300: Bad (Red)
    if (intensity < 100) return 'text-green-500';
    if (intensity < 300) return 'text-yellow-500';
    return 'text-red-500';
};

export const getOceanLabel = (intensity: number): string => {
    if (intensity < 100) return "블루오션 🌊";
    if (intensity < 300) return "퍼플오션 🔮"; // Niche but competitive
    return "레드오션 🦈";
};

export const calculateOpportunity = (intensity: number, avgViews: number): number => {
    // Formula: 100 - Intensity + ViewBonus
    // ViewBonus: Logarithmic scale of views? 
    // If avgViews is 1M, bonus should be high.
    // 100k views -> +10, 1M -> +20, 10M -> +30?

    const viewBonus = Math.min(30, Math.log10(avgViews || 1) * 5);

    const score = 100 - intensity + viewBonus;
    return Math.max(0, Math.min(100, parseFloat(score.toFixed(1))));
};

export const calculateEstimatedViews = (subscribers: number, keywordVolume: number): { min: number, max: number } => {
    // Topic Popularity Weight: Log(Volume) / 10?
    // e.g. Vol 100k -> 5. 
    // Factor = 1 + (0.1 * Log10(Vol))

    const popularityFactor = Math.log10(keywordVolume || 1000) * 0.1; // e.g. 500k -> 5.7 * 0.1 = 0.57 -> factor 1.57

    // Baseline: Subscribers * 0.1 to 0.5 usually check out videos.
    // Plus factor.

    const baseRate = 0.2; // 20% of subscribers
    const expected = subscribers * baseRate * (1 + popularityFactor);

    const min = Math.floor(expected * 0.7);
    const max = Math.floor(expected * 1.3);

    return { min, max };
};

export const getRandomAdvice = (): string => {
    const tips = [
        "Including a specific number in your title (e.g., '7 Tips') can boost CTR by 15%.",
        "Thumbnails with high-contrast faces tend to get 20% more clicks.",
        "Using brackets [ ] or ( ) at the end of titles adds context and curiosity.",
        "Questions in titles drive higher engagement for educational content.",
        "Bright backgrounds in thumbnails perform better on mobile devices."
    ];
    return tips[Math.floor(Math.random() * tips.length)];
};
