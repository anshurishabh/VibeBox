import { NextResponse } from "next/server";
import { searchTracks } from "../../../../lib/musicSource";

export async function POST(req) {
  try {
    const { query } = await req.json();
    const tracks = await searchTracks({ query });
    return NextResponse.json({ tracks });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Search failed. Please try again in a moment." },
      { status: 500 }
    );
  }
}
