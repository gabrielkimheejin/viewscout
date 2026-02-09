"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LottieLoader } from "@/components/ui/lottie-loader";
import { Input } from "@/components/ui/input";
import { analyzeVideoAction } from "./actions";
import { VideoDiagnosticsResult } from "@/lib/video-diagnostics";
import { VideoDiagnosisDashboard } from "@/components/video-diagnosis-dashboard";
import { Youtube, Link as LinkIcon, Sparkles } from "lucide-react";

// Video Diagnostics Page

export default function DiagnosticsPage() {
    const [url, setUrl] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState<VideoDiagnosticsResult | null>(null);

    const handleAnalyze = async () => {
        if (!url.trim()) return;

        setIsProcessing(true);
        setResult(null); // Reset previous result

        try {
            const data = await analyzeVideoAction(url);
            setResult(data);
        } catch (e) {
            console.error(e);
            alert("분석 중 오류가 발생했습니다.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="container mx-auto max-w-5xl py-10 px-4 space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-gray-900">AI 영상 정밀 진단 (Total Care)</h1>
                <p className="text-muted-foreground">유튜브 링크만 넣으세요. &apos;시장성(Trend)&apos;과 &apos;콘텐츠 품질(Script)&apos;을 한번에 분석합니다.</p>
            </div>

            {/* Input Section */}
            <Card className="border-t-4 border-t-primary shadow-lg">
                <CardContent className="pt-8 pb-8 flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative w-full">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <LinkIcon className="h-5 w-5" />
                        </div>
                        <Input
                            className="pl-10 h-14 text-lg bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                            placeholder="분석할 유튜브 영상 링크를 붙여넣으세요 (https://youtu.be/...)"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            disabled={isProcessing}
                        />
                    </div>
                    <Button
                        className="h-14 px-8 text-lg font-bold min-w-[160px]"
                        onClick={handleAnalyze}
                        disabled={!url.trim() || isProcessing}
                    >
                        {isProcessing ? (
                            <>
                                <LottieLoader width={28} height={28} className="mr-2" />
                                분석 중...
                            </>
                        ) : (
                            <>
                                <Sparkles className="mr-2 h-5 w-5" />
                                진단 시작
                            </>
                        )}
                    </Button>
                </CardContent>
                <div className="bg-gray-50 px-8 py-3 text-xs text-gray-500 border-t flex justify-center gap-6">
                    <span className="flex items-center gap-1"><Youtube className="h-3 w-3" /> 영상 메타데이터 분석</span>
                    <span className="flex items-center gap-1">✨ STT 스크립트 추출</span>
                    <span className="flex items-center gap-1">📈 시장 트렌드 진단</span>
                </div>
            </Card>

            {/* Result Section (Dashboard) */}
            <div className="min-h-[400px]">
                {isProcessing && (
                    <div className="h-[400px] flex flex-col items-center justify-center space-y-4 animate-in fade-in">
                        <LottieLoader width={120} height={120} />
                        <p className="text-lg font-medium text-gray-600 animate-pulse">영상을 분석하고 있습니다...</p>
                        <p className="text-sm text-gray-400">대본 추출 중 • 키워드 트렌드 검색 중</p>
                    </div>
                )}

                {!isProcessing && result && (
                    <VideoDiagnosisDashboard result={result} />
                )}

                {!isProcessing && !result && (
                    <div className="h-[300px] flex flex-col items-center justify-center text-gray-300 border-2 border-dashed rounded-xl">
                        <Youtube className="h-16 w-16 mb-4 opacity-20" />
                        <p className="text-lg font-medium">분석할 영상의 URL을 입력해주세요</p>
                    </div>
                )}
            </div>
        </div>
    );
}
