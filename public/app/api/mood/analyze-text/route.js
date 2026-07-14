import { NextResponse } from "next/server";
import { classifyText } from "../../../../lib/textSentiment";

export async function POST(req) {
  const { text } = await req.json();
  const result = classifyText(text);
  return NextResponse.json(result);
}
