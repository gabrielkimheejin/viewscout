import { VideoData } from "@/lib/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Calendar, User, PlayCircle } from "lucide-react";

export function VideoList({ videos }: { videos: VideoData[] }) {
    return (
        <Card className="col-span-1 lg:col-span-3">
            <CardHeader>
                <CardTitle>Top Performing Videos</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {videos.map((video, index) => (
                        <a
                            key={index}
                            href={`https://www.youtube.com/watch?v=${video.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row hover:bg-muted/50 transition-colors group cursor-pointer"
                        >
                            <div className="relative aspect-video w-full flex-shrink-0 overflow-hidden rounded-md sm:w-60 bg-gray-200">
                                {/* Simulated Thumbnail */}
                                <img
                                    src={video.thumbnail}
                                    alt={video.title}
                                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/50 transition-opacity">
                                    <PlayCircle className="w-10 h-10 text-white" />
                                </div>
                            </div>
                            <div className="flex flex-1 flex-col justify-between space-y-2">
                                <div>
                                    <h4 className="font-semibold line-clamp-2 text-lg text-foreground group-hover:text-primary transition-colors">{video.title}</h4>
                                    <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                                        <User className="h-4 w-4" />
                                        <span>{video.channelName}</span>
                                        <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                                            {video.subscriberCount >= 10000
                                                ? `${(video.subscriberCount / 10000).toFixed(1)}만`
                                                : `${(video.subscriberCount / 1000).toFixed(1)}천`} 구독
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <div className="flex items-center gap-1">
                                        <Eye className="h-4 w-4" />
                                        <span>{video.views.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        <span>{new Date(video.publishedAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </a>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
