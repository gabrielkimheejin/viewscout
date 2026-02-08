"use client";

import { useState } from "react";
import { TrendingKeyword } from "@/lib/trendData";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Search, PlayCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

interface KeywordRankTableProps {
    keywords: TrendingKeyword[];
    onKeywordSelect?: (keyword: TrendingKeyword) => void;
    selectedKeywordId?: string | null;
}

export function KeywordRankTable({ keywords, onKeywordSelect, selectedKeywordId }: KeywordRankTableProps) {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const handleRowClick = (item: TrendingKeyword) => {
        setExpandedId(expandedId === item.id ? null : item.id);
        if (onKeywordSelect) {
            onKeywordSelect(item);
        }
    };

    return (
        <div className="space-y-2">
            {/* Header */}
            <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <div className="col-span-1 text-center">Rank</div>
                <div className="col-span-5 md:col-span-4">Keyword</div>
                <div className="col-span-3 md:col-span-3 text-right">Volume</div>
                <div className="col-span-3 md:col-span-2 text-right">Growth</div>
                <div className="hidden md:block col-span-2 text-center">Comp</div>
            </div>

            <div className="space-y-2">
                {keywords.map((item, index) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <Card
                            className={`border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden ${expandedId === item.id ? "ring-2 ring-primary/20" : ""} ${selectedKeywordId === item.id ? "ring-2 ring-blue-500 bg-blue-50" : ""}`}
                            onClick={() => handleRowClick(item)}
                        >
                            <div className="grid grid-cols-12 gap-4 items-center p-4">
                                {/* Rank */}
                                <div className="col-span-1 flex justify-center">
                                    {item.rank === 1 && <span className="text-xl">🥇</span>}
                                    {item.rank === 2 && <span className="text-xl">🥈</span>}
                                    {item.rank === 3 && <span className="text-xl">🥉</span>}
                                    {item.rank > 3 && <span className="font-bold text-gray-400">{item.rank}</span>}
                                </div>

                                {/* Keyword */}
                                <div className="col-span-5 md:col-span-4 font-bold text-gray-800 truncate">
                                    {item.keyword}
                                </div>

                                {/* Volume (Mini Bar) */}
                                <div className="col-span-3 md:col-span-3 flex flex-col items-end gap-1">
                                    <span className="text-sm font-medium">{item.volume.toLocaleString()}</span>
                                    <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-300 rounded-full"
                                            style={{ width: `${Math.min(100, (item.volume / 500000) * 100)}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Velocity */}
                                <div className="col-span-3 md:col-span-2 text-right font-bold text-red-500 text-sm">
                                    +{item.velocity}%
                                </div>

                                {/* Competition Badge (Desktop) */}
                                <div className="hidden md:flex col-span-2 justify-center">
                                    <Badge variant={item.competition === "Blue" ? "default" : "secondary"} className={item.competition === "Blue" ? "bg-blue-100 text-blue-700 hover:bg-blue-200" : "bg-red-100 text-red-700 hover:bg-red-200"}>
                                        {item.competition === "Blue" ? "Blue Ocean" : "Red Ocean"}
                                    </Badge>
                                </div>
                            </div>

                            {/* Expanded Content */}
                            <AnimatePresence>
                                {expandedId === item.id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="bg-gray-50 border-t px-4 pb-4"
                                    >
                                        <div className="pt-3">
                                            <p className="text-xs font-bold text-gray-500 mb-2 flex items-center gap-1">
                                                <PlayCircle className="h-3 w-3" />
                                                TREND DRIVERS (Top 3 Videos)
                                            </p>
                                            <div className="space-y-2">
                                                {item.topVideos.map((video, idx) => (
                                                    <div key={idx} className="flex justify-between items-center text-sm bg-white p-2 rounded border border-gray-100">
                                                        <span className="truncate flex-1 text-gray-700">{video.title}</span>
                                                        <span className="text-xs text-gray-400 ml-2">{video.views} View</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mt-3 flex justify-end">
                                                <p className="text-xs text-primary cursor-pointer hover:underline flex items-center gap-1">
                                                    <Search className="h-3 w-3" />
                                                    ViewScout로 키워드 심층 분석하기 →
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
