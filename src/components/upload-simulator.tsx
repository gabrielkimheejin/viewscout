"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { calculateEstimatedViews, getRandomAdvice } from "@/lib/analytics";
import { Sparkles } from "lucide-react";

export function UploadSimulator({ currentSubs, topicVolume }: { currentSubs: number, topicVolume: number }) {
    const [title, setTitle] = useState("");
    const [thumbnailText, setThumbnailText] = useState("");
    const [result, setResult] = useState<{ min: number; max: number; tip: string } | null>(null);

    const handleAnalyze = () => {
        // In a real app, we'd analyze sentiment/keywords of title.
        // Here we use the topic metrics + pure randomness/placeholders.
        const { min, max } = calculateEstimatedViews(currentSubs, topicVolume);
        const tip = getRandomAdvice();
        setResult({ min, max, tip });
    };

    return (
        <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    영상 진단 & 시뮬레이터
                </CardTitle>
                <CardDescription>
                    업로드 전 제목과 썸네일 전략을 미리 테스트해보세요.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">영상 제목</label>
                    <Input
                        placeholder="예: '아이폰 16 언박싱 - 진짜 살만한가요?'"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">썸네일 문구 / 설명</label>
                    <Input
                        placeholder="예: '충격 실화, 빨간 화살표, 큰 텍스트'"
                        value={thumbnailText}
                        onChange={(e) => setThumbnailText(e.target.value)}
                    />
                </div>

                {result && (
                    <div className="mt-4 rounded-lg bg-primary/10 p-4 animate-in fade-in slide-in-from-bottom-2 border border-primary/20">
                        <div className="mb-2">
                            <span className="text-sm text-gray-600">예상 30일 조회수:</span>
                            <div className="text-2xl font-bold text-gray-900">
                                {result.min.toLocaleString()} - {result.max.toLocaleString()}
                            </div>
                        </div>
                        <div className="border-t border-primary/20 pt-2 mt-2">
                            <span className="text-xs font-semibold text-primary uppercase tracking-wider">AI Insight</span>
                            <p className="text-sm text-gray-700 mt-1">&quot;{result.tip}&quot;</p>
                        </div>
                    </div>
                )}
            </CardContent>
            <CardFooter>
                <Button onClick={handleAnalyze} className="w-full" disabled={!title}>
                    성과 예측 실행
                </Button>
            </CardFooter>
        </Card>
    );
}
