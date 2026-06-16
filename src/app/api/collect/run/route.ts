import { NextRequest, NextResponse } from "next/server";

const CHANNEL_ID = "UCsJ6RuBivcBnKiABDQFxpkA"; // syukaworld channel ID

export async function POST(req: NextRequest) {
  if (!process.env.YOUTUBE_API_KEY || !process.env.DATABASE_URL) {
    return NextResponse.json({ error: "YouTube API 키 또는 DB가 설정되지 않았습니다." }, { status: 503 });
  }

  const { prisma } = await import("@/lib/prisma");

  const job = await prisma.collectionJob.create({
    data: { status: "running", startedAt: new Date() },
  });

  // Run async without blocking response
  runCollection(job.id).catch(console.error);

  return NextResponse.json({ jobId: job.id, status: "running" });
}

async function runCollection(jobId: string) {
  const { prisma } = await import("@/lib/prisma");

  try {
    const ytKey = process.env.YOUTUBE_API_KEY!;

    // Fetch latest videos from channel
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&maxResults=10&order=date&type=video&key=${ytKey}`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    if (!searchData.items) throw new Error("YouTube API 응답 오류");

    let videosChecked = 0;
    let videosAdded = 0;
    let chunksCreated = 0;

    for (const item of searchData.items) {
      videosChecked++;
      const videoId = item.id.videoId;
      const snippet = item.snippet;

      // Skip if already exists
      const existing = await prisma.video.findUnique({ where: { youtubeVideoId: videoId } });
      if (existing) continue;

      // Save video
      const video = await prisma.video.create({
        data: {
          youtubeVideoId: videoId,
          title: snippet.title,
          url: `https://www.youtube.com/watch?v=${videoId}`,
          description: snippet.description,
          publishedAt: new Date(snippet.publishedAt),
          transcriptStatus: "pending",
        },
      });

      // Try to fetch captions
      try {
        const captionUrl = `https://www.googleapis.com/youtube/v3/captions?part=snippet&videoId=${videoId}&key=${ytKey}`;
        const capRes = await fetch(captionUrl);
        const capData = await capRes.json();

        const hasKo = capData.items?.some((c: { snippet: { language: string } }) => c.snippet.language === "ko");

        if (hasKo) {
          await prisma.video.update({
            where: { id: video.id },
            data: { transcriptStatus: "caption_available" },
          });
        } else {
          await prisma.video.update({
            where: { id: video.id },
            data: { transcriptStatus: "no_caption" },
          });
        }
      } catch {
        // Caption fetch failed, mark for manual transcription
        await prisma.video.update({ where: { id: video.id }, data: { transcriptStatus: "failed" } });
      }

      videosAdded++;
    }

    await prisma.collectionJob.update({
      where: { id: jobId },
      data: { status: "success", finishedAt: new Date(), videosChecked, videosAdded, chunksCreated },
    });
  } catch (err) {
    await prisma.collectionJob.update({
      where: { id: jobId },
      data: { status: "failed", finishedAt: new Date(), errorMessage: String(err) },
    });
  }
}
