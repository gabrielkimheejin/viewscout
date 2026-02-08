"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calculator, BarChart2, Video, DollarSign, TrendingUp, Cpu } from "lucide-react";

export default function FormulasPage() {
    return (
        <div className="container mx-auto py-12 px-4 max-w-4xl space-y-10">

            <div className="text-center space-y-4">
                <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200">Algorithm Docs</Badge>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                    ViewScout <span className="text-purple-600">Core Algorithms</span>
                </h1>
                <p className="text-gray-500 max-w-2xl mx-auto">
                    뷰스카우트가 데이터를 분석하고 예측하는 핵심 수식과 로직을 공개합니다.<br />
                    우리는 투명한 데이터 분석을 통해 크리에이터의 성장을 돕습니다.
                </p>
            </div>

            <Accordion type="single" collapsible className="w-full space-y-4">

                {/* 1. Market Analysis */}
                <AccordionItem value="market" className="border rounded-lg px-4 hover:bg-gray-50 transition-colors">
                    <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-3 text-left">
                            <div className="p-2 bg-blue-100 rounded text-blue-600">
                                <BarChart2 className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-800">키워드 분석 (Keyword Analysis)</h3>
                                <p className="text-xs text-gray-500 font-normal">블루오션 판별, 기회 점수, 빈집 점유율 공식</p>
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-2 text-gray-600">
                        <p>
                            <strong>1. 경쟁 강도 (Saturation, Csat):</strong> 수요 대비 공급 비율
                        </p>
                        <div className="bg-gray-100 p-3 rounded font-mono text-xs">
                            Csat = (최근 30일 내 경쟁 영상 수) / (월간 검색량 Smonthly)
                        </div>
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                            <li>0.05 미만: <strong>최상의 블루오션</strong> (공급 부족)</li>
                            <li>0.5 미만: <strong>블루오션</strong> (해볼 만한 시장)</li>
                            <li>5.0 초과: <strong>레드오션</strong> (이미 포화된 시장)</li>
                        </ul>

                        <p className="mt-4">
                            <strong>2. 기회 점수 (Opportunity, Oscore):</strong> 시장 매력도 종합 평가 (100점 만점)
                        </p>
                        <div className="bg-gray-100 p-3 rounded font-mono text-xs">
                            Oscore = (1 - Cnorm) × 60 + Vgap × 40
                        </div>
                        <p className="text-sm text-gray-500">
                            * Cnorm: 경쟁강도 정규화 점수 (0~1, 낮을수록 유리)<br />
                            * Vgap: 상위 영상 조회수 경쟁력 점수 (높을수록 유리)
                        </p>

                        <p className="mt-4">
                            <strong>3. 빈집 점유율 (Niche Rate, Rniche):</strong> 하꼬방(소형 채널)의 상위 노출 비율
                        </p>
                        <div className="bg-gray-100 p-3 rounded font-mono text-xs">
                            Rniche = 1 - (상위 10개 중 대형 유튜버 비율)
                        </div>
                        <p className="text-sm text-gray-500">
                            * 대형 유튜버(50만 구독자 이상)가 적을수록(빈집일수록) 높은 점수.
                        </p>
                    </AccordionContent>
                </AccordionItem>

                {/* 2. Video Diagnosis (Dual-Core v2.0) */}
                <AccordionItem value="diagnosis" className="border rounded-lg px-4 hover:bg-gray-50 transition-colors">
                    <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-3 text-left">
                            <div className="p-2 bg-green-100 rounded text-green-600">
                                <Video className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-800">영상 진단 (Dual-Core v2.0)</h3>
                                <p className="text-xs text-gray-500 font-normal">Topic(시장성) + Content(품질) 50:50 평가 시스템</p>
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-2 text-gray-600">
                        <p>영상 진단 v2.0은 <strong>"아무리 잘 만든 영상도 검색량이 없으면 망하고, 검색량이 많아도 영상이 지루하면 망한다"</strong>는 원칙 하에 설계되었습니다.</p>
                        <div className="bg-gray-100 p-3 rounded font-mono text-xs mb-4">
                            Total Score (100) = Topic Score (50) + Content Score (50)
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card className="shadow-none border bg-gray-50/50">
                                <CardHeader className="pb-2"><CardTitle className="text-sm">A. Topic Score (시장성, 50점)</CardTitle></CardHeader>
                                <CardContent className="text-xs space-y-2">
                                    <p className="font-bold text-gray-700">"사람들이 찾으면서도, 경쟁자가 적은가?"</p>
                                    <ul className="list-disc pl-4 text-gray-500 space-y-1">
                                        <li><strong>Volume Score (25점):</strong> 월간 검색량 기반.<br />(검색량 1만 이상 시 만점)</li>
                                        <li><strong>Blue Ocean (25점):</strong> 경쟁 강도(Saturation)가 낮을수록 고득점.</li>
                                    </ul>
                                </CardContent>
                            </Card>
                            <Card className="shadow-none border bg-gray-50/50">
                                <CardHeader className="pb-2"><CardTitle className="text-sm">B. Content Score (완성도, 50점)</CardTitle></CardHeader>
                                <CardContent className="text-xs space-y-2">
                                    <p className="font-bold text-gray-700">"클릭하고 싶고, 끝까지 볼 만한가?"</p>
                                    <ul className="list-disc pl-4 text-gray-500 space-y-1">
                                        <li><strong>메타데이터 (20점):</strong> 제목 길이, 파워 키워드(?, !, 충격 등), 썸네일 요소</li>
                                        <li><strong>스크립트 (20점):</strong> 초반 60초 훅(질문/위기/약속), 논리 구조, 가독성</li>
                                        <li><strong>연관성 (10점):</strong> 키워드 밀도, 초반 언급 여부</li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="mt-4 pt-4 border-t">
                            <h4 className="font-bold text-sm mb-2">💎 매트릭스 등급 (Matrix Classification)</h4>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                <li className="bg-green-50 p-2 rounded border border-green-100 text-green-800 font-bold">
                                    S (떡상 확정): Topic High / Content High
                                </li>
                                <li className="bg-blue-50 p-2 rounded border border-blue-100 text-blue-800 font-bold">
                                    A (원석 발굴): Topic High / Content Low
                                </li>
                                <li className="bg-yellow-50 p-2 rounded border border-yellow-100 text-yellow-800 font-bold">
                                    B (장인 정신): Topic Low / Content High
                                </li>
                                <li className="bg-red-50 p-2 rounded border border-red-100 text-red-800 font-bold">
                                    C (재기획 요망): Topic Low / Content Low
                                </li>
                            </ul>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* 3. Revenue Estimation */}
                <AccordionItem value="revenue" className="border rounded-lg px-4 hover:bg-gray-50 transition-colors">
                    <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-3 text-left">
                            <div className="p-2 bg-yellow-100 rounded text-yellow-600">
                                <DollarSign className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-800">수익 예측 (Revenue Logic)</h3>
                                <p className="text-xs text-gray-500 font-normal">조회수, 카테고리, 길이, 계절성을 복합 계산</p>
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-2 text-gray-600">
                        <div className="bg-gray-100 p-3 rounded font-mono text-xs">
                            Revenue = (Views / 1000) * RPM * LengthMult * SeasonMult
                        </div>

                        <div className="space-y-2 text-sm">
                            <p><strong>1. Category RPM (1,000회당 단가):</strong></p>
                            <ul className="list-disc pl-5 text-gray-500">
                                <li>금융/재테크: 15,000 ~ 35,000원 (최고)</li>
                                <li>IT/테크: 6,000 ~ 12,000원</li>
                                <li>일상/Vlog/엔터: 1,500 ~ 4,000원</li>
                                <li>뉴스/정치/이슈: 1,000 ~ 2,500원 (신규)</li>
                                <li>Shorts(쇼츠): 10 ~ 30원</li>
                            </ul>

                            <p className="mt-2"><strong>2. Length Multiplier (길이 가중치):</strong></p>
                            <ul className="list-disc pl-5 text-gray-500">
                                <li>쇼츠 (1분 미만): 가중치 없음 (Shorts RPM 적용)</li>
                                <li>일반 (8분 미만): 1.0 (기본)</li>
                                <li>일반 (8분 이상): <strong>1.8배</strong> (미드롤 광고 가능)</li>
                            </ul>

                            <p className="mt-2"><strong>3. Seasonality (계절성):</strong></p>
                            <ul className="list-disc pl-5 text-gray-500">
                                <li>12월 (성수기): <strong>1.3배</strong> (광고 예산 소진 시즌)</li>
                                <li>1~2월 (비수기): <strong>0.7배</strong> (광고 단가 하락)</li>
                            </ul>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* 4. Trends */}
                <AccordionItem value="trends" className="border rounded-lg px-4 hover:bg-gray-50 transition-colors">
                    <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-3 text-left">
                            <div className="p-2 bg-red-100 rounded text-red-600">
                                <TrendingUp className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-800">화제성 가속도 & 다크호스 (Trending)</h3>
                                <p className="text-xs text-gray-500 font-normal">Aviral 공식 및 이상징후(Anomaly) 포착</p>
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-2 text-gray-600">
                        <p>
                            <strong>1. 화제성 가속도 (Viral Velocity, Aviral):</strong>
                        </p>
                        <div className="bg-gray-100 p-3 rounded font-mono text-xs">
                            Aviral = d/dt(Views) × (1 / Age_video)
                        </div>
                        <p className="text-sm text-gray-500">
                            * 영상 게시 경과 시간(Age)이 짧을수록, 조회수 증가폭(Differential)이 클수록 가중치를 부여합니다.
                            * 어제 올렸는데 오늘 조회수가 급등하면 높은 가점을 받습니다.
                        </p>

                        <p className="mt-4">
                            <strong>2. 다크호스 발굴 (Dark Horse Detection):</strong> 작은 채널에서 이례적으로 높은 조회수가 터진 영상을 찾습니다.
                        </p>
                        <div className="bg-gray-100 p-3 rounded font-mono text-xs">
                            Performance Ratio = View Count / Subscriber Count
                        </div>
                        <p className="text-sm text-gray-500">
                            * 비율이 <strong>5.0 (500%)</strong> 이상인 영상을 'Dark Horse'로 분류하여 추천합니다. 이는 알고리즘의 선택을 받은 영상일 확률이 매우 높습니다.
                        </p>
                    </AccordionContent>
                </AccordionItem>

            </Accordion>

            <div className="bg-purple-50 p-6 rounded-xl border border-purple-100 text-center">
                <Cpu className="h-10 w-10 text-purple-600 mx-auto mb-2" />
                <h4 className="font-bold text-lg text-purple-900">ViewScout Engine v2.0</h4>
                <p className="text-sm text-purple-700 mt-1">
                    본 알고리즘은 유튜브 본질에 입각한 듀얼 코어(Topic/Content) 진단 시스템으로 업데이트되었습니다.
                </p>
            </div>

        </div>
    );
}
