import { Card, CardContent, CardHeader } from "@/components/ui/card";

function Skeleton({ className }: { className?: string }) {
    return (
        <div className={`animate-pulse rounded-md bg-muted ${className}`} />
    );
}

export default function Loading() {
    return (
        <div className="container mx-auto max-w-7xl p-6 space-y-8">
            <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-48" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i}>
                        <CardHeader className="pb-2">
                            <Skeleton className="h-4 w-24" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-16 mb-2" />
                            <Skeleton className="h-3 w-32" />
                            <Skeleton className="h-2 w-full mt-4" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <Card className="h-[350px]">
                        <CardHeader>
                            <Skeleton className="h-6 w-48" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-full w-full rounded-none" />
                        </CardContent>
                    </Card>
                    <Card className="h-[400px]">
                        <CardHeader>
                            <Skeleton className="h-6 w-32" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[1, 2, 3].map(j => (
                                <div key={j} className="flex gap-4">
                                    <Skeleton className="h-24 w-40" />
                                    <div className="space-y-2 flex-1 pt-2">
                                        <Skeleton className="h-4 w-3/4" />
                                        <Skeleton className="h-3 w-1/4" />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-8">
                    <Card className="h-[300px]" />
                    <Card className="h-[200px]" />
                </div>
            </div>
        </div>
    );
}
