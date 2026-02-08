"use client";

import React from "react";
import Lottie from "lottie-react";
import animationData from "../../../public/lottie/bouncing-loader.json";

interface LottieLoaderProps {
    width?: number;
    height?: number;
    className?: string;
}

export function LottieLoader({ width = 100, height = 100, className }: LottieLoaderProps) {
    return (
        <div className={className} style={{ width, height }}>
            <Lottie animationData={animationData} loop={true} />
        </div>
    );
}
