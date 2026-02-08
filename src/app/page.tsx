"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTrendingKeywords } from "@/app/actions";
import { TrendingKeyword } from "@/lib/trendData";

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [trending, setTrending] = useState<TrendingKeyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }));

    const fetchTrends = async () => {
      try {
        const result = await getTrendingKeywords();
        if (result.success) {
          setTrending(result.data.slice(0, 12)); // Show up to 12 items
        }
      } catch (error) {
        console.error("Failed to fetch trends", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrends();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/analytics/${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-white">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center pt-20 pb-12 px-4">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-10 tracking-tight text-center">
          채널 성장의 시작, <span className="text-primary">키워드 분석</span>부터!
        </h1>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative w-full max-w-3xl">
          <div className="relative flex items-center w-full h-16 rounded-full border-2 border-gray-100 shadow-sm bg-white overflow-hidden transition-shadow focus-within:shadow-md hover:border-gray-200">
            <input
              type="text"
              placeholder="분석할 주제나 키워드를 입력하세요"
              className="flex-1 h-full pl-8 pr-32 text-lg text-gray-800 placeholder:text-gray-400 focus:outline-none"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              type="submit"
              className="absolute right-2 top-2 bottom-2 bg-primary hover:bg-primary/90 text-white rounded-full px-6 flex items-center gap-2 font-semibold transition-colors"
            >
              <Search className="h-5 w-5" />
              분석
            </button>
          </div>
        </form>

        {/* Promo Banners */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl mt-16">
          <div className="h-32 bg-[#FFF8E1] rounded-2xl flex items-center justify-between px-8 cursor-pointer hover:shadow-sm transition-shadow">
            <div>
              <p className="text-sm font-medium text-yellow-700 mb-1">크리에이터를 위한 확장 프로그램</p>
              <h3 className="text-xl font-bold text-gray-800">황금 키워드를 찾는 <br /> 가장 빠른 방법</h3>
            </div>
            <div className="h-16 w-16 bg-yellow-400 rounded-full opacity-50"></div>
          </div>
          <div className="h-32 bg-[#111827] rounded-2xl flex items-center justify-between px-8 cursor-pointer hover:shadow-sm transition-shadow">
            <div className="text-white">
              <p className="text-sm font-medium text-green-400 mb-1">누적 조회수 35억 달성 노하우</p>
              <h3 className="text-xl font-bold">유튜브 알고리즘 <br /> 완벽 공략집</h3>
            </div>
            <div className="h-16 w-16 bg-gray-700 rounded-full opacity-50"></div>
          </div>
        </div>
      </section>

      {/* Trending Section */}
      <section className="w-full max-w-5xl mx-auto px-4 pb-20">
        <div className="flex items-end justify-between mb-6 border-b pb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">실시간 인기 키워드</h2>
            <p className="text-sm text-gray-500 mt-1">유튜브/구글에서 검색량이 급상승 중인 키워드입니다</p>
          </div>
          <span className="text-xs text-gray-400 mb-1">{currentTime} 기준</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 animate-pulse rounded-md" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
            {trending.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 cursor-pointer transition-colors px-2 rounded-md"
                onClick={() => router.push(`/analytics/${encodeURIComponent(item.keyword)}`)}
              >
                <div className={`flex items-center justify-center w-6 h-6 rounded-md text-xs font-bold mr-4 ${index < 3 ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  {index + 1}
                </div>
                <div className="flex-1 flex items-center gap-3">
                  <span className="font-semibold text-gray-800">{item.keyword}</span>
                  <span className="text-xs text-gray-400">{item.volume.toLocaleString()} Hits</span>
                </div>
                <div className="text-xs font-medium w-8 text-center text-gray-400 flex justify-center">
                  {/* Randomly assign direction based on ID for consistency within session, or just random for visual flair since API doesn't give direction */}
                  {index % 3 === 0 ? <span className="text-red-500">▲</span> : index % 3 === 1 ? <span className="text-blue-500">▼</span> : <span>-</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
