import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@/lib/auth";
import type { ExtractedBetData } from "@/lib/ocr-parser";

export const runtime = "nodejs";

const PROMPT = `You are analyzing a sports betting ticket image. Extract the following information and return ONLY valid JSON (no markdown, no backticks):

{
  "stake": <number or null>,
  "odds": <overall American odds as integer or null>,
  "payout": <potential payout number or null>,
  "sportsbook": <string or null>,
  "betType": <"straight"|"parlay"|"teaser"|"future"|"round_robin" or null>,
  "legs": [
    {
      "sport": <sport or league like "NFL", "NBA", "MLB", "NHL", "Soccer", etc. or null>,
      "eventName": <team vs team or event name or null>,
      "selection": <the pick, e.g. "Chiefs -3.5", "Over 45.5", "Lakers ML" or null>,
      "odds": <American odds for this leg as integer or null>,
      "line": <spread or total number like -3.5 or 45.5 or null>,
      "marketType": <"moneyline"|"spread"|"over_under"|"prop"|"future" or null>
    }
  ]
}

Rules:
- American odds are integers like -110, +150. They are always <= -100 or >= 100.
- stake is the wager amount, payout is the potential total return.
- If there is only one selection, betType is "straight".
- If there are multiple selections combined, betType is "parlay" (unless stated otherwise).
- Only include fields you can confidently extract. Use null for uncertain values.
- Return ONLY the JSON object, nothing else.`;

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY not configured" },
      { status: 500 }
    );
  }

  try {
    const { imageUrl } = await request.json();

    if (!imageUrl || typeof imageUrl !== "string") {
      return NextResponse.json(
        { error: "imageUrl is required" },
        { status: 400 }
      );
    }

    // Read image from public/ directory
    const imagePath = path.join(process.cwd(), "public", imageUrl);
    const imageBuffer = await readFile(imagePath);

    // Determine MIME type from extension
    const ext = path.extname(imageUrl).toLowerCase();
    const mimeMap: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".webp": "image/webp",
      ".heic": "image/heic",
    };
    const mimeType = mimeMap[ext] || "image/jpeg";

    // Call Gemini Vision
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const result = await model.generateContent([
      PROMPT,
      {
        inlineData: {
          data: imageBuffer.toString("base64"),
          mimeType,
        },
      },
    ]);

    const text = result.response.text().trim();
    const extracted: ExtractedBetData = JSON.parse(text);

    // Clean up null values
    if (extracted.legs) {
      extracted.legs = extracted.legs.filter(
        (leg) => leg.selection || leg.eventName || leg.odds
      );
    }

    return NextResponse.json({ extracted });
  } catch (error) {
    console.error("[OCR] Failed:", error);
    return NextResponse.json(
      { error: "Ticket scanning failed" },
      { status: 500 }
    );
  }
}
