import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { query } = await req.json();
    if (!query?.trim()) {
      return NextResponse.json({ error: "No query provided" }, { status: 400 });
    }

    const params = new URLSearchParams({
      part: "snippet",
      type: "video",
      maxResults: "1",
      q: query,
      key: process.env.YOUTUBE_API_KEY,
    });

    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${params.toString()}`);
    const data = await res.json();

    if (!res.ok) {
      console.error(data);
      return NextResponse.json(
        { error: data.error?.message || "YouTube search failed" },
        { status: res.status }
      );
    }

    const videoId = data.items?.[0]?.id?.videoId;
    if (!videoId) {
      return NextResponse.json({ error: "No video found" }, { status: 404 });
    }

    return NextResponse.json({ videoId });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}