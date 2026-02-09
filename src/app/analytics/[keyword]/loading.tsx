import { LottieLoader } from "@/components/ui/lottie-loader";

export default function Loading() {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
            <LottieLoader width={160} height={160} />
            <p className="mt-4 text-sm font-medium text-gray-500 animate-pulse">키워드 분석 중...</p>
        </div>
    );
}
