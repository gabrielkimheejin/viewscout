

import { LottieLoader } from "@/components/ui/lottie-loader";

export default function Loading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
            <LottieLoader width={150} height={150} />
            <p className="text-muted-foreground animate-pulse font-medium">데이터를 분석 중입니다...</p>
        </div>
    );
}
