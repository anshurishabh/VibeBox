import { NextResponse } from "next/server";
import { getRecommendations } from "../../../../lib/musicSource";

export async function POST(req) {
  try {
    const { mood, language } = await req.json();
    const tracks = await getRecommendations({ mood, language });
    return NextResponse.json({ tracks });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Could not fetch recommendations. Please try again in a moment." },
      { status: 500 }
    );
  }
}
