
// Sample Scripts for Analysis Testing
export const MOCK_SCRIPTS = {
  good: `여러분, 유튜브 조회수가 안 나와서 고민이신가요? (질문)
오늘 영상에서는 절대 실패하지 않는 떡상 비법 3가지를 공개합니다. (부정어: 절대, 실패)
이 내용을 모르면 여러분 채널은 평생 제자리걸음일 수도 있습니다. (부정어, 2인칭)

첫째, 썸네일의 클릭률을 높여야 합니다. 
둘째, 초반 30초 내에 이탈률을 잡아야 합니다.
셋째, 마지막까지 시청하게 만드는 구조를 짜야 합니다. (논리적 마커)

잠시 후에 보여드릴 실제 예시를 보시면 깜짝 놀라실 겁니다. (오픈 루프)
끝까지 시청해주시면 구독자 1만 명 달성 시크릿 문서를 드립니다.`,

  bad: `안녕하세요. 오늘은 유튜브 잘하는 법에 대해 이야기해보겠습니다.
유튜브는 정말 어렵습니다. 저도 참 힘들었는데요.
그냥 열심히 다들 하시면 됩니다.
저도 처음에 영상 올릴 때 많이 힘들었는데 그냥 꾸준히 하니까 되더라고요.
영상 많이 올리시고 태그 잘 다세요.
화이팅입니다.`
};

export interface KeywordData {
  keyword: string;
  searchVolume: number; // Monthly search volume
  pcVolume?: number; // New: PC Volume
  mobileVolume?: number; // New: Mobile Volume
  videoCount: number; // Number of competing videos
  avgViews: number; // Average views of top videos
  trend: number[]; // 12-month search trend
  competitionIntensity: number; // Calculated later, but good to have if pre-calculated or separated
}

export interface VideoData {
  id: string; // Added id
  title: string;
  thumbnail: string; // Use a placeholder URL or colored div description
  views: number;
  publishedAt: string;
  channelName: string;
  subscriberCount: number;
}

export interface MockResponse {
  keywordData: KeywordData;
  topVideos: VideoData[];
  relatedKeywords: string[];
  script?: string; // Optional for now
}

// Deterministic random generator based on seed string
function seededRandom(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const x = Math.sin(hash) * 10000;
  return x - Math.floor(x);
}

const generateMockData = (keyword: string): MockResponse => {
  const seed = keyword.toLowerCase().trim();
  const rng = (offset: number = 0) => seededRandom(seed + offset);

  // Base metrics derived from keyword "hash" to be distinct per keyword
  const baseVolume = Math.floor(rng(1) * 500000) + 1000;

  // Simulate different market conditions
  // If keyword starts with 'a' or 'i', make it "Red Ocean" (High competition)
  // If starts with 'b' or 'n', make it "Blue Ocean" (Low competition, Good volume)
  let videoCountRatio = 0.1;
  if (['a', 'i', 's', 'r'].includes(seed[0])) {
    videoCountRatio = rng(2) * 0.8 + 0.2; // 0.2 to 1.0 ratio (Very High)
  } else {
    videoCountRatio = rng(2) * 0.05 + 0.001; // Low competition
  }

  const videoCount = Math.floor(baseVolume * videoCountRatio);
  const avgViews = Math.floor(rng(3) * 1000000) + 5000;

  // Trend: 12 months. varying seasonality
  const trend = Array.from({ length: 12 }, (_, i) => {
    return Math.floor(baseVolume * (0.8 + rng(10 + i) * 0.4));
  });

  const keywordData: KeywordData = {
    keyword,
    searchVolume: baseVolume,
    videoCount,
    avgViews,
    trend,
    competitionIntensity: 0 // Will be calculated by analytics
  };

  // Generate Top 5 Videos
  const topVideos: VideoData[] = Array.from({ length: 5 }, (_, i) => {
    const viewCount = Math.floor(avgViews * (1.5 - rng(20 + i)));
    const daysAgo = Math.floor(rng(30 + i) * 365);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);

    return {
      id: `mock-video-${i}`,
      title: `${keyword} - Ultimate Guide ${2024 + i}`,
      thumbnail: `https://placehold.co/600x400/2a2a2a/FFF?text=${encodeURIComponent(keyword)}+${i + 1}`,
      views: viewCount > 0 ? viewCount : 1000,
      publishedAt: date.toISOString().split('T')[0],
      channelName: `Channel ${String.fromCharCode(65 + i)}`,
      subscriberCount: Math.floor(rng(40 + i) * 1000000) + 1000,
    };
  });

  const relatedKeywords = [
    `${keyword} tips`,
    `${keyword} tutorial`,
    `how to ${keyword}`,
    `best ${keyword}`,
    `${keyword} review`,
    `${keyword} 2024`
  ];

  return { keywordData, topVideos, relatedKeywords };
};

export const getMockData = async (keyword: string): Promise<MockResponse> => {
  // Simulate API network delay (500ms - 1500ms)
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));

  return generateMockData(keyword);
}
