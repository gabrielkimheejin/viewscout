"use client";

import { AnalysisResult } from "@/lib/scriptAnalysis";
import { Card, CardContent, CardTitle, CardHeader } from "@/components/ui/card";
import { AlertCircle, CheckCircle } from "lucide-react";

export function ScriptAnalysisViewer({ result }: { result: AnalysisResult | null }) {
    if (!result) return null;

    const getColor = (score: number) => {
        if (score >= 80) return "text-green-500";
        if (score >= 50) return "text-yellow-500";
        return "text-red-500";
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            {/* Score Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-t-4 border-t-blue-500 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">후킹력 (Intro)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div className={`text-4xl font-extrabold ${getColor(result.hookScore)}`}>
                                {result.hookScore}점
                            </div>
                            <div className="text-sm text-gray-500 text-right">
                                초반 15% 분석 <br /> 시청자 이탈 방지력
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-t-4 border-t-purple-500 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">논리적 구조 (Body)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div className={`text-4xl font-extrabold ${getColor(result.structureScore)}`}>
                                {result.structureScore}점
                            </div>
                            <div className="text-sm text-gray-500 text-right">
                                본론 75% 분석 <br /> 시청 지속 유도력
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Feedback Section */}
            <div className="grid grid-cols-1 gap-4">
                <Card className="bg-gray-50 border-none">
                    <CardContent className="pt-6 space-y-4">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-primary" />
                            AI 분석 리포트 & 개선 가이드
                        </h3>

                        <div className="space-y-3">
                            {result.hookFeedback.length === 0 && result.structureFeedback.length === 0 && (
                                <div className="p-3 bg-green-100 text-green-700 rounded-md flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4" />
                                    완벽합니다! 대본에서 특별한 문제점이 발견되지 않았습니다.
                                </div>
                            )}

                            {result.hookFeedback.map((fb, i) => (
                                <div key={`h-${i}`} className="p-3 bg-white border border-blue-100 rounded-md shadow-sm text-sm text-gray-700">
                                    <span className="font-bold text-blue-600 mr-2">[후킹]</span>
                                    {fb}
                                </div>
                            ))}
                            {result.structureFeedback.map((fb, i) => (
                                <div key={`s-${i}`} className="p-3 bg-white border border-purple-100 rounded-md shadow-sm text-sm text-gray-700">
                                    <span className="font-bold text-purple-600 mr-2">[구조]</span>
                                    {fb}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
