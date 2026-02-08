import { NextResponse } from 'next/server';
import { YoutubeTranscript } from 'youtube-transcript';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('videoId');

    if (!videoId) {
        return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
    }

    try {
        // Fetch transcript (Try Korean first, then default)
        // The library automatically attempts to find captions.
        const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId, {
            lang: 'ko' // Prefer Korean
        });

        if (!transcriptItems || transcriptItems.length === 0) {
            return NextResponse.json({ error: 'No transcript found' }, { status: 404 });
        }

        // Join all parts into a single text block
        const fullText = transcriptItems.map(item => item.text).join(' ');

        return NextResponse.json({
            videoId,
            transcript: fullText
        });

    } catch (error) {
        console.error('Transcript Fetch Error:', error);

        // Fallback: If Korean fails, try auto-generated or English (Library does this partly, but explicit check might helps)
        // For now, return error to client so they can fallback to "Metadata Only" analysis.
        return NextResponse.json({ error: 'Failed to fetch transcript' }, { status: 500 });
    }
}
