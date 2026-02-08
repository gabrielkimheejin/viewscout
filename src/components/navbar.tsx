"use client";

import Link from "next/link";
import { Search, Menu, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
    const [activeTab, setActiveTab] = useState<"creator" | "blogger" | "seller" | null>("creator"); // Allow null for folding

    const toggleTab = (tab: "creator" | "blogger" | "seller") => {
        setActiveTab(activeTab === tab ? null : tab);
    };

    return (
        <nav className="border-b bg-white text-foreground sticky top-0 z-50">
            {/* Upper Main Nav */}
            <div className="container mx-auto flex h-16 items-center px-4 justify-between bg-white relative z-20">
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-2 font-bold text-2xl text-primary">
                        <span>ViewScout</span>
                    </Link>

                    <div className="hidden md:flex gap-6 text-sm font-medium">
                        {/* 1. Creator */}
                        <div
                            className={`flex items-center gap-1 cursor-pointer transition-colors ${activeTab === "creator" ? "text-primary font-bold" : "text-gray-500 hover:text-primary"}`}
                            onClick={() => toggleTab("creator")}
                        >
                            크리에이터 <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${activeTab === "creator" ? "rotate-180" : ""}`} />
                        </div>

                        {/* 2. Blogger */}
                        <div
                            className={`flex items-center gap-1 cursor-pointer transition-colors ${activeTab === "blogger" ? "text-primary font-bold" : "text-gray-500 hover:text-primary"}`}
                            onClick={() => toggleTab("blogger")}
                        >
                            블로거 <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${activeTab === "blogger" ? "rotate-180" : ""}`} />
                        </div>

                        {/* 3. Seller */}
                        <div
                            className={`flex items-center gap-1 cursor-pointer transition-colors ${activeTab === "seller" ? "text-primary font-bold" : "text-gray-500 hover:text-primary"}`}
                            onClick={() => toggleTab("seller")}
                        >
                            셀러 <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${activeTab === "seller" ? "rotate-180" : ""}`} />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Button className="bg-primary hover:bg-primary/90 text-white font-bold rounded-md px-6">
                        로그인/가입
                    </Button>
                    <Search className="h-5 w-5 text-gray-500 cursor-pointer" />
                    <Menu className="h-6 w-6 text-gray-500 cursor-pointer md:hidden" />
                </div>
            </div>

            {/* Animated Sub Nav Container */}
            <AnimatePresence>
                {activeTab && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden border-t bg-white"
                    >
                        {/* Creator Sub Nav */}
                        {activeTab === "creator" && (
                            <div className="container mx-auto px-4 hidden md:flex gap-8 text-sm font-medium text-gray-500 py-3">
                                <Link href="/" className="hover:text-gray-800 cursor-pointer transition-colors">
                                    키워드 분석
                                </Link>
                                <Link href="/diagnostics" className="hover:text-gray-800 cursor-pointer transition-colors">
                                    영상 진단
                                </Link>
                                <Link href="/revenue" className="hover:text-gray-800 cursor-pointer transition-colors">
                                    영상 예상 수익
                                </Link>
                                <Link href="/trends" className="hover:text-gray-800 cursor-pointer transition-colors">
                                    실시간 트렌드
                                </Link>
                                <Link href="/formulas" className="hover:text-gray-800 cursor-pointer transition-colors text-purple-600 font-bold">
                                    계산식 (알고리즘)
                                </Link>
                            </div>
                        )}

                        {/* Blogger Sub Nav */}
                        {activeTab === "blogger" && (
                            <div className="container mx-auto px-4 hidden md:flex gap-8 text-sm font-medium text-gray-400 py-3 bg-gray-50">
                                <div>블로그 키워드 (준비중)</div>
                                <div>포스팅 진단 (준비중)</div>
                            </div>
                        )}

                        {/* Seller Sub Nav */}
                        {activeTab === "seller" && (
                            <div className="container mx-auto px-4 hidden md:flex gap-8 text-sm font-medium text-gray-400 py-3 bg-gray-50">
                                <div>아이템 발굴 (준비중)</div>
                                <div>마진 계산기 (준비중)</div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
