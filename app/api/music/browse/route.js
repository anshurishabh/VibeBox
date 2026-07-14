import { NextResponse } from "next/server";
import { browseTracks } from "../../../../lib/musicSource";

export async function POST(req) {
  try {
    const { term, country, limit } = await req.json();
    const tracks = await browseTracks({ term, country, limit });
    return NextResponse.json({ tracks });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not load this section." }, { status: 500 });
  }
}